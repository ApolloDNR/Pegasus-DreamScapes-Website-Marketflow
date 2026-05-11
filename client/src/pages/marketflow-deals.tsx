import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useSupabaseMarketplace } from "@/hooks/use-supabase-marketplace";
import { useDealAction } from "@/contexts/deal-action-context";
import { useDemoMode } from "@/contexts/demo-mode-context";
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
import { sampleWholesaleDeals } from "@/lib/sample-data";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo, useSpring } from "framer-motion";
import type { CapitalProject } from "@shared/schema";
import { DealProgressTracker, ActivityTimeline } from "@/components/deal-progress-tracker";
import { DealNotes, NotesIndicator } from "@/components/deal-notes";
import { useCompareDeals, DealComparisonButton, CompareCheckbox, ComparisonModal } from "@/components/deal-comparison";
import { BulkActionsBar, useBulkSelection, BulkSelectCheckbox } from "@/components/bulk-actions";
import { ExportDialog, QuickExportButton } from "@/components/deal-export";
import { DealMapView } from "@/components/deal-map-view";
import { KeyboardShortcutsDialog, KeyboardShortcutHint } from "@/components/keyboard-shortcuts-dialog";
import { useSavedSearches, SaveSearchDialog, SavedSearchesList } from "@/components/saved-searches";
import { useWatchlistFolders, AddToFolderDialog, FolderSidebar } from "@/components/watchlist-folders";
import { DueDiligenceProgress } from "@/components/due-diligence-checklist";
import { TimelineProgress } from "@/components/deal-timeline";
import { CommunicationSummary } from "@/components/communication-log";
import { DocumentCount } from "@/components/document-attachments";
import { QuickCalcButton, InlineROIBadge } from "@/components/quick-calculator";
import { ActivityFeedWidget, useActivityFeed } from "@/components/activity-feed";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { BetaBanner } from "@/components/beta-banner";
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
  Map,
  Download,
  Keyboard,
  FolderPlus,
  CheckSquare,
  ClipboardList,
  Folder,
  FolderOpen,
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

