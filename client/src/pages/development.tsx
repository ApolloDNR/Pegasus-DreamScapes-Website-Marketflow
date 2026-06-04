import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import {
  ArrowRight,
  Briefcase,
  Building,
  CheckCircle2,
  Compass,
  Hammer,
  Layers,
  Network,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { HeroPicture } from "@/components/hero-picture";

type Phase = {
  label: string;
  title: string;
  body: string;
  items: string[];
  icon: LucideIcon;
};

type SupportPillar = {
  kicker: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
  icon: LucideIcon;
};

const operatingRows = [
  ["Mandate", "Build disciplined East Bay residential value before scaling the machine."],
  ["Current scope", "ADU additions, forced-value rehabs, fix-and-flip, BRRRR, and small infill projects."],
  ["Control point", "A project does not move forward until the path, capital, scope, and risk are legible."],
  ["Long arc", "Earn the right to become a vertically integrated developer through documented execution."],
];

const phases: Phase[] = [
  {
    label: "Phase 01 / Today",
    title: "Foundation",
    body: "Small-scale projects where discipline, speed, cost control, and documentation matter more than theatrics.",
    icon: Hammer,
    items: ["ADU additions", "Forced-value rehabs", "Fix-and-flip", "BRRRR acquisitions"],
  },
  {
    label: "Phase 02 / Next",
    title: "Expansion",
    body: "Repeatable development patterns, tighter vendor control, and selective co-developer relationships.",
    icon: Layers,
    items: ["Small multi-unit conversions", "2-4 unit projects", "Co-developer relationships", "Expanded scope"],
  },
  {
    label: "Phase 03 / Growth",
    title: "Vertical Integration",
    body: "Pegasus-controlled sites, project management discipline, and multiple active construction tracks.",
    icon: Building,
    items: ["Ground-up infill", "BuildForge-supported management", "Vendor bench depth", "Capital timing discipline"],
  },
  {
    label: "Phase 04 / Legacy",
    title: "Generational",
    body: "Larger development only after the operating base proves it can carry the weight.",
    icon: Compass,
    items: ["Classical neighborhoods", "Larger-scale development", "Long-hold value", "A durable real estate company"],
  },
];

const supportPillars: SupportPillar[] = [
  {
    icon: Briefcase,
    kicker: "Capital",
    title: "Capital follows the project.",
    desc: "Direct acquisition, JV, co-GP, and creative-finance relationships are matched to the real project, not forced into a generic pitch.",
    cta: "Capital Partnerships",
    href: "/capital",
  },
  {
    icon: Network,
    kicker: "Systems",
    title: "Operations make the work repeatable.",
    desc: "BuildForge, MarketFlow, vendor discipline, and the Pegasus Standard keep projects readable before they become expensive.",
    cta: "Vendor Network",
    href: "/vendor-network",
  },
  {
    icon: ShieldCheck,
    kicker: "Standard",
    title: "The doctrine protects the pace.",
    desc: "Prudence in the underwriting, clean dealing, disciplined execution, and controlled growth are treated as operating requirements.",
    cta: "The Doctrine",
    href: "/about",
  },
];

export default function Development() {
  useSEO({
    title: "Development",
    description:
      "Pegasus Development is the spine pillar of Pegasus Dreamscapes. Small-scale value creation today, vertically integrated development over time.",
    image: "/og/home.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <h1 className="sr-only">Pegasus Development. The spine pillar.</h1>
      <HeroSection />
      <MandateSection />
      <PhaseSection />
      <SupportingPillarsSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--navy))] text-cream">
      <div className="absolute inset-0">
        <HeroPicture
          alt="Pegasus Development. Strategy-first real estate developer."
          className="absolute inset-0 h-full w-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,15,25,0.90)_0%,rgba(8,15,25,0.72)_48%,rgba(8,15,25,0.34)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[hsl(var(--navy))] to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-[78vh] items-center pt-28 pb-16">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
          <div className="min-w-0 max-w-[22rem] sm:max-w-5xl">
            <Eyebrow text="Pegasus Development / Spine Pillar" light />
            <h2
              className="mt-6 max-w-[22rem] font-serif text-4xl font-semibold leading-[1.02] text-white sm:max-w-5xl sm:text-6xl sm:leading-[0.96] lg:text-7xl"
              data-testid="text-development-hero"
            >
              Build the real estate.
              <span className="block pt-2 italic text-[#D4B483]">Then structure everything around it.</span>
            </h2>
            <p className="mt-7 max-w-[22rem] text-lg leading-relaxed text-cream/80 sm:max-w-2xl sm:text-xl">
              Pegasus Dreamscapes is, at its core, a real estate development company. Capital, systems, and deal flow exist to support the work that gets built.
            </p>
            <p className="mt-4 max-w-[22rem] font-serif text-lg italic leading-relaxed text-white/90 sm:max-w-xl">
              Small-scale and disciplined today. Vertically integrated over time.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/submit?intent=adu">
                <Button
                  size="lg"
                  className="h-14 w-full max-w-[22rem] rounded-sm bg-primary px-8 text-sm font-semibold uppercase text-white hover:bg-primary/90 sm:w-auto sm:max-w-none"
                  data-testid="button-development-strategy-review"
                >
                  Start a Strategy Review
                  <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-full max-w-[22rem] rounded-sm border-white/40 bg-white/5 px-8 text-sm font-semibold uppercase text-white hover:bg-white/10 sm:w-auto sm:max-w-none"
                  data-testid="button-development-projects"
                >
                  See Built Work
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid border-y border-white/20 text-sm text-white/75 sm:grid-cols-3">
              {[
                ["Current lane", "ADU / rehab / value-add"],
                ["Operating posture", "Documented before scaled"],
                ["Growth rule", "Earn the next phase"],
              ].map(([label, value]) => (
                <div key={label} className="border-white/20 py-4 sm:border-r sm:px-5 first:sm:pl-0 last:sm:border-r-0">
                  <p className="text-xs uppercase text-primary">{label}</p>
                  <p className="mt-1 font-serif text-xl text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

function MandateSection() {
  return (
    <section className="bg-background py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-12">
        <ScrollReveal className="lg:col-span-5">
          <Eyebrow text="Development mandate" />
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            The premium move is operational clarity.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Development is not a mood board. The work is scope, capital, sequencing, risk, and a clear reason for building in the first place.
          </p>
        </ScrollReveal>

        <ScrollReveal className="lg:col-span-7" direction="left">
          <div className="border border-border bg-card">
            <div className="border-b border-border p-6 sm:p-8">
              <p className="text-xs uppercase text-primary">Operating memo</p>
              <h3 className="mt-3 font-serif text-3xl font-semibold">Development before decoration.</h3>
            </div>
            <div className="divide-y divide-border">
              {operatingRows.map(([label, value], index) => (
                <div key={label} className="grid gap-4 p-6 sm:grid-cols-[7rem_1fr] sm:p-7">
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-2xl text-primary/70">{String(index + 1).padStart(2, "0")}</span>
                    <p className="text-xs uppercase text-primary">{label}</p>
                  </div>
                  <p className="font-serif text-2xl leading-snug text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function PhaseSection() {
  return (
    <section className="bg-card py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <ScrollReveal className="max-w-3xl">
          <Eyebrow text="The development pathway" />
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Built phase by phase.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Each phase is earned. Pegasus graduates only when the prior stage is profitable, documented, and operationally repeatable.
          </p>
        </ScrollReveal>

        <StaggerChildren className="mt-12 divide-y divide-border border border-border bg-background" staggerDelay={0.06}>
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            return (
              <StaggerItem key={phase.label}>
                <article className="grid gap-7 p-6 transition-colors duration-300 hover:bg-card/70 sm:p-8 lg:grid-cols-[7rem_1fr_22rem] lg:items-start">
                  <div>
                    <p className="font-serif text-4xl text-primary/40">{String(index + 1).padStart(2, "0")}</p>
                    <Icon className="mt-5 h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-primary">{phase.label}</p>
                    <h3 className="mt-2 font-serif text-3xl font-semibold">{phase.title}</h3>
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{phase.body}</p>
                  </div>
                  <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-1">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-px w-5 flex-shrink-0 bg-primary/60" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerChildren>

        <ScrollReveal delay={0.2} className="mt-10 max-w-3xl border-l-2 border-primary/40 pl-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            This is a trajectory, not a claim that every future phase is already active. The present public lane is disciplined small-scale residential value creation.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

function SupportingPillarsSection() {
  return (
    <section className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <Eyebrow text="Supporting system" center />
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Capital and systems exist for one reason.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            To make sure what Pegasus builds gets built right: funded correctly, scoped correctly, run correctly, and governed correctly.
          </p>
        </ScrollReveal>

        <div className="mt-12 divide-y divide-border border-y border-border">
          {supportPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <Link key={pillar.title} href={pillar.href}>
                <article className="group grid gap-5 py-7 transition-colors duration-300 hover:bg-card/70 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:px-5">
                  <div className="flex h-14 w-14 items-center justify-center border border-primary/35 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-primary">
                      {String(index + 1).padStart(2, "0")} / {pillar.kicker}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl font-semibold">{pillar.title}</h3>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{pillar.desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-primary">
                    {pillar.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--navy))] py-24 text-cream lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-primary/50" />
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-12">
        <ScrollReveal>
          <CheckCircle2 className="mx-auto mb-7 h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Have an ADU, infill lot, or value-add project?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-cream/75">
            Bring us the address and the situation. A real person reviews every submission and routes it to the cleanest path: build with Pegasus, co-develop, partner on capital, or refer honestly.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/submit?intent=adu">
              <Button
                size="lg"
                className="h-14 w-full rounded-sm px-8 text-sm font-semibold uppercase sm:w-auto"
                data-testid="button-development-cta-sell"
              >
                Start a Strategy Review
                <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/strategy-lab">
              <Button
                size="lg"
                variant="outline"
                className="h-14 w-full rounded-sm border-white/40 bg-white/5 px-8 text-sm font-semibold uppercase text-white hover:bg-white/10 sm:w-auto"
                data-testid="button-development-cta-blueprint"
              >
                Open Strategy Lab
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function Eyebrow({ text, light = false, center = false }: { text: string; light?: boolean; center?: boolean }) {
  return (
    <div className={`flex min-w-0 flex-wrap items-center gap-3 ${center ? "justify-center" : ""}`}>
      <span className="h-px w-10 bg-primary" aria-hidden="true" />
      <p className={`min-w-0 text-xs font-semibold uppercase ${light ? "text-primary" : "text-primary"}`}>
        {text}
      </p>
      {center ? <span className="h-px w-10 bg-primary" aria-hidden="true" /> : null}
    </div>
  );
}
