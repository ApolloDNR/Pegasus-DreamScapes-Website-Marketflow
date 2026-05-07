import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import { insertSellerLeadSchema, type InsertSellerLead, type InsertLead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import {
  MessageSquare,
  Search,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Building,
  Handshake,
  Users,
  TrendingUp,
  Shield,
  Clock,
  FileCheck,
} from "lucide-react";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import heroImage from "@assets/generated_images/luxury_home_at_dusk_with_warm_lighting.png";

const sellerFormSchema = insertSellerLeadSchema.extend({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  propertyAddress: z.string().min(5, "Please enter the property address"),
});

export default function Sell() {
  useSEO({
    title: "Submit a Property — Pegasus Dreamscapes",
    description: "Strategy-first review for your property. Every property gets a path — wholesale, acquisition, JV, listing, or referral.",
  });

  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <OutcomeRoutingSection />
      <MarketFlowConnectionSection />
      <LeadFormSection />
      <OperatorSection />
      <FAQSection />
    </div>
  );
}

function MarketFlowConnectionSection() {
  return (
    <section className="py-20 lg:py-24 bg-background border-y border-border/40">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold font-supporting">Where it might land</p>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em]">
              Your property may end up in MarketFlow.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-base text-muted-foreground leading-relaxed mb-6">
              MarketFlow is our private, invite-only deal-flow network. When wholesale or JV is the right lane, your property is matched to vetted buyers and operators inside that network — never blasted to a public list, never shopped on social media.
            </p>
            <Link href="/marketflow">
              <Button variant="outline" className="text-sm uppercase tracking-[0.15em] font-semibold px-7 py-6" data-testid="button-sell-marketflow">
                See how MarketFlow works
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function OperatorSection() {
  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold font-supporting mb-5">Operated by</p>
        <p className="font-display text-2xl sm:text-3xl uppercase tracking-[0.16em] mb-3" data-testid="text-sell-operator">
          Paolo &ldquo;Apollo&rdquo; Duran
        </p>
        <div className="brand-divider w-32 mx-auto mb-5" />
        <p className="text-sm text-muted-foreground italic font-serif">
          Founder &amp; Principal · Pegasus Dreamscapes Corp
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-6 max-w-xl mx-auto">
          A real person reviews every submission. Direct line: <a href="tel:+19259486566" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-sell-phone">925-948-6566</a> · <a href="mailto:apollo@pegasusdreamscapes.com" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-sell-email">apollo@pegasusdreamscapes.com</a>
        </p>
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden pt-20">
      <motion.div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${heroImage})` }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/65 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

      <div className="relative z-10 w-full py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-champagne" />
              <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/70 font-medium">
                Submit a Property · Strategy Review
              </p>
            </motion.div>

            <motion.h1
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[0.95] tracking-[-0.02em] mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              data-testid="text-sell-hero"
            >
              Every property<br />
              <span className="bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">gets a path.</span>
            </motion.h1>

            <motion.p
              className="font-serif text-lg sm:text-xl text-white/80 italic max-w-2xl mb-4 leading-snug"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
            >
              Where others see impossible, we see a path.
            </motion.p>

            <motion.p
              className="text-base sm:text-lg text-white/70 max-w-2xl mb-10 leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Submit your property and we'll review the situation — type, condition, motivation, and timeline — then route it to the cleanest economic path. Acquisition, wholesale, JV, listing, or honest referral. No lead dies.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
            >
              <Button
                size="lg"
                className="text-sm uppercase tracking-[0.15em] px-10 py-7 bg-white text-slate-900 hover:bg-white/95 font-semibold shadow-2xl shadow-black/20"
                onClick={() => document.getElementById('seller-form')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-request-offer"
              >
                Submit Your Property
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
              <a href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-sm uppercase tracking-[0.15em] px-10 py-7 border-white/30 text-white hover:bg-white/10 backdrop-blur-md font-semibold"
                >
                  How It Works
                </Button>
              </a>
            </motion.div>
          </div>

          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-black/50 via-black/30 to-transparent blur-3xl rounded-[2rem]" />
              <div className="absolute -inset-4 bg-gradient-to-br from-champagne/15 via-transparent to-primary/10 blur-2xl rounded-3xl" />
              <div className="relative p-8 lg:p-10 bg-black/55 border border-champagne/25 rounded-2xl backdrop-blur-2xl shadow-2xl shadow-black/40">
                <p className="text-[10px] uppercase tracking-[0.28em] text-champagne font-semibold mb-6">
                  The Doctrine
                </p>
                <div className="space-y-6">
                  {[
                    { num: "24h", label: "Routed within 24 business hours" },
                    { num: "8", label: "Outcome lanes — never one-size-fits-all" },
                    { num: "0", label: "Pressure. Honest answers, every time" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-baseline gap-5 pb-5 border-b border-white/15 last:border-0 last:pb-0">
                      <p className="font-serif text-4xl font-semibold text-white tabular-nums" style={{ minWidth: "3rem" }}>
                        {item.num}
                      </p>
                      <p className="text-sm text-white/90 leading-relaxed">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-tan to-champagne" />
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: MessageSquare,
      title: "Submit the situation.",
      desc: "Address, condition, motivation, timeline — whatever you know. The more context, the sharper the review.",
    },
    {
      icon: Search,
      title: "We review and route.",
      desc: "Comps, scope, structural fit, and best economic path. Our team works the property against all eight lanes.",
    },
    {
      icon: CheckCircle2,
      title: "You get a real answer.",
      desc: "A direct conversation, a documented offer, or an honest referral if Pegasus isn't the right fit.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-background relative overflow-hidden scroll-mt-24">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="max-w-2xl mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">The Process</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Three steps. No theatrics.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We don't lead with a lowball. We lead with a real review of what your property is and what the cleanest path forward looks like.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid md:grid-cols-3 gap-8 lg:gap-6" staggerDelay={0.15}>
          {steps.map((step, i) => (
            <StaggerItem key={i}>
              <motion.div
                className="relative h-full p-8 bg-card rounded-lg border border-border/40 hover:border-primary/30 transition-all duration-300 group"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                data-testid={`step-sell-${i}`}
              >
                <div className="flex items-baseline justify-between mb-8">
                  <span className="font-serif text-5xl text-primary/20 group-hover:text-primary/50 transition-colors">
                    0{i + 1}
                  </span>
                  <step.icon className="w-5 h-5 text-primary/55 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-4 tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function OutcomeRoutingSection() {
  const lanes = [
    { icon: Building, title: "Pegasus Acquisition", desc: "We purchase directly when the numbers and execution path are clear." },
    { icon: Handshake, title: "Wholesale Assignment", desc: "Off-market assignment to a vetted buyer in our private network." },
    { icon: Users, title: "JV / Partnership", desc: "Co-GP or operator-aligned structure when value-add scope demands it." },
    { icon: TrendingUp, title: "Listing Lane", desc: "Traditional MLS through our KW partnership when that's the right answer." },
    { icon: Shield, title: "Referral", desc: "Routed to a trusted professional when Pegasus isn't the best fit." },
    { icon: Clock, title: "Incubation", desc: "Held and revisited as conditions change — long-horizon situations welcome." },
  ];

  return (
    <section className="py-24 lg:py-32 bg-muted/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">No Lead Dies</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            What happens after you submit.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your property is reviewed against six possible outcomes. Whichever lane fits best is the lane we recommend — even when that means routing you somewhere else.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.07}>
          {lanes.map((lane, i) => (
            <StaggerItem key={i}>
              <motion.div
                className="group p-7 bg-card rounded-lg border border-border/40 hover:border-primary/25 transition-all duration-300 h-full"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                data-testid={`outcome-${i}`}
              >
                <lane.icon className="w-5 h-5 text-primary/55 mb-5 group-hover:text-primary transition-colors" />
                <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">{lane.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{lane.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function LeadFormSection() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InsertSellerLead>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      propertyAddress: "",
      propertyType: "house",
      condition: "needs-tlc",
      timeline: "30-60-days",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertSellerLead) => {
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
          propertyType: data.propertyType,
          condition: data.condition,
          timeline: data.timeline,
        },
        notes: data.notes,
      };

      return await apiRequest("POST", "/api/leads", unifiedLead);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Property Submitted", description: "We'll review your situation and reach out within 1–2 business days." });
    },
    onError: () => {
      toast({ title: "Something went wrong", description: "Please try again or email us directly.", variant: "destructive" });
    },
  });

  if (submitted) {
    return (
      <section id="seller-form" className="py-32 lg:py-40 bg-card border-y border-border/40 scroll-mt-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-8" />
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">Received</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold mb-6 tracking-[-0.02em]" data-testid="text-form-success">
            Thank you.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your property is in the queue. Our team will review the situation and route it to the right lane within 24 business hours, then reach out with a real answer.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="seller-form" className="py-28 lg:py-36 bg-card border-y border-border/40 scroll-mt-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative grid lg:grid-cols-12 gap-12 lg:gap-16">
        <ScrollReveal className="lg:col-span-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Submit a Property</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold mb-6 tracking-[-0.02em]" data-testid="text-form-title">
            Tell us what you have.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-10">
            Five minutes. Real review. Real answer. Whatever you know about the property is enough to start — we'll fill in the rest.
          </p>
          <ul className="space-y-4">
            {[
              { icon: FileCheck, text: "We review against eight outcome lanes" },
              { icon: Shield, text: "No pressure, no obligation, no spam" },
              { icon: Clock, text: "Direct response within 1–2 business days" },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground/85">
                <item.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                {item.text}
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal className="lg:col-span-7" delay={0.15}>
          <div className="p-8 lg:p-10 bg-background rounded-2xl border border-border/50 shadow-xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Smith" {...field} data-testid="input-seller-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="Best callback number" {...field} data-testid="input-seller-phone" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl><Input type="email" placeholder="john@example.com" {...field} data-testid="input-seller-email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="propertyAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <AddressAutocomplete value={field.value} onChange={field.onChange} placeholder="Start typing an address..." data-testid="input-seller-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <FormField control={form.control} name="propertyType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger data-testid="select-property-type"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="condo">Condo</SelectItem>
                          <SelectItem value="multi">Multi-Family</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="condition" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger data-testid="select-condition"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="needs-tlc">Needs TLC</SelectItem>
                          <SelectItem value="major-repairs">Major Repairs</SelectItem>
                          <SelectItem value="move-in-ready">Move-in Ready</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="timeline" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger data-testid="select-timeline"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="asap">ASAP</SelectItem>
                          <SelectItem value="30-60-days">30–60 Days</SelectItem>
                          <SelectItem value="3-plus-months">3+ Months</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anything we should know?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="The situation, motivation, encumbrances, what you've tried — anything helps."
                        className="min-h-32 resize-none"
                        {...field}
                        value={field.value ?? ""}
                        data-testid="textarea-seller-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-sm uppercase tracking-[0.15em] font-semibold py-7"
                  disabled={mutation.isPending}
                  data-testid="button-submit-property"
                >
                  {mutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                  ) : (
                    <>Submit Property<ArrowRight className="ml-3 w-4 h-4" /></>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center pt-2">
                  By submitting, you consent to be contacted about your property. No spam, no resale of your data.
                </p>
              </form>
            </Form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: "What actually happens after I submit?",
      answer: "Within 24 business hours, your property is reviewed against eight possible outcomes — direct acquisition, wholesale, JV, listing through our KW partnership, referral, and others. Whichever lane fits best is the one we recommend. We reach out with a real answer, not a templated lowball.",
    },
    {
      question: "Will Pegasus always be the buyer?",
      answer: "No — and that's the point. Pegasus participates only when the numbers, scope, and structure are clean. Otherwise we wholesale to a vetted buyer in our network, route to a JV partner, or refer you to a trusted professional. The 'No Lead Dies' doctrine means every property gets a path, not necessarily a Pegasus path.",
    },
    {
      question: "Do I need to make repairs first?",
      answer: "No. We review properties in any condition. Distressed, occupied, mid-rehab, raw land — submit it and we'll evaluate based on the situation as it stands.",
    },
    {
      question: "How fast can a transaction close?",
      answer: "When Pegasus acquires directly, transactions can move in 7–14 days. Wholesale assignments and JV structures vary. The first conversation is always about your timeline and which lane respects it best.",
    },
    {
      question: "Are there any fees or commissions?",
      answer: "Direct Pegasus acquisitions involve no agent commissions or fees to you. If a listing path is recommended, it would be handled through our licensed Keller Williams partnership with documented terms upfront. We tell you which lane and what the structure is before you commit to anything.",
    },
    {
      question: "What kinds of properties do you review?",
      answer: "Single-family homes, condos, 2–4 unit multi-family, raw and infill lots, and select commercial situations across California — primarily Bay Area and Northern California. Out-of-area submissions are still reviewed for referral routing.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-muted/20 relative">
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Common Questions</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em]" data-testid="text-faq-title">
            What sellers actually ask.
          </h2>
        </ScrollReveal>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-border/50 rounded-lg px-6 bg-card hover:border-primary/30 transition-colors"
              data-testid={`faq-${i}`}
            >
              <AccordionTrigger className="text-left font-semibold py-5 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-5">Have a question we didn't cover?</p>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="text-sm uppercase tracking-[0.15em] font-semibold px-8" data-testid="button-faq-contact">
              Contact Us Directly
              <ArrowRight className="ml-3 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
