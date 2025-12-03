import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  ArrowRight,
  ArrowLeftRight,
  Check,
  X,
  Clock,
  DollarSign,
  Percent,
  TrendingUp,
  MessageSquare,
  Scale,
  Loader2,
  AlertCircle,
  ArrowRightLeft,
  Send,
} from "lucide-react";

interface DealNegotiation {
  id: number;
  dealType: string;
  dealId: number;
  initiatorId: string;
  responderId: string;
  structureType: string;
  proposedInterestRate?: string;
  proposedLoanTerm?: string;
  proposedLTV?: number;
  proposedPoints?: string;
  proposedEquityPercent?: number;
  proposedPreferredReturn?: string;
  proposedProfitSplit?: string;
  proposedVestingSchedule?: string;
  proposedAmount?: number;
  proposedHoldPeriod?: string;
  exitStrategy?: string;
  notes?: string;
  isCounterOffer?: boolean;
  parentNegotiationId?: number;
  status: string;
  expiresAt?: string;
  respondedAt?: string;
  createdAt: string;
}

interface NegotiationHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  negotiationId: number;
  dealTitle: string;
}

export function NegotiationHistoryDialog({
  open,
  onOpenChange,
  negotiationId,
  dealTitle,
}: NegotiationHistoryProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [counterOfferOpen, setCounterOfferOpen] = useState(false);
  const [counterOfferType, setCounterOfferType] = useState<"debt" | "equity">("debt");
  const [counterOfferAmount, setCounterOfferAmount] = useState("");
  const [counterOfferNotes, setCounterOfferNotes] = useState("");
  const [debtTerms, setDebtTerms] = useState({
    interestRate: "",
    loanTerm: "",
    ltv: "",
    points: "",
  });
  const [equityTerms, setEquityTerms] = useState({
    equityPercent: "",
    preferredReturn: "",
    profitSplit: "",
    holdPeriod: "",
  });

  const { data: thread, isLoading } = useQuery<DealNegotiation[]>({
    queryKey: ["/api/negotiations", negotiationId, "thread"],
    enabled: open && negotiationId > 0,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("POST", `/api/negotiations/${id}/respond`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/negotiations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-negotiations"] });
      toast({ title: "Response submitted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to respond to offer",
        variant: "destructive",
      });
    },
  });

  const counterOfferMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return apiRequest("POST", "/api/negotiations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/negotiations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-negotiations"] });
      setCounterOfferOpen(false);
      resetCounterOfferForm();
      toast({ title: "Counter-offer submitted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit counter-offer",
        variant: "destructive",
      });
    },
  });

  const resetCounterOfferForm = () => {
    setCounterOfferAmount("");
    setCounterOfferNotes("");
    setDebtTerms({ interestRate: "", loanTerm: "", ltv: "", points: "" });
    setEquityTerms({ equityPercent: "", preferredReturn: "", profitSplit: "", holdPeriod: "" });
  };

  const handleAccept = (id: number) => {
    respondMutation.mutate({ id, status: "accepted" });
  };

  const handleDecline = (id: number) => {
    respondMutation.mutate({ id, status: "declined" });
  };

  const handleSubmitCounter = () => {
    if (!thread || thread.length === 0) return;

    const latestOffer = thread[thread.length - 1];
    const rootNegotiation = thread[0];

    const counterData: Record<string, unknown> = {
      dealType: rootNegotiation.dealType,
      dealId: rootNegotiation.dealId,
      responderId: latestOffer.initiatorId,
      structureType: counterOfferType,
      proposedAmount: counterOfferAmount ? Number(counterOfferAmount) : undefined,
      notes: counterOfferNotes || undefined,
      isCounterOffer: true,
      parentNegotiationId: rootNegotiation.id,
    };

    if (counterOfferType === "debt") {
      counterData.proposedInterestRate = debtTerms.interestRate || undefined;
      counterData.proposedLoanTerm = debtTerms.loanTerm || undefined;
      counterData.proposedLTV = debtTerms.ltv ? Number(debtTerms.ltv) : undefined;
      counterData.proposedPoints = debtTerms.points || undefined;
    } else {
      counterData.proposedEquityPercent = equityTerms.equityPercent ? Number(equityTerms.equityPercent) : undefined;
      counterData.proposedPreferredReturn = equityTerms.preferredReturn || undefined;
      counterData.proposedProfitSplit = equityTerms.profitSplit || undefined;
      counterData.proposedHoldPeriod = equityTerms.holdPeriod || undefined;
    }

    counterOfferMutation.mutate(counterData);
    respondMutation.mutate({ id: latestOffer.id, status: "countered" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case "declined":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <X className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        );
      case "countered":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <ArrowRightLeft className="w-3 h-3 mr-1" />
            Countered
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderOfferTerms = (offer: DealNegotiation) => {
    if (offer.structureType === "debt") {
      return (
        <div className="grid grid-cols-2 gap-3 text-sm">
          {offer.proposedAmount && (
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <span className="ml-2 font-medium">{formatCurrency(offer.proposedAmount)}</span>
            </div>
          )}
          {offer.proposedInterestRate && (
            <div>
              <span className="text-muted-foreground">Interest Rate:</span>
              <span className="ml-2 font-medium">{offer.proposedInterestRate}</span>
            </div>
          )}
          {offer.proposedLoanTerm && (
            <div>
              <span className="text-muted-foreground">Loan Term:</span>
              <span className="ml-2 font-medium">{offer.proposedLoanTerm}</span>
            </div>
          )}
          {offer.proposedLTV && (
            <div>
              <span className="text-muted-foreground">LTV:</span>
              <span className="ml-2 font-medium">{offer.proposedLTV}%</span>
            </div>
          )}
          {offer.proposedPoints && (
            <div>
              <span className="text-muted-foreground">Points:</span>
              <span className="ml-2 font-medium">{offer.proposedPoints}</span>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-2 gap-3 text-sm">
          {offer.proposedAmount && (
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <span className="ml-2 font-medium">{formatCurrency(offer.proposedAmount)}</span>
            </div>
          )}
          {offer.proposedEquityPercent && (
            <div>
              <span className="text-muted-foreground">Equity:</span>
              <span className="ml-2 font-medium">{offer.proposedEquityPercent}%</span>
            </div>
          )}
          {offer.proposedPreferredReturn && (
            <div>
              <span className="text-muted-foreground">Preferred Return:</span>
              <span className="ml-2 font-medium">{offer.proposedPreferredReturn}</span>
            </div>
          )}
          {offer.proposedProfitSplit && (
            <div>
              <span className="text-muted-foreground">Profit Split:</span>
              <span className="ml-2 font-medium">{offer.proposedProfitSplit}</span>
            </div>
          )}
          {offer.proposedHoldPeriod && (
            <div>
              <span className="text-muted-foreground">Hold Period:</span>
              <span className="ml-2 font-medium">{offer.proposedHoldPeriod}</span>
            </div>
          )}
        </div>
      );
    }
  };

  const latestOffer = thread && thread.length > 0 ? thread[thread.length - 1] : null;
  const canRespond = latestOffer && latestOffer.status === "pending" && user && latestOffer.responderId === user.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Negotiation History
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{dealTitle}</p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !thread || thread.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No negotiation found</h3>
            <p className="text-muted-foreground">This negotiation may have been removed.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              {thread.map((offer, index) => {
                const isFromMe = user && offer.initiatorId === user.id;
                const isOriginal = !offer.isCounterOffer;

                return (
                  <Card
                    key={offer.id}
                    className={`relative ${isFromMe ? "ml-8 border-primary/30" : "mr-8 border-muted"}`}
                    data-testid={`negotiation-offer-${offer.id}`}
                  >
                    <div
                      className={`absolute top-4 ${isFromMe ? "-left-6" : "-right-6"}`}
                    >
                      {isFromMe ? (
                        <ArrowRight className="w-4 h-4 text-primary" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-muted-foreground transform rotate-180" />
                      )}
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Badge variant={offer.structureType === "debt" ? "outline" : "secondary"}>
                            {offer.structureType === "debt" ? (
                              <>
                                <DollarSign className="w-3 h-3 mr-1" />
                                Debt
                              </>
                            ) : (
                              <>
                                <Percent className="w-3 h-3 mr-1" />
                                Equity
                              </>
                            )}
                          </Badge>
                          {isOriginal ? (
                            <Badge variant="secondary">Initial Offer</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Counter #{index}
                            </Badge>
                          )}
                        </div>
                        {getStatusBadge(offer.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isFromMe ? "You" : "Other Party"} •{" "}
                        {format(new Date(offer.createdAt), "MMM d, yyyy h:mm a")}
                      </p>
                    </CardHeader>

                    <CardContent className="pt-2">
                      {renderOfferTerms(offer)}

                      {offer.exitStrategy && (
                        <div className="mt-3 text-sm">
                          <span className="text-muted-foreground">Exit Strategy:</span>
                          <span className="ml-2">{offer.exitStrategy}</span>
                        </div>
                      )}

                      {offer.notes && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <MessageSquare className="w-3 h-3" />
                            Notes
                          </div>
                          <p className="text-sm">{offer.notes}</p>
                        </div>
                      )}

                      {offer.respondedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Responded: {format(new Date(offer.respondedAt), "MMM d, yyyy h:mm a")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {canRespond && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4" />
                    Respond to Offer
                  </h4>
                  {!counterOfferOpen ? (
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        onClick={() => handleAccept(latestOffer.id)}
                        disabled={respondMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-accept-offer"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept Offer
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDecline(latestOffer.id)}
                        disabled={respondMutation.isPending}
                        data-testid="button-decline-offer"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCounterOfferType(latestOffer.structureType as "debt" | "equity");
                          setCounterOfferOpen(true);
                        }}
                        disabled={respondMutation.isPending}
                        data-testid="button-counter-offer"
                      >
                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                        Counter Offer
                      </Button>
                    </div>
                  ) : (
                    <Card className="border-primary/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Scale className="w-4 h-4" />
                          Submit Counter Offer
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Tabs
                          value={counterOfferType}
                          onValueChange={(v) => setCounterOfferType(v as "debt" | "equity")}
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="debt" data-testid="tab-counter-debt">
                              <DollarSign className="w-4 h-4 mr-2" />
                              Debt
                            </TabsTrigger>
                            <TabsTrigger value="equity" data-testid="tab-counter-equity">
                              <Percent className="w-4 h-4 mr-2" />
                              Equity
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="debt" className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Investment Amount</Label>
                                <Input
                                  type="number"
                                  placeholder="$100,000"
                                  value={counterOfferAmount}
                                  onChange={(e) => setCounterOfferAmount(e.target.value)}
                                  data-testid="input-counter-amount"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Interest Rate</Label>
                                <Input
                                  placeholder="8%"
                                  value={debtTerms.interestRate}
                                  onChange={(e) =>
                                    setDebtTerms({ ...debtTerms, interestRate: e.target.value })
                                  }
                                  data-testid="input-counter-interest"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Loan Term</Label>
                                <Input
                                  placeholder="12 months"
                                  value={debtTerms.loanTerm}
                                  onChange={(e) =>
                                    setDebtTerms({ ...debtTerms, loanTerm: e.target.value })
                                  }
                                  data-testid="input-counter-term"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>LTV %</Label>
                                <Input
                                  type="number"
                                  placeholder="70"
                                  value={debtTerms.ltv}
                                  onChange={(e) =>
                                    setDebtTerms({ ...debtTerms, ltv: e.target.value })
                                  }
                                  data-testid="input-counter-ltv"
                                />
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="equity" className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Investment Amount</Label>
                                <Input
                                  type="number"
                                  placeholder="$100,000"
                                  value={counterOfferAmount}
                                  onChange={(e) => setCounterOfferAmount(e.target.value)}
                                  data-testid="input-counter-amount-equity"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Equity %</Label>
                                <Input
                                  type="number"
                                  placeholder="25"
                                  value={equityTerms.equityPercent}
                                  onChange={(e) =>
                                    setEquityTerms({ ...equityTerms, equityPercent: e.target.value })
                                  }
                                  data-testid="input-counter-equity"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Preferred Return</Label>
                                <Input
                                  placeholder="8%"
                                  value={equityTerms.preferredReturn}
                                  onChange={(e) =>
                                    setEquityTerms({ ...equityTerms, preferredReturn: e.target.value })
                                  }
                                  data-testid="input-counter-pref"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Profit Split</Label>
                                <Input
                                  placeholder="70/30"
                                  value={equityTerms.profitSplit}
                                  onChange={(e) =>
                                    setEquityTerms({ ...equityTerms, profitSplit: e.target.value })
                                  }
                                  data-testid="input-counter-split"
                                />
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>

                        <div className="space-y-2">
                          <Label>Notes (optional)</Label>
                          <Textarea
                            placeholder="Add any additional terms or comments..."
                            value={counterOfferNotes}
                            onChange={(e) => setCounterOfferNotes(e.target.value)}
                            data-testid="textarea-counter-notes"
                          />
                        </div>

                        <div className="flex gap-3 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCounterOfferOpen(false);
                              resetCounterOfferForm();
                            }}
                            data-testid="button-cancel-counter"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSubmitCounter}
                            disabled={counterOfferMutation.isPending}
                            data-testid="button-submit-counter"
                          >
                            {counterOfferMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4 mr-2" />
                            )}
                            Submit Counter
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function NegotiationCard({
  negotiation,
  onViewHistory,
}: {
  negotiation: DealNegotiation;
  onViewHistory: (id: number) => void;
}) {
  const { user } = useAuth();
  const isFromMe = user && negotiation.initiatorId === user.id;
  const isPending = negotiation.status === "pending";
  const canRespond = isPending && !isFromMe;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case "declined":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <X className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        );
      case "countered":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <ArrowRightLeft className="w-3 h-3 mr-1" />
            Countered
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`negotiation-card-${negotiation.id}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={negotiation.structureType === "debt" ? "outline" : "secondary"}>
              {negotiation.structureType === "debt" ? (
                <>
                  <DollarSign className="w-3 h-3 mr-1" />
                  Debt
                </>
              ) : (
                <>
                  <Percent className="w-3 h-3 mr-1" />
                  Equity
                </>
              )}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {negotiation.dealType.replace("_", " ")} #{negotiation.dealId}
            </span>
          </div>
          {getStatusBadge(negotiation.status)}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          {negotiation.proposedAmount && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{formatCurrency(negotiation.proposedAmount)}</span>
            </div>
          )}
          {negotiation.proposedInterestRate && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span>{negotiation.proposedInterestRate}</span>
            </div>
          )}
          {negotiation.proposedEquityPercent && (
            <div className="flex items-center gap-1">
              <Percent className="w-4 h-4 text-muted-foreground" />
              <span>{negotiation.proposedEquityPercent}% equity</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {isFromMe ? "You sent" : "Received"} •{" "}
            {format(new Date(negotiation.createdAt), "MMM d, yyyy")}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewHistory(negotiation.id)}
            data-testid={`button-view-history-${negotiation.id}`}
          >
            {canRespond && <Badge className="mr-2 bg-primary">Action Needed</Badge>}
            View Details
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
