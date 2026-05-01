import {
  Layers,
  Sparkles,
  HardHat,
  Banknote,
  Bot,
  Building,
  ArrowUpRight,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { Link } from "wouter";
import {
  Section,
  Kicker,
  CopperRule,
  DisplayHeading,
  CTAButton,
  Reveal,
} from "@/components/brand/atoms";
import { PegasusWatermark } from "@/components/brand/pegasus-mark";

const products = [
  {
    icon: <Building className="h-5 w-5" />,
    name: "Pegasus HQ",
    role: "Operating Spine",
    status: "Internal",
    body: "The internal command center for Pegasus operations — projects, partners, capital, and decisions all flow through HQ.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    name: "MarketFlow",
    role: "Deal-Flow Platform",
    status: "Private Beta",
    body: "Structured deal intake, underwriting, scoring, negotiation, and decisioning across wholesale, capital, and listing lanes.",
    href: "/marketflow-beta",
  },
  {
    icon: <HardHat className="h-5 w-5" />,
    name: "BuildForge",
    role: "Project Execution",
    status: "In Development",
    body: "Coordinating renovations and construction projects — scope, vendors, materials, change orders, and timelines, all in one place.",
  },
  {
    icon: <Banknote className="h-5 w-5" />,
    name: "CapStack",
    role: "Capital Operations",
    status: "In Development",
    body: "Tracking the capital structure of every Pegasus-led project — equity, debt, distributions, and partner reporting.",
  },
  {
    icon: <Bot className="h-5 w-5" />,
    name: "Peggy",
    role: "Operating Intelligence",
    status: "Internal",
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

export default function Systems() {
  useSEO({
    title: "Systems",
    description:
      "Pegasus Systems is the internal product organization inside Pegasus Dreamscapes — building tools that bring governance, intelligence, and operational control to real estate execution.",
  });

  return (
    <div className="bg-[hsl(220_35%_5%)]">
      {/* Hero */}
      <Section variant="hero" className="overflow-hidden">
        <div className="absolute inset-0 bg-architect opacity-[0.18]" aria-hidden />
        <PegasusWatermark className="pointer-events-none absolute -right-24 top-12 h-[440px] w-[720px] opacity-25" />
        <div className="container-premium relative pt-36 pb-20 md:pt-44 md:pb-28">
          <Reveal>
            <Kicker>Pegasus Dreamscapes · Systems</Kicker>
          </Reveal>
          <Reveal delay={80}>
            <DisplayHeading
              as="h1"
              className="mt-6 max-w-4xl text-[44px] sm:text-[58px] md:text-[72px]"
            >
              The operating system behind disciplined real estate.
            </DisplayHeading>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead mt-8 max-w-2xl">
              Pegasus Systems is the internal product organization inside
              Pegasus Dreamscapes. We build the tools that bring governance,
              intelligence, and operational control to real estate execution —
              for ourselves, and for the operators we work with closely.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-10 flex flex-wrap gap-4">
              <CTAButton href="/marketflow-beta" testId="cta-sys-marketflow">
                Explore MarketFlow Beta
              </CTAButton>
              <CTAButton href="/contact?subject=systems" variant="ghost" testId="cta-sys-contact">
                Talk to Pegasus Systems
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Why */}
      <Section variant="canvas">
        <div className="container-premium section-y">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Kicker>Why Pegasus Systems Exists</Kicker>
              <DisplayHeading className="mt-4 text-4xl md:text-5xl">
                Operations are the product.
              </DisplayHeading>
            </Reveal>
            <Reveal delay={100} className="lg:col-span-7">
              <div className="accent-rail space-y-6">
                <p className="lead">
                  Most real estate operations are duct-taped together — a
                  spreadsheet here, a CRM there, a chat thread for the
                  important parts, and tribal knowledge in someone's head.
                </p>
                <p className="lead">
                  Pegasus Systems exists because that approach doesn't scale
                  and doesn't compound. We build the platform we need ourselves
                  — and where appropriate, we open access to a small group of
                  operators who care about the same things we do.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Products */}
      <Section variant="ink">
        <div className="container-premium section-y">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Kicker>Pegasus Systems · Product Family</Kicker>
            <DisplayHeading className="mt-4 text-4xl md:text-5xl">
              Five connected products. One operating standard.
            </DisplayHeading>
            <CopperRule className="mt-10" />
          </Reveal>

          <div className="mt-14 space-y-px overflow-hidden rounded-sm border border-copper/15 bg-copper/15">
            {products.map((p, i) => (
              <Reveal key={p.name} delay={i * 50}>
                <div className="grid items-start gap-6 bg-[hsl(220_30%_8%)] p-8 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-1">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-copper/35 text-copper">
                      {p.icon}
                    </span>
                  </div>
                  <div className="md:col-span-3">
                    <h4 className="font-display text-2xl text-ivory">{p.name}</h4>
                    <p className="mt-1 text-[12px] uppercase tracking-[0.2em] text-copper/80">
                      {p.role}
                    </p>
                  </div>
                  <div className="md:col-span-6">
                    <p className="text-[14.5px] leading-relaxed text-muted-ivory">{p.body}</p>
                  </div>
                  <div className="md:col-span-2 md:text-right">
                    <span
                      className={`inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] ${
                        p.status === "Private Beta"
                          ? "border-copper/40 bg-copper/10 text-copper"
                          : p.status === "Internal"
                          ? "border-copper/15 text-ivory/60"
                          : "border-copper/20 text-bronze"
                      }`}
                    >
                      {p.status}
                    </span>
                    {p.href && (
                      <Link
                        href={p.href}
                        className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-copper hover:text-bronze"
                      >
                        Learn More
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Principles */}
      <Section variant="canvas">
        <div className="container-premium section-y">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <Kicker>How Pegasus Systems Works</Kicker>
              <DisplayHeading className="mt-4 text-4xl md:text-5xl">
                Built for operators, not for headlines.
              </DisplayHeading>
            </Reveal>
            <div className="lg:col-span-8">
              <div className="grid gap-px overflow-hidden rounded-sm border border-copper/15 bg-copper/15 sm:grid-cols-3">
                {principles.map((p, i) => (
                  <Reveal key={p.title} delay={i * 80}>
                    <div className="h-full bg-[hsl(220_30%_8%)] p-7">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-copper/35 text-copper">
                        <Layers className="h-5 w-5" />
                      </span>
                      <h4 className="font-display mt-5 text-xl text-ivory">{p.title}</h4>
                      <p className="mt-3 text-[14px] leading-relaxed text-muted-ivory">
                        {p.body}
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
              Want a closer look at Pegasus Systems?
            </DisplayHeading>
            <p className="lead mt-6">
              MarketFlow is the public-facing product to start with. The rest
              of the family is intentionally private until it's ready for the
              right operators.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <CTAButton href="/marketflow-beta">Explore MarketFlow</CTAButton>
              <CTAButton href="/contact?subject=systems" variant="ghost">
                Talk to Pegasus Systems
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}
