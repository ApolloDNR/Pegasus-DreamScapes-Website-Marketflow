import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import {
  Layers,
  Sparkles,
  HardHat,
  Banknote,
  Bot,
  Building,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

const products = [
  {
    icon: Building,
    name: "Pegasus HQ",
    role: "Operating Spine",
    status: "Internal" as const,
    body: "The internal command center for Pegasus operations — projects, partners, capital, and decisions all flow through HQ.",
  },
  {
    icon: Sparkles,
    name: "MarketFlow",
    role: "Deal-Flow Platform",
    status: "Private Beta" as const,
    body: "Structured deal intake, underwriting, scoring, negotiation, and decisioning across wholesale, capital, and listing lanes.",
    href: "/marketflow-beta",
  },
  {
    icon: HardHat,
    name: "BuildForge",
    role: "Project Execution",
    status: "In Development" as const,
    body: "Coordinating renovations and construction projects — scope, vendors, materials, change orders, and timelines, all in one place.",
  },
  {
    icon: Banknote,
    name: "CapStack",
    role: "Capital Operations",
    status: "In Development" as const,
    body: "Tracking the capital structure of every Pegasus-led project — equity, debt, distributions, and partner reporting.",
  },
  {
    icon: Bot,
    name: "Peggy",
    role: "Operating Intelligence",
    status: "Internal" as const,
    body: "An AI assistant trained on Pegasus methodology — for context, analysis, and faster decisions across the operating system.",
  },
];

const principles = [
  {
    title: "Real Operations, Real Tools",
    body: "Pegasus Systems is built from the inside out — every tool exists because we needed it ourselves first.",
  },
  {
    title: "Discipline Over Hype",
    body: "These are not pitch-deck products. They're operational systems that make real estate execution more accountable.",
  },
  {
    title: "Private by Default",
    body: "We open access in stages, to operators we can support seriously. Not every product will be public.",
  },
];

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  "Private Beta": "default",
  Internal: "outline",
  "In Development": "secondary",
};

export default function Systems() {
  useSEO({
    title: "Systems | Pegasus Dreamscapes",
    description:
      "Pegasus Systems is the internal product organization inside Pegasus Dreamscapes — building tools that bring governance, intelligence, and operational control to real estate execution.",
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
                Pegasus Dreamscapes · Systems
              </p>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-3xl">
              The operating system behind disciplined real estate.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              Pegasus Systems is the internal product organization inside Pegasus
              Dreamscapes. We build the tools that bring governance, intelligence,
              and operational control to real estate execution — for ourselves, and
              for the operators we work with closely.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/marketflow-beta">
                <Button size="lg" data-testid="cta-sys-marketflow">
                  Explore MarketFlow Beta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact?subject=systems">
                <Button variant="outline" size="lg" data-testid="cta-sys-contact">
                  Talk to Pegasus Systems
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <ScrollReveal>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                  Why Pegasus Systems Exists
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                Operations are the product.
              </h2>
            </ScrollReveal>
            <ScrollReveal>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Most real estate operations are duct-taped together — a spreadsheet
                  here, a CRM there, a chat thread for the important parts, and tribal
                  knowledge in someone's head.
                </p>
                <p>
                  Pegasus Systems exists because that approach doesn't scale and
                  doesn't compound. We build the platform we need ourselves — and
                  where appropriate, we open access to a small group of operators who
                  care about the same things we do.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="text-center mb-14">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                Product Family
              </p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Five connected products. One operating standard.
            </h2>
          </ScrollReveal>

          <StaggerChildren className="space-y-4" staggerDelay={0.08}>
            {products.map((p) => (
              <StaggerItem key={p.name}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 md:items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <p.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 md:grid md:grid-cols-12 md:items-center md:gap-4">
                        <div className="md:col-span-3">
                          <h3 className="font-semibold">{p.name}</h3>
                          <p className="text-xs text-primary font-medium uppercase tracking-wide mt-0.5">
                            {p.role}
                          </p>
                        </div>
                        <p className="mt-2 md:mt-0 text-sm text-muted-foreground leading-relaxed md:col-span-7">
                          {p.body}
                        </p>
                        <div className="mt-3 md:mt-0 md:col-span-2 md:text-right flex md:flex-col items-center md:items-end gap-3">
                          <Badge variant={statusVariant[p.status]}>
                            {p.status}
                          </Badge>
                          {p.href && (
                            <Link href={p.href}>
                              <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                Learn More
                                <ArrowUpRight className="h-3 w-3" />
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Principles */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            <ScrollReveal>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                  How Pegasus Systems Works
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                Built for operators, not for headlines.
              </h2>
            </ScrollReveal>

            <div className="lg:col-span-2">
              <StaggerChildren className="grid sm:grid-cols-3 gap-6" staggerDelay={0.1}>
                {principles.map((p) => (
                  <StaggerItem key={p.title}>
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Layers className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">{p.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
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
              Want a closer look at Pegasus Systems?
            </h2>
            <p className="text-secondary-foreground/80 mb-10 leading-relaxed">
              MarketFlow is the public-facing product to start with. The rest of the
              family is intentionally private until it's ready for the right operators.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/marketflow-beta">
                <Button size="lg" variant="secondary" className="bg-white text-secondary hover:bg-white/90">
                  Explore MarketFlow
                </Button>
              </Link>
              <Link href="/contact?subject=systems">
                <Button size="lg" variant="outline" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
                  Talk to Pegasus Systems
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
