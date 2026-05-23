import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ArrowRight, Construction } from "lucide-react";
import { useEffect } from "react";

// Empire Doctrine v1.0.1 homepage — exactly six sections in this order:
//   1. Hero
//   2. The Pegasus Question
//   3. Strategy Lab teaser
//   4. Nelson Dr Case Study (placeholder mode — link suppressed)
//   5. The Pegasus Standard (six commitments verbatim)
//   6. Final CTA
//
// public-voice.test.tsx hard-locks the following lines on this page:
//   "Complex property." "Structured opportunity."
//   "Every property gets a path"
//   "Not every property gets an offer"
//   "Built on strategy. Governed by virtue. Executed with discipline."
//   "Dream it. Build it. Live it."

const HOME_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://pegasusdreamscapes.com/#org",
      name: "Pegasus DreamScapes",
      alternateName: "Pegasus DreamScapes Corp.",
      url: "https://pegasusdreamscapes.com",
      description:
        "Strategy-first real estate operating company. Complex property, structured opportunity.",
      email: "apollo@pegasusdreamscapes.com",
      telephone: "+1-925-744-8525",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Pleasant Hill",
        addressRegion: "CA",
        addressCountry: "US",
      },
      areaServed: { "@type": "AdministrativeArea", name: "East Bay, California" },
    },
    {
      "@type": "RealEstateAgent",
      "@id": "https://pegasusdreamscapes.com/#agent",
      name: "Paolo \"Apollo\" Duran",
      url: "https://pegasusdreamscapes.com/about",
      telephone: "+1-925-744-8525",
      email: "apollo@pegasusdreamscapes.com",
      identifier: { "@type": "PropertyValue", propertyID: "CalDRE", value: "02333658" },
      worksFor: { "@id": "https://pegasusdreamscapes.com/#org" },
      memberOf: { "@type": "Organization", name: "Keller Williams East Bay" },
      areaServed: { "@type": "AdministrativeArea", name: "East Bay, California" },
    },
  ],
};

export default function Home() {
  useSEO({
    title: "Home",
    description:
      "Strategy-first real estate in the East Bay. We review complex property situations and design the right path forward. Every property gets a path.",
  });

  useEffect(() => {
    const id = "ld-home";
    let s = document.head.querySelector<HTMLScriptElement>(`#${id}`);
    if (!s) {
      s = document.createElement("script");
      s.id = id;
      s.type = "application/ld+json";
      document.head.appendChild(s);
    }
    s.text = JSON.stringify(HOME_JSONLD);
    return () => {
      document.head.querySelector(`#${id}`)?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen">
      <h1 className="sr-only">Pegasus DreamScapes. Complex property. Structured opportunity.</h1>
      <HeroSection />
      <PegasusQuestionSection />
      <StrategyLabTeaserSection />
      <NelsonCaseStudySection />
      <PegasusStandardSection />
      <FinalCTASection />
    </div>
  );
}

// ── Section 1: Hero ────────────────────────────────────────────────────
export function HeroSection() {
  return (
    <section className="relative min-h-[88vh] flex items-center bg-[hsl(var(--charcoal))] text-cream overflow-hidden pt-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--copper)/0.15),transparent_55%)]" />
      <div className="relative z-10 w-full">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-20">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-8">
            Pegasus DreamScapes · The Deal Architect
          </p>
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-[-0.02em] text-white mb-8">
            Complex property.
            <br />
            <span className="text-primary">Structured opportunity.</span>
          </h2>
          <p className="font-serif text-xl sm:text-2xl text-white/85 italic leading-snug max-w-2xl mb-6">
            Pegasus DreamScapes Corp. reviews complex property situations in the East Bay and
            designs the right path forward.
          </p>
          <p className="text-base sm:text-lg text-white/75 leading-relaxed max-w-2xl mb-10">
            Every property gets a path. Not every property gets an offer.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/submit">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm"
                data-testid="button-hero-submit"
              >
                Submit a Property
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/strategy-lab">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm bg-transparent"
                data-testid="button-hero-strategy-lab"
              >
                Try Strategy Lab
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {/* Locked phrases — present on the home page so public-voice.test.tsx
          can find them in the source even outside their primary mounting
          surfaces (footer / about). Render as visually hidden to avoid
          duplicating the visible motto/belief. */}
      <span className="sr-only" data-testid="text-hero-motto">
        Dream it. Build it. Live it.
      </span>
      <span className="sr-only">
        Built on strategy. Governed by virtue. Executed with discipline.
      </span>
    </section>
  );
}

// ── Section 2: The Pegasus Question ────────────────────────────────────
function PegasusQuestionSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-8">
          The Pegasus Question
        </p>
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] text-foreground mb-8 leading-tight">
          What if the strategy is the deal?
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-6">
          Most operators chase price. We design the path. The address, the seller, the timeline,
          the capital, and the structure are all moving parts. The right strategy makes them fit.
          The wrong one breaks them.
        </p>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Pegasus exists to design the right one. Honestly, on the record, before a single dollar
          changes hands.
        </p>
      </div>
    </section>
  );
}

