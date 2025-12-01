import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Calendar,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Ruler,
  BedDouble,
  Bath,
  Home,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ["/api/projects", slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Project Not Found</h2>
            <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been removed.</p>
            <Link href="/projects">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
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

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link href="/projects">
          <Button variant="ghost" className="mb-6" data-testid="button-back-projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant={project.status === "completed" ? "default" : "secondary"} className="text-sm">
                  {getStatusLabel(project.status)}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {getStrategyLabel(project.strategy)}
                </Badge>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-project-name">
                {project.name}
              </h1>
              
              <div className="flex items-center gap-2 text-lg text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{project.address}, {project.city}, {project.state}</span>
              </div>
            </div>

            {project.afterImages && project.afterImages.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">After Renovation</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.afterImages.map((image, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden border border-border">
                      <img 
                        src={image} 
                        alt={`${project.name} after renovation ${index + 1}`}
                        className="w-full h-full object-cover"
                        data-testid={`img-after-${index}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.beforeImages && project.beforeImages.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Before Renovation</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.beforeImages.map((image, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden border border-border">
                      <img 
                        src={image} 
                        alt={`${project.name} before renovation ${index + 1}`}
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                        data-testid={`img-before-${index}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">About This Project</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {project.description}
              </p>
            </div>

            {project.highlights && project.highlights.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Project Highlights</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.bedrooms && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BedDouble className="w-5 h-5" />
                      <span>Bedrooms</span>
                    </div>
                    <span className="font-medium">{project.bedrooms}</span>
                  </div>
                )}
                {project.bathrooms && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Bath className="w-5 h-5" />
                      <span>Bathrooms</span>
                    </div>
                    <span className="font-medium">{project.bathrooms}</span>
                  </div>
                )}
                {project.sqft && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Ruler className="w-5 h-5" />
                      <span>Square Feet</span>
                    </div>
                    <span className="font-medium">{project.sqft.toLocaleString()}</span>
                  </div>
                )}
                {project.yearBuilt && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Home className="w-5 h-5" />
                      <span>Year Built</span>
                    </div>
                    <span className="font-medium">{project.yearBuilt}</span>
                  </div>
                )}
                {project.holdTime && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-5 h-5" />
                      <span>Timeline</span>
                    </div>
                    <span className="font-medium">{project.holdTime}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Investment Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.purchasePrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Purchase Price</span>
                    <span className="font-medium">{formatCurrency(project.purchasePrice)}</span>
                  </div>
                )}
                {project.rehabCost && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rehab Cost</span>
                    <span className="font-medium">{formatCurrency(project.rehabCost)}</span>
                  </div>
                )}
                {project.arv && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ARV</span>
                    <span className="font-medium">{formatCurrency(project.arv)}</span>
                  </div>
                )}
                {project.salePrice && (
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="text-muted-foreground">Sale Price</span>
                    <span className="font-medium text-lg">{formatCurrency(project.salePrice)}</span>
                  </div>
                )}
                {project.profit && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Profit</span>
                    <span className="font-medium text-primary text-lg">{formatCurrency(project.profit)}</span>
                  </div>
                )}
                {project.roi && (
                  <div className="flex items-center justify-between bg-primary/10 rounded-lg p-4 -mx-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="font-medium">ROI</span>
                    </div>
                    <span className="font-bold text-xl text-primary">{project.roi}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Interested in Similar Projects?</h3>
                <p className="text-muted-foreground text-sm">
                  Partner with us on our next investment opportunity and earn attractive returns.
                </p>
                <Link href="/invest">
                  <Button className="w-full" data-testid="button-invest-cta">
                    Become an Investor
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Have a Property to Sell?</h3>
                <p className="text-muted-foreground text-sm">
                  We buy properties in any condition. Get a fair cash offer today.
                </p>
                <Link href="/sell">
                  <Button variant="outline" className="w-full" data-testid="button-sell-cta">
                    Submit Your Property
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
