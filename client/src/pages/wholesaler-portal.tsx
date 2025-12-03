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
  Users
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { WholesaleDeal, WholesalerProfile } from "@shared/schema";

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
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: profile, isLoading: profileLoading } = useQuery<WholesalerProfile>({
    queryKey: ["/api/portal/wholesaler/profile"],
    enabled: isAuthenticated,
  });

  const { data: deals } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/wholesale-deals"],
    enabled: isAuthenticated,
  });

  const hasProfile = !!profile;

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
      <AnnouncementsBanner audience="WHOLESALERS" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-wholesaler-welcome">
              Welcome, {user?.firstName || "Wholesaler"}
            </h1>
            <p className="text-muted-foreground">
              {hasProfile ? "Browse assignments and submit deals" : "Complete your profile to get started"}
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
  const stats = [
    { label: "Available Assignments", value: deals?.length || 0, icon: Building2, color: "text-blue-600" },
    { label: "Profile Status", value: profile?.isApproved ? "Approved" : "Pending", icon: CheckCircle2, color: profile?.isApproved ? "text-green-600" : "text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="sleek-card">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="sleek-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => (document.querySelector('[data-testid="tab-wholesaler-submit"]') as HTMLButtonElement)?.click()}
            >
              <FileText className="mr-2 w-4 h-4" />
              Submit a New Deal
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => (document.querySelector('[data-testid="tab-wholesaler-assignments"]') as HTMLButtonElement)?.click()}
            >
              <Building2 className="mr-2 w-4 h-4" />
              Browse Assignments
            </Button>
            <Link href="/calculators">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 w-4 h-4" />
                Deal Calculator
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

