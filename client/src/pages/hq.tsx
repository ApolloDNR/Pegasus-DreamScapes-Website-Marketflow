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
import { PortalHeader } from "@/components/portal-header";
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
import type { SellerLead, InvestorLead, Contact, LeadActivity, WholesaleDeal, WholesaleRequest } from "@shared/schema";

interface QueueItem {
  id: string;
  type: 'follow_up' | 'new_lead';
  priority: 'overdue' | 'today' | 'upcoming' | 'new';
  leadType: 'seller' | 'investor' | 'contact';
  leadId: number;
  leadName: string;
  leadEmail: string;
  description: string;
  dueDate?: string;
  activityId?: number;
  createdAt: string;
}

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
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20">
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
  const displayName = user?.firstName 
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : user?.email?.split('@')[0] || 'User';

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={user?.profileImageUrl} alt={displayName} className="object-cover" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-hq-title">Dreamscaper HQ</h1>
          <p className="text-muted-foreground">Welcome back, {displayName}</p>
        </div>
      </div>
      <PortalHeader currentPortal="staff" />
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

function QueuePanel() {
  const { toast } = useToast();
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<{ type: string; id: number; name: string } | null>(null);

  const { data: queueItems, isLoading } = useQuery<QueueItem[]>({
    queryKey: ["/api/hq/queue"],
  });

  const completeActivityMutation = useMutation({
    mutationFn: async (activityId: number) => {
      const res = await apiRequest("PATCH", `/api/hq/activities/${activityId}/complete`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/queue"] });
      toast({
        title: "Task Completed",
        description: "The follow-up has been marked as done.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete the task.",
        variant: "destructive",
      });
    },
  });

  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ leadType, leadId, status }: { leadType: string; leadId: number; status: string }) => {
      const endpoint = leadType === 'contact' 
        ? `/api/hq/contacts/${leadId}/status`
        : `/api/hq/${leadType}-leads/${leadId}/status`;
      const res = await apiRequest("PATCH", endpoint, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/seller-leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/investor-leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/contacts"] });
      toast({
        title: "Lead Updated",
        description: "The lead status has been changed to contacted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lead status.",
        variant: "destructive",
      });
    },
  });

  const handleMarkContacted = (item: QueueItem) => {
    updateLeadStatusMutation.mutate({ leadType: item.leadType, leadId: item.leadId, status: "contacted" });
  };

  const handleOpenActivity = (item: QueueItem) => {
    setSelectedLead({ type: item.leadType, id: item.leadId, name: item.leadName });
    setActivityDialogOpen(true);
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (date < today) {
      const daysAgo = Math.ceil((today.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
      return `${daysAgo} day${daysAgo > 1 ? 's' : ''} overdue`;
    } else if (date < tomorrow) {
      return 'Today';
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const getPriorityStyles = (priority: QueueItem['priority']) => {
    switch (priority) {
      case 'overdue':
        return { badge: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle, color: 'text-red-400' };
      case 'today':
        return { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock, color: 'text-amber-400' };
      case 'upcoming':
        return { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CalendarClock, color: 'text-blue-400' };
      case 'new':
        return { badge: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Plus, color: 'text-green-400' };
    }
  };

  const getLeadTypeStyles = (leadType: QueueItem['leadType']) => {
    switch (leadType) {
      case 'seller':
        return { icon: Home, color: 'text-primary' };
      case 'investor':
        return { icon: TrendingUp, color: 'text-emerald-400' };
      case 'contact':
        return { icon: Mail, color: 'text-blue-400' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const overdueItems = queueItems?.filter(i => i.priority === 'overdue') || [];
  const todayItems = queueItems?.filter(i => i.priority === 'today') || [];
  const upcomingItems = queueItems?.filter(i => i.priority === 'upcoming') || [];
  const newLeadItems = queueItems?.filter(i => i.priority === 'new') || [];

  const renderQueueItem = (item: QueueItem) => {
    const priorityStyles = getPriorityStyles(item.priority);
    const leadTypeStyles = getLeadTypeStyles(item.leadType);
    const LeadIcon = leadTypeStyles.icon;
    const PriorityIcon = priorityStyles.icon;

    return (
      <Card key={item.id} className="hover-elevate" data-testid={`queue-item-${item.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-lg bg-card ${leadTypeStyles.color}`}>
                <LeadIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate" data-testid={`queue-item-name-${item.id}`}>
                    {item.leadName}
                  </span>
                  <Badge variant="outline" className={`text-xs ${priorityStyles.badge}`}>
                    <PriorityIcon className="w-3 h-3 mr-1" />
                    {item.priority === 'new' ? 'New Lead' : item.dueDate ? formatDueDate(item.dueDate) : item.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {item.leadType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2" data-testid={`queue-item-desc-${item.id}`}>
                  {item.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.leadEmail}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {item.type === 'follow_up' && item.activityId && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => completeActivityMutation.mutate(item.activityId!)}
                  disabled={completeActivityMutation.isPending}
                  data-testid={`button-complete-${item.id}`}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Done
                </Button>
              )}
              {item.type === 'new_lead' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleMarkContacted(item)}
                  disabled={updateLeadStatusMutation.isPending}
                  data-testid={`button-contacted-${item.id}`}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Contacted
                </Button>
              )}
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => handleOpenActivity(item)}
                data-testid={`button-activity-queue-${item.id}`}
              >
                <History className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const totalItems = queueItems?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {totalItems} item{totalItems !== 1 ? 's' : ''} in queue
          </Badge>
          {overdueItems.length > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              {overdueItems.length} overdue
            </Badge>
          )}
          {todayItems.length > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              {todayItems.length} due today
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/hq/queue"] })}
          data-testid="button-refresh-queue"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {totalItems === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
            <p className="text-muted-foreground max-w-sm">
              No pending follow-ups or new leads to action. Great job staying on top of your queue!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {overdueItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Overdue ({overdueItems.length})
              </h3>
              <div className="space-y-3">
                {overdueItems.map(renderQueueItem)}
              </div>
            </div>
          )}

          {todayItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Due Today ({todayItems.length})
              </h3>
              <div className="space-y-3">
                {todayItems.map(renderQueueItem)}
              </div>
            </div>
          )}

          {upcomingItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                Upcoming ({upcomingItems.length})
              </h3>
              <div className="space-y-3">
                {upcomingItems.map(renderQueueItem)}
              </div>
            </div>
          )}

          {newLeadItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Leads ({newLeadItems.length})
              </h3>
              <div className="space-y-3">
                {newLeadItems.map(renderQueueItem)}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedLead && (
        <ActivityDialog 
          open={activityDialogOpen} 
          onOpenChange={setActivityDialogOpen}
          leadType={selectedLead.type}
          leadId={selectedLead.id}
          leadName={selectedLead.name}
        />
      )}
    </div>
  );
}

function LeadsTabs() {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [activeTab, setActiveTab] = useState("queue");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Lead Management</h2>
        {activeTab !== "queue" && (
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
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="queue" data-testid="tab-queue">
            <Clock className="w-4 h-4 mr-2" />
            Work Queue
          </TabsTrigger>
          <TabsTrigger value="wholesale" data-testid="tab-wholesale">
            <DollarSign className="w-4 h-4 mr-2" />
            Wholesale
          </TabsTrigger>
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
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="projects" data-testid="tab-projects">
            <Building className="w-4 h-4 mr-2" />
            Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <QueuePanel />
        </TabsContent>
        <TabsContent value="wholesale">
          <WholesaleDealsPanel />
        </TabsContent>
        <TabsContent value="seller-leads">
          <SellerLeadsTable statusFilter={statusFilter} />
        </TabsContent>
        <TabsContent value="investor-leads">
          <InvestorLeadsTable statusFilter={statusFilter} />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsTable statusFilter={statusFilter} />
        </TabsContent>
        <TabsContent value="users">
          <UserManagementPanel />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectCapitalPanel />
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

const WHOLESALE_STATUSES = ["under_review", "accepted", "rejected", "available", "assigned"] as const;
type WholesaleStatus = typeof WHOLESALE_STATUSES[number];

const WHOLESALE_STATUS_LABELS: Record<WholesaleStatus, string> = {
  under_review: "Under Review",
  accepted: "Accepted (Internal)",
  rejected: "Rejected",
  available: "Available (Public)",
  assigned: "Assigned",
};

const WHOLESALE_STATUS_COLORS: Record<WholesaleStatus, string> = {
  under_review: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  accepted: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  rejected: "bg-red-500/20 text-red-500 border-red-500/30",
  available: "bg-green-500/20 text-green-500 border-green-500/30",
  assigned: "bg-purple-500/20 text-purple-500 border-purple-500/30",
};

function WholesaleDealsPanel() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewRequestsId, setViewRequestsId] = useState<number | null>(null);

  const { data: deals, isLoading } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/hq/wholesale-deals"],
  });

  const { data: allRequests } = useQuery<WholesaleRequest[]>({
    queryKey: ["/api/hq/wholesale-requests"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const res = await apiRequest("PATCH", `/api/hq/wholesale-deals/${id}/status`, { status, notes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/wholesale-deals"] });
      toast({
        title: "Status Updated",
        description: "The deal status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update deal status.",
        variant: "destructive",
      });
    },
  });

  const createDealMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/hq/wholesale-deals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/wholesale-deals"] });
      toast({
        title: "Deal Created",
        description: "The wholesale deal has been added successfully.",
      });
      setCreateDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create deal.",
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

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const dealsByStatus = {
    under_review: deals?.filter(d => d.status === "under_review") || [],
    accepted: deals?.filter(d => d.status === "accepted") || [],
    rejected: deals?.filter(d => d.status === "rejected") || [],
    available: deals?.filter(d => d.status === "available") || [],
    assigned: deals?.filter(d => d.status === "assigned") || [],
  };

  const getRequestsForDeal = (dealId: number) => {
    return allRequests?.filter(r => r.dealId === dealId) || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {deals?.length || 0} total deals
          </Badge>
          <Badge className={WHOLESALE_STATUS_COLORS.under_review}>
            {dealsByStatus.under_review.length} under review
          </Badge>
          <Badge className={WHOLESALE_STATUS_COLORS.available}>
            {dealsByStatus.available.length} available
          </Badge>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-add-deal">
          <Plus className="w-4 h-4 mr-2" />
          Add New Deal
        </Button>
      </div>

      {(!deals || deals.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No wholesale deals yet. Click "Add New Deal" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => {
            const requests = getRequestsForDeal(deal.id);
            return (
              <Card key={deal.id} data-testid={`card-wholesale-deal-${deal.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Home className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg">{deal.propertyAddress}</CardTitle>
                          <CardDescription className="flex flex-wrap items-center gap-3 mt-1">
                            <span>{deal.city}, {deal.state} {deal.zipCode}</span>
                            <span>{deal.propertyType}</span>
                            {deal.bedrooms && deal.bathrooms && (
                              <span>{deal.bedrooms}bd/{deal.bathrooms}ba</span>
                            )}
                            {deal.sqft && <span>{deal.sqft.toLocaleString()} sqft</span>}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Select
                        value={deal.status}
                        onValueChange={(status) => updateStatusMutation.mutate({ id: deal.id, status })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-44" data-testid={`select-deal-status-${deal.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WHOLESALE_STATUSES.map(status => (
                            <SelectItem key={status} value={status}>
                              {WHOLESALE_STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {requests.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setViewRequestsId(viewRequestsId === deal.id ? null : deal.id)}
                          data-testid={`button-view-requests-${deal.id}`}
                        >
                          <Users className="w-4 h-4 mr-1" />
                          {requests.length} Request{requests.length > 1 ? 's' : ''}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase">Contract Price</p>
                      <p className="font-bold">{formatCurrency(deal.contractPrice)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase">Assignment Fee</p>
                      <p className="font-bold text-primary">{formatCurrency(deal.assignmentFee)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase">ARV</p>
                      <p className="font-bold">{formatCurrency(deal.arv)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase">Est. Repairs</p>
                      <p className="font-bold">{formatCurrency(deal.estimatedRepairs)}</p>
                    </div>
                  </div>

                  {deal.description && (
                    <p className="text-sm text-muted-foreground mb-4">{deal.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span>Strategy: <strong className="text-foreground">{deal.strategy}</strong></span>
                    <span>Added: <strong className="text-foreground">{formatDate(deal.createdAt)}</strong></span>
                    {deal.contractExpiration && (
                      <span className="text-amber-500">Contract Expires: <strong>{formatDate(deal.contractExpiration)}</strong></span>
                    )}
                  </div>

                  {viewRequestsId === deal.id && requests.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="text-sm font-medium mb-3">Assignment Requests</h4>
                      <div className="space-y-3">
                        {requests.map((request) => (
                          <div key={request.id} className="p-3 rounded-lg bg-muted/30 text-sm">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium">{request.name}</p>
                                <p className="text-muted-foreground">{request.email} | {request.phone}</p>
                                {request.company && <p className="text-muted-foreground">Company: {request.company}</p>}
                                <p className="mt-1">Experience: {request.experience} | Funding: {request.fundingSource}</p>
                                {request.message && <p className="mt-2 text-muted-foreground italic">"{request.message}"</p>}
                              </div>
                              <Badge variant="outline" className="capitalize">{request.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Wholesale Deal</DialogTitle>
            <DialogDescription>
              Enter the property details for a new wholesale deal under contract.
            </DialogDescription>
          </DialogHeader>
          <CreateDealForm onSubmit={(data) => createDealMutation.mutate(data)} isPending={createDealMutation.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateDealForm({ onSubmit, isPending }: { onSubmit: (data: any) => void; isPending: boolean }) {
  const [formData, setFormData] = useState({
    propertyAddress: "",
    city: "",
    state: "",
    zipCode: "",
    propertyType: "single_family",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    yearBuilt: "",
    lotSize: "",
    contractPrice: "",
    assignmentFee: "",
    arv: "",
    estimatedRepairs: "",
    strategy: "fix-flip",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      sqft: formData.sqft ? parseInt(formData.sqft) : null,
      yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
      contractPrice: parseInt(formData.contractPrice),
      assignmentFee: parseInt(formData.assignmentFee),
      arv: formData.arv ? parseInt(formData.arv) : null,
      estimatedRepairs: formData.estimatedRepairs ? parseInt(formData.estimatedRepairs) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label>Property Address</Label>
          <Input 
            value={formData.propertyAddress} 
            onChange={(e) => setFormData(p => ({ ...p, propertyAddress: e.target.value }))}
            placeholder="123 Main Street"
            required
            data-testid="input-deal-address"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>City</Label>
            <Input 
              value={formData.city} 
              onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
              required
              data-testid="input-deal-city"
            />
          </div>
          <div>
            <Label>State</Label>
            <Input 
              value={formData.state} 
              onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
              required
              data-testid="input-deal-state"
            />
          </div>
          <div>
            <Label>Zip Code</Label>
            <Input 
              value={formData.zipCode} 
              onChange={(e) => setFormData(p => ({ ...p, zipCode: e.target.value }))}
              required
              data-testid="input-deal-zip"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label>Property Type</Label>
          <Select value={formData.propertyType} onValueChange={(v) => setFormData(p => ({ ...p, propertyType: v }))}>
            <SelectTrigger data-testid="select-deal-property-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single_family">Single Family</SelectItem>
              <SelectItem value="multi_family">Multi Family</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Bedrooms</Label>
          <Input 
            type="number" 
            value={formData.bedrooms} 
            onChange={(e) => setFormData(p => ({ ...p, bedrooms: e.target.value }))}
            data-testid="input-deal-beds"
          />
        </div>
        <div>
          <Label>Bathrooms</Label>
          <Input 
            value={formData.bathrooms} 
            onChange={(e) => setFormData(p => ({ ...p, bathrooms: e.target.value }))}
            placeholder="2.5"
            data-testid="input-deal-baths"
          />
        </div>
        <div>
          <Label>Sqft</Label>
          <Input 
            type="number" 
            value={formData.sqft} 
            onChange={(e) => setFormData(p => ({ ...p, sqft: e.target.value }))}
            data-testid="input-deal-sqft"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label>Contract Price</Label>
          <Input 
            type="number" 
            value={formData.contractPrice} 
            onChange={(e) => setFormData(p => ({ ...p, contractPrice: e.target.value }))}
            required
            data-testid="input-deal-contract-price"
          />
        </div>
        <div>
          <Label>Assignment Fee</Label>
          <Input 
            type="number" 
            value={formData.assignmentFee} 
            onChange={(e) => setFormData(p => ({ ...p, assignmentFee: e.target.value }))}
            required
            data-testid="input-deal-assignment-fee"
          />
        </div>
        <div>
          <Label>ARV</Label>
          <Input 
            type="number" 
            value={formData.arv} 
            onChange={(e) => setFormData(p => ({ ...p, arv: e.target.value }))}
            data-testid="input-deal-arv"
          />
        </div>
        <div>
          <Label>Est. Repairs</Label>
          <Input 
            type="number" 
            value={formData.estimatedRepairs} 
            onChange={(e) => setFormData(p => ({ ...p, estimatedRepairs: e.target.value }))}
            data-testid="input-deal-repairs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Strategy</Label>
          <Select value={formData.strategy} onValueChange={(v) => setFormData(p => ({ ...p, strategy: v }))}>
            <SelectTrigger data-testid="select-deal-strategy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fix-flip">Fix & Flip</SelectItem>
              <SelectItem value="buy-hold">Buy & Hold</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Year Built</Label>
          <Input 
            type="number" 
            value={formData.yearBuilt} 
            onChange={(e) => setFormData(p => ({ ...p, yearBuilt: e.target.value }))}
            placeholder="1990"
            data-testid="input-deal-year"
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
          placeholder="Describe the property, condition, and potential..."
          className="resize-none"
          data-testid="input-deal-description"
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isPending} data-testid="button-create-deal">
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Deal"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isApproved?: boolean;
  createdAt?: string;
}

function UserManagementPanel() {
  const { toast } = useToast();
  const [activeUserTab, setActiveUserTab] = useState("investors");
  
  const { data: investorProfiles, isLoading: loadingInvestors } = useQuery<any[]>({
    queryKey: ["/api/hq/investor-profiles"],
  });

  const { data: wholesalerProfiles, isLoading: loadingWholesalers } = useQuery<any[]>({
    queryKey: ["/api/hq/wholesaler-profiles"],
  });

  const { data: buyerProfiles, isLoading: loadingBuyers } = useQuery<any[]>({
    queryKey: ["/api/hq/buyer-profiles"],
  });

  const approveInvestorMutation = useMutation({
    mutationFn: async ({ userId, isApproved }: { userId: string; isApproved: boolean }) => {
      return apiRequest("PATCH", `/api/hq/investors/${userId}/approve`, { isApproved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/investor-profiles"] });
      toast({ title: "Success", description: "Investor status updated" });
    },
  });

  const approveWholesalerMutation = useMutation({
    mutationFn: async ({ userId, isApproved }: { userId: string; isApproved: boolean }) => {
      return apiRequest("PATCH", `/api/hq/wholesalers/${userId}/approve`, { isApproved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/wholesaler-profiles"] });
      toast({ title: "Success", description: "Wholesaler status updated" });
    },
  });

  const approveBuyerMutation = useMutation({
    mutationFn: async ({ userId, isApproved }: { userId: string; isApproved: boolean }) => {
      return apiRequest("PATCH", `/api/hq/buyers/${userId}/approve`, { isApproved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/buyer-profiles"] });
      toast({ title: "Success", description: "Buyer status updated" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investors</p>
                <p className="text-2xl font-bold">{investorProfiles?.length || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Wholesalers</p>
                <p className="text-2xl font-bold">{wholesalerProfiles?.length || 0}</p>
              </div>
              <Building className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Buyers</p>
                <p className="text-2xl font-bold">{buyerProfiles?.length || 0}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeUserTab} onValueChange={setActiveUserTab}>
        <TabsList>
          <TabsTrigger value="investors">Investors</TabsTrigger>
          <TabsTrigger value="wholesalers">Wholesalers</TabsTrigger>
          <TabsTrigger value="buyers">Buyers</TabsTrigger>
        </TabsList>

        <TabsContent value="investors">
          {loadingInvestors ? (
            <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
          ) : !investorProfiles || investorProfiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No investor profiles yet</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {investorProfiles.map((profile: any) => (
                <Card key={profile.id} className="sleek-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>{profile.company?.[0] || 'I'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile.company || 'Private Investor'}</p>
                          <p className="text-sm text-muted-foreground">{profile.cityState}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{profile.capitalRange}</Badge>
                            <Badge variant="outline">{profile.experienceLevel}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={profile.isApproved ? "bg-green-600" : "bg-amber-600"}>
                          {profile.isApproved ? "Approved" : "Pending"}
                        </Badge>
                        {!profile.isApproved && (
                          <Button 
                            size="sm" 
                            onClick={() => approveInvestorMutation.mutate({ userId: profile.userId, isApproved: true })}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wholesalers">
          {loadingWholesalers ? (
            <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
          ) : !wholesalerProfiles || wholesalerProfiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No wholesaler profiles yet</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {wholesalerProfiles.map((profile: any) => (
                <Card key={profile.id} className="sleek-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>{profile.company?.[0] || 'W'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile.company || 'Independent Wholesaler'}</p>
                          <p className="text-sm text-muted-foreground">{profile.cityState}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{profile.yearsExperience || 0} years exp</Badge>
                            <Badge variant="outline">{profile.dealsPerYear || 'N/A'} deals/yr</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={profile.isApproved ? "bg-green-600" : "bg-amber-600"}>
                          {profile.isApproved ? "Approved" : "Pending"}
                        </Badge>
                        {!profile.isApproved && (
                          <Button 
                            size="sm" 
                            onClick={() => approveWholesalerMutation.mutate({ userId: profile.userId, isApproved: true })}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="buyers">
          {loadingBuyers ? (
            <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
          ) : !buyerProfiles || buyerProfiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No buyer profiles yet</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {buyerProfiles.map((profile: any) => (
                <Card key={profile.id} className="sleek-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>{profile.company?.[0] || 'B'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile.company || 'Private Buyer'}</p>
                          <p className="text-sm text-muted-foreground">{profile.cityState}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{profile.buyingPreference}</Badge>
                            <Badge variant="outline">{profile.budgetRange}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={profile.isApproved ? "bg-green-600" : "bg-amber-600"}>
                          {profile.isApproved ? "Approved" : "Pending"}
                        </Badge>
                        {!profile.isApproved && (
                          <Button 
                            size="sm" 
                            onClick={() => approveBuyerMutation.mutate({ userId: profile.userId, isApproved: true })}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectCapitalPanel() {
  const { data: projects, isLoading } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground mt-4">Loading projects...</p>
      </div>
    );
  }

  const totalInvestment = projects?.reduce((acc, p) => acc + (p.totalInvestment || 0), 0) || 0;
  const totalARV = projects?.reduce((acc, p) => acc + (p.arv || 0), 0) || 0;
  const avgROI = projects?.length ? projects.reduce((acc, p) => acc + (p.projectedRoi || 0), 0) / projects.length : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{projects?.length || 0}</p>
              </div>
              <Building className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold">${(totalInvestment / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total ARV</p>
                <p className="text-2xl font-bold">${(totalARV / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Projected ROI</p>
                <p className="text-2xl font-bold">{avgROI.toFixed(0)}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="sleek-card">
        <CardHeader>
          <CardTitle>Project Capital Raising</CardTitle>
          <CardDescription>Track capital needs and investor allocation for active projects</CardDescription>
        </CardHeader>
        <CardContent>
          {!projects || projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No projects available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project: any) => (
                <Card key={project.id} className="border">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">{project.location}</p>
                      </div>
                      <Badge variant="outline">{project.status || 'Active'}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Investment</p>
                        <p className="font-bold">${project.totalInvestment?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Capital Raised</p>
                        <p className="font-bold text-green-600">${(project.capitalRaised || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Capital Needed</p>
                        <p className="font-bold text-amber-600">
                          ${((project.totalInvestment || 0) - (project.capitalRaised || 0)).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Projected ROI</p>
                        <p className="font-bold">{project.projectedRoi || 0}%</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Capital Progress</span>
                        <span>{Math.round(((project.capitalRaised || 0) / (project.totalInvestment || 1)) * 100)}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((project.capitalRaised || 0) / (project.totalInvestment || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
