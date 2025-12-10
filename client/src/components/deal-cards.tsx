/**
 * Unified Deal Card Components
 * 
 * Reusable card components for displaying capital projects and wholesale deals
 * across the dealflow platform. Features match score display, deal chemistry
 * ratings, and consistent styling.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Home,
  MapPin,
  DollarSign,
  TrendingUp,
  Eye,
  Scale,
  Flame,
  Star,
  Shield,
  Clock,
  Users,
  Bed,
  Bath,
  Square,
  ArrowUpRight,
  Info,
} from "lucide-react";
import type { ScoreBreakdown } from "@/lib/compatibility-score";

export interface CapitalProject {
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
  images?: string[];
  riskLevel?: string;
  designAppeal?: number;
  roiPotential?: number;
  marketDemand?: number;
  neighborhoodGrade?: string;
  strategy?: string;
  propertyType?: string;
  investorCount?: number;
  isFeatured?: boolean;
  isHot?: boolean;
}

export interface WholesaleDeal {
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
  highlights?: string[];
  images?: string[];
  status: string;
  riskLevel?: string;
  profitPotential?: number;
  marketDemand?: number;
  neighborhoodGrade?: string;
  matchScore?: number;
  isFeatured?: boolean;
  isHot?: boolean;
  viewCount?: number;
}

// Utility functions
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString();
}

export function hasValue(value: any): boolean {
  return value !== null && value !== undefined && value !== "";
}

function getChemistryLabel(value: number): { label: string; color: string; bgColor: string } {
  if (value >= 5) return { label: "Exceptional", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-950" };
  if (value >= 4) return { label: "Strong", color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-950" };
  if (value >= 3) return { label: "Good", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-950" };
  if (value >= 2) return { label: "Fair", color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-950" };
  return { label: "Low", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-950" };
}

// Match Score Ring Component with Animation
export function MatchScoreRing({ 
  score, 
  size = "md",
  breakdown,
  animated = true
}: { 
  score: number; 
  size?: "sm" | "md" | "lg";
  breakdown?: ScoreBreakdown;
  animated?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(!animated);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!animated) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [animated]);

  const sizeClasses = {
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-lg",
    lg: "w-20 h-20 text-xl"
  };
  
  const strokeWidth = size === "sm" ? 3 : 4;
  const radius = size === "sm" ? 18 : size === "md" ? 24 : 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-orange-500";
  };

  const ring = (
    <div ref={ref} className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      <svg className="absolute transform -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary"
        />
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={getScoreColor(score)}
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: isVisible ? strokeDashoffset : circumference 
          }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <motion.span 
        className={`font-bold ${getScoreColor(score)}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {score}%
      </motion.span>
    </div>
  );

  if (breakdown) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {ring}
          </div>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-3" side="left">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-semibold">{breakdown.matchLabel}</span>
              <span className={`font-bold ${breakdown.matchColor}`}>{breakdown.total}%</span>
            </div>
            <div className="space-y-1.5">
              {breakdown.factors.map((factor) => (
                <div key={factor.name} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{factor.name}</span>
                  <span className={factor.matched ? "text-green-600" : "text-muted-foreground"}>
                    {factor.score}/{factor.maxScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return ring;
}

// Rating Bar Component with Animation
export function RatingBar({ label, value, max = 5, animated = true }: { label: string; value: number; max?: number; animated?: boolean }) {
  const chemistry = getChemistryLabel(value);
  const percentage = (value / max) * 100;
  const [isVisible, setIsVisible] = useState(!animated);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!animated) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [animated]);
  
  return (
    <div ref={ref} className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-24">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div 
          className={`h-full rounded-full ${
            value >= 4 ? "bg-gradient-to-r from-green-400 to-green-500" :
            value >= 3 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
            "bg-gradient-to-r from-orange-400 to-orange-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: isVisible ? `${percentage}%` : 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 10 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Badge variant="outline" className={`text-xs shrink-0 ${chemistry.color}`}>
          {chemistry.label}
        </Badge>
      </motion.div>
    </div>
  );
}

// Deal Badges Component
function DealBadges({ 
  isHot, 
  isFeatured, 
  riskLevel, 
  holdPeriod,
  status,
  dealType
}: {
  isHot?: boolean;
  isFeatured?: boolean;
  riskLevel?: string;
  holdPeriod?: string;
  status?: string;
  dealType?: "capital" | "wholesale";
}) {
  return (
    <div className="flex gap-2 flex-wrap max-w-[60%]">
      {isHot && (
        <Badge className="bg-red-500 text-white">
          <Flame className="w-3 h-3 mr-1" />
          Hot
        </Badge>
      )}
      {isFeatured && (
        <Badge className="bg-amber-500 text-white">
          <Star className="w-3 h-3 mr-1" />
          Featured
        </Badge>
      )}
      {dealType === "wholesale" && (
        <Badge className="bg-amber-600 text-white">Wholesale</Badge>
      )}
      {status === "FUNDED" && (
        <Badge className="bg-green-600 text-white">Fully Funded</Badge>
      )}
      {riskLevel && (
        <Badge className={`${
          riskLevel === "low" ? "bg-green-600" : 
          riskLevel === "high" ? "bg-red-600" : 
          "bg-amber-600"
        } text-white`}>
          <Shield className="w-3 h-3 mr-1" />
          {riskLevel === "low" ? "Low Risk" : riskLevel === "high" ? "High Risk" : "Mod Risk"}
        </Badge>
      )}
      {holdPeriod && (
        <Badge className="bg-blue-600 text-white">
          <Clock className="w-3 h-3 mr-1" />
          {holdPeriod}
        </Badge>
      )}
    </div>
  );
}

// Capital Project Match Card (for swipe deck view)
export function CapitalProjectMatchCard({ 
  project, 
  matchScore,
  scoreBreakdown,
  onNegotiate 
}: { 
  project: CapitalProject; 
  matchScore: number;
  scoreBreakdown?: ScoreBreakdown;
  onNegotiate?: () => void;
}) {
  const progress = project.fundingGoal > 0 
    ? Math.round((project.amountRaised / project.fundingGoal) * 100) 
    : 0;

  return (
    <Card className="overflow-hidden" data-testid={`match-card-project-${project.id}`}>
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-amber-500/10">
        {project.images && project.images[0] ? (
          <img 
            src={project.images[0]} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-20 h-20 text-primary/30" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3">
          <DealBadges 
            isHot={project.isHot}
            isFeatured={project.isFeatured}
            riskLevel={project.riskLevel}
            holdPeriod={project.holdPeriod}
            status={project.status}
          />
        </div>

        <div className="absolute top-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-full p-1 shadow-lg">
            <MatchScoreRing score={matchScore} size="md" breakdown={scoreBreakdown} />
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{project.title}</h3>
          {project.location && (
            <p className="text-white/80 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {project.location}
            </p>
          )}
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.strategy && (
                <Badge variant="outline" className="text-xs">
                  {project.strategy.replace("-", " & ")}
                </Badge>
              )}
              {project.propertyType && (
                <Badge variant="outline" className="text-xs">
                  {project.propertyType.replace("-", " ")}
                </Badge>
              )}
              {project.neighborhoodGrade && (
                <Badge variant="outline" className="text-xs">
                  Grade {project.neighborhoodGrade}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4 p-3 bg-secondary/30 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Funding Progress</span>
            <span className="text-sm font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="font-medium text-green-600">{formatCurrency(project.amountRaised)}</span>
            <span className="text-muted-foreground">of {formatCurrency(project.fundingGoal)}</span>
          </div>
          {project.investorCount && project.investorCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
              <Users className="w-3 h-3" />
              {project.investorCount} investors committed
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deal Chemistry</p>
          {project.roiPotential && (
            <RatingBar label="ROI Potential" value={project.roiPotential} />
          )}
          {project.designAppeal && (
            <RatingBar label="Design Appeal" value={project.designAppeal} />
          )}
          {project.marketDemand && (
            <RatingBar label="Market Demand" value={project.marketDemand} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="p-2 bg-secondary/50 rounded">
            <p className="text-xs text-muted-foreground">Min Investment</p>
            <p className="font-semibold">{formatCurrency(project.minInvestment)}</p>
          </div>
          <div className="p-2 bg-secondary/50 rounded">
            <p className="text-xs text-muted-foreground">Target Return</p>
            <p className="font-semibold text-green-600">{project.projectedReturn}</p>
          </div>
          <div className="p-2 bg-secondary/50 rounded">
            <p className="text-xs text-muted-foreground">Hold Period</p>
            <p className="font-semibold">{project.holdPeriod}</p>
          </div>
          <div className="p-2 bg-secondary/50 rounded">
            <p className="text-xs text-muted-foreground">Structure</p>
            <p className="font-semibold">{project.structure}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/dealflow/project/${project.id}`} className="flex-1">
            <Button variant="outline" className="w-full" data-testid={`button-view-project-${project.id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>
          {onNegotiate && (
            <Button 
              variant="outline"
              onClick={onNegotiate}
              data-testid={`button-negotiate-project-${project.id}`}
            >
              <Scale className="w-4 h-4 mr-1" />
              Offer
            </Button>
          )}
          <Link href={`/dealflow/project/${project.id}?invest=true`}>
            <Button data-testid={`button-invest-${project.id}`}>
              <DollarSign className="w-4 h-4 mr-1" />
              Invest
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Capital Project Grid Card (for grid view)
export function CapitalProjectGridCard({ 
  project, 
  matchScore,
  scoreBreakdown,
  onNegotiate 
}: { 
  project: CapitalProject; 
  matchScore: number;
  scoreBreakdown?: ScoreBreakdown;
  onNegotiate?: () => void;
}) {
  const progress = project.fundingGoal > 0 
    ? Math.round((project.amountRaised / project.fundingGoal) * 100) 
    : 0;

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`grid-card-project-${project.id}`}>
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5">
        {project.images && project.images[0] ? (
          <img 
            src={project.images[0]} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-primary/30" />
          </div>
        )}
        
        <div className="absolute top-2 left-2 flex gap-1">
          {project.isHot && (
            <Badge className="bg-red-500 text-white text-xs">
              <Flame className="w-3 h-3 mr-1" />Hot
            </Badge>
          )}
        </div>
        
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-0.5">
          <MatchScoreRing score={matchScore} size="sm" breakdown={scoreBreakdown} />
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold line-clamp-1">{project.title}</h3>
        </div>
        
        {project.location && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
            <MapPin className="w-3 h-3" />
            {project.location}
          </p>
        )}

        <div className="space-y-2 mb-3">
          <Progress value={progress} className="h-1.5" />
          <div className="flex justify-between text-xs">
            <span className="font-medium text-green-600">{progress}% funded</span>
            <span className="text-muted-foreground">{formatCurrency(project.fundingGoal)}</span>
          </div>
        </div>

        <div className="flex gap-1 flex-wrap mb-3">
          <Badge variant="secondary" className="text-xs">{project.projectedReturn}</Badge>
          <Badge variant="secondary" className="text-xs">{project.holdPeriod}</Badge>
        </div>

        <div className="flex gap-2">
          <Link href={`/dealflow/project/${project.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-project-grid-${project.id}`}>
              View Details
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
          {onNegotiate && (
            <Button 
              variant="outline"
              size="sm"
              onClick={onNegotiate}
              data-testid={`button-negotiate-project-grid-${project.id}`}
            >
              <Scale className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Wholesale Deal Match Card (for swipe deck view)
export function WholesaleDealMatchCard({ 
  deal, 
  matchScore,
  scoreBreakdown,
  onNegotiate 
}: { 
  deal: WholesaleDeal; 
  matchScore?: number;
  scoreBreakdown?: ScoreBreakdown;
  onNegotiate?: () => void;
}) {
  const totalCost = deal.contractPrice + deal.assignmentFee + deal.estimatedRepairs;
  const spread = deal.arv - totalCost;
  const roi = totalCost > 0 ? ((spread / totalCost) * 100).toFixed(1) : "0";
  const displayScore = matchScore ?? deal.matchScore ?? 75;

  return (
    <Card className="overflow-hidden" data-testid={`match-card-deal-${deal.id}`}>
      <div className="relative aspect-video bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-primary/10">
        {deal.images && deal.images[0] ? (
          <img 
            src={deal.images[0]} 
            alt={deal.propertyAddress}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-20 h-20 text-amber-500/30" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3">
          <DealBadges 
            isHot={deal.isHot}
            isFeatured={deal.isFeatured}
            riskLevel={deal.riskLevel}
            dealType="wholesale"
          />
          {deal.strategy && (
            <Badge className="bg-blue-600 text-white mt-2">
              {deal.strategy === "flip" ? "Flip" : deal.strategy === "rental" ? "Rental" : deal.strategy}
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-full p-1 shadow-lg">
            <MatchScoreRing score={displayScore} size="md" breakdown={scoreBreakdown} />
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{deal.propertyAddress}</h3>
          <p className="text-white/80 text-sm flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {deal.city}, {deal.state} {deal.zipCode}
          </p>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-center gap-4 text-sm mb-4 p-3 bg-secondary/30 rounded-lg flex-wrap">
          {hasValue(deal.bedrooms) && (
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{deal.bedrooms}</span> bd
            </span>
          )}
          {hasValue(deal.bathrooms) && (
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{deal.bathrooms}</span> ba
            </span>
          )}
          {hasValue(deal.sqft) && (
            <span className="flex items-center gap-1">
              <Square className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{formatNumber(deal.sqft)}</span> sqft
            </span>
          )}
          {hasValue(deal.yearBuilt) && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{deal.yearBuilt}</span>
            </span>
          )}
          {!hasValue(deal.bedrooms) && !hasValue(deal.bathrooms) && !hasValue(deal.sqft) && (
            <span className="text-muted-foreground italic">Property details not available</span>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {deal.description}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Contract + Fee</p>
            <p className="text-lg font-bold">{formatCurrency(deal.contractPrice + deal.assignmentFee)}</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">ARV</p>
            <p className="text-lg font-bold">{formatCurrency(deal.arv)}</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Est. Repairs</p>
            <p className="font-semibold">{formatCurrency(deal.estimatedRepairs)}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-700 dark:text-green-400">Potential Profit</p>
            <p className={`font-bold text-lg ${spread > 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(spread)}
            </p>
            <p className="text-xs text-green-600">{roi}% ROI</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deal Quality</p>
          {deal.profitPotential && (
            <RatingBar label="Profit Potential" value={deal.profitPotential} />
          )}
          {deal.marketDemand && (
            <RatingBar label="Market Demand" value={deal.marketDemand} />
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/dealflow/deal/${deal.id}`} className="flex-1">
            <Button variant="outline" className="w-full" data-testid={`button-view-deal-${deal.id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>
          {onNegotiate && (
            <Button 
              variant="outline"
              onClick={onNegotiate}
              data-testid={`button-negotiate-deal-${deal.id}`}
            >
              <Scale className="w-4 h-4 mr-1" />
              Offer
            </Button>
          )}
          <Link href={`/dealflow/deal/${deal.id}?inquire=true`}>
            <Button data-testid={`button-inquire-deal-${deal.id}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              Inquire
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Wholesale Deal Grid Card (for grid view)
export function WholesaleDealGridCard({ 
  deal, 
  matchScore,
  scoreBreakdown,
  onNegotiate 
}: { 
  deal: WholesaleDeal; 
  matchScore?: number;
  scoreBreakdown?: ScoreBreakdown;
  onNegotiate?: () => void;
}) {
  const totalCost = deal.contractPrice + deal.assignmentFee + deal.estimatedRepairs;
  const spread = deal.arv - totalCost;
  const roi = totalCost > 0 ? ((spread / totalCost) * 100).toFixed(1) : "0";
  const displayScore = matchScore ?? deal.matchScore ?? 75;

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`grid-card-deal-${deal.id}`}>
      <div className="relative aspect-video bg-gradient-to-br from-amber-500/20 to-amber-500/5">
        {deal.images && deal.images[0] ? (
          <img 
            src={deal.images[0]} 
            alt={deal.propertyAddress}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-12 h-12 text-amber-500/30" />
          </div>
        )}
        
        <div className="absolute top-2 left-2 flex gap-1">
          {deal.isHot && (
            <Badge className="bg-red-500 text-white text-xs">
              <Flame className="w-3 h-3 mr-1" />Hot
            </Badge>
          )}
          <Badge className="bg-amber-600 text-white text-xs">Wholesale</Badge>
        </div>
        
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-0.5">
          <MatchScoreRing score={displayScore} size="sm" breakdown={scoreBreakdown} />
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-1 mb-1">{deal.propertyAddress}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
          <MapPin className="w-3 h-3" />
          {deal.city}, {deal.state}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
          {hasValue(deal.bedrooms) && <span>{deal.bedrooms} bd</span>}
          {hasValue(deal.bathrooms) && <span>{deal.bathrooms} ba</span>}
          {hasValue(deal.sqft) && <span>{formatNumber(deal.sqft)} sqft</span>}
          {!hasValue(deal.bedrooms) && !hasValue(deal.bathrooms) && !hasValue(deal.sqft) && (
            <span className="italic">Details pending</span>
          )}
        </div>

        <div className="flex justify-between items-center mb-3 p-2 bg-green-50 dark:bg-green-950/30 rounded">
          <span className="text-xs text-muted-foreground">Profit</span>
          <span className={`font-bold ${spread > 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(spread)} ({roi}%)
          </span>
        </div>

        <div className="flex gap-2">
          <Link href={`/dealflow/deal/${deal.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-deal-grid-${deal.id}`}>
              View Details
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
          {onNegotiate && (
            <Button 
              variant="outline"
              size="sm"
              onClick={onNegotiate}
              data-testid={`button-negotiate-deal-grid-${deal.id}`}
            >
              <Scale className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact Card for lists (used in off-market listings, etc.)
export function WholesaleDealCompactCard({ deal }: { deal: WholesaleDeal }) {
  const totalCost = deal.contractPrice + deal.assignmentFee;
  
  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`compact-card-deal-${deal.id}`}>
      <div className="flex">
        <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-amber-500/20 to-amber-500/5 relative">
          {deal.images && deal.images.length > 0 ? (
            <img 
              src={deal.images[0]} 
              alt={deal.propertyAddress}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Home className="w-8 h-8 text-amber-500/50" />
            </div>
          )}
          <Badge variant="default" className="absolute top-2 left-2 text-[10px] bg-amber-600">
            Wholesale
          </Badge>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h4 className="font-semibold line-clamp-1">{deal.propertyAddress}</h4>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {deal.city}, {deal.state}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold">{formatCurrency(totalCost)}</span>
            <Link href={`/dealflow/deal/${deal.id}`}>
              <Button size="sm" variant="outline" data-testid={`button-view-compact-${deal.id}`}>
                View
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
