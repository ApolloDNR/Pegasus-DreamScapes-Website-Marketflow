/**
 * Compatibility Scoring Engine
 * 
 * Calculates match scores between investors and deals using weighted factors:
 * - Property type match: 20%
 * - Strategy alignment: 20%  
 * - Location preference: 15%
 * - Budget fit: 15%
 * - Return expectations: 10%
 * - Structure preference: 10%
 * - Deal quality metrics: 10%
 */

export interface InvestorPreferences {
  propertyTypes?: string[];
  strategies?: string[];
  locations?: string[];
  minBudget?: number;
  maxBudget?: number;
  targetReturnMin?: number;
  targetReturnMax?: number;
  preferredStructure?: string;
  holdPeriodPreference?: string;
  experienceLevel?: "beginner" | "intermediate" | "experienced" | "expert";
  riskTolerance?: "conservative" | "moderate" | "aggressive";
}

export interface CapitalProjectDeal {
  id: number;
  title: string;
  description?: string;
  location?: string;
  fundingGoal: number;
  amountRaised: number;
  minInvestment: number;
  structure: string;
  projectedReturn: string;
  holdPeriod?: string;
  status: string;
  propertyType?: string;
  strategy?: string;
  riskLevel?: string;
  roiPotential?: number;
  designAppeal?: number;
  marketDemand?: number;
  neighborhoodGrade?: string;
  isFeatured?: boolean;
  isHot?: boolean;
}

export interface WholesaleDealData {
  id: number;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: string;
  sqft: number;
  yearBuilt: number;
  contractPrice: number;
  assignmentFee: number;
  arv: number;
  estimatedRepairs: number;
  strategy?: string;
  description?: string;
  riskLevel?: string;
  profitPotential?: number;
  marketDemand?: number;
  neighborhoodGrade?: string;
  isFeatured?: boolean;
  isHot?: boolean;
}

export interface ScoreBreakdown {
  total: number;
  factors: {
    name: string;
    weight: number;
    score: number;
    maxScore: number;
    matched: boolean;
    reason?: string;
  }[];
  matchLevel: "excellent" | "strong" | "good" | "fair" | "low";
  matchLabel: string;
  matchColor: string;
}

const WEIGHTS = {
  propertyType: 20,
  strategy: 20,
  location: 15,
  budget: 15,
  returns: 10,
  structure: 10,
  quality: 10,
};

function normalizeString(str: string | undefined | null): string {
  if (!str) return "";
  return str.toLowerCase().replace(/[-_]/g, " ").trim();
}

function matchesAny(value: string | undefined, options: string[] | undefined): boolean {
  if (!value || !options?.length) return false;
  const normalizedValue = normalizeString(value);
  return options.some(opt => normalizedValue.includes(normalizeString(opt)));
}

function getMatchLevel(score: number): { level: ScoreBreakdown["matchLevel"]; label: string; color: string } {
  if (score >= 90) return { level: "excellent", label: "Excellent Match", color: "text-green-600" };
  if (score >= 75) return { level: "strong", label: "Strong Match", color: "text-emerald-600" };
  if (score >= 60) return { level: "good", label: "Good Match", color: "text-amber-600" };
  if (score >= 45) return { level: "fair", label: "Fair Match", color: "text-orange-600" };
  return { level: "low", label: "Low Match", color: "text-red-600" };
}

