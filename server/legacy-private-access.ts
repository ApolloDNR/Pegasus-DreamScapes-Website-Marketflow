type LegacyNegotiationParticipant = {
  initiatorId?: string | null;
  responderId?: string | null;
};

type LegacyWholesaleOfferParticipant = {
  buyerId?: string | null;
  buyer_id?: string | null;
  external_buyer_id?: string | null;
};

type LegacyListingInquiryParticipant = {
  userId?: string | null;
  user_id?: string | null;
};

type LegacyCapitalInvestmentParticipant = {
  investorId?: string | null;
  investor_id?: string | null;
};

type LegacyWholesaleDocument = {
  isPublic?: boolean | null;
  is_public?: boolean | null;
};

export type LegacyDealKind = "wholesale" | "capital" | "listing";

export function normalizeLegacyDealType(
  dealType: unknown,
): LegacyDealKind | null {
  if (typeof dealType !== "string") {
    return null;
  }

  const normalized = dealType.trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (
    normalized === "wholesale" ||
    normalized === "wholesale_deal" ||
    normalized === "wholesale_assignment"
  ) {
    return "wholesale";
  }

  if (
    normalized === "capital" ||
    normalized === "capital_project" ||
    normalized === "capital_raise"
  ) {
    return "capital";
  }

  if (
    normalized === "listing" ||
    normalized === "retail" ||
    normalized === "retail_listing"
  ) {
    return "listing";
  }

  return null;
}

export function getLegacyDealTypeAliases(dealType: string): string[] {
  const kind = normalizeLegacyDealType(dealType);
  const aliases =
    kind === "wholesale"
      ? ["wholesale_deal", "wholesale", "wholesale_assignment"]
      : kind === "capital"
        ? ["capital_project", "capital", "capital_raise"]
        : kind === "listing"
          ? ["listing", "retail", "retail_listing"]
          : [];

  return Array.from(new Set([dealType, ...aliases]));
}

export function isLegacyNegotiationParticipant(
  userId: string,
  negotiation: LegacyNegotiationParticipant,
): boolean {
  return (
    negotiation.initiatorId === userId || negotiation.responderId === userId
  );
}

export function isLegacyWholesaleOfferBuyer(
  userId: string,
  offer: LegacyWholesaleOfferParticipant,
): boolean {
  return (
    offer.buyerId === userId ||
    offer.buyer_id === userId ||
    offer.external_buyer_id === userId
  );
}

export function isLegacyListingInquiryParticipant(
  userId: string,
  inquiry: LegacyListingInquiryParticipant,
): boolean {
  return inquiry.userId === userId || inquiry.user_id === userId;
}

export function isLegacyCapitalInvestmentParticipant(
  userId: string,
  investment: LegacyCapitalInvestmentParticipant,
): boolean {
  return (
    investment.investorId === userId || investment.investor_id === userId
  );
}

export function isLegacyDealParticipant(
  userId: string,
  sources: {
    negotiations?: readonly LegacyNegotiationParticipant[];
    offers?: readonly LegacyWholesaleOfferParticipant[];
    inquiries?: readonly LegacyListingInquiryParticipant[];
    capitalInvestments?: readonly LegacyCapitalInvestmentParticipant[];
  },
): boolean {
  return (
    sources.negotiations?.some((negotiation) =>
      isLegacyNegotiationParticipant(userId, negotiation),
    ) === true ||
    sources.offers?.some((offer) =>
      isLegacyWholesaleOfferBuyer(userId, offer),
    ) === true ||
    sources.inquiries?.some((inquiry) =>
      isLegacyListingInquiryParticipant(userId, inquiry),
    ) === true ||
    sources.capitalInvestments?.some((investment) =>
      isLegacyCapitalInvestmentParticipant(userId, investment),
    ) === true
  );
}

export function filterLegacyNegotiationsForUser<
  T extends LegacyNegotiationParticipant,
>(userId: string, negotiations: readonly T[]): T[] {
  return negotiations.filter((negotiation) =>
    isLegacyNegotiationParticipant(userId, negotiation),
  );
}

export function filterLegacyWholesaleOffersForUser<
  T extends LegacyWholesaleOfferParticipant,
>(userId: string, offers: readonly T[]): T[] {
  return offers.filter((offer) => isLegacyWholesaleOfferBuyer(userId, offer));
}

export function filterLegacyListingInquiriesForUser<
  T extends LegacyListingInquiryParticipant,
>(userId: string, inquiries: readonly T[]): T[] {
  return inquiries.filter((inquiry) =>
    isLegacyListingInquiryParticipant(userId, inquiry),
  );
}

export function filterLegacyCapitalInvestmentsForUser<
  T extends LegacyCapitalInvestmentParticipant,
>(userId: string, investments: readonly T[]): T[] {
  return investments.filter((investment) =>
    isLegacyCapitalInvestmentParticipant(userId, investment),
  );
}

export function filterLegacyDocumentsForParticipant<
  T extends LegacyWholesaleDocument,
>(documents: readonly T[]): T[] {
  return documents.filter(
    (document) =>
      document.isPublic === true || document.is_public === true,
  );
}

export function canChangeLegacyWholesaleOfferStatus(input: {
  userId: string;
  dealOwnerId?: string | null;
  buyerId?: string | null;
  status: string;
  isStaff: boolean;
}): boolean {
  if (input.isStaff) {
    return true;
  }

  if (input.status === "withdrawn") {
    return input.buyerId === input.userId;
  }

  return input.dealOwnerId === input.userId;
}

export function canCounterLegacyWholesaleOffer(input: {
  userId: string;
  dealOwnerId?: string | null;
  isStaff: boolean;
}): boolean {
  return input.isStaff || input.dealOwnerId === input.userId;
}

export function canDeleteLegacyWholesaleDocument(input: {
  userId: string;
  dealOwnerId?: string | null;
  uploadedBy?: string | null;
  isStaff: boolean;
}): boolean {
  return (
    input.isStaff ||
    input.dealOwnerId === input.userId ||
    input.uploadedBy === input.userId
  );
}
