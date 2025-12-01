import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  MapPin, 
  Calendar,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";

export default function Projects() {
  return (
    <div className="min-h-screen pt-16">
      <HeroSection />
      <ProjectsGrid />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-projects-hero">
          Our Projects
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Here's a look at some of the projects we've led or collaborated on. We focus on transformations that create both visual impact and real financial results.
        </p>
      </div>
    </section>
  );
}

function ProjectsGrid() {
  const projects = [
    {
      id: 1,
      name: "Nelson Dr",
      location: "Richmond, CA",
      strategy: "Fix & Flip",
      type: "Single Family",
      beds: 3,
      baths: 2,
      status: "Completed",
      upgrades: ["Kitchen Remodel", "Bath Updates", "New Flooring", "Exterior Refresh", "Landscaping"],
      timeline: "3 Months",
      description: "Full cosmetic renovation and repositioning. Complete transformation with modern finishes and curb appeal improvements.",
    },
    {
      id: 2,
      name: "Maple Street",
      location: "Oakland, CA",
      strategy: "Fix & Flip",
      type: "Single Family",
      beds: 4,
      baths: 2,
      status: "In Progress",
      upgrades: ["Full Kitchen", "Master Bath", "ADU Conversion", "Roof Replacement"],
      timeline: "4 Months",
      description: "Major renovation including ADU conversion for additional rental income potential.",
    },
    {
      id: 3,
      name: "Bay View Duplex",
      location: "San Francisco, CA",
      strategy: "Buy & Hold",
      type: "Multi-Family",
      beds: 4,
      baths: 4,
      status: "Completed",
      upgrades: ["Unit Separation", "Kitchen Updates", "Flooring", "Paint"],
      timeline: "2 Months",
      description: "Strategic renovation of a duplex to maximize rental income with modern unit updates.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <Card key={project.id} className="overflow-hidden hover-elevate transition-all duration-300" data-testid={`card-project-${index}`}>
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-b border-border relative">
                <div className="text-center p-4">
                  <Home className="w-12 h-12 text-primary/50 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Project Image</p>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant={project.status === "Completed" ? "default" : "secondary"}>
                    {project.status}
                  </Badge>
                  <Badge variant="outline">
                    {project.strategy}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl mb-1">{project.name}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{project.location}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">{project.type}</p>
                    <p className="font-medium">{project.beds} Bed · {project.baths} Bath</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {project.upgrades.map((upgrade, i) => (
                    <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                      {upgrade}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Timeline: </span>
                    <span className="font-medium">{project.timeline}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Strategy: </span>
                    <span className="font-medium">{project.strategy}</span>
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

function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-card/50 border-t border-border">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4" data-testid="text-projects-cta">
          Interested in Our Projects?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Whether you want to sell a property or invest in our next project, we'd love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sell">
            <Button size="lg" data-testid="button-projects-sell">
              Sell a Property
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/invest">
            <Button size="lg" variant="outline" data-testid="button-projects-invest">
              Invest With Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