export function calculateProjectMatchScore(
  project: CapitalProjectDeal,
  prefs?: InvestorPreferences | null
): ScoreBreakdown {
  const factors: ScoreBreakdown["factors"] = [];
  let baseScore = 50;

  // Property Type Match (20 points)
  const propertyTypeMatched = matchesAny(project.propertyType, prefs?.propertyTypes);
  factors.push({
    name: "Property Type",
    weight: WEIGHTS.propertyType,
    score: propertyTypeMatched ? WEIGHTS.propertyType : (prefs?.propertyTypes?.length ? 5 : 10),
    maxScore: WEIGHTS.propertyType,
    matched: propertyTypeMatched,
    reason: propertyTypeMatched 
      ? `Matches your preference for ${project.propertyType}` 
      : prefs?.propertyTypes?.length 
        ? "Different from your preferred property types"
        : "No preference set",
  });

  // Strategy Alignment (20 points)
  const strategyMatched = matchesAny(project.strategy, prefs?.strategies);
  factors.push({
    name: "Strategy",
    weight: WEIGHTS.strategy,
    score: strategyMatched ? WEIGHTS.strategy : (prefs?.strategies?.length ? 5 : 10),
    maxScore: WEIGHTS.strategy,
    matched: strategyMatched,
    reason: strategyMatched 
      ? `Aligns with your ${project.strategy} strategy` 
      : prefs?.strategies?.length 
        ? "Different investment strategy"
        : "No preference set",
  });

  // Location Preference (15 points)
  const locationMatched = matchesAny(project.location, prefs?.locations);
  factors.push({
    name: "Location",
    weight: WEIGHTS.location,
    score: locationMatched ? WEIGHTS.location : (prefs?.locations?.length ? 3 : 8),
    maxScore: WEIGHTS.location,
    matched: locationMatched,
    reason: locationMatched 
      ? `In your target market (${project.location})` 
      : prefs?.locations?.length 
        ? "Outside your preferred markets"
        : "No location preference",
  });

  // Budget Fit (15 points)
  let budgetScore = 8;
  let budgetMatched = true;
  let budgetReason = "Within typical investment range";
  
  if (prefs?.minBudget || prefs?.maxBudget) {
    const minInv = project.minInvestment || 0;
    if (prefs.maxBudget && minInv > prefs.maxBudget) {
      budgetScore = 0;
      budgetMatched = false;
      budgetReason = "Minimum investment exceeds your budget";
    } else if (prefs.minBudget && minInv < prefs.minBudget * 0.5) {
      budgetScore = 10;
      budgetMatched = true;
      budgetReason = "Investment size available";
    } else {
      budgetScore = WEIGHTS.budget;
      budgetMatched = true;
      budgetReason = "Fits your investment budget";
    }
  }
  
  factors.push({
    name: "Budget",
    weight: WEIGHTS.budget,
    score: budgetScore,
    maxScore: WEIGHTS.budget,
    matched: budgetMatched,
    reason: budgetReason,
  });

  // Return Expectations (10 points)
  let returnScore = 5;
  let returnMatched = false;
  let returnReason = "Returns not specified";
  
  const projReturn = parseFloat(project.projectedReturn?.replace(/[^0-9.]/g, "") || "0");
  if (projReturn > 0) {
    if (prefs?.targetReturnMin && projReturn >= prefs.targetReturnMin) {
      returnScore = WEIGHTS.returns;
      returnMatched = true;
      returnReason = `${projReturn}% meets your ${prefs.targetReturnMin}%+ target`;
    } else if (prefs?.targetReturnMin) {
      returnScore = Math.max(0, WEIGHTS.returns - 5);
      returnReason = `${projReturn}% is below your ${prefs.targetReturnMin}% target`;
    } else {
      returnScore = 8;
      returnMatched = true;
      returnReason = `${projReturn}% projected return`;
    }
  }
  
  factors.push({
    name: "Returns",
    weight: WEIGHTS.returns,
    score: returnScore,
    maxScore: WEIGHTS.returns,
    matched: returnMatched,
    reason: returnReason,
  });

  // Structure Preference (10 points)
  const structureMatched = prefs?.preferredStructure 
    ? normalizeString(project.structure).includes(normalizeString(prefs.preferredStructure))
    : true;
  
  factors.push({
    name: "Structure",
    weight: WEIGHTS.structure,
    score: structureMatched ? WEIGHTS.structure : 3,
    maxScore: WEIGHTS.structure,
    matched: structureMatched,
    reason: structureMatched 
      ? `${project.structure} structure` 
      : "Different investment structure",
  });

  // Deal Quality Metrics (10 points)
  let qualityScore = 5;
  const qualityFactors: string[] = [];
  
  if (project.roiPotential && project.roiPotential >= 4) {
    qualityScore += 2;
    qualityFactors.push("High ROI potential");
  }
  if (project.marketDemand && project.marketDemand >= 4) {
    qualityScore += 2;
    qualityFactors.push("Strong market demand");
  }
  if (project.isFeatured) {
    qualityScore += 1;
    qualityFactors.push("Featured deal");
  }
  if (project.isHot) {
    qualityScore += 1;
    qualityFactors.push("Hot opportunity");
  }
  
  qualityScore = Math.min(qualityScore, WEIGHTS.quality);
  
  factors.push({
    name: "Quality",
    weight: WEIGHTS.quality,
    score: qualityScore,
    maxScore: WEIGHTS.quality,
    matched: qualityScore >= 7,
    reason: qualityFactors.length > 0 ? qualityFactors.join(", ") : "Standard quality metrics",
  });

  // Calculate total score
  const total = Math.min(
    Math.round(factors.reduce((sum, f) => sum + f.score, 0)),
    100
  );

  const { level, label, color } = getMatchLevel(total);

  return {
    total,
    factors,
    matchLevel: level,
    matchLabel: label,
    matchColor: color,
  };
}

