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
  BookOpen as BookOpenIcon,
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
  Phone,
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
  Hammer,
  Layers,
  Compass,
  Network,
  Lock,
  Briefcase,
  GitBranch,
  Eye
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
    description: "Pegasus DreamScapes Corp. is a strategy-first real estate operating company. Complex property, structured opportunity. Built on strategy. Governed by virtue. Executed with discipline."
  });
  
  return (
    <div className="min-h-screen">
      <HeroSection />
      <WhatBringsYouHereSection />
      <FreeSnapshotSection />
      <PegasusStandardSection />
      <FeaturedProjectSection />
      <MarketFlowBetaSection />
      <FounderSection />
      <FinalCTASection />
    </div>
  );
}

function DevelopmentPathwaySection() {
  const phases = [
    {
      tag: "Phase 1",
      label: "Today",
      title: "Foundation",
      icon: Hammer,
      items: [
        "ADU additions and forced-value rehabs",
        "Fix-and-flip projects",
        "BRRRR acquisitions",
        "Small-scale development",
      ],
    },
    {
      tag: "Phase 2",
      label: "Next",
      title: "Expansion",
      icon: Layers,
      items: [
        "Small multi-unit conversions",
        "2–4 unit projects",
        "Co-developer relationships",
        "Expanded Pegasus Development scope",
      ],
    },
    {
      tag: "Phase 3",
      label: "Growth",
      title: "Vertical Integration",
      icon: Building,
      items: [
        "Ground-up infill construction on Pegasus-controlled lots",
        "BuildForge-supported project management",
        "Multiple active construction projects",
      ],
    },
    {
      tag: "Phase 4",
      label: "Legacy",
      title: "Generational",
      icon: Compass,
      items: [
        "Master-planned classical neighborhoods",
        "Larger-scale development",
        "A generational real estate company",
      ],
    },
  ];

  return (
    <section id="development-pathway" className="py-28 lg:py-36 bg-background relative overflow-hidden scroll-mt-24">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] bg-champagne/[0.05] rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="max-w-3xl mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Pegasus Development · The Spine</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] mb-6">
            Development is the spine.<br />
            <span className="text-headline-gold">Built phase by phase.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Pegasus DreamScapes is, at its core, a real estate development company. Investments and Systems exist to feed and support what gets built. Today the work is small-scale and disciplined; the trajectory is a vertically integrated developer producing ground-up infill and, in time, master-planned classical neighborhoods.
          </p>
          <p className="text-base text-muted-foreground/85 leading-relaxed italic">
            This is the path. Not a claim of where we already stand.
          </p>
        </ScrollReveal>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5" staggerDelay={0.1}>
            {phases.map((phase, index) => (
              <StaggerItem key={index}>
                <motion.div
                  className="relative h-full p-7 bg-card rounded-lg border border-border/40 hover:border-primary/30 transition-all duration-300 group"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  data-testid={`phase-card-${index}`}
                >
                  <div className="flex items-baseline justify-between mb-6">
                    <span className="font-serif text-3xl text-primary/30 group-hover:text-primary/60 transition-colors">
                      0{index + 1}
                    </span>
                    <phase.icon className="w-5 h-5 text-primary/55 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold mb-1">
                    {phase.tag} · {phase.label}
                  </p>
                  <h3 className="font-serif text-2xl font-semibold mb-5 tracking-tight">{phase.title}</h3>
                  <ul className="space-y-2.5">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                        <span className="mt-2 w-1 h-1 rounded-full bg-primary/50 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>

        <ScrollReveal delay={0.3} className="mt-12 max-w-3xl">
          <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-5">
            Each phase is earned, not assumed. We graduate to the next stage when the prior stage is consistently profitable, well-documented, and operationally repeatable.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

function StrategyStructureStacksSection() {
  const strategyStack = [
    { icon: HomeIcon, title: "Fix & Flip", desc: "Forced-value renovation with disciplined resale execution." },
    { icon: TrendingUp, title: "BRRRR / Buy & Hold", desc: "Long-term wealth through strategic acquisition and management." },
    { icon: Hammer, title: "ADU & Development", desc: "Additions, conversions, and small-scale ground-up projects." },
    { icon: Zap, title: "Wholesale / Assignment", desc: "Off-market assignment to vetted buyers in our network." },
  ];

  const structureStack = [
    { icon: Briefcase, title: "Direct Acquisition", desc: "Pegasus purchases for its own balance sheet where the path is clear." },
    { icon: Handshake, title: "JV / Co-GP", desc: "Joint venture and co-general-partner structures with aligned operators." },
    { icon: GitBranch, title: "Creative Finance", desc: "Sub-to, seller-finance, wraps, and lease-options where they fit the situation." },
    { icon: Network, title: "Referral / Listing", desc: "Routed to a trusted partner or KW listing lane when that's the right answer." },
  ];

  const StackBlock = ({ kicker, title, desc, items, testIdPrefix }: { kicker: string; title: string; desc: string; items: typeof strategyStack; testIdPrefix: string }) => (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em] text-primary font-semibold mb-3">{kicker}</p>
        <h3 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-3">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md">{desc}</p>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="group flex items-start gap-5 p-5 bg-card rounded-lg border border-border/40 hover:border-primary/25 transition-all duration-300"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
            data-testid={`${testIdPrefix}-${index}`}
          >
            <div className="w-10 h-10 rounded-md border border-border/60 group-hover:border-primary/40 flex items-center justify-center flex-shrink-0 transition-colors">
              <item.icon className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="py-24 lg:py-32 bg-muted/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">The Operating Stack</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Strategy meets structure.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Two dimensions to every Pegasus deal: <span className="text-foreground/80">what</span> we do with the property, and <span className="text-foreground/80">how</span> we get it done.
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <ScrollReveal direction="left">
            <StackBlock
              kicker="Strategy Stack"
              title="What we do with the property."
              desc="Each property is matched to the strategy with the cleanest economics for the situation in front of us."
              items={strategyStack}
              testIdPrefix="strategy-item"
            />
          </ScrollReveal>
          <ScrollReveal direction="right">
            <StackBlock
              kicker="Structure Stack"
              title="How the deal gets done."
              desc="Capital structure and ownership form are matched to the strategy, not the other way around."
              items={structureStack}
              testIdPrefix="structure-item"
            />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function MarketFlowBetaSection() {
  const stages = [
    {
      stage: "Stage 01",
      stageLabel: "Website / Peggy Intake",
      steps: [
        { n: "01", label: "Website / Peggy intake", note: "Owner or operator submits" },
        { n: "02", label: "Pegasus HQ submission", note: "Logged for internal review" },
      ],
    },
    {
      stage: "Stage 02",
      stageLabel: "Pegasus HQ Review",
      steps: [
        { n: "03", label: "Seed", note: "Initial qualification" },
        { n: "04", label: "Strategy Snapshot", note: "Free structural read" },
        { n: "05", label: "Lane choice", note: "Owner picks a path" },
      ],
    },
    {
      stage: "Stage 03",
      stageLabel: "Approved Opportunity",
      steps: [
        { n: "06", label: "Opportunity", note: "Approved by the team" },
        { n: "07", label: "MarketFlow candidate", note: "Curated for fit" },
      ],
    },
    {
      stage: "Stage 04",
      stageLabel: "MarketFlow Distribution",
      steps: [
        { n: "08", label: "Approved for distribution", note: "Cleared for the network" },
        { n: "09", label: "MarketFlow Listing", note: "Visible to vetted members" },
      ],
    },
  ];

  return (
    <section
      id="marketflow-beta"
      className="py-24 lg:py-32 relative overflow-hidden scroll-mt-24"
      style={{ backgroundColor: "hsl(var(--navy))", color: "hsl(var(--navy-foreground))" }}
    >
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-copper/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-champagne/10 rounded-full blur-3xl" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <ScrollReveal className="lg:col-span-7" direction="left">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-copper/40 bg-copper/10">
                <Lock className="w-3 h-3 text-copper" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-copper font-semibold">Private Beta</span>
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-cream/60">Invite-only network</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] mb-6 text-cream">
              MarketFlow.<br />
              <span className="italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
                The private dealflow layer.
              </span>
            </h2>

            <p className="text-lg text-cream/85 leading-relaxed mb-6 max-w-2xl">
              MarketFlow is the private dealflow layer for reviewed opportunities, trusted operators, buyers, and capital relationships.
            </p>

            <div className="mb-8 border-l-2 border-copper/60 pl-5 text-sm text-cream/80 leading-relaxed max-w-2xl" data-testid="marketflow-not">
              <p className="text-[10px] uppercase tracking-[0.25em] text-copper font-semibold mb-2">What MarketFlow is not</p>
              <ul className="space-y-1">
                <li>· Not raw intake. Every property is routed through Pegasus HQ first.</li>
                <li>· Not a public marketplace. Access is private, role-gated, and invite-only.</li>
                <li>· Not an investment solicitation platform. Capital conversations happen privately, never as a public offering.</li>
              </ul>
            </div>

            <ul className="grid sm:grid-cols-2 gap-4 mb-10">
              {[
                { icon: Shield, text: "Reviewed before listed. Never raw intake" },
                { icon: Eye, text: "Role-gated visibility for vetted members" },
                { icon: Target, text: "Compatibility-scored to operator + capital fit" },
                { icon: Network, text: "Direct-to-operator messaging in-network" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3" data-testid={`marketflow-feature-${i}`}>
                  <item.icon className="w-4 h-4 text-copper mt-1 flex-shrink-0" />
                  <span className="text-sm text-cream/90 leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/marketflow">
                <Button size="lg" className="w-full sm:w-auto px-8 text-sm uppercase tracking-[0.15em] font-semibold bg-copper text-white hover:bg-copper/90" data-testid="button-marketflow-explore">
                  Enter MarketFlow
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 text-sm uppercase tracking-[0.15em] font-semibold border-cream/30 text-cream hover:bg-cream/10" data-testid="button-marketflow-request-access">
                  Request Access
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-5" direction="right" delay={0.2}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-copper/15 via-transparent to-champagne/10 blur-2xl rounded-3xl" />
              <div className="relative p-8 lg:p-10 rounded-2xl border border-cream/15 shadow-2xl shadow-black/30 backdrop-blur-sm" style={{ backgroundColor: "hsl(218 16% 16% / 0.85)" }}>
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-cream/15">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "hsl(var(--copper))" }}
                      animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="text-xs uppercase tracking-[0.2em] text-cream/60">Live Now</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-copper font-semibold">MarketFlow</span>
                </div>

                <div className="space-y-4">
                  {[
                    { lane: "Wholesale", title: "Off-market SFR · East Bay", meta: "3/2 · ARV ~$X · Below-market basis" },
                    { lane: "JV / Capital", title: "ADU value-add · South Bay", meta: "Operator + capital partner needed" },
                    { lane: "Listing", title: "Estate sale · Peninsula", meta: "MLS lane via KW partnership" },
                  ].map((deal, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border border-cream/15 hover:border-copper/40 transition-colors group bg-cream/[0.03]"
                      data-testid={`marketflow-deal-${i}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-copper font-semibold">{deal.lane}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-cream/50 group-hover:text-copper transition-colors" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1 font-serif text-cream">{deal.title}</h4>
                      <p className="text-xs text-cream/60">{deal.meta}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-6 pt-5 border-t border-cream/15 text-[11px] uppercase tracking-[0.2em] text-cream/55 text-center">
                  Sample lanes · Live deals visible to network members
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal className="mt-20 lg:mt-24" direction="up" delay={0.1}>
          <div className="border-t border-cream/15 pt-12">
            <div className="text-center mb-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-copper font-semibold mb-3">How a property reaches MarketFlow</p>
              <h3 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] max-w-2xl mx-auto text-cream">
                Reviewed before listed. Always.
              </h3>
              <p className="text-sm text-cream/70 mt-4 max-w-2xl mx-auto">
                Nine steps. Four stages. Every opportunity passes through the same structural path before it ever sees the network.
              </p>
            </div>

            {/* Mobile: vertical timeline grouped by stage */}
            <ol className="lg:hidden space-y-8" data-testid="marketflow-funnel-mobile">
              {stages.map((stage, si) => (
                <li key={stage.stage} className="relative pl-6 border-l border-copper/40" data-testid={`funnel-stage-${si}`}>
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-copper" />
                  <p className="text-[10px] uppercase tracking-[0.28em] text-copper font-semibold mb-1">{stage.stage}</p>
                  <p className="font-serif text-base font-semibold text-cream mb-4">{stage.stageLabel}</p>
                  <div className="space-y-3">
                    {stage.steps.map((step) => (
                      <div
                        key={step.n}
                        className="p-3 rounded-lg border border-cream/15 bg-cream/[0.03]"
                        data-testid={`funnel-step-${step.n}`}
                      >
                        <div className="text-[10px] uppercase tracking-[0.25em] text-copper/85 font-semibold mb-1">{step.n}</div>
                        <div className="font-serif text-sm font-semibold leading-tight mb-0.5 text-cream">{step.label}</div>
                        <div className="text-[11px] text-cream/60 leading-snug">{step.note}</div>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ol>

            {/* Desktop: scroll-snap stepper, four stage groups */}
            <div className="hidden lg:block" data-testid="marketflow-funnel-desktop">
              <div className="grid grid-cols-4 gap-5">
                {stages.map((stage, si) => (
                  <div key={stage.stage} className="relative">
                    <div className="mb-5 pb-3 border-b border-copper/30">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-copper font-semibold mb-1">{stage.stage}</p>
                      <p className="font-serif text-base font-semibold text-cream leading-tight">{stage.stageLabel}</p>
                    </div>
                    <div className="space-y-3">
                      {stage.steps.map((step) => (
                        <div
                          key={step.n}
                          className="relative p-4 rounded-lg border border-cream/15 bg-cream/[0.03] hover:border-copper/50 hover:bg-cream/[0.05] transition-all"
                          data-testid={`funnel-step-${step.n}-desktop`}
                        >
                          <div className="text-[10px] uppercase tracking-[0.25em] text-copper/85 font-semibold mb-1.5">{step.n}</div>
                          <div className="font-serif text-sm font-semibold leading-tight mb-1 text-cream">{step.label}</div>
                          <div className="text-[11px] text-cream/60 leading-snug">{step.note}</div>
                        </div>
                      ))}
                    </div>
                    {si < stages.length - 1 && (
                      <ArrowRight className="hidden lg:block absolute top-5 -right-3.5 w-4 h-4 text-copper/60" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-[11px] uppercase tracking-[0.25em] text-cream/55 mt-10">
              No raw intake reaches MarketFlow. The review is the doctrine.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function FounderSection() {
  return (
    <section
      id="founder"
      className="py-24 lg:py-32 bg-background relative overflow-hidden scroll-mt-24"
      data-testid="section-founder"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-6xl mx-auto px-6 lg:px-12 relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Headshot — copper-frame treatment */}
          <ScrollReveal className="lg:col-span-5" direction="left">
            <div className="relative max-w-sm mx-auto lg:mx-0">
              {/* IMAGE TODO: founder-apollo.jpg — drop a 4:5 portrait of Paolo "Apollo" Duran here. Until then, copper-frame placeholder ships. */}
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(160deg, hsl(213 53% 14%) 0%, hsl(218 16% 16%) 55%, hsl(213 53% 11%) 100%)",
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                  <p className="font-display text-5xl text-copper/80 tracking-[0.18em] mb-3">PD</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-cream/55 font-supporting">Founder · Principal</p>
                  <p className="font-serif text-cream/85 text-base mt-3 italic">Portrait pending</p>
                </div>
                {/* Copper hairline frame */}
                <div className="absolute inset-0 ring-1 ring-copper/50 rounded-lg pointer-events-none" />
                <div className="absolute -inset-1 rounded-lg ring-1 ring-copper/15 pointer-events-none" />
              </div>
              <div className="brand-stripe mt-3" />
            </div>
          </ScrollReveal>

          {/* Founder text block */}
          <ScrollReveal className="lg:col-span-7" direction="right" delay={0.15}>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-copper" />
              <p className="text-[11px] uppercase tracking-[0.28em] text-copper font-semibold font-supporting">
                The Operator
              </p>
            </div>

            <h2
              className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-3 text-foreground"
              data-testid="text-founder-name"
            >
              Paolo &ldquo;Apollo&rdquo; Duran
            </h2>
            <p className="font-supporting text-xs uppercase tracking-[0.25em] text-foreground/65 mb-7">
              Founder &amp; Principal · The Deal Architect
            </p>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-5">
              Paolo &ldquo;Apollo&rdquo; Duran is building Pegasus DreamScapes as a strategy-first real estate operating company. The focus is complex property situations, disciplined execution, and long-term trust.
            </p>
            <p className="text-base text-muted-foreground/85 leading-relaxed mb-9">
              A real person reviews every property, every partner conversation, every routed outcome. There is no SDR funnel and no anonymous &ldquo;team&rdquo; behind a contact form.
            </p>

            <div className="grid sm:grid-cols-2 gap-px bg-border/50 rounded-lg overflow-hidden border border-border/50" data-testid="founder-contact">
              <a
                href="tel:+19259486566"
                className="bg-card hover:bg-card/70 px-6 py-5 transition-colors group"
                data-testid="link-founder-phone"
              >
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-supporting font-semibold mb-1.5">Direct Line</p>
                <p className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">925-948-6566</p>
              </a>
              <a
                href="mailto:apollo@pegasusdreamscapes.com"
                className="bg-card hover:bg-card/70 px-6 py-5 transition-colors group"
                data-testid="link-founder-email"
              >
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-supporting font-semibold mb-1.5">Email</p>
                <p className="font-serif text-base text-foreground group-hover:text-primary transition-colors break-all">apollo@pegasusdreamscapes.com</p>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section id="final-cta" className="py-28 lg:py-40 bg-card relative overflow-hidden scroll-mt-24">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-gradient-radial from-primary/10 via-primary/0 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-5xl mx-auto px-6 lg:px-12 relative text-center">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-8">The Deal Architect</p>
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] leading-[0.95] mb-8">
            Dream it.<br />
            <span className="text-primary/90">Build it.</span><br />
            <span className="bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">Live it.</span>
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
            Whether you have a property, a partnership, or a project worth reviewing, every conversation starts the same way: with a real, structural look at what's possible.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/sell">
              <Button size="lg" className="w-full sm:w-auto px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-final-cta-sell">
                Submit a Property
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/invest">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-final-cta-invest">
                Partner Inquiry
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="ghost" className="w-full sm:w-auto px-8 py-7 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-final-cta-contact">
                Just Say Hello
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-10 border-t border-border/40 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <span>Private network</span>
            <span className="hidden sm:inline text-border">·</span>
            <span>Invite-only deal flow</span>
            <span className="hidden sm:inline text-border">·</span>
            <span>Bay Area, California</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function WhatBringsYouHereSection() {
  const cards = [
    { icon: HomeIcon, tag: "Owners", title: "I have a property", desc: "Distressed, complex, or just exploring options. Get a structured review.", href: "/sell", testId: "router-property" },
    { icon: GitBranch, tag: "Deal Sources", title: "I have a deal or JV idea", desc: "Wholesale, assignment, or partnership opportunity to route.", href: "/submit-deal", testId: "router-deal" },
    { icon: DollarSign, tag: "Capital", title: "I represent capital", desc: "Private capital or partnership inquiry, by conversation, not public offering.", href: "/invest", testId: "router-capital" },
    { icon: Hammer, tag: "Development", title: "I'm exploring ADU or development", desc: "Build, add, or reposition. Pre-development scope and feasibility.", href: "/services", testId: "router-development" },
    { icon: BookOpenIcon, tag: "Learning", title: "I want to learn the strategies", desc: "Plain-language strategy library. No hype, no shortcuts.", href: "/education", testId: "router-education" },
    { icon: Network, tag: "Vendors", title: "I'm a vendor or operator", desc: "Join the disciplined network behind Pegasus execution.", href: "/vendor-network", testId: "router-vendor" },
  ];

  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Where to Start</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-[-0.02em] mb-6">
            What brings you here?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Pegasus serves six distinct paths. Pick the one that fits. We'll route the rest.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.06}>
          {cards.map((card, index) => (
            <StaggerItem key={index}>
              <Link href={card.href} data-testid={`link-${card.testId}`}>
                <Card className="group h-full p-7 bg-card border border-border/40 hover:border-copper/40 hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden hover:-translate-y-[3px]">
                  {/* Bronze top rule on hover */}
                  <div className="absolute left-0 right-0 top-0 h-px bg-copper/0 group-hover:bg-copper transition-all duration-300" />
                  <div className="flex items-baseline justify-between mb-6">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-copper font-semibold font-supporting">{card.tag}</p>
                    <card.icon className="w-5 h-5 text-copper/55 group-hover:text-copper transition-colors duration-300" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-[22px] font-semibold mb-3 tracking-tight leading-tight group-hover:text-primary transition-colors duration-300">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{card.desc}</p>
                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-copper/80 group-hover:text-copper font-semibold transition-colors">
                    Continue
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function FreeSnapshotSection() {
  const included = [
    "Quick read on the property type and likely situation",
    "Lane direction (acquire, wholesale, list, JV, refer, hold)",
    "What questions a serious buyer or partner will ask next",
    "Plain-language summary you can act on",
  ];
  const notIncluded = [
    "A binding offer, valuation, or appraisal",
    "Legal, tax, or licensed real estate advice",
    "Underwriting of a specific transaction",
    "Any commitment from Pegasus to participate",
  ];

  return (
    <section className="py-24 lg:py-32 bg-muted/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-6xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Free · No Obligation</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-[-0.02em] mb-6">
            Free Property Strategy Snapshot
          </h2>
          <p className="font-serif text-lg sm:text-xl text-foreground/85 italic leading-snug mb-5" data-testid="text-snapshot-doctrine">
            Every property gets a serious review. Not every property gets an offer.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A short, human-reviewed read on what a property could become. We use it to triage every situation that reaches us, so you leave the conversation with direction, even if Pegasus is not the right participant.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-8 bg-card rounded-lg border border-border/40" data-testid="snapshot-included">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <p className="text-xs uppercase tracking-[0.22em] font-semibold text-foreground">What's Included</p>
              </div>
              <ul className="space-y-3">
                {included.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                    <span className="mt-2 w-1 h-1 rounded-full bg-primary/60 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 bg-card/60 rounded-lg border border-border/30" data-testid="snapshot-not-included">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <p className="text-xs uppercase tracking-[0.22em] font-semibold text-muted-foreground">What It Is Not</p>
              </div>
              <ul className="space-y-3">
                {notIncluded.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground/80 leading-relaxed">
                    <span className="mt-2 w-1 h-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sell">
                <Button size="lg" className="w-full sm:w-auto px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-snapshot-cta">
                  Start a Strategy Review
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/deal-blueprint">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-snapshot-blueprint">
                  Next Step: Deal Blueprint
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-5 max-w-xl mx-auto leading-relaxed">
              The free Snapshot comes first. The paid <Link href="/deal-blueprint" className="text-primary hover:underline">Pegasus Deal Blueprint</Link> follows when the situation warrants it.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function PegasusStandardSection() {
  const principles = [
    { title: "Clarity over confusion", desc: "Every situation gets a plain-language read. No jargon, no hidden steps." },
    { title: "Discipline over hype", desc: "Underwriting and process come before growth. We say no often." },
    { title: "Stewardship over extraction", desc: "We protect long-term value: for owners, partners, and neighborhoods." },
    { title: "Honor over pressure", desc: "No urgency tactics, no pushed offers. The right path or no path." },
    { title: "Truth over easy promises", desc: "If we can't help, we say so, and route to who can." },
    { title: "Human review over blind automation", desc: "Software supports the work. People still make the calls." },
  ];

  return (
    <section id="pegasus-standard" className="py-24 lg:py-32 bg-card relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold mb-4">The Pegasus Standard</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-[-0.02em] mb-6">
            Six commitments. Every conversation.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The non-negotiables behind every review, every offer, and every routed outcome.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.07}>
          {principles.map((p, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="group h-full p-8 bg-background rounded-lg border border-border/40 hover:border-primary/25 transition-all duration-300 relative overflow-hidden"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                data-testid={`pegasus-principle-${index}`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/0 group-hover:bg-primary/60 transition-all duration-400" />
                <span className="text-[10px] text-primary/50 font-semibold tracking-[0.25em] uppercase mb-5 block">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-serif text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
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

function EveryPropertyGetsAPathSection() {
  const questions = [
    { q: "What is the property?", desc: "Type, condition, location, and basic characteristics." },
    { q: "What is the situation?", desc: "Motivation, urgency, encumbrances, and owner circumstances." },
    { q: "What does the owner want?", desc: "Speed, price, flexibility, certainty, or something else." },
    { q: "What is the best economic path?", desc: "Acquisition, wholesale, hold, list, or hybrid strategy." },
    { q: "What is the safest structure?", desc: "Cash, creative finance, JV, assignment, or referral." },
    { q: "Should Pegasus participate?", desc: "Honest assessment of fit, capacity, and value-add." },
  ];

  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Strategy Review</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-[-0.02em] mb-6">
            Every property gets a path.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Pegasus is not locked to one real estate strategy. We review each property based on the situation, seller goals, economic path, safest structure, and whether Pegasus is the right participant.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
          {questions.map((item, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="group p-7 bg-card rounded-lg border border-border/40 hover:border-primary/20 transition-all duration-300 h-full relative overflow-hidden"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                data-testid={`strategy-question-${index}`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/0 group-hover:bg-primary/50 transition-all duration-400 rounded-full" />
                <span className="text-[10px] text-primary/50 font-semibold tracking-[0.25em] uppercase mb-4 block">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-semibold text-base mb-2.5 group-hover:text-primary transition-colors duration-300">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <ScrollReveal delay={0.3} className="text-center mt-12">
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Not every property gets an offer. <span className="text-foreground font-medium">Every property gets a serious review.</span> If there is a path, Pegasus helps identify it. If there is not, we tell the truth and route the opportunity to its next best lawful path.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

function OutcomeLanesSection() {
  const primaryLanes = [
    { icon: Building, title: "Pegasus Acquisition", desc: "We purchase directly where the numbers, scope, and execution path are clear." },
    { icon: Handshake, title: "Wholesale Assignment", desc: "Off-market assignment to a qualified buyer in our private network." },
    { icon: Users, title: "JV / Partnership", desc: "Joint venture or co-GP structure for aligned operator and capital arrangements." },
    { icon: TrendingUp, title: "KW Listing Lane", desc: "Traditional MLS listing through our Keller Williams partnership where appropriate." },
  ];

  const secondaryLanes = [
    { title: "Referral Lane", desc: "Routed to a trusted professional when Pegasus is not the right fit." },
    { title: "MarketFlow Distribution", desc: "Private deal distribution to vetted network participants." },
    { title: "Incubation / Nurture", desc: "Long-horizon situations held and revisited as conditions change." },
    { title: "Archive Intelligence", desc: "Documented and stored. Every deal informs the next." },
  ];

  return (
    <section className="py-24 lg:py-32 bg-muted/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="mb-14">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">No Lead Dies</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-[-0.02em] mb-4">
            One property. Multiple possible paths.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Every accepted property routes to one of eight monetization lanes within 24 business hours. Pegasus does not compete by making the fastest lowball offer. We compete by seeing what others miss.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6" staggerDelay={0.08}>
          {primaryLanes.map((lane, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="group p-7 bg-card rounded-lg border border-border/40 hover:border-primary/25 hover:shadow-lg transition-all duration-300 h-full"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                data-testid={`outcome-lane-${index}`}
              >
                <lane.icon className="w-5 h-5 text-primary/55 mb-6 group-hover:text-primary transition-colors duration-300" />
                <h3 className="font-semibold text-base mb-2.5 group-hover:text-primary transition-colors duration-300">{lane.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{lane.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <ScrollReveal delay={0.2}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {secondaryLanes.map((lane, index) => (
              <motion.div
                key={index}
                className="p-5 bg-card/60 rounded-lg border border-border/30 hover:border-primary/20 transition-all duration-300"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                data-testid={`secondary-lane-${index}`}
              >
                <h4 className="font-medium text-sm mb-1.5">{lane.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{lane.desc}</p>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function StatsSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const stats = [
    { value: "No Lead Dies", label: "Every Property Gets a Path", icon: Target, key: "stats.0" },
    { value: "East Bay", label: "Founder-Led, Locally Rooted", icon: Building, key: "stats.1" },
    { value: "Three Pillars", label: "Development • Investments • Systems", icon: Star, key: "stats.2" },
    { value: "Private Beta", label: "MarketFlow · Private Network Only", icon: Clock, key: "stats.3" },
  ];

  return (
    <section className="py-0 bg-card border-b border-border/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border/40">
          {stats.map((stat, index) => {
            const displayValue = getValue(`home.${stat.key}.value`) || stat.value;
            const displayLabel = getValue(`home.${stat.key}.label`) || stat.label;
            
            return (
              <motion.div
                key={index}
                className="px-6 lg:px-10 xl:px-14 py-12 group cursor-default"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <div className="font-serif text-2xl sm:text-3xl lg:text-[1.85rem] font-semibold text-foreground mb-3 tracking-tight leading-tight group-hover:text-primary transition-colors duration-300" data-testid={`stat-value-${index}`}>
                  {isEditMode ? (
                    <EditableText 
                      contentKey={`home.${stat.key}.value`} 
                      fallback={String(stat.value)}
                    />
                  ) : (
                    displayValue
                  )}
                </div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-medium leading-relaxed">
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
            );
          })}
        </div>
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
              <EditableText contentKey="home.testimonials.description" fallback="The standards guiding Pegasus DreamScapes as we build, invest, and systemize real estate execution." as="p" multiline />
            ) : (
              <p>{getValue("home.testimonials.description") || "The standards guiding Pegasus DreamScapes as we build, invest, and systemize real estate execution."}</p>
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
                    className="max-w-3xl mx-auto p-12 lg:p-16 bg-background rounded-lg border border-border/40 relative"
                    data-testid={`testimonial-card-${index}`}
                  >
                    <Quote className="w-6 h-6 text-primary/30 mx-auto mb-8" />
                    <p className="font-serif text-foreground leading-relaxed text-xl lg:text-2xl text-center italic mb-10 font-light tracking-wide">
                      "{testimonial.quote}"
                    </p>
                    
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-px bg-primary/40 mx-auto" />
                      <p className="font-semibold text-foreground text-base tracking-wide">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">{testimonial.role}</p>
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
  
  const heroKicker = getValue("home.hero.kicker", "Pegasus DreamScapes Corp. · Development · Investments · Systems");
  const heroLine1 = getValue("home.hero.line1", "Complex property.");
  const heroLine2 = getValue("home.hero.line2", "Structured opportunity.");
  const heroLine3 = getValue("home.hero.line3", "");
  const heroSubheadline = getValue("home.hero.subheadline", "Pegasus DreamScapes Corp. is a strategy-first real estate operating company. We review property, development, capital, and partnership opportunities, then design the right path forward.");
  const heroCtaPrimary = getValue("home.hero.cta_primary", "Start a Strategy Review");
  const heroCtaSecondary = getValue("home.hero.cta_secondary", "View Featured Project");
  const heroPhilosophical = "Built on strategy. Governed by virtue. Executed with discipline.";
  
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
            {/* Eyebrow tag — featured project anchor */}
            <motion.div
              className="flex items-center gap-3 mb-7"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              data-testid="hero-eyebrow"
            >
              <span className="h-px w-8 bg-copper" />
              <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.18em] text-copper font-semibold font-supporting">
                Featured · Nelson Dr · Richmond CA
              </p>
            </motion.div>

            {/* Premium headline — line 1 cream serif, line 2 italic gold gradient */}
            <h1 className="font-serif font-semibold mb-8 text-white [font-size:clamp(48px,7vw,96px)] [line-height:0.95] [letter-spacing:-0.02em]" data-testid="text-hero-headline">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                {isEditMode ? (
                  <EditableText contentKey="home.hero.line1" fallback="Complex property." />
                ) : heroLine1}
              </motion.span>
              <motion.span
                className="block italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                {isEditMode ? (
                  <EditableText contentKey="home.hero.line2" fallback="Structured opportunity." />
                ) : heroLine2}
              </motion.span>
            </h1>

            {/* Shortened body line — strategy-first positioning */}
            <motion.p
              className="text-lg sm:text-xl text-white/95 max-w-2xl mb-7 leading-relaxed font-normal [text-shadow:0_2px_14px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.75 }}
              data-testid="text-hero-subheadline"
            >
              A strategy-first real estate operating company. We review the situation. Then we design the path.
            </motion.p>

            {/* Philosophical line (locked v1.3.1) + brand tagline */}
            <motion.div
              className="mb-10 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <p
                className="font-serif text-base sm:text-lg text-white/95 italic tracking-wide leading-snug [text-shadow:0_2px_16px_rgba(0,0,0,0.55)]"
                data-testid="text-hero-philosophical"
              >
                {heroPhilosophical}
              </p>
              <div className="flex items-center gap-3" data-testid="text-hero-tagline">
                <span className="h-px w-8 bg-copper/70" />
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.4em] text-copper/90 font-medium font-supporting">
                  Dream it. Build it. Live it.
                </p>
              </div>
            </motion.div>

            {/* Premium CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.05 }}
            >
              <a href="/sell">
                <Button size="lg" className="text-sm uppercase tracking-[0.15em] px-10 py-7 w-full sm:w-auto bg-copper text-white hover:bg-copper/90 font-semibold shadow-2xl shadow-black/30 transition-all duration-300 hover:-translate-y-0.5" data-testid="button-hero-sell">
                  {isEditMode ? (
                    <EditableText contentKey="home.hero.cta_primary" fallback="Start a Strategy Review" />
                  ) : heroCtaPrimary}
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </a>
              <a href="#projects">
                <Button size="lg" variant="outline" className="text-sm uppercase tracking-[0.15em] px-10 py-7 w-full sm:w-auto border-white/30 text-white hover:bg-white/10 backdrop-blur-md font-semibold transition-all duration-300 hover:-translate-y-0.5" data-testid="button-hero-invest">
                  {isEditMode ? (
                    <EditableText contentKey="home.hero.cta_secondary" fallback="View Featured Project" />
                  ) : heroCtaSecondary}
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </a>
            </motion.div>

            {/* Slim bottom row: location chips · 4-stat strip */}
            <motion.div
              className="mt-14 pt-7 border-t border-white/10 flex flex-col lg:flex-row lg:items-center gap-y-6 lg:gap-x-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              data-testid="hero-bottom-row"
            >
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/70 font-supporting" data-testid="hero-location-chips">
                <MapPin className="w-3 h-3 text-copper/80" />
                <span>Pleasant Hill</span>
                <span className="text-white/25">·</span>
                <span>East Bay</span>
                <span className="text-white/25">·</span>
                <span>California</span>
              </div>
              <div className="hidden lg:block h-6 w-px bg-white/15" aria-hidden="true" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-4 sm:gap-x-2 flex-1" data-testid="hero-stats-preview">
                <div className="sm:pr-5 sm:border-r sm:border-white/15" data-testid="hero-stat-strategy">
                  <p className="font-serif text-base sm:text-lg font-medium text-white leading-none mb-1.5">Strategy First</p>
                  <p className="text-[10px] text-white/45 uppercase tracking-[0.22em]">Operating Doctrine</p>
                </div>
                <div className="sm:pl-5 sm:pr-5 sm:border-r sm:border-white/15" data-testid="hero-stat-pillars">
                  <p className="font-serif text-base sm:text-lg font-medium text-white leading-none mb-1.5">3 Pillars</p>
                  <p className="text-[10px] text-white/45 uppercase tracking-[0.22em]">Develop · Invest · System</p>
                </div>
                <div className="sm:pl-5 sm:pr-5 sm:border-r sm:border-white/15" data-testid="hero-stat-lanes">
                  <p className="font-serif text-base sm:text-lg font-medium text-white leading-none mb-1.5">8 Lanes</p>
                  <p className="text-[10px] text-white/45 uppercase tracking-[0.22em]">Outcome Paths</p>
                </div>
                <div className="sm:pl-5" data-testid="hero-stat-pathway">
                  <p className="font-serif text-base sm:text-lg font-medium text-white leading-none mb-1.5">4 Phases</p>
                  <p className="text-[10px] text-white/45 uppercase tracking-[0.22em]">Development Pathway</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Premium accent bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-tan to-champagne" />
    </section>
  );
}

function ServicesSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const services = [
    {
      image: serviceImage1,
      title: "Real Estate Development",
      description: "We execute value-add, fix-and-flip, BRRRR, ADU, and development strategies where the numbers, scope, and execution path are clear. Every project goes through disciplined underwriting before a dollar is committed.",
      cta: "View Projects",
      ctaLink: "/projects",
      accent: "Development",
      key: "service.0",
    },
    {
      image: serviceImage2,
      title: "Strategic Investments",
      description: "We structure private, deal-specific capital and partnership conversations around real opportunities, documented risks, and lawful execution. Private partner conversations only. No public investment offering.",
      cta: "Partner Inquiry",
      ctaLink: "/invest",
      accent: "Investments",
      key: "service.1",
    },
    {
      image: serviceImage1,
      title: "Pegasus Systems",
      description: "MarketFlow, intake workflows, and the operating layer behind every Pegasus deal. The infrastructure that turns scattered situations into routed outcomes, and the foundation we build the rest of the company on.",
      cta: "Enter MarketFlow",
      ctaLink: "/marketflow",
      accent: "Systems",
      key: "service.2",
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
                <EditableText contentKey="home.services.kicker" fallback="The Three Pillars" />
              ) : (getValue("home.services.kicker") || "The Three Pillars")}
            </p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em]" data-testid="text-services-title">
            {isEditMode ? (
              <EditableText contentKey="home.services.title" fallback="Development. Investments. Systems." />
            ) : (getValue("home.services.title") || "Development. Investments. Systems.")}
          </h2>
          <div className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {isEditMode ? (
              <EditableText contentKey="home.services.description" fallback="Three pillars, one operating company. We design, fund, and execute real estate projects with the discipline of a developer, the structure of an investment firm, and the systems of a tech operator." as="p" multiline />
            ) : (
              <p>{getValue("home.services.description") || "Three pillars, one operating company. We design, fund, and execute real estate projects with the discipline of a developer, the structure of an investment firm, and the systems of a tech operator."}</p>
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
            Featured Project: Nelson Dr
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
              A value-add residential project used to sharpen the Pegasus operating model: acquisition strategy, renovation planning, capital discipline, and resale execution. Every phase documented, every decision deliberate.
            </p>

            <div className="flex flex-wrap gap-2">
              {["Kitchen Remodel", "Bath Updates", "New Flooring", "Exterior Refresh"].map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-background text-foreground border border-border/50 rounded-md text-sm font-medium">{tag}</span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-8 py-8 border-t border-border/30">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Strategy Model</p>
                <p className="font-semibold">Fix & Flip</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Structure</p>
                <p className="font-semibold">Direct Acquisition</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Stage</p>
                <p className="font-semibold text-primary">Execution</p>
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
                <EditableText contentKey="home.sell.kicker" fallback="Property Owners" />
              ) : "Property Owners"}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 tracking-[-0.02em]" data-testid="text-sell-title">
              {isEditMode ? (
                <EditableText contentKey="home.sell.title" fallback="Submit Your Property" />
              ) : "Submit Your Property"}
            </h2>
            <div className="text-base text-muted-foreground leading-relaxed mb-10">
              {isEditMode ? (
                <EditableText 
                  contentKey="home.sell.description" 
                  fallback="Every property gets a serious review. Not every property gets an offer. Submit your situation and Pegasus will assess the right path, whether that's acquisition, wholesale, listing, or a referral to the best next resource."
                  multiline
                  as="p"
                />
              ) : (
                <p>Every property gets a serious review. Not every property gets an offer. Submit your situation and Pegasus will assess the right path, whether that's acquisition, wholesale, listing, or a referral to the best next resource.</p>
              )}
            </div>
            
            <div className="space-y-7">
              <div className="pl-5 border-l border-primary/25">
                <h4 className="font-semibold mb-1.5">Honest Strategy Review</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Transparent assessment based on real market data and your actual situation</p>
              </div>
              <div className="pl-5 border-l border-primary/25">
                <h4 className="font-semibold mb-1.5">Multi-Path Underwriting</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">We evaluate every option. Not just the one that's fastest for us</p>
              </div>
              <div className="pl-5 border-l border-primary/25">
                <h4 className="font-semibold mb-1.5">24-Hour Response</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Every submission reviewed and routed within one business day</p>
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
                    {mutation.isPending ? "Submitting..." : "Submit for Strategy Review"}
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
                <EditableText contentKey="home.invest.kicker" fallback="Private Partner Inquiry" />
              ) : "Private Partner Inquiry"}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 tracking-[-0.02em]" data-testid="text-invest-title">
              {isEditMode ? (
                <EditableText contentKey="home.invest.title" fallback="Deal-Specific Conversations" />
              ) : "Deal-Specific Conversations"}
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
            
            <div className="space-y-7">
              <div className="pl-5 border-l border-primary/25">
                <h4 className="font-semibold mb-1.5">Disciplined Analysis</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Clear underwriting and execution planning on every opportunity</p>
              </div>
              <div className="pl-5 border-l border-primary/25">
                <h4 className="font-semibold mb-1.5">Transparent Underwriting</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Transparent process and documentation standards</p>
              </div>
              <div className="pl-5 border-l border-primary/25">
                <h4 className="font-semibold mb-1.5">Partner-First Approach</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">We succeed when our partners succeed</p>
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
      description: "We don't just renovate properties. We elevate neighborhoods. Every project considers its impact on the surrounding community.",
      icon: Heart,
      key: "philosophy.principle.2",
    },
    {
      number: "04",
      title: "Sustainable Returns",
      description: "We balance aggressive opportunity pursuit with risk management. Our goal is consistent, long-term wealth building, not quick wins.",
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
                <EditableText contentKey="home.philosophy.description" fallback="We believe successful real estate investing requires more than capital. It demands discipline, transparency, and a commitment to creating lasting value for all stakeholders." as="p" multiline />
              ) : (
                <p>{getValue("home.philosophy.description") || "We believe successful real estate investing requires more than capital. It demands discipline, transparency, and a commitment to creating lasting value for all stakeholders."}</p>
              )}
            </div>
            
            {/* Mission statement card */}
            <div className="p-8 bg-card rounded-lg border border-border/50 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Quote className="w-4 h-4 text-primary" />
              </div>
              <div className="text-base text-foreground leading-relaxed italic">
                {isEditMode ? (
                  <EditableText contentKey="home.philosophy.quote" fallback="We design profits with intention, creating win–win outcomes for sellers, investors, and the communities we serve." as="p" multiline />
                ) : (
                  <p>"{getValue("home.philosophy.quote") || "We design profits with intention, creating win–win outcomes for sellers, investors, and the communities we serve."}"</p>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-4">— Pegasus DreamScapes</p>
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
      title: "Submit Your Situation",
      description: "Property owners submit their situation. Wholesalers and deal sources submit opportunities. Every intake is reviewed seriously within one business day.",
      icon: FileCheck,
      key: "howitworks.step.0",
    },
    {
      number: "02",
      title: "Strategy Review",
      description: "Pegasus evaluates the property, situation, owner goals, economic path, and safest structure. Six questions. Honest answers. No performance for the seller.",
      icon: Search,
      key: "howitworks.step.1",
    },
    {
      number: "03",
      title: "Route to Best Path",
      description: "Every accepted opportunity routes to one of eight monetization lanes within 24 business hours: acquisition, wholesale, JV, listing, referral, MarketFlow, incubation, or archive.",
      icon: Target,
      key: "howitworks.step.2",
    },
    {
      number: "04",
      title: "Execute with Discipline",
      description: "The selected lane gets a documented plan, assigned ownership, and accountable execution. Every dollar has a place. Every action has an owner.",
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
              <EditableText contentKey="home.howitworks.title" fallback="The Pegasus Process" />
            ) : (getValue("home.howitworks.title") || "The Pegasus Process")}
          </h2>
          <div className="text-lg text-muted-foreground leading-relaxed">
            {isEditMode ? (
              <EditableText contentKey="home.howitworks.description" fallback="Every property situation enters a structured intake, review, routing, and execution process. No lead dies. Every deal gets a plan." as="p" multiline />
            ) : (
              <p>{getValue("home.howitworks.description") || "Every property situation enters a structured intake, review, routing, and execution process. No lead dies. Every deal gets a plan."}</p>
            )}
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />
          
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerDelay={0.12}>
            {steps.map((step, index) => (
              <StaggerItem key={index}>
                <motion.div 
                  className="group relative bg-card p-8 rounded-lg border border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300 h-full overflow-hidden"
                  data-testid={`how-it-works-step-${index}`}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Large ghosted step number */}
                  <span className="absolute -top-3 -right-1 font-serif text-8xl font-bold text-foreground/[0.04] group-hover:text-primary/[0.07] transition-colors duration-500 select-none pointer-events-none leading-none">
                    {step.number}
                  </span>
                  
                  <step.icon className="w-5 h-5 text-primary/55 mb-6 group-hover:text-primary transition-colors duration-300" />
                  <h3 className="text-lg font-semibold mb-2.5">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>

        <ScrollReveal delay={0.4} className="text-center mt-16">
          <a href="#sell">
            <Button size="lg" className="text-sm uppercase tracking-widest font-medium group" data-testid="button-submit-property">
              Submit a Property
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}

function TrustLogosSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  
  const trustItems = [
    { icon: Shield, label: "Compliance-Aware", description: "Licensing handled per applicable requirements", key: "trust.0" },
    { icon: Award, label: "Vetted Review", description: "Every deal undergoes disciplined underwriting", key: "trust.1" },
    { icon: Users, label: "Private Network", description: "MarketFlow is invite-only in v1", key: "trust.2" },
    { icon: CheckCircle2, label: "Founder-Led", description: "Accountability stays close to every decision", key: "trust.3" },
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
  
  const impactStats = [
    { value: "Strategy", label: "First, Always", key: "community.stat.0" },
    { value: "Every", label: "Property Gets a Path", key: "community.stat.1" },
    { value: "Every", label: "Deal Gets a Plan", key: "community.stat.2" },
    { value: "Every", label: "Dollar Has a Place", key: "community.stat.3" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Discipline Before Scale",
      description: "We prioritize process quality, underwriting discipline, and execution standards before growth metrics. Scale follows discipline.",
      key: "community.value.0",
    },
    {
      icon: Shield,
      title: "Clear Numbers, Clear Process",
      description: "Every opportunity is reviewed with clear numbers, assumptions, and next-step documentation. No performance. No pressure.",
      key: "community.value.1",
    },
    {
      icon: Sparkles,
      title: "Built for Long-Term Value",
      description: "Durable value creation through disciplined project planning and accountable execution. Not quick wins or inflated numbers.",
      key: "community.value.2",
    },
    {
      icon: Users,
      title: "Founder-Led Accountability",
      description: "Pegasus is founder-led and accountability stays close to decision-making from intake through delivery. Every action has an owner.",
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
                <EditableText contentKey="home.community.kicker" fallback="Our Commitment" />
              ) : (getValue("home.community.kicker") || "Our Commitment")}
            </span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-[-0.02em]" data-testid="text-community-title">
            {isEditMode ? (
              <EditableText contentKey="home.community.title" fallback="Operating Principles" />
            ) : (getValue("home.community.title") || "Operating Principles")}
          </h2>
          <div className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {isEditMode ? (
              <EditableText contentKey="home.community.description" fallback="We find opportunity where others see impossible. Every property gets a path. Every deal gets a plan. Every dollar has a place. Every action has an owner." as="p" multiline />
            ) : (
              <p>{getValue("home.community.description") || "We find opportunity where others see impossible. Every property gets a path. Every deal gets a plan. Every dollar has a place. Every action has an owner."}</p>
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
          <p className="text-muted-foreground mb-6">Have a property situation worth reviewing?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#sell">
              <Button size="lg" className="group" data-testid="button-community-submit">
                Submit a Property
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="#contact">
              <Button variant="outline" size="lg" data-testid="button-community-contact">
                Contact Pegasus
              </Button>
            </a>
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
    question: "Does Pegasus buy every property it reviews?",
    answer: "No. Not every property gets an offer, but every property gets a serious review. Pegasus evaluates each situation and routes it to the best lawful path. If we are not the right operator, we will tell you that directly and help you find the next best option."
  },
  {
    question: "What is the strategy review process?",
    answer: "When you submit a property, we evaluate six questions: What is the property? What is the situation? What does the owner want? What is the best economic path? What is the safest structure? And should Pegasus participate? Honest answers drive every decision."
  },
  {
    question: "What are the eight outcome lanes?",
    answer: "Every accepted property routes to one of eight lanes within 24 business hours: Pegasus Acquisition, Wholesale Assignment, JV/Partnership, KW Listing Lane, Referral Lane, MarketFlow Private Distribution, Incubation/Nurture, or Archive Intelligence. No lead dies."
  },
  {
    question: "What is MarketFlow and is it public?",
    answer: "MarketFlow is the private dealflow layer of Pegasus Systems. In v1, it is a private network and controlled review system. Not a public marketplace. Access is by invitation or role-based approval. Public marketplace launch is gated on broker compliance review."
  },
  {
    question: "How does Pegasus handle investor partnerships?",
    answer: "Pegasus conducts private, deal-specific conversations with aligned operators and investors. Every opportunity is subject to diligence, documentation, legal review, and suitability. Nothing should sound like a public investment offering, because it is not one."
  },
  {
    question: "What types of properties does Pegasus work with?",
    answer: "Pegasus focuses on residential properties in the East Bay and broader Bay Area where a clear value-add, acquisition, or disposition path exists. We also review distressed, inherited, and off-market properties. If there is a path, we help identify it."
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
              <EditableText contentKey="home.newsletter.title" fallback="Stay Inside the Network" />
            ) : (getValue("home.newsletter.title") || "Stay Inside the Network")}
          </h2>
          <div className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            {isEditMode ? (
              <EditableText contentKey="home.newsletter.description" fallback="Get updates on deal flow, strategy insights, and MarketFlow private beta access. No spam. No hype. Just disciplined real estate intelligence." as="p" multiline />
            ) : (
              <p>{getValue("home.newsletter.description") || "Get updates on deal flow, strategy insights, and MarketFlow private beta access. No spam. No hype. Just disciplined real estate intelligence."}</p>
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
                <EditableText contentKey="home.contact.title" fallback="Have a Property Worth Reviewing?" />
              ) : (getValue("home.contact.title") || "Have a Property Worth Reviewing?")}
            </h2>
            <div className="text-lg text-muted-foreground leading-relaxed mb-12">
              {isEditMode ? (
                <EditableText contentKey="home.contact.description" fallback="Submit a property situation, inquire about a private partnership, or reach out about wholesale deals and MarketFlow access. Every message gets a direct, honest response." as="p" multiline />
              ) : (
                <p>{getValue("home.contact.description") || "Submit a property situation, inquire about a private partnership, or reach out about wholesale deals and MarketFlow access. Every message gets a direct, honest response."}</p>
              )}
            </div>
            
            <div className="space-y-6">
                            <motion.a 
                href={`mailto:${(getValue("home.contact.email") || "apollo@pegasusdreamscapes.com").trim()}`}
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
                      <EditableText contentKey="home.contact.email" fallback="apollo@pegasusdreamscapes.com" />
                    ) : (getValue("home.contact.email") || "apollo@pegasusdreamscapes.com")}
                  </div>
                </div>
              </motion.a>
              <motion.a
                href={`tel:${(getValue("home.contact.phone") || "+19259486566").replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-5 p-4 rounded-lg hover:bg-card transition-colors duration-200 group"
                whileHover={{ x: 4 }}
                data-testid="link-contact-phone"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-lg transition-all duration-300">
                  <Phone className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Direct Line</p>
                  <div className="font-semibold text-lg">
                    {isEditMode ? (
                      <EditableText contentKey="home.contact.phone" fallback="925-948-6566" />
                    ) : (getValue("home.contact.phone") || "925-948-6566")}
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
