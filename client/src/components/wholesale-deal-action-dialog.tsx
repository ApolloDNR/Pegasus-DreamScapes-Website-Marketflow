import { useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  onSuccess?: () => void;
}

type DialogStep = "overview" | "form";

export function WholesaleDealActionDialog({
  open,
  onOpenChange,
  deal,
  actionType,
  onSuccess,
}: WholesaleDealActionDialogProps) {
  const { toast } = useToast();
  const { isAuthenticated, user } = useSupabaseAuth();
  const [step, setStep] = useState<DialogStep>("overview");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [partnershipType, setPartnershipType] = useState<"acquisition" | "funding" | "disposition">("acquisition");
  const [investAmount, setInvestAmount] = useState("");
  const [equityPercent, setEquityPercent] = useState("");
  const [profitSplit, setProfitSplit] = useState("70/30");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setStep("overview");
      setPartnershipType("acquisition");
      setInvestAmount("");
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
      const title = actionType === "jv_request" ? "JV Request Sent" : "Offer Submitted";
      const description = actionType === "jv_request"
        ? "Your partnership request has been sent to the wholesaler."
        : "Your investment offer has been submitted for review.";
      
      toast({ title, description });
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/jv-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/wholesale-deals"] });
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

    setIsSubmitting(true);

    const payload = {
      dealId: deal.id,
      type: actionType,
      partnershipType: actionType === "jv_request" ? partnershipType : undefined,
      proposedAmount: investAmount ? parseFloat(investAmount) : undefined,
      equityPercent: equityPercent ? parseFloat(equityPercent) : undefined,
      profitSplit,
      notes,
    };

    submitMutation.mutate(payload, {
      onSettled: () => setIsSubmitting(false),
    });
  };

  const isJVRequest = actionType === "jv_request";
  const dialogTitle = isJVRequest ? "Request JV Partnership" : "Make Investment Offer";
  const dialogDescription = isJVRequest
    ? `Partner with the wholesaler on ${deal.propertyAddress}`
    : `Submit an offer on ${deal.propertyAddress}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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

        {step === "overview" ? (
          <div className="space-y-4">
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
                      {formatCurrency(dealMetrics.totalInvestment)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Potential Profit</span>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(dealMetrics.potentialProfit)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spread</span>
                    <div className="font-semibold">{dealMetrics.spreadPercent.toFixed(0)}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Est. ROI</span>
                    <div className="font-semibold">{dealMetrics.roi.toFixed(0)}%</div>
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
              onClick={() => setStep("overview")}
              className="mb-2"
              data-testid="button-back-to-overview"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Overview
            </Button>

            {isJVRequest ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Partnership Type</Label>
                  <RadioGroup
                    value={partnershipType}
                    onValueChange={(v) => setPartnershipType(v as any)}
                    className="mt-2 space-y-2"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="acquisition" id="acquisition" />
                      <Label htmlFor="acquisition" className="text-sm cursor-pointer">
                        Co-Acquisition Partner
                        <span className="block text-xs text-muted-foreground">
                          Split the acquisition and share the deal
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="funding" id="funding" />
                      <Label htmlFor="funding" className="text-sm cursor-pointer">
                        Funding Partner
                        <span className="block text-xs text-muted-foreground">
                          Provide capital for a share of profits
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="disposition" id="disposition" />
                      <Label htmlFor="disposition" className="text-sm cursor-pointer">
                        Disposition Partner
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
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Offer Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter your offer amount"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    data-testid="input-offer-amount"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current asking: {formatCurrency(deal.askingPrice)}
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
            )}

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder={
                  isJVRequest
                    ? "Describe your experience, what you bring to the partnership..."
                    : "Contingencies, timeline preferences, financing details..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                data-testid="input-notes"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("overview")}
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
                {isJVRequest ? "Send JV Request" : "Submit Offer"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
