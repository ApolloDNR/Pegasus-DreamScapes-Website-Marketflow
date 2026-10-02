/**
 * Strategy Lab — Decision Memo composer.
 *
 * Deterministic 3-4 sentence narrative. NOT an LLM call — the composer
 * pulls from the top lane verdict, the leading sensitivity, the highest-
 * severity risk, and the recommended next step. Output is reproducible
 * for the same input, so legal and brand can audit it.
 */

import type {
  CompBand,
  DecisionMemo,
  LaneFitResult,
  PropertyInput,
  RiskFlag,
  ScenarioRun,
  SubmitterRole,
} from "./types";
import { isCompOverride } from "./comps";
import { fmtDollars } from "./voice";
import { safeCopy } from "./voice";

interface MemoArgs {
  property: PropertyInput;
  topLane: LaneFitResult;
  base: ScenarioRun;
  worst: ScenarioRun;
  topRisk?: RiskFlag;
  arvBand?: CompBand | null;
  rentBand?: CompBand | null;
  arvUserValue?: number;
  rentUserValue?: number;
}

const ROLE_OPENERS: Record<SubmitterRole, string> = {
  owner_seller: "For the owner: ",
  wholesaler: "For the wholesaler: ",
  investor_buyer: "For the buyer: ",
  agent: "For the agent: ",
  capital_partner: "For the capital partner: ",
  unknown: "",
};

const NEXT_STEPS = {
  strong: "Save the Snapshot, verify the assumptions independently, and decide whether to carry the brief into intake.",
  possible: "Refine the inputs (rent comps, rehab walk) and re-run before pushing it forward.",
  weak: "Tighten the price or scope assumptions before relying on this modeled path.",
  needs_more_data: "Fill in the missing inputs flagged above and re-run.",
  not_recommended: "This modeled lane does not fit the entered assumptions. Review the alternatives ranked in the Lane Board.",
};

export function composeDecisionMemo(args: MemoArgs): DecisionMemo {
  const { property, topLane, base, worst, topRisk } = args;
  const opener = ROLE_OPENERS[property.submitterRole ?? "unknown"];

  // Sentence 1 — verdict + lane.
  const s1 =
    `${opener}This property reads as a ${topLane.verdictLabel.toLowerCase()} for ${topLane.laneLabel.toLowerCase()}.`;

  // Sentence 2 — economics.
  const econ = topLane.economics;
  const s2 = `Headline read: ${econ.primaryValue} ${econ.primaryMetric.toLowerCase()}.`;

  // Sentence 3 — sensitivity / stress.
  let s3 = "";
  if (worst.annualCashFlow < 0 && (topLane.lane === "rental_hold" || topLane.lane === "brrrr")) {
    s3 = `The downside model shows negative annual cash flow of ${fmtDollars(-worst.annualCashFlow)}, so the result is sensitive to the base assumptions.`;
  } else if (topLane.confidence.sensitiveFactors[0]) {
    s3 = `Watch the sensitivity: ${topLane.confidence.sensitiveFactors[0]}`;
  } else if (topLane.confidence.supportingFactors[0]) {
    s3 = topLane.confidence.supportingFactors[0];
  } else {
    s3 = `Base scenario models cash flow of ${fmtDollars(base.annualCashFlow)} per year from the entered assumptions.`;
  }

  // Sentence 4 — risk + override warning, merged into one bounded
  // sentence so the memo never exceeds 4 sentences.
  const arvOverride =
    args.arvUserValue !== undefined ? isCompOverride(args.arvUserValue, args.arvBand) : false;
  const rentOverride =
    args.rentUserValue !== undefined ? isCompOverride(args.rentUserValue, args.rentBand) : false;
  const overrideFragment =
    arvOverride || rentOverride
      ? "user-supplied ARV or rent is more than 15% off the comp band"
      : "";
  const riskFragment = topRisk ? `top risk: ${topRisk.title.toLowerCase()}` : "";
  const fragments = [riskFragment, overrideFragment].filter(Boolean);
  const s4 = fragments.length > 0
    ? `Confirm before acting: ${fragments.join("; ")}.`
    : "";

  const nextStep = NEXT_STEPS[topLane.verdict];

  // Always 3 sentences; s4 promotes to 4th only when risk or override is present.
  const paragraph = safeCopy(
    [s1, s2, s3, s4].filter(Boolean).join(" "),
  );

  return {
    paragraph,
    nextStep: safeCopy(nextStep),
    hasCompOverrideWarning: arvOverride || rentOverride,
  };
}
