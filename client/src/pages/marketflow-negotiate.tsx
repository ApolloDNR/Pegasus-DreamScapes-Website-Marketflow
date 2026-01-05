import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnderConstructionBadge, UnderConstructionCard } from "@/components/under-construction";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { OfferFormDialog, type OfferFormData } from "@/components/offer-form-dialog";
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
  return (
    <MarketplaceLayout>
      <NegotiationRoom />
    </MarketplaceLayout>
  );
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

const mockOffers: Offer[] = [
  {
    id: "1",
    sender: "investor",
    senderName: "You",
    timestamp: new Date(Date.now() - 86400000 * 2),
    status: "countered",
    terms: {
      offerPrice: 145000,
      earnestMoney: 5000,
      closeDate: "2026-02-15",
      inspectionPeriod: 10,
      fundingType: "cash",
      notes: "Ready to close quickly. Proof of funds available.",
    },
  },
  {
    id: "2",
    sender: "dreamscaper",
    senderName: "Wholesaler #A1B2C3",
    timestamp: new Date(Date.now() - 86400000),
    status: "pending",
    terms: {
      offerPrice: 155000,
      earnestMoney: 7500,
      closeDate: "2026-02-20",
      inspectionPeriod: 7,
      fundingType: "cash",
      notes: "Counter offer: Higher price but faster close possible.",
    },
  },
];

function NegotiationRoom() {
  const params = useParams<{ id: string }>();
  const dealId = params.id;
  const { toast } = useToast();
  const { user, isAuthenticated } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<"offers" | "chat" | "terms">("offers");
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [offerMode, setOfferMode] = useState<"new" | "counter">("new");
  const [counterOfferData, setCounterOfferData] = useState<Offer["terms"] | undefined>(undefined);
  const [offers, setOffers] = useState<Offer[]>(mockOffers);

  const { data: deal, isLoading } = useQuery<WholesaleDeal>({
    queryKey: ['/api/wholesale-deals', dealId],
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

  const handleSubmitOffer = (data: OfferFormData) => {
    const newOffer: Offer = {
      id: String(Date.now()),
      sender: "investor",
      senderName: "You",
      timestamp: new Date(),
      status: "pending",
      terms: {
        offerPrice: data.offerPrice,
        earnestMoney: data.earnestMoney,
        closeDate: data.closeDate,
        inspectionPeriod: data.inspectionPeriod,
        fundingType: data.fundingType,
        notes: data.notes || "",
      },
    };
    setOffers([...offers, newOffer]);
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

  const handleAcceptOffer = (offerId: string) => {
    setOffers(offers.map(o => o.id === offerId ? { ...o, status: "accepted" as const } : o));
    toast({
      title: "Offer Accepted",
      description: "Congratulations! The deal has been accepted.",
    });
  };

  const handleRejectOffer = (offerId: string) => {
    setOffers(offers.map(o => o.id === offerId ? { ...o, status: "rejected" as const } : o));
    toast({
      title: "Offer Rejected",
      description: "The offer has been declined.",
    });
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
                                    onClick={() => openCounterOffer(offer)}
                                    data-testid={`button-counter-${offer.id}`}
                                  >
                                    <RefreshCw className="w-4 h-4 mr-1" />
                                    Counter
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
                  <UnderConstructionCard 
                    title="Deal Chat" 
                    description="Real-time messaging with the wholesaler will be available soon. Stay tuned!"
                  />
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
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" disabled>
                    <FileText className="w-5 h-5" />
                    <span>Generate Term Sheet</span>
                    <UnderConstructionBadge />
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" disabled>
                    <Lock className="w-5 h-5" />
                    <span>Move to Data Room</span>
                    <UnderConstructionBadge />
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" disabled>
                    <Sparkles className="w-5 h-5" />
                    <span>Mark as Funded</span>
                    <UnderConstructionBadge />
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

          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-700 mb-1">Negotiation Tips</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Be responsive to counter-offers</li>
                    <li>• Include earnest money to show commitment</li>
                    <li>• Clearly state your funding source</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {deal && (
        <OfferFormDialog
          open={offerDialogOpen}
          onOpenChange={setOfferDialogOpen}
          mode={offerMode}
          dealInfo={{
            id: dealId || "",
            propertyAddress: deal.propertyAddress || "",
            askingPrice: deal.askingPrice || 0,
            arv: deal.arv || undefined,
          }}
          previousOffer={counterOfferData}
          onSubmit={handleSubmitOffer}
        />
      )}
    </div>
  );
}

