import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useSupabaseMarketplace } from "@/hooks/use-supabase-marketplace";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerChildren, StaggerItem, HoverLift } from "@/components/animations";
import { WholesaleDealActionDialog } from "@/components/wholesale-deal-action-dialog";
import { CapitalRaiseOfferDialog, type CapitalOfferData } from "@/components/capital-raise-offer-dialog";
import { sampleWholesaleDeals } from "@/lib/sample-data";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import type { CapitalProject } from "@shared/schema";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Home,
  TrendingUp,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Target,
  Sparkles,
  ArrowRight,
  Percent,
  Clock,
  Eye,
  LogIn,
  LayoutGrid,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  RotateCcw,
  MessageSquare,
  Wrench,
  Building2,
  Handshake,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface WholesaleDeal {
  id: string;
  propertyAddress?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  propertyType?: string;
  arv?: number;
  askingPrice?: number;
  contractPrice?: number;
  repairEstimate?: number;
  estimatedRepairs?: number;
  assignmentFee?: number;
  photos?: string[];
  images?: string[];
  status?: string;
  isPegasusDeal?: boolean;
  matchScore?: number;
  negotiationAllowed?: boolean;
  jvAllowed?: boolean;
}

export default function MarketflowDeals() {
  return (
    <MarketplaceLayout>
      <DealsPage />
    </MarketplaceLayout>
  );
}

