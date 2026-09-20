import React from 'react';
import { Copy, Printer, ArrowRight, MessageCircle } from 'lucide-react';
import { laneName, money, safeMetric, type Analysis, type ReadyAnalysis } from './model';
import { SCENARIO_NAMES, DEFAULTS, type Draft, type ScenarioId } from './state';
import { DILIGENCE } from './Risk';
import { Unavailable } from './Overview';
import { nextReadText, metricExplanation } from './read-guidance';

const RENTAL_FLAGS = new Set(['dscr-worst-fail', 'cash-flow-negative', 'dscr-base-thin', 'rent-yield-low', 'rental-income-unavailable']);
const BOUNDARY = 'Preliminary automated model, not a valuation, appraisal, professional advice, lending offer or commitment. Intake does not guarantee review, response, routing, an offer or a timeline.';
function operatingBrief(analysis: ReadyAnalysis): string {
  return `Vacancy ${analysis.options.vacancyPctBase}%; management ${analysis.options.managementPct}%; property tax ${analysis.property.monthlyTaxAnnualPct ?? DEFAULTS.taxRate}% annually; insurance ${money(analysis.property.monthlyInsurance ?? Number(DEFAULTS.insurance))}/month; homeowners association fees ${money(analysis.property.monthlyHoa ?? Number(DEFAULTS.hoa))}/month. Base repairs 8% and capital expenditure 5% of collected rent.`;
}
function finding(analysis: ReadyAnalysis): string {
  const top = analysis.presentation.lanes[0];
  return `${laneName(top)} ranks first for the entered assumptions. ${safeMetric(top.economics.primaryValue) === 'Unavailable' ? 'Its economics are incomplete; resolve the missing inputs before relying on this comparison.' : `${top.verdictLabel}. ${metricExplanation(analysis, top)}`}`;
}
function evidenceBrief(draft: Draft): string {
  return `Title: ${draft.titleStatus}. Permits: ${draft.permitStatus}. Financing: ${draft.financingStatus}. Occupancy: ${draft.occupancy}. These reports have not been independently verified.`;
}
function criticalUnknowns(draft: Draft, analysis: ReadyAnalysis): string[] {
  const rentalFlags = analysis.presentation.risks.filter(flag => RENTAL_FLAGS.has(flag.id));
  return [
    ...(analysis.missing.includes('scope') ? ['Scope is unreported and excluded from cash required.'] : []),
    'Comparable property evidence has not been supplied to support the entered exit value or rent.',
    evidenceBrief(draft),
    ...analysis.presentation.risks.filter(flag => !RENTAL_FLAGS.has(flag.id) && flag.severity === 'high').map(flag => flag.id === 'arv-thin' ? 'The purchase basis and scope use more than 85% of the entered exit value. That leaves limited room for other costs or a lower sale price.' : `${flag.title}. ${flag.detail}`),
    ...(rentalFlags.length ? [`Rental checks: ${analysis.rentalMetrics.monthlyCashFlow !== undefined && analysis.rentalMetrics.monthlyCashFlow < 0 ? `modeled cash flow is ${money(analysis.rentalMetrics.monthlyCashFlow)}/month. ` : ''}${rentalFlags.length} operating or debt-coverage flags need review. Full details are in the appendix.`] : []),
  ];
}
function financingBrief(analysis: ReadyAnalysis): string {
  return `Acquisition loan: ${analysis.options.loanLtvPct}% of purchase basis, ${analysis.options.loanRatePct}% annual interest, ${analysis.options.loanTermYears} years. Closing reserve: ${analysis.options.closingReservePct}% of basis.`;
}

