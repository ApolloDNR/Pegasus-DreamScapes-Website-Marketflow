import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { DealType, DealAction } from "@shared/schema";
import type { ListingInquiryRequest } from "@shared/listing-inquiry-contract";
import {
  buildListingInfoRequest,
  buildListingTourRequest,
  listingInquiryValidationMessage,
} from "@/lib/listing-inquiry";

// Canonical action types per the 3-lane blueprint
export type DealActionType = 
  // WHOLESALE LANE - simple, fast negotiation
  | "wholesale_accept"      // Accept terms as-is (fast path)
  | "wholesale_counter"     // Counter offer (full form)
  | "wholesale_jv"          // JV partnership request
  // CAPITAL LANE - advanced negotiation  
  | "capital_accept"        // Accept terms (fast path - investment amount + acknowledgements)
  | "capital_counter"       // Counter offer (redirects to Offer Studio)
  // LISTINGS LANE - inquiry-focused, not negotiation-heavy
  | "listing_request_info"  // Request more information
  | "listing_schedule_tour" // Schedule a showing
  // Legacy types (kept for backward compatibility)
  | "assignment_offer"      // Legacy: maps to wholesale_accept or wholesale_counter based on mode
  | "capital_invest"        // Legacy: maps to capital_accept
  | "listing_inquiry";      // Legacy: maps to listing_request_info

export type DealCategory = "wholesale" | "capital" | "listing";

interface DealActionState {
  isOpen: boolean;
  dealId: string | number | null;
  dealType: DealType | null;  // New: track dealType for routing
  actionType: DealActionType | null;
  mode: "new" | "counter";
  existingOfferId?: string;
}

interface DealActionContextValue {
  openDealAction: (dealId: string | number, actionType: DealActionType, mode?: "new" | "counter", existingOfferId?: string) => void;
  openDealActionByType: (dealType: DealType, dealId: string | number, action: DealAction) => void; // New: type-aware routing
  openInStudio: (dealId: string | number, projectType: "capital") => void;  // Studio is CAPITAL-only
  openNegotiation: (dealId: string | number, lane: "WHOLESALE" | "CAPITAL" | "LISTING") => void; // Navigate to negotiation room
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
    dealType: null,
    actionType: null,
    mode: "new",
  });

  // Legacy: action-only routing (still supported for backward compatibility)
  const openDealAction = useCallback((
    dealId: string | number, 
    actionType: DealActionType,
    mode: "new" | "counter" = "new",
    existingOfferId?: string
  ) => {
    // Infer dealType from actionType - includes both canonical and legacy action types
    const inferredDealType: DealType = 
      // Wholesale lane actions (canonical + legacy)
      actionType === "wholesale_accept" || 
      actionType === "wholesale_counter" || 
      actionType === "wholesale_jv" || 
      actionType === "assignment_offer"
        ? "WHOLESALE_ASSIGNMENT"
      // Listing lane actions (canonical + legacy)
      : actionType === "listing_request_info" || 
        actionType === "listing_schedule_tour" || 
        actionType === "listing_inquiry" 
        ? "LISTING"
      // Capital lane (everything else including capital_accept, capital_counter, capital_invest)
      : "CAPITAL_RAISE";
    
    setState({
      isOpen: true,
      dealId,
      dealType: inferredDealType,
      actionType,
      mode,
      existingOfferId,
    });
  }, []);

  // New: type-aware routing using (dealType, action) pair
  const openDealActionByType = useCallback((
    dealType: DealType,
    dealId: string | number,
    action: DealAction
  ) => {
    // Map (dealType, action) to correct actionType for modal routing
    let actionType: DealActionType;
    
    if (dealType === "WHOLESALE_ASSIGNMENT") {
      actionType = action === "JV" ? "wholesale_jv" : "wholesale_accept";
    } else if (dealType === "CAPITAL_RAISE") {
      // All capital actions route to capital_accept (counter goes to Offer Studio)
      actionType = "capital_accept";
    } else if (dealType === "LISTING") {
      actionType = "listing_request_info";
    } else {
      actionType = "wholesale_accept"; // fallback
    }
    
    setState({
      isOpen: true,
      dealId,
      dealType,
      actionType,
      mode: "new",
    });
  }, []);

  // Studio is CAPITAL_RAISE only - no wholesale deals in studio
  const openInStudio = useCallback((dealId: string | number, projectType: "capital") => {
    setLocation(`/offer-studio/${projectType}/${dealId}`);
  }, [setLocation]);
  
  // Navigate to negotiation room with correct lane context
  const openNegotiation = useCallback((dealId: string | number, lane: "WHOLESALE" | "CAPITAL" | "LISTING") => {
    setLocation(`/marketflow/negotiate/${lane.toLowerCase()}/${dealId}`);
  }, [setLocation]);

  const closeDealAction = useCallback(() => {
    setState({
      isOpen: false,
      dealId: null,
      dealType: null,
      actionType: null,
      mode: "new",
    });
  }, []);

  return (
    <DealActionContext.Provider value={{ openDealAction, openDealActionByType, openInStudio, openNegotiation, closeDealAction, state }}>
      {children}
      <DealActionModal />
    </DealActionContext.Provider>
  );
}

