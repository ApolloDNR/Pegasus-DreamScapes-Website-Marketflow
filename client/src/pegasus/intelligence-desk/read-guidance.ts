import type { LaneFitResult, StrategyLane } from '@shared/strategy-lab';
import { money, safeMetric, type ReadyAnalysis } from './model';
import type { Draft, DraftField } from './state';

export type ReadAction = { title: string; detail: string; label: string; field?: DraftField; evidence?: true };

// Explain the canonical lane calculations without changing their scores or outputs.
const METRIC_NOTES: Record<StrategyLane, string> = {
  flip: 'Exit value less purchase basis, scope and a 6% selling-cost allowance. Financing, holding and other project costs are excluded.',
  wholetail: 'Exit value less purchase basis, scope and a 7% selling-cost allowance. This is a modeled spread before financing, holding and other project costs.',
  brrrr: 'Purchase basis plus scope, less a modeled refinance at 75% of exit value, floored at zero. Fees and other project costs are excluded; refinance eligibility is unverified.',
  rental_hold: 'Collected rent less modeled operating expenses and acquisition debt payments, per month. A negative amount is a modeled monthly shortfall.',
  adu_development: 'An educational signal from the entered property context. Lot size, zoning and buildable area still need independent evidence.',
  ground_up: 'An educational readiness signal from lot and development assumptions. It does not establish a permitted or funded project.',
  wholesale: '70% of exit value, less scope and purchase basis. This is modeled room for an assignment fee before transaction costs, not an offered fee.',
  jv: 'Modeled acquisition equity, scope and closing/reserve allowance. Partner contributions, ownership splits and terms are not modeled.',
  listing_referral: 'Exit value less the investor purchase allowance, which is 70% of exit value minus scope. This gap is not additional sale proceeds.',
};

export function metricExplanation(analysis: ReadyAnalysis, lane: LaneFitResult): string {
  if (safeMetric(lane.economics.primaryValue) === 'Unavailable') return lane.headline;
  if (lane.lane === 'listing_referral') {
    const exit = analysis.property.arvEstimate!;
    const allowance = exit * 0.7 - analysis.property.rehabBudget!;
    return `${money(exit)} exit value less a ${money(allowance)} investor allowance (70% of exit value minus scope). This gap is not additional sale proceeds.`;
  }
  return METRIC_NOTES[lane.lane];
}

export function fitExplanation(lane: LaneFitResult): string {
  if (safeMetric(lane.economics.primaryValue) === 'Unavailable') return 'The engine can rank this path, but the missing evidence or model limit prevents a complete economic comparison.';
  if (lane.lane === 'listing_referral' && lane.confidence.supportingFactors.some(factor => factor.includes('70% rule MAO'))) {
    return 'The gap exceeds the model’s $30,000 comparison point, adding weight to a separate licensed listing discussion.';
  }
  return lane.confidence.supportingFactors[0] || lane.confidence.sensitiveFactors[0] || lane.headline;
}

export function nextReadAction(draft: Draft, analysis: ReadyAnalysis, lane: LaneFitResult): ReadAction {
  if (analysis.property.rehabBudget === undefined) return { title: 'Add the missing scope budget', detail: 'Scope is excluded from the current cash requirement. Enter a supported estimate, or zero only if no work is planned.', label: 'Add scope budget', field: 'scope' };
  if (lane.lane !== 'rental_hold' && !(analysis.property.arvEstimate! > 0)) return { title: 'Add an exit value', detail: 'This path needs an exit-value assumption before its economics can be shown. Start with comparable property evidence.', label: 'Add exit value', field: 'arv' };
  if (['rental_hold', 'brrrr'].includes(lane.lane) && !(analysis.property.marketRent! > 0)) return { title: 'Add a monthly rent estimate', detail: 'A supported rent assumption is needed to compare rental cash flow and debt coverage.', label: 'Add monthly rent', field: 'marketRent' };
  if (draft.titleStatus === 'Concern reported') return { title: 'Resolve the reported title concern', detail: 'Review ownership and title evidence before relying on a sale, assignment or financing path.', label: 'Review title evidence', field: 'titleStatus' };
  if (['adu_development', 'ground_up'].includes(lane.lane)) return { title: 'Establish lot and zoning evidence', detail: 'The desk cannot establish lot size or zoning eligibility from the available inputs. Use the diligence checklist to organize independent verification.', label: 'Open evidence checks', evidence: true };
  if (draft.permitStatus === 'Concern reported') return { title: 'Review the permit concern', detail: 'Confirm the permitted scope and unresolved records before treating the improvement plan as established.', label: 'Review permit evidence', field: 'permitStatus' };
  if (['rental_hold', 'brrrr'].includes(lane.lane)) {
    if (lane.economics.primaryValue === 'Unavailable') return { title: 'Review rental operating costs', detail: 'At least one stress case exceeds this engine’s operating-income range. Check rent, vacancy and expenses before relying on the comparison.', label: 'Review operating assumptions', field: 'vacancy' };
    return { title: 'Validate the rent assumption', detail: 'Compare the entered monthly rent with similar properties, then update the model to see the effect on cash flow.', label: 'Check monthly rent', field: 'marketRent' };
  }
  if (lane.lane === 'jv') return { title: 'Clarify the financing position', detail: 'The modeled cash need does not establish available funding. Record whether financing is committed before exploring participation terms.', label: 'Review financing evidence', field: 'financingStatus' };
  if (lane.lane === 'listing_referral' && draft.condition === 'Unknown or needs review') return { title: 'Clarify the property’s condition', detail: 'Condition affects this listing comparison. Record what is known before treating the entered exit value as achievable.', label: 'Review property condition', field: 'condition' };
  return { title: 'Validate the exit value', detail: 'Support the entered exit value with recent comparable sales. Update that assumption before relying on the modeled gap or spread.', label: 'Check exit value', field: 'arv' };
}

export function nextReadText(draft: Draft, analysis: ReadyAnalysis): string {
  const next = nextReadAction(draft, analysis, analysis.presentation.lanes[0]);
  return `${next.title}. ${next.detail}`;
}
