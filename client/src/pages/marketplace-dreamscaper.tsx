import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import {
  Building2,
  TrendingUp,
  DollarSign,
  Plus,
  ArrowRight,
  CheckCircle2,
  Hammer,
  Target,
  Sparkles,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

interface ProjectStats {
  activeProjects: number;
  totalRaised: number;
  totalFundingGoal: number;
  projectsCompleted: number;
}

export default function MarketplaceDreamscaperPage() {
  const { profile } = useSupabaseAuth();
  const isPegasus = profile?.is_pegasus_badged;

  const { data: stats, isLoading } = useQuery<ProjectStats>({
    queryKey: ["/api/marketplace/dreamscaper/stats"],
  });

  const displayStats: ProjectStats = stats ?? {
    activeProjects: 0,
    totalRaised: 0,
    totalFundingGoal: 0,
    projectsCompleted: 0,
  };

  return (
    <AuthGuard requiredRoles={["admin", "pegasus_dreamscaper", "dreamscaper"]}>
      <MarketplaceLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold" data-testid="text-page-title">
                DreamScaper Dashboard
              </h1>
              <p className="text-muted-foreground">
                Transform properties and raise capital for your projects
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isPegasus && (
                <Badge variant="default" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Pegasus Partner
                </Badge>
              )}
              <Link href="/marketplace/dreamscaper/projects/new">
                <Button data-testid="button-new-project">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Hammer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-active-projects">
                    {displayStats.activeProjects}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">In progress</p>
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
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-completed-projects">
                    {displayStats.projectsCompleted}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Total transformations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Raising Capital</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-raising-capital">
                    {displayStats.totalFundingGoal > 0 ? Math.round((displayStats.totalRaised / displayStats.totalFundingGoal) * 100) : 0}%
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Open funding rounds</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Capital Raised</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-total-raised">
                    ${displayStats.totalRaised.toLocaleString()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Lifetime total</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Your ongoing transformations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2 p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Victorian Revival - 234 Elm St</p>
                      <Badge>In Progress</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Renovation Progress</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  </div>
                  <div className="space-y-2 p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Modern Flip - 567 Cedar Lane</p>
                      <Badge variant="secondary">Raising Capital</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Funding Progress</span>
                        <span>$180k / $250k</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                  </div>
                </div>
                <Link href="/marketplace/dreamscaper/projects">
                  <Button variant="ghost" className="w-full mt-4" data-testid="link-view-all-projects">
                    View All Projects
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your DreamScaper activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/marketplace/dreamscaper/projects/new" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-new-project">
                    <Building2 className="h-4 w-4 mr-2" />
                    Create New Project
                  </Button>
                </Link>
                <Link href="/marketplace/dreamscaper/capital" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-raise-capital">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Raise Capital
                  </Button>
                </Link>
                <Link href="/marketplace/discover" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-find-deals">
                    <Target className="h-4 w-4 mr-2" />
                    Find Wholesale Deals
                  </Button>
                </Link>
                <Link href="/calculators" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-calculators">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Project Calculators
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </MarketplaceLayout>
    </AuthGuard>
  );
}
