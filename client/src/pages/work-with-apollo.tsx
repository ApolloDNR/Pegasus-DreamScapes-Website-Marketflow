import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
import {
  ArrowRight,
  Home as HomeIcon,
  Key,
  Briefcase,
  ClipboardCheck,
} from "lucide-react";

// Website Structure v1 FINAL §4 — Work With Apollo is the licensed-
// representation surface. Hero introduces Apollo as the licensed agent;
// four sub-sections cover the representation lanes; a locked DRE/KW
// disclosure block sits at the bottom (verbatim, asserted by
// public-voice.test.tsx).

const LANES = [
  {
    icon: HomeIcon,
    title: "List With Apollo",
    desc: "Full-service representation through Keller Williams East Bay. Pricing, prep, marketing, negotiation, and close, driven by the same strategy-first lens applied to every Pegasus property.",
    cta: "Start a Listing Conversation",
    href: "/submit?intent=list",
    testId: "wwa-card-list",
  },
  {
    icon: Key,
    title: "Buy With Apollo",
    desc: "Buyer representation for owner-occupants. Search, tour, write, negotiate, and close with an agent who underwrites every property structurally before submitting an offer.",
    cta: "Start a Buyer Conversation",
    href: "/submit?intent=buy",
    testId: "wwa-card-buy",
  },
  {
    icon: Briefcase,
    title: "Investor Buyer Representation",
    desc: "Operator and investor-side buyer rep for value-add, BRRRR, ADU upside, and small-multifamily acquisitions. Every offer is run through the Pegasus underwriting lens first.",
    cta: "Request Investor Rep",
    href: "/submit?intent=buyer-rep",
    testId: "wwa-card-buyer-rep",
  },
  {
    icon: ClipboardCheck,
    title: "Home Value / Listing Strategy Review",
    desc: "A pre-listing strategy session: pricing read, prep priorities, comp picture, and the right path forward. Honest read, no pressure, no obligation to list.",
    cta: "Request a Strategy Review",
    href: "/submit?intent=listing-strategy",
    testId: "wwa-card-listing-strategy",
  },
];

// Website Structure v1 FINAL §4 — locked DRE/KW disclosure, verbatim.
// Asserted by public-voice.test.tsx. Do not edit copy without a doctrine
// amendment.
const DRE_KW_DISCLOSURE =
  "Licensed real estate services are provided by Paolo \"Apollo\" Duran through Keller Williams Realty East Bay. Pegasus DreamScapes is a separate development, investment, and property strategy company.";

export default function WorkWithApollo() {
  useSEO({
    title: "Work With Apollo",
    description:
      "Licensed real estate representation with Paolo \"Apollo\" Duran through Keller Williams East Bay. List, buy, investor buyer rep, and listing strategy reviews. Every property reviewed structurally first.",
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
                Licensed Representation · DRE #02333658
              </p>
            </div>
            <h1
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] leading-[0.98] mb-8"
              data-testid="text-wwa-headline"
            >
              Real estate representation{" "}
              <span className="italic bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
                with Apollo.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-cream/85 leading-relaxed max-w-3xl mb-4">
              When the right path is a clean listing, a represented purchase, or a strategy review before going to market, Apollo handles it personally as a licensed agent through Keller Williams Realty East Bay.
            </p>
            <p className="text-base text-cream/70 leading-relaxed max-w-3xl">
              The Pegasus structural lens stays on. Every property is read first, then matched to the right representation lane.
            </p>
          </ScrollReveal>
        </div>
        <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
      </section>

      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="max-w-3xl mb-12">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
              Four lanes
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-5 leading-tight">
              Pick the lane that fits the moment.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              All four start the same way: a real conversation, a structural read, and the right path forward.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-6">
            {LANES.map((lane) => (
              <div
                key={lane.testId}
                className="group p-7 rounded-lg border border-border/60 bg-card hover:border-primary/40 transition-colors"
                data-testid={lane.testId}
              >
                <div className="w-11 h-11 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <lane.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-2xl font-semibold tracking-tight mb-3">
                  {lane.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {lane.desc}
                </p>
                <Link href={lane.href}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[11px] uppercase tracking-[0.18em] font-supporting font-semibold"
                    data-testid={`button-${lane.testId}-cta`}
                  >
                    {lane.cta}
                    <ArrowRight className="ml-2 w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="py-16 lg:py-20 bg-[hsl(var(--charcoal))] text-cream border-t border-cream/10"
        data-testid="section-wwa-disclosure"
      >
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-5">
            Licensing disclosure
          </p>
          <p
            className="font-serif text-xl sm:text-2xl text-cream/95 leading-snug mb-6"
            data-testid="text-wwa-dre-kw-disclosure"
          >
            {DRE_KW_DISCLOSURE}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-5 border-t border-cream/10 text-xs uppercase tracking-[0.22em] text-cream/55">
            <span>Paolo "Apollo" Duran</span>
            <span className="hidden sm:inline text-cream/15">·</span>
            <span>DRE #02333658</span>
            <span className="hidden sm:inline text-cream/15">·</span>
            <span>Keller Williams Realty East Bay</span>
            <span className="hidden sm:inline text-cream/15">·</span>
            <span>Each office independently owned and operated</span>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-background border-t border-border/30">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-5 leading-tight">
              Start the conversation.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
              Submit the property or situation. Apollo reviews every serious inbound within 48 hours, Monday through Friday.
            </p>
            <Link href="/submit">
              <Button
                size="lg"
                className="px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold bg-[hsl(var(--copper))] hover:bg-[hsl(27_56%_44%)] text-white"
                data-testid="button-wwa-final-cta"
              >
                Submit a Property
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
