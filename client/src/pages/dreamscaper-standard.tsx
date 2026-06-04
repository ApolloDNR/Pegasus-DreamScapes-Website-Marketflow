import { Link } from "wouter";
import { ArrowRight, Gauge, Lightbulb, Scale, ShieldCheck, Target, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ComplianceNote, ProcessRail, SectionIntro, SplitHero } from "@/components/site-visuals";

const standards = [
  {
    title: "Discipline",
    body: "No path is recommended before the facts, risks, and execution constraints are read.",
    icon: Target,
  },
  {
    title: "Transparency",
    body: "If Pegasus is not the right lane, the answer should still leave the person clearer than before.",
    icon: ShieldCheck,
  },
  {
    title: "Innovation",
    body: "Creative structure is useful only when it solves a real constraint, not when it decorates the pitch.",
    icon: Lightbulb,
  },
  {
    title: "Integrity",
    body: "No forced offer, no urgency theater, and no language that blurs legal, capital, or agency boundaries.",
    icon: Scale,
  },
  {
    title: "Excellence",
    body: "The review, documentation, design, communication, and follow-through should hold up under professional scrutiny.",
    icon: Gauge,
  },
  {
    title: "Efficiency",
    body: "The correct lane should become clear faster because the system is organized, not because the judgment is rushed.",
    icon: TimerReset,
  },
];

export default function DreamscaperStandardPage() {
  useSEO({
    title: "Dreamscaper Standard",
    description:
      "The six operating commitments behind every Pegasus Dreamscapes review and routed outcome.",
    image: "/og/default.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <SplitHero
        eyebrow="The Dreamscaper Standard"
        title={
          <>
            The standard behind
            <span className="block pt-2 italic text-[#D4B483]">every serious review.</span>
          </>
        }
        subtitle="Pegasus can move quickly only if the doctrine stays clear."
        body="These are not decorative values. They are operating requirements for how the company reviews property, speaks to people, and chooses lanes."
        primaryCta={{ label: "Submit a Property", href: "/submit" }}
        secondaryCta={{ label: "Deal Architecture", href: "/deal-architecture" }}
        visual="standard"
        visualTitle="Six-part standard"
        visualCaption="The public values match the locked Pegasus doctrine, then show up in how each page routes, explains, and protects the work."
        labels={[
          { label: "Voice", value: "Direct" },
          { label: "Posture", value: "Mature" },
          { label: "Control", value: "Doctrine" },
        ]}
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionIntro
            eyebrow="Six commitments"
            title="Direct enough to guide the work. Strong enough to say no."
            body="The standard matters most when the opportunity is attractive, the pressure is high, or the easy answer would be too vague."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {standards.map((standard, index) => {
              const Icon = standard.icon;
              return (
                <article key={standard.title} className="rounded-md border border-border bg-card p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="font-serif text-2xl text-primary/45">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h2 className="font-serif text-2xl font-semibold leading-tight">{standard.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{standard.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-card py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-4">
            <SectionIntro
              eyebrow="Operating use"
              title="A standard is only useful if it changes decisions."
              body="Pegasus should be judged by whether the doctrine shows up in the route, not only in the words."
            />
          </div>
          <div className="lg:col-span-8">
            <ProcessRail
              items={[
                {
                  label: "Before",
                  title: "Facts before pressure.",
                  body: "The review starts by making the property and situation legible.",
                  icon: Target,
                },
                {
                  label: "During",
                  title: "Boundaries before persuasion.",
                  body: "No page should create confusion around offers, securities, agency, valuation, or guarantees.",
                  icon: ShieldCheck,
                },
                {
                  label: "After",
                  title: "A routed answer before expansion.",
                  body: "The outcome should become clearer: Pegasus lane, KW lane, MarketFlow, referral, or pass.",
                  icon: ArrowRight,
                },
              ]}
            />
            <div className="mt-6">
              <ComplianceNote>
                The Dreamscaper Standard is an operating statement, not a promise of a transaction, offer, valuation, investment outcome, or specific result.
              </ComplianceNote>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-12">
          <h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Bring us the property. We will help find the path.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            The standard is simple: no empty hype, no blind automation, and no outcome promised before the facts are reviewed.
          </p>
          <Link href="/submit">
            <Button className="mt-9 h-12 rounded-sm bg-primary px-8 text-xs font-semibold uppercase text-white hover:bg-primary/90">
              Submit a Property
              <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
