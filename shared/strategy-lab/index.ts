/**
 * Strategy Lab — engine entry point.
 *
 * Single function: `runStrategyLab(input)` takes a property + comp set
 * and returns the full Snapshot payload. Pure, framework-agnostic, fully
 * unit-testable. UI in Tasks B/C/D consumes this output directly.
 */

import { monthlyPayment } from "../lib/calculator-math";
import { buildCompBand } from "./comps";
import { composeDecisionMemo } from "./decision-memo";
import { scoreAllLanes, type LaneCtx } from "./lanes";
import { inferRisks } from "./risks";
import { buildReverseSolvers } from "./reverse-solver";
import { buildAllScenarios } from "./scenarios";
import { buildBreakevens, buildSensitivityGrid } from "./sensitivity";
import {
  ENGINE_VERSION,
  type CapitalStackEntry,
  type CompEntry,
  type PropertyInput,
  type StrategyLane,
  type StrategySnapshot,
} from "./types";

export interface RunOptions {
  comps?: CompEntry[];
  /** Loan terms for hold underwriting. Defaults to 75% LTV / 7.5% / 30y. */
  loanLtvPct?: number;
  loanRatePct?: number;
  loanTermYears?: number;
  /** Property-management overhead, default 8% of collected rent. */
  managementPct?: number;
  /**
   * Override the closing-reserve % of price (default 3%). Surfaced so
   * Quick Read users can adjust the hidden assumption inline.
   */
  closingReservePct?: number;
  /**
   * Override Base-scenario vacancy %. Stressed/Worst stay at +2pp / +4pp
   * relative to the chosen Base.
   */
  vacancyPctBase?: number;
  /** Override the engine clock (for tests + reproducible snapshots). */
  now?: Date;
}

