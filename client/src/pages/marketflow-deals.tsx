import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { useSEO } from "@/hooks/use-seo";
import { canAccessReviewedMarketflowInventory } from "@shared/marketflow-inventory-access";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useSupabaseMarketplace } from "@/hooks/use-supabase-marketplace";
import { useDealAction } from "@/contexts/deal-action-context";
import { useToast } from "@/hooks/use-toast";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerChildren, StaggerItem, HoverLift } from "@/components/animations";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import type { CapitalProject } from "@shared/schema";
import { DueDiligenceProgress } from "@/components/due-diligence-checklist";
import { CommunicationSummary } from "@/components/communication-log";
import { DocumentCount } from "@/components/document-attachments";
import { InlineROIBadge } from "@/components/quick-calculator";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { BetaBanner } from "@/components/beta-banner";
import { OpenOfferStudioButton } from "@/components/open-offer-studio-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Filter,
  MapPin,
  DollarSign,
  Home,
  TrendingUp,
  Calendar,
  Bookmark,
  BookmarkCheck,
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
  AlertCircle,
  Share2,
  Calculator,
  Copy,
  Mail,
  StickyNote,
  Info,
  Zap,
  PieChart,
  BarChart3,
  TrendingDown,
  CircleDollarSign,
  Columns,
  LockKeyhole,
  Plus,
  RefreshCw
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
  canRequestJv?: boolean;
  latitude?: number;
  longitude?: number;
}

interface Listing {
  id: number;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode?: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: string;
  sqft?: number;
  yearBuilt?: number;
  listPrice: number;
  listingType: string;
  condition?: string;
  images?: string[];
  description?: string;
  status: string;
  daysOnMarket?: number;
  isFeatured?: boolean;
}

const MARKETFLOW_INVENTORY_STATUS = "No reviewed live inventory is published.";

export default function MarketflowDeals() {
  useSEO({
    title: "MarketFlow Deals",
    description: "Private MarketFlow dealflow surface.",
    noIndex: true,
  });
  const {
    isAuthenticated,
    isGuestMode,
    guestRole,
    exitGuestMode,
    profile,
    userRole,
    isAdmin,
  } = useSupabaseAuth();
  const shouldShowOperatorChrome = canAccessReviewedMarketflowInventory({
    isAuthenticated,
    isGuestMode,
    isPegasusBadged: profile?.is_pegasus_badged,
    isStaff: isAdmin,
    roles: [profile?.primary_role, userRole],
  });

  if (!shouldShowOperatorChrome) {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-background px-4 py-20 sm:py-24">
        <MarketflowPrivateBetaHold
          isGuestMode={isGuestMode}
          guestRole={guestRole}
          exitGuestMode={exitGuestMode}
        />
      </div>
    );
  }

  return (
    <MarketplaceLayout>
      <DealsPage />
    </MarketplaceLayout>
  );
}

