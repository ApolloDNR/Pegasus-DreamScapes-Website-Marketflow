import { useCallback, useRef } from "react";
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
  const trackedRef = useRef<Set<string>>(new Set());

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

  const trackEvent = useCallback((params: TrackEventParams) => {
    if (!isAuthenticated) return;
    
    const key = `${params.activityType}-${params.resourceType}-${params.resourceId}`;
    if (trackedRef.current.has(key)) return;
    trackedRef.current.add(key);
    
    trackMutation.mutate(params);
  }, [isAuthenticated, trackMutation]);

  const trackDealView = useCallback((dealId: number, dealType: string = "wholesale") => {
    trackEvent({
      activityType: "view",
      resourceType: "deal",
      resourceId: dealId,
      metadata: { dealType },
    });
  }, [trackEvent]);

  const trackDealSave = useCallback((dealId: number, dealType: string = "wholesale") => {
    trackEvent({
      activityType: "save",
      resourceType: "deal",
      resourceId: dealId,
      metadata: { dealType },
    });
  }, [trackEvent]);

  const trackOffer = useCallback((dealId: number, offerAmount?: number) => {
    trackEvent({
      activityType: "offer",
      resourceType: "deal",
      resourceId: dealId,
      metadata: { offerAmount },
    });
  }, [trackEvent]);

  const trackProjectView = useCallback((projectId: number) => {
    trackEvent({
      activityType: "view",
      resourceType: "project",
      resourceId: projectId,
    });
  }, [trackEvent]);

  const trackListingView = useCallback((listingId: number) => {
    trackEvent({
      activityType: "view",
      resourceType: "listing",
      resourceId: listingId,
    });
  }, [trackEvent]);

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
