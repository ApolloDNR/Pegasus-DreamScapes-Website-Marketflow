import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import {
  Hammer,
  ClipboardList,
  Compass,
  Building2,
  Wrench,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const phases = [
  {
    n: "01",
    icon: Compass,
    title: "Acquisition Strategy",
    body: "We start with the thesis. Sub-market, asset profile, exit path, capital structure. If the strategy isn't clear, the project doesn't move forward.",
  },
  {
    n: "02",
    icon: ClipboardList,
    title: "Underwriting & Scope",
    body: "Numbers first. ARV, hold costs, renovation scope, contingencies, and exit assumptions are stress-tested before we commit capital.",
  },
  {
    n: "03",
    icon: Wrench,
    title: "Project Coordination",
    body: "Vendors, materials, schedules, and decisions are coordinated through Pegasus. Scope stays documented; changes stay accountable.",
  },
  {
    n: "04",
    icon: Hammer,
    title: "Renovation & Build",
    body: "We work with disciplined trades that share our standards on quality, timelines, and communication. The work is supervised, not delegated.",
  },
  {
    n: "05",
    icon: Building2,
    title: "Stabilization",
    body: "Whether the exit is a sale, a hold, or a refinance, we stabilize the asset to a quality that earns its long-term value.",
  },
  {
    n: "06",
    icon: CheckCircle2,
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
  useSEO({
    title: "Development | Pegasus Dreamscapes",
    description:
      "Pegasus Development transforms real estate opportunities through disciplined renovation, project planning, and value-add execution — from acquisition strategy to project coordination.",
  });

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-secondary/5 via-background to-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                Pegasus Dreamscapes · Development
              </p>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-3xl">
              Where vision becomes physical value.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              Pegasus Development is the execution arm of Pegasus Dreamscapes.
              We transform real estate opportunities through disciplined
              renovation, project planning, and value-add execution — from
              acquisition strategy to material decisions to project coordination.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sell">
                <Button size="lg" data-testid="cta-dev-submit">
                  Submit a Property
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact?subject=development">
                <Button variant="outline" size="lg" data-testid="cta-dev-contact">
                  Discuss a Project
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Approach */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <ScrollReveal>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                  How We Approach Development
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Strategy, scope, execution, follow-through.
              </h2>
            </ScrollReveal>
            <ScrollReveal>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Development is where most real estate companies lose discipline.
                  The numbers look good on paper, the renovations drift, scope creeps,
                  and the original thesis disappears.
                </p>
                <p>
                  Pegasus runs development the opposite way. We commit to a strategy
                  on day one, document the scope, hold contingencies in reserve, and
                  supervise the work with the same seriousness we'd apply if it were
                  our only project.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Phases */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="text-center mb-14">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                The Pegasus Development Process
              </p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Six phases, every project.
            </h2>
          </ScrollReveal>

          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
            {phases.map((p) => (
              <StaggerItem key={p.n}>
                <Card className="h-full">
                  <CardContent className="p-7">
                    <p className="font-serif text-4xl font-bold text-primary/20 mb-3">{p.n}</p>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <p.icon className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">{p.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            <ScrollReveal>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                  What We Develop
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Selective. Disciplined. Real.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We focus on a clear set of asset types where our underwriting,
                operations, and partnerships have an edge. We say no to everything else.
              </p>
            </ScrollReveal>

            <div className="lg:col-span-2">
              <StaggerChildren className="grid sm:grid-cols-2 gap-5" staggerDelay={0.1}>
                {services.map((s) => (
                  <StaggerItem key={s.title}>
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-2">{s.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-secondary text-secondary-foreground">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              Have a property — or a project — that fits?
            </h2>
            <p className="text-secondary-foreground/80 mb-10 leading-relaxed">
              We review every submission seriously. If it fits the thesis, we follow
              up with a real conversation, not a templated reply.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/sell">
                <Button size="lg" variant="secondary" className="bg-white text-secondary hover:bg-white/90">
                  Submit a Property
                </Button>
              </Link>
              <Link href="/contact?subject=development">
                <Button size="lg" variant="outline" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
                  Discuss a Project
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
