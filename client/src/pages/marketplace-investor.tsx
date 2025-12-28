import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import type { CommittedInvestment, CapitalProject } from "@shared/schema";
import {
  TrendingUp,
  DollarSign,
  ArrowRight,
  Briefcase,
  Target,
  BarChart3,
  Sparkles,
  Compass,
  Heart,
  Building,
  MapPin,
  Eye,
  LogIn,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

interface InvestorStats {
  totalInvested: number;
  activeDeals: number;
  savedDeals: number;
  pendingOffers: number;
}

interface CommitmentWithProject extends CommittedInvestment {
  project?: CapitalProject;
}

export default function MarketplaceInvestorPage() {
  const { profile, isGuestMode, exitGuestMode } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  const handleExitPreview = () => {
    exitGuestMode();
    setLocation("/marketplace/discover");
  };

  const { data: stats, isLoading } = useQuery<InvestorStats>({
    queryKey: ["/api/supabase/marketplace/investor/stats"],
  });

  const { data: myCommitments, isLoading: isCommitmentsLoading } = useQuery<CommitmentWithProject[]>({
    queryKey: ["/api/supabase/capital-commitments"],
  });

  const { data: availableProjects, isLoading: isProjectsLoading } = useQuery<CapitalProject[]>({
    queryKey: ["/api/supabase/capital-projects"],
  });

  const displayStats: InvestorStats = stats ?? {
    totalInvested: 0,
    activeDeals: 0,
    savedDeals: 0,
    pendingOffers: 0,
  };

  const recentCommitments = myCommitments?.slice(0, 3) || [];
  const recommendedProjects = availableProjects?.slice(0, 3) || [];

  return (
    <AuthGuard requiredRoles={["admin", "investor"]}>
      <MarketplaceLayout>
        <div className="space-y-6">
          {isGuestMode && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-6 py-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium" data-testid="text-guest-preview-banner">Guest Preview Mode - Viewing as Investor</span>
                  <span className="text-sm text-muted-foreground">Sign in to take actions</span>
                </div>
                <div className="flex gap-2">
                  <Link href="/login">
                    <Button size="sm" data-testid="button-guest-sign-in">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={handleExitPreview} data-testid="button-exit-preview">
                    Exit Preview
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold" data-testid="text-page-title">
                {isGuestMode ? "Welcome, Guest Investor" : "Investor Dashboard"}
              </h1>
              <p className="text-muted-foreground">
                Discover deals and grow your real estate portfolio
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/marketplace/discover">
                <Button data-testid="button-browse-deals">
                  <Compass className="h-4 w-4 mr-2" />
                  Browse Deals
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-active-investments">
                    {displayStats.activeDeals}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">In your portfolio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-total-invested">
                    ${displayStats.totalInvested.toLocaleString()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Capital deployed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saved Deals</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-saved-deals">
                    {displayStats.savedDeals}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">In your watchlist</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-pending-offers">
                    {displayStats.pendingOffers}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Awaiting response</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Overview</CardTitle>
                <CardDescription>Your active investments</CardDescription>
              </CardHeader>
              <CardContent>
                {isCommitmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentCommitments.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No investments yet</p>
                    <Link href="/marketplace/capital">
                      <Button size="sm">
                        <Compass className="w-4 h-4 mr-2" />
                        Discover Opportunities
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCommitments.map((commitment) => (
                      <div 
                        key={commitment.id} 
                        className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                        data-testid={`commitment-item-${commitment.id}`}
                      >
                        <div>
                          <p className="font-medium">
                            {commitment.project?.title || `Project #${commitment.projectId}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${(commitment.committedAmount || 0).toLocaleString()} invested | 
                            {commitment.structureType === "debt" 
                              ? ` ${commitment.interestRate || "0"}% interest`
                              : ` ${commitment.equityPercent || "0"}% equity`
                            }
                          </p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/marketplace/investor/portfolio">
                  <Button variant="ghost" className="w-full mt-4" data-testid="link-view-portfolio">
                    View Full Portfolio
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capital Opportunities</CardTitle>
                <CardDescription>Projects seeking investor capital</CardDescription>
              </CardHeader>
              <CardContent>
                {isProjectsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recommendedProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No open opportunities at this time</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendedProjects.map((project) => (
                      <Link key={project.id} href={`/marketplace/capital/${project.id}`}>
                        <div 
                          className="flex items-center justify-between p-3 rounded-lg border hover-elevate cursor-pointer"
                          data-testid={`project-recommendation-${project.id}`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{project.title}</p>
                              {project.status === "OPEN_FOR_INVESTMENT" && (
                                <Badge variant="secondary" className="gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  Open
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              {project.location && (
                                <>
                                  <MapPin className="h-3 w-3" />
                                  {project.location} |{" "}
                                </>
                              )}
                              ${((project.fundingGoal || 0) / 1000).toFixed(0)}K goal
                              {project.projectedReturn ? ` | ${project.projectedReturn} return` : ""}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <Link href="/marketplace/capital">
                  <Button variant="ghost" className="w-full mt-4" data-testid="link-discover-more">
                    Browse All Opportunities
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Find Deals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse wholesale deals and capital projects matched to your preferences.
                </p>
                <Link href="/marketplace/discover">
                  <Button className="w-full" data-testid="action-discover">
                    <Compass className="h-4 w-4 mr-2" />
                    Discover
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analyze
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Use our calculators to evaluate deals and project returns.
                </p>
                <Link href="/calculators">
                  <Button variant="outline" className="w-full" data-testid="action-analyze">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Calculators
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Review deals you've saved for later consideration.
                </p>
                <Link href="/marketplace/investor/saved">
                  <Button variant="outline" className="w-full" data-testid="action-saved">
                    <Heart className="h-4 w-4 mr-2" />
                    View Saved
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

function CommitmentStatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "approved":
    case "active":
      return <Badge>Active</Badge>;
    case "funded":
      return <Badge className="bg-green-600">Funded</Badge>;
    case "completed":
    case "exited":
      return <Badge variant="outline">Completed</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
