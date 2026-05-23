import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { OfferStudio, type OfferStudioData } from "@/components/offer-studio";
import { QuickCounterOffer, type QuickCounterData } from "@/components/quick-counter-offer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MarketflowOffer, MarketflowNegotiation, NegotiationMessage } from "@shared/schema";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Clock,
  User,
  Send,
  Check,
  X,
  RefreshCw,
  MessageSquare,
  FileText,
  Handshake,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Building2,
  Sparkles,
  Lock,
  ChevronRight,
} from "lucide-react";
import type { WholesaleDeal } from "@shared/schema";

export default function MarketflowNegotiate() {
  useSEO({
    title: "MarketFlow Negotiation Room",
    description: "Private MarketFlow negotiation surface.",
    noIndex: true,
  });
  return (
    <MarketplaceLayout>
      <NegotiationRoom />
    </MarketplaceLayout>
  );
}

interface NegotiationData {
  negotiation: MarketflowNegotiation;
  offers: MarketflowOffer[];
  messages: NegotiationMessage[];
}

interface Offer {
  id: string;
  sender: "investor" | "dreamscaper" | "admin";
  senderName: string;
  timestamp: Date;
  status: "pending" | "accepted" | "rejected" | "countered";
  terms: {
    offerPrice: number;
    earnestMoney: number;
    closeDate: string;
    inspectionPeriod: number;
    fundingType: string;
    notes: string;
  };
}

function transformMarketflowOffer(offer: MarketflowOffer, currentUserId?: string): Offer {
  const payload = offer.payload as Record<string, unknown>;
  const isCurrentUser = offer.createdBy === currentUserId;
  
  return {
    id: String(offer.id),
    sender: isCurrentUser ? "investor" : "dreamscaper",
    senderName: isCurrentUser ? "You" : "Counterparty",
    timestamp: new Date(offer.createdAt!),
    status: (offer.status as Offer["status"]) || "pending",
    terms: {
      offerPrice: (payload?.offerPrice as number) || (payload?.assignmentFee as number) || 0,
      earnestMoney: (payload?.earnestMoney as number) || 0,
      closeDate: (payload?.closeDate as string) || (payload?.closingDate as string) || "",
      inspectionPeriod: (payload?.inspectionPeriod as number) || 10,
      fundingType: (payload?.fundingType as string) || "cash",
      notes: (payload?.notes as string) || (payload?.message as string) || "",
    },
  };
}

type FundingSource = "cash_reserves" | "hard_money" | "conventional" | "private_lender" | "self_directed_ira";

function mapFundingTypeToSource(fundingType: string | undefined): FundingSource {
  const mapping: Record<string, FundingSource> = {
    "cash": "cash_reserves",
    "cash_reserves": "cash_reserves",
    "hard_money": "hard_money",
    "hardMoney": "hard_money",
    "conventional": "conventional",
    "private": "private_lender",
    "private_lender": "private_lender",
    "ira": "self_directed_ira",
    "self_directed_ira": "self_directed_ira",
  };
  return mapping[fundingType || "cash"] || "cash_reserves";
}

