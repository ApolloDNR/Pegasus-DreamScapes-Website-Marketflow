import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal, FadeIn, StaggerChildren, StaggerItem, HoverLift } from "@/components/animations";
import { 
  Building2,
  Hammer,
  TrendingUp,
  Home,
  ArrowRight,
  Check,
  Shield,
  Star,
  Users,
  Award,
  Sparkles,
  DollarSign,
  Briefcase,
  Handshake
} from "lucide-react";

export default function Partner() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <RolesOverview />
      <WholesalerSection />
      <DreamscaperSection />
      <InvestorSection />
      <BuyerSection />
      <PegasusBadgeSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-card overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <FadeIn>
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              Join the Movement
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" data-testid="text-partner-title">
              Partner With Pegasus
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8" data-testid="text-partner-subtitle">
              Join our marketplace of real estate professionals. Whether you source deals, 
              transform properties, invest capital, or purchase homes—there's a place for you.
            </p>
            <p className="text-lg text-primary font-medium">
              "Where Designed Profits Are Crafted."
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function RolesOverview() {
  const roles = [
    { 
      title: "Wholesaler", 
      icon: Building2, 
      description: "Source and submit off-market deals", 
      color: "text-blue-600",
      bgColor: "bg-blue-500/10"
    },
    { 
      title: "Dreamscaper", 
      icon: Hammer, 
      description: "Transform properties, raise capital", 
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    { 
      title: "Investor", 
      icon: TrendingUp, 
      description: "Fund projects, earn returns", 
      color: "text-green-600",
      bgColor: "bg-green-500/10"
    },
    { 
      title: "Buyer", 
      icon: Home, 
      description: "Purchase homes or investment properties", 
      color: "text-purple-600",
      bgColor: "bg-purple-500/10"
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">Four Paths to Partnership</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="text-roles-title">
            Choose Your Role
          </h2>
        </ScrollReveal>

        <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
          {roles.map((role, index) => (
            <StaggerItem key={index}>
              <div className="text-center p-8" data-testid={`role-card-${role.title.toLowerCase()}`}>
                <div className={`w-16 h-16 rounded-2xl ${role.bgColor} flex items-center justify-center mx-auto mb-4`}>
                  <role.icon className={`w-8 h-8 ${role.color}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{role.title}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function WholesalerSection() {
  const benefits = [
    "Access our network of vetted Dreamscapers and investors",
    "Submit deals for review and approval",
    "Earn assignment fees on successful transactions",
    "Track your deals through our pipeline",
    "Build your reputation with verified closings",
    "Opportunity to become a Pegasus Wholesaler",
  ];

  return (
    <section id="wholesaler" className="py-20 lg:py-24 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="outline">Deal Sourcing</Badge>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6" data-testid="text-wholesaler-title">
                Wholesalers
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                You find the deals—we connect you with buyers. Our marketplace gives you 
                access to qualified Dreamscapers and cash investors actively seeking 
                off-market opportunities. Submit your deals, set your assignment fee, 
                and let our network work for you.
              </p>

              <div className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/signup?role=wholesaler">
                  <Button size="lg" data-testid="button-wholesaler-signup">
                    Create Wholesaler Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login?role=wholesaler">
                  <Button variant="outline" size="lg" data-testid="button-wholesaler-login">
                    Log In as Wholesaler
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Submit Your Deal</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload property details, contract info, and financials through our deal form.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">We Review & Approve</h4>
                    <p className="text-sm text-muted-foreground">
                      Our team verifies the deal meets our standards before listing it publicly.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Dreamscapers Request Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Qualified operators submit JV requests—you choose who to work with.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Close & Get Paid</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete the assignment and earn your fee. Build your track record.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function DreamscaperSection() {
  const benefits = [
    "Browse verified wholesale deals with full underwriting",
    "Request JV partnerships on deals that match your criteria",
    "Raise capital from our investor network",
    "Post your own projects seeking funding",
    "Track project progress and investor communications",
    "Opportunity to become a Pegasus Dreamscaper",
  ];

  return (
    <section id="dreamscaper" className="py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal delay={0.2} className="order-2 lg:order-1">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hammer className="w-5 h-5 text-primary" />
                  What Dreamscapers Do
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Discover Deals</h4>
                    <p className="text-sm text-muted-foreground">
                      Browse approved wholesale deals with full financials and property details.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Request Partnership</h4>
                    <p className="text-sm text-muted-foreground">
                      Submit JV requests to wholesalers with your intended strategy and terms.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Raise Capital</h4>
                    <p className="text-sm text-muted-foreground">
                      Post your project to our investor network with debt or equity terms.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Execute & Profit</h4>
                    <p className="text-sm text-muted-foreground">
                      Transform the property, share updates, and distribute returns.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal className="order-1 lg:order-2">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Hammer className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary">Property Operators</Badge>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6" data-testid="text-dreamscaper-title">
                Dreamscapers
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                You're the operator—the one who transforms distressed properties into 
                beautiful homes. Access our deal flow, partner with wholesalers, and 
                raise capital from investors who believe in your vision. 
                Build your reputation as a trusted Dreamscaper.
              </p>

              <div className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/signup?role=dreamscaper">
                  <Button size="lg" data-testid="button-dreamscaper-signup">
                    Create Dreamscaper Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login?role=dreamscaper">
                  <Button variant="outline" size="lg" data-testid="button-dreamscaper-login">
                    Log In as Dreamscaper
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function InvestorSection() {
  const benefits = [
    "Access curated investment opportunities",
    "Choose between debt and equity structures",
    "Review operator track records and ratings",
    "Commit capital with transparent terms",
    "Track your portfolio and returns",
    "Receive project updates and distributions",
  ];

  return (
    <section id="investor" className="py-20 lg:py-24 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <Badge variant="outline" className="border-green-500/30 text-green-600">Capital Partners</Badge>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6" data-testid="text-investor-title">
                Investors
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Put your capital to work with vetted real estate operators. Whether you 
                prefer the security of debt (fixed returns) or the upside of equity 
                (profit participation), our marketplace connects you with projects 
                that match your investment criteria.
              </p>

              <div className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/signup?role=investor">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700" data-testid="button-investor-signup">
                    Create Investor Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login?role=investor">
                  <Button variant="outline" size="lg" data-testid="button-investor-login">
                    Log In as Investor
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-2">
                <CardHeader className="pb-2">
                  <DollarSign className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">Debt Investments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Fixed interest rate returns with defined terms. First position security.
                  </p>
                  <div className="text-2xl font-bold text-blue-600">8-12%</div>
                  <p className="text-xs text-muted-foreground">Typical annual returns</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-2">
                  <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                  <CardTitle className="text-lg">Equity Investments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Profit participation with upside potential. Share in the success.
                  </p>
                  <div className="text-2xl font-bold text-green-600">15-30%+</div>
                  <p className="text-xs text-muted-foreground">Potential returns</p>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function BuyerSection() {
  const retailBenefits = [
    "Browse beautifully renovated Pegasus homes",
    "Schedule private showings",
    "Access property disclosures and details",
    "Submit offers directly through the platform",
    "Work with our team through closing",
  ];

  const investmentBenefits = [
    "Access wholesale assignments before retail",
    "View full deal analysis and financials",
    "Submit offers on off-market properties",
    "Build your investment portfolio",
    "Connect with our network of operators",
  ];

  return (
    <section id="buyer" className="py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" data-testid="text-buyer-title">
            Buyers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're looking for your dream home or your next investment property, 
            we have options for you.
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8">
          <ScrollReveal>
            <HoverLift>
              <Card className="h-full border-2">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">Retail Buyers</Badge>
                  <CardTitle>Buy a Finished Home</CardTitle>
                  <CardDescription>
                    Looking for a move-in ready home? Browse our portfolio of 
                    beautifully renovated properties.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-8">
                    {retailBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href="/signup?role=buyer_retail">
                      <Button size="lg" variant="default" data-testid="button-buyer-retail-signup">
                        Create Buyer Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/buy">
                      <Button size="lg" variant="outline" data-testid="button-browse-homes">
                        Browse Homes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </HoverLift>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <HoverLift>
              <Card className="h-full border-2 border-purple-500/20">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2 border-purple-500/30 text-purple-600">Investment Buyers</Badge>
                  <CardTitle>Buy Investment Properties</CardTitle>
                  <CardDescription>
                    Looking to invest? Access our wholesale deals and 
                    off-market opportunities before they hit retail.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-8">
                    {investmentBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href="/signup?role=buyer_investment">
                      <Button size="lg" className="bg-purple-600 hover:bg-purple-700" data-testid="button-buyer-investment-signup">
                        Create Investor Buyer Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/wholesale">
                      <Button size="lg" variant="outline" data-testid="button-browse-investments">
                        Browse Investments
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </HoverLift>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function PegasusBadgeSection() {
  return (
    <section className="py-20 lg:py-24 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
                <Award className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">Elite Status</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6" data-testid="text-pegasus-badge-title">
                The Pegasus Badge
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Our internal team members and top-performing partners earn the prestigious 
                <strong className="text-foreground"> Pegasus Badge</strong>—a symbol of trust, 
                excellence, and proven performance in our marketplace.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Pegasus Wholesalers</strong> are internal 
                team members who source deals directly for our network. 
                <strong className="text-foreground"> Pegasus Dreamscapers</strong> are our 
                in-house operators who execute projects to the highest standards.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Pegasus Wholesaler</h3>
                  <p className="text-sm text-muted-foreground">
                    Internal deal sourcers with priority listing
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Pegasus Dreamscaper</h3>
                  <p className="text-sm text-muted-foreground">
                    Elite operators with proven track records
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-2 border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Trust & Verification</h3>
                      <p className="text-sm text-muted-foreground">
                        Pegasus-badged members undergo additional vetting and maintain 
                        higher standards. Their deals and projects receive priority 
                        visibility in the marketplace.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <ScrollReveal>
          <Handshake className="w-16 h-16 text-primary mx-auto mb-8" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6" data-testid="text-cta-title">
            Ready to Join?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
            Choose your path and start building your real estate success story with Pegasus Dreamscapes. 
            Our marketplace is designed to help you find deals, raise capital, and grow your business.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" data-testid="button-create-account">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" data-testid="button-login">
                Log In to Marketplace
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="ghost" data-testid="button-contact-team">
                Contact Our Team
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
