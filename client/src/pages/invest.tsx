import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertInvestorLeadSchema, type InsertInvestorLead, type InsertLead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { 
  TrendingUp,
  Search,
  FileText,
  Bell,
  Target,
  CheckCircle,
  ArrowRight,
  Loader2,
  DollarSign,
  Home,
  Users
} from "lucide-react";

export default function Invest() {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <WhatInvestorsGainSection />
      <ProjectSnapshotSection />
      <PartnershipTypesSection />
      <InvestorFormSection />
      <DisclaimerSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-invest-hero">
          Partner With Pegasus
          <span className="block text-primary">On Real Estate Projects</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
          We combine construction, design, and data-driven analysis to create real estate projects that aim to be both beautiful and profitable.
        </p>
        <Button size="lg" className="text-base px-8 py-6" onClick={() => document.getElementById('investor-form')?.scrollIntoView({ behavior: 'smooth' })} data-testid="button-become-partner">
          Become a Partner
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </section>
  );
}

function WhatInvestorsGainSection() {
  const benefits = [
    {
      icon: Search,
      title: "Access to Vetted Deals",
      description: "We source and analyze deals so you don't have to. Every opportunity is thoroughly evaluated.",
    },
    {
      icon: FileText,
      title: "Transparent Underwriting",
      description: "See the numbers—comps, rehab budgets, projected returns. No hidden surprises.",
    },
    {
      icon: Bell,
      title: "Regular Updates",
      description: "Stay informed throughout the project with consistent communication and progress reports.",
    },
    {
      icon: Target,
      title: "Clear Exit Strategy",
      description: "Every project has a defined exit—whether it's a sale, refinance, or hold strategy.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Benefits</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-investor-benefits">
            What Investors Gain
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="hover-elevate transition-all duration-300" data-testid={`card-investor-benefit-${index}`}>
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectSnapshotSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Example</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-project-snapshot">
            Project Snapshot: Nelson Dr
          </h2>
        </div>

        <Card className="max-w-4xl mx-auto" data-testid="card-project-snapshot">
          <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Acquisition</p>
                <p className="text-2xl font-bold">$385,000</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Rehab Budget</p>
                <p className="text-2xl font-bold">$75,000</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Project</p>
                <p className="text-2xl font-bold">$460,000</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Resale Target</p>
                <p className="text-2xl font-bold text-primary">$575,000</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">3 Bed · 2 Bath</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Fix & Flip Strategy</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">3 Month Timeline</span>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              * Numbers shown are illustrative. Actual project details shared with qualified investors.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function PartnershipTypesSection() {
  const partnerships = [
    {
      icon: DollarSign,
      title: "Debt Investment",
      description: "Provide a loan secured by real estate. Receive fixed interest payments regardless of project outcome. Lower risk with predictable cash flow, typically 8-12% annual returns.",
      benefits: ["Fixed monthly income", "Principal protected by property", "First position on capital stack"],
      risks: ["Lower upside than equity", "Returns capped at agreed rate"],
      note: "Available",
    },
    {
      icon: TrendingUp,
      title: "Equity Investment",
      description: "Share in the profits (and risks) of property flips or hold strategies. Higher potential returns tied directly to project success, typically 15-30% annualized.",
      benefits: ["Higher profit potential", "Share in property appreciation", "Tax advantages on gains"],
      risks: ["Returns tied to project success", "Longer hold periods possible"],
      note: "Available",
    },
    {
      icon: Users,
      title: "Joint Ventures",
      description: "Partner directly with our operators. You provide capital, we handle execution. Profit splits customized per deal with active involvement in major decisions.",
      benefits: ["Direct project control", "Customized deal terms", "True partnership relationship"],
      risks: ["Requires larger capital", "More active involvement needed"],
      note: "Available",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-card/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Structures</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-partnership-types">
            Types of Partnerships
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {partnerships.map((partnership, index) => (
            <Card key={index} className="hover-elevate transition-all duration-300 relative overflow-visible" data-testid={`card-partnership-${index}`}>
              <CardContent className="p-8">
                <div className="absolute -top-3 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  {partnership.note}
                </div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <partnership.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center">{partnership.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm mb-4">{partnership.description}</p>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-green-600 mb-1">Benefits:</p>
                    <ul className="text-muted-foreground space-y-1">
                      {partnership.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-amber-600 mb-1">Considerations:</p>
                    <ul className="text-muted-foreground space-y-1">
                      {partnership.risks.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Target className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function InvestorFormSection() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InsertInvestorLead>({
    resolver: zodResolver(insertInvestorLeadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cityState: "",
      capitalRange: "25-50k",
      investmentPreference: "flips",
      experienceLevel: "new",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertInvestorLead) => {
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const cityStateParts = data.cityState.split(',');
      const city = cityStateParts[0]?.trim() || '';
      const state = cityStateParts[1]?.trim() || '';
      
      const unifiedLead: Partial<InsertLead> = {
        leadType: 'investor',
        source: 'invest_page',
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        city,
        state,
        leadData: {
          capitalRange: data.capitalRange,
          investmentPreference: data.investmentPreference,
          experienceLevel: data.experienceLevel,
        },
        notes: data.notes,
      };
      
      const response = await apiRequest("POST", "/api/leads", unifiedLead);
      return response;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Profile Submitted!",
        description: "We'll review your information and reach out soon.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInvestorLead) => {
    mutation.mutate(data);
  };

  if (submitted) {
    return (
      <section id="investor-form" className="py-20 lg:py-32">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-semibold mb-4" data-testid="text-investor-success">Thank You!</h2>
          <p className="text-muted-foreground text-lg">
            We've received your investor profile. Our team will review it and reach out to discuss potential partnership opportunities.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="investor-form" className="py-20 lg:py-32">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Get Started</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-investor-form-title">
            Submit Your Investor Profile
          </h2>
        </div>

        <Card>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} data-testid="input-investor-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-investor-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} data-testid="input-investor-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cityState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City / State</FormLabel>
                        <FormControl>
                          <Input placeholder="Los Angeles, CA" {...field} data-testid="input-investor-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="capitalRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capital to Deploy</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-capital">
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0-25k">$0 - $25K</SelectItem>
                            <SelectItem value="25-50k">$25K - $50K</SelectItem>
                            <SelectItem value="50-100k">$50K - $100K</SelectItem>
                            <SelectItem value="100k-plus">$100K+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            <SelectItem value="flips">Flips</SelectItem>
                            <SelectItem value="rentals">Rentals</SelectItem>
                            <SelectItem value="mexico">Mexico</SelectItem>
                            <SelectItem value="not-sure">Not Sure</SelectItem>
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
                            <SelectItem value="new">New Investor</SelectItem>
                            <SelectItem value="some">Some Experience</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What Are You Looking for in a Partner?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your investment goals, experience, and what you're looking for in a partnership..."
                          className="min-h-32 resize-none"
                          {...field}
                          value={field.value ?? ""}
                          data-testid="textarea-investor-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full sm:w-auto"
                  disabled={mutation.isPending}
                  data-testid="button-submit-investor"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Investor Profile
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function DisclaimerSection() {
  return (
    <section className="py-12 bg-card/50 border-t border-border">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-sm text-muted-foreground text-center" data-testid="text-disclaimer">
          <strong>Disclaimer:</strong> This is not a securities offering. All investments involve risk. 
          Any future opportunities will be discussed individually and structured with proper documentation. 
          Past performance is not indicative of future results.
        </p>
      </div>
    </section>
  );
}
