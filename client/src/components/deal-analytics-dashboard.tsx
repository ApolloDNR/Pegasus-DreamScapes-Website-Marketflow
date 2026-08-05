import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Target, 
  Clock,
  PieChart,
  Activity,
  Eye,
  Bookmark,
  MessageSquare,
  FileText,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface DashboardStats {
  totalDealsViewed: number;
  dealsSaved: number;
  offersSubmitted: number;
  dealsWon: number;
  totalInvested: number;
  totalReturns: number;
  avgROI: number;
  activeNegotiations: number;
  pendingOffers: number;
  monthlyGrowth: number;
}

interface DealActivity {
  id: string;
  type: "viewed" | "saved" | "offer" | "counter" | "accepted" | "message";
  dealTitle: string;
  timestamp: string;
  details?: string;
}

interface MarketInsight {
  metric: string;
  value: string;
  trend: "up" | "down" | "stable";
  change: string;
  description: string;
}

export function DealAnalyticsDashboard({ userId }: { userId?: string }) {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/analytics/dashboard", userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: activity } = useQuery<DealActivity[]>({
    queryKey: ["/api/analytics/activity", userId],
    enabled: !!userId,
  });

  const { data: insights } = useQuery<MarketInsight[]>({
    queryKey: ["/api/analytics/market-insights"],
    enabled: !!userId,
    staleTime: 1000 * 60 * 15,
  });

  const displayStats: DashboardStats = stats || {
    totalDealsViewed: 0,
    dealsSaved: 0,
    offersSubmitted: 0,
    dealsWon: 0,
    totalInvested: 0,
    totalReturns: 0,
    avgROI: 0,
    activeNegotiations: 0,
    pendingOffers: 0,
    monthlyGrowth: 0,
  };

  const displayActivity: DealActivity[] = activity || [];
  const displayInsights: MarketInsight[] = insights || [];
  const hasPerformanceHistory =
    displayStats.totalInvested > 0 ||
    displayStats.totalReturns > 0 ||
    displayStats.offersSubmitted > 0 ||
    displayStats.activeNegotiations > 0;
  const winRate = displayStats.offersSubmitted > 0
    ? `${Math.round((displayStats.dealsWon / displayStats.offersSubmitted) * 100)}% win rate`
    : "No offer history yet";

  if (!userId) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Sign in to view your deal analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  if (statsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deal Analytics</h2>
          <p className="text-muted-foreground">Your performance and market insights</p>
        </div>
        <Badge className={displayStats.monthlyGrowth > 0
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-muted text-muted-foreground"
        }>
          {displayStats.monthlyGrowth > 0 ? (
            <ArrowUpRight className="w-3 h-3 mr-1" />
          ) : (
            <Clock className="w-3 h-3 mr-1" />
          )}
          {displayStats.monthlyGrowth > 0 ? `${Math.abs(displayStats.monthlyGrowth)}% this month` : "No live history yet"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Deals Viewed"
          value={displayStats.totalDealsViewed.toString()}
          icon={<Eye className="w-5 h-5 text-blue-500" />}
          subtitle={`${displayStats.dealsSaved} saved`}
        />
        <StatCard
          title="Offers Submitted"
          value={displayStats.offersSubmitted.toString()}
          icon={<FileText className="w-5 h-5 text-primary" />}
          subtitle={`${displayStats.pendingOffers} pending`}
        />
        <StatCard
          title="Deals Won"
          value={displayStats.dealsWon.toString()}
          icon={<Award className="w-5 h-5 text-amber-500" />}
          subtitle={winRate}
        />
        <StatCard
          title="Active Negotiations"
          value={displayStats.activeNegotiations.toString()}
          icon={<MessageSquare className="w-5 h-5 text-green-500" />}
          subtitle="in progress"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Investment Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasPerformanceHistory ? (
              <>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
                    <p className="text-2xl font-bold">
                      ${(displayStats.totalInvested / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                    <p className="text-sm text-muted-foreground mb-1">Total Returns</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(displayStats.totalReturns / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                    <p className="text-sm text-muted-foreground mb-1">Average ROI</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {displayStats.avgROI}%
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Portfolio Growth</span>
                      <span className="text-sm text-muted-foreground">
                        ${(displayStats.totalInvested + displayStats.totalReturns).toLocaleString()}
                      </span>
                    </div>
                    <Progress value={Math.min(100, Math.max(0, displayStats.monthlyGrowth))} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Deal Pipeline</span>
                      <span className="text-sm text-muted-foreground">
                        {displayStats.activeNegotiations + displayStats.pendingOffers} active
                      </span>
                    </div>
                    <Progress value={displayStats.activeNegotiations || displayStats.pendingOffers ? 60 : 0} className="h-2" />
                  </div>
                </div>
              </>
            ) : (
              <EmptyAnalyticsState
                title="Performance appears after real activity."
                description="MarketFlow analytics stay empty until approved members view reviewed opportunities, submit offers, or close deals inside the live workflow."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayActivity.length > 0 ? (
              <div className="space-y-3">
                {displayActivity.slice(0, 5).map((item) => (
                  <ActivityItem key={item.id} activity={item} />
                ))}
              </div>
            ) : (
              <EmptyAnalyticsState
                title="No activity recorded yet."
                description="Actions will appear here after real MarketFlow interactions are logged."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Market Insights
          </CardTitle>
          <CardDescription>
            Current market conditions and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {displayInsights.length > 0 ? (
              displayInsights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-4">
                <EmptyAnalyticsState
                  title="Market insights are pending live data."
                  description="Pegasus will publish market insight cards only after the underlying data source is wired and reviewed."
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceMetrics stats={displayStats} />
        </TabsContent>

        <TabsContent value="pipeline">
          <PipelineOverview stats={displayStats} />
        </TabsContent>

        <TabsContent value="history">
          <DealHistory activity={displayActivity} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          {icon}
        </div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function EmptyAnalyticsState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center">
      <Activity className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ActivityItem({ activity }: { activity: DealActivity }) {
  const icons: Record<DealActivity["type"], React.ReactNode> = {
    viewed: <Eye className="w-3 h-3" />,
    saved: <Bookmark className="w-3 h-3" />,
    offer: <FileText className="w-3 h-3" />,
    counter: <TrendingUp className="w-3 h-3" />,
    accepted: <Award className="w-3 h-3" />,
    message: <MessageSquare className="w-3 h-3" />,
  };

  const colors: Record<DealActivity["type"], string> = {
    viewed: "bg-gray-100 text-gray-600",
    saved: "bg-blue-100 text-blue-600",
    offer: "bg-primary/10 text-primary",
    counter: "bg-amber-100 text-amber-600",
    accepted: "bg-green-100 text-green-600",
    message: "bg-cyan-100 text-cyan-600",
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`p-1.5 rounded ${colors[activity.type]}`}>
        {icons[activity.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{activity.dealTitle}</p>
        {activity.details && (
          <p className="text-xs text-muted-foreground">{activity.details}</p>
        )}
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {formatTime(activity.timestamp)}
      </span>
    </div>
  );
}

function InsightCard({ insight }: { insight: MarketInsight }) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    stable: "text-gray-600",
  };

  const trendIcons = {
    up: <TrendingUp className="w-4 h-4" />,
    down: <TrendingDown className="w-4 h-4" />,
    stable: <Activity className="w-4 h-4" />,
  };

  return (
    <div className="p-4 rounded-lg border">
      <p className="text-sm text-muted-foreground">{insight.metric}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xl font-bold">{insight.value}</p>
        <div className={`flex items-center gap-1 ${trendColors[insight.trend]}`}>
          {trendIcons[insight.trend]}
          <span className="text-sm">{insight.change}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
    </div>
  );
}

function PerformanceMetrics({ stats }: { stats: DashboardStats }) {
  const hasHistory = stats.totalDealsViewed > 0 || stats.offersSubmitted > 0 || stats.totalInvested > 0;
  if (!hasHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Calculated only from real MarketFlow activity</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyAnalyticsState
            title="No performance metrics yet."
            description="Targets and conversion rates appear after real views, saved deals, offers, and closed outcomes are recorded."
          />
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: "Save Rate",
      value: stats.totalDealsViewed > 0 ? Math.round((stats.dealsSaved / stats.totalDealsViewed) * 100) : 0,
    },
    {
      label: "Offer Conversion",
      value: stats.dealsSaved > 0 ? Math.round((stats.offersSubmitted / stats.dealsSaved) * 100) : 0,
    },
    {
      label: "Win Rate",
      value: stats.offersSubmitted > 0 ? Math.round((stats.dealsWon / stats.offersSubmitted) * 100) : 0,
    },
    {
      label: "Return Ratio",
      value: stats.totalInvested > 0 ? Math.round((stats.totalReturns / stats.totalInvested) * 100) : 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>How you compare to your targets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{metric.label}</span>
              <span className="text-sm font-medium text-muted-foreground">{metric.value}%</span>
            </div>
            <div className="relative">
              <Progress value={metric.value} className="h-2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PipelineOverview({ stats }: { stats: DashboardStats }) {
  const stages = [
    { name: "Viewed", count: stats.totalDealsViewed, color: "bg-gray-200" },
    { name: "Saved", count: stats.dealsSaved, color: "bg-blue-200" },
    { name: "Offer Sent", count: stats.offersSubmitted, color: "bg-primary/20" },
    { name: "Negotiating", count: stats.activeNegotiations, color: "bg-amber-200" },
    { name: "Pending", count: stats.pendingOffers, color: "bg-green-200" },
    { name: "Closed", count: stats.dealsWon, color: "bg-green-400" },
  ];

  const total = stages.reduce((sum, s) => sum + s.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Pipeline</CardTitle>
        <CardDescription>Your deals at each stage</CardDescription>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <>
            <div className="flex h-4 rounded-full overflow-hidden mb-4">
              {stages.map((stage) => (
                <div
                  key={stage.name}
                  className={stage.color}
                  style={{ width: `${(stage.count / total) * 100}%` }}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {stages.map((stage) => (
                <div key={stage.name} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${stage.color}`} />
                  <span className="text-sm">{stage.name}</span>
                  <span className="text-sm font-medium ml-auto">{stage.count}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyAnalyticsState
            title="Pipeline is empty."
            description="Reviewed activity will populate the pipeline once MarketFlow has real member actions."
          />
        )}
      </CardContent>
    </Card>
  );
}

function DealHistory({ activity }: { activity: DealActivity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
        <CardDescription>Your recent deal interactions</CardDescription>
      </CardHeader>
      <CardContent>
        {activity.length > 0 ? (
          <div className="space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border">
                <ActivityItem activity={item} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyAnalyticsState
            title="No history yet."
            description="MarketFlow will show real interaction history here after member actions are recorded."
          />
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
