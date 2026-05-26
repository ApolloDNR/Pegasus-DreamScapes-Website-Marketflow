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
// /strategy-lab. This page describes the paid, human-prepared memo
// that closes the loop when the free tiers aren't enough. Intake
// routes through /submit?intent=blueprint which posts with
// leadType: "blueprint_request" for separate triage.

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
          A Deal Blueprint is a written memo on a specific property, prepared by
          the Pegasus team. Not auto-generated. Not a template.
        </motion.p>
        <motion.p
          className="text-base text-cream/75 max-w-3xl mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          A real read from real operators on whether the deal works, what would
          have to be true for it to work, and how to actually structure it.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
        >
          <Link href="/submit?intent=blueprint">
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
      desc: "Acquisition, scope, holding, exit. Stress-tested. Not the optimistic version. The version that survives.",
    },
    {
      icon: Layers,
      tag: "02 · Structure",
      title: "How to acquire it.",
      desc: "Direct, JV, subject-to, seller-carry, assignment. The argument for why one fits and the others don't.",
    },
    {
      icon: ShieldCheck,
      tag: "03 · Risk Register",
      title: "What kills this deal.",
      desc: "Title issues, scope creep, market exposure, partner exposure. Each one with a mitigation, not just a flag.",
    },
    {
      icon: MessageSquareQuote,
      tag: "04 · Outreach Scripts",
      title: "If the deal needs a conversation.",
      desc: "With the seller, an heir, a lender, a city. We write the script. You walk in with the argument already framed.",
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
            Four sections. Every time.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Written, signed, and timestamped. Yours to act on or set aside.
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
              A Strategy Snapshot run is usually enough. We will
              tell you when it isn't.
            </p>
            <p className="text-base text-muted-foreground/85 leading-relaxed italic border-l-2 border-primary/40 pl-5">
              If a free tier solves it, we route you there. A Blueprint is
              reserved for situations that earn it.
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
      desc: "Bring the address and the situation at /submit. Tell us it's for a Blueprint.",
    },
    {
      tag: "Step 02",
      icon: ShieldCheck,
      title: "We confirm the right tier.",
      desc: "Pegasus reviews the intake. If a Strategy Snapshot is enough, we say so and route you there.",
    },
    {
      tag: "Step 03",
      icon: FileText,
      title: "Scope, fee, timeline.",
      desc: "We scope the Blueprint, quote the fee, and the timeline. You approve before we start.",
    },
    {
      tag: "Step 04",
      icon: CheckCircle2,
      title: "Blueprint delivered.",
      desc: "Written memo, signed and timestamped. One round of clarification included.",
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
            From intake to delivered memo.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Most Blueprints are delivered within 7–10 business days from
            approval. Complex situations may take longer; we tell you up front.
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
                    <span className="font-serif text-3xl text-primary/30 group-hover:text-primary/60 transition-colors">
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
            Every Blueprint is scoped before it is priced. The fee reflects the
            depth of the read: the structure work required, the complexity of
            the chain-of-title, and the urgency of the decision.
          </p>
          <p className="text-base text-muted-foreground/85 leading-relaxed italic border-l-2 border-primary/40 pl-5">
            No Blueprint is started without a written scope and an approved
            fee. You know the number before any work begins.
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
            Bring us the address and the situation. We confirm the right tier
            before any fee is quoted. If a free tier solves it, you'll hear that
            first.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/submit?intent=blueprint">
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
            A Deal Blueprint is an analytical product, not an offer of
            securities or a solicitation to invest. The Blueprint memo does not
            constitute a fiduciary relationship beyond the scope of the
            engagement. Investment decisions are yours.
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
      "A human-prepared underwriting and structure memo for a specific property. Written by the Pegasus team. Not auto-generated. Reserved for deals that earn it.",
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
