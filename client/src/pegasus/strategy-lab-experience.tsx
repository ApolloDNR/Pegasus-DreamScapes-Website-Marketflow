import React from 'react';
import { useLocation, useSearch } from 'wouter';
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  CircleAlert,
  Compass,
  FileText,
  Hammer,
  Landmark,
  MessageCircle,
  RotateCcw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import type { Nav } from './theme';
import { IMG } from './primitives';

type LabStep = 'property' | 'basis' | 'strategy' | 'review';
type LabState = {
  address: string;
  propertyType: string;
  situation: string;
  occupancy: string;
  acquisition: string;
  scope: string;
  arv: string;
  holdMonths: string;
  objective: string;
  timing: string;
};

type Scenario = {
  name: string;
  status: string;
  note: string;
  emphasis: 'lead' | 'consider' | 'hold';
};

const STORAGE_KEY = 'pegasus.strategy-lab.v2';
const INITIAL: LabState = {
  address: '',
  propertyType: 'Single-family residence',
  situation: 'Value-add opportunity',
  occupancy: 'Vacant',
  acquisition: '',
  scope: '',
  arv: '',
  holdMonths: '6',
  objective: 'Understand the strongest executable path',
  timing: 'Flexible',
};

const STEPS: Array<{ key: LabStep; num: string; label: string; hint: string }> = [
  { key: 'property', num: '01', label: 'Property', hint: 'Situation and context' },
  { key: 'basis', num: '02', label: 'Basis', hint: 'Cost and exit assumptions' },
  { key: 'strategy', num: '03', label: 'Strategy', hint: 'Objectives and constraints' },
  { key: 'review', num: '04', label: 'Review', hint: 'Decision brief' },
];

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const money = (value: number) => USD.format(Number.isFinite(value) ? value : 0);
const numberFrom = (value: string) => {
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="px-lab-label">{children}</span>;
}

