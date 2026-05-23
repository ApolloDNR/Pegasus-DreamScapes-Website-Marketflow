import { useEffect } from "react";
import { Link, useSearch } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { CheckCircle2, ArrowRight, FileText } from "lucide-react";

export default function StrategyLabBlueprintConfirmedPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");

  useSEO({
    title: "Blueprint order confirmed. Pegasus DreamScapes.",
    description: "Your Pegasus Deal Blueprint order is in motion.",
    noIndex: true,
  });

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="max-w-[820px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-3">
          Pegasus Deal Blueprint
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-4">
          Order confirmed. Work begins.
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-10">
          Thank you. Your Blueprint order is in our queue
          {orderId ? <> (reference <span className="font-mono text-foreground" data-testid="text-order-id">#{orderId}</span>)</> : null}.
          You will receive a confirmation email shortly with next steps. If we
          asked you to confirm scope, please reply to that thread so we can
          start on schedule.
        </p>

        <div className="border border-[hsl(var(--rule))] bg-cream/30 dark:bg-white/[0.03] p-6 mb-10">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-supporting font-semibold text-primary mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> What happens next
          </div>
          <ul className="text-sm leading-relaxed space-y-2 text-foreground">
            <li>1. Apollo's team reviews your inputs and confirms the scope.</li>
            <li>2. Underwriting, structure, and the written memo are prepared.</li>
            <li>3. The completed Blueprint is delivered to your inbox.</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/strategy-lab"
            className="inline-flex items-center gap-2 border border-[hsl(var(--rule))] px-4 py-2 text-sm hover:border-[hsl(var(--copper))] transition-colors"
            data-testid="link-back-to-lab"
          >
            <ArrowRight className="w-3.5 h-3.5" /> Back to Strategy Lab
          </Link>
          <Link
            href="/strategy-lab/library"
            className="inline-flex items-center gap-2 border border-[hsl(var(--rule))] px-4 py-2 text-sm hover:border-[hsl(var(--copper))] transition-colors"
            data-testid="link-library"
          >
            <FileText className="w-3.5 h-3.5" /> View saved snapshots
          </Link>
        </div>
      </section>
    </div>
  );
}
