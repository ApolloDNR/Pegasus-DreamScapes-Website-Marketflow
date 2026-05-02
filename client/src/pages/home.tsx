import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { InsertLead } from "@shared/schema";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ScrollReveal, FadeIn, StaggerChildren, StaggerItem, HoverLift, AnimatedCounter as SharedAnimatedCounter } from "@/components/animations";
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
  Mail,
  Star,
  Quote,
  Award,
  CheckCircle2,
  BarChart3,
  DollarSign,
  Clock,
  Target,
  Search,
  FileCheck,
  Handshake,
  Key,
  Zap,
  Send,
  ChevronRight,
  HelpCircle,
  ChevronLeft,
  Layers
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
import logoImage from "@assets/image_1765405939117.png";
import heroImage from "@assets/generated_images/luxury_home_at_dusk_with_warm_lighting.png";
import serviceImage1 from "@assets/generated_images/real_estate_investor_consultation.png";
import serviceImage2 from "@assets/generated_images/renovated_home_curb_appeal.png";
import { EditableText, EditableImage, EditableLink } from "@/components/editable";
import { useEditMode } from "@/contexts/edit-mode-context";
import { useSiteContent } from "@/contexts/site-content-context";

export default function Home() {
  useSEO({
    title: "Pegasus Dreamscapes | Development • Investments • Systems",
    description: "Dream it. Build it. Live it. Pegasus Dreamscapes is a founder-led real estate development, investment, and systems company built to source opportunities, structure deals, and create long-term value."
  });
  
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <FeaturedDealsSection />
      <ServicesSection />
      <OperatingPrinciplesSection />
      <FeaturedProjectSection />
      <SellPropertySection />
      <InvestSection />
      <InvestmentPhilosophySection />
      <HowItWorksSection />
      <TrustLogosSection />
      <CommunityImpactSection />
      <FAQSection />
      <NewsletterSection />
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
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const stats = [
    { value: "Founder-Led", label: "Execution Focus", icon: Building, key: "stats.0" },
    { value: "East Bay", label: "Local Roots", icon: DollarSign, key: "stats.1" },
    { value: "Three Pillars", label: "Development • Investments • Systems", icon: Star, key: "stats.2" },
    { value: "Private Beta", label: "MarketFlow in Active Development", icon: Clock, key: "stats.3" },
  ];

  return (
    <section className="py-24 lg:py-28 bg-card relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4" staggerDelay={0.15}>
          {stats.map((stat, index) => {
            const displayValue = getValue(`home.${stat.key}.value`) || stat.value;
            const displayLabel = getValue(`home.${stat.key}.label`) || stat.label;
            
            return (
              <StaggerItem key={index}>
                <motion.div 
                  className="text-center group cursor-default py-8 px-4 relative"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Decorative top accent */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                    <stat.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  
                  <div className="font-serif text-4xl sm:text-5xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight transition-colors duration-300 group-hover:text-primary" data-testid={`stat-value-${index}`}>
                    {isEditMode ? (
                      <EditableText 
                        contentKey={`home.${stat.key}.value`} 
                        fallback={String(stat.value)}
                      />
                    ) : (
                      displayValue
                    )}
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                    {isEditMode ? (
                      <EditableText 
                        contentKey={`home.${stat.key}.label`} 
                        fallback={stat.label}
                      />
                    ) : (
                      displayLabel
                    )}
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}

interface WholesaleDeal {
  id: number;
  propertyAddress: string;
  city: string;
  state: string;
  contractPrice: number;
  assignmentFee: number;
  arv: number;
  propertyType: string;
  status: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
}

function FeaturedDealsSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const { data: deals = [], isLoading } = useQuery<WholesaleDeal[]>({
    queryKey: ['/api/supabase/wholesale-deals'],
  });

  const featuredDeals = deals.filter(d => d.status === 'listed' || d.status === 'approved').slice(0, 4);

  if (isLoading) {
    return (
      <section className="py-24 lg:py-32 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <div className="h-4 w-32 bg-muted rounded mx-auto mb-4 animate-pulse" />
            <div className="h-8 w-64 bg-muted rounded mx-auto animate-pulse" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-card rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredDeals.length === 0) {
    return (
      <section id="featured-deals" className="py-24 lg:py-32 bg-muted/20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                {isEditMode ? (
                  <EditableText contentKey="home.deals.kicker" fallback="MarketFlow" />
                ) : (getValue("home.deals.kicker") || "MarketFlow")}
              </p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-[-0.02em] mb-4">
              {isEditMode ? (
                <EditableText contentKey="home.deals.emptyTitle" fallback="Fresh Deals Coming Soon" />
              ) : (getValue("home.deals.emptyTitle") || "Fresh Deals Coming Soon")}
            </h2>
            <div className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              {isEditMode ? (
                <EditableText contentKey="home.deals.emptyDescription" fallback="Our team is sourcing new investment opportunities. Sign up for alerts to be notified when deals are available." as="p" multiline />
              ) : (
                <p>{getValue("home.deals.emptyDescription") || "Our team is sourcing new investment opportunities. Sign up for alerts to be notified when deals are available."}</p>
              )}
            </div>
            <Link href="/marketflow" data-testid="link-explore-marketplace">
              <Button className="group" data-testid="button-explore-marketplace">
                Explore Marketplace
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-deals" className="py-24 lg:py-32 bg-muted/20 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                {isEditMode ? (
                  <EditableText contentKey="home.deals.kicker" fallback="MarketFlow" />
                ) : (getValue("home.deals.kicker") || "MarketFlow")}
              </p>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.02em]" data-testid="text-featured-deals-title">
              {isEditMode ? (
                <EditableText contentKey="home.deals.title" fallback="Featured Opportunities" />
              ) : (getValue("home.deals.title") || "Featured Opportunities")}
            </h2>
            <div className="mt-4 text-lg text-muted-foreground max-w-2xl">
              {isEditMode ? (
                <EditableText contentKey="home.deals.description" fallback="Browse our latest investment-ready properties. Each deal is vetted and underwritten by our team." as="p" multiline />
              ) : (
                <p>{getValue("home.deals.description") || "Browse our latest investment-ready properties. Each deal is vetted and underwritten by our team."}</p>
              )}
            </div>
          </div>
          <Link href="/marketflow">
            <Button variant="outline" className="group whitespace-nowrap" data-testid="button-view-all-deals">
              View All Deals
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </ScrollReveal>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
          {featuredDeals.map((deal, index) => (
            <StaggerItem key={deal.id}>
              <Link href={`/marketflow/deals/${deal.id}`} data-testid={`link-featured-deal-${index}`}>
                <motion.div 
                  className="group bg-card rounded-lg border border-border/50 overflow-hidden hover:border-primary/20 hover:shadow-xl transition-all duration-300 h-full cursor-pointer"
                  data-testid={`card-featured-deal-${index}`}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Property type badge */}
                  <div className="relative h-36 bg-gradient-to-br from-primary/10 to-champagne/10 flex items-center justify-center">
                    <Building className="w-12 h-12 text-primary/30" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded" data-testid={`text-deal-type-${index}`}>
                        {deal.propertyType || 'Residential'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1" data-testid={`text-deal-location-${index}`}>
                      {deal.city}, {deal.state}
                    </p>
                    <h3 className="font-semibold text-base mb-3 line-clamp-2 group-hover:text-primary transition-colors" data-testid={`text-deal-address-${index}`}>
                      {deal.propertyAddress}
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contract Price</span>
                        <span className="font-semibold" data-testid={`text-deal-price-${index}`}>${(deal.contractPrice || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assignment Fee</span>
                        <span className="font-semibold text-primary" data-testid={`text-deal-fee-${index}`}>${(deal.assignmentFee || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ARV</span>
                        <span className="font-semibold" data-testid={`text-deal-arv-${index}`}>${(deal.arv || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {(deal.bedrooms || deal.squareFootage) && (
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground" data-testid={`text-deal-specs-${index}`}>
                        {deal.bedrooms && <span>{deal.bedrooms} bed</span>}
                        {deal.bathrooms && <span>{deal.bathrooms} bath</span>}
                        {deal.squareFootage && <span>{deal.squareFootage.toLocaleString()} sqft</span>}
                      </div>
                    )}
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <ScrollReveal delay={0.3} className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            Deal submissions are open in private beta. Visibility and matching features may be limited during rollout.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Private Beta</span>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Role-Based Workflows</span>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Disciplined Review</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string | null;
  location: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

const defaultTestimonials = [
  {
    quote: "We prioritize process quality, underwriting discipline, and execution standards before growth metrics.",
    author: "Discipline Before Scale",
    role: "Operating Principle",
    location: null,
    initials: "DS",
  },
  {
    quote: "Every opportunity is reviewed with clear numbers, assumptions, and next-step documentation.",
    author: "Clear Numbers, Clear Process",
    role: "Operating Principle",
    location: null,
    initials: "CP",
  },
  {
    quote: "We focus on durable value creation through disciplined project planning and accountable execution.",
    author: "Built for Long-Term Value",
    role: "Operating Principle",
    location: null,
    initials: "LV",
  },
  {
    quote: "Pegasus is founder-led and accountability stays close to decision-making from intake through delivery.",
    author: "Founder-Led Accountability",
    role: "Operating Principle",
    location: null,
    initials: "FA",
  },
];

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function OperatingPrinciplesSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const testimonials = defaultTestimonials;

  // Auto-advance carousel
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, testimonials.length]);

  return (
    <section id="testimonials" className="py-32 lg:py-40 bg-card relative overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-champagne/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/3 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold mb-4">
            {isEditMode ? (
              <EditableText contentKey="home.testimonials.kicker" fallback="Operating Principles" />
            ) : (getValue("home.testimonials.kicker") || "Operating Principles")}
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-[-0.02em]" data-testid="text-testimonials-title">
            {isEditMode ? (
              <EditableText contentKey="home.testimonials.title" fallback="Discipline Before Scale" />
            ) : (getValue("home.testimonials.title") || "Discipline Before Scale")}
          </h2>
          <div className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {isEditMode ? (
              <EditableText contentKey="home.testimonials.description" fallback="The standards guiding Pegasus Dreamscapes as we build, invest, and systemize real estate execution." as="p" multiline />
            ) : (
              <p>{getValue("home.testimonials.description") || "The standards guiding Pegasus Dreamscapes as we build, invest, and systemize real estate execution."}</p>
            )}
          </div>
        </ScrollReveal>

        {/* Testimonials Carousel */}
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main carousel container */}
          <div className="overflow-hidden">
            <motion.div 
              className="flex"
              animate={{ x: `-${currentSlide * 100}%` }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="w-full flex-shrink-0 px-4"
                >
                  <motion.div 
                    className="max-w-3xl mx-auto p-10 lg:p-14 bg-background rounded-2xl border border-border/50 relative"
                    data-testid={`testimonial-card-${index}`}
                  >
                    {/* Large quote icon */}
                    <div className="absolute -top-5 left-10 w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                      <Quote className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <p className="text-foreground leading-relaxed text-lg lg:text-xl text-center italic mb-10">
                      "{testimonial.quote}"
                    </p>
                    
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold">
                        {testimonial.initials}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground text-lg">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role} · {testimonial.location}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Carousel dots */}
          <div className="flex justify-center gap-2 mt-10">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'w-8 bg-primary' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                data-testid={`button-testimonial-dot-${index}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300 shadow-lg"
            onClick={() => setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            data-testid="button-testimonial-prev"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300 shadow-lg"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % testimonials.length)}
            data-testid="button-testimonial-next"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Trust badges - enhanced styling */}
        <ScrollReveal className="mt-24" delay={0.3}>
          <div className="bg-muted/30 rounded-2xl p-8 lg:p-12">
            <div className="text-center text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium mb-10">
              {isEditMode ? (
                <EditableText contentKey="home.whyChooseUs.title" fallback="Why Choose Us" />
              ) : (getValue("home.whyChooseUs.title") || "Why Choose Us")}
            </div>
            <div className="grid sm:grid-cols-3 gap-8 lg:gap-12">
              <motion.div 
                className="flex items-center gap-5"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-base">
                    {isEditMode ? (
                      <EditableText contentKey="home.whyChooseUs.0.title" fallback="Compliance-Aware Operations" />
                    ) : (getValue("home.whyChooseUs.0.title") || "Compliance-Aware Operations")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isEditMode ? (
                      <EditableText contentKey="home.whyChooseUs.0.description" fallback="Licensing handled per applicable requirements" />
                    ) : (getValue("home.whyChooseUs.0.description") || "Licensing handled per applicable requirements")}
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center gap-5"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-base">
                    {isEditMode ? (
                      <EditableText contentKey="home.whyChooseUs.1.title" fallback="Disciplined operations" />
                    ) : (getValue("home.whyChooseUs.1.title") || "Disciplined operations")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isEditMode ? (
                      <EditableText contentKey="home.whyChooseUs.1.description" fallback="Built for long-term value" />
                    ) : (getValue("home.whyChooseUs.1.description") || "Built for long-term value")}
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center gap-5"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-14 h-14 rounded-xl bg-tan/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-tan" />
                </div>
                <div>
                  <div className="font-semibold text-base">
                    {isEditMode ? (
                      <EditableText contentKey="home.whyChooseUs.2.title" fallback="Disciplined Partner Network" />
                    ) : (getValue("home.whyChooseUs.2.title") || "Disciplined Partner Network")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isEditMode ? (
                      <EditableText contentKey="home.whyChooseUs.2.description" fallback="Execution Focus" />
                    ) : (getValue("home.whyChooseUs.2.description") || "Execution Focus")}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function HeroSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const heroKicker = getValue("home.hero.kicker", "Development • Investments • Systems");
  const heroLine1 = getValue("home.hero.line1", "Dream it.");
  const heroLine2 = getValue("home.hero.line2", "Build it.");
  const heroLine3 = getValue("home.hero.line3", "Live it.");
  const heroSubheadline = getValue("home.hero.subheadline", "Pegasus Dreamscapes is a real estate development, investment, and systems company built to source opportunities, structure deals, manage execution, and create long-term value.");
  const heroCtaPrimary = getValue("home.hero.cta_primary", "Submit a Property");
  const heroCtaSecondary = getValue("home.hero.cta_secondary", "Explore MarketFlow");
  
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Full-bleed background image with parallax effect */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url(${heroImage})` }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      />
      
      {/* Premium cinematic overlay - luxury gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      
      {/* Enhanced animated gradient orbs */}
      <div className="absolute inset-0 opacity-40 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-champagne/25 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 30, 0],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 right-1/3 w-48 h-48 bg-tan/15 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/3 w-32 h-32 bg-white/10 rounded-full blur-2xl"
          animate={{ 
            y: [0, -50, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
      
      {/* Content - centered for more impact */}
      <div className="relative z-10 w-full py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            {/* Luxury kicker with decorative line */}
            <motion.div 
              className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-champagne" />
              {isEditMode ? (
                <EditableText 
                  contentKey="home.hero.kicker" 
                  fallback="Development • Investments • Systems"
                  className="text-sm uppercase tracking-[0.3em] text-white/70 font-medium"
                />
              ) : (
                <p className="text-sm uppercase tracking-[0.3em] text-white/70 font-medium" data-testid="text-hero-kicker">
                  {heroKicker}
                </p>
              )}
            </motion.div>
            
            {/* Premium headline with refined typography */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.85] mb-10 tracking-[-0.03em] text-white" data-testid="text-hero-headline">
              <motion.span 
                className="block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                {isEditMode ? (
                  <EditableText contentKey="home.hero.line1" fallback="Real estate execution," />
                ) : heroLine1}
              </motion.span>
              <motion.span 
                className="block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                {isEditMode ? (
                  <EditableText contentKey="home.hero.line2" fallback="built with" />
                ) : heroLine2}
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
              >
                {isEditMode ? (
                  <EditableText contentKey="home.hero.line3" fallback="discipline." />
                ) : heroLine3}
              </motion.span>
            </h1>
            
            {/* Refined subheadline with better spacing */}
            <motion.div 
              className="text-lg sm:text-xl text-white/75 max-w-2xl mb-14 leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              data-testid="text-hero-subheadline"
            >
              {isEditMode ? (
                <EditableText 
                  contentKey="home.hero.subheadline" 
                  fallback="Pegasus Dreamscapes is a real estate development, investment, and systems company built to source opportunities, structure deals, manage execution, and create long-term value."
                  multiline
                />
              ) : (
                <p>{heroSubheadline}</p>
              )}
            </motion.div>
            
            {/* Premium CTAs with enhanced styling */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <a href="/sell">
                <Button size="lg" className="text-sm uppercase tracking-[0.15em] px-10 py-7 w-full sm:w-auto bg-white text-slate-900 hover:bg-white/95 font-semibold shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-white/20 hover:-translate-y-0.5" data-testid="button-hero-sell">
                  {isEditMode ? (
                    <EditableText contentKey="home.hero.cta_primary" fallback="Submit a Property" />
                  ) : heroCtaPrimary}
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </a>
              <Link href="/marketflow">
                <Button size="lg" variant="outline" className="text-sm uppercase tracking-[0.15em] px-10 py-7 w-full sm:w-auto border-white/30 text-white hover:bg-white/10 backdrop-blur-md font-semibold transition-all duration-300 hover:-translate-y-0.5" data-testid="button-hero-invest">
                  {isEditMode ? (
                    <EditableText contentKey="home.hero.cta_secondary" fallback="Explore MarketFlow" />
                  ) : heroCtaSecondary}
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <p className="mt-5 text-sm text-white/70" data-testid="text-hero-support-line">
              Built in the East Bay. Designed for disciplined real estate execution.
            </p>

            {/* Quick stats preview */}
            <motion.div 
              className="mt-20 pt-10 border-t border-white/10 flex flex-wrap gap-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              data-testid="hero-stats-preview"
            >
              <div data-testid="hero-stat-roots">
                <p className="text-3xl font-bold text-white">East Bay</p>
                <p className="text-sm text-white/50 uppercase tracking-wider">Local Roots</p>
              </div>
              <div data-testid="hero-stat-led">
                <p className="text-3xl font-bold text-white">Founder-Led</p>
                <p className="text-sm text-white/50 uppercase tracking-wider">Execution First</p>
              </div>
              <div data-testid="hero-stat-beta">
                <p className="text-3xl font-bold text-white">Beta</p>
                <p className="text-sm text-white/50 uppercase tracking-wider">MarketFlow Active</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Premium accent bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-tan to-champagne" />
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <motion.div 
            className="w-1.5 h-3 bg-white/50 rounded-full"
            animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

function ServicesSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const services = [
    {
      image: serviceImage1,
      title: "Property Investment Consultation",
      description: "Strategic guidance for real estate investments. We analyze opportunities, evaluate risks, and provide expert consultation to help you make informed decisions.",
      cta: "Book Consultation",
      ctaLink: "#contact",
      accent: "Personalized Strategy",
      key: "service.0",
    },
    {
      image: serviceImage2,
      title: "Home Valuation",
      description: "Get an accurate assessment of your property's value. Our comprehensive valuation considers market conditions, comparable sales, and property condition.",
      cta: "Request Valuation",
      ctaLink: "#sell",
      accent: "Free Assessment",
      key: "service.1",
    },
  ];

  return (
    <section id="services" className="py-32 lg:py-40 bg-muted/30 scroll-mt-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-champagne/10 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="mb-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
              {isEditMode ? (
                <EditableText contentKey="home.services.kicker" fallback="What We Offer" />
              ) : (getValue("home.services.kicker") || "What We Offer")}
            </p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.02em]" data-testid="text-services-title">
            {isEditMode ? (
              <EditableText contentKey="home.services.title" fallback="Premium Services" />
            ) : (getValue("home.services.title") || "Premium Services")}
          </h2>
          <div className="mt-6 text-lg text-muted-foreground max-w-2xl">
            {isEditMode ? (
              <EditableText contentKey="home.services.description" fallback="Expert guidance and valuation services to help you make informed real estate decisions." as="p" multiline />
            ) : (
              <p>{getValue("home.services.description") || "Expert guidance and valuation services to help you make informed real estate decisions."}</p>
            )}
          </div>
        </ScrollReveal>

        <div className="space-y-8">
          {services.map((service, index) => {
            const displayTitle = getValue(`home.${service.key}.title`) || service.title;
            const displayDesc = getValue(`home.${service.key}.description`) || service.description;
            const displayCta = getValue(`home.${service.key}.cta`) || service.cta;
            const displayAccent = getValue(`home.${service.key}.accent`) || service.accent;
            
            return (
              <ScrollReveal key={index} delay={index * 0.2} direction={index % 2 === 0 ? "left" : "right"}>
                <motion.div 
                  className={`grid lg:grid-cols-2 gap-0 bg-card rounded-lg overflow-hidden border border-border/50 shadow-sm ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}
                  data-testid={`card-service-${index}`}
                  whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12)" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`aspect-[4/3] lg:aspect-auto relative overflow-hidden group ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                    <motion.img 
                      src={service.image} 
                      alt={displayTitle}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Overlay with accent badge */}
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold uppercase tracking-wider rounded-md shadow-sm">
                        {isEditMode ? (
                          <EditableText contentKey={`home.${service.key}.accent`} fallback={service.accent} />
                        ) : displayAccent}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`p-10 lg:p-14 flex flex-col justify-center ${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                    <h3 className="font-serif text-2xl sm:text-3xl font-semibold mb-5 tracking-tight">
                      {isEditMode ? (
                        <EditableText contentKey={`home.${service.key}.title`} fallback={service.title} />
                      ) : displayTitle}
                    </h3>
                    <div className="text-muted-foreground text-base leading-relaxed mb-10">
                      {isEditMode ? (
                        <EditableText contentKey={`home.${service.key}.description`} fallback={service.description} as="p" multiline />
                      ) : <p>{displayDesc}</p>}
                    </div>
                    <div>
                      <a href={service.ctaLink}>
                        <Button size="lg" className="px-8 text-sm uppercase tracking-[0.12em] font-semibold">
                          {isEditMode ? (
                            <EditableText contentKey={`home.${service.key}.cta`} fallback={service.cta} />
                          ) : displayCta}
                          <ArrowRight className="ml-3 w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal className="mt-28" delay={0.2}>
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold mb-4">Investment Strategies</p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">How We Create Value</h3>
          </div>
          <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {[
              { icon: HomeIcon, title: "Fix & Flip", desc: "Transform distressed properties into profitable assets" },
              { icon: TrendingUp, title: "Buy & Hold", desc: "Build wealth through strategic rental investments" },
              { icon: Palette, title: "Design & Reno", desc: "Full-service renovation and design management" },
              { icon: Building, title: "New Construction", desc: "Ground-up development coming soon", comingSoon: true },
            ].map((item, index) => (
              <StaggerItem key={index}>
                <motion.div 
                  className={`p-8 bg-card rounded-lg border border-border/50 h-full transition-all duration-300 ${item.comingSoon ? 'opacity-70' : ''}`}
                  whileHover={!item.comingSoon ? { y: -6, boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.1)" } : {}}
                >
                  <motion.div 
                    className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 ${item.comingSoon ? 'bg-muted' : 'bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10'}`}
                    whileHover={!item.comingSoon ? { scale: 1.05 } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <item.icon className={`w-6 h-6 ${item.comingSoon ? 'text-muted-foreground' : 'text-primary'}`} />
                  </motion.div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <h4 className="font-serif font-semibold text-lg">{item.title}</h4>
                    {item.comingSoon && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </ScrollReveal>
      </div>
    </section>
  );
}

function FeaturedProjectSection() {
  return (
    <section id="projects" className="py-32 lg:py-40 bg-stone scroll-mt-24">
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
                loading="lazy"
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
  const { isEditMode } = useEditMode();
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
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const unifiedLead: Partial<InsertLead> = {
        leadType: 'seller',
        source: 'sell_page',
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        address: data.propertyAddress,
        leadData: {
          condition: data.condition,
          timeline: data.timeline,
          propertyType: "Single Family",
        },
      };
      
      return apiRequest("POST", "/api/leads", unifiedLead);
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
    <section id="sell" className="py-32 lg:py-40 bg-background scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">
              {isEditMode ? (
                <EditableText contentKey="home.sell.kicker" fallback="For Sellers" />
              ) : "For Sellers"}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 tracking-[-0.02em]" data-testid="text-sell-title">
              {isEditMode ? (
                <EditableText contentKey="home.sell.title" fallback="Sell Your Property" />
              ) : "Sell Your Property"}
            </h2>
            <div className="text-base text-muted-foreground leading-relaxed mb-10">
              {isEditMode ? (
                <EditableText 
                  contentKey="home.sell.description" 
                  fallback="We review property submissions across the East Bay and surrounding areas. Submit your property for a confidential review — no obligations, no pressure."
                  multiline
                  as="p"
                />
              ) : (
                <p>We review property submissions across the East Bay and surrounding areas. Submit your property for a confidential review — no obligations, no pressure.</p>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Serious Review</h4>
                  <p className="text-sm text-muted-foreground">Every submission is evaluated with real market data</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">As-Is Consideration</h4>
                  <p className="text-sm text-muted-foreground">We review properties in their current condition</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Flexible Timelines</h4>
                  <p className="text-sm text-muted-foreground">We work around your schedule and situation</p>
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
                            <Input type="tel" placeholder="Your best callback number" {...field} data-testid="input-sell-phone" />
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
  const { isEditMode } = useEditMode();
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
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const unifiedLead: Partial<InsertLead> = {
        leadType: 'investor',
        source: 'invest_page',
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        leadData: {
          capitalRange: data.capitalRange,
          investmentPreference: data.investmentPreference,
        },
      };
      
      return apiRequest("POST", "/api/leads", unifiedLead);
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
    <section id="invest" className="py-32 lg:py-40 bg-stone scroll-mt-24">
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
                            <Input type="tel" placeholder="Your best callback number" {...field} data-testid="input-invest-phone" />
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
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">
              {isEditMode ? (
                <EditableText contentKey="home.invest.kicker" fallback="For Investors" />
              ) : "For Investors"}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 tracking-[-0.02em]" data-testid="text-invest-title">
              {isEditMode ? (
                <EditableText contentKey="home.invest.title" fallback="Partner With Pegasus" />
              ) : "Partner With Pegasus"}
            </h2>
            <div className="text-base text-muted-foreground leading-relaxed mb-10">
              {isEditMode ? (
                <EditableText 
                  contentKey="home.invest.description" 
                  fallback="Private partner conversations are available for aligned operators and investors. Every opportunity is subject to diligence, documentation, legal review, and suitability."
                  multiline
                  as="p"
                />
              ) : (
                <p>Private partner conversations are available for aligned operators and investors. Every opportunity is subject to diligence, documentation, legal review, and suitability.</p>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Disciplined Analysis</h4>
                  <p className="text-sm text-muted-foreground">Clear underwriting and execution planning on every opportunity</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Transparent Underwriting</h4>
                  <p className="text-sm text-muted-foreground">Transparent process and documentation standards</p>
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

function InvestmentPhilosophySection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const principles = [
    {
      number: "01",
      title: "Disciplined Analysis",
      description: "Every property undergoes rigorous underwriting. We evaluate market dynamics, renovation costs, and exit strategies before committing capital.",
      icon: Target,
      key: "philosophy.principle.0",
    },
    {
      number: "02", 
      title: "Transparent Partnership",
      description: "Full visibility into deal structures, regular updates, and clear communication. Our partners always know exactly where their investment stands.",
      icon: Users,
      key: "philosophy.principle.1",
    },
    {
      number: "03",
      title: "Community-Centered Design",
      description: "We don't just renovate properties—we elevate neighborhoods. Every project considers its impact on the surrounding community.",
      icon: Heart,
      key: "philosophy.principle.2",
    },
    {
      number: "04",
      title: "Sustainable Returns",
      description: "We balance aggressive opportunity pursuit with risk management. Our goal is consistent, long-term wealth building—not quick wins.",
      icon: TrendingUp,
      key: "philosophy.principle.3",
    },
  ];

  return (
    <section id="philosophy" className="py-32 lg:py-40 bg-gradient-to-b from-background to-muted/10 scroll-mt-24 relative overflow-hidden">
      {/* Section divider at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left column - Header content */}
          <ScrollReveal className="lg:sticky lg:top-32">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                {isEditMode ? (
                  <EditableText contentKey="home.philosophy.kicker" fallback="Our Approach" />
                ) : (getValue("home.philosophy.kicker") || "Our Approach")}
              </p>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 tracking-[-0.02em]" data-testid="text-philosophy-title">
              {isEditMode ? (
                <EditableText contentKey="home.philosophy.title" fallback="Investment Philosophy" />
              ) : (getValue("home.philosophy.title") || "Investment Philosophy")}
            </h2>
            <div className="text-lg text-muted-foreground leading-relaxed mb-10">
              {isEditMode ? (
                <EditableText contentKey="home.philosophy.description" fallback="We believe successful real estate investing requires more than capital—it demands discipline, transparency, and a commitment to creating lasting value for all stakeholders." as="p" multiline />
              ) : (
                <p>{getValue("home.philosophy.description") || "We believe successful real estate investing requires more than capital—it demands discipline, transparency, and a commitment to creating lasting value for all stakeholders."}</p>
              )}
            </div>
            
            {/* Mission statement card */}
            <div className="p-8 bg-card rounded-lg border border-border/50 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Quote className="w-4 h-4 text-primary" />
              </div>
              <div className="text-base text-foreground leading-relaxed italic">
                {isEditMode ? (
                  <EditableText contentKey="home.philosophy.quote" fallback="We design profits with intention—creating win–win outcomes for sellers, investors, and the communities we serve." as="p" multiline />
                ) : (
                  <p>"{getValue("home.philosophy.quote") || "We design profits with intention—creating win–win outcomes for sellers, investors, and the communities we serve."}"</p>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-4">— Pegasus Dreamscapes</p>
            </div>
          </ScrollReveal>

          {/* Right column - Principles */}
          <StaggerChildren className="space-y-6" staggerDelay={0.1}>
            {principles.map((principle, index) => (
              <StaggerItem key={index}>
                <motion.div 
                  className="group p-6 lg:p-8 bg-card rounded-lg border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
                  data-testid={`philosophy-principle-${index}`}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0">
                      <span className="text-4xl font-serif font-bold text-primary/20 group-hover:text-primary/40 transition-colors">{principle.number}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-md transition-all duration-300">
                          <principle.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                        </div>
                        <h3 className="text-xl font-semibold">{principle.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{principle.description}</p>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const steps = [
    {
      number: "01",
      title: "Explore Opportunities",
      description: "Browse our curated marketplace of wholesale deals, capital raises, and listings. Use AI-powered matching to find deals that align with your investment goals.",
      icon: Search,
      key: "howitworks.step.0",
    },
    {
      number: "02",
      title: "Due Diligence",
      description: "Access comprehensive property data, financials, and market analysis. Our team provides transparent underwriting on every opportunity.",
      icon: FileCheck,
      key: "howitworks.step.1",
    },
    {
      number: "03",
      title: "Make Your Move",
      description: "Submit offers, negotiate terms, or commit capital directly through our platform. Real-time updates keep you informed every step of the way.",
      icon: Handshake,
      key: "howitworks.step.2",
    },
    {
      number: "04",
      title: "Close & Grow",
      description: "Complete transactions with our streamlined closing process. Track your portfolio performance and reinvest in new opportunities.",
      icon: Key,
      key: "howitworks.step.3",
    },
  ];

  return (
    <section id="how-it-works" className="py-32 lg:py-40 bg-stone scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-20">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
              {isEditMode ? (
                <EditableText contentKey="home.howitworks.kicker" fallback="The Process" />
              ) : (getValue("home.howitworks.kicker") || "The Process")}
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-6 tracking-[-0.02em]" data-testid="text-how-it-works-title">
            {isEditMode ? (
              <EditableText contentKey="home.howitworks.title" fallback="How It Works" />
            ) : (getValue("home.howitworks.title") || "How It Works")}
          </h2>
          <div className="text-lg text-muted-foreground leading-relaxed">
            {isEditMode ? (
              <EditableText contentKey="home.howitworks.description" fallback="From discovery to closing, our platform streamlines the entire investment process. Here's how to get started." as="p" multiline />
            ) : (
              <p>{getValue("home.howitworks.description") || "From discovery to closing, our platform streamlines the entire investment process. Here's how to get started."}</p>
            )}
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />
          
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.15}>
            {steps.map((step, index) => (
              <StaggerItem key={index}>
                <motion.div 
                  className="group relative bg-card p-8 rounded-lg border border-border/50 hover:border-primary/20 hover:shadow-xl transition-all duration-300 h-full"
                  data-testid={`how-it-works-step-${index}`}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step number badge */}
                  <div className="absolute -top-4 left-8 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    Step {step.number}
                  </div>
                  
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:shadow-lg transition-all duration-300 mt-2">
                    <step.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
                  
                  {/* Arrow indicator on larger screens */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-background border border-border rounded-full items-center justify-center z-10">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>

        <ScrollReveal delay={0.4} className="text-center mt-16">
          <Link href="/marketflow">
            <Button size="lg" className="text-sm uppercase tracking-widest font-medium group" data-testid="button-explore-marketplace">
              Explore MarketFlow
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

function TrustLogosSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const trustItems = [
    { icon: Building, label: "East Bay Roots", description: "Founded and operating locally", key: "trust.0" },
    { icon: Shield, label: "Founder-Led", description: "Accountable from intake to exit", key: "trust.1" },
    { icon: Layers, label: "Three Pillars", description: "Development · Investments · Systems", key: "trust.2" },
    { icon: Sparkles, label: "MarketFlow Beta", description: "Deal-flow platform in development", key: "trust.3" },
  ];

  return (
    <section className="py-16 bg-muted/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {trustItems.map((item, index) => {
            const displayLabel = getValue(`home.${item.key}.label`) || item.label;
            const displayDesc = getValue(`home.${item.key}.description`) || item.description;
            
            return (
              <motion.div 
                key={index}
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                data-testid={`trust-item-${index}`}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    {isEditMode ? (
                      <EditableText contentKey={`home.${item.key}.label`} fallback={item.label} />
                    ) : displayLabel}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isEditMode ? (
                      <EditableText contentKey={`home.${item.key}.description`} fallback={item.description} />
                    ) : displayDesc}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CommunityImpactSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const impactStats: { value: string; label: string; key: string }[] = [];

  const values = [
    {
      icon: Target,
      title: "Discipline Before Scale",
      description: "We prioritize process quality, underwriting discipline, and execution standards before chasing growth metrics.",
      key: "community.value.0",
    },
    {
      icon: Shield,
      title: "Clear Numbers, Clear Process",
      description: "Every opportunity is reviewed with clear numbers, assumptions, and next-step documentation — no black boxes.",
      key: "community.value.1",
    },
    {
      icon: Building,
      title: "Built for Long-Term Value",
      description: "We focus on durable value creation through disciplined project planning and accountable execution.",
      key: "community.value.2",
    },
    {
      icon: Users,
      title: "Founder-Led Accountability",
      description: "Pegasus is founder-led and accountability stays close to decision-making — from intake through delivery.",
      key: "community.value.3",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-champagne/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              {isEditMode ? (
                <EditableText contentKey="home.community.kicker" fallback="How We Operate" />
              ) : (getValue("home.community.kicker") || "Our Commitment")}
            </span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-[-0.02em]" data-testid="text-community-title">
            {isEditMode ? (
              <EditableText contentKey="home.community.title" fallback="How We Approach Real Estate" />
            ) : (getValue("home.community.title") || "The Dreamscaper Creed")}
          </h2>
          <div className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {isEditMode ? (
              <EditableText contentKey="home.community.description" fallback="Every project, partnership, and system we build is guided by the same principles: discipline over speed, clarity over hype, and long-term value over short-term gains." as="p" multiline />
            ) : (
              <p>{getValue("home.community.description") || "Every project, partnership, and system we build is guided by the same principles: discipline over speed, clarity over hype, and long-term value over short-term gains."}</p>
            )}
          </div>
        </ScrollReveal>

        {/* Impact stats */}
        <ScrollReveal delay={0.2} className="mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 bg-card rounded-lg border border-border/50"
                whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.3 }}
                data-testid={`community-stat-${index}`}
              >
                <p className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Core values */}
        <StaggerChildren className="grid md:grid-cols-2 gap-6" staggerDelay={0.1}>
          {values.map((value, index) => (
            <StaggerItem key={index}>
              <motion.div 
                className="flex gap-5 p-6 bg-card rounded-lg border border-border/50 h-full"
                whileHover={{ y: -4, borderColor: "rgba(var(--primary), 0.2)" }}
                transition={{ duration: 0.3 }}
                data-testid={`community-value-${index}`}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <value.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* CTA */}
        <ScrollReveal delay={0.4} className="text-center mt-16">
          <p className="text-muted-foreground mb-6">Want to work with Pegasus Dreamscapes?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/marketflow-beta">
              <Button size="lg" className="group" data-testid="button-community-explore">
                Explore MarketFlow Beta
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" data-testid="button-community-contact">
                Contact Us
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  isActive: boolean;
}

const defaultFaqs = [
  {
    question: "What does Pegasus Dreamscapes do?",
    answer: "Pegasus Dreamscapes is a real estate development, investment, and systems company. We source opportunities, structure deals, manage project execution, and build the operational tools that support this work — including MarketFlow, our deal-flow platform currently in private beta."
  },
  {
    question: "How does MarketFlow work?",
    answer: "MarketFlow is the deal-flow layer of Pegasus Systems. It's currently in invitation-only private beta. Wholesalers can submit deals, operators can review and underwrite, and partners can track activity across lanes. If you'd like to request access, reach out through our contact page."
  },
  {
    question: "Can I submit a property for review?",
    answer: "Yes. We review property submissions in the East Bay and surrounding areas. You can submit directly through our site or contact us to start a conversation. Every submission is reviewed seriously — we follow up on opportunities that fit our acquisition criteria."
  },
  {
    question: "What types of properties does Pegasus focus on?",
    answer: "We focus on residential and small multifamily opportunities in the East Bay and broader Bay Area. Single-family, duplex, small multifamily, and value-add projects where disciplined renovation and execution can create real long-term value."
  },
  {
    question: "How do capital partnerships work at Pegasus?",
    answer: "Capital partnerships at Pegasus are private, deal-specific, and subject to diligence, documentation, legal review, and suitability. We don't offer or solicit public securities. If you're interested in exploring a partnership conversation, contact us directly."
  },
  {
    question: "How is Pegasus Dreamscapes structured?",
    answer: "Pegasus operates across three divisions: Development (project execution and renovation), Investments (deal structuring and capital partnerships), and Systems (the internal product organization, including MarketFlow). The company is founder-led and intentionally focused on disciplined, accountable execution."
  },
];

function FAQSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const { data: cmsFaqs = [] } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
  });
  
  const faqs = cmsFaqs.length > 0 
    ? cmsFaqs.filter(f => f.isActive).sort((a, b) => a.order - b.order).map(f => ({ question: f.question, answer: f.answer }))
    : defaultFaqs;

  return (
    <section className="py-24 lg:py-32 bg-background relative">
      {/* Section divider at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {isEditMode ? (
                <EditableText contentKey="home.faq.kicker" fallback="Common Questions" />
              ) : (getValue("home.faq.kicker") || "Common Questions")}
            </span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-[-0.02em]" data-testid="text-faq-title">
            {isEditMode ? (
              <EditableText contentKey="home.faq.title" fallback="Frequently Asked Questions" />
            ) : (getValue("home.faq.title") || "Frequently Asked Questions")}
          </h2>
          <div className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {isEditMode ? (
              <EditableText contentKey="home.faq.description" fallback="Find answers to common questions about our investment process, deal flow, and how we can help you achieve your real estate goals." as="p" multiline />
            ) : (
              <p>{getValue("home.faq.description") || "Find answers to common questions about our investment process, deal flow, and how we can help you achieve your real estate goals."}</p>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <Accordion type="single" collapsible className="space-y-4" data-testid="accordion-faq">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border/50 rounded-lg px-6 data-[state=open]:border-primary/30 transition-colors"
                data-testid={`faq-item-${index}`}
              >
                <AccordionTrigger className="text-left font-semibold text-base py-5 hover:no-underline hover:text-primary transition-colors" data-testid={`button-faq-trigger-${index}`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5" data-testid={`text-faq-answer-${index}`}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>

        <ScrollReveal delay={0.4} className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <Link href="#contact">
            <Button variant="outline" className="group" data-testid="button-faq-contact">
              Contact Our Team
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </ScrollReveal>
      </div>
      
      {/* Section divider at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

function NewsletterSection() {
  const { toast } = useToast();
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof newsletterSchema>) => {
      const unifiedLead: Partial<InsertLead> = {
        leadType: 'newsletter',
        source: 'newsletter_signup',
        email: data.email,
        firstName: '',
        lastName: '',
      };
      return apiRequest("POST", "/api/leads", unifiedLead);
    },
    onSuccess: () => {
      toast({
        title: "You're in!",
        description: "You'll receive our latest deals and insights.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof newsletterSchema>) => {
    mutation.mutate(data);
  };

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-champagne/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-champagne/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center relative">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {isEditMode ? (
                <EditableText contentKey="home.newsletter.kicker" fallback="Stay Ahead" />
              ) : (getValue("home.newsletter.kicker") || "Stay Ahead")}
            </span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-[-0.02em]" data-testid="text-newsletter-title">
            {isEditMode ? (
              <EditableText contentKey="home.newsletter.title" fallback="Get Exclusive Deal Alerts" />
            ) : (getValue("home.newsletter.title") || "Get Exclusive Deal Alerts")}
          </h2>
          <div className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            {isEditMode ? (
              <EditableText contentKey="home.newsletter.description" fallback="Be the first to know about new investment opportunities. Join our newsletter for market insights, featured deals, and expert tips." as="p" multiline />
            ) : (
              <p>{getValue("home.newsletter.description") || "Be the first to know about new investment opportunities. Join our newsletter for market insights, featured deals, and expert tips."}</p>
            )}
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="h-12 px-5 bg-card border-border/50"
                        {...field} 
                        data-testid="input-newsletter-email" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                size="lg" 
                className="h-12 px-8 text-sm uppercase tracking-widest font-medium group whitespace-nowrap" 
                disabled={mutation.isPending}
                data-testid="button-newsletter-submit"
              >
                {mutation.isPending ? "Subscribing..." : (
                  <>
                    Subscribe
                    <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </Form>
          
          <p className="text-xs text-muted-foreground mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </ScrollReveal>
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
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
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
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const unifiedLead: Partial<InsertLead> = {
        leadType: 'contact',
        source: 'contact_page',
        firstName,
        lastName,
        email: data.email,
        phone: data.phone || undefined,
        leadData: {
          message: data.message,
        },
        notes: data.message,
      };
      
      return apiRequest("POST", "/api/leads", unifiedLead);
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
    <section id="contact" className="py-32 lg:py-40 bg-muted/20 scroll-mt-24 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-primary/3 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                {isEditMode ? (
                  <EditableText contentKey="home.contact.kicker" fallback="Get In Touch" />
                ) : (getValue("home.contact.kicker") || "Get In Touch")}
              </p>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-8 tracking-[-0.02em]" data-testid="text-contact-title">
              {isEditMode ? (
                <EditableText contentKey="home.contact.title" fallback="Let's Connect" />
              ) : (getValue("home.contact.title") || "Let's Connect")}
            </h2>
            <div className="text-lg text-muted-foreground leading-relaxed mb-12">
              {isEditMode ? (
                <EditableText contentKey="home.contact.description" fallback="Ready to talk about a property, potential partnership, or have questions about what we do? We'd love to hear from you." as="p" multiline />
              ) : (
                <p>{getValue("home.contact.description") || "Ready to talk about a property, potential partnership, or have questions about what we do? We'd love to hear from you."}</p>
              )}
            </div>
            
            <div className="space-y-6">
                            <motion.a 
                href={`mailto:${(getValue("home.contact.email") || "hello@pegasusdreamscapes.com").trim()}`}
                className="flex items-center gap-5 p-4 rounded-lg hover:bg-card transition-colors duration-200 group"
                whileHover={{ x: 4 }}
                data-testid="link-contact-email"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-lg transition-all duration-300">
                  <Mail className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Email</p>
                  <div className="font-semibold text-lg">
                    {isEditMode ? (
                      <EditableText contentKey="home.contact.email" fallback="hello@pegasusdreamscapes.com" />
                    ) : (getValue("home.contact.email") || "hello@pegasusdreamscapes.com")}
                  </div>
                </div>
              </motion.a>
              <motion.div 
                className="flex items-center gap-5 p-4 rounded-lg"
                whileHover={{ x: 4 }}
                data-testid="text-contact-location"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Location</p>
                  <div className="font-semibold text-lg">
                    {isEditMode ? (
                      <EditableText contentKey="home.contact.location" fallback="Bay Area, California" />
                    ) : (getValue("home.contact.location") || "Bay Area, California")}
                  </div>
                </div>
              </motion.div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="p-8 lg:p-10 bg-card rounded-lg border border-border/50 shadow-sm">
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
                            <Input type="tel" placeholder="Your best callback number" {...field} data-testid="input-contact-phone" />
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
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
