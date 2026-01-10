import { useQuery, useMutation } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  XCircle,
  Home,
  DollarSign,
  History,
  Search,
  User,
  Star,
  Edit,
  Save,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminStats {
  totalSellerLeads: number;
  pendingSellerLeads: number;
  totalInvestorLeads: number;
  activeWholesaleDeals: number;
  activeCapitalProjects: number;
}

interface PendingItem {
  id: number;
  type: "wholesale_deal" | "capital_project";
  title: string;
  description: string;
  submittedBy: string;
  createdAt: string;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  roles: string[];
}

interface Lead {
  id: number;
  type: "seller" | "investor";
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

interface AuditLogEntry {
  id: number;
  adminUserId: string;
  adminEmail: string | null;
  adminName: string | null;
  actionType: string;
  resourceType: string | null;
  resourceId: string | null;
  description: string;
  previousValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface AuditLogsResponse {
  logs: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export default function MarketplaceAdminPage() {
  const { toast } = useToast();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [auditLogFilter, setAuditLogFilter] = useState<string>("all");

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/marketflow/admin/stats"],
  });

  const { data: pendingItems = [], isLoading: pendingLoading } = useQuery<PendingItem[]>({
    queryKey: ["/api/marketflow/admin/pending"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/marketflow/admin/users"],
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/marketflow/admin/leads"],
  });

  const auditLogQueryKey = auditLogFilter === "all" 
    ? "/api/audit-logs?limit=50" 
    : `/api/audit-logs?limit=50&actionType=${auditLogFilter}`;
  
  const { data: auditLogsData, isLoading: auditLogsLoading } = useQuery<AuditLogsResponse>({
    queryKey: [auditLogQueryKey],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ itemType, itemId, approved }: { itemType: string; itemId: number; approved: boolean }) => {
      const endpoint = itemType === "wholesale_deal" 
        ? `/api/marketflow/admin/deals/${itemId}/status`
        : `/api/marketflow/admin/projects/${itemId}/status`;
      return apiRequest("PATCH", endpoint, {
        status: approved ? "listed" : "rejected",
        rejectionReason: approved ? undefined : rejectionReason,
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.approved ? "Approved" : "Rejected",
        description: `Item has been ${variables.approved ? "approved and listed" : "rejected"}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketflow/admin/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketflow/admin/stats"] });
      setReviewDialogOpen(false);
      setSelectedItem(null);
      setRejectionReason("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item status.",
        variant: "destructive",
      });
    },
  });

  const displayStats: AdminStats = stats ?? {
    totalSellerLeads: 0,
    pendingSellerLeads: 0,
    totalInvestorLeads: 0,
    activeWholesaleDeals: 0,
    activeCapitalProjects: 0,
  };

  const handleReview = (item: PendingItem) => {
    setSelectedItem(item);
    setReviewDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedItem) return;
    approveMutation.mutate({ itemType: selectedItem.type, itemId: selectedItem.id, approved: true });
  };

  const handleReject = () => {
    if (!selectedItem) return;
    approveMutation.mutate({ itemType: selectedItem.type, itemId: selectedItem.id, approved: false });
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
              <Link href="/marketflow/admin/settings">
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
                {statsLoading ? (
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
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-amber-600" data-testid="stat-pending">
                    {pendingItems.length}
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
                {statsLoading ? (
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
                {statsLoading ? (
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
                {statsLoading ? (
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
              <TabsTrigger value="pending" data-testid="tab-pending">
                Pending Actions
                {pendingItems.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{pendingItems.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
              <TabsTrigger value="deals" data-testid="tab-deals">Deals</TabsTrigger>
              <TabsTrigger value="leads" data-testid="tab-leads">Leads</TabsTrigger>
              <TabsTrigger value="audit-log" data-testid="tab-audit-log">
                <History className="h-4 w-4 mr-1" />
                Audit Log
              </TabsTrigger>
              <TabsTrigger value="content" data-testid="tab-content">
                <Home className="h-4 w-4 mr-1" />
                Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Items Requiring Attention</CardTitle>
                  <CardDescription>Review and approve pending submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : pendingItems.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="font-medium mb-2">All Caught Up!</h3>
                      <p className="text-sm text-muted-foreground">
                        No pending items require your attention.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingItems.map((item) => (
                        <div 
                          key={`${item.type}-${item.id}`} 
                          className="flex items-center justify-between p-3 rounded-lg border"
                          data-testid={`pending-item-${item.type}-${item.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                              {item.type === "wholesale_deal" ? (
                                <Briefcase className="h-5 w-5 text-amber-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Pending Review</Badge>
                            <Button 
                              size="sm" 
                              onClick={() => handleReview(item)}
                              data-testid={`button-review-${item.id}`}
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {usersLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.slice(0, 10).map((user) => (
                        <div 
                          key={user.id} 
                          className="flex items-center justify-between p-3 rounded-lg border"
                          data-testid={`user-row-${user.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.profileImageUrl || undefined} />
                              <AvatarFallback>
                                {getInitials(user.firstName, user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {user.roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs capitalize">
                                {role.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Wholesale Deals</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active</span>
                          <span className="font-medium">{displayStats.activeWholesaleDeals}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pending Review</span>
                          <span className="font-medium text-amber-600">
                            {pendingItems.filter(i => i.type === "wholesale_deal").length}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Capital Projects</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active</span>
                          <span className="font-medium">{displayStats.activeCapitalProjects}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pending Review</span>
                          <span className="font-medium text-amber-600">
                            {pendingItems.filter(i => i.type === "capital_project").length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  {leadsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No leads found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leads.map((lead) => (
                        <div 
                          key={`${lead.type}-${lead.id}`} 
                          className="flex items-center justify-between p-3 rounded-lg border"
                          data-testid={`lead-row-${lead.type}-${lead.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              lead.type === "seller" ? "bg-blue-100" : "bg-green-100"
                            }`}>
                              {lead.type === "seller" ? (
                                <Home className="h-5 w-5 text-blue-600" />
                              ) : (
                                <DollarSign className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{lead.name}</p>
                              <p className="text-sm text-muted-foreground">{lead.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={lead.status === "new" ? "default" : "secondary"} className="capitalize">
                              {lead.status}
                            </Badge>
                            <Button size="sm" variant="outline">Contact</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link href="/marketflow/admin/leads">
                    <Button variant="ghost" className="w-full mt-4" data-testid="link-manage-leads">
                      View All Leads
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit-log" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Admin Activity Log
                      </CardTitle>
                      <CardDescription>Track all administrative actions on the platform</CardDescription>
                    </div>
                    <Select value={auditLogFilter} onValueChange={setAuditLogFilter}>
                      <SelectTrigger className="w-[180px]" data-testid="select-audit-filter">
                        <SelectValue placeholder="Filter by action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="user_created">User Created</SelectItem>
                        <SelectItem value="user_updated">User Updated</SelectItem>
                        <SelectItem value="role_assigned">Role Assigned</SelectItem>
                        <SelectItem value="deal_approved">Deal Approved</SelectItem>
                        <SelectItem value="deal_rejected">Deal Rejected</SelectItem>
                        <SelectItem value="project_approved">Project Approved</SelectItem>
                        <SelectItem value="badge_awarded">Badge Awarded</SelectItem>
                        <SelectItem value="setting_changed">Setting Changed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {auditLogsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : !auditLogsData?.logs?.length ? (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No Activity Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Admin actions will appear here once they occur.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3 pr-4">
                        {auditLogsData.logs.map((log) => (
                          <div 
                            key={log.id} 
                            className="flex items-start gap-3 p-3 rounded-lg border"
                            data-testid={`audit-log-${log.id}`}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium">{log.adminName || log.adminEmail || "Admin"}</p>
                                <Badge variant="outline" className="text-xs">
                                  {log.actionType.replace(/_/g, " ")}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                              {log.resourceType && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {log.resourceType}: {log.resourceId}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(log.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                  {auditLogsData && auditLogsData.total > 50 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Showing 50 of {auditLogsData.total} entries
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <HomepageContentManager />
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Submission</DialogTitle>
              <DialogDescription>
                Approve or reject this {selectedItem?.type === "wholesale_deal" ? "wholesale deal" : "capital project"} submission.
              </DialogDescription>
            </DialogHeader>
            
            {selectedItem && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <h4 className="font-medium">{selectedItem.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{selectedItem.description}</p>
                  {selectedItem.createdAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Submitted on {formatDate(selectedItem.createdAt)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason (optional)</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Provide a reason if rejecting..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                    data-testid="textarea-rejection-reason"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={approveMutation.isPending}
                data-testid="button-reject"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                data-testid="button-approve"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MarketplaceLayout>
    </AuthGuard>
  );
}

interface HomepageContent {
  id: number;
  section: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface FeaturedDeal {
  id: number;
  dealType: string;
  dealId: number;
  displayOrder: number | null;
  expiresAt: string | null;
  featuredBy: string | null;
}

interface WholesaleDealSummary {
  id: number;
  propertyAddress: string;
  city: string;
  state: string;
  askingPrice: number | null;
  status: string;
}

interface StoredHomepageContent {
  id: number;
  sectionKey: string;
  content: string;
  contentType: string | null;
  isActive: boolean | null;
  updatedBy: string | null;
  updatedAt: string;
}

function HomepageContentManager() {
  const { toast } = useToast();
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroCta, setHeroCta] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: wholesaleDeals = [] } = useQuery<WholesaleDealSummary[]>({
    queryKey: ["/api/wholesale-deals"],
  });

  const { data: featuredDeals = [], isLoading: featuredLoading } = useQuery<FeaturedDeal[]>({
    queryKey: ["/api/admin/featured-deals"],
  });

  const { data: storedContent = [] } = useQuery<StoredHomepageContent[]>({
    queryKey: ["/api/admin/homepage-content"],
  });

  React.useEffect(() => {
    if (storedContent.length > 0) {
      const heroTitleContent = storedContent.find(c => c.sectionKey === "hero_title");
      const heroSubtitleContent = storedContent.find(c => c.sectionKey === "hero_subtitle");
      const heroCtaContent = storedContent.find(c => c.sectionKey === "hero_cta");
      
      if (heroTitleContent) setHeroTitle(heroTitleContent.content);
      if (heroSubtitleContent) setHeroSubtitle(heroSubtitleContent.content);
      if (heroCtaContent) setHeroCta(heroCtaContent.content);
    }
  }, [storedContent]);

  const saveContentMutation = useMutation({
    mutationFn: async ({ sectionKey, content }: { sectionKey: string; content: string }) => {
      return apiRequest("POST", "/api/admin/homepage-content", { sectionKey, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/homepage-content"] });
    },
  });

  const handleSaveHeroContent = async () => {
    setIsSaving(true);
    try {
      const saves = [];
      if (heroTitle.trim()) {
        saves.push(saveContentMutation.mutateAsync({ sectionKey: "hero_title", content: heroTitle }));
      }
      if (heroSubtitle.trim()) {
        saves.push(saveContentMutation.mutateAsync({ sectionKey: "hero_subtitle", content: heroSubtitle }));
      }
      if (heroCta.trim()) {
        saves.push(saveContentMutation.mutateAsync({ sectionKey: "hero_cta", content: heroCta }));
      }
      await Promise.all(saves);
      toast({ title: "Hero content saved successfully" });
    } catch (error) {
      toast({ title: "Failed to save hero content", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const featureDealMutation = useMutation({
    mutationFn: async ({ dealType, dealId, priority }: { dealType: string; dealId: number; priority: number }) => {
      return apiRequest("POST", "/api/admin/featured-deals", {
        dealType,
        dealId,
        priority,
        isActive: true,
      });
    },
    onSuccess: () => {
      toast({ title: "Deal featured successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/featured-deals"] });
    },
    onError: () => {
      toast({ title: "Failed to feature deal", variant: "destructive" });
    },
  });

  const unfeatureDealMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/featured-deals/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Deal unfeatured" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/featured-deals"] });
    },
    onError: () => {
      toast({ title: "Failed to unfeature deal", variant: "destructive" });
    },
  });

  const activeDeals = wholesaleDeals.filter(d => d.status === "approved" || d.status === "listed" || d.status === "active");
  const featuredDealIds = new Set(featuredDeals.map(f => `${f.dealType}-${f.dealId}`));

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Homepage Hero
          </CardTitle>
          <CardDescription>
            Customize the main hero section on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-title">Hero Title</Label>
            <Input
              id="hero-title"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="Transform Distressed Assets Into Dream Investments"
              data-testid="input-hero-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
            <Textarea
              id="hero-subtitle"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Your premier destination for wholesale real estate deals..."
              rows={3}
              data-testid="input-hero-subtitle"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-cta">Call to Action Text</Label>
            <Input
              id="hero-cta"
              value={heroCta}
              onChange={(e) => setHeroCta(e.target.value)}
              placeholder="Explore MarketFlow"
              data-testid="input-hero-cta"
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleSaveHeroContent}
            disabled={isSaving}
            data-testid="button-save-hero"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Hero Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Deals
          </CardTitle>
          <CardDescription>
            Select deals to highlight on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {featuredLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {featuredDeals.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Currently Featured
                  </Label>
                  {featuredDeals.map((fd) => {
                    const deal = wholesaleDeals.find(d => d.id === fd.dealId);
                    return (
                      <div 
                        key={fd.id} 
                        className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20"
                        data-testid={`featured-deal-${fd.id}`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {deal?.propertyAddress || `Deal #${fd.dealId}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Order: {fd.displayOrder || 0} | {fd.dealType}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => unfeatureDealMutation.mutate(fd.id)}
                          disabled={unfeatureDealMutation.isPending}
                          data-testid={`button-unfeature-${fd.id}`}
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2">
                <Label>Available Deals</Label>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {activeDeals.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No active deals available to feature
                      </p>
                    ) : (
                      activeDeals
                        .filter(d => !featuredDealIds.has(`wholesale-${d.id}`))
                        .map((deal) => (
                          <div 
                            key={deal.id} 
                            className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                            data-testid={`available-deal-${deal.id}`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{deal.propertyAddress}</p>
                              <p className="text-xs text-muted-foreground">
                                {deal.city}, {deal.state} | {formatCurrency(deal.askingPrice)}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => featureDealMutation.mutate({
                                dealType: "wholesale",
                                dealId: deal.id,
                                priority: featuredDeals.length + 1,
                              })}
                              disabled={featureDealMutation.isPending}
                              data-testid={`button-feature-${deal.id}`}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Feature
                            </Button>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
