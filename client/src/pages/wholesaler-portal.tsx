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
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge className="bg-purple-600 mb-2">Wholesaler Portal</Badge>
            <h1 className="text-3xl font-bold" data-testid="text-wholesaler-welcome">
              Welcome, {user?.firstName || "Wholesaler"}
            </h1>
            <p className="text-muted-foreground">
              {hasProfile ? "Browse assignments and submit deals" : "Complete your profile to get started"}
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
            <TabsTrigger value="dashboard" data-testid="tab-wholesaler-dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="assignments" data-testid="tab-wholesaler-assignments">
              <Building2 className="w-4 h-4 mr-2" />
              Available Assignments
            </TabsTrigger>
            <TabsTrigger value="submit" data-testid="tab-wholesaler-submit">
              <FileText className="w-4 h-4 mr-2" />
              Submit a Deal
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-wholesaler-profile">
              <User className="w-4 h-4 mr-2" />
              My Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab profile={profile} deals={deals} />
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
  return (
    <Card className="sleek-card max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Submit a Deal
        </CardTitle>
        <CardDescription>
          Have a property under contract? Submit it to our acquisitions team for review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 rounded-lg bg-secondary/50 text-center">
          <Hammer className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Ready to Submit?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Contact our acquisitions team directly with your deal details. Include property address, 
            contract price, ARV, estimated repairs, and your assignment fee.
          </p>
          <Link href="/contact">
            <Button data-testid="button-submit-deal">
              Contact Acquisitions
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">What We Look For:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Properties at 70% or less of ARV minus repairs</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Clear title and motivated sellers</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Realistic repair estimates and ARV comps</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              <span>At least 14 days remaining on contract</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
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
