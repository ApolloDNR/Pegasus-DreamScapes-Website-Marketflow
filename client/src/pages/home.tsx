import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home as HomeIcon, 
  TrendingUp, 
  Palette,
  Shield,
  BarChart3,
  MapPin,
  Users,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrustBar />
      <WhatWeDoSection />
      <FeaturedProjectSection />
      <DualPathSection />
      <WhyPegasusSection />
      <ContactTeaser />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6" data-testid="text-hero-headline">
          We Design & Flip Dream Spaces
          <span className="block text-primary">That Perform Like Investments.</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed" data-testid="text-hero-subheadline">
          Pegasus Dreamscapes transforms distressed and underperforming properties into beautiful, high-performing assets for homeowners and investors.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sell">
            <Button size="lg" className="text-base px-8 py-6" data-testid="button-hero-sell">
              Sell a Property
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/invest">
            <Button size="lg" variant="outline" className="text-base px-8 py-6" data-testid="button-hero-invest">
              Invest With Pegasus
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

function TrustBar() {
  const stats = [
    { icon: Shield, label: "Backed by GC & Designer Team" },
    { icon: TrendingUp, label: "Experience in Fix & Flip + Rentals" },
    { icon: BarChart3, label: "Data-Driven Deal & Rehab Analysis" },
    { icon: MapPin, label: "Serving California & Beyond" },
  ];

  return (
    <section className="py-16 border-y border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-4 p-4" data-testid={`stat-${index}`}>
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatWeDoSection() {
  const services = [
    {
      icon: HomeIcon,
      title: "Fix & Flip Acquisitions",
      description: "We acquire distressed or outdated properties, design a transformation, and execute the full project from start to finish.",
    },
    {
      icon: TrendingUp,
      title: "Buy & Hold / Rental Investments",
      description: "We identify and renovate properties built for long-term cash flow and equity growth.",
    },
    {
      icon: Palette,
      title: "Design & Project Management",
      description: "From concept to finishes, we manage renovations that raise ARVs, rents, and overall property appeal.",
    },
  ];

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4" data-testid="text-whatwedo-title">
            What We Do
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive real estate services designed to maximize value and returns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="hover-elevate transition-all duration-300" data-testid={`card-service-${index}`}>
              <CardHeader>
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProjectSection() {
  return (
    <section className="py-20 lg:py-32 bg-card/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border overflow-hidden">
              <div className="text-center p-8">
                <HomeIcon className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Project Image</p>
                <p className="text-sm text-muted-foreground/70">Nelson Dr, Richmond, CA</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm">
              Featured Flip
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-primary font-medium text-sm uppercase tracking-wide">Featured Project</span>
              <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-featured-title">
                Nelson Dr, Richmond, CA
              </h2>
            </div>
            
            <p className="text-muted-foreground text-lg leading-relaxed" data-testid="text-featured-description">
              Full cosmetic renovation and repositioning. Complete transformation including kitchen, baths, flooring, paint, exterior refresh, and landscaping.
            </p>

            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">Kitchen Remodel</span>
              <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">Bath Updates</span>
              <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">New Flooring</span>
              <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">Exterior Refresh</span>
            </div>

            <div className="flex items-center gap-8 py-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Timeline</p>
                <p className="text-lg font-semibold">3 Months</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Strategy</p>
                <p className="text-lg font-semibold">Fix & Flip</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold text-primary">Completed</p>
              </div>
            </div>

            <Link href="/projects">
              <Button variant="outline" data-testid="button-view-project">
                View Project Details
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function DualPathSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4" data-testid="text-path-title">
            Choose Your Path
          </h2>
          <p className="text-muted-foreground text-lg">
            Whether you need to sell a property or invest in real estate, we're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-8 hover-elevate transition-all duration-300 border-2" data-testid="card-seller-path">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <HomeIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">I Need to Sell a Property</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Inherited, behind on payments, tired landlord, or just ready to move on? We'll review your property and give you options: a direct cash offer or a tailored listing strategy once you're fully licensed.
            </p>
            <Link href="/sell">
              <Button className="w-full sm:w-auto" data-testid="button-go-sell">
                Go to Sell Page
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </Card>

          <Card className="p-8 hover-elevate transition-all duration-300 border-2" data-testid="card-investor-path">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">I Want to Invest in Real Estate</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Looking for a hands-on operator to partner with? We analyze deals, manage renovations, and provide transparent updates and numbers.
            </p>
            <Link href="/invest">
              <Button variant="outline" className="w-full sm:w-auto" data-testid="button-go-invest">
                Go to Invest Page
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}

function WhyPegasusSection() {
  const reasons = [
    "Construction & design background — not just spreadsheets.",
    "Numbers-driven: comps, rehab budgets, and timelines are transparent.",
    "We care about the long-term impact on neighborhoods and partners.",
    "Experienced team with proven track record in California market.",
  ];

  return (
    <section className="py-20 lg:py-32 bg-card/50 border-y border-border">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-12" data-testid="text-why-title">
          Why Pegasus Dreamscapes
        </h2>
        <div className="space-y-6">
          {reasons.map((reason, index) => (
            <div key={index} className="flex items-start gap-4 text-left" data-testid={`reason-${index}`}>
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-lg text-foreground">{reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactTeaser() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <Users className="w-12 h-12 text-primary mx-auto mb-6" />
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4" data-testid="text-contact-title">
          Ready to Talk?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Ready to talk about a property or potential partnership?
        </p>
        <Link href="/contact">
          <Button size="lg" data-testid="button-contact-us">
            Contact Us
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
