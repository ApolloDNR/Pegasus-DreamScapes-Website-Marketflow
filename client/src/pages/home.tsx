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
import { useState, useEffect, useRef } from "react";
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
  Star,
  Quote,
  Award,
  CheckCircle2,
  BarChart3,
  DollarSign,
  Clock
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
import serviceImage1 from "@assets/generated_images/real_estate_investor_consultation.png";
import serviceImage2 from "@assets/generated_images/renovated_home_curb_appeal.png";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <TestimonialsSection />
      <FeaturedProjectSection />
      <SellPropertySection />
      <InvestSection />
      <DreamsCaperCreedSection />
      <ContactSection />
    </div>
  );
}

function AnimatedCounter({ end, duration = 2000, prefix = "", suffix = "" }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number;
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <span ref={countRef}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function StatsSection() {
  const stats = [
    { value: 47, suffix: "+", label: "Properties Transformed", icon: Building },
    { value: 12, suffix: "M+", prefix: "$", label: "Total Investment Volume", icon: DollarSign },
    { value: 98, suffix: "%", label: "Client Satisfaction", icon: Star },
    { value: 14, suffix: " Days", label: "Average Close Time", icon: Clock },
  ];

  return (
    <section className="py-20 lg:py-24 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-3 tracking-tight" data-testid={`stat-value-${index}`}>
                <AnimatedCounter end={stat.value} prefix={stat.prefix || ""} suffix={stat.suffix} />
              </p>
              <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Pegasus Dreamscapes made selling my inherited property stress-free. They gave me a fair offer and closed in two weeks. I couldn't have asked for a better experience.",
      author: "Sarah M.",
      role: "Property Seller",
      location: "Oakland, CA",
      rating: 5,
    },
    {
      quote: "As an investor, I appreciate their transparent underwriting and consistent returns. The team's expertise in identifying value-add opportunities is unmatched.",
      author: "Michael R.",
      role: "Investment Partner",
      location: "San Francisco, CA",
      rating: 5,
    },
    {
      quote: "They transformed our neighborhood. The property next door went from an eyesore to the most beautiful house on the block. Thank you for caring about our community.",
      author: "Linda T.",
      role: "Community Member",
      location: "San Jose, CA",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-32 lg:py-40 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">Client Experiences</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.02em]" data-testid="text-testimonials-title">
            Trusted by Sellers & Investors
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-10 sleek-card rounded-lg" data-testid={`testimonial-card-${index}`}>
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-8 text-base">
                "{testimonial.quote}"
              </p>
              <div className="pt-6 border-t border-border/50">
                <p className="font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role} · {testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges - refined styling */}
        <div className="mt-20 pt-16 border-t border-border/30">
          <div className="flex flex-wrap justify-center gap-12 lg:gap-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Licensed & Insured</p>
                <p className="text-xs text-muted-foreground">CA DRE #02145678</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">BBB Accredited</p>
                <p className="text-xs text-muted-foreground">A+ Rating</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-tan/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-tan" />
              </div>
              <div>
                <p className="font-semibold text-sm">Proven Track Record</p>
                <p className="text-xs text-muted-foreground">5+ Years Experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center">
      {/* Full-bleed background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Refined cinematic overlay - deeper, more luxurious */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      
      {/* Content - centered for more impact */}
      <div className="relative z-10 w-full py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            {/* Luxury kicker text */}
            <p className="text-sm uppercase tracking-[0.3em] text-white/60 mb-6 animate-fade-in font-medium" data-testid="text-hero-kicker">
              Real Estate Investment & Design
            </p>
            
            {/* Refined headline - tighter tracking, elegant spacing */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold leading-[0.9] mb-8 tracking-[-0.02em] text-white" data-testid="text-hero-headline">
              <span className="block animate-fade-in-up">Designed Profits.</span>
              <span className="block animate-fade-in-up animation-delay-100">Elevated</span>
              <span className="block text-champagne animate-fade-in-up animation-delay-200">Communities.</span>
            </h1>
            
            {/* Refined subheadline */}
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mb-12 leading-relaxed animate-fade-in animation-delay-300 font-light" data-testid="text-hero-subheadline">
              We transform distressed properties into high-performing assets through intentional design, disciplined execution, and community-focused restoration.
            </p>
            
            {/* Refined CTAs with elegant styling */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400">
              <a href="#sell">
                <Button size="lg" className="text-sm uppercase tracking-widest px-10 py-6 w-full sm:w-auto bg-white text-foreground hover:bg-white/90 font-medium button-glow" data-testid="button-hero-sell">
                  Sell Your Property
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </a>
              <a href="#invest">
                <Button size="lg" variant="outline" className="text-sm uppercase tracking-widest px-10 py-6 w-full sm:w-auto border-white/40 text-white hover:bg-white/10 backdrop-blur-sm font-medium" data-testid="button-hero-invest">
                  Partner With Us
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Refined accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-tan to-champagne" />
    </section>
  );
}

function ServicesSection() {
  const services = [
    {
      image: serviceImage1,
      title: "Property Investment Consultation",
      description: "Strategic guidance for real estate investments. We analyze opportunities, evaluate risks, and provide expert consultation to help you make informed decisions.",
      cta: "Book Consultation",
      ctaLink: "#contact",
    },
    {
      image: serviceImage2,
      title: "Home Valuation",
      description: "Get an accurate assessment of your property's value. Our comprehensive valuation considers market conditions, comparable sales, and property condition.",
      cta: "Request Valuation",
      ctaLink: "#sell",
    },
  ];

  return (
    <section id="services" className="py-32 lg:py-40 bg-stone">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header - refined typography */}
        <div className="mb-20">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">What We Offer</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.02em]" data-testid="text-services-title">
            Our Services
          </h2>
        </div>

        {/* Two-column service cards - refined styling */}
        <div className="space-y-12">
          {services.map((service, index) => (
            <div 
              key={index}
              className="grid lg:grid-cols-2 gap-0 bg-card rounded-lg overflow-hidden luxury-card"
              data-testid={`card-service-${index}`}
            >
              {/* Image left - refined with overlay gradient */}
              <div className="aspect-[4/3] lg:aspect-auto relative overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content right - refined padding and typography */}
              <div className="p-10 lg:p-16 flex flex-col justify-center">
                <h3 className="text-2xl sm:text-3xl font-semibold mb-5 tracking-tight">{service.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-10">{service.description}</p>
                <div>
                  <a href={service.ctaLink}>
                    <Button variant="outline" size="lg" className="px-8 text-sm uppercase tracking-widest font-medium">
                      {service.cta}
                      <ArrowRight className="ml-3 w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional services grid - refined sleek cards */}
        <div className="mt-24">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-8 font-medium">Investment Strategies</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: HomeIcon, title: "Fix & Flip", desc: "Transform distressed properties into profitable assets" },
              { icon: TrendingUp, title: "Buy & Hold", desc: "Build wealth through strategic rental investments" },
              { icon: Palette, title: "Design & Reno", desc: "Full-service renovation and design management" },
              { icon: Building, title: "New Construction", desc: "Ground-up development coming soon", comingSoon: true },
            ].map((item, index) => (
              <div 
                key={index}
                className={`p-8 sleek-card rounded-lg ${item.comingSoon ? 'opacity-75' : ''}`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${item.comingSoon ? 'bg-muted' : 'bg-primary/10'}`}>
                  <item.icon className={`w-6 h-6 ${item.comingSoon ? 'text-muted-foreground' : 'text-primary'}`} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-semibold text-lg">{item.title}</h4>
                  {item.comingSoon && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedProjectSection() {
  return (
    <section id="projects" className="py-32 lg:py-40 bg-stone">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">Case Study</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.02em]" data-testid="text-featured-title">
            Featured Project
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-lg overflow-hidden">
              <img 
                src={serviceImage2} 
                alt="Featured Project - Nelson Dr"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium text-sm shadow-lg">
              Featured Flip
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Nelson Dr, Richmond, CA
              </h3>
            </div>
            
            <p className="text-muted-foreground text-base leading-relaxed" data-testid="text-featured-description">
              Full cosmetic renovation and repositioning. Complete transformation including kitchen remodel, bathroom updates, new flooring, fresh paint, exterior refresh, and landscaping — all designed to maximize value and elevate the neighborhood.
            </p>

            <div className="flex flex-wrap gap-2">
              {["Kitchen Remodel", "Bath Updates", "New Flooring", "Exterior Refresh"].map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-background text-foreground border border-border/50 rounded-md text-sm font-medium">{tag}</span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-8 py-8 border-t border-border/30">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Property Type</p>
                <p className="font-semibold">Single Family</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Strategy</p>
                <p className="font-semibold">Fix & Flip</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Status</p>
                <p className="font-semibold text-primary">Completed</p>
              </div>
            </div>

            <Link href="/projects">
              <Button variant="outline" size="lg" className="px-8 text-sm uppercase tracking-widest font-medium" data-testid="button-view-projects">
                View All Projects
                <ArrowRight className="ml-3 w-4 h-4" />
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
    <section id="sell" className="py-32 lg:py-40 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">For Sellers</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 tracking-[-0.02em]" data-testid="text-sell-title">
              Sell Your Property
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-10">
              Need to sell quickly? We provide as-is cash offers with flexible closing timelines and completely transparent numbers. No repairs needed, no agent commissions, no hidden fees.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Fair Cash Offers</h4>
                  <p className="text-sm text-muted-foreground">Transparent pricing based on real market data</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Sell As-Is</h4>
                  <p className="text-sm text-muted-foreground">No repairs, cleaning, or staging required</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Flexible Timeline</h4>
                  <p className="text-sm text-muted-foreground">Close on your schedule — as fast as 7 days</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 sleek-card rounded-lg">
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

                  <Button type="submit" className="w-full text-sm uppercase tracking-widest font-medium" size="lg" disabled={mutation.isPending} data-testid="button-sell-submit">
                    {mutation.isPending ? "Submitting..." : "Get My Cash Offer"}
                  </Button>
                </form>
              </Form>
          </div>
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
    <section id="invest" className="py-32 lg:py-40 bg-stone">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div className="p-10 sleek-card rounded-lg lg:order-2">
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

                  <Button type="submit" className="w-full text-sm uppercase tracking-widest font-medium" size="lg" disabled={mutation.isPending} data-testid="button-invest-submit">
                    {mutation.isPending ? "Submitting..." : "Start Investing"}
                  </Button>
                </form>
              </Form>
          </div>

          <div className="lg:order-1">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">For Investors</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 tracking-[-0.02em]" data-testid="text-invest-title">
              Partner With Pegasus
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-10">
              Looking for a hands-on operator to partner with? We combine designed profits with disciplined execution and transparent underwriting. Every deal is analyzed, every update is clear, every number is real.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Designed Profits</h4>
                  <p className="text-sm text-muted-foreground">Strategic analysis on every deal opportunity</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Transparent Underwriting</h4>
                  <p className="text-sm text-muted-foreground">Full visibility into deal structure and returns</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Partner-First Approach</h4>
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
    <section id="creed" className="py-32 lg:py-40 bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">Our Identity</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.02em]" data-testid="text-creed-title">
            The Dreamscaper Creed
          </h2>
        </div>

        <div className="space-y-6 mb-16">
          {creedLines.map((line, index) => (
            <div 
              key={index} 
              className="flex items-center gap-5 text-xl sm:text-2xl font-medium text-foreground"
              data-testid={`creed-line-${index}`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <line.icon className="w-5 h-5 text-primary" />
              </div>
              <p className={index === 0 ? "text-primary" : ""}>{line.text}</p>
            </div>
          ))}
        </div>

        <div className="p-10 sleek-card rounded-lg mb-8">
          <p className="text-base text-muted-foreground leading-relaxed">
            <span className="text-primary font-semibold">Dreamscapers</span> are the workers, partners, and future franchise operators who embody our mission. They restore neighborhoods, strengthen cities, and create lasting value through intentional design and disciplined execution. Every Dreamscaper understands that profit and purpose go hand-in-hand.
          </p>
        </div>

        <div className="p-10 sleek-card rounded-lg">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-4 font-medium">Our Mission</p>
          <p className="text-base text-foreground leading-relaxed italic">
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
    <section id="contact" className="py-32 lg:py-40 bg-stone">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">Get In Touch</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 tracking-[-0.02em]" data-testid="text-contact-title">
              Contact Us
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-10">
              Ready to talk about a property, potential partnership, or have questions about what we do? We'd love to hear from you.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Phone</p>
                  <p className="font-semibold">(555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Email</p>
                  <p className="font-semibold">hello@pegasusdreamscapes.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Location</p>
                  <p className="font-semibold">Bay Area, California</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 sleek-card rounded-lg">
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

                  <Button type="submit" className="w-full text-sm uppercase tracking-widest font-medium" size="lg" disabled={mutation.isPending} data-testid="button-contact-submit">
                    {mutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
