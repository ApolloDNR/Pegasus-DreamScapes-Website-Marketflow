import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

type ItemType = 'wholesale_deal' | 'capital_project' | 'listing' | 'article';

interface SavedItem {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_id: string;
  created_at: string;
}

interface JVRequest {
  id: string;
  deal_id: string;
  requester_id: string;
  wholesaler_id: string;
  strategy: string;
  funding_source?: string;
  proposed_fee?: number;
  message?: string;
  status: string;
  created_at: string;
}

interface CapitalCommitment {
  id: string;
  project_id: string;
  investor_id: string;
  amount: number;
  structure_preference?: string;
  notes?: string;
  status: string;
  created_at: string;
}

interface BuyerOffer {
  id: string;
  listing_id: string;
  buyer_id: string;
  offer_amount: number;
  financing_type?: string;
  contingencies?: string[];
  message?: string;
  status: string;
  created_at: string;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export function useSupabaseMarketplace() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useSupabaseAuth();

  const savedItemsQuery = useQuery<SavedItem[]>({
    queryKey: ['/api/supabase/saved-items'],
    enabled: isAuthenticated,
  });

  const notificationsQuery = useQuery<Notification[]>({
    queryKey: ['/api/supabase/notifications'],
    enabled: isAuthenticated,
  });

  const jvRequestsQuery = useQuery<JVRequest[]>({
    queryKey: ['/api/supabase/jv-requests'],
    enabled: isAuthenticated,
  });

  const capitalCommitmentsQuery = useQuery<CapitalCommitment[]>({
    queryKey: ['/api/supabase/capital-commitments'],
    enabled: isAuthenticated,
  });

  const buyerOffersQuery = useQuery<BuyerOffer[]>({
    queryKey: ['/api/supabase/buyer-offers'],
    enabled: isAuthenticated,
  });

  const saveItemMutation = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: ItemType; itemId: string }) => {
      return apiRequest("POST", "/api/supabase/saved-items", { itemType, itemId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/saved-items'] });
      toast({
        title: "Saved",
        description: "Item saved to your collection",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save item",
        variant: "destructive",
      });
    },
  });

  const unsaveItemMutation = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: ItemType; itemId: string }) => {
      return apiRequest("DELETE", "/api/supabase/saved-items", { itemType, itemId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/saved-items'] });
      toast({
        title: "Removed",
        description: "Item removed from your collection",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const createJVRequestMutation = useMutation({
    mutationFn: async (data: {
      dealId: string;
      wholesalerId: string;
      strategy: string;
      fundingSource?: string;
      proposedFee?: number;
      message?: string;
    }) => {
      return apiRequest("POST", "/api/supabase/jv-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/jv-requests'] });
      toast({
        title: "JV Request Submitted",
        description: "Your JV request has been sent to the wholesaler",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit JV request",
        variant: "destructive",
      });
    },
  });

  const createCapitalCommitmentMutation = useMutation({
    mutationFn: async (data: {
      projectId: string;
      amount: number;
      structurePreference?: string;
      notes?: string;
    }) => {
      return apiRequest("POST", "/api/supabase/capital-commitments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/capital-commitments'] });
      toast({
        title: "Commitment Submitted",
        description: "Your investment commitment has been submitted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit commitment",
        variant: "destructive",
      });
    },
  });

  const createBuyerOfferMutation = useMutation({
    mutationFn: async (data: {
      listingId: string;
      offerAmount: number;
      financingType?: string;
      contingencies?: string[];
      message?: string;
    }) => {
      return apiRequest("POST", "/api/supabase/buyer-offers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/buyer-offers'] });
      toast({
        title: "Offer Submitted",
        description: "Your offer has been submitted to the seller",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit offer",
        variant: "destructive",
      });
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/supabase/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/notifications'] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/supabase/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/notifications'] });
    },
  });

  const isItemSaved = (itemType: ItemType, itemId: string): boolean => {
    return savedItemsQuery.data?.some(
      item => item.item_type === itemType && item.item_id === itemId
    ) ?? false;
  };

  const toggleSaveItem = async (itemType: ItemType, itemId: string) => {
    if (isItemSaved(itemType, itemId)) {
      return unsaveItemMutation.mutateAsync({ itemType, itemId });
    } else {
      return saveItemMutation.mutateAsync({ itemType, itemId });
    }
  };

  return {
    savedItems: savedItemsQuery.data ?? [],
    savedItemsLoading: savedItemsQuery.isLoading,
    
    notifications: notificationsQuery.data ?? [],
    notificationsLoading: notificationsQuery.isLoading,
    unreadNotificationsCount: notificationsQuery.data?.filter(n => !n.is_read).length ?? 0,
    
    jvRequests: jvRequestsQuery.data ?? [],
    jvRequestsLoading: jvRequestsQuery.isLoading,
    
    capitalCommitments: capitalCommitmentsQuery.data ?? [],
    capitalCommitmentsLoading: capitalCommitmentsQuery.isLoading,
    
    buyerOffers: buyerOffersQuery.data ?? [],
    buyerOffersLoading: buyerOffersQuery.isLoading,
    
    isItemSaved,
    toggleSaveItem,
    saveItem: saveItemMutation.mutateAsync,
    unsaveItem: unsaveItemMutation.mutateAsync,
    isSaving: saveItemMutation.isPending || unsaveItemMutation.isPending,
    
    createJVRequest: createJVRequestMutation.mutateAsync,
    isCreatingJVRequest: createJVRequestMutation.isPending,
    
    createCapitalCommitment: createCapitalCommitmentMutation.mutateAsync,
    isCreatingCommitment: createCapitalCommitmentMutation.isPending,
    
    createBuyerOffer: createBuyerOfferMutation.mutateAsync,
    isCreatingOffer: createBuyerOfferMutation.isPending,
    
    markNotificationRead: markNotificationReadMutation.mutateAsync,
    markAllNotificationsRead: markAllNotificationsReadMutation.mutateAsync,
  };
}