export function calculateWholesaleMatchScore(
  deal: WholesaleDealData,
  prefs?: InvestorPreferences | null
): ScoreBreakdown {
  const factors: ScoreBreakdown["factors"] = [];

  // Property Type Match (20 points)
  const propertyTypeMatched = matchesAny(deal.propertyType, prefs?.propertyTypes);
  factors.push({
    name: "Property Type",
    weight: WEIGHTS.propertyType,
    score: propertyTypeMatched ? WEIGHTS.propertyType : (prefs?.propertyTypes?.length ? 5 : 10),
    maxScore: WEIGHTS.propertyType,
    matched: propertyTypeMatched,
    reason: propertyTypeMatched 
      ? `Matches your preference for ${deal.propertyType}` 
      : prefs?.propertyTypes?.length 
        ? "Different property type"
        : "No preference set",
  });

  // Strategy Alignment (20 points)
  const strategyMatched = matchesAny(deal.strategy, prefs?.strategies);
  factors.push({
    name: "Strategy",
    weight: WEIGHTS.strategy,
    score: strategyMatched ? WEIGHTS.strategy : (prefs?.strategies?.length ? 5 : 10),
    maxScore: WEIGHTS.strategy,
    matched: strategyMatched,
    reason: strategyMatched 
      ? `Ideal for ${deal.strategy} strategy` 
      : prefs?.strategies?.length 
        ? "Different from preferred strategy"
        : "No strategy preference",
  });

  // Location Preference (15 points)
  const dealLocation = `${deal.city}, ${deal.state}`;
  const locationMatched = prefs?.locations?.some(loc => 
    dealLocation.toLowerCase().includes(loc.toLowerCase())
  );
  
  factors.push({
    name: "Location",
    weight: WEIGHTS.location,
    score: locationMatched ? WEIGHTS.location : (prefs?.locations?.length ? 3 : 8),
    maxScore: WEIGHTS.location,
    matched: !!locationMatched,
    reason: locationMatched 
      ? `In your target market (${dealLocation})` 
      : prefs?.locations?.length 
        ? "Outside your preferred markets"
        : "No location preference",
  });

  // Budget Fit (15 points)
  const totalCost = deal.contractPrice + deal.assignmentFee;
  let budgetScore = 8;
  let budgetMatched = true;
  let budgetReason = "Within typical acquisition range";
  
  if (prefs?.maxBudget) {
    if (totalCost <= prefs.maxBudget) {
      budgetScore = WEIGHTS.budget;
      budgetMatched = true;
      budgetReason = `Total cost fits your ${formatCurrency(prefs.maxBudget)} budget`;
    } else {
      budgetScore = Math.max(0, WEIGHTS.budget - 10);
      budgetMatched = false;
      budgetReason = `Exceeds your budget by ${formatCurrency(totalCost - prefs.maxBudget)}`;
    }
  }
  
  factors.push({
    name: "Budget",
    weight: WEIGHTS.budget,
    score: budgetScore,
    maxScore: WEIGHTS.budget,
    matched: budgetMatched,
    reason: budgetReason,
  });

  // Returns / Profit Potential (10 points)
  const totalInvestment = totalCost + deal.estimatedRepairs;
  const spread = deal.arv - totalInvestment;
  const roi = totalInvestment > 0 ? (spread / totalInvestment) * 100 : 0;
  
  let returnScore = 5;
  let returnMatched = false;
  let returnReason = "Standard return potential";
  
  if (roi >= 30) {
    returnScore = WEIGHTS.returns;
    returnMatched = true;
    returnReason = `Excellent ${roi.toFixed(0)}% ROI potential`;
  } else if (roi >= 20) {
    returnScore = 8;
    returnMatched = true;
    returnReason = `Strong ${roi.toFixed(0)}% ROI potential`;
  } else if (roi >= 10) {
    returnScore = 5;
    returnReason = `Moderate ${roi.toFixed(0)}% ROI`;
  } else {
    returnScore = 2;
    returnReason = `Low ${roi.toFixed(0)}% ROI`;
  }
  
  factors.push({
    name: "Returns",
    weight: WEIGHTS.returns,
    score: returnScore,
    maxScore: WEIGHTS.returns,
    matched: returnMatched,
    reason: returnReason,
  });

  // Structure (for wholesale, this is deal structure like assignment/double-close)
  factors.push({
    name: "Structure",
    weight: WEIGHTS.structure,
    score: 8,
    maxScore: WEIGHTS.structure,
    matched: true,
    reason: "Assignment deal",
  });

  // Deal Quality Metrics (10 points)
  let qualityScore = 5;
  const qualityFactors: string[] = [];
  
  if (deal.profitPotential && deal.profitPotential >= 4) {
    qualityScore += 2;
    qualityFactors.push("High profit potential");
  }
  if (deal.marketDemand && deal.marketDemand >= 4) {
    qualityScore += 2;
    qualityFactors.push("Strong market");
  }
  if (deal.isFeatured) {
    qualityScore += 1;
    qualityFactors.push("Featured");
  }
  if (deal.isHot) {
    qualityScore += 1;
    qualityFactors.push("Hot deal");
  }
  
  // 70% rule check
  const maxOffer = deal.arv * 0.7 - deal.estimatedRepairs;
  if (totalCost <= maxOffer) {
    qualityScore += 1;
    qualityFactors.push("Passes 70% rule");
  }
  
  qualityScore = Math.min(qualityScore, WEIGHTS.quality);
  
  factors.push({
    name: "Quality",
    weight: WEIGHTS.quality,
    score: qualityScore,
    maxScore: WEIGHTS.quality,
    matched: qualityScore >= 7,
    reason: qualityFactors.length > 0 ? qualityFactors.join(", ") : "Standard quality",
  });

  // Calculate total score
  const total = Math.min(
    Math.round(factors.reduce((sum, f) => sum + f.score, 0)),
    100
  );

  const { level, label, color } = getMatchLevel(total);

  return {
    total,
    factors,
    matchLevel: level,
    matchLabel: label,
    matchColor: color,
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-500";
  if (score >= 75) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  if (score >= 45) return "text-orange-500";
  return "text-red-500";
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return "bg-green-50 dark:bg-green-950/30";
  if (score >= 75) return "bg-emerald-50 dark:bg-emerald-950/30";
  if (score >= 60) return "bg-amber-50 dark:bg-amber-950/30";
  if (score >= 45) return "bg-orange-50 dark:bg-orange-950/30";
  return "bg-red-50 dark:bg-red-950/30";
}
