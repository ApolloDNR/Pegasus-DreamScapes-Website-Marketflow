import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ArrowRight, BookOpen } from "lucide-react";
import type { Article } from "@shared/schema";
import { trackEvent } from "@/lib/analytics";
import { SkeletonLine } from "@/components/skeleton-primitives";

// Empire Doctrine v1.0.1 — /library is the canonical Strategy Library
// surface. It is intentionally a thin, doctrine-clean index of the
// existing article corpus; the legacy /resources page is wrapped only
// for its article shell (now mounted at /library/:slug via App.tsx).
// We do not re-export Resources here because that page surfaces CTAs
// to retired routes (/sell, /invest, /calculators) which violate v1.

export default function LibraryPage() {
  useSEO({
    title: "Strategy Library",
    description:
      "The Pegasus Dreamscapes Strategy Library: structured reads on real estate strategy, capital, and execution. No gurus. No hype.",
    image: "/og/default.png",
  });

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // Brief §11 analytics — fire `library_scroll_50` once when the visitor
  // crosses 50% scroll depth on the library index (consent-gated).
  const firedScroll50 = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      if (firedScroll50.current) return;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = window.scrollY / max;
      if (pct >= 0.5) {
        firedScroll50.current = true;
        trackEvent("library_scroll_50");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const published = articles.filter((a) => a.published);

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-[hsl(var(--charcoal))] text-cream pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
            Strategy Library
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-normal text-white leading-tight mb-6">
            Read first. Decide second.
          </h1>
          <p className="font-serif text-xl text-white/85 italic leading-snug max-w-2xl">
            Structured reads on real estate strategy, capital, and execution.
            Built for operators, owners, and capital partners who think before they move.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          {isLoading ? (
            <ul
              className="divide-y divide-border"
              role="status"
              aria-label="Loading library"
              data-testid="skeleton-library-list"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="py-6">
                  <div className="flex items-start gap-5">
                    <div
                      aria-hidden="true"
                      className="w-6 h-6 mt-1 shrink-0 rounded-sm bg-muted animate-pulse"
                    />
                    <div className="flex-1 space-y-3">
                      <SkeletonLine width="70%" className="h-6" />
                      <SkeletonLine width="95%" />
                      <SkeletonLine width="80%" />
                    </div>
                    <div
                      aria-hidden="true"
                      className="w-5 h-5 mt-2 rounded-sm bg-muted animate-pulse"
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : published.length === 0 ? (
            <p className="text-muted-foreground" data-testid="text-library-empty">
              The library is being staged. New entries publish as Apollo signs off.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {published.map((article) => (
                <li key={article.id} className="py-6">
                  <Link
                    href={`/library/${article.slug}`}
                    className="group flex items-start gap-5"
                    data-testid={`link-library-${article.slug}`}
                  >
                    <BookOpen className="w-6 h-6 text-primary mt-1 shrink-0" />
                    <div className="flex-1">
                      <h2 className="font-serif text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-1 transition-all mt-2" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="py-16 bg-[hsl(var(--stone))] border-y border-border">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-normal text-foreground mb-4">
            Done reading? Bring us the situation.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            The library answers the structural questions. The strategy review answers yours.
          </p>
          <Link href="/submit">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm"
              data-testid="button-library-submit"
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
