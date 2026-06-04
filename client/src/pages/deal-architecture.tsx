import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import { ArrowRight, CheckCircle2, Compass, FileSearch, Handshake, Home, Landmark, Route, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { HeroPicture } from "@/components/hero-picture";

const principles = [
  {
    title: "Situation first",
    body: "The property is only one part of the deal. Timeline, pressure, people, documents, and execution risk decide the path.",
    icon: FileSearch,
  },
  {
    title: "Structure before offer",
    body: "Price is not strategy. Pegasus reviews whether value is created by acquisition, development, representation, partnership, routing, or a clean pass.",
    icon: Route,
  },
  {
    title: "Execution before expansion",
    body: "A path only matters if the scope, capital, approvals, and operating discipline can actually support it.",
    icon: ShieldCheck,
  },
];

const pathStack = [
  ["01", "Read", "Facts, pressure, constraints, and missing information."],
  ["02", "Underwrite", "As-Is, Stabilized, and Optimized value stories, including forced appreciation where the facts support it."],
  ["03", "Structure", "Acquisition, development, listing, JV, assignment, referral, network route, or pass."],
  ["04", "Participate", "Pegasus only steps into lanes where the structure can stay clear, documented, and useful to the parties."],
];

const outcomes = [
  { label: "Buy", icon: Home },
  { label: "Develop", icon: Landmark },
  { label: "Represent", icon: Users },
  { label: "Partner", icon: Handshake },
  { label: "Route", icon: Compass },
  { label: "Pass", icon: ShieldCheck },
];

export default function DealArchitecturePage() {
  useSEO({
    title: "Deal Architecture",
    description:
      "Pegasus Dreamscapes starts with the property situation, then routes the opportunity to the best outcome.",
    image: "/og/default.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <PrinciplesSection />
      <PathStackSection />
      <OutcomeSection />
      <ComplianceSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[86vh] overflow-hidden bg-[hsl(var(--navy))] pt-24 text-cream lg:pt-28">
      <div className="absolute inset-0 opacity-30">
        <HeroPicture
          alt="Architectural property used as Pegasus Deal Architecture backdrop"
          className="h-full w-full object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,15,25,0.94)_0%,rgba(8,15,25,0.84)_46%,rgba(8,15,25,0.54)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[hsl(var(--background))] to-transparent" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-[calc(86vh-6rem)] max-w-7xl items-center gap-12 px-6 pb-16 lg:grid-cols-12 lg:px-12">
        <div className="min-w-0 max-w-[22rem] sm:max-w-none lg:col-span-7">
          <Eyebrow text="Deal Architecture" light />
          <h1 className="mt-6 max-w-[22rem] font-serif text-4xl font-semibold leading-[1.02] text-white sm:max-w-4xl sm:text-6xl sm:leading-[0.98] lg:text-7xl">
            Property pressure needs more than an offer.
            <span className="block pt-3 italic text-[#D4B483]">It needs an architecture.</span>
          </h1>
          <p className="mt-7 max-w-[22rem] font-serif text-lg leading-relaxed text-white/90 sm:max-w-2xl sm:text-2xl">
            Pegasus reads the asset, the people, the pressure, and the execution constraints before choosing a participation lane.
          </p>
          <p className="mt-5 max-w-[22rem] text-base leading-relaxed text-cream/75 sm:max-w-2xl">
            Acquire, develop, represent, partner, route, or pass. The point is to identify the cleanest viable path, not to force every situation into the same box.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/submit">
              <Button className="h-14 w-full max-w-[22rem] rounded-sm bg-primary px-8 text-sm font-semibold uppercase text-white hover:bg-primary/90 sm:w-auto sm:max-w-none">
                Submit a Property
                <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/strategy-lab">
              <Button variant="outline" className="h-14 w-full max-w-[22rem] rounded-sm border-white/40 bg-white/5 px-8 text-sm font-semibold uppercase text-white hover:bg-white/10 sm:w-auto sm:max-w-none">
                Open Strategy Lab
              </Button>
            </Link>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5">
          <div className="border border-white/20 bg-[rgba(10,18,30,0.78)] p-5 shadow-[0_32px_90px_-60px_rgba(0,0,0,0.9)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="font-supporting text-xs font-semibold uppercase text-primary">Architecture memo</p>
                <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-white">
                  Read the situation before naming the route.
                </h2>
              </div>
              <span className="border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-primary">
                Review
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {pathStack.map(([number, title, body]) => (
                <div key={title} className="grid gap-4 border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[3.5rem_1fr]">
                  <p className="font-display text-xs font-semibold text-primary">{number}</p>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-cream/70">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["No forced offer", "No one-lane thinking", "No public securities solicitation", "No strategy without review"].map((item) => (
                <div key={item} className="flex items-center gap-3 border border-white/10 bg-white/[0.035] px-3 py-3 text-xs text-white/75">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="brand-stripe" aria-hidden="true" />
    </section>
  );
}

function PrinciplesSection() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <ScrollReveal className="lg:col-span-4">
            <Eyebrow text="What it means" />
            <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Deal Architecture is disciplined participation.
            </h2>
          </ScrollReveal>
          <StaggerChildren className="lg:col-span-8 grid gap-5 md:grid-cols-3" staggerDelay={0.05}>
            {principles.map((principle) => (
              <StaggerItem key={principle.title}>
                <PrincipleCard {...principle} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}

function PrincipleCard({ title, body, icon: Icon }: { title: string; body: string; icon: LucideIcon }) {
  return (
    <article className="h-full border border-border/70 bg-card p-6">
      <Icon className="mb-6 h-5 w-5 text-primary" aria-hidden="true" />
      <h3 className="font-serif text-2xl font-semibold">{title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}

function PathStackSection() {
  return (
    <section className="bg-[hsl(var(--charcoal))] py-24 text-cream lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <ScrollReveal className="lg:col-span-5">
            <Eyebrow text="The path stack" light />
            <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              A better answer needs a better order.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cream/75">
              The work stays calm under pressure: precise, deliberate, and structured before any participation lane is discussed.
            </p>
          </ScrollReveal>
          <ScrollReveal className="lg:col-span-7" direction="left">
            <div className="border border-white/20 bg-white/[0.035]">
              {pathStack.map(([number, title, body], index) => (
                <div key={title} className={`grid gap-5 p-6 md:grid-cols-[80px_1fr_1.4fr] ${index > 0 ? "border-t border-white/10" : ""}`}>
                  <span className="font-display text-sm font-semibold text-primary">{number}</span>
                  <h3 className="font-serif text-2xl font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-cream/75">{body}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function OutcomeSection() {
  return (
    <section className="bg-card py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <Eyebrow text="Possible outcomes" />
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            The participation lane must fit the property.
          </h2>
        </ScrollReveal>
        <StaggerChildren className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-6" staggerDelay={0.04}>
          {outcomes.map((outcome, index) => {
            const Icon = outcome.icon;
            return (
              <StaggerItem key={outcome.label}>
                <div className="min-h-32 border border-border bg-background p-5 text-center">
                  <Icon className="mx-auto mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="font-serif text-2xl font-semibold">{outcome.label}</p>
                  <p className="mt-3 font-display text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}

function ComplianceSection() {
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-5xl px-6 lg:px-12">
        <div className="border border-primary/25 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Deal Architecture is informational and strategic. It is not an appraisal, offer, ARV opinion, rehab budget, legal advice, tax advice, securities offering, or guaranteed result.
            </p>
          </div>
        </div>
      </div>
    </section>
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
