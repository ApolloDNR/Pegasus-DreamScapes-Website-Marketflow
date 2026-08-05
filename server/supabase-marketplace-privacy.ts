type SupabaseRow = Record<string, any>;

const normalizeStatus = (status: unknown) =>
  typeof status === "string" ? status.trim().toLowerCase() : "";

const isExplicitlyPublic = (row: SupabaseRow) => row.is_public === true;

export type SupabaseMarketplaceIdentity = {
  userId: string;
  kind: "supabase" | "external";
};

type MarketplaceAuthRequest = {
  user?: { claims?: { sub?: unknown } };
  supabaseUser?: { id?: unknown };
  session?: { user?: { id?: unknown } };
};

const nonEmptyString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

export function resolveSupabaseMarketplaceIdentity(
  request: MarketplaceAuthRequest,
): SupabaseMarketplaceIdentity | null {
  const claimedUserId = nonEmptyString(request.user?.claims?.sub);
  const supabaseUserId = nonEmptyString(request.supabaseUser?.id);
  const sessionUserId = nonEmptyString(request.session?.user?.id);

  if (
    claimedUserId &&
    supabaseUserId &&
    claimedUserId !== supabaseUserId
  ) {
    return null;
  }

  const userId = claimedUserId || supabaseUserId || sessionUserId;
  if (!userId) {
    return null;
  }

  return {
    userId,
    kind: supabaseUserId === userId ? "supabase" : "external",
  };
}

export function toCapitalCommitmentIdentityColumns(
  identity: SupabaseMarketplaceIdentity,
) {
  return identity.kind === "supabase"
    ? {
        investor_id: identity.userId,
        external_investor_id: null,
      }
    : {
        investor_id: null,
        external_investor_id: identity.userId,
      };
}

export function toBuyerOfferIdentityColumns(
  identity: SupabaseMarketplaceIdentity,
) {
  return identity.kind === "supabase"
    ? {
        buyer_id: identity.userId,
        external_buyer_id: null,
      }
    : {
        buyer_id: null,
        external_buyer_id: identity.userId,
      };
}

export function requireCreatedSupabaseMarketplaceRecord<T>(
  record: T | null | undefined,
  message: string,
): T {
  if (record == null) {
    throw new Error(message);
  }
  return record;
}

export function toCapitalCommitmentDashboardDto(
  commitment: SupabaseRow,
): Record<string, unknown> {
  return {
    id: commitment.id,
    projectId: commitment.project_id,
    investorId:
      commitment.investor_id || commitment.external_investor_id || null,
    committedAmount: commitment.amount,
    structureType: normalizeStatus(commitment.structure_preference) || null,
    notes: commitment.notes,
    status: commitment.status,
    createdAt: commitment.created_at,
  };
}

export function toBuyerOfferDashboardDto(
  offer: SupabaseRow,
): Record<string, unknown> {
  return {
    id: offer.id,
    userId: offer.buyer_id || offer.external_buyer_id || null,
    propertyType: "retail",
    propertyId: offer.listing_id,
    offerAmount: offer.offer_amount,
    fundingType: offer.financing_type,
    closingTimeline: Array.isArray(offer.contingencies)
      ? offer.contingencies[0] || null
      : null,
    message: offer.message,
    status: offer.status,
    createdAt: offer.created_at,
    updatedAt: offer.updated_at,
  };
}

export function canReadPrivateDealData({
  userId,
  ownerId,
  participantIds = [],
  isStaff = false,
}: {
  userId: string;
  ownerId?: string | null;
  participantIds?: Array<string | null | undefined>;
  isStaff?: boolean;
}): boolean {
  return (
    isStaff ||
    ownerId === userId ||
    participantIds.some((participantId) => participantId === userId)
  );
}

export function toPublicSupabaseWholesaleDeal(
  deal: SupabaseRow,
): Record<string, unknown> | null {
  const isReviewedStatus = ["active", "available", "approved", "listed"].includes(
    normalizeStatus(deal.status),
  );
  if (!isExplicitlyPublic(deal) || !isReviewedStatus) {
    return null;
  }

  return {
    id: deal.id,
    address: deal.address,
    city: deal.city,
    state: deal.state,
    zipCode: deal.zip_code,
    propertyType: deal.property_type,
    arv: deal.arv,
    askingPrice: deal.asking_price,
    repairEstimate: deal.repair_estimate,
    assignmentFee: deal.assignment_fee,
    photos: deal.photos,
    occupancy: deal.occupancy,
    closeTimeline: deal.close_timeline,
    status: deal.status,
    raisingCapital: deal.raising_capital,
  };
}

export function toPublicSupabaseCapitalProject(
  project: SupabaseRow,
): Record<string, unknown> | null {
  if (
    !isExplicitlyPublic(project) ||
    normalizeStatus(project.status) !== "active"
  ) {
    return null;
  }

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    location: project.location,
    propertyType: project.property_type,
    structure: project.structure,
    fundingGoal: project.funding_goal,
    amountRaised: project.amount_raised,
    minInvestment: project.min_investment,
    projectedReturn: project.projected_return,
    holdPeriod: project.hold_period,
    photos: project.photos,
    status: project.status,
  };
}

export function toPublicSupabaseListing(
  listing: SupabaseRow,
): Record<string, unknown> | null {
  if (
    !isExplicitlyPublic(listing) ||
    normalizeStatus(listing.status) !== "active"
  ) {
    return null;
  }

  return {
    id: listing.id,
    title: listing.title,
    propertyAddress: listing.address,
    city: listing.city,
    state: listing.state,
    zipCode: listing.zip_code,
    propertyType: listing.property_type,
    listingType: listing.listing_type,
    listPrice: listing.price,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    sqft: listing.sqft,
    lotSize: listing.lot_size,
    yearBuilt: listing.year_built,
    description: listing.description,
    features: listing.features,
    images: listing.photos,
    status: listing.status,
  };
}