export function runStrategyLab(
  property: PropertyInput,
  opts: RunOptions = {},
): StrategySnapshot {
  const comps = opts.comps ?? [];
  const ltvPct = opts.loanLtvPct ?? 75;
  const ratePct = opts.loanRatePct ?? 7.5;
  const termYears = opts.loanTermYears ?? 30;
  const managementPct = opts.managementPct ?? 8;
  const closingReservePct = opts.closingReservePct ?? 3;

  // ── Comp bands ────────────────────────────────────────────────────────
  // Pass subject beds/baths so the comp band applies bed (±5%/unit) and
  // bath (±3%/unit) deltas in addition to condition + distance taper.
  const arvBand = buildCompBand(comps, "sale", property.sqft ?? 0, property);
  const rentBand = buildCompBand(comps, "rent", property.sqft ?? 0, property);

  // ── Resolve effective inputs (user value or comp-derived). ────────────
  const arv = property.arvEstimate && property.arvEstimate > 0
    ? property.arvEstimate
    : arvBand?.impliedMedian ?? 0;
  const rent = property.marketRent && property.marketRent > 0
    ? property.marketRent
    : rentBand?.impliedMedian ?? 0;
  const rehab = property.rehabBudget ?? 0;

  // ── Capital stack + financing ─────────────────────────────────────────
  // Use the active purchase price when present (e.g. negotiated offer); fall
  // back to asking price. Keeps cash-in math honest when buyer is paying less
  // (or more) than list.
  const effectivePrice = property.purchasePrice ?? property.askingPrice;
  const downPayment = effectivePrice * (1 - ltvPct / 100);
  const loanAmount = effectivePrice - downPayment;
  const closingReserve = effectivePrice * (closingReservePct / 100);
  const totalCashIn = downPayment + rehab + closingReserve;

  const capitalStack: CapitalStackEntry[] = [
    { source: "down_payment", label: "Down payment", amount: downPayment, ratePct: 0 },
    { source: "rehab_cash", label: "Rehab capital", amount: rehab, ratePct: 0 },
    {
      source: "conventional",
      label: "Acquisition loan",
      amount: loanAmount,
      ratePct,
      termDays: termYears * 365,
    },
    { source: "closing_reserve", label: "Closing + reserve", amount: closingReserve, ratePct: 0 },
  ];

  // ── Scenarios ─────────────────────────────────────────────────────────
  const scenarios = buildAllScenarios({
    property,
    monthlyRent: rent,
    totalCashIn,
    loanAmount,
    ratePct,
    termYears,
    managementPct,
    vacancyPctBase: opts.vacancyPctBase,
  });

  // ── Lane scoring ──────────────────────────────────────────────────────
  const laneCtx: LaneCtx = {
    property,
    effectivePrice,
    rent,
    rehab,
    arv,
    base: scenarios.base,
    stressed: scenarios.stressed,
    worst: scenarios.worst,
    totalCashIn,
    loanAmount,
    ratePct,
    termYears,
  };
  const lanes = scoreAllLanes(laneCtx);
  const topLane = lanes[0]?.lane ?? ("rental_hold" as StrategyLane);

  // ── Risks ─────────────────────────────────────────────────────────────
  const risks = inferRisks({
    property,
    rehab,
    arv,
    rent,
    base: scenarios.base,
    worst: scenarios.worst,
  });
  const topRisk = risks
    .slice()
    .sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity))[0];

  // ── Sensitivity + breakevens for the top 2 ranked lanes. ──────────────
  const monthlyOpex = scenarios.base.operatingExpenses / 12;
  const sensitivities = lanes
    .filter((l) => l.verdict !== "needs_more_data")
    .slice(0, 2)
    .map((l) =>
      buildSensitivityGrid({
        lane: l.lane,
        property,
        rent,
        rehab,
        arv,
        loanAmount,
        ratePct,
        termYears,
        monthlyOpex,
        base: scenarios.base,
      }),
    );
  const breakevens = buildBreakevens({
    lane: topLane,
    property,
    rent,
    rehab,
    arv,
    loanAmount,
    ratePct,
    termYears,
    monthlyOpex,
    base: scenarios.base,
  });

  // ── Reverse solvers for failing lanes. ────────────────────────────────
  const reverseSolvers = buildReverseSolvers(laneCtx, lanes);

  // ── Decision Memo. ────────────────────────────────────────────────────
  const memo = composeDecisionMemo({
    property,
    topLane: lanes[0],
    base: scenarios.base,
    worst: scenarios.worst,
    topRisk,
    arvBand,
    rentBand,
    arvUserValue: property.arvEstimate,
    rentUserValue: property.marketRent,
  });

  return {
    engineVersion: ENGINE_VERSION,
    generatedAt: (opts.now ?? new Date()).toISOString(),
    property,
    compsUsed: comps,
    arvBand: arvBand ?? undefined,
    rentBand: rentBand ?? undefined,
    topLane,
    lanes,
    scenarios,
    sensitivities,
    breakevens,
    reverseSolvers,
    capitalStack,
    totalCashIn,
    risks,
    memo,
  };
}

function severityWeight(s: "info" | "watch" | "high" | "blocker"): number {
  return { info: 1, watch: 2, high: 3, blocker: 4 }[s];
}

// Re-export the major types so consumers import from one place.
export type {
  StrategySnapshot,
  PropertyInput,
  CompEntry,
  LaneFitResult,
  RiskFlag,
  ScenarioRun,
  StrategyLane,
  SubmitterRole,
  ConditionRating,
  SensitivityGrid,
  DecisionMemo,
  ReverseSolverStep,
  CompBand,
  LaneConfidence,
  LaneEconomics,
} from "./types";
export { STRATEGY_LANES, LANE_LABELS, LANE_VERDICT_LABELS, ENGINE_VERSION } from "./types";
// Pre-emptively export helpers consumers might want.
export { runStrategyLab as runStrategyLabEngine };

// Reverse-export utilities that the UI tasks (B/C/D) will consume.
export {
  buildStrategyLabInputs,
  effectiveLtvPct,
  effectiveRatePct,
  inferFinancingCommitted,
  frameDecisionMemo,
} from "./ui-adapter";
export type {
  LabFinancingType,
  LabRehabSource,
  LabDealStatus,
  LabSubmitterRole,
  StrategyLabEngineInputs,
  StrategyLabAdapterInput,
} from "./ui-adapter";
export { buildCompBand, isCompOverride } from "./comps";
export { composeDecisionMemo } from "./decision-memo";
export { scoreAllLanes } from "./lanes";
export { inferRisks } from "./risks";
export { buildAllScenarios } from "./scenarios";
export { buildSensitivityGrid, buildBreakevens } from "./sensitivity";
export { fmtDollars, fmtPct, fmtMonthly, safeCopy } from "./voice";
