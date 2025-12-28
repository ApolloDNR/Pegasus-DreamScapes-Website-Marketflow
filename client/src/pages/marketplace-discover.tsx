import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerChildren, StaggerItem, HoverLift } from "@/components/animations";
import { InvestmentOfferDialog } from "@/components/investment-offer-dialog";
import { WholesaleDealActionDialog } from "@/components/wholesale-deal-action-dialog";
import { type UserRole } from "@/lib/supabase";
import { sampleWholesaleDeals, sampleCapitalProjects } from "@/lib/sample-data";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Home,
  TrendingUp,
  Calendar,
  Award,
  Building2,
  Bookmark,
  BookmarkCheck,
  Target,
  Sparkles,
  ArrowRight,
  Percent,
  Clock,
  Zap,
  Users,
  Eye,
  LogIn
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
}

interface CapitalProject {
  id: string;
  title: string;
  description?: string;
  location?: string;
  propertyType?: string;
  structure?: string;
  fundingGoal?: number;
  amountRaised?: number;
  minInvestment?: number;
  projectedReturn?: string;
  holdPeriod?: string;
  photos?: string[];
  status?: string;
}

export default function MarketplaceDiscover() {
  return (
    <MarketplaceLayout>
      <DiscoverPage />
    </MarketplaceLayout>
  );
}

