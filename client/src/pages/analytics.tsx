import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Home,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PrivateDataError } from "@/components/private-data-state";

interface AnalyticsData {
  stats: {
    totalDeals: number;
    totalVolume: number;
    activeProjects: number;
    totalUsers: number;
    dealsChange?: number;
    volumeChange?: number;
    projectsChange?: number;
    usersChange?: number;
  };
  laneStats: {
    wholesale: number;
    capital: number;
    listings: number;
  };
  dealVolumeData: Array<{ month: string; deals: number; volume: number }>;
  roleDistribution: Array<{ role: string; count: number; color: string }>;
  fundingProgress: Array<{ project: string; raised: number; goal: number }>;
  dealStatus: Array<{ status: string; count: number; color: string }>;
}

function isAnalyticsDataPayload(value: unknown): value is AnalyticsData {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<AnalyticsData>;
  return Boolean(
    candidate.stats &&
    candidate.laneStats &&
    Array.isArray(candidate.dealVolumeData) &&
    Array.isArray(candidate.roleDistribution) &&
    Array.isArray(candidate.fundingProgress) &&
    Array.isArray(candidate.dealStatus),
  );
}

export default function AnalyticsPage() {
  const { isAdmin, isAuthenticated, isLoading } = useSupabaseAuth();
  
  const {
    data: analyticsData,
    isLoading: isDataLoading,
    isError: isDataError,
    refetch,
    isRefetching,
  } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics/dashboard"],
    enabled: isAuthenticated && isAdmin,
    staleTime: 60000,
  });

  useEffect(() => {
    document.title = "Analytics Dashboard | Pegasus DreamScapes";
  }, []);

  const handleRefresh = () => {
    refetch();
  };
  
  const isRefreshing = isDataLoading || isRefetching;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Please sign in to access the analytics dashboard.
            </p>
            <Link href="/marketflow">
              <Button data-testid="link-marketflow">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to MarketFlow
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              The analytics dashboard is only available to administrators.
            </p>
            <Link href="/marketflow">
              <Button data-testid="link-marketflow-restricted">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to MarketFlow
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isDataLoading && !analyticsData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading verified analytics…</p>
        </div>
      </div>
    );
  }

  if (isDataError || !isAnalyticsDataPayload(analyticsData)) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-3xl px-4 py-16">
          <PrivateDataError
            title="Analytics data unavailable"
            description="Pegasus could not verify the admin analytics response. No zero totals or charts are shown while the source is unavailable."
            onRetry={() => void refetch()}
            isRetrying={isRefetching}
            testId="state-admin-analytics-error"
          />
          <div className="mt-4 text-center">
            <Button asChild variant="ghost">
              <Link href="/marketflow">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to MarketFlow
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const displayData = analyticsData;
  const laneStats = displayData.laneStats;
  const userRoles = new Map(displayData.roleDistribution.map((role) => [role.role.toLowerCase(), role.count]));

  return (
    <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href="/marketflow">
                  <Button variant="ghost" size="icon" data-testid="button-back">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    Analytics Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Verified platform metrics. Empty states mean no approved activity has been recorded yet.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  data-testid="button-refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview" data-testid="tab-overview">
                <TrendingUp className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="deals" data-testid="tab-deals">
                <Home className="w-4 h-4 mr-2" />
                Deals
              </TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AnalyticsDashboard
                stats={displayData.stats}
                dealVolumeData={displayData.dealVolumeData}
                roleDistribution={displayData.roleDistribution}
                fundingProgress={displayData.fundingProgress}
                dealStatus={displayData.dealStatus}
                isLoading={isRefreshing}
                data-testid="analytics-dashboard"
              />
            </TabsContent>

            <TabsContent value="deals" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Wholesale Deals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-wholesale-deals">{laneStats.wholesale}</div>
                    <p className="text-xs text-muted-foreground">Real reviewed activity only</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Capital Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-capital-projects">{laneStats.capital}</div>
                    <p className="text-xs text-muted-foreground">Real reviewed activity only</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Property Listings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-listings">{laneStats.listings}</div>
                    <p className="text-xs text-muted-foreground">Real reviewed activity only</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    Deal Conversion Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="font-medium">Conversion stages are not available from this data source.</p>
                    <p className="mx-auto mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      The verified totals above are available. Views, saves, inquiries, offers, and closed-stage events will not be shown until those event sources are connected and audited.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Investors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-investors">{userRoles.get("investors") || 0}</div>
                    <p className="text-xs text-muted-foreground">Verified accounts only</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Wholesalers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-wholesalers">{userRoles.get("wholesalers") || 0}</div>
                    <p className="text-xs text-muted-foreground">Verified accounts only</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Dreamscapers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-dreamscapers">{userRoles.get("dreamscapers") || 0}</div>
                    <p className="text-xs text-muted-foreground">Verified accounts only</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Buyers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-buyers">{userRoles.get("buyers") || 0}</div>
                    <p className="text-xs text-muted-foreground">Verified accounts only</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    User Activity Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium">Active users (last 7 days)</span>
                      <span className="text-sm text-muted-foreground" data-testid="stat-active-7d">Not tracked here</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium">New registrations (this month)</span>
                      <span className="text-sm text-muted-foreground" data-testid="stat-new-registrations">Not tracked here</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium">Verified users</span>
                      <span className="text-sm" data-testid="stat-verified">{displayData.stats.totalUsers}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium">Avg. session duration</span>
                      <span className="text-sm" data-testid="stat-avg-session">Not enough data</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
  );
}
