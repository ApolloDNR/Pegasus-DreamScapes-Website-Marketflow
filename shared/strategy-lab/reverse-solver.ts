/**
 * Strategy Lab — "what it would take" reverse solver.
 *
 * For lanes that fail base case, derives the minimum input adjustments
 * that flip the lane to passing. Returns ranked, plain-English statements
 * the UI can render directly. No new math primitives — composes the
 * lane scoring inputs.
 */

import type { LaneFitResult, ReverseSolverStep, ScenarioRun, StrategyLane } from "./types";
import type { LaneCtx } from "./lanes";
import { fmtDollars, fmtPct, safeCopy } from "./voice";

/**
 * Variable opex slice of the base scenario as a fraction of effective gross
 * income. Derived from the scenario delta constants (repairs + capex + mgmt
 * default 8% + 5% + 8% = 21%). Centralizes the assumption so the reverse
 * solver and the scenario engine cannot drift apart.
 */
function variableOpexFraction(base: ScenarioRun): number {
  const mgmtPct = 8; // default management overhead, mirrors scenarios.ts
  return (base.effectiveRepairsPct + base.effectiveCapexPct + mgmtPct) / 100;
}

export function buildReverseSolvers(
  c: LaneCtx,
  laneResults: LaneFitResult[],
): ReverseSolverStep[] {
  const out: ReverseSolverStep[] = [];
  for (const lane of laneResults) {
    if (lane.verdict === "strong" || lane.verdict === "possible") continue;
    if (lane.verdict === "needs_more_data") continue;
    const required = solveFor(lane.lane, c);
    if (required.length > 0) out.push({ lane: lane.lane, required });
  }
  return out;
}

function solveFor(lane: StrategyLane, c: LaneCtx): string[] {
  switch (lane) {
    case "flip":
    case "wholetail":
      return solveFlipLike(c);
    case "brrrr":
      return solveBrrrr(c);
    case "rental_hold":
      return solveRentalHold(c);
    case "wholesale":
      return solveWholesale(c);
    case "adu_development":
      return [
        safeCopy("Confirm zoning allows an ADU and lot dimensions support a second structure."),
        safeCopy("If zoning is fixed, this lane is not viable. Pursue flip, BRRRR, or rental hold instead."),
      ];
    case "jv":
      return [
        safeCopy("Strengthen the underlying flip or BRRRR economics first; partners back deals, not stories."),
      ];
    case "listing_referral":
      return [
        safeCopy("Address heavy condition with cosmetic refresh OR confirm a longer timeline to allow a retail listing."),
      ];
    case "ground_up":
      return [
        safeCopy("Confirm lot size, zoning, and density before underwriting a ground-up build."),
        safeCopy("Ground-up is a Phase-2+ pathway. If lot and zoning support it, route to a capital partner conversation."),
      ];
    default:
      return [];
  }
}

function solveFlipLike(c: LaneCtx): string[] {
  if (c.arv <= 0) return [safeCopy("Provide an After-Repair Value to evaluate flip economics.")];
  // Target: all-in ≤ 75% of ARV with $30k profit minimum.
  const targetAllIn = c.arv * 0.75;
  const priceCutNeeded = c.property.askingPrice + c.rehab - targetAllIn;
  const priceCutPct = priceCutNeeded > 0 ? priceCutNeeded / c.property.askingPrice : 0;
  const rehabCap = Math.max(0, targetAllIn - c.property.askingPrice);
  const arvLift = Math.max(0, (c.property.askingPrice + c.rehab) / 0.75 - c.arv);
  const out: string[] = [];
  if (priceCutNeeded > 0) {
    out.push(
      safeCopy(
        `Negotiate price down by ${fmtDollars(priceCutNeeded)} (about ${fmtPct(priceCutPct * 100, 1)}) to land at 75% of ARV.`,
      ),
    );
  }
  out.push(
    safeCopy(
      `OR cap rehab at ${fmtDollars(rehabCap)} (currently ${fmtDollars(c.rehab)}).`,
    ),
  );
  if (arvLift > 0) {
    out.push(
      safeCopy(
        `OR validate a higher ARV by ${fmtDollars(arvLift)} via a stronger comp set.`,
      ),
    );
  }
  return out;
}

function solveBrrrr(c: LaneCtx): string[] {
  const out: string[] = [];
  // Need all-in ≤ 75% of ARV AND DSCR ≥ 1.20.
  const targetAllIn = c.arv * 0.75;
  const overspend = c.property.askingPrice + c.rehab - targetAllIn;
  if (overspend > 0) {
    out.push(
      safeCopy(
        `Cut total in by ${fmtDollars(overspend)} (price reduction or rehab trim) so refi at 75% LTV recovers principal.`,
      ),
    );
  }
  if (c.base.dscr > 0 && c.base.dscr < 1.2 && c.rent > 0) {
    // Solve gross monthly rent G such that NOI = (G(1−vac) − G(1−vac)(repairs+capex+mgmt)
    // − fixedMonthly) × 12 ≥ 1.20 × annualDebtService. Rearranging in terms of G,
    // we recover the variable load fraction from the base scenario rather than
    // hand-coding it, so the math stays in lock-step with `buildScenario`.
    const fixedMonthly = (c.base.operatingExpenses / 12)
      - (c.base.effectiveGrossIncome / 12) * variableOpexFraction(c.base);
    const vacKeep = 1 - c.base.effectiveVacancyPct / 100;
    const variableKeep = 1 - variableOpexFraction(c.base);
    const denom = vacKeep * variableKeep;
    if (denom > 0) {
      const targetMonthlyNoi = (1.2 * c.base.annualDebtService) / 12 + fixedMonthly;
      const targetRent = targetMonthlyNoi / denom;
      if (Number.isFinite(targetRent) && targetRent > 0) {
        out.push(
          safeCopy(
            `Lift achievable rent to ${fmtDollars(targetRent)} per month so DSCR clears 1.20 (after vacancy, repairs, capex, and management).`,
          ),
        );
      }
    }
  }
  return out;
}

function solveRentalHold(c: LaneCtx): string[] {
  const out: string[] = [];
  if (c.base.annualCashFlow < 0 && c.rent > 0) {
    const monthlyDeficit = -c.base.annualCashFlow / 12;
    out.push(
      safeCopy(
        `Increase rent by ${fmtDollars(monthlyDeficit)} per month OR cut monthly opex by the same amount to break even.`,
      ),
    );
  }
  if (c.base.cashOnCashPct < 8 && c.totalCashIn > 0) {
    const targetAnnualCf = c.totalCashIn * 0.08;
    const lift = targetAnnualCf - c.base.annualCashFlow;
    if (lift > 0) {
      out.push(
        safeCopy(
          `For 8% cash-on-cash, annual cash flow must lift by ${fmtDollars(lift)}.`,
        ),
      );
    }
  }
  return out;
}

function solveWholesale(c: LaneCtx): string[] {
  const targetMao = c.arv * 0.7 - c.rehab;
  const overpaid = c.property.askingPrice - targetMao;
  if (overpaid <= 0) return [safeCopy("Spread already exists at 70% rule; revisit assumptions.")];
  return [
    safeCopy(
      `Negotiate seller down by ${fmtDollars(overpaid)} to leave room for a $10-15k assignment fee.`,
    ),
    safeCopy(
      "OR find a cash buyer willing to underwrite at 75% of ARV instead of 70%.",
    ),
  ];
}
