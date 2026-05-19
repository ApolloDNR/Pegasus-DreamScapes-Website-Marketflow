/**
 * Strategy Lab — UI adapter.
 *
 * Pure helpers that translate the desktop console's form state into the
 * shape `runStrategyLab(...)` accepts, plus the role + deal-status copy
 * matrix used to frame the Decision Memo. Lives in `shared/` so the page
 * stays a presenter / input collector and all underwriting + tone
 * decisions live in one engine surface.
 */

import type { CompEntry, PropertyInput, DecisionMemo } from "./types";

// ───────────────────────────────────────────────────────────────────────────
// Form-state contract.
// ───────────────────────────────────────────────────────────────────────────

export type LabFinancingType =
  | "cash"
  | "conventional"
  | "hard_money"
  | "private_money"
  | "dscr"
  | "seller_carry"
  | "unsure";

export type LabRehabSource = "cash" | "hard_money" | "private_money" | "credit_line";

export type LabDealStatus =
  | "owner_submitted"
  | "wholesale"
  | "off_market"
  | "listed"
  | "pending"
  | "pocket"
  | "unknown";

export type LabSubmitterRole =
  | "owner_seller"
  | "wholesaler"
  | "investor_buyer"
  | "agent"
  | "capital_partner"
  | "unknown";

/** What `runStrategyLab` expects for its options bag. */
export interface StrategyLabEngineInputs {
  property: PropertyInput;
  comps: CompEntry[];
  loanLtvPct: number;
  loanRatePct: number;
  loanTermYears: number;
}

export interface StrategyLabAdapterInput {
  property: PropertyInput;
  comps: CompEntry[];
  /** Raw user-entered LTV (used as a fallback only). */
  loanLtvPct: number;
  /** Raw user-entered rate (the floor when capital source raises it). */
  loanRatePct: number;
  loanTermYears: number;
  /** From the Quick Read "Financing type" select. */
  financingType: LabFinancingType;
  /** From the Capital Stack "Rehab source" select. */
  capitalRehabSource: LabRehabSource;
  /** From the Capital Stack "Down payment %" input. */
  capitalDownPaymentPct?: number;
}

// ───────────────────────────────────────────────────────────────────────────
// Engine input adapter — moves all numeric inference out of the UI layer.
// ───────────────────────────────────────────────────────────────────────────

/**
 * Turn the desktop console form state into the exact shape `runStrategyLab`
 * accepts. Down payment % drives effective LTV; capital rehab source raises
 * the modeled rate to a floor (hard money 11%, private money 9%); cash
 * forces 0% LTV.
 *
 * Pure function — same input always produces same output.
 */
export function buildStrategyLabInputs(
  input: StrategyLabAdapterInput,
): StrategyLabEngineInputs {
  const loanLtvPct = effectiveLtvPct({
    financingType: input.financingType,
    capitalDownPaymentPct: input.capitalDownPaymentPct,
    loanLtvPct: input.loanLtvPct,
  });
  const loanRatePct = effectiveRatePct({
    capitalRehabSource: input.capitalRehabSource,
    loanRatePct: input.loanRatePct,
  });
  return {
    property: input.property,
    comps: input.comps,
    loanLtvPct,
    loanRatePct,
    loanTermYears: input.loanTermYears,
  };
}

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export function effectiveLtvPct(args: {
  financingType: LabFinancingType;
  capitalDownPaymentPct?: number;
  loanLtvPct: number;
}): number {
  if (args.financingType === "cash") return 0;
  if (
    args.capitalDownPaymentPct != null &&
    Number.isFinite(args.capitalDownPaymentPct) &&
    args.capitalDownPaymentPct >= 0 &&
    args.capitalDownPaymentPct <= 100
  ) {
    return clampPct(100 - args.capitalDownPaymentPct);
  }
  return clampPct(args.loanLtvPct);
}

export function effectiveRatePct(args: {
  capitalRehabSource: LabRehabSource;
  loanRatePct: number;
}): number {
  const userRate = Number.isFinite(args.loanRatePct) ? args.loanRatePct : 7.5;
  if (args.capitalRehabSource === "hard_money") return Math.max(userRate, 11);
  if (args.capitalRehabSource === "private_money") return Math.max(userRate, 9);
  return userRate;
}

/**
 * Infers `financingCommitted` from the Quick Read "Financing type" select.
 * Only "cash" implies fully committed (no outside capital required); every
 * other type defers to the user's explicit checkbox so JV / capital-partner
 * lanes stay live until the user asserts a hard commitment.
 */
export function inferFinancingCommitted(
  financingType: LabFinancingType,
  explicit: boolean | undefined,
): boolean | undefined {
  if (financingType === "cash") return true;
  return explicit;
}

// ───────────────────────────────────────────────────────────────────────────
// Role + deal-status copy matrix.
//
// Engine returns a generic Decision Memo paragraph and next step. We layer
// a presentation-tone matrix on top so an Owner with a Listed property
// hears different copy than a Wholesaler with an Off-market lock-up. Both
// the framing sentence (prepended to the memo paragraph) and the next-step
// sentence are status-aware.
// ───────────────────────────────────────────────────────────────────────────

interface ToneFrame {
  /** One-sentence prefix added to the engine's memo paragraph. */
  framing: string;
  /** Replaces engine memo.nextStep when present. */
  nextStep: string;
}

const FALLBACK_FRAMING =
  "Reading this property through the Pegasus lens:";

