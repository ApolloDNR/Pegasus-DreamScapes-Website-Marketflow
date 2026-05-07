import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
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
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import { insertInvestorLeadSchema, type InsertInvestorLead, type InsertLead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  TrendingUp,
  FileCheck,
  Target,
  CheckCircle2,
  ArrowRight,
  Loader2,
  DollarSign,
  Users,
  Shield,
  Lock,
  Eye,
  Briefcase,
} from "lucide-react";
import heroImage from "@assets/generated_images/luxury_home_at_dusk_with_warm_lighting.png";

export default function Invest() {
  useSEO({
    title: "Partner Inquiry — Pegasus Dreamscapes",
    description: "Private capital and partnership conversations around real opportunities. Deal-specific structures only — no public investment offering.",
  });

  return (
    <div className="min-h-screen">
      <HeroSection />
      <PrinciplesSection />
      <PartnershipStructuresSection />
      <ProjectSnapshotSection />
      <InvestorFormSection />
      <DisclaimerSection />
    </div>
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
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-champagne/40 bg-white/5 backdrop-blur-sm">
                <Lock className="w-3 h-3 text-champagne" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-champagne font-semibold">Private Network</span>
              </span>
              <span className="text-xs uppercase tracking-[0.25em] text-white/60">Invite-only</span>
            </motion.div>

            <motion.h1
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[0.95] tracking-[-0.02em] mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              data-testid="text-invest-hero"
            >
              Capital meets<br />
              <span className="bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">structure.</span>
            </motion.h1>

            <motion.p
              className="font-serif text-lg sm:text-xl text-white/80 italic max-w-2xl mb-4 leading-snug"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
            >
              Real opportunities. Documented risks. Lawful execution.
            </motion.p>

            <motion.p
              className="text-base sm:text-lg text-white/70 max-w-2xl mb-10 leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Pegasus structures private, deal-specific capital and partnership conversations around real estate projects we operate or co-develop. This is not a public investment offering — every conversation is individual, suitability-checked, and properly papered.
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
                onClick={() => document.getElementById('investor-form')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-become-partner"
              >
                Start a Conversation
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
              <a href="#structures">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-sm uppercase tracking-[0.15em] px-10 py-7 border-white/30 text-white hover:bg-white/10 backdrop-blur-md font-semibold"
                >
                  See Structures
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
              <div className="absolute -inset-4 bg-gradient-to-br from-champagne/15 via-transparent to-primary/10 blur-2xl rounded-3xl" />
              <div className="relative p-8 lg:p-10 bg-white/5 border border-white/15 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.28em] text-champagne/80 font-semibold mb-6">
                  How we work with capital
                </p>
                <div className="space-y-5">
                  {[
                    { kicker: "Private", title: "Deal-specific conversations", desc: "Never a pooled fund pitch. Always a real, named project." },
                    { kicker: "Documented", title: "Real underwriting, real papers", desc: "Comps, scope, capital stack, exit — on paper, before any commitment." },
                    { kicker: "Suited", title: "Suitability comes first", desc: "If the structure isn't right for you, we say so." },
                  ].map((item, i) => (
                    <div key={i} className="pb-5 border-b border-white/10 last:border-0 last:pb-0">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-champagne/80 font-semibold mb-1.5">{item.kicker}</p>
                      <p className="font-serif text-lg text-white mb-1">{item.title}</p>
                      <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
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

function PrinciplesSection() {
  const principles = [
    { icon: Eye, title: "Transparent Underwriting", desc: "You see the comps, the scope, the capital stack, and the exit. No black-box returns, no hand-waving on assumptions." },
    { icon: Shield, title: "Documented Risk", desc: "Every structure comes with a written risk profile and the conditions under which it can break. We name the downside before the upside." },
    { icon: FileCheck, title: "Lawful Execution", desc: "Deal-specific, individually-papered structures with proper legal review. No public solicitation, no general advertising of terms." },
    { icon: Target, title: "Defined Exit", desc: "Sale, refinance, or hold — every project has a planned exit, a timeline, and a contingency path." },
  ];

  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="max-w-2xl mb-14">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Operating Principles</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            How we treat your capital.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Capital partners aren't a line item — they're a long-term relationship. Four principles guide every conversation.
          </p>
        </ScrollReveal>

        <div className="px-2 lg:px-0 max-w-7xl mx-auto">
          <LegalDisclaimer />
        </div>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10" staggerDelay={0.08}>
          {principles.map((p, i) => (
            <StaggerItem key={i}>
              <motion.div
                className="group h-full p-7 bg-card rounded-lg border border-border/40 hover:border-primary/25 transition-all duration-300"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                data-testid={`principle-${i}`}
              >
                <p.icon className="w-5 h-5 text-primary/55 mb-6 group-hover:text-primary transition-colors" />
                <h3 className="font-semibold text-base mb-2.5 group-hover:text-primary transition-colors">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function PartnershipStructuresSection() {
  const structures = [
    {
      icon: DollarSign,
      kicker: "Debt",
      title: "Debt Investment",
      desc: "Provide a loan secured by real estate. Defined terms, defined collateral, defined timeline.",
      attributes: ["Fixed structure per project", "Collateralized position", "Documentation and legal review required"],
      considerations: ["Lower upside ceiling than equity", "Returns capped at agreed terms"],
    },
    {
      icon: TrendingUp,
      kicker: "Equity",
      title: "Equity Investment",
      desc: "Share in the outcomes (and exposure) of an active project — flips, value-add, or hold strategies.",
      attributes: ["Aligned with project outcome", "Share in appreciation and improvements", "Tax treatment per individual situation"],
      considerations: ["Returns tied to project success", "Hold period dependent on exit"],
    },
    {
      icon: Briefcase,
      kicker: "Joint Venture",
      title: "JV / Co-GP",
      desc: "Partner directly with our operators. You bring capital, we bring execution. Splits and decision rights papered per deal.",
      attributes: ["Direct decision involvement", "Custom split structures", "Operator-investor partnership"],
      considerations: ["Larger capital commitment", "More active engagement"],
    },
  ];

  return (
    <section id="structures" className="py-24 lg:py-32 bg-muted/20 relative overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">The Structures</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Three ways capital participates.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Each structure is matched to a specific project and a specific partner. We don't fit you to a product — we design the structure to fit the situation.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
          {structures.map((s, i) => (
            <StaggerItem key={i}>
              <motion.div
                className="group h-full p-8 bg-card rounded-lg border border-border/40 hover:border-primary/30 transition-all duration-300"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                data-testid={`structure-${i}`}
              >
                <div className="flex items-baseline justify-between mb-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-semibold">{s.kicker}</p>
                  <s.icon className="w-5 h-5 text-primary/55 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-4 tracking-tight">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-7">{s.desc}</p>

                <div className="space-y-5 pt-5 border-t border-border/40">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/60 font-semibold mb-3">Attributes</p>
                    <ul className="space-y-2">
                      {s.attributes.map((a, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                          <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/60 font-semibold mb-3">Considerations</p>
                    <ul className="space-y-2">
                      {s.considerations.map((c, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                          <Target className="w-3 h-3 text-amber-500/80 mt-0.5 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto mt-10 italic">
          Specific structures, terms, and projected outcomes are discussed only in private, individual conversations after suitability review.
        </p>
      </div>
    </section>
  );
}

function ProjectSnapshotSection() {
  return (
    <section className="py-24 lg:py-32 bg-background relative">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3">Illustrative Snapshot</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em]" data-testid="text-project-snapshot">
            What a project page looks like.
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mt-5 leading-relaxed">
            Numbers below are illustrative for format. Real project details are shared individually with vetted partners under proper documentation.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative bg-card rounded-2xl border border-border/50 overflow-hidden shadow-xl">
            <div className="p-8 lg:p-10 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-semibold mb-2">Case Study Format</p>
                  <h3 className="font-serif text-3xl font-semibold tracking-tight">Nelson Dr — Richmond, CA</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Fix & Flip", "3 Bed · 2 Bath", "~3 Month Timeline"].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 text-xs font-medium bg-muted rounded-md text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
              {[
                { label: "Acquisition", value: "$385,000" },
                { label: "Rehab Budget", value: "$75,000" },
                { label: "All-In Basis", value: "$460,000" },
                { label: "Resale Target", value: "$575,000", accent: true },
              ].map((stat, i) => (
                <div key={i} className="p-7 lg:p-8 text-center" data-testid={`snapshot-stat-${i}`}>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3 font-semibold">{stat.label}</p>
                  <p className={`font-serif text-3xl lg:text-4xl font-semibold tabular-nums ${stat.accent ? 'text-primary' : ''}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-8 lg:p-10 border-t border-border/40 bg-muted/20">
              <p className="text-sm text-muted-foreground leading-relaxed text-center italic">
                * Real partner conversations include capital stack, contingency budgets, sensitivity analysis, exit assumptions, comp set, scope-of-work, and operator track record. Numbers above are formatting only.
              </p>
            </div>
          </div>
        </ScrollReveal>
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

      return await apiRequest("POST", "/api/leads", unifiedLead);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Profile Received", description: "We'll review and reach out to start a private conversation." });
    },
    onError: () => {
      toast({ title: "Something went wrong", description: "Please try again or email us directly.", variant: "destructive" });
    },
  });

  if (submitted) {
    return (
      <section id="investor-form" className="py-32 lg:py-40 bg-card border-y border-border/40 scroll-mt-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-8" />
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">Received</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold mb-6 tracking-[-0.02em]" data-testid="text-investor-success">
            Welcome to the conversation.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your profile is in. Our team will review fit, suitability, and current opportunities, then reach out individually to start the conversation.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="investor-form" className="py-28 lg:py-36 bg-card border-y border-border/40 scroll-mt-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative grid lg:grid-cols-12 gap-12 lg:gap-16">
        <ScrollReveal className="lg:col-span-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Partner Inquiry</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold mb-6 tracking-[-0.02em]" data-testid="text-investor-form-title">
            Start with context.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-10">
            This is a starting point, not a commitment. The information below helps us frame the right structure and right conversation — or tell you honestly if Pegasus isn't the right fit yet.
          </p>
          <ul className="space-y-4">
            {[
              { icon: Lock, text: "Private conversation, never publicly solicited" },
              { icon: FileCheck, text: "Documented suitability before structure discussion" },
              { icon: Users, text: "Direct call with our team — not a sales sequence" },
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
                      <FormControl><Input placeholder="John Smith" {...field} data-testid="input-investor-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="john@example.com" {...field} data-testid="input-investor-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="Best phone number" {...field} data-testid="input-investor-phone" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cityState" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City / State</FormLabel>
                      <FormControl><Input placeholder="San Francisco, CA" {...field} data-testid="input-investor-city" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <FormField control={form.control} name="capitalRange" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capital Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger data-testid="select-capital"><SelectValue placeholder="Range" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="0-25k">$0 – $25K</SelectItem>
                          <SelectItem value="25-50k">$25K – $50K</SelectItem>
                          <SelectItem value="50-100k">$50K – $100K</SelectItem>
                          <SelectItem value="100k-plus">$100K+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="investmentPreference" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger data-testid="select-preference"><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="flips">Flips</SelectItem>
                          <SelectItem value="rentals">Rentals / Hold</SelectItem>
                          <SelectItem value="mexico">Development</SelectItem>
                          <SelectItem value="not-sure">Not Sure Yet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="experienceLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger data-testid="select-experience"><SelectValue placeholder="Level" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="new">New to RE</SelectItem>
                          <SelectItem value="some">Some Experience</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>What kind of partnership are you looking for?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Goals, timeline, prior experience, anything that helps us frame the right conversation."
                        className="min-h-32 resize-none"
                        {...field}
                        value={field.value ?? ""}
                        data-testid="textarea-investor-notes"
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
                  data-testid="button-submit-investor"
                >
                  {mutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                  ) : (
                    <>Submit Profile<ArrowRight className="ml-3 w-4 h-4" /></>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Submitting this profile is not an offer to invest. All structures, terms, and opportunities are discussed individually under proper documentation.
                </p>
              </form>
            </Form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function DisclaimerSection() {
  return (
    <section className="py-16 bg-muted/30 border-t border-border/40">
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-4 text-center">Important Disclosures</p>
        <p className="text-sm text-muted-foreground text-center leading-relaxed" data-testid="text-disclaimer">
          This page is informational only and does not constitute an offer to sell or a solicitation of an offer to buy any security or investment product. Pegasus Dreamscapes does not make public investment offerings. Any partnership opportunities are discussed individually with prospective partners after suitability review and are documented under proper legal structure. All real estate investments involve risk including the potential loss of principal. Past project outcomes are not indicative of future results. Nothing on this page is an offer of guaranteed returns or principal protection.
        </p>
        <div className="text-center mt-8">
          <Link href="/contact">
            <Button variant="outline" size="lg" className="text-sm uppercase tracking-[0.15em] font-semibold px-8" data-testid="button-disclaimer-contact">
              Questions? Contact Us
              <ArrowRight className="ml-3 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
