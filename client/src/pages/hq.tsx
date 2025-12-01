import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Home, 
  TrendingUp,
  Mail,
  Phone,
  Building,
  Calendar,
  LogOut,
  Loader2,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Plus,
  FileText,
  CalendarClock,
  History
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SellerLead, InvestorLead, Contact, LeadActivity } from "@shared/schema";

const LEAD_STATUSES = ["new", "contacted", "qualified", "closed", "lost"] as const;
type LeadStatus = typeof LEAD_STATUSES[number];

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  qualified: "bg-green-500/20 text-green-400 border-green-500/30",
  closed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  lost: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_ICONS: Record<LeadStatus, typeof CheckCircle2> = {
  new: AlertCircle,
  contacted: MessageSquare,
  qualified: TrendingUp,
  closed: CheckCircle2,
  lost: XCircle,
};

const ACTIVITY_TYPES = [
  { value: "note", label: "Note", icon: FileText },
  { value: "call", label: "Phone Call", icon: Phone },
  { value: "email", label: "Email Sent", icon: Mail },
  { value: "meeting", label: "Meeting", icon: Users },
  { value: "follow_up", label: "Follow-up Scheduled", icon: CalendarClock },
];

export default function HQ() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <DashboardHeader user={user} />
        <QuickActions />
        <StatsCards />
        <LeadsTabs />
      </div>
    </div>
  );
}

function DashboardHeader({ user }: { user: any }) {
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const displayName = user?.firstName 
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : user?.email?.split('@')[0] || 'User';

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-hq-title">Pegasus HQ</h1>
        <p className="text-muted-foreground">Command Center - Welcome back, {displayName}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.profileImageUrl} alt={displayName} className="object-cover" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}

