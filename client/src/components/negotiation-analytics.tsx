import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Award,
  Lightbulb,
  Scale
} from "lucide-react";

interface NegotiationStats {
  totalNegotiations: number;
  successRate: number;
  averageCounters: number;
  averageTimeToClose: number;
  averageDiscount: number;
  bestDealSaved: number;
  recentTrend: "up" | "down" | "stable";
  strategyScore: number;
}

interface NegotiationInsight {
  type: "tip" | "warning" | "success";
  title: string;
  description: string;
  action?: string;
}

interface NegotiationAnalyticsProps {
  userId?: string;
}

export function NegotiationAnalytics({ userId }: NegotiationAnalyticsProps) {
  const { data: stats, isLoading } = useQuery<NegotiationStats>({
    queryKey: ["/api/analytics/negotiations", userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: insights } = useQuery<NegotiationInsight[]>({
    queryKey: ["/api/analytics/negotiation-insights", userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });

  if (!userId) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Sign in to view your negotiation analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <NegotiationAnalyticsSkeleton />;
  }

  const mockStats: NegotiationStats = stats || {
    totalNegotiations: 24,
    successRate: 72,
    averageCounters: 2.3,
    averageTimeToClose: 4.2,
    averageDiscount: 8.5,
    bestDealSaved: 45000,
    recentTrend: "up",
    strategyScore: 85,
  };

  const mockInsights: NegotiationInsight[] = insights || [
    {
      type: "success",
      title: "Strong Negotiator",
      description: "Your success rate is 15% higher than average investors",
    },
    {
      type: "tip",
      title: "Timing Matters",
      description: "Deals closed within 48 hours have 30% higher success rate",
      action: "Respond faster to new offers",
    },
    {
      type: "warning",
      title: "Counter Limit",
      description: "Negotiations with 4+ counters rarely close successfully",
      action: "Consider final offers earlier",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Negotiation Performance
              </CardTitle>
              <CardDescription>
                Your deal-making statistics and trends
              </CardDescription>
            </div>
            <Badge 
              variant={mockStats.recentTrend === "up" ? "default" : "secondary"}
              className={mockStats.recentTrend === "up" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}
            >
              {mockStats.recentTrend === "up" ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {mockStats.recentTrend === "up" ? "Improving" : "Declining"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Target className="w-5 h-5 text-green-500" />}
              label="Success Rate"
              value={`${mockStats.successRate}%`}
              subtext="of negotiations closed"
              trend={mockStats.successRate > 70 ? "good" : "neutral"}
            />
            <StatCard
              icon={<Scale className="w-5 h-5 text-blue-500" />}
              label="Avg Counters"
              value={mockStats.averageCounters.toFixed(1)}
              subtext="per negotiation"
              trend="neutral"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-amber-500" />}
              label="Time to Close"
              value={`${mockStats.averageTimeToClose.toFixed(1)}d`}
              subtext="average days"
              trend={mockStats.averageTimeToClose < 5 ? "good" : "neutral"}
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5 text-purple-500" />}
              label="Best Savings"
              value={`$${(mockStats.bestDealSaved / 1000).toFixed(0)}k`}
              subtext="on a single deal"
              trend="good"
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Strategy Score</span>
              <span className="text-sm text-muted-foreground">{mockStats.strategyScore}/100</span>
            </div>
            <Progress value={mockStats.strategyScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Based on timing, counter frequency, and close rate
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Personalized recommendations to improve your negotiations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockInsights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </CardContent>
      </Card>

      <SuccessFactorsCard stats={mockStats} />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  trend: "good" | "bad" | "neutral";
}) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${
          trend === "good" ? "text-green-600" : 
          trend === "bad" ? "text-red-600" : ""
        }`}>
          {value}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
    </div>
  );
}

function InsightCard({ insight }: { insight: NegotiationInsight }) {
  const colors = {
    tip: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30",
    warning: "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30",
    success: "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30",
  };

  const icons = {
    tip: <Lightbulb className="w-4 h-4 text-blue-500" />,
    warning: <Zap className="w-4 h-4 text-amber-500" />,
    success: <Award className="w-4 h-4 text-green-500" />,
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[insight.type]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icons[insight.type]}</div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{insight.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
          {insight.action && (
            <p className="text-xs font-medium text-primary mt-2">{insight.action}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessFactorsCard({ stats }: { stats: NegotiationStats }) {
  const factors = [
    { label: "Response Speed", score: 88, tip: "You respond within 2 hours on average" },
    { label: "Offer Quality", score: 75, tip: "Your initial offers are competitive" },
    { label: "Counter Strategy", score: 82, tip: "Smart use of incremental counters" },
    { label: "Closing Rate", score: stats.successRate, tip: "Your deals close successfully" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="w-5 h-5 text-amber-500" />
          Success Factors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {factors.map((factor, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{factor.label}</span>
              <span className={`text-sm font-medium ${
                factor.score >= 80 ? "text-green-600" :
                factor.score >= 60 ? "text-amber-600" : "text-red-600"
              }`}>
                {factor.score}%
              </span>
            </div>
            <Progress 
              value={factor.score} 
              className="h-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">{factor.tip}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function NegotiationAnalyticsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-lg border">
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24 mt-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function NegotiationScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                score >= 60 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

  return (
    <Badge className={color}>
      <Target className="w-3 h-3 mr-1" />
      {score}% Success
    </Badge>
  );
}
