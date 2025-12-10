import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Percent, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  MessageSquare, 
  Check, 
  X as XIcon,
  Loader2,
  ArrowRight,
  History,
  Scale,
  Banknote,
  PiggyBank
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DealNegotiation {
  id: number;
  dealType: string;
  dealId: number;
  initiatorId: string;
  responderId: string;
  structureType: string;
  proposedEquityPercent?: number;
  proposedInterestRate?: string;
  proposedAmount?: number;
  proposedLoanTerm?: string;
  proposedPreferredReturn?: string;
  proposedProfitSplit?: string;
  proposedHoldPeriod?: string;
  exitStrategy?: string;
  notes?: string;
  status: string;
  createdAt: string;
  respondedAt?: string;
  isCounterOffer?: boolean;
  parentNegotiationId?: number;
}

interface DealNegotiationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealType: "capital_project" | "wholesale_deal";
  dealId: string | number;
  dealTitle: string;
  responderId: string;
  existingStructure?: string;
  onSuccess?: () => void;
}

export function DealNegotiationDialog({
  open,
  onOpenChange,
  dealType,
  dealId,
  dealTitle,
  responderId,
  existingStructure,
  onSuccess
}: DealNegotiationDialogProps) {
  const { toast } = useToast();
  const [structureType, setStructureType] = useState<"debt" | "equity" | "hybrid">(
    (existingStructure as "debt" | "equity" | "hybrid") || "equity"
  );
  
  const [equityPercent, setEquityPercent] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [amount, setAmount] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [preferredReturn, setPreferredReturn] = useState("");
  const [profitSplit, setProfitSplit] = useState("70/30");
  const [holdPeriod, setHoldPeriod] = useState("");
  const [exitStrategy, setExitStrategy] = useState("");
  const [notes, setNotes] = useState("");

  const { data: negotiations = [], isLoading: loadingNegotiations } = useQuery<DealNegotiation[]>({
    queryKey: ["/api/supabase/jv-requests"],
    enabled: open,
  });

  const createNegotiationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/supabase/jv-requests", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "JV Request Submitted",
        description: "Your JV request has been sent to the wholesaler.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/jv-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/wholesale-deals"] });
      resetForm();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit JV request",
        variant: "destructive",
      });
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/supabase/jv-requests/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Response Recorded",
        description: "Your response has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/jv-requests"] });
    },
  });

  const resetForm = () => {
    setEquityPercent("");
    setInterestRate("");
    setAmount("");
    setLoanTerm("");
    setPreferredReturn("");
    setProfitSplit("70/30");
    setHoldPeriod("");
    setExitStrategy("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (dealType === "capital_project") {
      toast({
        title: "Use Investment Dialog",
        description: "For capital project investments, please use the Investment dialog instead.",
        variant: "destructive",
      });
      return;
    }
    
    const messageParts = [
      `Structure: ${structureType}`,
      amount ? `Amount: $${amount}` : null,
      equityPercent ? `Equity: ${equityPercent}%` : null,
      interestRate ? `Interest: ${interestRate}%` : null,
      loanTerm ? `Term: ${loanTerm}` : null,
      preferredReturn ? `Preferred Return: ${preferredReturn}` : null,
      profitSplit ? `Profit Split: ${profitSplit}` : null,
      holdPeriod ? `Hold Period: ${holdPeriod}` : null,
      exitStrategy ? `Exit: ${exitStrategy}` : null,
      notes ? `Notes: ${notes}` : null,
    ].filter(Boolean);
    
    const messageText = messageParts.join(". ") || `Investment offer: ${structureType} structure`;

    const data = {
      dealId: String(dealId),
      wholesalerId: responderId,
      strategy: structureType,
      fundingSource: structureType === "debt" ? "private_lender" : "self_funded",
      proposedFee: amount ? parseInt(amount) : undefined,
      message: messageText,
    };

    createNegotiationMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
      case "accepted": return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
      case "declined": return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
      case "countered": return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Investment Negotiation
          </DialogTitle>
          <DialogDescription>
            Structure your investment offer for: {dealTitle}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="new-offer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new-offer" className="flex items-center gap-2" data-testid="tab-new-offer">
              <DollarSign className="w-4 h-4" />
              Make Offer
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2" data-testid="tab-history">
              <History className="w-4 h-4" />
              Negotiation History
              {negotiations.length > 0 && (
                <Badge variant="secondary" className="ml-1">{negotiations.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new-offer" className="mt-4">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Investment Structure</Label>
                  <RadioGroup 
                    value={structureType} 
                    onValueChange={(v) => setStructureType(v as "debt" | "equity" | "hybrid")}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="equity" id="equity" className="peer sr-only" />
                      <Label 
                        htmlFor="equity" 
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover-elevate cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <PiggyBank className="mb-3 h-6 w-6 text-emerald-600" />
                        <span className="text-sm font-medium">Equity</span>
                        <span className="text-xs text-muted-foreground text-center mt-1">
                          Own a share of the project
                        </span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="debt" id="debt" className="peer sr-only" />
                      <Label 
                        htmlFor="debt" 
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover-elevate cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Banknote className="mb-3 h-6 w-6 text-blue-600" />
                        <span className="text-sm font-medium">Debt</span>
                        <span className="text-xs text-muted-foreground text-center mt-1">
                          Lend with fixed returns
                        </span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="hybrid" id="hybrid" className="peer sr-only" />
                      <Label 
                        htmlFor="hybrid" 
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover-elevate cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Scale className="mb-3 h-6 w-6 text-purple-600" />
                        <span className="text-sm font-medium">Hybrid</span>
                        <span className="text-xs text-muted-foreground text-center mt-1">
                          Combine debt and equity
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="amount">Investment Amount ($)</Label>
                    <div className="relative mt-1.5">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="100,000"
                        className="pl-9"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        data-testid="input-amount"
                      />
                    </div>
                  </div>

                  {(structureType === "equity" || structureType === "hybrid") && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="equityPercent">Equity Percentage (%)</Label>
                          <div className="relative mt-1.5">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="equityPercent"
                              type="number"
                              placeholder="10"
                              className="pl-9"
                              value={equityPercent}
                              onChange={(e) => setEquityPercent(e.target.value)}
                              data-testid="input-equity-percent"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="preferredReturn">Preferred Return (%)</Label>
                          <div className="relative mt-1.5">
                            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="preferredReturn"
                              type="text"
                              placeholder="8%"
                              className="pl-9"
                              value={preferredReturn}
                              onChange={(e) => setPreferredReturn(e.target.value)}
                              data-testid="input-preferred-return"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="profitSplit">Profit Split (Investor/Operator)</Label>
                        <RadioGroup 
                          value={profitSplit} 
                          onValueChange={setProfitSplit}
                          className="flex flex-wrap gap-2 mt-1.5"
                        >
                          {["50/50", "55/45", "60/40", "65/35", "70/30", "75/25", "80/20", "85/15", "90/10"].map((split) => (
                            <div key={split}>
                              <RadioGroupItem value={split} id={`split-${split}`} className="peer sr-only" />
                              <Label 
                                htmlFor={`split-${split}`} 
                                className="flex items-center justify-center rounded-md border-2 border-muted bg-popover px-3 py-2 text-sm hover-elevate cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                              >
                                {split}
                              </Label>
                            </div>
                          ))}
                          <div>
                            <RadioGroupItem value="custom" id="split-custom" className="peer sr-only" />
                            <Label 
                              htmlFor="split-custom" 
                              className="flex items-center justify-center rounded-md border-2 border-muted bg-popover px-3 py-2 text-sm hover-elevate cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                            >
                              Custom
                            </Label>
                          </div>
                        </RadioGroup>
                        {profitSplit === "custom" && (
                          <Input
                            placeholder="e.g., 72/28"
                            className="mt-2"
                            onChange={(e) => setProfitSplit(e.target.value)}
                            data-testid="input-custom-profit-split"
                          />
                        )}
                      </div>
                    </>
                  )}

                  {(structureType === "debt" || structureType === "hybrid") && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="interestRate">Interest Rate (%)</Label>
                        <div className="relative mt-1.5">
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="interestRate"
                            type="text"
                            placeholder="10%"
                            className="pl-9"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            data-testid="input-interest-rate"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="loanTerm">Loan Term</Label>
                        <div className="relative mt-1.5">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="loanTerm"
                            type="text"
                            placeholder="12 months"
                            className="pl-9"
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(e.target.value)}
                            data-testid="input-loan-term"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="holdPeriod">Hold Period</Label>
                      <Input
                        id="holdPeriod"
                        type="text"
                        placeholder="18 months"
                        value={holdPeriod}
                        onChange={(e) => setHoldPeriod(e.target.value)}
                        data-testid="input-hold-period"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exitStrategy">Exit Strategy</Label>
                      <Input
                        id="exitStrategy"
                        type="text"
                        placeholder="Refinance, Sale, etc."
                        value={exitStrategy}
                        onChange={(e) => setExitStrategy(e.target.value)}
                        data-testid="input-exit-strategy"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Share any additional terms, conditions, or questions..."
                      className="mt-1.5 min-h-[100px]"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      data-testid="input-notes"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createNegotiationMutation.isPending || !amount}
                    data-testid="button-submit-offer"
                  >
                    {createNegotiationMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Submit Offer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ScrollArea className="h-[60vh]">
              {loadingNegotiations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : negotiations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No negotiations yet.</p>
                  <p className="text-sm">Make an offer to start negotiating.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {negotiations.map((neg) => (
                    <Card key={neg.id} className={neg.isCounterOffer ? "border-l-4 border-l-blue-500" : ""}>
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {neg.structureType}
                            </Badge>
                            <Badge className={getStatusColor(neg.status)}>
                              {neg.status}
                            </Badge>
                            {neg.isCounterOffer && (
                              <Badge variant="secondary">Counter-Offer</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(neg.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="py-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {neg.proposedAmount && (
                            <div>
                              <span className="text-muted-foreground">Amount</span>
                              <p className="font-semibold">{formatCurrency(neg.proposedAmount)}</p>
                            </div>
                          )}
                          {neg.proposedEquityPercent && (
                            <div>
                              <span className="text-muted-foreground">Equity</span>
                              <p className="font-semibold">{neg.proposedEquityPercent}%</p>
                            </div>
                          )}
                          {neg.proposedInterestRate && (
                            <div>
                              <span className="text-muted-foreground">Interest</span>
                              <p className="font-semibold">{neg.proposedInterestRate}</p>
                            </div>
                          )}
                          {neg.proposedPreferredReturn && (
                            <div>
                              <span className="text-muted-foreground">Pref. Return</span>
                              <p className="font-semibold">{neg.proposedPreferredReturn}</p>
                            </div>
                          )}
                          {neg.proposedProfitSplit && (
                            <div>
                              <span className="text-muted-foreground">Profit Split</span>
                              <p className="font-semibold">{neg.proposedProfitSplit}</p>
                            </div>
                          )}
                          {neg.proposedLoanTerm && (
                            <div>
                              <span className="text-muted-foreground">Term</span>
                              <p className="font-semibold">{neg.proposedLoanTerm}</p>
                            </div>
                          )}
                          {neg.proposedHoldPeriod && (
                            <div>
                              <span className="text-muted-foreground">Hold Period</span>
                              <p className="font-semibold">{neg.proposedHoldPeriod}</p>
                            </div>
                          )}
                          {neg.exitStrategy && (
                            <div>
                              <span className="text-muted-foreground">Exit</span>
                              <p className="font-semibold">{neg.exitStrategy}</p>
                            </div>
                          )}
                        </div>
                        {neg.notes && (
                          <p className="mt-3 text-sm text-muted-foreground border-t pt-3">
                            "{neg.notes}"
                          </p>
                        )}
                        {neg.status === "pending" && (
                          <div className="flex gap-2 mt-4 pt-3 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => respondMutation.mutate({ id: neg.id, status: "accepted" })}
                              disabled={respondMutation.isPending}
                              data-testid={`button-accept-${neg.id}`}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => respondMutation.mutate({ id: neg.id, status: "declined" })}
                              disabled={respondMutation.isPending}
                              data-testid={`button-decline-${neg.id}`}
                            >
                              <XIcon className="w-4 h-4 mr-1" />
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => respondMutation.mutate({ id: neg.id, status: "countered" })}
                              disabled={respondMutation.isPending}
                              data-testid={`button-counter-${neg.id}`}
                            >
                              <ArrowRight className="w-4 h-4 mr-1" />
                              Counter
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
