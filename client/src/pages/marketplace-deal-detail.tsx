import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollReveal } from "@/components/animations";
import { PropertyMap } from "@/components/property-map";
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
  Bath
} from "lucide-react";

export default function MarketplaceDealDetail() {
  return (
    <AuthGuard requiredRoles={["dreamscaper", "pegasus_dreamscaper", "admin", "investor", "buyer_investment"]}>
      <MarketplaceLayout>
        <DealDetailPage />
      </MarketplaceLayout>
    </AuthGuard>
  );
}

function DealDetailPage() {
  const params = useParams<{ id: string }>();
  const dealId = params.id;
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const [jvDialogOpen, setJvDialogOpen] = useState(false);

  const { data: deal, isLoading, error } = useQuery<WholesaleDeal>({
    queryKey: ['/api/supabase/wholesale-deals', dealId],
  });

  if (isLoading) {
    return <DealDetailSkeleton />;
  }

  if (error || !deal) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <Building2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Deal Not Found</h3>
          <p className="text-muted-foreground mb-6">
            This deal may have been removed or is no longer available.
          </p>
          <Link href="/marketplace/deals">
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
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
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
        <Link href="/marketplace/deals">
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
                    <p className="font-semibold">{deal.bedrooms || "N/A"}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Bath className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Baths</p>
                    <p className="font-semibold">{deal.bathrooms || "N/A"}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Ruler className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Sq Ft</p>
                    <p className="font-semibold">{deal.sqft?.toLocaleString() || "N/A"}</p>
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

          <PropertyMap
            address={deal.propertyAddress || ''}
            city={deal.city}
            state={deal.state}
            zipCode={deal.zipCode}
            showCard={true}
            title="Property Location"
            height="300px"
            data-testid="property-map"
          />

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
                      {deal.dealScore || "N/A"}/100
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
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Take Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Asking Price</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(deal.askingPrice)}</p>
              </div>

              <JVRequestDialog 
                deal={deal} 
                open={jvDialogOpen} 
                onOpenChange={setJvDialogOpen} 
              />

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
                  <p className="font-semibold">Wholesaler #{deal.submittedBy?.slice(-6) || "N/A"}</p>
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
              <Link href={`/profile/${deal.submittedBy}`}>
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

function JVRequestDialog({ 
  deal, 
  open, 
  onOpenChange 
}: { 
  deal: WholesaleDeal; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const [message, setMessage] = useState("");
  const [strategy, setStrategy] = useState("");
  const [fundingSource, setFundingSource] = useState("");
  const [proposedFee, setProposedFee] = useState(deal.assignmentFee?.toString() || "");

  const submitJVRequest = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/supabase/jv-requests', {
        dealId: String(deal.id),
        wholesalerId: deal.submittedBy,
        message,
        strategy,
        fundingSource,
        proposedFee: proposedFee ? parseInt(proposedFee) : undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "JV Request Submitted",
        description: "The wholesaler will be notified of your interest.",
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/jv-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/wholesale-deals'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit JV request. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg" data-testid="button-request-jv">
          <Handshake className="w-4 h-4 mr-2" />
          Request JV Partnership
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request JV Partnership</DialogTitle>
          <DialogDescription>
            Submit your interest in this deal. The wholesaler will review your request and respond.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Deal</p>
            <p className="font-medium">{deal.propertyAddress}</p>
            <p className="text-sm text-muted-foreground">{deal.city}, {deal.state}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strategy">Investment Strategy</Label>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger data-testid="select-jv-strategy">
                <SelectValue placeholder="Select your strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fix-flip">Fix & Flip</SelectItem>
                <SelectItem value="buy-hold">Buy & Hold</SelectItem>
                <SelectItem value="BRRRR">BRRRR</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="funding">Funding Source</Label>
            <Select value={fundingSource} onValueChange={setFundingSource}>
              <SelectTrigger data-testid="select-jv-funding">
                <SelectValue placeholder="How will you fund this?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="hard_money">Hard Money</SelectItem>
                <SelectItem value="private_money">Private Money</SelectItem>
                <SelectItem value="conventional">Conventional Loan</SelectItem>
                <SelectItem value="capital_raise">Capital Raise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposedFee">Proposed Assignment Fee</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="proposedFee"
                type="number"
                placeholder={deal.assignmentFee?.toString() || "Enter amount"}
                value={proposedFee}
                onChange={(e) => setProposedFee(e.target.value)}
                className="pl-9"
                data-testid="input-jv-fee"
              />
            </div>
            <p className="text-xs text-muted-foreground">Current asking fee: ${deal.assignmentFee?.toLocaleString() || "N/A"}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message to Wholesaler</Label>
            <Textarea
              id="message"
              placeholder="Introduce yourself and explain why you're interested in this deal..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              data-testid="textarea-jv-message"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => submitJVRequest.mutate()}
            disabled={submitJVRequest.isPending || !strategy || !fundingSource}
            data-testid="button-submit-jv-request"
          >
            {submitJVRequest.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