function MarketflowPrivateBetaHold({
  isGuestMode,
  guestRole,
  exitGuestMode,
}: {
  isGuestMode: boolean;
  guestRole: string | null;
  exitGuestMode: () => void;
}) {
  return (
    <div className="space-y-6">
      <BetaBanner section="marketflow" showFeatureLists={false} dismissible={true} />
      <Card className="mx-auto max-w-3xl border-primary/20 bg-card">
        <CardContent className="p-8 text-center sm:p-12">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-sm border border-primary/30 bg-primary/10">
            <LockKeyhole className="h-6 w-6 text-primary" />
          </div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a5122] dark:text-primary">
            MarketFlow private beta
          </p>
          <h1 className="mb-5 font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {MARKETFLOW_INVENTORY_STATUS}
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground">
            MarketFlow remains a controlled private pilot. You may request access or submit
            an opportunity, but neither path promises approval, review, inventory, matching,
            a transaction, or a response. Reviewed opportunities are not shown as sample inventory.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/marketflow/access">
              <Button
                size="lg"
                className="min-h-[48px] w-full gap-2 rounded-sm bg-[#8a5122] px-7 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#75451d] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 sm:w-auto"
                data-testid="button-marketflow-request-access"
              >
                Request Access
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/bring-an-opportunity?intent=deal-jv">
              <Button
                size="lg"
                variant="outline"
                className="min-h-[48px] w-full rounded-sm px-7 text-xs font-semibold uppercase tracking-[0.16em] sm:w-auto"
                data-testid="button-marketflow-submit-deal"
              >
                Submit a Deal
              </Button>
            </Link>
            {isGuestMode && (
              <Button
                size="lg"
                variant="ghost"
                onClick={exitGuestMode}
                className="min-h-[48px] w-full rounded-sm px-7 text-xs font-semibold uppercase tracking-[0.16em] sm:w-auto"
                data-testid="button-exit-guest"
              >
                Exit Preview
              </Button>
            )}
          </div>
          {guestRole && (
            <p className="mt-6 text-xs text-muted-foreground">
              Current preview role: {guestRole.replace(/_/g, " ")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Filter Persistence Hook
function useFilterPersistence() {
  const STORAGE_KEY = "marketflow_filters";
  
  const getStoredFilters = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);
  
  const saveFilters = useCallback((filters: {
    dealCategory: string;
    viewMode: string;
    propertyType: string;
    sortBy?: string;
  }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // Silently fail if localStorage unavailable
    }
  }, []);
  
  return { getStoredFilters, saveFilters };
}

function DealsPage() {
  const { getStoredFilters, saveFilters } = useFilterPersistence();
  const storedFilters = useMemo(() => getStoredFilters(), [getStoredFilters]);
  
  const [dealCategory, setDealCategory] = useState<"wholesale" | "capital" | "listings">(
    storedFilters?.dealCategory || "wholesale"
  );
  const [viewMode, setViewMode] = useState<"grid" | "swipe">(
    storedFilters?.viewMode || "grid"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState<string>(
    storedFilters?.propertyType || "all"
  );
  const [sortBy, setSortBy] = useState<string>(storedFilters?.sortBy || "newest");
  
  // Save filters whenever they change
  useEffect(() => {
    saveFilters({ dealCategory, viewMode, propertyType, sortBy });
  }, [dealCategory, viewMode, propertyType, sortBy, saveFilters]);
  
  const { isAuthenticated, isDreamscaper, isInvestor, isAdmin, isGuestMode, guestRole, exitGuestMode } = useSupabaseAuth();
  const { toast } = useToast();
  const { isItemSaved, toggleSaveItem, isSaving } = useSupabaseMarketplace();
  const { openDealAction } = useDealAction();
  const [, setLocation] = useLocation();

  const shouldFetchLiveData = isAuthenticated && !isGuestMode;

  const {
    data: deals,
    isLoading: dealsLoading,
    isError: dealsError,
    refetch: refetchDeals,
  } = useQuery<WholesaleDeal[]>({
    queryKey: ['/api/wholesale-deals'],
    enabled: shouldFetchLiveData,
  });

  const {
    data: capitalProjects,
    isLoading: projectsLoading,
    isError: projectsError,
    refetch: refetchProjects,
  } = useQuery<CapitalProject[]>({
    queryKey: ['/api/capital-projects'],
    enabled: shouldFetchLiveData,
  });

  const {
    data: listings,
    isLoading: listingsLoading,
    isError: listingsError,
    refetch: refetchListings,
  } = useQuery<Listing[]>({
    queryKey: ['/api/listings'],
    enabled: shouldFetchLiveData,
  });

  const handleDealAction = (deal: WholesaleDeal, actionType: "jv_request" | "invest") => {
    if (!isAuthenticated && !isGuestMode) {
      toast({
        title: "Sign in required",
        description: "Please sign in or request MarketFlow access before taking action on reviewed opportunities.",
        variant: "default",
      });
      return;
    }
    if (actionType === "jv_request") {
      openDealAction(deal.id, "wholesale_jv");
    } else {
      openDealAction(deal.id, "wholesale_accept");
    }
  };

  const handleSaveDeal = async (dealId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in or request MarketFlow access before saving reviewed opportunities.",
        variant: "default",
      });
      return;
    }
    await toggleSaveItem('wholesale_deal', dealId);
  };

  const displayDeals = (deals || []) as WholesaleDeal[];
  
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

  if (!shouldFetchLiveData) {
    return (
      <MarketflowPrivateBetaHold
        isGuestMode={isGuestMode}
        guestRole={guestRole}
        exitGuestMode={exitGuestMode}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Beta Banner */}
      <BetaBanner section="marketflow" showFeatureLists={false} dismissible={true} />

      <Card className="border-primary/25 bg-primary/5" data-testid="marketflow-inventory-publication-status">
        <CardContent className="p-5 sm:p-6">
          <p className="font-serif text-xl font-semibold tracking-tight">
            {MARKETFLOW_INVENTORY_STATUS}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This controlled workspace is prepared for future reviewed records. Access does not
            promise inventory, matching, an introduction, or a transaction.
          </p>
        </CardContent>
      </Card>
      
      <ScrollReveal>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-deals-title">
              <Home className="w-6 h-6 text-primary" />
              Deal Discovery
            </h1>
            <p className="text-muted-foreground">
              {dealCategory === "wholesale" 
                ? "Future reviewed wholesale records may appear here; none are published now."
                : dealCategory === "capital"
                  ? "Future private project records may appear here. Capital context is relationship information only."
                  : "Future reviewed listing records may appear here; none are published now."}
            </p>
          </div>
          
          <Link href="/marketflow/submit">
            <Button className="gap-2" data-testid="button-submit-deal">
              <Plus className="w-4 h-4" />
              Submit a Deal
            </Button>
          </Link>
          
          {dealCategory !== "listings" && (
            <div className="flex items-center gap-2">
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
            </div>
          )}
        </div>

        <Tabs value={dealCategory} onValueChange={(v) => setDealCategory(v as "wholesale" | "capital" | "listings")} className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-3 mb-6">
            <TabsTrigger value="wholesale" className="gap-1 sm:gap-2 text-xs sm:text-sm" data-testid="tab-wholesale">
              <Handshake className="w-4 h-4 shrink-0" />
              <span className="truncate">Wholesale</span>
            </TabsTrigger>
            <TabsTrigger value="capital" className="gap-1 sm:gap-2 text-xs sm:text-sm" data-testid="tab-capital">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline truncate">Project Records</span>
              <span className="sm:hidden truncate">Capital</span>
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-1 sm:gap-2 text-xs sm:text-sm" data-testid="tab-listings">
              <Home className="w-4 h-4 shrink-0" />
              <span className="truncate">Listings</span>
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
                  <h3 className="font-medium">Private beta preview: {guestRole?.replace(/_/g, ' ')}</h3>
                  <p className="text-sm text-muted-foreground">{MARKETFLOW_INVENTORY_STATUS} Future reviewed records remain subject to authorization and availability.</p>
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
          <SearchAutocomplete
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={setSearchQuery}
            placeholder="Search by address or city..."
            className="flex-1"
          />
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

      {dealCategory === "wholesale" && (
        <InventoryBoundary
          lane="wholesale"
          mode={viewMode}
          isLoading={dealsLoading}
          isError={dealsError}
          isEmpty={filteredDeals.length === 0}
          onRetry={() => void refetchDeals()}
        >
          {viewMode === "grid" ? (
            <GridView
              deals={filteredDeals}
              isLoading={false}
              onSave={handleSaveDeal}
              onAction={handleDealAction}
              onAcceptTerms={(deal) => {
                openDealAction(deal.id, "wholesale_accept");
              }}
              onCounterTerms={(deal) => {
                openDealAction(deal.id, "wholesale_counter");
              }}
              isItemSaved={(id) => isItemSaved('wholesale_deal', id)}
              isSaving={isSaving}
              showInvest={isDreamscaper || isInvestor || isAdmin}
            />
          ) : (
            <SwipeView
              deals={filteredDeals}
              onSave={handleSaveDeal}
              onAcceptTerms={(deal) => {
                openDealAction(deal.id, "wholesale_accept");
              }}
              onCounterTerms={(deal) => {
                openDealAction(deal.id, "wholesale_counter");
              }}
            />
          )}
        </InventoryBoundary>
      )}
      
      {dealCategory === "capital" && (
        <InventoryBoundary
          lane="capital"
          mode={viewMode}
          isLoading={projectsLoading}
          isError={projectsError}
          isEmpty={(capitalProjects || []).length === 0}
          onRetry={() => void refetchProjects()}
        >
          {viewMode === "grid" ? (
            <CapitalRaiseGridView
              projects={capitalProjects || []}
              isLoading={false}
              onSelectProject={(project) => {
                setLocation(`/marketflow/capital/${project.id}`);
              }}
              isItemSaved={(id) => isItemSaved('capital_project', String(id))}
              onSave={(id) => toggleSaveItem('capital_project', String(id))}
            />
          ) : (
            <CapitalRaiseSwipeView
              projects={capitalProjects || []}
              onSave={(id) => toggleSaveItem('capital_project', String(id))}
            />
          )}
        </InventoryBoundary>
      )}
      
      {dealCategory === "listings" && (
        <InventoryBoundary
          lane="listings"
          mode="grid"
          isLoading={listingsLoading}
          isError={listingsError}
          isEmpty={(listings || []).length === 0}
          onRetry={() => void refetchListings()}
        >
          <ListingsGridView
            listings={listings || []}
            isLoading={false}
            onViewListing={(listing) => setLocation(`/marketflow/listings/${listing.id}`)}
            onRequestInfo={(listing) => {
              openDealAction(listing.id, "listing_request_info");
            }}
            onScheduleShowing={(listing) => {
              openDealAction(listing.id, "listing_schedule_tour");
            }}
            isItemSaved={(id) => isItemSaved('listing', String(id))}
            onSave={(id) => toggleSaveItem('listing', String(id))}
          />
        </InventoryBoundary>
      )}
      
    </div>
  );
}

