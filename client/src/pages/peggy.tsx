import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ArrowRight, Sparkles, Check, X, Globe, Phone, Server, Network as NetworkIcon } from "lucide-react";

// Empire Doctrine Amendment 2 §D — public Peggy surface. The positioning
// line below is verbatim and asserted by public-voice.test.tsx. The
// "what Peggy does NOT do" list is the premium signal — publishing the
// guardrails is itself the credibility move.

// Empire Doctrine Amendment 2 §D — locked positioning line, verbatim.
// Em-dash is non-spaced per public-voice rules.
const PEGGY_POSITIONING =
  "Peggy—Pegasus' AI strategy assistant. One intelligence, multiple surfaces. Plugs into website, phone, HQ, and the ecosystem apps.";

const DOES = [
  "Listens to a property situation and asks one qualifying question at a time.",
  "Routes the conversation to the right path: submit, strategy lab, capital, or a direct call with Apollo.",
  "Captures structured intake so nothing gets lost between channels.",
  "Hands every conversation to Apollo as a daily inbound report.",
  "Discloses she is an AI assistant on the first turn, every time.",
];

const DOES_NOT = [
  "Never quotes a price or makes an offer.",
  "Never makes a binding commitment on behalf of Pegasus.",
  "Never gives legal, tax, or investment advice.",
  "Never shares other clients' data.",
  "Never claims outcomes or guarantees.",
  "Never bypasses a written Pegasus read for an actual offer.",
];

