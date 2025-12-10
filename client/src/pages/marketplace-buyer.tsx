import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Home,
  Search,
  Heart,
  FileText,
  ArrowRight,
  MapPin,
  DollarSign,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import type { RetailListing, WholesaleDeal, BuyerOffer } from "@shared/schema";

interface BuyerStats {
  savedProperties: number;
  pendingOffers: number;
  acceptedOffers: number;
  totalPurchases: number;
}

interface EnrichedSavedProperty {
  id: number;
  userId: string;
  propertyType: string;
  propertyId: number;
  createdAt: Date;
  listing?: RetailListing;
  deal?: WholesaleDeal;
}

interface EnrichedOffer extends BuyerOffer {
  listing?: RetailListing;
  deal?: WholesaleDeal;
}

export default function MarketplaceBuyerPage() {
  const [matchSaved] = useRoute("/marketplace/buyer/saved");
  const [matchOffers] = useRoute("/marketplace/buyer/offers");

  let content;
  if (matchSaved) {
    content = <SavedPropertiesView />;
  } else if (matchOffers) {
    content = <OffersView />;
  } else {
    content = <BuyerDashboard />;
  }

  return (
    <AuthGuard requiredRoles={["admin", "buyer_retail", "buyer_investment"]}>
      <MarketplaceLayout>
        {content}
      </MarketplaceLayout>
    </AuthGuard>
  );
}

