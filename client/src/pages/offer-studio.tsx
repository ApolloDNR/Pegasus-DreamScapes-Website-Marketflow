import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { usePeggyContext } from "@/contexts/peggy-context";
import { OfferStudio, type OfferStudioData } from "@/components/offer-studio";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  AlertCircle
} from "lucide-react";

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
  const { profile } = useSupabaseAuth();
  const { setDealContext } = usePeggyContext();
  const [studioOpen, setStudioOpen] = useState(true);

  const dealType = params?.dealType;
  const dealId = params?.dealId;

  const { data: capitalProject, isLoading } = useQuery<CapitalProject>({
    queryKey: ["/api/capital-projects", dealId],
    enabled: dealType === "capital" && !!dealId,
  });

  useEffect(() => {
    if (dealType === "capital" && dealId) {
      setDealContext("capital", Number(dealId));
    }
  }, [dealType, dealId, setDealContext]);

  if (!dealType || !dealId || dealType !== "capital") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Deal Type</h2>
            <p className="text-muted-foreground mb-4">
              Offer Studio is only available for capital raise projects. For wholesale deals, please use the standard offer form.
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

  if (!capitalProject) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This capital project could not be found. It may have been removed or is no longer available.
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

  const dealInfo = {
    id: capitalProject.id,
    propertyAddress: capitalProject.title || capitalProject.address || "Capital Project",
    askingPrice: capitalProject.fundingGoal || 0,
    arv: undefined,
    repairCost: undefined,
    wholesalerName: capitalProject.operatorName,
    lockedTerms: undefined,
  };

  const handleSubmit = async (data: OfferStudioData) => {
    try {
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
      
      toast({
        title: "Investment Submitted!",
        description: "Your investment commitment has been sent. We'll notify you when the operator responds.",
      });
      setLocation("/marketflow/deals");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit investment",
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