export default function Peggy() {
  useSEO({
    title: "Peggy — AI Strategy Assistant",
    description:
      "Peggy is Pegasus DreamScapes' AI strategy assistant. One intelligence, multiple surfaces. Listens, qualifies, routes, and hands every conversation to Apollo.",
    image: "/og/default.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-navy text-cream overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[28rem] h-[28rem] bg-primary/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                The AI strategy assistant
              </p>
              <StatusBadge kind="private-training" />
            </div>
            <h1
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] leading-[0.98] mb-8"
              data-testid="text-peggy-headline"
            >
              Meet{" "}
              <span className="italic bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
                Peggy.
              </span>
            </h1>
            <p
              className="font-serif text-lg sm:text-xl text-cream/90 italic leading-relaxed max-w-3xl mb-6"
              data-testid="text-peggy-positioning"
            >
              {PEGGY_POSITIONING}
            </p>
            <p className="text-base sm:text-lg text-cream/75 leading-relaxed max-w-2xl">
              Warm, calm, precise. Never bubbly. Never robotic. She qualifies the situation, routes it to the right path, and hands the conversation to Apollo. She is an assistant. Not a salesperson. Not a decision-maker.
            </p>
          </ScrollReveal>
        </div>
        <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
      </section>

      {/* Website Structure v1 FINAL §6 — Peggy six-section composition.
          §2 · Where Peggy works. Plugs into website, phone, HQ, and the
          ecosystem apps. Each surface carries its own status badge. */}
      <section
        className="py-20 lg:py-28 bg-background border-t border-border/30"
        data-testid="section-peggy-where"
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="max-w-3xl mb-12">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
              Where Peggy works
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-5 leading-tight">
              One intelligence, multiple surfaces.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              The same Peggy shows up across every Pegasus surface. Same voice. Same guardrails. Same hand-off to Apollo.
            </p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Globe, label: "Website", desc: "Public dock on every page. Leave a note while Peggy is in training.", status: "private-training" as const },
              { icon: Phone, label: "Phone · 925-744-8525", desc: "Inbound voice with consent, gated by four launch rules.", status: "in-development" as const },
              { icon: Server, label: "HQ", desc: "Internal operator console. Routes structured intake to the right reviewer.", status: "in-development" as const },
              { icon: NetworkIcon, label: "Ecosystem apps", desc: "BuildForge, CapStack, MarketFlow. Same Peggy, scoped to each surface.", status: "in-development" as const },
            ].map((s) => (
              <div
                key={s.label}
                className="p-5 rounded-lg border border-border/50 bg-card flex flex-col gap-3"
                data-testid={`peggy-surface-${s.label.toLowerCase().split(" ")[0].replace(/[^a-z]/g, "")}`}
              >
                <s.icon className="w-5 h-5 text-[hsl(var(--copper))]" aria-hidden="true" />
                <p className="font-serif text-base font-semibold">{s.label}</p>
                <p className="text-sm text-muted-foreground leading-snug flex-1">{s.desc}</p>
                <StatusBadge kind={s.status} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-muted/15 border-t border-border/30" data-testid="section-peggy-does">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-10">
            <ScrollReveal>
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
                What Peggy does
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-7 leading-tight">
                Listens. Qualifies. Routes.
              </h2>
              <ul className="space-y-4" data-testid="list-peggy-does">
                {DOES.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base text-foreground/85 leading-relaxed">
                    <Check className="mt-1 w-4 h-4 flex-shrink-0 text-[hsl(var(--copper))]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
                What Peggy does NOT do
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-7 leading-tight">
                The guardrails are the premium signal.
              </h2>
              <ul className="space-y-4 border-l-2 border-[hsl(var(--copper)/0.4)] pl-6" data-testid="list-peggy-does-not">
                {DOES_NOT.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base text-foreground/85 leading-relaxed">
                    <X className="mt-1 w-4 h-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Website Structure v1 FINAL §6 / Peggy §5 — Sample transcript.
          Shows the actual conversational arc: ID, qualify, route, hand-off.
          Italics + non-spaced punctuation only to satisfy the voice rule. */}
      <section
        className="py-20 lg:py-28 bg-background border-t border-border/30"
        data-testid="section-peggy-transcript"
      >
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="mb-10">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
              Sample transcript
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-5 leading-tight">
              What a Peggy conversation actually sounds like.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Illustrative only. Real conversations vary. Peggy discloses she is an AI assistant on the first turn, every time.
            </p>
          </ScrollReveal>
          <div className="space-y-3 font-serif text-base leading-relaxed" data-testid="peggy-transcript-body">
            <div className="rounded-lg bg-card border border-border/50 px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold mb-1.5">Peggy</p>
              <p className="text-foreground/90 italic">"Hi, I'm Peggy with Pegasus DreamScapes. I'm Pegasus' AI strategy assistant. What's the property you're thinking about?"</p>
            </div>
            <div className="rounded-lg bg-muted/30 border border-border/30 px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-supporting font-semibold mb-1.5">Owner</p>
              <p className="text-foreground/85">"Single-family in Concord. Inherited it last year. Deferred maintenance."</p>
            </div>
            <div className="rounded-lg bg-card border border-border/50 px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold mb-1.5">Peggy</p>
              <p className="text-foreground/90 italic">"Got it. Probate situation or already through? And what's the deferred work, cosmetic, systems, or structural?"</p>
            </div>
            <div className="rounded-lg bg-muted/30 border border-border/30 px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-supporting font-semibold mb-1.5">Owner</p>
              <p className="text-foreground/85">"Probate's cleared. Roof, panel, and the kitchen is original."</p>
            </div>
            <div className="rounded-lg bg-card border border-border/50 px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold mb-1.5">Peggy</p>
              <p className="text-foreground/90 italic">"That's a Property Read fit. I'll route it to Apollo with what we've got and book a 20-minute call. I won't quote a number; that takes a written Pegasus read. Cool?"</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-muted/20 border-t border-border/30" data-testid="section-peggy-phone">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                On the phone · 925-744-8525
              </p>
              <StatusBadge kind="in-development" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight mb-5 leading-tight">
              Voice launch is gated, by design.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-3">
              Peggy is launching on Pegasus' main line. Four hard gates apply before any voice cutover: California two-party recording consent (Penal Code §632), Fair Housing refusals on any protected-class steering, DRE licensing discipline (Peggy never advises on price, terms, value, or fitness), and Civil Code §1695 disclosure if a caller indicates the property is in foreclosure and they are owner-occupant.
            </p>
            <p className="text-sm text-muted-foreground/85 italic mb-6">
              These are not features. They are the floor.
            </p>
            <div className="border-l-2 border-[hsl(var(--copper)/0.4)] pl-5 py-1">
              <p
                className="text-[11px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold mb-2"
                data-testid="text-peggy-phone-consent-kicker"
              >
                What you hear first
              </p>
              <p
                className="text-base text-foreground/90 leading-relaxed italic"
                data-testid="text-peggy-phone-consent"
              >
                "Hi, this is Peggy with Pegasus DreamScapes. This call is recorded for quality and training. Please say 'stop recording' if you'd prefer I don't, and the call continues unrecorded."
              </p>
              <p className="text-xs text-muted-foreground/75 mt-3">
                Recordings are encrypted, retained 90 days, and deleted on request. See the Privacy Policy for the full retention and deletion practice.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[hsl(var(--charcoal))] text-cream" data-testid="section-peggy-cta">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-6 leading-tight">
              Bring Peggy a situation.
            </h2>
            <p className="text-base text-cream/80 leading-relaxed max-w-xl mx-auto mb-9">
              Open the dock in the corner of any page, or submit a property for a full strategy review.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/submit">
                <Button
                  size="lg"
                  className="px-8 py-6 text-sm uppercase tracking-[0.15em] font-semibold bg-[hsl(var(--copper))] hover:bg-[hsl(27_56%_44%)] text-white"
                  data-testid="button-peggy-submit"
                >
                  Submit a Property
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/connect">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-sm uppercase tracking-[0.15em] font-semibold border-cream/25 text-cream hover:bg-cream/10 hover:border-cream/40"
                  data-testid="button-peggy-connect"
                >
                  Reach Apollo
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