function DiscoverPage() {
  const [activeTab, setActiveTab] = useState("deals");
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<CapitalProject | null>(null);
  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<WholesaleDeal | null>(null);
  const [dealActionType, setDealActionType] = useState<"jv_request" | "invest">("invest");
  const [dealActionDialogOpen, setDealActionDialogOpen] = useState(false);
  const { isAuthenticated, isWholesaler, isDreamscaper, isInvestor, isAdmin, isGuestMode, guestRole, enterGuestMode, exitGuestMode } = useSupabaseAuth();
  const { toast } = useToast();
  const { isItemSaved, toggleSaveItem, isSaving } = useSupabaseMarketplace();
  const [, setLocation] = useLocation();

  const handleGuestPreview = (role: UserRole) => {
    enterGuestMode(role);
    toast({
      title: "Guest Preview Mode",
      description: `Previewing as ${role.replace(/_/g, ' ')}. Sign in to take actions.`,
    });
    const dashboardPath = {
      wholesaler: '/marketplace/wholesaler',
      investor: '/marketplace/investor',
      dreamscaper: '/marketplace/dreamscaper',
      buyer_investment: '/marketplace/buyer',
      buyer_retail: '/marketplace/buyer',
    }[role] || '/marketplace';
    setTimeout(() => setLocation(dashboardPath), 50);
  };

  const { data: deals, isLoading: dealsLoading } = useQuery<WholesaleDeal[]>({
    queryKey: ['/api/supabase/wholesale-deals'],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<CapitalProject[]>({
    queryKey: ['/api/supabase/capital-projects'],
  });

  const handleInvest = (project: CapitalProject) => {
    setSelectedProject(project);
    setInvestDialogOpen(true);
  };

  const handleDealAction = (deal: WholesaleDeal, actionType: "jv_request" | "invest") => {
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

  const handleSaveProject = async (projectId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save projects.",
        variant: "default",
      });
      return;
    }
    await toggleSaveItem('capital_project', projectId);
  };

  const useSampleData = isGuestMode || (!deals?.length && !dealsLoading) || (!projects?.length && !projectsLoading);
  const displayDeals = (deals?.length ? deals : sampleWholesaleDeals) as WholesaleDeal[];
  const displayProjects = (projects?.length ? projects : sampleCapitalProjects) as CapitalProject[];
  
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

  const filteredProjects = displayProjects?.filter(project => {
    let matches = true;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matches = matches && (
        project.title?.toLowerCase().includes(query) ||
        project.location?.toLowerCase().includes(query) ||
        false
      );
    }
    
    if (propertyType !== "all") {
      matches = matches && project.propertyType === propertyType;
    }
    
    return matches;
  }) || [];

  return (
    <div className="p-6 space-y-6">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2" data-testid="text-discover-title">
            <Sparkles className="w-8 h-8 text-primary" />
            Discover Opportunities
          </h1>
          <p className="text-muted-foreground">
            Browse wholesale deals and capital projects. Save what interests you and take action when ready.
          </p>
        </div>
      </ScrollReveal>

      {!isAuthenticated && !isGuestMode && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium">Preview Portal Dashboards</h3>
                  <p className="text-sm text-muted-foreground">Explore what each role sees without signing up</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleGuestPreview('investor')}
                  data-testid="button-preview-investor"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Investor
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleGuestPreview('wholesaler')}
                  data-testid="button-preview-wholesaler"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Wholesaler
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleGuestPreview('dreamscaper')}
                  data-testid="button-preview-dreamscaper"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Dreamscaper
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleGuestPreview('buyer_investment')}
                  data-testid="button-preview-buyer"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Buyer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isGuestMode && (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-medium">Guest Preview Mode: {guestRole?.replace(/_/g, ' ')}</h3>
                  <p className="text-sm text-muted-foreground">You're viewing as a guest. Sign in to take actions.</p>
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

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by address, city, or project name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-discover"
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="deals" data-testid="tab-deals">
            <Home className="w-4 h-4 mr-2" />
            Wholesale Deals ({filteredDeals.length})
          </TabsTrigger>
          <TabsTrigger value="projects" data-testid="tab-projects">
            <TrendingUp className="w-4 h-4 mr-2" />
            Capital Projects ({filteredProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="mt-6">
          {dealsLoading && !isGuestMode ? (
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
          ) : filteredDeals.length === 0 ? (
            <Card className="p-12 text-center">
              <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Deals Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search criteria." : "Check back soon for new opportunities."}
              </p>
            </Card>
          ) : (
            <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDeals.map((deal) => (
                <StaggerItem key={deal.id}>
                  <HoverLift>
                    <DealCard 
                      deal={deal} 
                      onSave={() => handleSaveDeal(deal.id)}
                      onInvest={() => handleDealAction(deal, "invest")}
                      onRequestJV={() => handleDealAction(deal, "jv_request")}
                      isSaved={isItemSaved('wholesale_deal', deal.id)}
                      isSaving={isSaving}
                      showInvest={isDreamscaper || isInvestor || isAdmin}
                      showJVRequest={isWholesaler || isAdmin}
                    />
                  </HoverLift>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          {projectsLoading && !isGuestMode ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
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
          ) : filteredProjects.length === 0 ? (
            <Card className="p-12 text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search criteria." : "Check back soon for new investment opportunities."}
              </p>
            </Card>
          ) : (
            <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <StaggerItem key={project.id}>
                  <HoverLift>
                    <ProjectCard 
                      project={project} 
                      onSave={() => handleSaveProject(project.id)}
                      onInvest={() => handleInvest(project)}
                      isSaved={isItemSaved('capital_project', project.id)}
                      isSaving={isSaving}
                    />
                  </HoverLift>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}
        </TabsContent>
      </Tabs>

      {/* Capital Project Investment Dialog */}
      {selectedProject && (
        <InvestmentOfferDialog
          open={investDialogOpen}
          onOpenChange={setInvestDialogOpen}
          project={{
            id: selectedProject.id as any,
            title: selectedProject.title,
            description: selectedProject.description,
            location: selectedProject.location,
            fundingGoal: selectedProject.fundingGoal || 0,
            amountRaised: selectedProject.amountRaised || 0,
            minInvestment: selectedProject.minInvestment || 0,
            projectedReturn: selectedProject.projectedReturn,
            holdPeriod: selectedProject.holdPeriod,
            structure: selectedProject.structure,
            status: selectedProject.status || "ACTIVE",
          }}
          onSuccess={() => {
            toast({
              title: "Investment submitted",
              description: "Your investment offer has been sent to the operator.",
            });
          }}
        />
      )}

      {/* Wholesale Deal Action Dialog */}
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
    </div>
  );
}

function DealCard({ 
  deal, 
  onSave, 
  onInvest,
  onRequestJV,
  isSaved, 
  isSaving,
  showInvest,
  showJVRequest
}: { 
  deal: WholesaleDeal; 
  onSave: () => void;
  onInvest?: () => void;
  onRequestJV?: () => void;
  isSaved: boolean;
  isSaving: boolean;
  showInvest?: boolean;
  showJVRequest?: boolean;
}) {
  const address = deal.propertyAddress || deal.address || 'Unknown Address';
  const price = deal.askingPrice || deal.contractPrice || 0;
  const repairs = deal.repairEstimate || deal.estimatedRepairs || 0;
  const photos = deal.photos || deal.images || [];
  const imageUrl = photos[0] || '/placeholder-property.jpg';

  return (
    <Card className="overflow-hidden h-full flex flex-col" data-testid={`card-deal-${deal.id}`}>
      <div className="relative h-48 bg-muted">
        {photos.length > 0 ? (
          <img
            src={imageUrl}
            alt={address}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Home className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          {deal.isPegasusDeal && (
            <Badge className="bg-amber-500/90 text-white">
              <Award className="w-3 h-3 mr-1" />
              Pegasus Deal
            </Badge>
          )}
          <Badge variant="secondary">{deal.propertyType || 'Residential'}</Badge>
        </div>
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2"
          onClick={(e) => {
            e.preventDefault();
            onSave();
          }}
          disabled={isSaving}
          data-testid={`button-save-deal-${deal.id}`}
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4 text-primary" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </Button>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{address}</h3>
        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {deal.city}, {deal.state} {deal.zipCode}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div>
            <p className="text-muted-foreground">Price</p>
            <p className="font-semibold text-lg">${price.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">ARV</p>
            <p className="font-semibold text-lg">${(deal.arv || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Repairs</p>
            <p className="font-medium">${repairs.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Assignment</p>
            <p className="font-medium">${(deal.assignmentFee || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-auto space-y-2">
          <Link href={`/marketplace/deals/${deal.id}`}>
            <Button className="w-full" variant="outline" data-testid={`button-view-deal-${deal.id}`}>
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <div className="flex gap-2">
            {showInvest && onInvest && (
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700" 
                onClick={(e) => {
                  e.preventDefault();
                  onInvest();
                }}
                data-testid={`button-invest-deal-${deal.id}`}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Invest
              </Button>
            )}
            {showJVRequest && onRequestJV && (
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  onRequestJV();
                }}
                data-testid={`button-jv-deal-${deal.id}`}
              >
                <Users className="w-4 h-4 mr-1" />
                Request JV
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ 
  project, 
  onSave, 
  onInvest,
  isSaved, 
  isSaving 
}: { 
  project: CapitalProject; 
  onSave: () => void;
  onInvest: () => void;
  isSaved: boolean;
  isSaving: boolean;
}) {
  const photos = project.photos || [];
  const imageUrl = photos[0] || '/placeholder-property.jpg';
  const fundingProgress = project.fundingGoal 
    ? Math.round(((project.amountRaised || 0) / project.fundingGoal) * 100)
    : 0;

  return (
    <Card className="overflow-hidden h-full flex flex-col" data-testid={`card-project-${project.id}`}>
      <div className="relative h-48 bg-muted">
        {photos.length > 0 ? (
          <img
            src={imageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Building2 className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className="bg-emerald-500/90 text-white">
            {project.structure || 'EQUITY'}
          </Badge>
          {project.status === 'ACTIVE' && (
            <Badge variant="secondary">Active</Badge>
          )}
        </div>
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2"
          onClick={(e) => {
            e.preventDefault();
            onSave();
          }}
          disabled={isSaving}
          data-testid={`button-save-project-${project.id}`}
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4 text-primary" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </Button>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{project.title}</h3>
        {project.location && (
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {project.location}
          </p>
        )}
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Funding Progress</span>
            <span className="font-medium">{fundingProgress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(fundingProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="font-medium">${(project.amountRaised || 0).toLocaleString()}</span>
            <span className="text-muted-foreground">of ${(project.fundingGoal || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-muted-foreground" />
            <span>Min: ${(project.minInvestment || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Percent className="w-3 h-3 text-muted-foreground" />
            <span>{project.projectedReturn || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span>{project.holdPeriod || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-muted-foreground" />
            <span>{project.propertyType || 'Residential'}</span>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <Link href={`/marketplace/capital/${project.id}`} className="flex-1">
            <Button className="w-full" variant="outline" data-testid={`button-view-project-${project.id}`}>
              View Project
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Button 
            onClick={(e) => {
              e.preventDefault();
              onInvest();
            }}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            data-testid={`button-invest-project-${project.id}`}
          >
            <Zap className="w-4 h-4 mr-1" />
            Invest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
