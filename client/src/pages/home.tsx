import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Home as HomeIcon, 
  TrendingUp, 
  Palette,
  Building,
  MapPin,
  ArrowRight,
  Shield,
  Heart,
  Sparkles,
  Users,
  Phone,
  Mail,
  Star
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logoImage from "@assets/image_1764616120774.png";
import heroImage from "@assets/generated_images/luxury_home_at_dusk_with_warm_lighting.png";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ServicesSection />
      <FeaturedProjectSection />
      <SellPropertySection />
      <InvestSection />
      <DreamsCaperCreedSection />
      <ContactSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-end">
      {/* Full-bleed background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Cinematic dark overlay with warm glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      
      {/* Warm golden glow accent overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/20 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 w-full pb-24 pt-48">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            {/* Editorial-style large headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] mb-8 tracking-tight text-white" data-testid="text-hero-headline">
              <span className="block">DESIGNED</span>
              <span className="block">PROFITS</span>
              <span className="block text-tan">ELEVATED</span>
              <span className="block">COMMUNITIES</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/80 max-w-xl mb-10 leading-relaxed" data-testid="text-hero-subheadline">
              At Pegasus Dreamscapes, we specialize in turning distressed properties into stunning homes that empower communities and elevate living standards.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#sell">
                <Button size="lg" className="text-base px-8 py-6 w-full sm:w-auto bg-tan text-tan-foreground hover:bg-tan/90" data-testid="button-hero-sell">
                  Sell a Property
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <a href="#invest">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 w-full sm:w-auto border-white/30 text-white hover:bg-white/10 backdrop-blur-sm" data-testid="button-hero-invest">
                  Invest With Pegasus
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tan accent bar at bottom - inspired by reference */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-tan" />
    </section>
  );
}

