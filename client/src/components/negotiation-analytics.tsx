import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
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
import { PrivateDataError } from "@/components/private-data-state";

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

function isNegotiationStatsPayload(value: unknown): value is NegotiationStats {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<NegotiationStats>;
  return [
    candidate.totalNegotiations,
    candidate.successRate,
    candidate.averageCounters,
    candidate.averageTimeToClose,
    candidate.averageDiscount,
    candidate.bestDealSaved,
    candidate.strategyScore,
  ].every((item) => typeof item === "number" && Number.isFinite(item)) &&
    ["up", "down", "stable"].includes(String(candidate.recentTrend));
}

export function NegotiationAnalytics({ userId }: NegotiationAnalyticsProps) {
  const {
    data: stats,
    isLoading,
    isError: statsError,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useQuery<NegotiationStats>({
    queryKey: ["/api/analytics/negotiations", userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: insights,
    isLoading: insightsLoading,
    isError: insightsError,
    isFetching: insightsFetching,
    refetch: refetchInsights,
  } = useQuery<NegotiationInsight[]>({
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

  if (statsError || !isNegotiationStatsPayload(stats)) {
    return (
      <PrivateDataError
        title="Negotiation analytics unavailable"
        description="Pegasus could not verify your negotiation history. No zero performance metrics are shown from this failed response."
        onRetry={() => void refetchStats()}
        isRetrying={statsFetching}
        testId="state-negotiation-analytics-error"
      />
    );
  }

  const insightsUnavailable = insightsError || (!insightsLoading && !Array.isArray(insights));
  const displayInsights: NegotiationInsight[] = Array.isArray(insights) ? insights : [];
  const hasHistory = stats.totalNegotiations > 0;

  if (!hasHistory) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Negotiation performance
            </CardTitle>
            <CardDescription>Calculated only from completed, recorded MarketFlow negotiations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="font-medium">No verified negotiation history is available yet.</p>
              <p className="mx-auto mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Rates, timing, savings, and pattern notes remain hidden until the live workflow records enough completed activity.
              </p>
            </div>
          </CardContent>
        </Card>
        {insightsLoading && (
          <p className="py-4 text-center text-sm text-muted-foreground" role="status">Loading recorded pattern notes…</p>
        )}
        {insightsUnavailable && (
          <PrivateDataError
            title="Negotiation notes unavailable"
            description="The pattern-notes request failed; this is not an empty-insights result."
            onRetry={() => void refetchInsights()}
            isRetrying={insightsFetching}
            testId="state-negotiation-insights-error"
          />
        )}
      </div>
    );
  }

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
            {hasHistory ? (
              <Badge
                variant={stats.recentTrend === "up" ? "default" : "secondary"}
                className={stats.recentTrend === "up" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}
              >
                {stats.recentTrend === "up" ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : stats.recentTrend === "down" ? (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                ) : (
                  <Scale className="w-3 h-3 mr-1" />
                )}
                {stats.recentTrend === "up" ? "Improving" : stats.recentTrend === "down" ? "Declining" : "Stable"}
              </Badge>
            ) : (
              <Badge variant="secondary">Awaiting activity</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Target className="w-5 h-5 text-green-500" />}
              label="Success Rate"
              value={`${stats.successRate}%`}
              subtext="of negotiations closed"
              trend={stats.successRate > 70 ? "good" : "neutral"}
            />
            <StatCard
              icon={<Scale className="w-5 h-5 text-blue-500" />}
              label="Avg Counters"
              value={stats.averageCounters.toFixed(1)}
              subtext="per negotiation"
              trend="neutral"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-amber-500" />}
              label="Time to Close"
              value={`${stats.averageTimeToClose.toFixed(1)}d`}
              subtext="average days"
              trend={stats.averageTimeToClose < 5 ? "good" : "neutral"}
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5 text-primary" />}
              label="Largest Recorded Savings"
              value={`$${stats.bestDealSaved.toLocaleString()}`}
              subtext="from stored negotiation history"
              trend={stats.bestDealSaved > 0 ? "good" : "neutral"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Recorded-pattern notes
          </CardTitle>
          <CardDescription>
            Notes returned by the verified negotiation-history service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insightsLoading ? (
            <p className="py-5 text-center text-sm text-muted-foreground" role="status">Loading recorded pattern notes…</p>
          ) : insightsUnavailable ? (
            <PrivateDataError
              title="Negotiation notes unavailable"
              description="The pattern-notes request failed; this is not an empty-insights result."
              onRetry={() => void refetchInsights()}
              isRetrying={insightsFetching}
              testId="state-negotiation-insights-error"
            />
          ) : displayInsights.length > 0 ? (
            displayInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))
          ) : (
            <div className="rounded-lg border border-dashed p-5 text-center">
              <p className="font-medium">No evidence-backed insights yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Recommendations will appear after enough completed negotiation activity exists.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
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
