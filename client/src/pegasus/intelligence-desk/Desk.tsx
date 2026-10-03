import React from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { Save, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { STRATEGY_LANES, type StrategyLane } from '@shared/strategy-lab';
import type { CalcTabKey } from '@/components/strategy-lab/calculator-tools-panel';
import { normalizeOwnerSituation, ownerLabSituation } from '../owner-context';
import { clearStrategyLabHandoff, writeStrategyLabHandoff } from '../strategy-lab-handoff';
import { analyzeDraft, laneName, safeMetric } from './model';
import { emptyWorkspace, illustrativeDraft, restoreDraft, serializeDraft, VIEWS, STORAGE_KEY, NUMERIC_FIELDS, SCENARIO_NAMES, type Workspace, type DeskView, type DraftField, type NumericField, type ScenarioPatch } from './state';
import { applyPreset, scenarioDraft } from './scenario-model';
import { KeyEconomics, Overview } from './Overview';
import { Assumptions } from './Assumptions';
import { Scenarios } from './Scenarios';
import { Risk } from './Risk';
import { Memo, peggyBrief } from './Memo';
import { nextReadText, type ReadAction } from './read-guidance';

const CalculatorToolsPanel = React.lazy(() => import('@/components/strategy-lab/calculator-tools-panel').then(module => ({ default: module.CalculatorToolsPanel })));
const CALCULATORS: CalcTabKey[] = ['arv', 'roi', 'brrrr', 'cashflow', 'wholesale', 'piti', 'ownvsrent', 'hardmoney'];
const SESSION_KEY = 'pegasus.strategy-lab.working.v4';
const VIEW_NAMES = { overview: 'Overview', assumptions: 'Assumptions', scenarios: 'Scenarios', risk: 'Risk', memo: 'Memo' };
const VIEW_HEADINGS = { overview: 'Property overview', assumptions: 'Model assumptions', scenarios: 'Compare the possibilities.', risk: 'Risk and diligence.', memo: 'The decision brief.' };
// Authored orientation stays public; workspace records and derived output do not.
const VIEW_GUIDES: Record<DeskView, string> = {
  overview: 'Start with the property facts you know. Compare assumptions, explore scenarios and review the decision brief before choosing what to share.',
  assumptions: 'Review the inputs behind the model. Leave unknown facts blank and distinguish your estimates from evidence before comparing outcomes.',
  scenarios: 'Compare Base with an alternative to understand which assumptions change the outcome. Apply a scenario only when you want it used by the brief.',
  risk: 'Use the risk and diligence view to identify what still needs checking. A flag or a completed checklist is not independent verification.',
  memo: 'Review the decision brief and its assumptions. To discuss your scenario with Peggy, choose Discuss with Peggy, then review and edit the prepared message before sending.',
};
function queryState(search: string) {
  const params = new URLSearchParams(search);
  const view = params.get('view') as DeskView;
  const lane = params.get('lane') as StrategyLane;
  const tab = params.get('tab') as CalcTabKey;
  const calculators = params.get('tool') === 'calculators';
  return { resumeSaved: params.getAll('resume').length === 1 && params.get('resume') === 'saved', view: VIEWS.includes(view) ? view : calculators ? 'assumptions' as const : 'overview' as const, lane: STRATEGY_LANES.includes(lane) ? lane : null, calculators, tab: CALCULATORS.includes(tab) ? tab : 'arv' as const };
}

export function IntelligenceDesk({ openPeggy }: { openPeggy: (role?: string, prompt?: string) => void }) {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const initial = queryState(search);
  const [incomingOwner, setIncomingOwner] = React.useState(() => normalizeOwnerSituation(new URLSearchParams(search).get('owner_situation')).sourceLabel);
  const [workspace, setWorkspace] = React.useState<Workspace>(emptyWorkspace);
  const [view, setView] = React.useState<DeskView>(initial.view);
  const [selectedLane, setSelectedLane] = React.useState<StrategyLane | null>(initial.lane);
  const [calculators, setCalculators] = React.useState(initial.calculators);
  const [instrument, setInstrument] = React.useState<CalcTabKey>(initial.tab);
  const [notice, setNotice] = React.useState('Your working draft is private to this browser.');
  const [savedState, setSavedState] = React.useState(JSON.stringify(emptyWorkspace()));
  const [confirmation, setConfirmation] = React.useState<'clear' | 'example' | null>(null);
  const [undo, setUndo] = React.useState<Workspace | null>(null);
  const [resumeDraft, setResumeDraft] = React.useState<Workspace | null>(null);
  const resumeCancel = React.useRef<HTMLButtonElement>(null);
  const [hydrated, setHydrated] = React.useState(false);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const workspaceElement = React.useRef<HTMLElement>(null);
  const calculatorPanel = React.useRef<HTMLElement>(null);
  const calculatorOpener = React.useRef<HTMLButtonElement>(null);
  const focusView = React.useRef(false);
  const focusTarget = React.useRef<ReadAction | null>(null);
  const calculatorSource = React.useRef<'deeplink' | 'user'>(initial.calculators ? 'deeplink' : 'user');
  React.useEffect(() => {
    let saved: Workspace | null = null;
    let working: Workspace | null = null;
    let savedStorageBlocked = false;
    try {
      for (const key of [STORAGE_KEY, 'pegasus.strategy-lab.v3', 'pegasus.strategy-lab.v2']) {
        const stored = window.localStorage.getItem(key);
        const restored = stored ? restoreDraft(stored) : null;
        if (restored) { saved = restored; setSavedState(JSON.stringify(restored)); break; }
      }
    } catch { savedStorageBlocked = true; setNotice('Local storage is unavailable. You can still work in this session.'); }
    try { const raw = window.sessionStorage.getItem(SESSION_KEY); working = raw ? restoreDraft(raw) : null; } catch { /* Saved draft recovery still works if session storage is blocked. */ }
    if (working || saved) { setWorkspace((working || saved)!); setNotice(working ? 'Your current-visit workspace was restored. Save locally to keep it after this browser session.' : 'Your private browser draft was restored.'); }
    if (initial.resumeSaved) {
      // The URL carries only an intent. Both records must pass restoreDraft before use.
      // Keep current-visit recovery intact until the visitor confirms a replacement.
      updateQuery({ resume: null });
      if (!saved) {
        setNotice(savedStorageBlocked
          ? 'Saved draft could not be opened because this browser blocked local storage. Your current workspace is unchanged.'
          : 'No readable saved draft was found. Your current workspace is unchanged.');
      } else if (working && JSON.stringify(working) !== JSON.stringify(saved)) {
        setResumeDraft(saved);
        setNotice('Your current workspace is still open. Review the saved draft before replacing it.');
      } else {
        setNotice('Your saved browser draft was restored.');
      }
    }
    setHydrated(true);
  }, []);
  React.useEffect(() => {
    if (!resumeDraft) return;
    const frame = window.requestAnimationFrame(() => resumeCancel.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [resumeDraft]);
  React.useEffect(() => {
    if (!hydrated) return;
    try { window.sessionStorage.setItem(SESSION_KEY, serializeDraft(workspace)); }
    catch { setNotice('This browser blocked current-visit recovery. Save locally or copy the brief before leaving the page.'); }
  }, [workspace, hydrated]);
  React.useEffect(() => {
    const sync = () => { const next = queryState(window.location.search); setView(next.view); setSelectedLane(next.lane); setCalculators(next.calculators); setInstrument(next.tab); };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  React.useEffect(() => {
    if (!focusView.current) return;
    focusView.current = false;
    const target = focusTarget.current;
    focusTarget.current = null;
    const frame = window.requestAnimationFrame(() => {
      const control = target ? workspaceElement.current?.querySelector<HTMLElement>(target.evidence ? '[data-desk-evidence]' : `[data-desk-field="${target.field}"]`) : null;
      if (control) {
        const disclosure = control.closest('details');
        if (disclosure) disclosure.open = true;
        control.scrollIntoView?.({ block: 'center', behavior: 'auto' });
        control.focus({ preventScroll: true });
      } else {
        workspaceElement.current?.scrollIntoView?.({ block: 'start', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        heading.current?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [view]);
  React.useEffect(() => {
    if (!calculators) return;
    const frame = window.requestAnimationFrame(() => {
      calculatorPanel.current?.scrollIntoView?.({ block: 'start', behavior: calculatorSource.current === 'deeplink' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      calculatorPanel.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [calculators]);
  const updateQuery = (values: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(values)) value === null ? url.searchParams.delete(key) : url.searchParams.set(key, value);
    window.history.replaceState(window.history.state, '', url.toString());
  };
  const move = (next: DeskView) => { if (view !== next) focusView.current = true; setView(next); setConfirmation(null); updateQuery({ view: next === 'overview' ? null : next }); };
  const inspect = (lane: StrategyLane) => { setSelectedLane(lane); updateQuery({ lane }); };
  const draft = React.useMemo(() => scenarioDraft(workspace, workspace.activeScenario), [workspace]);
  const analysis = React.useMemo(() => analyzeDraft(draft), [draft]);
  const changed = JSON.stringify(workspace) !== savedState;
  const change = (key: DraftField, value: string) => {
    setConfirmation(null);
    clearStrategyLabHandoff();
    setWorkspace(current => current.activeScenario !== 'base' && NUMERIC_FIELDS.includes(key as NumericField)
      ? { ...current, variants: { ...current.variants, [current.activeScenario]: { ...current.variants[current.activeScenario], [key]: value } } }
      : { ...current, base: { ...current.base, [key]: value, ...(key === 'situation' ? { ownerSituation: '' } : {}), entered: [...new Set([...current.base.entered, key])] } });
  };
  const replace = (next: Workspace, message: string) => { clearStrategyLabHandoff(); setUndo(workspace); setWorkspace(next); setNotice(message); setConfirmation(null); setResumeDraft(null); };
  const cancelResume = () => {
    setResumeDraft(null);
    setNotice('Your current workspace was kept. Your saved browser draft is unchanged.');
    heading.current?.focus({ preventScroll: true });
  };
  const resumeSaved = () => {
    if (!resumeDraft) return;
    replace(resumeDraft, 'Saved browser draft restored. Undo brings back the previous working state.');
    heading.current?.focus({ preventScroll: true });
  };
  const save = () => {
    try { window.localStorage.setItem(STORAGE_KEY, serializeDraft(workspace)); setSavedState(JSON.stringify(workspace)); setNotice('Decision brief saved in this browser.'); }
    catch { setNotice('This browser blocked local saving. Your current desk remains open.'); }
  };
  const example = () => {
    if (confirmation !== 'example' && (draft.address.trim() || draft.acquisition.trim() || draft.arv.trim() || draft.marketRent.trim())) { setConfirmation('example'); return; }
    setIncomingOwner(''); setSelectedLane(null); updateQuery({ owner_situation: null, lane: null });
    replace({ ...emptyWorkspace(), base: illustrativeDraft() }, 'Synthetic example loaded. Your saved draft changes only when you save.');
  };
  const clear = () => {
    setIncomingOwner(''); setSelectedLane(null); updateQuery({ owner_situation: null, lane: null });
    replace(emptyWorkspace(), 'Desk cleared. Undo restores the previous working state.');
    try { for (const key of [STORAGE_KEY, 'pegasus.strategy-lab.v3', 'pegasus.strategy-lab.v2']) window.localStorage.removeItem(key); setSavedState(JSON.stringify(emptyWorkspace())); }
    catch { setNotice('Working desk cleared, but this browser blocked removal of the saved draft.'); }
    move('overview');
  };
  const apply = (patch: ScenarioPatch) => {
    const id = workspace.activeScenario;
    replace(id === 'base' ? { ...workspace, base: { ...workspace.base, ...patch, entered: [...new Set([...workspace.base.entered, ...Object.keys(patch)])] } } : { ...workspace, variants: { ...workspace.variants, [id]: { ...workspace.variants[id], ...patch } } }, `Selected sensitivity inputs applied to ${SCENARIO_NAMES[id]}. The full model has rerun.`);
  };
  const applyOwner = () => {
    const next = emptyWorkspace();
    next.base = { ...next.base, ownerSituation: incomingOwner, situation: ownerLabSituation(incomingOwner), submitterRole: 'Property owner', entered: ['ownerSituation', 'situation', 'submitterRole'] };
    replace(next, 'Your selected situation is ready. Add the property facts you know. Undo restores the previous workspace.');
    setIncomingOwner(''); setSelectedLane(null);
    updateQuery({ owner_situation: null, lane: null });
    move('assumptions');
  };
  const carry = () => {
    if (analysis.status !== 'ready') { move('assumptions'); return; }
    const { property, presentation: snapshot } = analysis;
    const top = snapshot.lanes[0];
    const saved = writeStrategyLabHandoff({ address: property.address, city: property.city, ownerSituation: draft.ownerSituation, planningObjective: draft.entered.includes('objective') ? draft.objective : undefined, propertyType: draft.propertyType, occupancy: draft.occupancy, condition: draft.condition, situation: draft.situation, askingPrice: property.purchasePrice, rehabBudget: property.rehabBudget, arvEstimate: property.arvEstimate, marketRent: property.marketRent, topLaneLabel: laneName(top), topLaneVerdict: top.verdictLabel, primaryMetric: `${top.economics.primaryMetric}: ${safeMetric(top.economics.primaryValue)}`, memoNextStep: `${SCENARIO_NAMES[workspace.activeScenario]} scenario. ${nextReadText(draft, analysis)}`, engineVersion: snapshot.engineVersion, generatedAt: snapshot.generatedAt, scenario: workspace.activeScenario, illustrative: draft.illustrative, scopeReported: property.rehabBudget !== undefined, modelAssumptions: `${analysis.options.loanLtvPct}% acquisition LTV; ${analysis.options.loanRatePct}% interest; ${analysis.options.loanTermYears} years; ${analysis.options.closingReservePct}% closing reserve` });
    if (!saved) { setNotice('This browser blocked the intake handoff. Copy the summary from Memo to keep it.'); return; }
    setLocation('/bring-an-opportunity?intent=property&ref=strategy-lab');
  };
  const discuss = (intent: 'explain' | 'missing' | 'inquiry' = 'explain') => {
    if (analysis.status !== 'ready') { move('assumptions'); return; }
    openPeggy(undefined, peggyBrief(draft, analysis, workspace.activeScenario, intent));
  };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setNotice('The current scenario summary was copied.'); }
    catch { setNotice('Clipboard access is unavailable. Select and copy the visible brief, or use Print.'); }
  };
  const isStarting = view === 'overview' && analysis.status === 'missing' && !draft.acquisition.trim() && !draft.arv.trim() && !draft.marketRent.trim();
  const calculatorAction = <button type="button" className="id-text-button" aria-label={isStarting ? 'Use a calculator' : 'Open calculators'} ref={calculatorOpener} onClick={() => { calculatorSource.current = 'user'; setCalculators(true); updateQuery({ tool: 'calculators' }); }}><SlidersHorizontal aria-hidden="true" />{isStarting ? 'Use a calculator' : 'Calculators'}</button>;
  const workspaceActions = <div className="id-actions" data-peggy-private><button type="button" className="id-button" onClick={save}><Save aria-hidden="true" />Save locally</button>{calculatorAction}</div>;
  const navigation = <nav aria-label="Analysis views">{VIEWS.map(item => <button type="button" key={item} aria-current={view === item ? 'page' : undefined} onClick={() => move(item)}>{VIEW_NAMES[item]}</button>)}</nav>;
  return <div className={`id-desk${isStarting ? ' is-starting' : ''}`}>
    <nav className="id-tool-navigation" aria-label="Strategy Lab tools"><Link href="/tools" className="id-text-button">All tools</Link><Link href="/saved" className="id-text-button">Saved work</Link></nav>
    <header className="id-opening"><div><h1 data-peggy-summary={VIEW_GUIDES.overview}>Strategy Lab.</h1><p>Compare property costs and outcomes.</p></div>{!isStarting && workspaceActions}</header>
    {resumeDraft && <section className="id-context-review" data-navigation-section data-peggy-private aria-label="Review saved draft" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); cancelResume(); } }}>
      <h2>Resume your saved draft?</h2>
      <p>Your current workspace, <strong>{workspace.base.address || 'Untitled working property'}</strong>, has changes that differ from the saved draft, <strong>{resumeDraft.base.address || 'Untitled saved property'}</strong>.</p>
      <p>Resuming replaces the working inputs, scenarios and diligence with the saved version. Your saved record stays unchanged until you choose Save locally. Undo can restore the previous working state during this visit.</p>
      <div className="id-actions"><button type="button" ref={resumeCancel} data-navigation-target className="id-button" onClick={cancelResume}>Cancel</button><button type="button" className="id-text-button" onClick={resumeSaved}>Resume saved draft</button></div>
    </section>}
    {incomingOwner && hydrated && <section className="id-context-review" data-peggy-private aria-label="Review owner context"><h2>Start with your situation</h2><p><strong>{incomingOwner}</strong> · Property owner</p><p>This starts a new property workspace with your selected situation. {changed || draft.address || draft.acquisition ? 'Your current workspace will be replaced. Save it locally first if you need to keep it; Undo restores it during this visit.' : 'You can add the address, goal and assumptions next.'}</p><div className="id-actions"><button type="button" className="id-button is-primary" onClick={applyOwner}>Use this situation</button><button type="button" className="id-text-button" onClick={() => { setIncomingOwner(''); updateQuery({ owner_situation: null }); }}>Keep current workspace</button></div></section>}
    {!isStarting && <div className="id-command" data-peggy-private><div className="id-property"><strong>{draft.address || draft.city || 'New property model'}</strong><span>{SCENARIO_NAMES[workspace.activeScenario]} scenario · {draft.illustrative ? 'Synthetic example' : 'Unverified inputs'}</span><div className="id-property-actions"><button type="button" className="id-text-button" onClick={() => move('assumptions')}>Edit property</button><button type="button" className="id-text-button" onClick={() => setConfirmation('clear')}>Clear property</button></div></div>{navigation}</div>}
    {!isStarting && <p className="id-property-context" data-peggy-private><strong>Your property</strong> · {draft.ownerSituation || draft.situation} · {draft.objective}</p>}
    {confirmation && <div className="id-confirm" data-peggy-private role="alert"><p>{confirmation === 'clear' ? 'Clear the working desk and saved browser draft?' : 'Replace your working inputs with a synthetic example? Saved data changes only when you save.'}</p><button type="button" className="id-button" onClick={confirmation === 'clear' ? clear : example}>{confirmation === 'clear' ? 'Confirm clear' : 'Confirm load example'}</button><button type="button" className="id-text-button" onClick={() => setConfirmation(null)}>Cancel</button></div>}
    <section className="id-workspace" ref={workspaceElement} aria-labelledby="desk-view-heading" data-testid="strategy-lab-workspace"><h2 ref={heading} data-peggy-summary={VIEW_GUIDES[view]} id="desk-view-heading" tabIndex={-1} className={view === 'overview' ? 'sr-only' : 'id-view-title'}>{VIEW_HEADINGS[view]}</h2>
      <div data-peggy-private>
      {view === 'overview' && <Overview draft={draft} analysis={analysis} selectedLane={selectedLane} onLane={inspect} onView={move} onExample={example} onAction={action => { focusTarget.current = action; move(action.evidence ? 'risk' : 'assumptions'); }} />}
      {view === 'assumptions' && <Assumptions draft={draft} analysis={analysis} scenario={workspace.activeScenario} onChange={change} onOverview={() => move('overview')} />}
      {view === 'scenarios' && <Scenarios workspace={workspace} analysis={analysis} selectedLane={selectedLane} onLane={inspect} onUse={id => { clearStrategyLabHandoff(); setWorkspace(current => ({ ...current, activeScenario: id })); setNotice(`${SCENARIO_NAMES[id]} is now used by the brief and other analysis views.`); }} onPreset={id => replace(applyPreset(workspace, id), `${SCENARIO_NAMES[id]} preset applied. The brief still uses ${SCENARIO_NAMES[workspace.activeScenario]}.`)} onReset={id => replace({ ...workspace, variants: { ...workspace.variants, [id]: {} } }, `${SCENARIO_NAMES[id]} now matches Base.`)} onApply={apply} onPreviewApply={(patch, target) => replace({ ...workspace, variants: { ...workspace.variants, [target]: patch } }, `Preview applied to ${SCENARIO_NAMES[target]}. Base is unchanged. The brief uses ${SCENARIO_NAMES[workspace.activeScenario]}.`)} onEdit={() => move('assumptions')} />}
      {view === 'risk' && <Risk draft={draft} analysis={analysis} diligence={workspace.diligence} phases={workspace.phases} onDiligence={id => setWorkspace(current => ({ ...current, diligence: current.diligence.includes(id) ? current.diligence.filter(item => item !== id) : [...current.diligence, id] }))} onPhase={(id, key, value) => setWorkspace(current => ({ ...current, phases: current.phases.map(phase => phase.id === id ? { ...phase, [key]: value } : phase) }))} onEdit={() => move('assumptions')} />}
      {view === 'memo' && <Memo draft={draft} analysis={analysis} scenario={workspace.activeScenario} diligence={workspace.diligence} onCopy={copy} onPrint={() => { setNotice('Use your browser print dialog to print or save a PDF.'); window.print(); }} onIntake={carry} onPeggy={discuss} onEdit={() => move('assumptions')} />}
      </div>
    </section>
    {isStarting && <div className="id-start-tools" data-peggy-private><p>Just need a calculation?</p>{calculatorAction}</div>}
    {analysis.status === 'ready' && view !== 'overview' && view !== 'memo' && <KeyEconomics analysis={analysis} />}
    <footer className="id-workspace-footer" data-peggy-private><div role="status" aria-label="Workspace status"><p>{notice}</p>{!isStarting && <span>{changed ? 'Unsaved changes' : 'No unsaved changes'}</span>}</div><div className="id-actions">{undo && <button type="button" className="id-text-button" onClick={() => { clearStrategyLabHandoff(); setWorkspace(undo); setUndo(null); setNotice('Previous working state restored. Save to update the browser draft.'); }}><RotateCcw aria-hidden="true" />Undo</button>}{analysis.status === 'ready' && <button type="button" className="id-text-button" onClick={example}>Load illustrative example</button>}{!isStarting && <button type="button" className="id-text-button" onClick={() => setConfirmation('clear')}>Clear desk</button>}</div></footer>
    {calculators && <section className="id-calculators" data-navigation-target={calculatorSource.current === 'deeplink' ? '' : undefined} data-peggy-private ref={calculatorPanel} tabIndex={-1} aria-label="Decision calculators"><header><div><p>Decision calculators</p><h2>Open the worksheet your decision requires.</h2></div><button type="button" className="id-button" onClick={() => { setCalculators(false); updateQuery({ tool: null, tab: null }); calculatorOpener.current?.focus(); }}>Close calculators</button></header><React.Suspense fallback={<p>Loading calculators…</p>}><CalculatorToolsPanel activeTab={instrument} setActiveTab={tab => { setInstrument(tab); updateQuery({ tool: 'calculators', tab: tab === 'arv' ? null : tab }); }} publicMode /></React.Suspense></section>}
  </div>;
}
