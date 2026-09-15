import { useMutation } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, QUERY_KEYS } from "@/lib/queryClient";
import type { WholesaleDeal, JVRequest } from "@shared/schema";
import {
  Briefcase,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Building2,
  Handshake,
  XCircle,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { GuestPreviewBanner } from "@/components/guest-preview-banner";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";

interface DealStats {
  active: number;
  pending: number;
  sold: number;
  totalVolume: number;
}

export default function MarketplaceWholesalerPage() {
  const { profile } = useSupabaseAuth();
  const { toast } = useToast();
  const isPegasus = profile?.is_pegasus_badged;

  const {
    data: stats,
    isLoading,
    isError: statsError,
  } = useAuthenticatedQuery<DealStats>(QUERY_KEYS.userStats("wholesaler"));

  const {
    data: myDeals,
    isLoading: isDealsLoading,
    isError: dealsError,
  } = useAuthenticatedQuery<WholesaleDeal[]>([
    "/api/supabase/marketplace/wholesaler/deals",
  ]);

  const {
    data: jvRequests,
    isLoading: isJVLoading,
    isError: jvError,
  } = useAuthenticatedQuery<JVRequest[]>([
    "/api/marketplace/wholesaler/jv-requests",
  ]);

  const updateJVMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/marketplace/jv-requests/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/wholesaler/jv-requests"] });
      toast({ title: "Request Updated", description: "JV request status has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update request.", variant: "destructive" });
    },
  });

  const recentDeals = myDeals?.slice(0, 5) ?? [];
  const pendingJVRequests = jvRequests?.filter((request) => request.status === "pending") ?? [];

  return (
    <AuthGuard requiredRoles={["admin", "pegasus_wholesaler", "wholesaler"]}>
      <MarketplaceLayout>
        <div className="space-y-6">
          <GuestPreviewBanner roleLabel="Wholesaler" />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold" data-testid="text-page-title">
                Wholesaler Dashboard
              </h1>
              <p className="text-muted-foreground">
                Review your private submissions and controlled-pilot collaboration requests.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isPegasus && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Pilot participant
                </Badge>
              )}
              <Link href="/marketflow/submit">
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
                <CardTitle className="text-sm font-medium">Active records</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : statsError || !stats ? (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-active-deals">
                    {stats.active}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Approved account records</p>
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
                ) : statsError || !stats ? (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-pending-deals">
                    {stats.pending}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Awaiting internal review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Closed records</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : statsError || !stats ? (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-sold-deals">
                    {stats.sold}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Statuses recorded in this workspace</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recorded fees</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : statsError || !stats ? (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-total-volume">
                    ${stats.totalVolume.toLocaleString()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Account entries; not proof of payment</p>
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
                ) : dealsError || !myDeals ? (
                  <AccountDataUnavailable
                    testId="state-wholesaler-deals-unavailable"
                    title="Deal records unavailable"
                    detail="No empty deal history is being inferred. Try again after the account connection is restored."
                  />
                ) : recentDeals.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No recorded submissions</p>
                    <Link href="/marketflow/submit">
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
                              {deal.contractPrice ? (
                                <span>${(deal.contractPrice / 1000).toFixed(0)}K</span>
                              ) : (
                                <span>Price not recorded</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <DealStatusBadge status={deal.status || "under_review"} />
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full mt-4"
                  disabled
                  data-testid="button-deal-registry-pilot"
                >
                  Full deal registry · controlled pilot
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="w-5 h-5" />
                  JV Requests
                </CardTitle>
                <CardDescription>Collaboration requests recorded for your submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {isJVLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : jvError || !jvRequests ? (
                  <AccountDataUnavailable
                    testId="state-wholesaler-jv-unavailable"
                    title="JV request records unavailable"
                    detail="No empty request inbox is being inferred. Try again after the account connection is restored."
                  />
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
                              {request.intendedStrategy
                                ? `Proposed strategy: ${request.intendedStrategy}`
                                : "No strategy supplied"}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        {request.message && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {request.message}
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
                  Send a private opportunity record for review in the controlled pilot.
                </p>
                <Link href="/marketflow/submit">
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
                  Buyer introductions are coordinated only when a real opportunity and mandate fit.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled
                  aria-describedby="buyer-network-pilot-note"
                  data-testid="action-browse-buyers-pilot"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Controlled pilot
                </Button>
                <p id="buyer-network-pilot-note" className="mt-2 text-xs text-muted-foreground">
                  Buyer introductions remain coordinated by Pegasus during private beta.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Deal Calculators</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Run self-directed MAO, rehab, and ROI scenarios. Results are estimates, not underwriting.
                </p>
                <Link href="/marketflow/calculators">
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
                  <CardTitle className="text-lg">Need controlled-pilot access?</CardTitle>
                </div>
                <CardDescription>
                  Review the participation process. A request does not grant access or approval.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/marketflow/access">
                  <Button data-testid="button-apply-pegasus">
                    Review access process
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </MarketplaceLayout>
    </AuthGuard>
  );
}

function AccountDataUnavailable({
  testId,
  title,
  detail,
}: {
  testId: string;
  title: string;
  detail: string;
}) {
  return (
    <div
      className="rounded-lg border border-dashed p-6 text-center"
      role="status"
      data-testid={testId}
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
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
