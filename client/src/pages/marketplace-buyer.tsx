import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

interface BuyerStats {
  savedProperties: number;
  activeOffers: number;
  viewedThisMonth: number;
  pendingInquiries: number;
}

export default function MarketplaceBuyerPage() {
  const { profile, userRole } = useSupabaseAuth();
  const isInvestmentBuyer = userRole === "buyer_investment";

  const { data: stats, isLoading } = useQuery<BuyerStats>({
    queryKey: ["/api/marketplace/buyer/stats"],
    enabled: false,
  });

  const mockStats: BuyerStats = {
    savedProperties: 8,
    activeOffers: 2,
    viewedThisMonth: 24,
    pendingInquiries: 1,
  };

  const displayStats = stats ?? mockStats;

  return (
    <AuthGuard requiredRoles={["admin", "buyer_retail", "buyer_investment"]}>
      <MarketplaceLayout>
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
              <Link href="/marketplace/buyer/search">
                <Button data-testid="button-search-properties">
                  <Search className="h-4 w-4 mr-2" />
                  Search Properties
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
                {isLoading ? (
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
                <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-active-offers">
                    {displayStats.activeOffers}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Pending response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Viewed</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-viewed">
                    {displayStats.viewedThisMonth}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-inquiries">
                    {displayStats.pendingInquiries}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Awaiting response</p>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border hover-elevate cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-12 rounded bg-muted flex items-center justify-center">
                        <Home className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">123 Maple Street</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Atlanta, GA
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">$285,000</p>
                      <p className="text-xs text-muted-foreground">3 bed | 2 bath</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover-elevate cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-12 rounded bg-muted flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">456 Oak Avenue</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Decatur, GA
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">$425,000</p>
                      <p className="text-xs text-muted-foreground">4 bed | 3 bath</p>
                    </div>
                  </div>
                </div>
                <Link href="/marketplace/buyer/saved">
                  <Button variant="ghost" className="w-full mt-4" data-testid="link-view-saved">
                    View All Saved
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Find your next property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/marketplace/buyer/search" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-search">
                    <Search className="h-4 w-4 mr-2" />
                    Search Properties
                  </Button>
                </Link>
                <Link href="/marketplace/buyer/saved" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-favorites">
                    <Heart className="h-4 w-4 mr-2" />
                    View Favorites
                  </Button>
                </Link>
                <Link href="/marketplace/buyer/offers" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-offers">
                    <FileText className="h-4 w-4 mr-2" />
                    My Offers
                  </Button>
                </Link>
                {isInvestmentBuyer && (
                  <Link href="/calculators" className="block">
                    <Button variant="outline" className="w-full justify-start" data-testid="action-calculators">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Investment Calculators
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {isInvestmentBuyer && (
            <Card>
              <CardHeader>
                <CardTitle>Investment Opportunities</CardTitle>
                <CardDescription>Properties with strong investment potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg border hover-elevate cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">Fix & Flip</Badge>
                      <span className="text-sm font-semibold text-primary">22% ROI</span>
                    </div>
                    <p className="font-medium">789 Pine Road</p>
                    <p className="text-sm text-muted-foreground">$95,000 | SFH</p>
                  </div>
                  <div className="p-4 rounded-lg border hover-elevate cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">Rental</Badge>
                      <span className="text-sm font-semibold text-primary">8% Cap Rate</span>
                    </div>
                    <p className="font-medium">321 Elm Street</p>
                    <p className="text-sm text-muted-foreground">$175,000 | Duplex</p>
                  </div>
                  <div className="p-4 rounded-lg border hover-elevate cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">BRRRR</Badge>
                      <span className="text-sm font-semibold text-primary">18% ROI</span>
                    </div>
                    <p className="font-medium">555 Cedar Lane</p>
                    <p className="text-sm text-muted-foreground">$145,000 | SFH</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </MarketplaceLayout>
    </AuthGuard>
  );
}
