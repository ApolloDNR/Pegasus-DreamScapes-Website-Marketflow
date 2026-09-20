import { runStrategyLab, type PropertyInput, type RunOptions, type StrategySnapshot, type ConditionRating, type SubmitterRole, type LaneFitResult, type ScenarioRun } from '@shared/strategy-lab';
import { DEFAULTS, NUMERIC_FIELDS, type Draft, type NumericField } from './state';

type AnalysisCommon = { errors: Partial<Record<NumericField, string>>; missing: string[] };
export type ReadyAnalysis = AnalysisCommon & {
  status: 'ready'; property: PropertyInput; options: RunOptions; snapshot: StrategySnapshot;
  presentation: StrategySnapshot; rentalUnavailableReason?: string;
  rentalMetrics: { monthlyCashFlow?: number; dscr?: number; cashOnCash?: number; capRate?: number };
};
export type Analysis = ReadyAnalysis | (AnalysisCommon & { status: 'missing' | 'invalid'; snapshot?: undefined });

export function numericValue(key: NumericField, raw: string): { value?: number; error?: string } {
  if (!raw.trim()) return {};
  const cleaned = raw.replace(/[$,\s]/g, '');
  if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned)) return { error: 'Enter a number using digits only.' };
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return { error: 'Enter a finite number.' };
  if (value < 0) return { error: 'Use a value of zero or more.' };
  if (key === 'loanTerm' && (value < 1 || value > 50)) return { error: 'Use a loan term from 1 to 50 years.' };
  if (key === 'vacancy' && value > 50) return { error: 'The engine supports vacancy from 0 to 50%.' };
  if (['loanLtv', 'loanRate', 'management', 'closingReserve', 'taxRate'].includes(key) && value > 100) return { error: 'Use a percentage from 0 to 100.' };
  if (value > 100000000) return { error: 'Use a value of $100,000,000 or less.' };
  return { value };
}

export function analyzeDraft(state: Draft, now = new Date()): Analysis {
  const errors: AnalysisCommon['errors'] = {};
  const values: Partial<Record<NumericField, number>> = {};
  for (const key of NUMERIC_FIELDS) {
    const parsed = numericValue(key, state[key]);
    if (parsed.error) errors[key] = parsed.error;
    values[key] = parsed.value;
  }
  const missing = [
    ...(['address', 'scope', 'arv', 'marketRent'] as const).filter(key => !state[key].trim()),
    ...(state.titleStatus === 'Unreported' ? ['title'] : []),
    ...(state.permitStatus === 'Unreported' ? ['permits'] : []),
    ...(state.financingStatus === 'Unreported' ? ['financing'] : []),
    ...(state.occupancy === 'Unknown or needs review' ? ['occupancy'] : []),
  ];
  if (Object.keys(errors).length) return { status: 'invalid', errors, missing };
  if (!(values.acquisition && values.acquisition > 0) || !((values.arv ?? 0) > 0 || (values.marketRent ?? 0) > 0)) return { status: 'missing', errors, missing };
  const condition: Record<string, ConditionRating> = { Turnkey: 'turnkey', 'Light updates': 'light', 'Moderate renovation': 'moderate', 'Heavy renovation': 'heavy', 'Full reconstruction': 'gut' };
  const roles: Record<string, SubmitterRole> = { 'Property owner': 'owner_seller', 'Deal partner or wholesaler': 'wholesaler', 'Investor or buyer': 'investor_buyer', 'Agent or advisor': 'agent', 'Capital partner': 'capital_partner' };
  const occupancy: Record<string, PropertyInput['occupancyStatus']> = { Vacant: 'vacant', 'Owner occupied': 'owner_occupied', 'Tenant occupied': 'tenant_occupied' };
  const concern = (value: string) => value === 'Unreported' ? undefined : value === 'Concern reported';
  const property: PropertyInput = {
    address: state.address.trim() || undefined, city: state.city.trim() || undefined,
    askingPrice: values.acquisition, purchasePrice: values.acquisition,
    rehabBudget: values.scope, arvEstimate: values.arv, marketRent: values.marketRent,
    sqft: values.sqft, beds: values.beds, baths: values.baths,
    monthlyInsurance: values.insurance, monthlyHoa: values.hoa, monthlyTaxAnnualPct: values.taxRate,
    condition: condition[state.condition], occupancyStatus: occupancy[state.occupancy] ?? 'unknown',
    submitterRole: roles[state.submitterRole] ?? 'unknown',
    titleClouded: concern(state.titleStatus), permitConcerns: concern(state.permitStatus),
    financingCommitted: state.financingStatus === 'Unreported' ? undefined : state.financingStatus === 'Commitment reported',
    timelineDaysToClose: ({ 'Within 90 days': 90, 'Within 30 days': 30, 'Time-sensitive': 14 } as Record<string, number>)[state.timing],
    developmentPotential: state.situation.includes('Development') || state.propertyType.includes('Land'),
    dealStatus: ['Owner needs options', 'Inherited or estate property', 'Distressed or time-sensitive'].includes(state.situation) ? 'owner_submitted' : state.situation.includes('Contract') ? 'wholesale' : 'unknown',
  };
  const options: RunOptions = {
    loanLtvPct: values.loanLtv ?? Number(DEFAULTS.loanLtv), loanRatePct: values.loanRate ?? Number(DEFAULTS.loanRate),
    loanTermYears: values.loanTerm ?? Number(DEFAULTS.loanTerm), vacancyPctBase: values.vacancy ?? Number(DEFAULTS.vacancy),
    managementPct: values.management ?? Number(DEFAULTS.management), closingReservePct: values.closingReserve ?? Number(DEFAULTS.closingReserve),
  };
  const snapshot = runStrategyLab(property, { ...options, now });
  const rental = snapshot.scenarios.base;
  const hasRent = (values.marketRent ?? 0) > 0;
  const rentalAvailable = hasRent && rentalCaseAvailable(rental);
  const rentalUnavailableReason = hasRent && !rentalAvailable ? 'Rental operating expenses exceed collected rent. This engine cannot represent negative operating income; use the detailed cash-flow calculator.' : undefined;
  return { status: 'ready', errors, missing, property, options, snapshot, presentation: guardedPresentation(snapshot, property), rentalUnavailableReason, rentalMetrics: {
    monthlyCashFlow: rentalAvailable ? rental.annualCashFlow / 12 : undefined,
    dscr: rentalAvailable && rental.annualDebtService > 0 && Number.isFinite(rental.dscr) ? rental.dscr : undefined,
    cashOnCash: rentalAvailable && snapshot.totalCashIn > 0 && Number.isFinite(rental.cashOnCashPct) ? rental.cashOnCashPct : undefined,
    capRate: rentalAvailable ? rental.capRatePct : undefined,
  } };
}

