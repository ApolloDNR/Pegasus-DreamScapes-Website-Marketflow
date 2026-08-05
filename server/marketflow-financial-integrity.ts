export type MarketflowOfferResponseConflict =
  | "not_recipient"
  | "state_conflict"
  | "negotiation_inactive"
  | "stale_offer"
  | "already_resolved"
  | "offer_expired";

export type MarketflowCurrentOfferDisposition =
  | "none"
  | "active"
  | "expire_and_supersede"
  | "supersedable"
  | "inconsistent";

type OfferState = {
  id: number;
  lane: string;
  dealId: number;
  negotiationId: number | null;
  createdBy: string;
  recipientId: string;
  status: string;
  expiresAt: Date | null;
};

type NegotiationState = {
  id: number;
  lane: string;
  dealId: number;
  posterId: string;
  counterpartyId: string;
  status: string;
  currentOfferId: number | null;
};

export function isMarketflowOfferExpired(
  offer: Pick<OfferState, "expiresAt">,
  now: Date,
): boolean {
  return offer.expiresAt !== null && offer.expiresAt.getTime() <= now.getTime();
}

export function isMarketflowOfferConsistentWithNegotiation(
  offer: OfferState,
  negotiation: NegotiationState,
): boolean {
  const participantsMatch =
    negotiation.posterId !== negotiation.counterpartyId &&
    ((offer.createdBy === negotiation.posterId &&
      offer.recipientId === negotiation.counterpartyId) ||
      (offer.createdBy === negotiation.counterpartyId &&
        offer.recipientId === negotiation.posterId));

  return (
    offer.negotiationId === negotiation.id &&
    offer.lane === negotiation.lane &&
    offer.dealId === negotiation.dealId &&
    participantsMatch
  );
}

export function isMarketflowNegotiationBoundToAuthoritativeDeal(
  negotiation: NegotiationState,
  authoritativeDeal: {
    lane: string;
    dealId: number;
    ownerId: string;
  },
): boolean {
  return (
    negotiation.lane === authoritativeDeal.lane &&
    negotiation.dealId === authoritativeDeal.dealId &&
    negotiation.posterId === authoritativeDeal.ownerId &&
    negotiation.counterpartyId !== authoritativeDeal.ownerId
  );
}

export function getMarketflowOfferResponseConflict({
  offer,
  negotiation,
  userId,
  now,
}: {
  offer: OfferState;
  negotiation: NegotiationState | undefined;
  userId: string;
  now: Date;
}): MarketflowOfferResponseConflict | null {
  if (offer.recipientId !== userId) {
    return "not_recipient";
  }
  if (
    !negotiation ||
    !isMarketflowOfferConsistentWithNegotiation(offer, negotiation)
  ) {
    return "state_conflict";
  }
  if (negotiation.status !== "active") {
    return "negotiation_inactive";
  }
  if (negotiation.currentOfferId !== offer.id) {
    return "stale_offer";
  }
  if (offer.status !== "sent") {
    return "already_resolved";
  }
  if (isMarketflowOfferExpired(offer, now)) {
    return "offer_expired";
  }
  return null;
}

export function classifyMarketflowCurrentOffer(
  offer: Pick<OfferState, "status" | "expiresAt"> | undefined,
  now: Date,
): MarketflowCurrentOfferDisposition {
  if (!offer) {
    return "none";
  }
  if (offer.status === "sent") {
    return isMarketflowOfferExpired(offer, now)
      ? "expire_and_supersede"
      : "active";
  }
  if (
    offer.status === "countered" ||
    offer.status === "rejected" ||
    offer.status === "expired" ||
    offer.status === "withdrawn"
  ) {
    return "supersedable";
  }
  return "inconsistent";
}
