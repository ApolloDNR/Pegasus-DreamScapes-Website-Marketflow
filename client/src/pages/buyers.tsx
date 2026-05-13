import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Home, 
  MapPin, 
  DollarSign,
  TrendingUp,
  ArrowRight,
  Loader2,
  Building2,
  Sparkles,
  CheckCircle2,
  Clock,
  Hammer,
  Star,
  Bed,
  Bath,
  Ruler,
  Calendar,
  Key,
  Shield,
  Heart
} from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WholesaleDeal, RetailListing } from "@shared/schema";

const inquiryFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Phone number is required"),
  company: z.string().optional(),
  buyerType: z.string().min(1, "Please select buyer type"),
  preApproved: z.boolean().optional(),
  fundingSource: z.string().optional(),
  message: z.string().optional(),
});

type InquiryFormData = z.infer<typeof inquiryFormSchema>;

export default function Buyers() {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <FeaturedListingsSection />
      <PropertyTabs />
      <WhyBuyWithUs />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-tan/10" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-tan/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <Badge variant="secondary" className="mb-6 text-xs uppercase tracking-[0.2em]">
          <Key className="w-3 h-3 mr-2" />
          Find Your Next Investment
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-buyers-hero">
          Properties for Buyers
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
          Whether you're looking for off-market wholesale deals or beautifully renovated move-in ready homes, 
          Pegasus DreamScapes has the inventory to match your investment goals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#listings">
            <Button size="lg" data-testid="button-browse-properties">
              Browse Properties
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
          <Link href="/invest">
            <Button size="lg" variant="outline" data-testid="button-become-investor">
              Become an Investor
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedListingsSection() {
  const { data: listings, isLoading } = useQuery<RetailListing[]>({
    queryKey: ["/api/retail-listings"],
  });
  
  const { data: wholesaleDeals } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/wholesale-deals"],
  });

  const offMarketListings = listings?.filter(l => l.listingSource === "off_market" && l.status === "active") || [];
  const mlsListings = listings?.filter(l => l.listingSource === "mls" && l.status === "active") || [];
  const availableDeals = wholesaleDeals?.filter(d => d.status === "available") || [];

  const hasOffMarket = offMarketListings.length > 0 || availableDeals.length > 0;
  const hasMLS = mlsListings.length > 0;

  if (isLoading) {
    return (
      <section id="listings" className="py-16 lg:py-24 bg-stone scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!hasOffMarket && !hasMLS) {
    return (
      <section id="listings" className="py-16 lg:py-24 bg-stone scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-tan font-medium mb-4">Our Listings</p>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Current Properties</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Exclusive off-market deals and MLS listings - all available through Pegasus DreamScapes.
            </p>
          </div>
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
              <Home className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Properties Currently Available</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              New properties are coming soon. Join our buyer list to get notified first.
            </p>
            <Link href="/contact">
              <Button data-testid="button-join-waitlist">
                Join Buyer List
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section id="listings" className="py-16 lg:py-24 bg-stone scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-tan font-medium mb-4">Our Listings</p>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4" data-testid="text-featured-listings-title">Current Properties</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Exclusive off-market deals and MLS listings - all available through Pegasus DreamScapes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Off-Market Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold" data-testid="text-off-market-title">Off-Market</h3>
                <p className="text-sm text-muted-foreground">Exclusive properties not on MLS</p>
              </div>
              <Badge variant="secondary" className="ml-auto" data-testid="badge-off-market-count">
                {offMarketListings.length + availableDeals.length} Available
              </Badge>
            </div>
            
            {(offMarketListings.length === 0 && availableDeals.length === 0) ? (
              <Card className="sleek-card p-8 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No off-market properties currently available.</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon for new exclusive deals.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {offMarketListings.slice(0, 3).map((listing) => (
                  <Card key={listing.id} className="sleek-card overflow-hidden" data-testid={`card-off-market-${listing.id}`}>
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 relative">
                        {listing.images && listing.images.length > 0 ? (
                          <img 
                            src={listing.images[0]} 
                            alt={listing.propertyAddress}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Home className="w-8 h-8 text-primary/50" />
                          </div>
                        )}
                        <Badge variant="default" className="absolute top-2 left-2 text-[10px] bg-primary">
                          Off-Market
                        </Badge>
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-lg">{formatCurrency(listing.listPrice)}</p>
                          <p className="text-sm text-muted-foreground truncate">{listing.propertyAddress}</p>
                          <p className="text-xs text-muted-foreground">{listing.city}, {listing.state}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                          {listing.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{listing.bedrooms}</span>}
                          {listing.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{listing.bathrooms}</span>}
                          {listing.sqft && <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{listing.sqft.toLocaleString()}</span>}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
                {availableDeals.slice(0, Math.max(0, 3 - offMarketListings.length)).map((deal) => (
                  <Card key={deal.id} className="sleek-card overflow-hidden" data-testid={`card-off-market-deal-${deal.id}`}>
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-green-600/20 to-green-600/5 relative">
                        {deal.images && deal.images.length > 0 ? (
                          <img 
                            src={deal.images[0]} 
                            alt={deal.propertyAddress}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Hammer className="w-8 h-8 text-green-600/50" />
                          </div>
                        )}
                        <Badge variant="default" className="absolute top-2 left-2 text-[10px] bg-green-600">
                          Wholesale
                        </Badge>
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-lg">{formatCurrency(deal.contractPrice)}</p>
                          <p className="text-sm text-muted-foreground truncate">{deal.propertyAddress}</p>
                          <p className="text-xs text-muted-foreground">{deal.city}, {deal.state}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                          {deal.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{deal.bedrooms}</span>}
                          {deal.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{deal.bathrooms}</span>}
                          <span className="text-green-600 font-medium">Fee: {formatCurrency(deal.assignmentFee)}</span>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* MLS Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold" data-testid="text-mls-title">On MLS</h3>
                <p className="text-sm text-muted-foreground">Listed on the open market</p>
              </div>
              <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700" data-testid="badge-mls-count">
                {mlsListings.length} Available
              </Badge>
            </div>
            
            {mlsListings.length === 0 ? (
              <Card className="sleek-card p-8 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No MLS listings currently available.</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon for new listings.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {mlsListings.slice(0, 3).map((listing) => (
                  <Card key={listing.id} className="sleek-card overflow-hidden" data-testid={`card-mls-${listing.id}`}>
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-blue-600/20 to-blue-600/5 relative">
                        {listing.images && listing.images.length > 0 ? (
                          <img 
                            src={listing.images[0]} 
                            alt={listing.propertyAddress}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Home className="w-8 h-8 text-blue-600/50" />
                          </div>
                        )}
                        <Badge variant="default" className="absolute top-2 left-2 text-[10px] bg-blue-600">
                          MLS
                        </Badge>
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-lg">{formatCurrency(listing.listPrice)}</p>
                          <p className="text-sm text-muted-foreground truncate">{listing.propertyAddress}</p>
                          <p className="text-xs text-muted-foreground">{listing.city}, {listing.state}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                          {listing.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{listing.bedrooms}</span>}
                          {listing.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{listing.bathrooms}</span>}
                          {listing.sqft && <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{listing.sqft.toLocaleString()}</span>}
                          {listing.mlsNumber && <span className="text-blue-600">MLS# {listing.mlsNumber}</span>}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12">
          <a href="#properties">
            <Button variant="outline" size="lg" data-testid="button-view-all-properties">
              View All Properties
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

function PropertyTabs() {
  const [activeTab, setActiveTab] = useState("flips");

  return (
    <section id="properties" className="py-20 lg:py-32 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-tan font-medium mb-4">Our Inventory</p>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Available Properties</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our current selection of investment opportunities and move-in ready homes.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="flips" data-testid="tab-flips">
              <Star className="w-4 h-4 mr-2" />
              Renovated Homes
            </TabsTrigger>
            <TabsTrigger value="wholesale" data-testid="tab-wholesale">
              <Hammer className="w-4 h-4 mr-2" />
              Wholesale Deals
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="flips">
            <RenovatedFlipsSection />
          </TabsContent>
          
          <TabsContent value="wholesale">
            <WholesaleDealsSection />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function RenovatedFlipsSection() {
  const { data: listings, isLoading, error } = useQuery<RetailListing[]>({
    queryKey: ["/api/retail-listings"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground py-20">
        Unable to load listings. Please try again later.
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
          <Home className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Renovated Homes Available</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          We're currently working on new renovations. Check back soon or join our buyer list to be notified when properties become available.
        </p>
        <Link href="/contact">
          <Button data-testid="button-join-buyer-list">
            Join Buyer List
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {listings.map((listing) => (
        <RetailListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

function RetailListingCard({ listing }: { listing: RetailListing }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      buyerType: "",
      preApproved: false,
      fundingSource: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InquiryFormData) => {
      return apiRequest("POST", "/api/buyer-inquiries", { 
        ...data, 
        listingType: "retail",
        listingId: listing.id 
      });
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Submitted",
        description: "We'll contact you within 24 hours to schedule a showing.",
      });
      form.reset();
      setDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />For Sale</Badge>;
      case "coming_soon":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Coming Soon</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="sleek-card overflow-hidden group" data-testid={`card-listing-${listing.id}`}>
      <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
        {listing.images && listing.images.length > 0 ? (
          <img 
            src={listing.images[0]} 
            alt={listing.propertyAddress}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <Home className="w-12 h-12 text-primary/50 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Property Image</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          {getStatusBadge(listing.status)}
          {listing.featured && (
            <Badge variant="default" className="bg-tan text-foreground">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-3xl font-bold text-white mb-1">{formatCurrency(listing.listPrice)}</p>
          <p className="text-white/90 font-medium">{listing.propertyAddress}</p>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{listing.city}, {listing.state} {listing.zipCode}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {listing.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{listing.bedrooms} Beds</span>
            </div>
          )}
          {listing.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{listing.bathrooms} Baths</span>
            </div>
          )}
          {listing.sqft && (
            <div className="flex items-center gap-1">
              <Ruler className="w-4 h-4" />
              <span>{listing.sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {listing.highlights && listing.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {listing.highlights.slice(0, 3).map((highlight, i) => (
              <span key={i} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                {highlight}
              </span>
            ))}
          </div>
        )}

        {listing.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg" data-testid={`button-inquire-listing-${listing.id}`}>
              <Heart className="mr-2 w-4 h-4" />
              Schedule Showing
            </Button>
          </DialogTrigger>
          <InquiryDialogContent 
            form={form}
            mutation={mutation}
            title="Schedule a Showing"
            description={`Interested in ${listing.propertyAddress}? Fill out this form and we'll contact you to schedule a private showing.`}
          />
        </Dialog>
      </CardContent>
    </Card>
  );
}

function WholesaleDealsSection() {
  const { data: deals, isLoading, error } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/wholesale-deals"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground py-20">
        Unable to load deals. Please try again later.
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
          <Hammer className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Wholesale Deals Available</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Our acquisitions team is actively sourcing new deals. Join our investor list to be notified when properties become available.
        </p>
        <Link href="/invest">
          <Button data-testid="button-join-investor-list">
            Join Investor List
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {deals.map((deal) => (
        <WholesaleDealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
}

function WholesaleDealCard({ deal }: { deal: WholesaleDeal }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      buyerType: "",
      preApproved: false,
      fundingSource: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InquiryFormData) => {
      return apiRequest("POST", "/api/buyer-inquiries", { 
        ...data, 
        listingType: "wholesale",
        listingId: deal.id 
      });
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Submitted",
        description: "We'll review your request and contact you within 24 hours.",
      });
      form.reset();
      setDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case "fix-flip": return "Fix & Flip";
      case "buy-hold": return "Buy & Hold";
      case "wholesale": return "Wholesale";
      default: return strategy;
    }
  };

  const potentialProfit = deal.arv && deal.contractPrice && deal.estimatedRepairs
    ? deal.arv - deal.contractPrice - deal.estimatedRepairs - deal.assignmentFee
    : null;

  return (
    <Card className="sleek-card overflow-hidden" data-testid={`card-wholesale-${deal.id}`}>
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
        {deal.images && deal.images.length > 0 ? (
          <img 
            src={deal.images[0]} 
            alt={deal.propertyAddress}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <Hammer className="w-12 h-12 text-primary/50 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Investment Opportunity</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Available
          </Badge>
          <Badge variant="outline" className="bg-background/70 backdrop-blur-sm">
            {getStrategyLabel(deal.strategy)}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white font-semibold text-lg">{deal.propertyAddress}</p>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{deal.city}, {deal.state} {deal.zipCode}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{deal.propertyType}</p>
            <div className="flex items-center gap-3 text-sm">
              {deal.bedrooms && <span className="font-medium">{deal.bedrooms} Bed</span>}
              {deal.bathrooms && <span className="font-medium">{deal.bathrooms} Bath</span>}
              {deal.sqft && <span className="font-medium">{deal.sqft.toLocaleString()} sqft</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contract Price</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(deal.contractPrice)}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Assignment Fee</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(deal.assignmentFee)}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">ARV</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(deal.arv)}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Est. Repairs</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(deal.estimatedRepairs)}</p>
          </div>
        </div>

        {potentialProfit && potentialProfit > 0 && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Potential Profit</span>
              </div>
              <span className="text-xl font-bold text-green-700 dark:text-green-400">{formatCurrency(potentialProfit)}</span>
            </div>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg" data-testid={`button-inquire-wholesale-${deal.id}`}>
              Request This Deal
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </DialogTrigger>
          <InquiryDialogContent 
            form={form}
            mutation={mutation}
            title="Request Deal Assignment"
            description="Submit your information to request this wholesale deal. We'll review and contact you within 24 hours."
          />
        </Dialog>
      </CardContent>
    </Card>
  );
}

function InquiryDialogContent({ form, mutation, title, description }: { 
  form: any;
  mutation: any;
  title: string;
  description: string;
}) {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data: InquiryFormData) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} data-testid="input-inquiry-name" />
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
                    <Input placeholder="Company name" {...field} data-testid="input-inquiry-company" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} data-testid="input-inquiry-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Your best callback number" {...field} data-testid="input-inquiry-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="buyerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I am a...</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-inquiry-buyertype">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="investor">Real Estate Investor</SelectItem>
                      <SelectItem value="homeowner">Homeowner/End Buyer</SelectItem>
                      <SelectItem value="wholesaler">Wholesaler</SelectItem>
                      <SelectItem value="agent">Real Estate Agent</SelectItem>
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
                      <SelectTrigger data-testid="select-inquiry-funding">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="conventional">Conventional Loan</SelectItem>
                      <SelectItem value="fha">FHA Loan</SelectItem>
                      <SelectItem value="hard-money">Hard Money</SelectItem>
                      <SelectItem value="private-money">Private Money</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about your timeline and any questions..." 
                    className="resize-none"
                    {...field}
                    data-testid="input-inquiry-message"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-inquiry">
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Inquiry"
            )}
          </Button>
        </form>
      </Form>
    </DialogContent>
  );
}

function WhyBuyWithUs() {
  const benefits = [
    {
      icon: Shield,
      title: "Verified Properties",
      description: "Every property is thoroughly inspected and documented before listing."
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      description: "No hidden fees. All costs and profit margins are clearly disclosed."
    },
    {
      icon: Calendar,
      title: "Quick Closings",
      description: "Streamlined process gets you from contract to keys faster."
    },
    {
      icon: Star,
      title: "Quality Renovations",
      description: "Our flips feature premium finishes and modern designs."
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-stone border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-tan font-medium mb-4">Why Choose Us</p>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Buy With Confidence</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pegasus DreamScapes stands behind every property we sell.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4" data-testid="text-buyers-cta">
          Ready to Find Your Next Property?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Whether you're an investor looking for your next flip or a homebuyer searching for your dream home, 
          we're here to help you find the perfect property.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button size="lg" data-testid="button-contact-us">
              Contact Us
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/calculators">
            <Button size="lg" variant="outline" data-testid="button-analyze-numbers">
              Analyze Your Numbers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
