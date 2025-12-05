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
import { AnnouncementsBanner } from "@/components/announcements-banner";
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
import type { SellerLead, InvestorLead, Contact, LeadActivity, WholesaleDeal, WholesaleRequest, Lead } from "@shared/schema";
import { 
  Inbox as InboxIcon,
  Filter,
  ChevronDown,
  ExternalLink,
  Eye
} from "lucide-react";

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
      <AnnouncementsBanner audience="STAFF" />
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
          <TabsTrigger value="leads-inbox" data-testid="tab-leads-inbox">
            <InboxIcon className="w-4 h-4 mr-2" />
            Leads Inbox
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
        <TabsContent value="leads-inbox">
          <UnifiedLeadsInbox />
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

const LEAD_TYPES = ["seller", "investor", "buyer", "contact", "wholesaler", "dreamscaper"] as const;
const LEAD_STAGES = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"] as const;

const LEAD_TYPE_ICONS: Record<string, typeof Home> = {
  seller: Home,
  investor: TrendingUp,
  buyer: Users,
  contact: Mail,
  wholesaler: DollarSign,
  dreamscaper: Building,
};

const LEAD_TYPE_COLORS: Record<string, string> = {
  seller: "bg-primary/20 text-primary border-primary/30",
  investor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  buyer: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contact: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  wholesaler: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  dreamscaper: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const STAGE_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  qualified: "bg-green-500/20 text-green-400 border-green-500/30",
  proposal: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  negotiation: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  won: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  lost: "bg-red-500/20 text-red-400 border-red-500/30",
};

