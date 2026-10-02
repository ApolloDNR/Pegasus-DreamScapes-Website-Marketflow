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
  "Reading the visitor-entered assumptions through an automated model:";

function frameForOwner(status: LabDealStatus): ToneFrame {
  if (status === "listed") {
    return {
      framing:
        "The visitor marked the property listed, so the model compares listing and off-market assumptions without providing a price opinion.",
      nextStep:
        "Save the Snapshot and verify listing status, pricing, representation, and offer questions with appropriately licensed professionals.",
    };
  }
  if (status === "pending") {
    return {
      framing:
        "The visitor marked a pending sale, so the model functions only as an unverified contingency comparison.",
      nextStep:
        "Save the Snapshot and verify the existing contract, contingencies, representation, and alternatives independently.",
    };
  }
  if (status === "off_market" || status === "owner_submitted") {
    return {
      framing:
        "The visitor marked an off-market or owner-submitted situation, so the model compares possible paths against the entered timeline.",
      nextStep:
        "Save the Snapshot, verify the facts independently, and choose whether to carry the unverified brief into intake.",
    };
  }
  return {
    framing: FALLBACK_FRAMING,
    nextStep:
      "Save the Snapshot, verify the facts independently, and choose whether to carry the unverified brief into intake.",
  };
}

function frameForWholesaler(status: LabDealStatus): ToneFrame {
  if (status === "wholesale" || status === "off_market") {
    return {
      framing:
        "The visitor marked an assignment or off-market context, so the model tests fee headroom without confirming assignability or a buyer.",
      nextStep:
        "Save the Snapshot and verify contract authority, disclosure duties, assignability, costs, and buyer demand independently.",
    };
  }
  if (status === "listed") {
    return {
      framing:
        "The visitor marked the property listed, so the assignment model remains subject to representation, disclosure, and contract restrictions.",
      nextStep:
        "Save the Snapshot and seek qualified legal and licensed advice before relying on assignment assumptions.",
    };
  }
  return {
    framing:
      "The wholesale comparison is educational and does not establish contract control, assignability, a buyer, or a fee.",
    nextStep:
      "Save the Snapshot and verify contract authority, assignability, costs, and demand independently.",
  };
}

function frameForInvestorBuyer(status: LabDealStatus): ToneFrame {
  if (status === "listed" || status === "pending") {
    return {
      framing:
        "The visitor marked a listed or pending property, so the model compares entered price assumptions without recommending an offer.",
      nextStep:
        "Save the Snapshot, re-run with verified financing inputs, and consult appropriately licensed professionals before acting.",
    };
  }
  if (status === "off_market" || status === "wholesale" || status === "pocket") {
    return {
      framing:
        "The visitor marked an off-market context, so the model highlights unverified assumptions and diligence questions.",
      nextStep:
        "Save the Snapshot and independently verify title, condition, authority, financing, and contract terms before acting.",
    };
  }
  return {
    framing:
      "This is an educational buy-side comparison based on visitor-entered assumptions, not underwriting or an offer recommendation.",
    nextStep:
      "Save the Snapshot, re-run with verified inputs, and seek qualified advice before acting or signing anything.",
  };
}

function frameForAgent(status: LabDealStatus): ToneFrame {
  if (status === "listed") {
    return {
      framing:
        "The visitor marked an agent and listed-property context. This automated output is not a BPO, CMA, appraisal, or agency instruction.",
      nextStep:
        "Save the Snapshot and use appropriately licensed, broker-approved methods for pricing, disclosure, and client advice.",
    };
  }
  if (status === "pocket" || status === "off_market") {
    return {
      framing:
        "The visitor marked a pocket or off-market context. The model does not provide distribution, acquisition, a buyer, or representation.",
      nextStep:
        "Save the Snapshot and verify representation, marketing authority, disclosure, pricing, and distribution obligations independently.",
    };
  }
  return {
    framing:
      "The visitor marked an agent context. This model compares entered speed and price assumptions without creating agency advice.",
    nextStep:
      "Save the Snapshot and use appropriately licensed, broker-approved analysis before advising a client.",
  };
}

function frameForCapitalPartner(status: LabDealStatus): ToneFrame {
  if (status === "wholesale" || status === "off_market") {
    return {
      framing:
        "The visitor marked a capital and tight-window context. The model is educational and does not offer a security, funding, allocation, or terms.",
      nextStep:
        "Save the Snapshot and verify risk, suitability, authority, terms, and timing with qualified legal and financial professionals.",
    };
  }
  return {
    framing:
      "The visitor marked a capital context. The model is educational and does not offer a security, funding, allocation, return, or terms.",
    nextStep:
      "Save the Snapshot and verify risk, suitability, authority, and terms with qualified legal and financial professionals.",
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
