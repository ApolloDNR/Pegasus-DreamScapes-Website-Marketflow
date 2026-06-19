import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useSEO } from "@/hooks/use-seo";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { ScrollReveal, FadeIn } from "@/components/animations";
import { trackCtaClick } from "@/lib/analytics";
import { SkeletonHero, SkeletonGrid } from "@/components/skeleton-primitives";
import {
  Loader2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Construction,
  Lock,
} from "lucide-react";

export default function MarketplacePage() {
  const [, setLocation] = useLocation();
  const { isLoading, isAuthenticated } = useSupabaseAuth();

  useSEO({
    title: "MarketFlow Beta",
    description: "MarketFlow is the private dealflow layer for reviewed opportunities, trusted operators, buyers, and capital relationships. Not a public marketplace.",
    image: "/og/marketflow.png",
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/marketflow/deals");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background"
        data-testid="skeleton-marketplace"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-16 space-y-12">
          <SkeletonHero />
          <SkeletonGrid count={4} columns={4} />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <section className="max-w-7xl mx-auto px-6 pt-6"><LegalDisclaimer /></section>
      <MarketFlowFunnelSection />
      <BetaFeaturesSection />
      {/* Website Structure v1 FINAL §7 — Pegasus Buyboxes moved off the
          MarketFlow landing into a dedicated /marketflow/buyboxes page. A
          single teaser links there so the gated landing stays focused on
          the access funnel. */}
      <section className="py-16 lg:py-20 bg-muted/15 border-y border-border/30">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
            Pegasus Buyboxes
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-4 leading-tight">
            What we're actively underwriting.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-7">
            Four named buyboxes with target geographies, deal types, and underwriting bands. Request a notification when a fit shows up.
          </p>
          <Link href="/marketflow/buyboxes">
            <Button
              size="lg"
              variant="outline"
              className="text-sm uppercase tracking-[0.15em] px-7 py-6 font-semibold"
              data-testid="button-marketflow-buyboxes"
            >
              See the Pegasus Buyboxes <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
      <MarketFlowBoundarySection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: "hsl(var(--navy))", color: "hsl(var(--navy-foreground))" }}
    >
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-champagne/10 rounded-full blur-3xl" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <FadeIn>
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10">
                <Lock className="w-3 h-3 text-primary" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold">Private Beta</span>
              </span>
              <span className="text-[11px] uppercase tracking-[0.28em] text-cream/65 font-supporting">Invite-only network</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] mb-6 text-cream" data-testid="text-marketplace-title">
              MarketFlow.<br />
              <span className="italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
                The private dealflow layer.
              </span>
            </h1>
            <p className="text-lg text-cream/85 leading-relaxed max-w-3xl mx-auto mb-8" data-testid="text-marketplace-subtitle">
              MarketFlow is the private dealflow layer for reviewed opportunities, trusted operators, buyers, and capital relationships.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/marketflow/access"
                onClick={() => trackCtaClick("marketflow_landing", "Request Beta Access", "/marketflow/access")}
              >
                <Button size="lg" className="px-8 text-sm uppercase tracking-[0.15em] font-semibold bg-primary text-white hover:bg-primary/90" data-testid="button-join-marketplace">
                  Request Beta Access
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="px-8 text-sm uppercase tracking-[0.15em] font-semibold border-cream/30 text-cream hover:bg-cream/10" data-testid="button-sign-in">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-cream/55 mt-6 font-supporting">
              Private beta. Access and features may be limited while the platform evolves.
            </p>
          </div>
        </FadeIn>
      </div>
      <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

