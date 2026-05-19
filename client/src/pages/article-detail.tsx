import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  User,
  Loader2,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import type { Article } from "@shared/schema";
import { LIBRARY_CATEGORIES } from "@/pages/education";

marked.setOptions({ gfm: true, breaks: false });

const LIBRARY_CATEGORY_LABEL: Record<string, string> = LIBRARY_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.key]: c.label }),
  {} as Record<string, string>,
);

function renderMarkdown(content: string): string {
  const rawHtml = marked.parse(content, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "style"],
  });
}

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: ["/api/articles", slug],
    enabled: !!slug,
  });

  const isLibraryArticle = !!(article?.featuredInLibrary && article?.libraryCategoryKey);

  const { data: libraryArticles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles/library"],
    enabled: isLibraryArticle,
  });

  const sanitizedHtml = useMemo(
    () => renderMarkdown(article?.content ?? ""),
    [article?.content],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Article Not Found</h2>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Link href="/resources">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Strategy Library
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const libraryLabel =
    isLibraryArticle && article.libraryCategoryKey
      ? LIBRARY_CATEGORY_LABEL[article.libraryCategoryKey]
      : null;

  const relatedArticles = isLibraryArticle
    ? libraryArticles
        .filter(
          (a) => a.libraryCategoryKey === article.libraryCategoryKey && a.id !== article.id,
        )
        .slice(0, 3)
    : [];

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen pt-20">
      <article className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/resources">
          <Button variant="ghost" className="mb-6" data-testid="button-back-resources">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isLibraryArticle ? "Back to Strategy Library" : "Back to Resources"}
          </Button>
        </Link>

        {article.imageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden mb-8">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              data-testid="img-article-hero"
            />
          </div>
        )}

        <div className="mb-8">
          {isLibraryArticle && libraryLabel ? (
            <>
              <div className="flex items-center gap-3 mb-5" data-testid="library-kicker">
                <div className="h-px w-8 bg-primary" />
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-primary font-semibold font-supporting">
                  Strategy Library · {libraryLabel}
                </p>
              </div>
              <nav
                aria-label="Breadcrumb"
                className="mb-5 text-sm text-muted-foreground"
                data-testid="library-breadcrumb"
              >
                <ol className="flex flex-wrap items-center gap-2">
                  <li>
                    <Link
                      href="/education"
                      className="hover:text-primary transition-colors"
                      data-testid="link-breadcrumb-library"
                    >
                      Strategy Library
                    </Link>
                  </li>
                  <li aria-hidden="true" className="text-muted-foreground/60">
                    ›
                  </li>
                  <li>
                    <Link
                      href={`/education?category=${article.libraryCategoryKey}`}
                      className="hover:text-primary transition-colors"
                      data-testid="link-breadcrumb-category"
                    >
                      {libraryLabel}
                    </Link>
                  </li>
                </ol>
              </nav>
            </>
          ) : (
            <Badge variant="secondary" className="mb-4">
              {article.category}
            </Badge>
          )}

          <h1
            className={
              isLibraryArticle
                ? "font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] mb-6"
                : "text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            }
            data-testid="text-article-title"
          >
            {article.title}
          </h1>

          {article.excerpt && isLibraryArticle && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          </div>
        </div>

        <div
          className="article-prose max-w-none"
          data-testid="article-content"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />

        {isLibraryArticle ? (
          <div className="mt-14 pt-10 border-t border-border">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 sm:p-10 text-center">
                <GraduationCap className="w-10 h-10 text-primary mx-auto mb-5" />
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold tracking-[-0.01em] mb-3" data-testid="text-library-cta">
                  Have a property that may fit?
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-7 max-w-2xl mx-auto">
                  Reading is one thing. A real read on a real property is the next step. Strategy Review is free, written, and routes every property to a path.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/sell">
                    <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-library-strategy-review">
                      Start a Strategy Review
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/deal-blueprint">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-library-blueprint">
                      Pegasus Deal Blueprint
                    </Button>
                  </Link>
                </div>
                <p className="mt-7 text-[11px] text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
                  Educational only. Not legal, tax, securities, or permit advice.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mt-12 pt-8 border-t border-border">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
                    <p className="text-muted-foreground">
                      Put this knowledge into action with our deal calculators or reach out to discuss opportunities.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Link href="/calculators">
                      <Button className="w-full sm:w-auto" data-testid="button-article-calculators">
                        Use Calculators
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button variant="outline" className="w-full sm:w-auto" data-testid="button-article-contact">
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isLibraryArticle && relatedArticles.length > 0 && (
          <div className="mt-16" data-testid="related-articles">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-primary" />
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-primary font-semibold font-supporting">
                Related reads
              </p>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-[-0.01em] mb-8">
              More from {libraryLabel}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedArticles.map((a, i) => (
                <Link key={a.id} href={`/resources/${a.slug}`}>
                  <article
                    className="group h-full p-6 bg-card rounded-lg border border-border/40 hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col"
                    data-testid={`related-article-${i}`}
                  >
                    <Badge
                      variant="outline"
                      className="self-start mb-4 text-[10px] uppercase tracking-[0.2em] border-primary/30 text-primary"
                    >
                      {libraryLabel}
                    </Badge>
                    <h3 className="font-serif text-lg font-semibold mb-2 tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-grow">
                      {a.excerpt}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary font-semibold">
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
