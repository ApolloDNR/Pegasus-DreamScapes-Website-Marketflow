import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Home, 
  MapPin, 
  DollarSign,
  TrendingUp,
  ArrowRight,
  Loader2,
  FileText,
  Calculator,
  Building2,
  Sparkles,
  CheckCircle2,
  Clock,
  Hammer,
  Users
} from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WholesaleDeal } from "@shared/schema";

const requestFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Phone number is required"),
  company: z.string().optional(),
  experience: z.string().min(1, "Experience level is required"),
  fundingSource: z.string().min(1, "Funding source is required"),
  message: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestFormSchema>;

export default function Wholesale() {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <HowItWorks />
      <DealsListing />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-tan/10" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-tan/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <Badge variant="secondary" className="mb-6 text-xs uppercase tracking-[0.2em]">
          <Sparkles className="w-3 h-3 mr-2" />
          Off-Market Opportunities
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-wholesale-hero">
          Wholesale Deals
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
          Access exclusive off-market properties under contract. Our acquisitions team sources the best deals — 
          and the ones we don't take are available for assignment to qualified investors and flippers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#deals">
            <Button size="lg" data-testid="button-view-deals">
              View Available Deals
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
          <Link href="/invest">
            <Button size="lg" variant="outline" data-testid="button-join-list">
              Join Investor List
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "We Source Deals",
      description: "Our acquisitions team finds off-market properties and negotiates contracts with motivated sellers."
    },
    {
      icon: Calculator,
      title: "We Underwrite",
      description: "Every deal is analyzed for ARV, repair costs, and profit potential before being listed."
    },
    {
      icon: Building2,
      title: "Development Review",
      description: "Our team reviews each deal. Projects we accept go into our portfolio."
    },
    {
      icon: Users,
      title: "Available for Assignment",
      description: "Deals we pass on become available for other investors to take the assignment."
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-stone border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-tan font-medium mb-4">The Process</p>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get access to pre-vetted deals with transparent numbers and quick turnaround.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="w-8 h-8 rounded-full bg-tan text-foreground font-bold flex items-center justify-center mx-auto mb-4 text-sm">
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DealsListing() {
  const { data: deals, isLoading, error } = useQuery<WholesaleDeal[]>({
    queryKey: ["/api/wholesale-deals"],
  });

  return (
    <section id="deals" className="py-20 lg:py-32 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-tan font-medium mb-4">Current Inventory</p>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Available Deals</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These properties are under contract and available for assignment. Numbers are verified by our team.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-muted-foreground py-20">
            Unable to load deals. Please try again later.
          </div>
        ) : !deals || deals.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
              <Home className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Deals Available Right Now</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Our acquisitions team is actively sourcing new deals. Join our investor list to be notified when new properties become available.
            </p>
            <Link href="/invest">
              <Button data-testid="button-join-waitlist">
                Join Investor List
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DealCard({ deal }: { deal: WholesaleDeal }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      experience: "",
      fundingSource: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      return apiRequest("POST", "/api/wholesale-requests", { ...data, dealId: deal.id });
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "We'll review your request and get back to you within 24 hours.",
      });
      form.reset();
      setDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
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

  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case "fix-flip": return "Fix & Flip";
      case "buy-hold": return "Buy & Hold";
      case "wholesale": return "Wholesale";
      default: return strategy;
    }
  };

  const potentialProfit = deal.arv && deal.contractPrice && deal.estimatedRepairs
    ? deal.arv - deal.contractPrice - deal.estimatedRepairs - deal.assignmentFee
    : null;

  return (
    <Card className="sleek-card overflow-hidden" data-testid={`card-deal-${deal.id}`}>
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
        {deal.images && deal.images.length > 0 ? (
          <img 
            src={deal.images[0]} 
            alt={deal.propertyAddress}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <Home className="w-12 h-12 text-primary/50 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Property Image</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Available
          </Badge>
          <Badge variant="outline" className="bg-background/70 backdrop-blur-sm">
            {getStrategyLabel(deal.strategy)}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white font-semibold text-lg">{deal.propertyAddress}</p>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{deal.city}, {deal.state} {deal.zipCode}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{deal.propertyType}</p>
            <div className="flex items-center gap-3 text-sm">
              {deal.bedrooms && <span className="font-medium">{deal.bedrooms} Bed</span>}
              {deal.bathrooms && <span className="font-medium">{deal.bathrooms} Bath</span>}
              {deal.sqft && <span className="font-medium">{deal.sqft.toLocaleString()} sqft</span>}
            </div>
          </div>
          {deal.contractExpiration && (
            <div className="text-right text-sm">
              <div className="flex items-center gap-1 text-amber-600">
                <Clock className="w-4 h-4" />
                <span>Contract expires soon</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contract Price</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(deal.contractPrice)}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Assignment Fee</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(deal.assignmentFee)}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">ARV</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(deal.arv)}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Est. Repairs</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(deal.estimatedRepairs)}</p>
          </div>
        </div>

        {potentialProfit && potentialProfit > 0 && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Potential Profit</span>
              </div>
              <span className="text-xl font-bold text-green-700 dark:text-green-400">{formatCurrency(potentialProfit)}</span>
            </div>
          </div>
        )}

        {deal.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{deal.description}</p>
        )}

        {deal.highlights && deal.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {deal.highlights.map((highlight, i) => (
              <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                {highlight}
              </span>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg" data-testid={`button-request-deal-${deal.id}`}>
              Request This Deal
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Request Deal Assignment</DialogTitle>
              <DialogDescription>
                Submit your information to request this deal. We'll review and get back to you within 24 hours.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} data-testid="input-request-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Company name" {...field} data-testid="input-request-company" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} data-testid="input-request-email" />
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
                          <Input placeholder="(555) 123-4567" {...field} data-testid="input-request-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-request-experience">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner (0-2 deals)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (3-10 deals)</SelectItem>
                            <SelectItem value="experienced">Experienced (10+ deals)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fundingSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Source</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-request-funding">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="hard-money">Hard Money</SelectItem>
                            <SelectItem value="private-money">Private Money</SelectItem>
                            <SelectItem value="conventional">Conventional</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your experience and why you're interested in this deal..." 
                          className="resize-none"
                          {...field}
                          data-testid="input-request-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-request">
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-stone border-t border-border">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4" data-testid="text-wholesale-cta">
          Have a Deal to Submit?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          If you're a wholesaler with a deal under contract, we're always looking for new opportunities. 
          Submit your deal for review by our acquisitions team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button size="lg" data-testid="button-submit-deal">
              Submit a Deal
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/calculators">
            <Button size="lg" variant="outline" data-testid="button-analyze-deal">
              <Calculator className="mr-2 w-5 h-5" />
              Analyze Your Numbers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
