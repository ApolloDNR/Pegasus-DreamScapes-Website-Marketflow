import { Link } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ArrowRight } from "lucide-react";

// Empire Doctrine v1.0.1 /about — honest founder bio, no team page,
// no franchise, no SaaS positioning, no future-product roadmap.
//
// Hard-locked phrases (public-voice.test.tsx):
//   - "Built on strategy. Governed by virtue. Executed with discipline."
//     (belief line, rendered directly under founder bio)
//   - "Pegasus reviews the path first and Pegasus participation second."
//     (Path-First Review Standard, Doctrine Part I §13)
//   - The six Pegasus Standard commitments (verbatim)

const COMMITMENTS = [
  "Clarity over confusion.",
  "Discipline over hype.",
  "Stewardship over extraction.",
  "Honor over pressure.",
  "Truth over easy promises.",
  "Human review over blind automation.",
];

const ABOUT_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Pegasus DreamScapes Corp.",
      url: "https://pegasusdreamscapes.com",
      founder: { "@type": "Person", name: "Paolo \"Apollo\" Duran" },
      slogan: "Dream it. Build it. Live it.",
    },
    {
      "@type": "Person",
      name: "Paolo \"Apollo\" Duran",
      jobTitle: "Founder & Principal",
      worksFor: { "@type": "Organization", name: "Pegasus DreamScapes Corp." },
      email: "apollo@pegasusdreamscapes.com",
      telephone: "+1-925-744-8525",
    },
  ],
};

export default function AboutPage() {
  useSEO({
    title: "About",
    description:
      "Pegasus DreamScapes is a strategy-first real estate operating company in the East Bay, founded by Paolo \"Apollo\" Duran. Honest review. Disciplined execution.",
  });

  useEffect(() => {
    const id = "ld-about";
    let s = document.head.querySelector<HTMLScriptElement>(`#${id}`);
    if (!s) {
      s = document.createElement("script");
      s.id = id;
      s.type = "application/ld+json";
      document.head.appendChild(s);
    }
    s.text = JSON.stringify(ABOUT_JSONLD);
    return () => {
      document.head.querySelector(`#${id}`)?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-[hsl(var(--charcoal))] text-cream pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
            About Pegasus DreamScapes
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-tight mb-6">
            Why Pegasus exists.
          </h1>
          <p className="font-serif text-xl text-white/85 italic leading-snug max-w-2xl">
            Real estate rewards people who think clearly, work honestly, and refuse to take shortcuts.
            Pegasus is built for that work.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 space-y-12">
          {/* Founder bio */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
              Founder & Principal
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-foreground mb-6">
              Paolo &ldquo;Apollo&rdquo; Duran
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-4">
              <p>
                Apollo is the founder and principal of Pegasus DreamScapes Corp., a strategy-first
                real estate operating company headquartered in Pleasant Hill, California. His work
                is centered on the East Bay (Contra Costa and Alameda County) where the
                inventory is real, the situations are complex, and the right structure makes the
                difference between a clean outcome and a stuck one.
              </p>
              <p>
                He is a licensed California real estate salesperson (DRE #02333658) affiliated
                with Keller Williams East Bay. Each office is independently owned and operated.
                His brokerage practice runs alongside Pegasus and exists to make the listing lane
                available when it is the right answer for the seller.
              </p>
              <p>
                Pegasus is intentionally small and intentionally focused. There is no team to hide
                behind. There is no franchise. There is no SaaS product. The work is property
                strategy and disciplined execution, one property at a time.
              </p>
            </div>
          </div>

          {/* Belief line — hard-locked phrase, rendered directly under bio. */}
          <div className="border-l-4 border-primary pl-6 py-2">
            <p
              className="font-serif text-2xl sm:text-3xl text-foreground italic leading-snug"
              data-testid="text-about-belief"
            >
              Built on strategy. Governed by virtue. Executed with discipline.
            </p>
          </div>

          {/* Path-First Review Standard — hard-locked phrase. */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
              The Path-First Review Standard
            </p>
            <h2 className="font-serif text-3xl font-semibold tracking-[-0.02em] text-foreground mb-5">
              The path comes before the participation.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              When a property reaches Pegasus, the first question is not "can we buy it?" The
              first question is "what is the right path forward for this property and this
              seller?" Sometimes the path is Pegasus. Often the path is somewhere else: a
              listing, a referral, a different operator entirely. We tell the truth either way.
            </p>
            <p
              className="font-serif text-xl text-foreground"
              data-testid="text-about-path-first"
            >
              Pegasus reviews the path first and Pegasus participation second.
            </p>
          </div>

          {/* Pegasus Standard — six commitments, verbatim. */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
              The Pegasus Standard
            </p>
            <h2 className="font-serif text-3xl font-semibold tracking-[-0.02em] text-foreground mb-6">
              Six commitments. No exceptions.
            </h2>
            <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-4">
              {COMMITMENTS.map((line) => (
                <li
                  key={line}
                  className="font-serif text-xl text-foreground border-b border-border pb-3"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* KW / DRE disclosure */}
          <div className="rounded-md border border-border bg-card p-6 text-sm text-muted-foreground leading-relaxed">
            <p className="font-supporting font-semibold uppercase tracking-[0.22em] text-[10px] text-primary mb-3">
              Brokerage Disclosure
            </p>
            <p>
              Real estate brokerage services are provided through Paolo &ldquo;Apollo&rdquo; Duran,
              California DRE #02333658, affiliated with Keller Williams East Bay. Each office is
              independently owned and operated. Equal Housing Opportunity.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[hsl(var(--stone))] border-y border-border">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-foreground mb-5">
            Bring us the situation.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            Apollo reviews every serious submission himself. You will get a real answer.
          </p>
          <Link href="/submit">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm"
              data-testid="button-about-submit"
            >
              Submit a Property
              <ArrowRight className="ml-3 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
