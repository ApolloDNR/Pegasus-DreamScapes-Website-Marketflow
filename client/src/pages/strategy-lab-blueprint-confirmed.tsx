import { useEffect } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { Info, ArrowRight, FileText } from "lucide-react";

export default function StrategyLabBlueprintConfirmedPage() {
  useSEO({
    title: "Blueprint receipt unavailable · Pegasus DreamScapes",
    description: "This retired link cannot verify a Pegasus Deal Blueprint request.",
    noIndex: true,
    noCanonical: true,
  });

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--charcoal))] text-cream">
      <section className="max-w-[820px] mx-auto px-6 lg:px-10 pt-28 pb-16 lg:pt-32 lg:pb-24">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--warm-glow))] font-supporting font-semibold mb-3">
          Pegasus Deal Blueprint
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-4 text-cream">
          Blueprint confirmation is not available at this link.
        </h1>
        <p className="text-base text-cream/78 leading-relaxed mb-10">
          This retired link cannot verify that Pegasus received a request. A reference in the URL
          is not proof of receipt. This page is not an order confirmation, payment receipt, or
          submission receipt.
        </p>

        <div className="border border-cream/15 bg-white/[0.04] p-6 mb-10 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-supporting font-semibold text-[hsl(var(--warm-glow))] mb-2">
            <Info className="w-3.5 h-3.5" aria-hidden="true" /> Use the current request path
          </div>
          <ul className="text-sm leading-relaxed space-y-2 text-cream/88">
            <li>1. Submit property details through the current private opportunity intake.</li>
            <li>2. Treat only a verified receipt shown immediately after a successful submission as confirmation.</li>
            <li>3. A request does not promise review, response, scope, timing, price, or an engagement.</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/strategy-lab"
            className="inline-flex items-center gap-2 border border-cream/18 px-4 py-2 text-sm text-cream hover:border-[hsl(var(--copper))] transition-colors"
            data-testid="link-back-to-lab"
          >
            <ArrowRight className="w-3.5 h-3.5" /> Back to Strategy Lab
          </Link>
          <Link
            href="/bring-an-opportunity?intent=blueprint"
            className="inline-flex items-center gap-2 border border-cream/18 px-4 py-2 text-sm text-cream hover:border-[hsl(var(--copper))] transition-colors"
            data-testid="link-submit-blueprint"
          >
            <FileText className="w-3.5 h-3.5" /> Submit property details
          </Link>
        </div>
      </section>
    </div>
  );
}
