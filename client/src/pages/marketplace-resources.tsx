import { MarketplaceLayout } from "@/components/marketplace-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar,
  ArrowRight,
  Loader2,
  Calculator,
  Target,
  Lightbulb,
  MessageCircle,
  FolderOpen,
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
            Published field notes and user-controlled educational tools. Nothing here is individualized investment, legal, tax, or accounting advice.
          </p>
        </div>

        <ArticlesSection />
        <QuickTools />
      </div>
    </MarketplaceLayout>
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

  const displayArticles = !error && articles && articles.length > 0 ? articles.slice(0, 6) : [];

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Latest Articles</h2>
          <p className="text-sm text-muted-foreground">Insights and analysis from our team</p>
        </div>
        {articles && articles.length > 6 && (
          <Link href="/resources">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>

      {error ? (
        <Card className="py-12" role="status">
          <div className="mx-auto max-w-md px-6 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">Articles are unavailable right now.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The article service did not respond. No empty library is being inferred from that error.
            </p>
          </div>
        </Card>
      ) : displayArticles.length === 0 ? (
        <Card className="py-12">
          <div className="text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm">No published articles are available yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayArticles.map((article) => (
            <Link key={article.id} href={`/resources/${article.slug}`}>
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
      description: "Run illustrative calculators with inputs and assumptions you control.",
      href: "/strategy-lab?tool=calculators",
    },
    {
      icon: FolderOpen,
      title: "Property Workspace",
      description: "Resume browser-saved Strategy Lab drafts and saved conversations.",
      href: "/saved",
    },
    {
      icon: Lightbulb,
      title: "Explore Strategies",
      description: "Compare possible lanes using the property inputs you provide.",
      href: "/strategy-lab",
    },
    {
      icon: MessageCircle,
      title: "Ask Peggy",
      description: "Explore educational questions and find the appropriate next route.",
      href: "/peggy",
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
