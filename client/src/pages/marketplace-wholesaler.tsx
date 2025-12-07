import { useQuery, useMutation } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WholesaleDeal, JVRequest } from "@shared/schema";
import {
  Briefcase,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Building2,
  Handshake,
  XCircle,
  Eye,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

interface DealStats {
  active: number;
  pending: number;
  sold: number;
  totalVolume: number;
}

export default function MarketplaceWholesalerPage() {
  const { profile, user } = useSupabaseAuth();
  const { toast } = useToast();
  const isPegasus = profile?.is_pegasus_badged;

  const { data: stats, isLoading } = useQuery<DealStats>({
    queryKey: ["/api/marketplace/wholesaler/stats"],
  });

  const { data: myDeals, isLoading: isDealsLoading } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/supabase/wholesale-deals/my"],
  });

  const { data: jvRequests, isLoading: isJVLoading } = useQuery<JVRequest[]>({
    queryKey: ["/api/supabase/jv-requests"],
  });

  const updateJVMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/supabase/jv-requests/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/jv-requests"] });
      toast({ title: "Request Updated", description: "JV request status has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update request.", variant: "destructive" });
    },
  });

  const displayStats: DealStats = stats ?? {
    active: 0,
    pending: 0,
    sold: 0,
    totalVolume: 0,
  };
  
  const recentDeals = myDeals?.slice(0, 5) || [];
  const pendingJVRequests = jvRequests?.filter(r => r.status === "pending") || [];

  return (
    <AuthGuard requiredRoles={["admin", "pegasus_wholesaler", "wholesaler"]}>
      <MarketplaceLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold" data-testid="text-page-title">
                Wholesaler Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your deals and grow your buyer network
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isPegasus && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Pegasus Verified
                </Badge>
              )}
              <Link href="/marketplace/wholesaler/submit">
                <Button data-testid="button-submit-deal">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit New Deal
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-active-deals">
                    {displayStats.active}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Listed on marketplace</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-pending-deals">
                    {displayStats.pending}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deals Closed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-sold-deals">
                    {displayStats.sold}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Total lifetime</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-total-volume">
                    ${displayStats.totalVolume.toLocaleString()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Assignment fees earned</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Deals</CardTitle>
                <CardDescription>Your latest wholesale submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {isDealsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentDeals.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No deals yet</p>
                    <Link href="/marketplace/wholesaler/submit">
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Submit Your First Deal
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentDeals.map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg border hover-elevate" data-testid={`deal-item-${deal.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{deal.propertyAddress}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{deal.city}, {deal.state}</span>
                              <span className="mx-1">|</span>
                              <span>${((deal.contractPrice || 0) / 1000).toFixed(0)}K</span>
                            </div>
                          </div>
                        </div>
                        <DealStatusBadge status={deal.status || "under_review"} />
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/marketplace/wholesaler/deals">
                  <Button variant="ghost" className="w-full mt-4" data-testid="link-view-all-deals">
                    View All Deals
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="w-5 h-5" />
                  JV Requests
                </CardTitle>
                <CardDescription>Dreamscapers interested in your deals</CardDescription>
              </CardHeader>
              <CardContent>
                {isJVLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : pendingJVRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Handshake className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No pending requests</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      When Dreamscapers want to partner on your deals, they'll appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingJVRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="p-3 rounded-lg border" data-testid={`jv-request-${request.id}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">Deal #{request.dealId}</p>
                            <p className="text-sm text-muted-foreground">
                              Strategy: {request.intendedStrategy || "Fix & Flip"}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        {request.message && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            "{request.message}"
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => updateJVMutation.mutate({ id: request.id, status: "accepted" })}
                            disabled={updateJVMutation.isPending}
                            data-testid={`button-accept-${request.id}`}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateJVMutation.mutate({ id: request.id, status: "rejected" })}
                            disabled={updateJVMutation.isPending}
                            data-testid={`button-reject-${request.id}`}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Decline
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            data-testid={`button-view-profile-${request.id}`}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Profile
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Submit New Deal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  List a new wholesale deal for our network of Dreamscapers and investors.
                </p>
                <Link href="/marketplace/wholesaler/submit">
                  <Button className="w-full" data-testid="action-submit-deal">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Deal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Browse Buyers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with verified Dreamscapers and investors in our network.
                </p>
                <Link href="/marketplace/discover">
                  <Button variant="outline" className="w-full" data-testid="action-browse-buyers">
                    <Users className="h-4 w-4 mr-2" />
                    View Network
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Deal Calculators</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyze your deals with our MAO, rehab, and ROI calculators.
                </p>
                <Link href="/calculators">
                  <Button variant="outline" className="w-full" data-testid="action-calculators">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Open Calculators
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {!isPegasus && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Become a Pegasus Wholesaler</CardTitle>
                </div>
                <CardDescription>
                  Get verified status, priority listing, and access to exclusive buyer networks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button data-testid="button-apply-pegasus">
                  Apply for Pegasus Status
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </MarketplaceLayout>
    </AuthGuard>
  );
}

function DealStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "available":
    case "listed":
    case "approved":
      return <Badge>Listed</Badge>;
    case "under_review":
    case "pending":
      return <Badge variant="secondary">Under Review</Badge>;
    case "sold":
    case "closed":
      return <Badge variant="outline">Sold</Badge>;
    case "expired":
    case "cancelled":
      return <Badge variant="destructive">Expired</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
