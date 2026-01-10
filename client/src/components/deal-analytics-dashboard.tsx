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
    staleTime: 1000 * 60 * 15,
  });

  const mockStats: DashboardStats = stats || {
    totalDealsViewed: 156,
    dealsSaved: 24,
    offersSubmitted: 12,
    dealsWon: 3,
    totalInvested: 485000,
    totalReturns: 127500,
    avgROI: 26.3,
    activeNegotiations: 5,
    pendingOffers: 3,
    monthlyGrowth: 12.5,
  };

  const mockActivity: DealActivity[] = activity || [
    { id: "1", type: "offer", dealTitle: "123 Main St Flip", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), details: "Submitted $175,000 offer" },
    { id: "2", type: "saved", dealTitle: "456 Oak Ave Rental", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: "3", type: "counter", dealTitle: "789 Pine Rd", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), details: "Counter offer received: $165,000" },
    { id: "4", type: "viewed", dealTitle: "321 Elm St", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
    { id: "5", type: "accepted", dealTitle: "555 Cedar Ln", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), details: "Offer accepted!" },
  ];

  const mockInsights: MarketInsight[] = insights || [
    { metric: "Average Deal Size", value: "$185,000", trend: "up", change: "+8%", description: "vs last month" },
    { metric: "Days on Market", value: "12 days", trend: "down", change: "-3 days", description: "faster closings" },
    { metric: "Investor Activity", value: "High", trend: "up", change: "+15%", description: "more competition" },
    { metric: "Available Deals", value: "234", trend: "stable", change: "0%", description: "steady supply" },
  ];

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
        <Badge className={mockStats.monthlyGrowth > 0 
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }>
          {mockStats.monthlyGrowth > 0 ? (
            <ArrowUpRight className="w-3 h-3 mr-1" />
          ) : (
            <ArrowDownRight className="w-3 h-3 mr-1" />
          )}
          {Math.abs(mockStats.monthlyGrowth)}% this month
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Deals Viewed"
          value={mockStats.totalDealsViewed.toString()}
          icon={<Eye className="w-5 h-5 text-blue-500" />}
          subtitle={`${mockStats.dealsSaved} saved`}
        />
        <StatCard
          title="Offers Submitted"
          value={mockStats.offersSubmitted.toString()}
          icon={<FileText className="w-5 h-5 text-purple-500" />}
          subtitle={`${mockStats.pendingOffers} pending`}
        />
        <StatCard
          title="Deals Won"
          value={mockStats.dealsWon.toString()}
          icon={<Award className="w-5 h-5 text-amber-500" />}
          subtitle={`${Math.round((mockStats.dealsWon / mockStats.offersSubmitted) * 100)}% win rate`}
        />
        <StatCard
          title="Active Negotiations"
          value={mockStats.activeNegotiations.toString()}
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
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
                <p className="text-2xl font-bold">
                  ${(mockStats.totalInvested / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                <p className="text-sm text-muted-foreground mb-1">Total Returns</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(mockStats.totalReturns / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <p className="text-sm text-muted-foreground mb-1">Average ROI</p>
                <p className="text-2xl font-bold text-amber-600">
                  {mockStats.avgROI}%
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Portfolio Growth</span>
                  <span className="text-sm text-muted-foreground">
                    ${(mockStats.totalInvested + mockStats.totalReturns).toLocaleString()}
                  </span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Deal Pipeline</span>
                  <span className="text-sm text-muted-foreground">
                    {mockStats.activeNegotiations + mockStats.pendingOffers} active
                  </span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>
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
            <div className="space-y-3">
              {mockActivity.slice(0, 5).map((item) => (
                <ActivityItem key={item.id} activity={item} />
              ))}
            </div>
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
            {mockInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
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
          <PerformanceMetrics stats={mockStats} />
        </TabsContent>

        <TabsContent value="pipeline">
          <PipelineOverview />
        </TabsContent>

        <TabsContent value="history">
          <DealHistory activity={mockActivity} />
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
    offer: "bg-purple-100 text-purple-600",
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
  const metrics = [
    { label: "Deal View Rate", value: 85, target: 80 },
    { label: "Offer Conversion", value: 42, target: 50 },
    { label: "Win Rate", value: 25, target: 30 },
    { label: "Response Time", value: 92, target: 90 },
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
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  metric.value >= metric.target ? "text-green-600" : "text-amber-600"
                }`}>
                  {metric.value}%
                </span>
                <span className="text-xs text-muted-foreground">
                  / {metric.target}% target
                </span>
              </div>
            </div>
            <div className="relative">
              <Progress value={metric.value} className="h-2" />
              <div 
                className="absolute top-0 w-0.5 h-2 bg-gray-400"
                style={{ left: `${metric.target}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PipelineOverview() {
  const stages = [
    { name: "Viewing", count: 45, color: "bg-gray-200" },
    { name: "Saved", count: 24, color: "bg-blue-200" },
    { name: "Offer Sent", count: 8, color: "bg-purple-200" },
    { name: "Negotiating", count: 5, color: "bg-amber-200" },
    { name: "Under Contract", count: 2, color: "bg-green-200" },
    { name: "Closed", count: 3, color: "bg-green-400" },
  ];

  const total = stages.reduce((sum, s) => sum + s.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Pipeline</CardTitle>
        <CardDescription>Your deals at each stage</CardDescription>
      </CardHeader>
      <CardContent>
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
        <div className="space-y-4">
          {activity.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border">
              <ActivityItem activity={item} />
            </div>
          ))}
        </div>
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
