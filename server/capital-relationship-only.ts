import type { RequestHandler, Response } from "express";

interface CapitalOfferCandidate {
  lane?: unknown;
  offerKind?: unknown;
}

export function isCapitalOfferExecution(candidate: CapitalOfferCandidate): boolean {
  const lane = typeof candidate.lane === "string" ? candidate.lane.trim().toUpperCase() : "";
  const offerKind =
    typeof candidate.offerKind === "string" ? candidate.offerKind.trim().toUpperCase() : "";
  return lane === "CAPITAL" || offerKind === "CAPITAL_INVESTMENT";
}

export function sendCapitalRelationshipOnly(res: Response) {
  return res.status(410).json({
    code: "CAPITAL_RELATIONSHIP_ONLY",
    message:
      "MarketFlow does not accept investment interest, funds, offers, allocations, or commitments through this endpoint.",
    relationshipPath: "/capital#capital-introduction",
  });
}

export const rejectCapitalInvestmentInterest: RequestHandler = (_req, res) => {
  return sendCapitalRelationshipOnly(res);
};
