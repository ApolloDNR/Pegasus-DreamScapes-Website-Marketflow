import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  Eye, 
  Bookmark, 
  MessageSquare, 
  DollarSign, 
  FileText, 
  Handshake,
  TrendingUp,
  Clock,
  ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InvestorActivity } from "@shared/schema";

interface ActivityItem {
  id: string | number;
  type: "view" | "save" | "offer" | "message" | "jv_request" | "document" | "analysis" | "new_match" | "new_deal" | "investment" | "community_post";
  description: string;
  title?: string;
  dealId?: string;
  dealAddress?: string;
  timestamp: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

const activityIcons: Record<string, any> = {
  view: Eye,
  save: Bookmark,
  offer: DollarSign,
  message: MessageSquare,
  jv_request: Handshake,
  document: FileText,
  analysis: TrendingUp,
};

const activityColors: Record<string, string> = {
  view: "text-blue-500 bg-blue-500/10",
  save: "text-amber-500 bg-amber-500/10",
  offer: "text-green-500 bg-green-500/10",
  message: "text-purple-500 bg-purple-500/10",
  jv_request: "text-primary bg-primary/10",
  document: "text-slate-500 bg-slate-500/10",
  analysis: "text-emerald-500 bg-emerald-500/10",
};

export function useActivityFeed() {
  const { user } = useSupabaseAuth();

  const { data: activities = [], isLoading, refetch } = useQuery<InvestorActivity[]>({
    queryKey: ['/api/investor-activity'],
    enabled: !!user,
    staleTime: 60000,
  });

  const addActivityMutation = useMutation({
    mutationFn: async (activity: { type: string; title: string; description?: string; link?: string }) => {
      const res = await apiRequest('POST', '/api/investor-activity', activity);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investor-activity'] });
    },
  });

  const getActivities = (): ActivityItem[] => {
    return activities.map(a => ({
      id: a.id,
      type: a.activityType as ActivityItem['type'],
      description: a.description || a.title,
      title: a.title,
      timestamp: typeof a.createdAt === 'string' ? a.createdAt : a.createdAt.toISOString(),
      link: a.link || undefined,
    }));
  };

  const addActivity = (activity: Omit<ActivityItem, "id" | "timestamp">) => {
    addActivityMutation.mutate({
      type: activity.type,
      title: activity.title || activity.description,
      description: activity.description,
      link: activity.link,
    });
  };

  return { 
    getActivities, 
    addActivity, 
    isLoading,
    refetch,
    rawActivities: activities 
  };
}

function ActivityItemRow({ item }: { item: ActivityItem }) {
  const Icon = activityIcons[item.type] || Activity;
  const colorClass = activityColors[item.type] || "text-muted-foreground bg-muted";

  return (
    <div className="flex items-start gap-3 p-3 hover-elevate rounded-lg" data-testid={`activity-item-${item.id}`}>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{item.description}</p>
        {item.dealAddress && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {item.dealAddress}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </div>
  );
}

interface ActivityFeedProps {
  className?: string;
  maxItems?: number;
  compact?: boolean;
}

export function ActivityFeed({ className, maxItems = 10, compact = false }: ActivityFeedProps) {
  const { isAuthenticated } = useSupabaseAuth();
  const { getActivities, isLoading } = useActivityFeed();
  const [filter, setFilter] = useState<string | null>(null);

  const activities = getActivities();
  const filteredActivities = filter 
    ? activities.filter(a => a.type === filter)
    : activities;
  const displayActivities = filteredActivities.slice(0, maxItems);

  const activityTypes = Array.from(new Set(activities.map(a => a.type)));

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  if (!isAuthenticated && activities.length === 0) {
    return (
      <Card className={cn("", className)} data-testid="card-activity-feed">
        <CardContent className="py-8 text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Sign in to see your activity</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={cn("space-y-1", className)} data-testid="activity-feed-compact">
        {displayActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          displayActivities.map(item => (
            <ActivityItemRow key={item.id} item={item} />
          ))
        )}
      </div>
    );
  }

  return (
    <Card className={cn("", className)} data-testid="card-activity-feed">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Recent Activity
          </CardTitle>
          {activityTypes.length > 1 && (
            <div className="flex items-center gap-1">
              {activityTypes.slice(0, 3).map(type => {
                const Icon = activityIcons[type];
                return (
                  <Button
                    key={type}
                    variant={filter === type ? "secondary" : "ghost"}
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setFilter(filter === type ? null : type)}
                    data-testid={`button-filter-${type}`}
                  >
                    <Icon className="w-3 h-3" />
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {displayActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Activity className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">Start browsing deals to see your activity</p>
            </div>
          ) : (
            <div className="space-y-1">
              {displayActivities.map(item => (
                <ActivityItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function ActivityFeedWidget({ className }: { className?: string }) {
  const { getActivities } = useActivityFeed();
  const activities = getActivities().slice(0, 5);

  if (activities.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-card border rounded-lg p-3", className)} data-testid="widget-activity-feed">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold flex items-center gap-1.5">
          <Activity className="w-3 h-3" />
          Recent Activity
        </h4>
        <Badge variant="secondary" className="text-[10px]">{activities.length}</Badge>
      </div>
      <div className="space-y-1">
        {activities.map(item => {
          const Icon = activityIcons[item.type] || Activity;
          return (
            <div key={item.id} className="flex items-center gap-2 text-xs py-1">
              <Icon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate flex-1">{item.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
