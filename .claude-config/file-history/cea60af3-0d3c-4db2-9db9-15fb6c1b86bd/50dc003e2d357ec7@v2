import {
  LineChart,
  ShieldCheck,
  Scale,
  FileSearch,
  Layers3,
  Receipt,
} from "lucide-react";
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

const philosophy = [
  {
    icon: <FileSearch className="h-5 w-5" />,
    title: "Numbers First",
    body: "Every conversation begins with the underwriting. If the numbers don't make sense — or the assumptions can't be defended — the deal doesn't move.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Protect the Downside",
    body: "We size positions, structure protections, and stress-test exit paths before chasing returns. Compounding requires not blowing up.",
  },
  {
    icon: <Scale className="h-5 w-5" />,
    title: "Aligned Structures",
    body: "Capital partners, operators, and Pegasus should win or lose together. We structure terms that hold under pressure, not just on paper.",
  },
  {
    icon: <Layers3 className="h-5 w-5" />,
    title: "Long-Term Capital",
    body: "We prefer relationships over single transactions. The right partner across many deals will always outperform the wrong partner on any one.",
  },
];

const structures = [
  {
    title: "Joint Ventures",
    body: "Deal-by-deal partnership conversations where Pegasus may contribute sourcing, underwriting, or execution, and the partner may contribute capital, expertise, or both. Specifics are reviewed privately on a per-deal basis.",
  },
  {
    title: "Debt / Preferred-Style Structures",
    body: "Potential deal-specific capital structures may be reviewed privately, subject to diligence, documentation, legal review, suitability, and applicable law.",
  },
  {
    title: "Co-Investment Conversations",
    body: "Selective opportunities to discuss participating alongside Pegasus on specific projects, with underwriting and reporting handled deal by deal.",
  },
  {
    title: "Capital Stack Review",
    body: "For partners structuring their own deals, Pegasus may review, discuss, and where appropriate explore participation — always subject to diligence and documentation.",
  },
];

const reporting = [
  "Underwriting memo before commitment",
  "Defined milestones and decision points",
  "Periodic reporting on progress, scope, and budget",
  "Honest communication when something changes",
  "Final project report at exit",
];

