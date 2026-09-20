import React from 'react';
import { ArrowRight, CircleAlert, SlidersHorizontal } from 'lucide-react';
import type { StrategyLane } from '@shared/strategy-lab';
import { money, laneName, safeMetric, type Analysis, type ReadyAnalysis } from './model';
import { type Draft, type DeskView } from './state';
import { CapitalBreakdown } from './CapitalBreakdown';
import { DecisionCanvas, stageDetails, type Stage } from './DecisionCanvas';
import { fitExplanation, metricExplanation, nextReadAction, type ReadAction } from './read-guidance';

export function KeyEconomics({ analysis }: { analysis: ReadyAnalysis }) {
  const total = analysis.presentation.capitalStack.reduce((sum, row) => sum + row.amount, 0);
  const debt = analysis.presentation.capitalStack.find(row => row.source === 'conventional')?.amount;
  return <section className="id-economics" aria-label="Key economics"><dl>{[
    ['Purchase basis', money(analysis.property.purchasePrice)],
    ['Acquisition + scope + reserve', money(total)],
    ['Cash required', money(analysis.presentation.totalCashIn)],
    ['Acquisition debt', money(debt)],
  ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{analysis.missing.includes('scope') && <p>Scope is unreported. These amounts exclude its cost.</p>}</section>;
}

export function Unavailable({ analysis, onEdit }: { analysis: Analysis; onEdit: () => void }) {
  return <div className="id-unavailable" role="status" aria-label="Analysis unavailable"><CircleAlert aria-hidden="true" /><div><h3>{analysis.status === 'invalid' ? 'Check the assumptions.' : 'A few facts first.'}</h3><p>{analysis.status === 'invalid' ? 'Correct the highlighted inputs in Assumptions to restore the analysis.' : 'Add a positive purchase basis and either an exit value or monthly rent. A decision brief needs valid inputs.'}</p><button type="button" className="id-text-button" onClick={onEdit}>Edit assumptions <ArrowRight aria-hidden="true" /></button></div></div>;
}

export function Overview({ draft, analysis, selectedLane, onLane, onView, onExample, onAction }: { draft: Draft; analysis: Analysis; selectedLane: StrategyLane | null; onLane: (lane: StrategyLane) => void; onView: (view: DeskView) => void; onExample: () => void; onAction: (action: ReadAction) => void }) {
  const [stage, setStage] = React.useState<Stage | null>(null);
  const [allPaths, setAllPaths] = React.useState(false);
  const resultHeading = React.useRef<HTMLHeadingElement>(null);

  if (analysis.status !== 'ready') return <>
    <div className="id-empty">
      <div className="id-empty-intro">
        <p className="id-eyebrow">A clearer property decision</p>
        <h2>Start with the property.</h2>
        <p>Bring the numbers you know. See how the basis, capital and possible exits fit together, then decide what to investigate next.</p>
        <div className="id-actions"><button type="button" className="id-button is-primary" onClick={() => onView('assumptions')}>Start a property <ArrowRight aria-hidden="true" /></button><button type="button" className="id-text-button" onClick={onExample}>Load illustrative example <ArrowRight aria-hidden="true" /></button></div>
        <p className="id-caption">The example is synthetic. Your working draft stays in this browser until you choose to carry it forward.</p>
      </div>
      <div className="id-start-guide" aria-label="What you need to begin">
        <h3>A useful first read starts here.</h3>
        <ol><li><span>01</span><div><h4>Purchase basis</h4><p>The price or current basis you want to model.</p></div></li><li><span>02</span><div><h4>An exit value or monthly rent</h4><p>Your assumption, ready to test and refine.</p></div></li><li><span>03</span><div><h4>Scope, when you know it</h4><p>Leave unknown costs blank. Add detail as you go.</p></div></li></ol>
      </div>
    </div>
    {analysis.status === 'invalid' && <Unavailable analysis={analysis} onEdit={() => onView('assumptions')} />}
  </>;

  const snapshot = analysis.presentation;
  const lane = snapshot.lanes.find(item => item.lane === selectedLane) ?? snapshot.lanes[0];
  const top = snapshot.lanes[0];
  const next = nextReadAction(draft, analysis, lane);
  const detail = stage ? stageDetails(stage, analysis) : null;
  const inspect = (next: StrategyLane) => {
    onLane(next);
    resultHeading.current?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
    resultHeading.current?.focus({ preventScroll: true });
  };

  return <>
    <div className="id-overview-grid">
      <aside className="id-read" aria-label="Result inspector" aria-live="polite">
        <header><h2>Current read</h2><span>{lane.lane === top.lane ? 'Highest modeled fit' : 'Inspecting this path'}</span></header>
        <div className="id-read-main">
          <div><h3 ref={resultHeading} tabIndex={-1}>{laneName(lane)}</h3><p className="id-verdict">{lane.verdictLabel}</p><dl className="id-read-primary"><div><dt>{lane.lane === 'listing_referral' ? 'Exit value above investor allowance' : lane.economics.primaryMetric}</dt><dd>{safeMetric(lane.economics.primaryValue)}</dd></div></dl><p className="id-metric-explanation">{metricExplanation(analysis, lane)}</p></div>
          <div className="id-read-next"><h4>{next.title}</h4><p>{next.detail}</p><button type="button" className="id-text-button" onClick={() => onAction(next)}>{next.label} <ArrowRight aria-hidden="true" /></button><div className="id-fit-reason"><h4>What drives this fit</h4><p>{fitExplanation(lane)}</p></div></div>
        </div>
        <details className="id-read-evidence"><summary>Supporting factors and model detail</summary><div className="id-read-factors"><div><h4>What supports it</h4><p>{lane.confidence.supportingFactors.join(' ') || 'No supporting factor is established by the current inputs.'}</p></div><div><h4>What needs attention</h4><p>{[...lane.confidence.sensitiveFactors, ...lane.confidence.missingInputs].join(' ') || 'Title, permits and market evidence still require independent verification.'}</p></div></div><dl className="id-inspector-metrics">{lane.economics.metrics.map(metric => <div key={metric.label}><dt>{metric.label}</dt><dd>{safeMetric(metric.value)}</dd></div>)}</dl></details>
        {lane.lane !== top.lane && <p className="id-read-attribution">Highest modeled fit: {laneName(top)}. The Memo summarizes that leading path.</p>}
        <p className="id-read-boundary">Automated model summary. A ranked fit is not a professional recommendation.</p>
      </aside>
      <aside className="id-context" aria-label="Property and model">
        <header><h2>Your assumptions</h2><button type="button" className="id-text-button" onClick={() => onView('assumptions')} aria-label="Edit property assumptions"><SlidersHorizontal aria-hidden="true" />Edit</button></header>
        <p>{draft.propertyType} · {draft.occupancy === 'Unknown or needs review' ? 'Occupancy unknown' : draft.occupancy}</p>
        <dl>{[['Scope', analysis.property.rehabBudget === undefined ? 'Unreported' : money(analysis.property.rehabBudget)], ['Exit value', money(analysis.property.arvEstimate)], ['Market rent', analysis.property.marketRent === undefined ? 'Unreported' : `${money(analysis.property.marketRent)} / month`]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <p className="id-caption">{draft.illustrative ? 'Synthetic example. Every assumption is editable.' : 'Visitor-entered, unverified assumptions.'} No market feed is connected.</p>
        <button type="button" className="id-text-button" onClick={() => onView('memo')}>Read the decision brief <ArrowRight aria-hidden="true" /></button>
      </aside>
    </div>
    <KeyEconomics analysis={analysis} />
    <section className="id-paths"><header><h2>Modeled strategy paths</h2><span>Select a path to bring its read into view.</span></header><div className="id-table-scroll" tabIndex={0} role="region" aria-label="Ranked paths, scroll horizontally on small screens"><table aria-label="Ranked strategy paths"><thead><tr><th scope="col">Path</th><th scope="col">Modeled fit</th><th scope="col">Model result</th></tr></thead><tbody>{(allPaths ? snapshot.lanes : snapshot.lanes.slice(0, 3)).map(item => <tr key={item.lane} data-selected={item.lane === lane.lane}><th scope="row"><button type="button" aria-label={`Inspect ${laneName(item)}`} aria-pressed={item.lane === lane.lane} onClick={() => inspect(item.lane)}>{laneName(item)}<ArrowRight aria-hidden="true" /></button></th><td>{item.verdictLabel}</td><td><strong>{safeMetric(item.economics.primaryValue)}</strong><span>{item.economics.primaryMetric}</span></td></tr>)}</tbody></table></div><button type="button" className="id-text-button" onClick={() => setAllPaths(!allPaths)} aria-expanded={allPaths}>{allPaths ? 'Show the first three paths' : 'View all nine paths'} <ArrowRight aria-hidden="true" /></button></section>
    <div className="id-risk-summary"><p><CircleAlert aria-hidden="true" />{snapshot.risks.length} triggered flags. Evidence remains unverified.</p><div><button type="button" className="id-text-button" onClick={() => onView('scenarios')}>Compare scenarios</button><button type="button" className="id-text-button" onClick={() => onView('risk')}>Inspect risk <ArrowRight aria-hidden="true" /></button></div></div>
    <details className="id-details id-model-detail"><summary>Explore the funding and model relationships</summary><div className="id-model-grid"><div><DecisionCanvas analysis={analysis} selected={stage} onSelect={setStage} />{detail && <section className="id-stage-detail" aria-live="polite" aria-label="Stage assumptions"><h3>{detail.title}</h3><strong>{detail.value}</strong><p>{detail.explanation}</p></section>}</div><CapitalBreakdown snapshot={snapshot} unknownScope={analysis.missing.includes('scope')} /></div></details>
  </>;
}
