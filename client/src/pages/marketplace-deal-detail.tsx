import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/animations";
import { PropertyMap } from "@/components/property-map";
import { useDealAction } from "@/contexts/deal-action-context";
import { useAnalytics } from "@/hooks/use-analytics";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { sampleWholesaleDeals } from "@/lib/sample-data";
import type { WholesaleDeal } from "@shared/schema";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Home,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Bookmark,
  CheckCircle2,
  Clock,
  Target,
  User,
  Shield,
  Handshake,
  FileText,
  Calculator,
  Phone,
  Mail,
  Building2,
  Ruler,
  Bed,
  Bath,
  Lock,
  FolderOpen,
  MessageSquare,
  Hammer,
  PaintBucket,
  Layers,
  Flag,
  CheckSquare,
  Construction,
  Sparkles,
} from "lucide-react";
import { UnderConstructionBadge, UnderConstructionCard } from "@/components/under-construction";

export default function MarketplaceDealDetail() {
  return (
    <MarketplaceLayout>
      <DealDetailPage />
    </MarketplaceLayout>
  );
}

function DealDetailPage() {
  const params = useParams<{ id: string }>();
  const dealId = params.id;
  const { openDealAction } = useDealAction();
  const { trackDealView } = useAnalytics();
  const { isAuthenticated, isDemoMode } = useSupabaseAuth();
  
  const isGuestMode = !isAuthenticated;
  const useSampleData = isGuestMode || isDemoMode;
  
  const sampleDeal = useMemo(() => {
    if (!useSampleData) return null;
    const numericId = parseInt(dealId || "0");
    return sampleWholesaleDeals.find(d => d.id === numericId) as WholesaleDeal | undefined;
  }, [dealId, useSampleData]);

  const { data: apiDeal, isLoading, error } = useQuery<WholesaleDeal>({
    queryKey: ['/api/wholesale-deals', dealId],
    enabled: !useSampleData && !!dealId,
  });
  
  const deal = useSampleData ? sampleDeal : apiDeal;

  useEffect(() => {
    if (deal?.id) {
      trackDealView(deal.id, "wholesale");
    }
  }, [deal?.id, trackDealView]);

  if (isLoading && !useSampleData) {
    return <DealDetailSkeleton />;
  }

  if (!deal) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <Building2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Deal Not Found</h3>
          <p className="text-muted-foreground mb-6">
            This deal may have been removed or is no longer available.
          </p>
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

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === "") return "—";
    return value;
  };

  const calculateSpread = () => {
    if (!deal.arv || !deal.askingPrice) return null;
    const spread = ((deal.arv - deal.askingPrice) / deal.arv) * 100;
    return spread.toFixed(0);
  };

  const spread = calculateSpread();

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/marketflow/deals">
          <Button variant="ghost" size="sm" data-testid="button-back-to-deals">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deals
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ScrollReveal>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {deal.isHot && (
                        <Badge className="bg-red-500 text-white">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Hot Deal
                        </Badge>
                      )}
                      {deal.isFeatured && (
                        <Badge variant="secondary">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {deal.dealScore && deal.dealScore >= 80 && (
                        <Badge variant="outline" className="border-green-500/30 text-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Grade A
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl" data-testid="text-deal-title">
                      {deal.propertyAddress}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {deal.propertyAddress}, {deal.city}, {deal.state} {deal.zipCode}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="icon" data-testid="button-save-deal">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-6">
                  {deal.images && deal.images[0] ? (
                    <img 
                      src={deal.images[0]} 
                      alt={deal.propertyAddress || "Property"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-24 h-24 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {deal.images && deal.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {deal.images.slice(1, 5).map((img, i) => (
                      <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img src={img} alt={`Property ${i + 2}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Home className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-semibold">{deal.propertyType || "Residential"}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Bed className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Beds</p>
                    <p className="font-semibold">{formatValue(deal.bedrooms)}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Bath className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Baths</p>
                    <p className="font-semibold">{formatValue(deal.bathrooms)}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Ruler className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Sq Ft</p>
                    <p className="font-semibold">{deal.sqft ? deal.sqft.toLocaleString() : "—"}</p>
                  </div>
                </div>

                {deal.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{deal.description}</p>
                  </div>
                )}

                {deal.repairDetails && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Scope of Work</h3>
                    <p className="text-muted-foreground leading-relaxed">{deal.repairDetails}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>

          {deal.propertyAddress && (
            <PropertyMap
              address={deal.propertyAddress}
              city={deal.city}
              state={deal.state}
              zipCode={deal.zipCode}
              showCard={true}
              title="Property Location"
              height="300px"
              data-testid="property-map"
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Deal Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Asking Price</span>
                    <span className="font-semibold text-lg">{formatCurrency(deal.askingPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Contract Price</span>
                    <span className="font-semibold">{formatCurrency(deal.contractPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Assignment Fee</span>
                    <span className="font-semibold">{formatCurrency(deal.assignmentFee)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Est. Repairs</span>
                    <span className="font-semibold">{formatCurrency(deal.estimatedRepairs)}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">ARV</span>
                    <span className="font-semibold text-lg">{formatCurrency(deal.arv)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Holding Costs</span>
                    <span className="font-semibold">{formatCurrency(deal.holdingCosts)}</span>
                  </div>
                  {spread && (
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10">
                      <span className="font-medium">Spread</span>
                      <span className="font-bold text-xl text-green-600">{spread}%</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Deal Score</span>
                    <Badge variant={deal.dealScore && deal.dealScore >= 70 ? "default" : "secondary"}>
                      {deal.dealScore || "—"}/100
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Investment Strategy</h4>
                <div className="flex flex-wrap gap-2">
                  {deal.dispositionPath && (
                    <Badge variant="secondary">
                      <Target className="w-3 h-3 mr-1" />
                      {deal.dispositionPath}
                    </Badge>
                  )}
                  {deal.riskLevel && (
                    <Badge variant="outline" className={
                      deal.riskLevel === "low" ? "border-green-500/30 text-green-600" :
                      deal.riskLevel === "medium" ? "border-yellow-500/30 text-yellow-600" :
                      "border-red-500/30 text-red-600"
                    }>
                      {deal.riskLevel} risk
                    </Badge>
                  )}
                  {deal.neighborhoodGrade && (
                    <Badge variant="outline">
                      Neighborhood: {deal.neighborhoodGrade}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Deal Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DealUpdatesTimeline />
            </CardContent>
          </Card>

          <Card className="border-dashed border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                Data Room
                <UnderConstructionBadge />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg border border-dashed flex flex-col items-center justify-center text-center">
                  <FolderOpen className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium">Property Documents</p>
                  <p className="text-xs text-muted-foreground">Title, deed, liens</p>
                </div>
                <div className="p-4 rounded-lg border border-dashed flex flex-col items-center justify-center text-center">
                  <FileText className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium">Inspection Reports</p>
                  <p className="text-xs text-muted-foreground">Condition assessments</p>
                </div>
                <div className="p-4 rounded-lg border border-dashed flex flex-col items-center justify-center text-center">
                  <Calculator className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium">Financials</p>
                  <p className="text-xs text-muted-foreground">Pro formas, comps</p>
                </div>
                <div className="p-4 rounded-lg border border-dashed flex flex-col items-center justify-center text-center">
                  <FileText className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium">Contracts</p>
                  <p className="text-xs text-muted-foreground">Purchase agreements</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 text-center">
                <Lock className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Request access to view deal documents. Available after offer accepted.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 space-y-6 self-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Take Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Asking Price</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(deal.askingPrice)}</p>
              </div>

              <Button 
                size="lg"
                className="w-full"
                onClick={() => openDealAction(deal.id, "wholesale_accept")}
                data-testid="button-accept-terms"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Accept Terms
              </Button>

              <Button 
                variant="outline"
                className="w-full"
                onClick={() => openDealAction(deal.id, "wholesale_counter")}
                data-testid="button-counter-offer"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Counter Offer
              </Button>

              <Button 
                variant="outline"
                className="w-full"
                onClick={() => openDealAction(deal.id, "wholesale_jv")}
                data-testid="button-request-jv"
              >
                <Handshake className="w-5 h-5 mr-2" />
                Request JV
              </Button>

              <Button 
                variant="outline" 
                className="w-full"
                data-testid="button-analyze-deal"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Run Analysis
              </Button>

              <Button 
                variant="ghost" 
                className="w-full"
                data-testid="button-save-deal-sidebar"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save for Later
              </Button>

              <Link href={`/marketflow/deals/${deal.id}/negotiate`}>
                <Button 
                  variant="outline" 
                  className="w-full"
                  data-testid="button-go-to-negotiation"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Go to Negotiation Room
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Wholesaler #{((deal as any).externalWholesalerId || deal.submittedBy)?.slice(-6) || "—"}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span>4.8 rating</span>
                    <span>·</span>
                    <span>12 deals</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                <Badge variant="outline">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  95% on-time
                </Badge>
              </div>
              <Link href={`/profile/${(deal as any).externalWholesalerId || deal.submittedBy}`}>
                <Button variant="outline" className="w-full" size="sm">
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {deal.contractDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contract Signed</span>
                  <span>{new Date(deal.contractDate).toLocaleDateString()}</span>
                </div>
              )}
              {deal.inspectionDeadline && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Inspection Deadline</span>
                  <span>{new Date(deal.inspectionDeadline).toLocaleDateString()}</span>
                </div>
              )}
              {deal.closingDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Closing Date</span>
                  <span className="font-medium">{new Date(deal.closingDate).toLocaleDateString()}</span>
                </div>
              )}
              {deal.daysOnMarket !== undefined && deal.daysOnMarket !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Days on Market</span>
                  <Badge variant="outline">{deal.daysOnMarket} days</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface DealUpdate {
  id: string;
  milestone: string;
  description: string;
  timestamp: Date;
  completed: boolean;
}

const mockUpdates: DealUpdate[] = [
  { id: "1", milestone: "Listed", description: "Deal listed on MarketFlow", timestamp: new Date(Date.now() - 86400000 * 14), completed: true },
  { id: "2", milestone: "Under Review", description: "Property inspection completed", timestamp: new Date(Date.now() - 86400000 * 10), completed: true },
  { id: "3", milestone: "Approved", description: "Deal approved for marketplace", timestamp: new Date(Date.now() - 86400000 * 7), completed: true },
  { id: "4", milestone: "In Negotiation", description: "Active investor interest", timestamp: new Date(Date.now() - 86400000 * 2), completed: false },
];

const milestoneIcons: Record<string, typeof Construction> = {
  "Listed": Flag,
  "Under Review": Clock,
  "Approved": CheckCircle2,
  "In Negotiation": Handshake,
  "Funded": DollarSign,
  "Demo": Hammer,
  "Rough": Layers,
  "Drywall": Construction,
  "Paint": PaintBucket,
  "Flooring": Layers,
  "Final": CheckSquare,
  "In Escrow": FileText,
  "Closed": CheckCircle2,
};

function DealUpdatesTimeline() {
  return (
    <div className="space-y-4">
      {mockUpdates.map((update, index) => {
        const Icon = milestoneIcons[update.milestone] || Flag;
        return (
          <div key={update.id} className="flex gap-3" data-testid={`update-${update.id}`}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${update.completed ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                <Icon className="w-4 h-4" />
              </div>
              {index < mockUpdates.length - 1 && (
                <div className={`w-0.5 flex-1 mt-2 ${update.completed ? "bg-green-500/30" : "bg-muted"}`} />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">{update.milestone}</span>
                {update.completed && (
                  <Badge variant="outline" className="border-green-500/30 text-green-600 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{update.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{update.timestamp.toLocaleDateString()}</p>
            </div>
          </div>
        );
      })}
      
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Updates are posted by the Dreamscaper/Wholesaler
        </p>
      </div>
    </div>
  );
}

function DealDetailSkeleton() {
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-video w-full rounded-lg mb-6" />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full rounded-lg mb-4" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
