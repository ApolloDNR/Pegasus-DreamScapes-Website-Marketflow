import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Handshake,
  DollarSign,
  Eye,
  ArrowRight,
  Sparkles,
  Activity,
  Calendar,
  FileText,
  Home
} from "lucide-react";
import { Link } from "wouter";

interface NegotiationStats {
  activeNegotiations: number;
  pendingOffers: number;
  acceptedDeals: number;
  totalValue: number;
}

interface ActivityItem {
  id: string;
  type: "offer_sent" | "offer_received" | "counter_offer" | "accepted" | "rejected" | "deal_saved" | "message" | "jv_request";
  title: string;
  description: string;
  dealId?: string;
  dealAddress?: string;
  timestamp: Date;
  amount?: number;
}

export function DealProgressTracker() {
  const { isAuthenticated, profile } = useSupabaseAuth();

  const { data: stats, isLoading } = useQuery<NegotiationStats>({
    queryKey: ['/api/supabase/negotiation-stats'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const defaultStats: NegotiationStats = {
    activeNegotiations: 3,
    pendingOffers: 2,
    acceptedDeals: 1,
    totalValue: 125000
  };

  const displayStats = stats || defaultStats;
  const pipelineProgress = displayStats.acceptedDeals > 0 
    ? Math.min(100, (displayStats.acceptedDeals / (displayStats.activeNegotiations + displayStats.acceptedDeals)) * 100)
    : 0;

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent" data-testid="progress-tracker">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Your Deal Pipeline
          <Badge variant="secondary" className="ml-auto text-xs">
            {displayStats.activeNegotiations + displayStats.pendingOffers} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <MessageSquare className="w-3 h-3" />
              Active Negotiations
            </div>
            <p className="text-2xl font-bold">{displayStats.activeNegotiations}</p>
          </div>
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Clock className="w-3 h-3" />
              Pending Offers
            </div>
            <p className="text-2xl font-bold text-amber-600">{displayStats.pendingOffers}</p>
          </div>
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CheckCircle2 className="w-3 h-3" />
              Accepted Deals
            </div>
            <p className="text-2xl font-bold text-green-600">{displayStats.acceptedDeals}</p>
          </div>
          <div className="bg-background rounded-lg p-3 border">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="w-3 h-3" />
              Pipeline Value
            </div>
            <p className="text-2xl font-bold">${(displayStats.totalValue / 1000).toFixed(0)}K</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Pipeline Progress</span>
            <span>{pipelineProgress.toFixed(0)}% Complete</span>
          </div>
          <Progress value={pipelineProgress} className="h-2" />
        </div>

        <div className="flex gap-2">
          <Link href="/marketflow/investor/saved" className="flex-1">
            <Button variant="outline" size="sm" className="w-full" data-testid="link-saved-deals">
              <Eye className="w-3 h-3 mr-1" />
              Saved Deals
            </Button>
          </Link>
          <Link href="/marketflow/negotiations" className="flex-1">
            <Button variant="outline" size="sm" className="w-full" data-testid="link-negotiations">
              <MessageSquare className="w-3 h-3 mr-1" />
              Negotiations
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityTimeline() {
  const { isAuthenticated } = useSupabaseAuth();

  const { data: activities, isLoading } = useQuery<ActivityItem[]>({
    queryKey: ['/api/supabase/activity-timeline'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  const sampleActivities: ActivityItem[] = [
    {
      id: "1",
      type: "offer_sent",
      title: "Offer Submitted",
      description: "You submitted an offer on 123 Main St",
      dealId: "deal-1",
      dealAddress: "123 Main St",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      amount: 15000
    },
    {
      id: "2",
      type: "counter_offer",
      title: "Counter-Offer Received",
      description: "Seller countered on 456 Oak Ave",
      dealId: "deal-2",
      dealAddress: "456 Oak Ave",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      amount: 18000
    },
    {
      id: "3",
      type: "deal_saved",
      title: "Deal Saved",
      description: "You saved 789 Pine Rd to your collection",
      dealId: "deal-3",
      dealAddress: "789 Pine Rd",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5)
    },
    {
      id: "4",
      type: "accepted",
      title: "Offer Accepted!",
      description: "Your offer on 321 Elm St was accepted",
      dealId: "deal-4",
      dealAddress: "321 Elm St",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      amount: 12500
    }
  ];

  const displayActivities = activities || sampleActivities;

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "offer_sent": return <ArrowRight className="w-3 h-3" />;
      case "offer_received": return <MessageSquare className="w-3 h-3" />;
      case "counter_offer": return <MessageSquare className="w-3 h-3 text-amber-500" />;
      case "accepted": return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case "rejected": return <AlertCircle className="w-3 h-3 text-red-500" />;
      case "deal_saved": return <Home className="w-3 h-3 text-blue-500" />;
      case "message": return <MessageSquare className="w-3 h-3" />;
      case "jv_request": return <Handshake className="w-3 h-3 text-purple-500" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "accepted": return "border-green-500 bg-green-50 dark:bg-green-900/20";
      case "rejected": return "border-red-500 bg-red-50 dark:bg-red-900/20";
      case "counter_offer": return "border-amber-500 bg-amber-50 dark:bg-amber-900/20";
      default: return "border-muted";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="activity-timeline">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px]">
          <div className="space-y-3 pr-4">
            {displayActivities.map((activity, index) => (
              <div 
                key={activity.id} 
                className={`relative flex gap-3 p-2 rounded-lg border ${getActivityColor(activity.type)}`}
                data-testid={`activity-item-${activity.id}`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                  {activity.amount && (
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      ${activity.amount.toLocaleString()}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function SmartNotificationToast({ 
  type, 
  dealAddress, 
  amount,
  onView 
}: { 
  type: "counter_offer" | "accepted" | "new_deal"; 
  dealAddress: string;
  amount?: number;
  onView?: () => void;
}) {
  const getConfig = () => {
    switch (type) {
      case "counter_offer":
        return {
          icon: <MessageSquare className="w-4 h-4 text-amber-500" />,
          title: "Counter-Offer Received!",
          bgClass: "bg-amber-50 dark:bg-amber-900/30 border-amber-200"
        };
      case "accepted":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
          title: "Offer Accepted!",
          bgClass: "bg-green-50 dark:bg-green-900/30 border-green-200"
        };
      case "new_deal":
        return {
          icon: <Sparkles className="w-4 h-4 text-primary" />,
          title: "New Deal Matching Your Criteria!",
          bgClass: "bg-primary/10 border-primary/30"
        };
      default:
        return {
          icon: <Activity className="w-4 h-4" />,
          title: "Update",
          bgClass: ""
        };
    }
  };

  const config = getConfig();

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${config.bgClass}`}>
      <div className="shrink-0 mt-0.5">
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{config.title}</p>
        <p className="text-xs text-muted-foreground truncate">{dealAddress}</p>
        {amount && (
          <Badge variant="secondary" className="mt-1 text-[10px]">
            ${amount.toLocaleString()}
          </Badge>
        )}
      </div>
      {onView && (
        <Button size="sm" variant="outline" onClick={onView}>
          View
        </Button>
      )}
    </div>
  );
}
