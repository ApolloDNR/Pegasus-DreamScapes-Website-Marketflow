import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseMarketplace } from "@/hooks/use-supabase-marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerChildren, StaggerItem, HoverLift } from "@/components/animations";
import type { WholesaleDeal } from "@shared/schema";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Home,
  TrendingUp,
  Calendar,
  Award,
  Star,
  ArrowRight,
  Building2,
  Bookmark,
  CheckCircle2,
  Clock,
  Target,
  Crown
} from "lucide-react";

interface WholesalerReputation {
  trustScore: number | null;
  rating: number | null;
  dealsClosedCount: number | null;
  onTimeClosingsCount: number | null;
}

interface WholesalerBadge {
  type: string;
  label: string;
  icon: string | null;
  color: string | null;
}

interface MarketplaceDeal extends WholesaleDeal {
  isPegasusDeal?: boolean;
  wholesalerInfo?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  } | null;
  wholesalerReputation?: WholesalerReputation | null;
  wholesalerBadges?: WholesalerBadge[];
}

export default function MarketplaceDeals() {
  return (
    <MarketplaceLayout>
      <DealsPage />
    </MarketplaceLayout>
  );
}

function DealsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [strategy, setStrategy] = useState<string>("all");
  const { isAuthenticated } = useSupabaseAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isItemSaved, toggleSaveItem, isSaving, createJVRequest, isCreatingJVRequest } = useSupabaseMarketplace();

  const handleProtectedAction = (action: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: `Please sign in to ${action}. Create a free account to save deals and submit JV requests.`,
        variant: "default",
        duration: 3000,
      });
      setTimeout(() => {
        setLocation("/login");
      }, 1500);
      return false;
    }
    return true;
  };

  const handleSaveDeal = async (dealId: string) => {
    if (!handleProtectedAction("save this deal")) return;
    await toggleSaveItem('wholesale_deal', dealId);
  };

  const { data: deals, isLoading } = useQuery<MarketplaceDeal[]>({
    queryKey: ['/api/marketplace/deals', { isPublic: true }],
  });

  const filteredDeals = deals?.filter(deal => {
    let matches = true;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matches = matches && (
        deal.propertyAddress?.toLowerCase().includes(query) ||
        deal.city?.toLowerCase().includes(query) ||
        false
      );
    }
    
    if (propertyType !== "all") {
      matches = matches && deal.propertyType === propertyType;
    }
    
    if (strategy !== "all") {
      matches = matches && deal.dispositionPath === strategy;
    }
    
    if (priceRange !== "all") {
      const price = deal.askingPrice || 0;
      switch (priceRange) {
        case "under100k":
          matches = matches && price < 100000;
          break;
        case "100k-250k":
          matches = matches && price >= 100000 && price < 250000;
          break;
        case "250k-500k":
          matches = matches && price >= 250000 && price < 500000;
          break;
        case "over500k":
          matches = matches && price >= 500000;
          break;
      }
    }
    
    return matches;
  }) || [];

  return (
    <div className="p-6">
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2" data-testid="text-deals-title">
            Browse Wholesale Deals
          </h1>
          <p className="text-muted-foreground">
            Discover off-market properties from verified wholesalers. Submit JV requests on deals that match your criteria.
          </p>
        </div>
      </ScrollReveal>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by address, city, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-deals"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="w-[160px]" data-testid="select-property-type">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="single-family">Single Family</SelectItem>
              <SelectItem value="multi-family">Multi Family</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-[160px]" data-testid="select-price-range">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under100k">Under $100K</SelectItem>
              <SelectItem value="100k-250k">$100K - $250K</SelectItem>
              <SelectItem value="250k-500k">$250K - $500K</SelectItem>
              <SelectItem value="over500k">$500K+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={strategy} onValueChange={setStrategy}>
            <SelectTrigger className="w-[160px]" data-testid="select-strategy">
              <SelectValue placeholder="Strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Strategies</SelectItem>
              <SelectItem value="fix-flip">Fix & Flip</SelectItem>
              <SelectItem value="buy-hold">Buy & Hold</SelectItem>
              <SelectItem value="BRRRR">BRRRR</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-48 w-full rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Deals Found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || propertyType !== "all" || priceRange !== "all" 
              ? "Try adjusting your filters to see more deals."
              : "Check back soon for new wholesale opportunities."
            }
          </p>
          {(searchQuery || propertyType !== "all" || priceRange !== "all") && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setPropertyType("all");
                setPriceRange("all");
                setStrategy("all");
              }}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.05}>
          {filteredDeals.map((deal) => (
            <StaggerItem key={deal.id}>
              <DealCard 
                deal={deal} 
                onProtectedAction={handleProtectedAction}
                onSave={handleSaveDeal}
                isSaved={isItemSaved('wholesale_deal', String(deal.id))}
                isSaving={isSaving}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Showing {filteredDeals.length} of {deals?.length || 0} deals
      </div>
    </div>
  );
}

interface DealCardProps {
  deal: MarketplaceDeal;
  onProtectedAction: (action: string) => boolean;
  onSave: (dealId: string) => void;
  isSaved: boolean;
  isSaving: boolean;
}

function DealCard({ deal, onProtectedAction, onSave, isSaved, isSaving }: DealCardProps) {
  const handleSaveDeal = () => {
    onSave(String(deal.id));
  };

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
    <HoverLift>
      <Card className="h-full flex flex-col" data-testid={`deal-card-${deal.id}`}>
        <CardHeader className="pb-2">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-3">
            {deal.images && deal.images[0] ? (
              <img 
                src={deal.images[0]} 
                alt={deal.propertyAddress || "Property"} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
            
            <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
              {deal.isPegasusDeal && (
                <Badge className="bg-primary text-primary-foreground">
                  <Crown className="w-3 h-3 mr-1" />
                  Pegasus
                </Badge>
              )}
              {deal.isHot && (
                <Badge className="bg-red-500 text-white">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Hot
                </Badge>
              )}
              {deal.isFeatured && (
                <Badge variant="secondary">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>

            <div className="absolute top-2 right-2">
              <button 
                className={`p-2 rounded-full shadow-sm transition-colors ${
                  isSaved 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-white/90 hover:bg-white text-muted-foreground'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSaveDeal();
                }}
                disabled={isSaving}
                data-testid={`button-save-deal-${deal.id}`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg line-clamp-1">{deal.propertyAddress}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {deal.city}, {deal.state}
              </CardDescription>
            </div>
            {deal.dealScore && deal.dealScore >= 80 && (
              <Badge variant="outline" className="border-green-500/30 text-green-600 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                A Deal
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Asking Price</p>
              <p className="font-semibold">{formatCurrency(deal.askingPrice)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">ARV</p>
              <p className="font-semibold">{formatCurrency(deal.arv)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Est. Repairs</p>
              <p className="font-semibold">{formatCurrency(deal.estimatedRepairs)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Assignment Fee</p>
              <p className="font-semibold">{formatCurrency(deal.assignmentFee)}</p>
            </div>
          </div>

          {spread && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 mb-4">
              <span className="text-sm font-medium">Spread</span>
              <span className="text-lg font-bold text-green-600">{spread}%</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">
              <Home className="w-3 h-3 mr-1" />
              {deal.propertyType || "Residential"}
            </Badge>
            {deal.dispositionPath && (
              <Badge variant="secondary">
                <Target className="w-3 h-3 mr-1" />
                {deal.dispositionPath}
              </Badge>
            )}
            {deal.daysOnMarket !== undefined && deal.daysOnMarket !== null && (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {deal.daysOnMarket}d
              </Badge>
            )}
          </div>

          {(deal.wholesalerReputation || (deal.wholesalerBadges && deal.wholesalerBadges.length > 0)) && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Wholesaler</p>
              <div className="flex items-center gap-3">
                {deal.wholesalerReputation && (
                  <div className="flex items-center gap-2">
                    {deal.wholesalerReputation.trustScore !== null && (
                      <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-sm font-medium">{deal.wholesalerReputation.trustScore}</span>
                      </div>
                    )}
                    {deal.wholesalerReputation.rating !== null && deal.wholesalerReputation.rating !== undefined && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{Number(deal.wholesalerReputation.rating).toFixed(1)}</span>
                      </div>
                    )}
                    {deal.wholesalerReputation.dealsClosedCount !== null && deal.wholesalerReputation.dealsClosedCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({deal.wholesalerReputation.dealsClosedCount} deals)
                      </span>
                    )}
                  </div>
                )}
                {deal.wholesalerBadges && deal.wholesalerBadges.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {deal.wholesalerBadges.slice(0, 3).map((badge, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs py-0 px-1.5"
                        style={badge.color ? { borderColor: badge.color, color: badge.color } : undefined}
                      >
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-4 border-t">
          <Link href={`/marketplace/deals/${deal.id}`} className="w-full">
            <Button className="w-full" data-testid={`button-view-deal-${deal.id}`}>
              View Deal
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </HoverLift>
  );
}
