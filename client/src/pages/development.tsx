import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import {
  ArrowRight,
  Hammer,
  Layers,
  Building,
  Compass,
  Briefcase,
  Network,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { HeroPicture } from "@/components/hero-picture";

export default function Development() {
  useSEO({
    title: "Development",
    description:
      "Pegasus Development is the spine pillar of Pegasus DreamScapes. Investments and Systems exist to feed and support what gets built. Phase by phase, ADU and value-add today, vertically integrated developer tomorrow.",
    image: "https://pegasusdreamscapes.com/og/home.svg",
  });

  return (
    <div className="min-h-screen">
      <h1 className="sr-only">Pegasus Development. The Spine Pillar.</h1>
      <HeroSection />
      <PillarSection />
      <PhaseSection />
      <SupportingPillarsSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[78vh] flex items-center overflow-hidden pt-20">
      <motion.div
        className="absolute inset-0 scale-105"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      >
        <HeroPicture
          alt="Pegasus Development. Strategy-first real estate developer."
          className="absolute inset-0 w-full h-full object-cover"
          priority
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      <div className="relative z-10 w-full py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8">
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="h-px w-10 bg-primary" />
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-primary font-semibold font-supporting">
                Pegasus Development · The Spine Pillar
              </p>
            </motion.div>

            <motion.h1
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[0.95] tracking-[-0.02em] mb-8 [text-shadow:0_2px_14px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              data-testid="text-development-hero"
            >
              The path to building.{" "}
              <span className="bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
                Everything else supports it.
              </span>
            </motion.h1>

            <motion.p
              className="font-serif text-lg sm:text-xl text-white/90 italic max-w-2xl mb-4 leading-snug"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
            >
              Complex property. Structured opportunity.
            </motion.p>

            <motion.p
              className="text-base sm:text-lg text-white/85 max-w-2xl mb-10 leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Pegasus DreamScapes is forming as a strategy-first real estate operating company with a planned construction arm, forming in 2026, subject to final entity formation, licensing, insurance, and contract review. Today's actual scope is small-scale and disciplined: ADU, value-add, and small residential. The planned trajectory is a vertically integrated developer producing ground-up infill and, in time, master-planned classical neighborhoods.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
            >
              <Link href="/submit">
                <Button
                  size="lg"
                  className="text-sm uppercase tracking-[0.15em] px-10 py-7 bg-white text-slate-900 hover:bg-white/95 font-semibold shadow-2xl shadow-black/20 w-full sm:w-auto"
                  data-testid="button-development-strategy-review"
                >
                  Submit a Property
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-sm uppercase tracking-[0.15em] px-10 py-7 border-white/30 text-white hover:bg-white/10 backdrop-blur-md font-semibold"
                  data-testid="button-development-projects"
                >
                  See Built Work
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

function PillarSection() {
  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-5xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Why Development Leads</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-6">
            Development is the planned spine.{" "}
            <span className="text-headline-gold">The rest is how it gets done well.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Pegasus DreamScapes is standing up a planned construction arm, forming in 2026, subject to final entity formation, licensing, insurance, and contract review. Each Pegasus pillar is being built to make that planned Development arm sharper: Investments would fund and structure the projects, Systems would run the operating discipline, and MarketFlow would route the deal flow that becomes built work. The intended product is the building, the renovation, the addition, the neighborhood. The other pillars are scaffolding.
          </p>
          <p className="text-base text-muted-foreground/85 leading-relaxed italic">
            Built on strategy. Governed by virtue. Executed with discipline.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

function PhaseSection() {
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
    <section className="py-24 lg:py-32 bg-muted/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="max-w-3xl mb-14">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">The Development Pathway</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Built phase by phase.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Each phase is earned, not assumed. We graduate to the next stage when the prior stage is consistently profitable, well-documented, and operationally repeatable.
          </p>
        </ScrollReveal>

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
                <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-supporting font-semibold mb-1">
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

        <ScrollReveal delay={0.3} className="mt-12 max-w-3xl">
          <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-5">
            This is the path, not a claim of where we already stand. Today's Development scope is ADU additions, forced-value rehabs, fix-and-flip, BRRRR, and small-scale projects.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

function SupportingPillarsSection() {
  const pillars = [
    {
      icon: Briefcase,
      kicker: "Pillar · Investments",
      title: "Capital that feeds the build.",
      desc: "Direct acquisition, JV / co-GP, and creative-finance structures funded by aligned operating partners. Capital is matched to the project, not the other way around.",
      cta: "Capital Partnerships",
      href: "/capital",
    },
    {
      icon: Network,
      kicker: "Pillar · Systems",
      title: "The operating discipline.",
      desc: "BuildForge for project management, the Vendor Network for trade execution, MarketFlow for vetted deal flow, and the Pegasus Standard governing how every project is read, scoped, and run.",
      cta: "Vendor Network",
      href: "/vendor-network",
    },
    {
      icon: ShieldCheck,
      kicker: "Pillar · Pegasus Standard",
      title: "Governed by virtue.",
      desc: "Every project is reviewed against the same doctrine: prudence on the underwriting, justice on the dealings, fortitude on the execution, temperance on the growth pace.",
      cta: "The Doctrine",
      href: "/about",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">The Supporting Pillars</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Investments and Systems exist for one reason.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            So that anything Pegasus takes on can be approached the right way: funded correctly, scoped correctly, run correctly, governed correctly.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
          {pillars.map((p, i) => (
            <StaggerItem key={i}>
              <Link href={p.href}>
                <div className="group h-full p-8 bg-card rounded-lg border border-border/40 hover:border-primary/30 transition-all duration-300 cursor-pointer" data-testid={`supporting-pillar-${i}`}>
                  <div className="flex items-baseline justify-between mb-6">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold">{p.kicker}</p>
                    <p.icon className="w-5 h-5 text-primary/55 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3 tracking-tight">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{p.desc}</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-primary font-semibold inline-flex items-center gap-2">
                    {p.cta}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
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
          <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-8" />
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Have an ADU, infill lot, or value-add project?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Bring us the address and the situation. A real person reviews every submission and routes it to the cleanest path: build it with Pegasus, co-develop, partner on capital, or honest referral.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/submit">
              <Button size="lg" className="text-sm uppercase tracking-[0.15em] px-10 py-7 font-semibold" data-testid="button-development-cta-sell">
                Submit a Property
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/strategy-lab">
              <Button size="lg" variant="outline" className="text-sm uppercase tracking-[0.15em] px-10 py-7 font-semibold" data-testid="button-development-cta-blueprint">
                Try Strategy Lab
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
