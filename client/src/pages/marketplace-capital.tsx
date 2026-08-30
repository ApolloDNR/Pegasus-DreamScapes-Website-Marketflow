import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseMarketplace } from "@/hooks/use-supabase-marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HoverLift,
  ScrollReveal,
  StaggerChildren,
  StaggerItem,
} from "@/components/animations";
import type { CapitalProject } from "@shared/schema";
import {
  ArrowRight,
  AlertCircle,
  Bookmark,
  Briefcase,
  Building2,
  MapPin,
  RefreshCw,
  Search,
  Shield,
} from "lucide-react";

export default function MarketplaceCapital() {
  return (
    <MarketplaceLayout>
      <CapitalPage />
    </MarketplaceLayout>
  );
}

function CapitalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const { isAuthenticated } = useSupabaseAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isItemSaved, toggleSaveItem, isSaving } = useSupabaseMarketplace();

  const {
    data: projects,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery<CapitalProject[]>({
    queryKey: ["/api/supabase/capital-projects"],
  });

  const hasVerifiedProjects = Array.isArray(projects);
  const dataUnavailable = isError || (!isLoading && !hasVerifiedProjects);
  const verifiedProjects = hasVerifiedProjects ? projects : [];

  const filteredProjects = verifiedProjects.filter((project) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !normalizedQuery ||
      [project.title, project.location, project.description].some((value) =>
        value?.toLowerCase().includes(normalizedQuery),
      );
    const matchesProperty =
      propertyType === "all" || project.propertyType === propertyType;
    return matchesSearch && matchesProperty;
  });

  const handleSaveProject = async (projectId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description:
          "Sign in to save this record. An account does not create capital access, participation, or an allocation.",
      });
      setLocation("/login");
      return;
    }

    try {
      await toggleSaveItem("capital_project", projectId);
    } catch {
      // The marketplace hook presents the mutation error to the user.
    }
  };

  const hasFilters = Boolean(searchQuery.trim()) || propertyType !== "all";

  return (
    <div className="p-6">
      <ScrollReveal>
        <div className="mb-8 max-w-3xl">
          <h1
            className="mb-2 text-3xl font-bold tracking-tight"
            data-testid="text-capital-title"
          >
            Private project records
          </h1>
          <p className="leading-relaxed text-muted-foreground">
            This controlled workspace may display source-supplied project context. These records
            are not reviewed live inventory, offerings, allocations, recommendations, or verified
            investment terms.
          </p>
        </div>
      </ScrollReveal>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Search by title, location, or description"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
            data-testid="input-search-projects"
          />
        </div>

        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger
            className="w-full lg:w-[180px]"
            data-testid="select-property-type"
            aria-label="Filter by property type"
          >
            <SelectValue placeholder="Property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All property types</SelectItem>
            <SelectItem value="single-family">Single family</SelectItem>
            <SelectItem value="multi-family">Multi-family</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="mixed-use">Mixed use</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <ProjectGridSkeleton />
      ) : dataUnavailable ? (
        <Card className="border-destructive/40" role="alert" data-testid="state-capital-projects-unavailable">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-lg font-semibold">Private project records unavailable</h2>
            <p className="mb-5 max-w-lg leading-relaxed text-muted-foreground">
              The private registry could not be loaded. No empty project list or record count is being inferred from that error.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void refetch()}
              disabled={isFetching}
              data-testid="button-retry-capital-projects"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
              {isFetching ? "Retrying…" : "Try again"}
            </Button>
          </CardContent>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Briefcase className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-lg font-semibold">
              {hasFilters ? "No project records match these filters" : "No private project records available"}
            </h2>
            <p className="mb-4 max-w-lg text-center leading-relaxed text-muted-foreground">
              {hasFilters
                ? "Adjust the search or property-type filter to review the records available to this account."
                : "No reviewed live inventory is currently published. Availability and future publication are not promised."}
            </p>
            {hasFilters ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setPropertyType("all");
                }}
                data-testid="button-clear-filters"
              >
                Clear filters
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <StaggerChildren
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          staggerDelay={0.05}
        >
          {filteredProjects.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard
                project={project}
                onSave={handleSaveProject}
                isSaved={isItemSaved("capital_project", String(project.id))}
                isSaving={isSaving}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      {!isLoading && !dataUnavailable ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Showing {filteredProjects.length} of {verifiedProjects.length} private project records
        </p>
      ) : null}
    </div>
  );
}

interface ProjectCardProps {
  project: CapitalProject;
  onSave: (projectId: string) => void;
  isSaved: boolean;
  isSaving: boolean;
}

function ProjectCard({ project, onSave, isSaved, isSaving }: ProjectCardProps) {
  return (
    <HoverLift>
      <Card
        className="flex h-full flex-col border"
        data-testid={`project-card-${project.id}`}
      >
        <CardHeader className="pb-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              <Shield className="mr-1 h-3 w-3" aria-hidden="true" />
              Private project record
            </Badge>
            {project.propertyType ? (
              <Badge variant="secondary" className="capitalize">
                <Building2 className="mr-1 h-3 w-3" aria-hidden="true" />
                {project.propertyType.replace("-", " ")}
              </Badge>
            ) : null}
          </div>
          <CardTitle
            className="line-clamp-2 text-lg"
            data-testid={`project-title-${project.id}`}
          >
            {project.title}
          </CardTitle>
          {project.location ? (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{project.location}</span>
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {project.description || "No project description was supplied."}
          </p>
          <div className="rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Relationship information only.</span>{" "}
            This record does not accept funds, offers, allocations, or commitments.
          </div>
        </CardContent>

        <CardFooter className="border-t pt-4">
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              type="button"
              variant={isSaved ? "default" : "ghost"}
              size="icon"
              onClick={() => onSave(String(project.id))}
              disabled={isSaving}
              aria-label={isSaved ? "Remove saved project" : "Save project"}
              data-testid={`button-bookmark-${project.id}`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </Button>
            <Link href={`/marketflow/capital/${project.id}`}>
              <Button data-testid={`button-view-project-${project.id}`}>
                View project record
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </HoverLift>
  );
}

function ProjectGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Card key={item}>
          <CardHeader>
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="mb-2 h-6 w-full" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-4 h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