function DealsPage() {
  const [dealCategory, setDealCategory] = useState<"wholesale" | "capital">("wholesale");
  const [viewMode, setViewMode] = useState<"grid" | "swipe">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [selectedDeal, setSelectedDeal] = useState<WholesaleDeal | null>(null);
  const [selectedProject, setSelectedProject] = useState<CapitalProject | null>(null);
  const [dealActionType, setDealActionType] = useState<"jv_request" | "invest">("invest");
  const [dealActionDialogOpen, setDealActionDialogOpen] = useState(false);
  const [capitalOfferDialogOpen, setCapitalOfferDialogOpen] = useState(false);
  const [capitalOfferMode, setCapitalOfferMode] = useState<"accept" | "counter">("accept");
  const { isAuthenticated, isWholesaler, isDreamscaper, isInvestor, isAdmin, isGuestMode, guestRole, enterGuestMode, exitGuestMode } = useSupabaseAuth();
  const { toast } = useToast();
  const { isItemSaved, toggleSaveItem, isSaving } = useSupabaseMarketplace();
  const [, setLocation] = useLocation();

  const { data: deals, isLoading: dealsLoading } = useQuery<WholesaleDeal[]>({
    queryKey: ['/api/wholesale-deals'],
  });

  const { data: capitalProjects, isLoading: projectsLoading } = useQuery<CapitalProject[]>({
    queryKey: ['/api/capital-projects'],
  });

  const handleDealAction = (deal: WholesaleDeal, actionType: "jv_request" | "invest") => {
    if (!isAuthenticated && !isGuestMode) {
      toast({
        title: "Sign in required",
        description: "Please sign in to take action on deals.",
        variant: "default",
      });
      return;
    }
    setSelectedDeal(deal);
    setDealActionType(actionType);
    setDealActionDialogOpen(true);
  };

  const handleSaveDeal = async (dealId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save deals.",
        variant: "default",
      });
      return;
    }
    await toggleSaveItem('wholesale_deal', dealId);
  };

  const useSampleData = isGuestMode || (!deals?.length && !dealsLoading);
  const displayDeals = (deals?.length ? deals : sampleWholesaleDeals.map(d => ({
    ...d,
    matchScore: Math.floor(Math.random() * 40) + 60
  }))) as WholesaleDeal[];
  
  const filteredDeals = displayDeals?.filter(deal => {
    let matches = true;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const address = deal.propertyAddress || deal.address || '';
      const city = deal.city || '';
      matches = matches && (
        address.toLowerCase().includes(query) ||
        city.toLowerCase().includes(query)
      );
    }
    
    if (propertyType !== "all") {
      matches = matches && deal.propertyType === propertyType;
    }
    
    return matches;
  }) || [];

  return (
    <div className="space-y-6">
      <ScrollReveal>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-deals-title">
              <Home className="w-6 h-6 text-primary" />
              Deal Discovery
            </h1>
            <p className="text-muted-foreground">
              {dealCategory === "wholesale" 
                ? "Browse wholesale assignments. Find contracts to assign or JV partner on."
                : "Browse capital raise opportunities. Invest in operator projects."}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {dealCategory === "wholesale" && (
              <ToggleGroup 
                type="single" 
                value={viewMode} 
                onValueChange={(value) => value && setViewMode(value as "grid" | "swipe")}
                className="border rounded-lg"
              >
                <ToggleGroupItem value="grid" aria-label="Grid View" data-testid="toggle-grid-view">
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Grid
                </ToggleGroupItem>
                <ToggleGroupItem value="swipe" aria-label="Swipe View" data-testid="toggle-swipe-view">
                  <Layers className="w-4 h-4 mr-2" />
                  Swipe
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          </div>
        </div>

        <Tabs value={dealCategory} onValueChange={(v) => setDealCategory(v as "wholesale" | "capital")} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="wholesale" className="gap-2" data-testid="tab-wholesale">
              <Handshake className="w-4 h-4" />
              Wholesale Assignments
            </TabsTrigger>
            <TabsTrigger value="capital" className="gap-2" data-testid="tab-capital">
              <TrendingUp className="w-4 h-4" />
              Capital Raises
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </ScrollReveal>

      {isGuestMode && (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-medium">Guest Preview Mode: {guestRole?.replace(/_/g, ' ')}</h3>
                  <p className="text-sm text-muted-foreground">You're viewing sample data. Sign in to take actions.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exitGuestMode} data-testid="button-exit-guest">
                  Exit Preview
                </Button>
                <Link href="/login">
                  <Button size="sm" data-testid="button-sign-in-guest">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {dealCategory === "wholesale" && viewMode === "grid" && (
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by address or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-deals"
            />
          </div>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="w-full lg:w-48" data-testid="select-property-type">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Single Family">Single Family</SelectItem>
              <SelectItem value="Multi-Family">Multi-Family</SelectItem>
              <SelectItem value="Townhouse">Townhouse</SelectItem>
              <SelectItem value="Condo">Condo</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {dealCategory === "wholesale" ? (
        viewMode === "grid" ? (
          <GridView 
            deals={filteredDeals}
            isLoading={dealsLoading && !useSampleData}
            onSave={handleSaveDeal}
            onAction={handleDealAction}
            isItemSaved={(id) => isItemSaved('wholesale_deal', id)}
            isSaving={isSaving}
            showInvest={isDreamscaper || isInvestor || isAdmin}
            showJVRequest={isWholesaler || isAdmin}
          />
        ) : (
          <SwipeView 
            deals={filteredDeals}
            onSave={handleSaveDeal}
            onAction={handleDealAction}
            isItemSaved={(id) => isItemSaved('wholesale_deal', id)}
            showInvest={isDreamscaper || isInvestor || isAdmin}
            showJVRequest={isWholesaler || isAdmin}
          />
        )
      ) : (
        <CapitalRaiseGridView 
          projects={capitalProjects || []}
          isLoading={projectsLoading}
          onSelectProject={(project) => {
            setSelectedProject(project);
            setLocation(`/marketflow/capital/${project.id}`);
          }}
          onAcceptTerms={(project) => {
            if (!isAuthenticated && !isGuestMode) {
              toast({
                title: "Sign in required",
                description: "Please sign in to invest in capital raises.",
              });
              return;
            }
            setSelectedProject(project);
            setCapitalOfferMode("accept");
            setCapitalOfferDialogOpen(true);
          }}
          onCounterTerms={(project) => {
            if (!isAuthenticated && !isGuestMode) {
              toast({
                title: "Sign in required",
                description: "Please sign in to invest in capital raises.",
              });
              return;
            }
            setSelectedProject(project);
            setCapitalOfferMode("counter");
            setCapitalOfferDialogOpen(true);
          }}
          isItemSaved={(id) => isItemSaved('capital_project', String(id))}
          onSave={(id) => toggleSaveItem('capital_project', String(id))}
        />
      )}

      {selectedDeal && (
        <WholesaleDealActionDialog
          open={dealActionDialogOpen}
          onOpenChange={setDealActionDialogOpen}
          deal={{
            id: selectedDeal.id,
            propertyAddress: selectedDeal.propertyAddress || selectedDeal.address || "Unknown",
            city: selectedDeal.city,
            state: selectedDeal.state,
            askingPrice: selectedDeal.askingPrice || selectedDeal.contractPrice,
            arv: selectedDeal.arv,
            estimatedRepairs: selectedDeal.repairEstimate || selectedDeal.estimatedRepairs,
            assignmentFee: selectedDeal.assignmentFee,
            contractPrice: selectedDeal.contractPrice,
            propertyType: selectedDeal.propertyType,
          }}
          actionType={dealActionType}
          onSuccess={() => {
            toast({
              title: dealActionType === "jv_request" ? "JV Request Sent" : "Offer Submitted",
              description: dealActionType === "jv_request" 
                ? "Your partnership request has been sent."
                : "Your offer has been submitted for review.",
            });
          }}
        />
      )}

      {selectedProject && (
        <CapitalRaiseOfferDialog
          open={capitalOfferDialogOpen}
          onOpenChange={setCapitalOfferDialogOpen}
          project={selectedProject}
          mode={capitalOfferMode}
          onSubmit={(data: CapitalOfferData) => {
            console.log("Capital offer submitted:", data);
            toast({
              title: capitalOfferMode === "accept" ? "Investment Committed!" : "Counter-Offer Sent!",
              description: capitalOfferMode === "accept"
                ? `You've committed ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.investmentAmount)} to this capital raise.`
                : "Your counter-terms have been sent to the operator.",
            });
          }}
        />
      )}
    </div>
  );
}

interface GridViewProps {
  deals: WholesaleDeal[];
  isLoading: boolean;
  onSave: (dealId: string) => void;
  onAction: (deal: WholesaleDeal, actionType: "jv_request" | "invest") => void;
  isItemSaved: (id: string) => boolean;
  isSaving: boolean;
  showInvest: boolean;
  showJVRequest: boolean;
}

function GridView({ deals, isLoading, onSave, onAction, isItemSaved, isSaving, showInvest, showJVRequest }: GridViewProps) {
  const [, setLocation] = useLocation();
  
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <CardContent className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Deals Found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or check back later.
        </p>
      </Card>
    );
  }

  return (
    <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {deals.map((deal) => (
        <StaggerItem key={deal.id}>
          <HoverLift>
            <DealCard 
              deal={deal}
              onSave={() => onSave(deal.id)}
              onAction={(actionType) => onAction(deal, actionType)}
              onView={() => setLocation(`/marketflow/deals/${deal.id}`)}
              isSaved={isItemSaved(deal.id)}
              isSaving={isSaving}
              showInvest={showInvest}
              showJVRequest={showJVRequest}
            />
          </HoverLift>
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}

interface SwipeViewProps {
  deals: WholesaleDeal[];
  onSave: (dealId: string) => void;
  onAction: (deal: WholesaleDeal, actionType: "jv_request" | "invest") => void;
  isItemSaved: (id: string) => boolean;
  showInvest: boolean;
  showJVRequest: boolean;
}

function SwipeView({ deals, onSave, onAction, isItemSaved, showInvest, showJVRequest }: SwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);
  
  const currentDeal = deals[currentIndex];
  const hasMore = currentIndex < deals.length - 1;

  const handleSwipe = (direction: "left" | "right") => {
    setExitDirection(direction);
    
    if (direction === "right" && currentDeal) {
      onSave(currentDeal.id);
      toast({
        title: "Deal Saved!",
        description: "Added to your saved deals.",
      });
    }
    
    setTimeout(() => {
      if (hasMore) {
        setCurrentIndex(prev => prev + 1);
      }
      setExitDirection(null);
    }, 300);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      handleSwipe("right");
    } else if (info.offset.x < -threshold) {
      handleSwipe("left");
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (deals.length === 0) {
    return (
      <Card className="p-12 text-center max-w-lg mx-auto">
        <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Deals to Swipe</h3>
        <p className="text-muted-foreground">
          Check back later for new opportunities.
        </p>
      </Card>
    );
  }

  if (currentIndex >= deals.length) {
    return (
      <Card className="p-12 text-center max-w-lg mx-auto">
        <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">You've Seen All Deals!</h3>
        <p className="text-muted-foreground mb-6">
          You've reviewed all available deals. Check your saved deals or come back later.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => setCurrentIndex(0)} data-testid="button-start-over">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
          <Link href="/marketflow/investor/saved">
            <Button data-testid="button-view-saved">
              <Bookmark className="w-4 h-4 mr-2" />
              View Saved
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-4">
        <Badge variant="outline" className="gap-1">
          {currentIndex + 1} / {deals.length}
        </Badge>
        <p className="text-sm text-muted-foreground mt-2">
          Swipe right to save, left to pass
        </p>
      </div>

      <div className="relative h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDeal.id}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ x, rotate }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: exitDirection === "left" ? -300 : exitDirection === "right" ? 300 : 0
            }}
            exit={{ 
              x: exitDirection === "left" ? -300 : 300,
              opacity: 0,
              transition: { duration: 0.2 }
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <SwipeCard 
              deal={currentDeal}
              likeOpacity={likeOpacity}
              passOpacity={passOpacity}
              onView={() => setLocation(`/marketflow/deals/${currentDeal.id}`)}
              onCounter={() => onAction(currentDeal, "invest")}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <Button 
          size="lg" 
          variant="outline" 
          className="rounded-full h-14 w-14"
          onClick={handleUndo}
          disabled={currentIndex === 0}
          data-testid="button-undo"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="rounded-full h-16 w-16 border-red-300 hover:bg-red-50 hover:border-red-400"
          onClick={() => handleSwipe("left")}
          data-testid="button-pass"
        >
          <X className="w-6 h-6 text-red-500" />
        </Button>
        <Button 
          size="lg" 
          className="rounded-full h-16 w-16 bg-green-500 hover:bg-green-600"
          onClick={() => handleSwipe("right")}
          data-testid="button-save-swipe"
        >
          <Heart className="w-6 h-6" />
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="rounded-full h-14 w-14 border-primary/30 hover:bg-primary/5"
          onClick={() => onAction(currentDeal, "invest")}
          data-testid="button-counter"
        >
          <MessageSquare className="w-5 h-5 text-primary" />
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Undo • Pass • Like • Counteroffer
      </p>
    </div>
  );
}

interface SwipeCardProps {
  deal: WholesaleDeal;
  likeOpacity: any;
  passOpacity: any;
  onView: () => void;
  onCounter: () => void;
}

function SwipeCard({ deal, likeOpacity, passOpacity, onView, onCounter }: SwipeCardProps) {
  const address = deal.propertyAddress || deal.address || 'Property Address';
  const cityState = [deal.city, deal.state].filter(Boolean).join(', ');
  const askPrice = deal.askingPrice || deal.contractPrice || 0;
  const arv = deal.arv || 0;
  const repairs = deal.repairEstimate || deal.estimatedRepairs || 0;
  const profit = arv - askPrice - repairs;
  const roi = askPrice > 0 ? ((profit / askPrice) * 100).toFixed(1) : '0';
  const matchScore = deal.matchScore || Math.floor(Math.random() * 40) + 60;

  return (
    <Card className="h-full overflow-hidden shadow-xl">
      <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50">
        {deal.photos?.[0] || deal.images?.[0] ? (
          <img 
            src={deal.photos?.[0] || deal.images?.[0]} 
            alt={address}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        
        <motion.div 
          className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg"
          style={{ opacity: likeOpacity }}
        >
          SAVE
        </motion.div>
        <motion.div 
          className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg"
          style={{ opacity: passOpacity }}
        >
          PASS
        </motion.div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <MatchScoreBadge score={matchScore} />
        </div>

        <div className="absolute bottom-2 left-2 flex gap-1">
          <StatusBadge status={deal.status || "Under Review"} />
          {deal.isPegasusDeal && (
            <Badge className="bg-primary text-primary-foreground gap-1">
              <Sparkles className="w-3 h-3" />
              Pegasus
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg truncate">{address}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {cityState || 'Location TBD'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Ask Price</p>
            <p className="font-bold text-lg">${askPrice.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">ARV</p>
            <p className="font-bold text-lg">${arv.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Repairs</p>
            <p className="font-semibold text-sm">${repairs.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Profit</p>
            <p className={`font-semibold text-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${profit.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ROI</p>
            <p className="font-semibold text-sm">{roi}%</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onView} data-testid="button-view-deal">
            <Eye className="w-4 h-4 mr-2" />
            View Deal
          </Button>
          <Button className="flex-1" onClick={onCounter} data-testid="button-counter-deal">
            <ArrowRight className="w-4 h-4 mr-2" />
            Counteroffer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface DealCardProps {
  deal: WholesaleDeal;
  onSave: () => void;
  onAction: (actionType: "jv_request" | "invest") => void;
  onView: () => void;
  isSaved: boolean;
  isSaving: boolean;
  showInvest: boolean;
  showJVRequest: boolean;
}

function DealCard({ deal, onSave, onAction, onView, isSaved, isSaving, showInvest, showJVRequest }: DealCardProps) {
  const address = deal.propertyAddress || deal.address || 'Property Address';
  const cityState = [deal.city, deal.state].filter(Boolean).join(', ');
  const askPrice = deal.askingPrice || deal.contractPrice || 0;
  const arv = deal.arv || 0;
  const repairs = deal.repairEstimate || deal.estimatedRepairs || 0;
  const profit = arv - askPrice - repairs;
  const matchScore = deal.matchScore || Math.floor(Math.random() * 40) + 60;

  return (
    <Card className="overflow-hidden group">
      <div className="relative h-40 bg-gradient-to-br from-muted to-muted/50">
        {deal.photos?.[0] || deal.images?.[0] ? (
          <img 
            src={deal.photos?.[0] || deal.images?.[0]} 
            alt={address}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          <StatusBadge status={deal.status || "Under Review"} />
          {deal.isPegasusDeal && (
            <Badge className="bg-primary text-primary-foreground gap-1 text-[10px]">
              <Sparkles className="w-3 h-3" />
              Pegasus
            </Badge>
          )}
          {deal.negotiationAllowed !== false && (
            <Badge variant="outline" className="bg-background/80 text-[10px] gap-1">
              <MessageSquare className="w-2.5 h-2.5" />
              Negotiable
            </Badge>
          )}
          {deal.jvAllowed && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Handshake className="w-2.5 h-2.5" />
              JV Open
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2">
          <MatchScoreBadge score={matchScore} size="sm" />
        </div>

        <Button
          size="icon"
          variant={isSaved ? "default" : "secondary"}
          className="absolute bottom-2 right-2 h-8 w-8"
          onClick={(e) => { e.stopPropagation(); onSave(); }}
          disabled={isSaving}
          data-testid={`button-save-deal-${deal.id}`}
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold truncate" data-testid={`text-deal-address-${deal.id}`}>{address}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {cityState || 'Location TBD'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-muted/50 rounded p-2">
            <p className="text-[10px] text-muted-foreground">Ask</p>
            <p className="font-bold text-sm">${(askPrice / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-muted/50 rounded p-2">
            <p className="text-[10px] text-muted-foreground">ARV</p>
            <p className="font-bold text-sm">${(arv / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-muted/50 rounded p-2">
            <p className="text-[10px] text-muted-foreground">Profit</p>
            <p className={`font-bold text-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(profit / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView} data-testid={`button-view-deal-${deal.id}`}>
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          {showInvest && (
            <Button size="sm" className="flex-1" onClick={() => onAction("invest")} data-testid={`button-invest-deal-${deal.id}`}>
              Counteroffer
            </Button>
          )}
          {showJVRequest && (
            <Button size="sm" variant="secondary" className="flex-1" onClick={() => onAction("jv_request")} data-testid={`button-jv-deal-${deal.id}`}>
              JV Request
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MatchScoreBadge({ score, size = "default" }: { score: number; size?: "sm" | "default" }) {
  const getColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const sizeClasses = size === "sm" 
    ? "h-8 w-8 text-[10px]" 
    : "h-12 w-12 text-sm";

  return (
    <div className={`${sizeClasses} ${getColor(score)} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
      {score}%
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("approved") || s.includes("active")) {
      return { variant: "default" as const, className: "bg-green-600 dark:bg-green-700 text-white" };
    }
    if (s.includes("review") || s.includes("pending")) {
      return { variant: "secondary" as const, className: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-300/50 dark:border-amber-700/50" };
    }
    if (s.includes("negotiat")) {
      return { variant: "outline" as const, className: "border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-400" };
    }
    if (s.includes("funded")) {
      return { variant: "default" as const, className: "bg-primary text-primary-foreground" };
    }
    if (s.includes("exit") || s.includes("closed")) {
      return { variant: "secondary" as const, className: "" };
    }
    return { variant: "secondary" as const, className: "" };
  };

  const config = getConfig(status);

  return (
    <Badge variant={config.variant} className={`text-[10px] gap-1 ${config.className}`}>
      {status}
    </Badge>
  );
}

interface CapitalRaiseGridViewProps {
  projects: CapitalProject[];
  isLoading: boolean;
  onSelectProject: (project: CapitalProject) => void;
  onAcceptTerms: (project: CapitalProject) => void;
  onCounterTerms: (project: CapitalProject) => void;
  isItemSaved: (id: number) => boolean;
  onSave: (id: number) => void;
}

function CapitalRaiseGridView({ 
  projects, 
  isLoading, 
  onSelectProject, 
  onAcceptTerms, 
  onCounterTerms,
  isItemSaved,
  onSave
}: CapitalRaiseGridViewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <CardContent className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Capital Raises Available</h3>
        <p className="text-muted-foreground">
          Check back later for new investment opportunities.
        </p>
      </Card>
    );
  }

  return (
    <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <StaggerItem key={project.id}>
          <HoverLift>
            <CapitalRaiseCard
              project={project}
              onView={() => onSelectProject(project)}
              onAcceptTerms={() => onAcceptTerms(project)}
              onCounterTerms={() => onCounterTerms(project)}
              isSaved={isItemSaved(project.id)}
              onSave={() => onSave(project.id)}
            />
          </HoverLift>
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}

interface CapitalRaiseCardProps {
  project: CapitalProject;
  onView: () => void;
  onAcceptTerms: () => void;
  onCounterTerms: () => void;
  isSaved: boolean;
  onSave: () => void;
}

function CapitalRaiseCard({ project, onView, onAcceptTerms, onCounterTerms, isSaved, onSave }: CapitalRaiseCardProps) {
  const fundingGoal = project.fundingGoal || 0;
  const amountRaised = project.amountRaised || 0;
  const progressPercent = fundingGoal > 0 ? Math.min((amountRaised / fundingGoal) * 100, 100) : 0;
  const isFunded = project.status === "FUNDED" || progressPercent >= 100;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const getStrategyLabel = (strategy: string | null | undefined) => {
    const labels: Record<string, string> = {
      "fix-flip": "Fix & Flip",
      "buy-hold": "Buy & Hold",
      "value-add": "Value Add",
      "development": "Development",
      "new-construction": "New Construction",
    };
    return labels[strategy || ""] || strategy || "Investment";
  };

  const getStructureLabel = (structure: string | null | undefined) => {
    const labels: Record<string, string> = {
      "EQUITY": "Equity",
      "DEBT": "Debt",
      "HYBRID": "Hybrid",
    };
    return labels[structure || ""] || structure || "Equity";
  };

  return (
    <Card className="overflow-hidden group" data-testid={`card-capital-project-${project.id}`}>
      <div className="relative h-40 bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20">
        {project.images?.[0] ? (
          <img 
            src={project.images[0]} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp className="w-12 h-12 text-green-600/30" />
          </div>
        )}
        
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          <Badge className={isFunded ? "bg-green-600 text-white" : "bg-amber-500 text-white"}>
            {isFunded ? "Funded" : project.status?.replace(/_/g, ' ') || "Open"}
          </Badge>
          <Badge variant="outline" className="bg-background/80">
            {getStructureLabel(project.structure)}
          </Badge>
        </div>

        <Button
          size="icon"
          variant={isSaved ? "default" : "secondary"}
          className="absolute bottom-2 right-2 h-8 w-8"
          onClick={(e) => { e.stopPropagation(); onSave(); }}
          data-testid={`button-save-project-${project.id}`}
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px]">
              {getStrategyLabel(project.strategy)}
            </Badge>
          </div>
          <h3 className="font-semibold truncate" data-testid={`text-project-title-${project.id}`}>
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {project.location || 'Location TBD'}
          </p>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Funding Progress</span>
            <span className="font-semibold">{progressPercent.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>{formatCurrency(amountRaised)} raised</span>
            <span>of {formatCurrency(fundingGoal)}</span>
          </div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg mb-3">
          <p className="text-[10px] text-muted-foreground mb-1 font-medium">Operator Terms</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {project.structure === "DEBT" ? (
              <>
                <div>
                  <span className="text-muted-foreground">Interest: </span>
                  <span className="font-medium">{project.askingInterestRate || "TBD"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration: </span>
                  <span className="font-medium">{project.askingLoanDuration || "TBD"}</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-muted-foreground">Return: </span>
                  <span className="font-medium">{project.projectedReturn || "TBD"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Split: </span>
                  <span className="font-medium">{project.askingProfitSplit || "TBD"}</span>
                </div>
              </>
            )}
          </div>
          {project.minInvestment && (
            <div className="mt-2 pt-2 border-t border-muted text-xs">
              <span className="text-muted-foreground">Min Investment: </span>
              <span className="font-medium">{formatCurrency(project.minInvestment)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView} data-testid={`button-view-project-${project.id}`}>
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          {!isFunded && (
            <>
              <Button size="sm" className="flex-1" onClick={onAcceptTerms} data-testid={`button-accept-terms-${project.id}`}>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Accept
              </Button>
              <Button size="sm" variant="secondary" onClick={onCounterTerms} data-testid={`button-counter-terms-${project.id}`}>
                <MessageSquare className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
