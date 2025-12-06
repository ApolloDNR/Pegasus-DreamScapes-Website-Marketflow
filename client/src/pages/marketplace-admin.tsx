import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import {
  Users,
  Briefcase,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Settings,
  BarChart3,
} from "lucide-react";

interface AdminStats {
  totalSellerLeads: number;
  pendingSellerLeads: number;
  totalInvestorLeads: number;
  activeWholesaleDeals: number;
  activeCapitalProjects: number;
}

export default function MarketplaceAdminPage() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/marketplace/admin/stats"],
  });

  const displayStats: AdminStats = stats ?? {
    totalSellerLeads: 0,
    pendingSellerLeads: 0,
    totalInvestorLeads: 0,
    activeWholesaleDeals: 0,
    activeCapitalProjects: 0,
  };

  return (
    <AuthGuard requiredRoles={["admin"]}>
      <MarketplaceLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold flex items-center gap-2" data-testid="text-page-title">
                <ShieldCheck className="h-8 w-8" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage users, deals, and platform operations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/marketplace/admin/settings">
                <Button variant="outline" data-testid="button-settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Seller Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-seller-leads">
                    {displayStats.totalSellerLeads}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Seller</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-amber-600" data-testid="stat-pending-seller">
                    {displayStats.pendingSellerLeads}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investor Leads</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-investor-leads">
                    {displayStats.totalInvestorLeads}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wholesale Deals</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-wholesale-deals">
                    {displayStats.activeWholesaleDeals}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Capital Projects</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-capital-projects">
                    {displayStats.activeCapitalProjects}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pending Actions</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="deals">Deals</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Items Requiring Attention</CardTitle>
                  <CardDescription>Review and approve pending submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">New Wholesale Deal Submission</p>
                          <p className="text-sm text-muted-foreground">123 Oak Street by John Smith</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Pending Review</Badge>
                        <Button size="sm">Review</Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                          <Users className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">Pegasus Wholesaler Application</p>
                          <p className="text-sm text-muted-foreground">Jane Doe requesting upgrade</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Pending Review</Badge>
                        <Button size="sm">Review</Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                          <FileText className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">Capital Project Submission</p>
                          <p className="text-sm text-muted-foreground">Victorian Revival by DreamScaper Pro</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Pending Review</Badge>
                        <Button size="sm">Review</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest platform registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">John Smith</p>
                        <p className="text-sm text-muted-foreground">john@example.com</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Wholesaler</Badge>
                        <Badge variant="outline">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">Jane Doe</p>
                        <p className="text-sm text-muted-foreground">jane@example.com</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Investor</Badge>
                        <Badge variant="outline">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Link href="/marketplace/admin/users">
                    <Button variant="ghost" className="w-full mt-4" data-testid="link-manage-users">
                      Manage All Users
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Deal Overview</CardTitle>
                  <CardDescription>Manage wholesale deals and capital projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-medium mb-2">Wholesale Deals</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active</span>
                          <span className="font-medium">18</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pending Review</span>
                          <span className="font-medium text-amber-600">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Closed This Month</span>
                          <span className="font-medium">7</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-medium mb-2">Capital Projects</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active</span>
                          <span className="font-medium">6</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pending Review</span>
                          <span className="font-medium text-amber-600">2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Funded This Month</span>
                          <span className="font-medium">3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href="/marketplace/admin/deals">
                    <Button variant="ghost" className="w-full mt-4" data-testid="link-manage-deals">
                      Manage All Deals
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leads" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Leads</CardTitle>
                  <CardDescription>Seller and investor leads from funnels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">Property Owner - 456 Elm St</p>
                        <p className="text-sm text-muted-foreground">Seller lead | Motivated</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">New</Badge>
                        <Button size="sm" variant="outline">Contact</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">Investor - $500k budget</p>
                        <p className="text-sm text-muted-foreground">Investor lead | Fix & Flip focus</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">New</Badge>
                        <Button size="sm" variant="outline">Contact</Button>
                      </div>
                    </div>
                  </div>
                  <Link href="/marketplace/admin/leads">
                    <Button variant="ghost" className="w-full mt-4" data-testid="link-manage-leads">
                      View All Leads
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MarketplaceLayout>
    </AuthGuard>
  );
}
