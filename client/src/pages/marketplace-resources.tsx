import { MarketplaceLayout } from "@/components/marketplace-layout";
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
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Article } from "@shared/schema";

export default function MarketplaceResources() {
  return (
    <MarketplaceLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold" data-testid="text-marketplace-resources">
              Resources & Learning
            </h1>
          </div>
          <p className="text-muted-foreground">
            Master real estate investing with guides, market analysis, and expert insights
          </p>
        </div>

        <InvestmentGuides />
        <ArticlesSection />
        <QuickTools />
      </div>
    </MarketplaceLayout>
  );
}

function InvestmentGuides() {
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
      description: "Learn to analyze deals like a pro with comprehensive calculation methods.",
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
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Investment Guides</h2>
          <p className="text-sm text-muted-foreground">Structured learning for real estate success</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map((guide, index) => (
          <Card key={index} className="hover-elevate cursor-pointer" data-testid={`guide-card-${index}`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <guide.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold">{guide.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {guide.difficulty}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{guide.description}</p>
                  <div className="flex flex-wrap gap-1.5">
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
    </section>
  );
}

function ArticlesSection() {
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { 
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const displayArticles = articles && articles.length > 0 ? articles.slice(0, 6) : [];

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Latest Articles</h2>
          <p className="text-sm text-muted-foreground">Insights and analysis from our team</p>
        </div>
        {articles && articles.length > 6 && (
          <Link href="/library">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>

      {displayArticles.length === 0 ? (
        <Card className="py-12">
          <div className="text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm">No articles available yet. Check back soon!</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayArticles.map((article) => (
            <Link key={article.id} href={`/library/${article.slug}`}>
              <Card className="h-full hover-elevate cursor-pointer" data-testid={`article-card-${article.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(article.publishedAt)}</span>
                    {article.category && (
                      <>
                        <span>-</span>
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                      </>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function QuickTools() {
  const tools = [
    {
      icon: Calculator,
      title: "Deal Calculators",
      description: "ARV, ROI, BRRRR, Cash Flow, and Wholesale calculators",
      href: "/marketflow/calculators",
      internal: true,
    },
    {
      icon: Target,
      title: "Property Analysis",
      description: "Deep dive into property metrics and comparables",
      href: "/marketflow/discover",
      internal: true,
    },
    {
      icon: Lightbulb,
      title: "Investment Strategies",
      description: "Compare different approaches to real estate investing",
      href: "/marketflow/discover",
      internal: true,
    },
    {
      icon: GraduationCap,
      title: "Ask Peggy AI",
      description: "Get answers to your real estate investing questions",
      href: "#peggy",
      internal: true,
    },
  ];

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Quick Tools</h2>
          <p className="text-sm text-muted-foreground">Helpful resources at your fingertips</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool, index) => (
          <Link key={index} href={tool.href}>
            <Card className="h-full hover-elevate cursor-pointer" data-testid={`tool-card-${index}`}>
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <tool.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{tool.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
