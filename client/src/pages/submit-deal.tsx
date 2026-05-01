import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { WholesaleDealForm } from "@/components/wholesale-deal-form";
import { Link } from "wouter";
import {
  ArrowRight,
  FileText,
  DollarSign,
  CheckCircle,
  Users,
  Shield,
  TrendingUp,
  Loader2,
  Sparkles,
  Crown,
  Target,
  Building2,
  Clock,
  Award
} from "lucide-react";

export default function SubmitDeal() {
  const { user, isLoading } = useSupabaseAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const userRole = user?.user_metadata?.role || "";
  const isWholesaler = userRole === "wholesaler" || userRole === "pegasus_wholesaler";
  const isPegasus = userRole.startsWith("pegasus_");
  
  if (user && isWholesaler) {
    return <AuthenticatedSubmitDeal isPegasus={isPegasus} />;
  }
  
  return <PublicSubmitDeal isLoggedIn={!!user} userRole={userRole} />;
}

function PublicSubmitDeal({ isLoggedIn, userRole }: { isLoggedIn: boolean; userRole: string }) {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <section className="max-w-7xl mx-auto px-6 pt-6"><LegalDisclaimer /></section>
      <HowItWorksSection />
      <WholesalerTypesSection />
      <BenefitsSection />
      <CTASection isLoggedIn={isLoggedIn} userRole={userRole} />
    </div>
  );
}

function AuthenticatedSubmitDeal({ isPegasus }: { isPegasus: boolean }) {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold" data-testid="text-submit-deal-title">
                Submit a Wholesale Deal
              </h1>
              {isPegasus && (
                <Badge variant="secondary" className="gap-1">
                  <Crown className="w-3 h-3" />
                  Pegasus Wholesaler
                </Badge>
              )}
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Submit your deal for review. Approved deals will be listed in the marketplace 
              for dreamscapers and investors to discover.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <WholesaleDealForm onSuccess={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    What We Look For
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Clear title or path to clear title</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <DollarSign className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Minimum 70% rule spread or better</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Accurate repair estimates with photos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Reasonable closing timeline (14-30 days preferred)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Complete and accurate property information</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Deal Review Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</div>
                    <div>
                      <p className="font-medium">Initial Review</p>
                      <p className="text-muted-foreground">Within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">2</div>
                    <div>
                      <p className="font-medium">Deep Analysis</p>
                      <p className="text-muted-foreground">1-2 business days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">3</div>
                    <div>
                      <p className="font-medium">Approval Decision</p>
                      <p className="text-muted-foreground">You'll be notified</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {isPegasus && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Crown className="w-5 h-5 text-primary" />
                      Pegasus Privileges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Priority listing placement
                    </p>
                    <p className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      Verified Pegasus badge on deals
                    </p>
                    <p className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Expedited review process
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <Badge variant="secondary" className="mb-6 text-xs uppercase tracking-wide">
          <Sparkles className="w-3 h-3 mr-2" />
          MarketFlow Private Beta
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-submit-deal-hero">
          Submit Your
          <span className="block text-primary">Wholesale Deals</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
          Submit a deal for Pegasus review. Visibility and matching features may be limited during private beta.
        </p>
        <Link href="/signup?role=wholesaler">
          <Button size="lg" className="text-base px-8 py-6" data-testid="button-get-started">
            Get Started as a Wholesaler
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: FileText,
      step: "01",
      title: "Submit Your Deal",
      description: "Provide property details, numbers, and photos through our comprehensive submission form.",
    },
    {
      icon: Shield,
      step: "02",
      title: "We Review & Verify",
      description: "Our team analyzes the deal for accuracy, viability, and investor appeal.",
    },
    {
      icon: Users,
      step: "03",
      title: "Get Matched",
      description: "Approved deals are listed and matched with qualified dreamscapers and investors.",
    },
    {
      icon: DollarSign,
      step: "04",
      title: "Close & Get Paid",
      description: "Connect with interested parties, negotiate terms, and close your deal.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">The Process</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-how-it-works">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center" data-testid={`step-submit-${index}`}>
              <div className="text-6xl font-bold text-primary/10 mb-4">{step.step}</div>
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WholesalerTypesSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Two Paths</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2">
            Wholesaler Types
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Whether you're an external wholesaler bringing deals or a Pegasus team member, we have a place for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="hover-elevate transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-secondary/80 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-foreground" />
              </div>
              <CardTitle className="text-2xl">External Wholesalers</CardTitle>
              <CardDescription className="text-base">
                Independent wholesalers bringing their own deals to the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>List your contracted deals</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Access to operators and investor interest</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Build your reputation and track record</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>No listing fees - pay only on closed deals</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all duration-300 border-primary/30 bg-primary/5">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl flex items-center gap-2">
                Pegasus Wholesalers
                <Badge variant="secondary" className="text-xs">Internal</Badge>
              </CardTitle>
              <CardDescription className="text-base">
                Part of the Pegasus Dreamscapes acquisitions team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Priority listing placement</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Verified Pegasus badge on all deals</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Expedited review and approval</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Analytics and performance insights</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Reach More Buyers",
      description: "Access our network of qualified investors, dreamscapers, and cash buyers actively looking for deals."
    },
    {
      icon: Shield,
      title: "Verified Marketplace",
      description: "All buyers are vetted for proof of funds and transaction history before accessing deals."
    },
    {
      icon: Award,
      title: "Build Reputation",
      description: "Earn badges, ratings, and trust scores that help you stand out and close more deals."
    },
    {
      icon: Target,
      title: "Smart Matching",
      description: "Our algorithm matches your deals with buyers whose criteria align with your property."
    }
  ];

  return (
    <section className="py-20 lg:py-32 border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Benefits</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2">
            Why List With Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="hover-elevate transition-all duration-300" data-testid={`card-benefit-${index}`}>
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ isLoggedIn, userRole }: { isLoggedIn: boolean; userRole: string }) {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-6">
          Ready to Submit Your Deal?
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          {isLoggedIn 
            ? "Log in as a wholesaler to access the deal submission form and start listing your properties."
            : "Create a wholesaler account to submit deals and participate in our private beta review network."
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isLoggedIn ? (
            <>
              <Link href="/marketflow/wholesaler">
                <Button size="lg" className="text-base px-8 py-6" data-testid="button-go-to-dashboard">
                  Go to Wholesaler Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              {userRole && !userRole.includes("wholesaler") && (
                <p className="text-sm text-muted-foreground mt-4">
                  Note: Your current role is "{userRole}". Contact support to add wholesaler access.
                </p>
              )}
            </>
          ) : (
            <>
              <Link href="/signup?role=wholesaler">
                <Button size="lg" className="text-base px-8 py-6" data-testid="button-signup-wholesaler">
                  Sign Up as Wholesaler
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base px-8 py-6" data-testid="button-login">
                  Already have an account? Log In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