// The canonical engine uses finite fallback values for some unreported inputs.
// Keep its result intact for equivalence tests; apply availability at every public output.
export function rentalCaseAvailable(run: ScenarioRun): boolean {
  return run.effectiveGrossIncome >= run.operatingExpenses;
}
function guardedPresentation(snapshot: StrategySnapshot, property: PropertyInput): StrategySnapshot {
  const reasons = new Map<string, string>();
  const lanes = snapshot.lanes.map(lane => {
    const required: string[] = [];
    if (property.rehabBudget === undefined) required.push('scope budget');
    if (lane.lane !== 'rental_hold' && !(property.arvEstimate && property.arvEstimate > 0)) required.push('positive exit value');
    if (['rental_hold', 'brrrr'].includes(lane.lane) && !(property.marketRent && property.marketRent > 0)) required.push('positive market rent');
    const rentalLimited = ['rental_hold', 'brrrr'].includes(lane.lane) && Object.values(snapshot.scenarios).some(run => !rentalCaseAvailable(run));
    const reason = required.length ? `Economics unavailable until you report ${required.join(' and ')}.` : rentalLimited ? 'Rental operating expenses exceed collected rent in at least one stress case. The engine cannot represent negative operating income; inspect the detailed cash-flow calculator.' : undefined;
    if (reason) reasons.set(lane.lane, reason);
    const metricValue = (label: string, value: string) => reason || (/cash.on.cash/i.test(label) && snapshot.totalCashIn <= 0) || (/DSCR|debt.*coverage/i.test(label) && snapshot.scenarios.base.annualDebtService <= 0) ? 'Unavailable' : safeMetric(value);
    const supportedNarrative = (text: string) => !((snapshot.totalCashIn <= 0 && /cash.on.cash/i.test(text)) || (snapshot.scenarios.base.annualDebtService <= 0 && /DSCR|debt.*coverage/i.test(text)));
    return { ...lane,
      confidence: { ...lane.confidence, supportingFactors: lane.confidence.supportingFactors.filter(supportedNarrative), sensitiveFactors: lane.confidence.sensitiveFactors.filter(supportedNarrative) },
      economics: { ...lane.economics, primaryValue: metricValue(lane.economics.primaryMetric, lane.economics.primaryValue), metrics: lane.economics.metrics.map(metric => ({ ...metric, value: metricValue(metric.label, metric.value) })) },
      ...(reason ? { headline: reason, confidence: { ...lane.confidence, supportingFactors: [], sensitiveFactors: [reason], missingInputs: [...lane.confidence.missingInputs, ...required] } } : {}),
    };
  });
  const topReason = reasons.get(snapshot.topLane);
  const undefinedRatioInMemo = (snapshot.totalCashIn <= 0 && /cash.on.cash/i.test(snapshot.memo.paragraph)) || (snapshot.scenarios.base.annualDebtService <= 0 && /DSCR|debt.*coverage/i.test(snapshot.memo.paragraph));
  return { ...snapshot, lanes, sensitivities: snapshot.sensitivities.filter(grid => !reasons.has(grid.lane)), memo: { ...snapshot.memo, ...(topReason || undefinedRatioInMemo ? { paragraph: `The current engine ranks ${laneName(lanes[0])} highest. ${topReason || 'Return or debt-coverage ratios are unavailable when their denominator is zero.'} This ranking is preliminary and does not establish a viable recommendation.` } : {}) } };
}

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export function money(value: number | undefined): string { return value !== undefined && Number.isFinite(value) ? USD.format(value) : 'Unavailable'; }
export function safeMetric(value: string | undefined): string { return value && !/NaN|Infinity|∞/.test(value) ? value : 'Unavailable'; }
export function laneName(lane: LaneFitResult | undefined): string { return lane?.lane === 'listing_referral' ? 'Listing referral' : lane?.laneLabel ?? 'Needs more data'; }
