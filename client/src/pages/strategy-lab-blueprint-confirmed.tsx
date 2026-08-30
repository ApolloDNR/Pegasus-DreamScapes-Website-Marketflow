import { useEffect } from "react";
import { Link, useSearch } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { CheckCircle2, ArrowRight, FileText } from "lucide-react";

export default function StrategyLabBlueprintConfirmedPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const referenceId = params.get("orderId") ?? params.get("requestId");

  useSEO({
    title: "Blueprint request received. Pegasus DreamScapes.",
    description: "Your Pegasus Deal Blueprint request has been received for review.",
    noIndex: true,
  });

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--charcoal))] text-cream">
      <section className="max-w-[820px] mx-auto px-6 lg:px-10 pt-28 pb-16 lg:pt-32 lg:pb-24">
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-3">
          Pegasus Deal Blueprint
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-4 text-cream">
          Blueprint request received.
        </h1>
        <p className="text-base text-cream/78 leading-relaxed mb-10">
          Thank you. The site recorded your Blueprint request
          {referenceId ? <> (reference <span className="font-mono text-cream" data-testid="text-request-id">#{referenceId}</span>)</> : null}.
          This is not an order confirmation, payment receipt, or offer. Pegasus
          may consider the property for fit and capacity, but no review, response,
          scope, timing, price, or Blueprint engagement is promised.
        </p>

        <div className="border border-cream/15 bg-white/[0.04] p-6 mb-10 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-supporting font-semibold text-primary mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> What happens next
          </div>
          <ul className="text-sm leading-relaxed space-y-2 text-cream/88">
            <li>1. Keep the reference above as proof of receipt.</li>
            <li>2. Pegasus may request more information if it elects to consider the request.</li>
            <li>3. Work exists only after both parties accept written scope, fee, timing, author, and limits.</li>
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
