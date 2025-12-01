import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { SellerLead, InvestorLead, Contact } from "@shared/schema";

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
        <p className="text-muted-foreground">Welcome back, {displayName}</p>
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

function StatsCards() {
  const { data: sellerLeads } = useQuery<SellerLead[]>({
    queryKey: ["/api/hq/seller-leads"],
  });
  const { data: investorLeads } = useQuery<InvestorLead[]>({
    queryKey: ["/api/hq/investor-leads"],
  });
  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ["/api/hq/contacts"],
  });

  const stats = [
    {
      title: "Seller Leads",
      value: sellerLeads?.length || 0,
      newCount: sellerLeads?.filter(l => l.status === "new").length || 0,
      icon: Home,
      color: "text-blue-500",
    },
    {
      title: "Investor Leads",
      value: investorLeads?.length || 0,
      newCount: investorLeads?.filter(l => l.status === "new").length || 0,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Contact Messages",
      value: contacts?.length || 0,
      newCount: contacts?.filter(c => c.status === "new").length || 0,
      icon: Mail,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} data-testid={`card-stat-${index}`}>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            {stat.newCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                <Badge variant="secondary" className="mr-1">{stat.newCount}</Badge>
                new
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LeadsTabs() {
  return (
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
        <SellerLeadsTable />
      </TabsContent>
      <TabsContent value="investor-leads">
        <InvestorLeadsTable />
      </TabsContent>
      <TabsContent value="contacts">
        <ContactsTable />
      </TabsContent>
    </Tabs>
  );
}

function SellerLeadsTable() {
  const { data: leads, isLoading } = useQuery<SellerLead[]>({
    queryKey: ["/api/hq/seller-leads"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No seller leads yet. They will appear here when someone submits the seller form.
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
      {leads.map((lead, index) => (
        <Card key={lead.id} data-testid={`card-seller-lead-${index}`}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
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
              <div className="flex flex-col items-end gap-2">
                <Badge variant={lead.status === "new" ? "default" : "secondary"}>
                  {lead.status}
                </Badge>
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
  );
}

function InvestorLeadsTable() {
  const { data: leads, isLoading } = useQuery<InvestorLead[]>({
    queryKey: ["/api/hq/investor-leads"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No investor leads yet. They will appear here when someone submits the investor form.
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
      {leads.map((lead, index) => (
        <Card key={lead.id} data-testid={`card-investor-lead-${index}`}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
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
              <div className="flex flex-col items-end gap-2">
                <Badge variant={lead.status === "new" ? "default" : "secondary"}>
                  {lead.status}
                </Badge>
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
  );
}

function ContactsTable() {
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/hq/contacts"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No contact messages yet. They will appear here when someone submits the contact form.
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
      {contacts.map((contact, index) => (
        <Card key={contact.id} data-testid={`card-contact-${index}`}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
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
              <div className="flex flex-col items-end gap-2">
                <Badge variant={contact.status === "new" ? "default" : "secondary"}>
                  {contact.status}
                </Badge>
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