function NegotiationRoom() {
  const params = useParams<{ id: string; lane?: string }>();
  const dealId = params.id;
  const urlLane = (params.lane?.toUpperCase() || "WHOLESALE") as "WHOLESALE" | "CAPITAL" | "LISTING";
  const { toast } = useToast();
  const { user, isAuthenticated } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<"offers" | "chat" | "terms">("offers");
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [offerMode, setOfferMode] = useState<"new" | "counter">("new");
  const [counterOfferData, setCounterOfferData] = useState<Offer["terms"] | undefined>(undefined);
  const [quickCounterOpen, setQuickCounterOpen] = useState(false);
  const [quickCounterPrevious, setQuickCounterPrevious] = useState<QuickCounterData | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const lane = urlLane;

  const { data: wholesaleDeal, isLoading: wholesaleLoading } = useQuery<WholesaleDeal>({
    queryKey: ['/api/wholesale-deals', dealId],
    enabled: !!dealId && lane === "WHOLESALE",
  });

  const { data: capitalProject, isLoading: capitalLoading } = useQuery<any>({
    queryKey: ['/api/capital-projects', dealId],
    enabled: !!dealId && lane === "CAPITAL",
  });

  const { data: listing, isLoading: listingLoading } = useQuery<any>({
    queryKey: ['/api/retail-listings', dealId],
    enabled: !!dealId && lane === "LISTING",
  });

  const deal = lane === "WHOLESALE" ? wholesaleDeal : lane === "CAPITAL" ? capitalProject : listing;
  const dealOwnerId = deal?.submittedBy || deal?.operatorId || deal?.createdBy || null;

  const { data: dealNegotiations } = useQuery<MarketflowNegotiation[]>({
    queryKey: ['/api/marketflow/negotiations/deal', lane, dealId],
    enabled: !!dealId && isAuthenticated,
  });
  
  const currentNegotiation = dealNegotiations?.find(
    n => n.posterId === user?.id || n.counterpartyId === user?.id
  );

  const { data: negotiationData, isLoading: negotiationLoading, refetch: refetchNegotiation } = useQuery<NegotiationData>({
    queryKey: ['/api/marketflow/negotiations', currentNegotiation?.id],
    enabled: !!currentNegotiation?.id && isAuthenticated,
  });

  const offers = negotiationData?.offers?.map(o => transformMarketflowOffer(o, user?.id)) || [];
  const messages = negotiationData?.messages || [];
  const isLoading = wholesaleLoading || capitalLoading || listingLoading || negotiationLoading;

  const createOfferMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (!dealId) {
        throw new Error("Deal ID is required to submit an offer");
      }
      
      const negotiation = currentNegotiation;
      const recipientId = negotiation 
        ? (negotiation.posterId === user?.id ? negotiation.counterpartyId : negotiation.posterId)
        : dealOwnerId;
      
      if (!recipientId) {
        throw new Error("Cannot determine deal owner for this offer");
      }
      
      // Parse numeric IDs for wholesale deals, pass as-is for capital/listings (UUIDs)
      let parsedDealId: number | string = dealId;
      if (lane === "WHOLESALE") {
        const numericId = parseInt(dealId, 10);
        if (isNaN(numericId)) {
          throw new Error("Invalid deal ID format for wholesale deal");
        }
        parsedDealId = numericId;
      }
      
      const res = await apiRequest("POST", `/api/marketflow/offers`, {
        lane,
        dealId: parsedDealId,
        recipientId,
        offerKind: lane === "WHOLESALE" ? "WHOLESALE_ASSIGNMENT" : lane === "CAPITAL" ? "CAPITAL_INVESTMENT" : "LISTING_INQUIRY",
        payload,
      });
      return res.json();
    },
    onSuccess: () => {
      refetchNegotiation();
      queryClient.invalidateQueries({ queryKey: ['/api/marketflow/negotiations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketflow/negotiations/deal', lane, dealId] });
      toast({
        title: "Offer Sent!",
        description: "Your offer has been submitted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send offer",
        variant: "destructive",
      });
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ offerId, action, counterPayload }: { offerId: number; action: string; counterPayload?: Record<string, unknown> }) => {
      const res = await apiRequest("POST", `/api/marketflow/offers/${offerId}/respond`, { action, counterPayload });
      return res.json();
    },
    onSuccess: () => {
      refetchNegotiation();
      queryClient.invalidateQueries({ queryKey: ['/api/marketflow/negotiations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to respond to offer",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!currentNegotiation?.id) {
        throw new Error("No active negotiation to send message to");
      }
      const res = await apiRequest("POST", `/api/marketflow/negotiations/${currentNegotiation.id}/messages`, { content, messageType: "text" });
      return res.json();
    },
    onSuccess: () => {
      setChatMessage("");
      refetchNegotiation();
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: Offer["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-amber-500/50 text-amber-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "countered":
        return <Badge variant="secondary"><ArrowRightLeft className="w-3 h-3 mr-1" />Countered</Badge>;
    }
  };

  const getSenderIcon = (sender: Offer["sender"]) => {
    switch (sender) {
      case "investor":
        return <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>;
      case "dreamscaper":
        return <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center"><Building2 className="w-4 h-4 text-secondary-foreground" /></div>;
      case "admin":
        return <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Sparkles className="w-4 h-4 text-muted-foreground" /></div>;
    }
  };

  const handleSubmitOffer = async (data: OfferStudioData) => {
    const offerPayload = {
      offerPrice: data.offerPrice,
      earnestMoney: data.earnestMoney,
      closeDate: data.closeDate,
      inspectionPeriod: data.inspectionPeriod,
      fundingType: data.fundingSource,
      notes: data.notes || "",
    };
    
    const latestOffer = offers[offers.length - 1];
    
    if (latestOffer && latestOffer.sender !== "investor") {
      respondMutation.mutate({
        offerId: parseInt(latestOffer.id),
        action: "counter",
        counterPayload: offerPayload,
      });
    } else {
      createOfferMutation.mutate(offerPayload);
    }
    
    setOfferDialogOpen(false);
    setCounterOfferData(undefined);
  };

  const openNewOffer = () => {
    setOfferMode("new");
    setCounterOfferData(undefined);
    setOfferDialogOpen(true);
  };

  const openCounterOffer = (offer: Offer) => {
    setOfferMode("counter");
    setCounterOfferData(offer.terms);
    setOfferDialogOpen(true);
  };

  const openQuickCounter = (offer: Offer) => {
    setQuickCounterPrevious({
      offerPrice: offer.terms.offerPrice,
      earnestMoney: offer.terms.earnestMoney,
      closeDate: offer.terms.closeDate,
      inspectionPeriod: offer.terms.inspectionPeriod,
      notes: offer.terms.notes,
    });
    setQuickCounterOpen(true);
  };

  const handleQuickCounter = (data: QuickCounterData) => {
    const counterPayload = {
      offerPrice: data.offerPrice,
      earnestMoney: data.earnestMoney,
      closeDate: data.closeDate,
      inspectionPeriod: data.inspectionPeriod,
      fundingType: "cash",
      notes: data.notes || "",
    };
    
    const latestOffer = offers[offers.length - 1];
    
    if (latestOffer && latestOffer.sender !== "investor") {
      respondMutation.mutate({
        offerId: parseInt(latestOffer.id),
        action: "counter",
        counterPayload,
      }, {
        onSuccess: () => {
          toast({
            title: "Counter Sent!",
            description: "Your counter-offer has been submitted.",
          });
        },
      });
    } else {
      createOfferMutation.mutate(counterPayload);
    }
    
    setQuickCounterOpen(false);
    setQuickCounterPrevious(null);
  };

  const handleAcceptOffer = (offerId: string) => {
    respondMutation.mutate({
      offerId: parseInt(offerId),
      action: "accept",
    }, {
      onSuccess: () => {
        toast({
          title: "Offer Accepted",
          description: "Congratulations! The deal has been accepted.",
        });
      },
    });
  };

  const handleRejectOffer = (offerId: string) => {
    respondMutation.mutate({
      offerId: parseInt(offerId),
      action: "reject",
    }, {
      onSuccess: () => {
        toast({
          title: "Offer Rejected",
          description: "The offer has been declined.",
        });
      },
    });
  };
  
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    sendMessageMutation.mutate({ content: chatMessage.trim() });
  };

  const latestOffer = offers[offers.length - 1];
  const agreementReached = latestOffer?.status === "accepted";

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <Building2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Deal Not Found</h3>
          <p className="text-muted-foreground mb-6">This deal may have been removed or is no longer available.</p>
          <Link href="/marketflow/deals">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/marketflow/deals/${dealId}`}>
            <Button variant="ghost" size="sm" data-testid="button-back-to-deal">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deal
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold" data-testid="text-negotiation-title">Negotiation Room</h1>
            <p className="text-sm text-muted-foreground">{deal.propertyAddress}</p>
          </div>
        </div>
        {agreementReached && (
          <Badge className="bg-green-500 text-white gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Agreement Reached
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Button 
                  variant={activeTab === "offers" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setActiveTab("offers")}
                  data-testid="tab-offers"
                >
                  <Handshake className="w-4 h-4 mr-2" />
                  Offer Ladder
                </Button>
                <Button 
                  variant={activeTab === "chat" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setActiveTab("chat")}
                  data-testid="tab-chat"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button 
                  variant={activeTab === "terms" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setActiveTab("terms")}
                  data-testid="tab-terms"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Terms
                </Button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              {activeTab === "offers" && (
                <div className="space-y-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {offers.map((offer, index) => (
                        <div 
                          key={offer.id} 
                          className={`p-4 rounded-lg border ${offer.sender === "investor" ? "ml-8 bg-primary/5 border-primary/20" : "mr-8 bg-muted/50"}`}
                          data-testid={`offer-card-${offer.id}`}
                        >
                          <div className="flex items-start gap-3">
                            {getSenderIcon(offer.sender)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{offer.senderName}</span>
                                  {getStatusBadge(offer.status)}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {offer.timestamp.toLocaleDateString()} {offer.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Offer Price:</span>
                                  <span className="font-semibold">{formatCurrency(offer.terms.offerPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Earnest:</span>
                                  <span>{formatCurrency(offer.terms.earnestMoney)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Close:</span>
                                  <span>{new Date(offer.terms.closeDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Inspection:</span>
                                  <span>{offer.terms.inspectionPeriod} days</span>
                                </div>
                              </div>

                              {offer.terms.notes && (
                                <p className="text-sm text-muted-foreground italic border-l-2 border-muted pl-3">
                                  "{offer.terms.notes}"
                                </p>
                              )}

                              {offer.status === "pending" && offer.sender !== "investor" && (
                                <div className="flex gap-2 mt-4">
                                  <Button 
                                    size="sm" 
                                    className="bg-green-500 hover:bg-green-600"
                                    onClick={() => handleAcceptOffer(offer.id)}
                                    data-testid={`button-accept-${offer.id}`}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Accept
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleRejectOffer(offer.id)}
                                    data-testid={`button-reject-${offer.id}`}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => openQuickCounter(offer)}
                                    data-testid={`button-quick-counter-${offer.id}`}
                                  >
                                    <RefreshCw className="w-4 h-4 mr-1" />
                                    Quick Counter
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {!agreementReached && (
                    <div className="pt-4 border-t">
                      <Button 
                        className="w-full" 
                        onClick={openNewOffer}
                        data-testid="button-new-offer"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit New Offer
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "chat" && (
                <div className="space-y-4">
                  <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-3">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isMe = msg.senderId === user?.id;
                          return (
                            <div 
                              key={msg.id} 
                              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                              <div className={`max-w-[80%] p-3 rounded-lg ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                <p className="text-sm">{msg.content}</p>
                                <span className={`text-xs ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                  {new Date(msg.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                  {!currentNegotiation && (
                    <p className="text-sm text-muted-foreground text-center py-2 bg-muted/50 rounded-lg">
                      Send an offer first to start chatting with the deal owner
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Textarea 
                      placeholder={currentNegotiation ? "Type a message..." : "Chat available after sending an offer..."}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && currentNegotiation) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={!currentNegotiation}
                      className="flex-1 min-h-[60px] resize-none"
                      data-testid="input-chat-message"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending || !chatMessage.trim() || !currentNegotiation}
                      title={!currentNegotiation ? "Send an offer first to start chatting" : "Send message"}
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "terms" && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border">
                      <Label className="text-xs text-muted-foreground">ASKING PRICE</Label>
                      <p className="text-xl font-bold">{formatCurrency(deal.askingPrice || 0)}</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <Label className="text-xs text-muted-foreground">CONTRACT PRICE</Label>
                      <p className="text-xl font-bold">{formatCurrency(deal.contractPrice || 0)}</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <Label className="text-xs text-muted-foreground">ASSIGNMENT FEE</Label>
                      <p className="text-xl font-bold">{formatCurrency(deal.assignmentFee || 0)}</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <Label className="text-xs text-muted-foreground">ARV</Label>
                      <p className="text-xl font-bold">{formatCurrency(deal.arv || 0)}</p>
                    </div>
                  </div>

                  {latestOffer && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Handshake className="w-4 h-4" />
                          Latest Offer Terms
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <Label className="text-xs text-muted-foreground">Offer Price</Label>
                            <p className="font-semibold">{formatCurrency(latestOffer.terms.offerPrice)}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Earnest Money</Label>
                            <p className="font-semibold">{formatCurrency(latestOffer.terms.earnestMoney)}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Close Date</Label>
                            <p className="font-semibold">{new Date(latestOffer.terms.closeDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Inspection Period</Label>
                            <p className="font-semibold">{latestOffer.terms.inspectionPeriod} days</p>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs text-muted-foreground">Funding Type</Label>
                            <p className="font-semibold capitalize">{latestOffer.terms.fundingType.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {agreementReached && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  Agreement Reached
                </CardTitle>
                <CardDescription>
                  Congratulations! Both parties have agreed on the terms. Next steps below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 opacity-60" disabled>
                    <FileText className="w-5 h-5" />
                    <span>Generate Term Sheet</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Coming Soon</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 opacity-60" disabled>
                    <Lock className="w-5 h-5" />
                    <span>Move to Data Room</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Coming Soon</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 opacity-60" disabled>
                    <Sparkles className="w-5 h-5" />
                    <span>Mark as Funded</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Coming Soon</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deal Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                {deal.images?.[0] ? (
                  <img src={deal.images[0]} alt={deal.propertyAddress || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold">{deal.propertyAddress}</h3>
                <p className="text-sm text-muted-foreground">{deal.city}, {deal.state} {deal.zipCode}</p>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Type</span>
                  <span>{deal.propertyType || "Residential"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Beds / Baths</span>
                  <span>{deal.bedrooms || "—"} / {deal.bathrooms || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sq Ft</span>
                  <span>{deal.sqft?.toLocaleString() || "—"}</span>
                </div>
              </div>

              <Separator />

              <Link href={`/marketflow/deals/${dealId}`}>
                <Button variant="outline" className="w-full" size="sm">
                  View Full Deal Details
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Wholesaler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Wholesaler #{((deal as any).externalWholesalerId || deal.submittedBy)?.slice(-6) || "—"}</p>
                  <p className="text-xs text-muted-foreground">Verified Seller</p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active in negotiation
              </Badge>
            </CardContent>
          </Card>

          <PeggyNegotiationAdvisor 
            dealInfo={{
              propertyAddress: deal?.propertyAddress || "",
              askingPrice: deal?.askingPrice || 0,
              arv: deal?.arv,
              lane,
            }}
            offers={offers}
            agreementReached={agreementReached}
          />
        </div>
      </div>

      {deal && (
        <OfferStudio
          open={offerDialogOpen}
          onOpenChange={setOfferDialogOpen}
          mode={offerMode}
          dealInfo={{
            id: dealId || "",
            propertyAddress: deal.propertyAddress || "",
            askingPrice: deal.askingPrice || 0,
            arv: deal.arv || undefined,
            repairCost: (deal as any).repairCosts || (deal as any).repairCost || undefined,
            wholesalerName: `Wholesaler #${((deal as any).externalWholesalerId || deal.submittedBy)?.slice(-6) || "—"}`,
          }}
          previousOffer={counterOfferData ? {
            structureType: "cash",
            offerPrice: counterOfferData.offerPrice,
            earnestMoney: counterOfferData.earnestMoney,
            closeDate: counterOfferData.closeDate,
            inspectionPeriod: counterOfferData.inspectionPeriod,
            fundingSource: mapFundingTypeToSource(counterOfferData.fundingType),
            notes: counterOfferData.notes,
          } : undefined}
          onSubmit={handleSubmitOffer}
        />
      )}

      {deal && quickCounterPrevious && (
        <QuickCounterOffer
          open={quickCounterOpen}
          onOpenChange={setQuickCounterOpen}
          previousOffer={quickCounterPrevious}
          dealInfo={{
            propertyAddress: deal.propertyAddress || "",
            askingPrice: deal.askingPrice || 0,
          }}
          onSubmit={handleQuickCounter}
        />
      )}
    </div>
  );
}

