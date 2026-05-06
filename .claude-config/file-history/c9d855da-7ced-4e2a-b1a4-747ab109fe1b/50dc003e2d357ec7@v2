import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import {
  FileSearch,
  ShieldCheck,
  Scale,
  Layers3,
  LineChart,
  Receipt,
  ArrowRight,
} from "lucide-react";

const philosophy = [
  {
    icon: FileSearch,
    title: "Numbers First",
    body: "Every conversation begins with the underwriting. If the numbers don't make sense — or the assumptions can't be defended — the deal doesn't move.",
  },
  {
    icon: ShieldCheck,
    title: "Protect the Downside",
    body: "We size positions, structure protections, and stress-test exit paths before chasing returns. Compounding requires not blowing up.",
  },
  {
    icon: Scale,
    title: "Aligned Structures",
    body: "Capital partners, operators, and Pegasus should win or lose together. We structure terms that hold under pressure, not just on paper.",
  },
  {
    icon: Layers3,
    title: "Long-Term Capital",
    body: "We prefer relationships over single transactions. The right partner across many deals will always outperform the wrong partner on any one.",
  },
];

const structures = [
  {
    title: "Joint Ventures",
    body: "Deal-by-deal partnership conversations where Pegasus may contribute sourcing, underwriting, or execution, and the partner may contribute capital, expertise, or both.",
  },
  {
    title: "Debt / Preferred-Style Structures",
    body: "Potential deal-specific capital structures reviewed privately, subject to diligence, documentation, legal review, suitability, and applicable law.",
  },
  {
    title: "Co-Investment Conversations",
    body: "Selective opportunities to discuss participating alongside Pegasus on specific projects, with underwriting and reporting handled deal by deal.",
  },
  {
    title: "Capital Stack Review",
    body: "For partners structuring their own deals, Pegasus may review, discuss, and where appropriate explore participation — always subject to diligence.",
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
    title: "Investments | Pegasus Dreamscapes",
    description:
      "Pegasus Investments evaluates, structures, and partners on real estate opportunities with a focus on clarity, risk awareness, and long-term value. Nothing on this page is an offer of securities.",
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
                Pegasus Dreamscapes · Investments
              </p>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-3xl">
              Real estate capital, structured with clarity.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              Pegasus Investments evaluates, structures, and partners on real estate
              opportunities with a focus on clarity, risk awareness, and long-term
              value. Every conversation starts with the numbers, the strategy, and
              the execution path.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact?subject=investments">
                <Button size="lg" data-testid="cta-inv-contact">
                  Open a Conversation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/submit-deal">
                <Button variant="outline" size="lg" data-testid="cta-inv-deal">
                  Submit a Deal
                </Button>
              </Link>
            </div>
            <p className="mt-8 text-xs uppercase tracking-wide text-muted-foreground/60 max-w-xl">
              Note · Pegasus Dreamscapes does not offer or sell securities to the public.
              Any investment relationship is private, deal-specific, and subject to formal
              documentation and applicable law.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="text-center mb-14">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                Investment Philosophy
              </p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Disciplined, defensive, deliberately patient.
            </h2>
          </ScrollReveal>

          <StaggerChildren className="grid sm:grid-cols-2 gap-6" staggerDelay={0.1}>
            {philosophy.map((p) => (
              <StaggerItem key={p.title}>
                <Card className="h-full">
                  <CardContent className="p-8">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                      <p.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{p.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{p.body}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Structures */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <ScrollReveal className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                  How We Think About Capital
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                The shapes a Pegasus conversation can take.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Every deal is different. The structures below are the kinds of
                conversations we're open to — clean, well-understood, and always
                subject to diligence and documentation. Nothing here is an offer.
              </p>
            </ScrollReveal>

            <div className="lg:col-span-3">
              <StaggerChildren className="grid sm:grid-cols-2 gap-5" staggerDelay={0.1}>
                {structures.map((s) => (
                  <StaggerItem key={s.title}>
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <LineChart className="h-5 w-5 text-primary mb-3" />
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

      {/* Reporting */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <ScrollReveal>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                  Reporting & Transparency
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                What partners can expect from us.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Real numbers, real timelines, and real conversations when things
                change. Capital partners deserve information they can actually act on.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Standard reporting on every Pegasus-led deal</h3>
                  </div>
                  <ul className="space-y-3">
                    {reporting.map((r) => (
                      <li key={r} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <div className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-secondary text-secondary-foreground">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              Want to explore a partnership?
            </h2>
            <p className="text-secondary-foreground/80 mb-10 leading-relaxed">
              We're selective about who we work with — and we expect partners to be
              selective too. The right place to start is a real conversation about
              strategy, time horizon, and fit.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Link href="/contact?subject=investments">
                <Button size="lg" variant="secondary" className="bg-white text-secondary hover:bg-white/90">
                  Open a Conversation
                </Button>
              </Link>
              <Link href="/submit-deal">
                <Button size="lg" variant="outline" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
                  Submit a Deal
                </Button>
              </Link>
            </div>
            <p className="text-xs uppercase tracking-wide text-secondary-foreground/50">
              Nothing on this page constitutes an offer or solicitation to buy or sell any security.
            </p>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