export default function Investments() {
  useSEO({
    title: "Investments",
    description:
      "Pegasus Investments evaluates, structures, and partners on real estate opportunities with a focus on clarity, risk awareness, and long-term value. Nothing on this page is an offer of securities.",
  });

  return (
    <div className="bg-background">
      {/* Hero */}
      <Section variant="hero" className="overflow-hidden">
        <div className="absolute inset-0 bg-architect opacity-[0.18]" aria-hidden />
        <PegasusWatermark className="pointer-events-none absolute -right-24 top-12 h-[440px] w-[720px] opacity-25" />
        <div className="container-premium relative pt-36 pb-20 md:pt-44 md:pb-28">
          <Reveal>
            <Kicker>Pegasus Dreamscapes · Investments</Kicker>
          </Reveal>
          <Reveal delay={80}>
            <DisplayHeading
              as="h1"
              className="mt-6 max-w-4xl text-[44px] sm:text-[58px] md:text-[72px] text-ivory"
            >
              Real estate capital, structured with clarity.
            </DisplayHeading>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead mt-8 max-w-2xl text-muted-ivory">
              Pegasus Investments evaluates, structures, and partners on real
              estate opportunities with a focus on clarity, risk awareness, and
              long-term value. Every conversation starts with the numbers, the
              strategy, and the execution path.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-10 flex flex-wrap gap-4">
              <CTAButton href="/contact?subject=investments" testId="cta-inv-contact">
                Open a Conversation
              </CTAButton>
              <CTAButton href="/submit-deal" variant="ghost" testId="cta-inv-deal">
                Submit a Deal
              </CTAButton>
            </div>
          </Reveal>

          <Reveal delay={280}>
            <p className="mt-12 max-w-2xl text-[12px] uppercase tracking-[0.22em] text-ivory/50">
              Note · Pegasus Dreamscapes does not offer or sell securities to
              the public. Any investment relationship is private, deal-specific,
              and subject to formal documentation and applicable law.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Philosophy */}
      <Section variant="canvas">
        <div className="container-premium section-y">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Kicker>Investment Philosophy</Kicker>
            <DisplayHeading className="mt-4 text-4xl md:text-5xl">
              Disciplined, defensive, deliberately patient.
            </DisplayHeading>
            <CopperRule className="mt-10" />
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-[hsl(35_18%_84%)] bg-[hsl(35_18%_84%)] sm:grid-cols-2">
            {philosophy.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <div className="h-full warm-cell p-9">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-copper/35 text-copper">
                    {p.icon}
                  </span>
                  <h4 className="font-display mt-5 text-2xl text-foreground">{p.title}</h4>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Structures */}
      <Section variant="ink">
        <div className="container-premium section-y">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Kicker>How We Think About Capital</Kicker>
              <DisplayHeading className="mt-4 text-4xl md:text-5xl">
                The shapes a Pegasus conversation can take.
              </DisplayHeading>
              <p className="lead mt-6">
                Every deal is different. The structures below are the kinds of
                conversations we're open to — clean, well-understood, and
                always subject to diligence and documentation. Nothing here is
                an offer.
              </p>
            </Reveal>
            <div className="lg:col-span-7">
              <div className="grid gap-px overflow-hidden rounded-sm border border-[hsl(35_18%_84%)] bg-[hsl(35_18%_84%)] sm:grid-cols-2">
                {structures.map((s, i) => (
                  <Reveal key={s.title} delay={i * 60}>
                    <div className="h-full warm-cell p-7">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-copper/40 text-copper">
                        <LineChart className="h-3.5 w-3.5" />
                      </span>
                      <h4 className="font-display mt-4 text-xl text-foreground">{s.title}</h4>
                      <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
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

      {/* Reporting */}
      <Section variant="canvas">
        <div className="container-premium section-y">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 lg:items-center">
            <Reveal className="lg:col-span-6">
              <Kicker>Reporting & Transparency</Kicker>
              <DisplayHeading className="mt-4 text-4xl md:text-5xl">
                What partners can expect from us.
              </DisplayHeading>
              <p className="lead mt-6">
                Real numbers, real timelines, and real conversations when
                things change. Capital partners deserve information they can
                actually act on.
              </p>
            </Reveal>
            <Reveal delay={120} className="lg:col-span-6">
              <div className="rounded-sm border border-[hsl(35_18%_82%)] bg-white p-9 shadow-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-copper/40 text-copper">
                  <Receipt className="h-5 w-5" />
                </span>
                <h4 className="font-display mt-5 text-2xl text-foreground">
                  Standard reporting on every Pegasus-led deal
                </h4>
                <ul className="mt-6 space-y-3">
                  {reporting.map((r) => (
                    <li key={r} className="flex gap-3 text-[15px] text-foreground/80">
                      <span className="mt-2 inline-block h-1 w-1 flex-shrink-0 rotate-45 bg-copper" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="ink">
        <div className="container-premium section-y">
          <Reveal className="mx-auto max-w-3xl text-center">
            <DisplayHeading className="text-4xl md:text-5xl">
              Want to explore a partnership?
            </DisplayHeading>
            <p className="lead mt-6">
              We're selective about who we work with — and we expect partners
              to be selective too. The right place to start is a real
              conversation about strategy, time horizon, and fit.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <CTAButton href="/contact?subject=investments">
                Open a Conversation
              </CTAButton>
              <CTAButton href="/submit-deal" variant="ghost">
                Submit a Deal
              </CTAButton>
            </div>
            <p className="mt-10 text-[11px] uppercase tracking-[0.22em] text-muted-foreground/60">
              Nothing on this page constitutes an offer or solicitation to buy or sell any security.
            </p>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}
