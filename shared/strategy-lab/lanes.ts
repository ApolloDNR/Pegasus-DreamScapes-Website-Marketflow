/**
 * Strategy Lab — 8-lane scoring engine.
 *
 * Each scorer takes the property + derived numbers (rent, ARV, rehab,
 * scenarios) and returns a verdict, a transparent confidence object,
 * and the lane's headline economics. Confidence is NOT a black box —
 * every score carries a `supportingFactors` array and a `sensitiveFactors`
 * array of plain-English strings that the UI surfaces.
 */

import { monthlyPayment } from "../lib/calculator-math";
import type {
  LaneFitResult,
  LaneFitVerdict,
  PropertyInput,
  ScenarioRun,
  StrategyLane,
} from "./types";
import { LANE_LABELS, LANE_VERDICT_LABELS } from "./types";
import { fmtDollars, fmtMonthly, fmtPct, safeCopy } from "./voice";

interface LaneCtx {
  property: PropertyInput;
  rent: number;
  rehab: number;
  arv: number;
  base: ScenarioRun;
  stressed: ScenarioRun;
  worst: ScenarioRun;
  totalCashIn: number;
  loanAmount: number;
  ratePct: number;
  termYears: number;
}

function pickVerdict(score: number, missing: string[]): LaneFitVerdict {
  if (missing.length > 0) return "needs_more_data";
  if (score >= 75) return "strong";
  if (score >= 55) return "possible";
  if (score >= 35) return "weak";
  return "not_recommended";
}

// ───────────────────────────────────────────────────────────────────────────
// Flip
// ───────────────────────────────────────────────────────────────────────────

