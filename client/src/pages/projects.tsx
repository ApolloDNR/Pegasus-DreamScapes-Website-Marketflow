import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  MapPin, 
  Calendar,
  TrendingUp,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

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
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  if (isLoading) {
    return (
      <section className="py-20 lg:py-32 border-t border-border">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (error || !projects) {
    return (
      <section className="py-20 lg:py-32 border-t border-border">
        <div className="text-center text-muted-foreground">
          Unable to load projects. Please try again later.
        </div>
      </section>
    );
  }

  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case "fix-flip": return "Fix & Flip";
      case "buy-hold": return "Buy & Hold";
      default: return strategy;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "active": return "In Progress";
      default: return status;
    }
  };

  return (
    <section className="py-20 lg:py-32 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <Link key={project.id} href={`/projects/${project.slug}`}>
              <Card className="overflow-hidden hover-elevate transition-all duration-300 cursor-pointer h-full" data-testid={`card-project-${index}`}>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                  {project.afterImages && project.afterImages.length > 0 ? (
                    <img 
                      src={project.afterImages[0]} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-4">
                        <Home className="w-12 h-12 text-primary/50 mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">Project Image</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant={project.status === "completed" ? "default" : "secondary"}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                      {getStrategyLabel(project.strategy)}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl mb-1">{project.name}</CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{project.city}, {project.state}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {project.bedrooms && project.bathrooms && (
                        <>
                          <p className="text-muted-foreground">Single Family</p>
                          <p className="font-medium">{project.bedrooms} Bed · {project.bathrooms} Bath</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed line-clamp-2">{project.description}</p>
                  
                  {project.highlights && project.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.highlights.slice(0, 4).map((highlight, i) => (
                        <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                          {highlight}
                        </span>
                      ))}
                      {project.highlights.length > 4 && (
                        <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                          +{project.highlights.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-4 border-t border-border">
                    {project.holdTime && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Timeline: </span>
                        <span className="font-medium">{project.holdTime}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Strategy: </span>
                      <span className="font-medium">{getStrategyLabel(project.strategy)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-primary font-medium text-sm inline-flex items-center gap-1">
                      View Project Details <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
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
