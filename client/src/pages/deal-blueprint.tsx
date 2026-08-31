import { Link } from "wouter";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/use-seo";
import {
  ScrollReveal,
  StaggerChildren,
  StaggerItem,
} from "@/components/animations";
import { CardSurface } from "@/components/ui/card-primitives";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Layers,
  ShieldCheck,
  MessageSquareQuote,
  CheckCircle2,
  Clock,
  PenLine,
} from "lucide-react";

// Empire Doctrine v1.0.2 + Phase 2 Copy Proposal — Surface 3.
// Pegasus Deal Blueprint is tier 03 of the Strategy Lab funnel.
// Free Quick Read (tier 01) and Full Path Analyzer (tier 02) live on
// /strategy-lab. This page describes the by-review, human-prepared memo
// that closes the loop when the free tiers aren't enough. Intake
// routes through /bring-an-opportunity?intent=blueprint, preserving
// Blueprint-specific triage in the canonical opportunity record.

function HeroSection() {
  return (
    <section className="relative bg-[hsl(var(--charcoal))] text-cream overflow-hidden border-b border-cream/10">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80rem] h-[40rem] bg-gradient-radial from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-32 lg:pt-40 pb-20 lg:pb-28">
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="h-px w-10 bg-primary" />
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold">
            Pegasus Deal Blueprint · Tier 03
          </p>
        </motion.div>

        <motion.h1
          className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-cream leading-[0.98] tracking-[-0.02em] mb-8 max-w-4xl [text-shadow:0_2px_14px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          data-testid="text-blueprint-hero"
        >
          When the Strategy Snapshot{" "}
          <span className="bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
            isn't enough.
          </span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-cream/85 max-w-3xl mb-6 leading-relaxed font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
        >
          A Deal Blueprint is a possible separately scoped written analysis for a
          specific property. Availability is reviewed case by case.
        </motion.p>
        <motion.p
          className="text-base text-cream/75 max-w-3xl mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          If Pegasus offers an engagement, the written scope identifies the
          author, included analysis, fee, timing, assumptions, and limitations.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
        >
          <Link href="/bring-an-opportunity?intent=blueprint">
            <Button
              size="lg"
              className="text-sm uppercase tracking-[0.15em] px-10 py-7 bg-white text-slate-900 hover:bg-white/95 font-semibold shadow-md shadow-black/20 w-full sm:w-auto"
              data-testid="button-blueprint-request"
            >
              Request a Deal Blueprint
              <ArrowRight className="ml-3 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/strategy-lab">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-sm uppercase tracking-[0.15em] px-10 py-7 border-cream/30 text-cream hover:bg-cream/10 backdrop-blur-md font-semibold"
              data-testid="button-blueprint-quick-read"
            >
              Run the Free Strategy Snapshot First
            </Button>
          </Link>
        </motion.div>
      </div>
      <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

function WhatsInside() {
  const sections = [
    {
      icon: FileText,
      tag: "01 · Underwriting",
      title: "The real numbers.",
      desc: "Possible acquisition, improvement, holding, and exit assumptions, with stated limits and sensitivity where scoped.",
    },
    {
      icon: Layers,
      tag: "02 · Structure",
      title: "Possible structures.",
      desc: "A comparison of relevant structures may be included when supported by the facts and written scope.",
    },
    {
      icon: ShieldCheck,
      tag: "03 · Risk Register",
      title: "Material risks.",
      desc: "Known title, scope, market, or counterparty risks may be identified, without replacing legal or specialist diligence.",
    },
    {
      icon: MessageSquareQuote,
      tag: "04 · Outreach Scripts",
      title: "Optional communication notes.",
      desc: "A scope may include non-legal discussion prompts for a seller, lender, or other counterparty.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="max-w-3xl mb-14">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">
              What's in a Blueprint
            </p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Possible sections, set by scope.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The final contents and delivery format exist only if confirmed in a written engagement.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid sm:grid-cols-2 gap-5" staggerDelay={0.08}>
          {sections.map((s, i) => (
            <StaggerItem key={i}>
              <CardSurface
                className="h-full p-7 border-border/40 hover:border-primary/30 transition-colors"
                data-testid={`blueprint-section-${i}`}
              >
                <div className="flex items-baseline justify-between mb-5">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold">
                    {s.tag}
                  </p>
                  <s.icon className="w-5 h-5 text-primary/55" />
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-3 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </CardSurface>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function WhenItsRight() {
  const fits = [
    "The path forward isn't obvious from a free run.",
    "The structure matters more than the price (creative finance, JV, complex chain-of-title).",
    "You're about to commit real money and want a second set of disciplined eyes.",
    "The seller or counterparty needs a written argument, not a verbal pitch.",
  ];

  return (
    <section className="py-24 lg:py-32 bg-muted/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <ScrollReveal className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
              <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">
                When this tier is right
              </p>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
              Most deals don't need a Blueprint.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              Start with the public Strategy Snapshot. A separate Blueprint may be
              considered when the facts call for deeper work.
            </p>
            <p className="text-base text-muted-foreground/85 leading-relaxed italic border-l-2 border-primary/40 pl-5">
              A request is not an order or acceptance. Pegasus may decline, request
              more information, or suggest a public self-service tool.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15} className="lg:col-span-7">
            <CardSurface className="p-8 lg:p-10 border-border/40" data-testid="blueprint-fit-list">
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold mb-6">
                Blueprint fits when
              </p>
              <ul className="space-y-4">
                {fits.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 text-base text-foreground/90 leading-relaxed"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardSurface>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      tag: "Step 01",
      icon: PenLine,
      title: "Submit the property.",
      desc: "Bring the address and the situation to the opportunity desk. Tell us it's for a Blueprint.",
    },
    {
      tag: "Step 02",
      icon: ShieldCheck,
      title: "Possible fit review.",
      desc: "Pegasus may review the intake for fit, information needs, and current capacity.",
    },
    {
      tag: "Step 03",
      icon: FileText,
      title: "Written terms, if offered.",
      desc: "Any offered engagement identifies the scope, author, fee, timing, and limitations before work begins.",
    },
    {
      tag: "Step 04",
      icon: CheckCircle2,
      title: "Work under the agreed scope.",
      desc: "Deliverables and any clarification period are limited to the signed terms; none are promised by this page.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="max-w-3xl mb-14">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">
              How it works
            </p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            From request to a possible engagement.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            There is no public turnaround commitment. Timing begins only after a
            written scope is accepted and required information is received.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerDelay={0.1}>
          {steps.map((s, i) => (
            <StaggerItem key={i}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }} className="h-full">
                <CardSurface
                  className="relative h-full p-7 border-border/40 hover:border-primary/30 transition-all duration-300 group"
                  data-testid={`blueprint-step-${i}`}
                >
                  <div className="flex items-baseline justify-between mb-6">
                    <span className="font-serif text-3xl text-primary transition-colors">
                      0{i + 1}
                    </span>
                    <s.icon className="w-5 h-5 text-primary/55 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-supporting font-semibold mb-2">
                    {s.tag}
                  </p>
                  <h3 className="font-serif text-xl font-semibold mb-3 tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </CardSurface>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="py-24 lg:py-32 bg-muted/20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">
              What it costs
            </p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Quoted per property.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            No public price is advertised. If Pegasus offers a Blueprint, the
            written proposal sets the fee and explains the work included.
          </p>
          <p className="text-base text-muted-foreground/85 leading-relaxed italic border-l-2 border-primary/40 pl-5">
            A request does not create a service obligation. Do not rely on a
            Blueprint until both parties accept the written terms.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-28 lg:py-36 bg-card relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-gradient-radial from-primary/10 via-primary/0 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-4xl mx-auto px-6 lg:px-12 relative text-center">
        <ScrollReveal>
          <Clock className="w-10 h-10 text-primary mx-auto mb-8" />
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Have a deal that earns a Blueprint?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Share the address and situation for possible review. Pegasus may
            decline or offer a separately documented scope; no work is promised
            by submitting the form.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/bring-an-opportunity?intent=blueprint">
              <Button
                size="lg"
                className="text-sm uppercase tracking-[0.15em] px-10 py-7 font-semibold"
                data-testid="button-blueprint-cta-request"
              >
                Request a Deal Blueprint
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/strategy-lab">
              <Button
                size="lg"
                variant="outline"
                className="text-sm uppercase tracking-[0.15em] px-10 py-7 font-semibold"
                data-testid="button-blueprint-cta-strategy-lab"
              >
                Try the Free Strategy Snapshot
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground/80 mt-12 max-w-2xl mx-auto leading-relaxed">
            A Blueprint request is not an offer of securities, an appraisal, a
            valuation, or legal, tax, engineering, lending, or investment advice.
            Use qualified professionals for decisions within their disciplines.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function DealBlueprintPage() {
  useSEO({
    title: "Pegasus Deal Blueprint",
    description:
      "Request consideration for a separately scoped property analysis. Availability, author, fee, timing, contents, and limits require written agreement.",
    image: "/og/default.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <h1 className="sr-only">Pegasus Deal Blueprint. Tier 03 of the Strategy Lab funnel.</h1>
      <HeroSection />
      <WhatsInside />
      <WhenItsRight />
      <HowItWorks />
      <PricingSection />
      <CTASection />
    </div>
  );
}
