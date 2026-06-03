import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { trackEvent, trackCtaClick } from "@/lib/analytics";
import { motion } from "framer-motion";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  FileSearch,
  Handshake,
  Home as HomeIcon,
  Landmark,
  LineChart,
  Network,
  Route,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { HeroPicture } from "@/components/hero-picture";

type Surface = {
  title: string;
  body: string;
  href: string;
  cta: string;
  icon: LucideIcon;
};

const reviewLenses = [
  {
    label: "As-Is",
    title: "Current truth",
    body: "Condition, pressure, occupancy, title notes, timeline, and the problems already visible.",
    score: "01",
  },
  {
    label: "Stabilized",
    title: "Clean operating state",
    body: "Repairs, rent, management, lease-up, refinance readiness, and basic execution risk.",
    score: "02",
  },
  {
    label: "Optimized",
    title: "Created value",
    body: "ADU, infill, repositioning, creative structure, partnership, or a better exit.",
    score: "03",
  },
];

const operatingOutcomes = [
  "Acquire",
  "Develop",
  "Represent",
  "Partner",
  "Route",
  "Pass",
];

const surfaces: Surface[] = [
  {
    title: "Submit",
    body: "The intake door for owners, agents, wholesalers, operators, and referral partners.",
    href: "/submit",
    cta: "Submit a property",
    icon: HomeIcon,
  },
  {
    title: "Strategy Lab",
    body: "A preliminary read before full human review. Useful signal, not an offer or appraisal.",
    href: "/strategy-lab",
    cta: "Run the lab",
    icon: LineChart,
  },
  {
    title: "Peggy",
    body: "Guided conversation for visitors who need help explaining the situation before a human review.",
    href: "/peggy-ai",
    cta: "Meet Peggy",
    icon: Bot,
  },
  {
    title: "Work With Apollo",
    body: "Licensed real estate representation through Apollo's Keller Williams lane.",
    href: "/work-with-apollo",
    cta: "View the lane",
    icon: Handshake,
  },
  {
    title: "MarketFlow",
    body: "Private relationship routing for reviewed opportunities, buyers, operators, and capital.",
    href: "/marketflow",
    cta: "Enter the network",
    icon: Network,
  },
  {
    title: "Connect",
    body: "The card and QR route for choosing the correct Pegasus door without guessing.",
    href: "/connect",
    cta: "Choose a route",
    icon: Route,
  },
];

const departments = [
  {
    title: "Acquisitions",
    body: "Find motivated situations, read the facts, and decide whether Pegasus should buy, control, partner, or pass.",
    proof: "As-is, distress, timeline, title, condition, seller pressure.",
    icon: HomeIcon,
  },
  {
    title: "Development",
    body: "Create value through ADU, rehab, infill, stabilization, and disciplined construction planning.",
    proof: "Scope, capital, permits, vendor bench, risk register.",
    icon: Building2,
  },
  {
    title: "Dispositions",
    body: "Choose the correct exit: list, sell, assign, route, refinance, or hold depending on the real lane.",
    proof: "Buyer fit, exit math, MarketFlow routing, broker lane.",
    icon: Handshake,
  },
  {
    title: "Asset Management",
    body: "Protect the upside after control: stabilization, reporting, lease-up, operations, and long-term value.",
    proof: "Hold strategy, operating cadence, value preservation.",
    icon: ShieldCheck,
  },
];

const standards = [
  "Discipline",
  "Transparency",
  "Innovation",
  "Integrity",
  "Excellence",
  "Efficiency",
];