function ServicesSection() {
  const services = [
    {
      icon: HomeIcon,
      title: "Fix & Flip Acquisitions",
      description: "Transform distressed homes into high-performing assets through intentional design and calculated renovation.",
      highlight: false,
    },
    {
      icon: TrendingUp,
      title: "Buy & Hold / Rental Investments",
      description: "Value-add rental strategies designed for long-term stability, equity growth, and predictable performance.",
      highlight: false,
    },
    {
      icon: Palette,
      title: "Design & Renovation Management",
      description: "Interior design, finish selection, layout optimization, and project oversight that raise ARV and rent potential.",
      highlight: false,
    },
    {
      icon: Building,
      title: "New Construction",
      description: "Coming soon: Ground-up builds crafted through purposeful design, modern planning, and community-focused development.",
      highlight: true,
      comingSoon: true,
    },
  ];

  return (
    <section id="services" className="py-24 lg:py-32 bg-card/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4" data-testid="text-services-title">
            What We Do
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive real estate investment services designed to create win-win outcomes for sellers, investors, and communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className={`p-6 hover-elevate transition-all duration-300 ${service.comingSoon ? 'border-primary/30' : ''}`}
              data-testid={`card-service-${index}`}
            >
              <CardContent className="p-0">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-5 ${service.comingSoon ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  <service.icon className={`w-7 h-7 ${service.comingSoon ? 'text-primary' : 'text-primary'}`} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                  {service.comingSoon && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProjectSection() {
  return (
    <section id="projects" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border overflow-hidden">
              <div className="text-center p-8">
                <HomeIcon className="w-20 h-20 text-primary/40 mx-auto mb-4" />
                <p className="text-lg text-muted-foreground font-medium">Featured Project</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Nelson Dr, Richmond, CA</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm shadow-lg">
              <Star className="w-4 h-4 inline mr-1.5" />
              Featured Flip
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-primary font-medium text-sm uppercase tracking-wide">Case Study</span>
              <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-featured-title">
                Nelson Dr, Richmond, CA
              </h2>
            </div>
            
            <p className="text-muted-foreground text-lg leading-relaxed" data-testid="text-featured-description">
              Full cosmetic renovation and repositioning. Complete transformation including kitchen remodel, bathroom updates, new flooring, fresh paint, exterior refresh, and landscaping — all designed to maximize value and elevate the neighborhood.
            </p>

            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">Kitchen Remodel</span>
              <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">Bath Updates</span>
              <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">New Flooring</span>
              <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">Exterior Refresh</span>
            </div>

            <div className="grid grid-cols-3 gap-6 py-6 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Property Type</p>
                <p className="text-lg font-semibold">Single Family</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Strategy</p>
                <p className="text-lg font-semibold">Fix & Flip</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold text-primary">Completed</p>
              </div>
            </div>

            <Link href="/projects">
              <Button variant="outline" data-testid="button-view-projects">
                View All Projects
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const sellerFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  propertyAddress: z.string().min(5, "Property address is required"),
  condition: z.string().min(1, "Please select property condition"),
  timeline: z.string().min(1, "Please select your timeline"),
});

function SellPropertySection() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof sellerFormSchema>>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      propertyAddress: "",
      condition: "",
      timeline: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof sellerFormSchema>) => {
      return apiRequest("POST", "/api/seller-leads", {
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        propertyAddress: data.propertyAddress,
        propertyCondition: data.condition,
        timeline: data.timeline,
        propertyType: "Single Family",
        motivation: "Website Inquiry",
      });
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "We've received your information and will be in touch within 24 hours.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof sellerFormSchema>) => {
    mutation.mutate(data);
  };

  return (
    <section id="sell" className="py-24 lg:py-32 bg-card/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6" data-testid="text-sell-title">
              Sell a Property
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Need to sell quickly? We provide as-is cash offers with flexible closing timelines and completely transparent numbers. No repairs needed, no agent commissions, no hidden fees.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Fair Cash Offers</h4>
                  <p className="text-sm text-muted-foreground">Transparent pricing based on real market data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Sell As-Is</h4>
                  <p className="text-sm text-muted-foreground">No repairs, cleaning, or staging required</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Flexible Timeline</h4>
                  <p className="text-sm text-muted-foreground">Close on your schedule - as fast as 7 days</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="p-8">
            <CardContent className="p-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-sell-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} data-testid="input-sell-email" />
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
                            <Input type="tel" placeholder="(555) 123-4567" {...field} data-testid="input-sell-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="propertyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City, State ZIP" {...field} data-testid="input-sell-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Condition</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-sell-condition">
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair - Needs Some Work</SelectItem>
                              <SelectItem value="poor">Poor - Major Repairs Needed</SelectItem>
                              <SelectItem value="distressed">Distressed / Uninhabitable</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="timeline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeline to Sell</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-sell-timeline">
                                <SelectValue placeholder="Select timeline" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="asap">ASAP</SelectItem>
                              <SelectItem value="30days">Within 30 Days</SelectItem>
                              <SelectItem value="60days">Within 60 Days</SelectItem>
                              <SelectItem value="90days">Within 90 Days</SelectItem>
                              <SelectItem value="flexible">Flexible</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending} data-testid="button-sell-submit">
                    {mutation.isPending ? "Submitting..." : "Get My Cash Offer"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

const investorFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  capitalRange: z.string().min(1, "Please select your capital range"),
  investmentPreference: z.string().min(1, "Please select your investment preference"),
});

function InvestSection() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof investorFormSchema>>({
    resolver: zodResolver(investorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      capitalRange: "",
      investmentPreference: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof investorFormSchema>) => {
      return apiRequest("POST", "/api/investor-leads", {
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        capitalRange: data.capitalRange,
        investmentPreference: data.investmentPreference,
        investmentGoals: "Website Inquiry",
        accreditedStatus: "not_specified",
      });
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "We've received your information and will be in touch within 24 hours.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof investorFormSchema>) => {
    mutation.mutate(data);
  };

  return (
    <section id="invest" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <Card className="p-8 lg:order-2">
            <CardContent className="p-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-invest-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} data-testid="input-invest-email" />
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
                            <Input type="tel" placeholder="(555) 123-4567" {...field} data-testid="input-invest-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="capitalRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Capital</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-invest-capital">
                              <SelectValue placeholder="Select capital range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                            <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                            <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                            <SelectItem value="250k-500k">$250,000 - $500,000</SelectItem>
                            <SelectItem value="500k+">$500,000+</SelectItem>
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
                            <SelectTrigger data-testid="select-invest-preference">
                              <SelectValue placeholder="Select preference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fix-flip">Fix & Flip (Short-term)</SelectItem>
                            <SelectItem value="buy-hold">Buy & Hold (Long-term Rental)</SelectItem>
                            <SelectItem value="both">Both Strategies</SelectItem>
                            <SelectItem value="new-construction">New Construction</SelectItem>
                            <SelectItem value="not-sure">Not Sure Yet</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending} data-testid="button-invest-submit">
                    {mutation.isPending ? "Submitting..." : "Start Investing"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="lg:order-1">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6" data-testid="text-invest-title">
              Invest With Pegasus
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Looking for a hands-on operator to partner with? We combine designed profits with disciplined execution and transparent underwriting. Every deal is analyzed, every update is clear, every number is real.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Designed Profits</h4>
                  <p className="text-sm text-muted-foreground">Strategic analysis on every deal opportunity</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Transparent Underwriting</h4>
                  <p className="text-sm text-muted-foreground">Full visibility into deal structure and returns</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Partner-First Approach</h4>
                  <p className="text-sm text-muted-foreground">We succeed when our partners succeed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DreamsCaperCreedSection() {
  const creedLines = [
    { text: "We are Dreamscapers.", icon: Sparkles },
    { text: "We repair what's broken.", icon: Shield },
    { text: "We restore what's forgotten.", icon: Heart },
    { text: "We protect what matters.", icon: Shield },
    { text: "We elevate communities through design, discipline, and intention.", icon: TrendingUp },
  ];

  return (
    <section id="creed" className="py-24 lg:py-32 bg-card/30">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Our Identity</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mt-4 mb-6" data-testid="text-creed-title">
            The Dreamscaper Creed
          </h2>
        </div>

        <div className="space-y-6 mb-12">
          {creedLines.map((line, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 text-xl sm:text-2xl font-medium text-foreground"
              data-testid={`creed-line-${index}`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <line.icon className="w-5 h-5 text-primary" />
              </div>
              <p className={index === 0 ? "text-primary" : ""}>{line.text}</p>
            </div>
          ))}
        </div>

        <Card className="p-8">
          <CardContent className="p-0">
            <p className="text-lg text-muted-foreground leading-relaxed">
              <span className="text-foreground font-medium">Dreamscapers</span> are the workers, partners, and future franchise operators who embody our mission. They restore neighborhoods, strengthen cities, and create lasting value through intentional design and disciplined execution. Every Dreamscaper understands that profit and purpose go hand-in-hand.
            </p>
          </CardContent>
        </Card>

        <div className="mt-12 p-8 border border-border rounded-xl bg-background/50">
          <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
          <p className="text-muted-foreground leading-relaxed">
            "Pegasus Dreamscapes exists to elevate communities by transforming distressed homes, underperforming neighborhoods, and forgotten blocks into restored, thriving, and beautiful environments. We design profits with intention — creating win–win outcomes for sellers, investors, and the communities we serve."
          </p>
        </div>
      </div>
    </section>
  );
}

const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  message: z.string().min(10, "Please enter a message"),
});

function ContactSection() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof contactFormSchema>) => {
      return apiRequest("POST", "/api/contacts", {
        fullName: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
        inquiryType: "general",
      });
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof contactFormSchema>) => {
    mutation.mutate(data);
  };

  return (
    <section id="contact" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6" data-testid="text-contact-title">
              Contact Us
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Ready to talk about a property, potential partnership, or have questions about what we do? We'd love to hear from you.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">(555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">hello@pegasusdreamscapes.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">Bay Area, California</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="p-8">
            <CardContent className="p-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-contact-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} data-testid="input-contact-email" />
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
                          <FormLabel>Phone (optional)</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(555) 123-4567" {...field} data-testid="input-contact-phone" />
                          </FormControl>
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
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="How can we help you?" 
                            className="min-h-32 resize-none"
                            {...field} 
                            data-testid="textarea-contact-message" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending} data-testid="button-contact-submit">
                    {mutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