function scoreFlip(c: LaneCtx): LaneFitResult {
  const supporting: string[] = [];
  const sensitive: string[] = [];
  const missing: string[] = [];
  let score = 50;

  if (c.arv <= 0) missing.push("After-Repair Value (ARV)");
  if (c.rehab <= 0) missing.push("Rehab budget");
  if (c.property.askingPrice <= 0) missing.push("Asking price");

  // 70% rule: max offer = ARV * 0.70 - rehab.
  const seventyMao = c.arv * 0.7 - c.rehab;
  const headroom = seventyMao - c.property.askingPrice;
  const arvAllInPct = c.arv > 0 ? (c.property.askingPrice + c.rehab) / c.arv : 1;

  if (headroom > 0) {
    score += 25;
    supporting.push(`Asking price is ${fmtDollars(headroom)} below the 70% rule MAO.`);
  } else if (c.arv > 0) {
    score -= 20;
    sensitive.push(`Asking price is ${fmtDollars(-headroom)} ABOVE the 70% rule MAO.`);
  }

  if (arvAllInPct > 0 && arvAllInPct <= 0.75) {
    score += 15;
    supporting.push(`All-in (purchase + rehab) is ${fmtPct(arvAllInPct * 100, 1)} of ARV — within the 75% sweet spot.`);
  } else if (arvAllInPct > 0.85) {
    score -= 25;
    sensitive.push(`All-in is ${fmtPct(arvAllInPct * 100, 1)} of ARV — margin is too thin for unexpected rehab overruns.`);
  }

  // Net profit estimate (after 6% closing).
  const closing = c.arv * 0.06;
  const netProfit = c.arv - c.property.askingPrice - c.rehab - closing;
  if (netProfit < 25000 && c.arv > 0) {
    score -= 10;
    sensitive.push(`Projected gross profit of ${fmtDollars(netProfit)} leaves no room for holding-cost surprises.`);
  } else if (netProfit >= 50000) {
    supporting.push(`Projected gross profit of ${fmtDollars(netProfit)} clears typical flip thresholds.`);
  }

  if (c.property.condition === "gut") {
    score -= 5;
    sensitive.push("Gut-level condition raises rehab variance.");
  }

  const verdict = pickVerdict(score, missing);
  return {
    lane: "flip",
    laneLabel: LANE_LABELS.flip,
    verdict,
    verdictLabel: LANE_VERDICT_LABELS[verdict],
    headline: safeCopy(
      verdict === "strong"
        ? `Solid flip math. Net ${fmtDollars(netProfit)} at base case.`
        : verdict === "not_recommended"
          ? `Margin too thin to flip. ${fmtPct(arvAllInPct * 100, 0)} all-in of ARV.`
          : `Flip is workable but tight. Watch rehab overruns.`,
    ),
    confidence: {
      score: Math.max(0, Math.min(100, score)),
      supportingFactors: supporting,
      sensitiveFactors: sensitive,
      missingInputs: missing,
    },
    economics: {
      primaryMetric: "Projected net profit",
      primaryValue: fmtDollars(netProfit),
      metrics: [
        { label: "All-in % of ARV", value: fmtPct(arvAllInPct * 100, 1) },
        { label: "70% rule MAO", value: fmtDollars(seventyMao) },
        { label: "Headroom vs asking", value: fmtDollars(headroom) },
      ],
    },
    laneRisks: ["arv-thin", "rehab-heavy", "condition-heavy"],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Wholetail
// ───────────────────────────────────────────────────────────────────────────

function scoreWholetail(c: LaneCtx): LaneFitResult {
  const supporting: string[] = [];
  const sensitive: string[] = [];
  const missing: string[] = [];
  let score = 40;

  if (c.arv <= 0) missing.push("After-Repair / retail comp value");

  const lightRehab = c.rehab > 0 && c.rehab <= 25000;
  const sellable = c.arv > c.property.askingPrice * 1.1;

  if (lightRehab) {
    score += 25;
    supporting.push(`Light rehab budget (${fmtDollars(c.rehab)}) suits a clean-and-list resale.`);
  } else if (c.rehab > 50000) {
    score -= 20;
    sensitive.push(`Rehab budget of ${fmtDollars(c.rehab)} is too heavy for a wholetail; consider a full flip.`);
  }
  if (sellable) {
    score += 20;
    supporting.push(`Retail value sits ${fmtDollars(c.arv - c.property.askingPrice)} over asking.`);
  } else if (c.arv > 0) {
    score -= 15;
    sensitive.push("Retail spread is below 10% — list price will not move retail.");
  }
  if (c.property.condition === "turnkey" || c.property.condition === "light") {
    score += 10;
    supporting.push("Turnkey / light condition allows a fast cosmetic refresh.");
  }

  const netProfit = c.arv - c.property.askingPrice - c.rehab - c.arv * 0.07;
  const verdict = pickVerdict(score, missing);
  return {
    lane: "wholetail",
    laneLabel: LANE_LABELS.wholetail,
    verdict,
    verdictLabel: LANE_VERDICT_LABELS[verdict],
    headline: safeCopy(
      verdict === "strong"
        ? `Clean cosmetic refresh, list retail. Net ${fmtDollars(netProfit)}.`
        : `Wholetail spread is thin; verify retail comps.`,
    ),
    confidence: {
      score: Math.max(0, Math.min(100, score)),
      supportingFactors: supporting,
      sensitiveFactors: sensitive,
      missingInputs: missing,
    },
    economics: {
      primaryMetric: "Net after light rehab",
      primaryValue: fmtDollars(netProfit),
      metrics: [
        { label: "Retail spread", value: fmtDollars(c.arv - c.property.askingPrice) },
        { label: "Rehab budget", value: fmtDollars(c.rehab) },
      ],
    },
    laneRisks: ["arv-thin", "condition-heavy"],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// BRRRR
// ───────────────────────────────────────────────────────────────────────────

function scoreBrrrr(c: LaneCtx): LaneFitResult {
  const supporting: string[] = [];
  const sensitive: string[] = [];
  const missing: string[] = [];
  let score = 50;

  if (c.arv <= 0) missing.push("After-Refi appraised value");
  if (c.rent <= 0) missing.push("Market rent");
  if (c.rehab < 0) missing.push("Rehab budget");

  const refiLtv = 0.75;
  const cashOut = c.arv * refiLtv;
  const totalIn = c.property.askingPrice + c.rehab;
  const cashLeft = Math.max(0, totalIn - cashOut);
  const arvAllInPct = c.arv > 0 ? totalIn / c.arv : 1;

  if (arvAllInPct <= 0.75) {
    score += 25;
    supporting.push(`All-in is ${fmtPct(arvAllInPct * 100, 1)} of ARV — full BRRRR refi clears.`);
  } else if (arvAllInPct <= 0.85) {
    score += 5;
    supporting.push(`All-in is ${fmtPct(arvAllInPct * 100, 1)} of ARV — partial BRRRR; expect cash left in.`);
  } else if (c.arv > 0) {
    score -= 25;
    sensitive.push(`All-in is ${fmtPct(arvAllInPct * 100, 1)} of ARV — refi will not clear principal.`);
  }

  if (c.base.dscr >= 1.25) {
    score += 15;
    supporting.push(`Base DSCR of ${c.base.dscr.toFixed(2)} clears the typical 1.20-1.25 lender floor.`);
  } else if (c.base.dscr > 0 && c.base.dscr < 1.0) {
    score -= 25;
    sensitive.push(`Base DSCR of ${c.base.dscr.toFixed(2)} fails refi qualification.`);
  }

  if (c.base.annualCashFlow > 0) {
    score += 10;
    supporting.push(`Post-refi cash flow is ${fmtDollars(c.base.annualCashFlow)} per year.`);
  } else if (c.rent > 0) {
    score -= 10;
    sensitive.push("Post-refi cash flow is negative at base case.");
  }

  const verdict = pickVerdict(score, missing);
  return {
    lane: "brrrr",
    laneLabel: LANE_LABELS.brrrr,
    verdict,
    verdictLabel: LANE_VERDICT_LABELS[verdict],
    headline: safeCopy(
      verdict === "strong"
        ? `Strong BRRRR. ${fmtDollars(cashLeft)} left in after refi.`
        : verdict === "not_recommended"
          ? "BRRRR fails — refi will not clear and DSCR misses lender floor."
          : `BRRRR works with ${fmtDollars(cashLeft)} left in. Watch DSCR.`,
    ),
    confidence: {
      score: Math.max(0, Math.min(100, score)),
      supportingFactors: supporting,
      sensitiveFactors: sensitive,
      missingInputs: missing,
    },
    economics: {
      primaryMetric: "Cash left in after refi",
      primaryValue: fmtDollars(cashLeft),
      metrics: [
        { label: "Refi cash-out @ 75% LTV", value: fmtDollars(cashOut) },
        { label: "All-in % of ARV", value: fmtPct(arvAllInPct * 100, 1) },
        { label: "Base DSCR", value: c.base.dscr.toFixed(2) },
        { label: "Annual cash flow", value: fmtDollars(c.base.annualCashFlow) },
      ],
    },
    laneRisks: ["arv-thin", "dscr-base-thin", "dscr-worst-fail"],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Rental Hold
// ───────────────────────────────────────────────────────────────────────────

function scoreRentalHold(c: LaneCtx): LaneFitResult {
  const supporting: string[] = [];
  const sensitive: string[] = [];
  const missing: string[] = [];
  let score = 50;

  if (c.rent <= 0) missing.push("Market rent");
  if (c.property.askingPrice <= 0) missing.push("Asking price");

  const onePctRatio = c.property.askingPrice > 0 ? c.rent / c.property.askingPrice : 0;

  if (c.base.capRatePct >= 6) {
    score += 20;
    supporting.push(`Base cap rate of ${fmtPct(c.base.capRatePct, 2)} clears solid cash-flow territory.`);
  } else if (c.base.capRatePct < 4) {
    score -= 15;
    sensitive.push(`Base cap rate of ${fmtPct(c.base.capRatePct, 2)} suggests appreciation play, not cash flow.`);
  }
  if (c.base.cashOnCashPct >= 8) {
    score += 15;
    supporting.push(`Cash-on-cash of ${fmtPct(c.base.cashOnCashPct, 1)} clears the 8% threshold.`);
  } else if (c.base.cashOnCashPct < 4 && c.base.cashOnCashPct > 0) {
    score -= 10;
    sensitive.push(`Cash-on-cash of ${fmtPct(c.base.cashOnCashPct, 1)} underperforms passive index alternatives.`);
  }
  if (c.worst.annualCashFlow >= 0) {
    score += 10;
    supporting.push("Survives worst case — cash flow stays non-negative under stress.");
  } else if (c.worst.annualCashFlow < 0) {
    score -= 15;
    sensitive.push(`Worst case loses ${fmtDollars(-c.worst.annualCashFlow)} per year.`);
  }
  if (onePctRatio < 0.005 && onePctRatio > 0) {
    score -= 10;
    sensitive.push("Rent is well below 0.5% of price — coastal-style appreciation bet.");
  }

  const verdict = pickVerdict(score, missing);
  return {
    lane: "rental_hold",
    laneLabel: LANE_LABELS.rental_hold,
    verdict,
    verdictLabel: LANE_VERDICT_LABELS[verdict],
    headline: safeCopy(
      verdict === "strong"
        ? `Quality long-term hold. ${fmtMonthly(c.base.annualCashFlow / 12)} cash flow.`
        : verdict === "not_recommended"
          ? "Rental hold loses money at base case. Path requires structural change."
          : `Rental hold works on appreciation, not yield.`,
    ),
    confidence: {
      score: Math.max(0, Math.min(100, score)),
      supportingFactors: supporting,
      sensitiveFactors: sensitive,
      missingInputs: missing,
    },
    economics: {
      primaryMetric: "Monthly cash flow",
      primaryValue: fmtMonthly(c.base.annualCashFlow / 12),
      metrics: [
        { label: "Base cap rate", value: fmtPct(c.base.capRatePct, 2) },
        { label: "Cash-on-cash", value: fmtPct(c.base.cashOnCashPct, 1) },
        { label: "Worst case cash flow", value: fmtDollars(c.worst.annualCashFlow) },
      ],
    },
    laneRisks: ["cash-flow-negative", "rent-yield-low", "dscr-worst-fail"],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// ADU + Development
// ───────────────────────────────────────────────────────────────────────────

function scoreAduDevelopment(c: LaneCtx): LaneFitResult {
  const supporting: string[] = [];
  const sensitive: string[] = [];
  const missing: string[] = [];
  let score = 35;

  if (c.property.developmentPotential === undefined && c.property.zoningAllowsAdu === undefined) {
    missing.push("Lot zoning + ADU eligibility");
  }
  if (c.property.lotSqft === undefined || c.property.lotSqft <= 0) {
    missing.push("Lot square footage");
  }

  if (c.property.zoningAllowsAdu) {
    score += 25;
    supporting.push("Zoning allows an ADU — additional unit increases income or resale.");
  }
  if (c.property.developmentPotential) {
    score += 20;
    supporting.push("Lot supports further development (split, multi-unit, or addition).");
  }
  if ((c.property.lotSqft ?? 0) >= 6000) {
    score += 5;
    supporting.push(`Lot is ${(c.property.lotSqft ?? 0).toLocaleString()} sqft — room to build.`);
  }
  if (!c.property.zoningAllowsAdu && !c.property.developmentPotential) {
    score -= 10;
    sensitive.push("No development upside flagged. Standard exit lanes only.");
  }

  const verdict = pickVerdict(score, missing);
  return {
    lane: "adu_development",
    laneLabel: LANE_LABELS.adu_development,
    verdict,
    verdictLabel: LANE_VERDICT_LABELS[verdict],
    headline: safeCopy(
      verdict === "strong"
        ? "Clear ADU or development upside. Path adds a second income stream."
        : verdict === "needs_more_data"
          ? "Confirm zoning and lot size to evaluate ADU or development upside."
          : "No meaningful ADU or development upside detected.",
    ),
    confidence: {
      score: Math.max(0, Math.min(100, score)),
      supportingFactors: supporting,
      sensitiveFactors: sensitive,
      missingInputs: missing,
    },
    economics: {
      primaryMetric: "Development upside",
      primaryValue: c.property.zoningAllowsAdu ? "ADU eligible" : "Verify zoning",
      metrics: [
        { label: "Lot sqft", value: (c.property.lotSqft ?? 0).toLocaleString() },
        { label: "ADU zoning", value: c.property.zoningAllowsAdu ? "Yes" : "Unknown" },
      ],
    },
    laneRisks: ["permit-concerns"],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Wholesale Assignment
// ───────────────────────────────────────────────────────────────────────────

function scoreWholesale(c: LaneCtx): LaneFitResult {
  const supporting: string[] = [];
  const sensitive: string[] = [];
  const missing: string[] = [];
  let score = 40;

  if (c.arv <= 0) missing.push("After-Repair Value");
  if (c.rehab <= 0 && c.property.condition !== "turnkey") missing.push("Rehab estimate");

  // Buyer's MAO at 70% rule, then assignment fee = MAO - asking.
  const mao = c.arv * 0.7 - c.rehab;
  const fee = mao - c.property.askingPrice;
  const feePct = c.arv > 0 ? fee / c.arv : 0;

  if (fee >= 10000) {
    score += 25;
    supporting.push(`Spread leaves ${fmtDollars(fee)} for an assignment fee.`);
  } else if (fee > 0) {
    score += 5;
    supporting.push(`Spread is thin (${fmtDollars(fee)}) but workable for a low-fee assignment.`);
  } else if (c.arv > 0) {
    score -= 25;
    sensitive.push("Asking price exceeds buyer MAO — no assignment spread.");
  }
  if ((c.property.timelineDaysToClose ?? 30) <= 21) {
    score += 10;
    supporting.push("Tight close window favors a wholesale assignment to a cash buyer.");
  }
  if (c.property.titleClouded) {
    score -= 20;
    sensitive.push("Title concerns make assignment harder — buyers will pause.");
  }

  const verdict = pickVerdict(score, missing);
  return {
    lane: "wholesale",
    laneLabel: LANE_LABELS.wholesale,
    verdict,
    verdictLabel: LANE_VERDICT_LABELS[verdict],
    headline: safeCopy(
      verdict === "strong"
        ? `Clean assignment opportunity. ${fmtDollars(fee)} spread for the wholesaler.`
        : verdict === "not_recommended"
          ? "No assignment spread at asking price."
          : `Wholesale possible at a reduced fee.`,
    ),
    confidence: {
      score: Math.max(0, Math.min(100, score)),
      supportingFactors: supporting,
      sensitiveFactors: sensitive,
      missingInputs: missing,
    },
    economics: {
      primaryMetric: "Assignment fee at 70% MAO",
      primaryValue: fmtDollars(fee),
      metrics: [
        { label: "Buyer MAO", value: fmtDollars(mao) },
        { label: "Fee % of ARV", value: fmtPct(feePct * 100, 1) },
      ],
    },
    laneRisks: ["title-clouded", "timeline-tight"],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Joint Venture
// ───────────────────────────────────────────────────────────────────────────

function scoreJv(c: LaneCtx): LaneFitResult {
  const supporting: string[] = [];
  const sensitive: string[] = [];
  const missing: string[] = [];
  let score = 35;

  // JV makes sense when the deal is sound but the user lacks capital.
  if (c.property.financingCommitted === false) {
    score += 20;
    supporting.push("User does not have committed financing — JV brings the capital.");
  }
  if (c.totalCashIn > 75000) {
    score += 15;
    supporting.push(`Total cash-in of ${fmtDollars(c.totalCashIn)} is large enough to interest a partner.`);
  }
  // Underlying deal must be sound — borrow score from BRRRR or Flip.
  const flip = scoreFlip(c).confidence.score;
  const brrrr = scoreBrrrr(c).confidence.score;
  const underlyingScore = Math.max(flip, brrrr);
  if (underlyingScore >= 65) {
    score += 20;
    supporting.push("Underlying flip or BRRRR economics are strong enough to share equity.");
  } else if (underlyingScore < 40) {
    score -= 25;
    sensitive.push("Underlying economics are too weak to support a 50/50 JV.");
  }

  const verdict = pickVerdict(score, missing);
  return {
    lane: "jv",
    laneLabel: LANE_LABELS.jv,
    verdict,
    verdictLabel: LANE_VERDICT_LABELS[verdict],
    headline: safeCopy(
      verdict === "strong"
        ? "JV-able. Bring the deal, partner brings capital, split the upside."
        : "JV is structurally possible but needs stronger fundamentals to attract a capital partner.",
    ),
    confidence: {
      score: Math.max(0, Math.min(100, score)),
      supportingFactors: supporting,
      sensitiveFactors: sensitive,
      missingInputs: missing,
    },
    economics: {
      primaryMetric: "Indicative split",
      primaryValue: "50 / 50",
      metrics: [
        { label: "Total cash-in", value: fmtDollars(c.totalCashIn) },
        { label: "Underlying lane score", value: underlyingScore.toFixed(0) },
      ],
    },
    laneRisks: ["financing-uncommitted"],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Listing or Operator Referral
// ───────────────────────────────────────────────────────────────────────────

function scoreListingReferral(c: LaneCtx): LaneFitResult {
  const supporting: string[] = [];
  const sensitive: string[] = [];
  const missing: string[] = [];
  let score = 45;

  // Listing referral wins when retail value exceeds investor MAO + assignment fee.
  const investorMao = c.arv * 0.7 - c.rehab;
  const retailUpside = c.arv - investorMao;
  if (retailUpside > 30000 && c.arv > 0) {
    score += 25;
    supporting.push(`Retail listing leaves ${fmtDollars(retailUpside)} more on the table than an investor sale.`);
  }
  if (c.property.condition === "turnkey" || c.property.condition === "light") {
    score += 15;
    supporting.push("Property is presentable — qualifies for a clean MLS listing.");
  } else if (c.property.condition === "gut" || c.property.condition === "heavy") {
    score -= 20;
    sensitive.push("Heavy condition limits retail buyer pool; investor sale may net more.");
  }
  if (c.property.timelineDaysToClose && c.property.timelineDaysToClose <= 21) {
    score -= 15;
    sensitive.push("Tight close window cuts off the retail listing path.");
  }

  const verdict = pickVerdict(score, missing);
  return {
    lane: "listing_referral",
    laneLabel: LANE_LABELS.listing_referral,
    verdict,
    verdictLabel: LANE_VERDICT_LABELS[verdict],
    headline: safeCopy(
      verdict === "strong"
        ? `Refer to a trusted listing agent. Retail nets ${fmtDollars(retailUpside)} more than investor sale.`
        : "Listing referral possible but condition and timeline favor an investor exit.",
    ),
    confidence: {
      score: Math.max(0, Math.min(100, score)),
      supportingFactors: supporting,
      sensitiveFactors: sensitive,
      missingInputs: missing,
    },
    economics: {
      primaryMetric: "Retail upside vs investor sale",
      primaryValue: fmtDollars(retailUpside),
      metrics: [
        { label: "Estimated retail (ARV)", value: fmtDollars(c.arv) },
        { label: "Investor MAO", value: fmtDollars(investorMao) },
      ],
    },
    laneRisks: ["timeline-tight", "condition-heavy"],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Ground Up Build
// ───────────────────────────────────────────────────────────────────────────

function scoreGroundUp(c: LaneCtx): LaneFitResult {
  const supporting: string[] = [];
  const sensitive: string[] = [];
  const missing: string[] = [];
  let score = 18; // Intentionally weak baseline — current scope is Phase-1 ADU/flip/BRRRR.

  if (c.property.lotSqft === undefined || c.property.lotSqft <= 0) {
    missing.push("Lot square footage");
  }
  if (c.property.developmentPotential === undefined) {
    missing.push("Confirmed development potential (zoning + density)");
  }

  const bigLot = (c.property.lotSqft ?? 0) >= 10000;
  const tearDown =
    c.property.condition === "gut" ||
    (c.arv > 0 && c.property.askingPrice + c.rehab > c.arv * 0.95);

  if (bigLot && c.property.developmentPotential) {
    score += 18;
    supporting.push(
      `Lot of ${(c.property.lotSqft ?? 0).toLocaleString()} sqft with development potential — ground-up math may pencil at scale.`,
    );
  }
  if (tearDown) {
    score += 8;
    supporting.push("Existing structure economics favor a tear-down over renovation.");
  }
  if (!c.property.zoningAllowsAdu && !c.property.developmentPotential) {
    score -= 10;
    sensitive.push("No development or density signal — ground-up unlikely to clear entitlement risk.");
  }
  // Doctrine: Phase-1 (today) does not chase large-scale ground-up plays
  // unless lot + zoning are exceptional. Cap the verdict honestly.
  sensitive.push(
    "Ground-up is a Phase-2+ pathway. Pegasus is a real estate development company, but current scope leads with ADU, flip, and BRRRR. Ground-up routes to a capital partner conversation.",
  );

  const verdict = pickVerdict(score, missing);
  return {
    lane: "ground_up",
    laneLabel: LANE_LABELS.ground_up,
    verdict,
    verdictLabel: LANE_VERDICT_LABELS[verdict],
    headline: safeCopy(
      verdict === "strong"
        ? "Lot and zoning support a ground-up build — capital partner conversation."
        : verdict === "needs_more_data"
          ? "Confirm lot size and zoning to evaluate ground-up viability."
          : "Ground-up is a Phase-2+ path. Lot or zoning signal is not strong enough today.",
    ),
    confidence: {
      score: Math.max(0, Math.min(100, score)),
      supportingFactors: supporting,
      sensitiveFactors: sensitive,
      missingInputs: missing,
    },
    economics: {
      primaryMetric: "Ground-up readiness",
      primaryValue: bigLot && c.property.developmentPotential ? "Worth a conversation" : "Phase-2+",
      metrics: [
        { label: "Lot sqft", value: (c.property.lotSqft ?? 0).toLocaleString() },
        { label: "Development potential", value: c.property.developmentPotential ? "Yes" : "Unknown" },
        { label: "Tear-down math", value: tearDown ? "Favorable" : "Unfavorable" },
      ],
    },
    laneRisks: ["permit-concerns", "construction"],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Public API
// ───────────────────────────────────────────────────────────────────────────

const SCORERS: Record<StrategyLane, (c: LaneCtx) => LaneFitResult> = {
  flip: scoreFlip,
  wholetail: scoreWholetail,
  brrrr: scoreBrrrr,
  rental_hold: scoreRentalHold,
  adu_development: scoreAduDevelopment,
  ground_up: scoreGroundUp,
  wholesale: scoreWholesale,
  jv: scoreJv,
  listing_referral: scoreListingReferral,
};

export function scoreAllLanes(c: LaneCtx): LaneFitResult[] {
  const verdictRank: Record<LaneFitVerdict, number> = {
    strong: 4,
    possible: 3,
    weak: 2,
    needs_more_data: 1,
    not_recommended: 0,
  };
  return (Object.keys(SCORERS) as StrategyLane[])
    .map((l) => SCORERS[l](c))
    .sort((a, b) => {
      const v = verdictRank[b.verdict] - verdictRank[a.verdict];
      if (v !== 0) return v;
      return b.confidence.score - a.confidence.score;
    });
}

export type { LaneCtx };
