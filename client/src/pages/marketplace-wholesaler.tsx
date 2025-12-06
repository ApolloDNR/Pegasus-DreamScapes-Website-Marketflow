import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
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
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

interface DealStats {
  active: number;
  pending: number;
  sold: number;
  totalVolume: number;
}

export default function MarketplaceWholesalerPage() {
  const { profile } = useSupabaseAuth();
  const isPegasus = profile?.is_pegasus_badged;

  const { data: stats, isLoading } = useQuery<DealStats>({
    queryKey: ["/api/marketplace/wholesaler/stats"],
    enabled: false,
  });

  const mockStats: DealStats = {
    active: 3,
    pending: 2,
    sold: 12,
    totalVolume: 425000,
  };

  const displayStats = stats ?? mockStats;

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
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">123 Oak Street</p>
                      <p className="text-sm text-muted-foreground">Single Family | $85,000</p>
                    </div>
                    <Badge variant="secondary">Under Review</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">456 Maple Avenue</p>
                      <p className="text-sm text-muted-foreground">Duplex | $120,000</p>
                    </div>
                    <Badge>Listed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">789 Pine Road</p>
                      <p className="text-sm text-muted-foreground">Single Family | $95,000</p>
                    </div>
                    <Badge variant="outline">Sold</Badge>
                  </div>
                </div>
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
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for wholesalers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/marketplace/wholesaler/submit" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-submit-deal">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit New Deal
                  </Button>
                </Link>
                <Link href="/marketplace/discover" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-browse-buyers">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Buyer Network
                  </Button>
                </Link>
                <Link href="/calculators" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="action-calculators">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Deal Calculators
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
