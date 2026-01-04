import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Search,
  Heart,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Building2,
  Grid3X3,
  List,
  LogIn,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RetailListing } from "@shared/schema";

export default function MarketplacePropertiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <PropertiesBrowsePage />
      </div>
    </div>
  );
}

function PropertiesBrowsePage() {
  const { isAuthenticated } = useSupabaseAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [bedsFilter, setBedsFilter] = useState<string>("all");

  const { data: listings, isLoading } = useQuery<RetailListing[]>({
    queryKey: ["/api/supabase/listings"],
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async ({ propertyId }: { propertyId: string }) => {
      return apiRequest("POST", "/api/supabase/saved-items", {
        itemType: "listing",
        itemId: propertyId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/saved-items"] });
      toast({
        title: "Saved",
        description: "Property added to favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Please log in to save properties",
        variant: "destructive",
      });
    },
  });

  const handleSave = (propertyId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to save properties to your favorites",
      });
      navigate("/login");
      return;
    }
    toggleSaveMutation.mutate({ propertyId });
  };

  const filteredListings = listings?.filter((listing) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !listing.propertyAddress.toLowerCase().includes(query) &&
        !listing.city.toLowerCase().includes(query) &&
        !listing.state.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (propertyType !== "all" && listing.propertyType !== propertyType) {
      return false;
    }
    if (priceRange !== "all") {
      const price = listing.listPrice;
      if (priceRange === "under200k" && price >= 200000) return false;
      if (priceRange === "200k-400k" && (price < 200000 || price >= 400000)) return false;
      if (priceRange === "400k-600k" && (price < 400000 || price >= 600000)) return false;
      if (priceRange === "over600k" && price < 600000) return false;
    }
    if (bedsFilter !== "all") {
      const beds = listing.bedrooms || 0;
      if (bedsFilter === "1" && beds !== 1) return false;
      if (bedsFilter === "2" && beds !== 2) return false;
      if (bedsFilter === "3" && beds !== 3) return false;
      if (bedsFilter === "4+" && beds < 4) return false;
    }
    return true;
  }) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>;
      case "coming_soon":
        return <Badge variant="secondary">Coming Soon</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">Pending</Badge>;
      case "sold":
        return <Badge variant="outline">Sold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold" data-testid="text-page-title">
            Properties
          </h1>
          <p className="text-muted-foreground">
            Browse our collection of renovated homes and investment opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <Link href="/login">
              <Button variant="outline" data-testid="button-login">
                <LogIn className="h-4 w-4 mr-2" />
                Login to Save
              </Button>
            </Link>
          )}
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            data-testid="button-view-grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="button-view-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by address or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="w-[140px]" data-testid="select-property-type">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Single Family">Single Family</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                  <SelectItem value="Condo">Condo</SelectItem>
                  <SelectItem value="Multi-Family">Multi-Family</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[140px]" data-testid="select-price-range">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under200k">Under $200K</SelectItem>
                  <SelectItem value="200k-400k">$200K - $400K</SelectItem>
                  <SelectItem value="400k-600k">$400K - $600K</SelectItem>
                  <SelectItem value="over600k">Over $600K</SelectItem>
                </SelectContent>
              </Select>
              <Select value={bedsFilter} onValueChange={setBedsFilter}>
                <SelectTrigger className="w-[120px]" data-testid="select-beds">
                  <SelectValue placeholder="Beds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Beds</SelectItem>
                  <SelectItem value="1">1 Bed</SelectItem>
                  <SelectItem value="2">2 Beds</SelectItem>
                  <SelectItem value="3">3 Beds</SelectItem>
                  <SelectItem value="4+">4+ Beds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || propertyType !== "all" || priceRange !== "all" || bedsFilter !== "all"
                ? "Try adjusting your filters to see more results"
                : "Check back soon for new listings"}
            </p>
            {(searchQuery || propertyType !== "all" || priceRange !== "all" || bedsFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setPropertyType("all");
                  setPriceRange("all");
                  setBedsFilter("all");
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <PropertyGridCard
              key={listing.id}
              listing={listing}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
              onSave={() => handleSave(String(listing.id))}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredListings.map((listing) => (
            <PropertyListCard
              key={listing.id}
              listing={listing}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
              onSave={() => handleSave(String(listing.id))}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}

      {filteredListings.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {filteredListings.length} {filteredListings.length === 1 ? "property" : "properties"}
        </p>
      )}
    </div>
  );
}

interface PropertyCardProps {
  listing: RetailListing;
  formatCurrency: (amount: number) => string;
  getStatusBadge: (status: string) => JSX.Element;
  onSave: () => void;
  isAuthenticated: boolean;
}

function PropertyGridCard({ listing, formatCurrency, getStatusBadge, onSave, isAuthenticated }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`property-card-${listing.id}`}>
      <div className="relative aspect-[4/3] bg-muted">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.propertyAddress}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          {getStatusBadge(listing.status)}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white dark:bg-black/50 dark:hover:bg-black/70"
          onClick={(e) => {
            e.preventDefault();
            onSave();
          }}
          data-testid={`button-save-${listing.id}`}
          title={isAuthenticated ? "Save to favorites" : "Login to save"}
        >
          <Heart className="h-4 w-4" />
        </Button>
        {listing.featured && (
          <Badge className="absolute bottom-3 left-3 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <p className="text-2xl font-bold" data-testid={`price-${listing.id}`}>{formatCurrency(listing.listPrice)}</p>
        </div>
        <p className="font-medium mb-1 line-clamp-1" data-testid={`address-${listing.id}`}>{listing.propertyAddress}</p>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
          <MapPin className="h-3 w-3" />
          {listing.city}, {listing.state} {listing.zipCode}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {listing.bedrooms && (
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {listing.bedrooms} bed
            </span>
          )}
          {listing.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {listing.bathrooms} bath
            </span>
          )}
          {listing.sqft && (
            <span className="flex items-center gap-1">
              <Ruler className="h-4 w-4" />
              {listing.sqft.toLocaleString()} sqft
            </span>
          )}
        </div>
        <Link href={`/marketflow/properties/${listing.id}`}>
          <Button className="w-full" data-testid={`button-view-${listing.id}`}>
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function PropertyListCard({ listing, formatCurrency, getStatusBadge, onSave, isAuthenticated }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`property-card-${listing.id}`}>
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-64 aspect-[4/3] md:aspect-auto md:h-48 bg-muted flex-shrink-0">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.propertyAddress}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            {getStatusBadge(listing.status)}
          </div>
        </div>
        <CardContent className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-2xl font-bold" data-testid={`price-${listing.id}`}>{formatCurrency(listing.listPrice)}</p>
                <p className="font-medium" data-testid={`address-${listing.id}`}>{listing.propertyAddress}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {listing.city}, {listing.state} {listing.zipCode}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSave}
                data-testid={`button-save-${listing.id}`}
                title={isAuthenticated ? "Save to favorites" : "Login to save"}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              {listing.bedrooms && (
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  {listing.bedrooms} bed
                </span>
              )}
              {listing.bathrooms && (
                <span className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  {listing.bathrooms} bath
                </span>
              )}
              {listing.sqft && (
                <span className="flex items-center gap-1">
                  <Ruler className="h-4 w-4" />
                  {listing.sqft.toLocaleString()} sqft
                </span>
              )}
              <Badge variant="outline">{listing.propertyType}</Badge>
            </div>
            {listing.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
            )}
          </div>
          <div className="mt-4">
            <Link href={`/marketflow/properties/${listing.id}`}>
              <Button data-testid={`button-view-${listing.id}`}>
                View Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
