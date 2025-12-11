import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { PortalHeader } from "@/components/portal-header";
import { AnnouncementsBanner } from "@/components/announcements-banner";
import { 
  TrendingUp, 
  ArrowRight, 
  Loader2,
  DollarSign,
  Building2,
  Clock,
  CheckCircle2,
  Home,
  MapPin,
  LogIn,
  User,
  BarChart3,
  FileText,
  Target,
  Plus,
  Edit,
  Eye,
  Users,
  Calendar,
  Award,
  Wallet,
  PieChart,
  Activity,
  Hammer,
  Briefcase,
  Milestone,
  AlertCircle,
  Send,
  CheckCheck
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import type { CapitalProject, ProjectMilestone, InvestmentOffer, CommittedInvestment } from "@shared/schema";

const formatCurrency = (value: number | null | undefined) => {
  if (!value) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-slate-100", text: "text-slate-700", label: "Draft" },
  OPEN_FOR_INVESTMENT: { bg: "bg-green-100", text: "text-green-700", label: "Open for Investment" },
  FUNDED: { bg: "bg-blue-100", text: "text-blue-700", label: "Funded" },
  IN_PROGRESS: { bg: "bg-amber-100", text: "text-amber-700", label: "In Progress" },
  COMPLETED: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" },
};

export default function DreamscaperPortal() {
  const { profile, isLoading: authLoading, isAuthenticated, isDreamscaper } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: myProjects = [], isLoading: projectsLoading } = useQuery<CapitalProject[]>({
    queryKey: ["/api/portal/dreamscaper/my-projects"],
    enabled: isAuthenticated,
  });

  const { data: pendingOffers = [] } = useQuery<InvestmentOffer[]>({
    queryKey: ["/api/portal/dreamscaper/pending-offers"],
    enabled: isAuthenticated,
  });

  const { data: allInvestments = [] } = useQuery<CommittedInvestment[]>({
    queryKey: ["/api/portal/dreamscaper/all-investments"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Hammer className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Dreamscaper Portal</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to manage your capital projects, track investors, and monitor funding progress.
          </p>
          <a href="/api/login?returnTo=/portal/dreamscaper">
            <Button size="lg" data-testid="button-dreamscaper-login">
              <LogIn className="mr-2 w-5 h-5" />
              Sign In to Continue
            </Button>
          </a>
        </div>
      </div>
    );
  }

  if (!isDreamscaper) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Hammer className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Become a Dreamscaper</h1>
          <p className="text-muted-foreground mb-8">
            To access the Dreamscaper Portal, you need to apply to become an operator. Submit your application to raise capital for your real estate projects.
          </p>
          <Link href="/dreamspace">
            <Button size="lg" data-testid="button-apply-dreamscaper">
              <ArrowRight className="mr-2 w-5 h-5" />
              Apply to Become a Dreamscaper
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone">
      <AnnouncementsBanner audience="DREAMSCAPERS" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-dreamscaper-welcome">
              Welcome, {profile?.display_name || "Dreamscaper"}
            </h1>
            <p className="text-muted-foreground">
              Manage your capital projects and investor relationships
            </p>
          </div>
          <PortalHeader currentPortal="dreamscaper" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 flex-wrap">
            <TabsTrigger value="dashboard" data-testid="tab-dreamscaper-dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="projects" data-testid="tab-dreamscaper-projects">
              <Building2 className="w-4 h-4 mr-2" />
              My Projects
            </TabsTrigger>
            <TabsTrigger value="investors" data-testid="tab-dreamscaper-investors">
              <Users className="w-4 h-4 mr-2" />
              Investors
            </TabsTrigger>
            <TabsTrigger value="offers" data-testid="tab-dreamscaper-offers">
              <FileText className="w-4 h-4 mr-2" />
              Offers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab projects={myProjects} offers={pendingOffers} investments={allInvestments} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsTab projects={myProjects} />
          </TabsContent>

          <TabsContent value="investors">
            <InvestorsTab investments={allInvestments} />
          </TabsContent>

          <TabsContent value="offers">
            <OffersTab offers={pendingOffers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DashboardTab({ 
  projects, 
  offers, 
  investments 
}: { 
  projects: CapitalProject[]; 
  offers: InvestmentOffer[]; 
  investments: CommittedInvestment[];
}) {
  const totalRaised = projects.reduce((sum, p) => sum + (p.amountRaised || 0), 0);
  const totalFundingGoal = projects.reduce((sum, p) => sum + (p.fundingGoal || 0), 0);
  const activeProjects = projects.filter(p => p.status === "OPEN_FOR_INVESTMENT" || p.status === "IN_PROGRESS").length;
  const completedProjects = projects.filter(p => p.status === "COMPLETED").length;
  const uniqueInvestors = new Set(investments.map(i => i.investorId)).size;
  
  const stats = [
    { label: "Total Raised", value: formatCurrency(totalRaised), icon: DollarSign, color: "text-green-600", bgColor: "bg-green-600/10" },
    { label: "Active Projects", value: activeProjects, icon: Building2, color: "text-blue-600", bgColor: "bg-blue-600/10" },
    { label: "Pending Offers", value: offers.length, icon: FileText, color: "text-amber-600", bgColor: "bg-amber-600/10" },
    { label: "Investors", value: uniqueInvestors, icon: Users, color: "text-purple-600", bgColor: "bg-purple-600/10" },
  ];

  const fundingProgress = totalFundingGoal > 0 ? (totalRaised / totalFundingGoal) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="sleek-card hover-elevate" data-testid={`stat-card-${index}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="sleek-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Funding Overview
          </CardTitle>
          <CardDescription>Total capital raised across all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{formatCurrency(totalRaised)}</span>
              <span className="text-muted-foreground">of {formatCurrency(totalFundingGoal)} goal</span>
            </div>
            <Progress value={fundingProgress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">{fundingProgress.toFixed(1)}% funded</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-2xl font-bold">{projects.length}</p>
              <p className="text-sm text-muted-foreground">Total Projects</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-2xl font-bold text-green-600">{activeProjects}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-2xl font-bold text-purple-600">{completedProjects}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Pending Offers
            </CardTitle>
            <CardDescription>Investment offers awaiting your response</CardDescription>
          </CardHeader>
          <CardContent>
            {offers.length > 0 ? (
              <div className="space-y-3">
                {offers.slice(0, 5).map((offer) => {
                  const project = projects.find(p => p.id === offer.projectId);
                  return (
                    <div key={offer.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800" data-testid={`pending-offer-${offer.id}`}>
                      <div>
                        <p className="font-medium text-sm">{project?.title || `Project #${offer.projectId}`}</p>
                        <p className="text-xs text-muted-foreground">{offer.requestedRole} - {offer.structureType || "Equity"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600">{formatCurrency(offer.amountOffered)}</p>
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      </div>
                    </div>
                  );
                })}
                {offers.length > 5 && (
                  <p className="text-sm text-center text-muted-foreground">+{offers.length - 5} more offers</p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="font-medium text-muted-foreground">No pending offers</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dealflow/create-project">
              <Button variant="default" className="w-full justify-start" data-testid="button-create-project">
                <Plus className="mr-2 w-4 h-4" />
                Create New Project
              </Button>
            </Link>
            <Link href="/calculators">
              <Button variant="outline" className="w-full justify-start" data-testid="button-calculators">
                <PieChart className="mr-2 w-4 h-4" />
                Investment Calculators
              </Button>
            </Link>
            <Link href="/dealflow">
              <Button variant="outline" className="w-full justify-start" data-testid="button-dealflow">
                <Activity className="mr-2 w-4 h-4" />
                Go to Dealflow
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {projects.filter(p => p.status === "OPEN_FOR_INVESTMENT").length > 0 && (
        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-600" />
              Open for Investment
            </CardTitle>
            <CardDescription>Projects currently seeking capital</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.filter(p => p.status === "OPEN_FOR_INVESTMENT").slice(0, 4).map((project) => (
                <Link key={project.id} href={`/dealflow/project/${project.id}`}>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors" data-testid={`project-card-${project.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{project.title}</p>
                      <Badge className="bg-green-600">Open</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{project.location || "Location TBD"}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{formatCurrency(project.amountRaised)}</span>
                        <span className="text-muted-foreground">of {formatCurrency(project.fundingGoal)}</span>
                      </div>
                      <Progress value={(project.amountRaised || 0) / (project.fundingGoal || 1) * 100} className="h-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProjectsTab({ projects }: { projects: CapitalProject[] }) {
  const [statusFilter, setStatusFilter] = useState("all");
  
  const filteredProjects = statusFilter === "all" 
    ? projects 
    : projects.filter(p => p.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="OPEN_FOR_INVESTMENT">Open for Investment</SelectItem>
            <SelectItem value="FUNDED">Funded</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/dealflow/create-project">
          <Button data-testid="button-new-project">
            <Plus className="mr-2 w-4 h-4" />
            New Project
          </Button>
        </Link>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="sleek-card" data-testid={`project-${project.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {project.location || "Location TBD"}
                    </CardDescription>
                  </div>
                  <Badge className={`${STATUS_STYLES[project.status]?.bg} ${STATUS_STYLES[project.status]?.text}`}>
                    {STATUS_STYLES[project.status]?.label || project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{formatCurrency(project.amountRaised)}</span>
                    <span className="text-muted-foreground">of {formatCurrency(project.fundingGoal)}</span>
                  </div>
                  <Progress value={(project.amountRaised || 0) / (project.fundingGoal || 1) * 100} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 rounded bg-secondary/50">
                    <p className="text-muted-foreground">Min Investment</p>
                    <p className="font-medium">{formatCurrency(project.minInvestment)}</p>
                  </div>
                  <div className="p-2 rounded bg-secondary/50">
                    <p className="text-muted-foreground">Structure</p>
                    <p className="font-medium capitalize">{project.structure?.toLowerCase() || "Equity"}</p>
                  </div>
                  <div className="p-2 rounded bg-secondary/50">
                    <p className="text-muted-foreground">Projected Return</p>
                    <p className="font-medium">{project.projectedReturn || "TBD"}</p>
                  </div>
                  <div className="p-2 rounded bg-secondary/50">
                    <p className="text-muted-foreground">Hold Period</p>
                    <p className="font-medium">{project.holdPeriod || "TBD"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dealflow/project/${project.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" data-testid={`button-view-${project.id}`}>
                      <Eye className="mr-2 w-4 h-4" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/dealflow/project/${project.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full" data-testid={`button-edit-${project.id}`}>
                      <Edit className="mr-2 w-4 h-4" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first capital project to start raising funds.
          </p>
          <Link href="/dealflow/create-project">
            <Button data-testid="button-create-first-project">
              <Plus className="mr-2 w-4 h-4" />
              Create Project
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function InvestorsTab({ investments }: { investments: CommittedInvestment[] }) {
  const { data: projects = [] } = useQuery<CapitalProject[]>({
    queryKey: ["/api/capital-projects"],
  });

  const investorMap = investments.reduce((acc, inv) => {
    if (!acc[inv.investorId]) {
      acc[inv.investorId] = {
        investorId: inv.investorId,
        totalInvested: 0,
        projectCount: 0,
        investments: []
      };
    }
    acc[inv.investorId].totalInvested += inv.committedAmount || 0;
    acc[inv.investorId].projectCount += 1;
    acc[inv.investorId].investments.push(inv);
    return acc;
  }, {} as Record<string, { investorId: string; totalInvested: number; projectCount: number; investments: CommittedInvestment[] }>);

  const investors = Object.values(investorMap);
  const totalCapital = investments.reduce((sum, inv) => sum + (inv.committedAmount || 0), 0);

  return (
    <div className="space-y-6">
      <Card className="sleek-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Investor Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-3xl font-bold text-primary">{investors.length}</p>
              <p className="text-sm text-muted-foreground">Total Investors</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalCapital)}</p>
              <p className="text-sm text-muted-foreground">Total Committed</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-3xl font-bold">{investments.length}</p>
              <p className="text-sm text-muted-foreground">Total Investments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {investors.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {investors.map((investor) => (
            <Card key={investor.investorId} className="sleek-card" data-testid={`investor-${investor.investorId}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Investor</CardTitle>
                    <CardDescription className="text-xs">{investor.investorId.slice(0, 16)}...</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded bg-green-50 dark:bg-green-950/20">
                    <p className="text-sm text-muted-foreground">Total Invested</p>
                    <p className="font-bold text-green-600">{formatCurrency(investor.totalInvested)}</p>
                  </div>
                  <div className="p-3 rounded bg-secondary/50">
                    <p className="text-sm text-muted-foreground">Projects</p>
                    <p className="font-bold">{investor.projectCount}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Investments:</p>
                  {investor.investments.map((inv) => {
                    const project = projects.find(p => p.id === inv.projectId);
                    return (
                      <div key={inv.id} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                        <span>{project?.title || `Project #${inv.projectId}`}</span>
                        <span className="font-medium">{formatCurrency(inv.committedAmount)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Investors Yet</h3>
          <p className="text-muted-foreground">
            Open your projects for investment to attract investors.
          </p>
        </div>
      )}
    </div>
  );
}

function OffersTab({ offers }: { offers: InvestmentOffer[] }) {
  const { toast } = useToast();
  const { data: projects = [] } = useQuery<CapitalProject[]>({
    queryKey: ["/api/capital-projects"],
  });

  const acceptMutation = useMutation({
    mutationFn: async (offerId: number) => {
      return apiRequest('POST', `/api/investment-offers/${offerId}/accept`, {});
    },
    onSuccess: () => {
      toast({ title: "Offer Accepted", description: "The investor has been notified." });
      queryClient.invalidateQueries({ queryKey: ["/api/portal/dreamscaper/pending-offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portal/dreamscaper/all-investments"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to accept offer.", variant: "destructive" });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (offerId: number) => {
      return apiRequest('POST', `/api/investment-offers/${offerId}/decline`, {});
    },
    onSuccess: () => {
      toast({ title: "Offer Declined", description: "The investor has been notified." });
      queryClient.invalidateQueries({ queryKey: ["/api/portal/dreamscaper/pending-offers"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to decline offer.", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      {offers.length > 0 ? (
        <div className="space-y-4">
          {offers.map((offer) => {
            const project = projects.find(p => p.id === offer.projectId);
            return (
              <Card key={offer.id} className="sleek-card" data-testid={`offer-${offer.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project?.title || `Project #${offer.projectId}`}</CardTitle>
                      <CardDescription>{project?.location || "Location TBD"}</CardDescription>
                    </div>
                    <Badge variant="secondary">Pending Review</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/20">
                      <p className="text-sm text-muted-foreground">Amount Offered</p>
                      <p className="text-xl font-bold text-amber-600">{formatCurrency(offer.amountOffered)}</p>
                    </div>
                    <div className="p-3 rounded bg-secondary/50">
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium">{offer.requestedRole}</p>
                    </div>
                    <div className="p-3 rounded bg-secondary/50">
                      <p className="text-sm text-muted-foreground">Structure</p>
                      <p className="font-medium capitalize">{offer.structureType || "Equity"}</p>
                    </div>
                    <div className="p-3 rounded bg-secondary/50">
                      <p className="text-sm text-muted-foreground">Hold Period</p>
                      <p className="font-medium">{offer.holdPeriod || "TBD"}</p>
                    </div>
                  </div>
                  {offer.notes && (
                    <div className="p-3 rounded bg-muted/50 mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Investor Notes:</p>
                      <p className="text-sm">{offer.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => acceptMutation.mutate(offer.id)}
                      disabled={acceptMutation.isPending}
                      className="flex-1"
                      data-testid={`button-accept-${offer.id}`}
                    >
                      {acceptMutation.isPending ? (
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCheck className="mr-2 w-4 h-4" />
                      )}
                      Accept Offer
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => declineMutation.mutate(offer.id)}
                      disabled={declineMutation.isPending}
                      className="flex-1"
                      data-testid={`button-decline-${offer.id}`}
                    >
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Pending Offers</h3>
          <p className="text-muted-foreground">
            New investment offers will appear here for your review.
          </p>
        </div>
      )}
    </div>
  );
}
