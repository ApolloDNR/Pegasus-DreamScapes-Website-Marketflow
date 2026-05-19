import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useSearch, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Building2,
  Sparkles,
  Send,
  Check,
  X,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Handshake,
  AlertCircle,
  Lock,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  WholesaleDeal,
  MarketflowOffer,
  MarketflowNegotiation,
  NegotiationMessage,
} from "@shared/schema";
import { isAdminRole, isWholesalerRole, isDreamscaperRole, isBuyerRole, isInvestorRole } from "@shared/schema";

type Lane = "WHOLESALE" | "CAPITAL" | "LISTING";
type OfferStatus = "pending" | "accepted" | "rejected" | "countered";

interface LadderOffer {
  id: string;
  side: "me" | "them";
  senderName: string;
  timestamp: Date;
  status: OfferStatus;
  terms: {
    offerPrice: number;
    earnestMoney: number;
    closeDate: string;
    inspectionPeriod: number;
    fundingType: string;
    notes: string;
  };
}

function transformOffer(offer: MarketflowOffer, currentUserId?: string): LadderOffer {
  const payload = (offer.payload as Record<string, unknown>) || {};
  const isMe = offer.createdBy === currentUserId;
  return {
    id: String(offer.id),
    side: isMe ? "me" : "them",
    senderName: isMe ? "You" : "Counterparty",
    timestamp: new Date(offer.createdAt!),
    status: (offer.status as OfferStatus) || "pending",
    terms: {
      offerPrice:
        (payload.offerPrice as number) ||
        (payload.assignmentFee as number) ||
        0,
      earnestMoney: (payload.earnestMoney as number) || 0,
      closeDate:
        (payload.closeDate as string) ||
        (payload.closingDate as string) ||
        "",
      inspectionPeriod: (payload.inspectionPeriod as number) || 10,
      fundingType: (payload.fundingType as string) || "cash",
      notes:
        (payload.notes as string) || (payload.message as string) || "",
    },
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatusBadge({ status }: { status: OfferStatus }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="border-amber-500/50 text-amber-600" data-testid={`badge-status-${status}`}>
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case "accepted":
      return (
        <Badge className="bg-green-600 hover:bg-green-600" data-testid={`badge-status-${status}`}>
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Accepted
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive" data-testid={`badge-status-${status}`}>
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    case "countered":
      return (
        <Badge variant="secondary" data-testid={`badge-status-${status}`}>
          <ArrowRightLeft className="w-3 h-3 mr-1" />
          Countered
        </Badge>
      );
  }
}

function AccessDenied({ reason }: { reason: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold" data-testid="text-access-denied-title">
            Offer Studio Restricted
          </h2>
          <p className="text-muted-foreground text-sm">{reason}</p>
          <Link href="/marketflow">
            <Button variant="outline" data-testid="button-back-to-marketflow">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to MarketFlow
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MarketflowOfferStudioPage() {
  const params = useParams<{ dealId: string }>();
  const search = useSearch();
  const [, setLocation] = useLocation();
  const { user, profile, isAuthenticated, userRole, isAdmin } = useSupabaseAuth();
  const { toast } = useToast();

  const dealId = params.dealId;
  const laneParam = (new URLSearchParams(search).get("lane") || "WHOLESALE").toUpperCase();
  const lane: Lane = (["WHOLESALE", "CAPITAL", "LISTING"].includes(laneParam) ? laneParam : "WHOLESALE") as Lane;

  // Role gating: operator (dreamscaper), wholesaler, buyer/investor — admin always allowed
  const roleAllowed = useMemo(() => {
    if (!userRole) return false;
    if (isAdmin || isAdminRole(userRole)) return true;
    return (
      isWholesalerRole(userRole) ||
      isDreamscaperRole(userRole) ||
      isBuyerRole(userRole) ||
      isInvestorRole(userRole)
    );
  }, [userRole, isAdmin]);

  // --- Deal loading ---
  const { data: wholesaleDeal, isLoading: wholesaleLoading } = useQuery<WholesaleDeal>({
    queryKey: ["/api/wholesale-deals", dealId],
    enabled: !!dealId && lane === "WHOLESALE" && isAuthenticated,
  });
  const { data: capitalProject, isLoading: capitalLoading } = useQuery<any>({
    queryKey: ["/api/capital-projects", dealId],
    enabled: !!dealId && lane === "CAPITAL" && isAuthenticated,
  });
  const { data: listing, isLoading: listingLoading } = useQuery<any>({
    queryKey: ["/api/retail-listings", dealId],
    enabled: !!dealId && lane === "LISTING" && isAuthenticated,
  });

  const deal: any =
    lane === "WHOLESALE" ? wholesaleDeal : lane === "CAPITAL" ? capitalProject : listing;
  const dealOwnerId = deal?.submittedBy || deal?.operatorId || deal?.createdBy || null;

  // --- Negotiation loading ---
  const { data: dealNegotiations } = useQuery<MarketflowNegotiation[]>({
    queryKey: ["/api/marketflow/negotiations/deal", lane, dealId],
    enabled: !!dealId && isAuthenticated && roleAllowed,
  });

  const currentNegotiation = dealNegotiations?.find(
    (n) => n.posterId === user?.id || n.counterpartyId === user?.id,
  );

  const {
    data: negotiationData,
    isLoading: negotiationLoading,
    refetch: refetchNegotiation,
  } = useQuery<{
    negotiation: MarketflowNegotiation;
    offers: MarketflowOffer[];
    messages: NegotiationMessage[];
  }>({
    queryKey: ["/api/marketflow/negotiations", currentNegotiation?.id],
    enabled: !!currentNegotiation?.id && isAuthenticated,
  });

  const offers: LadderOffer[] = useMemo(
    () => (negotiationData?.offers || []).map((o) => transformOffer(o, user?.id)),
    [negotiationData, user?.id],
  );
  const messages: NegotiationMessage[] = negotiationData?.messages || [];
  const latestOffer = offers[offers.length - 1];
  const agreementReached = latestOffer?.status === "accepted";

  // Peggy's page context is resolved from the URL path in peggy-context.tsx
  // (path includes "/offer-studio" → "offer-studio"). Deal metadata is passed
  // into the advisor pane directly when the user asks a question, so we
  // intentionally don't call setDealContext here — doing so would override
  // page back to "wholesale-deal"/"capital-project" and lose the
  // offer-studio system prompt.

  // --- Chat panel state ---
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const unreadIncoming = useMemo(
    () => messages.filter((m) => m.senderId !== user?.id).length,
    [messages, user?.id],
  );
  useEffect(() => {
    if (chatOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatOpen, messages.length]);

  // --- Composer state (counter-offer ladder) ---
  const [composer, setComposer] = useState({
    offerPrice: 0,
    earnestMoney: 5000,
    closeDate: "",
    inspectionPeriod: 10,
    fundingType: "cash",
    notes: "",
  });

  // Seed composer from latest counterparty offer for fast counters
  useEffect(() => {
    if (!latestOffer) {
      if (deal?.askingPrice && composer.offerPrice === 0) {
        setComposer((c) => ({ ...c, offerPrice: Math.round((deal.askingPrice || 0) * 0.92) }));
      }
      return;
    }
    if (latestOffer.side === "them") {
      setComposer({
        offerPrice: latestOffer.terms.offerPrice,
        earnestMoney: latestOffer.terms.earnestMoney || 5000,
        closeDate: latestOffer.terms.closeDate || "",
        inspectionPeriod: latestOffer.terms.inspectionPeriod || 10,
        fundingType: latestOffer.terms.fundingType || "cash",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestOffer?.id, deal?.askingPrice]);

  // --- Mutations ---
  const createOfferMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (!dealId) throw new Error("Deal ID is required");
      const negotiation = currentNegotiation;
      const recipientId = negotiation
        ? negotiation.posterId === user?.id
          ? negotiation.counterpartyId
          : negotiation.posterId
        : dealOwnerId;
      if (!recipientId) throw new Error("Cannot determine deal owner for this offer");

      let parsedDealId: number | string = dealId;
      if (lane === "WHOLESALE") {
        const n = parseInt(dealId, 10);
        if (isNaN(n)) throw new Error("Invalid deal ID format for wholesale deal");
        parsedDealId = n;
      }

      const res = await apiRequest("POST", "/api/marketflow/offers", {
        lane,
        dealId: parsedDealId,
        recipientId,
        offerKind:
          lane === "WHOLESALE"
            ? "WHOLESALE_ASSIGNMENT"
            : lane === "CAPITAL"
            ? "CAPITAL_INVESTMENT"
            : "LISTING_INQUIRY",
        payload,
      });
      return res.json();
    },
    onSuccess: () => {
      refetchNegotiation();
      queryClient.invalidateQueries({ queryKey: ["/api/marketflow/negotiations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketflow/negotiations/deal", lane, dealId] });
      toast({ title: "Offer sent", description: "Your offer is on the ladder." });
    },
    onError: (err: any) =>
      toast({
        title: "Couldn't send offer",
        description: err?.message || "Try again in a moment.",
        variant: "destructive",
      }),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentNegotiation?.id) {
        throw new Error("Send an offer first to start chatting.");
      }
      const res = await apiRequest(
        "POST",
        `/api/marketflow/negotiations/${currentNegotiation.id}/messages`,
        { content, messageType: "text" },
      );
      return res.json();
    },
    onSuccess: () => {
      setChatDraft("");
      refetchNegotiation();
    },
    onError: (err: any) =>
      toast({
        title: "Couldn't send message",
        description: err?.message || "Try again in a moment.",
        variant: "destructive",
      }),
  });

  const respondMutation = useMutation({
    mutationFn: async ({
      offerId,
      action,
      counterPayload,
    }: {
      offerId: number;
      action: "accept" | "reject" | "counter";
      counterPayload?: Record<string, unknown>;
    }) => {
      const res = await apiRequest("POST", `/api/marketflow/offers/${offerId}/respond`, {
        action,
        counterPayload,
      });
      return res.json();
    },
    onSuccess: () => {
      refetchNegotiation();
      queryClient.invalidateQueries({ queryKey: ["/api/marketflow/negotiations"] });
    },
    onError: (err: any) =>
      toast({
        title: "Couldn't update offer",
        description: err?.message || "Try again in a moment.",
        variant: "destructive",
      }),
  });

  // --- Handlers ---
  const handleSendComposer = () => {
    if (composer.offerPrice < 1000) {
      toast({
        title: "Offer too low",
        description: "Enter at least $1,000.",
        variant: "destructive",
      });
      return;
    }
    const payload = { ...composer };
    if (latestOffer && latestOffer.side === "them" && latestOffer.status === "pending") {
      respondMutation.mutate({
        offerId: parseInt(latestOffer.id),
        action: "counter",
        counterPayload: payload,
      });
    } else {
      createOfferMutation.mutate(payload);
    }
  };

  const handleAccept = (offerId: string) =>
    respondMutation.mutate(
      { offerId: parseInt(offerId), action: "accept" },
      {
        onSuccess: () =>
          toast({ title: "Offer accepted", description: "Agreement reached." }),
      },
    );

  const handleReject = (offerId: string) =>
    respondMutation.mutate(
      { offerId: parseInt(offerId), action: "reject" },
      {
        onSuccess: () =>
          toast({ title: "Offer declined", description: "The offer has been rejected." }),
      },
    );

  // --- Guards ---
  if (!isAuthenticated) {
    return (
      <AccessDenied reason="Sign in to use the Offer Studio. Negotiations are restricted to verified MarketFlow members." />
    );
  }

  if (!roleAllowed) {
    return (
      <AccessDenied reason="Offer Studio is available to operators, wholesalers, and verified buyers/investors. Update your role or contact the team if this looks wrong." />
    );
  }

  if (!dealId) {
    return <AccessDenied reason="Missing deal reference. Open Offer Studio from a deal card." />;
  }

  const isLoading = wholesaleLoading || capitalLoading || listingLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid lg:grid-cols-[1fr_1.2fr_1fr] gap-6">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Deal Not Found</h2>
            <p className="text-muted-foreground text-sm">
              This deal may have been removed or is no longer available for negotiation.
            </p>
            <Link href="/marketflow/deals">
              <Button variant="outline" data-testid="button-back-to-deals">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deals
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const propertyAddress = deal.propertyAddress || deal.title || deal.address || "Untitled deal";
  const askingPrice = deal.askingPrice || deal.fundingGoal || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="page-offer-studio">
      {/* Top bar */}
      <header className="border-b bg-card/60 backdrop-blur sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/marketflow/deals")}
              data-testid="button-exit-studio"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold">
                <Sparkles className="w-3 h-3" />
                Offer Studio · {lane}
              </div>
              <h1
                className="font-serif text-xl sm:text-2xl font-semibold tracking-tight truncate"
                data-testid="text-deal-title"
              >
                {propertyAddress}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {agreementReached && (
              <Badge className="bg-green-600 hover:bg-green-600 gap-1" data-testid="badge-agreement">
                <CheckCircle2 className="w-4 h-4" />
                Agreement Reached
              </Badge>
            )}
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Asking</div>
              <div className="font-serif text-lg font-semibold tabular-nums" data-testid="text-asking-price">
                {formatCurrency(askingPrice)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3-pane studio */}
      <div className="flex-1 grid lg:grid-cols-[minmax(280px,1fr)_minmax(320px,1.2fr)_minmax(280px,1fr)] gap-0">
        {/* LEFT: Deal context + offer history */}
        <aside className="border-r p-6 space-y-4 overflow-y-auto">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Deal Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="font-medium text-right truncate ml-2" data-testid="text-deal-address">
                  {propertyAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asking</span>
                <span className="font-semibold tabular-nums">{formatCurrency(askingPrice)}</span>
              </div>
              {deal.arv ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ARV</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(deal.arv)}</span>
                </div>
              ) : null}
              {deal.assignmentFee ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assignment Fee</span>
                  <span className="tabular-nums">{formatCurrency(deal.assignmentFee)}</span>
                </div>
              ) : null}
              {deal.city || deal.state ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span>
                    {deal.city}
                    {deal.city && deal.state ? ", " : ""}
                    {deal.state}
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Handshake className="w-4 h-4" />
                Offer Ladder
              </CardTitle>
              <Badge variant="outline" data-testid="badge-offer-count">
                {offers.length} {offers.length === 1 ? "offer" : "offers"}
              </Badge>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <ScrollArea className="h-[460px] pr-3">
                {negotiationLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                ) : offers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    <Handshake className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No offers yet. Send the first one from the composer.</p>
                  </div>
                ) : (
                  <div className="space-y-3" data-testid="list-offer-history">
                    {offers
                      .slice()
                      .reverse()
                      .map((offer) => (
                        <div
                          key={offer.id}
                          className={`p-3 rounded-lg border ${
                            offer.side === "me"
                              ? "bg-primary/5 border-primary/20"
                              : "bg-muted/40"
                          }`}
                          data-testid={`offer-row-${offer.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-xs">
                              <User className="w-3 h-3" />
                              <span className="font-medium">{offer.senderName}</span>
                              <StatusBadge status={offer.status} />
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {offer.timestamp.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="w-3 h-3" />
                              <span className="font-semibold text-foreground tabular-nums">
                                {formatCurrency(offer.terms.offerPrice)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <TrendingUp className="w-3 h-3" />
                              Earnest {formatCurrency(offer.terms.earnestMoney)}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {offer.terms.closeDate
                                ? new Date(offer.terms.closeDate).toLocaleDateString()
                                : "—"}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {offer.terms.inspectionPeriod}d insp.
                            </div>
                          </div>
                          {offer.terms.notes && (
                            <p className="text-xs text-muted-foreground italic mt-2 border-l-2 border-muted pl-2">
                              "{offer.terms.notes}"
                            </p>
                          )}
                          {offer.status === "pending" && offer.side === "them" && !agreementReached && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                                onClick={() => handleAccept(offer.id)}
                                disabled={respondMutation.isPending}
                                data-testid={`button-accept-${offer.id}`}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs"
                                onClick={() => handleReject(offer.id)}
                                disabled={respondMutation.isPending}
                                data-testid={`button-reject-${offer.id}`}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        {/* CENTER: Counter-offer composer */}
        <main className="p-6 overflow-y-auto">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {latestOffer && latestOffer.side === "them" && latestOffer.status === "pending"
                    ? "Counter Offer"
                    : "New Offer"}
                </CardTitle>
                {latestOffer && latestOffer.side === "them" && latestOffer.status === "pending" && (
                  <Badge variant="secondary" className="text-xs" data-testid="badge-countering">
                    <ArrowRightLeft className="w-3 h-3 mr-1" />
                    Replying to {formatCurrency(latestOffer.terms.offerPrice)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 flex-1 space-y-5">
              <fieldset disabled={agreementReached} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="offer-price" className="text-xs uppercase tracking-wider">
                      Offer Price
                    </Label>
                    <Input
                      id="offer-price"
                      type="number"
                      value={composer.offerPrice || ""}
                      onChange={(e) =>
                        setComposer((c) => ({ ...c, offerPrice: parseInt(e.target.value) || 0 }))
                      }
                      placeholder="0"
                      data-testid="input-offer-price"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="earnest-money" className="text-xs uppercase tracking-wider">
                      Earnest Money
                    </Label>
                    <Input
                      id="earnest-money"
                      type="number"
                      value={composer.earnestMoney || ""}
                      onChange={(e) =>
                        setComposer((c) => ({ ...c, earnestMoney: parseInt(e.target.value) || 0 }))
                      }
                      placeholder="5000"
                      data-testid="input-earnest-money"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="close-date" className="text-xs uppercase tracking-wider">
                      Close Date
                    </Label>
                    <Input
                      id="close-date"
                      type="date"
                      value={composer.closeDate}
                      onChange={(e) => setComposer((c) => ({ ...c, closeDate: e.target.value }))}
                      data-testid="input-close-date"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="inspection-period" className="text-xs uppercase tracking-wider">
                      Inspection (days)
                    </Label>
                    <Input
                      id="inspection-period"
                      type="number"
                      value={composer.inspectionPeriod || ""}
                      onChange={(e) =>
                        setComposer((c) => ({ ...c, inspectionPeriod: parseInt(e.target.value) || 0 }))
                      }
                      placeholder="10"
                      data-testid="input-inspection-period"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="funding-type" className="text-xs uppercase tracking-wider">
                    Funding Source
                  </Label>
                  <select
                    id="funding-type"
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                    value={composer.fundingType}
                    onChange={(e) => setComposer((c) => ({ ...c, fundingType: e.target.value }))}
                    data-testid="select-funding-type"
                  >
                    <option value="cash">Cash reserves</option>
                    <option value="hard_money">Hard money</option>
                    <option value="conventional">Conventional</option>
                    <option value="private_lender">Private lender</option>
                    <option value="self_directed_ira">Self-directed IRA</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs uppercase tracking-wider">
                    Notes to counterparty
                  </Label>
                  <Textarea
                    id="notes"
                    value={composer.notes}
                    onChange={(e) => setComposer((c) => ({ ...c, notes: e.target.value }))}
                    placeholder="Brief context — funding proof, timing constraints, contingencies."
                    rows={4}
                    data-testid="input-notes"
                  />
                </div>
              </fieldset>

              <div className="pt-2">
                {agreementReached ? (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-sm text-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 inline-block mr-2" />
                    Agreement reached. The composer is locked.
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSendComposer}
                    disabled={createOfferMutation.isPending || respondMutation.isPending}
                    data-testid="button-send-offer"
                  >
                    {createOfferMutation.isPending || respondMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {latestOffer && latestOffer.side === "them" && latestOffer.status === "pending"
                          ? "Send Counter"
                          : "Send Offer"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>

        {/* RIGHT: AI advisor */}
        <aside className="border-l p-6 overflow-y-auto">
          <PeggyAdvisor
            dealInfo={{
              propertyAddress,
              askingPrice,
              arv: deal.arv,
              lane,
            }}
            offers={offers}
            agreementReached={agreementReached}
          />
        </aside>
      </div>

      {/* Collapsible chat panel — fixed bottom-right */}
      <div
        className="fixed bottom-4 right-4 z-30 w-[360px] max-w-[calc(100vw-2rem)]"
        data-testid="panel-chat"
      >
        <Card className="shadow-xl border-primary/30">
          <button
            type="button"
            className="w-full flex items-center justify-between gap-2 px-4 py-3 hover-elevate active-elevate-2 rounded-t-md"
            onClick={() => setChatOpen((v) => !v)}
            data-testid="button-toggle-chat"
            aria-expanded={chatOpen}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Chat</span>
              {messages.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-5" data-testid="badge-chat-count">
                  {messages.length}
                </Badge>
              )}
              {!chatOpen && unreadIncoming > 0 && (
                <Badge className="bg-primary text-primary-foreground text-[10px] h-5" data-testid="badge-chat-incoming">
                  {unreadIncoming} new
                </Badge>
              )}
            </div>
            {chatOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {chatOpen && (
            <>
              <Separator />
              <CardContent className="p-3 space-y-3">
                <div
                  ref={chatScrollRef}
                  className="h-[280px] overflow-y-auto pr-1 space-y-2"
                  data-testid="list-chat-messages"
                >
                  {!currentNegotiation ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>Send an offer first to start chatting with the counterparty.</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>No messages yet. Say hello.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                          data-testid={`chat-message-${msg.id}`}
                        >
                          <div
                            className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                              isMe
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <span
                              className={`block text-[10px] mt-1 ${
                                isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}
                            >
                              {msg.createdAt
                                ? new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="flex gap-2 items-end">
                  <Textarea
                    value={chatDraft}
                    onChange={(e) => setChatDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && currentNegotiation) {
                        e.preventDefault();
                        if (chatDraft.trim()) sendMessageMutation.mutate(chatDraft.trim());
                      }
                    }}
                    placeholder={
                      currentNegotiation
                        ? "Type a message…"
                        : "Send an offer first to start chatting"
                    }
                    disabled={!currentNegotiation || sendMessageMutation.isPending}
                    className="min-h-[44px] max-h-[120px] resize-none text-sm flex-1"
                    rows={1}
                    data-testid="input-chat-message"
                  />
                  <Button
                    size="icon"
                    onClick={() => {
                      if (chatDraft.trim()) sendMessageMutation.mutate(chatDraft.trim());
                    }}
                    disabled={
                      !currentNegotiation ||
                      !chatDraft.trim() ||
                      sendMessageMutation.isPending
                    }
                    data-testid="button-send-chat-message"
                    aria-label="Send message"
                  >
                    {sendMessageMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

// =====================================================
// Peggy AI advisor pane (right-rail full height)
// =====================================================
interface AdvisorProps {
  dealInfo: { propertyAddress: string; askingPrice: number; arv?: number; lane: Lane };
  offers: LadderOffer[];
  agreementReached: boolean;
}

function PeggyAdvisor({ dealInfo, offers, agreementReached }: AdvisorProps) {
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const latestOffer = offers[offers.length - 1];
  const offerCount = offers.length;

  const tips = useMemo(() => {
    if (agreementReached)
      return [
        "Agreement is in place — confirm terms in writing.",
        "Move to data room and pull docs together.",
        "Lock the close date with all parties before drift.",
      ];
    if (offerCount === 0)
      return [
        "Anchor with a credible price — defend it with the numbers.",
        "Lead with funding source and timeline, not just price.",
        "Use Notes to surface contingencies up front.",
      ];
    if (latestOffer?.side === "me" && latestOffer.status === "pending")
      return [
        "Your offer is out — give the counterparty room to respond.",
        "If 24–48h pass, a brief check-in note keeps it alive.",
        "Prepare your fallback terms before they counter.",
      ];
    if (latestOffer?.side === "them" && latestOffer.status === "pending")
      return [
        "Counter with intent — only move on terms that matter.",
        "Earnest + inspection days are levers when price is stuck.",
        "Keep notes short and specific. No fluff.",
      ];
    return [
      "Stay structured. Every round should narrow the gap.",
      "If you're past round 3, name what's blocking and address it directly.",
    ];
  }, [agreementReached, offerCount, latestOffer]);

  const quickPrompts = [
    "What's a fair counter here?",
    "Which term should I move on?",
    "How do I frame this offer?",
    "What risks am I missing?",
  ];

  const askPeggy = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsLoading(true);
    setAiResponse(null);
    try {
      const context = [
        `Deal: ${dealInfo.propertyAddress}`,
        `Asking: $${dealInfo.askingPrice?.toLocaleString() || "N/A"}`,
        `ARV: ${dealInfo.arv ? `$${dealInfo.arv.toLocaleString()}` : "n/a"}`,
        `Lane: ${dealInfo.lane}`,
        `Offers: ${offerCount}`,
        latestOffer
          ? `Latest: $${latestOffer.terms.offerPrice.toLocaleString()} from ${latestOffer.senderName} (${latestOffer.status})`
          : "No offers yet",
        `Agreement: ${agreementReached ? "reached" : "open"}`,
      ].join("\n");

      const res = await fetch("/api/peggy-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptText,
          context,
          mode: "negotiation_advisor",
        }),
      });
      if (!res.ok) throw new Error("Peggy unavailable");
      const data = await res.json();
      setAiResponse(
        data.response ||
          data.message ||
          "I can help — share a little more about what's blocking you.",
      );
    } catch {
      setAiResponse("Peggy is offline right now. Try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 h-full flex flex-col" data-testid="card-peggy-advisor">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Peggy · Negotiation Advisor
          <Badge variant="secondary" className="ml-auto text-[10px]">
            Beta
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="p-3 bg-background/70 rounded-lg border space-y-1 text-sm">
          {tips.map((tip, i) => (
            <p key={i} className="text-muted-foreground" data-testid={`text-tip-${i}`}>
              • {tip}
            </p>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-supporting font-semibold">
            Quick prompts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt}
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => {
                  setQuery(prompt);
                  askPeggy(prompt);
                }}
                disabled={isLoading}
                data-testid={`button-prompt-${prompt.slice(0, 10).replace(/\s+/g, "-")}`}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2 flex-1 flex flex-col">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Peggy about this negotiation…"
            className="min-h-[80px] text-sm resize-none"
            data-testid="input-peggy-question"
          />
          <Button
            size="sm"
            onClick={() => askPeggy(query)}
            disabled={isLoading || !query.trim()}
            data-testid="button-ask-peggy"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Thinking…
              </>
            ) : (
              <>
                <MessageSquare className="w-3 h-3 mr-1" />
                Ask Peggy
              </>
            )}
          </Button>

          {aiResponse && (
            <div
              className="p-3 bg-background rounded-lg border text-sm space-y-2 mt-2"
              data-testid="text-peggy-response"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3 text-primary" />
                Peggy's Response
              </div>
              <p className="text-foreground whitespace-pre-wrap">{aiResponse}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
