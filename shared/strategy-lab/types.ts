/**
 * Strategy Lab — engine type contracts.
 *
 * Pure TypeScript. No React, no Express, no DB calls. Every value the
 * engine returns is a plain JSON-shaped object that can be serialized
 * straight into a Property Strategy Snapshot or a Pegasus Deal Blueprint.
 */

// ───────────────────────────────────────────────────────────────────────────
// Lanes — the 8 outcome routes the No-Lead-Dies doctrine sorts into.
// Locked taxonomy. Public copy elsewhere may rename labels but these
// machine identifiers are the engine's source of truth.
// ───────────────────────────────────────────────────────────────────────────

export const STRATEGY_LANES = [
  "flip",
  "wholetail",
  "brrrr",
  "rental_hold",
  "adu_development",
  "ground_up",
  "wholesale",
  "jv",
  "listing_referral",
] as const;

export type StrategyLane = (typeof STRATEGY_LANES)[number];

export const LANE_LABELS: Record<StrategyLane, string> = {
  flip: "Fix and Flip",
  wholetail: "Wholetail",
  brrrr: "BRRRR",
  rental_hold: "Rental Hold",
  adu_development: "ADU + Development",
  ground_up: "Ground Up Build",
  wholesale: "Wholesale Assignment",
  jv: "Joint Venture",
  listing_referral: "Listing or Operator Referral",
};

/**
 * Three Pillars mapping — every lane is governed by one of the company's
 * three pillars (Development, Investments, Systems). Used by the UI to show
 * the pillar badge on each lane card.
 */
export type StrategyPillar = "D" | "I" | "S";

export const LANE_PILLARS: Record<StrategyLane, StrategyPillar> = {
  flip: "D",
  wholetail: "S",
  brrrr: "I",
  rental_hold: "I",
  adu_development: "D",
  ground_up: "D",
  wholesale: "S",
  jv: "I",
  listing_referral: "S",
};

export const PILLAR_LABELS: Record<StrategyPillar, string> = {
  D: "Development",
  I: "Investments",
  S: "Systems",
};

export type LaneFitVerdict =
  | "strong"
  | "possible"
  | "weak"
  | "needs_more_data"
  | "not_recommended";

export const LANE_VERDICT_LABELS: Record<LaneFitVerdict, string> = {
  strong: "Strong fit",
  possible: "Possible fit",
  weak: "Weak fit",
  needs_more_data: "Needs more data",
  not_recommended: "Not recommended",
};

// ───────────────────────────────────────────────────────────────────────────
// Property identity + scenario inputs.
// ───────────────────────────────────────────────────────────────────────────

export type ConditionRating = "turnkey" | "light" | "moderate" | "heavy" | "gut";
export type SubmitterRole =
  | "owner_seller"
  | "wholesaler"
  | "investor_buyer"
  | "agent"
  | "capital_partner"
  | "unknown";

export interface PropertyInput {
  /** Free-text address. Used only for display; engine does not geocode. */
  address?: string;
  city?: string;
  state?: string;
  zip?: string;

  /** Square footage of the existing structure. */
  sqft?: number;
  lotSqft?: number;
  beds?: number;
  baths?: number;
  yearBuilt?: number;

  /** Asking price (preferred) or confirmed purchase price. */
  askingPrice: number;
  /**
   * Active purchase price under consideration, if it differs from the
   * listed asking price (e.g. negotiated offer, all-in basis). When set,
   * the strategy engine uses this for cash-in math, capital stack, and
   * lane scoring instead of `askingPrice`. Asking price stays available
   * for spread comparisons.
   */
  purchasePrice?: number;
  /** Estimated as-is value if asking price is absent — flagged in memo. */
  asIsValueEstimate?: number;

  /** Engineer or contractor estimate. Engine derives a band if absent. */
  rehabBudget?: number;
  /** After-Repair Value the user believes is achievable. Engine cross-checks. */
  arvEstimate?: number;

  /** Market rent if held as rental. Engine uses comp band if absent. */
  marketRent?: number;
  /** Existing PITI / mortgage, used for distress and deficit calcs. */
  existingMortgageBalance?: number;
  monthlyHoa?: number;
  monthlyTaxAnnualPct?: number; // % of price/yr, default 1.1
  monthlyInsurance?: number;

