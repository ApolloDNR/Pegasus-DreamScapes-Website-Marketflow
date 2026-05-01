import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight,
  Building2,
  Compass,
  LineChart,
  Layers,
  ShieldCheck,
  Users,
  ScrollText,
  Hammer,
  Home as HomeIcon,
  Briefcase,
  KeyRound,
  Network,
} from "lucide-react";
import {
  Section,
  Kicker,
  CopperRule,
  DisplayHeading,
  CTAButton,
  Reveal,
  PillarCard,
} from "@/components/brand/atoms";
import { PegasusWatermark } from "@/components/brand/pegasus-mark";

/* ============================================================================
   HERO
   ============================================================================ */
function Hero() {
  return (
    <Section variant="hero" className="overflow-hidden">
      <div className="absolute inset-0 bg-architect opacity-[0.18]" aria-hidden />
      <PegasusWatermark className="pointer-events-none absolute -right-24 top-12 h-[460px] w-[760px] opacity-[0.28]" />

      <div className="container-premium relative pt-36 pb-24 md:pt-44 md:pb-32">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal>
              <Kicker>Development · Investments · Systems</Kicker>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="font-display mt-6 text-balance text-[44px] leading-[0.98] tracking-tight text-ivory sm:text-[58px] md:text-[72px] lg:text-[84px]">
                Dream it.
                <br />
                <span className="text-copper">Build it.</span> Live it.
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <div className="accent-rail mt-8 max-w-xl">
                <p className="font-display text-[22px] leading-snug text-ivory/90 md:text-[26px]">
                  Real estate execution, built with discipline.
                </p>
                <p className="lead mt-4">
                  Pegasus Dreamscapes is a real estate development, investment,
                  and systems company built to source opportunities, structure
                  deals, manage execution, and create long-term value.
                </p>
              </div>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <CTAButton href="/sell" testId="cta-hero-submit">
                  Submit an Opportunity
                </CTAButton>
                <CTAButton href="/marketflow-beta" variant="ghost" testId="cta-hero-marketflow">
                  Explore MarketFlow Beta
                </CTAButton>
              </div>
            </Reveal>

            <Reveal delay={280}>
              <p className="mt-10 text-[12px] uppercase tracking-[0.28em] text-ivory/50">
                Built in the East Bay · Designed for disciplined real estate execution
              </p>
            </Reveal>
          </div>

          <Reveal delay={200} className="lg:col-span-5">
            <div className="relative">
              <div
                className="absolute -inset-px rounded-sm bg-gradient-to-br from-copper/40 via-transparent to-transparent opacity-60 blur-sm"
                aria-hidden
              />
              <div className="relative rounded-sm border border-copper/30 bg-[hsl(220_35%_6%)]/90 p-8 backdrop-blur-md">
                <Kicker>The Pegasus Operating Model</Kicker>
                <h3 className="font-display mt-4 text-3xl leading-tight text-ivory">
                  Three divisions.
                  <br /> One operating discipline.
                </h3>

                <ul className="mt-7 space-y-5">
                  {[
                    {
                      icon: <Hammer className="h-4 w-4" />,
                      title: "Development",
                      body: "Transform real property with disciplined execution.",
                    },
                    {
                      icon: <LineChart className="h-4 w-4" />,
                      title: "Investments",
                      body: "Structure opportunities with clarity and control.",
                    },
                    {
                      icon: <Layers className="h-4 w-4" />,
                      title: "Systems",
                      body: "Build the tools that keep execution accountable.",
                    },
                  ].map((row) => (
                    <li
                      key={row.title}
                      className="flex items-start gap-4 border-l border-copper/30 pl-4"
                    >
                      <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-sm border border-copper/40 text-copper">
                        {row.icon}
                      </span>
                      <div>
                        <p className="font-display-uppercase text-[12px] tracking-[0.22em] text-ivory">
                          {row.title}
                        </p>
                        <p className="mt-1 text-[14px] text-muted-ivory">{row.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   PILLARS
   ============================================================================ */
function Pillars() {
  return (
    <Section id="pillars" variant="canvas">
      <div className="container-premium section-y">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Kicker>The Pegasus Architecture</Kicker>
          <DisplayHeading className="mt-4 text-4xl md:text-5xl">
            Three divisions. One operating discipline.
          </DisplayHeading>
          <p className="lead mt-6">
            Pegasus Dreamscapes is built around the full lifecycle of real
            estate execution — finding opportunities, creating value, and
            building the systems that keep every move accountable.
          </p>
          <CopperRule className="mt-10" />
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          <Reveal>
            <PillarCard
              testId="pillar-development"
              kicker="01 · Development"
              title="Development"
              body="We transform real estate opportunities through disciplined renovation, project planning, and value-add execution. From acquisition strategy to material decisions and project coordination, development is where vision becomes physical value."
              href="/development"
              ctaLabel="Explore Development"
              icon={<Hammer className="h-7 w-7" />}
            />
          </Reveal>
          <Reveal delay={100}>
            <PillarCard
              testId="pillar-investments"
              kicker="02 · Investments"
              title="Investments"
              body="We evaluate, structure, and partner on real estate opportunities with a focus on clarity, risk awareness, and long-term value. Every conversation starts with the numbers, the strategy, and the execution path."
              href="/investments"
              ctaLabel="Explore Investments"
              icon={<LineChart className="h-7 w-7" />}
            />
          </Reveal>
          <Reveal delay={200}>
            <PillarCard
              testId="pillar-systems"
              kicker="03 · Systems"
              title="Systems"
              body="Pegasus Systems brings governance, intelligence, and operational control to real estate execution. Pegasus HQ, MarketFlow, BuildForge, CapStack, and Peggy are designed to support disciplined operators."
              href="/systems"
              ctaLabel="Explore Systems"
              icon={<Layers className="h-7 w-7" />}
            />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   WHO WE SERVE
   ============================================================================ */
const audiences = [
  {
    icon: <HomeIcon className="h-5 w-5" />,
    title: "Property Sellers",
    body: "Have an as-is, inherited, distressed, outdated, or underutilized property? Submit it for review and we'll evaluate possible acquisition or partnership paths.",
    cta: { href: "/sell", label: "Submit a Property" },
  },
  {
    icon: <ScrollText className="h-5 w-5" />,
    title: "Wholesalers & Deal Sources",
    body: "Have a real opportunity that needs review, structure, or capital? Send the deal — we move quickly on numbers, exit strategy, and execution path.",
    cta: { href: "/submit-deal", label: "Submit a Deal" },
  },
  {
    icon: <Briefcase className="h-5 w-5" />,
    title: "Investors & Capital Partners",
    body: "Looking for disciplined real estate exposure? We structure deal-by-deal partnerships and joint ventures with clear underwriting and reporting.",
    cta: { href: "/investments", label: "Partner With Pegasus" },
  },
  {
    icon: <KeyRound className="h-5 w-5" />,
    title: "Buyers & End Users",
    body: "Looking for a renovated home with intent and craft behind it? Pegasus delivers homes designed to live in, not just to flip.",
    cta: { href: "/contact?subject=buyer", label: "Inquire About a Home" },
  },
  {
    icon: <Hammer className="h-5 w-5" />,
    title: "Contractors & Trades",
    body: "We work with disciplined contractors who care about scope, quality, and timelines. Tell us what you build and let's open a conversation.",
    cta: { href: "/contact?subject=contractor", label: "Work With Us" },
  },
  {
    icon: <Network className="h-5 w-5" />,
    title: "Strategic Partners",
    body: "Operators, agents, lenders, attorneys, and platforms who want to move real estate forward together. Long-term relationships, real execution.",
    cta: { href: "/contact?subject=partner", label: "Open a Conversation" },
  },
];

function WhoWeServe() {
  return (
    <Section id="serve" variant="ink">
      <div className="container-premium section-y">
        <Reveal>
          <Kicker>Opportunities Start Here</Kicker>
          <DisplayHeading className="mt-4 max-w-3xl text-4xl md:text-5xl">
            Built for the people who move real estate forward.
          </DisplayHeading>
          <p className="lead mt-6 max-w-2xl">
            Pegasus works with sellers, deal sources, investors, buyers,
            contractors, and strategic partners who value clear communication,
            serious execution, and a disciplined path from opportunity to
            outcome.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-copper/15 bg-copper/15 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((a, i) => (
            <Reveal key={a.title} delay={i * 60}>
              <div className="group h-full bg-[hsl(220_30%_8%)] p-8 transition hover:bg-[hsl(220_30%_10%)]">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-copper/40 text-copper">
                    {a.icon}
                  </span>
                  <h3 className="font-display text-2xl text-ivory">{a.title}</h3>
                </div>
                <p className="mt-5 text-[14.5px] leading-relaxed text-muted-ivory">
                  {a.body}
                </p>
                <Link
                  href={a.cta.href}
                  className="mt-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-copper transition group-hover:text-bronze"
                  data-testid={`audience-cta-${a.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {a.cta.label}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   MARKETFLOW
   ============================================================================ */
function MarketFlowFeature() {
  return (
    <Section id="marketflow" variant="canvas">
      <div className="container-premium section-y">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <Kicker>Pegasus Systems · MarketFlow</Kicker>
            <DisplayHeading className="mt-4 text-4xl md:text-5xl">
              A disciplined deal-flow command center.
            </DisplayHeading>
            <p className="lead mt-6">
              MarketFlow is the private beta product inside Pegasus Systems. It
              gives operators, investors, and partners a clear, accountable
              view of real estate opportunities — from intake to decision to
              execution.
            </p>
            <p className="lead mt-4">
              MarketFlow is currently in invitation-only beta. We're working
              with a small group of trusted operators and capital partners
              before opening access more broadly.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Structured deal intake across wholesale, capital, and listing lanes",
                "Underwriting, scoring, and documentation in one workspace",
                "Negotiation rooms with offer history and counter-offer ladders",
                "Role-aware portals for investors, wholesalers, buyers, and admins",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[15px] text-ivory/85">
                  <span className="mt-2 inline-block h-1 w-1 flex-shrink-0 rotate-45 bg-copper" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <CTAButton href="/marketflow-beta" testId="cta-marketflow-learn">
                Learn About MarketFlow
              </CTAButton>
              <CTAButton
                href="/contact?subject=marketflow-access"
                variant="ghost"
                testId="cta-marketflow-access"
              >
                Request Access
              </CTAButton>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-6">
            <div className="relative">
              <div
                className="absolute -inset-3 rounded-sm bg-gradient-to-br from-copper/30 via-transparent to-transparent opacity-50 blur-2xl"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-sm border border-copper/25 bg-[hsl(220_35%_5%)]">
                <div className="flex items-center gap-2 border-b border-copper/15 px-5 py-3">
                  <span className="h-2 w-2 rounded-full bg-copper/70" />
                  <span className="h-2 w-2 rounded-full bg-copper/40" />
                  <span className="h-2 w-2 rounded-full bg-copper/20" />
                  <span className="ml-3 text-[10px] uppercase tracking-[0.32em] text-ivory/50">
                    MarketFlow / Deal Pipeline
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-px bg-copper/10">
                  <div className="col-span-4 bg-[hsl(220_35%_6%)] p-5 sm:col-span-3">
                    <p className="kicker text-copper/70">Lanes</p>
                    {["Wholesale", "Capital", "Listings", "Acquisition"].map((l, i) => (
                      <div
                        key={l}
                        className={`mt-3 rounded-sm border px-3 py-2 text-[12px] ${
                          i === 0
                            ? "border-copper/60 bg-copper/10 text-ivory"
                            : "border-copper/10 text-ivory/60"
                        }`}
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                  <div className="col-span-8 bg-[hsl(220_30%_7%)] p-5 sm:col-span-9">
                    <div className="flex items-center justify-between">
                      <p className="kicker text-copper/70">Active Pipeline</p>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/40">
                        Beta
                      </p>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {[
                        { id: "PD-0142", name: "Mixed-Use · Oakland", status: "Underwriting" },
                        { id: "PD-0139", name: "SFR Flip · Hayward", status: "Negotiation" },
                        { id: "PD-0136", name: "Capital Stack · Concord", status: "Diligence" },
                        { id: "PD-0131", name: "Buy-and-Hold · Vallejo", status: "Decision" },
                      ].map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between rounded-sm border border-copper/10 bg-[hsl(220_30%_8%)] px-4 py-3 text-[12.5px]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] text-copper/80">{d.id}</span>
                            <span className="text-ivory">{d.name}</span>
                          </div>
                          <span className="text-[10px] uppercase tracking-[0.18em] text-bronze">
                            {d.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-ivory/40">
                Illustrative · Production data is private to invited operators
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   OPERATING DISCIPLINE
   ============================================================================ */
function Discipline() {
  const items = [
    {
      icon: <Compass className="h-5 w-5" />,
      title: "Strategy First",
      body: "Every project begins with the strategy and execution path before any commitment is made.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Risk Awareness",
      body: "We underwrite to a clear thesis and protect downside before chasing upside.",
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      title: "Operational Clarity",
      body: "Scope, budgets, timelines, and decisions stay documented and accountable.",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Founder-Led",
      body: "Every relationship runs through real operators who own the outcome.",
    },
  ];
  return (
    <Section variant="ink">
      <div className="container-premium section-y">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <Kicker>Operating Discipline</Kicker>
            <DisplayHeading className="mt-4 text-4xl md:text-5xl">
              Quietly powerful, deliberately disciplined.
            </DisplayHeading>
            <p className="lead mt-6">
              Pegasus is built for operators who care about how things actually
              get done. The work is in the underwriting, the coordination, and
              the follow-through — not the announcements.
            </p>
          </Reveal>
          <div className="lg:col-span-7">
            <div className="grid gap-px overflow-hidden rounded-sm border border-copper/15 bg-copper/15 sm:grid-cols-2">
              {items.map((it, i) => (
                <Reveal key={it.title} delay={i * 80}>
                  <div className="h-full bg-[hsl(220_30%_8%)] p-7">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-copper/35 text-copper">
                      {it.icon}
                    </span>
                    <h4 className="font-display mt-5 text-2xl text-ivory">
                      {it.title}
                    </h4>
                    <p className="mt-3 text-[14px] leading-relaxed text-muted-ivory">
                      {it.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   FOUNDER STATEMENT
   ============================================================================ */
function Founder() {
  return (
    <Section variant="canvas">
      <div className="container-premium section-y">
        <Reveal className="mx-auto max-w-4xl">
          <CopperRule className="mb-10" />
          <Kicker className="block text-center">A Note From The Founder</Kicker>
          <blockquote className="mt-6 text-balance text-center font-display text-[28px] leading-[1.25] text-ivory md:text-[36px]">
            "We started Pegasus to bring real discipline to real estate. Not
            hype, not shortcuts — careful underwriting, careful execution, and
            careful relationships. The systems we're building are the ones we
            wished existed when we started."
          </blockquote>
          <div className="mt-10 flex flex-col items-center gap-1">
            <p className="font-display-uppercase text-[12px] tracking-[0.32em] text-copper">
              Founder · Pegasus Dreamscapes
            </p>
            <p className="text-[12px] uppercase tracking-[0.18em] text-ivory/50">
              East Bay, California
            </p>
          </div>
          <CopperRule className="mt-12" />
        </Reveal>
      </div>
    </Section>
  );
}

/* ============================================================================
   FAQ
   ============================================================================ */
const faqs = [
  {
    q: "What does Pegasus Dreamscapes actually do?",
    a: "Pegasus is a real estate development, investment, and systems company. We source opportunities, structure deals, manage execution on renovation and value-add projects, and build operational systems that keep real estate execution accountable.",
  },
  {
    q: "Are you a wholesaler, a flipper, or an investment fund?",
    a: "None of those labels fully fit. Pegasus runs three connected divisions — Development for execution, Investments for capital and structure, and Systems for the operational tools that support both. We engage on a deal-by-deal and partnership basis.",
  },
  {
    q: "What is MarketFlow?",
    a: "MarketFlow is a private beta product inside Pegasus Systems. It is the deal-flow command center we use internally and with a small group of invited operators. Public access will open in stages as the platform matures.",
  },
  {
    q: "Where do you operate?",
    a: "Our base is the East Bay, California. We focus on opportunities where we can underwrite carefully, execute with discipline, and stay close to the work.",
  },
  {
    q: "How can I work with Pegasus?",
    a: "Submit a property, submit a deal, request access to MarketFlow, or open a partnership conversation. Every channel is reviewed seriously — we'd rather move slowly on the right relationship than quickly on the wrong one.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section variant="ink">
      <div className="container-premium section-y">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <Kicker>Frequently Asked</Kicker>
            <DisplayHeading className="mt-4 text-4xl md:text-5xl">
              The questions worth answering up front.
            </DisplayHeading>
            <p className="lead mt-6">
              If you don't see what you're looking for, write us directly at{" "}
              <a
                href="mailto:hello@pegasusdreamscapes.com"
                className="text-copper hover:text-bronze"
              >
                hello@pegasusdreamscapes.com
              </a>
              . We answer real messages personally.
            </p>
          </Reveal>

          <div className="lg:col-span-8">
            <ul className="divide-y divide-copper/10 border-y border-copper/10">
              {faqs.map((f, idx) => {
                const isOpen = open === idx;
                return (
                  <li key={f.q}>
                    <button
                      onClick={() => setOpen(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left transition hover:text-copper"
                      data-testid={`faq-question-${idx}`}
                    >
                      <span className="font-display text-[20px] text-ivory md:text-[22px]">
                        {f.q}
                      </span>
                      <span
                        className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm border transition ${
                          isOpen
                            ? "border-copper text-copper"
                            : "border-copper/30 text-copper/70"
                        }`}
                      >
                        {isOpen ? "–" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="pb-7 pr-12 text-[15px] leading-relaxed text-muted-ivory">
                        {f.a}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   CONTACT CTA
   ============================================================================ */
function ContactCTA() {
  return (
    <Section variant="canvas">
      <div className="container-premium section-y">
        <Reveal className="relative overflow-hidden rounded-sm border border-copper/30 bg-[hsl(220_35%_5%)] p-10 md:p-16">
          <div className="absolute inset-0 bg-architect opacity-[0.12]" aria-hidden />
          <PegasusWatermark className="pointer-events-none absolute -bottom-12 -right-12 h-72 w-[520px] opacity-30" />
          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Kicker>Open A Conversation</Kicker>
              <DisplayHeading className="mt-4 text-4xl md:text-5xl">
                If your project is real, we'd like to hear about it.
              </DisplayHeading>
              <p className="lead mt-6 max-w-xl">
                Submit a property, send a deal, or simply tell us what you're
                trying to build. Real messages get real responses.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
              <CTAButton href="/sell" testId="cta-foot-submit">
                Submit an Opportunity
              </CTAButton>
              <CTAButton href="/contact" variant="ghost" testId="cta-foot-contact">
                Contact Pegasus
              </CTAButton>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ============================================================================
   PAGE
   ============================================================================ */
export default function Home() {
  useEffect(() => {
    document.title =
      "Pegasus Dreamscapes — Real Estate Development, Investments & Systems";
  }, []);

  return (
    <div className="bg-[hsl(220_35%_5%)]">
      <Hero />
      <Pillars />
      <WhoWeServe />
      <MarketFlowFeature />
      <Discipline />
      <Founder />
      <FAQ />
      <ContactCTA />
    </div>
  );
}
