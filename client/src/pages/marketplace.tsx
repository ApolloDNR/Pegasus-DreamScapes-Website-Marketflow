import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useDemoMode } from "@/contexts/demo-mode-context";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, CheckCircle2, XCircle, Lock } from "lucide-react";

// Empire Doctrine v1.0.1 /marketflow — public surface is a single gated
// landing page (hero + what it is + what it is not + Request Beta Access).
// All dashboards, marketplace grids, and buyer/wholesaler/admin surfaces
// live behind /marketflow/<role> and are not rendered on this route.

export default function MarketflowLanding() {
  const [, setLocation] = useLocation();
  const { isLoading, isAuthenticated } = useSupabaseAuth();
  const { isDemoMode } = useDemoMode();

  useSEO({
    title: "MarketFlow",
    description:
      "MarketFlow is the private dealflow layer of Pegasus DreamScapes. Beta access by invitation. Not a public marketplace, not a public investment platform.",
  });

  useEffect(() => {
    if (!isLoading && (isAuthenticated || isDemoMode)) {
      setLocation("/marketflow/dashboard");
    }
  }, [isLoading, isAuthenticated, isDemoMode, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-[hsl(var(--charcoal))] text-cream pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
            MarketFlow · Private Beta
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-tight mb-6">
            The private dealflow layer.
          </h1>
          <p className="font-serif text-xl text-white/85 italic leading-snug max-w-2xl mb-8">
            For reviewed opportunities, trusted operators, and capital relationships Pegasus
            already knows.
          </p>
          <Link href="/marketflow/access">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm"
              data-testid="button-marketflow-access"
            >
              Request Beta Access
              <ArrowRight className="ml-3 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
              What MarketFlow is
            </p>
            <ul className="space-y-3">
              {[
                "A private layer where reviewed properties find the right operator or capital partner.",
                "An invite-only network of vetted buyers, builders, and operators Pegasus has worked with.",
                "A controlled environment with documented terms, written agreements, and on-record activity.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-base text-muted-foreground leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
              What MarketFlow is not
            </p>
            <ul className="space-y-3">
              {[
                "Not a public marketplace.",
                "Not a public investment platform or solicitation.",
                "Not a raw intake form for anyone to send anything.",
                "Not a marketing list or distribution channel.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-base text-muted-foreground leading-relaxed">
                  <XCircle className="w-5 h-5 text-muted-foreground/60 mt-0.5 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[hsl(var(--stone))] border-y border-border">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <Lock className="w-8 h-8 text-primary mx-auto mb-5" />
          <h2 className="font-serif text-3xl font-semibold tracking-[-0.02em] text-foreground mb-4">
            Access is by introduction.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
            We open access deliberately. If you already know Apollo or someone in the Pegasus
            network, request beta access and reference how we connected.
          </p>
          <Link href="/marketflow/access">
            <Button
              variant="outline"
              size="lg"
              className="text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm"
              data-testid="button-marketflow-access-2"
            >
              Request Beta Access
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
