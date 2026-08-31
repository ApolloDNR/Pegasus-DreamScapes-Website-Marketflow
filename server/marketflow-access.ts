import type { MarketflowOffer } from "@shared/schema";

type MarketflowOfferParticipants = Pick<
  MarketflowOffer,
  "createdBy" | "recipientId"
>;

export function canAccessMarketflowOffer(
  userId: string,
  offer: MarketflowOfferParticipants,
): boolean {
  return offer.createdBy === userId || offer.recipientId === userId;
}

export function filterMarketflowOffersForUser<T extends MarketflowOfferParticipants>(
  userId: string,
  offers: T[],
): T[] {
  return offers.filter((offer) => canAccessMarketflowOffer(userId, offer));
}
