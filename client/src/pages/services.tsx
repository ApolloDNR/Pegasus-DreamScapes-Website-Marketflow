import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  TrendingUp, 
  Palette, 
  MessageSquare,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function Services() {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <ServicesGrid />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-services-hero">
          Our Services
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Pegasus Dreamscapes offers a blend of acquisitions, renovations, and design services tailored to sellers, investors, and property owners.
        </p>
      </div>
    </section>
  );
}

function ServicesGrid() {
  const services = [
    {
      icon: Home,
      title: "Fix & Flip Acquisitions",
      description: "We acquire distressed or outdated properties, design a transformation, and execute the full project from start to finish.",
      forWho: "Homeowners with outdated/distressed properties, wholesalers, agents",
      features: [
        "Evaluate the property thoroughly",
        "Provide a clear offer strategy",
        "Handle renovation and resale",
        "Transparent timeline and budget",
      ],
    },
    {
      icon: TrendingUp,
      title: "Buy & Hold / Rentals",
      description: "We identify and renovate properties built for long-term cash flow and equity growth.",
      forWho: "Investors who want cash-flowing rentals",
      features: [
        "Help identify properties (U.S., possibly MX later)",
        "Analyze cash flow, COCR, ROI",
        "Oversee value-add renovations",
        "Long-term partnership approach",
      ],
    },
    {
      icon: Palette,
      title: "Design & Renovation Management",
      description: "From concept to finishes, we manage renovations that raise ARVs, rents, and overall property appeal.",
      forWho: "Owners who already have a property",
      features: [
        "Design concept and mood boards",
        "Material selections and finishes",
        "Coordinate with trades and timelines",
        "Focus on adding value and appeal",
      ],
    },
    {
      icon: MessageSquare,
      title: "Consulting / Deal Analysis",
      description: "Get expert guidance on your real estate deals with personalized analysis and recommendations.",
      forWho: "Investors and property owners seeking expert advice",
      features: [
        "One-on-one deal review sessions",
        "Market analysis and comps",
        "Rehab budget estimation",
        "Exit strategy planning",
      ],
    },
  ];

  return (
    <section className="py-20 lg:py-32 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="space-y-16">
          {services.map((service, index) => (
            <Card key={index} className="overflow-hidden" data-testid={`card-service-detail-${index}`}>
              <div className="grid lg:grid-cols-2">
                <CardHeader className="p-8 lg:p-12 bg-card">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <service.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl mb-4">{service.title}</CardTitle>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <div className="inline-block px-4 py-2 bg-secondary rounded-lg">
                    <span className="text-sm font-medium text-secondary-foreground">
                      For: {service.forWho}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-8 lg:p-12 bg-card/50 border-t lg:border-t-0 lg:border-l border-border">
                  <h4 className="font-semibold text-lg mb-6">What We Do</h4>
                  <ul className="space-y-4">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-card/50 border-t border-border">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4" data-testid="text-services-cta">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Let's discuss your property or investment goals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sell">
            <Button size="lg" data-testid="button-services-sell">
              Sell a Property
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/invest">
            <Button size="lg" variant="outline" data-testid="button-services-invest">
              Invest With Us
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="secondary" data-testid="button-services-contact">
              Talk About a Project
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
