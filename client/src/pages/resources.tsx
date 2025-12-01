import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar,
  ArrowRight,
  Loader2,
  User,
  TrendingUp,
  Home,
  Calculator,
  DollarSign,
  FileText,
  GraduationCap,
  Target,
  BarChart3,
  Lightbulb,
  CheckCircle2
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Article } from "@shared/schema";

export default function Resources() {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <InvestmentGuidesSection />
      <ArticlesGrid />
      <ToolsSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-24 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-tan/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <Badge variant="outline" className="mb-6 border-tan/30 text-tan">
          Learning Center
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 tracking-tight" data-testid="text-resources-hero">
          RESOURCES &<br /><span className="text-tan">INSIGHTS</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Master real estate investing with our comprehensive guides, market analysis, and expert insights.
        </p>
      </div>
    </section>
  );
}

function InvestmentGuidesSection() {
  const guides = [
    {
      icon: Home,
      title: "Fix & Flip Fundamentals",
      description: "Learn the basics of finding, renovating, and selling properties for profit.",
      topics: ["Finding Deals", "Renovation Planning", "Exit Strategies"],
      difficulty: "Beginner",
    },
    {
      icon: TrendingUp,
      title: "BRRRR Strategy Guide",
      description: "Master the Buy, Rehab, Rent, Refinance, Repeat method for building wealth.",
      topics: ["Cash Recycling", "Refinancing", "Portfolio Building"],
      difficulty: "Intermediate",
    },
    {
      icon: Calculator,
      title: "Deal Analysis Mastery",
      description: "Learn to analyze deals like a pro with our comprehensive calculation methods.",
      topics: ["ARV Calculation", "Repair Estimates", "ROI Analysis"],
      difficulty: "Intermediate",
    },
    {
      icon: BarChart3,
      title: "Market Analysis",
      description: "Understand market trends, identify opportunities, and make data-driven decisions.",
      topics: ["Market Cycles", "Neighborhood Analysis", "Timing"],
      difficulty: "Advanced",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-tan/5 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-tan font-medium text-sm uppercase tracking-wider">Investment Education</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6 tracking-tight" data-testid="text-guides-title">
            LEARN THE FUNDAMENTALS
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start your real estate investment journey with our structured learning guides
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide, index) => (
            <Card key={index} className="group hover:border-tan/30 transition-all duration-300" data-testid={`guide-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-tan/10 flex items-center justify-center flex-shrink-0 group-hover:bg-tan/20 transition-colors">
                    <guide.icon className="w-7 h-7 text-tan" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{guide.title}</h3>
                      <Badge variant="outline" className="text-xs border-tan/30 text-tan">
                        {guide.difficulty}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{guide.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {guide.topics.map((topic, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
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

function ArticlesGrid() {
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  if (isLoading) {
    return (
      <section className="py-20 lg:py-32">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (error || !articles || articles.length === 0) {
    return (
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-tan font-medium text-sm uppercase tracking-wider">Latest Articles</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-6 tracking-tight">
              INSIGHTS & ANALYSIS
            </h2>
          </div>
          <div className="text-center text-muted-foreground">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p>No articles available at this time. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-tan font-medium text-sm uppercase tracking-wider">Latest Articles</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6 tracking-tight" data-testid="text-articles-title">
            INSIGHTS & ANALYSIS
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with our latest market insights and investment strategies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Link key={article.id} href={`/resources/${article.slug}`}>
              <Card className="overflow-hidden group hover:border-tan/30 transition-all duration-300 cursor-pointer h-full flex flex-col" data-testid={`card-article-${index}`}>
                <div className="aspect-video relative overflow-hidden">
                  {article.imageUrl ? (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-tan/20 to-primary/10 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-tan/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {article.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-3 flex-grow">
                  <CardTitle className="text-xl line-clamp-2 group-hover:text-tan transition-colors">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="truncate">{article.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-tan font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-4 h-4" />
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

function ToolsSection() {
  const tools = [
    {
      icon: Calculator,
      title: "ARV Calculator",
      description: "Estimate after-repair value and check against the 70% rule",
      href: "/calculators",
    },
    {
      icon: TrendingUp,
      title: "ROI Calculator",
      description: "Calculate cash-on-cash returns and cap rates for investments",
      href: "/calculators",
    },
    {
      icon: DollarSign,
      title: "BRRRR Calculator",
      description: "Analyze buy, rehab, rent, refinance, repeat strategies",
      href: "/calculators",
    },
    {
      icon: BarChart3,
      title: "Cash Flow Analyzer",
      description: "Detailed monthly cash flow breakdown for rentals",
      href: "/calculators",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-tan/5 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-tan font-medium text-sm uppercase tracking-wider">Investment Tools</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4 tracking-tight" data-testid="text-tools-title">
            PROFESSIONAL CALCULATORS
          </h2>
          <p className="text-muted-foreground">
            Analyze deals with our suite of professional investment tools
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <Link key={index} href={tool.href}>
              <Card className="group hover:border-tan/30 transition-all duration-300 cursor-pointer h-full" data-testid={`tool-card-${index}`}>
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-tan/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-tan/20 transition-colors">
                    <tool.icon className="w-7 h-7 text-tan" />
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-tan transition-colors">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
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
    <section className="py-24 lg:py-32 bg-gradient-to-br from-primary/5 to-tan/5">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <GraduationCap className="w-16 h-16 text-tan mx-auto mb-6" />
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
          READY TO START INVESTING?
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Put your knowledge into action. Whether you're selling a property or looking to invest, our team is ready to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sell">
            <Button size="lg" className="gap-2 bg-tan text-tan-foreground hover:bg-tan/90" data-testid="button-resources-sell">
              <Home className="w-5 h-5" />
              Sell Your Property
            </Button>
          </Link>
          <Link href="/invest">
            <Button size="lg" variant="outline" className="gap-2" data-testid="button-resources-invest">
              <TrendingUp className="w-5 h-5" />
              Become an Investor
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
