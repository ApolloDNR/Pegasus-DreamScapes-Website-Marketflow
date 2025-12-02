import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { DealflowLayout } from "@/components/dealflow-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  DollarSign, 
  MapPin,
  Calendar,
  Search,
  Filter,
  Loader2,
  Home,
  TrendingUp,
  Users,
  ArrowRight,
  Bed,
  Bath,
  Square
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
  createdBy: string;
}

interface WholesaleDeal {
  id: number;
  address: string;
  city: string;
  state: string;
  askingPrice: number;
  arv: number;
  estimatedRepairs: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  status: string;
  postedBy: string;
  description: string;
}

export default function DealflowDeals() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [dealTypeFilter, setDealTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");

  const { data: capitalProjects = [], isLoading: loadingProjects } = useQuery<CapitalProject[]>({
    queryKey: ["/api/capital-projects"],
  });

  const { data: wholesaleDeals = [], isLoading: loadingDeals } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/wholesale-deals-active"],
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
    p.status === "OPEN_FOR_INVESTMENT" && 
    (searchQuery === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeDeals = wholesaleDeals.filter(d => 
    d.status === "ACTIVE" &&
    (searchQuery === "" || d.address?.toLowerCase().includes(searchQuery.toLowerCase()) || d.city?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isLoading = loadingProjects || loadingDeals;

  const getMatchSection = () => {
    if (user?.isInvestor) return "Dreamscaper Projects";
    if (user?.isStaff) return "Matching Investors";
    if (user?.isWholesaler) return "Buyers & Investors";
    if (user?.isBuyer) return "Properties For You";
    return "Opportunities";
  };

  return (
    <DealflowLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover projects, wholesale deals, and investment opportunities
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by location, project name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-deals"
            />
          </div>
          <Select value={dealTypeFilter} onValueChange={setDealTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-deal-type">
              <SelectValue placeholder="Deal Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="projects">Capital Projects</SelectItem>
              <SelectItem value="wholesale">Wholesale Deals</SelectItem>
              <SelectItem value="renovated">Renovated Properties</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-4">Loading marketplace...</p>
          </div>
        ) : (
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="projects" data-testid="tab-projects">
                <Building2 className="w-4 h-4 mr-2" />
                Capital Projects ({openProjects.length})
              </TabsTrigger>
              <TabsTrigger value="wholesale" data-testid="tab-wholesale">
                <Home className="w-4 h-4 mr-2" />
                Wholesale Deals ({activeDeals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Matches For You – {getMatchSection()}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Investment opportunities aligned with your preferences
                </p>
              </div>

              {openProjects.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Projects Available</h3>
                    <p className="text-muted-foreground mb-4">
                      There are no capital projects open for investment at this time.
                    </p>
                    <Button variant="outline">Get Notified</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {openProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="wholesale">
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  Wholesale Deals
                </h2>
                <p className="text-sm text-muted-foreground">
                  Off-market properties from our wholesaler network
                </p>
              </div>

              {activeDeals.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Home className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Wholesale Deals</h3>
                    <p className="text-muted-foreground mb-4">
                      Check back soon for new off-market opportunities.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeDeals.map((deal) => (
                    <WholesaleDealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DealflowLayout>
  );
}

function ProjectCard({ project }: { project: CapitalProject }) {
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
    <Card className="overflow-hidden hover-elevate" data-testid={`project-card-${project.id}`}>
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <Building2 className="w-16 h-16 text-primary/40" />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold line-clamp-1">{project.title}</h3>
          <Badge className="bg-green-600 shrink-0">Open</Badge>
        </div>
        
        {project.location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="w-3 h-3" />
            {project.location}
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description || "Investment opportunity in real estate"}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}% funded</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="font-medium text-green-600">{formatCurrency(project.amountRaised)}</span>
            <span className="text-muted-foreground">of {formatCurrency(project.fundingGoal)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="bg-secondary/50 rounded p-2">
            <p className="text-muted-foreground">Structure</p>
            <p className="font-medium">{project.structure || "Equity"}</p>
          </div>
          <div className="bg-secondary/50 rounded p-2">
            <p className="text-muted-foreground">Min Investment</p>
            <p className="font-medium">{formatCurrency(project.minInvestment)}</p>
          </div>
          {project.projectedReturn && (
            <div className="bg-secondary/50 rounded p-2">
              <p className="text-muted-foreground">Target Return</p>
              <p className="font-medium">{project.projectedReturn}</p>
            </div>
          )}
          {project.holdPeriod && (
            <div className="bg-secondary/50 rounded p-2">
              <p className="text-muted-foreground">Hold Period</p>
              <p className="font-medium">{project.holdPeriod}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/dealflow/project/${project.id}`} className="flex-1">
            <Button variant="outline" className="w-full" data-testid={`button-view-project-${project.id}`}>
              View Project
            </Button>
          </Link>
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

function WholesaleDealCard({ deal }: { deal: WholesaleDeal }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const spread = deal.arv - deal.askingPrice - deal.estimatedRepairs;

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`deal-card-${deal.id}`}>
      <div className="aspect-video bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
        <Home className="w-16 h-16 text-amber-500/40" />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold line-clamp-1">{deal.address}</h3>
          <Badge className="bg-amber-600 shrink-0">Wholesale</Badge>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          {deal.city}, {deal.state}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Bed className="w-3 h-3" />
            {deal.bedrooms} bd
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-3 h-3" />
            {deal.bathrooms} ba
          </span>
          <span className="flex items-center gap-1">
            <Square className="w-3 h-3" />
            {deal.squareFeet?.toLocaleString()} sqft
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="bg-secondary/50 rounded p-2">
            <p className="text-muted-foreground">Asking Price</p>
            <p className="font-bold text-lg">{formatCurrency(deal.askingPrice)}</p>
          </div>
          <div className="bg-secondary/50 rounded p-2">
            <p className="text-muted-foreground">ARV</p>
            <p className="font-medium">{formatCurrency(deal.arv)}</p>
          </div>
          <div className="bg-secondary/50 rounded p-2">
            <p className="text-muted-foreground">Est. Repairs</p>
            <p className="font-medium">{formatCurrency(deal.estimatedRepairs)}</p>
          </div>
          <div className="bg-secondary/50 rounded p-2">
            <p className="text-muted-foreground">Spread</p>
            <p className={`font-medium ${spread > 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(spread)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/dealflow/deal/${deal.id}`} className="flex-1">
            <Button variant="outline" className="w-full" data-testid={`button-view-deal-${deal.id}`}>
              View Details
            </Button>
          </Link>
          <Button data-testid={`button-interested-${deal.id}`}>
            I'm Interested
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