export default function MarketflowDeals() {
  return (
    <MarketplaceLayout>
      <DealsPage />
    </MarketplaceLayout>
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
  
  // Comparison mode state
  const { 
    selectedDeals: compareDeals, 
    toggleDeal: toggleCompare, 
    isSelected: isCompareSelected, 
    clearSelection: clearCompare, 
    canAddMore: canAddMoreCompare,
    showComparison,
    setShowComparison
  } = useCompareDeals(3);
  
  // Feature dialog states
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSaveSearchDialog, setShowSaveSearchDialog] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showFolderSidebar, setShowFolderSidebar] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [addToFolderDeal, setAddToFolderDeal] = useState<WholesaleDeal | null>(null);
  
  // Feature hooks
  const savedSearches = useSavedSearches();
  const watchlistFolders = useWatchlistFolders();
  
  // Keyboard shortcuts handler - memoized to prevent stale closures
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    // ? key for help
    if (e.key === '?' && e.shiftKey) {
      e.preventDefault();
      setShowKeyboardShortcuts(true);
    }
    // m for map view
    if (e.key === 'm' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setShowMapView(prev => !prev);
    }
    // e for export
    if (e.key === 'e' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setShowExportDialog(true);
    }
    // s for save search
    if (e.key === 's' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setShowSaveSearchDialog(true);
    }
    // v for toggle view mode
    if (e.key === 'v' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setViewMode(prev => prev === 'grid' ? 'swipe' : 'grid');
    }
    // / for focus search (SearchAutocomplete uses input-search testid)
    if (e.key === '/') {
      e.preventDefault();
      const searchContainer = document.querySelector('[data-testid="search-autocomplete"]');
      const searchInput = searchContainer?.querySelector('input') as HTMLInputElement;
      searchInput?.focus();
    }
    // Escape to close modals
    if (e.key === 'Escape') {
      setShowKeyboardShortcuts(false);
      setShowExportDialog(false);
      setShowSaveSearchDialog(false);
      setShowMapView(false);
    }
  }, []);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  const { isAuthenticated, isWholesaler, isDreamscaper, isInvestor, isAdmin, isGuestMode, guestRole, exitGuestMode } = useSupabaseAuth();
  const { isDemoMode, disableDemoMode } = useDemoMode();
  const { toast } = useToast();
  const { isItemSaved, toggleSaveItem, isSaving } = useSupabaseMarketplace();
  const { openDealAction } = useDealAction();
  const [, setLocation] = useLocation();

  const canBrowse = isAuthenticated || isGuestMode || isDemoMode;
  const shouldFetchLiveData = isAuthenticated && !isDemoMode && !isGuestMode;

  const { data: deals, isLoading: dealsLoading } = useQuery<WholesaleDeal[]>({
    queryKey: ['/api/wholesale-deals'],
    enabled: shouldFetchLiveData,
  });

  const { data: capitalProjects, isLoading: projectsLoading } = useQuery<CapitalProject[]>({
    queryKey: ['/api/capital-projects'],
    enabled: shouldFetchLiveData,
  });

  const { data: listings, isLoading: listingsLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings'],
    enabled: shouldFetchLiveData,
  });

  const handleDealAction = (deal: WholesaleDeal, actionType: "jv_request" | "invest") => {
    if (!isAuthenticated && !isGuestMode) {
      toast({
        title: "Sign in required",
        description: isDemoMode 
          ? "Demo mode allows browsing only. Sign up for an account to take action on deals."
          : "Please sign in to take action on deals.",
        variant: "default",
      });
      if (isDemoMode) {
        setTimeout(() => setLocation("/signup"), 2000);
      }
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
        description: isDemoMode 
          ? "Demo mode allows browsing only. Sign up to save deals to your watchlist."
          : "Please sign in to save deals.",
        variant: "default",
      });
      return;
    }
    await toggleSaveItem('wholesale_deal', dealId);
  };

  const useSampleData = isGuestMode || isDemoMode || (!deals?.length && !dealsLoading);
  const displayDeals = useSampleData 
    ? sampleWholesaleDeals.map(d => ({
        ...d,
        id: String(d.id),
        matchScore: Math.floor(Math.random() * 40) + 60
      })) as WholesaleDeal[]
    : (deals || []) as WholesaleDeal[];
  
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

  // Bulk selection for batch operations (must be after filteredDeals is defined)
  const {
    selectedIds: bulkSelectedIds,
    toggleItem: toggleBulkSelect,
    selectAll: selectAllBulk,
    clearSelection: clearBulkSelection,
    isSelected: isBulkSelected,
    selectedCount: bulkSelectedCount
  } = useBulkSelection(filteredDeals);

  return (
    <div className="space-y-6">
      {/* Beta Banner */}
      <BetaBanner section="marketflow" showFeatureLists={false} dismissible={true} />
      
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-medium text-foreground">Demo Mode Active</p>
              <p className="text-sm text-muted-foreground">
                You're exploring the marketplace in demo mode. Sign up to unlock full features.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/signup">
              <Button size="sm" data-testid="button-demo-signup">
                <LogIn className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </Link>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                disableDemoMode();
                setLocation("/marketflow");
              }}
              data-testid="button-exit-demo"
            >
              Exit Demo
            </Button>
          </div>
        </div>
      )}

      {/* Progress Tracker - shows pipeline status for authenticated users */}
      <DealProgressTracker />

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
                : dealCategory === "capital"
                  ? "Browse capital raise opportunities. Invest in operator projects."
                  : "Browse ready-to-move-in properties. Request info or schedule showings."}
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
              <span className="hidden sm:inline truncate">Capital Raises</span>
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
          
          <div className="hidden md:flex items-center gap-1 border-l pl-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={showMapView ? "default" : "ghost"} 
                  size="icon"
                  onClick={() => setShowMapView(!showMapView)}
                  data-testid="button-toggle-map"
                >
                  <Map className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Map View <KeyboardShortcutHint shortcut="M" /></p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowExportDialog(true)}
                  data-testid="button-export"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Deals <KeyboardShortcutHint shortcut="E" /></p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowSaveSearchDialog(true)}
                  data-testid="button-save-search"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save Search <KeyboardShortcutHint shortcut="S" /></p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowKeyboardShortcuts(true)}
                  data-testid="button-keyboard-shortcuts"
                >
                  <Keyboard className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Keyboard Shortcuts <KeyboardShortcutHint shortcut="?" /></p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={showSavedSearches ? "default" : "ghost"} 
                  size="icon"
                  onClick={() => setShowSavedSearches(!showSavedSearches)}
                  data-testid="button-toggle-saved-searches"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Saved Searches</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={showActivityFeed ? "default" : "ghost"} 
                  size="icon"
                  onClick={() => setShowActivityFeed(!showActivityFeed)}
                  data-testid="button-toggle-activity"
                >
                  <Clock className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Activity Feed</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={showFolderSidebar ? "default" : "ghost"} 
                  size="icon"
                  onClick={() => setShowFolderSidebar(!showFolderSidebar)}
                  data-testid="button-toggle-folders"
                >
                  <FolderOpen className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Watchlist Folders</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
      
      {/* Saved Searches Panel */}
      {showSavedSearches && dealCategory === "wholesale" && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Saved Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SavedSearchesList
              searches={savedSearches.savedSearches}
              onApply={(search) => {
                if (search.filters.propertyType) setPropertyType(search.filters.propertyType);
                if (search.filters.query) setSearchQuery(search.filters.query);
                if (search.filters.sortBy) setSortBy(search.filters.sortBy);
                savedSearches.markUsed(search.id);
                toast({
                  title: "Search loaded",
                  description: `Applied filters from "${search.name}"`,
                });
              }}
              onDelete={(id) => {
                savedSearches.deleteSearch(id);
                toast({
                  title: "Search deleted",
                  description: "Saved search has been removed.",
                });
              }}
              onToggleAlerts={(id) => savedSearches.toggleAlerts(id)}
            />
          </CardContent>
        </Card>
      )}

      {/* Activity Feed Panel */}
      {showActivityFeed && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ActivityFeedWidget />
            <div className="text-center text-muted-foreground text-sm py-4">
              <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p>No recent activity to display</p>
              <p className="text-xs">Your deal interactions will appear here</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Watchlist Folders Panel */}
      {showFolderSidebar && dealCategory === "wholesale" && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Watchlist Folders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FolderSidebar
              folders={watchlistFolders.folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={(folderId) => {
                setSelectedFolderId(folderId);
                if (folderId) {
                  toast({
                    title: "Folder selected",
                    description: "Showing deals from this folder",
                  });
                }
              }}
              onCreateFolder={() => {
                watchlistFolders.createFolder("New Folder", "#3B82F6");
                toast({
                  title: "Folder created",
                  description: "New watchlist folder added",
                });
              }}
              onDeleteFolder={(id) => {
                watchlistFolders.deleteFolder(id);
                if (selectedFolderId === id) setSelectedFolderId(null);
                toast({
                  title: "Folder deleted",
                  description: "Watchlist folder removed",
                });
              }}
              onEditFolder={(folder) => {
                toast({
                  title: "Edit folder",
                  description: `Editing "${folder.name}"`,
                });
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Map View - Google Maps integration */}
      {showMapView && dealCategory === "wholesale" && (
        <div className="mb-6">
          <DealMapView
            deals={filteredDeals.map(deal => ({
              id: deal.id,
              lat: deal.latitude || 0,
              lng: deal.longitude || 0,
              address: deal.propertyAddress || deal.address || '',
              city: deal.city,
              state: deal.state,
              askingPrice: deal.askingPrice,
              arv: deal.arv,
              propertyType: deal.propertyType,
              status: deal.status,
              matchScore: deal.matchScore
            }))}
            onDealSelect={(dealId) => openDealAction(dealId, "wholesale_accept")}
            selectedDealId={undefined}
            isLoading={dealsLoading && !useSampleData}
          />
        </div>
      )}

      {dealCategory === "wholesale" && (
        viewMode === "grid" ? (
          <GridView 
            deals={filteredDeals}
            isLoading={dealsLoading && !useSampleData}
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
            showJVRequest={isWholesaler || isAdmin}
            isCompareSelected={isCompareSelected}
            toggleCompare={toggleCompare}
            canAddMoreCompare={canAddMoreCompare}
          />
        ) : (
          <SwipeView 
            deals={filteredDeals}
            onSave={handleSaveDeal}
            onAction={handleDealAction}
            onAcceptTerms={(deal) => {
              openDealAction(deal.id, "wholesale_accept");
            }}
            onCounterTerms={(deal) => {
              openDealAction(deal.id, "wholesale_counter");
            }}
            isItemSaved={(id) => isItemSaved('wholesale_deal', id)}
            showInvest={isDreamscaper || isInvestor || isAdmin}
            showJVRequest={isWholesaler || isAdmin}
          />
        )
      )}
      
      {dealCategory === "capital" && (
        viewMode === "grid" ? (
          <CapitalRaiseGridView 
            projects={capitalProjects || []}
            isLoading={projectsLoading}
            onSelectProject={(project) => {
              setLocation(`/marketflow/capital/${project.id}`);
            }}
            onAcceptTerms={(project) => {
              openDealAction(project.id, "capital_accept");
            }}
            onCounterTerms={(project) => {
              openDealAction(project.id, "capital_counter");
            }}
            isItemSaved={(id) => isItemSaved('capital_project', String(id))}
            onSave={(id) => toggleSaveItem('capital_project', String(id))}
          />
        ) : (
          <CapitalRaiseSwipeView 
            projects={capitalProjects || []}
            onSave={(id) => toggleSaveItem('capital_project', String(id))}
            onAcceptTerms={(project) => {
              openDealAction(project.id, "capital_accept");
            }}
            onCounterTerms={(project) => {
              openDealAction(project.id, "capital_counter");
            }}
            isItemSaved={(id) => isItemSaved('capital_project', String(id))}
          />
        )
      )}
      
      {dealCategory === "listings" && (
        <ListingsGridView 
          listings={listings || []}
          isLoading={listingsLoading}
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
      )}
      
      {/* Comparison floating button and modal */}
      {dealCategory === "wholesale" && viewMode === "grid" && (
        <>
          <DealComparisonButton
            selectedDeals={compareDeals}
            onToggle={() => {}}
            onClear={clearCompare}
            onCompare={() => setShowComparison(true)}
          />
          <ComparisonModal
            deals={compareDeals}
            open={showComparison}
            onClose={() => setShowComparison(false)}
            onAction={(dealId, action) => {
              const deal = compareDeals.find(d => d.id === dealId);
              if (deal) {
                if (action === "accept") {
                  openDealAction(deal.id, "wholesale_accept");
                } else {
                  openDealAction(deal.id, "wholesale_counter");
                }
              }
              setShowComparison(false);
            }}
          />
        </>
      )}
      
      {/* Bulk Actions Bar - appears when items are selected */}
      <BulkActionsBar
        selectedCount={bulkSelectedCount}
        totalCount={filteredDeals.length}
        onSelectAll={selectAllBulk}
        onClearSelection={clearBulkSelection}
        onBulkSave={() => {
          bulkSelectedIds.forEach(id => handleSaveDeal(id));
          toast({
            title: "Deals saved",
            description: `${bulkSelectedCount} deals saved to your watchlist.`,
          });
          clearBulkSelection();
        }}
        onBulkCompare={() => {
          const selectedDeals = filteredDeals.filter(d => bulkSelectedIds.has(d.id));
          selectedDeals.slice(0, 3).forEach(d => toggleCompare(d));
          setShowComparison(true);
          clearBulkSelection();
        }}
        onBulkExport={(format) => {
          setShowExportDialog(true);
          clearBulkSelection();
        }}
        onAddToFolder={() => {
          const firstSelected = filteredDeals.find(d => bulkSelectedIds.has(d.id));
          if (firstSelected) {
            setAddToFolderDeal(firstSelected);
          }
        }}
        compareDisabled={bulkSelectedCount > 3}
      />

      {/* Feature Dialogs */}
      <KeyboardShortcutsDialog 
        open={showKeyboardShortcuts} 
        onClose={() => setShowKeyboardShortcuts(false)} 
      />
      
      <ExportDialog 
        open={showExportDialog} 
        onClose={() => setShowExportDialog(false)} 
        deals={filteredDeals.map(d => ({
          id: d.id,
          address: d.propertyAddress || d.address || '',
          city: d.city || '',
          state: d.state || '',
          askingPrice: d.askingPrice || d.contractPrice || 0,
          arv: d.arv || 0,
          repairEstimate: d.repairEstimate || d.estimatedRepairs || 0,
          propertyType: d.propertyType || '',
          status: d.status || 'active',
          matchScore: d.matchScore,
        }))}
        selectedCount={compareDeals.length}
      />
      
      <SaveSearchDialog 
        open={showSaveSearchDialog} 
        onClose={() => setShowSaveSearchDialog(false)}
        onSave={(name: string) => {
          savedSearches.saveSearch(name, {
            propertyType,
            sortBy,
            query: searchQuery,
          });
          toast({
            title: "Search saved",
            description: `"${name}" has been saved to your searches.`,
          });
          setShowSaveSearchDialog(false);
        }}
        currentFilters={{
          propertyType,
          sortBy,
          query: searchQuery,
        }}
      />
      
      <AddToFolderDialog
        open={!!addToFolderDeal}
        onClose={() => setAddToFolderDeal(null)}
        dealId={addToFolderDeal?.id || ''}
        dealAddress={addToFolderDeal?.propertyAddress || addToFolderDeal?.address || ''}
        folders={watchlistFolders.folders}
        onAddToFolder={(folderId: string) => {
          if (addToFolderDeal) {
            watchlistFolders.addDealToFolder(folderId, addToFolderDeal.id);
            toast({
              title: "Added to folder",
              description: "Deal added to your watchlist folder.",
            });
          }
          setAddToFolderDeal(null);
        }}
        onCreateFolder={() => {
          watchlistFolders.createFolder("New Folder", "#3B82F6");
        }}
      />
    </div>
  );
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
  showJVRequest: boolean;
  isCompareSelected?: (dealId: string) => boolean;
  toggleCompare?: (deal: WholesaleDeal) => void;
  canAddMoreCompare?: boolean;
}

function GridView({ deals, isLoading, onSave, onAction, onAcceptTerms, onCounterTerms, isItemSaved, isSaving, showInvest, showJVRequest, isCompareSelected, toggleCompare, canAddMoreCompare }: GridViewProps) {
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
      <Card className="p-12 text-center border-dashed">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
          <Home className="w-8 h-8 text-primary/60" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Deals Match Your Criteria</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Try adjusting your filters or expanding your search to discover more investment opportunities.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()} data-testid="button-reset-filters">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Filters
          </Button>
          <Link href="/marketflow/submit">
            <Button data-testid="button-submit-deal-empty">
              <Plus className="w-4 h-4 mr-2" />
              Submit a Deal
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
              showJVRequest={showJVRequest}
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
  onAction: (deal: WholesaleDeal, actionType: "jv_request" | "invest") => void;
  onAcceptTerms: (deal: WholesaleDeal) => void;
  onCounterTerms: (deal: WholesaleDeal) => void;
  isItemSaved: (id: string) => boolean;
  showInvest: boolean;
  showJVRequest: boolean;
}

