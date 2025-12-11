import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NegotiationTimeline, NegotiationEvent, NegotiationStatus } from "./negotiation-timeline";
import {
  Handshake,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Send,
  ArrowLeft,
  Loader2,
  Users,
  Building2,
  FileText,
  Percent,
  Calculator,
  History,
  MessageCircle,
} from "lucide-react";

interface WholesaleDeal {
  id: string;
  propertyAddress: string;
  city?: string;
  state?: string;
  askingPrice?: number;
  arv?: number;
  estimatedRepairs?: number;
  assignmentFee?: number;
  contractPrice?: number;
  closingDate?: string;
  propertyType?: string;
  strategy?: string;
  status?: string;
}

interface WholesaleDealActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: WholesaleDeal;
  actionType: "jv_request" | "invest";
  existingOfferId?: string;
  onSuccess?: () => void;
}

type DialogStep = "overview" | "form" | "history";

export function WholesaleDealActionDialog({
  open,
  onOpenChange,
  deal,
  actionType,
  existingOfferId,
  onSuccess,
}: WholesaleDealActionDialogProps) {
  const { toast } = useToast();
  const { isAuthenticated, user, profile } = useSupabaseAuth();
  const [step, setStep] = useState<DialogStep>("overview");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCounterMode, setIsCounterMode] = useState(false);

  const [partnershipType, setPartnershipType] = useState<"acquisition" | "funding" | "disposition">("acquisition");
  const [offerAmount, setOfferAmount] = useState("");
  const [equityPercent, setEquityPercent] = useState("");
  const [profitSplit, setProfitSplit] = useState("70/30");
  const [notes, setNotes] = useState("");

  const { data: negotiationHistory = [] } = useQuery<NegotiationEvent[]>({
    queryKey: ["/api/supabase/wholesale-deals", deal.id, "negotiations"],
    enabled: open && !!deal.id,
  });

  const { data: existingOffer } = useQuery<{ status?: NegotiationStatus } | null>({
    queryKey: ["/api/supabase/wholesale-offers", existingOfferId],
    enabled: open && !!existingOfferId,
  });

  useEffect(() => {
    if (open) {
      setStep("overview");
      setIsCounterMode(false);
      setPartnershipType("acquisition");
      setOfferAmount("");
      setEquityPercent("");
      setProfitSplit("70/30");
      setNotes("");
    }
  }, [open, deal.id]);

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const dealMetrics = useMemo(() => {
    const askingPrice = deal.askingPrice || 0;
    const arv = deal.arv || 0;
    const repairs = deal.estimatedRepairs || 0;
    const assignmentFee = deal.assignmentFee || 0;

    const totalInvestment = askingPrice + repairs + assignmentFee;
    const potentialProfit = arv - totalInvestment;
    const spreadPercent = arv > 0 ? ((arv - askingPrice) / arv) * 100 : 0;
    const roi = totalInvestment > 0 ? (potentialProfit / totalInvestment) * 100 : 0;

    return {
      totalInvestment,
      potentialProfit,
      spreadPercent,
      roi,
    };
  }, [deal]);

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = actionType === "jv_request" 
        ? "/api/supabase/jv-requests" 
        : "/api/supabase/wholesale-offers";
      const res = await apiRequest("POST", endpoint, data);
      return res.json();
    },
    onSuccess: () => {
      const title = isCounterMode 
        ? "Counter-Offer Sent" 
        : actionType === "jv_request" 
          ? "JV Request Sent" 
          : "Offer Submitted";
      const description = isCounterMode
        ? "Your counter-offer has been sent for review."
        : actionType === "jv_request"
          ? "Your partnership request has been sent to the wholesaler."
          : "Your investment offer has been submitted for review.";
      
      toast({ title, description });
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/jv-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/wholesale-deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/wholesale-offers"] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit your request.",
        variant: "default",
      });
      return;
    }

    if (actionType === "invest" && !offerAmount) {
      toast({
        title: "Amount required",
        description: "Please enter an offer amount.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      dealId: deal.id,
      type: actionType,
      isCounter: isCounterMode,
      parentOfferId: existingOfferId,
      partnershipType: actionType === "jv_request" ? partnershipType : undefined,
      offerAmount: offerAmount ? parseFloat(offerAmount) : undefined,
      equityPercent: equityPercent ? parseFloat(equityPercent) : undefined,
      profitSplit,
      notes,
    };

    submitMutation.mutate(payload, {
      onSettled: () => setIsSubmitting(false),
    });
  };

  const handleCounterOffer = () => {
    setIsCounterMode(true);
    setStep("form");
  };

  const isJVRequest = actionType === "jv_request";
  const dialogTitle = isCounterMode 
    ? "Counter-Offer" 
    : isJVRequest 
      ? "Request JV Partnership" 
      : "Make Investment Offer";
  const dialogDescription = isCounterMode
    ? `Submit a counter-offer on ${deal.propertyAddress}`
    : isJVRequest
      ? `Partner with the wholesaler on ${deal.propertyAddress}`
      : `Submit an offer on ${deal.propertyAddress}`;

  const hasNegotiationHistory = negotiationHistory.length > 0;
  const currentStatus: NegotiationStatus = existingOffer?.status || "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isJVRequest ? (
              <Handshake className="w-5 h-5 text-primary" />
            ) : (
              <DollarSign className="w-5 h-5 text-green-600" />
            )}
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {hasNegotiationHistory && step === "overview" ? (
          <Tabs defaultValue="deal" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="deal" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Deal Details
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Negotiation ({negotiationHistory.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deal" className="mt-4">
              <DealOverview 
                deal={deal} 
                metrics={dealMetrics} 
                isJVRequest={isJVRequest}
                formatCurrency={formatCurrency}
              />
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCounterOffer}
                  data-testid="button-counter-offer"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Counter-Offer
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <NegotiationTimeline
                events={negotiationHistory}
                currentStatus={currentStatus}
                canCounter={currentStatus === "counter_offered" || currentStatus === "pending"}
                onCounter={handleCounterOffer}
              />
            </TabsContent>
          </Tabs>
        ) : step === "overview" ? (
          <div className="space-y-4">
            <DealOverview 
              deal={deal} 
              metrics={dealMetrics} 
              isJVRequest={isJVRequest}
              formatCurrency={formatCurrency}
            />
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep("form")}
                data-testid="button-proceed-to-form"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isJVRequest ? "Request Partnership" : "Make Offer"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep("overview");
                setIsCounterMode(false);
              }}
              className="mb-2"
              data-testid="button-back-to-overview"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Overview
            </Button>

            {isCounterMode && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-4">
                <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  You're submitting a counter-offer. Enter your proposed terms below.
                </p>
              </div>
            )}

            {isJVRequest ? (
              <JVRequestForm
                partnershipType={partnershipType}
                setPartnershipType={setPartnershipType}
                equityPercent={equityPercent}
                setEquityPercent={setEquityPercent}
                profitSplit={profitSplit}
                setProfitSplit={setProfitSplit}
              />
            ) : (
              <InvestOfferForm
                offerAmount={offerAmount}
                setOfferAmount={setOfferAmount}
                equityPercent={equityPercent}
                setEquityPercent={setEquityPercent}
                profitSplit={profitSplit}
                setProfitSplit={setProfitSplit}
                askingPrice={deal.askingPrice}
                formatCurrency={formatCurrency}
              />
            )}

            <div>
              <Label htmlFor="notes">
                {isCounterMode ? "Counter-Offer Notes" : "Additional Notes"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  isCounterMode
                    ? "Explain your counter-offer terms, timeline, or conditions..."
                    : isJVRequest
                      ? "Describe your experience, what you bring to the partnership..."
                      : "Contingencies, timeline preferences, financing details..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                data-testid="input-notes"
              />
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep("overview");
                  setIsCounterMode(false);
                }}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={isSubmitting}
                data-testid="button-submit-request"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isCounterMode 
                  ? "Send Counter-Offer" 
                  : isJVRequest 
                    ? "Send JV Request" 
                    : "Submit Offer"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DealOverview({ 
  deal, 
  metrics, 
  isJVRequest, 
  formatCurrency 
}: { 
  deal: WholesaleDeal; 
  metrics: { totalInvestment: number; potentialProfit: number; spreadPercent: number; roi: number };
  isJVRequest: boolean;
  formatCurrency: (amount: number | undefined | null) => string;
}) {
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Deal Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <span className="font-semibold">{deal.propertyAddress}</span>
            {deal.city && deal.state && (
              <span className="text-muted-foreground ml-1">
                {deal.city}, {deal.state}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Asking Price</span>
              <div className="font-semibold">{formatCurrency(deal.askingPrice)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">ARV</span>
              <div className="font-semibold">{formatCurrency(deal.arv)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Est. Repairs</span>
              <div className="font-semibold">{formatCurrency(deal.estimatedRepairs)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Assignment Fee</span>
              <div className="font-semibold">{formatCurrency(deal.assignmentFee)}</div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Total Investment</span>
              <div className="font-semibold text-primary">
                {formatCurrency(metrics.totalInvestment)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Potential Profit</span>
              <div className="font-semibold text-green-600">
                {formatCurrency(metrics.potentialProfit)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Spread</span>
              <div className="font-semibold">{metrics.spreadPercent.toFixed(0)}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Est. ROI</span>
              <div className="font-semibold">{metrics.roi.toFixed(0)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isJVRequest && (
        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-primary" />
            Partnership Benefits
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Access to off-market opportunities</li>
            <li>Split acquisition costs and risks</li>
            <li>Leverage combined expertise</li>
            <li>Build long-term deal flow relationships</li>
          </ul>
        </div>
      )}
    </>
  );
}

function JVRequestForm({
  partnershipType,
  setPartnershipType,
  equityPercent,
  setEquityPercent,
  profitSplit,
  setProfitSplit,
}: {
  partnershipType: "acquisition" | "funding" | "disposition";
  setPartnershipType: (v: "acquisition" | "funding" | "disposition") => void;
  equityPercent: string;
  setEquityPercent: (v: string) => void;
  profitSplit: string;
  setProfitSplit: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Partnership Type</Label>
        <RadioGroup
          value={partnershipType}
          onValueChange={(v) => setPartnershipType(v as any)}
          className="mt-2 space-y-2"
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover-elevate cursor-pointer">
            <RadioGroupItem value="acquisition" id="acquisition" />
            <Label htmlFor="acquisition" className="text-sm cursor-pointer flex-1">
              <span className="font-medium">Co-Acquisition Partner</span>
              <span className="block text-xs text-muted-foreground">
                Split the acquisition and share the deal
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover-elevate cursor-pointer">
            <RadioGroupItem value="funding" id="funding" />
            <Label htmlFor="funding" className="text-sm cursor-pointer flex-1">
              <span className="font-medium">Funding Partner</span>
              <span className="block text-xs text-muted-foreground">
                Provide capital for a share of profits
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover-elevate cursor-pointer">
            <RadioGroupItem value="disposition" id="disposition" />
            <Label htmlFor="disposition" className="text-sm cursor-pointer flex-1">
              <span className="font-medium">Disposition Partner</span>
              <span className="block text-xs text-muted-foreground">
                Help market and sell the property
              </span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="equity">Equity Stake (%)</Label>
          <Input
            id="equity"
            type="number"
            placeholder="e.g. 50"
            value={equityPercent}
            onChange={(e) => setEquityPercent(e.target.value)}
            data-testid="input-equity-percent"
          />
        </div>
        <div>
          <Label htmlFor="split">Profit Split</Label>
          <Input
            id="split"
            placeholder="e.g. 50/50"
            value={profitSplit}
            onChange={(e) => setProfitSplit(e.target.value)}
            data-testid="input-profit-split"
          />
        </div>
      </div>
    </div>
  );
}

function InvestOfferForm({
  offerAmount,
  setOfferAmount,
  equityPercent,
  setEquityPercent,
  profitSplit,
  setProfitSplit,
  askingPrice,
  formatCurrency,
}: {
  offerAmount: string;
  setOfferAmount: (v: string) => void;
  equityPercent: string;
  setEquityPercent: (v: string) => void;
  profitSplit: string;
  setProfitSplit: (v: string) => void;
  askingPrice: number | undefined;
  formatCurrency: (amount: number | undefined | null) => string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="amount">Offer Amount ($)</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="amount"
            type="number"
            placeholder="Enter your offer amount"
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            className="pl-10"
            data-testid="input-offer-amount"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Current asking: {formatCurrency(askingPrice)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="equity-offer">Equity Stake (%)</Label>
          <Input
            id="equity-offer"
            type="number"
            placeholder="Optional"
            value={equityPercent}
            onChange={(e) => setEquityPercent(e.target.value)}
            data-testid="input-equity-percent"
          />
        </div>
        <div>
          <Label htmlFor="split-offer">Proposed Split</Label>
          <Input
            id="split-offer"
            placeholder="e.g. 70/30"
            value={profitSplit}
            onChange={(e) => setProfitSplit(e.target.value)}
            data-testid="input-profit-split"
          />
        </div>
      </div>
    </div>
  );
}
