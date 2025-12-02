import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  FileText
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { WholesaleDeal, InvestorProfile } from "@shared/schema";

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
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: profile, isLoading: profileLoading } = useQuery<InvestorProfile>({
    queryKey: ["/api/portal/investor/profile"],
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
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge className="bg-green-600 mb-2">Investor Portal</Badge>
            <h1 className="text-3xl font-bold" data-testid="text-investor-welcome">
              Welcome, {user?.firstName || "Investor"}
            </h1>
            <p className="text-muted-foreground">
              {hasProfile ? "View your investment opportunities" : "Complete your profile to get started"}
            </p>
          </div>
          <Link href="/portal">
            <Button variant="outline" size="sm">
              Switch Portal
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard" data-testid="tab-investor-dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="deals" data-testid="tab-investor-deals">
              <Building2 className="w-4 h-4 mr-2" />
              Available Deals
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-investor-profile">
              <User className="w-4 h-4 mr-2" />
              My Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab profile={profile} deals={deals} />
          </TabsContent>

          <TabsContent value="deals">
            <DealsTab deals={deals} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab profile={profile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DashboardTab({ profile, deals }: { profile?: InvestorProfile; deals?: WholesaleDeal[] }) {
  const stats = [
    { label: "Available Deals", value: deals?.length || 0, icon: Building2, color: "text-blue-600" },
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
