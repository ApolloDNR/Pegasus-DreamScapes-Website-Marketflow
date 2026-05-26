import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
import { ArrowRight, FileText, Search, Compass, ShieldCheck } from "lucide-react";

// Website Structure v1 FINAL §3.3 — Deal Architecture is the public
// "what we do" page. Ten outcome-lane chips render the full taxonomy of
// paths a complex property can take. This v1 page is the lane map; the
// detailed routing logic lives inside Strategy Lab + Submit.

const LANES: { title: string; desc: string }[] = [
  {
    title: "Direct acquisition",
    desc: "Pegasus buys the property outright at a structurally honest number.",
  },
  {
    title: "Creative finance",
    desc: "Seller-carry, subject-to, lease-option, and other non-conforming structures when the situation calls for it.",
  },
  {
    title: "Joint venture / co-GP",
    desc: "We bring capital and operational discipline to an aligned operator's project.",
  },
  {
    title: "Wholesale assignment",
    desc: "When the right buyer is another operator in our network, we route the deal there.",
  },
  {
    title: "Listing through KW",
    desc: "A clean MLS listing through Apollo's Keller Williams East Bay license, with the strategic read built in.",
  },
  {
    title: "Buyer representation",
    desc: "Owner-occupant and investor-side buyer rep, run through the same underwriting lens as every Pegasus acquisition.",
  },
  {
    title: "BRRRR acquisition",
    desc: "Buy, rehab, rent, refinance, repeat. For properties that should be held instead of resold.",
  },
  {
    title: "ADU upside",
    desc: "Detached or attached accessory dwelling units on East Bay residential lots. Design, permit, build.",
  },
  {
    title: "Value-add rehab",
    desc: "Heavy cosmetic and structural rehabs that take a tired property to its highest defensible value.",
  },
  {
    title: "Routed referral",
    desc: "If the right path is outside Pegasus, we route the owner to a vetted operator who can actually help.",
  },
];

export default function DealArchitecture() {
  useSEO({
    title: "Deal Architecture",
    description:
      "Every complex property has a path. Direct acquisition, creative finance, JV, listing, buyer rep, BRRRR, ADU upside, value-add, or a routed referral. Pegasus reviews the situation and matches it to the lane that fits.",
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
              <span className="h-px w-10 bg-primary" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                The Deal Architect · What we actually do
              </p>
            </div>
            <h1
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] leading-[0.98] mb-8"
              data-testid="text-deal-architecture-headline"
            >
              Every property gets a path.{" "}
              <span className="italic bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
                Not every property gets an offer.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-cream/85 leading-relaxed max-w-3xl mb-5">
              Most groups want the property that fits their single playbook. Pegasus is built differently. We review the situation, then match it to the lane that fits, whether that lane is ours or someone else's.
            </p>
            <p
              className="font-serif text-xl sm:text-2xl text-cream italic leading-snug max-w-3xl"
              data-testid="text-deal-architecture-doctrine"
            >
              "Bring us the property. We'll help find the path."
            </p>
          </ScrollReveal>
        </div>
        <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
      </section>

      {/* v1 FINAL §3.3 — How routing works. Three-beat explainer so the
          lane grid below reads as a routing decision, not a menu. */}
      <section
        className="py-20 lg:py-24 bg-[hsl(var(--paper))] border-b border-[hsl(var(--rule))]"
        data-testid="section-deal-architecture-how-it-works"
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="max-w-3xl mb-12">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
              How routing works
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-5 leading-tight">
              Three steps to a real answer.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              No pitch deck. No upsell. A structural read of the situation, then the honest next step.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: FileText,
                step: "01",
                title: "Submit the situation",
                desc: "Address, condition, what you're trying to solve. Two minutes at /submit.",
              },
              {
                icon: Search,
                step: "02",
                title: "Apollo reads it structurally",
                desc: "Comps, condition, capital stack, timeline, occupancy, exposure. The Pegasus lens.",
              },
              {
                icon: Compass,
                step: "03",
                title: "We name the lane",
                desc: "One of the ten lanes below, including a routed referral if Pegasus isn't the right fit.",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="p-6 rounded-lg border border-border/60 bg-background"
                data-testid={`step-routing-${step.step}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-primary" aria-hidden="true" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                    Step {step.step}
                  </p>
                </div>
                <h3 className="font-serif text-lg font-semibold tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="max-w-3xl mb-12">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
              Ten lanes
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-5 leading-tight">
              The outcome map.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Submit any East Bay property and Apollo's review names the lane that fits. None of these are sales pitches. They are routing decisions.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="grid-deal-architecture-lanes">
            {LANES.map((lane, i) => (
              <div
                key={lane.title}
                className="p-6 rounded-lg border border-border/60 bg-card hover:border-primary/40 transition-colors"
                data-testid={`chip-lane-${i}`}
              >
                <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-supporting font-semibold mb-3">
                  Lane {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-serif text-lg font-semibold tracking-tight mb-2">
                  {lane.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {lane.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* v1 FINAL §3.3 — Honest disclosure. Pegasus is not a wholesaler
          mill or a guru shop. This sits between the lane grid and the
          final CTA so the routing promise stays credible. */}
      <section
        className="py-16 lg:py-20 bg-[hsl(var(--paper))] border-t border-[hsl(var(--rule))]"
        data-testid="section-deal-architecture-honest"
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                Honest disclosure
              </p>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-[-0.02em] mb-5 leading-tight">
              Every property gets a path. Not every property gets an offer.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-3">
              Some properties don't fit any Pegasus lane. When that happens we say so directly and route the owner to a vetted operator who can actually help, instead of stringing the conversation along.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              No high-pressure tactics. No bandit-sign marketing. No promises we can't keep. The first review is free, structural, and honest.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[hsl(var(--charcoal))] text-cream border-t border-cream/10">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-5 leading-tight">
              Bring us the property.
            </h2>
            <p className="text-base text-cream/75 leading-relaxed max-w-xl mx-auto mb-9">
              Submit the situation. The first review is free, structural, and honest.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/submit">
                <Button
                  size="lg"
                  className="px-8 py-6 text-sm uppercase tracking-[0.15em] font-semibold bg-[hsl(var(--copper))] hover:bg-[hsl(27_56%_44%)] text-white"
                  data-testid="button-deal-arch-submit"
                >
                  Submit a Property
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/strategy-lab">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-sm uppercase tracking-[0.15em] font-semibold border-cream/25 text-cream hover:bg-cream/10 hover:border-cream/40"
                  data-testid="button-deal-arch-strategy-lab"
                >
                  Open Strategy Lab
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
