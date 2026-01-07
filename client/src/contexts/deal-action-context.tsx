import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

export type DealActionType = 
  | "assignment_offer"    
  | "wholesale_jv"        
  | "capital_raise"       
  | "capital_invest";     

export type DealCategory = "wholesale" | "capital";

interface DealActionState {
  isOpen: boolean;
  dealId: string | number | null;
  actionType: DealActionType | null;
  mode: "new" | "counter";
  existingOfferId?: string;
}

interface DealActionContextValue {
  openDealAction: (dealId: string | number, actionType: DealActionType, mode?: "new" | "counter", existingOfferId?: string) => void;
  openInStudio: (dealId: string | number, dealType: "wholesale" | "capital") => void;
  closeDealAction: () => void;
  state: DealActionState;
}

const DealActionContext = createContext<DealActionContextValue | null>(null);

export function useDealAction() {
  const context = useContext(DealActionContext);
  if (!context) {
    throw new Error("useDealAction must be used within a DealActionProvider");
  }
  return context;
}

interface DealActionProviderProps {
  children: ReactNode;
}

export function DealActionProvider({ children }: DealActionProviderProps) {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<DealActionState>({
    isOpen: false,
    dealId: null,
    actionType: null,
    mode: "new",
  });

  const openDealAction = useCallback((
    dealId: string | number, 
    actionType: DealActionType,
    mode: "new" | "counter" = "new",
    existingOfferId?: string
  ) => {
    setState({
      isOpen: true,
      dealId,
      actionType,
      mode,
      existingOfferId,
    });
  }, []);

  const openInStudio = useCallback((dealId: string | number, dealType: "wholesale" | "capital") => {
    setLocation(`/offer-studio/${dealType}/${dealId}`);
  }, [setLocation]);

  const closeDealAction = useCallback(() => {
    setState({
      isOpen: false,
      dealId: null,
      actionType: null,
      mode: "new",
    });
  }, []);

  return (
    <DealActionContext.Provider value={{ openDealAction, openInStudio, closeDealAction, state }}>
      {children}
      <DealActionModal />
    </DealActionContext.Provider>
  );
}

