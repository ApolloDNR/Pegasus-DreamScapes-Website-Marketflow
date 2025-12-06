import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
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
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

interface InvestorStats {
  activeInvestments: number;
  totalInvested: number;
  savedDeals: number;
  avgReturn: number;
}

export default function MarketplaceInvestorPage() {
  const { profile } = useSupabaseAuth();

  const { data: stats, isLoading } = useQuery<InvestorStats>({
    queryKey: ["/api/marketplace/investor/stats"],
    enabled: false,
  });

  const mockStats: InvestorStats = {
    activeInvestments: 4,
    totalInvested: 325000,
    savedDeals: 12,
    avgReturn: 18.5,
  };

  const displayStats = stats ?? mockStats;

  return (
    <AuthGuard requiredRoles={["admin", "investor"]}>
      <MarketplaceLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold" data-testid="text-page-title">
                Investor Dashboard
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
                    {displayStats.activeInvestments}
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
                <CardTitle className="text-sm font-medium">Avg. Return</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-avg-return">
                    {displayStats.avgReturn}%
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Across investments</p>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Victorian Revival Project</p>
                      <p className="text-sm text-muted-foreground">$50,000 invested | 12% projected</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Multifamily Acquisition</p>
                      <p className="text-sm text-muted-foreground">$75,000 invested | 15% projected</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Fix & Flip - Cedar Lane</p>
                      <p className="text-sm text-muted-foreground">$25,000 invested | 22% actual</p>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                </div>
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
                <CardTitle>Recommended Deals</CardTitle>
                <CardDescription>Based on your investment profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border hover-elevate cursor-pointer">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">123 Oak Street</p>
                        <Badge variant="secondary" className="gap-1">
                          <Sparkles className="h-3 w-3" />
                          92% Match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Wholesale | ARV $180k | 25% ROI</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover-elevate cursor-pointer">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Modern Duplex Project</p>
                        <Badge variant="secondary" className="gap-1">
                          <Sparkles className="h-3 w-3" />
                          88% Match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Capital Raise | $500k goal | 15% return</p>
                    </div>
                  </div>
                </div>
                <Link href="/marketplace/discover">
                  <Button variant="ghost" className="w-full mt-4" data-testid="link-discover-more">
                    Discover More Deals
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