function DealActionModal() {
  const { state, closeDealAction } = useDealAction();
  const { isOpen, dealId, dealType, actionType, mode, existingOfferId } = state;

  if (!isOpen || !dealId || !actionType) return null;

  // CANONICAL FORM ROUTER - routes to the correct form based on actionType
  // This ensures the SAME form opens regardless of where the user clicked (Grid/Swipe/Detail)
  const renderForm = () => {
    // ========== WHOLESALE LANE FORMS ==========
    // Wholesale Accept Terms (fast path)
    if (actionType === "wholesale_accept") {
      return (
        <WholesaleAcceptTermsModal
          dealId={String(dealId)}
          onClose={closeDealAction}
        />
      );
    }
    
    // Wholesale Counter Offer (full form)
    if (actionType === "wholesale_counter") {
      return (
        <WholesaleCounterOfferModal
          dealId={String(dealId)}
          existingOfferId={existingOfferId}
          onClose={closeDealAction}
        />
      );
    }
    
    // Wholesale JV Partnership Request
    if (actionType === "wholesale_jv") {
      return (
        <WholesaleJVRequestModal 
          dealId={String(dealId)} 
          existingOfferId={existingOfferId}
          onClose={closeDealAction} 
        />
      );
    }
    
    // ========== CAPITAL LANE FORMS ==========
    if (actionType === "capital_accept") {
      return <CapitalRelationshipHoldModal onClose={closeDealAction} />;
    }
    
    if (actionType === "capital_counter") {
      return <CapitalRelationshipHoldModal onClose={closeDealAction} />;
    }
    
    // ========== LISTINGS LANE FORMS ==========
    // Listing Request Info
    if (actionType === "listing_request_info") {
      return (
        <ListingRequestInfoModal
          listingId={Number(dealId)}
          onClose={closeDealAction}
        />
      );
    }
    
    // Listing Schedule Showing
    if (actionType === "listing_schedule_tour") {
      return (
        <ListingScheduleShowingModal
          listingId={Number(dealId)}
          onClose={closeDealAction}
        />
      );
    }
    
    // ========== LEGACY SUPPORT ==========
    // Legacy assignment_offer - route based on mode
    if (actionType === "assignment_offer") {
      if (mode === "counter") {
        return (
          <WholesaleCounterOfferModal
            dealId={String(dealId)}
            existingOfferId={existingOfferId}
            onClose={closeDealAction}
          />
        );
      }
      return (
        <WholesaleAcceptTermsModal
          dealId={String(dealId)}
          onClose={closeDealAction}
        />
      );
    }
    
    if (actionType === "capital_invest") {
      return <CapitalRelationshipHoldModal onClose={closeDealAction} />;
    }
    
    // Legacy listing_inquiry - route to request info
    if (actionType === "listing_inquiry") {
      return (
        <ListingRequestInfoModal
          listingId={Number(dealId)}
          onClose={closeDealAction}
        />
      );
    }
    
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDealAction()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}

function CapitalRelationshipHoldModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Capital relationships begin privately</DialogTitle>
        <DialogDescription>
          MarketFlow does not accept, counter, or commit to project terms through this record.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        <p className="text-sm leading-relaxed text-muted-foreground">
          A project status or submitted term is context only. Any later discussion requires a
          separate relationship, diligence, eligibility, and written documentation.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href="/capital#capital-introduction" className="flex-1">
            <Button variant="outline" className="w-full">
              Relationship information
            </Button>
          </a>
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </>
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

const MIN_WHOLESALE_OFFER_AMOUNT = 1_000;
const MAX_WHOLESALE_OFFER_AMOUNT = 10_000_000_000;
const MAX_WHOLESALE_INSPECTION_DAYS = 365;

interface WholesaleOfferTerms {
  offerPrice: number;
  earnestMoney: number;
  closeDate: string;
  inspectionPeriod: number;
  fundingType: "cash";
  notes: string;
}

function toDateInputValue(value: unknown): string {
  if (typeof value !== "string") return "";
  const match = value
    .trim()
    .match(
      /^(\d{4}-\d{2}-\d{2})(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:(?:0\d|1[0-3]):[0-5]\d|14:00)))?$/,
    );
  return match?.[1] ?? "";
}

function readNonNegativeComponent(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const parsed = Number(value);
  return (
    Number.isSafeInteger(parsed) &&
    parsed >= 0 &&
    parsed <= MAX_WHOLESALE_OFFER_AMOUNT
  )
    ? parsed
    : null;
}

function calculateTotalAssignmentPrice(
  contractPriceValue: unknown,
  assignmentFeeValue: unknown,
): number | null {
  const contractPrice = readNonNegativeComponent(contractPriceValue);
  const assignmentFee = readNonNegativeComponent(assignmentFeeValue);
  if (contractPrice === null || assignmentFee === null) return null;

  const total = contractPrice + assignmentFee;
  return (
    Number.isSafeInteger(total) &&
    total >= MIN_WHOLESALE_OFFER_AMOUNT &&
    total <= MAX_WHOLESALE_OFFER_AMOUNT
  )
    ? total
    : null;
}

function parseBoundedWholeNumber(
  value: string,
  minimum: number,
  maximum: number,
): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
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
  askingEquityPercent?: number;
  askingDebtPortion?: number;
  askingEquityPortion?: number;
  paymentSchedule?: string;
}