function frameForOwner(status: LabDealStatus): ToneFrame {
  if (status === "listed") {
    return {
      framing:
        "You're already on the market, so this read is your second-opinion price-and-path check.",
      nextStep:
        "Save the Snapshot. With the property already listed, we can compare the listing path to a clean off-market sale before your next price adjustment.",
    };
  }
  if (status === "pending") {
    return {
      framing:
        "You have a pending sale, so this read is a backup-plan stress test in case the deal falls out.",
      nextStep:
        "Save the Snapshot. If the pending sale falls through, we can step in with a backup offer at the lane price.",
    };
  }
  if (status === "off_market" || status === "owner_submitted") {
    return {
      framing:
        "You're working this off-market, so the read is centered on the path that fits your timeline best.",
      nextStep:
        "Save the Snapshot. We can route this to a referral, a direct purchase, or a listing path depending on your timeline.",
    };
  }
  return {
    framing: FALLBACK_FRAMING,
    nextStep:
      "Save the Snapshot. A human reviewer will route the property to the path that matches your timeline.",
  };
}

function frameForWholesaler(status: LabDealStatus): ToneFrame {
  if (status === "wholesale" || status === "off_market") {
    return {
      framing:
        "You have it under contract for assignment, so this read prices the spread your buyer needs to see.",
      nextStep:
        "Save the Snapshot and pass it to your buyer pool with the assignment-fee math attached. If the spread holds, we'll co-sign on the assignment.",
    };
  }
  if (status === "listed") {
    return {
      framing:
        "It's listed, so assignment math is tighter and disclosure on the seller side matters.",
      nextStep:
        "Save the Snapshot. Assignment math is tighter on listed property — confirm the seller has agreed to assignment before marketing.",
    };
  }
  return {
    framing:
      "Wholesale lane only opens once you have a real lock-up. Read this as your buyer-side pricing draft.",
    nextStep:
      "Save the Snapshot. Wholesale lane only works once you have a lock-up the buyer can rely on.",
  };
}

function frameForInvestorBuyer(status: LabDealStatus): ToneFrame {
  if (status === "listed" || status === "pending") {
    return {
      framing:
        "You're underwriting against a listed price, so the read tells you where your offer should land.",
      nextStep:
        "Save the Snapshot and re-run with your true financing terms before submitting the offer through the listing agent.",
    };
  }
  if (status === "off_market" || status === "wholesale" || status === "pocket") {
    return {
      framing:
        "You have an off-market shot. The read tells you what diligence has to clear before you sign.",
      nextStep:
        "Save the Snapshot. Lock the contract first, then re-run with your true financing terms before clearing diligence.",
    };
  }
  return {
    framing:
      "You're underwriting a buy-side opportunity. The read tells you where the math sits before you commit.",
    nextStep:
      "Save the Snapshot and re-run with your true financing terms before signing the LOI.",
  };
}

function frameForAgent(status: LabDealStatus): ToneFrame {
  if (status === "listed") {
    return {
      framing:
        "You represent the listing. Read this as a buyer-side BPO and a seller-side price reality check.",
      nextStep:
        "Save the Snapshot. Use the lane read with your seller before the next price adjustment, or as a buyer-side BPO.",
    };
  }
  if (status === "pocket" || status === "off_market") {
    return {
      framing:
        "You have a pocket listing. Read this as the choice between routing to off-market acquisition or a network buyer.",
      nextStep:
        "Save the Snapshot. We can route to off-market acquisition or refer to a buyer in the network — your choice.",
    };
  }
  return {
    framing:
      "You're representing the seller. Read this as the speed-vs-price tradeoff matrix for the next conversation.",
    nextStep:
      "Save the Snapshot. If your seller wants speed, we can route to off-market acquisition; otherwise stay on the listing path.",
  };
}

function frameForCapitalPartner(status: LabDealStatus): ToneFrame {
  if (status === "wholesale" || status === "off_market") {
    return {
      framing:
        "You're evaluating capital deployment against a tight window. Read this as the lane fit gating your structure choice.",
      nextStep:
        "Save the Snapshot. If the lane fit holds after a deeper review, we can structure debt or JV equity around it before the lock-up expires.",
    };
  }
  return {
    framing:
      "You're evaluating capital deployment. Read this as the lane fit gating debt vs equity structure.",
    nextStep:
      "Save the Snapshot. If the lane fit holds after a deeper review, we can structure debt or JV equity around it.",
  };
}

/**
 * Returns the role + deal-status framed Decision Memo: prepends a tone
 * sentence to the engine paragraph and overrides the next step with the
 * status-aware copy.
 *
 * Falls back to the engine copy when role or status is "unknown".
 */
export function frameDecisionMemo(
  memo: Pick<DecisionMemo, "paragraph" | "nextStep">,
  role: LabSubmitterRole,
  status: LabDealStatus,
): { paragraph: string; nextStep: string } {
  if (role === "unknown") {
    return { paragraph: memo.paragraph, nextStep: memo.nextStep };
  }
  let frame: ToneFrame;
  switch (role) {
    case "owner_seller":
      frame = frameForOwner(status);
      break;
    case "wholesaler":
      frame = frameForWholesaler(status);
      break;
    case "investor_buyer":
      frame = frameForInvestorBuyer(status);
      break;
    case "agent":
      frame = frameForAgent(status);
      break;
    case "capital_partner":
      frame = frameForCapitalPartner(status);
      break;
    default:
      return { paragraph: memo.paragraph, nextStep: memo.nextStep };
  }
  return {
    paragraph: `${frame.framing} ${memo.paragraph}`,
    nextStep: frame.nextStep,
  };
}
