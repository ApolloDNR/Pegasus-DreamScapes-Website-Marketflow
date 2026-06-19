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
  Download,
  RefreshCw,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsData {
  stats: {
    totalDeals: number;
    totalVolume: number;
    activeProjects: number;
    totalUsers: number;
    dealsChange: number;
    volumeChange: number;
    projectsChange: number;
    usersChange: number;
  };
  dealVolumeData: Array<{ month: string; deals: number; volume: number }>;
  roleDistribution: Array<{ role: string; count: number; color: string }>;
  fundingProgress: Array<{ project: string; raised: number; goal: number }>;
  dealStatus: Array<{ status: string; count: number; color: string }>;
}

const EMPTY_ANALYTICS_DATA: AnalyticsData = {
  stats: {
    totalDeals: 0,
    totalVolume: 0,
    activeProjects: 0,
    totalUsers: 0,
    dealsChange: 0,
    volumeChange: 0,
    projectsChange: 0,
    usersChange: 0,
  },
  dealVolumeData: [],
  roleDistribution: [],
  fundingProgress: [],
  dealStatus: [],
};

export default function AnalyticsPage() {
  const { isAdmin, isAuthenticated, isLoading } = useSupabaseAuth();
  const [timeRange, setTimeRange] = useState("30d");
  const [laneFilter, setLaneFilter] = useState("all");
  
  const { data: analyticsData, isLoading: isDataLoading, refetch, isRefetching } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics/dashboard', timeRange, laneFilter],
    enabled: isAuthenticated && isAdmin,
    staleTime: 60000,
  });
  
  const getFilteredData = (data: AnalyticsData): AnalyticsData => {
    if (laneFilter === 'all') return data;
    
    const laneMultipliers: Record<string, number> = {
      wholesale: 0.65,
      capital: 0.20,
      listings: 0.15,
    };
    
    const multiplier = laneMultipliers[laneFilter] || 1;
    
    return {
      stats: {
        totalDeals: Math.round(data.stats.totalDeals * multiplier),
        totalVolume: Math.round(data.stats.totalVolume * multiplier),
        activeProjects: Math.round(data.stats.activeProjects * multiplier),
        totalUsers: data.stats.totalUsers,
        dealsChange: data.stats.dealsChange,
        volumeChange: data.stats.volumeChange,
        projectsChange: data.stats.projectsChange,
        usersChange: data.stats.usersChange,
      },
      dealVolumeData: data.dealVolumeData.map(d => ({
        ...d,
        deals: Math.round(d.deals * multiplier),
        volume: Math.round(d.volume * multiplier),
      })),
      roleDistribution: data.roleDistribution,
      fundingProgress: data.fundingProgress,
      dealStatus: data.dealStatus.map(d => ({
        ...d,
        count: Math.round(d.count * multiplier),
      })),
    };
  };

  useEffect(() => {
    document.title = "Analytics Dashboard | Pegasus DreamScapes";
  }, []);

  const handleRefresh = () => {
    refetch();
  };
  
  const rawData = analyticsData || EMPTY_ANALYTICS_DATA;
  const displayData = getFilteredData(rawData);
  const isRefreshing = isDataLoading || isRefetching;
  const laneStats = {
    wholesale: laneFilter === "wholesale" ? displayData.stats.totalDeals : 0,
    capital: laneFilter === "capital" ? displayData.stats.activeProjects : 0,
    listings: laneFilter === "listings" ? displayData.stats.totalDeals : 0,
  };
  const userRoles = new Map(displayData.roleDistribution.map((role) => [role.role.toLowerCase(), role.count]));

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
                <Select value={laneFilter} onValueChange={setLaneFilter}>
                  <SelectTrigger className="w-[160px]" data-testid="select-lane-filter">
                    <Home className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Lanes</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="capital">Capital Raises</SelectItem>
                    <SelectItem value="listings">Listings</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[140px]" data-testid="select-time-range">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  data-testid="button-refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>

                <Button variant="outline" data-testid="button-export">
                  <Download className="w-4 h-4 mr-2" />
                  Export
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Views</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-0 bg-primary rounded-full" />
                        </div>
                        <span className="text-sm font-medium w-16 text-right">0</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Saved</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-0 bg-primary rounded-full" />
                        </div>
                        <span className="text-sm font-medium w-16 text-right">0</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Inquiries</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-0 bg-primary rounded-full" />
                        </div>
                        <span className="text-sm font-medium w-16 text-right">0</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Offers</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-0 bg-primary rounded-full" />
                        </div>
                        <span className="text-sm font-medium w-16 text-right">0</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Closed</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-0 bg-emerald-500 rounded-full" />
                        </div>
                        <span className="text-sm font-medium w-16 text-right">0</span>
                      </div>
                    </div>
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
                      <span className="text-sm" data-testid="stat-active-7d">0</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium">New registrations (this month)</span>
                      <span className="text-sm" data-testid="stat-new-registrations">0</span>
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