function SwipeView({ deals, onSave, onAction, onAcceptTerms, onCounterTerms, isItemSaved, showInvest, showJVRequest }: SwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIntent, setDragIntent] = useState<"like" | "pass" | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 30 });
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

  const handleSwipe = (direction: "left" | "right") => {
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
    
    setTimeout(() => {
      if (hasMore) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(deals.length);
      }
      setExitDirection(null);
      x.set(0);
    }, 250);
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
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragStart={() => setIsDragging(true)}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, scale, boxShadow: borderGlow }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ 
              scale: exitDirection ? 0.95 : 1, 
              opacity: exitDirection ? 0 : 1,
              y: 0,
              x: exitDirection === "left" ? -400 : exitDirection === "right" ? 400 : 0
            }}
            exit={{ 
              x: exitDirection === "left" ? -400 : 400,
              opacity: 0,
              scale: 0.9,
              transition: { duration: 0.25, ease: "easeOut" }
            }}
            transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing rounded-xl"
          >
            <SwipeCard 
              deal={currentDeal}
              likeOpacity={likeOpacity}
              passOpacity={passOpacity}
              onView={() => setLocation(`/marketflow/deals/${currentDeal.id}`)}
              onAcceptTerms={() => onAcceptTerms(currentDeal)}
              onCounterTerms={() => onCounterTerms(currentDeal)}
              isDragging={isDragging}
              dragIntent={dragIntent}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        <Button 
          size="lg" 
          variant="outline" 
          className="rounded-full h-12 w-12"
          onClick={handleUndo}
          disabled={currentIndex === 0}
          data-testid="button-undo"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="rounded-full h-14 w-14 border-red-300 hover:bg-red-50 hover:border-red-400"
          onClick={() => handleSwipe("left")}
          data-testid="button-pass"
        >
          <X className="w-5 h-5 text-red-500" />
        </Button>
        <Button 
          size="lg" 
          className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600"
          onClick={() => handleSwipe("right")}
          data-testid="button-save-swipe"
        >
          <Heart className="w-5 h-5" />
        </Button>
        <Button 
          size="lg" 
          className="rounded-full h-12 w-12"
          onClick={() => onAcceptTerms(currentDeal)}
          data-testid="button-accept"
        >
          <CheckCircle2 className="w-5 h-5" />
        </Button>
        <Button 
          size="lg" 
          variant="secondary"
          className="rounded-full h-12 w-12"
          onClick={() => onCounterTerms(currentDeal)}
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
  isDragging?: boolean;
  dragIntent?: "like" | "pass" | null;
}

