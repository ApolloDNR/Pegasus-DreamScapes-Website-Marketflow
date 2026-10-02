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
  Briefcase,
  Target,
  BarChart3,
  Compass,
  Heart,
  Eye,
  LogIn,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { QUERY_KEYS } from "@/lib/queryClient";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";

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
  const { isGuestMode, exitGuestMode } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  const handleExitPreview = () => {
    exitGuestMode();
    setLocation("/marketflow/discover");
  };

  const { data: stats, isLoading, isError: statsError } = useAuthenticatedQuery<InvestorStats>(
    QUERY_KEYS.userStats("investor"),
  );

  const {
    data: myCommitments,
    isLoading: isCommitmentsLoading,
    isError: commitmentsError,
  } = useQuery<CommitmentWithProject[]>({
    queryKey: ["/api/supabase/capital-commitments"],
  });

  const recentCommitments = myCommitments?.slice(0, 3) || [];

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
                Review account records and controlled-pilot deal context.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/marketflow/discover">
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
                ) : statsError || !stats ? (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-active-investments">
                    {stats.activeDeals}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Accepted offer records</p>
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
                ) : statsError || !stats ? (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-total-invested">
                    ${stats.totalInvested.toLocaleString()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Accepted offer amount; not proof of funds transferred</p>
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
                ) : statsError || !stats ? (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-saved-deals">
                    {stats.savedDeals}
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
                ) : statsError || !stats ? (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-pending-offers">
                    {stats.pendingOffers}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Awaiting response</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recorded commitments</CardTitle>
                <CardDescription>Historical records associated with this account</CardDescription>
              </CardHeader>
              <CardContent>
                {isCommitmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : commitmentsError ? (
                  <AccountDataUnavailable scope="Commitment records" />
                ) : recentCommitments.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No recorded commitment entries</p>
                    <Link href="/marketflow/capital">
                      <Button size="sm">
                        <Compass className="w-4 h-4 mr-2" />
                        View private project records
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
                            ${(commitment.committedAmount || 0).toLocaleString()} recorded commitment |
                            {commitment.structureType === "debt" 
                              ? ` ${commitment.interestRate || "0"}% interest`
                              : ` ${commitment.equityPercent || "0"}% equity`
                            }
                          </p>
                        </div>
                        <Badge variant="outline">Recorded</Badge>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full mt-4"
                  disabled
                  aria-describedby="portfolio-pilot-note"
                  data-testid="button-portfolio-pilot"
                >
                  Expanded portfolio · controlled pilot
                </Button>
                <p id="portfolio-pilot-note" className="mt-2 text-center text-xs text-muted-foreground">
                  Your recorded commitments remain visible in the summary above.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Private project records</CardTitle>
                <CardDescription>Context only—not a transaction surface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  MarketFlow may display source-supplied project context to separately approved
                  participants. These records are not offerings, allocations, recommendations, or verified investment terms.
                </p>
                <Link href="/marketflow/capital">
                  <Button variant="outline" className="w-full" data-testid="link-discover-more">
                    Review available records
                  </Button>
                </Link>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Capital participation is not accepted through this website. Relationship context
                  can be shared separately, with any follow-up subject to written terms.
                </p>
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
                  Browse reviewed private records available to this approved account. No personalized match is implied.
                </p>
                <Link href="/marketflow/deals">
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
                <Link href="/marketflow/calculators">
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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled
                  aria-describedby="saved-deals-pilot-note"
                  data-testid="action-saved-pilot"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Saved workspace · controlled pilot
                </Button>
                <p id="saved-deals-pilot-note" className="mt-2 text-xs text-muted-foreground">
                  Saved sets are not yet available outside the reviewed pilot.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </MarketplaceLayout>
    </AuthGuard>
  );
}

function AccountDataUnavailable({ scope }: { scope: string }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center" role="status">
      <p className="font-medium">Account data unavailable</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {scope} could not be loaded. No zero or empty state is being inferred.
      </p>
    </div>
  );
}