export function peggyBrief(draft: Draft, analysis: ReadyAnalysis, scenario: ScenarioId): string {
  return [
    `Help me understand this ${SCENARIO_NAMES[scenario]} Strategy Lab scenario. ${draft.illustrative ? 'Synthetic example, not a real submitted property.' : 'Visitor-entered inputs, unverified.'}`,
    `Property: ${JSON.stringify(draft.address || draft.city || 'Unnamed property')}. Basis ${money(analysis.property.purchasePrice)}; scope ${analysis.property.rehabBudget === undefined ? 'Unreported' : money(analysis.property.rehabBudget)}; exit value ${money(analysis.property.arvEstimate)}; rent ${money(analysis.property.marketRent)}/month.`,
    finding(analysis),
    `Cash required ${money(analysis.presentation.totalCashIn)}${analysis.missing.includes('scope') ? ', excluding unreported scope' : ''}. ${financingBrief(analysis)}`,
    operatingBrief(analysis),
    ...criticalUnknowns(draft, analysis),
    `Next check: ${nextReadText(draft, analysis)} Engine ${analysis.presentation.engineVersion}, generated ${analysis.presentation.generatedAt}.`,
    'Explain sensitive assumptions and missing evidence. This automated preliminary model is not a valuation, professional advice, financing offer or commitment.',
  ].join(' ').slice(0, 3900);
}

export function memoText(draft: Draft, analysis: ReadyAnalysis, scenario: ScenarioId, diligence: string[]): string {
  const snapshot = analysis.presentation;
  return [
    'Pegasus Dreamscapes | Strategy Lab decision brief',
    `${draft.address || draft.city || 'Unnamed property'} | ${SCENARIO_NAMES[scenario]} scenario`,
    draft.illustrative ? 'Illustrative example with synthetic inputs.' : 'Visitor-entered assumptions, unverified.',
    `What the model shows: ${finding(analysis)}`,
    `Key numbers: acquisition basis ${money(analysis.property.purchasePrice)}; scope ${analysis.property.rehabBudget === undefined ? 'Unreported' : money(analysis.property.rehabBudget)}; entered exit value ${money(analysis.property.arvEstimate)}; monthly rent ${money(analysis.property.marketRent)}; modeled cash required ${money(snapshot.totalCashIn)}${analysis.missing.includes('scope') ? ' (excludes unknown scope)' : ''}.`,
    `Critical unknowns:\n${criticalUnknowns(draft, analysis).map(text => `• ${text}`).join('\n')}`,
    `Next step: ${nextReadText(draft, analysis)}`,
    BOUNDARY,
    'APPENDIX | Assumptions, all paths and evidence checks',
    financingBrief(analysis), operatingBrief(analysis),
    `Sensitive assumptions: ${snapshot.lanes[0].confidence.sensitiveFactors.join('; ') || 'Independently validate scope, market values and financing.'}`,
    ...snapshot.lanes.map((lane, index) => `${index + 1}. ${laneName(lane)}: ${lane.verdictLabel}; ${lane.economics.primaryMetric}: ${safeMetric(lane.economics.primaryValue)}`),
    'Terms: ARV = after-repair value; MAO = maximum allowable offer; LTV = loan-to-value; DSCR = debt-service coverage ratio, operating income divided by debt payments.',
    ...snapshot.risks.map(flag => `${RENTAL_FLAGS.has(flag.id) ? 'Rental' : 'Property'} check (${flag.severity}): ${flag.title}. ${flag.detail}`),
    ...DILIGENCE.map(([id, label]) => `${diligence.includes(id) ? 'Visitor marked complete' : 'Unverified'}: ${label}`),
    `Engine ${snapshot.engineVersion}; generated ${snapshot.generatedAt}.`,
  ].join('\n\n');
}

