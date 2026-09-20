import React from 'react';
import { Copy, Printer, ArrowRight, MessageCircle } from 'lucide-react';
import { laneName, money, safeMetric, type Analysis, type ReadyAnalysis } from './model';
import { SCENARIO_NAMES, DEFAULTS, type Draft, type ScenarioId } from './state';
import { DILIGENCE } from './Risk';
import { Unavailable } from './Overview';

function operatingBrief(analysis: ReadyAnalysis): string {
  return `Vacancy ${analysis.options.vacancyPctBase}%; management ${analysis.options.managementPct}%; property tax ${analysis.property.monthlyTaxAnnualPct ?? DEFAULTS.taxRate}% annually; insurance ${money(analysis.property.monthlyInsurance ?? Number(DEFAULTS.insurance))}/month; HOA ${money(analysis.property.monthlyHoa ?? Number(DEFAULTS.hoa))}/month. Base repairs 8% and capital expenditure 5% of collected rent.`;
}

export function peggyBrief(draft: Draft, analysis: ReadyAnalysis, scenario: ScenarioId): string {
  return [
    `Help me understand this ${SCENARIO_NAMES[scenario]} Strategy Lab scenario. ${draft.illustrative ? 'Synthetic example, not a real submitted property.' : 'Visitor-entered inputs, unverified.'}`,
    `Property: ${JSON.stringify(draft.address || draft.city || 'Unnamed property')}. Basis ${money(analysis.property.purchasePrice)}; scope ${analysis.property.rehabBudget === undefined ? 'Unreported' : money(analysis.property.rehabBudget)}; exit value ${money(analysis.property.arvEstimate)}; rent ${money(analysis.property.marketRent)}/month.`,
    `Modeled acquisition loan: ${analysis.options.loanLtvPct}% LTV, ${analysis.options.loanRatePct}% interest, ${analysis.options.loanTermYears} years. Closing reserve ${analysis.options.closingReservePct}%. Cash required ${money(analysis.presentation.totalCashIn)}${analysis.missing.includes('scope') ? ', excluding unreported scope' : ''}.`,
    operatingBrief(analysis),
    analysis.presentation.memo.paragraph,
    `Evidence: title ${draft.titleStatus}; permits ${draft.permitStatus}; financing ${draft.financingStatus}; occupancy ${draft.occupancy}. Comparable data not supplied.`,
    `Next check: ${analysis.presentation.memo.nextStep}. Engine ${analysis.presentation.engineVersion}, generated ${analysis.presentation.generatedAt}.`,
    'Explain sensitive assumptions and missing evidence. This automated preliminary model is not a valuation, professional advice, financing offer or commitment.',
  ].join(' ').slice(0, 3900);
}

export function memoText(draft: Draft, analysis: ReadyAnalysis, scenario: ScenarioId, diligence: string[]): string {
  const snapshot = analysis.presentation;
  return [
    'Pegasus Dreamscapes | Strategy Lab decision brief',
    `${draft.address || draft.city || 'Unnamed property'} | ${SCENARIO_NAMES[scenario]} scenario`,
    draft.illustrative ? 'Illustrative example with synthetic inputs.' : 'Visitor-entered assumptions, unverified.',
    `Automated thesis: ${snapshot.memo.paragraph}`,
    `Acquisition basis: ${money(analysis.property.purchasePrice)}; scope: ${analysis.property.rehabBudget === undefined ? 'Unreported' : money(analysis.property.rehabBudget)}; entered exit value: ${money(analysis.property.arvEstimate)}; monthly rent: ${money(analysis.property.marketRent)}.`,
    `Modeled cash required: ${money(snapshot.totalCashIn)}${analysis.missing.includes('scope') ? ' (excludes unknown scope)' : ''}. Acquisition loan: ${analysis.options.loanLtvPct}% LTV, ${analysis.options.loanRatePct}% annual interest, ${analysis.options.loanTermYears} years; closing reserve ${analysis.options.closingReservePct}%.`,
    operatingBrief(analysis),
    ...snapshot.lanes.map((lane, index) => `${index + 1}. ${laneName(lane)}: ${lane.verdictLabel}; ${lane.economics.primaryMetric}: ${safeMetric(lane.economics.primaryValue)}`),
    `Sensitive assumptions: ${snapshot.lanes[0].confidence.sensitiveFactors.join('; ') || 'Independently validate scope, market values and financing.'}`,
    `Evidence: title ${draft.titleStatus}; permits ${draft.permitStatus}; financing ${draft.financingStatus}; occupancy ${draft.occupancy}. No comparable property dataset supplied.`,
    ...snapshot.risks.map(flag => `Risk (${flag.severity}): ${flag.title}. ${flag.detail}`),
    ...DILIGENCE.map(([id, label]) => `${diligence.includes(id) ? 'Visitor marked complete' : 'Unverified'}: ${label}`),
    `Next diligence step: ${snapshot.memo.nextStep}`,
    `Engine ${snapshot.engineVersion}; generated ${snapshot.generatedAt}.`,
    'Preliminary automated model, not a valuation, appraisal, professional advice, lending offer or commitment. Carrying this brief into intake does not guarantee review, response, routing, an offer or a timeline.',
  ].join('\n\n');
}

