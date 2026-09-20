import React from 'react';
import { ArrowRight, CircleAlert, SlidersHorizontal } from 'lucide-react';
import type { StrategyLane } from '@shared/strategy-lab';
import { money, laneName, safeMetric, type Analysis, type ReadyAnalysis } from './model';
import { type Draft, type DeskView } from './state';
import { CapitalBreakdown } from './CapitalBreakdown';
import { DecisionCanvas, stageDetails, type Stage } from './DecisionCanvas';

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

export function Overview({ draft, analysis, selectedLane, onLane, onView, onExample }: { draft: Draft; analysis: Analysis; selectedLane: StrategyLane | null; onLane: (lane: StrategyLane) => void; onView: (view: DeskView) => void; onExample: () => void }) {
  const [stage, setStage] = React.useState<Stage | null>(null);
  const [allPaths, setAllPaths] = React.useState(false);
  if (analysis.status !== 'ready') return <div className="id-empty"><div><h2>Start with the property.</h2><p>Put the basis, capital and possible exits in one view. Begin with the figures you know.</p><div className="id-actions"><button type="button" className="id-button is-primary" onClick={() => onView('assumptions')}>Start a property <ArrowRight aria-hidden="true" /></button><button type="button" className="id-button" onClick={onExample}>Load illustrative example</button></div><p className="id-caption">The example uses synthetic inputs. Your working draft stays in this browser until you choose to carry it forward.</p></div><Unavailable analysis={analysis} onEdit={() => onView('assumptions')} /></div>;
  const snapshot = analysis.presentation;
  const lane = snapshot.lanes.find(item => item.lane === selectedLane) ?? snapshot.lanes[0];
  const top = snapshot.lanes[0];
  const detail = stage ? stageDetails(stage, analysis) : null;
  return <>
    <div className="id-overview-grid">
      <aside className="id-context" aria-label="Property and model"><h2>Property / Model</h2><strong>{draft.address || draft.city || 'Property not named'}</strong><p>{draft.propertyType}<br />Occupancy: {draft.occupancy === 'Unknown or needs review' ? 'Unknown' : draft.occupancy}</p><h3>Key assumptions</h3><dl>{[['Scope', analysis.property.rehabBudget === undefined ? 'Unreported' : money(analysis.property.rehabBudget)], ['Exit value', money(analysis.property.arvEstimate)], ['Market rent', analysis.property.marketRent === undefined ? 'Unreported' : `${money(analysis.property.marketRent)} / month`]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><button type="button" className="id-text-button" onClick={() => onView('assumptions')}><SlidersHorizontal aria-hidden="true" /> Edit assumptions</button><p className="id-caption">{draft.illustrative ? 'Synthetic example with editable assumptions.' : 'Visitor-entered assumptions.'} No market feed is connected.</p></aside>
      <div className="id-visual-core"><DecisionCanvas analysis={analysis} selected={stage} onSelect={setStage} /><CapitalBreakdown snapshot={snapshot} unknownScope={analysis.missing.includes('scope')} /></div>
      <aside className="id-inspector" aria-label="Result inspector" aria-live="polite"><h2>{detail ? detail.title : 'Current read'}</h2>{detail ? <><strong className="id-inspector-value">{detail.value}</strong><p>{detail.explanation}</p><button type="button" className="id-text-button" onClick={() => setStage(null)}>Return to path read</button></> : <><p className="id-caption">{lane.lane === top.lane ? 'Highest modeled fit' : 'Inspecting this path'}</p><h3>{laneName(lane)}</h3><p className="id-verdict">{lane.verdictLabel}</p><dl className="id-inspector-metrics"><div><dt>{lane.economics.primaryMetric}</dt><dd>{safeMetric(lane.economics.primaryValue)}</dd></div>{lane.economics.metrics.slice(0, 2).map(metric => <div key={metric.label}><dt>{metric.label}</dt><dd>{safeMetric(metric.value)}</dd></div>)}</dl><h4>What supports it</h4><p>{lane.confidence.supportingFactors[0] || 'No supporting factor is established by the current inputs.'}</p><h4>What needs attention</h4><p>{lane.confidence.sensitiveFactors[0] || lane.confidence.missingInputs[0] || 'Title, permits and market evidence still require independent verification.'}</p>{lane.lane !== top.lane && <p className="id-caption">Highest modeled fit: {laneName(top)}</p>}<h4>Next diligence step</h4><p>{lane.lane === top.lane ? snapshot.memo.nextStep : lane.confidence.missingInputs[0] || 'Validate the inputs and sensitive factors for this inspected path.'}</p></>}<p className="id-caption id-rule">Automated model summary. A ranked fit is not a professional recommendation.</p></aside>
    </div>
    <section className="id-paths"><header><h2>Modeled strategy paths</h2><span>Inspect the evidence behind each path.</span></header><div className="id-table-scroll"><table aria-label="Ranked strategy paths"><thead><tr><th scope="col">Path</th><th scope="col">Modeled fit</th><th scope="col">Model result</th></tr></thead><tbody>{(allPaths ? snapshot.lanes : snapshot.lanes.slice(0, 3)).map(item => <tr key={item.lane} data-selected={item.lane === lane.lane}><th scope="row"><button type="button" aria-label={`Inspect ${laneName(item)}`} aria-pressed={item.lane === lane.lane} onClick={() => { onLane(item.lane); setStage(null); }}>{laneName(item)}<ArrowRight aria-hidden="true" /></button></th><td>{item.verdictLabel}</td><td><strong>{safeMetric(item.economics.primaryValue)}</strong><span>{item.economics.primaryMetric}</span></td></tr>)}</tbody></table></div><button type="button" className="id-text-button" onClick={() => setAllPaths(!allPaths)} aria-expanded={allPaths}>{allPaths ? 'Show the first three paths' : 'View all nine paths'} <ArrowRight aria-hidden="true" /></button></section>
    <div className="id-risk-summary"><p><CircleAlert aria-hidden="true" />{snapshot.risks.length} triggered flags. Evidence remains unverified.</p><div><button type="button" className="id-text-button" onClick={() => onView('scenarios')}>Compare scenarios</button><button type="button" className="id-text-button" onClick={() => onView('risk')}>Inspect risk <ArrowRight aria-hidden="true" /></button></div></div>
  </>;
}