  condition?: ConditionRating;
  /** Plain-English deferred maintenance / known issues. */
  knownIssues?: string[];

  /** True if title is encumbered (lien, lis pendens, probate, code violation). */
  titleClouded?: boolean;
  /** True if there are open or expired permits the engine should flag. */
  permitConcerns?: boolean;
  /** True if the user already has financing committed. */
  financingCommitted?: boolean;
  /** Days the user must close in. Drives wholesale + hard-money risk flags. */
  timelineDaysToClose?: number;

  /** Occupancy at acquisition — drives possession risk + flip/BRRRR timeline. */
  occupancyStatus?: "vacant" | "owner_occupied" | "tenant_occupied" | "unknown";
  /** Existing tenant lease months remaining, if known. */
  tenantLeaseMonthsRemaining?: number;

  /** ADU or development upside (lot-split, multi-unit). */
  developmentPotential?: boolean;
  zoningAllowsAdu?: boolean;

  /** Who is submitting this analysis — drives Decision Memo tone. */
  submitterRole?: SubmitterRole;

  /** Deal status (listed / off-market / wholesale / etc.). Drives the
   *  status-aware framing layered on top of the role tone in
   *  `frameDecisionMemo`. Inlined here (not imported from ui-adapter)
   *  to keep types.ts dependency-free. */
  dealStatus?:
    | "listed"
    | "off_market"
    | "pending"
    | "wholesale"
    | "pocket"
    | "owner_submitted"
    | "unknown";
}

export interface CompEntry {
  type: "sale" | "rent";
  address?: string;
  pricePerSqft: number;
  sqft?: number;
  beds?: number;
  baths?: number;
  distanceMiles?: number;
  conditionDelta?: -2 | -1 | 0 | 1 | 2; // worse..better than subject
  /** Optional weight for the median calc. Defaults to 1. */
  weight?: number;
}

export interface CompBand {
  /** $/sqft band. */
  low: number;
  median: number;
  high: number;
  /** Implied subject value/rent at the band's median, given subject sqft. */
  impliedLow: number;
  impliedMedian: number;
  impliedHigh: number;
  count: number;
  /** True if too few comps to trust (< 3). */
  thin: boolean;
}

// ───────────────────────────────────────────────────────────────────────────
// Risk register — auto-fired flags.
// ───────────────────────────────────────────────────────────────────────────

export type RiskCategory =
  | "title"
  | "permit"
  | "construction"
  | "valuation"
  | "financing"
  | "timeline"
  | "exit"
  | "occupancy"
  | "market";

export type RiskSeverity = "info" | "watch" | "high" | "blocker";

export interface RiskFlag {
  id: string;
  category: RiskCategory;
  severity: RiskSeverity;
  /** Plain-English label, voice-rule-safe. */
  title: string;
  /** One-line explanation including the trigger value. */
  detail: string;
  /** Lanes this flag is most relevant to (informational). */
  affects: StrategyLane[];
}

// ───────────────────────────────────────────────────────────────────────────
// Capital stack.
// ───────────────────────────────────────────────────────────────────────────

export type CapitalSource =
  | "down_payment"
  | "rehab_cash"
  | "hard_money"
  | "private_money"
  | "conventional"
  | "dscr_refi"
  | "seller_carry"
  | "jv_equity"
  | "closing_reserve";

export interface CapitalStackEntry {
  source: CapitalSource;
  label: string;
  amount: number;
  /** Annualized cost of capital, if applicable. */
  ratePct?: number;
  /** Days the capital is in play. */
  termDays?: number;
  /** Free-text note. */
  note?: string;
}

// ───────────────────────────────────────────────────────────────────────────
// Scenario engine outputs (Base / Stressed / Worst).
// ───────────────────────────────────────────────────────────────────────────

export type ScenarioLabel = "base" | "stressed" | "worst";

export const SCENARIO_LABELS: Record<ScenarioLabel, string> = {
  base: "Base case",
  stressed: "Stressed",
  worst: "Worst case",
};

export interface ScenarioRun {
  label: ScenarioLabel;
  /** Inputs after deltas applied — surfaced for transparency. */
  effectiveRent: number;
  effectiveVacancyPct: number;
  effectiveRepairsPct: number;
  effectiveCapexPct: number;
  effectiveTaxInsMult: number;
  effectiveHoaMult: number;
  /** Underwritten financials. */
  effectiveGrossIncome: number;
  operatingExpenses: number;
  noiAnnual: number;
  capRatePct: number;
  annualDebtService: number;
  annualCashFlow: number;
  cashOnCashPct: number;
  dscr: number;
}