interface PeggyAdvisorProps {
  dealInfo: {
    propertyAddress: string;
    askingPrice: number;
    arv?: number;
    lane: string;
  };
  offers: Offer[];
  agreementReached: boolean;
}

function PeggyNegotiationAdvisor({ dealInfo, offers, agreementReached }: PeggyAdvisorProps) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const latestOffer = offers[offers.length - 1];
  const offerCount = offers.length;
  
  const getContextualTips = () => {
    if (agreementReached) {
      return [
        "Congratulations on reaching agreement!",
        "Review the final terms carefully before proceeding",
        "Consider generating a term sheet to formalize the deal",
      ];
    }
    if (offerCount === 0) {
      return [
        "Start by submitting your first offer",
        "Review the deal terms before making an offer",
        "Consider your funding strategy and timeline",
      ];
    }
    if (latestOffer?.sender === "investor" && latestOffer?.status === "pending") {
      return [
        "Your offer is pending - await counterparty response",
        "Use chat to clarify any questions they might have",
        "Stay responsive to speed up negotiations",
      ];
    }
    if (latestOffer?.sender === "dreamscaper" && latestOffer?.status === "pending") {
      return [
        "You have a pending offer to review",
        "Consider the terms carefully before responding",
        "Use Quick Counter for minor adjustments",
      ];
    }
    return [
      "Be responsive to counter-offers",
      "Include earnest money to show commitment",
      "Clearly state your funding source",
    ];
  };

  const quickPrompts = [
    "What's a fair offer for this property?",
    "How should I counter this offer?",
    "What due diligence should I do?",
    "Explain the negotiation timeline",
  ];

  const handleAskPeggy = async (promptText: string) => {
    if (!promptText.trim()) return;
    
    setIsLoading(true);
    setAiResponse(null);
    
    try {
      const context = `
Deal: ${dealInfo.propertyAddress}
Asking Price: $${dealInfo.askingPrice?.toLocaleString() || "N/A"}
ARV: ${dealInfo.arv ? `$${dealInfo.arv.toLocaleString()}` : "Not specified"}
Lane: ${dealInfo.lane}
Offer Count: ${offerCount}
${latestOffer ? `Latest Offer: $${latestOffer.terms.offerPrice.toLocaleString()} (${latestOffer.status})` : "No offers yet"}
Agreement Status: ${agreementReached ? "Reached" : "In negotiation"}

User Question: ${promptText}
      `.trim();

      const res = await fetch("/api/peggy-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptText,
          context,
          mode: "negotiation_advisor",
        }),
      });
      
      if (!res.ok) throw new Error("Failed to get response");
      
      const data = await res.json();
      setAiResponse(data.response || data.message || "I can help you with this negotiation. Could you provide more details?");
    } catch (error) {
      setAiResponse("I'm having trouble connecting right now. Please try again or check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const tips = getContextualTips();

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10" data-testid="card-peggy-advisor">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Peggy AI Advisor
          <Badge variant="secondary" className="ml-auto text-xs">Beta</Badge>
        </CardTitle>
        <CardDescription className="text-sm">
          Get real-time negotiation guidance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg border">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm space-y-1">
            {tips.map((tip, i) => (
              <p key={i} className="text-muted-foreground">• {tip}</p>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.slice(0, expanded ? 4 : 2).map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                setQuery(prompt);
                setExpanded(true);
                handleAskPeggy(prompt);
              }}
              disabled={isLoading}
              data-testid={`button-quick-prompt-${prompt.slice(0,10)}`}
            >
              {prompt}
            </Button>
          ))}
        </div>

        {!expanded && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => setExpanded(true)}
            data-testid="button-expand-peggy"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Ask Peggy a question
          </Button>
        )}

        {expanded && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex gap-2">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about this negotiation..."
                className="min-h-[60px] text-sm resize-none"
                data-testid="input-peggy-question"
              />
            </div>
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => handleAskPeggy(query)}
              disabled={isLoading || !query.trim()}
              data-testid="button-ask-peggy"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 mr-1" />
                  Ask Peggy
                </>
              )}
            </Button>

            {aiResponse && (
              <div className="p-3 bg-background rounded-lg border text-sm space-y-2" data-testid="text-peggy-response">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Peggy's Response
                </div>
                <p className="text-foreground whitespace-pre-wrap">{aiResponse}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