function BuyerDashboard() {
  const { userRole } = useSupabaseAuth();
  const isInvestmentBuyer = userRole === "buyer_investment";

  const { data: stats, isLoading: statsLoading } = useQuery<BuyerStats>({
    queryKey: ["/api/supabase/marketplace/buyer/stats"],
  });

  const { data: savedProperties, isLoading: savedLoading } = useQuery<EnrichedSavedProperty[]>({
    queryKey: ["/api/supabase/saved-items"],
  });

  const { data: offers, isLoading: offersLoading } = useQuery<EnrichedOffer[]>({
    queryKey: ["/api/supabase/buyer-offers"],
  });

  const displayStats: BuyerStats = stats ?? {
    savedProperties: 0,
    pendingOffers: 0,
    acceptedOffers: 0,
    totalPurchases: 0,
  };

  const recentSaved = savedProperties?.slice(0, 3) || [];
  const recentOffers = offers?.slice(0, 3) || [];

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getOfferStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "under_contract":
        return <Badge className="bg-blue-100 text-blue-800">Under Contract</Badge>;
      case "closed":
        return <Badge className="bg-primary text-primary-foreground">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold" data-testid="text-page-title">
            Buyer Dashboard
          </h1>
          <p className="text-muted-foreground">
            {isInvestmentBuyer
              ? "Find investment properties for your portfolio"
              : "Find your perfect home with Pegasus Dreamscapes"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {isInvestmentBuyer ? "Investment Buyer" : "Retail Buyer"}
          </Badge>
          <Link href="/marketplace/properties">
            <Button data-testid="button-search-properties">
              <Search className="h-4 w-4 mr-2" />
              Browse Properties
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Properties</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="stat-saved-properties">
                {displayStats.savedProperties}
              </div>
            )}
            <p className="text-xs text-muted-foreground">In your favorites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="stat-pending-offers">
                {displayStats.pendingOffers}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Pending response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted Offers</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="stat-accepted-offers">
                {displayStats.acceptedOffers}
              </div>
            )}
            <p className="text-xs text-muted-foreground">In process</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="stat-total-purchases">
                {displayStats.totalPurchases}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Saved Properties</CardTitle>
            <CardDescription>Properties you've added to favorites</CardDescription>
          </CardHeader>
          <CardContent>
            {savedLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentSaved.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No saved properties yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse properties and save your favorites
                </p>
                <Link href="/marketplace/properties">
                  <Button variant="outline" size="sm" className="mt-4" data-testid="button-browse-empty">
                    Browse Properties
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSaved.map((saved) => {
                  const property = saved.listing || saved.deal;
                  if (!property) return null;
                  
                  const address = 'propertyAddress' in property ? property.propertyAddress : '';
                  const city = 'city' in property ? property.city : '';
                  const state = 'state' in property ? property.state : '';
                  const price = 'listPrice' in property ? property.listPrice : ('askingPrice' in property ? property.askingPrice : 0);
                  const beds = 'bedrooms' in property ? property.bedrooms : null;
                  const baths = 'bathrooms' in property ? property.bathrooms : null;
                  
                  return (
                    <Link 
                      key={saved.id} 
                      href={saved.propertyType === 'retail' ? `/marketplace/properties/${saved.propertyId}` : `/marketplace/deals/${saved.propertyId}`}
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg border hover-elevate cursor-pointer" data-testid={`saved-property-${saved.id}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-12 rounded bg-muted flex items-center justify-center">
                            {saved.propertyType === 'retail' ? (
                              <Home className="h-6 w-6 text-muted-foreground" />
                            ) : (
                              <Building2 className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{address}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {city}, {state}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(price)}</p>
                          <p className="text-xs text-muted-foreground">
                            {beds ? `${beds} bed` : ''}{beds && baths ? ' | ' : ''}{baths ? `${baths} bath` : ''}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            {recentSaved.length > 0 && (
              <Link href="/marketplace/buyer/saved">
                <Button variant="ghost" className="w-full mt-4" data-testid="link-view-saved">
                  View All Saved
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Offers</CardTitle>
            <CardDescription>Track your submitted offers</CardDescription>
          </CardHeader>
          <CardContent>
            {offersLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentOffers.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No offers submitted yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Find a property and make an offer
                </p>
                <Link href="/marketplace/properties">
                  <Button variant="outline" size="sm" className="mt-4" data-testid="button-find-property">
                    Browse Properties
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOffers.map((offer) => {
                  const property = offer.listing || offer.deal;
                  const address = property && 'propertyAddress' in property ? property.propertyAddress : `Property #${offer.propertyId}`;
                  
                  return (
                    <div key={offer.id} className="p-3 rounded-lg border" data-testid={`offer-${offer.id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium line-clamp-1">{address}</p>
                          <p className="text-sm text-muted-foreground">
                            Offered: {formatCurrency(offer.offerAmount)}
                          </p>
                        </div>
                        {getOfferStatusBadge(offer.status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{offer.fundingType}</Badge>
                        {offer.closingTimeline && (
                          <span>{offer.closingTimeline} closing</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {recentOffers.length > 0 && (
              <Link href="/marketplace/buyer/offers">
                <Button variant="ghost" className="w-full mt-4" data-testid="link-view-offers">
                  View All Offers
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Browse Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {isInvestmentBuyer 
                ? "Find investment opportunities and wholesale deals"
                : "Explore our collection of renovated homes"}
            </p>
            <Link href="/marketplace/properties">
              <Button className="w-full" data-testid="action-browse">
                <Search className="h-4 w-4 mr-2" />
                Browse Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">View Favorites</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Review properties you've saved for later
            </p>
            <Link href="/marketplace/buyer/saved">
              <Button variant="outline" className="w-full" data-testid="action-favorites">
                <Heart className="h-4 w-4 mr-2" />
                My Favorites
              </Button>
            </Link>
          </CardContent>
        </Card>

        {isInvestmentBuyer && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Calculators</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Analyze deals with our investment calculators
              </p>
              <Link href="/calculators">
                <Button variant="outline" className="w-full" data-testid="action-calculators">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Open Calculators
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!isInvestmentBuyer && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Have questions? Our team is here to help
              </p>
              <Link href="/contact">
                <Button variant="outline" className="w-full" data-testid="action-contact">
                  Get in Touch
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SavedPropertiesView() {
  const { data: savedProperties, isLoading } = useQuery<EnrichedSavedProperty[]>({
    queryKey: ["/api/marketplace/buyer/saved"],
  });

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/marketplace/buyer">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold" data-testid="text-page-title">
            Saved Properties
          </h1>
          <p className="text-muted-foreground text-sm">
            Properties you've added to favorites
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : !savedProperties || savedProperties.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Saved Properties</h3>
            <p className="text-muted-foreground mb-4">
              You haven't saved any properties yet. Browse our listings and save your favorites.
            </p>
            <Link href="/marketplace/properties">
              <Button data-testid="button-browse">
                <Search className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedProperties.map((saved) => {
            const property = saved.listing || saved.deal;
            if (!property) return null;
            
            const address = 'propertyAddress' in property ? property.propertyAddress : '';
            const city = 'city' in property ? property.city : '';
            const state = 'state' in property ? property.state : '';
            const price = 'listPrice' in property ? property.listPrice : ('askingPrice' in property ? property.askingPrice : 0);
            const beds = 'bedrooms' in property ? property.bedrooms : null;
            const baths = 'bathrooms' in property ? property.bathrooms : null;
            
            return (
              <Link 
                key={saved.id} 
                href={saved.propertyType === 'retail' ? `/marketplace/properties/${saved.propertyId}` : `/marketplace/deals/${saved.propertyId}`}
              >
                <Card className="hover-elevate cursor-pointer h-full" data-testid={`saved-property-${saved.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">
                        {saved.propertyType === 'retail' ? 'Retail' : 'Wholesale'}
                      </Badge>
                      <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    </div>
                    <div className="w-full h-24 rounded-md bg-muted flex items-center justify-center mb-3">
                      {saved.propertyType === 'retail' ? (
                        <Home className="h-10 w-10 text-muted-foreground/50" />
                      ) : (
                        <Building2 className="h-10 w-10 text-muted-foreground/50" />
                      )}
                    </div>
                    <p className="font-semibold text-lg">{formatCurrency(price)}</p>
                    <p className="font-medium line-clamp-1">{address}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {city}, {state}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {beds ? `${beds} bed` : ''}{beds && baths ? ' | ' : ''}{baths ? `${baths} bath` : ''}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OffersView() {
  const { data: offers, isLoading } = useQuery<EnrichedOffer[]>({
    queryKey: ["/api/marketplace/buyer/offers"],
  });

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getOfferStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "under_contract":
        return <Badge className="bg-blue-100 text-blue-800">Under Contract</Badge>;
      case "closed":
        return <Badge className="bg-primary text-primary-foreground">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/marketplace/buyer">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold" data-testid="text-page-title">
            My Offers
          </h1>
          <p className="text-muted-foreground text-sm">
            Track your submitted offers
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !offers || offers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Offers Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't submitted any offers. Find a property and make an offer to get started.
            </p>
            <Link href="/marketplace/properties">
              <Button data-testid="button-browse">
                <Search className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const property = offer.listing || offer.deal;
            const address = property && 'propertyAddress' in property ? property.propertyAddress : `Property #${offer.propertyId}`;
            const city = property && 'city' in property ? property.city : '';
            const state = property && 'state' in property ? property.state : '';
            const listPrice = property && 'listPrice' in property ? property.listPrice : null;
            
            return (
              <Card key={offer.id} data-testid={`offer-${offer.id}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                        {offer.propertyType === 'retail' ? (
                          <Home className="h-8 w-8 text-muted-foreground/50" />
                        ) : (
                          <Building2 className="h-8 w-8 text-muted-foreground/50" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{address}</p>
                        {city && state && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {city}, {state}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{offer.fundingType}</Badge>
                          <Badge variant="outline" className="text-xs">{offer.propertyType}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      {getOfferStatusBadge(offer.status)}
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(offer.offerAmount)}</p>
                        {listPrice && (
                          <p className="text-xs text-muted-foreground">
                            List: {formatCurrency(listPrice)}
                          </p>
                        )}
                      </div>
                      {offer.closingTimeline && (
                        <p className="text-xs text-muted-foreground">
                          {offer.closingTimeline} closing
                        </p>
                      )}
                    </div>
                  </div>
                  {offer.message && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">{offer.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
