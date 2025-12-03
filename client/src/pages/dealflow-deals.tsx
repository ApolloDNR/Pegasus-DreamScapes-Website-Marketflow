import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { DealflowLayout } from "@/components/dealflow-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { DealNegotiationDialog } from "@/components/deal-negotiation-dialog";
import { 
  Building2, 
  DollarSign, 
  MapPin,
  Search,
  Loader2,
  Home,
  TrendingUp,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Sparkles,
  Target,
  Users,
  Eye,
  Bookmark,
  MessageCircle,
  Shield,
  Zap,
  BarChart3,
  Bed,
  Bath,
  Square,
  Clock,
  ThumbsUp,
  ArrowUpRight,
  CheckCircle2,
  Scale
} from "lucide-react";
import { Link } from "wouter";

interface CapitalProject {
  id: number;
  title: string;
  description: string;
  location: string;
  fundingGoal: number;
  amountRaised: number;
  minInvestment: number;
  structure: string;
  projectedReturn: string;
  holdPeriod: string;
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

interface WholesaleDeal {
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
  strategy: string;
  description: string;
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

export default function DealflowDeals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentDealIndex, setCurrentDealIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"deck" | "grid">("deck");
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [negotiationOpen, setNegotiationOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<{
    type: "capital_project" | "wholesale_deal";
    id: number;
    title: string;
    responderId: string;
    structure?: string;
  } | null>(null);

  const { data: capitalProjects = [], isLoading: loadingProjects } = useQuery<CapitalProject[]>({
    queryKey: ["/api/capital-projects"],
  });

  const { data: wholesaleDeals = [], isLoading: loadingDeals } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/wholesale-deals-active"],
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const openProjects = capitalProjects.filter(p => 
    (p.status === "OPEN_FOR_INVESTMENT" || p.status === "FUNDED") && 
    (searchQuery === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeDeals = wholesaleDeals.filter(d => 
    d.status === "available" &&
    (searchQuery === "" || d.propertyAddress?.toLowerCase().includes(searchQuery.toLowerCase()) || d.city?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isLoading = loadingProjects || loadingDeals;

  const calculateMatchScore = (project: CapitalProject) => {
    let score = 75;
    if (project.roiPotential) score += project.roiPotential * 3;
    if (project.designAppeal) score += project.designAppeal * 2;
    if (project.marketDemand) score += project.marketDemand * 2;
    if (project.isFeatured) score += 5;
    if (project.isHot) score += 3;
    return Math.min(score, 100);
  };

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
    setSelectedDeal({
      type,
      id: item.id,
      title: type === "capital_project" ? item.title : `${item.propertyAddress}, ${item.city}`,
      responderId: type === "capital_project" ? "staff" : (item.submittedBy || "staff"),
      structure: item.structure,
    });
    setNegotiationOpen(true);
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

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by location, project name, strategy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-deals"
          />
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
                  renderCard={(project) => (
                    <ProjectMatchCard 
                      project={project} 
                      matchScore={calculateMatchScore(project)}
                      onNegotiate={() => openNegotiation("capital_project", project)}
                    />
                  )}
                  emptyMessage="No capital projects available"
                  emptyIcon={<Building2 className="w-16 h-16 text-muted-foreground" />}
                />
              ) : (
                <GridView
                  items={openProjects}
                  renderCard={(project) => (
                    <ProjectGridCard 
                      project={project} 
                      matchScore={calculateMatchScore(project)}
                      onNegotiate={() => openNegotiation("capital_project", project)}
                    />
                  )}
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
                  renderCard={(deal) => (
                    <WholesaleMatchCard 
                      deal={deal}
                      onNegotiate={() => openNegotiation("wholesale_deal", deal)}
                    />
                  )}
                  emptyMessage="No wholesale deals available"
                  emptyIcon={<Home className="w-16 h-16 text-muted-foreground" />}
                />
              ) : (
                <GridView
                  items={activeDeals}
                  renderCard={(deal) => (
                    <WholesaleGridCard 
                      deal={deal}
                      onNegotiate={() => openNegotiation("wholesale_deal", deal)}
                    />
                  )}
                  emptyMessage="No wholesale deals available"
                  emptyIcon={<Home className="w-16 h-16 text-muted-foreground" />}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {selectedDeal && (
        <DealNegotiationDialog
          open={negotiationOpen}
          onOpenChange={setNegotiationOpen}
          dealType={selectedDeal.type}
          dealId={selectedDeal.id}
          dealTitle={selectedDeal.title}
          responderId={selectedDeal.responderId}
          existingStructure={selectedDeal.structure}
          onSuccess={() => setNegotiationOpen(false)}
        />
      )}
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

  // Show end of deck message when user has swiped through all items
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

      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: swipeDirection === "right" ? 100 : swipeDirection === "left" ? -100 : 0,
          }}
          exit={{ 
            opacity: 0, 
            x: swipeDirection === "right" ? 300 : swipeDirection === "left" ? -300 : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          {renderCard(currentItem)}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-4 mt-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-full w-14 h-14 border-red-200 hover:border-red-400 hover:bg-red-50"
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
              className="rounded-full w-14 h-14 border-amber-200 hover:border-amber-400 hover:bg-amber-50"
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
                className="rounded-full w-14 h-14 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
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

function MatchScoreRing({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
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

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
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
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={getScoreColor(score)}
        />
      </svg>
      <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
    </div>
  );
}

function getChemistryLabel(value: number): { label: string; color: string; bgColor: string } {
  if (value >= 5) return { label: "Exceptional", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-950" };
  if (value >= 4) return { label: "Strong", color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-950" };
  if (value >= 3) return { label: "Good", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-950" };
  if (value >= 2) return { label: "Fair", color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-950" };
  return { label: "Low", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-950" };
}

function ChemistryRating({ label, value, icon }: { label: string; value: number; icon?: JSX.Element }) {
  const chemistry = getChemistryLabel(value);
  const percentage = (value / 5) * 100;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 w-28">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${
            value >= 4 ? "bg-gradient-to-r from-green-400 to-green-500" :
            value >= 3 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
            "bg-gradient-to-r from-orange-400 to-orange-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <Badge variant="outline" className={`text-xs shrink-0 ${chemistry.color}`}>
        {chemistry.label}
      </Badge>
    </div>
  );
}

function RatingBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const chemistry = getChemistryLabel(value);
  const percentage = (value / max) * 100;
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-24">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${
            value >= 4 ? "bg-gradient-to-r from-green-400 to-green-500" :
            value >= 3 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
            "bg-gradient-to-r from-orange-400 to-orange-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <Badge variant="outline" className={`text-xs shrink-0 ${chemistry.color}`}>
        {chemistry.label}
      </Badge>
    </div>
  );
}

function ProjectMatchCard({ project, matchScore, onNegotiate }: { project: CapitalProject; matchScore: number; onNegotiate?: () => void }) {
  const progress = project.fundingGoal > 0 
    ? Math.round((project.amountRaised / project.fundingGoal) * 100) 
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
        
        <div className="absolute top-3 left-3 flex gap-2">
          {project.isHot && (
            <Badge className="bg-red-500 text-white">
              <Flame className="w-3 h-3 mr-1" />
              Hot
            </Badge>
          )}
          {project.isFeatured && (
            <Badge className="bg-amber-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {project.status === "FUNDED" && (
            <Badge className="bg-green-600 text-white">Fully Funded</Badge>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-full p-1 shadow-lg">
            <MatchScoreRing score={matchScore} size="md" />
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

function ProjectGridCard({ project, matchScore, onNegotiate }: { project: CapitalProject; matchScore: number; onNegotiate?: () => void }) {
  const progress = project.fundingGoal > 0 
    ? Math.round((project.amountRaised / project.fundingGoal) * 100) 
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
          <MatchScoreRing score={matchScore} size="sm" />
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

function WholesaleMatchCard({ deal, onNegotiate }: { deal: WholesaleDeal; onNegotiate?: () => void }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalCost = deal.contractPrice + deal.assignmentFee + deal.estimatedRepairs;
  const spread = deal.arv - totalCost;
  const roi = totalCost > 0 ? ((spread / totalCost) * 100).toFixed(1) : "0";

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
        
        <div className="absolute top-3 left-3 flex gap-2">
          {deal.isHot && (
            <Badge className="bg-red-500 text-white">
              <Flame className="w-3 h-3 mr-1" />
              Hot
            </Badge>
          )}
          {deal.isFeatured && (
            <Badge className="bg-amber-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          <Badge className="bg-amber-600 text-white">Wholesale</Badge>
        </div>

        <div className="absolute top-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-full p-1 shadow-lg">
            <MatchScoreRing score={deal.matchScore || 85} size="md" />
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
        <div className="flex items-center gap-4 text-sm mb-4 p-3 bg-secondary/30 rounded-lg">
          <span className="flex items-center gap-1">
            <Bed className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{deal.bedrooms}</span> bd
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{deal.bathrooms}</span> ba
          </span>
          <span className="flex items-center gap-1">
            <Square className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{deal.sqft?.toLocaleString()}</span> sqft
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{deal.yearBuilt}</span>
          </span>
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-24">Risk Level</span>
            <Badge 
              variant={deal.riskLevel === "low" ? "outline" : deal.riskLevel === "high" ? "destructive" : "secondary"}
              className="text-xs"
            >
              {deal.riskLevel || "Medium"}
            </Badge>
          </div>
        </div>

        {deal.highlights && deal.highlights.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Highlights</p>
            <div className="flex flex-wrap gap-1">
              {deal.highlights.slice(0, 3).map((highlight, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {deal.viewCount && deal.viewCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
            <Eye className="w-3 h-3" />
            {deal.viewCount} investors viewing
          </div>
        )}

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
          <Button data-testid={`button-interested-${deal.id}`}>
            <Zap className="w-4 h-4 mr-1" />
            I Want This
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WholesaleGridCard({ deal, onNegotiate }: { deal: WholesaleDeal; onNegotiate?: () => void }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const spread = deal.arv - deal.contractPrice - deal.assignmentFee - deal.estimatedRepairs;

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
        </div>
        
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-0.5">
          <MatchScoreRing score={deal.matchScore || 85} size="sm" />
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-1 mb-1">{deal.propertyAddress}</h3>
        
        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
          <MapPin className="w-3 h-3" />
          {deal.city}, {deal.state}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span>{deal.bedrooms} bd</span>
          <span>{deal.bathrooms} ba</span>
          <span>{deal.sqft?.toLocaleString()} sqft</span>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-bold">{formatCurrency(deal.contractPrice + deal.assignmentFee)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Spread</p>
            <p className={`font-bold ${spread > 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(spread)}
            </p>
          </div>
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
