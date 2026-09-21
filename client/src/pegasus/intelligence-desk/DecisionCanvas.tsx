import React from 'react';
import { ArrowRight, Building2, Landmark, Hammer, ChartNoAxesCombined } from 'lucide-react';
import { money, type ReadyAnalysis } from './model';
export type Stage = 'basis' | 'capital' | 'execution' | 'exit';
export const STAGE_NAMES: Record<Stage, string> = { basis: 'Basis', capital: 'Capital', execution: 'Execution', exit: 'Exit' };

export function stageDetails(stage: Stage, analysis: ReadyAnalysis): { title: string; value: string; explanation: string } {
  const { property, snapshot, options } = analysis;
  switch (stage) {
    case 'basis': return { title: 'The starting basis', value: money(property.purchasePrice), explanation: 'Visitor-entered acquisition price. This is not a verified value, accepted offer, or appraisal.' };
    case 'capital': return { title: 'Modeled funding', value: money(snapshot.totalCashIn), explanation: `Cash required with ${options.loanLtvPct}% modeled acquisition LTV, plus scope and a ${options.closingReservePct}% closing reserve. Financing is uncommitted unless independently documented.` };
    case 'execution': return { title: 'Scope and execution', value: property.rehabBudget === undefined ? 'Scope unreported' : money(property.rehabBudget), explanation: 'The entered improvement budget funds the scope. Validate construction, permits, contingency and schedule independently. Timeline planning does not change modeled costs.' };
    case 'exit': return { title: 'The exit assumption', value: (property.arvEstimate ?? 0) > 0 ? money(property.arvEstimate) : `${money(property.marketRent)} / month`, explanation: 'Entered exit value or rent supports the lane comparison. This is not independently verified market evidence. Change assumptions to inspect a different result.' };
  }
}

export function DecisionCanvas({ analysis, selected, onSelect }: { analysis: ReadyAnalysis; selected: Stage | null; onSelect: (stage: Stage) => void }) {
  const stages = [
    { key: 'basis' as const, Icon: Building2, detail: 'Purchase basis', value: money(analysis.property.purchasePrice) },
    { key: 'capital' as const, Icon: Landmark, detail: 'Modeled cash required', value: money(analysis.snapshot.totalCashIn) },
    { key: 'execution' as const, Icon: Hammer, detail: 'Scope budget', value: analysis.property.rehabBudget === undefined ? 'Unreported' : money(analysis.property.rehabBudget) },
    { key: 'exit' as const, Icon: ChartNoAxesCombined, detail: (analysis.property.arvEstimate ?? 0) > 0 ? 'Entered exit value' : 'Entered monthly rent', value: money((analysis.property.arvEstimate ?? 0) > 0 ? analysis.property.arvEstimate : analysis.property.marketRent) },
  ];
  return <section className="id-canvas" aria-label="Decision canvas"><header><h2>How the model connects.</h2><p>Select a stage to inspect its assumptions.</p></header><div className="id-stages">{stages.map(({ key, Icon, detail, value }, index) => <React.Fragment key={key}><button type="button" aria-pressed={selected === key} onClick={() => onSelect(key)}><span className="id-stage-icon"><Icon aria-hidden="true" /></span><strong>{STAGE_NAMES[key]}</strong><span>{detail}</span><b>{value}</b></button>{index < stages.length - 1 && <ArrowRight className="id-stage-arrow" aria-hidden="true" />}</React.Fragment>)}</div><p className="id-canvas-note">A model relationship, not a flow of committed funds.</p></section>;
}