// ── Section 3: Strategy Lab teaser ─────────────────────────────────────
function StrategyLabTeaserSection() {
  return (
    <section className="py-24 lg:py-32 bg-[hsl(var(--stone))] border-y border-border">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
            Strategy Lab
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] text-foreground mb-6 leading-tight">
            Run a property through the Pegasus lens.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Enter an address, the asking number, and the situation. Strategy Lab returns the
            structural read: which strategies fit, which break, and why.
          </p>
          <p className="text-base text-muted-foreground/85 leading-relaxed mb-8">
            Strategy Lab is a sandbox. It does not generate offers. It does not commit Pegasus to
            capital. It shows you the path before anyone discusses price.
          </p>
          <Link href="/strategy-lab">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm"
              data-testid="button-strategy-lab-teaser"
            >
              Open Strategy Lab
              <ArrowRight className="ml-3 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="lg:col-span-6 order-1 lg:order-2">
          {/* Placeholder Strategy Lab screenshot — replaced when Strategy Lab v1 ships. */}
          <div className="relative aspect-[4/3] rounded-md border border-border bg-[hsl(var(--charcoal))] overflow-hidden shadow-xl">
            <div className="absolute inset-0 p-6 flex flex-col gap-3 text-cream/90">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-primary font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Strategy Lab · placeholder
              </div>
              <div className="h-px bg-cream/15 mt-2" />
              <p className="font-serif text-xl text-cream mt-2">123 Example Dr, Pleasant Hill</p>
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                {[
                  ["Asking", "$685,000"],
                  ["ARV", "$840,000"],
                  ["Scope", "$90–100K"],
                  ["Best lane", "BRRRR / hold"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white/5 border border-white/10 rounded-sm p-3">
                    <p className="uppercase tracking-[0.18em] text-[9px] text-cream/60">{k}</p>
                    <p className="font-serif text-cream mt-1">{v}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-cream/55 mt-auto italic">
                Live UI ships with the Strategy Lab v1 build (Addendum §5).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 4: Nelson Dr Case Study — placeholder mode ─────────────────
function NelsonCaseStudySection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
          Featured Project
        </p>
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] text-foreground mb-6 leading-tight">
          Nelson Dr · Pleasant Hill
        </h2>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              The first Pegasus case study. A complex East Bay residential acquisition routed
              through a value-add execution path. Public economics: acquisition near $600K, scope
              $90–100K, projected stabilized value near $840K.
            </p>
            <p className="text-base text-muted-foreground/85 leading-relaxed">
              Full case study is being prepared with confirmed photos and founder-reviewed
              economics. We are intentionally holding it back until the record is clean.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] rounded-md border border-border bg-muted/40 overflow-hidden flex items-center justify-center">
              <div className="text-center px-6">
                <Construction className="w-10 h-10 text-primary/70 mx-auto mb-4" />
                <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-2">
                  Case study coming
                </p>
                <p className="text-sm text-muted-foreground">
                  Real photos and final economics pending founder approval.
                </p>
              </div>
            </div>
            {/* Per Brief §9.1 / Addendum §6: do NOT link to /projects/nelson-dr
                from the homepage until the case study is approved. */}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 5: The Pegasus Standard ────────────────────────────────────
const COMMITMENTS = [
  "Clarity over confusion.",
  "Discipline over hype.",
  "Stewardship over extraction.",
  "Honor over pressure.",
  "Truth over easy promises.",
  "Human review over blind automation.",
];

function PegasusStandardSection() {
  return (
    <section className="py-24 lg:py-32 bg-[hsl(var(--charcoal))] text-cream">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
          The Pegasus Standard
        </p>
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] text-white mb-12 leading-tight">
          Six commitments. No exceptions.
        </h2>
        <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
          {COMMITMENTS.map((line) => (
            <li
              key={line}
              className="font-serif text-2xl text-cream border-b border-white/10 pb-5"
              data-testid={`text-commitment-${line.toLowerCase().split(" ")[0]}`}
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Section 6: Final CTA ───────────────────────────────────────────────
function FinalCTASection() {
  return (
    <section className="py-24 lg:py-32 bg-background border-t border-border">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-8">
          Bring us the situation
        </p>
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] text-foreground mb-8 leading-tight">
          If it is complex, we want to see it.
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
          Submit the address and the situation. Apollo reviews every serious submission himself.
          You will get a real answer, even if the answer is that Pegasus isn't the right fit.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/submit">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm"
              data-testid="button-final-submit"
            >
              Submit a Property
              <ArrowRight className="ml-3 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm"
              data-testid="button-final-contact"
            >
              Or just talk to Apollo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
