import { useEffect } from "react";
import {
  Hammer,
  ClipboardList,
  Compass,
  Building2,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import {
  Section,
  Kicker,
  CopperRule,
  DisplayHeading,
  CTAButton,
  Reveal,
} from "@/components/brand/atoms";
import { PegasusWatermark } from "@/components/brand/pegasus-mark";

const phases = [
  {
    n: "01",
    icon: <Compass className="h-5 w-5" />,
    title: "Acquisition Strategy",
    body: "We start with the thesis. Sub-market, asset profile, exit path, capital structure. If the strategy isn't clear, the project doesn't move forward.",
  },
  {
    n: "02",
    icon: <ClipboardList className="h-5 w-5" />,
    title: "Underwriting & Scope",
    body: "Numbers first. ARV, hold costs, renovation scope, contingencies, and exit assumptions are stress-tested before we commit capital.",
  },
  {
    n: "03",
    icon: <Wrench className="h-5 w-5" />,
    title: "Project Coordination",
    body: "Vendors, materials, schedules, and decisions are coordinated through Pegasus. Scope stays documented; changes stay accountable.",
  },
  {
    n: "04",
    icon: <Hammer className="h-5 w-5" />,
    title: "Renovation & Build",
    body: "We work with disciplined trades that share our standards on quality, timelines, and communication. The work is supervised, not delegated.",
  },
  {
    n: "05",
    icon: <Building2 className="h-5 w-5" />,
    title: "Stabilization",
    body: "Whether the exit is a sale, a hold, or a refinance, we stabilize the asset to a quality that earns its long-term value.",
  },
  {
    n: "06",
    icon: <CheckCircle2 className="h-5 w-5" />,
    title: "Outcome & Reporting",
    body: "Final numbers, lessons, and operational notes are documented — for our partners and for the next project.",
  },
];

const services = [
  {
    title: "Single-Family Renovation",
    body: "Full-cycle execution on residential properties — from acquisition through resale or stabilization.",
  },
  {
    title: "Value-Add Multifamily",
    body: "Targeted improvements to small and mid-size multifamily assets, structured for long-term cash flow.",
  },
  {
    title: "Mixed-Use & Adaptive Reuse",
    body: "Selective projects where the right design and operations decisions unlock real value.",
  },
  {
    title: "Project Coordination Services",
    body: "Pegasus-led project management for partners who own the asset but want disciplined execution.",
  },
];

export default function Development() {
  useEffect(() => {
    document.title = "Development — Pegasus Dreamscapes";
  }, []);

  return (
    <div className="bg-[hsl(220_35%_5%)]">
      {/* Hero */}
      <Section variant="hero" className="overflow-hidden">
        <div className="absolute inset-0 bg-architect opacity-[0.18]" aria-hidden />
        <PegasusWatermark className="pointer-events-none absolute -right-24 top-12 h-[440px] w-[720px] opacity-25" />
        <div className="container-premium relative pt-36 pb-20 md:pt-44 md:pb-28">
          <Reveal>
            <Kicker>Pegasus Dreamscapes · Development</Kicker>
          </Reveal>
          <Reveal delay={80}>
            <DisplayHeading
              as="h1"
              className="mt-6 max-w-4xl text-[44px] sm:text-[58px] md:text-[72px]"
            >
              Where vision becomes physical value.
            </DisplayHeading>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead mt-8 max-w-2xl">
              Pegasus Development is the execution arm of Pegasus Dreamscapes.
              We transform real estate opportunities through disciplined
              renovation, project planning, and value-add execution — from
              acquisition strategy to material decisions to project
              coordination.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-10 flex flex-wrap gap-4">
              <CTAButton href="/sell" testId="cta-dev-submit">
                Submit a Property
              </CTAButton>
              <CTAButton href="/contact?subject=development" variant="ghost" testId="cta-dev-contact">
                Discuss a Project
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Approach */}
      <Section variant="canvas">
        <div className="container-premium section-y">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Kicker>How We Approach Development</Kicker>
              <DisplayHeading className="mt-4 text-4xl md:text-5xl">
                Strategy, scope, execution, follow-through.
              </DisplayHeading>
            </Reveal>
            <Reveal delay={100} className="lg:col-span-7">
              <div className="accent-rail space-y-6">
                <p className="lead">
                  Development is where most real estate companies lose
                  discipline. The numbers look good on paper, the renovations
                  drift, scope creeps, and the original thesis disappears.
                </p>
                <p className="lead">
                  Pegasus runs development the opposite way. We commit to a
                  strategy on day one, document the scope, hold contingencies
                  in reserve, and supervise the work with the same seriousness
                  we'd apply if it were our only project.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Phases */}
      <Section variant="ink">
        <div className="container-premium section-y">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Kicker>The Pegasus Development Process</Kicker>
            <DisplayHeading className="mt-4 text-4xl md:text-5xl">
              Six phases, every project.
            </DisplayHeading>
            <CopperRule className="mt-10" />
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-copper/15 bg-copper/15 sm:grid-cols-2 lg:grid-cols-3">
            {phases.map((p, i) => (
              <Reveal key={p.n} delay={i * 60}>
                <div className="relative h-full bg-[hsl(220_30%_8%)] p-8">
                  <p className="font-display text-[40px] leading-none text-copper/30">
                    {p.n}
                  </p>
                  <span className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-sm border border-copper/35 text-copper">
                    {p.icon}
                  </span>
                  <h4 className="font-display mt-5 text-2xl text-ivory">{p.title}</h4>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-muted-ivory">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Services */}
      <Section variant="canvas">
        <div className="container-premium section-y">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <Kicker>What We Develop</Kicker>
              <DisplayHeading className="mt-4 text-4xl md:text-5xl">
                Selective. Disciplined. Real.
              </DisplayHeading>
              <p className="lead mt-6">
                We focus on a clear set of asset types where our underwriting,
                operations, and partnerships have an edge. We say no to
                everything else.
              </p>
            </Reveal>

            <div className="lg:col-span-8">
              <div className="grid gap-px overflow-hidden rounded-sm border border-copper/15 bg-copper/15 sm:grid-cols-2">
                {services.map((s, i) => (
                  <Reveal key={s.title} delay={i * 80}>
                    <div className="h-full bg-[hsl(220_30%_8%)] p-7">
                      <h4 className="font-display text-2xl text-ivory">{s.title}</h4>
                      <p className="mt-3 text-[14.5px] leading-relaxed text-muted-ivory">
                        {s.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="ink">
        <div className="container-premium section-y">
          <Reveal className="mx-auto max-w-3xl text-center">
            <DisplayHeading className="text-4xl md:text-5xl">
              Have a property — or a project — that fits?
            </DisplayHeading>
            <p className="lead mt-6">
              We review every submission seriously. If it fits the thesis, we
              follow up with a real conversation, not a templated reply.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <CTAButton href="/sell">Submit a Property</CTAButton>
              <CTAButton href="/contact?subject=development" variant="ghost">
                Discuss a Project
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}
