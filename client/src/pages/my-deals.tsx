import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/components/deal-cards";
import {
  Building2,
  DollarSign,
  Home,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Plus,
  MapPin,
  Calendar,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WholesaleDeal, CapitalProject, Listing } from "@shared/schema";
import { PrivateDataError } from "@/components/private-data-state";

export default function MyDealsPage() {
  useSEO({
    title: "My Deals",
    description: "Private MarketFlow personal dealflow surface.",
    noIndex: true,
  });
  const { user, isAuthenticated } = useSupabaseAuth();

  if (!isAuthenticated) {
    return (
      <MarketplaceLayout>
        <div className="container py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Sign in Required</CardTitle>
              <CardDescription>
                Please sign in to view and manage your deals
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/login">Sign In</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout>
      <MyDealsContent />
    </MarketplaceLayout>
  );
}

function MyDealsContent() {
  const [activeTab, setActiveTab] = useState("wholesale");
  const { toast } = useToast();

  const {
    data: wholesaleDeals,
    isLoading: wholesaleLoading,
    isError: wholesaleError,
    isFetching: wholesaleFetching,
    refetch: refetchWholesale,
  } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/portal/wholesaler/my-deals"],
  });

  const {
    data: capitalProjects,
    isLoading: capitalLoading,
    isError: capitalError,
    isFetching: capitalFetching,
    refetch: refetchCapital,
  } = useQuery<CapitalProject[]>({
    queryKey: ["/api/portal/my-capital-projects"],
  });

  const {
    data: listings,
    isLoading: listingsLoading,
    isError: listingsError,
    isFetching: listingsFetching,
    refetch: refetchListings,
  } = useQuery<Listing[]>({
    queryKey: ["/api/portal/my-listings"],
  });

  const wholesaleUnavailable = wholesaleError || (!wholesaleLoading && !Array.isArray(wholesaleDeals));
  const capitalUnavailable = capitalError || (!capitalLoading && !Array.isArray(capitalProjects));
  const listingsUnavailable = listingsError || (!listingsLoading && !Array.isArray(listings));
  const wholesaleCount = wholesaleLoading || wholesaleUnavailable || !wholesaleDeals ? null : wholesaleDeals.length;
  const capitalCount = capitalLoading || capitalUnavailable || !capitalProjects ? null : capitalProjects.length;
  const listingsCount = listingsLoading || listingsUnavailable || !listings ? null : listings.length;
  const totalDeals =
    wholesaleCount === null || capitalCount === null || listingsCount === null
      ? null
      : wholesaleCount + capitalCount + listingsCount;
  const countLabel = (count: number | null) => count === null ? "—" : count;

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">My Deals</h1>
            <p className="text-muted-foreground">
              Manage your submitted deals across all categories
            </p>
          </div>
          <Button asChild data-testid="button-submit-deal">
            <Link href="/marketflow/submit">
              <Plus className="w-4 h-4 mr-2" />
              Submit New Deal
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold" data-testid="stat-total-deals">{countLabel(totalDeals)}</p>
                  <p className="text-xs text-muted-foreground">Total Deals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Building2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{countLabel(wholesaleCount)}</p>
                  <p className="text-xs text-muted-foreground">Wholesale</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{countLabel(capitalCount)}</p>
                  <p className="text-xs text-muted-foreground">Capital Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Home className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{countLabel(listingsCount)}</p>
                  <p className="text-xs text-muted-foreground">Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="wholesale" data-testid="tab-wholesale">
            Wholesale ({countLabel(wholesaleCount)})
          </TabsTrigger>
          <TabsTrigger value="capital" data-testid="tab-capital">
            Capital Requests ({countLabel(capitalCount)})
          </TabsTrigger>
          <TabsTrigger value="listings" data-testid="tab-listings">
            Listings ({countLabel(listingsCount)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wholesale">
          {wholesaleLoading ? (
            <DealsLoadingSkeleton />
          ) : wholesaleUnavailable ? (
            <PrivateDataError
              title="Wholesale submissions unavailable"
              description="Pegasus could not verify your wholesale submission history. This is not an empty-list result."
              onRetry={() => void refetchWholesale()}
              isRetrying={wholesaleFetching}
              testId="state-wholesale-deals-error"
            />
          ) : wholesaleDeals && wholesaleDeals.length > 0 ? (
            <div className="grid gap-4">
              {wholesaleDeals.map((deal) => (
                <WholesaleDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="No wholesale deals yet"
              description="Submit wholesale opportunity information for Pegasus to review. Submission does not promise approval, matching, or a response."
              actionLabel="Submit Opportunity"
              actionHref="/marketflow/submit"
            />
          )}
        </TabsContent>

        <TabsContent value="capital">
          {capitalLoading ? (
            <DealsLoadingSkeleton />
          ) : capitalUnavailable ? (
            <PrivateDataError
              title="Capital relationship requests unavailable"
              description="Pegasus could not verify your capital-introduction request history. This is not an empty-list result."
              onRetry={() => void refetchCapital()}
              isRetrying={capitalFetching}
              testId="state-capital-deals-error"
            />
          ) : capitalProjects && capitalProjects.length > 0 ? (
            <div className="grid gap-4">
              {capitalProjects.map((project) => (
                <CapitalProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={DollarSign}
              title="No capital relationship requests yet"
              description="Share project context to request a possible relationship introduction. Pegasus does not offer, arrange, or commit capital here."
              actionLabel="Request an Introduction"
              actionHref="/marketflow/submit"
            />
          )}
        </TabsContent>

        <TabsContent value="listings">
          {listingsLoading ? (
            <DealsLoadingSkeleton />
          ) : listingsUnavailable ? (
            <PrivateDataError
              title="Listing submissions unavailable"
              description="Pegasus could not verify your listing submission history. This is not an empty-list result."
              onRetry={() => void refetchListings()}
              isRetrying={listingsFetching}
              testId="state-listing-deals-error"
            />
          ) : listings && listings.length > 0 ? (
            <div className="grid gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Home}
              title="No listings yet"
              description="Submit property information for review. Publication and inquiries are not guaranteed."
              actionLabel="Submit Property"
              actionHref="/marketflow/submit"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { icon: typeof CheckCircle; variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    approved: { icon: CheckCircle, variant: "default", label: "Approved" },
    active: { icon: CheckCircle, variant: "default", label: "Active" },
    pending: { icon: Clock, variant: "secondary", label: "Pending Review" },
    under_review: { icon: AlertCircle, variant: "secondary", label: "Under Review" },
    rejected: { icon: XCircle, variant: "destructive", label: "Rejected" },
    sold: { icon: CheckCircle, variant: "outline", label: "Sold" },
    completed: { icon: CheckCircle, variant: "outline", label: "Completed" },
    funded: { icon: TrendingUp, variant: "default", label: "Funded" },
  };

  const config = statusConfig[status] || { icon: AlertCircle, variant: "secondary" as const, label: status };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

function WholesaleDealCard({ deal }: { deal: WholesaleDeal }) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<WholesaleDeal>) => {
      const response = await apiRequest("PATCH", `/api/wholesale-deals/${deal.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portal/wholesaler/my-deals"] });
      setIsEditing(false);
      toast({ title: "Deal updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update deal", variant: "destructive" });
    },
  });

  return (
    <>
      <Card className="hover-elevate" data-testid={`card-wholesale-deal-${deal.id}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                  <Building2 className="w-5 h-5 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium truncate">{deal.propertyAddress}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {deal.city}, {deal.state} {deal.zipCode}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <StatusBadge status={deal.status} />
                    <span className="text-sm">
                      <span className="text-muted-foreground">Asking:</span>{" "}
                      <span className="font-medium">{formatCurrency(deal.askingPrice)}</span>
                    </span>
                    {deal.arv && (
                      <span className="text-sm">
                        <span className="text-muted-foreground">ARV:</span>{" "}
                        <span className="font-medium">{formatCurrency(deal.arv)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/marketflow/deals/${deal.id}`}>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                data-testid={`button-edit-wholesale-${deal.id}`}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditWholesaleDialog
        deal={deal}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSave={(data) => updateMutation.mutate(data)}
        isPending={updateMutation.isPending}
      />
    </>
  );
}

function CapitalProjectCard({ project }: { project: CapitalProject }) {
  return (
    <Card className="hover-elevate" data-testid={`card-capital-project-${project.id}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate">{project.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {project.location || "Location not specified"}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge variant="outline">Relationship record</Badge>
                  {project.fundingGoal > 0 && (
                    <span className="text-sm">
                      <span className="text-muted-foreground">Submitted capital need:</span>{" "}
                      <span className="font-medium">{formatCurrency(project.fundingGoal)}</span>
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Stored project context only. It is not an investment offering, capital commitment, approval, or funding-progress report.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/marketflow/capital/${project.id}`}>
                <Eye className="w-4 h-4 mr-1" />
                View record
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Listing>) => {
      const response = await apiRequest("PATCH", `/api/listings/${listing.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portal/my-listings"] });
      setIsEditing(false);
      toast({ title: "Listing updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update listing", variant: "destructive" });
    },
  });

  return (
    <>
      <Card className="hover-elevate" data-testid={`card-listing-${listing.id}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 flex-shrink-0">
                  <Home className="w-5 h-5 text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium truncate">{listing.propertyAddress}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {listing.city}, {listing.state} {listing.zipCode}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <StatusBadge status={listing.status} />
                    <span className="text-sm">
                      <span className="text-muted-foreground">Price:</span>{" "}
                      <span className="font-medium">{formatCurrency(listing.listPrice)}</span>
                    </span>
                    <span className="text-sm">
                      <span className="text-muted-foreground">Type:</span>{" "}
                      <span className="font-medium">{listing.propertyType}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/marketflow/listings/${listing.id}`}>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                data-testid={`button-edit-listing-${listing.id}`}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditListingDialog
        listing={listing}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSave={(data) => updateMutation.mutate(data)}
        isPending={updateMutation.isPending}
      />
    </>
  );
}

function EditWholesaleDialog({
  deal,
  open,
  onOpenChange,
  onSave,
  isPending,
}: {
  deal: WholesaleDeal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<WholesaleDeal>) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState({
    askingPrice: deal.askingPrice || 0,
    arv: deal.arv || 0,
    estimatedRepairs: deal.estimatedRepairs || 0,
    description: deal.description || "",
    assignmentFee: deal.assignmentFee || 0,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Wholesale Deal</DialogTitle>
          <DialogDescription>
            Update the details for {deal.propertyAddress}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="askingPrice">Asking Price</Label>
              <Input
                id="askingPrice"
                type="number"
                value={formData.askingPrice}
                onChange={(e) => setFormData({ ...formData, askingPrice: Number(e.target.value) })}
                data-testid="input-asking-price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arv">ARV</Label>
              <Input
                id="arv"
                type="number"
                value={formData.arv}
                onChange={(e) => setFormData({ ...formData, arv: Number(e.target.value) })}
                data-testid="input-arv"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedRepairs">Estimated Repairs</Label>
              <Input
                id="estimatedRepairs"
                type="number"
                value={formData.estimatedRepairs}
                onChange={(e) => setFormData({ ...formData, estimatedRepairs: Number(e.target.value) })}
                data-testid="input-repairs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignmentFee">Assignment Fee</Label>
              <Input
                id="assignmentFee"
                type="number"
                value={formData.assignmentFee}
                onChange={(e) => setFormData({ ...formData, assignmentFee: Number(e.target.value) })}
                data-testid="input-assignment-fee"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              data-testid="input-description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)} disabled={isPending} data-testid="button-save-changes">
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditListingDialog({
  listing,
  open,
  onOpenChange,
  onSave,
  isPending,
}: {
  listing: Listing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Listing>) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState({
    listPrice: listing.listPrice,
    bedrooms: listing.bedrooms || 0,
    bathrooms: listing.bathrooms || "",
    sqft: listing.sqft || 0,
    description: listing.description || "",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
          <DialogDescription>
            Update the details for {listing.propertyAddress}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="listPrice">List Price</Label>
            <Input
              id="listPrice"
              type="number"
              value={formData.listPrice}
              onChange={(e) => setFormData({ ...formData, listPrice: Number(e.target.value) })}
              data-testid="input-list-price"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                data-testid="input-bedrooms"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                placeholder="e.g., 2, 2.5"
                data-testid="input-bathrooms"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sqft">Sq Ft</Label>
              <Input
                id="sqft"
                type="number"
                value={formData.sqft}
                onChange={(e) => setFormData({ ...formData, sqft: Number(e.target.value) })}
                data-testid="input-sqft"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              data-testid="input-description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)} disabled={isPending} data-testid="button-save-changes">
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <p className="text-muted-foreground text-center mb-4 max-w-sm">{description}</p>
        <Button asChild>
          <Link href={actionHref}>
            <Plus className="w-4 h-4 mr-2" />
            {actionLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function DealsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
