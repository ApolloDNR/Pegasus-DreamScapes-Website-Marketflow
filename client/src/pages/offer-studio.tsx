import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { usePeggyContext } from "@/contexts/peggy-context";
import { OfferStudio, type OfferStudioData } from "@/components/offer-studio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Sparkles, 
  Building2,
  DollarSign,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

type DealType = "wholesale" | "capital";

interface WholesaleDeal {
  id: string;
  propertyAddress?: string;
  address?: string;
  city?: string;
  state?: string;
  askingPrice?: number;
  contractPrice?: number;
  assignmentFee?: number;
  arv?: number;
  repairEstimate?: number;
  estimatedRepairs?: number;
  closingDate?: string;
  propertyType?: string;
  wholesalerName?: string;
  lockedTerms?: {
    minEarnestMoney?: number;
    maxInspectionDays?: number;
    maxCloseDays?: number;
    acceptedStructures?: string[];
  };
}

interface CapitalProject {
  id: number;
  title?: string;
  address?: string;
  city?: string;
  state?: string;
  fundingGoal?: number;
  minInvestment?: number;
  amountRaised?: number;
  structure?: string;
  askingInterestRate?: string;
  askingProfitSplit?: string;
  holdPeriod?: string;
  operatorName?: string;
}

export default function OfferStudioPage() {
  const [, params] = useRoute("/offer-studio/:dealType/:dealId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, profile } = useSupabaseAuth();
  const { setDealContext } = usePeggyContext();
  const [studioOpen, setStudioOpen] = useState(true);

  const dealType = params?.dealType as DealType;
  const dealId = params?.dealId;

  const { data: wholesaleDeal, isLoading: wholesaleLoading } = useQuery<WholesaleDeal>({
    queryKey: ["/api/wholesale-deals", dealId],
    enabled: dealType === "wholesale" && !!dealId,
  });

  const { data: capitalProject, isLoading: capitalLoading } = useQuery<CapitalProject>({
    queryKey: ["/api/capital-projects", dealId],
    enabled: dealType === "capital" && !!dealId,
  });

  useEffect(() => {
    if (dealType && dealId) {
      setDealContext(dealType as 'capital' | 'wholesale', Number(dealId));
    }
  }, [dealType, dealId, setDealContext]);

  const isLoading = dealType === "wholesale" ? wholesaleLoading : capitalLoading;
  const deal = dealType === "wholesale" ? wholesaleDeal : capitalProject;

  if (!dealType || !dealId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Deal</h2>
            <p className="text-muted-foreground mb-4">
              This deal could not be found. It may have been removed or the link is incorrect.
            </p>
            <Link href="/marketflow/deals">
              <Button data-testid="button-back-to-deals">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deals
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-4 w-1/2 mx-auto mb-6" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Deal Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This deal could not be found. It may have been removed or is no longer available.
            </p>
            <Link href="/marketflow/deals">
              <Button data-testid="button-back-to-deals-notfound">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deals
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dealInfo = dealType === "wholesale" ? {
    id: (wholesaleDeal as WholesaleDeal).id,
    propertyAddress: (wholesaleDeal as WholesaleDeal).propertyAddress || (wholesaleDeal as WholesaleDeal).address || "Property",
    askingPrice: (wholesaleDeal as WholesaleDeal).askingPrice || (wholesaleDeal as WholesaleDeal).contractPrice || 0,
    arv: (wholesaleDeal as WholesaleDeal).arv,
    repairCost: (wholesaleDeal as WholesaleDeal).repairEstimate || (wholesaleDeal as WholesaleDeal).estimatedRepairs,
    wholesalerName: (wholesaleDeal as WholesaleDeal).wholesalerName,
    lockedTerms: (wholesaleDeal as WholesaleDeal).lockedTerms,
  } : {
    id: (capitalProject as CapitalProject).id,
    propertyAddress: (capitalProject as CapitalProject).title || (capitalProject as CapitalProject).address || "Project",
    askingPrice: (capitalProject as CapitalProject).fundingGoal || 0,
    arv: undefined,
    repairCost: undefined,
    wholesalerName: (capitalProject as CapitalProject).operatorName,
    lockedTerms: undefined,
  };

  const handleSubmit = async (data: OfferStudioData) => {
    try {
      if (dealType === "wholesale") {
        await apiRequest("POST", "/api/supabase/wholesale-offers", {
          dealId,
          assignmentFee: data.offerPrice,
          earnestMoney: data.earnestMoney,
          closingDate: data.closeDate,
          inspectionPeriod: data.inspectionPeriod,
          structureType: data.structureType,
          fundingSource: data.fundingSource,
          contingencies: data.contingencies,
          notes: data.notes,
          userId: profile?.id,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/wholesale-deals"] });
        queryClient.invalidateQueries({ queryKey: ["/api/supabase/wholesale-offers"] });
      } else {
        await apiRequest("POST", "/api/supabase/capital-commitments", {
          projectId: Number(dealId),
          amount: data.offerPrice,
          structureType: data.structureType,
          equityPercentage: data.equityPercentage,
          preferredReturn: data.preferredReturn,
          notes: data.notes,
          userId: profile?.id,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/capital-projects"] });
        queryClient.invalidateQueries({ queryKey: ["/api/supabase/capital-commitments"] });
      }
      
      toast({
        title: "Offer Submitted!",
        description: "Your offer has been sent. We'll notify you when the seller responds.",
      });
      setLocation("/marketflow/deals");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit offer",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setStudioOpen(false);
    setLocation("/marketflow/deals");
  };

  return (
    <OfferStudio
      open={studioOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      mode="new"
      dealInfo={dealInfo}
      onSubmit={handleSubmit}
    />
  );
}