export default function Home() {
  useSEO({
    description:
      "Pegasus Dreamscapes reviews complex property situations and architects the clearest path forward.",
    image: "/og/home.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <IdentitySection />
      <DepartmentSection />
      <ReviewSection />
      <OutcomesSection />
      <SurfaceSection />
      <StandardSection />
      <FinalCTASection />
      <span className="sr-only" data-testid="home-locked-anchors">
        Complex property. Structured opportunity. Every property gets a path. Not every property gets an offer.
        Built on strategy. Governed by virtue. Executed with discipline. Dream it. Build it. Live it.
        Bring us the property. We'll show you the path. Most Strategy Snapshots are reviewed within 5 business days.
      </span>
    </div>
  );
}

function HeroSection() {
  return (
    <section id="hero" className="relative min-h-[88vh] overflow-hidden bg-[hsl(var(--navy))] text-cream">
      <motion.div
        className="absolute inset-0 scale-[1.03]"
        initial={{ scale: 1.045 }}
        animate={{ scale: 1.015 }}
        transition={{ duration: 28, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      >
        <HeroPicture
          alt="Pegasus Dreamscapes architectural property at dusk"
          className="absolute inset-0 h-full w-full object-cover"
          priority
        />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,15,25,0.88)_0%,rgba(8,15,25,0.70)_42%,rgba(8,15,25,0.32)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[hsl(var(--navy))] to-transparent" />

      <div className="relative z-10 flex min-h-[88vh] items-center pt-24 pb-14 lg:pt-32">
        <div className="mx-auto w-full max-w-[1380px] px-6 lg:px-10">
          <motion.div
            className="min-w-0 max-w-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            <Eyebrow text="Pegasus Dreamscapes | The Deal Architect" light />
            <h1
              className="mt-6 max-w-[22rem] font-serif text-4xl font-semibold leading-[1.02] text-white sm:max-w-5xl sm:text-6xl sm:leading-[0.96] lg:text-7xl xl:text-[5.7rem]"
              data-testid="text-hero-headline"
            >
              Complex property.
              <span className="block pt-2 italic text-[#D4B483]">Structured opportunity.</span>
            </h1>
            <p
              className="mt-7 max-w-[22rem] font-serif text-lg leading-relaxed text-white/95 sm:max-w-2xl sm:text-2xl"
              data-testid="text-hero-subheadline"
            >
              Pegasus reviews the property, the pressure, the people, and the numbers, then chooses the cleanest route forward.
            </p>
            <p className="mt-5 max-w-[22rem] text-base leading-relaxed text-white/80 sm:max-w-xl">
              Every property gets a path. Not every property gets an offer.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/submit" onClick={() => trackCtaClick("home_hero", "Submit a Property", "/submit")}>
                <Button
                  size="lg"
                  className="h-14 w-full max-w-[22rem] rounded-sm bg-primary px-8 text-sm font-semibold uppercase text-white hover:bg-primary/90 sm:w-auto sm:max-w-none"
                  data-testid="button-hero-submit"
                >
                  Submit a Property
                  <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/deal-architecture" onClick={() => trackCtaClick("home_hero", "Explore Deal Architecture", "/deal-architecture")}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-full max-w-[22rem] rounded-sm border-white/40 bg-white/5 px-8 text-sm font-semibold uppercase text-white hover:bg-white/10 sm:w-auto sm:max-w-none"
                  data-testid="button-hero-deal-architecture"
                >
                  Deal Architecture
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/20 pt-5 text-xs uppercase text-white/70">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                Pleasant Hill
              </span>
              <span>East Bay</span>
              <span>California</span>
              <span>Dream it. Build it. Live it.</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

function IdentitySection() {
  return (
    <section className="bg-background py-20 lg:py-28" data-testid="section-identity">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <ScrollReveal className="lg:col-span-5">
            <Eyebrow text="What Pegasus is" />
            <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              A real estate operating company with a strategy desk.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Pegasus is not trying to look like a brokerage, a fund, a wholesaler, or a generic investor site. It is an operating company: acquisitions, development, dispositions, and asset management working from one property thesis.
            </p>
          </ScrollReveal>
          <ScrollReveal className="lg:col-span-7" direction="left">
            <OperatingMemo />
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <IdentityPoint icon={FileSearch} title="Review" body="The facts are separated from the pressure." />
              <IdentityPoint icon={Route} title="Structure" body="The route is designed before the answer is sold." />
              <IdentityPoint icon={Landmark} title="Operate" body="The work moves through the correct lane." />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function OperatingMemo() {
  return (
    <div className="border border-border bg-card shadow-md">
      <div className="border-b border-border p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase text-primary">Pegasus review memo</p>
        <h3 className="mt-2 font-serif text-3xl font-semibold">Property path register</h3>
      </div>
      <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-[hsl(var(--navy))] p-6 text-cream">
          <p className="text-xs font-semibold uppercase text-primary">Route logic</p>
          <p className="mt-4 font-serif text-3xl font-semibold leading-tight text-white">
            Facts first. Route second. Pitch last.
          </p>
          <div className="mt-8 space-y-3">
            {["Property", "Pressure", "People", "Numbers"].map((item, index) => (
              <div key={item} className="flex items-center justify-between border border-white/10 bg-white/[0.035] px-4 py-3">
                <span className="text-sm text-white/80">{item}</span>
                <span className="font-serif text-lg text-primary">{String(index + 1).padStart(2, "0")}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {[
            ["Input", "Property, documents, pressure, people"],
            ["Lens", "As-Is, Stabilized, Optimized"],
            ["Lane", "Buy, build, represent, route, or pass"],
            ["Control", "Human review before execution"],
          ].map(([label, value], index) => (
            <div key={label} className="grid grid-cols-[70px_1fr] gap-4 border-b border-border bg-background p-5 last:border-b-0">
              <span className="font-display text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-supporting text-[10px] font-semibold uppercase text-primary">{label}</p>
                <p className="mt-1 font-serif text-xl font-semibold leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IdentityPoint({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <article className="border border-border/70 bg-card p-6">
      <Icon className="mb-5 h-5 w-5 text-primary" aria-hidden="true" />
      <h3 className="font-serif text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}

function DepartmentSection() {
  return (
    <section className="bg-card py-20 lg:py-28" data-testid="section-departments">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeader
          eyebrow="Operating house"
          title="Four departments. One property path."
          body="The premium signal is not more language. It is showing that Pegasus knows where each situation belongs before work begins."
        />
        <StaggerChildren className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4" staggerDelay={0.05}>
          {departments.map((department, index) => {
            const Icon = department.icon;
            return (
              <StaggerItem key={department.title}>
                <article className="flex h-full min-h-[300px] flex-col justify-between border border-border bg-background p-6">
                  <div>
                    <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      <span className="font-display text-xs font-semibold text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-serif text-3xl font-semibold">{department.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{department.body}</p>
                  </div>
                  <p className="mt-7 border-l-2 border-primary/40 pl-4 text-xs leading-relaxed text-muted-foreground">
                    {department.proof}
                  </p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}

function ReviewSection() {
  return (
    <section className="bg-[hsl(var(--charcoal))] py-24 text-cream lg:py-32" data-testid="section-review">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <ScrollReveal className="lg:col-span-5">
            <Eyebrow text="The review" light />
            <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              One property can carry more than one value story.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cream/80">
              The premium move is not to decorate the process. It is to make the decision feel calm, legible, and controlled.
            </p>
          </ScrollReveal>
          <ScrollReveal className="lg:col-span-7" direction="left">
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <ValueLensIllustration />
              <div className="border border-white/20 bg-white/[0.035]">
                {reviewLenses.map((lens, index) => (
                  <div
                    key={lens.label}
                    className={`grid gap-4 p-5 ${index > 0 ? "border-t border-white/10" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-supporting text-xs font-semibold uppercase text-primary">{lens.label}</p>
                        <h3 className="mt-2 font-serif text-2xl font-semibold text-white">{lens.title}</h3>
                      </div>
                      <span className="font-display text-sm font-semibold text-primary">{lens.score}</span>
                    </div>
              <p className="text-sm leading-relaxed text-cream/75">{lens.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function ValueLensIllustration() {
  return (
    <div className="min-h-[430px] border border-white/20 bg-[hsl(var(--navy)/0.82)] p-6">
      <div className="flex h-full min-h-[382px] flex-col justify-between">
        <div className="border-b border-white/10 pb-5">
          <p className="font-supporting text-xs font-semibold uppercase text-primary">Scenario read</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-white">Three reads, one property.</p>
          <p className="mt-3 text-sm leading-relaxed text-cream/70">
            The site should show judgment, not decoration. This is the kind of surface that makes the review feel real.
          </p>
        </div>
        <div className="space-y-4">
          {[
            ["As-Is", "38%", "Visible condition, timeline, current pressure"],
            ["Stabilized", "66%", "Repairs, lease-up, management, refinance readiness"],
            ["Optimized", "88%", "ADU, infill, partnership, repositioning, or exit"],
          ].map(([label, value, copy]) => (
            <div key={label} className="border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-2 flex justify-between gap-4 text-xs text-white/70">
            <span className="font-semibold uppercase text-white/80">{label}</span>
                <span className="text-primary">{value}</span>
              </div>
              <div className="h-2 bg-white/10">
                <div className="h-full bg-primary" style={{ width: value }} />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-cream/70">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OutcomesSection() {
  return (
    <section className="bg-card py-24 lg:py-32" data-testid="section-outcomes">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeader
          eyebrow="Outcome lanes"
          title="A clean pass is better than a messy yes."
          body="Pegasus is strongest when the public site makes the range of outcomes clear without pretending every situation becomes a deal."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-start">
          <StaggerChildren className="lg:col-span-7 grid gap-3 sm:grid-cols-2" staggerDelay={0.04}>
            {operatingOutcomes.map((outcome, index) => (
              <StaggerItem key={outcome}>
                <div className="flex min-h-20 items-center justify-between border border-border bg-background px-5">
                  <span className="font-serif text-2xl font-semibold">{outcome}</span>
                  <span className="font-display text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
          <ScrollReveal className="lg:col-span-5" direction="left">
            <OutcomeLedger />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function OutcomeLedger() {
  return (
    <div className="min-h-[420px] border border-primary/25 bg-[hsl(var(--navy))] p-6 text-cream">
      <div className="flex h-full min-h-[372px] flex-col">
        <div className="border-b border-white/10 pb-5">
          <p className="font-supporting text-xs font-semibold uppercase text-primary">Routing ledger</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-white">Every answer has a lane.</p>
        </div>
        <div className="mt-5 divide-y divide-white/10 border border-white/10">
          {[
            ["Acquire", "Pegasus buys or controls the property."],
            ["Develop", "The property becomes built work."],
            ["Represent", "Apollo's KW lane handles the agency path."],
            ["Partner", "Capital or operating partner is matched."],
            ["Route", "The opportunity moves to a better-fit relationship."],
            ["Pass", "The answer is no, with discipline."],
          ].map(([label, copy], index) => (
            <div key={label} className="grid grid-cols-[4rem_1fr] gap-4 p-4">
              <span className="font-display text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-serif text-xl font-semibold text-white">{label}</p>
                <p className="mt-1 text-xs leading-relaxed text-cream/70">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SurfaceSection() {
  return (
    <section className="bg-background py-24 lg:py-32" data-testid="section-surfaces">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeader
          eyebrow="Where to go"
          title="Six doors. One operating standard."
          body="The homepage should route people quickly: distressed owners, agents, wholesalers, investors, vendors, and serious partners should all know where to go."
          center
        />
        <StaggerChildren className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.05}>
          {surfaces.map((surface) => {
            const Icon = surface.icon;
            return (
              <StaggerItem key={surface.title}>
                <Link href={surface.href}>
                  <article className="group flex h-full min-h-72 flex-col justify-between border border-border/70 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                    <div>
                      <SurfaceMiniVisual icon={Icon} title={surface.title} />
                      <h3 className="font-serif text-3xl font-semibold group-hover:text-primary">{surface.title}</h3>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{surface.body}</p>
                    </div>
                    <span className="mt-8 inline-flex items-center gap-2 font-supporting text-xs font-semibold uppercase text-primary">
                      {surface.cta}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </article>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}

function SurfaceMiniVisual({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="mb-6 border border-border bg-background p-4">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <span className="flex h-10 w-10 items-center justify-center border border-primary/35 bg-primary/10">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </span>
        <span className="font-supporting text-xs font-semibold uppercase text-primary">{title}</span>
      </div>
      <div className="mt-4 space-y-2" aria-hidden="true">
        <span className="block h-2 w-4/5 bg-muted" />
        <span className="block h-2 w-3/5 bg-muted" />
        <span className="block h-px w-full bg-primary/40" />
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}

function StandardSection() {
  return (
    <section className="bg-[hsl(var(--navy))] py-20 text-cream lg:py-24" data-testid="section-standard">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <ScrollReveal className="lg:col-span-5">
            <Eyebrow text="The Dreamscaper Standard" light />
            <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Discipline is the luxury.
            </h2>
          </ScrollReveal>
          <StaggerChildren className="lg:col-span-7 grid grid-cols-2 gap-3 sm:grid-cols-3" staggerDelay={0.04}>
            {standards.map((standard) => (
              <StaggerItem key={standard}>
                <div className="border border-white/20 bg-white/[0.035] px-4 py-5 text-center font-supporting text-xs font-semibold uppercase text-white/80">
                  {standard}
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section id="final-cta" className="bg-card py-24 lg:py-32" data-testid="section-final-cta">
      <div className="mx-auto max-w-5xl px-6 text-center lg:px-12">
        <ScrollReveal>
          <ShieldCheck className="mx-auto mb-6 h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="font-serif text-5xl font-semibold leading-[0.98] sm:text-6xl lg:text-7xl">
            Bring us the property.
            <span className="block pt-3 text-primary">We'll show you the path.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Whether the outcome is acquisition, development, representation, referral, or a disciplined pass, the first move is a structured review.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/submit">
              <Button
                onClick={() => trackEvent("cta_click", { id: "final_submit", to: "/submit" })}
                size="lg"
                className="h-14 w-full rounded-sm px-8 text-sm font-semibold uppercase sm:w-auto"
                data-testid="button-final-cta-submit"
              >
                Submit a Property
                <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/strategy-lab">
              <Button
                onClick={() => trackEvent("cta_click", { id: "final_strategy_lab", to: "/strategy-lab" })}
                size="lg"
                variant="outline"
                className="h-14 w-full rounded-sm px-8 text-sm font-semibold uppercase sm:w-auto"
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

function SectionHeader({
  eyebrow,
  title,
  body,
  center = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  center?: boolean;
}) {
  return (
    <ScrollReveal className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <Eyebrow text={eyebrow} />
      <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{body}</p>
    </ScrollReveal>
  );
}

function Eyebrow({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      <span className="h-px w-10 bg-primary" aria-hidden="true" />
      <p className={`min-w-0 flex-1 font-supporting text-xs font-semibold uppercase leading-tight ${light ? "text-primary" : "text-primary"}`}>
        {text}
      </p>
    </div>
  );
}

function TrustLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