function UnifiedLeadsInbox() {
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const queryParams = new URLSearchParams();
  if (typeFilter !== "all") queryParams.set("leadType", typeFilter);
  if (stageFilter !== "all") queryParams.set("stage", stageFilter);
  const queryString = queryParams.toString();

  const { data: leads, isLoading, refetch } = useQuery<Lead[]>({
    queryKey: ["/api/hq/leads", typeFilter, stageFilter],
    queryFn: async () => {
      const url = queryString ? `/api/hq/leads?${queryString}` : "/api/hq/leads";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
      const res = await apiRequest("PATCH", `/api/hq/leads/${id}`, { stage });
      return res.json();
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/hq/leads"] });
      toast({
        title: "Lead Updated",
        description: "The lead stage has been changed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lead.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getLeadDisplayName = (lead: Lead) => {
    if (lead.firstName && lead.lastName) {
      return `${lead.firstName} ${lead.lastName}`;
    }
    return lead.firstName || lead.email || "Unknown";
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const leadsByType = LEAD_TYPES.reduce((acc, type) => {
    acc[type] = leads?.filter(l => l.leadType === type).length || 0;
    return acc;
  }, {} as Record<string, number>);

  const totalLeads = leads?.length || 0;
  const newLeads = leads?.filter(l => l.stage === "new").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <Badge variant="outline" className="text-sm">
            {totalLeads} total lead{totalLeads !== 1 ? 's' : ''}
          </Badge>
          {newLeads > 0 && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {newLeads} new
            </Badge>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40" data-testid="select-lead-type-filter">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Lead Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {LEAD_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} ({leadsByType[type]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40" data-testid="select-lead-stage-filter">
              <ChevronDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {LEAD_STAGES.map(stage => (
                <SelectItem key={stage} value={stage}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => refetch()}
            data-testid="button-refresh-leads"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {totalLeads === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <InboxIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Leads Found</h3>
            <p className="text-muted-foreground max-w-sm">
              {typeFilter !== "all" || stageFilter !== "all" 
                ? "No leads match your current filters. Try adjusting the filters."
                : "No leads have been submitted yet. New leads will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads?.map(lead => {
            const TypeIcon = LEAD_TYPE_ICONS[lead.leadType] || Mail;
            const typeColor = LEAD_TYPE_COLORS[lead.leadType] || "bg-gray-500/20 text-gray-400";
            const stageColor = STAGE_COLORS[lead.stage] || "bg-gray-500/20 text-gray-400";

            return (
              <Card key={lead.id} className="hover-elevate" data-testid={`lead-card-${lead.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${typeColor.split(' ')[0]}`}>
                        <TypeIcon className={`w-4 h-4 ${typeColor.split(' ')[1]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate" data-testid={`lead-name-${lead.id}`}>
                            {getLeadDisplayName(lead)}
                          </span>
                          <Badge variant="outline" className={`text-xs ${typeColor}`}>
                            {lead.leadType}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${stageColor}`}>
                            {lead.stage}
                          </Badge>
                          {lead.source && (
                            <Badge variant="outline" className="text-xs">
                              {lead.source}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </span>
                          )}
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>
                        {lead.address && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {lead.address}
                          </p>
                        )}
                        {lead.notes && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {lead.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Select 
                        value={lead.stage} 
                        onValueChange={(stage) => updateStageMutation.mutate({ id: lead.id, stage })}
                      >
                        <SelectTrigger className="w-32" data-testid={`select-stage-${lead.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STAGES.map(stage => (
                            <SelectItem key={stage} value={stage}>
                              {stage.charAt(0).toUpperCase() + stage.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(lead)}
                        data-testid={`button-view-lead-${lead.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <LeadDetailDialog
        lead={selectedLead}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}

function LeadDetailDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Lead>) => {
      if (!lead) return;
      const res = await apiRequest("PATCH", `/api/hq/leads/${lead.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/leads"] });
      toast({
        title: "Lead Updated",
        description: "The lead has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lead.",
        variant: "destructive",
      });
    },
  });

  if (!lead) return null;

  const TypeIcon = LEAD_TYPE_ICONS[lead.leadType] || Mail;
  const typeColor = LEAD_TYPE_COLORS[lead.leadType] || "bg-gray-500/20 text-gray-400";
  const leadData = lead.leadData as Record<string, any> || {};

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const displayName = lead.firstName && lead.lastName 
    ? `${lead.firstName} ${lead.lastName}`
    : lead.firstName || lead.email || "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeColor.split(' ')[0]}`}>
              <TypeIcon className={`w-5 h-5 ${typeColor.split(' ')[1]}`} />
            </div>
            <div>
              <DialogTitle className="text-xl">{displayName}</DialogTitle>
              <DialogDescription>
                <Badge variant="outline" className={`text-xs ${typeColor}`}>
                  {lead.leadType}
                </Badge>
                {" "}
                <Badge variant="outline" className={`text-xs ${STAGE_COLORS[lead.stage] || ''}`}>
                  {lead.stage}
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
              <p className="font-medium">{lead.email || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
              <p className="font-medium">{lead.phone || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Source</p>
              <p className="font-medium">{lead.source || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Created</p>
              <p className="font-medium">{formatDate(lead.createdAt)}</p>
            </div>
          </div>

          {lead.address && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Address</p>
              <p className="font-medium">{lead.address}</p>
            </div>
          )}

          {Object.keys(leadData).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Additional Data</p>
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(leadData).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <p className="text-xs text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm font-medium">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="lead-notes">Notes</Label>
            <Textarea
              id="lead-notes"
              placeholder="Add notes about this lead..."
              defaultValue={lead.notes || ""}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-testid="input-lead-notes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned-to">Assign To</Label>
            <Input
              id="assigned-to"
              placeholder="Enter staff username or ID..."
              defaultValue={lead.assignedTo || ""}
              onChange={(e) => setAssignedTo(e.target.value)}
              data-testid="input-assigned-to"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-close-lead-detail"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                updateMutation.mutate({
                  notes: notes || lead.notes,
                  assignedTo: assignedTo || lead.assignedTo,
                });
              }}
              disabled={updateMutation.isPending}
              data-testid="button-save-lead"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
  const { toast } = useToast();
  const [activeCapitalTab, setActiveCapitalTab] = useState("projects");
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createAnnouncementOpen, setCreateAnnouncementOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);

  const { data: capitalProjects = [], isLoading: loadingProjects } = useQuery<any[]>({
    queryKey: ["/api/hq/capital-projects"],
  });

  const { data: investmentOffers = [], isLoading: loadingOffers } = useQuery<any[]>({
    queryKey: ["/api/hq/investment-offers"],
  });

  const { data: announcements = [], isLoading: loadingAnnouncements } = useQuery<any[]>({
    queryKey: ["/api/hq/announcements"],
  });

  const pendingOffers = investmentOffers.filter((o: any) => o.status === "PENDING");
  const openProjects = capitalProjects.filter((p: any) => p.status === "OPEN_FOR_INVESTMENT");
  const totalRaised = capitalProjects.reduce((sum: number, p: any) => sum + (p.amountRaised || 0), 0);
  const totalGoal = capitalProjects.reduce((sum: number, p: any) => sum + (p.fundingGoal || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Capital Projects</p>
                <p className="text-2xl font-bold">{capitalProjects.length}</p>
              </div>
              <Building className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open for Investment</p>
                <p className="text-2xl font-bold">{openProjects.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Offers</p>
                <p className="text-2xl font-bold text-amber-600">{pendingOffers.length}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Raised</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRaised)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeCapitalTab} onValueChange={setActiveCapitalTab} className="w-full">
        <TabsList>
          <TabsTrigger value="projects" data-testid="tab-capital-projects">
            <Building className="w-4 h-4 mr-2" />
            Capital Projects
          </TabsTrigger>
          <TabsTrigger value="offers" data-testid="tab-capital-offers">
            <DollarSign className="w-4 h-4 mr-2" />
            Investment Offers
            {pendingOffers.length > 0 && (
              <Badge className="ml-2 bg-amber-500">{pendingOffers.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="announcements" data-testid="tab-capital-announcements">
            <MessageSquare className="w-4 h-4 mr-2" />
            Announcements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Capital Projects</h3>
            <Button size="sm" onClick={() => setCreateProjectOpen(true)} data-testid="button-create-project">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
          
          {loadingProjects ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
          ) : capitalProjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No capital projects yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {capitalProjects.map((project: any) => {
                const progress = project.fundingGoal > 0 
                  ? ((project.amountRaised || 0) / project.fundingGoal) * 100 
                  : 0;

                return (
                  <Card key={project.id} data-testid={`card-capital-project-${project.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                        <div>
                          <h4 className="font-semibold">{project.title}</h4>
                          <p className="text-sm text-muted-foreground">{project.location}</p>
                        </div>
                        <Badge className={
                          project.status === "OPEN_FOR_INVESTMENT" ? "bg-green-600" :
                          project.status === "FUNDED" ? "bg-blue-600" :
                          project.status === "IN_PROGRESS" ? "bg-amber-600" :
                          project.status === "COMPLETED" ? "bg-emerald-600" :
                          "bg-slate-600"
                        }>
                          {project.status?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Funding Goal</p>
                          <p className="font-bold">{formatCurrency(project.fundingGoal)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amount Raised</p>
                          <p className="font-bold text-green-600">{formatCurrency(project.amountRaised || 0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Min Investment</p>
                          <p className="font-bold">{formatCurrency(project.minInvestment)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Structure</p>
                          <p className="font-bold">{project.structure}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="offers" className="mt-6">
          <h3 className="font-semibold mb-4">Investment Offers</h3>
          
          {loadingOffers ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
          ) : investmentOffers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No investment offers yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {investmentOffers.map((offer: any) => {
                const project = capitalProjects.find((p: any) => p.id === offer.projectId);
                
                return (
                  <Card key={offer.id} className={offer.status === "PENDING" ? "border-amber-300" : ""} data-testid={`card-offer-${offer.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                        <div>
                          <h4 className="font-semibold">{project?.title || "Unknown Project"}</h4>
                          <p className="text-sm text-muted-foreground">
                            Investor: {offer.investorId} | {new Date(offer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={
                          offer.status === "PENDING" ? "bg-amber-600" :
                          offer.status === "ACCEPTED" ? "bg-green-600" :
                          offer.status === "DECLINED" ? "bg-red-600" :
                          "bg-blue-600"
                        }>
                          {offer.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Amount Offered</p>
                          <p className="font-bold text-green-600">{formatCurrency(offer.amountOffered)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Role</p>
                          <p className="font-bold">{offer.requestedRole}</p>
                        </div>
                        {offer.proposedEquityPercent && (
                          <div>
                            <p className="text-muted-foreground">Proposed Equity</p>
                            <p className="font-bold">{offer.proposedEquityPercent}</p>
                          </div>
                        )}
                        {offer.proposedInterestRate && (
                          <div>
                            <p className="text-muted-foreground">Proposed Interest</p>
                            <p className="font-bold">{offer.proposedInterestRate}</p>
                          </div>
                        )}
                      </div>
                      {offer.notes && (
                        <p className="text-sm text-muted-foreground mb-4 p-3 bg-secondary rounded-lg">{offer.notes}</p>
                      )}
                      {offer.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => { setSelectedOffer({...offer, action: "accept"}); setRespondDialogOpen(true); }}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`button-accept-offer-${offer.id}`}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => { setSelectedOffer({...offer, action: "counter"}); setRespondDialogOpen(true); }}
                            data-testid={`button-counter-offer-${offer.id}`}
                          >
                            Counter
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => { setSelectedOffer({...offer, action: "decline"}); setRespondDialogOpen(true); }}
                            data-testid={`button-decline-offer-${offer.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="announcements" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Announcements</h3>
            <Button size="sm" onClick={() => setCreateAnnouncementOpen(true)} data-testid="button-create-announcement">
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </div>
          
          {loadingAnnouncements ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
          ) : announcements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No announcements yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement: any) => (
                <Card key={announcement.id} data-testid={`card-announcement-${announcement.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{announcement.title}</h4>
                        {announcement.isPinned && (
                          <Badge className="bg-primary">Pinned</Badge>
                        )}
                      </div>
                      <Badge variant="outline">{announcement.targetAudience}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                    {announcement.ctaText && (
                      <p className="text-sm text-primary">{announcement.ctaText}: {announcement.ctaLink}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Posted: {new Date(announcement.createdAt).toLocaleDateString()}
                      {announcement.expiresAt && ` | Expires: ${new Date(announcement.expiresAt).toLocaleDateString()}`}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateProjectDialog open={createProjectOpen} onClose={() => setCreateProjectOpen(false)} />
      <CreateAnnouncementDialog open={createAnnouncementOpen} onClose={() => setCreateAnnouncementOpen(false)} />
      {selectedOffer && (
        <RespondToOfferDialog 
          offer={selectedOffer} 
          open={respondDialogOpen} 
          onClose={() => { setRespondDialogOpen(false); setSelectedOffer(null); }}
        />
      )}
    </div>
  );
}

function CreateProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [minInvestment, setMinInvestment] = useState("");
  const [structure, setStructure] = useState("EQUITY");
  const [projectedReturn, setProjectedReturn] = useState("");
  const [holdPeriod, setHoldPeriod] = useState("");

  const createProject = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/hq/capital-projects", {
        title,
        description,
        location: location || undefined,
        fundingGoal: parseInt(fundingGoal),
        minInvestment: parseInt(minInvestment),
        structure,
        projectedReturn: projectedReturn || undefined,
        holdPeriod: holdPeriod || undefined,
        status: "DRAFT",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/capital-projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/capital-projects"] });
      toast({
        title: "Project Created",
        description: "Capital project has been created successfully.",
      });
      onClose();
      setTitle("");
      setDescription("");
      setLocation("");
      setFundingGoal("");
      setMinInvestment("");
      setStructure("EQUITY");
      setProjectedReturn("");
      setHoldPeriod("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Capital Project</DialogTitle>
          <DialogDescription>Create a new capital raising project for investors</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Project Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Bay View Duplex Renovation" data-testid="input-project-title" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the investment opportunity..." rows={3} data-testid="input-project-description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" data-testid="input-project-location" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="structure">Structure</Label>
              <Select value={structure} onValueChange={setStructure}>
                <SelectTrigger data-testid="select-project-structure">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EQUITY">Equity</SelectItem>
                  <SelectItem value="DEBT">Debt</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fundingGoal">Funding Goal ($)</Label>
              <Input id="fundingGoal" type="number" value={fundingGoal} onChange={(e) => setFundingGoal(e.target.value)} placeholder="500000" data-testid="input-project-goal" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minInvestment">Min Investment ($)</Label>
              <Input id="minInvestment" type="number" value={minInvestment} onChange={(e) => setMinInvestment(e.target.value)} placeholder="25000" data-testid="input-project-min" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="projectedReturn">Projected Return</Label>
              <Input id="projectedReturn" value={projectedReturn} onChange={(e) => setProjectedReturn(e.target.value)} placeholder="e.g., 15-20% IRR" data-testid="input-project-return" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="holdPeriod">Hold Period</Label>
              <Input id="holdPeriod" value={holdPeriod} onChange={(e) => setHoldPeriod(e.target.value)} placeholder="e.g., 12-18 months" data-testid="input-project-hold" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => createProject.mutate()} disabled={createProject.isPending || !title || !description || !fundingGoal || !minInvestment} data-testid="button-submit-project">
            {createProject.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateAnnouncementDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState("ALL");
  const [isPinned, setIsPinned] = useState(false);
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");

  const createAnnouncement = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/hq/announcements", {
        title,
        content,
        targetAudience,
        isPinned,
        ctaText: ctaText || undefined,
        ctaLink: ctaLink || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: "Announcement Created",
        description: "Announcement has been published.",
      });
      onClose();
      setTitle("");
      setContent("");
      setTargetAudience("ALL");
      setIsPinned(false);
      setCtaText("");
      setCtaLink("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create announcement.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
          <DialogDescription>Publish a new announcement to portal users</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="ann-title">Title</Label>
            <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" data-testid="input-announcement-title" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ann-content">Content</Label>
            <Textarea id="ann-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Announcement content..." rows={3} data-testid="input-announcement-content" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ann-audience">Target Audience</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger data-testid="select-announcement-audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Users</SelectItem>
                  <SelectItem value="INVESTORS">Investors Only</SelectItem>
                  <SelectItem value="WHOLESALERS">Wholesalers Only</SelectItem>
                  <SelectItem value="BUYERS">Buyers Only</SelectItem>
                  <SelectItem value="STAFF">Staff Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <input type="checkbox" id="ann-pinned" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="w-4 h-4" />
              <Label htmlFor="ann-pinned">Pin to top</Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cta-text">CTA Text (optional)</Label>
              <Input id="cta-text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Learn More" data-testid="input-announcement-cta-text" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cta-link">CTA Link (optional)</Label>
              <Input id="cta-link" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="/capital-raising" data-testid="input-announcement-cta-link" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => createAnnouncement.mutate()} disabled={createAnnouncement.isPending || !title || !content} data-testid="button-submit-announcement">
            {createAnnouncement.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RespondToOfferDialog({ offer, open, onClose }: { offer: any; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [counterAmount, setCounterAmount] = useState("");
  const [counterEquity, setCounterEquity] = useState("");
  const [counterInterest, setCounterInterest] = useState("");

  const respondToOffer = useMutation({
    mutationFn: async () => {
      const data: any = {
        status: offer.action === "accept" ? "accepted" : offer.action === "decline" ? "declined" : "countered",
        notes: notes || undefined,
      };
      if (offer.action === "counter") {
        data.counterTerms = `Amount: ${counterAmount || offer.amountOffered}, Equity: ${counterEquity || offer.proposedEquityPercent || "N/A"}, Interest: ${counterInterest || offer.proposedInterestRate || "N/A"}`;
      }
      const res = await apiRequest("POST", `/api/hq/investment-offers/${offer.id}/respond`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hq/investment-offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/capital-projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/capital-projects"] });
      toast({
        title: offer.action === "accept" ? "Offer Accepted" : offer.action === "decline" ? "Offer Declined" : "Counter Sent",
        description: offer.action === "accept" ? "Investment has been committed." : offer.action === "decline" ? "Offer has been declined." : "Counter offer sent to investor.",
      });
      onClose();
      setNotes("");
      setCounterAmount("");
      setCounterEquity("");
      setCounterInterest("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to respond to offer.",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {offer.action === "accept" ? "Accept Offer" : offer.action === "decline" ? "Decline Offer" : "Counter Offer"}
          </DialogTitle>
          <DialogDescription>
            {offer.action === "accept" ? "Accept this investment offer and commit the funds." : 
             offer.action === "decline" ? "Decline this investment offer." : 
             "Send a counter offer to the investor."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-secondary p-4 rounded-lg mb-4">
            <p className="text-sm"><strong>Amount:</strong> {formatCurrency(offer.amountOffered)}</p>
            <p className="text-sm"><strong>Role:</strong> {offer.requestedRole}</p>
            {offer.proposedEquityPercent && <p className="text-sm"><strong>Equity:</strong> {offer.proposedEquityPercent}</p>}
            {offer.proposedInterestRate && <p className="text-sm"><strong>Interest:</strong> {offer.proposedInterestRate}</p>}
          </div>

          {offer.action === "counter" && (
            <div className="grid gap-4 mb-4">
              <div className="grid gap-2">
                <Label>Counter Amount ($)</Label>
                <Input type="number" value={counterAmount} onChange={(e) => setCounterAmount(e.target.value)} placeholder={offer.amountOffered.toString()} data-testid="input-counter-amount" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Counter Equity %</Label>
                  <Input value={counterEquity} onChange={(e) => setCounterEquity(e.target.value)} placeholder={offer.proposedEquityPercent || "e.g., 8%"} data-testid="input-counter-equity" />
                </div>
                <div className="grid gap-2">
                  <Label>Counter Interest Rate</Label>
                  <Input value={counterInterest} onChange={(e) => setCounterInterest(e.target.value)} placeholder={offer.proposedInterestRate || "e.g., 10%"} data-testid="input-counter-interest" />
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes for the investor..." rows={2} data-testid="input-response-notes" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => respondToOffer.mutate()} 
            disabled={respondToOffer.isPending}
            className={offer.action === "accept" ? "bg-green-600 hover:bg-green-700" : offer.action === "decline" ? "bg-red-600 hover:bg-red-700" : ""}
            data-testid="button-confirm-response"
          >
            {respondToOffer.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {offer.action === "accept" ? "Accept & Commit" : offer.action === "decline" ? "Decline" : "Send Counter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