function DealActionModal() {
  const { state, closeDealAction } = useDealAction();
  const { isOpen, dealId, actionType, mode, existingOfferId } = state;

  if (!isOpen || !dealId || !actionType) return null;

  const isWholesale = actionType === "assignment_offer" || actionType === "wholesale_jv";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDealAction()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isWholesale ? (
          actionType === "assignment_offer" ? (
            <AssignmentOfferForm 
              dealId={String(dealId)} 
              mode={mode} 
              existingOfferId={existingOfferId}
              onClose={closeDealAction} 
            />
          ) : (
            <WholesaleJVForm 
              dealId={String(dealId)} 
              mode={mode}
              existingOfferId={existingOfferId}
              onClose={closeDealAction} 
            />
          )
        ) : (
          actionType === "capital_raise" ? (
            <CapitalRaiseTermsForm 
              projectId={Number(dealId)} 
              mode={mode}
              existingOfferId={existingOfferId}
              onClose={closeDealAction} 
            />
          ) : (
            <CapitalInvestmentForm 
              projectId={Number(dealId)} 
              mode={mode}
              existingOfferId={existingOfferId}
              onClose={closeDealAction} 
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

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
  strategy?: string;
  wholesalerId?: string;
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
  askingLoanDuration?: string;
  askingPreferredReturn?: string;
  holdPeriod?: string;
  operatorId?: string;
}

interface FormProps {
  dealId?: string;
  projectId?: number;
  mode: "new" | "counter";
  existingOfferId?: string;
  onClose: () => void;
}

function AssignmentOfferForm({ dealId, mode, existingOfferId, onClose }: FormProps) {
  const { toast } = useToast();
  const { isAuthenticated, profile } = useSupabaseAuth();
  const [assignmentFee, setAssignmentFee] = useState("");
  const [earnestMoney, setEarnestMoney] = useState("1000");
  const [closingDate, setClosingDate] = useState("");
  const [inspectionPeriod, setInspectionPeriod] = useState("10");
  const [message, setMessage] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: deal, isLoading: dealLoading } = useQuery<WholesaleDeal>({
    queryKey: ["/api/wholesale-deals", dealId],
    enabled: !!dealId,
  });

  // Pre-populate form with deal data when loaded
  useEffect(() => {
    if (deal && !initialized) {
      if (deal.assignmentFee) {
        setAssignmentFee(String(deal.assignmentFee));
      }
      if (deal.closingDate) {
        setClosingDate(deal.closingDate);
      }
      setInitialized(true);
    }
  }, [deal, initialized]);

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/supabase/wholesale-offers", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: mode === "counter" ? "Counter-Offer Sent" : "Offer Submitted",
        description: mode === "counter" 
          ? "Your counter-offer has been sent for review."
          : "Your assignment offer has been submitted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wholesale-deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/wholesale-offers"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit offer",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in required", description: "Please sign in to make an offer." });
      return;
    }
    if (!assignmentFee) {
      toast({ title: "Assignment fee required", variant: "destructive" });
      return;
    }

    submitMutation.mutate({
      dealId,
      type: "assignment_offer",
      isCounter: mode === "counter",
      parentOfferId: existingOfferId,
      assignmentFee: parseFloat(assignmentFee),
      earnestMoney: parseFloat(earnestMoney) || 1000,
      closingDate: closingDate || undefined,
      inspectionPeriod: parseInt(inspectionPeriod) || 10,
      message,
    });
  };

  if (dealLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle data-testid="dialog-title-assignment-offer">
          {mode === "counter" ? "Counter-Offer" : "Assignment Offer"}
        </DialogTitle>
        <DialogDescription>
          {deal?.propertyAddress || deal?.address || "Property"}
          {deal?.city && deal?.state && ` - ${deal.city}, ${deal.state}`}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg text-sm">
          <div>
            <span className="text-muted-foreground">Contract Price:</span>
            <span className="ml-2 font-medium">{formatCurrency(deal?.contractPrice)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Listed Assignment:</span>
            <span className="ml-2 font-medium">{formatCurrency(deal?.assignmentFee)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">ARV:</span>
            <span className="ml-2 font-medium">{formatCurrency(deal?.arv)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Repairs:</span>
            <span className="ml-2 font-medium">{formatCurrency(deal?.repairEstimate || deal?.estimatedRepairs)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Your Assignment Fee Offer *</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                value={assignmentFee}
                onChange={(e) => setAssignmentFee(e.target.value)}
                placeholder={String(deal?.assignmentFee || 5000)}
                className="w-full pl-7 pr-3 py-2 border rounded-md"
                data-testid="input-assignment-fee"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Earnest Money Deposit</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                value={earnestMoney}
                onChange={(e) => setEarnestMoney(e.target.value)}
                placeholder="1000"
                className="w-full pl-7 pr-3 py-2 border rounded-md"
                data-testid="input-earnest-money"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Closing Date</label>
              <input
                type="date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-closing-date"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Inspection Period (days)</label>
              <input
                type="number"
                value={inspectionPeriod}
                onChange={(e) => setInspectionPeriod(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-inspection-period"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Message to Wholesaler</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add any notes or conditions..."
              className="w-full px-3 py-2 border rounded-md mt-1 min-h-[80px]"
              data-testid="input-offer-message"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel-offer">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitMutation.isPending}
              className="flex-1"
              data-testid="button-submit-assignment-offer"
            >
              {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === "counter" ? "Send Counter-Offer" : "Submit Offer"}
            </Button>
          </div>
          <Link href={`/offer-studio/wholesale/${dealId}`} onClick={onClose}>
            <Button variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-foreground" data-testid="button-continue-in-studio">
              <Sparkles className="w-4 h-4" />
              Continue in Offer Studio
              <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}

function WholesaleJVForm({ dealId, mode, existingOfferId, onClose }: FormProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useSupabaseAuth();
  const [partnerRole, setPartnerRole] = useState<"deal_bringer" | "buyer_bringer">("deal_bringer");
  const [assignmentSplit, setAssignmentSplit] = useState(50);
  const [contributions, setContributions] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const { data: deal, isLoading: dealLoading } = useQuery<WholesaleDeal>({
    queryKey: ["/api/wholesale-deals", dealId],
    enabled: !!dealId,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/supabase/jv-requests", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: mode === "counter" ? "Counter-Proposal Sent" : "JV Request Sent",
        description: "Your partnership request has been sent to the wholesaler.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wholesale-deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/jv-requests"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit JV request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in required", description: "Please sign in to request a JV partnership." });
      return;
    }

    submitMutation.mutate({
      dealId,
      type: "wholesale_jv",
      isCounter: mode === "counter",
      parentOfferId: existingOfferId,
      partnerRole,
      assignmentSplitPercent: assignmentSplit,
      contributions,
      message,
    });
  };

  if (dealLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  const contributionOptions = [
    "Buyer network access",
    "Marketing materials",
    "Due diligence support",
    "Earnest money funding",
    "Transaction coordination",
    "Legal/title support",
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle data-testid="dialog-title-jv-request">
          {mode === "counter" ? "Counter JV Proposal" : "Request JV Partnership"}
        </DialogTitle>
        <DialogDescription>
          Partner on: {deal?.propertyAddress || deal?.address || "Property"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg text-sm">
          <div>
            <span className="text-muted-foreground">Assignment Fee:</span>
            <span className="ml-2 font-medium">{formatCurrency(deal?.assignmentFee)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Your Share ({assignmentSplit}%):</span>
            <span className="ml-2 font-medium">
              {formatCurrency((deal?.assignmentFee || 0) * (assignmentSplit / 100))}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Your Role in Partnership</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setPartnerRole("deal_bringer")}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  partnerRole === "deal_bringer" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
                data-testid="button-role-deal-bringer"
              >
                <div className="font-medium text-sm">Deal Bringer</div>
                <div className="text-xs text-muted-foreground">I'm bringing this deal</div>
              </button>
              <button
                type="button"
                onClick={() => setPartnerRole("buyer_bringer")}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  partnerRole === "buyer_bringer" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
                data-testid="button-role-buyer-bringer"
              >
                <div className="font-medium text-sm">Buyer Bringer</div>
                <div className="text-xs text-muted-foreground">I have the buyer</div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Assignment Fee Split: {assignmentSplit}% / {100 - assignmentSplit}%</label>
            <input
              type="range"
              min="10"
              max="90"
              value={assignmentSplit}
              onChange={(e) => setAssignmentSplit(parseInt(e.target.value))}
              className="w-full mt-2"
              data-testid="slider-assignment-split"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Your share: {assignmentSplit}%</span>
              <span>Partner share: {100 - assignmentSplit}%</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Your Contributions</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {contributionOptions.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={contributions.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setContributions([...contributions, option]);
                      } else {
                        setContributions(contributions.filter((c) => c !== option));
                      }
                    }}
                    className="rounded"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Message to Wholesaler</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you'd be a great JV partner..."
              className="w-full px-3 py-2 border rounded-md mt-1 min-h-[80px]"
              data-testid="input-jv-message"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel-jv">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitMutation.isPending}
            className="flex-1"
            data-testid="button-submit-jv-request"
          >
            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === "counter" ? "Send Counter-Proposal" : "Request Partnership"}
          </Button>
        </div>
      </div>
    </>
  );
}

function CapitalRaiseTermsForm({ projectId, mode, existingOfferId, onClose }: FormProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useSupabaseAuth();
  const [capitalTarget, setCapitalTarget] = useState("");
  const [minInvestment, setMinInvestment] = useState("25000");
  const [structure, setStructure] = useState<"DEBT" | "EQUITY" | "HYBRID">("EQUITY");
  const [proposedReturn, setProposedReturn] = useState("15");
  const [profitSplit, setProfitSplit] = useState("70");
  const [timeline, setTimeline] = useState("24");
  const [message, setMessage] = useState("");

  const { data: project, isLoading: projectLoading } = useQuery<CapitalProject>({
    queryKey: ["/api/capital-projects", projectId],
    enabled: !!projectId,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/supabase/capital-raises", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: mode === "counter" ? "Updated Terms Submitted" : "Capital Raise Posted",
        description: "Your capital raise terms have been published.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/capital-projects"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit capital raise",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in required", description: "Please sign in to post a capital raise." });
      return;
    }
    if (!capitalTarget) {
      toast({ title: "Capital target required", variant: "destructive" });
      return;
    }

    submitMutation.mutate({
      projectId,
      type: "capital_raise",
      isCounter: mode === "counter",
      parentOfferId: existingOfferId,
      capitalTarget: parseFloat(capitalTarget),
      minInvestment: parseFloat(minInvestment) || 25000,
      structure,
      proposedReturn: parseFloat(proposedReturn),
      profitSplit: parseInt(profitSplit),
      timelineMonths: parseInt(timeline),
      message,
    });
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  const fundingProgress = project?.fundingGoal 
    ? ((project.amountRaised || 0) / project.fundingGoal) * 100 
    : 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle data-testid="dialog-title-capital-raise">
          {mode === "counter" ? "Update Raise Terms" : "Post Capital Raise"}
        </DialogTitle>
        <DialogDescription>
          {project?.title || "Capital Project"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        {project && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>Funding Progress</span>
              <span className="font-medium">{formatCurrency(project.amountRaised)} / {formatCurrency(project.fundingGoal)}</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${Math.min(fundingProgress, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Capital Target *</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                value={capitalTarget}
                onChange={(e) => setCapitalTarget(e.target.value)}
                placeholder={String(project?.fundingGoal || 500000)}
                className="w-full pl-7 pr-3 py-2 border rounded-md"
                data-testid="input-capital-target"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Minimum Investment</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                value={minInvestment}
                onChange={(e) => setMinInvestment(e.target.value)}
                placeholder="25000"
                className="w-full pl-7 pr-3 py-2 border rounded-md"
                data-testid="input-min-investment"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Investment Structure</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(["DEBT", "EQUITY", "HYBRID"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStructure(s)}
                  className={`p-2 border rounded-lg text-sm transition-colors ${
                    structure === s 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid={`button-structure-${s.toLowerCase()}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Proposed Return (%)</label>
              <input
                type="number"
                value={proposedReturn}
                onChange={(e) => setProposedReturn(e.target.value)}
                placeholder="15"
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-proposed-return"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Profit Split (Investor %)</label>
              <input
                type="number"
                value={profitSplit}
                onChange={(e) => setProfitSplit(e.target.value)}
                placeholder="70"
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-profit-split"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Timeline (months)</label>
            <input
              type="number"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="24"
              className="w-full px-3 py-2 border rounded-md mt-1"
              data-testid="input-timeline-months"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Project Description</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the investment opportunity..."
              className="w-full px-3 py-2 border rounded-md mt-1 min-h-[80px]"
              data-testid="input-project-description"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel-raise">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitMutation.isPending}
            className="flex-1"
            data-testid="button-submit-capital-raise"
          >
            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === "counter" ? "Update Terms" : "Post Raise"}
          </Button>
        </div>
      </div>
    </>
  );
}

function CapitalInvestmentForm({ projectId, mode, existingOfferId, onClose }: FormProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useSupabaseAuth();
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("15");
  const [profitSplit, setProfitSplit] = useState("70");
  const [termMonths, setTermMonths] = useState("24");
  const [message, setMessage] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: project, isLoading: projectLoading } = useQuery<CapitalProject>({
    queryKey: ["/api/capital-projects", projectId],
    enabled: !!projectId,
  });

  // Pre-populate form with project data when loaded
  useEffect(() => {
    if (project && !initialized) {
      if (project.minInvestment) {
        setInvestmentAmount(String(project.minInvestment));
      }
      if (project.askingInterestRate) {
        const rate = parseFloat(project.askingInterestRate.replace('%', ''));
        if (!isNaN(rate)) setExpectedReturn(String(rate));
      }
      if (project.askingProfitSplit) {
        const split = parseFloat(project.askingProfitSplit.replace(/[^0-9]/g, ''));
        if (!isNaN(split)) setProfitSplit(String(split));
      }
      if (project.askingLoanDuration) {
        const months = parseInt(project.askingLoanDuration.replace(/[^0-9]/g, ''));
        if (!isNaN(months)) setTermMonths(String(months));
      }
      setInitialized(true);
    }
  }, [project, initialized]);

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/supabase/capital-investments", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: mode === "counter" ? "Counter-Offer Sent" : "Investment Submitted",
        description: mode === "counter"
          ? "Your counter-offer has been sent to the operator."
          : "Your investment offer has been submitted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/capital-projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/capital-investments"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit investment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in required", description: "Please sign in to invest." });
      return;
    }
    if (!investmentAmount) {
      toast({ title: "Investment amount required", variant: "destructive" });
      return;
    }

    const amount = parseFloat(investmentAmount);
    if (project?.minInvestment && amount < project.minInvestment) {
      toast({ 
        title: "Below minimum investment", 
        description: `Minimum investment is ${formatCurrency(project.minInvestment)}`,
        variant: "destructive" 
      });
      return;
    }

    submitMutation.mutate({
      projectId,
      type: "capital_invest",
      isCounter: mode === "counter",
      parentOfferId: existingOfferId,
      investmentAmount: amount,
      expectedReturn: parseFloat(expectedReturn),
      profitSplit: parseInt(profitSplit),
      termMonths: parseInt(termMonths),
      message,
    });
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const fundingProgress = project?.fundingGoal 
    ? ((project.amountRaised || 0) / project.fundingGoal) * 100 
    : 0;
  const remaining = (project?.fundingGoal || 0) - (project?.amountRaised || 0);

  return (
    <>
      <DialogHeader>
        <DialogTitle data-testid="dialog-title-capital-investment">
          {mode === "counter" ? "Counter Investment Terms" : "Make Investment"}
        </DialogTitle>
        <DialogDescription>
          {project?.title || "Capital Project"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div className="p-3 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Funding Goal:</span>
              <span className="ml-2 font-medium">{formatCurrency(project?.fundingGoal)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Remaining:</span>
              <span className="ml-2 font-medium">{formatCurrency(remaining)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Min Investment:</span>
              <span className="ml-2 font-medium">{formatCurrency(project?.minInvestment)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Structure:</span>
              <span className="ml-2 font-medium">{project?.structure || "Equity"}</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{fundingProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${Math.min(fundingProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Investment Amount *</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder={String(project?.minInvestment || 25000)}
                className="w-full pl-7 pr-3 py-2 border rounded-md"
                data-testid="input-investment-amount"
              />
            </div>
            {project?.minInvestment && (
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: {formatCurrency(project.minInvestment)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Expected Return (%)</label>
              <input
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                placeholder="15"
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-expected-return"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Profit Split (Your %)</label>
              <input
                type="number"
                value={profitSplit}
                onChange={(e) => setProfitSplit(e.target.value)}
                placeholder="70"
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-investor-profit-split"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Term Length (months)</label>
            <input
              type="number"
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value)}
              placeholder="24"
              className="w-full px-3 py-2 border rounded-md mt-1"
              data-testid="input-term-months"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Message to Operator</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add any terms or conditions..."
              className="w-full px-3 py-2 border rounded-md mt-1 min-h-[80px]"
              data-testid="input-investment-message"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel-investment">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitMutation.isPending}
            className="flex-1"
            data-testid="button-submit-capital-investment"
          >
            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === "counter" ? "Send Counter-Offer" : "Submit Investment"}
          </Button>
        </div>
      </div>
    </>
  );
}