function MarketFlowFunnelSection() {
  const stages = [
    {
      stage: "Stage 01",
      stageLabel: "Website / Peggy Intake",
      steps: [
        { n: "01", label: "Website / Peggy intake", note: "Owner or operator submits" },
        { n: "02", label: "Pegasus HQ submission", note: "Logged for internal review" },
      ],
    },
    {
      stage: "Stage 02",
      stageLabel: "Pegasus HQ Review",
      steps: [
        { n: "03", label: "Seed", note: "Initial qualification" },
        { n: "04", label: "Strategy Snapshot", note: "Free structural read" },
        { n: "05", label: "Lane choice", note: "Owner picks a path" },
      ],
    },
    {
      stage: "Stage 03",
      stageLabel: "Approved Opportunity",
      steps: [
        { n: "06", label: "Opportunity", note: "Approved by the team" },
        { n: "07", label: "MarketFlow candidate", note: "Curated for fit" },
      ],
    },
    {
      stage: "Stage 04",
      stageLabel: "MarketFlow Distribution",
      steps: [
        { n: "08", label: "Approved for distribution", note: "Cleared for the network" },
        { n: "09", label: "MarketFlow Listing", note: "Visible to vetted members" },
      ],
    },
  ];

  return (
    <section
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ backgroundColor: "hsl(var(--navy))", color: "hsl(var(--navy-foreground))" }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="text-center mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold mb-3 font-supporting">How a property reaches MarketFlow</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] max-w-2xl mx-auto text-cream">
            Reviewed before listed. Always.
          </h2>
          <p className="text-sm text-cream/70 mt-4 max-w-2xl mx-auto">
            Nine steps. Four stages. Every opportunity passes through the same structural path before it ever sees the network.
          </p>
        </div>

        {/* Mobile: vertical timeline grouped by stage */}
        <ol className="lg:hidden space-y-8" data-testid="marketflow-funnel-mobile">
          {stages.map((stage, si) => (
            <li key={stage.stage} className="relative pl-6 border-l border-primary/40" data-testid={`funnel-stage-marketplace-${si}`}>
              <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-primary" />
              <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-semibold mb-1 font-supporting">{stage.stage}</p>
              <p className="font-serif text-base font-semibold text-cream mb-4">{stage.stageLabel}</p>
              <div className="space-y-3">
                {stage.steps.map((step) => (
                  <div
                    key={step.n}
                    className="p-3 rounded-lg border border-cream/15 bg-cream/[0.03]"
                    data-testid={`funnel-step-marketplace-${step.n}`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.25em] text-primary/85 font-supporting font-semibold mb-1">{step.n}</div>
                    <div className="font-serif text-sm font-semibold leading-tight mb-0.5 text-cream">{step.label}</div>
                    <div className="text-[11px] text-cream/60 leading-snug">{step.note}</div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>

        {/* Desktop: 4-stage stepper */}
        <div className="hidden lg:block" data-testid="marketflow-funnel-desktop">
          <div className="grid grid-cols-4 gap-5">
            {stages.map((stage, si) => (
              <div key={stage.stage} className="relative">
                <div className="mb-5 pb-3 border-b border-primary/30">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-semibold mb-1 font-supporting">{stage.stage}</p>
                  <p className="font-serif text-base font-semibold text-cream leading-tight">{stage.stageLabel}</p>
                </div>
                <div className="space-y-3">
                  {stage.steps.map((step) => (
                    <div
                      key={step.n}
                      className="relative p-4 rounded-lg border border-cream/15 bg-cream/[0.03] hover:border-primary/50 hover:bg-cream/[0.05] transition-all"
                      data-testid={`funnel-step-marketplace-${step.n}-desktop`}
                    >
                      <div className="text-[10px] uppercase tracking-[0.25em] text-primary/85 font-supporting font-semibold mb-1.5">{step.n}</div>
                      <div className="font-serif text-sm font-semibold leading-tight mb-1 text-cream">{step.label}</div>
                      <div className="text-[11px] text-cream/60 leading-snug">{step.note}</div>
                    </div>
                  ))}
                </div>
                {si < stages.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-5 -right-3.5 w-4 h-4 text-primary/60" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] uppercase tracking-[0.25em] text-cream/55 mt-10 font-supporting">
          No raw intake reaches MarketFlow. The review is the doctrine.
        </p>
      </div>
    </section>
  );
}

function BetaFeaturesSection() {
  const { getAvailableFeatures, getComingSoonFeatures, isBeta } = useFeatureFlags();
  
  if (!isBeta('marketflow')) {
    return null;
  }
  
  const availableFeatures = getAvailableFeatures();
  const comingSoonFeatures = getComingSoonFeatures();
  
  return (
    <section className="py-12 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 border-y border-amber-500/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <FadeIn>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Construction className="w-5 h-5 text-amber-600" />
              <Badge variant="outline" className="bg-amber-500/20 text-amber-700 border-amber-500/30 font-semibold">
                BETA
              </Badge>
            </div>
            <h2 className="text-2xl font-bold mb-2">MarketFlow Beta</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're actively building the future of real estate deal flow. Here's what's ready now and what's coming next.
            </p>
          </div>
        </FadeIn>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <ScrollReveal>
            <Card className="bg-background/80 border-green-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  Available Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {availableFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </ScrollReveal>
          
          <ScrollReveal>
            <Card className="bg-background/80 border-amber-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <Clock className="w-5 h-5" />
                  Coming Next
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {comingSoonFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function MarketFlowBoundarySection() {
  return (
    <section
      className="py-20 lg:py-24 bg-card border-y border-border/50"
      data-testid="section-marketflow-boundary"
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
          What MarketFlow is not
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-tight mb-8">
          The boundary is the doctrine.
        </h2>
        <ul className="space-y-4 text-base text-muted-foreground leading-relaxed" data-testid="text-marketplace-not">
          <li className="flex gap-3"><span className="text-primary mt-1.5">·</span><span>Not raw intake. Every property is routed through Pegasus HQ first.</span></li>
          <li className="flex gap-3"><span className="text-primary mt-1.5">·</span><span>Not a public marketplace. Access is private, role-gated, and invite-only.</span></li>
          <li className="flex gap-3"><span className="text-primary mt-1.5">·</span><span>Not an investment solicitation platform. Capital conversations happen privately, never as a public offering.</span></li>
          <li className="flex gap-3"><span className="text-primary mt-1.5">·</span><span>Not a lead aggregator. Buyboxes are free interest signals reviewed by Pegasus before any match is shared.</span></li>
        </ul>
      </div>
    </section>
  );
}


function CTASection() {
  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
        <ScrollReveal>
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
            Request Beta Access
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-6" data-testid="text-final-cta-title">
            Bring us the property. We'll show you the path.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            MarketFlow is private and reviewed. If your work fits the standard, the network opens. If it does not, we will say so.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/marketflow/access"
              onClick={() => trackCtaClick("marketflow_landing", "Request Beta Access", "/marketflow/access")}
            >
              <Button
                size="lg"
                className="px-8 text-sm uppercase tracking-[0.15em] font-semibold bg-primary text-white hover:bg-primary/90"
                data-testid="button-create-account-cta"
              >
                Request Beta Access
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="lg" variant="outline" className="px-8 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-learn-more">
                Submit a Property
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
