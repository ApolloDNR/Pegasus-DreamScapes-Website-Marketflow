import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import {
  ArrowRight,
  FileText,
  Compass,
  Users,
  Briefcase,
  Target,
  Layers,
  GitBranch,
  Map,
  ShieldAlert,
  Route,
  ClipboardList,
  CheckCircle2,
  Lock,
  BookOpen,
} from "lucide-react";
import heroImage from "@assets/generated_images/luxury_home_at_dusk_with_warm_lighting.png";

export default function DealBlueprint() {
  useSEO({
    title: "Pegasus Deal Blueprint — Strategic Planning Report | Pegasus Dreamscapes",
    description:
      "The Pegasus Deal Blueprint is a paid strategic planning report that follows the free Property Strategy Snapshot. Structured strategy, scenario ranges, scope, and execution roadmap on paper.",
  });

  return (
    <div className="min-h-screen">
      <h1 className="sr-only">Pegasus Deal Blueprint</h1>
      <HeroSection />
      <WhatItIsSection />
      <WhoItIsForSection />
      <TiersSection />
      <WhatsIncludedSection />
      <DisclaimerSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[78vh] flex items-center overflow-hidden pt-20">
      <motion.div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${heroImage})` }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

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
                <FileText className="w-3 h-3 text-champagne" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-champagne font-semibold">Strategic Planning Report</span>
              </span>
              <span className="text-xs uppercase tracking-[0.25em] text-white/60">Paid · Follows the free Snapshot</span>
            </motion.div>

            <motion.h1
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[0.95] tracking-[-0.02em] mb-8 [text-shadow:0_2px_14px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              data-testid="text-blueprint-hero"
            >
              The Pegasus<br />
              <span className="bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
                Deal Blueprint.
              </span>
            </motion.h1>

            <motion.p
              className="font-serif text-lg sm:text-xl text-white/90 italic max-w-2xl mb-4 leading-snug"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
            >
              The strategic plan a complex property deserves, on paper.
            </motion.p>

            <motion.p
              className="text-base sm:text-lg text-white/85 max-w-2xl mb-10 leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              The Deal Blueprint is the paid roadmap that follows the free Property Strategy Snapshot. It documents the recommended strategy, the structures that fit, the market context, the scenario ranges, the scope assumptions, the budget framework, the risks, and the execution path, in one report you can read, share, and act on.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
            >
              <Link href="/sell">
                <Button
                  size="lg"
                  className="text-sm uppercase tracking-[0.15em] px-10 py-7 bg-white text-slate-900 hover:bg-white/95 font-semibold shadow-2xl shadow-black/20 w-full sm:w-auto"
                  data-testid="button-blueprint-start-snapshot"
                >
                  Start with a Free Snapshot
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </Link>
              <a href="#tiers">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-sm uppercase tracking-[0.15em] px-10 py-7 border-white/30 text-white hover:bg-white/10 backdrop-blur-md font-semibold"
                  data-testid="button-blueprint-see-tiers"
                >
                  See Blueprint Tiers
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
                  How the Blueprint fits
                </p>
                <div className="space-y-5">
                  {[
                    { kicker: "Step 1", title: "Free Strategy Snapshot", desc: "We triage every property submitted through /sell: direction, lane, plain-language read." },
                    { kicker: "Step 2", title: "Pegasus Deal Blueprint", desc: "If the situation warrants it, you commission the full strategic plan in writing." },
                    { kicker: "Step 3", title: "Execution Conversation", desc: "Pegasus operates, partners, refers, or steps aside, informed by the report." },
                  ].map((item, i) => (
                    <div key={i} className="pb-5 border-b border-white/15 last:border-0 last:pb-0">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-champagne font-semibold mb-1.5">{item.kicker}</p>
                      <p className="font-serif text-lg text-white mb-1">{item.title}</p>
                      <p className="text-sm text-white/85 leading-relaxed">{item.desc}</p>
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

function WhatItIsSection() {
  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-6xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="max-w-3xl mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">What It Is</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-6">
            A strategic planning report.<br />
            <span className="text-headline-gold">Not advice. Not a transaction.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            The Pegasus Deal Blueprint is a written, structured plan. The kind of document we use internally before we put our own time, capital, or operators on a project. It documents how we would approach the situation, what the realistic paths look like, and what each path would require.
          </p>
          <p className="text-base text-muted-foreground/85 leading-relaxed">
            The Blueprint is built by humans who do this work. It is opinionated, specific, and grounded in the property in front of us. Never a generic template.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid sm:grid-cols-3 gap-5" staggerDelay={0.08}>
          {[
            { icon: Compass, title: "Strategic, not tactical", desc: "How to think about the property, not which contractor to call on Tuesday." },
            { icon: FileText, title: "Documented, not verbal", desc: "A report you can re-read, share with a partner, and act on with discipline." },
            { icon: Target, title: "Specific, not generic", desc: "Built around your address, your situation, your constraints, not a checklist." },
          ].map((item, i) => (
            <StaggerItem key={i}>
              <div className="h-full p-7 bg-card rounded-lg border border-border/40" data-testid={`what-it-is-${i}`}>
                <item.icon className="w-5 h-5 text-primary/60 mb-5" />
                <h3 className="font-semibold text-base mb-2.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function WhoItIsForSection() {
  const audiences = [
    {
      icon: Users,
      kicker: "Owners",
      title: "Property owners with a complex situation",
      desc: "Distressed, inherited, mid-rehab, code-issued, ADU-eligible, or just structurally unusual. Owners who want a real plan before they make an irreversible decision.",
    },
    {
      icon: GitBranch,
      kicker: "Deal Sources",
      title: "Wholesalers and deal sources routing complex deals",
      desc: "Submitters who have a property that doesn't fit a clean cash-buyer box and want a structured second opinion before pricing or papering it.",
    },
    {
      icon: Briefcase,
      kicker: "Partners",
      title: "Capital and operating partners scoping a project",
      desc: "Partners considering a project alongside Pegasus or independently who want a written, opinionated plan to underwrite against, before any structure is discussed.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-muted/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Who It Is For</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Three people benefit most.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The Blueprint is built for situations where the answer is not obvious, and where getting it wrong is expensive.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
          {audiences.map((a, i) => (
            <StaggerItem key={i}>
              <div className="h-full p-8 bg-card rounded-lg border border-border/40" data-testid={`audience-${i}`}>
                <div className="flex items-baseline justify-between mb-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-semibold">{a.kicker}</p>
                  <a.icon className="w-5 h-5 text-primary/55" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3 tracking-tight">{a.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function TiersSection() {
  const tiers = [
    {
      kicker: "Tier 1",
      name: "Single-Path Blueprint",
      tagline: "One strategy, fully scoped.",
      desc: "The most likely path for this property, documented in full: strategy, structure, scope, budget, risks, exit. Built when the right path is already obvious and what's needed is the plan, not the comparison.",
      bullets: [
        "One recommended strategy, scoped end-to-end",
        "Structure options that fit that strategy",
        "Scope assumptions, budget framework, risk register",
        "Execution roadmap with sequenced milestones",
      ],
    },
    {
      kicker: "Tier 2",
      name: "Comparison Blueprint",
      tagline: "Two paths, side by side.",
      desc: "Two viable strategies modeled in parallel so you can read the trade-offs in writing. Built when the property could go more than one direction and the decision needs structured comparison, not gut feel.",
      bullets: [
        "Two recommended strategies, both scoped",
        "Side-by-side scenario ranges and scope assumptions",
        "Risk register comparing each path",
        "A reasoned recommendation between the two",
      ],
      featured: true,
    },
    {
      kicker: "Tier 3",
      name: "Complete Blueprint",
      tagline: "Every viable path, fully mapped.",
      desc: "All viable strategies for the property, scoped and compared, with structure options for each and a sequenced execution roadmap for the recommended path. Built when the situation is complex enough that you need every option on paper before deciding.",
      bullets: [
        "All viable strategies, individually scoped",
        "Full structure menu mapped to each strategy",
        "Comprehensive scenario ranges and scope assumptions",
        "Risk register, exit paths, and full execution roadmap",
      ],
    },
  ];

  return (
    <section id="tiers" className="py-24 lg:py-32 bg-background relative overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="max-w-3xl mb-14">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">The Tiers</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Three levels of strategic depth.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Pick the depth that matches the decision in front of you. We'll recommend a tier in your free Snapshot if one fits.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
          {tiers.map((tier, i) => (
            <StaggerItem key={i}>
              <motion.div
                className={`group h-full p-8 bg-card rounded-lg border transition-all duration-300 ${
                  tier.featured ? "border-primary/40 shadow-lg shadow-primary/5" : "border-border/40 hover:border-primary/25"
                }`}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                data-testid={`tier-${i}`}
              >
                <div className="flex items-baseline justify-between mb-5">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-semibold">{tier.kicker}</p>
                  {tier.featured && (
                    <span className="text-[10px] uppercase tracking-[0.22em] text-primary/80 font-semibold border border-primary/30 px-2 py-0.5 rounded">
                      Most common
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-2 tracking-tight">{tier.name}</h3>
                <p className="font-serif text-sm text-foreground/70 italic mb-5">{tier.tagline}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{tier.desc}</p>

                <ul className="space-y-2.5 pt-5 border-t border-border/40 mb-6">
                  {tier.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                      <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-5 border-t border-border/40">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/60 font-semibold mb-1">Investment</p>
                  <p className="font-serif text-lg text-foreground" data-testid={`tier-pricing-${i}`}>
                    Pricing on request
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                    Quoted with the free Snapshot, scoped to the property.
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <ScrollReveal delay={0.3} className="mt-12 max-w-3xl">
          <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-5">
            Every Blueprint engagement starts with the free Property Strategy Snapshot. We will not quote a Blueprint until we have read the situation.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

function WhatsIncludedSection() {
  const items = [
    { icon: Compass, title: "Strategy recommendation", desc: "The recommended path for the property, with the reasoning behind it." },
    { icon: Layers, title: "Structure options", desc: "The ownership and capital structures that fit the recommended strategy." },
    { icon: Map, title: "Market overview", desc: "The local market context the strategy depends on: submarket, comp set, demand signals." },
    { icon: Target, title: "Preliminary scenario ranges", desc: "Ranges, not pinpoints: basis, exit, timeline, capital exposure across realistic scenarios." },
    { icon: ClipboardList, title: "Scope assumptions", desc: "What the strategy assumes about scope, condition, permitting, and access." },
    { icon: Briefcase, title: "Budget framework", desc: "A structured framework for the budget, not a fixed-bid number. The categories and contingencies that matter." },
    { icon: ShieldAlert, title: "Risk register", desc: "The risks that could break the strategy and the conditions under which each is most likely to materialize." },
    { icon: Route, title: "Exit paths", desc: "Primary exit, secondary exit, and the conditions that would force a path change." },
    { icon: GitBranch, title: "Execution roadmap", desc: "The sequenced milestones from today to exit. What has to be true at each stage to keep the plan intact." },
  ];

  return (
    <section className="py-24 lg:py-32 bg-muted/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="max-w-3xl mb-14">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">What's Included</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Nine sections. One report.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Every Blueprint, regardless of tier, is built around the same nine sections. Tiers determine how many strategies are scoped, not whether the structure is complete.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.05}>
          {items.map((item, i) => (
            <StaggerItem key={i}>
              <div
                className="group h-full p-6 bg-card rounded-lg border border-border/40 hover:border-primary/25 transition-all duration-300"
                data-testid={`included-${i}`}
              >
                <div className="flex items-baseline justify-between mb-5">
                  <span className="font-serif text-2xl text-primary/30 group-hover:text-primary/60 transition-colors">
                    0{i + 1}
                  </span>
                  <item.icon className="w-4 h-4 text-primary/55 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function DisclaimerSection() {
  return (
    <section className="py-16 bg-muted/30 border-y border-border/40">
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/60" />
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">Important Disclosure</p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/60" />
        </div>
        <p className="text-base text-foreground/85 text-center leading-relaxed font-serif italic" data-testid="text-blueprint-disclaimer">
          The Pegasus Deal Blueprint is a strategic planning report. It is not legal, tax, appraisal, architectural, engineering, permit, securities, or contractor advice.
        </p>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-28 lg:py-40 bg-card relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-gradient-radial from-primary/10 via-primary/0 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-4xl mx-auto px-6 lg:px-12 relative text-center">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-8">Start the right way</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-[1.05] mb-8">
            Every Blueprint starts with<br />
            <span className="text-headline-gold">a free Snapshot.</span>
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
            Submit the property through Strategy Review. We'll triage it, return your free Snapshot, and, if it warrants one, quote the Blueprint scoped to the situation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/sell">
              <Button size="lg" className="w-full sm:w-auto px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-blueprint-cta-sell">
                Start a Strategy Review
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-blueprint-cta-contact">
                Ask a Question First
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-10 border-t border-border/40 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <Link href="/sell" className="hover:text-primary transition-colors inline-flex items-center gap-2" data-testid="link-blueprint-snapshot">
              <FileText className="w-3 h-3" />
              Free Snapshot
            </Link>
            <span className="hidden sm:inline text-border">·</span>
            <Link href="/projects" className="hover:text-primary transition-colors inline-flex items-center gap-2" data-testid="link-blueprint-projects">
              <BookOpen className="w-3 h-3" />
              Project Examples
            </Link>
            <span className="hidden sm:inline text-border">·</span>
            <Link href="/invest" className="hover:text-primary transition-colors inline-flex items-center gap-2" data-testid="link-blueprint-invest">
              <Lock className="w-3 h-3" />
              Capital &amp; Partnerships
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
