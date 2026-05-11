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
  Construction
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
    <section className="relative py-24 lg:py-32 bg-gradient-to-br from-card via-background to-card overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <FadeIn>
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              MarketFlow by Pegasus Systems
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" data-testid="text-marketplace-title">
              MarketFlow Private Beta
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-6" data-testid="text-marketplace-subtitle">
              MarketFlow is the private dealflow layer for reviewed opportunities, trusted operators, buyers, and capital relationships.
            </p>
            <div className="max-w-2xl mx-auto mb-8 text-sm text-muted-foreground/80 leading-relaxed border border-border/40 rounded-lg px-5 py-4 bg-card/40 text-left" data-testid="text-marketplace-not">
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary/80 font-semibold mb-2">What MarketFlow is not</p>
              <ul className="space-y-1">
                <li>· Not raw intake — every property is routed through Pegasus HQ first.</li>
                <li>· Not a public marketplace — access is private, role-gated, and invite-only.</li>
                <li>· Not an investment solicitation platform — capital conversations happen privately, never as a public offering.</li>
              </ul>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" data-testid="button-join-marketplace">
                  Request Beta Access
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" data-testid="button-sign-in">
                  Sign In
                </Button>
              </Link>
              <Button size="lg" variant="ghost" onClick={handleDemoMode} data-testid="button-demo-mode">
                <Eye className="w-4 h-4 mr-2" />
                Try Demo Mode
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              MarketFlow is currently in private beta. Access and features may be limited while the platform evolves.
            </p>
          </div>
        </FadeIn>
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