function SwipeCard({ deal, likeOpacity, passOpacity, onView, onAcceptTerms, onCounterTerms, isDragging, dragIntent }: SwipeCardProps) {
  const address = deal.propertyAddress || deal.address || 'Property Address';
  const cityState = [deal.city, deal.state].filter(Boolean).join(', ');
  const askPrice = deal.askingPrice || deal.contractPrice || 0;
  const arv = deal.arv || 0;
  const repairs = deal.repairEstimate || deal.estimatedRepairs || 0;
  const profit = arv - askPrice - repairs;
  const roi = askPrice > 0 ? ((profit / askPrice) * 100).toFixed(1) : '0';
  const matchScore = deal.matchScore || Math.floor(Math.random() * 40) + 60;

  const cardBorderClass = dragIntent === "like" 
    ? "ring-4 ring-green-500/50" 
    : dragIntent === "pass" 
      ? "ring-4 ring-red-500/50" 
      : "";

  return (
    <Card className={`h-full overflow-hidden shadow-xl transition-all duration-150 ${cardBorderClass}`}>
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
          <Button variant="outline" className="flex-1" onClick={onView} data-testid="button-view-deal">
            <Eye className="w-4 h-4 mr-2" />
            View Deal
          </Button>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onAcceptTerms} data-testid="button-accept-deal-swipe">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Accept Terms
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onCounterTerms} data-testid="button-counter-deal-swipe">
            <MessageSquare className="w-4 h-4 mr-2" />
            Counter Offer
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
  onAcceptTerms: () => void;
  onCounterTerms: () => void;
  isSaved: boolean;
  isSaving: boolean;
  showInvest: boolean;
  showJVRequest: boolean;
  isCompareSelected?: boolean;
  onToggleCompare?: () => void;
  canAddMoreCompare?: boolean;
}

