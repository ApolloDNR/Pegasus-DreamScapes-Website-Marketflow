import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Brain, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Eye,
  Star,
  Zap,
  ChevronRight
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CuratedDeal {
  id: string;
  title: string;
  address?: string;
  matchScore: number;
  aiReason: string;
  confidence: number;
  dealType: "wholesale" | "capital" | "listing";
  highlights: string[];
  riskFactors: string[];
  expectedROI?: number;
  urgency?: "low" | "medium" | "high";
}

interface CurationPreferences {
  investmentStyle: "conservative" | "moderate" | "aggressive";
  preferredTypes: string[];
  targetROI: number;
  maxBudget: number;
  preferredLocations: string[];
}

export function AIDealCuration({ 
  userId,
  onViewDeal 
}: { 
  userId?: string;
  onViewDeal: (dealId: string, dealType: string) => void;
}) {
  const queryClient = useQueryClient();
  const [showPreferences, setShowPreferences] = useState(false);

  const { data: curatedDeals, isLoading, refetch } = useQuery<CuratedDeal[]>({
    queryKey: ["/api/ai/curated-deals", userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ dealId, feedback }: { dealId: string; feedback: "helpful" | "not_helpful" }) => {
      return apiRequest("POST", "/api/ai/curation-feedback", { dealId, feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/curated-deals"] });
    },
  });

  if (!userId) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Brain className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Sign in to get AI-powered deal recommendations tailored to your preferences
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI Picks for You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-20 w-24 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI Picks for You
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => refetch()}
              data-testid="button-refresh-curation"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Personalized recommendations based on your activity and preferences
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {curatedDeals && curatedDeals.length > 0 ? (
          curatedDeals.slice(0, 5).map((deal) => (
            <CuratedDealCard
              key={deal.id}
              deal={deal}
              onView={() => onViewDeal(deal.id, deal.dealType)}
              onFeedback={(feedback) => 
                feedbackMutation.mutate({ dealId: deal.id, feedback })
              }
            />
          ))
        ) : (
          <div className="text-center py-6">
            <Target className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Browse more deals to get personalized recommendations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CuratedDealCard({
  deal,
  onView,
  onFeedback,
}: {
  deal: CuratedDeal;
  onView: () => void;
  onFeedback: (feedback: "helpful" | "not_helpful") => void;
}) {
  const urgencyColors = {
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div 
      className="group p-4 rounded-lg border bg-card hover-elevate cursor-pointer transition-all"
      onClick={onView}
      data-testid={`card-curated-deal-${deal.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{deal.title}</h4>
            <Badge variant="outline" className="text-xs">
              {deal.dealType}
            </Badge>
          </div>
          {deal.address && (
            <p className="text-sm text-muted-foreground">{deal.address}</p>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-amber-600">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold">{deal.matchScore}%</span>
          </div>
          <span className="text-xs text-muted-foreground">match</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-purple-500" />
        <p className="text-sm text-muted-foreground flex-1">{deal.aiReason}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {deal.highlights.slice(0, 3).map((highlight, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            {highlight}
          </Badge>
        ))}
        {deal.urgency && (
          <Badge className={urgencyColors[deal.urgency]}>
            {deal.urgency === "high" ? "Act Fast" : deal.urgency === "medium" ? "Good Timing" : "No Rush"}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">
            {Math.round(deal.confidence * 100)}% confidence
          </span>
          <Progress value={deal.confidence * 100} className="w-16 h-1.5" />
        </div>
        
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onFeedback("helpful")}
            data-testid={`button-feedback-helpful-${deal.id}`}
          >
            <ThumbsUp className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onFeedback("not_helpful")}
            data-testid={`button-feedback-not-helpful-${deal.id}`}
          >
            <ThumbsDown className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7">
            <Eye className="w-3 h-3 mr-1" />
            View
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CurationInsightsBadge({ 
  insightCount 
}: { 
  insightCount: number;
}) {
  if (insightCount === 0) return null;

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
      <Sparkles className="w-3 h-3" />
      {insightCount} AI picks
    </div>
  );
}