// ───────────────────────────────────────────────────────────────────────────
// Sensitivity + breakeven.
// ───────────────────────────────────────────────────────────────────────────

export interface SensitivityAxis {
  label: string;
  unit: "currency" | "percent" | "dollar_per_sqft";
  values: number[];
}

export interface SensitivityGrid {
  /** Lane this grid is calibrated for. */
  lane: StrategyLane;
  xAxis: SensitivityAxis;
  yAxis: SensitivityAxis;
  /** Cells in row-major order, length = yAxis.values.length × xAxis.values.length. */
  cells: number[];
  /** Cell metric — "monthly_cash_flow" for rentals, "net_profit" for flips, etc. */
  metric: "monthly_cash_flow" | "net_profit" | "cash_left_in";
  /** True if the asking-price column / cell flips negative. */
  baseFails: boolean;
}

export interface BreakevenSet {
  breakevenRentMonthly?: number;
  breakevenPriceForCap5?: number;
  breakevenPriceForCap6?: number;
  breakevenMortgageRatePct?: number;
  breakevenRehabCap?: number;
  breakevenArvFloor?: number;
  breakevenHoldMonths?: number;
}

// ───────────────────────────────────────────────────────────────────────────
// Lane fit + transparent confidence.
// ───────────────────────────────────────────────────────────────────────────

export interface LaneConfidence {
  /** 0..100 — for sorting only. UI must surface the factor lists, not the bare number. */
  score: number;
  supportingFactors: string[];
  sensitiveFactors: string[];
  /** If verdict = needs_more_data, list what is missing. */
  missingInputs: string[];
}

export interface LaneEconomics {
  /** Headline number for the lane. */
  primaryMetric: string;
  primaryValue: string;
  /** Secondary metrics shown in the lane card. */
  metrics: { label: string; value: string }[];
}

export interface LaneFitResult {
  lane: StrategyLane;
  laneLabel: string;
  verdict: LaneFitVerdict;
  verdictLabel: string;
  /** Headline summary, ≤ 140 chars, voice-rule-safe. */
  headline: string;
  confidence: LaneConfidence;
  economics: LaneEconomics;
  /** Risks that primarily threaten this lane. */
  laneRisks: string[];
}

// ───────────────────────────────────────────────────────────────────────────
// Reverse solver — "what it would take".
// ───────────────────────────────────────────────────────────────────────────

export interface ReverseSolverStep {
  lane: StrategyLane;
  /** Ranked plain-English statements. */
  required: string[];
}

// ───────────────────────────────────────────────────────────────────────────
// Decision Memo.
// ───────────────────────────────────────────────────────────────────────────

export interface DecisionMemo {
  /** 3-4 sentence narrative paragraph. */
  paragraph: string;
  /** One-line recommended next step. */
  nextStep: string;
  /** True if the user's ARV/rent input is more than 15% off the comp band. */
  hasCompOverrideWarning: boolean;
}

// ───────────────────────────────────────────────────────────────────────────
// Snapshot payload — the full engine output.
// ───────────────────────────────────────────────────────────────────────────

export interface StrategySnapshot {
  /** Engine schema version. Bump on any breaking output change. */
  engineVersion: string;
  generatedAt: string; // ISO

  property: PropertyInput;
  /** Comp set the engine actually used (may include defaults). */
  compsUsed: CompEntry[];
  arvBand?: CompBand;
  rentBand?: CompBand;

  /** Top recommended lane. */
  topLane: StrategyLane;
  /** All 9 lanes, ranked. */
  lanes: LaneFitResult[];

  scenarios: Record<ScenarioLabel, ScenarioRun>;

  /** Per-lane sensitivity grid for the 2-3 most relevant lanes. */
  sensitivities: SensitivityGrid[];
  breakevens: BreakevenSet;
  reverseSolvers: ReverseSolverStep[];

  capitalStack: CapitalStackEntry[];
  totalCashIn: number;

  risks: RiskFlag[];
  memo: DecisionMemo;
}

export const ENGINE_VERSION = "1.0.0";