type InventoryLane = "wholesale" | "capital" | "listings";
type InventoryMode = "grid" | "swipe";

function InventoryBoundary({
  lane,
  mode,
  isLoading,
  isError,
  isEmpty,
  onRetry,
  children,
}: {
  lane: InventoryLane;
  mode: InventoryMode;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
  children: ReactNode;
}) {
  const stateId = `${lane}-${mode}`;
  const laneCopy = {
    wholesale: {
      noun: "wholesale opportunities",
      emptyTitle: MARKETFLOW_INVENTORY_STATUS,
    },
    capital: {
      noun: "capital opportunities",
      emptyTitle: MARKETFLOW_INVENTORY_STATUS,
    },
    listings: {
      noun: "property listings",
      emptyTitle: MARKETFLOW_INVENTORY_STATUS,
    },
  }[lane];

  if (isLoading) {
    return (
      <Card
        className="border-border/70 bg-card/70 p-8 sm:p-12"
        data-testid={`state-${stateId}-loading`}
        aria-live="polite"
        aria-busy="true"
      >
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <RefreshCw className="mb-5 h-7 w-7 motion-safe:animate-spin text-primary" aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
            MarketFlow review desk
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
            Checking the {laneCopy.noun} workspace
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {MARKETFLOW_INVENTORY_STATUS} The workspace is checking for a future status update.
          </p>
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card
        className="border-destructive/35 bg-destructive/5 p-8 sm:p-12"
        data-testid={`state-${stateId}-error`}
        role="alert"
      >
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <AlertCircle className="mb-5 h-8 w-8 text-destructive" aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-destructive">
            Inventory unavailable
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
            We could not load the reviewed {laneCopy.noun}.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Your access remains intact. Retry this lane; if it continues, the team can inspect the request.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-6 gap-2"
            onClick={onRetry}
            data-testid={`button-retry-${stateId}`}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry {lane === "listings" ? "listings" : lane}
          </Button>
        </div>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card
        className="border-dashed border-border/80 bg-card/60 p-8 text-center sm:p-12"
        data-testid={`state-${stateId}-empty`}
      >
        <div className="mx-auto max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
            Publication status
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            {laneCopy.emptyTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            MarketFlow stays empty until a real opportunity clears review and is authorized for publication. A submission does not promise that outcome.
          </p>
          <Link href="/bring-an-opportunity?intent=deal-jv">
            <Button variant="outline" className="mt-6">
              Submit an opportunity
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}

interface GridViewProps {
  deals: WholesaleDeal[];
  isLoading: boolean;
  onSave: (dealId: string) => void;
  onAction: (deal: WholesaleDeal, actionType: "jv_request" | "invest") => void;
  onAcceptTerms: (deal: WholesaleDeal) => void;
  onCounterTerms: (deal: WholesaleDeal) => void;
  isItemSaved: (id: string) => boolean;
  isSaving: boolean;
  showInvest: boolean;
  isCompareSelected?: (dealId: string) => boolean;
  toggleCompare?: (deal: WholesaleDeal) => void;
  canAddMoreCompare?: boolean;
}

function GridView({ deals, isLoading, onSave, onAction, onAcceptTerms, onCounterTerms, isItemSaved, isSaving, showInvest, isCompareSelected, toggleCompare, canAddMoreCompare }: GridViewProps) {
  const [, setLocation] = useLocation();
  
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            {/* Image area with badges skeleton */}
            <div className="relative h-40 bg-gradient-to-br from-muted to-muted/50">
              <div className="absolute top-2 left-2 flex gap-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="absolute top-2 right-2">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="absolute bottom-2 right-2">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <Skeleton className="h-5 w-3/4 mb-1.5" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-14 rounded" />
                <Skeleton className="h-14 rounded" />
                <Skeleton className="h-14 rounded" />
              </div>
              <Skeleton className="h-9 w-full rounded" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-9 rounded" />
                <Skeleton className="h-9 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <Card className="p-12 lg:p-16 text-center border-dashed max-w-2xl mx-auto">
        <div className="h-14 w-14 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-6">
          <Home className="w-6 h-6 text-primary/70" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
          MarketFlow · Reviewed lane
        </p>
        <h3 className="font-serif text-3xl sm:text-4xl font-semibold mb-5 leading-tight tracking-tight">
          {MARKETFLOW_INVENTORY_STATUS}
        </h3>
        <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          The controlled workspace is prepared for future records that clear review and publication authorization. No timing is promised.
        </p>
        <div className="flex justify-center">
          <Link href="/marketflow">
            <Button
              size="lg"
              className="min-h-[44px] px-8 text-sm uppercase tracking-[0.15em] font-semibold"
              data-testid="button-marketflow-back"
            >
              Back to MarketFlow
            </Button>
          </Link>
        </div>
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
              onAcceptTerms={() => onAcceptTerms(deal)}
              onCounterTerms={() => onCounterTerms(deal)}
              isSaved={isItemSaved(deal.id)}
              isSaving={isSaving}
              showInvest={showInvest}
              isCompareSelected={isCompareSelected?.(deal.id)}
              onToggleCompare={() => toggleCompare?.(deal)}
              canAddMoreCompare={canAddMoreCompare}
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
  onAcceptTerms: (deal: WholesaleDeal) => void;
  onCounterTerms: (deal: WholesaleDeal) => void;
}

function SwipeView({ deals, onSave, onAcceptTerms, onCounterTerms }: SwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIntent, setDragIntent] = useState<"like" | "pass" | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const isAdvancingRef = useRef(false);
  const advanceTimerRef = useRef<number | null>(null);
  const unlockTimerRef = useRef<number | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const reduceMotion = usePrefersReducedMotion();
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 80, 150], [0, 0.5, 1]);
  const passOpacity = useTransform(x, [-150, -80, 0], [1, 0.5, 0]);
  
  const scale = useTransform(x, [-200, -100, 0, 100, 200], [0.95, 1, 1, 1, 0.95]);
  const borderGlow = useTransform(x, [-150, 0, 150], [
    "0 0 30px rgba(239, 68, 68, 0.4)",
    "0 0 0px rgba(0, 0, 0, 0)",
    "0 0 30px rgba(34, 197, 94, 0.4)"
  ]);
  
  const currentDeal = deals[currentIndex];
  const hasMore = currentIndex < deals.length - 1;

  useEffect(() => () => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
    }
    if (unlockTimerRef.current !== null) {
      window.clearTimeout(unlockTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!reduceMotion) return;
    x.stop?.();
    x.set(0);
    setIsDragging(false);
    setDragIntent(null);
  }, [reduceMotion, x]);

  const handleSwipe = (direction: "left" | "right") => {
    if (isAdvancingRef.current || !currentDeal) return;
    isAdvancingRef.current = true;
    setIsAdvancing(true);
    setExitDirection(direction);
    setDragIntent(null);
    
    if (direction === "right" && currentDeal) {
      onSave(currentDeal.id);
      toast({
        title: "Deal Saved!",
        description: "Added to your saved deals.",
        className: "bg-green-50 dark:bg-green-900/30 border-green-200"
      });
    } else if (direction === "left") {
      toast({
        title: "Passed",
        description: "You can always find it later.",
        variant: "default"
      });
    }
    
    const releaseAdvanceLock = () => {
      unlockTimerRef.current = null;
      isAdvancingRef.current = false;
      setIsAdvancing(false);
    };

    const advance = () => {
      if (hasMore) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(deals.length);
      }
      setExitDirection(null);
      x.set(0);
      advanceTimerRef.current = null;
      if (reduceMotion) {
        unlockTimerRef.current = window.setTimeout(releaseAdvanceLock, 250);
      } else {
        releaseAdvanceLock();
      }
    };

    advanceTimerRef.current = window.setTimeout(advance, reduceMotion ? 0 : 250);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (info.offset.x > 60) {
      setDragIntent("like");
    } else if (info.offset.x < -60) {
      setDragIntent("pass");
    } else {
      setDragIntent(null);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;
    const velocity = info.velocity.x;
    
    if (info.offset.x > threshold || velocity > 500) {
      handleSwipe("right");
    } else if (info.offset.x < -threshold || velocity < -500) {
      handleSwipe("left");
    } else {
      setDragIntent(null);
    }
  };

  const handleUndo = () => {
    if (!isAdvancingRef.current && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (deals.length === 0) {
    return (
      <Card className="p-12 lg:p-16 text-center border-dashed max-w-2xl mx-auto">
        <div className="h-14 w-14 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-6">
          <Home className="w-6 h-6 text-primary/70" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
          MarketFlow · Reviewed lane
        </p>
        <h3 className="font-serif text-3xl sm:text-4xl font-semibold mb-5 leading-tight tracking-tight">
          {MARKETFLOW_INVENTORY_STATUS}
        </h3>
        <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          The controlled workspace is prepared for future records that clear review and publication authorization. No timing is promised.
        </p>
      </Card>
    );
  }

  if (currentIndex >= deals.length) {
    return (
      <Card className="p-12 lg:p-16 text-center border-dashed max-w-2xl mx-auto">
        <div className="h-14 w-14 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-6 h-6 text-primary/70" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
          MarketFlow · Lane reviewed
        </p>
        <h3 className="font-serif text-3xl sm:text-4xl font-semibold mb-5 leading-tight tracking-tight">
          You've reviewed every reviewed deal.
        </h3>
        <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          New opportunities are added as Pegasus HQ clears them. Saved sets remain inside the controlled pilot.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(0)}
            className="min-h-[44px] px-6 text-sm uppercase tracking-[0.15em] font-semibold"
            data-testid="button-start-over"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start over
          </Button>
          <Button
            type="button"
            className="min-h-[44px] px-6 text-sm uppercase tracking-[0.15em] font-semibold"
            disabled
            data-testid="button-view-saved-pilot"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Saved workspace · pilot
          </Button>
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
          {reduceMotion ? "Use the controls to save or pass" : "Swipe right to save, left to pass"}
        </p>
      </div>

      <div className="relative h-[500px]">
        {/* Intent indicators on sides */}
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all duration-200 ${dragIntent === "pass" ? "opacity-100 scale-110" : "opacity-30 scale-100"}`}>
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500">
            <X className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-all duration-200 ${dragIntent === "like" ? "opacity-100 scale-110" : "opacity-30 scale-100"}`}>
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500">
            <Heart className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDeal.id}
            drag={reduceMotion ? false : "x"}
            dragConstraints={reduceMotion ? undefined : { left: 0, right: 0 }}
            dragElastic={reduceMotion ? undefined : 0.15}
            onDragStart={reduceMotion ? undefined : () => setIsDragging(true)}
            onDrag={reduceMotion ? undefined : handleDrag}
            onDragEnd={reduceMotion ? undefined : handleDragEnd}
            style={reduceMotion ? undefined : { x, rotate, scale, boxShadow: borderGlow }}
            initial={reduceMotion ? false : { scale: 0.9, opacity: 0, y: 20 }}
            animate={reduceMotion ? { scale: 1, opacity: 1, y: 0, x: 0 } : {
              scale: exitDirection ? 0.95 : 1, 
              opacity: exitDirection ? 0 : 1,
              y: 0,
              x: exitDirection === "left" ? -400 : exitDirection === "right" ? 400 : 0
            }}
            exit={reduceMotion ? { x: 0, opacity: 1, scale: 1, y: 0 } : {
              x: exitDirection === "left" ? -400 : 400,
              opacity: 0,
              scale: 0.9,
              transition: { duration: 0 }
            }}
            transition={reduceMotion
              ? { duration: 0 }
              : exitDirection
                ? { duration: 0.25, ease: "easeOut" }
                : { type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
            className={`absolute inset-0 rounded-md ${isAdvancing ? "pointer-events-none" : ""} ${reduceMotion ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
          >
            <SwipeCard 
              deal={currentDeal}
              likeOpacity={likeOpacity}
              passOpacity={passOpacity}
              onView={() => setLocation(`/marketflow/deals/${currentDeal.id}`)}
              onAcceptTerms={() => onAcceptTerms(currentDeal)}
              onCounterTerms={() => onCounterTerms(currentDeal)}
              isAdvancing={isAdvancing}
              isDragging={isDragging}
              dragIntent={dragIntent}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        <Button 
          aria-label="Undo"
          size="lg" 
          variant="outline" 
          className="rounded-full h-12 w-12"
          onClick={handleUndo}
          disabled={currentIndex === 0 || isAdvancing}
          data-testid="button-undo"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button 
          aria-label="Pass"
          size="lg" 
          variant="outline" 
          className="rounded-full h-14 w-14 border-red-300 hover:bg-red-50 hover:border-red-400"
          onClick={() => handleSwipe("left")}
          disabled={isAdvancing}
          data-testid="button-pass"
        >
          <X className="w-5 h-5 text-red-500" />
        </Button>
        <Button 
          aria-label="Save"
          size="lg" 
          className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600"
          onClick={() => handleSwipe("right")}
          disabled={isAdvancing}
          data-testid="button-save-swipe"
        >
          <Heart className="w-5 h-5" />
        </Button>
        <Button 
          aria-label="Accept terms"
          size="lg" 
          className="rounded-full h-12 w-12"
          onClick={() => onAcceptTerms(currentDeal)}
          disabled={isAdvancing}
          data-testid="button-accept"
        >
          <CheckCircle2 className="w-5 h-5" />
        </Button>
        <Button 
          aria-label="Counter offer"
          size="lg" 
          variant="secondary"
          className="rounded-full h-12 w-12"
          onClick={() => onCounterTerms(currentDeal)}
          disabled={isAdvancing}
          data-testid="button-counter"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Undo • Pass • Save • Accept Terms • Counter Offer
      </p>
    </div>
  );
}

interface SwipeCardProps {
  deal: WholesaleDeal;
  likeOpacity: any;
  passOpacity: any;
  onView: () => void;
  onAcceptTerms: () => void;
  onCounterTerms: () => void;
  isAdvancing: boolean;
  isDragging?: boolean;
  dragIntent?: "like" | "pass" | null;
}

function SwipeCard({ deal, likeOpacity, passOpacity, onView, onAcceptTerms, onCounterTerms, isAdvancing, isDragging, dragIntent }: SwipeCardProps) {
  const address = deal.propertyAddress || deal.address || 'Property Address';
  const cityState = [deal.city, deal.state].filter(Boolean).join(', ');
  const askPrice = deal.askingPrice || deal.contractPrice || 0;
  const arv = deal.arv || 0;
  const repairs = deal.repairEstimate || deal.estimatedRepairs || 0;
  const profit = arv - askPrice - repairs;
  const roi = askPrice > 0 ? ((profit / askPrice) * 100).toFixed(1) : '0';
  const matchScore = typeof deal.matchScore === "number" ? deal.matchScore : null;

  const cardBorderClass = dragIntent === "like" 
    ? "ring-4 ring-green-500/50" 
    : dragIntent === "pass" 
      ? "ring-4 ring-red-500/50" 
      : "";

  return (
    <Card className={`h-full overflow-hidden shadow-md transition-all duration-150 ${cardBorderClass}`}>
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

        {matchScore !== null && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <MatchScoreBadge score={matchScore} />
          </div>
        )}

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
            {cityState || 'Location pending'}
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
          <Button variant="outline" className="flex-1" onClick={onView} disabled={isAdvancing} data-testid="button-view-deal">
            <Eye className="w-4 h-4 mr-2" />
            View Deal
          </Button>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onAcceptTerms} disabled={isAdvancing} data-testid="button-accept-deal-swipe">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Accept Terms
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onCounterTerms} disabled={isAdvancing} data-testid="button-counter-deal-swipe">
            <MessageSquare className="w-4 h-4 mr-2" />
            Counter Offer
          </Button>
        </div>
        <OpenOfferStudioButton
          dealId={deal.id}
          lane="WHOLESALE"
          variant="outline"
          className="w-full"
          stopPropagation
          disabled={isAdvancing}
        />
      </CardContent>
    </Card>
  );
}

interface DealCardProps {
  deal: WholesaleDeal;
  onSave: () => void;
  onAction: (actionType: "jv_request" | "invest") => void;
  onView: () => void;
  onAcceptTerms: () => void;
  onCounterTerms: () => void;
  isSaved: boolean;
  isSaving: boolean;
  showInvest: boolean;
  isCompareSelected?: boolean;
  onToggleCompare?: () => void;
  canAddMoreCompare?: boolean;
}

function DealCard({ deal, onSave, onAction, onView, onAcceptTerms, onCounterTerms, isSaved, isSaving, showInvest, isCompareSelected, onToggleCompare, canAddMoreCompare }: DealCardProps) {
  const { toast } = useToast();
  const [showCalculator, setShowCalculator] = useState(false);
  const [customOffer, setCustomOffer] = useState("");
  const [customRepairs, setCustomRepairs] = useState("");
  
  const address = deal.propertyAddress || deal.address || 'Property Address';
  const cityState = [deal.city, deal.state].filter(Boolean).join(', ');
  const askPrice = deal.askingPrice || deal.contractPrice || 0;
  const arv = deal.arv || 0;
  const repairs = deal.repairEstimate || deal.estimatedRepairs || 0;
  const profit = arv - askPrice - repairs;
  const matchScore = typeof deal.matchScore === "number" ? deal.matchScore : null;
  const roi = askPrice > 0 ? ((profit / askPrice) * 100).toFixed(1) : "0";

  // Calculator values
  const calcOffer = customOffer ? parseFloat(customOffer) : askPrice;
  const calcRepairs = customRepairs ? parseFloat(customRepairs) : repairs;
  const calcProfit = arv - calcOffer - calcRepairs;
  const calcROI = calcOffer > 0 ? ((calcProfit / calcOffer) * 100).toFixed(1) : "0";
  const cashOnCash = calcOffer > 0 ? ((calcProfit / (calcOffer * 0.25)) * 100).toFixed(1) : "0"; // 25% down

  const handleShare = async (type: "copy" | "email") => {
    const dealUrl = `${window.location.origin}/marketflow/deals/${deal.id}`;
    if (type === "copy") {
      await navigator.clipboard.writeText(dealUrl);
      toast({ title: "Link copied!", description: "Deal link copied to clipboard" });
    } else {
      const subject = encodeURIComponent(`Check out this deal: ${address}`);
      const body = encodeURIComponent(`I found this reviewed opportunity:\n\n${address}\n${cityState}\nAsking: $${askPrice.toLocaleString()}\nARV: $${arv.toLocaleString()}\nProfit: $${profit.toLocaleString()}\n\nView details: ${dealUrl}`);
      window.open(`mailto:?subject=${subject}&body=${body}`);
    }
  };

  return (
    <Card className="overflow-hidden group relative">
      {/* Quick Actions Bar - appears on hover */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
        <div className="flex gap-2 bg-background/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); onSave(); }} data-testid={`quick-save-${deal.id}`} aria-label={isSaved ? "Saved" : "Save deal"}>
                {isSaved ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>{isSaved ? "Saved" : "Save Deal"}</p></TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); setShowCalculator(!showCalculator); }} data-testid={`quick-calc-${deal.id}`} aria-label="Deal calculator">
                <Calculator className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Deal Calculator</p></TooltipContent>
          </Tooltip>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={(e) => e.stopPropagation()} data-testid={`quick-share-${deal.id}`} aria-label="Share deal">
                <Share2 className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2" align="center">
              <div className="space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleShare("copy")}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleShare("email")}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email Deal
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {onToggleCompare && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant={isCompareSelected ? "default" : "ghost"} 
                  className="h-8 w-8 rounded-full" 
                  onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
                  disabled={!isCompareSelected && !canAddMoreCompare}
                  data-testid={`quick-compare-${deal.id}`}
                  aria-label={isCompareSelected ? "Remove from compare" : "Add to compare"}
                >
                  <Columns className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCompareSelected ? "Remove from Compare" : canAddMoreCompare ? "Add to Compare" : "Compare List Full (3)"}</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {deal.canRequestJv === true && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); onAction("jv_request"); }} data-testid={`quick-jv-${deal.id}`} aria-label="JV request">
                  <Handshake className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>JV Request</p></TooltipContent>
            </Tooltip>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="default" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); onAcceptTerms(); }} data-testid={`quick-accept-${deal.id}`} aria-label="Quick offer">
                <Zap className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Quick Offer</p></TooltipContent>
          </Tooltip>
        </div>
      </div>

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
          {deal.canRequestJv === true && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Handshake className="w-2.5 h-2.5" />
              JV Open
            </Badge>
          )}
        </div>

        {matchScore !== null && (
          <div className="absolute top-2 right-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <MatchScoreBadge score={matchScore} size="sm" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="w-56 p-3" side="left">
                <p className="text-xs leading-relaxed">
                  Stored match score. Detailed fit factors stay hidden unless backed by
                  the approved buyer/operator profile.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

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
            {cityState || 'Location pending'}
          </p>
        </div>

        {/* Inline Calculator Widget */}
        <AnimatePresence>
          {showCalculator && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium flex items-center gap-1">
                    <Calculator className="w-3 h-3" />
                    Deal Calculator
                  </span>
                  <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setShowCalculator(false)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Your Offer</label>
                    <Input 
                      type="number" 
                      placeholder={askPrice.toString()} 
                      value={customOffer}
                      onChange={(e) => setCustomOffer(e.target.value)}
                      className="h-7 text-xs"
                      data-testid={`input-calc-offer-${deal.id}`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Est. Repairs</label>
                    <Input 
                      type="number" 
                      placeholder={repairs.toString()} 
                      value={customRepairs}
                      onChange={(e) => setCustomRepairs(e.target.value)}
                      className="h-7 text-xs"
                      data-testid={`input-calc-repairs-${deal.id}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div className="bg-background rounded p-1.5">
                    <p className="text-[9px] text-muted-foreground">Profit</p>
                    <p className={`font-bold text-xs ${calcProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${(calcProfit / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="bg-background rounded p-1.5">
                    <p className="text-[9px] text-muted-foreground">ROI</p>
                    <p className="font-bold text-xs">{calcROI}%</p>
                  </div>
                  <div className="bg-background rounded p-1.5">
                    <p className="text-[9px] text-muted-foreground">CoC (25%)</p>
                    <p className="font-bold text-xs text-primary">{cashOnCash}%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Workflow Indicators Row */}
        <div className="flex items-center justify-between gap-2 mb-3 py-2 px-1 bg-muted/30 rounded text-xs">
          <DueDiligenceProgress dealId={deal.id} />
          <DocumentCount dealId={deal.id} />
          <CommunicationSummary dealId={deal.id} />
          <InlineROIBadge deal={{
            contractPrice: deal.contractPrice,
            askingPrice: deal.askingPrice,
            arv: deal.arv,
            repairEstimate: deal.repairEstimate,
            estimatedRepairs: deal.estimatedRepairs,
            assignmentFee: deal.assignmentFee
          }} />
        </div>

        <div className="flex gap-2 mb-2">
          <Button variant="outline" className="flex-1" onClick={onView} data-testid={`button-view-deal-${deal.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            View Deal
          </Button>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onAcceptTerms} data-testid={`button-accept-terms-${deal.id}`}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Accept Terms
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onCounterTerms} data-testid={`button-counter-terms-${deal.id}`}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Counter Offer
          </Button>
        </div>
        <div className="mt-2">
          <OpenOfferStudioButton
            dealId={deal.id}
            lane="WHOLESALE"
            variant="outline"
            className="w-full"
            stopPropagation
          />
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
  isItemSaved: (id: number) => boolean;
  onSave: (id: number) => void;
}

function CapitalRaiseGridView({ 
  projects, 
  isLoading, 
  onSelectProject, 
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
        <h3 className="text-lg font-semibold mb-2">No private project records available</h3>
        <p className="text-muted-foreground">
          New source-supplied project context will appear here when it is available.
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
  isSaved: boolean;
  onSave: () => void;
}

function CapitalRaiseCard({ project, onView, isSaved, onSave }: CapitalRaiseCardProps) {
  const getStrategyLabel = (strategy: string | null | undefined) => {
    const labels: Record<string, string> = {
      "fix-flip": "Fix & Flip",
      "buy-hold": "Buy & Hold",
      "value-add": "Value Add",
      "development": "Development",
      "new-construction": "New Construction",
    };
    return labels[strategy || ""] || strategy || "Project";
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
          <Badge variant="outline" className="bg-background/90 text-foreground">
            Private project record
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
            {project.location || 'Location pending'}
          </p>
        </div>

        <div className="mb-3 rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Relationship information only.</span>{" "}
          This source-supplied record is not an offering and does not accept funds, offers,
          allocations, or commitments.
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onView} data-testid={`button-view-project-${project.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface CapitalRaiseSwipeViewProps {
  projects: CapitalProject[];
  onSave: (id: number) => void;
}

function CapitalRaiseSwipeView({ projects, onSave }: CapitalRaiseSwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const isAdvancingRef = useRef(false);
  const advanceTimerRef = useRef<number | null>(null);
  const unlockTimerRef = useRef<number | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const reduceMotion = usePrefersReducedMotion();
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);
  
  const currentProject = projects[currentIndex];
  const hasMore = currentIndex < projects.length - 1;

  useEffect(() => () => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
    }
    if (unlockTimerRef.current !== null) {
      window.clearTimeout(unlockTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!reduceMotion) return;
    x.stop?.();
    x.set(0);
  }, [reduceMotion, x]);

  const handleSwipe = (direction: "left" | "right") => {
    if (isAdvancingRef.current || !currentProject) return;
    isAdvancingRef.current = true;
    setIsAdvancing(true);
    setExitDirection(direction);
    
    if (direction === "right" && currentProject) {
      onSave(currentProject.id);
      toast({
        title: "Project Saved!",
        description: "Added to your saved projects.",
      });
    }
    
    const releaseAdvanceLock = () => {
      unlockTimerRef.current = null;
      isAdvancingRef.current = false;
      setIsAdvancing(false);
    };

    const advance = () => {
      if (hasMore) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(projects.length);
      }
      setExitDirection(null);
      x.set(0);
      advanceTimerRef.current = null;
      if (reduceMotion) {
        unlockTimerRef.current = window.setTimeout(releaseAdvanceLock, 300);
      } else {
        releaseAdvanceLock();
      }
    };

    advanceTimerRef.current = window.setTimeout(advance, reduceMotion ? 0 : 300);
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
    if (!isAdvancingRef.current && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center max-w-lg mx-auto">
        <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No private project records available</h3>
        <p className="text-muted-foreground">
          New source-supplied project context will appear here when it is available.
        </p>
      </Card>
    );
  }

  if (currentIndex >= projects.length) {
    return (
      <Card className="p-12 text-center max-w-lg mx-auto">
        <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">You've Seen All Projects!</h3>
        <p className="text-muted-foreground mb-6">
          You've reviewed all available private project records.
        </p>
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setCurrentIndex(0)} data-testid="button-capital-start-over">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-4">
        <Badge variant="outline" className="gap-1">
          {currentIndex + 1} / {projects.length}
        </Badge>
        <p className="text-sm text-muted-foreground mt-2">
          {reduceMotion ? "Use the controls to save or pass" : "Swipe right to save, left to pass"}
        </p>
      </div>

      <div className="relative h-[440px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProject.id}
            drag={reduceMotion ? false : "x"}
            dragConstraints={reduceMotion ? undefined : { left: 0, right: 0 }}
            onDragEnd={reduceMotion ? undefined : handleDragEnd}
            style={reduceMotion ? undefined : { x, rotate }}
            initial={reduceMotion ? false : { scale: 0.95, opacity: 0 }}
            animate={reduceMotion ? { scale: 1, opacity: 1, x: 0 } : {
              scale: 1, 
              opacity: 1,
              x: exitDirection === "left" ? -300 : exitDirection === "right" ? 300 : 0
            }}
            exit={reduceMotion ? { scale: 1, opacity: 1, x: 0 } : {
              x: exitDirection === "left" ? -300 : 300,
              opacity: 0,
              transition: { duration: 0 }
            }}
            transition={reduceMotion
              ? { duration: 0 }
              : exitDirection
                ? { duration: 0.3, ease: "easeOut" }
                : { type: "spring", stiffness: 300, damping: 20 }}
            className={`absolute inset-0 ${isAdvancing ? "pointer-events-none" : ""} ${reduceMotion ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
          >
            <CapitalSwipeCard 
              project={currentProject}
              likeOpacity={likeOpacity}
              passOpacity={passOpacity}
              onView={() => setLocation(`/marketflow/capital/${currentProject.id}`)}
              isAdvancing={isAdvancing}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        <Button 
          aria-label="Undo"
          size="lg" 
          variant="outline" 
          className="rounded-full h-12 w-12"
          onClick={handleUndo}
          disabled={currentIndex === 0 || isAdvancing}
          data-testid="button-capital-undo"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button 
          aria-label="Pass"
          size="lg" 
          variant="outline" 
          className="rounded-full h-14 w-14 border-red-300 hover:bg-red-50 hover:border-red-400"
          onClick={() => handleSwipe("left")}
          disabled={isAdvancing}
          data-testid="button-capital-pass"
        >
          <X className="w-5 h-5 text-red-500" />
        </Button>
        <Button 
          aria-label="Save"
          size="lg" 
          className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600"
          onClick={() => handleSwipe("right")}
          disabled={isAdvancing}
          data-testid="button-capital-save-swipe"
        >
          <Heart className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Undo • Pass • Save
      </p>
    </div>
  );
}

interface CapitalSwipeCardProps {
  project: CapitalProject;
  likeOpacity: any;
  passOpacity: any;
  onView: () => void;
  isAdvancing: boolean;
}

function CapitalSwipeCard({ project, likeOpacity, passOpacity, onView, isAdvancing }: CapitalSwipeCardProps) {
  const getStrategyLabel = (strategy: string | null | undefined) => {
    const labels: Record<string, string> = {
      "fix-flip": "Fix & Flip",
      "buy-hold": "Buy & Hold",
      "value-add": "Value Add",
      "development": "Development",
      "new-construction": "New Construction",
    };
    return labels[strategy || ""] || strategy || "Project";
  };

  return (
    <Card className="h-full overflow-hidden shadow-md">
      <div className="relative h-44 bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20">
        {project.images?.[0] ? (
          <img 
            src={project.images[0]} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp className="w-16 h-16 text-green-600/30" />
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

        <div className="absolute bottom-2 left-2 flex gap-1">
          <Badge variant="outline" className="bg-background/90 text-foreground">
            Private project record
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px]">
              {getStrategyLabel(project.strategy)}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg truncate">{project.title}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {project.location || 'Location pending'}
          </p>
        </div>

        <div className="rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Relationship information only.</span>{" "}
          This record is not an offering and does not accept funds, offers, allocations, or commitments.
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onView} disabled={isAdvancing} data-testid="button-view-capital-swipe">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ListingsGridViewProps {
  listings: Listing[];
  isLoading: boolean;
  onViewListing: (listing: Listing) => void;
  onRequestInfo: (listing: Listing) => void;
  onScheduleShowing: (listing: Listing) => void;
  isItemSaved: (id: number) => boolean;
  onSave: (id: number) => void;
}

function ListingsGridView({ 
  listings, 
  isLoading, 
  onViewListing, 
  onRequestInfo, 
  onScheduleShowing,
  isItemSaved,
  onSave
}: ListingsGridViewProps) {
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

  if (listings.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Listings Available</h3>
        <p className="text-muted-foreground">
          Check back later for new property listings.
        </p>
      </Card>
    );
  }

  return (
    <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <StaggerItem key={listing.id}>
          <HoverLift>
            <ListingCard
              listing={listing}
              onView={() => onViewListing(listing)}
              onRequestInfo={() => onRequestInfo(listing)}
              onScheduleShowing={() => onScheduleShowing(listing)}
              isSaved={isItemSaved(listing.id)}
              onSave={() => onSave(listing.id)}
            />
          </HoverLift>
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}

interface ListingCardProps {
  listing: Listing;
  onView: () => void;
  onRequestInfo: () => void;
  onScheduleShowing: () => void;
  isSaved: boolean;
  onSave: () => void;
}

function ListingCard({ listing, onView, onRequestInfo, onScheduleShowing, isSaved, onSave }: ListingCardProps) {
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "Contact for pricing";
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const getListingTypeBadge = (type: string) => {
    if (type === "on_market") {
      return <Badge className="bg-green-600 text-white text-[10px]">On Market</Badge>;
    }
    return <Badge variant="secondary" className="text-[10px]">Direct submission</Badge>;
  };

  const getConditionBadge = (condition: string | undefined) => {
    if (!condition) return null;
    const labels: Record<string, { label: string; className: string }> = {
      "move_in_ready": { label: "Move-In Ready", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
      "needs_minor_updates": { label: "Minor Updates", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
      "needs_renovation": { label: "Needs Renovation", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
    };
    const config = labels[condition];
    if (!config) return null;
    return <Badge variant="outline" className={`text-[10px] ${config.className}`}>{config.label}</Badge>;
  };

  return (
    <Card className="overflow-hidden group">
      <div className="relative h-40 bg-gradient-to-br from-muted to-muted/50">
        {listing.images?.[0] ? (
          <img 
            src={listing.images[0]} 
            alt={listing.propertyAddress}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {getListingTypeBadge(listing.listingType)}
          {getConditionBadge(listing.condition)}
          {listing.isFeatured && (
            <Badge className="bg-primary text-primary-foreground gap-1 text-[10px]">
              <Sparkles className="w-3 h-3" />
              Featured
            </Badge>
          )}
        </div>
        
        <div className="absolute top-2 right-2 flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 bg-background/80 backdrop-blur-sm ${isSaved ? 'text-primary' : ''}`}
            onClick={(e) => { e.stopPropagation(); onSave(); }}
            data-testid={`button-save-listing-${listing.id}`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className="absolute bottom-2 right-2">
          <div className="bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 font-bold text-sm">
            {formatCurrency(listing.listPrice)}
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="mb-3">
          <h3 className="font-semibold truncate" data-testid={`text-listing-address-${listing.id}`}>
            {listing.propertyAddress}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {listing.city}, {listing.state}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {listing.bedrooms && (
            <span>{listing.bedrooms} bed</span>
          )}
          {listing.bathrooms && (
            <span>{listing.bathrooms} bath</span>
          )}
          {listing.sqft && (
            <span>{listing.sqft.toLocaleString()} sqft</span>
          )}
        </div>

        {listing.daysOnMarket !== undefined && listing.daysOnMarket > 0 && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {listing.daysOnMarket} days on market
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onView} data-testid={`button-view-listing-${listing.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            View Listing
          </Button>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onRequestInfo} data-testid={`button-request-info-${listing.id}`}>
            <FileText className="w-4 h-4 mr-2" />
            Request Info
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onScheduleShowing} data-testid={`button-schedule-showing-${listing.id}`}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Showing
          </Button>
        </div>
        <OpenOfferStudioButton
          dealId={listing.id}
          lane="LISTING"
          variant="outline"
          className="w-full"
          stopPropagation
        />
      </CardContent>
    </Card>
  );
}
