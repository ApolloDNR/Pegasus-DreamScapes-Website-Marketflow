import { MarketplaceLayout } from "@/components/marketplace-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { CapitalProject } from "@shared/schema";
import {
  Building2,
  TrendingUp,
  DollarSign,
  Plus,
  CheckCircle2,
  Hammer,
  Target,
  Sparkles,
  Search,
  Handshake,
  MapPin,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { GuestPreviewBanner } from "@/components/guest-preview-banner";
import { QUERY_KEYS } from "@/lib/queryClient";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";

interface ProjectStats {
  activeProjects: number;
  projectsCompleted: number;
}

export default function MarketplaceDreamscaperPage() {
  const { profile } = useSupabaseAuth();
  const isPegasus = profile?.is_pegasus_badged;

  const {
    data: stats,
    isLoading,
    isError: statsError,
  } = useAuthenticatedQuery<ProjectStats>(QUERY_KEYS.userStats("dreamscaper"));

  const {
    data: myProjects,
    isLoading: isProjectsLoading,
    isError: projectsError,
  } = useAuthenticatedQuery<CapitalProject[]>([
    "/api/supabase/capital-projects/my",
  ]);

  const recentProjects = myProjects?.slice(0, 3) ?? [];

  return (
    <AuthGuard requiredRoles={["admin", "pegasus_dreamscaper", "dreamscaper"]}>
      <MarketplaceLayout>
        <div className="space-y-6">
          <GuestPreviewBanner roleLabel="DreamScaper" />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold" data-testid="text-page-title">
                DreamScaper Dashboard
              </h1>
              <p className="text-muted-foreground">
                Review private project submissions and controlled-pilot relationship context.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isPegasus && (
                <Badge variant="default" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Pilot participant
                </Badge>
              )}
              <Link href="/marketflow/submit">
                <Button data-testid="button-new-project">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit project record
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Hammer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : statsError || !stats ? (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-active-projects">
                    {stats.activeProjects}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Statuses recorded in this workspace</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : statsError || !stats ? (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-completed-projects">
                    {stats.projectsCompleted}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Source-supplied completion statuses</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-dashed" data-testid="notice-capital-coordination-boundary">
            <CardContent className="py-4 text-sm leading-relaxed text-muted-foreground">
              Capital relationships are coordinated separately under written terms. This website
              does not verify funds raised, commitments, or completed financing.
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project records</CardTitle>
                <CardDescription>Your latest private project submissions and source-supplied statuses</CardDescription>
              </CardHeader>
              <CardContent>
                {isProjectsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : projectsError || !myProjects ? (
                  <AccountDataUnavailable
                    testId="state-dreamscaper-projects-unavailable"
                    title="Project records unavailable"
                    detail="No empty project history is being inferred. Try again after the account connection is restored."
                  />
                ) : recentProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <Hammer className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No recorded project submissions</p>
                    <Link href="/marketflow/submit">
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Submit a project record
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentProjects.map((project) => {
                      return (
                        <div key={project.id} className="space-y-2 p-3 rounded-lg border hover-elevate" data-testid={`project-item-${project.id}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{project.title}</p>
                              {project.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {project.location}
                                </p>
                              )}
                            </div>
                            <ProjectStatusBadge status={project.status || "DRAFT"} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full mt-4"
                  disabled
                  data-testid="button-project-registry-pilot"
                >
                  Full project registry · controlled pilot
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Use the working project tools available in this pilot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/marketflow/submit" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-new-project">
                    <Building2 className="h-4 w-4 mr-2" />
                    Submit project record
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                  aria-describedby="capital-raise-pilot-note"
                  data-testid="action-raise-capital-pilot"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Capital coordination · controlled pilot
                </Button>
                <p id="capital-raise-pilot-note" className="text-xs text-muted-foreground">
                  Project capital relationships remain private and are coordinated separately.
                </p>
                <Link href="/marketflow/calculators" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-calculators">
                    <TrendingUp className="h-4 w-4 mr-2" />
                  Project calculators
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Browse Wholesale Deals</CardTitle>
              </div>
              <CardDescription>
                Review authorized private records from participating sources. No inventory,
                availability, or personalized match is implied.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link href="/marketflow/deals">
                  <Button data-testid="button-browse-deals">
                    <Target className="h-4 w-4 mr-2" />
                    Review deal records
                  </Button>
                </Link>
                <Link href="/marketflow/capital">
                  <Button variant="outline" data-testid="button-browse-capital">
                    <Handshake className="h-4 w-4 mr-2" />
                    Review capital relationships
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </MarketplaceLayout>
    </AuthGuard>
  );
}

function AccountDataUnavailable({
  testId,
  title,
  detail,
}: {
  testId: string;
  title: string;
  detail: string;
}) {
  return (
    <div
      className="rounded-lg border border-dashed p-6 text-center"
      role="status"
      data-testid={testId}
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function ProjectStatusBadge({ status }: { status: string }) {
  switch (status.toUpperCase()) {
    case "OPEN_FOR_INVESTMENT":
    case "FUNDING":
      return <Badge variant="secondary">Capital context</Badge>;
    case "FUNDED":
      return <Badge variant="secondary">Source status: funded</Badge>;
    case "IN_PROGRESS":
      return <Badge>In Progress</Badge>;
    case "COMPLETED":
    case "EXITED":
      return <Badge variant="outline">Source status: completed</Badge>;
    case "DRAFT":
      return <Badge variant="outline">Draft</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
