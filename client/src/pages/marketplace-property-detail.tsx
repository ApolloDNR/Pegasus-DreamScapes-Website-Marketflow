import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Home,
  Heart,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Calendar,
  ChevronLeft,
  Share2,
  FileText,
  DollarSign,
  Building2,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RetailListing, InsertBuyerOffer } from "@shared/schema";

export default function MarketplacePropertyDetailPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <PropertyDetailContent />
      </div>
    </div>
  );
}

function PropertyDetailContent() {
  const [, params] = useRoute("/marketplace/properties/:id");
  const propertyId = params?.id || null;
  const { isAuthenticated } = useSupabaseAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const { data: listing, isLoading, error } = useQuery<RetailListing>({
    queryKey: ["/api/supabase/listings", propertyId],
    enabled: !!propertyId,
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/supabase/saved-items", {
        itemType: "listing",
        itemId: propertyId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/saved-items"] });
      toast({
        title: "Saved",
        description: "Property added to your favorites",
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

  const handleSave = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to save properties to your favorites",
      });
      navigate("/login");
      return;
    }
    toggleSaveMutation.mutate();
  };

  const handleMakeOffer = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to make an offer",
      });
      navigate("/login");
      return;
    }
    setShowOfferModal(true);
  };

  if (isLoading) {
    return <PropertyDetailSkeleton />;
  }

  if (error || !listing) {
    return (
      <div className="space-y-6">
        <Link href="/marketplace/properties">
          <Button variant="ghost" data-testid="button-back">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </Link>
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Property Not Found</h3>
            <p className="text-muted-foreground">
              This property may no longer be available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "coming_soon":
        return <Badge variant="secondary">Coming Soon</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "sold":
        return <Badge variant="outline">Sold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const canMakeOffer = listing.status === "active";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link href="/marketplace/properties">
          <Button variant="ghost" data-testid="button-back">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSave}
            disabled={toggleSaveMutation.isPending}
            data-testid="button-save"
            title={isAuthenticated ? "Save to favorites" : "Login to save"}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" data-testid="button-share">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-muted">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                alt={listing.propertyAddress}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="w-24 h-24 text-muted-foreground/50" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {getStatusBadge(listing.status)}
              {listing.featured && (
                <Badge className="bg-primary text-primary-foreground">Featured</Badge>
              )}
            </div>
          </div>

          {listing.images && listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.images.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={image}
                    alt={`Property view ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {listing.bedrooms && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bedrooms</p>
                      <p className="font-semibold">{listing.bedrooms}</p>
                    </div>
                  </div>
                )}
                {listing.bathrooms && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                      <p className="font-semibold">{listing.bathrooms}</p>
                    </div>
                  </div>
                )}
                {listing.sqft && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Ruler className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Square Feet</p>
                      <p className="font-semibold">{listing.sqft.toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {listing.yearBuilt && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year Built</p>
                      <p className="font-semibold">{listing.yearBuilt}</p>
                    </div>
                  </div>
                )}
              </div>

              {listing.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
                </div>
              )}

              {listing.features && listing.features.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {listing.features.map((feature, index) => (
                      <Badge key={index} variant="outline">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <p className="text-3xl font-bold">{formatCurrency(listing.listPrice)}</p>
              <CardDescription>
                {listing.sqft && `$${Math.round(listing.listPrice / listing.sqft).toLocaleString()} per sqft`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{listing.propertyAddress}</p>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.city}, {listing.state} {listing.zipCode}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{listing.propertyType}</Badge>
                {listing.lotSize && (
                  <Badge variant="outline">{listing.lotSize}</Badge>
                )}
              </div>

              <div className="space-y-2 pt-2">
                {canMakeOffer && (
                  <Button
                    className="w-full"
                    onClick={handleMakeOffer}
                    data-testid="button-make-offer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {isAuthenticated ? "Make an Offer" : "Login to Make Offer"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowContactModal(true)}
                  data-testid="button-schedule-showing"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Showing
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleSave}
                  disabled={toggleSaveMutation.isPending}
                  data-testid="button-save-listing"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {isAuthenticated ? "Save Listing" : "Login to Save"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Us</CardTitle>
              <CardDescription>Questions about this property?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowContactModal(true)}
                data-testid="button-contact"
              >
                <Phone className="h-4 w-4 mr-2" />
                (555) 123-4567
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowContactModal(true)}
              >
                <Mail className="h-4 w-4 mr-2" />
                info@pegasusdreamscapes.com
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Response within 24 hours</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <OfferModal
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        listing={listing}
        formatCurrency={formatCurrency}
      />

      <ContactModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        listing={listing}
      />
    </div>
  );
}

function PropertyDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="aspect-[16/9] w-full rounded-lg" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

interface OfferModalProps {
  open: boolean;
  onClose: () => void;
  listing: RetailListing;
  formatCurrency: (amount: number) => string;
}

function OfferModal({ open, onClose, listing, formatCurrency }: OfferModalProps) {
  const { toast } = useToast();
  const [offerAmount, setOfferAmount] = useState(listing.listPrice.toString());
  const [fundingType, setFundingType] = useState("cash");
  const [closingTimeline, setClosingTimeline] = useState("30 days");
  const [message, setMessage] = useState("");

  const submitOfferMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/supabase/buyer-offers", {
        listingId: String(listing.id),
        listingType: "retail",
        offerAmount: parseInt(offerAmount),
        financingType: fundingType,
        contingencies: [closingTimeline],
        message: message || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/buyer-offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/listings"] });
      toast({
        title: "Offer Submitted",
        description: "Your offer has been submitted successfully. We'll be in touch soon.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit offer",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>
            Submit your offer for {listing.propertyAddress}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">List Price</p>
            <p className="text-lg font-bold">{formatCurrency(listing.listPrice)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offerAmount">Your Offer</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="offerAmount"
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="pl-10"
                data-testid="input-offer-amount"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Funding Type</Label>
            <Select value={fundingType} onValueChange={setFundingType}>
              <SelectTrigger data-testid="select-funding-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="conventional">Conventional Loan</SelectItem>
                <SelectItem value="fha">FHA Loan</SelectItem>
                <SelectItem value="va">VA Loan</SelectItem>
                <SelectItem value="hard_money">Hard Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Closing Timeline</Label>
            <Select value={closingTimeline} onValueChange={setClosingTimeline}>
              <SelectTrigger data-testid="select-closing-timeline">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="14 days">14 Days</SelectItem>
                <SelectItem value="21 days">21 Days</SelectItem>
                <SelectItem value="30 days">30 Days</SelectItem>
                <SelectItem value="45 days">45 Days</SelectItem>
                <SelectItem value="60 days">60 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Include any contingencies, special terms, or additional information..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
              rows={3}
              data-testid="input-message"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => submitOfferMutation.mutate()}
            disabled={submitOfferMutation.isPending || !offerAmount}
            data-testid="button-submit-offer"
          >
            {submitOfferMutation.isPending ? "Submitting..." : "Submit Offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  listing: RetailListing;
}

function ContactModal({ open, onClose, listing }: ContactModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [requestType, setRequestType] = useState("showing");

  const submitInquiryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/marketplace/buyer/inquiries", {
        propertyType: "retail",
        propertyId: listing.id,
        name,
        email,
        phone: phone || null,
        message: message || null,
        requestType,
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "We'll contact you shortly to schedule your showing.",
      });
      onClose();
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {requestType === "showing" ? "Schedule a Showing" : "Contact Us"}
          </DialogTitle>
          <DialogDescription>
            {listing.propertyAddress}, {listing.city}, {listing.state}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Request Type</Label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger data-testid="select-request-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="showing">Schedule Showing</SelectItem>
                <SelectItem value="question">Ask a Question</SelectItem>
                <SelectItem value="more_info">Request More Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              data-testid="input-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              data-testid="input-phone"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Any specific questions or preferred times..."
              className="resize-none"
              rows={3}
              data-testid="input-message"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => submitInquiryMutation.mutate()}
            disabled={submitInquiryMutation.isPending || !name || !email}
            data-testid="button-submit-inquiry"
          >
            {submitInquiryMutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