function DealCard({ deal, onSave, onAction, onView, onAcceptTerms, onCounterTerms, isSaved, isSaving, showInvest, showJVRequest, isCompareSelected, onToggleCompare, canAddMoreCompare }: DealCardProps) {
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
  const matchScore = deal.matchScore || Math.floor(Math.random() * 40) + 60;
  const roi = askPrice > 0 ? ((profit / askPrice) * 100).toFixed(1) : "0";

  // Calculator values
  const calcOffer = customOffer ? parseFloat(customOffer) : askPrice;
  const calcRepairs = customRepairs ? parseFloat(customRepairs) : repairs;
  const calcProfit = arv - calcOffer - calcRepairs;
  const calcROI = calcOffer > 0 ? ((calcProfit / calcOffer) * 100).toFixed(1) : "0";
  const cashOnCash = calcOffer > 0 ? ((calcProfit / (calcOffer * 0.25)) * 100).toFixed(1) : "0"; // 25% down

  // Match score breakdown
  const getMatchBreakdown = (score: number) => {
    const propertyMatch = Math.min(100, Math.floor(score * 0.3 + Math.random() * 20));
    const locationMatch = Math.min(100, Math.floor(score * 0.25 + Math.random() * 15));
    const priceMatch = Math.min(100, Math.floor(score * 0.25 + Math.random() * 20));
    const strategyMatch = Math.min(100, Math.floor(score * 0.2 + Math.random() * 15));
    return { propertyMatch, locationMatch, priceMatch, strategyMatch };
  };
  const matchBreakdown = getMatchBreakdown(matchScore);

  const handleShare = async (type: "copy" | "email") => {
    const dealUrl = `${window.location.origin}/marketflow/deals/${deal.id}`;
    if (type === "copy") {
      await navigator.clipboard.writeText(dealUrl);
      toast({ title: "Link copied!", description: "Deal link copied to clipboard" });
    } else {
      const subject = encodeURIComponent(`Check out this deal: ${address}`);
      const body = encodeURIComponent(`I found this investment opportunity:\n\n${address}\n${cityState}\nAsking: $${askPrice.toLocaleString()}\nARV: $${arv.toLocaleString()}\nProfit: $${profit.toLocaleString()}\n\nView details: ${dealUrl}`);
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
          
          {showJVRequest && deal.jvAllowed && (
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
          {deal.jvAllowed && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Handshake className="w-2.5 h-2.5" />
              JV Open
            </Badge>
          )}
        </div>

        {/* Match Score with Explanation Tooltip */}
        <div className="absolute top-2 right-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <MatchScoreBadge score={matchScore} size="sm" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="w-48 p-3" side="left">
              <div className="space-y-2">
                <p className="font-semibold text-xs flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Match Breakdown
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Property Type</span>
                    <div className="flex items-center gap-1">
                      <Progress value={matchBreakdown.propertyMatch} className="w-12 h-1.5" />
                      <span className="w-8 text-right">{matchBreakdown.propertyMatch}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Location</span>
                    <div className="flex items-center gap-1">
                      <Progress value={matchBreakdown.locationMatch} className="w-12 h-1.5" />
                      <span className="w-8 text-right">{matchBreakdown.locationMatch}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Price Range</span>
                    <div className="flex items-center gap-1">
                      <Progress value={matchBreakdown.priceMatch} className="w-12 h-1.5" />
                      <span className="w-8 text-right">{matchBreakdown.priceMatch}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Strategy Fit</span>
                    <div className="flex items-center gap-1">
                      <Progress value={matchBreakdown.strategyMatch} className="w-12 h-1.5" />
                      <span className="w-8 text-right">{matchBreakdown.strategyMatch}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
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
            {project.location || 'Location pending'}
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
                  <span className="font-medium">{project.askingInterestRate || "Negotiable"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration: </span>
                  <span className="font-medium">{project.askingLoanDuration || "Negotiable"}</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-muted-foreground">Return: </span>
                  <span className="font-medium">{project.projectedReturn || "Negotiable"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Split: </span>
                  <span className="font-medium">{project.askingProfitSplit || "Negotiable"}</span>
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
          <Button variant="outline" className="flex-1" onClick={onView} data-testid={`button-view-project-${project.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
        {!isFunded && (
          <div className="flex gap-2 mt-2">
            <Button className="flex-1" onClick={onAcceptTerms} data-testid={`button-accept-terms-${project.id}`}>
              <DollarSign className="w-4 h-4 mr-2" />
              Commit Capital
            </Button>
            <Button variant="secondary" className="flex-1" onClick={onCounterTerms} data-testid={`button-counter-terms-${project.id}`}>
              <Handshake className="w-4 h-4 mr-2" />
              Negotiate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CapitalRaiseSwipeViewProps {
  projects: CapitalProject[];
  onSave: (id: number) => void;
  onAcceptTerms: (project: CapitalProject) => void;
  onCounterTerms: (project: CapitalProject) => void;
  isItemSaved: (id: number) => boolean;
}

function CapitalRaiseSwipeView({ projects, onSave, onAcceptTerms, onCounterTerms, isItemSaved }: CapitalRaiseSwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);
  
  const currentProject = projects[currentIndex];
  const hasMore = currentIndex < projects.length - 1;

  const handleSwipe = (direction: "left" | "right") => {
    setExitDirection(direction);
    
    if (direction === "right" && currentProject) {
      onSave(currentProject.id);
      toast({
        title: "Project Saved!",
        description: "Added to your saved projects.",
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

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center max-w-lg mx-auto">
        <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Capital Raises to Swipe</h3>
        <p className="text-muted-foreground">
          Check back later for new investment opportunities.
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
          You've reviewed all available capital raises. Check your saved projects or come back later.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => setCurrentIndex(0)} data-testid="button-capital-start-over">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
          <Link href="/marketflow/investor/saved">
            <Button data-testid="button-capital-view-saved">
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
          {currentIndex + 1} / {projects.length}
        </Badge>
        <p className="text-sm text-muted-foreground mt-2">
          Swipe right to save, left to pass
        </p>
      </div>

      <div className="relative h-[560px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProject.id}
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
            <CapitalSwipeCard 
              project={currentProject}
              likeOpacity={likeOpacity}
              passOpacity={passOpacity}
              onView={() => setLocation(`/marketflow/capital/${currentProject.id}`)}
              onAcceptTerms={() => onAcceptTerms(currentProject)}
              onCounterTerms={() => onCounterTerms(currentProject)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        <Button 
          size="lg" 
          variant="outline" 
          className="rounded-full h-12 w-12"
          onClick={handleUndo}
          disabled={currentIndex === 0}
          data-testid="button-capital-undo"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="rounded-full h-14 w-14 border-red-300 hover:bg-red-50 hover:border-red-400"
          onClick={() => handleSwipe("left")}
          data-testid="button-capital-pass"
        >
          <X className="w-5 h-5 text-red-500" />
        </Button>
        <Button 
          size="lg" 
          className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600"
          onClick={() => handleSwipe("right")}
          data-testid="button-capital-save-swipe"
        >
          <Heart className="w-5 h-5" />
        </Button>
        <Button 
          size="lg" 
          className="rounded-full h-12 w-12"
          onClick={() => onAcceptTerms(currentProject)}
          data-testid="button-capital-accept"
        >
          <DollarSign className="w-5 h-5" />
        </Button>
        <Button 
          size="lg" 
          variant="secondary"
          className="rounded-full h-12 w-12"
          onClick={() => onCounterTerms(currentProject)}
          data-testid="button-capital-counter"
        >
          <Handshake className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Undo • Pass • Save • Invest • Negotiate
      </p>
    </div>
  );
}

interface CapitalSwipeCardProps {
  project: CapitalProject;
  likeOpacity: any;
  passOpacity: any;
  onView: () => void;
  onAcceptTerms: () => void;
  onCounterTerms: () => void;
}

function CapitalSwipeCard({ project, likeOpacity, passOpacity, onView, onAcceptTerms, onCounterTerms }: CapitalSwipeCardProps) {
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
    <Card className="h-full overflow-hidden shadow-xl">
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
          <Badge className={isFunded ? "bg-green-600 text-white" : "bg-amber-500 text-white"}>
            {isFunded ? "Funded" : project.status?.replace(/_/g, ' ') || "Open"}
          </Badge>
          <Badge variant="outline" className="bg-background/80">
            {getStructureLabel(project.structure)}
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

        <div>
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

        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-[10px] text-muted-foreground mb-1 font-medium">Operator Terms</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {project.structure === "DEBT" ? (
              <>
                <div>
                  <span className="text-muted-foreground">Interest: </span>
                  <span className="font-medium">{project.askingInterestRate || "Negotiable"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration: </span>
                  <span className="font-medium">{project.askingLoanDuration || "Negotiable"}</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-muted-foreground">Return: </span>
                  <span className="font-medium">{project.projectedReturn || "Negotiable"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Split: </span>
                  <span className="font-medium">{project.askingProfitSplit || "Negotiable"}</span>
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
          <Button variant="outline" className="flex-1" onClick={onView} data-testid="button-view-capital-swipe">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
        {!isFunded && (
          <div className="flex gap-2 mt-2">
            <Button className="flex-1" onClick={onAcceptTerms} data-testid="button-accept-capital-swipe">
              <DollarSign className="w-4 h-4 mr-2" />
              Commit Capital
            </Button>
            <Button variant="secondary" className="flex-1" onClick={onCounterTerms} data-testid="button-counter-capital-swipe">
              <Handshake className="w-4 h-4 mr-2" />
              Negotiate
            </Button>
          </div>
        )}
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
    return <Badge variant="secondary" className="text-[10px]">Off Market</Badge>;
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
      </CardContent>
    </Card>
  );
}
