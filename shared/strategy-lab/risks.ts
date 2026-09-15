/**
 * Strategy Lab — risk inference engine.
 *
 * Auto-fires risk flags from the property + scenario inputs. No user
 * checkboxes. Each flag carries a plain-English label and a one-line
 * detail that always echoes the trigger value so the user can audit.
 */

import type { PropertyInput, RiskFlag, ScenarioRun, StrategyLane } from "./types";
import { fmtDollars, fmtPct } from "./voice";

const ALL_LANES: StrategyLane[] = [
  "flip",
  "wholetail",
  "brrrr",
  "rental_hold",
  "adu_development",
  "ground_up",
  "wholesale",
  "jv",
  "listing_referral",
];

interface Ctx {
  property: PropertyInput;
  rehab: number;
  arv: number;
  rent: number;
  base: ScenarioRun;
  worst: ScenarioRun;
}

export function inferRisks(ctx: Ctx): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const { property, rehab, arv, rent, base, worst } = ctx;

  // ── Title ────────────────────────────────────────────────────────────
  if (property.titleClouded) {
    flags.push({
      id: "title-clouded",
      category: "title",
      severity: "high",
      title: "Title may be encumbered",
      detail: "The visitor flagged liens, lis pendens, probate, or code violations. Independent title review is required before anyone relies on this model.",
      affects: ["flip", "wholetail", "brrrr", "rental_hold", "wholesale"],
    });
  }

  // ── Permit ───────────────────────────────────────────────────────────
  if (property.permitConcerns) {
    flags.push({
      id: "permit-concerns",
      category: "permit",
      severity: "watch",
      title: "Open or expired permits possible",
      detail: "The visitor flagged permit concerns. Verify permit history with the applicable authority and qualified professionals before relying on a scope.",
      affects: ["flip", "brrrr", "adu_development"],
    });
  }

  // ── Construction / rehab ─────────────────────────────────────────────
  if (rehab > 0 && property.askingPrice > 0) {
    const rehabPct = rehab / property.askingPrice;
    if (rehabPct > 0.5) {
      flags.push({
        id: "rehab-heavy",
        category: "construction",
        severity: "watch",
        title: "Heavy rehab relative to purchase",
        detail: `Rehab budget of ${fmtDollars(rehab)} is ${fmtPct(rehabPct * 100, 0)} of asking price. The model flags scope uncertainty; verify it with an appropriately licensed professional and choose your own contingency.`,
        affects: ["flip", "brrrr", "wholetail"],
      });
    }
  }
  if (property.condition === "gut" || property.condition === "heavy") {
    flags.push({
      id: "condition-heavy",
      category: "construction",
      severity: "watch",
      title: "Heavy or gut-level condition",
      detail: `Reported condition is "${property.condition}". Consider independent structural and mechanical inspections before relying on the modeled scope.`,
      affects: ["flip", "brrrr", "rental_hold"],
    });
  }

  // ── Valuation ────────────────────────────────────────────────────────
  if (arv > 0 && property.askingPrice > 0 && rehab >= 0) {
    const arvRatio = (property.askingPrice + rehab) / arv;
    if (arvRatio > 0.85) {
      flags.push({
        id: "arv-thin",
        category: "valuation",
        severity: "high",
        title: "All-in over 85% of ARV",
        detail: `Purchase plus rehab equals ${fmtPct(arvRatio * 100, 1)} of visitor-entered ARV. That exceeds the model's illustrative 75-80% range and narrows modeled headroom; actual lender and resale outcomes vary.`,
        affects: ["flip", "wholetail", "brrrr"],
      });
    }
  }

  // ── Financing ────────────────────────────────────────────────────────
  if (property.financingCommitted === false) {
    flags.push({
      id: "financing-uncommitted",
      category: "financing",
      severity: "info",
      title: "Financing not yet committed",
      detail: "The visitor has not confirmed a lender or source of funds. Verify financing feasibility and contractual deadlines with qualified professionals before relying on this path.",
      affects: ["flip", "brrrr", "rental_hold", "adu_development"],
    });
  }
  if (worst.dscr > 0 && worst.dscr < 1.0) {
    flags.push({
      id: "dscr-worst-fail",
      category: "financing",
      severity: "high",
      title: "Worst case DSCR below 1.00",
      detail: `Worst-case modeled DSCR is ${worst.dscr.toFixed(2)}, below the tool's illustrative 1.20-1.25 comparison range. Actual lender criteria vary, and this model cannot determine eligibility.`,
      affects: ["brrrr", "rental_hold"],
    });
  }

  // ── Timeline ─────────────────────────────────────────────────────────
  if ((property.timelineDaysToClose ?? 0) > 0 && (property.timelineDaysToClose ?? 0) <= 14) {
    flags.push({
      id: "timeline-tight",
      category: "timeline",
      severity: "high",
      title: "Tight close window",
      detail: `The visitor entered a ${property.timelineDaysToClose}-day close. That window may not accommodate many financing processes; confirm feasibility directly with a qualified lender.`,
      affects: ["flip", "brrrr", "wholesale", "wholetail"],
    });
  }

  // ── Exit / cash flow ─────────────────────────────────────────────────
  if (base.annualCashFlow < 0) {
    flags.push({
      id: "cash-flow-negative",
      category: "exit",
      severity: "high",
      title: "Base case cash flow is negative",
      detail: `Base case modeled annual cash flow is ${fmtDollars(base.annualCashFlow)}. A positive outcome would depend on assumptions outside this base case, which require independent verification.`,
      affects: ["rental_hold", "brrrr"],
    });
  }
  if (base.dscr > 0 && base.dscr < 1.2) {
    flags.push({
      id: "dscr-base-thin",
      category: "exit",
      severity: "watch",
      title: "Base case DSCR below 1.20",
      detail: `Base case modeled DSCR is ${base.dscr.toFixed(2)}, below the tool's illustrative 1.20 comparison point. Actual program criteria vary.`,
      affects: ["brrrr", "rental_hold"],
    });
  }

  // ── Occupancy ────────────────────────────────────────────────────────
  // Possession risk — flip/BRRRR/wholetail need vacant possession to start
  // rehab. Owner-occupied = vacate-and-move risk; tenant-occupied = lease
  // takeover or cash-for-keys risk; vacant = no risk and not flagged.
  if (property.occupancyStatus === "owner_occupied") {
    flags.push({
      id: "occupancy-owner",
      category: "occupancy",
      severity: "watch",
      title: "Property is owner-occupied",
      detail: "The visitor marked the home owner-occupied. Possession, relocation, representation, and contract terms require case-specific legal and professional review.",
      affects: ["flip", "wholetail", "brrrr"],
    });
  }
  if (property.occupancyStatus === "tenant_occupied") {
    const monthsLeft = property.tenantLeaseMonthsRemaining ?? 0;
    const severity: RiskFlag["severity"] = monthsLeft >= 6 ? "high" : "watch";
    flags.push({
      id: "occupancy-tenant",
      category: "occupancy",
      severity,
      title: "Property is tenant-occupied",
      detail: monthsLeft > 0
        ? `The visitor reported ${monthsLeft} month${monthsLeft === 1 ? "" : "s"} remaining on a lease. Occupancy may affect timing and rights; verify the lease and applicable law independently.`
        : "The visitor reported an existing tenant. Verify lease terms, possession rights, and applicable law before relying on any modeled path.",
      affects: ["flip", "wholetail", "brrrr", "rental_hold"],
    });
  }

  // ── Market ───────────────────────────────────────────────────────────
  if (rent > 0 && property.askingPrice > 0) {
    const onePctRatio = (rent * 12) / property.askingPrice;
    if (onePctRatio < 0.06) {
      flags.push({
        id: "rent-yield-low",
        category: "market",
        severity: "info",
        title: "Gross rent yield below 6% of price",
        detail: `Gross annual visitor-entered rent is ${fmtPct(onePctRatio * 100, 1)} of asking price. Modeled cash flow is sensitive to expenses and appreciation assumptions that require independent verification.`,
        affects: ["rental_hold", "brrrr"],
      });
    }
  }

  if ((property.knownIssues?.length ?? 0) > 0) {
    flags.push({
      id: "known-issues",
      category: "construction",
      severity: "info",
      title: "Disclosed known issues",
      detail: `User listed: ${(property.knownIssues ?? []).slice(0, 3).join("; ")}.`,
      affects: ALL_LANES,
    });
  }

  return flags;
}