interface FormProps {
  dealId?: string;
  projectId?: number;
  mode: "new" | "counter";
  existingOfferId?: string;
  onClose: () => void;
}

// ========== CANONICAL WHOLESALE FORMS ==========

interface WholesaleAcceptFormProps {
  dealId: string;
  onClose: () => void;
}

// WHOLESALE ACCEPT TERMS - Fast path with minimal fields
function WholesaleAcceptTermsModal({ dealId, onClose }: WholesaleAcceptFormProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useSupabaseAuth();
  const [earnestMoney, setEarnestMoney] = useState("1000");
  const [acknowledgedTotal, setAcknowledgedTotal] = useState<number | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [closingDateInitialized, setClosingDateInitialized] = useState(false);
  const [closingDateError, setClosingDateError] = useState(false);
  const closingDateInputRef = useRef<HTMLInputElement>(null);

  const { data: deal, isLoading: dealLoading } = useQuery<WholesaleDeal>({
    queryKey: ["/api/wholesale-deals", dealId],
    enabled: !!dealId,
  });

  useEffect(() => {
    if (deal && !closingDateInitialized) {
      setClosingDate(toDateInputValue(deal.closingDate));
      setClosingDateInitialized(true);
    }
  }, [deal, closingDateInitialized]);

  const totalAssignmentPrice = calculateTotalAssignmentPrice(
    deal?.contractPrice,
    deal?.assignmentFee,
  );
  const hasAcknowledgedCurrentTotal =
    totalAssignmentPrice !== null &&
    acknowledgedTotal === totalAssignmentPrice;

  const submitMutation = useMutation({
    mutationFn: async (payload: WholesaleOfferTerms) => {
      const res = await apiRequest("POST", "/api/marketflow/offers", {
        lane: "WHOLESALE",
        dealId: Number(dealId),
        offerKind: "WHOLESALE_ASSIGNMENT",
        payload,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Offer sent",
        description: "Your offer is now awaiting the wholesaler's response.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wholesale-deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketflow/negotiations"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit acceptance",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to accept this deal.",
      });
      return;
    }
    if (totalAssignmentPrice === null) {
      toast({ title: "Valid total assignment price required", variant: "destructive" });
      return;
    }
    if (!hasAcknowledgedCurrentTotal) {
      toast({
        title: "Acknowledgement required",
        description: "Please acknowledge the terms.",
        variant: "destructive",
      });
      return;
    }

    const closingDateInput = closingDateInputRef.current;
    if (
      !closingDate ||
      !closingDateInput?.value ||
      !closingDateInput.validity.valid
    ) {
      setClosingDateError(true);
      closingDateInput?.focus();
      return;
    }
    setClosingDateError(false);

    const parsedEarnestMoney = parseBoundedWholeNumber(
      earnestMoney,
      0,
      MAX_WHOLESALE_OFFER_AMOUNT,
    );
    if (
      parsedEarnestMoney === null ||
      parsedEarnestMoney > totalAssignmentPrice
    ) {
      toast({
        title: "Valid earnest money required",
        description: "Enter a whole-dollar amount from $0 through the total.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      offerPrice: totalAssignmentPrice,
      earnestMoney: parsedEarnestMoney,
      closeDate: closingDate,
      inspectionPeriod: 0,
      fundingType: "cash",
      notes: message,
    } satisfies WholesaleOfferTerms;
    submitMutation.mutate(payload);
  };

  if (dealLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || !Number.isFinite(amount)) {
      return "—";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle data-testid="dialog-title-wholesale-accept">
          Wholesale Accept Terms
        </DialogTitle>
        <DialogDescription>
          Accept the assignment as posted
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="text-lg font-semibold">{deal?.propertyAddress || deal?.address}</div>
          {deal?.city && deal?.state && (
            <div className="text-sm text-muted-foreground">{deal.city}, {deal.state}</div>
          )}
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <span className="text-muted-foreground">Contract Price:</span>
              <span className="ml-2 font-medium">{formatCurrency(deal?.contractPrice)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Assignment Fee:</span>
              <span className="ml-2 font-medium text-primary">{formatCurrency(deal?.assignmentFee)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ARV:</span>
              <span className="ml-2 font-medium">{formatCurrency(deal?.arv)}</span>
            </div>
            <div
              className="col-span-2"
              data-testid="text-accept-total-assignment-price"
            >
              <span className="text-muted-foreground">
                Total assignment price:
              </span>
              <span className="ml-2 font-semibold text-primary">
                {formatCurrency(totalAssignmentPrice)}
              </span>
            </div>
          </div>
          {totalAssignmentPrice === null && (
            <p
              id="accept-total-assignment-price-error"
              role="alert"
              className="text-sm text-destructive"
              data-testid="error-accept-total-assignment-price"
            >
              Total assignment price is invalid.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="accept-closing-date"
              className="text-sm font-medium"
            >
              Closing Date *
            </label>
            <input
              ref={closingDateInputRef}
              id="accept-closing-date"
              type="date"
              required
              value={closingDate}
              onChange={(event) => {
                const value = event.target.value;
                setClosingDate(value);
                if (value) setClosingDateError(false);
              }}
              aria-invalid={closingDateError ? "true" : undefined}
              aria-describedby={
                closingDateError ? "accept-closing-date-error" : undefined
              }
              className="w-full px-3 py-2 border rounded-md mt-1"
              data-testid="input-accept-closing-date"
            />
            {closingDateError && (
              <p
                id="accept-closing-date-error"
                role="alert"
                className="text-sm text-destructive mt-1"
                data-testid="error-accept-closing-date"
              >
                Closing date is required.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Earnest Money Deposit</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                step="1"
                value={earnestMoney}
                onChange={(event) => setEarnestMoney(event.target.value)}
                placeholder="1000"
                className="w-full pl-7 pr-3 py-2 border rounded-md"
                data-testid="input-accept-earnest-money"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Any notes for the wholesaler..."
              className="w-full px-3 py-2 border rounded-md mt-1 min-h-[60px]"
              data-testid="input-accept-message"
            />
          </div>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
            <input
              type="checkbox"
              checked={hasAcknowledgedCurrentTotal}
              onChange={(event) =>
                setAcknowledgedTotal(
                  event.target.checked ? totalAssignmentPrice : null,
                )
              }
              disabled={totalAssignmentPrice === null}
              className="mt-0.5 rounded"
              data-testid="checkbox-acknowledge-terms"
            />
            <span className="text-sm">
              I acknowledge and accept the assignment terms as posted. I
              understand I am agreeing to pay the total assignment price of{" "}
              {formatCurrency(totalAssignmentPrice)}.
            </span>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel-accept">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={
              submitMutation.isPending ||
              !hasAcknowledgedCurrentTotal ||
              totalAssignmentPrice === null
            }
            className="flex-1"
            data-testid="button-submit-wholesale-accept"
          >
            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Accept Terms
          </Button>
        </div>
      </div>
    </>
  );
}

interface WholesaleCounterFormProps {
  dealId: string;
  existingOfferId?: string;
  onClose: () => void;
}

// WHOLESALE COUNTER OFFER - Full form with all negotiable fields
function WholesaleCounterOfferModal({
  dealId,
  onClose,
}: WholesaleCounterFormProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useSupabaseAuth();
  const [counterAssignmentFee, setCounterAssignmentFee] = useState("");
  const [earnestMoney, setEarnestMoney] = useState("1000");
  const [closingDate, setClosingDate] = useState("");
  const [inspectionPeriod, setInspectionPeriod] = useState("10");
  const [message, setMessage] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [closingDateError, setClosingDateError] = useState(false);
  const closingDateInputRef = useRef<HTMLInputElement>(null);

  const { data: deal, isLoading: dealLoading } = useQuery<WholesaleDeal>({
    queryKey: ["/api/wholesale-deals", dealId],
    enabled: !!dealId,
  });

  useEffect(() => {
    if (deal && !initialized) {
      setCounterAssignmentFee(
        deal.assignmentFee === undefined || deal.assignmentFee === null
          ? ""
          : String(deal.assignmentFee),
      );
      setClosingDate(toDateInputValue(deal.closingDate));
      setInitialized(true);
    }
  }, [deal, initialized]);

  const totalAssignmentPrice = initialized
    ? calculateTotalAssignmentPrice(
        deal?.contractPrice,
        counterAssignmentFee,
      )
    : null;
  const hasInvalidTotalAssignmentPrice =
    initialized && totalAssignmentPrice === null;

  const submitMutation = useMutation({
    mutationFn: async (payload: WholesaleOfferTerms) => {
      const res = await apiRequest("POST", "/api/marketflow/offers", {
        lane: "WHOLESALE",
        dealId: Number(dealId),
        offerKind: "WHOLESALE_ASSIGNMENT",
        payload,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Counter-Offer Sent",
        description: "Your counter-offer has been sent for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wholesale-deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketflow/negotiations"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit counter-offer",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make a counter-offer.",
      });
      return;
    }
    if (!initialized || totalAssignmentPrice === null) {
      toast({ title: "Valid total assignment price required", variant: "destructive" });
      return;
    }

    const closingDateInput = closingDateInputRef.current;
    if (
      !closingDate ||
      !closingDateInput?.value ||
      !closingDateInput.validity.valid
    ) {
      setClosingDateError(true);
      closingDateInput?.focus();
      return;
    }
    setClosingDateError(false);

    const parsedEarnestMoney = parseBoundedWholeNumber(
      earnestMoney,
      0,
      MAX_WHOLESALE_OFFER_AMOUNT,
    );
    const parsedInspectionPeriod = parseBoundedWholeNumber(
      inspectionPeriod,
      0,
      MAX_WHOLESALE_INSPECTION_DAYS,
    );
    if (
      parsedEarnestMoney === null ||
      parsedEarnestMoney > totalAssignmentPrice
    ) {
      toast({
        title: "Valid earnest money required",
        description: "Enter a whole-dollar amount from $0 through the total.",
        variant: "destructive",
      });
      return;
    }
    if (parsedInspectionPeriod === null) {
      toast({
        title: "Valid inspection period required",
        description: "Enter a whole number from 0 through 365 days.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      offerPrice: totalAssignmentPrice,
      earnestMoney: parsedEarnestMoney,
      closeDate: closingDate,
      inspectionPeriod: parsedInspectionPeriod,
      fundingType: "cash",
      notes: message,
    } satisfies WholesaleOfferTerms;
    submitMutation.mutate(payload);
  };

  if (dealLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || !Number.isFinite(amount)) {
      return "—";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle data-testid="dialog-title-wholesale-counter">
          Wholesale Counter Offer
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
          <div
            className="col-span-2"
            data-testid="text-counter-total-assignment-price"
          >
            <span className="text-muted-foreground">
              Total assignment price:
            </span>
            <span className="ml-2 font-semibold text-primary">
              {formatCurrency(totalAssignmentPrice)}
            </span>
          </div>
        </div>
        {hasInvalidTotalAssignmentPrice && (
          <p
            id="counter-total-assignment-price-error"
            role="alert"
            className="text-sm text-destructive"
            data-testid="error-counter-total-assignment-price"
          >
            Total assignment price is invalid.
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label
              htmlFor="counter-assignment-fee"
              className="text-sm font-medium"
            >
              Your Assignment Fee Offer *
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                id="counter-assignment-fee"
                type="number"
                step="1"
                value={counterAssignmentFee}
                onChange={(event) =>
                  setCounterAssignmentFee(event.target.value)
                }
                placeholder={String(deal?.assignmentFee ?? 5000)}
                className="w-full pl-7 pr-3 py-2 border rounded-md"
                data-testid="input-counter-assignment-fee"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Earnest Money Deposit</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                step="1"
                value={earnestMoney}
                onChange={(event) => setEarnestMoney(event.target.value)}
                placeholder="1000"
                className="w-full pl-7 pr-3 py-2 border rounded-md"
                data-testid="input-counter-earnest-money"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="counter-closing-date"
                className="text-sm font-medium"
              >
                Closing Date *
              </label>
              <input
                ref={closingDateInputRef}
                id="counter-closing-date"
                type="date"
                required
                value={closingDate}
                onChange={(event) => {
                  const value = event.target.value;
                  setClosingDate(value);
                  if (value) setClosingDateError(false);
                }}
                aria-invalid={closingDateError ? "true" : undefined}
                aria-describedby={
                  closingDateError ? "counter-closing-date-error" : undefined
                }
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-counter-closing-date"
              />
              {closingDateError && (
                <p
                  id="counter-closing-date-error"
                  role="alert"
                  className="text-sm text-destructive mt-1"
                  data-testid="error-counter-closing-date"
                >
                  Closing date is required.
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Inspection Period (days)</label>
              <input
                type="number"
                step="1"
                value={inspectionPeriod}
                onChange={(event) => setInspectionPeriod(event.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-counter-inspection-period"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Message to Wholesaler</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain your counter-offer terms..."
              className="w-full px-3 py-2 border rounded-md mt-1 min-h-[80px]"
              data-testid="input-counter-message"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel-counter">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={
              submitMutation.isPending ||
              !initialized ||
              totalAssignmentPrice === null
            }
            className="flex-1"
            data-testid="button-submit-wholesale-counter"
          >
            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Send Counter-Offer
          </Button>
        </div>
      </div>
    </>
  );
}

interface WholesaleJVFormProps {
  dealId: string;
  existingOfferId?: string;
  onClose: () => void;
}

// WHOLESALE JV REQUEST - Partnership request form
function WholesaleJVRequestModal({ dealId, existingOfferId, onClose }: WholesaleJVFormProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useSupabaseAuth();
  const [partnerRole, setPartnerRole] = useState<"deal_bringer" | "buyer_bringer">("deal_bringer");
  const [assignmentSplit, setAssignmentSplit] = useState(50);
  const [contributions, setContributions] = useState<string[]>([]);
  const [proposedTimeline, setProposedTimeline] = useState("");
  const [message, setMessage] = useState("");

  const { data: deal, isLoading: dealLoading } = useQuery<WholesaleDeal>({
    queryKey: ["/api/wholesale-deals", dealId],
    enabled: !!dealId,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/marketplace/jv-requests", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "JV Request Sent",
        description: "Your partnership request has been sent to the wholesaler.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wholesale-deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/wholesaler/jv-requests"] });
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
      parentOfferId: existingOfferId,
      partnerRole,
      assignmentSplitPercent: assignmentSplit,
      contributions,
      proposedTimeline,
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
    { id: "capital", label: "Capital / Funding" },
    { id: "construction", label: "Construction Management" },
    { id: "acquisitions", label: "Acquisitions / Deal Sourcing" },
    { id: "dispositions", label: "Dispositions / Sales" },
    { id: "buyer_network", label: "Buyer Network Access" },
    { id: "due_diligence", label: "Due Diligence Support" },
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle data-testid="dialog-title-jv-request">
          Wholesale JV Partnership Request
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
            <span className="ml-2 font-medium text-primary">
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
              className="w-full mt-2 accent-primary"
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
                <label key={option.id} className="flex items-center gap-2 text-sm p-2 border rounded-md hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contributions.includes(option.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setContributions([...contributions, option.id]);
                      } else {
                        setContributions(contributions.filter((c) => c !== option.id));
                      }
                    }}
                    className="rounded"
                    data-testid={`checkbox-contribution-${option.id}`}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Proposed Timeline</label>
            <input
              type="text"
              value={proposedTimeline}
              onChange={(e) => setProposedTimeline(e.target.value)}
              placeholder="e.g., 30-day close, 14-day due diligence"
              className="w-full px-3 py-2 border rounded-md mt-1"
              data-testid="input-jv-timeline"
            />
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

        {/* JV Agreement Summary */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
          <div className="font-medium mb-2">JV Agreement Summary</div>
          <ul className="space-y-1 text-muted-foreground">
            <li>Role: {partnerRole === "deal_bringer" ? "Deal Bringer" : "Buyer Bringer"}</li>
            <li>Split: {assignmentSplit}% (you) / {100 - assignmentSplit}% (partner)</li>
            <li>Your take: {formatCurrency((deal?.assignmentFee || 0) * (assignmentSplit / 100))}</li>
            {contributions.length > 0 && (
              <li>Contributions: {contributions.map(c => contributionOptions.find(o => o.id === c)?.label).join(", ")}</li>
            )}
          </ul>
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
            Request JV
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
              placeholder="Describe the capital participation request..."
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
              <span className="text-muted-foreground">Minimum Capital:</span>
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

// ========== CANONICAL CAPITAL FORMS ==========

interface CapitalAcceptFormProps {
  projectId: number;
  onClose: () => void;
}

// CAPITAL ACCEPT TERMS - Fast path with minimal fields (investment amount + acknowledgements)
function CapitalAcceptTermsModal({ projectId, onClose }: CapitalAcceptFormProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useSupabaseAuth();
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [acknowledgedRisk, setAcknowledgedRisk] = useState(false);
  const [message, setMessage] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: project, isLoading: projectLoading } = useQuery<CapitalProject>({
    queryKey: ["/api/capital-projects", projectId],
    enabled: !!projectId,
  });

  useEffect(() => {
    if (project && !initialized) {
      if (project.minInvestment) {
        setInvestmentAmount(String(project.minInvestment));
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
        title: "Interest Recorded",
        description: "Your request was recorded for conditional review. It does not accept terms or create a commitment.",
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
    if (!acknowledged || !acknowledgedRisk) {
      toast({ title: "Acknowledgements required", description: "Please acknowledge all terms.", variant: "destructive" });
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
      type: "capital_accept",
      isCounter: false,
      investmentAmount: amount,
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
        <DialogTitle data-testid="dialog-title-capital-accept">
          Capital Relationship Context
        </DialogTitle>
        <DialogDescription>
          Record context only; MarketFlow does not execute or accept project terms here
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-lg font-semibold">{project?.title}</div>
              {project?.address && (
                <div className="text-sm text-muted-foreground">{project.address}, {project.city}, {project.state}</div>
              )}
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ${
              project?.structure === "DEBT" 
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : project?.structure === "HYBRID"
                  ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                  : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
            }`} data-testid="badge-structure-type">
              {project?.structure || "EQUITY"}
            </span>
          </div>
          
          {/* Structure-specific terms display */}
          {project?.structure === "DEBT" && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">Debt Investment Terms</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Interest Rate:</span>
                  <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">{project.askingInterestRate || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Loan Duration:</span>
                  <span className="ml-2 font-medium">{project.askingLoanDuration || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Schedule:</span>
                  <span className="ml-2 font-medium">{project.paymentSchedule || "Monthly"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Security:</span>
                  <span className="ml-2 font-medium">First Lien Position</span>
                </div>
              </div>
            </div>
          )}
          
          {project?.structure === "EQUITY" && (
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
              <div className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">Equity Investment Terms</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Equity Share:</span>
                  <span className="ml-2 font-semibold text-green-600 dark:text-green-400">{project.askingEquityPercent ? `${project.askingEquityPercent}%` : "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Preferred Return:</span>
                  <span className="ml-2 font-medium">{project.askingPreferredReturn || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Profit Split:</span>
                  <span className="ml-2 font-medium">{project.askingProfitSplit || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Hold Period:</span>
                  <span className="ml-2 font-medium">{project.holdPeriod || "—"}</span>
                </div>
              </div>
            </div>
          )}
          
          {project?.structure === "HYBRID" && (
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/25 dark:border-primary/30 space-y-2">
              <div className="text-xs font-medium text-primary uppercase tracking-wide">Hybrid Investment Terms</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Debt Portion:</span>
                  <span className="ml-2 font-semibold">{project.askingDebtPortion ? `${project.askingDebtPortion}%` : "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Equity Portion:</span>
                  <span className="ml-2 font-semibold">{project.askingEquityPortion ? `${project.askingEquityPortion}%` : "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Base Interest:</span>
                  <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">{project.askingInterestRate || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Equity Upside:</span>
                  <span className="ml-2 font-medium text-green-600 dark:text-green-400">{project.askingEquityPercent ? `${project.askingEquityPercent}%` : "—"}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Fallback for unspecified structure */}
          {!project?.structure && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Target Return:</span>
                <span className="ml-2 font-medium text-primary">{project?.askingInterestRate || project?.askingPreferredReturn || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Profit Split:</span>
                <span className="ml-2 font-medium">{project?.askingProfitSplit || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Hold Period:</span>
                <span className="ml-2 font-medium">{project?.holdPeriod || project?.askingLoanDuration || "—"}</span>
              </div>
            </div>
          )}
          
          <div className="pt-2 border-t border-border/50">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Funding Progress</span>
              <span>{formatCurrency(project?.amountRaised)} / {formatCurrency(project?.fundingGoal)}</span>
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
                placeholder={project?.minInvestment ? String(project.minInvestment) : "Amount"}
                className="w-full pl-7 pr-3 py-2 border rounded-md"
                data-testid="input-capital-accept-amount"
              />
            </div>
            {project?.minInvestment && (
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: {formatCurrency(project.minInvestment)} | Remaining: {formatCurrency(remaining)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Any notes for the operator..."
              className="w-full px-3 py-2 border rounded-md mt-1 min-h-[60px]"
              data-testid="input-capital-accept-message"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 rounded"
                data-testid="checkbox-capital-acknowledge-terms"
              />
              <span className="text-sm">
                I understand the displayed terms are submitted record context and may be incomplete or unverified. Checking this box does not accept them.
              </span>
            </label>
            
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <input
                type="checkbox"
                checked={acknowledgedRisk}
                onChange={(e) => setAcknowledgedRisk(e.target.checked)}
                className="mt-0.5 rounded"
                data-testid="checkbox-capital-acknowledge-risk"
              />
              <span className="text-sm">
                I understand this request does not create participation, an allocation, an agreement, or a promise of follow-up.
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel-capital-accept">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitMutation.isPending || !acknowledged || !acknowledgedRisk}
            className="flex-1"
            data-testid="button-submit-capital-accept"
          >
            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Record Interest
          </Button>
        </div>
      </div>
    </>
  );
}

// ========== CANONICAL LISTING FORMS ==========

interface ListingFormProps {
  listingId: number;
  onClose: () => void;
}

interface ListingContext {
  dealType: string;
  dealId: number;
  deal?: {
    id: number;
    propertyAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: string;
    sqft?: number;
    yearBuilt?: number;
    images?: string[];
  };
  listingTerms?: {
    listPrice?: number;
    pricePerSqft?: number;
    listingType?: string;
    condition?: string;
    hoa?: number;
    amenities?: string[];
  };
  contact?: {
    agentName?: string;
    agentPhone?: string;
    agentEmail?: string;
  };
  status?: string;
}

// LISTING REQUEST INFO - For requesting more information about a property
function ListingRequestInfoModal({ listingId, onClose }: ListingFormProps) {
  const { toast } = useToast();
  const { isAuthenticated, profile } = useSupabaseAuth();
  const [name, setName] = useState(profile?.display_name || "");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState<"email" | "phone" | "either">("email");
  const [questions, setQuestions] = useState<string[]>([]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [timeframe, setTimeframe] = useState("");

  const { data: context, isLoading: contextLoading } = useQuery<ListingContext>({
    queryKey: [`/api/deals/LISTING/${listingId}/context`],
    enabled: !!listingId,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ListingInquiryRequest) => {
      const res = await apiRequest("POST", "/api/listing-inquiries", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Submitted",
        description: "Your request for information has been sent to the listing agent.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listing-inquiries"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit inquiry",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit an inquiry.",
      });
      return;
    }
    if (preferredContact === "phone" && !phone.trim()) {
      toast({ title: "Phone required", variant: "destructive" });
      return;
    }

    try {
      submitMutation.mutate(buildListingInfoRequest({
        listingId,
        name,
        email,
        phone,
        preferredContact,
        questions: questionOptions.filter((option) =>
          questions.includes(option),
        ),
        customQuestion,
        timeframe,
      }));
    } catch (error) {
      toast({
        title: "Check your inquiry",
        description: listingInquiryValidationMessage(error),
        variant: "destructive",
      });
    }
  };

  if (contextLoading) {
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

  const deal = context?.deal;
  const terms = context?.listingTerms;

  const questionOptions = [
    "Property condition and recent updates",
    "HOA fees and restrictions",
    "Utility costs and average bills",
    "School district information",
    "Neighborhood and nearby amenities",
    "Reason for selling",
    "Comparable sales in the area",
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle data-testid="dialog-title-listing-request-info">
          Listing Request Info
        </DialogTitle>
        <DialogDescription>
          {deal?.propertyAddress || "Property"}
          {deal?.city && deal?.state && ` - ${deal.city}, ${deal.state}`}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg text-sm">
          <div>
            <span className="text-muted-foreground">List Price:</span>
            <span className="ml-2 font-medium">{formatCurrency(terms?.listPrice)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Type:</span>
            <span className="ml-2 font-medium">{deal?.propertyType || "—"}</span>
          </div>
          {deal?.bedrooms && (
            <div>
              <span className="text-muted-foreground">Beds / Baths:</span>
              <span className="ml-2 font-medium">{deal.bedrooms} / {deal.bathrooms || "—"}</span>
            </div>
          )}
          {deal?.sqft && (
            <div>
              <span className="text-muted-foreground">Sqft:</span>
              <span className="ml-2 font-medium">{deal.sqft.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Your Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 border rounded-md mt-1"
              data-testid="input-info-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-info-email"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-info-phone"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Preferred Contact Method</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { value: "email", label: "Email" },
                { value: "phone", label: "Phone" },
                { value: "either", label: "Either" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreferredContact(option.value as "email" | "phone" | "either")}
                  className={`p-2 border rounded-lg text-center text-sm transition-colors ${
                    preferredContact === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid={`button-contact-${option.value}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">What would you like to know?</label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {questionOptions.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm p-2 border rounded-md hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={questions.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setQuestions([...questions, option]);
                      } else {
                        setQuestions(questions.filter((q) => q !== option));
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
            <label className="text-sm font-medium">Additional Questions</label>
            <textarea
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Any other specific questions about this property..."
              className="w-full px-3 py-2 border rounded-md mt-1 min-h-[60px]"
              data-testid="input-info-custom-question"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Your Timeframe (optional)</label>
            <input
              type="text"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="e.g., Looking to buy in the next 3 months"
              className="w-full px-3 py-2 border rounded-md mt-1"
              data-testid="input-info-timeframe"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel-info">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitMutation.isPending}
            className="flex-1"
            data-testid="button-submit-listing-info"
          >
            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Request Info
          </Button>
        </div>
      </div>
    </>
  );
}

// LISTING SCHEDULE SHOWING - For scheduling property tours
function ListingScheduleShowingModal({ listingId, onClose }: ListingFormProps) {
  const { toast } = useToast();
  const { isAuthenticated, profile } = useSupabaseAuth();
  const [name, setName] = useState(profile?.display_name || "");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDates, setPreferredDates] = useState<string[]>(["", "", ""]);
  const [preferredTimes, setPreferredTimes] = useState<string[]>(["", "", ""]);
  const [isPreApproved, setIsPreApproved] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");

  const { data: context, isLoading: contextLoading } = useQuery<ListingContext>({
    queryKey: [`/api/deals/LISTING/${listingId}/context`],
    enabled: !!listingId,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ListingInquiryRequest) => {
      const res = await apiRequest("POST", "/api/listing-inquiries", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tour Request Submitted",
        description: "Your showing request has been sent to the listing agent.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listing-inquiries"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit tour request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to schedule a tour.",
      });
      return;
    }
    if (!preferredDates[0]?.trim()) {
      toast({ title: "Preferred date required", variant: "destructive" });
      return;
    }

    try {
      submitMutation.mutate(buildListingTourRequest({
        listingId,
        name,
        email,
        phone,
        preferredDates,
        preferredTimes,
        preApproved: isPreApproved,
        message: notes,
      }));
    } catch (error) {
      toast({
        title: "Check your tour request",
        description: listingInquiryValidationMessage(error),
        variant: "destructive",
      });
    }
  };

  if (contextLoading) {
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

  const deal = context?.deal;
  const terms = context?.listingTerms;

  const updatePreferredDate = (index: number, value: string) => {
    const newDates = [...preferredDates];
    newDates[index] = value;
    setPreferredDates(newDates);
  };

  const updatePreferredTime = (index: number, value: string) => {
    const newTimes = [...preferredTimes];
    newTimes[index] = value;
    setPreferredTimes(newTimes);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle data-testid="dialog-title-listing-schedule-tour">
          Listing Schedule Showing
        </DialogTitle>
        <DialogDescription>
          {deal?.propertyAddress || "Property"}
          {deal?.city && deal?.state && ` - ${deal.city}, ${deal.state}`}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg text-sm">
          <div>
            <span className="text-muted-foreground">List Price:</span>
            <span className="ml-2 font-medium">{formatCurrency(terms?.listPrice)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Type:</span>
            <span className="ml-2 font-medium">{deal?.propertyType || "—"}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Your Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 border rounded-md mt-1"
              data-testid="input-tour-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-tour-email"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-tour-phone"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Preferred Dates/Times (provide 2-3 options)</label>
            <div className="space-y-2 mt-2">
              {[0, 1, 2].map((index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={preferredDates[index]}
                    onChange={(e) => updatePreferredDate(index, e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2 border rounded-md"
                    placeholder={index === 0 ? "Date (required)" : "Date (optional)"}
                    data-testid={`input-tour-date-${index}`}
                  />
                  <input
                    type="time"
                    value={preferredTimes[index]}
                    onChange={(event) => updatePreferredTime(index, event.target.value)}
                    className="px-3 py-2 border rounded-md"
                    aria-label={`Preferred time ${index + 1}`}
                    data-testid={`input-tour-time-${index}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Are you pre-approved / have proof of funds?</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsPreApproved(true)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  isPreApproved === true
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                data-testid="button-preapproved-yes"
              >
                <div className="font-medium text-sm">Yes</div>
              </button>
              <button
                type="button"
                onClick={() => setIsPreApproved(false)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  isPreApproved === false
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                data-testid="button-preapproved-no"
              >
                <div className="font-medium text-sm">No / Not Yet</div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or questions..."
              className="w-full px-3 py-2 border rounded-md mt-1 min-h-[60px]"
              data-testid="input-tour-notes"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel-tour">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitMutation.isPending}
            className="flex-1"
            data-testid="button-submit-listing-tour"
          >
            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Schedule Showing
          </Button>
        </div>
      </div>
    </>
  );
}
