import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseMarketplace } from "@/hooks/use-supabase-marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import type { CapitalProject } from "@shared/schema";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  TrendingUp,
  Calendar,
  Award,
  Star,
  ArrowRight,
  Building2,
  Bookmark,
  CheckCircle2,
  Clock,
  Target,
  Percent,
  Users,
  Briefcase,
  Sparkles,
  Crown
} from "lucide-react";

interface MarketplaceProject extends CapitalProject {
  isPegasusProject?: boolean;
}

export default function MarketplaceCapital() {
  return (
    <MarketplaceLayout>
      <CapitalPage />
    </MarketplaceLayout>
  );
}

function CapitalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [structureType, setStructureType] = useState<string>("all");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [fundingRange, setFundingRange] = useState<string>("all");
  const { isAuthenticated } = useSupabaseAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isItemSaved, toggleSaveItem, isSaving, createCapitalCommitment, isCreatingCommitment } = useSupabaseMarketplace();

  const handleProtectedAction = (action: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: `Please sign in to ${action}. Create a free account to save projects and commit capital.`,
        variant: "default",
        duration: 3000,
      });
      setTimeout(() => {
        setLocation("/login");
      }, 1500);
      return false;
    }
    return true;
  };

  const handleSaveProject = async (projectId: string) => {
    if (!handleProtectedAction("save this project")) return;
    await toggleSaveItem('capital_project', projectId);
  };

  const { data: projects, isLoading } = useQuery<MarketplaceProject[]>({
    queryKey: ['/api/marketplace/projects'],
  });

  const filteredProjects = projects?.filter(project => {
    let matches = true;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matches = matches && (
        project.title?.toLowerCase().includes(query) ||
        project.location?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        false
      );
    }
    
    if (structureType !== "all") {
      matches = matches && project.structure?.toUpperCase() === structureType.toUpperCase();
    }
    
    if (propertyType !== "all") {
      matches = matches && project.propertyType === propertyType;
    }
    
    if (fundingRange !== "all") {
      const goal = project.fundingGoal || 0;
      switch (fundingRange) {
        case "under250k":
          matches = matches && goal < 250000;
          break;
        case "250k-500k":
          matches = matches && goal >= 250000 && goal < 500000;
          break;
        case "500k-1m":
          matches = matches && goal >= 500000 && goal < 1000000;
          break;
        case "over1m":
          matches = matches && goal >= 1000000;
          break;
      }
    }
    
    return matches;
  }) || [];

  return (
    <div className="p-6">
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2" data-testid="text-capital-title">
            Capital Opportunities
          </h1>
          <p className="text-muted-foreground">
            Browse investment opportunities from verified Dreamscapers. Choose between debt and equity structures that match your investment criteria.
          </p>
        </div>
      </ScrollReveal>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, location, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-projects"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={structureType} onValueChange={setStructureType}>
            <SelectTrigger className="w-[140px]" data-testid="select-structure-type">
              <SelectValue placeholder="Structure" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Structures</SelectItem>
              <SelectItem value="EQUITY">Equity</SelectItem>
              <SelectItem value="DEBT">Debt</SelectItem>
              <SelectItem value="HYBRID">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="w-[150px]" data-testid="select-property-type">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="single-family">Single Family</SelectItem>
              <SelectItem value="multi-family">Multi-Family</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="mixed-use">Mixed Use</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={fundingRange} onValueChange={setFundingRange}>
            <SelectTrigger className="w-[140px]" data-testid="select-funding-range">
              <SelectValue placeholder="Funding Goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Amounts</SelectItem>
              <SelectItem value="under250k">Under $250K</SelectItem>
              <SelectItem value="250k-500k">$250K - $500K</SelectItem>
              <SelectItem value="500k-1m">$500K - $1M</SelectItem>
              <SelectItem value="over1m">Over $1M</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border">
              <CardHeader>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              No capital opportunities match your current filters. Try adjusting your search criteria.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setStructureType("all");
              setPropertyType("all");
              setFundingRange("all");
            }} data-testid="button-clear-filters">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.05}>
          {filteredProjects.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard 
                project={project} 
                onProtectedAction={handleProtectedAction}
                onSave={handleSaveProject}
                isSaved={isItemSaved('capital_project', String(project.id))}
                isSaving={isSaving}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Showing {filteredProjects.length} of {projects?.length || 0} capital opportunities
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: MarketplaceProject;
  onProtectedAction: (action: string) => boolean;
  onSave: (projectId: string) => void;
  isSaved: boolean;
  isSaving: boolean;
}

function ProjectCard({ project, onProtectedAction, onSave, isSaved, isSaving }: ProjectCardProps) {
  const fundingProgress = project.fundingGoal ? 
    Math.min(100, ((project.amountRaised || 0) / project.fundingGoal) * 100) : 0;
  
  const isFunded = project.status === "FUNDED";
  const amountRemaining = (project.fundingGoal || 0) - (project.amountRaised || 0);

  const handleSaveProject = () => {
    onSave(String(project.id));
  };

  const getStructureBadgeColor = (structure: string | null) => {
    switch (structure?.toUpperCase()) {
      case "EQUITY":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "DEBT":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "HYBRID":
        return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = () => {
    if (isFunded) {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Funded
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
        <Target className="w-3 h-3 mr-1" />
        Open
      </Badge>
    );
  };

  return (
    <HoverLift>
      <Card className="h-full flex flex-col border hover-elevate" data-testid={`project-card-${project.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1">
              {project.isPegasusProject && (
                <Badge className="bg-primary text-primary-foreground">
                  <Crown className="w-3 h-3 mr-1" />
                  Pegasus
                </Badge>
              )}
              <Badge variant="outline" className={getStructureBadgeColor(project.structure)}>
                {project.structure || "Equity"}
              </Badge>
            </div>
            {getStatusBadge()}
          </div>
          <CardTitle className="text-lg line-clamp-2" data-testid={`project-title-${project.id}`}>
            {project.title}
          </CardTitle>
          {project.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{project.location}</span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {project.description}
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Funding Progress</span>
                <span className="font-medium">{fundingProgress.toFixed(0)}%</span>
              </div>
              <Progress value={fundingProgress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>${((project.amountRaised || 0) / 1000).toFixed(0)}K raised</span>
                <span>${((project.fundingGoal || 0) / 1000).toFixed(0)}K goal</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Min Investment</p>
                  <p className="text-sm font-medium">
                    ${((project.minInvestment || 0) / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Projected Return</p>
                  <p className="text-sm font-medium">
                    {project.projectedReturn || "15-20%"}
                  </p>
                </div>
              </div>
            </div>

            {project.propertyType && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                <Building2 className="w-4 h-4" />
                <span className="capitalize">{project.propertyType.replace("-", " ")}</span>
                {project.holdPeriod && (
                  <>
                    <span className="mx-2">|</span>
                    <Clock className="w-4 h-4" />
                    <span>{project.holdPeriod}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t">
          <div className="flex items-center justify-between w-full gap-2">
            <Button 
              variant={isSaved ? "default" : "ghost"} 
              size="sm" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSaveProject();
              }}
              disabled={isSaving}
              data-testid={`button-bookmark-${project.id}`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            <Link href={`/marketplace/capital/${project.id}`}>
              <Button 
                disabled={isFunded} 
                data-testid={`button-view-project-${project.id}`}
              >
                {isFunded ? "Fully Funded" : "View Opportunity"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </HoverLift>
  );
}
