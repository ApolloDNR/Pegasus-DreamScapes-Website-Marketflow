import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Palette, 
  Home,
  Layers,
  Ruler,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function Dreamspace() {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <WhatWeDoSection />
      <DesignProcessSection />
      <GallerySection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <span className="text-primary font-medium text-sm uppercase tracking-wide">Design Studio</span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 mb-6" data-testid="text-dreamspace-hero">
          Dreamspace Studio
          <span className="block text-primary">Design That Sells & Rents</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          We design interiors with investors and resale in mind—warm, modern, and market-ready.
        </p>
      </div>
    </section>
  );
}

function WhatWeDoSection() {
  const services = [
    {
      icon: Palette,
      title: "Finish & Material Selections",
      description: "Curated palettes of flooring, countertops, fixtures, and finishes that maximize appeal and value.",
    },
    {
      icon: Layers,
      title: "Mood Boards & Concepts",
      description: "Visual concepts that align design vision with market expectations and budget constraints.",
    },
    {
      icon: Ruler,
      title: "Layout Optimization",
      description: "Strategic layout tweaks for better flow, functionality, and perceived space.",
    },
    {
      icon: Home,
      title: "Staging Guidance",
      description: "Recommendations for staging that highlights the property's best features for photos and showings.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Our Services</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-dreamspace-services">
            What We Do
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="hover-elevate transition-all duration-300" data-testid={`card-design-service-${index}`}>
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{service.description}</p>
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

function DesignProcessSection() {
  const steps = [
    {
      step: "01",
      title: "Discovery Call",
      description: "We discuss your property, goals, budget, and timeline to understand your needs.",
    },
    {
      step: "02",
      title: "Concept Development",
      description: "We create mood boards and design concepts tailored to your property and target market.",
    },
    {
      step: "03",
      title: "Material Selection",
      description: "We curate specific materials, fixtures, and finishes within your budget.",
    },
    {
      step: "04",
      title: "Execution Support",
      description: "We provide guidance during renovation and coordinate with contractors as needed.",
    },
  ];

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Our Process</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-design-process">
            How We Work
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center" data-testid={`step-design-${index}`}>
              <div className="text-6xl font-bold text-primary/10 mb-4">{step.step}</div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  const projects = [
    { title: "Modern Kitchen", category: "Kitchen" },
    { title: "Spa-Like Bath", category: "Bathroom" },
    { title: "Open Living", category: "Living Room" },
    { title: "Cozy Bedroom", category: "Bedroom" },
    { title: "Curb Appeal", category: "Exterior" },
    { title: "Dining Space", category: "Dining" },
  ];

  return (
    <section className="py-20 lg:py-32 bg-card/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Portfolio</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-design-gallery">
            Design Showcase
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div 
              key={index} 
              className="aspect-[4/3] rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border hover-elevate transition-all duration-300 cursor-pointer"
              data-testid={`gallery-item-${index}`}
            >
              <div className="text-center p-4">
                <Palette className="w-10 h-10 text-primary/50 mx-auto mb-2" />
                <p className="font-medium">{project.title}</p>
                <p className="text-sm text-muted-foreground">{project.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const benefits = [
    "Design-driven approach to renovations",
    "Market-focused material selections",
    "Budget-conscious recommendations",
    "Full project coordination available",
  ];

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wide">Work With Us</span>
            <h2 className="text-3xl sm:text-4xl font-semibold mt-2 mb-6" data-testid="text-dreamspace-cta">
              Ready to Transform Your Property?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Whether you're flipping a property or upgrading a rental, our design services help you maximize value and appeal.
            </p>
            <ul className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Link href="/contact">
              <Button size="lg" data-testid="button-dreamspace-contact">
                Schedule a Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border">
            <div className="text-center p-8">
              <Palette className="w-16 h-16 text-primary/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Design Studio</p>
              <p className="text-sm text-muted-foreground/70">Dreamspace Studio</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
