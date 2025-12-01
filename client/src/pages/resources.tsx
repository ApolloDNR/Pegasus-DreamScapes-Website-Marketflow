import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar,
  ArrowRight,
  Loader2,
  User
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Article } from "@shared/schema";

export default function Resources() {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <ArticlesGrid />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-resources-hero">
          Resources & Insights
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Learn about real estate investing, market trends, and strategies to help you make informed decisions.
        </p>
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
      <section className="py-20 lg:py-32 border-t border-border">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (error || !articles || articles.length === 0) {
    return (
      <section className="py-20 lg:py-32 border-t border-border">
        <div className="text-center text-muted-foreground">
          No articles available at this time. Check back soon!
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
    <section className="py-20 lg:py-32 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Link key={article.id} href={`/resources/${article.slug}`}>
              <Card className="overflow-hidden hover-elevate transition-all duration-300 cursor-pointer h-full flex flex-col" data-testid={`card-article-${index}`}>
                <div className="aspect-video relative overflow-hidden">
                  {article.imageUrl ? (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary/50" />
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
                  <CardTitle className="text-xl line-clamp-2">{article.title}</CardTitle>
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
                    <span className="text-primary font-medium text-sm inline-flex items-center gap-1">
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

function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-card/50 border-t border-border">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4" data-testid="text-resources-cta">
          Ready to Take Action?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Put your knowledge to work. Use our calculators to analyze deals or reach out to discuss investment opportunities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/calculators">
            <Button size="lg" data-testid="button-resources-calculators">
              Use Deal Calculators
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/invest">
            <Button size="lg" variant="outline" data-testid="button-resources-invest">
              Become an Investor
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
