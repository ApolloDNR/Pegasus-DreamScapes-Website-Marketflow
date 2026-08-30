import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
import { Button } from "@/components/ui/button";
import { BuyboxesSection } from "@/components/buyboxes-section";
import { ArrowRight, Lock } from "lucide-react";
import { seoFor } from "@shared/seo-routes";

const BUYBOX_SEO = seoFor("/marketflow/buyboxes");

// Website Structure v1 FINAL §7 — dedicated public /marketflow/buyboxes
// surface. Pulled off the MarketFlow landing so the gated landing stays
// focused on access requests. Carries the controlled-pilot status plus
// the BuyboxesSection (with C.8.7 disclosure already inside it).
export default function MarketflowBuyboxes() {
  useSEO({
    title: "Pegasus Buyboxes",
    description: BUYBOX_SEO.description,
    image: "/og/marketflow.png",
    noIndex: true,
  });

  return (
    <div className="min-h-screen bg-background">
      <section
        className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[hsl(var(--navy))] text-cream overflow-hidden"
        data-testid="section-buyboxes-hero"
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[28rem] h-[28rem] bg-primary/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10">
                <Lock className="w-3 h-3 text-primary" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold">
                  Controlled pilot · reviewed access
                </span>
              </span>
            </div>
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-[1.0] mb-6"
              data-testid="text-buyboxes-headline"
            >
              Buyboxes are not publicly open.
            </h1>
            <p className="text-base sm:text-lg text-cream/85 leading-relaxed max-w-3xl mb-8">
              No public buybox profiles, live inventory, automated matching, or notification program is active today. You may register interest in the controlled MarketFlow pilot; approval and future contact are not promised.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/marketflow/access">
                <Button
                  size="lg"
                  className="text-sm uppercase tracking-[0.15em] px-7 py-6 bg-[hsl(var(--copper))] hover:bg-[hsl(27_56%_66%)] text-[hsl(var(--cream-foreground))] font-semibold"
                  data-testid="button-buyboxes-access"
                >
                  Request pilot access <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/marketflow">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-sm uppercase tracking-[0.15em] px-7 py-6 font-semibold border-cream/25 text-cream hover:bg-cream/10"
                  data-testid="button-buyboxes-back-marketflow"
                >
                  Back to MarketFlow
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
        <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
      </section>

      <BuyboxesSection />
    </div>
  );
}