const dealFormSchema = z.object({
  propertyAddress: z.string().min(5, "Property address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  propertyType: z.string().min(1, "Property type is required"),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.string().optional(),
  sqft: z.number().min(0).optional(),
  yearBuilt: z.number().min(1800).max(2025).optional(),
  lotSize: z.string().optional(),
  contractPrice: z.number().min(1, "Contract price is required"),
  assignmentFee: z.number().min(1, "Assignment fee is required"),
  arv: z.number().min(0).optional(),
  estimatedRepairs: z.number().min(0).optional(),
  strategy: z.string().min(1, "Investment strategy is required"),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  contractExpiration: z.string().optional(),
});

type DealFormData = z.infer<typeof dealFormSchema>;

function SubmitDealTab() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [highlightInput, setHighlightInput] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      propertyAddress: "",
      city: "",
      state: "",
      zipCode: "",
      propertyType: "",
      bedrooms: undefined,
      bathrooms: "",
      sqft: undefined,
      yearBuilt: undefined,
      lotSize: "",
      contractPrice: 0,
      assignmentFee: 0,
      arv: undefined,
      estimatedRepairs: undefined,
      strategy: "",
      description: "",
      highlights: [],
      contractExpiration: "",
    },
  });

  const watchedValues = form.watch();
  const contractPrice = watchedValues.contractPrice || 0;
  const assignmentFee = watchedValues.assignmentFee || 0;
  const arv = watchedValues.arv || 0;
  const estimatedRepairs = watchedValues.estimatedRepairs || 0;

  const totalCost = contractPrice + assignmentFee + estimatedRepairs;
  const potentialProfit = arv - totalCost;
  const roi = totalCost > 0 ? ((potentialProfit / totalCost) * 100).toFixed(1) : "0";
  const maxOffer = arv > 0 ? Math.round(arv * 0.7 - estimatedRepairs) : 0;
  const dealGrade = 
    potentialProfit >= 50000 ? "A" :
    potentialProfit >= 30000 ? "B" :
    potentialProfit >= 15000 ? "C" : "D";

  const submitMutation = useMutation({
    mutationFn: async (data: DealFormData) => {
      return apiRequest("POST", "/api/wholesale-deals", {
        ...data,
        highlights,
        images: imageUrls,
      });
    },
    onSuccess: () => {
      toast({
        title: "Deal Submitted",
        description: "Your wholesale deal has been submitted for review.",
      });
      form.reset();
      setHighlights([]);
      setImageUrls([]);
      setStep(1);
      queryClient.invalidateQueries({ queryKey: ["/api/wholesale-deals"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addHighlight = () => {
    if (highlightInput.trim() && highlights.length < 5) {
      setHighlights([...highlights, highlightInput.trim()]);
      setHighlightInput("");
    }
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim() && imageUrls.length < 10) {
      setImageUrls([...imageUrls, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-4xl">
      <Card className="sleek-card mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Submit a Wholesale Deal
          </CardTitle>
          <CardDescription>
            Complete all fields to submit your deal for review. Accurate information helps us process faster.
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${step >= 1 ? "bg-primary text-white" : "bg-secondary"}`}>
              <span>1</span>
              <span className="hidden sm:inline">Property</span>
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${step >= 2 ? "bg-primary text-white" : "bg-secondary"}`}>
              <span>2</span>
              <span className="hidden sm:inline">Financials</span>
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${step >= 3 ? "bg-primary text-white" : "bg-secondary"}`}>
              <span>3</span>
              <span className="hidden sm:inline">Details</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Property Information
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="propertyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} data-testid="input-deal-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Los Angeles" {...field} data-testid="input-deal-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="CA" {...field} data-testid="input-deal-state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="90001" {...field} data-testid="input-deal-zip" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-deal-type">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single_family">Single Family</SelectItem>
                            <SelectItem value="multi_family">Multi-Family</SelectItem>
                            <SelectItem value="condo">Condo/Townhouse</SelectItem>
                            <SelectItem value="duplex">Duplex</SelectItem>
                            <SelectItem value="triplex">Triplex</SelectItem>
                            <SelectItem value="fourplex">Fourplex</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="3" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              data-testid="input-deal-beds" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input placeholder="2" {...field} data-testid="input-deal-baths" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sqft"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sq Ft</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1500" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              data-testid="input-deal-sqft" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="yearBuilt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Built</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1990" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              data-testid="input-deal-year" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={() => setStep(2)} data-testid="button-next-step">
                      Next: Financials
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Financial Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contractPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contract Price *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="150000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-deal-contract" 
                            />
                          </FormControl>
                          <FormDescription>Price you have under contract</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="assignmentFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignment Fee *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="15000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-deal-assignment" 
                            />
                          </FormControl>
                          <FormDescription>Your wholesale fee</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="arv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>After Repair Value (ARV)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="250000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              data-testid="input-deal-arv" 
                            />
                          </FormControl>
                          <FormDescription>Estimated value after repairs</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estimatedRepairs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Repairs</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              data-testid="input-deal-repairs" 
                            />
                          </FormControl>
                          <FormDescription>Total rehab budget estimate</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="contractExpiration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Expiration Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-deal-expiration" />
                        </FormControl>
                        <FormDescription>When does your contract expire?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Card className="bg-secondary/30 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Deal Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-3 rounded bg-background">
                          <p className="text-xs text-muted-foreground">Total Cost</p>
                          <p className="font-bold">{formatCurrency(totalCost)}</p>
                        </div>
                        <div className="p-3 rounded bg-background">
                          <p className="text-xs text-muted-foreground">Potential Profit</p>
                          <p className={`font-bold ${potentialProfit > 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(potentialProfit)}
                          </p>
                        </div>
                        <div className="p-3 rounded bg-background">
                          <p className="text-xs text-muted-foreground">ROI</p>
                          <p className={`font-bold ${Number(roi) > 15 ? "text-green-600" : "text-amber-600"}`}>
                            {roi}%
                          </p>
                        </div>
                        <div className="p-3 rounded bg-background">
                          <p className="text-xs text-muted-foreground">Deal Grade</p>
                          <Badge className={
                            dealGrade === "A" ? "bg-green-600" :
                            dealGrade === "B" ? "bg-blue-600" :
                            dealGrade === "C" ? "bg-amber-600" : "bg-red-600"
                          }>
                            {dealGrade}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4 p-3 rounded bg-background">
                        <p className="text-xs text-muted-foreground">70% Rule Max Offer</p>
                        <p className="font-bold text-primary">{formatCurrency(maxOffer)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          (ARV × 70%) - Repairs = Maximum purchase price
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} data-testid="button-prev-step">
                      Back
                    </Button>
                    <Button type="button" onClick={() => setStep(3)} data-testid="button-next-details">
                      Next: Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Deal Details
                  </h3>

                  <FormField
                    control={form.control}
                    name="strategy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investment Strategy *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-deal-strategy">
                              <SelectValue placeholder="Select best strategy for this property" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fix_and_flip">Fix and Flip</SelectItem>
                            <SelectItem value="buy_and_hold">Buy and Hold (Rental)</SelectItem>
                            <SelectItem value="brrrr">BRRRR</SelectItem>
                            <SelectItem value="live_in_flip">Live-In Flip</SelectItem>
                            <SelectItem value="development">Development/Subdivision</SelectItem>
                          </SelectContent>
                        </Select>
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
                            placeholder="Describe the property condition, neighborhood, and why this is a great deal..."
                            className="min-h-[120px]"
                            {...field} 
                            data-testid="textarea-deal-description" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Deal Highlights</FormLabel>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Add a highlight (e.g., 'Corner lot')"
                        value={highlightInput}
                        onChange={(e) => setHighlightInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                        data-testid="input-deal-highlight"
                      />
                      <Button type="button" variant="outline" onClick={addHighlight} data-testid="button-add-highlight">
                        Add
                      </Button>
                    </div>
                    {highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {highlights.map((h, i) => (
                          <Badge key={i} variant="secondary" className="flex items-center gap-1">
                            {h}
                            <button 
                              type="button" 
                              onClick={() => removeHighlight(i)}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <FormLabel>Property Images (URLs)</FormLabel>
                    <FormDescription className="mb-2">
                      Add image URLs for property photos. Support for file uploads coming soon.
                    </FormDescription>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                        data-testid="input-deal-image"
                      />
                      <Button type="button" variant="outline" onClick={addImageUrl} data-testid="button-add-image">
                        Add
                      </Button>
                    </div>
                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {imageUrls.map((url, i) => (
                          <div key={i} className="relative group">
                            <img 
                              src={url} 
                              alt={`Property ${i + 1}`} 
                              className="w-full h-20 object-cover rounded border"
                              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150")}
                            />
                            <button
                              type="button"
                              onClick={() => removeImageUrl(i)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-400">Ready to Submit</h4>
                          <p className="text-sm text-green-700 dark:text-green-500">
                            Your deal will be reviewed by our acquisitions team within 24 hours.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} data-testid="button-back-financials">
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitMutation.isPending}
                      data-testid="button-submit-deal-final"
                    >
                      {submitMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Submit Deal for Review
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

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
