import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PortalHeader } from "@/components/portal-header";
import { AnnouncementsBanner } from "@/components/announcements-banner";
import { WholesaleDealForm } from "@/components/wholesale-deal-form";
import { 
  Building2, 
  ArrowRight, 
  Loader2,
  DollarSign,
  Clock,
  CheckCircle2,
  Home,
  MapPin,
  LogIn,
  User,
  BarChart3,
  FileText,
  Hammer,
  Users,
  TrendingUp,
  Target,
  Briefcase,
  Award,
  Calendar,
  AlertCircle,
  Eye
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import type { WholesaleDeal, WholesalerProfile } from "@shared/schema";
import { sampleWholesaleDeals, sampleWholesalerStats } from "@/lib/sample-data";

const profileFormSchema = z.object({
  company: z.string().optional(),
  phone: z.string().min(10, "Phone number is required"),
  cityState: z.string().min(2, "City/State is required"),
  yearsExperience: z.number().min(0).optional(),
  dealsPerYear: z.string().optional(),
  marketAreas: z.array(z.string()).optional(),
  buyersList: z.boolean().optional(),
  notes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function WholesalerPortal() {
  const { profile: authProfile, isLoading: authLoading, isAuthenticated, isGuestMode, exitGuestMode } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: profile, isLoading: profileLoading } = useQuery<WholesalerProfile>({
    queryKey: ["/api/portal/wholesaler/profile"],
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
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
            <Hammer className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Wholesaler Portal</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to browse available assignments and submit deals to our acquisitions team.
          </p>
          <a href="/api/login?returnTo=/portal/wholesaler">
            <Button size="lg" data-testid="button-wholesaler-login">
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
              <span className="text-sm font-medium">Guest Preview Mode - Viewing as Wholesaler</span>
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
      <AnnouncementsBanner audience="WHOLESALERS" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-wholesaler-welcome">
              Welcome, {isGuestMode ? "Guest Wholesaler" : (authProfile?.display_name || "Wholesaler")}
            </h1>
            <p className="text-muted-foreground">
              {isGuestMode ? "Preview deal submissions and partner opportunities" : (hasProfile ? "Browse assignments and submit deals" : "Complete your profile to get started")}
            </p>
          </div>
          <PortalHeader currentPortal="wholesaler" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 flex-wrap">
            <TabsTrigger value="dashboard" data-testid="tab-wholesaler-dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="my-deals" data-testid="tab-wholesaler-mydeals">
              <FileText className="w-4 h-4 mr-2" />
              My Deals
            </TabsTrigger>
            <TabsTrigger value="assignments" data-testid="tab-wholesaler-assignments">
              <Building2 className="w-4 h-4 mr-2" />
              Available Assignments
            </TabsTrigger>
            <TabsTrigger value="submit" data-testid="tab-wholesaler-submit">
              <Hammer className="w-4 h-4 mr-2" />
              Submit Deal
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-wholesaler-profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab profile={profile} deals={deals} />
          </TabsContent>

          <TabsContent value="my-deals">
            <MyDealsTab />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentsTab deals={deals} />
          </TabsContent>

          <TabsContent value="submit">
            <SubmitDealTab />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab profile={profile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DashboardTab({ profile, deals }: { profile?: WholesalerProfile; deals?: WholesaleDeal[] }) {
  const { data: myDeals } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/portal/wholesaler/my-deals"],
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const underReviewCount = myDeals?.filter(d => d.status === "under_review").length || 0;
  const acceptedCount = myDeals?.filter(d => d.status === "accepted" || d.status === "available").length || 0;
  const assignedCount = myDeals?.filter(d => d.status === "assigned").length || 0;
  const totalSubmitted = myDeals?.length || 0;
  
  const totalEarningsPotential = myDeals?.reduce((sum, d) => sum + (d.assignmentFee || 0), 0) || 0;
  const pendingEarnings = myDeals?.filter(d => d.status === "available" || d.status === "accepted")
    .reduce((sum, d) => sum + (d.assignmentFee || 0), 0) || 0;
  const closedEarnings = myDeals?.filter(d => d.status === "assigned")
    .reduce((sum, d) => sum + (d.assignmentFee || 0), 0) || 0;
  
  const stats = [
    { label: "Deals Submitted", value: totalSubmitted, icon: FileText, color: "text-blue-600", bgColor: "bg-blue-600/10" },
    { label: "Under Review", value: underReviewCount, icon: Clock, color: "text-amber-600", bgColor: "bg-amber-600/10" },
    { label: "Accepted", value: acceptedCount, icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-600/10" },
    { label: "Assigned/Closed", value: assignedCount, icon: Award, color: "text-purple-600", bgColor: "bg-purple-600/10" },
  ];

  const pipelineStages = [
    { label: "Submitted", count: totalSubmitted, color: "bg-blue-500" },
    { label: "Under Review", count: underReviewCount, color: "bg-amber-500" },
    { label: "Accepted", count: acceptedCount, color: "bg-green-500" },
    { label: "Closed", count: assignedCount, color: "bg-purple-500" },
  ];

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
                  Fill out your wholesaler profile to submit deals and access our buyers network.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={() => (document.querySelector('[data-testid="tab-wholesaler-profile"]') as HTMLButtonElement)?.click()}
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="sleek-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Deal Pipeline
            </CardTitle>
            <CardDescription>Track your deals from submission to close</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-6">
              {pipelineStages.map((stage, index) => (
                <div key={stage.label} className="flex-1" data-testid={`pipeline-stage-${index}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="text-sm font-medium">{stage.label}</span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full ${stage.color} transition-all`} 
                      style={{ width: stage.count > 0 ? '100%' : '0%' }}
                    />
                  </div>
                  <p className="text-center mt-1 text-2xl font-bold">{stage.count}</p>
                </div>
              ))}
            </div>
            
            {myDeals && myDeals.filter(d => d.status === "under_review").length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Awaiting Review
                </h4>
                <div className="space-y-2">
                  {myDeals.filter(d => d.status === "under_review").slice(0, 3).map(deal => (
                    <div key={deal.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800" data-testid={`review-deal-${deal.id}`}>
                      <div>
                        <p className="font-medium text-sm">{deal.propertyAddress}</p>
                        <p className="text-xs text-muted-foreground">{deal.city}, {deal.state}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600">{formatCurrency(deal.assignmentFee)}</p>
                        <p className="text-xs text-muted-foreground">Assignment Fee</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Earnings Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-muted-foreground">Closed Earnings</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(closedEarnings)}</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-muted-foreground">Pending Earnings</p>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(pendingEarnings)}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
              <p className="text-xl font-bold">{formatCurrency(totalEarningsPotential)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => (document.querySelector('[data-testid="tab-wholesaler-submit"]') as HTMLButtonElement)?.click()}
              data-testid="button-quick-submit"
            >
              <FileText className="mr-2 w-4 h-4" />
              Submit a New Deal
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => (document.querySelector('[data-testid="tab-wholesaler-mydeals"]') as HTMLButtonElement)?.click()}
              data-testid="button-quick-mydeals"
            >
              <Eye className="mr-2 w-4 h-4" />
              View My Deals
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => (document.querySelector('[data-testid="tab-wholesaler-assignments"]') as HTMLButtonElement)?.click()}
              data-testid="button-quick-assignments"
            >
              <Building2 className="mr-2 w-4 h-4" />
              Browse Available Assignments
            </Button>
            <Link href="/calculators">
              <Button variant="outline" className="w-full justify-start" data-testid="button-quick-calculator">
                <DollarSign className="mr-2 w-4 h-4" />
                MAO Calculator
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">1</span>
                <span>Submit your deal with property details and contract info</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">2</span>
                <span>Our acquisitions team reviews within 24-48 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">3</span>
                <span>If accepted, we either take it ourselves or list it for our buyers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">4</span>
                <span>Get paid your assignment fee at closing</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {deals && deals.length > 0 && (
        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Available Assignments
            </CardTitle>
            <CardDescription>Co-wholesale opportunities from our network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.slice(0, 3).map(deal => (
                <div key={deal.id} className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors" data-testid={`assignment-preview-${deal.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-green-600">Available</Badge>
                    <Badge variant="outline">{deal.strategy}</Badge>
                  </div>
                  <p className="font-medium">{deal.propertyAddress}</p>
                  <p className="text-sm text-muted-foreground">{deal.city}, {deal.state}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="font-bold text-green-600">{formatCurrency(deal.assignmentFee)}</span>
                    <span className="text-xs text-muted-foreground">Assignment Fee</span>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => (document.querySelector('[data-testid="tab-wholesaler-assignments"]') as HTMLButtonElement)?.click()}
              data-testid="button-view-all-assignments"
            >
              View All Assignments
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MyDealsTab() {
  const { data: myDeals, isLoading } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/portal/wholesaler/my-deals"],
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "under_review": return "bg-amber-600";
      case "accepted": return "bg-green-600";
      case "rejected": return "bg-red-600";
      case "available": return "bg-blue-600";
      case "assigned": return "bg-purple-600";
      default: return "bg-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "under_review": return "Under Review";
      case "accepted": return "Accepted";
      case "rejected": return "Rejected";
      case "available": return "Listed for Sale";
      case "assigned": return "Assigned";
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground mt-4">Loading your deals...</p>
      </div>
    );
  }

  if (!myDeals || myDeals.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Deals Submitted Yet</h3>
        <p className="text-muted-foreground mb-6">
          Submit your first deal to start tracking its status.
        </p>
        <Button onClick={() => (document.querySelector('[data-testid="tab-wholesaler-submit"]') as HTMLButtonElement)?.click()}>
          <Hammer className="mr-2 w-4 h-4" />
          Submit Your First Deal
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Submitted</p>
                <p className="text-2xl font-bold">{myDeals.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold">{myDeals.filter(d => d.status === "under_review").length}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">{myDeals.filter(d => d.status === "accepted" || d.status === "available").length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="sleek-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assigned/Sold</p>
                <p className="text-2xl font-bold">{myDeals.filter(d => d.status === "assigned").length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {myDeals.map((deal) => (
          <Card key={deal.id} className="sleek-card" data-testid={`card-mydeal-${deal.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(deal.status)}>{getStatusLabel(deal.status)}</Badge>
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
                  <p className="text-muted-foreground">Your Assignment Fee</p>
                  <p className="font-bold text-primary">{formatCurrency(deal.assignmentFee)}</p>
                </div>
              </div>
              {deal.status === "under_review" && (
                <p className="text-sm text-muted-foreground text-center bg-amber-50 dark:bg-amber-950/30 p-3 rounded">
                  Your deal is being reviewed by our acquisitions team. Expect a response within 24-48 hours.
                </p>
              )}
              {deal.status === "accepted" && (
                <p className="text-sm text-green-700 dark:text-green-400 text-center bg-green-50 dark:bg-green-950/30 p-3 rounded">
                  Your deal was accepted! It will be listed for buyers shortly.
                </p>
              )}
              {deal.status === "available" && (
                <p className="text-sm text-blue-700 dark:text-blue-400 text-center bg-blue-50 dark:bg-blue-950/30 p-3 rounded">
                  Your deal is now listed and visible to buyers.
                </p>
              )}
              {deal.status === "assigned" && (
                <p className="text-sm text-purple-700 dark:text-purple-400 text-center bg-purple-50 dark:bg-purple-950/30 p-3 rounded">
                  Congratulations! This deal has been assigned. Payment pending at closing.
                </p>
              )}
              {deal.status === "rejected" && (
                <p className="text-sm text-red-700 dark:text-red-400 text-center bg-red-50 dark:bg-red-950/30 p-3 rounded">
                  This deal was not accepted. Contact our team for more details.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AssignmentsTab({ deals }: { deals?: WholesaleDeal[] }) {
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
        <h3 className="text-xl font-semibold mb-2">No Assignments Available</h3>
        <p className="text-muted-foreground mb-6">
          Check back soon for new wholesale deals.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {deals.map((deal) => (
        <Card key={deal.id} className="sleek-card" data-testid={`card-assignment-${deal.id}`}>
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
                Request Assignment
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SubmitDealTab() {
  const [, setLocation] = useLocation();
  
  const handleSuccess = () => {
    setLocation("/portal/wholesaler");
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <WholesaleDealForm onSuccess={handleSuccess} />
      </div>
      <div className="space-y-6">
        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              What We Look For
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
                <span>Properties at 70% or less of ARV minus repairs</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
                <span>Clear title and motivated sellers</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
                <span>Realistic repair estimates with comps to support ARV</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
                <span>At least 14 days remaining on contract</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Review Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="text-muted-foreground">
              Our acquisitions team reviews submissions within 24-48 hours.
            </p>
            <p className="text-muted-foreground">
              If your deal meets our criteria, we'll reach out to discuss next steps.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileTab({ profile }: { profile?: WholesalerProfile }) {
  const { toast } = useToast();
  const [marketAreasInput, setMarketAreasInput] = useState("");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      company: profile?.company || "",
      phone: profile?.phone || "",
      cityState: profile?.cityState || "",
      yearsExperience: profile?.yearsExperience || 0,
      dealsPerYear: profile?.dealsPerYear || "",
      marketAreas: profile?.marketAreas || [],
      buyersList: profile?.buyersList || false,
      notes: profile?.notes || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest("POST", "/api/portal/wholesaler/register", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Saved",
        description: "Your wholesaler profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portal/wholesaler/profile"] });
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
          Wholesaler Profile
        </CardTitle>
        <CardDescription>
          {profile ? "Update your wholesaler information" : "Complete your profile to submit deals"}
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
                      <Input placeholder="Your company name" {...field} data-testid="input-ws-company" />
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
                      <Input placeholder="(555) 123-4567" {...field} data-testid="input-ws-phone" />
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
                  <FormLabel>Primary Market (City, State)</FormLabel>
                  <FormControl>
                    <Input placeholder="Los Angeles, CA" {...field} data-testid="input-ws-citystate" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="yearsExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-ws-years" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dealsPerYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deals per Year</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-ws-deals">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 deals</SelectItem>
                        <SelectItem value="6-10">6-10 deals</SelectItem>
                        <SelectItem value="11-25">11-25 deals</SelectItem>
                        <SelectItem value="26-50">26-50 deals</SelectItem>
                        <SelectItem value="50+">50+ deals</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="buyersList"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-buyers-list"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I have an active buyers list</FormLabel>
                    <FormDescription>
                      Check this if you have a list of cash buyers ready to purchase
                    </FormDescription>
                  </div>
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
                      placeholder="Tell us about your wholesaling business, target markets, or deal criteria..."
                      className="resize-none"
                      {...field}
                      data-testid="input-ws-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-save-ws-profile">
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
