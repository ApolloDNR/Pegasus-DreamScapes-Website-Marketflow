import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PortalHeader } from "@/components/portal-header";
import { AnnouncementsBanner } from "@/components/announcements-banner";
import { 
  ShoppingBag, 
  ArrowRight, 
  Loader2,
  DollarSign,
  Building2,
  Heart,
  HeartOff,
  Home,
  MapPin,
  LogIn,
  User,
  BarChart3,
  FileText,
  Bed,
  Bath,
  Ruler,
  Eye,
  Send,
  Bookmark,
  TrendingUp,
  Hammer
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import type { WholesaleDeal, RetailListing, BuyerProfile, SavedProperty, BuyerOffer } from "@shared/schema";
import { sampleWholesaleDeals, sampleRetailListings, sampleBuyerStats } from "@/lib/sample-data";

const profileFormSchema = z.object({
  company: z.string().optional(),
  phone: z.string().min(10, "Phone number is required"),
  cityState: z.string().min(2, "City/State is required"),
  buyerType: z.string().min(1, "Please select your buyer type"),
  budgetRange: z.string().min(1, "Please select your budget range"),
  propertyPreference: z.string().min(1, "Please select property preference"),
  fundingSource: z.string().optional(),
  preApproved: z.boolean().optional(),
  notes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function BuyerPortal() {
  const { profile: authProfile, isLoading: authLoading, isAuthenticated, isGuestMode, exitGuestMode } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: profile, isLoading: profileLoading } = useQuery<BuyerProfile>({
    queryKey: ["/api/portal/buyer/profile"],
    enabled: isAuthenticated,
  });

  const { data: apiWholesaleDeals } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/wholesale-deals"],
    enabled: isAuthenticated,
  });

  const { data: apiRetailListings } = useQuery<RetailListing[]>({
    queryKey: ["/api/retail-listings"],
    enabled: isAuthenticated,
  });

  const { data: savedProperties } = useQuery<SavedProperty[]>({
    queryKey: ["/api/portal/buyer/saved-properties"],
    enabled: isAuthenticated,
  });

  const { data: myOffers } = useQuery<BuyerOffer[]>({
    queryKey: ["/api/portal/buyer/offers"],
    enabled: isAuthenticated,
  });

  const wholesaleDeals = isGuestMode ? sampleWholesaleDeals as unknown as WholesaleDeal[] : apiWholesaleDeals;
  const retailListings = isGuestMode ? sampleRetailListings as unknown as RetailListing[] : apiRetailListings;

  const hasProfile = !!profile || isGuestMode;

  if (authLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated && !isGuestMode) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Buyer Portal</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to browse properties, save favorites, and submit offers.
          </p>
          <a href="/api/login?returnTo=/portal/buyer">
            <Button size="lg" data-testid="button-buyer-login">
              <LogIn className="mr-2 w-5 h-5" />
              Sign In to Continue
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone">
      {isGuestMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium">Guest Preview Mode - Viewing as Buyer</span>
              <span className="text-sm text-muted-foreground">Sign in to take actions</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exitGuestMode}>Exit Preview</Button>
              <Link href="/auth/login">
                <Button size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      <AnnouncementsBanner audience="BUYERS" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-buyer-welcome">
              Welcome, {isGuestMode ? "Guest Buyer" : (authProfile?.display_name || "Buyer")}
            </h1>
            <p className="text-muted-foreground">
              {isGuestMode ? "Preview property browsing and offer features" : (hasProfile ? "Browse properties and track your offers" : "Complete your profile to get started")}
            </p>
          </div>
          <PortalHeader currentPortal="buyer" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard" data-testid="tab-buyer-dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="properties" data-testid="tab-buyer-properties">
              <Building2 className="w-4 h-4 mr-2" />
              Browse Properties
            </TabsTrigger>
            <TabsTrigger value="saved" data-testid="tab-buyer-saved">
              <Heart className="w-4 h-4 mr-2" />
              Saved ({savedProperties?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="offers" data-testid="tab-buyer-offers">
              <FileText className="w-4 h-4 mr-2" />
              My Offers
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-buyer-profile">
              <User className="w-4 h-4 mr-2" />
              My Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab 
              profile={profile} 
              wholesaleDeals={wholesaleDeals} 
              retailListings={retailListings}
              savedProperties={savedProperties}
              myOffers={myOffers}
            />
          </TabsContent>

          <TabsContent value="properties">
            <PropertiesTab wholesaleDeals={wholesaleDeals} retailListings={retailListings} />
          </TabsContent>

          <TabsContent value="saved">
            <SavedTab savedProperties={savedProperties} wholesaleDeals={wholesaleDeals} retailListings={retailListings} />
          </TabsContent>

          <TabsContent value="offers">
            <OffersTab offers={myOffers} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab profile={profile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DashboardTab({ 
  profile, 
  wholesaleDeals, 
  retailListings,
  savedProperties,
  myOffers 
}: { 
  profile?: BuyerProfile; 
  wholesaleDeals?: WholesaleDeal[];
  retailListings?: RetailListing[];
  savedProperties?: SavedProperty[];
  myOffers?: BuyerOffer[];
}) {
  const activeListings = retailListings?.filter(l => l.status === "active") || [];
  const pendingOffers = myOffers?.filter(o => o.status === "pending" || o.status === "reviewing") || [];
  const acceptedOffers = myOffers?.filter(o => o.status === "accepted") || [];
  const underContractOffers = myOffers?.filter(o => o.status === "under_contract" || o.status === "closing") || [];
  const closedOffers = myOffers?.filter(o => o.status === "closed") || [];
  
  const stats = [
    { label: "Available Deals", value: (wholesaleDeals?.length || 0) + activeListings.length, icon: Building2, color: "text-primary", bgColor: "bg-primary/10" },
    { label: "Saved Properties", value: savedProperties?.length || 0, icon: Heart, color: "text-pink-600", bgColor: "bg-pink-600/10" },
    { label: "Active Offers", value: pendingOffers.length, icon: FileText, color: "text-amber-600", bgColor: "bg-amber-600/10" },
    { label: "Under Contract", value: underContractOffers.length, icon: TrendingUp, color: "text-green-600", bgColor: "bg-green-600/10" },
  ];

  const pipelineStages = [
    { label: "Offers Submitted", count: pendingOffers.length, color: "bg-amber-500" },
    { label: "Accepted", count: acceptedOffers.length, color: "bg-blue-500" },
    { label: "Under Contract", count: underContractOffers.length, color: "bg-green-500" },
    { label: "Closed", count: closedOffers.length, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="sleek-card hover-elevate" data-testid={`stat-card-${index}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!profile && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">Complete Your Profile</h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  Set up your buyer profile to save properties and submit offers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="sleek-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Deal Pipeline
          </CardTitle>
          <CardDescription>Track your progress from offer to close</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {pipelineStages.map((stage, index) => (
              <div key={stage.label} className="flex-1" data-testid={`pipeline-stage-${index}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <span className="text-sm font-medium">{stage.label}</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`absolute left-0 top-0 h-full ${stage.color} transition-all`} 
                    style={{ width: stage.count > 0 ? '100%' : '0%' }}
                  />
                </div>
                <p className="text-center mt-1 text-2xl font-bold">{stage.count}</p>
              </div>
            ))}
          </div>
          
          {underContractOffers.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3">Properties Under Contract</h4>
              <div className="space-y-3">
                {underContractOffers.map(offer => (
                  <div key={offer.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800" data-testid={`under-contract-${offer.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Home className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Property #{offer.propertyId}</p>
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                          {offer.status === "closing" ? "Closing Soon" : "Under Contract"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(offer.offerAmount)}</p>
                      <p className="text-xs text-muted-foreground">{offer.fundingType}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hammer className="w-5 h-5 text-green-600" />
              Latest Wholesale Deals
            </CardTitle>
            <CardDescription>Off-market investment opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            {wholesaleDeals && wholesaleDeals.length > 0 ? (
              <div className="space-y-4">
                {wholesaleDeals.slice(0, 3).map(deal => (
                  <Link key={deal.id} href={`/wholesale/${deal.id}`} className="block">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors" data-testid={`deal-row-${deal.id}`}>
                      <div>
                        <p className="font-medium">{deal.propertyAddress}</p>
                        <p className="text-sm text-muted-foreground">{deal.city}, {deal.state}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(deal.contractPrice)}</p>
                        <p className="text-xs text-muted-foreground">Fee: {formatCurrency(deal.assignmentFee)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link href="/portal/buyer?tab=properties" className="block">
                  <Button variant="outline" className="w-full mt-2" data-testid="button-view-all-deals">
                    View All Deals
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No wholesale deals available</p>
            )}
          </CardContent>
        </Card>

        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-600" />
              Featured Renovated Homes
            </CardTitle>
            <CardDescription>Move-in ready properties</CardDescription>
          </CardHeader>
          <CardContent>
            {activeListings.length > 0 ? (
              <div className="space-y-4">
                {activeListings.slice(0, 3).map(listing => (
                  <Link key={listing.id} href={`/buyers/${listing.slug}`} className="block">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors" data-testid={`listing-row-${listing.id}`}>
                      <div>
                        <p className="font-medium">{listing.propertyAddress}</p>
                        <p className="text-sm text-muted-foreground">{listing.city}, {listing.state}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{formatCurrency(listing.listPrice)}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {listing.bedrooms && <span>{listing.bedrooms} bd</span>}
                          {listing.bathrooms && <span>{listing.bathrooms} ba</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link href="/portal/buyer?tab=properties" className="block">
                  <Button variant="outline" className="w-full mt-2" data-testid="button-view-all-listings">
                    View All Properties
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No listings available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PropertiesTab({ wholesaleDeals, retailListings }: { wholesaleDeals?: WholesaleDeal[]; retailListings?: RetailListing[] }) {
  const [propertyType, setPropertyType] = useState("all");
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: async (data: { propertyType: string; propertyId: number }) => {
      return apiRequest('POST', '/api/portal/buyer/saved-properties', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portal/buyer/saved-properties"] });
      toast({ title: "Property saved!", description: "Added to your saved properties." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to save property", variant: "destructive" });
    },
  });

  const activeListings = retailListings?.filter(l => l.status === "active") || [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="w-48" data-testid="select-property-type">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            <SelectItem value="wholesale">Wholesale Deals</SelectItem>
            <SelectItem value="retail">Renovated Homes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(propertyType === "all" || propertyType === "wholesale") && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Hammer className="w-5 h-5 text-green-600" />
            Wholesale Deals
          </h3>
          {wholesaleDeals && wholesaleDeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wholesaleDeals.map(deal => (
                <Card key={deal.id} className="sleek-card overflow-hidden" data-testid={`card-wholesale-${deal.id}`}>
                  <div className="h-40 bg-gradient-to-br from-green-600/20 to-green-600/5 flex items-center justify-center">
                    {deal.images && deal.images.length > 0 ? (
                      <img src={deal.images[0]} alt={deal.propertyAddress} className="w-full h-full object-cover" />
                    ) : (
                      <Hammer className="w-12 h-12 text-green-600/50" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-green-600">Wholesale</Badge>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => saveMutation.mutate({ propertyType: "wholesale", propertyId: deal.id })}
                        disabled={saveMutation.isPending}
                        data-testid={`button-save-wholesale-${deal.id}`}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="font-bold text-xl mb-1">{formatCurrency(deal.contractPrice)}</p>
                    <p className="text-sm font-medium">{deal.propertyAddress}</p>
                    <p className="text-sm text-muted-foreground">{deal.city}, {deal.state} {deal.zipCode}</p>
                    <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                      {deal.bedrooms && <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{deal.bedrooms}</span>}
                      {deal.bathrooms && <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{deal.bathrooms}</span>}
                      {deal.sqft && <span className="flex items-center gap-1"><Ruler className="w-4 h-4" />{deal.sqft.toLocaleString()}</span>}
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Assignment Fee</p>
                        <p className="font-semibold text-green-600">{formatCurrency(deal.assignmentFee)}</p>
                      </div>
                      <Link href={`/wholesale/${deal.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="sleek-card p-8 text-center">
              <Hammer className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No wholesale deals available at this time.</p>
            </Card>
          )}
        </div>
      )}

      {(propertyType === "all" || propertyType === "retail") && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            Renovated Homes
          </h3>
          {activeListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeListings.map(listing => (
                <Card key={listing.id} className="sleek-card overflow-hidden" data-testid={`card-retail-${listing.id}`}>
                  <div className="h-40 bg-gradient-to-br from-blue-600/20 to-blue-600/5 flex items-center justify-center">
                    {listing.images && listing.images.length > 0 ? (
                      <img src={listing.images[0]} alt={listing.propertyAddress} className="w-full h-full object-cover" />
                    ) : (
                      <Home className="w-12 h-12 text-blue-600/50" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-blue-600">
                        {listing.listingSource === "mls" ? "MLS" : "Off-Market"}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => saveMutation.mutate({ propertyType: "retail", propertyId: listing.id })}
                        disabled={saveMutation.isPending}
                        data-testid={`button-save-retail-${listing.id}`}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="font-bold text-xl mb-1">{formatCurrency(listing.listPrice)}</p>
                    <p className="text-sm font-medium">{listing.propertyAddress}</p>
                    <p className="text-sm text-muted-foreground">{listing.city}, {listing.state} {listing.zipCode}</p>
                    <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                      {listing.bedrooms && <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{listing.bedrooms}</span>}
                      {listing.bathrooms && <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{listing.bathrooms}</span>}
                      {listing.sqft && <span className="flex items-center gap-1"><Ruler className="w-4 h-4" />{listing.sqft.toLocaleString()}</span>}
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-end">
                      <Link href={`/buyers/${listing.slug}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="sleek-card p-8 text-center">
              <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No renovated homes available at this time.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function SavedTab({ savedProperties, wholesaleDeals, retailListings }: { 
  savedProperties?: SavedProperty[];
  wholesaleDeals?: WholesaleDeal[];
  retailListings?: RetailListing[];
}) {
  const { toast } = useToast();

  const removeMutation = useMutation({
    mutationFn: async ({ propertyType, propertyId }: { propertyType: string; propertyId: number }) => {
      return apiRequest('DELETE', `/api/portal/buyer/saved-properties/${propertyType}/${propertyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portal/buyer/saved-properties"] });
      toast({ title: "Removed", description: "Property removed from saved list." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove property", variant: "destructive" });
    },
  });

  if (!savedProperties || savedProperties.length === 0) {
    return (
      <Card className="sleek-card p-12 text-center">
        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">No Saved Properties</h3>
        <p className="text-muted-foreground mb-6">Browse properties and click the heart icon to save them here.</p>
        <Link href="/buyers">
          <Button>
            <Building2 className="w-4 h-4 mr-2" />
            Browse Properties
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedProperties.map(saved => {
        const isWholesale = saved.propertyType === "wholesale";
        const property = isWholesale 
          ? wholesaleDeals?.find(d => d.id === saved.propertyId)
          : retailListings?.find(l => l.id === saved.propertyId);

        if (!property) return null;

        return (
          <Card key={saved.id} className="sleek-card overflow-hidden" data-testid={`card-saved-${saved.id}`}>
            <div className={`h-32 flex items-center justify-center ${isWholesale ? 'bg-gradient-to-br from-green-600/20 to-green-600/5' : 'bg-gradient-to-br from-blue-600/20 to-blue-600/5'}`}>
              {isWholesale ? (
                <Hammer className="w-10 h-10 text-green-600/50" />
              ) : (
                <Home className="w-10 h-10 text-blue-600/50" />
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <Badge className={isWholesale ? "bg-green-600" : "bg-blue-600"}>
                  {isWholesale ? "Wholesale" : "Renovated"}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeMutation.mutate({ propertyType: saved.propertyType, propertyId: saved.propertyId })}
                  disabled={removeMutation.isPending}
                  data-testid={`button-remove-saved-${saved.id}`}
                >
                  <HeartOff className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <p className="font-bold text-lg mb-1">
                {formatCurrency(isWholesale ? (property as WholesaleDeal).contractPrice : (property as RetailListing).listPrice)}
              </p>
              <p className="text-sm font-medium">{property.propertyAddress}</p>
              <p className="text-sm text-muted-foreground">{property.city}, {property.state}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function OffersTab({ offers }: { offers?: BuyerOffer[] }) {
  if (!offers || offers.length === 0) {
    return (
      <Card className="sleek-card p-12 text-center">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">No Offers Yet</h3>
        <p className="text-muted-foreground mb-6">When you submit offers on properties, they'll appear here.</p>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary">Pending Review</Badge>;
      case "reviewing": return <Badge className="bg-amber-500">Under Review</Badge>;
      case "accepted": return <Badge className="bg-green-600">Accepted</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      case "countered": return <Badge className="bg-blue-600">Counter Offer</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {offers.map(offer => (
        <Card key={offer.id} className="sleek-card" data-testid={`card-offer-${offer.id}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge(offer.status)}
                  <Badge variant="outline">{offer.propertyType === "wholesale" ? "Wholesale" : "Retail"}</Badge>
                </div>
                <p className="font-bold text-lg">Offer: {formatCurrency(offer.offerAmount)}</p>
                {offer.counterOffer && (
                  <p className="text-sm text-blue-600">Counter: {formatCurrency(offer.counterOffer)}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Submitted {new Date(offer.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Funding: {offer.fundingType}</p>
                {offer.closingTimeline && (
                  <p className="text-sm text-muted-foreground">Close: {offer.closingTimeline}</p>
                )}
              </div>
            </div>
            {offer.staffNotes && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm"><strong>Notes:</strong> {offer.staffNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProfileTab({ profile }: { profile?: BuyerProfile }) {
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      company: profile?.company || "",
      phone: profile?.phone || "",
      cityState: profile?.cityState || "",
      buyerType: profile?.buyerType || "",
      budgetRange: profile?.budgetRange || "",
      propertyPreference: profile?.propertyPreference || "",
      fundingSource: profile?.fundingSource || "",
      preApproved: profile?.preApproved || false,
      notes: profile?.notes || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest('POST', '/api/portal/buyer/register', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portal/buyer/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Success!", description: "Your buyer profile has been saved." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to save profile", variant: "destructive" });
    },
  });

  return (
    <Card className="sleek-card max-w-2xl">
      <CardHeader>
        <CardTitle>
          {profile ? "Edit Your Profile" : "Create Your Buyer Profile"}
        </CardTitle>
        <CardDescription>
          {profile 
            ? "Update your buyer preferences and contact information" 
            : "Complete your profile to save properties and submit offers"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(data => mutation.mutate(data))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} data-testid="input-buyer-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} data-testid="input-buyer-company" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cityState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (City, State) *</FormLabel>
                  <FormControl>
                    <Input placeholder="Sacramento, CA" {...field} data-testid="input-buyer-location" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buyerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-buyer-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash_buyer">Cash Buyer / Investor</SelectItem>
                        <SelectItem value="homeowner">Homeowner / End Buyer</SelectItem>
                        <SelectItem value="investor_buyer">Investment Company</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-buyer-budget">
                          <SelectValue placeholder="Select budget" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="under_250k">Under $250K</SelectItem>
                        <SelectItem value="250k_500k">$250K - $500K</SelectItem>
                        <SelectItem value="500k_1m">$500K - $1M</SelectItem>
                        <SelectItem value="1m_plus">$1M+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="propertyPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Preference *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-buyer-preference">
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="wholesale">Wholesale Deals Only</SelectItem>
                        <SelectItem value="renovated">Renovated Homes Only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fundingSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-buyer-funding">
                          <SelectValue placeholder="Select funding" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="hard_money">Hard Money</SelectItem>
                        <SelectItem value="conventional">Conventional Loan</SelectItem>
                        <SelectItem value="private_money">Private Money</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your buying criteria, preferred property types, etc."
                      {...field}
                      data-testid="textarea-buyer-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={mutation.isPending} data-testid="button-save-buyer-profile">
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {profile ? "Update Profile" : "Create Profile"}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
