type Row = Record<string, any>;

const normalizeStatus = (status: unknown) =>
  typeof status === "string" ? status.trim().toLowerCase() : "";

export function isPublicWholesaleDeal(deal: Row): boolean {
  return ["active", "available", "approved", "listed"].includes(
    normalizeStatus(deal.status),
  );
}

export function isPublicListing(listing: Row): boolean {
  return ["active", "coming_soon"].includes(normalizeStatus(listing.status));
}

export function isPublicCapitalProject(project: Row): boolean {
  return [
    "active",
    "funding",
    "open_for_investment",
    "funded",
    "in_progress",
    "completed",
  ].includes(normalizeStatus(project.status));
}

export function canRequestMarketflowJv({
  viewerId,
  ownerId,
  canInitiateJv,
}: {
  viewerId?: string | null;
  ownerId?: string | null;
  canInitiateJv: boolean;
}): boolean {
  return Boolean(
    canInitiateJv &&
      viewerId &&
      ownerId &&
      ownerId !== viewerId,
  );
}

export function resolveWholesaleDealOwnerId(deal: Row): string | null {
  const ownerId = [
    deal.submittedBy,
    deal.wholesalerId,
    deal.externalWholesalerId,
    deal.wholesaler_id,
    deal.external_wholesaler_id,
  ].find((candidate) => typeof candidate === "string" && candidate.trim());
  return typeof ownerId === "string" ? ownerId.trim() : null;
}

export function toPublicWholesaleDeal(
  deal: Row,
  viewerId?: string | null,
  canInitiateJv = false,
) {
  const ownerId = resolveWholesaleDealOwnerId(deal);
  return {
    id: deal.id,
    propertyAddress: deal.propertyAddress,
    city: deal.city,
    state: deal.state,
    zipCode: deal.zipCode,
    county: deal.county,
    propertyType: deal.propertyType,
    bedrooms: deal.bedrooms,
    bathrooms: deal.bathrooms,
    sqft: deal.sqft,
    yearBuilt: deal.yearBuilt,
    lotSize: deal.lotSize,
    contractPrice: deal.contractPrice,
    assignmentFee: deal.assignmentFee,
    askingPrice:
      typeof deal.contractPrice === "number" &&
      typeof deal.assignmentFee === "number"
        ? deal.contractPrice + deal.assignmentFee
        : undefined,
    arv: deal.arv,
    estimatedRepairs: deal.estimatedRepairs,
    repairDetails: deal.repairDetails,
    closingDate: deal.closingDate,
    occupancyStatus: deal.occupancyStatus,
    strategy: deal.strategy,
    exitStrategy: deal.exitStrategy,
    description: deal.description,
    highlights: deal.highlights,
    images: deal.images,
    idealBuyerType: deal.idealBuyerType,
    buyerExperienceRequired: deal.buyerExperienceRequired,
    proofOfFundsRequired: deal.proofOfFundsRequired,
    status: deal.status,
    riskLevel: deal.riskLevel,
    profitPotential: deal.profitPotential,
    marketDemand: deal.marketDemand,
    neighborhoodGrade: deal.neighborhoodGrade,
    matchScore: deal.matchScore,
    dealScore: deal.dealScore,
    isFeatured: deal.isFeatured,
    isHot: deal.isHot,
    daysOnMarket: deal.daysOnMarket,
    canRequestJv: canRequestMarketflowJv({
      viewerId,
      ownerId,
      canInitiateJv,
    }),
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
  };
}

