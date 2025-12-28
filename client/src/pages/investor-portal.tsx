import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Search,
  Target,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Award,
  Wallet,
  PieChart,
  CircleDollarSign,
  Activity
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import type { WholesaleDeal, InvestorProfile, InvestorWantedDeal, CapitalProject, CommittedInvestment, InvestmentOffer } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { sampleWholesaleDeals, sampleCapitalProjects, sampleInvestorStats } from "@/lib/sample-data";

const profileFormSchema = z.object({
  company: z.string().optional(),
  phone: z.string().min(10, "Phone number is required"),
  cityState: z.string().min(2, "City/State is required"),
  capitalRange: z.string().min(1, "Please select your capital range"),
  investmentPreference: z.string().min(1, "Please select investment preference"),
  experienceLevel: z.string().min(1, "Please select experience level"),
  accreditedInvestor: z.boolean().optional(),
  notes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function InvestorPortal() {
  const { profile: authProfile, isLoading: authLoading, isAuthenticated, isGuestMode, exitGuestMode } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: profile, isLoading: profileLoading } = useQuery<InvestorProfile>({
    queryKey: ["/api/portal/investor/profile"],
    enabled: isAuthenticated,
  });

  const { data: apiDeals } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/wholesale-deals"],
    enabled: isAuthenticated,
  });

  const deals = isGuestMode ? sampleWholesaleDeals as unknown as WholesaleDeal[] : apiDeals;

  const hasProfile = !!profile || isGuestMode;

  if (authLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated && !isGuestMode) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Investor Portal</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access exclusive investment opportunities and track your deals.
          </p>
          <a href="/api/login?returnTo=/portal/investor">
            <Button size="lg" data-testid="button-investor-login">
              <LogIn className="mr-2 w-5 h-5" />
              Sign In to Continue
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone">
      {isGuestMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium">Guest Preview Mode - Viewing as Investor</span>
              <span className="text-sm text-muted-foreground">Sign in to take actions</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exitGuestMode}>Exit Preview</Button>
              <Link href="/login">
                <Button size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      <AnnouncementsBanner audience="INVESTORS" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-investor-welcome">
              Welcome, {isGuestMode ? "Guest Investor" : (authProfile?.display_name || "Investor")}
            </h1>
            <p className="text-muted-foreground">
              {isGuestMode ? "Preview investment opportunities and portfolio management" : (hasProfile ? "View your investment opportunities" : "Complete your profile to get started")}
            </p>
          </div>
          <PortalHeader currentPortal="investor" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 flex-wrap">
            <TabsTrigger value="dashboard" data-testid="tab-investor-dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="portfolio" data-testid="tab-investor-portfolio">
              <Wallet className="w-4 h-4 mr-2" />
              My Portfolio
            </TabsTrigger>
            <TabsTrigger value="deals" data-testid="tab-investor-deals">
              <Building2 className="w-4 h-4 mr-2" />
              Available Deals
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-investor-profile">
              <User className="w-4 h-4 mr-2" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="wanted" data-testid="tab-investor-wanted">
              <Target className="w-4 h-4 mr-2" />
              Wanted Deals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab profile={profile} deals={deals} />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioTab />
          </TabsContent>

          <TabsContent value="deals">
            <DealsTab deals={deals} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab profile={profile} />
          </TabsContent>

          <TabsContent value="wanted">
            <WantedDealsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DashboardTab({ profile, deals }: { profile?: InvestorProfile; deals?: WholesaleDeal[] }) {
  const stats = [
    { label: "Available Deals", value: deals?.length || 0, icon: Building2, color: "text-blue-600" },
    { label: "Active Investments", value: 0, icon: TrendingUp, color: "text-green-600" },
    { label: "Capital Deployed", value: "$0", icon: DollarSign, color: "text-primary" },
    { label: "Profile Status", value: profile?.isApproved ? "Approved" : "Pending", icon: CheckCircle2, color: profile?.isApproved ? "text-green-600" : "text-amber-600" },
  ];

  const milestones = [
    { title: "Account Created", completed: true, date: "Completed" },
    { title: "Profile Submitted", completed: !!profile, date: profile ? "Completed" : "Pending" },
    { title: "Profile Approved", completed: profile?.isApproved || false, date: profile?.isApproved ? "Approved" : "Pending" },
    { title: "First Investment", completed: false, date: "Waiting" },
    { title: "First Return", completed: false, date: "Waiting" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="sleek-card" data-testid={`stat-card-${index}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="sleek-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Investment Overview
            </CardTitle>
            <CardDescription>Your investment activity and returns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">$0</p>
                <p className="text-sm text-muted-foreground">Total Invested</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-green-600">$0</p>
                <p className="text-sm text-muted-foreground">Total Returns</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold">0%</p>
                <p className="text-sm text-muted-foreground">Avg. ROI</p>
              </div>
            </div>
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No investments yet</p>
              <p className="text-sm">Browse available deals to start investing</p>
            </div>
          </CardContent>
        </Card>

        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Your Milestones
            </CardTitle>
            <CardDescription>Track your investor journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.completed ? "bg-green-100 text-green-600" : "bg-secondary text-muted-foreground"
                  }`}>
                    {milestone.completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${milestone.completed ? "" : "text-muted-foreground"}`}>
                      {milestone.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{milestone.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {!profile && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <User className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">Complete Your Profile</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Fill out your investor profile to get access to exclusive deals and personalized recommendations.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={() => (document.querySelector('[data-testid="tab-investor-profile"]') as HTMLButtonElement)?.click()}
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="sleek-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Featured Opportunities
          </CardTitle>
          <CardDescription>Latest wholesale deals available for assignment</CardDescription>
        </CardHeader>
        <CardContent>
          {deals && deals.length > 0 ? (
            <div className="space-y-4">
              {deals.slice(0, 3).map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Home className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{deal.propertyAddress}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{deal.city}, {deal.state}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      ${deal.assignmentFee?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Assignment Fee</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No deals available right now</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PortfolioTab() {
  const { data: myInvestments, isLoading: investmentsLoading } = useQuery<CommittedInvestment[]>({
    queryKey: ["/api/portal/investor/my-investments"],
  });

  const { data: myOffers, isLoading: offersLoading } = useQuery<InvestmentOffer[]>({
    queryKey: ["/api/portal/investor/my-offers"],
  });

  const { data: projects } = useQuery<CapitalProject[]>({
    queryKey: ["/api/capital-projects"],
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalDeployed = myInvestments?.reduce((sum, inv) => sum + (inv.committedAmount || 0), 0) || 0;
  const pendingOffers = myOffers?.filter(o => o.status === "PENDING") || [];
  const acceptedOffers = myOffers?.filter(o => o.status === "ACCEPTED") || [];
  
  const portfolioStats = [
    { label: "Total Deployed", value: formatCurrency(totalDeployed), icon: DollarSign, color: "text-green-600", bgColor: "bg-green-600/10" },
    { label: "Active Projects", value: myInvestments?.length || 0, icon: Building2, color: "text-blue-600", bgColor: "bg-blue-600/10" },
    { label: "Pending Offers", value: pendingOffers.length, icon: Clock, color: "text-amber-600", bgColor: "bg-amber-600/10" },
    { label: "Accepted Offers", value: acceptedOffers.length, icon: CheckCircle2, color: "text-purple-600", bgColor: "bg-purple-600/10" },
  ];

  const isLoading = investmentsLoading || offersLoading;

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground mt-4">Loading your portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {portfolioStats.map((stat, index) => (
          <Card key={index} className="sleek-card hover-elevate" data-testid={`portfolio-stat-${index}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Active Investments
            </CardTitle>
            <CardDescription>Your current capital deployments</CardDescription>
          </CardHeader>
          <CardContent>
            {myInvestments && myInvestments.length > 0 ? (
              <div className="space-y-4">
                {myInvestments.map((investment) => {
                  const project = projects?.find(p => p.id === investment.projectId);
                  return (
                    <div key={investment.id} className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800" data-testid={`investment-${investment.id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{project?.title || `Project #${investment.projectId}`}</p>
                          <p className="text-sm text-muted-foreground">{project?.location || "N/A"}</p>
                        </div>
                        <Badge className="bg-green-600">{investment.role}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                        <div className="p-2 rounded bg-white/50 dark:bg-black/20">
                          <p className="text-muted-foreground">Invested</p>
                          <p className="font-bold text-green-600">{formatCurrency(investment.committedAmount)}</p>
                        </div>
                        <div className="p-2 rounded bg-white/50 dark:bg-black/20">
                          <p className="text-muted-foreground">Structure</p>
                          <p className="font-bold capitalize">{investment.structureType || "Equity"}</p>
                        </div>
                        {investment.equityPercent && (
                          <div className="p-2 rounded bg-white/50 dark:bg-black/20">
                            <p className="text-muted-foreground">Equity</p>
                            <p className="font-bold">{investment.equityPercent}%</p>
                          </div>
                        )}
                        {investment.interestRate && (
                          <div className="p-2 rounded bg-white/50 dark:bg-black/20">
                            <p className="text-muted-foreground">Interest</p>
                            <p className="font-bold">{investment.interestRate}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="font-medium text-muted-foreground">No active investments</p>
                <p className="text-sm text-muted-foreground mt-1">Browse deals to find your first investment</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Pending Offers
            </CardTitle>
            <CardDescription>Awaiting response from operators</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingOffers.length > 0 ? (
              <div className="space-y-4">
                {pendingOffers.map((offer) => {
                  const project = projects?.find(p => p.id === offer.projectId);
                  return (
                    <div key={offer.id} className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800" data-testid={`offer-${offer.id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{project?.title || `Project #${offer.projectId}`}</p>
                          <p className="text-sm text-muted-foreground">{project?.location || "N/A"}</p>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                        <div className="p-2 rounded bg-white/50 dark:bg-black/20">
                          <p className="text-muted-foreground">Offered</p>
                          <p className="font-bold text-amber-600">{formatCurrency(offer.amountOffered)}</p>
                        </div>
                        <div className="p-2 rounded bg-white/50 dark:bg-black/20">
                          <p className="text-muted-foreground">Role</p>
                          <p className="font-bold">{offer.requestedRole}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="font-medium text-muted-foreground">No pending offers</p>
                <p className="text-sm text-muted-foreground mt-1">Submit offers on capital projects</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="sleek-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Payout Schedule
          </CardTitle>
          <CardDescription>Expected returns and distributions</CardDescription>
        </CardHeader>
        <CardContent>
          {myInvestments && myInvestments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Structure</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Your Investment</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Expected Return</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myInvestments.map((investment) => {
                    const project = projects?.find(p => p.id === investment.projectId);
                    const estimatedReturn = investment.structureType === "debt" 
                      ? (investment.committedAmount * (parseFloat(investment.interestRate || "0") / 100))
                      : investment.committedAmount * 0.2;
                    return (
                      <tr key={investment.id} className="border-b last:border-0">
                        <td className="py-3 px-4">
                          <p className="font-medium">{project?.title || `Project #${investment.projectId}`}</p>
                          <p className="text-xs text-muted-foreground">{project?.location || "N/A"}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">{investment.structureType || "equity"}</Badge>
                        </td>
                        <td className="py-3 px-4 font-bold">{formatCurrency(investment.committedAmount)}</td>
                        <td className="py-3 px-4 font-bold text-green-600">{formatCurrency(estimatedReturn)}</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-blue-600">Active</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <PieChart className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="font-medium text-muted-foreground">No scheduled payouts</p>
              <p className="text-sm text-muted-foreground mt-1">Invest in projects to see your expected returns</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DealsTab({ deals }: { deals?: WholesaleDeal[] }) {
  const formatCurrency = (value: number | null) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!deals || deals.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Deals Available</h3>
        <p className="text-muted-foreground mb-6">
          Check back soon for new investment opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {deals.map((deal) => (
        <Card key={deal.id} className="sleek-card" data-testid={`card-deal-${deal.id}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge className="bg-green-600">Available</Badge>
              <Badge variant="outline">{deal.strategy}</Badge>
            </div>
            <CardTitle className="text-lg mt-2">{deal.propertyAddress}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {deal.city}, {deal.state} {deal.zipCode}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded bg-secondary/50">
                <p className="text-muted-foreground">Contract Price</p>
                <p className="font-bold">{formatCurrency(deal.contractPrice)}</p>
              </div>
              <div className="p-3 rounded bg-secondary/50">
                <p className="text-muted-foreground">Assignment Fee</p>
                <p className="font-bold text-primary">{formatCurrency(deal.assignmentFee)}</p>
              </div>
              <div className="p-3 rounded bg-secondary/50">
                <p className="text-muted-foreground">ARV</p>
                <p className="font-bold">{formatCurrency(deal.arv)}</p>
              </div>
              <div className="p-3 rounded bg-secondary/50">
                <p className="text-muted-foreground">Est. Repairs</p>
                <p className="font-bold">{formatCurrency(deal.estimatedRepairs)}</p>
              </div>
            </div>
            <Link href="/buyers">
              <Button className="w-full">
                View Details
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProfileTab({ profile }: { profile?: InvestorProfile }) {
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      company: profile?.company || "",
      phone: profile?.phone || "",
      cityState: profile?.cityState || "",
      capitalRange: profile?.capitalRange || "",
      investmentPreference: profile?.investmentPreference || "",
      experienceLevel: profile?.experienceLevel || "",
      accreditedInvestor: profile?.accreditedInvestor || false,
      notes: profile?.notes || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest("POST", "/api/portal/investor/register", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Saved",
        description: "Your investor profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portal/investor/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="sleek-card max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Investor Profile
        </CardTitle>
        <CardDescription>
          {profile ? "Update your investor information" : "Complete your profile to access investment opportunities"}
        </CardDescription>
        {profile && (
          <Badge className={profile.isApproved ? "bg-green-600" : "bg-amber-500"}>
            {profile.isApproved ? "Approved" : "Pending Approval"}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company name" {...field} data-testid="input-company" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cityState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City, State</FormLabel>
                  <FormControl>
                    <Input placeholder="Los Angeles, CA" {...field} data-testid="input-citystate" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capitalRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Capital</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-capital">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="under-50k">Under $50,000</SelectItem>
                        <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                        <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                        <SelectItem value="250k-500k">$250,000 - $500,000</SelectItem>
                        <SelectItem value="500k-1m">$500,000 - $1M</SelectItem>
                        <SelectItem value="over-1m">Over $1M</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-experience">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-2 deals)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (3-10 deals)</SelectItem>
                        <SelectItem value="experienced">Experienced (10+ deals)</SelectItem>
                        <SelectItem value="professional">Professional Investor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="investmentPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Preference</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-preference">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fix-flip">Fix & Flip</SelectItem>
                      <SelectItem value="buy-hold">Buy & Hold (Rentals)</SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                      <SelectItem value="all">All Types</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your investment goals, target markets, or any specific requirements..."
                      className="resize-none"
                      {...field}
                      data-testid="input-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-save-profile">
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

const wantedDealFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  propertyTypes: z.array(z.string()).min(1, "Select at least one property type"),
  strategies: z.array(z.string()).min(1, "Select at least one strategy"),
  locations: z.array(z.string()).optional(),
  minBudget: z.number().min(0).optional(),
  maxBudget: z.number().min(0).optional(),
  targetReturnMin: z.number().min(0).max(100).optional(),
  targetReturnMax: z.number().min(0).max(100).optional(),
  preferredStructure: z.string().optional(),
  maxEquityPercent: z.number().min(0).max(100).optional(),
  maxInterestRate: z.string().optional(),
  availableCapital: z.number().min(0).optional(),
  dealsWanted: z.number().min(1).optional(),
  urgency: z.string().optional(),
  holdPeriodPreference: z.string().optional(),
  isPublic: z.boolean().optional(),
  activelyLooking: z.boolean().optional(),
});

type WantedDealFormData = z.infer<typeof wantedDealFormSchema>;

function WantedDealsTab() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingDeal, setEditingDeal] = useState<InvestorWantedDeal | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [strategies, setStrategies] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const [locations, setLocations] = useState<string[]>([]);

  const { data: myWantedDeals, isLoading } = useQuery<InvestorWantedDeal[]>({
    queryKey: ["/api/my-investor-wanted-deals"],
  });

  const form = useForm<WantedDealFormData>({
    resolver: zodResolver(wantedDealFormSchema),
    defaultValues: {
      title: "",
      description: "",
      propertyTypes: [],
      strategies: [],
      locations: [],
      minBudget: undefined,
      maxBudget: undefined,
      targetReturnMin: undefined,
      targetReturnMax: undefined,
      preferredStructure: "",
      maxEquityPercent: undefined,
      maxInterestRate: "",
      availableCapital: undefined,
      dealsWanted: 1,
      urgency: "",
      holdPeriodPreference: "",
      isPublic: true,
      activelyLooking: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: WantedDealFormData) => {
      return apiRequest("POST", "/api/investor-wanted-deals", {
        ...data,
        propertyTypes,
        strategies,
        locations,
      });
    },
    onSuccess: () => {
      toast({
        title: "Criteria Posted",
        description: "Your investment criteria has been posted. Wholesalers can now see what you're looking for!",
      });
      form.reset();
      setPropertyTypes([]);
      setStrategies([]);
      setLocations([]);
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ["/api/my-investor-wanted-deals"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post criteria. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<WantedDealFormData> }) => {
      return apiRequest("PATCH", `/api/investor-wanted-deals/${id}`, {
        ...data,
        propertyTypes,
        strategies,
        locations,
      });
    },
    onSuccess: () => {
      toast({
        title: "Criteria Updated",
        description: "Your investment criteria has been updated.",
      });
      setEditingDeal(null);
      form.reset();
      setPropertyTypes([]);
      setStrategies([]);
      setLocations([]);
      queryClient.invalidateQueries({ queryKey: ["/api/my-investor-wanted-deals"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update criteria. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/investor-wanted-deals/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Criteria Deleted",
        description: "Your investment criteria has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-investor-wanted-deals"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete criteria. Please try again.",
        variant: "destructive",
      });
    },
  });

  const togglePropertyType = (type: string) => {
    setPropertyTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleStrategy = (strategy: string) => {
    setStrategies(prev => 
      prev.includes(strategy) ? prev.filter(s => s !== strategy) : [...prev, strategy]
    );
  };

  const addLocation = () => {
    if (locationInput.trim() && !locations.includes(locationInput.trim())) {
      setLocations([...locations, locationInput.trim()]);
      setLocationInput("");
    }
  };

  const removeLocation = (location: string) => {
    setLocations(locations.filter(l => l !== location));
  };

  const startEditing = (deal: InvestorWantedDeal) => {
    setEditingDeal(deal);
    setPropertyTypes(deal.propertyTypes || []);
    setStrategies(deal.strategies || []);
    setLocations(deal.locations || []);
    form.reset({
      title: deal.title,
      description: deal.description || "",
      propertyTypes: deal.propertyTypes || [],
      strategies: deal.strategies || [],
      locations: deal.locations || [],
      minBudget: deal.minBudget || undefined,
      maxBudget: deal.maxBudget || undefined,
      targetReturnMin: deal.targetReturnMin || undefined,
      targetReturnMax: deal.targetReturnMax || undefined,
      preferredStructure: deal.preferredStructure || "",
      maxEquityPercent: deal.maxEquityPercent || undefined,
      maxInterestRate: deal.maxInterestRate || "",
      availableCapital: deal.availableCapital || undefined,
      dealsWanted: deal.dealsWanted || 1,
      urgency: deal.urgency || "",
      holdPeriodPreference: deal.holdPeriodPreference || "",
      isPublic: deal.isPublic ?? true,
      activelyLooking: deal.activelyLooking ?? true,
    });
    setIsCreating(true);
  };

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const propertyTypeOptions = [
    { value: "single_family", label: "Single Family" },
    { value: "multi_family", label: "Multi-Family" },
    { value: "commercial", label: "Commercial" },
    { value: "industrial", label: "Industrial" },
    { value: "land", label: "Land" },
    { value: "mixed_use", label: "Mixed Use" },
  ];

  const strategyOptions = [
    { value: "fix_flip", label: "Fix & Flip" },
    { value: "buy_hold", label: "Buy & Hold" },
    { value: "brrrr", label: "BRRRR" },
    { value: "wholesale", label: "Wholesale" },
    { value: "development", label: "Development" },
    { value: "syndication", label: "Syndication" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isCreating ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">My Investment Criteria</h2>
              <p className="text-muted-foreground">
                Post what you're looking for and let wholesalers bring you deals
              </p>
            </div>
            <Button onClick={() => setIsCreating(true)} data-testid="button-create-wanted">
              <Plus className="w-4 h-4 mr-2" />
              Post New Criteria
            </Button>
          </div>

          {(!myWantedDeals || myWantedDeals.length === 0) ? (
            <Card className="sleek-card">
              <CardContent className="py-12 text-center">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Investment Criteria Posted</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Let wholesalers know what you're looking for! Post your investment criteria 
                  and receive targeted deal notifications.
                </p>
                <Button onClick={() => setIsCreating(true)} data-testid="button-create-first-wanted">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Criteria
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myWantedDeals.map((deal) => (
                <Card key={deal.id} className="sleek-card" data-testid={`wanted-deal-${deal.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {deal.title}
                          {deal.activelyLooking ? (
                            <Badge className="bg-green-600">Actively Looking</Badge>
                          ) : (
                            <Badge variant="secondary">Paused</Badge>
                          )}
                          {deal.isPublic ? (
                            <Badge variant="outline" className="text-xs"><Eye className="w-3 h-3 mr-1" />Public</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs"><EyeOff className="w-3 h-3 mr-1" />Private</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{deal.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => startEditing(deal)}
                          data-testid={`button-edit-wanted-${deal.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => deleteMutation.mutate(deal.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-wanted-${deal.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="p-3 rounded bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Budget Range</p>
                        <p className="font-medium">
                          {deal.minBudget || deal.maxBudget 
                            ? `${formatCurrency(deal.minBudget)} - ${formatCurrency(deal.maxBudget)}`
                            : "Flexible"}
                        </p>
                      </div>
                      <div className="p-3 rounded bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Target Return</p>
                        <p className="font-medium">
                          {deal.targetReturnMin || deal.targetReturnMax
                            ? `${deal.targetReturnMin || 0}% - ${deal.targetReturnMax || 100}%`
                            : "Flexible"}
                        </p>
                      </div>
                      <div className="p-3 rounded bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Available Capital</p>
                        <p className="font-medium">{formatCurrency(deal.availableCapital)}</p>
                      </div>
                      <div className="p-3 rounded bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Deals Wanted</p>
                        <p className="font-medium">{deal.dealsWanted || "Unlimited"}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      {deal.propertyTypes && deal.propertyTypes.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Property Types: </span>
                          {deal.propertyTypes.map((type, i) => (
                            <Badge key={i} variant="secondary" className="mr-1">
                              {propertyTypeOptions.find(o => o.value === type)?.label || type}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {deal.strategies && deal.strategies.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Strategies: </span>
                          {deal.strategies.map((s, i) => (
                            <Badge key={i} variant="secondary" className="mr-1">
                              {strategyOptions.find(o => o.value === s)?.label || s}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {deal.locations && deal.locations.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Locations: </span>
                          {deal.locations.map((loc, i) => (
                            <Badge key={i} variant="outline" className="mr-1">{loc}</Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center gap-4 text-xs text-muted-foreground">
                      <span><Eye className="w-3 h-3 inline mr-1" />{deal.viewCount || 0} views</span>
                      <span><FileText className="w-3 h-3 inline mr-1" />{deal.responseCount || 0} responses</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card className="sleek-card max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {editingDeal ? "Edit Investment Criteria" : "Post Investment Criteria"}
            </CardTitle>
            <CardDescription>
              Describe what types of deals you're looking for. This helps wholesalers match you with the right opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit((data) => {
                  if (editingDeal) {
                    updateMutation.mutate({ id: editingDeal.id, data });
                  } else {
                    createMutation.mutate(data);
                  }
                })} 
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Looking for SFR Fix & Flips in Atlanta" 
                          {...field} 
                          data-testid="input-wanted-title" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your ideal deal in detail..."
                          className="min-h-[100px]"
                          {...field} 
                          data-testid="textarea-wanted-description" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Property Types *</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {propertyTypeOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant={propertyTypes.includes(option.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => togglePropertyType(option.value)}
                        data-testid={`badge-property-${option.value}`}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                  {propertyTypes.length === 0 && (
                    <p className="text-xs text-destructive mt-1">Select at least one property type</p>
                  )}
                </div>

                <div>
                  <FormLabel>Investment Strategies *</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {strategyOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant={strategies.includes(option.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleStrategy(option.value)}
                        data-testid={`badge-strategy-${option.value}`}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                  {strategies.length === 0 && (
                    <p className="text-xs text-destructive mt-1">Select at least one strategy</p>
                  )}
                </div>

                <div>
                  <FormLabel>Target Markets</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      placeholder="Add a market (e.g., Atlanta, GA)"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
                      data-testid="input-wanted-location"
                    />
                    <Button type="button" variant="outline" onClick={addLocation} data-testid="button-add-location">
                      Add
                    </Button>
                  </div>
                  {locations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {locations.map((loc, i) => (
                        <Badge key={i} variant="secondary" className="flex items-center gap-1">
                          {loc}
                          <button 
                            type="button" 
                            onClick={() => removeLocation(loc)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Budget</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-wanted-min-budget"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Budget</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="500000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-wanted-max-budget"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetReturnMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Target Return (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="15"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-wanted-return-min"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetReturnMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Target Return (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="30"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-wanted-return-max"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="availableCapital"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Capital</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="250000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-wanted-capital"
                          />
                        </FormControl>
                        <FormDescription>Total capital you have available to deploy</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dealsWanted"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deals Wanted</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-wanted-deals-count"
                          />
                        </FormControl>
                        <FormDescription>How many deals you want to fund</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preferredStructure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Deal Structure</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-wanted-structure">
                              <SelectValue placeholder="Select structure" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="equity">Equity Only</SelectItem>
                            <SelectItem value="debt">Debt Only</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-wanted-urgency">
                              <SelectValue placeholder="Select urgency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="this_month">This Month</SelectItem>
                            <SelectItem value="this_quarter">This Quarter</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-wanted-public"
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Make visible to wholesalers</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="activelyLooking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-wanted-active"
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Actively looking for deals</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingDeal(null);
                      form.reset();
                      setPropertyTypes([]);
                      setStrategies([]);
                      setLocations([]);
                    }}
                    data-testid="button-cancel-wanted"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending || propertyTypes.length === 0 || strategies.length === 0}
                    data-testid="button-submit-wanted"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingDeal ? "Update Criteria" : "Post Criteria"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
