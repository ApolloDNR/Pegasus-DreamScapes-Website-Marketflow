import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
import { ArrowRight } from "lucide-react";

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
            <p className="text-lg sm:text-xl text-cream/85 leading-relaxed max-w-3xl">
              Most groups want the property that fits their single playbook. Pegasus is built differently. We review the situation, then match it to the lane that fits, whether that lane is ours or someone else's.
            </p>
          </ScrollReveal>
        </div>
        <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
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
