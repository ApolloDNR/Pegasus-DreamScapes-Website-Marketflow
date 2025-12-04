import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DollarSign,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Send,
  ArrowRight,
  ArrowLeft,
  Target,
  Clock,
  Percent,
  AlertTriangle,
  Building2,
  Loader2,
  Zap,
  Calculator
} from "lucide-react";

interface CapitalProject {
  id: number;
  title: string;
  description?: string;
  location?: string;
  fundingGoal: number;
  amountRaised: number;
  minInvestment: number;
  structure?: string;
  projectedReturn?: string;
  holdPeriod?: string;
  status: string;
  askingInterestRate?: string;
  askingLoanDuration?: string;
  askingEquityPercent?: string;
  askingProfitSplit?: string;
  images?: string[];
  projectedProfit?: number;
}

interface InvestmentOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: CapitalProject;
  onSuccess?: () => void;
}

type DialogStep = "choose" | "form";

export function InvestmentOfferDialog({ 
  open, 
  onOpenChange, 
  project, 
  onSuccess 
}: InvestmentOfferDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<DialogStep>("choose");
  const [isAcceptingTerms, setIsAcceptingTerms] = useState(false);
  
  const [investAmount, setInvestAmount] = useState("");
  const [investStructure, setInvestStructure] = useState<"equity" | "debt" | "hybrid">("equity");
  const [investRole, setInvestRole] = useState("LP");
  const [proposedEquity, setProposedEquity] = useState("");
  const [proposedProfitSplit, setProposedProfitSplit] = useState("70/30");
  const [proposedInterest, setProposedInterest] = useState("");
  const [proposedLoanDuration, setProposedLoanDuration] = useState("");
  const [investNotes, setInvestNotes] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasDebtTerms = project.askingInterestRate || project.askingLoanDuration;
  const hasEquityTerms = project.askingEquityPercent || project.askingProfitSplit;
  const hasOperatorTerms = hasDebtTerms || hasEquityTerms;

  const parseRate = (rateStr?: string): number => {
    if (!rateStr) return 0;
    const match = rateStr.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const parseMonths = (durationStr?: string): number => {
    if (!durationStr) return 12;
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 12;
  };

  const dynamicROI = useMemo(() => {
    const principal = parseFloat(investAmount) || 0;
    if (principal <= 0) return null;

    const isDebt = investStructure === "debt" || (isAcceptingTerms && hasDebtTerms && !hasEquityTerms);
    const isEquity = investStructure === "equity" || (isAcceptingTerms && hasEquityTerms && !hasDebtTerms);

    if (isDebt) {
      const rate = parseRate(isAcceptingTerms ? project.askingInterestRate : proposedInterest);
      const months = parseMonths(isAcceptingTerms ? project.askingLoanDuration : proposedLoanDuration);
      const totalInterest = principal * (rate / 100) * (months / 12);
      const monthlyInterest = months > 0 ? totalInterest / months : 0;
      const totalPayout = principal + totalInterest;
      return {
        type: "debt",
        principal,
        totalInterest,
        monthlyInterest,
        totalPayout,
        roi: principal > 0 ? (totalInterest / principal) * 100 : 0,
        termMonths: months,
        rate,
      };
    }

    if (isEquity) {
      const projectedProfit = project.projectedProfit || 0;
      const profitSplit = (isAcceptingTerms ? project.askingProfitSplit : proposedProfitSplit) || "70/30";
      const investorSplitPercent = parseInt(profitSplit.split("/")[0]) || 70;
      const investorShareOfRaise = principal / (project.fundingGoal || 1);
      const estimatedProfit = projectedProfit * (investorSplitPercent / 100) * investorShareOfRaise;
      return {
        type: "equity",
        principal,
        totalInterest: estimatedProfit,
        monthlyInterest: 0,
        totalPayout: principal + estimatedProfit,
        roi: principal > 0 ? (estimatedProfit / principal) * 100 : 0,
        termMonths: 0,
        rate: 0,
      };
    }

    return null;
  }, [investAmount, investStructure, isAcceptingTerms, hasDebtTerms, hasEquityTerms, proposedInterest, proposedLoanDuration, proposedProfitSplit, project]);

  const resetForm = () => {
    setInvestAmount("");
    setInvestStructure("equity");
    setInvestRole("LP");
    setProposedEquity("");
    setProposedProfitSplit("70/30");
    setProposedLoanDuration("");
    setProposedInterest("");
    setInvestNotes("");
    setStep("choose");
    setIsAcceptingTerms(false);
  };

  const handleAcceptTerms = () => {
    setIsAcceptingTerms(true);
    
    if (hasDebtTerms && hasEquityTerms) {
      setInvestStructure("hybrid");
    } else if (hasDebtTerms) {
      setInvestStructure("debt");
    } else {
      setInvestStructure("equity");
    }
    
    setInvestAmount(String(project.minInvestment));
    
    if (hasDebtTerms) {
      setProposedInterest(project.askingInterestRate || "");
      setProposedLoanDuration(project.askingLoanDuration || "");
    }
    
    if (hasEquityTerms) {
      setProposedEquity(project.askingEquityPercent || "");
      setProposedProfitSplit(project.askingProfitSplit || "70/30");
    }
    
    setInvestNotes("Accepting operator's asking terms.");
    setStep("form");
  };

  const handleCounterOffer = () => {
    setIsAcceptingTerms(false);
    setStep("form");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const submitOfferMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/investment-offers", {
        projectId: project.id,
        amountOffered: parseInt(investAmount),
        structureType: investStructure,
        requestedRole: investRole,
        proposedEquityPercent: proposedEquity || undefined,
        proposedProfitSplit: proposedProfitSplit || undefined,
        proposedInterestRate: proposedInterest || undefined,
        proposedLoanDuration: proposedLoanDuration || undefined,
        notes: investNotes || undefined,
        isAcceptingOperatorTerms: isAcceptingTerms,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/capital-projects", project.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-investment-offers"] });
      toast({
        title: isAcceptingTerms ? "Terms Accepted" : "Offer Submitted",
        description: isAcceptingTerms 
          ? "You've agreed to the operator's terms. They will be notified." 
          : "Your investment offer has been sent to the project creator.",
      });
      handleClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit offer",
        variant: "destructive",
      });
    },
  });

  const buildSeekingStatement = () => {
    const parts = [];
    
    if (project.fundingGoal) {
      parts.push(`${formatCurrency(project.fundingGoal)}`);
    }
    
    if (hasDebtTerms) {
      if (project.askingInterestRate) {
        parts.push(`at ${project.askingInterestRate} interest`);
      }
      if (project.askingLoanDuration) {
        parts.push(`for ${project.askingLoanDuration}`);
      }
    } else if (hasEquityTerms) {
      if (project.askingEquityPercent) {
        parts.push(`for ${project.askingEquityPercent}% equity`);
      }
      if (project.askingProfitSplit) {
        parts.push(`with ${project.askingProfitSplit} profit split`);
      }
    }
    
    return parts.join(" ");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        {step === "choose" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Invest in {project.title}
              </DialogTitle>
              <DialogDescription>
                Choose how you'd like to invest in this opportunity
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6">
              {/* Project Summary */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-amber-500/5 border">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {project.images?.[0] ? (
                    <img src={project.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-primary/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{project.location}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    <span className="text-green-600 font-medium">{project.projectedReturn} target</span>
                    <span className="text-muted-foreground">{project.holdPeriod}</span>
                  </div>
                </div>
              </div>

              {/* Operator's Terms Display */}
              {hasOperatorTerms && (
                <Card className="bg-green-500/5 border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-600" />
                      Operator's Asking Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {project.askingInterestRate && (
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg text-center">
                          <Percent className="w-4 h-4 mx-auto text-green-600 mb-1" />
                          <p className="text-xs text-muted-foreground">Interest Rate</p>
                          <p className="font-bold text-green-600">{project.askingInterestRate}</p>
                        </div>
                      )}
                      {project.askingLoanDuration && (
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg text-center">
                          <Clock className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-bold">{project.askingLoanDuration}</p>
                        </div>
                      )}
                      {project.askingEquityPercent && (
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg text-center">
                          <TrendingUp className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                          <p className="text-xs text-muted-foreground">Equity</p>
                          <p className="font-bold text-blue-600">{project.askingEquityPercent}%</p>
                        </div>
                      )}
                      {project.askingProfitSplit && (
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg text-center">
                          <DollarSign className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                          <p className="text-xs text-muted-foreground">Profit Split</p>
                          <p className="font-bold">{project.askingProfitSplit}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {hasOperatorTerms && (
                  <Button 
                    onClick={handleAcceptTerms}
                    className="w-full h-14 text-base bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    data-testid="button-accept-operator-terms"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Accept Terms & Invest
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
                
                <Button 
                  variant={hasOperatorTerms ? "outline" : "default"}
                  onClick={handleCounterOffer}
                  className={`w-full h-14 text-base ${!hasOperatorTerms ? "bg-gradient-to-r from-primary to-amber-600" : ""}`}
                  data-testid="button-make-counter-offer"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {hasOperatorTerms ? "Counter-Offer" : "Submit Investment Offer"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {hasOperatorTerms && (
                <p className="text-xs text-center text-muted-foreground">
                  Accepting terms will invest {formatCurrency(project.minInvestment)} at the operator's requested rates
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setStep("choose")}
                  className="shrink-0"
                  data-testid="button-back-to-choose"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    {isAcceptingTerms ? "Accept Terms & Invest" : "Counter-Offer"}
                  </DialogTitle>
                  <DialogDescription>
                    {isAcceptingTerms 
                      ? "Review and confirm your investment at the operator's terms"
                      : "Customize your investment offer terms"
                    }
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Show summary when accepting terms */}
              {isAcceptingTerms && (
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-400">
                        You're accepting the operator's terms
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Investment Amount</p>
                        <p className="font-semibold">{formatCurrency(project.minInvestment)}</p>
                      </div>
                      {hasDebtTerms && project.askingInterestRate && (
                        <div>
                          <p className="text-muted-foreground text-xs">Interest Rate</p>
                          <p className="font-semibold text-green-600">{project.askingInterestRate}</p>
                        </div>
                      )}
                      {hasEquityTerms && project.askingEquityPercent && (
                        <div>
                          <p className="text-muted-foreground text-xs">Equity</p>
                          <p className="font-semibold text-blue-600">{project.askingEquityPercent}%</p>
                        </div>
                      )}
                      {project.askingProfitSplit && (
                        <div>
                          <p className="text-muted-foreground text-xs">Profit Split</p>
                          <p className="font-semibold">{project.askingProfitSplit}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Investment Amount and Role */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Investment Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder={`Min ${formatCurrency(project.minInvestment)}`}
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      className="pl-10"
                      disabled={isAcceptingTerms}
                      data-testid="input-invest-amount"
                    />
                  </div>
                  {parseInt(investAmount) > 0 && parseInt(investAmount) < project.minInvestment && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Below minimum investment
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Investment Role</Label>
                  <RadioGroup 
                    value={investRole} 
                    onValueChange={setInvestRole} 
                    className="flex gap-4"
                    disabled={isAcceptingTerms}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="LP" id="role-lp" />
                      <Label htmlFor="role-lp" className="font-normal text-sm cursor-pointer">LP</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="GP" id="role-gp" />
                      <Label htmlFor="role-gp" className="font-normal text-sm cursor-pointer">GP</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Dynamic ROI Preview */}
              {dynamicROI && (
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 animate-in fade-in-50 duration-200" data-testid="roi-preview">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-400">Your Projected Returns</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Principal</p>
                      <p className="font-bold">{formatCurrency(dynamicROI.principal)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{dynamicROI.type === "debt" ? "Interest Earned" : "Profit Share"}</p>
                      <p className="font-bold text-green-600">+{formatCurrency(dynamicROI.totalInterest)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Payout</p>
                      <p className="font-bold text-primary">{formatCurrency(dynamicROI.totalPayout)}</p>
                    </div>
                  </div>
                  {dynamicROI.type === "debt" && dynamicROI.monthlyInterest > 0 && (
                    <div className="mt-3 pt-3 border-t border-green-500/20">
                      <p className="text-xs text-center text-muted-foreground">
                        {formatCurrency(dynamicROI.monthlyInterest)}/month over {dynamicROI.termMonths} months ({dynamicROI.roi.toFixed(1)}% ROI)
                      </p>
                      <p className="text-xs text-center text-green-600 mt-1">
                        Formula: {formatCurrency(dynamicROI.principal)} x {dynamicROI.rate}% x ({dynamicROI.termMonths} / 12)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Investment Structure Selection - Only for counter-offers */}
              {!isAcceptingTerms && (
                <div className="space-y-3">
                  <Label>Investment Structure</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "equity", label: "Equity", icon: <TrendingUp className="w-4 h-4" />, desc: "Own a stake in the project" },
                      { value: "debt", label: "Debt", icon: <DollarSign className="w-4 h-4" />, desc: "Loan with fixed returns" },
                      { value: "hybrid", label: "Hybrid", icon: <Sparkles className="w-4 h-4" />, desc: "Equity + Debt combined" },
                    ].map((struct) => (
                      <button
                        key={struct.value}
                        type="button"
                        onClick={() => setInvestStructure(struct.value as any)}
                        className={`p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                          investStructure === struct.value 
                            ? "border-primary bg-primary/5" 
                            : "border-muted"
                        }`}
                        data-testid={`button-structure-${struct.value}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {struct.icon}
                          <span className="font-medium">{struct.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{struct.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Equity Terms */}
              {(investStructure === "equity" || investStructure === "hybrid") && !isAcceptingTerms && (
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Equity Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="equity-pct">Equity Percentage (%)</Label>
                        <Input
                          id="equity-pct"
                          placeholder="e.g., 10"
                          value={proposedEquity}
                          onChange={(e) => setProposedEquity(e.target.value)}
                          data-testid="input-proposed-equity"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Profit Split (You/Operator)</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {["50/50", "60/40", "70/30", "80/20", "90/10"].map((split) => (
                            <button
                              key={split}
                              type="button"
                              onClick={() => setProposedProfitSplit(split)}
                              className={`px-2.5 py-1.5 text-xs rounded-md border transition-all ${
                                proposedProfitSplit === split 
                                  ? "border-primary bg-primary/10 font-medium" 
                                  : "border-muted hover-elevate"
                              }`}
                              data-testid={`button-split-${split.replace("/", "-")}`}
                            >
                              {split}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Debt Terms */}
              {(investStructure === "debt" || investStructure === "hybrid") && !isAcceptingTerms && (
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      Debt Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                        <Input
                          id="interest-rate"
                          placeholder="e.g., 9%"
                          value={proposedInterest}
                          onChange={(e) => setProposedInterest(e.target.value)}
                          data-testid="input-proposed-interest"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loan-duration">Loan Duration</Label>
                        <Input
                          id="loan-duration"
                          placeholder="e.g., 12 months"
                          value={proposedLoanDuration}
                          onChange={(e) => setProposedLoanDuration(e.target.value)}
                          data-testid="input-loan-duration"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional terms, conditions, or questions..."
                  value={investNotes}
                  onChange={(e) => setInvestNotes(e.target.value)}
                  className="resize-none"
                  rows={3}
                  data-testid="input-invest-notes"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  className="flex-1"
                  data-testid="button-cancel-offer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => submitOfferMutation.mutate()}
                  disabled={!investAmount || parseInt(investAmount) < project.minInvestment || submitOfferMutation.isPending}
                  className={`flex-1 ${isAcceptingTerms ? "bg-gradient-to-r from-green-600 to-green-700" : ""}`}
                  data-testid="button-submit-offer"
                >
                  {submitOfferMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isAcceptingTerms ? (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isAcceptingTerms ? "Accept Terms & Invest" : "Counter-Offer"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