export function Memo({ draft, analysis, scenario, diligence, onCopy, onPrint, onIntake, onPeggy, onEdit }: { draft: Draft; analysis: Analysis; scenario: ScenarioId; diligence: string[]; onCopy: (text: string) => void; onPrint: () => void; onIntake: () => void; onPeggy: () => void; onEdit: () => void }) {
  if (analysis.status !== 'ready') return <Unavailable analysis={analysis} onEdit={onEdit} />;
  const snapshot = analysis.presentation;
  return <><div className="id-actions id-memo-actions"><button type="button" className="id-button" onClick={() => onCopy(memoText(draft, analysis, scenario, diligence))}><Copy aria-hidden="true" />Copy summary</button><button type="button" className="id-button" onClick={onPrint}><Printer aria-hidden="true" />Print / Save as PDF</button><button type="button" className="id-button" onClick={onPeggy}><MessageCircle aria-hidden="true" />Discuss with Peggy</button><button type="button" className="id-button is-primary" onClick={onIntake}>Carry this brief into intake <ArrowRight aria-hidden="true" /></button></div><section className="id-memo" aria-label="Decision brief"><header><p>Pegasus Dreamscapes / Strategy Lab</p><h2>{draft.address || draft.city || 'Property decision brief'}</h2><p>{SCENARIO_NAMES[scenario]} scenario · {draft.illustrative ? 'Synthetic example' : 'Visitor-entered assumptions'}</p></header><h3>Automated thesis</h3><p>{snapshot.memo.paragraph}</p><h3>Key economics</h3><dl><div><dt>Acquisition basis</dt><dd>{money(analysis.property.purchasePrice)}</dd></div><div><dt>Scope budget</dt><dd>{analysis.property.rehabBudget === undefined ? 'Unreported' : money(analysis.property.rehabBudget)}</dd></div><div><dt>Entered exit value</dt><dd>{money(analysis.property.arvEstimate)}</dd></div><div><dt>Entered monthly rent</dt><dd>{money(analysis.property.marketRent)}</dd></div><div><dt>Modeled cash required</dt><dd>{money(snapshot.totalCashIn)}</dd></div></dl><p className="id-caption">Acquisition loan: {analysis.options.loanLtvPct}% LTV · {analysis.options.loanRatePct}% annual interest · {analysis.options.loanTermYears} years. Closing reserve: {analysis.options.closingReservePct}% of basis. {analysis.missing.includes('scope') && 'The scope budget is unknown and excluded from funding.'}</p><p className="id-caption">{operatingBrief(analysis)}</p><h3>Ranked paths</h3><ol>{snapshot.lanes.map(lane => <li key={lane.lane}><strong>{laneName(lane)}</strong> · {lane.verdictLabel}<br /><span>{lane.economics.primaryMetric}: {safeMetric(lane.economics.primaryValue)}</span></li>)}</ol><h3>Sensitive assumptions</h3><p>{snapshot.lanes[0].confidence.sensitiveFactors.join(' ') || 'Validate scope, market value, financing and exit evidence independently.'}</p><h3>Risks and critical unknowns</h3><p>Title: {draft.titleStatus}. Permits: {draft.permitStatus}. Financing: {draft.financingStatus}. Occupancy: {draft.occupancy}. Comparable property evidence has not been supplied.</p><ul>{snapshot.risks.map(flag => <li key={flag.id}><strong>{flag.title}</strong> ({flag.severity}). {flag.detail}</li>)}</ul><h3>Diligence record</h3><ul>{DILIGENCE.map(([id, label]) => <li key={id}>{diligence.includes(id) ? 'Visitor marked complete' : 'Unverified'}: {label}</li>)}</ul><h3>Next diligence step</h3><p>{snapshot.memo.nextStep}</p><p className="id-caption id-rule">Engine {snapshot.engineVersion} · Generated {new Date(snapshot.generatedAt).toLocaleString()}. Preliminary automated model. Not a valuation, appraisal, professional advice, lending offer or commitment. Intake does not guarantee review, response, routing, an offer or a timeline.</p></section></>;
}