export function Memo({ draft, analysis, scenario, diligence, onCopy, onPrint, onIntake, onPeggy, onEdit }: { draft: Draft; analysis: Analysis; scenario: ScenarioId; diligence: string[]; onCopy: (text: string) => void; onPrint: () => void; onIntake: () => void; onPeggy: () => void; onEdit: () => void }) {
  const appendix = React.useRef<HTMLDetailsElement>(null);
  const wasOpen = React.useRef(false);
  React.useEffect(() => {
    const before = () => { if (appendix.current) { wasOpen.current = appendix.current.open; appendix.current.open = true; } };
    const after = () => { if (appendix.current) appendix.current.open = wasOpen.current; };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => { window.removeEventListener('beforeprint', before); window.removeEventListener('afterprint', after); };
  }, []);
  if (analysis.status !== 'ready') return <Unavailable analysis={analysis} onEdit={onEdit} />;
  const snapshot = analysis.presentation;
  return <>
    <section className="id-memo" aria-label="Decision brief">
      <header><p>Pegasus Dreamscapes / Strategy Lab</p><h2>{draft.address || draft.city || 'Property decision brief'}</h2><p>{SCENARIO_NAMES[scenario]} scenario · {draft.illustrative ? 'Synthetic example' : 'Visitor-entered assumptions'}</p></header>
      <div className="id-memo-summary">
        <h3>What the model shows</h3><p className="id-memo-finding">{finding(analysis)}</p>
        <h3>Key numbers</h3><dl className="id-memo-numbers"><div><dt>Acquisition basis</dt><dd>{money(analysis.property.purchasePrice)}</dd></div><div><dt>Scope budget</dt><dd>{analysis.property.rehabBudget === undefined ? 'Unreported' : money(analysis.property.rehabBudget)}</dd></div><div><dt>Entered exit value</dt><dd>{money(analysis.property.arvEstimate)}</dd></div><div><dt>Entered monthly rent</dt><dd>{money(analysis.property.marketRent)}</dd></div><div><dt>Modeled cash required</dt><dd>{money(snapshot.totalCashIn)}{analysis.missing.includes('scope') && <small>Excludes unreported scope</small>}</dd></div></dl>
        <h3>Critical unknowns</h3><ul>{criticalUnknowns(draft, analysis).map(text => <li key={text}>{text}</li>)}</ul>
        <div className="id-memo-next"><h3>Next step</h3><p>{nextReadText(draft, analysis)}</p></div>
        <p className="id-caption id-rule">{BOUNDARY}</p>
      </div>
      <div className="id-memo-handoff"><button type="button" className="id-button is-primary" onClick={onIntake}>Continue with this property <ArrowRight aria-hidden="true" /></button><p className="id-caption">Bring the property details, {SCENARIO_NAMES[scenario]} assumptions and model summary into intake. You can review them and give consent before submitting.</p></div>
      <details className="id-memo-appendix" ref={appendix}><summary>Appendix: assumptions, all paths and evidence</summary><div className="id-appendix-content">
        <h3>Model assumptions</h3><p>{financingBrief(analysis)}</p><p>{operatingBrief(analysis)}</p>
        <h3>Sensitive assumptions</h3><p>{snapshot.lanes[0].confidence.sensitiveFactors.join(' ') || 'Validate scope, market value, financing and exit evidence independently.'}</p>
        <h3>All nine paths</h3><ol>{snapshot.lanes.map(lane => <li key={lane.lane}><strong>{laneName(lane)}</strong> · {lane.verdictLabel}<br /><span>{lane.economics.primaryMetric}: {safeMetric(lane.economics.primaryValue)}</span></li>)}</ol>
        <p className="id-caption">ARV: after-repair value. MAO: maximum allowable offer. LTV: loan-to-value. DSCR: debt-service coverage ratio, operating income divided by debt payments.</p>
        {([{ title: 'Property checks', rental: false }, { title: 'Rental checks', rental: true }]).map(group => { const flags = snapshot.risks.filter(flag => RENTAL_FLAGS.has(flag.id) === group.rental); return flags.length > 0 ? <div key={group.title}><h3>{group.title}</h3><ul>{flags.map(flag => <li key={flag.id}><strong>{flag.title}</strong> ({flag.severity}). {flag.detail}</li>)}</ul></div> : null; })}
        <h3>Diligence record</h3><ul>{DILIGENCE.map(([id, label]) => <li key={id}>{diligence.includes(id) ? 'Visitor marked complete' : 'Unverified'}: {label}</li>)}</ul>
      </div></details>
      <p className="id-caption id-memo-provenance">Engine {snapshot.engineVersion} · Generated {new Date(snapshot.generatedAt).toLocaleString()}.</p>
    </section>
    <div className="id-actions id-memo-actions"><button type="button" className="id-button" onClick={() => onCopy(memoText(draft, analysis, scenario, diligence))}><Copy aria-hidden="true" />Copy summary</button><button type="button" className="id-button" onClick={onPrint}><Printer aria-hidden="true" />Print / Save as PDF</button><button type="button" className="id-text-button" onClick={onPeggy}><MessageCircle aria-hidden="true" />Discuss with Peggy</button><p className="id-caption">Copy and PDF include the appendix.</p></div>
  </>;
}
