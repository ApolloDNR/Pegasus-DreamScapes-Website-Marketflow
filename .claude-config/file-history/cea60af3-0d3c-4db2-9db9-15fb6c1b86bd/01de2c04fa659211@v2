import { Compass, Target, ShieldCheck, Eye, Heart, Award } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import {
  Section,
  Kicker,
  CopperRule,
  DisplayHeading,
  CTAButton,
  Reveal,
} from "@/components/brand/atoms";
import { PegasusWatermark } from "@/components/brand/pegasus-mark";

export default function About() {
  useSEO({
    title: "About",
    description:
      "Pegasus Dreamscapes is a real estate development, investment, and systems company. We exist to bring discipline, vision, and operational clarity to real estate execution.",
  });

  const principles = [
    {
      icon: <Target className="h-5 w-5" />,
      title: "Discipline",
      body: "We move on opportunities the same way every time — strategy, underwriting, execution, follow-through. The work is in the discipline.",
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: "Clarity",
      body: "We tell the truth about deals, numbers, scope, and timelines. If it doesn't make sense, we don't run it.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Integrity",
      body: "Every relationship runs on plain words and kept commitments. Reputation is the only compounding asset.",
    },
    {
      icon: <Compass className="h-5 w-5" />,
      title: "Long View",
      body: "We build for compounding outcomes — not for the next quick win. The right relationships outlast any single deal.",
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: "Craft",
      body: "Real estate is physical. The homes we touch, the systems we build, and the partnerships we keep should be made carefully.",
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "Accountability",
      body: "Decisions get documented, scope gets honored, and outcomes get measured. We own what we ship.",
    },
  ];

  return (
    <div className="bg-background">
      {/* Hero */}
      <Section variant="hero" className="overflow-hidden">
        <div className="absolute inset-0 bg-architect opacity-[0.16]" aria-hidden />
        <PegasusWatermark className="pointer-events-none absolute -right-32 top-16 h-[420px] w-[700px] opacity-25" />
        <div className="container-premium relative pt-36 pb-20 md:pt-44 md:pb-28">
          <Reveal>
            <Kicker>About Pegasus Dreamscapes</Kicker>
          </Reveal>
          <Reveal delay={80}>
            <DisplayHeading
              as="h1"
              className="mt-6 max-w-4xl text-[44px] sm:text-[58px] md:text-[72px] text-ivory"
            >
              A real estate company built for serious operators.
            </DisplayHeading>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead mt-8 max-w-2xl text-muted-ivory">
              Pegasus Dreamscapes is a real estate development, investment, and
              systems company. We exist to bring discipline, vision, and
              operational clarity to real estate execution — for the work we
              run ourselves and for the partners who run alongside us.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Story */}
      <Section variant="canvas">
        <div className="container-premium section-y">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Kicker>Our Story</Kicker>
              <DisplayHeading className="mt-4 text-4xl md:text-5xl">
                Born from real work, not pitch decks.
              </DisplayHeading>
            </Reveal>
            <Reveal delay={100} className="lg:col-span-7">
              <div className="accent-rail space-y-6">
                <p className="lead">
                  Pegasus Dreamscapes started where most real estate companies
                  begin — with one project, a clear vision, and a commitment to
                  build something more disciplined than what we'd seen.
                </p>
                <p className="lead">
                  Over time, we kept noticing the same gaps: opportunities that
                  needed real underwriting, projects that needed serious
                  coordination, partners who needed honest communication, and
                  operational systems that simply didn't exist for the way modern
                  real estate actually works.
                </p>
                <p className="lead">
                  Pegasus is the answer to those gaps. Three connected divisions —
                  Development, Investments, and Systems — operating under one
                  philosophy: do the work carefully, tell the truth about it, and
                  build relationships that outlast the cycle.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Mission / Vision */}
      <Section variant="ink">
        <div className="container-premium section-y">
          <div className="grid gap-px overflow-hidden rounded-sm border border-[hsl(35_18%_84%)] bg-[hsl(35_18%_84%)] lg:grid-cols-2">
            <Reveal>
              <div className="h-full warm-cell p-10">
                <Kicker>Our Mission</Kicker>
                <h3 className="font-display mt-5 text-3xl text-foreground md:text-4xl">
                  Bring discipline, vision, and operational clarity to real estate execution.
                </h3>
                <p className="lead mt-6">
                  Every project we run, every deal we structure, and every
                  system we build should make real estate more disciplined,
                  more accountable, and more aligned with the people doing the
                  work.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="h-full warm-cell-alt p-10">
                <Kicker>Our Vision</Kicker>
                <h3 className="font-display mt-5 text-3xl text-foreground md:text-4xl">
                  Become the operating standard for serious real estate execution.
                </h3>
                <p className="lead mt-6">
                  A real estate platform where developers, investors, partners,
                  and operators can move from idea to outcome with shared
                  discipline, shared visibility, and a shared sense of what
                  good looks like.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Principles */}
      <Section variant="canvas">
        <div className="container-premium section-y">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Kicker>What We Stand For</Kicker>
            <DisplayHeading className="mt-4 text-4xl md:text-5xl">
              Six principles, applied every day.
            </DisplayHeading>
            <CopperRule className="mt-10" />
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-[hsl(35_18%_84%)] bg-[hsl(35_18%_84%)] sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 60}>
                <div className="h-full warm-cell p-8">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-copper/35 text-copper">
                    {p.icon}
                  </span>
                  <h4 className="font-display mt-5 text-2xl text-foreground">{p.title}</h4>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Founder */}
      <Section variant="ink">
        <div className="container-premium section-y">
          <Reveal className="mx-auto max-w-4xl text-center">
            <Kicker>Founder-Led</Kicker>
            <DisplayHeading className="mt-4 text-4xl md:text-5xl">
              Real operators behind every deal.
            </DisplayHeading>
            <p className="lead mt-8">
              Pegasus is founder-led and intentionally small at its core. The
              same people who source opportunities also coordinate execution,
              answer partner messages, and own the outcomes. That is the
              feature, not the limitation.
            </p>
            <CopperRule className="mt-10" />
            <blockquote className="mt-10 text-balance font-display text-[26px] leading-[1.3] text-foreground md:text-[32px]">
              "We started Pegasus to bring real discipline to real estate. The
              systems we're building are the ones we wished existed when we
              started."
            </blockquote>
            <p className="mt-6 font-display-uppercase text-[12px] tracking-[0.32em] text-copper">
              Founder · Pegasus Dreamscapes
            </p>
          </Reveal>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="canvas">
        <div className="container-premium section-y">
          <Reveal className="mx-auto max-w-3xl text-center">
            <DisplayHeading className="text-4xl md:text-5xl">
              Want to work with Pegasus?
            </DisplayHeading>
            <p className="lead mt-6">
              Whether you're a seller, a deal source, an investor, or a
              strategic partner — we'd rather start with a real conversation
              than a generic form.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <CTAButton href="/contact" testId="cta-about-contact">
                Open a Conversation
              </CTAButton>
              <CTAButton href="/sell" variant="ghost" testId="cta-about-submit">
                Submit an Opportunity
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}
