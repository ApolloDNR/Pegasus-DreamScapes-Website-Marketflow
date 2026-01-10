import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

interface TrackEventParams {
  activityType: "view" | "save" | "offer" | "message" | "share" | "click";
  resourceType: "deal" | "project" | "listing" | "user" | "page";
  resourceId: number;
  metadata?: Record<string, any>;
}

export function useAnalytics() {
  const { isAuthenticated } = useSupabaseAuth();

  const trackMutation = useMutation({
    mutationFn: async (params: TrackEventParams) => {
      if (!isAuthenticated) {
        return null;
      }
      return apiRequest("POST", "/api/analytics/track", params);
    },
    onError: (error) => {
      console.error("Analytics tracking failed:", error);
    },
  });

  const trackEvent = (params: TrackEventParams) => {
    if (!isAuthenticated) return;
    trackMutation.mutate(params);
  };

  const trackDealView = (dealId: number, dealType: string = "wholesale") => {
    trackEvent({
      activityType: "view",
      resourceType: "deal",
      resourceId: dealId,
      metadata: { dealType },
    });
  };

  const trackDealSave = (dealId: number, dealType: string = "wholesale") => {
    trackEvent({
      activityType: "save",
      resourceType: "deal",
      resourceId: dealId,
      metadata: { dealType },
    });
  };

  const trackOffer = (dealId: number, offerAmount?: number) => {
    trackEvent({
      activityType: "offer",
      resourceType: "deal",
      resourceId: dealId,
      metadata: { offerAmount },
    });
  };

  const trackProjectView = (projectId: number) => {
    trackEvent({
      activityType: "view",
      resourceType: "project",
      resourceId: projectId,
    });
  };

  const trackListingView = (listingId: number) => {
    trackEvent({
      activityType: "view",
      resourceType: "listing",
      resourceId: listingId,
    });
  };

  return {
    trackEvent,
    trackDealView,
    trackDealSave,
    trackOffer,
    trackProjectView,
    trackListingView,
    isTracking: trackMutation.isPending,
    canTrack: isAuthenticated,
  };
}