function QuickActions() {
  const { data: sellerLeads } = useQuery<SellerLead[]>({
    queryKey: ["/api/hq/seller-leads"],
  });
  const { data: investorLeads } = useQuery<InvestorLead[]>({
    queryKey: ["/api/hq/investor-leads"],
  });

  const newSellerLeads = sellerLeads?.filter(l => l.status === "new").length || 0;
  const newInvestorLeads = investorLeads?.filter(l => l.status === "new").length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="hover-elevate cursor-pointer" data-testid="action-new-sellers">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-lg bg-blue-500/20">
            <Home className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">New Seller Leads</p>
            <p className="text-2xl font-bold">{newSellerLeads}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card className="hover-elevate cursor-pointer" data-testid="action-new-investors">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-lg bg-green-500/20">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">New Investor Leads</p>
            <p className="text-2xl font-bold">{newInvestorLeads}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card className="hover-elevate cursor-pointer" data-testid="action-pipeline">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-lg bg-purple-500/20">
            <Building className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Active Deals</p>
            <p className="text-2xl font-bold">
              {(sellerLeads?.filter(l => l.status === "qualified").length || 0) + 
               (investorLeads?.filter(l => l.status === "qualified").length || 0)}
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card className="hover-elevate cursor-pointer" data-testid="action-closed">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-lg bg-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Closed This Month</p>
            <p className="text-2xl font-bold">
              {(sellerLeads?.filter(l => l.status === "closed").length || 0) + 
               (investorLeads?.filter(l => l.status === "closed").length || 0)}
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCards() {
  const { data: sellerLeads, isLoading: loadingSellers, refetch: refetchSellers } = useQuery<SellerLead[]>({
    queryKey: ["/api/hq/seller-leads"],
  });
  const { data: investorLeads, isLoading: loadingInvestors, refetch: refetchInvestors } = useQuery<InvestorLead[]>({
    queryKey: ["/api/hq/investor-leads"],
  });
  const { data: contacts, isLoading: loadingContacts, refetch: refetchContacts } = useQuery<Contact[]>({
    queryKey: ["/api/hq/contacts"],
  });

  const handleRefresh = () => {
    refetchSellers();
    refetchInvestors();
    refetchContacts();
  };

  const isLoading = loadingSellers || loadingInvestors || loadingContacts;

  const stats = [
    {
      title: "Seller Leads",
      value: sellerLeads?.length || 0,
      breakdown: {
        new: sellerLeads?.filter(l => l.status === "new").length || 0,
        contacted: sellerLeads?.filter(l => l.status === "contacted").length || 0,
        qualified: sellerLeads?.filter(l => l.status === "qualified").length || 0,
      },
      icon: Home,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Investor Leads",
      value: investorLeads?.length || 0,
      breakdown: {
        new: investorLeads?.filter(l => l.status === "new").length || 0,
        contacted: investorLeads?.filter(l => l.status === "contacted").length || 0,
        qualified: investorLeads?.filter(l => l.status === "qualified").length || 0,
      },
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Contact Messages",
      value: contacts?.length || 0,
      breakdown: {
        new: contacts?.filter(c => c.status === "new").length || 0,
        contacted: contacts?.filter(c => c.status === "replied").length || 0,
        qualified: contacts?.filter(c => c.status === "resolved").length || 0,
      },
      icon: Mail,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Pipeline Overview</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
          data-testid="button-refresh"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} data-testid={`card-stat-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-3">{stat.value}</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-400">
                  {stat.breakdown.new} new
                </Badge>
                <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-400">
                  {stat.breakdown.contacted} in progress
                </Badge>
                <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30 text-green-400">
                  {stat.breakdown.qualified} qualified
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LeadsTabs() {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Lead Management</h2>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | "all")}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {LEAD_STATUSES.map(status => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="seller-leads" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="seller-leads" data-testid="tab-seller-leads">
            <Home className="w-4 h-4 mr-2" />
            Seller Leads
          </TabsTrigger>
          <TabsTrigger value="investor-leads" data-testid="tab-investor-leads">
            <TrendingUp className="w-4 h-4 mr-2" />
            Investor Leads
          </TabsTrigger>
          <TabsTrigger value="contacts" data-testid="tab-contacts">
            <Mail className="w-4 h-4 mr-2" />
            Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seller-leads">
          <SellerLeadsTable statusFilter={statusFilter} />
        </TabsContent>
        <TabsContent value="investor-leads">
          <InvestorLeadsTable statusFilter={statusFilter} />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsTable statusFilter={statusFilter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ActivityDialog({ 
  open, 
  onOpenChange, 
  leadType, 
  leadId,
  leadName 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  leadType: string;
  leadId: number;
  leadName: string;
}) {
  const { toast } = useToast();
  const [activityType, setActivityType] = useState("note");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const { data: activities, isLoading: loadingActivities } = useQuery<LeadActivity[]>({
    queryKey: ["/api/hq/activities", leadType, leadId],
    enabled: open,
  });

  const addActivityMutation = useMutation({
    mutationFn: async (data: { leadType: string; leadId: number; activityType: string; notes: string; followUpDate?: string }) => {
      const res = await apiRequest("POST", "/api/hq/activities", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/activities", leadType, leadId] });
      toast({
        title: "Activity Added",
        description: "The activity has been logged successfully.",
      });
      setNotes("");
      setFollowUpDate("");
      setActivityType("note");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add activity.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!notes.trim()) {
      toast({
        title: "Error",
        description: "Please enter notes for this activity.",
        variant: "destructive",
      });
      return;
    }
    addActivityMutation.mutate({
      leadType,
      leadId,
      activityType,
      notes,
      followUpDate: followUpDate || undefined,
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type: string) => {
    const activityDef = ACTIVITY_TYPES.find(a => a.value === type);
    return activityDef?.icon || FileText;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lead Activity - {leadName}</DialogTitle>
          <DialogDescription>
            Add notes, schedule follow-ups, and view activity history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Activity
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity-type">Activity Type</Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger id="activity-type" data-testid="select-activity-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="follow-up-date">Follow-up Date (Optional)</Label>
                <Input
                  id="follow-up-date"
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  data-testid="input-follow-up-date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this activity..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                data-testid="input-activity-notes"
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={addActivityMutation.isPending}
              data-testid="button-add-activity"
            >
              {addActivityMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Activity
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <History className="w-4 h-4" />
              Activity History
            </h3>

            {loadingActivities ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.activityType);
                  return (
                    <div 
                      key={activity.id} 
                      className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                      data-testid={`activity-${activity.id}`}
                    >
                      <div className="p-2 rounded-lg bg-primary/20 h-fit">
                        <ActivityIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {ACTIVITY_TYPES.find(t => t.value === activity.activityType)?.label || activity.activityType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(activity.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{activity.notes}</p>
                        {activity.followUpDate && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <CalendarClock className="w-3 h-3" />
                            Follow-up: {formatDate(activity.followUpDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No activity history yet. Add your first note above.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SellerLeadsTable({ statusFilter }: { statusFilter: LeadStatus | "all" }) {
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<SellerLead | null>(null);
  const { data: leads, isLoading } = useQuery<SellerLead[]>({
    queryKey: ["/api/hq/seller-leads"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/hq/seller-leads/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/seller-leads"] });
      toast({
        title: "Status Updated",
        description: "Seller lead status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const filteredLeads = leads?.filter(lead => 
    statusFilter === "all" || lead.status === statusFilter
  ) || [];

  if (filteredLeads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {statusFilter === "all" 
            ? "No seller leads yet. They will appear here when someone submits the seller form."
            : `No seller leads with status "${statusFilter}".`}
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="space-y-4">
        {filteredLeads.map((lead, index) => (
          <Card key={lead.id} data-testid={`card-seller-lead-${index}`}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{lead.name}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {lead.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {lead.phone}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLead(lead)}
                    data-testid={`button-activity-${lead.id}`}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Activity
                  </Button>
                  <Select
                    value={lead.status}
                    onValueChange={(status) => updateStatusMutation.mutate({ id: lead.id, status })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-36" data-testid={`select-status-${lead.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(lead.createdAt)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Property</span>
                  <p className="font-medium flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {lead.propertyType}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Condition</span>
                  <p className="font-medium">{lead.condition}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Timeline</span>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {lead.timeline}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Address</span>
                  <p className="font-medium truncate">{lead.propertyAddress}</p>
                </div>
              </div>
              {lead.notes && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <span className="text-muted-foreground text-sm">Notes:</span>
                  <p className="text-sm mt-1">{lead.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedLead && (
        <ActivityDialog
          open={!!selectedLead}
          onOpenChange={(open) => !open && setSelectedLead(null)}
          leadType="seller"
          leadId={selectedLead.id}
          leadName={selectedLead.name}
        />
      )}
    </>
  );
}

function InvestorLeadsTable({ statusFilter }: { statusFilter: LeadStatus | "all" }) {
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<InvestorLead | null>(null);
  const { data: leads, isLoading } = useQuery<InvestorLead[]>({
    queryKey: ["/api/hq/investor-leads"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/hq/investor-leads/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/investor-leads"] });
      toast({
        title: "Status Updated",
        description: "Investor lead status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const filteredLeads = leads?.filter(lead => 
    statusFilter === "all" || lead.status === statusFilter
  ) || [];

  if (filteredLeads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {statusFilter === "all" 
            ? "No investor leads yet. They will appear here when someone submits the investor form."
            : `No investor leads with status "${statusFilter}".`}
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="space-y-4">
        {filteredLeads.map((lead, index) => (
          <Card key={lead.id} data-testid={`card-investor-lead-${index}`}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{lead.name}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {lead.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {lead.phone}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLead(lead)}
                    data-testid={`button-activity-${lead.id}`}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Activity
                  </Button>
                  <Select
                    value={lead.status}
                    onValueChange={(status) => updateStatusMutation.mutate({ id: lead.id, status })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-36" data-testid={`select-status-${lead.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(lead.createdAt)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Location</span>
                  <p className="font-medium flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {lead.cityState}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Capital Range</span>
                  <p className="font-medium flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {lead.capitalRange}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Investment Type</span>
                  <p className="font-medium">{lead.investmentPreference}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Experience</span>
                  <p className="font-medium">{lead.experienceLevel}</p>
                </div>
              </div>
              {lead.notes && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <span className="text-muted-foreground text-sm">Notes:</span>
                  <p className="text-sm mt-1">{lead.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedLead && (
        <ActivityDialog
          open={!!selectedLead}
          onOpenChange={(open) => !open && setSelectedLead(null)}
          leadType="investor"
          leadId={selectedLead.id}
          leadName={selectedLead.name}
        />
      )}
    </>
  );
}

function ContactsTable({ statusFilter }: { statusFilter: LeadStatus | "all" }) {
  const { toast } = useToast();
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/hq/contacts"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/hq/contacts/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/contacts"] });
      toast({
        title: "Status Updated",
        description: "Contact status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const filteredContacts = contacts?.filter(contact => 
    statusFilter === "all" || contact.status === statusFilter
  ) || [];

  if (filteredContacts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {statusFilter === "all" 
            ? "No contact messages yet. They will appear here when someone submits the contact form."
            : `No contacts with status "${statusFilter}".`}
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {filteredContacts.map((contact, index) => (
        <Card key={contact.id} data-testid={`card-contact-${index}`}>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{contact.name}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {contact.email}
                  </span>
                  {contact.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {contact.phone}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={contact.status}
                  onValueChange={(status) => updateStatusMutation.mutate({ id: contact.id, status })}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-36" data-testid={`select-contact-status-${contact.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(contact.createdAt)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <span className="text-muted-foreground text-sm">Subject:</span>
              <p className="font-medium">{contact.subject}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-md">
              <span className="text-muted-foreground text-sm">Message:</span>
              <p className="text-sm mt-1 whitespace-pre-wrap">{contact.message}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