function TextField({ label, value, onChange, placeholder, inputMode }:
  { label: string; value: string; onChange: (value: string) => void; placeholder?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'] }) {
  return (
    <label className="px-lab-field">
      <FieldLabel>{label}</FieldLabel>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode={inputMode} />
    </label>
  );
}

function SelectField({ label, value, onChange, options }:
  { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="px-lab-field">
      <FieldLabel>{label}</FieldLabel>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function StepHeading({ eyebrow, title, copy }:
  { eyebrow: string; title: string; copy: string }) {
  return (
    <header className="px-lab-step-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
    </header>
  );
}

export function PremiumStrategyLab({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const calculatorsRequested = new URLSearchParams(search).get('tool') === 'calculators';
  const [step, setStep] = React.useState<LabStep>(calculatorsRequested ? 'basis' : 'property');
  const [state, setState] = React.useState<LabState>(INITIAL);
  const [savedNote, setSavedNote] = React.useState('');
  const workspaceHeading = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Partial<LabState>;
      setState((current) => ({ ...current, ...parsed }));
      setSavedNote('Your private browser draft was restored.');
    } catch {
      // A corrupt or blocked local draft should never stop the desk from opening.
    }
  }, []);

  React.useEffect(() => {
    workspaceHeading.current?.focus();
  }, [step]);

  React.useEffect(() => {
    if (!calculatorsRequested) return;
    document.querySelector('.px-lab-workspace')?.scrollIntoView({ block: 'start' });
  }, [calculatorsRequested]);

  const set = <K extends keyof LabState>(key: K, value: LabState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  const acquisition = numberFrom(state.acquisition);
  const scope = numberFrom(state.scope);
  const arv = numberFrom(state.arv);
  const holdMonths = Math.max(0, numberFrom(state.holdMonths));
  const hardBasis = acquisition + scope;
  const carry = hardBasis * 0.09 * (holdMonths / 12);
  const exitCosts = arv * 0.07;
  const totalToDeliver = hardBasis + carry + exitCosts;
  const netProceeds = arv - exitCosts;
  const spread = netProceeds - hardBasis - carry;
  const marginOnCost = totalToDeliver > 0 ? (spread / totalToDeliver) * 100 : 0;
  const hasBasis = acquisition > 0 && arv > 0;
  const completedInputs = [state.address.trim(), state.acquisition, state.arv, state.objective].filter(Boolean).length;
  const readiness = completedInputs === 4 ? 'Ready for a directional review' : completedInputs >= 2 ? 'Promising draft — a few inputs remain' : 'Start with the property and basis';

  const scenarioRank: Record<Scenario['emphasis'], number> = { lead: 0, consider: 1, hold: 2 };
  const scenarios: Scenario[] = hasBasis
    ? ([
        {
          name: 'Value-add execution',
          status: marginOnCost >= 12 ? 'Leading path' : marginOnCost >= 5 ? 'Needs disciplined terms' : 'Do not lead with this path',
          note: marginOnCost >= 12
            ? 'The entered basis retains a material cushion after modeled carry and exit costs.'
            : 'The entered basis leaves limited room for execution variance. Revisit price, scope, or timing.',
          emphasis: marginOnCost >= 12 ? 'lead' : marginOnCost >= 5 ? 'consider' : 'hold',
        },
        {
          name: 'Representation or retail exit',
          status: state.situation.includes('Owner') || marginOnCost < 8 ? 'Consider alongside acquisition' : 'Secondary path',
          note: 'Useful when owner equity, market exposure, or a lighter intervention may outperform a principal acquisition.',
          emphasis: state.situation.includes('Owner') || marginOnCost < 8 ? 'consider' : 'hold',
        },
        {
          name: 'Structured property review',
          status: 'Required before action',
          note: 'Condition, title, occupancy, market support, scope, and terms still need a human review.',
          emphasis: 'consider',
        },
      ] as Scenario[]).sort((a, b) => scenarioRank[a.emphasis] - scenarioRank[b.emphasis])
    : [];

  const risks = [
    !state.address.trim() ? 'Property location is still missing.' : '',
    acquisition <= 0 ? 'Acquisition or current basis is still missing.' : '',
    arv <= 0 ? 'Exit value assumption is still missing.' : '',
    scope <= 0 ? 'Scope is entered as zero; confirm that no work is required.' : '',
    hasBasis && marginOnCost < 8 ? 'Modeled margin is narrow after carry and exit costs.' : '',
    holdMonths > 12 ? 'The hold period creates meaningful carry exposure.' : '',
  ].filter(Boolean);

  const currentIndex = STEPS.findIndex((item) => item.key === step);
  const nextStep = () => setStep(STEPS[Math.min(currentIndex + 1, STEPS.length - 1)].key);
  const previousStep = () => setStep(STEPS[Math.max(currentIndex - 1, 0)].key);

  const saveDraft = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSavedNote('Decision brief saved in this browser.');
    } catch {
      setSavedNote('This browser blocked local saving. Your current desk remains open.');
    }
  };

  const resetDraft = () => {
    setState(INITIAL);
    setStep('property');
    setSavedNote('Desk cleared.');
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* no-op */ }
  };

  return (
    <div className="px-lab" data-testid="premium-strategy-lab">
      <section className="px-lab-masthead">
        <img src={IMG('pegasus-architecture.png')} alt="Architectural model and planning instruments on a Pegasus worktable" />
        <div className="px-lab-masthead-scrim" aria-hidden="true" />
        <div className="px-lab-masthead-inner">
          <p className="px-kicker">Pegasus Strategy Lab · Private working desk</p>
          <h1>Turn one property into a decision you can defend.</h1>
          <p>Build the basis, compare executable paths, surface what is still unknown, and carry a concise brief into a written Pegasus review.</p>
          <div className="px-lab-trust" aria-label="Strategy Lab principles">
            <span><ShieldCheck aria-hidden="true" /> Directional, not an offer</span>
            <span><FileText aria-hidden="true" /> Saved in your browser</span>
            <span><Compass aria-hidden="true" /> Human review before action</span>
          </div>
        </div>
      </section>

      <section className="px-lab-workspace" aria-labelledby="lab-workspace-title" data-testid="strategy-lab-workspace">
        <div className="px-lab-progress" aria-label="Strategy Lab steps">
          {STEPS.map((item, index) => (
            <button key={item.key} type="button" onClick={() => setStep(item.key)} aria-current={step === item.key ? 'step' : undefined} className={step === item.key ? 'is-current' : index < currentIndex ? 'is-complete' : ''}>
              <span>{item.num}</span>
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
              {index < currentIndex && <Check aria-hidden="true" />}
            </button>
          ))}
        </div>

        <div className="px-lab-grid">
          <article className="px-lab-desk">
            <h2 id="lab-workspace-title" ref={workspaceHeading} tabIndex={-1} className="sr-only">Strategy Lab {STEPS[currentIndex].label} step</h2>

            {step === 'property' && (
              <div className="px-lab-step">
                <StepHeading eyebrow="01 · Property record" title="What are we actually reading?" copy="Begin with the situation, not a generic score. The address stays on this browser unless you choose to send a review." />
                <div className="px-lab-form-grid">
                  <div className="px-lab-wide"><TextField label="Property address or city" value={state.address} onChange={(value) => set('address', value)} placeholder="East Bay property or city" /></div>
                  <SelectField label="Property type" value={state.propertyType} onChange={(value) => set('propertyType', value)} options={['Single-family residence', 'Condo or townhome', '2–4 units', 'Small multifamily', 'Land or development site', 'Commercial or mixed-use']} />
                  <SelectField label="Situation" value={state.situation} onChange={(value) => set('situation', value)} options={['Value-add opportunity', 'Owner needs options', 'Inherited or estate property', 'Distressed or time-sensitive', 'Contract or sourced opportunity', 'Development or ADU potential']} />
                  <SelectField label="Occupancy" value={state.occupancy} onChange={(value) => set('occupancy', value)} options={['Vacant', 'Owner occupied', 'Tenant occupied', 'Unknown or needs review']} />
                  <SelectField label="Timing" value={state.timing} onChange={(value) => set('timing', value)} options={['Flexible', 'Within 90 days', 'Within 30 days', 'Time-sensitive']} />
                </div>
              </div>
            )}

            {step === 'basis' && (
              <div className="px-lab-step">
                <StepHeading eyebrow="02 · Basis ledger" title="Put the assumptions in one place." copy="The desk models carry at 9% annualized and exit costs at 7% of the entered value. These are orientation assumptions, not quotes." />
                <div className="px-lab-form-grid">
                  <TextField label="Acquisition or current basis" value={state.acquisition} onChange={(value) => set('acquisition', value)} placeholder="$600,000" inputMode="numeric" />
                  <TextField label="Scope / improvement budget" value={state.scope} onChange={(value) => set('scope', value)} placeholder="$105,000" inputMode="numeric" />
                  <TextField label="Projected exit value" value={state.arv} onChange={(value) => set('arv', value)} placeholder="$840,000" inputMode="numeric" />
                  <TextField label="Modeled hold period (months)" value={state.holdMonths} onChange={(value) => set('holdMonths', value)} placeholder="6" inputMode="numeric" />
                </div>
                <div className="px-lab-ledger" aria-live="polite">
                  <div><span>Hard basis</span><strong>{money(hardBasis)}</strong><small>Acquisition + scope</small></div>
                  <div><span>Modeled carry</span><strong>{money(carry)}</strong><small>9% annualized</small></div>
                  <div><span>Modeled exit costs</span><strong>{money(exitCosts)}</strong><small>7% of exit value</small></div>
                  <div className="is-total"><span>Total to deliver and sell</span><strong>{money(totalToDeliver)}</strong><small>Directional basis</small></div>
                </div>
              </div>
            )}

            {step === 'strategy' && (
              <div className="px-lab-step">
                <StepHeading eyebrow="03 · Decision frame" title="Choose the result that matters." copy="A sophisticated plan is not always the path with the highest headline price. State the objective and compare what can actually be executed." />
                <div className="px-lab-form-grid">
                  <div className="px-lab-wide"><SelectField label="Primary objective" value={state.objective} onChange={(value) => set('objective', value)} options={['Understand the strongest executable path', 'Maximize net value', 'Prioritize certainty and timing', 'Preserve control or optionality', 'Find a capital or operating partner']} /></div>
                </div>
                <div className="px-lab-scenarios">
                  {scenarios.length ? scenarios.map((scenario, index) => (
                    <div key={scenario.name} className={scenario.emphasis === 'lead' ? 'is-leading' : ''}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div><h3>{scenario.name}</h3><p>{scenario.note}</p></div>
                      <strong>{scenario.status}</strong>
                    </div>
                  )) : (
                    <div className="px-lab-empty"><Landmark aria-hidden="true" /><p>Enter an acquisition basis and projected exit value to compare grounded paths.</p></div>
                  )}
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="px-lab-step">
                <StepHeading eyebrow="04 · Review record" title="A concise brief, with the gaps left visible." copy="This is a planning record, not a valuation or recommendation. A Pegasus Property Read adds market, title, condition, and execution review." />
                <div className="px-lab-review-grid">
                  <section>
                    <p className="px-lab-label">Directional economics</p>
                    <dl>
                      <div><dt>Net proceeds after modeled exit costs</dt><dd>{money(netProceeds)}</dd></div>
                      <div><dt>Modeled spread</dt><dd>{hasBasis ? money(spread) : 'Needs basis'}</dd></div>
                      <div><dt>Margin on total modeled cost</dt><dd>{hasBasis ? `${marginOnCost.toFixed(1)}%` : 'Needs basis'}</dd></div>
                      <div><dt>Current lead path</dt><dd>{scenarios[0]?.name ?? 'Needs basis'}</dd></div>
                    </dl>
                  </section>
                  <section>
                    <p className="px-lab-label">Open questions</p>
                    {risks.length ? <ul>{risks.map((risk) => <li key={risk}><CircleAlert aria-hidden="true" />{risk}</li>)}</ul> : <p className="px-lab-complete"><Check aria-hidden="true" /> Core desk inputs are present. Human diligence still applies.</p>}
                  </section>
                </div>
                <div className="px-lab-review-actions">
                  <button type="button" onClick={saveDraft}><Save aria-hidden="true" /> Save decision brief</button>
                  <button type="button" onClick={openPeggy}><MessageCircle aria-hidden="true" /> Discuss with Peggy</button>
                  <button type="button" className="is-primary" onClick={() => setLocation('/bring-an-opportunity?intent=property&ref=strategy-lab')}>
                    Request a written Property Read <ArrowRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            <footer className="px-lab-step-footer">
              <button type="button" onClick={previousStep} disabled={currentIndex === 0}>Previous</button>
              <p role="status">{savedNote}</p>
              {currentIndex < STEPS.length - 1 ? (
                <button type="button" className="is-next" onClick={nextStep}>Continue <ChevronRight aria-hidden="true" /></button>
              ) : (
                <button type="button" onClick={resetDraft}><RotateCcw aria-hidden="true" /> Clear desk</button>
              )}
            </footer>
          </article>

          <aside className="px-lab-brief" aria-label="Live decision brief">
            <div className="px-lab-brief-head">
              <span>Live decision brief</span>
              <strong>{readiness}</strong>
            </div>
            <div className="px-lab-brief-property">
              <Building2 aria-hidden="true" />
              <div><strong>{state.address || 'Property not entered'}</strong><span>{state.propertyType} · {state.occupancy}</span></div>
            </div>
            <dl>
              <div><dt>Basis + scope</dt><dd>{hardBasis ? money(hardBasis) : '—'}</dd></div>
              <div><dt>Modeled spread</dt><dd>{hasBasis ? money(spread) : '—'}</dd></div>
              <div><dt>Objective</dt><dd>{state.objective}</dd></div>
              <div><dt>Timing</dt><dd>{state.timing}</dd></div>
            </dl>
            <div className="px-lab-brief-rule" />
            <p>Numbers are only one layer. A written review checks property facts, market support, title, occupancy, scope, capital, and terms before Pegasus participates.</p>
            <button type="button" onClick={() => go('submit')}>Carry this into intake <ArrowRight aria-hidden="true" /></button>
          </aside>
        </div>
      </section>

      <section className="px-lab-boundary" data-testid="text-strategy-disclaimer">
        <Hammer aria-hidden="true" />
        <div><p className="px-kicker">The operating boundary</p><h2>The Lab organizes a decision. It does not replace diligence.</h2></div>
        <p>No offer, appraisal, legal advice, tax advice, financial advice, lending commitment, or investment recommendation is created here.</p>
      </section>
    </div>
  );
}
