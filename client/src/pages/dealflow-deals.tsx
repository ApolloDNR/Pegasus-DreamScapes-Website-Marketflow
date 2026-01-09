import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { DealflowLayout } from "@/components/dealflow-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useDealAction } from "@/contexts/deal-action-context";
import {
  CapitalProjectMatchCard,
  CapitalProjectGridCard,
  WholesaleDealMatchCard,
  WholesaleDealGridCard,
  type CapitalProject,
  type WholesaleDeal,
} from "@/components/deal-cards";
import {
  calculateProjectMatchScore,
  calculateWholesaleMatchScore,
  type InvestorPreferences,
} from "@/lib/compatibility-score";
import { 
  Building2, 
  Search,
  Loader2,
  Home,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  MessageCircle,
  LayoutGrid,
  Layers,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";

interface DealFilters {
  propertyType: string;
  strategy: string;
  minMatchScore: number;
  riskLevel: string;
  minBudget: string;
  maxBudget: string;
  status: string;
}

const defaultFilters: DealFilters = {
  propertyType: "all",
  strategy: "all",
  minMatchScore: 0,
  riskLevel: "all",
  minBudget: "",
  maxBudget: "",
  status: "all",
};

const PROPERTY_TYPES = [
  { value: "all", label: "All Property Types" },
  { value: "single-family", label: "Single Family" },
  { value: "multi-family", label: "Multi-Family" },
  { value: "townhouse", label: "Townhouse" },
  { value: "condo", label: "Condo" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  { value: "mixed-use", label: "Mixed Use" },
];

const STRATEGIES = [
  { value: "all", label: "All Strategies" },
  { value: "flip", label: "Fix & Flip" },
  { value: "rental", label: "Buy & Hold" },
  { value: "brrrr", label: "BRRRR" },
  { value: "wholesale", label: "Wholesale" },
  { value: "development", label: "Development" },
];

const RISK_LEVELS = [
  { value: "all", label: "All Risk Levels" },
  { value: "low", label: "Low Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "high", label: "High Risk" },
];

const MATCH_SCORES = [
  { value: 0, label: "Any Match" },
  { value: 60, label: "60%+ Match" },
  { value: 75, label: "75%+ Match" },
  { value: 90, label: "90%+ Match" },
];

export default function DealflowDeals() {
  const { user, profile, isAdmin, isWholesaler, isDreamscaper, isInvestor, isBuyer } = useSupabaseAuth();
  
  // Determine user role for role-specific CTAs
  const getUserRole = (): "dreamscaper" | "wholesaler" | "investor" | "buyer" | "admin" | undefined => {
    if (isAdmin) return "admin";
    if (isDreamscaper) return "dreamscaper";
    if (isWholesaler) return "wholesaler";
    if (isInvestor) return "investor";
    if (isBuyer) return "buyer";
    return undefined;
  };
  const userRole = getUserRole();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentDealIndex, setCurrentDealIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"deck" | "grid">("deck");
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DealFilters>(defaultFilters);
  const { openDealAction, openInStudio } = useDealAction();

  const { data: capitalProjects = [], isLoading: loadingProjects } = useQuery<CapitalProject[]>({
    queryKey: ["/api/capital-projects"],
  });

  const { data: wholesaleDeals = [], isLoading: loadingDeals } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/wholesale-deals-active"],
  });

  // Fetch user's investment preferences for matching
  const { data: investorPrefs } = useQuery<InvestorPreferences>({
    queryKey: ["/api/my-investor-preferences"],
    enabled: !!user,
  });

  // Mutation for saving deal actions
  const saveDealActionMutation = useMutation({
    mutationFn: async ({ dealType, dealId, action }: { dealType: string; dealId: number; action: string }) => {
      const res = await apiRequest("POST", "/api/deals/action", { dealType, dealId, action });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals/saved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deals/liked"] });
    },
  });

  const isLoading = loadingProjects || loadingDeals;

  // Scoring functions that use the new engine with breakdowns
  const getProjectScore = (project: CapitalProject) => {
    return calculateProjectMatchScore(project, investorPrefs);
  };

  const getWholesaleScore = (deal: WholesaleDeal) => {
    return calculateWholesaleMatchScore(deal, investorPrefs);
  };

  // Count active filters for badge display
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "minMatchScore") return value > 0;
    if (key === "minBudget" || key === "maxBudget") return value !== "";
    return value !== "all";
  }).length;

  // Reset filters and indices when filters change
  const updateFilter = (key: keyof DealFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentProjectIndex(0);
    setCurrentDealIndex(0);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setCurrentProjectIndex(0);
    setCurrentDealIndex(0);
  };

  // Advanced filtering for capital projects
  const openProjects = capitalProjects.filter(p => {
    // Status check
    if (!(p.status === "OPEN_FOR_INVESTMENT" || p.status === "FUNDED")) return false;
    
    // Search query
    if (searchQuery !== "" && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.location?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Property type filter
    if (filters.propertyType !== "all" && p.propertyType?.toLowerCase() !== filters.propertyType.toLowerCase()) {
      return false;
    }
    
    // Strategy filter
    if (filters.strategy !== "all" && !p.strategy?.toLowerCase().includes(filters.strategy.toLowerCase())) {
      return false;
    }
    
    // Risk level filter
    if (filters.riskLevel !== "all" && p.riskLevel?.toLowerCase() !== filters.riskLevel.toLowerCase()) {
      return false;
    }
    
    // Match score filter
    if (filters.minMatchScore > 0) {
      const score = getProjectScore(p).total;
      if (score < filters.minMatchScore) return false;
    }
    
    // Budget filter - for capital projects, use minInvestment as the cost basis
    // minBudget: filter out projects where min investment is BELOW user's minimum
    // maxBudget: filter out projects where min investment is ABOVE user's maximum
    const projectMinInvestment = p.minInvestment || 0;
    
    if (filters.minBudget) {
      const minBudget = parseInt(filters.minBudget);
      if (!Number.isNaN(minBudget) && projectMinInvestment < minBudget) {
        return false;
      }
    }
    
    if (filters.maxBudget) {
      const maxBudget = parseInt(filters.maxBudget);
      if (!Number.isNaN(maxBudget) && projectMinInvestment > maxBudget) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => getProjectScore(b).total - getProjectScore(a).total);

  // Advanced filtering for wholesale deals
  const activeDeals = wholesaleDeals.filter(d => {
    // Status check
    if (d.status !== "available") return false;
    
    // Search query
    if (searchQuery !== "" && !d.propertyAddress?.toLowerCase().includes(searchQuery.toLowerCase()) && !d.city?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Property type filter
    if (filters.propertyType !== "all" && d.propertyType?.toLowerCase() !== filters.propertyType.toLowerCase()) {
      return false;
    }
    
    // Strategy filter
    if (filters.strategy !== "all" && d.strategy?.toLowerCase() !== filters.strategy.toLowerCase()) {
      return false;
    }
    
    // Risk level filter
    if (filters.riskLevel !== "all" && d.riskLevel?.toLowerCase() !== filters.riskLevel.toLowerCase()) {
      return false;
    }
    
    // Match score filter
    if (filters.minMatchScore > 0) {
      const score = getWholesaleScore(d).total;
      if (score < filters.minMatchScore) return false;
    }
    
    // Budget filter (total acquisition cost for wholesale = contract + assignment fee)
    const totalCost = (d.contractPrice || 0) + (d.assignmentFee || 0);
    
    if (filters.minBudget) {
      const minBudget = parseInt(filters.minBudget);
      if (!Number.isNaN(minBudget) && totalCost < minBudget) {
        return false;
      }
    }
    
    if (filters.maxBudget) {
      const maxBudget = parseInt(filters.maxBudget);
      if (!Number.isNaN(maxBudget) && totalCost > maxBudget) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => getWholesaleScore(b).total - getWholesaleScore(a).total);

  const handleSwipeAction = (action: "like" | "pass" | "save", type: "project" | "deal") => {
    const items = type === "project" ? openProjects : activeDeals;
    const currentIndex = type === "project" ? currentProjectIndex : currentDealIndex;
    const currentItem = items[currentIndex];
    
    // Don't allow swiping if at end of deck or no item
    if (!currentItem || currentIndex >= items.length) {
      return;
    }
    
    if (user) {
      saveDealActionMutation.mutate({
        dealType: type === "project" ? "capital_project" : "wholesale_deal",
        dealId: currentItem.id,
        action,
      }, {
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save action. Please try again.",
            variant: "destructive",
          });
        }
      });
    }
    
    setSwipeDirection(action === "like" ? "right" : "left");
    
    setTimeout(() => {
      setSwipeDirection(null);
      // Advance to next card (allow going past the end to show "end of deck")
      if (type === "project") {
        setCurrentProjectIndex(prev => prev + 1);
      } else {
        setCurrentDealIndex(prev => prev + 1);
      }
    }, 300);

    if (action === "like") {
      toast({
        title: "Saved to your matches!",
        description: "This deal has been added to your saved list.",
      });
    } else if (action === "save") {
      toast({
        title: "Bookmarked!",
        description: "You can find this in your saved deals.",
      });
    }
  };

  const currentProject = openProjects[currentProjectIndex];
  const currentDeal = activeDeals[currentDealIndex];

  const openNegotiation = (type: "capital_project" | "wholesale_deal", item: any) => {
    if (type === "capital_project") {
      openDealAction(item.id, "capital_accept");
    } else {
      openDealAction(item.id, "wholesale_accept");
    }
  };

  // Handler for Dreamscaper/Investor to invest in a wholesale deal
  const handleInvestInDeal = (deal: WholesaleDeal) => {
    openDealAction(deal.id, "wholesale_accept");
    toast({
      title: "Investment Offer",
      description: `Opening investment dialog for ${deal.propertyAddress}`,
    });
  };

  // Handler for Wholesaler to request JV partner
  const handleRequestJV = (deal: WholesaleDeal) => {
    openDealAction(deal.id, "wholesale_jv");
    toast({
      title: "JV Partner Request",
      description: `You're requesting a JV partnership for this deal. The other wholesaler may have a buyer ready.`,
    });
  };

  return (
    <DealflowLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold mb-1">Discover Deals</h1>
              <p className="text-muted-foreground">
                Find your perfect investment match
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === "deck" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("deck")}
                data-testid="button-view-deck"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Match View
              </Button>
              <Button 
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                data-testid="button-view-grid"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Grid View
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by location, project name, strategy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-deals"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
              className="shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <Card className="p-4">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter Deals
                  </h3>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                      <X className="w-4 h-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Property Type</label>
                    <Select 
                      value={filters.propertyType} 
                      onValueChange={(v) => updateFilter("propertyType", v)}
                    >
                      <SelectTrigger data-testid="select-property-type">
                        <SelectValue placeholder="All Property Types" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Strategy</label>
                    <Select 
                      value={filters.strategy} 
                      onValueChange={(v) => updateFilter("strategy", v)}
                    >
                      <SelectTrigger data-testid="select-strategy">
                        <SelectValue placeholder="All Strategies" />
                      </SelectTrigger>
                      <SelectContent>
                        {STRATEGIES.map(strategy => (
                          <SelectItem key={strategy.value} value={strategy.value}>
                            {strategy.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Risk Level</label>
                    <Select 
                      value={filters.riskLevel} 
                      onValueChange={(v) => updateFilter("riskLevel", v)}
                    >
                      <SelectTrigger data-testid="select-risk-level">
                        <SelectValue placeholder="All Risk Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        {RISK_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Match Score</label>
                    <Select 
                      value={filters.minMatchScore.toString()} 
                      onValueChange={(v) => updateFilter("minMatchScore", parseInt(v))}
                    >
                      <SelectTrigger data-testid="select-match-score">
                        <SelectValue placeholder="Any Match" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATCH_SCORES.map(score => (
                          <SelectItem key={score.value} value={score.value.toString()}>
                            {score.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Budget</label>
                    <Input
                      type="number"
                      placeholder="e.g., 50000"
                      value={filters.minBudget}
                      onChange={(e) => updateFilter("minBudget", e.target.value)}
                      data-testid="input-min-budget"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Budget</label>
                    <Input
                      type="number"
                      placeholder="e.g., 500000"
                      value={filters.maxBudget}
                      onChange={(e) => updateFilter("maxBudget", e.target.value)}
                      data-testid="input-max-budget"
                    />
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {filters.propertyType !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {PROPERTY_TYPES.find(t => t.value === filters.propertyType)?.label}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("propertyType", "all")} />
                      </Badge>
                    )}
                    {filters.strategy !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {STRATEGIES.find(s => s.value === filters.strategy)?.label}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("strategy", "all")} />
                      </Badge>
                    )}
                    {filters.riskLevel !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {RISK_LEVELS.find(r => r.value === filters.riskLevel)?.label}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("riskLevel", "all")} />
                      </Badge>
                    )}
                    {filters.minMatchScore > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        {MATCH_SCORES.find(s => s.value === filters.minMatchScore)?.label}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("minMatchScore", 0)} />
                      </Badge>
                    )}
                    {filters.minBudget && (
                      <Badge variant="secondary" className="gap-1">
                        Min: ${parseInt(filters.minBudget).toLocaleString()}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("minBudget", "")} />
                      </Badge>
                    )}
                    {filters.maxBudget && (
                      <Badge variant="secondary" className="gap-1">
                        Max: ${parseInt(filters.maxBudget).toLocaleString()}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("maxBudget", "")} />
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-4">Finding your best matches...</p>
          </div>
        ) : (
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="mb-6 w-full sm:w-auto">
              <TabsTrigger value="projects" className="flex-1 sm:flex-none" data-testid="tab-projects">
                <Building2 className="w-4 h-4 mr-2" />
                Capital Projects ({openProjects.length})
              </TabsTrigger>
              <TabsTrigger value="wholesale" className="flex-1 sm:flex-none" data-testid="tab-wholesale">
                <Home className="w-4 h-4 mr-2" />
                Wholesale ({activeDeals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              {viewMode === "deck" ? (
                <DeckView
                  items={openProjects}
                  currentIndex={currentProjectIndex}
                  setCurrentIndex={setCurrentProjectIndex}
                  swipeDirection={swipeDirection}
                  onSwipe={(action) => handleSwipeAction(action, "project")}
                  renderCard={(project) => {
                    const scoreResult = getProjectScore(project);
                    return (
                      <CapitalProjectMatchCard 
                        project={project} 
                        matchScore={scoreResult.total}
                        scoreBreakdown={scoreResult}
                        onNegotiate={() => openNegotiation("capital_project", project)}
                      />
                    );
                  }}
                  emptyMessage="No capital projects available"
                  emptyIcon={<Building2 className="w-16 h-16 text-muted-foreground" />}
                />
              ) : (
                <GridView
                  items={openProjects}
                  renderCard={(project) => {
                    const scoreResult = getProjectScore(project);
                    return (
                      <CapitalProjectGridCard 
                        project={project} 
                        matchScore={scoreResult.total}
                        scoreBreakdown={scoreResult}
                        onNegotiate={() => openNegotiation("capital_project", project)}
                      />
                    );
                  }}
                  emptyMessage="No capital projects available"
                  emptyIcon={<Building2 className="w-16 h-16 text-muted-foreground" />}
                />
              )}
            </TabsContent>

            <TabsContent value="wholesale">
              {viewMode === "deck" ? (
                <DeckView
                  items={activeDeals}
                  currentIndex={currentDealIndex}
                  setCurrentIndex={setCurrentDealIndex}
                  swipeDirection={swipeDirection}
                  onSwipe={(action) => handleSwipeAction(action, "deal")}
                  renderCard={(deal) => {
                    const scoreResult = getWholesaleScore(deal);
                    return (
                      <WholesaleDealMatchCard 
                        deal={deal}
                        matchScore={scoreResult.total}
                        scoreBreakdown={scoreResult}
                        userRole={userRole}
                        onNegotiate={() => openNegotiation("wholesale_deal", deal)}
                        onInvest={() => handleInvestInDeal(deal)}
                        onRequestJV={() => handleRequestJV(deal)}
                      />
                    );
                  }}
                  emptyMessage="No wholesale deals available"
                  emptyIcon={<Home className="w-16 h-16 text-muted-foreground" />}
                />
              ) : (
                <GridView
                  items={activeDeals}
                  renderCard={(deal) => {
                    const scoreResult = getWholesaleScore(deal);
                    return (
                      <WholesaleDealGridCard 
                        deal={deal}
                        matchScore={scoreResult.total}
                        scoreBreakdown={scoreResult}
                        userRole={userRole}
                        onNegotiate={() => openNegotiation("wholesale_deal", deal)}
                        onInvest={() => handleInvestInDeal(deal)}
                        onRequestJV={() => handleRequestJV(deal)}
                      />
                    );
                  }}
                  emptyMessage="No wholesale deals available"
                  emptyIcon={<Home className="w-16 h-16 text-muted-foreground" />}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

    </DealflowLayout>
  );
}

function DeckView<T extends { id: number }>({
  items,
  currentIndex,
  setCurrentIndex,
  swipeDirection,
  onSwipe,
  renderCard,
  emptyMessage,
  emptyIcon
}: {
  items: T[];
  currentIndex: number;
  setCurrentIndex: (index: number | ((prev: number) => number)) => void;
  swipeDirection: "left" | "right" | null;
  onSwipe: (action: "like" | "pass" | "save") => void;
  renderCard: (item: T) => JSX.Element;
  emptyMessage: string;
  emptyIcon: JSX.Element;
}) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const SWIPE_THRESHOLD = 120;
  const MAX_ROTATION = 15;

  if (items.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-16 text-center">
          {emptyIcon}
          <h3 className="text-xl font-semibold mt-4 mb-2">{emptyMessage}</h3>
          <p className="text-muted-foreground">Check back soon for new opportunities</p>
        </CardContent>
      </Card>
    );
  }

  const currentItem = items[currentIndex];
  const hasNext = currentIndex < items.length - 1;
  const hasPrev = currentIndex > 0;
  const isEndOfDeck = currentIndex >= items.length;

  if (isEndOfDeck) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-16 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
          <p className="text-muted-foreground mb-6">You've reviewed all available deals.</p>
          <div className="flex justify-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setCurrentIndex(0)}
              data-testid="button-start-over"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Start Over
            </Button>
            <Link href="/dealflow/office">
              <Button data-testid="button-view-saved">
                <Heart className="w-4 h-4 mr-2" />
                View Saved Deals
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rotation = Math.min(Math.max((dragX / 300) * MAX_ROTATION, -MAX_ROTATION), MAX_ROTATION);
  const likeOpacity = Math.min(Math.max(dragX / SWIPE_THRESHOLD, 0), 1);
  const passOpacity = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1);

  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragX > SWIPE_THRESHOLD) {
      onSwipe("like");
    } else if (dragX < -SWIPE_THRESHOLD) {
      onSwipe("pass");
    }
    setDragX(0);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} of {items.length} deals
        </span>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            disabled={!hasPrev}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            data-testid="button-prev-deal"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            disabled={!hasNext}
            onClick={() => setCurrentIndex(prev => prev + 1)}
            data-testid="button-next-deal"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        {isDragging && (
          <>
            <motion.div
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-16 h-16 rounded-full bg-red-500 shadow-lg"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: passOpacity, scale: 0.8 + passOpacity * 0.2 }}
              data-testid="swipe-indicator-pass"
            >
              <X className="w-8 h-8 text-white" />
            </motion.div>
            <motion.div
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-16 h-16 rounded-full bg-green-500 shadow-lg"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: likeOpacity, scale: 0.8 + likeOpacity * 0.2 }}
              data-testid="swipe-indicator-like"
            >
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
          </>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            className="cursor-grab active:cursor-grabbing touch-none select-none"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragStart={() => setIsDragging(true)}
            onDrag={(_, info) => setDragX(info.offset.x)}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotate: isDragging ? rotation : 0,
              x: swipeDirection === "right" ? 400 : swipeDirection === "left" ? -400 : 0,
            }}
            exit={{ 
              opacity: 0, 
              x: swipeDirection === "right" ? 400 : swipeDirection === "left" ? -400 : 0,
              rotate: swipeDirection === "right" ? 15 : swipeDirection === "left" ? -15 : 0,
            }}
            transition={{ duration: 0.3 }}
            whileDrag={{ scale: 1.02 }}
            data-testid="swipeable-card"
          >
            <div 
              className={`transition-shadow duration-200 rounded-lg ${
                likeOpacity > 0.3 ? "ring-4 ring-green-400/50 shadow-green-200/50 shadow-xl" :
                passOpacity > 0.3 ? "ring-4 ring-red-400/50 shadow-red-200/50 shadow-xl" : ""
              }`}
            >
              {renderCard(currentItem)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-center mt-3 mb-2">
        <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <span>Drag card to swipe or use buttons below</span>
        </span>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-full w-14 h-14 border-red-200 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => onSwipe("pass")}
              data-testid="button-pass-deal"
            >
              <X className="w-6 h-6 text-red-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Pass</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-full w-14 h-14 border-amber-200 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              onClick={() => onSwipe("save")}
              data-testid="button-save-deal"
            >
              <Bookmark className="w-6 h-6 text-amber-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save for Later</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="lg"
              className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
              onClick={() => onSwipe("like")}
              data-testid="button-like-deal"
            >
              <Heart className="w-7 h-7 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>I'm Interested</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dealflow/messages">
              <Button 
                variant="outline" 
                size="lg"
                className="rounded-full w-14 h-14 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                data-testid="button-message-deal"
              >
                <MessageCircle className="w-6 h-6 text-blue-500" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Request Info</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function GridView<T extends { id: number }>({
  items,
  renderCard,
  emptyMessage,
  emptyIcon
}: {
  items: T[];
  renderCard: (item: T) => JSX.Element;
  emptyMessage: string;
  emptyIcon: JSX.Element;
}) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          {emptyIcon}
          <h3 className="text-xl font-semibold mt-4 mb-2">{emptyMessage}</h3>
          <p className="text-muted-foreground">Check back soon for new opportunities</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <div key={item.id}>
          {renderCard(item)}
        </div>
      ))}
    </div>
  );
}
