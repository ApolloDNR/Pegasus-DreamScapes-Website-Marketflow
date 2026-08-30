import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/animations";
import { PropertyMap } from "@/components/property-map";
import { ShareButtons } from "@/components/share-buttons";
import { AskPeggyButton } from "@/components/ask-peggy-button";
import { useAnalytics } from "@/hooks/use-analytics";
import type { CapitalProject } from "@shared/schema";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  Hammer,
  Info,
  MapPin,
  Printer,
  Shield,
} from "lucide-react";

const RELATIONSHIP_PATH = "/capital#capital-introduction";

export default function MarketplaceCapitalDetail() {
  return (
    <AuthGuard requiredRoles={["investor", "admin", "dreamscaper", "pegasus_dreamscaper"]}>
      <MarketplaceLayout>
        <CapitalDetailPage />
      </MarketplaceLayout>
    </AuthGuard>
  );
}

function CapitalDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { trackProjectView } = useAnalytics();

  const { data: project, isLoading, error } = useQuery<CapitalProject>({
    queryKey: ["/api/supabase/capital-projects", projectId],
    enabled: Boolean(projectId),
  });

  useEffect(() => {
    if (project?.id) {
      trackProjectView(typeof project.id === "string" ? Number.parseInt(project.id, 10) : project.id);
    }
  }, [project?.id, trackProjectView]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    const isNetworkError =
      error instanceof Error &&
      (error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("500"));

    return (
      <div className="p-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
            <h1 className="mb-2 text-lg font-semibold">
              {isNetworkError ? "Unable to load project" : "Project not found"}
            </h1>
            <p className="mb-4 text-center text-muted-foreground">
              {isNetworkError
                ? "We could not load this private project record. Check your connection and try again."
                : "This private project record is unavailable or has been removed."}
            </p>
            <div className="flex justify-center gap-3">
              {isNetworkError ? (
                <Button onClick={() => window.location.reload()} data-testid="button-retry">
                  Try again
                </Button>
              ) : null}
              <Link href="/marketflow/capital">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to projects
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
            <h1 className="mb-2 text-lg font-semibold">Project not found</h1>
            <p className="mb-4 text-center text-muted-foreground">
              This private project record is unavailable or has been removed.
            </p>
            <Link href="/marketflow/capital">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasProjectFigures = Boolean(
    project.purchasePrice || project.rehabBudget || project.softCosts || project.projectedARV,
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/marketflow/capital">
          <Button variant="ghost" size="sm" data-testid="button-back-to-capital">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ScrollReveal>
            <Card data-testid="card-project-header">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        <Shield className="mr-1 h-3 w-3" />
                        Private project record
                      </Badge>
                      {project.propertyType ? (
                        <Badge variant="outline">
                          <Building2 className="mr-1 h-3 w-3" />
                          {project.propertyType.replace("-", " ")}
                        </Badge>
                      ) : null}
                    </div>
                    <CardTitle className="text-2xl" data-testid="text-project-title">
                      {project.title}
                    </CardTitle>
                    {project.location ? (
                      <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{project.location}</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 print:hidden">
                    <AskPeggyButton dealType="capital" dealId={projectId} dealLabel={project.title} />
                    <ShareButtons
                      title={`Private project record: ${project.title}`}
                      description={`Source-supplied project context for ${project.title}.`}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.print()}
                      data-testid="button-print-project"
                      aria-label="Print project record"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed text-muted-foreground" data-testid="text-project-description">
                  {project.description}
                </p>
                <div className="flex gap-2 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>
                    This page preserves source-supplied project context. It is not an offering,
                    allocation, recommendation, or set of verified investment terms.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {project.location ? (
            <PropertyMap
              address={project.location}
              showCard
              title="Project location"
              height="300px"
              data-testid="project-map"
            />
          ) : null}

          {project.scopeOfWork ? (
            <ScrollReveal delay={0.1}>
              <Card data-testid="card-scope-of-work">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hammer className="h-5 w-5 text-primary" />
                    Source-supplied scope
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">{project.scopeOfWork}</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ) : null}

          {hasProjectFigures ? (
            <ScrollReveal delay={0.15}>
              <Card data-testid="card-project-figures">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Source-supplied project figures
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {project.purchasePrice ? (
                      <ProjectFigure label="Purchase price" value={project.purchasePrice} />
                    ) : null}
                    {project.rehabBudget ? (
                      <ProjectFigure label="Rehab budget" value={project.rehabBudget} />
                    ) : null}
                    {project.softCosts ? (
                      <ProjectFigure label="Soft costs" value={project.softCosts} />
                    ) : null}
                    {project.projectedARV ? (
                      <ProjectFigure label="Projected ARV" value={project.projectedARV} />
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Figures are displayed as submitted and have not been independently verified on this page.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ) : null}
        </div>

        <aside className="space-y-6" aria-label="Project relationship information">
          <ScrollReveal delay={0.1}>
            <Card
              className="sticky top-6 border-2 border-primary/20"
              data-testid="card-capital-relationship-only"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Relationship information only
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  MarketFlow does not accept funds, offers, allocations, or commitments from this
                  project record. No participation or review outcome is promised.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  If you want to introduce yourself for a possible future relationship, use the
                  separate introduction form. Any follow-up is discretionary.
                </p>
                <Link href={RELATIONSHIP_PATH}>
                  <Button className="w-full" data-testid="button-capital-relationship-info">
                    Continue to relationship introduction
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <Card data-testid="card-operator-info">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Project source
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Marketplace submission</p>
                    <p className="text-sm text-muted-foreground">
                      Source identity remains private on this record.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  Identity and contact details are not published here. Access to this page does not
                  authorize direct contact or use of private source information.
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </aside>
      </div>
    </div>
  );
}

function ProjectFigure({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-center">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">${value.toLocaleString()}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6">
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="mb-2 h-6 w-24" />
              <Skeleton className="mb-2 h-8 w-3/4" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
