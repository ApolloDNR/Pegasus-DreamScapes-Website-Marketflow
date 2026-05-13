import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useSupabaseAuth, getRoleDashboardPath } from "@/contexts/supabase-auth-context";
import { useDemoMode } from "@/contexts/demo-mode-context";
import { useSEO } from "@/hooks/use-seo";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { ScrollReveal, FadeIn, StaggerChildren, StaggerItem, HoverLift } from "@/components/animations";
import { motion } from "framer-motion";
import {
  Loader2,
  Building2,
  Hammer,
  TrendingUp,
  Home,
  ArrowRight,
  Shield,
  Users,
  Award,
  BarChart3,
  Handshake,
  CheckCircle2,
  Sparkles,
  Eye,
  Clock,
  Construction,
  Lock,
  Target,
  Network
} from "lucide-react";

export default function MarketplacePage() {
  const [, setLocation] = useLocation();
  const { isLoading, isAuthenticated, userRole } = useSupabaseAuth();
  const { isDemoMode } = useDemoMode();

  useSEO({
    title: "MarketFlow - Deal Marketplace",
    description: "Browse wholesale deals, capital projects, and property listings. Connect with vetted investors and close deals faster."
  });

  useEffect(() => {
    if (!isLoading && (isAuthenticated || isDemoMode)) {
      setLocation("/marketflow/deals");
    }
  }, [isLoading, isAuthenticated, isDemoMode, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
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
      <StatsSection />
      <RolesSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  const { enableDemoMode } = useDemoMode();
  const [, setLocation] = useLocation();

  const handleDemoMode = () => {
    enableDemoMode();
    setLocation("/marketflow/deals");
  };

  return (
    <section
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: "hsl(var(--navy))", color: "hsl(var(--navy-foreground))" }}
    >
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-copper/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-champagne/10 rounded-full blur-3xl" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <FadeIn>
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-copper/40 bg-copper/10">
                <Lock className="w-3 h-3 text-copper" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-copper font-semibold font-supporting">Private Beta</span>
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
            <div className="max-w-2xl mx-auto mb-10 border-l-2 border-copper/60 pl-5 text-sm text-cream/80 leading-relaxed text-left" data-testid="text-marketplace-not">
              <p className="text-[10px] uppercase tracking-[0.28em] text-copper font-semibold mb-2 font-supporting">What MarketFlow is not</p>
              <ul className="space-y-1">
                <li>· Not raw intake. Every property is routed through Pegasus HQ first.</li>
                <li>· Not a public marketplace. Access is private, role-gated, and invite-only.</li>
                <li>· Not an investment solicitation platform. Capital conversations happen privately, never as a public offering.</li>
              </ul>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="px-8 text-sm uppercase tracking-[0.15em] font-semibold bg-copper text-white hover:bg-copper/90" data-testid="button-join-marketplace">
                  Request Beta Access
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="px-8 text-sm uppercase tracking-[0.15em] font-semibold border-cream/30 text-cream hover:bg-cream/10" data-testid="button-sign-in">
                  Sign In
                </Button>
              </Link>
              <Button size="lg" variant="ghost" onClick={handleDemoMode} className="text-cream/85 hover:bg-cream/10 hover:text-cream" data-testid="button-demo-mode">
                <Eye className="w-4 h-4 mr-2" />
                Try Demo Mode
              </Button>
            </div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-cream/55 mt-6 font-supporting">
              Private beta. Access and features may be limited while the platform evolves.
            </p>
          </div>
        </FadeIn>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-tan to-champagne" />
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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-copper/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="text-center mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-copper font-semibold mb-3 font-supporting">How a property reaches MarketFlow</p>
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
            <li key={stage.stage} className="relative pl-6 border-l border-copper/40" data-testid={`funnel-stage-marketplace-${si}`}>
              <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-copper" />
              <p className="text-[10px] uppercase tracking-[0.28em] text-copper font-semibold mb-1 font-supporting">{stage.stage}</p>
              <p className="font-serif text-base font-semibold text-cream mb-4">{stage.stageLabel}</p>
              <div className="space-y-3">
                {stage.steps.map((step) => (
                  <div
                    key={step.n}
                    className="p-3 rounded-lg border border-cream/15 bg-cream/[0.03]"
                    data-testid={`funnel-step-marketplace-${step.n}`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.25em] text-copper/85 font-semibold mb-1">{step.n}</div>
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
                <div className="mb-5 pb-3 border-b border-copper/30">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-copper font-semibold mb-1 font-supporting">{stage.stage}</p>
                  <p className="font-serif text-base font-semibold text-cream leading-tight">{stage.stageLabel}</p>
                </div>
                <div className="space-y-3">
                  {stage.steps.map((step) => (
                    <div
                      key={step.n}
                      className="relative p-4 rounded-lg border border-cream/15 bg-cream/[0.03] hover:border-copper/50 hover:bg-cream/[0.05] transition-all"
                      data-testid={`funnel-step-marketplace-${step.n}-desktop`}
                    >
                      <div className="text-[10px] uppercase tracking-[0.25em] text-copper/85 font-semibold mb-1.5">{step.n}</div>
                      <div className="font-serif text-sm font-semibold leading-tight mb-1 text-cream">{step.label}</div>
                      <div className="text-[11px] text-cream/60 leading-snug">{step.note}</div>
                    </div>
                  ))}
                </div>
                {si < stages.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-5 -right-3.5 w-4 h-4 text-copper/60" aria-hidden="true" />
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

function StatsSection() {
  const stats = [
    { value: "Private Beta", label: "Access by review", icon: Building2 },
    { value: "Submissions Open", label: "Deal intake available", icon: TrendingUp },
    { value: "Role-Based", label: "Workflows in progress", icon: Users },
    { value: "Disciplined", label: "Execution-focused system", icon: Award },
  ];

  return (
    <section className="py-16 bg-card border-y border-border/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function RolesSection() {
  const roles = [
    {
      title: "Wholesalers",
      icon: Building2,
      description: "Submit off-market deals and connect with operators and investor interest.",
      features: ["Submit deals for approval", "Set assignment fees", "Track deal status", "Build reputation"],
      cta: "Join as Wholesaler",
      href: "/signup?role=wholesaler",
      color: "blue"
    },
    {
      title: "Dreamscapers",
      icon: Hammer,
      description: "Acquire deals, transform properties, and raise capital from investors.",
      features: ["Browse approved deals", "Submit JV requests", "Raise capital", "Track projects"],
      cta: "Join as Dreamscaper",
      href: "/signup?role=dreamscaper",
      color: "primary"
    },
    {
      title: "Investors",
      icon: TrendingUp,
      description: "Fund real estate projects and earn returns through debt or equity.",
      features: ["Access curated deals", "Choose debt or equity", "Track investments", "Receive updates"],
      cta: "Join as Investor",
      href: "/signup?role=investor",
      color: "green"
    },
    {
      title: "Buyers",
      icon: Home,
      description: "Purchase finished homes or investment properties from our portfolio.",
      features: ["Browse properties", "Submit offers", "Schedule showings", "Access off-market"],
      cta: "Join as Buyer",
      href: "/signup?role=buyer_retail",
      color: "purple"
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20" },
    primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
    green: { bg: "bg-green-500/10", text: "text-green-600", border: "border-green-500/20" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20" },
  };

  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">For Every Role</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="text-roles-section-title">
            Find Your Place in the Marketplace
          </h2>
        </ScrollReveal>

        <StaggerChildren className="grid md:grid-cols-2 gap-6" staggerDelay={0.1}>
          {roles.map((role, index) => {
            const colors = colorClasses[role.color];
            return (
              <StaggerItem key={index}>
                <HoverLift>
                  <Card className={`h-full border-2 ${colors.border}`} data-testid={`role-card-${role.title.toLowerCase()}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <role.icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <CardTitle>{role.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base">{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {role.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href={role.href}>
                        <Button className="w-full" data-testid={`button-${role.title.toLowerCase()}-signup`}>
                          {role.cta}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </HoverLift>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      step: "1",
      title: "Create Your Account",
      description: "Sign up and choose your role in the marketplace. Complete your profile to build trust."
    },
    {
      step: "2",
      title: "Access the Marketplace",
      description: "Browse deals, submit opportunities, or find investment options based on your role."
    },
    {
      step: "3",
      title: "Connect & Transact",
      description: "Submit offers, express interest, or commit capital. Our platform facilitates the connection."
    },
    {
      step: "4",
      title: "Close & Grow",
      description: "Complete transactions, build your track record, and unlock more opportunities."
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">Simple Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="text-how-it-works-title">
            How It Works
          </h2>
        </ScrollReveal>

        <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
          {steps.map((step, index) => (
            <StaggerItem key={index}>
              <div className="text-center" data-testid={`step-card-${index}`}>
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Trusted Platform</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6" data-testid="text-final-cta-title">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
            Join hundreds of real estate professionals who are finding deals, raising capital, 
            and building wealth through the Pegasus Marketplace.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" data-testid="button-create-account-cta">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/partner">
              <Button size="lg" variant="outline" data-testid="button-learn-more">
                Learn About Roles
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Vetted members</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Secure platform</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