export function toPublicListing(listing: Row) {
  return {
    id: listing.id,
    propertyAddress: listing.propertyAddress,
    city: listing.city,
    state: listing.state,
    zipCode: listing.zipCode,
    county: listing.county,
    propertyType: listing.propertyType,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    sqft: listing.sqft,
    yearBuilt: listing.yearBuilt,
    lotSize: listing.lotSize,
    listingType: listing.listingType,
    listPrice: listing.listPrice,
    pricePerSqft: listing.pricePerSqft,
    condition: listing.condition,
    renovationYear: listing.renovationYear,
    amenities: listing.amenities,
    hoa: listing.hoa,
    description: listing.description,
    highlights: listing.highlights,
    images: listing.images,
    virtualTourUrl: listing.virtualTourUrl,
    occupancyStatus: listing.occupancyStatus,
    availableDate: listing.availableDate,
    agentName: listing.agentName,
    agentPhone: listing.agentPhone,
    agentEmail: listing.agentEmail,
    status: listing.status,
    daysOnMarket: listing.daysOnMarket,
    isFeatured: listing.isFeatured,
    listedAt: listing.listedAt,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

export function toPublicRetailListing(listing: Row) {
  return {
    id: listing.id,
    slug: listing.slug,
    propertyAddress: listing.propertyAddress,
    city: listing.city,
    state: listing.state,
    zipCode: listing.zipCode,
    propertyType: listing.propertyType,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    sqft: listing.sqft,
    yearBuilt: listing.yearBuilt,
    lotSize: listing.lotSize,
    listPrice: listing.listPrice,
    description: listing.description,
    features: listing.features,
    highlights: listing.highlights,
    images: listing.images,
    virtualTourUrl: listing.virtualTourUrl,
    listingSource: listing.listingSource,
    mlsNumber: listing.mlsNumber,
    status: listing.status,
    featured: listing.featured,
    listedAt: listing.listedAt,
    soldAt: listing.soldAt,
    soldPrice: listing.soldPrice,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

export function toPublicCapitalProject(project: Row) {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    location: project.location,
    scopeOfWork: project.scopeOfWork,
    fundingGoal: project.fundingGoal,
    amountRaised: project.amountRaised,
    minInvestment: project.minInvestment,
    maxInvestmentPerInvestor: project.maxInvestmentPerInvestor,
    structure: project.structure,
    projectedReturn: project.projectedReturn,
    holdPeriod: project.holdPeriod,
    askingInterestRate: project.askingInterestRate,
    askingLoanDuration: project.askingLoanDuration,
    askingPoints: project.askingPoints,
    askingEquityPercent: project.askingEquityPercent,
    askingProfitSplit: project.askingProfitSplit,
    askingPreferredReturn: project.askingPreferredReturn,
    askingDebtPortion: project.askingDebtPortion,
    askingEquityPortion: project.askingEquityPortion,
    purchasePrice: project.purchasePrice,
    rehabBudget: project.rehabBudget,
    softCosts: project.softCosts,
    operatorEquity: project.operatorEquity,
    contingency: project.contingency,
    seniorLoan: project.seniorLoan,
    projectedARV: project.projectedARV,
    projectedProfit: project.projectedProfit,
    projectedProfitLow: project.projectedProfitLow,
    projectedProfitHigh: project.projectedProfitHigh,
    status: project.status,
    startDate: project.startDate,
    estimatedCompletion: project.estimatedCompletion,
    acquisitionDate: project.acquisitionDate,
    constructionStart: project.constructionStart,
    constructionEnd: project.constructionEnd,
    stabilizationDate: project.stabilizationDate,
    exitDate: project.exitDate,
    images: project.images,
    riskLevel: project.riskLevel,
    designAppeal: project.designAppeal,
    roiPotential: project.roiPotential,
    marketDemand: project.marketDemand,
    neighborhoodGrade: project.neighborhoodGrade,
    strategy: project.strategy,
    propertyType: project.propertyType,
    investorCount: project.investorCount,
    isFeatured: project.isFeatured,
    isHot: project.isHot,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export function toPublicInvestorWantedDeal(deal: Row) {
  return {
    id: deal.id,
    title: deal.title,
    description: deal.description,
    propertyTypes: deal.propertyTypes,
    strategies: deal.strategies,
    locations: deal.locations,
    preferredStructure: deal.preferredStructure,
    urgency: deal.urgency,
    holdPeriodPreference: deal.holdPeriodPreference,
    isFeatured: deal.isFeatured,
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
  };
}

export function toPublicUserProfile(user: Row) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    createdAt: user.createdAt,
  };
}
