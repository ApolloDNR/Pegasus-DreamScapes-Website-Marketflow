import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowRight,
  Clock,
  DollarSign,
  Loader2,
  Percent,
  Scale,
  TrendingUp,
} from "lucide-react";
import { LegacyWorkflowNotice } from "@/components/legacy-workflow-notice";
import type { OfferStudioLane } from "@/components/open-offer-studio-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

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

function offerStudioLane(dealType: string): OfferStudioLane | undefined {
  const normalized = dealType.trim().toLowerCase();
  if (normalized.includes("wholesale")) return "WHOLESALE";
  if (normalized.includes("capital")) return "CAPITAL";
  if (normalized.includes("listing") || normalized === "retail") return "LISTING";
  return undefined;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    accepted: "border-green-200 bg-green-50 text-green-700",
    declined: "border-red-200 bg-red-50 text-red-700",
    countered: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <Badge variant="outline" className={styles[status] ?? ""}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}

function ReadOnlyTerms({ offer }: { offer: DealNegotiation }) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      {offer.proposedAmount !== undefined && (
        <div>
          <span className="text-muted-foreground">Amount</span>
          <p className="font-medium">{formatCurrency(offer.proposedAmount)}</p>
        </div>
      )}
      {offer.proposedInterestRate && (
        <div>
          <span className="text-muted-foreground">Interest</span>
          <p className="font-medium">{offer.proposedInterestRate}</p>
        </div>
      )}
      {offer.proposedLoanTerm && (
        <div>
          <span className="text-muted-foreground">Term</span>
          <p className="font-medium">{offer.proposedLoanTerm}</p>
        </div>
      )}
      {offer.proposedLTV !== undefined && (
        <div>
          <span className="text-muted-foreground">LTV</span>
          <p className="font-medium">{offer.proposedLTV}%</p>
        </div>
      )}
      {offer.proposedPoints && (
        <div>
          <span className="text-muted-foreground">Points</span>
          <p className="font-medium">{offer.proposedPoints}</p>
        </div>
      )}
      {offer.proposedEquityPercent !== undefined && (
        <div>
          <span className="text-muted-foreground">Equity</span>
          <p className="font-medium">{offer.proposedEquityPercent}%</p>
        </div>
      )}
      {offer.proposedPreferredReturn && (
        <div>
          <span className="text-muted-foreground">Preferred return</span>
          <p className="font-medium">{offer.proposedPreferredReturn}</p>
        </div>
      )}
      {offer.proposedProfitSplit && (
        <div>
          <span className="text-muted-foreground">Profit split</span>
          <p className="font-medium">{offer.proposedProfitSplit}</p>
        </div>
      )}
    </div>
  );
}

export function NegotiationHistoryDialog({
  open,
  onOpenChange,
  negotiationId,
  dealTitle,
}: NegotiationHistoryProps) {
  const { user } = useSupabaseAuth();
  const { data: thread, isLoading } = useQuery<DealNegotiation[]>({
    queryKey: ["/api/negotiations", negotiationId, "thread"],
    enabled: open && negotiationId > 0,
  });

  const root = thread?.[0];
  const lane = root ? offerStudioLane(root.dealType) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" aria-hidden="true" />
            Archived negotiation
          </DialogTitle>
          <DialogDescription>{dealTitle}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !thread?.length ? (
          <LegacyWorkflowNotice
            title="This legacy record is unavailable"
            description="Open the deal from MarketFlow and use Offer Studio for any current negotiation."
          />
        ) : (
          <ScrollArea className="max-h-[62vh] pr-3">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Historical terms are shown for reference only. Their legacy
                status is not a current agreement.
              </p>

              {thread.map((offer, index) => {
                const isFromMe = offer.initiatorId === user?.id;
                return (
                  <Card
                    key={offer.id}
                    className={isFromMe ? "ml-6 border-primary/30" : "mr-6"}
                    data-testid={`negotiation-offer-${offer.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {offer.structureType === "debt" ? "Debt" : "Equity"}
                          </Badge>
                          <Badge variant="outline">
                            {offer.isCounterOffer
                              ? `Counter ${index}`
                              : "Initial terms"}
                          </Badge>
                        </div>
                        <StatusBadge status={offer.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isFromMe ? "You" : "Other party"} ·{" "}
                        {format(new Date(offer.createdAt), "MMM d, yyyy h:mm a")}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ReadOnlyTerms offer={offer} />
                      {offer.notes && (
                        <div className="rounded-md bg-muted/40 p-3 text-sm">
                          {offer.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              <LegacyWorkflowNotice
                title="Use Offer Studio for the current negotiation"
                description="Offer Studio records each proposal, response, and message in the canonical MarketFlow thread."
                dealId={root?.dealId}
                lane={lane}
              />
            </div>
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
  const { user } = useSupabaseAuth();
  const isFromMe = negotiation.initiatorId === user?.id;

  return (
    <Card data-testid={`negotiation-card-${negotiation.id}`}>
      <CardContent className="pt-4">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                negotiation.structureType === "debt" ? "outline" : "secondary"
              }
            >
              {negotiation.structureType === "debt" ? (
                <DollarSign className="mr-1 h-3 w-3" aria-hidden="true" />
              ) : (
                <Percent className="mr-1 h-3 w-3" aria-hidden="true" />
              )}
              {negotiation.structureType}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {negotiation.dealType.replaceAll("_", " ")} #{negotiation.dealId}
            </span>
          </div>
          <StatusBadge status={negotiation.status} />
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
          {negotiation.proposedAmount !== undefined && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {formatCurrency(negotiation.proposedAmount)}
              </span>
            </div>
          )}
          {negotiation.proposedInterestRate && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>{negotiation.proposedInterestRate}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {isFromMe ? "You sent" : "Received"} ·{" "}
            {format(new Date(negotiation.createdAt), "MMM d, yyyy")}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewHistory(negotiation.id)}
            data-testid={`button-view-history-${negotiation.id}`}
          >
            View archived details
            <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
