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
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import type { Article } from "@shared/schema";

export default function Resources() {
  const [location] = useLocation();
  const isEducation = location.startsWith("/education");
  useSEO({
    title: isEducation ? "Education" : "Resources",
    description: isEducation
      ? "Strategy education for sellers, investors, and operators. Frameworks, calculators, and case-study walkthroughs from Pegasus DreamScapes Corp."
      : "Articles, guides, and tools for navigating complex real estate. Strategy-first resources from Pegasus DreamScapes Corp.",
    image: `https://pegasusdreamscapes.com/og/${isEducation ? "education" : "resources"}.svg`,
  });
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
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
            Strategy Library · Educational only
          </p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
        </div>
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] mb-6 leading-[0.98]" data-testid="text-resources-hero">
          The strategy work,<br />
          <span className="italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
            written down.
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The frameworks, structural reads, and worked examples we use inside Pegasus. Not advice. Not a sales funnel. The library you actually wanted.
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
    <section className="py-20 lg:py-28 bg-primary/5 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-primary" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
              Strategy Education · Beginner to Advanced
            </p>
            <span className="h-px w-8 bg-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]" data-testid="text-guides-title">
            <span className="block">Learn the fundamentals.</span>
            <span className="block italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
              Then earn the next move.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mt-6 leading-relaxed">
            Structured guides that walk through the real strategy work: how to read a deal, where the math breaks, and the questions to ask before you commit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide, index) => (
            <Card key={index} className="group hover:border-primary/30 transition-all duration-300" data-testid={`guide-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <guide.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{guide.title}</h3>
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
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
        <div className="flex flex-col items-center justify-center gap-5">
          <div className="relative h-10 w-10" role="status" aria-label="Loading">
            <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
            Loading the field notes…
          </p>
        </div>
      </section>
    );
  }

  if (error || !articles || articles.length === 0) {
    return (
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-primary" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                Strategy Library · Field Notes
              </p>
              <span className="h-px w-8 bg-primary" />
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              <span className="block">Insights and analysis.</span>
              <span className="block italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
                Coming soon.
              </span>
            </h2>
          </div>
          <div className="text-center text-muted-foreground max-w-md mx-auto">
            <BookOpen className="w-12 h-12 mx-auto mb-5 text-primary/40" />
            <p className="text-base leading-relaxed">The first field notes are being written. Check back shortly, or start a Strategy Review on a real situation.</p>
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
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-primary" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
              Strategy Library · Field Notes
            </p>
            <span className="h-px w-8 bg-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]" data-testid="text-articles-title">
            <span className="block">Insights and analysis.</span>
            <span className="block italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
              Written down.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mt-6 leading-relaxed">
            The frameworks, structural reads, and worked examples we use inside Pegasus, published as field notes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Link key={article.id} href={`/resources/${article.slug}`}>
              <Card className="overflow-hidden group hover:border-primary/30 transition-all duration-300 cursor-pointer h-full flex flex-col" data-testid={`card-article-${index}`}>
                <div className="aspect-video relative overflow-hidden">
                  {article.imageUrl ? (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
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
                  <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">{article.title}</CardTitle>
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
                    <span className="text-primary font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
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
    <section className="py-20 lg:py-28 bg-primary/5 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-primary" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
              Operator Tools · No Signup
            </p>
            <span className="h-px w-8 bg-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]" data-testid="text-tools-title">
            <span className="block">Operator-grade calculators.</span>
            <span className="block italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
              Free to use.
            </span>
          </h2>
          <p className="text-base text-muted-foreground mt-5 leading-relaxed">
            Run the numbers the way Pegasus runs them. ARV, BRRRR, cash-flow, ROI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <Link key={index} href={tool.href}>
              <Card className="group hover:border-primary/30 transition-all duration-300 cursor-pointer h-full" data-testid={`tool-card-${index}`}>
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <tool.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
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
    <section className="py-24 lg:py-32 bg-gradient-to-br from-primary/5 to-primary/5">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <GraduationCap className="w-12 h-12 text-primary mx-auto mb-6" />
        <div className="inline-flex items-center gap-3 mb-5">
          <span className="h-px w-8 bg-primary" />
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
            From Reading to Doing
          </p>
          <span className="h-px w-8 bg-primary" />
        </div>
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
          <span className="block">Bring us a real situation.</span>
          <span className="block italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
            We will read it like operators.
          </span>
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Put what you read into action. Whether the next move is a sale, a structure, or a capital relationship, we will tell you straight.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sell">
            <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-resources-sell">
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
