import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
import { HeroPicture } from "@/components/hero-picture";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Compass,
  Layers,
  Coins,
  Building2,
  ShieldCheck,
  Network,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { Article, LibraryBeginnerStep, LibraryGlossaryTerm } from "@shared/schema";

export const LIBRARY_CATEGORIES = [
  { key: "creative-finance", label: "Creative Finance", icon: Coins },
  { key: "development", label: "Development Strategy", icon: Building2 },
  { key: "capital", label: "Capital & Partnerships", icon: Network },
  { key: "property", label: "Property Strategy", icon: Compass },
  { key: "pegasus-standard", label: "Pegasus Standard", icon: ShieldCheck },
  { key: "marketflow", label: "MarketFlow", icon: Sparkles },
] as const;

const CATEGORIES = [
  { key: "all", label: "All", icon: Layers },
  ...LIBRARY_CATEGORIES,
];

const CATEGORY_LABEL: Record<string, string> = LIBRARY_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.key]: c.label }),
  {} as Record<string, string>,
);

export default function Education() {
  useSEO({
    title: "Strategy Library",
    description:
      "Pegasus DreamScapes Strategy Library. Real estate strategy education on creative finance, development, capital, and the Pegasus standard. Educational only, not legal, tax, or securities advice.",
    image: "https://pegasusdreamscapes.com/og/education.svg",
  });

  const readCategoryFromUrl = useCallback(() => {
    if (typeof window === "undefined") return "all";
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("category");
    if (requested && CATEGORIES.some((c) => c.key === requested)) {
      return requested;
    }
    return "all";
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>(readCategoryFromUrl);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPopState = () => setActiveCategory(readCategoryFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [readCategoryFromUrl]);

  const handleCategoryChange = useCallback((key: string) => {
    setActiveCategory(key);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (key === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", key);
    }
    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) {
      window.history.pushState(window.history.state, "", next);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <h1 className="sr-only">Pegasus Strategy Library</h1>
      <HeroSection />
      <CategoryNav active={activeCategory} onChange={handleCategoryChange} />
      <CuratedArticles active={activeCategory} />
      <BeginnerPathSection />
      <GlossarySection />
      <RemoteArticlesSection />
      <ClosingCTA />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[55vh] flex items-center overflow-hidden pt-20">
      <motion.div
        className="absolute inset-0 scale-105"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      >
        <HeroPicture
          alt="Pegasus DreamScapes Strategy Library"
          className="absolute inset-0 w-full h-full object-cover"
          priority
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/85" />

      <div className="relative z-10 w-full py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="h-px w-10 bg-primary" />
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-primary font-semibold font-supporting">
              Strategy Library
            </p>
            <div className="h-px w-10 bg-primary" />
          </motion.div>

          <motion.h1
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[0.95] tracking-[-0.02em] mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            data-testid="text-education-hero"
          >
            Learn the structures<br />
            <span className="bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
              behind every Pegasus deal.
            </span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            Plain-language explainers on creative finance, development strategy, capital, and the Pegasus standard. Educational only. Not legal, tax, or securities advice.
          </motion.p>
        </div>
      </div>
      <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

function CategoryNav({ active, onChange }: { active: string; onChange: (k: string) => void }) {
  return (
    <section className="py-10 bg-card border-b border-border/40 sticky top-20 z-30 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-wrap gap-2 justify-center" data-testid="education-category-nav">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onChange(cat.key)}
                className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs uppercase tracking-[0.18em] font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}
                data-testid={`button-category-${cat.key}`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CuratedArticles({ active }: { active: string }) {
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles/library"],
  });

  const filtered = useMemo(
    () => (active === "all" ? articles : articles.filter((a) => a.libraryCategoryKey === active)),
    [active, articles],
  );

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Core Articles</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Start where you are.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Structural reads, curated by Pegasus. Pick the one closest to your situation, then move outward.
          </p>
        </ScrollReveal>

        {isLoading ? (
          <div className="flex justify-center py-12" data-testid="curated-loading">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground" data-testid="text-no-curated">
            No articles in this category yet. Check back soon.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a, i) => {
              const label = (a.libraryCategoryKey && CATEGORY_LABEL[a.libraryCategoryKey]) || a.category;
              return (
                <motion.article
                  key={a.id}
                  className="group h-full p-7 bg-card rounded-lg border border-border/40 hover:border-primary/30 transition-all duration-300 flex flex-col"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  data-testid={`curated-article-${i}`}
                >
                  <Badge variant="outline" className="self-start mb-5 text-[10px] uppercase tracking-[0.2em] border-primary/30 text-primary">
                    {label}
                  </Badge>
                  <h3 className="font-serif text-xl font-semibold mb-3 tracking-tight">
                    {a.slug && a.published && a.featuredInLibrary ? (
                      <Link href={`/resources/${a.slug}`} className="hover:text-primary transition-colors">
                        {a.title}
                      </Link>
                    ) : (
                      a.title
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-grow">{a.excerpt}</p>
                  <div className="mt-6 pt-5 border-t border-border/40">
                    <p className="text-[11px] text-muted-foreground/80 italic leading-relaxed">
                      Have a property that may fit?{" "}
                      <Link href="/sell" className="text-primary hover:underline font-medium not-italic">
                        Start a Strategy Review →
                      </Link>
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function BeginnerPathSection() {
  const { data: steps = [], isLoading } = useQuery<LibraryBeginnerStep[]>({
    queryKey: ["/api/library/beginner-path"],
  });

  if (isLoading) return null;
  if (steps.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-card border-y border-border/40">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Beginner Path</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            New here? Read in this order.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            A short reading order that moves from doctrine to structures to applying it on a real property.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className="relative p-8 bg-background rounded-lg border border-border/40"
              data-testid={`beginner-step-${i}`}
            >
              <p className="font-serif text-6xl text-primary/15 absolute top-4 right-6 leading-none">{step.step}</p>
              <BookOpen className="w-7 h-7 text-primary mb-5" />
              <h3 className="font-serif text-xl font-semibold mb-3 tracking-tight">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GlossarySection() {
  const { data: terms = [], isLoading } = useQuery<LibraryGlossaryTerm[]>({
    queryKey: ["/api/library/glossary"],
  });

  if (isLoading) return null;
  if (terms.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Glossary</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Plain-language definitions.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            The terms you'll keep running into across our articles, intake forms, and Strategy Snapshots.
          </p>
        </ScrollReveal>

        <dl className="divide-y divide-border/40 border-y border-border/40" data-testid="education-glossary">
          {terms.map((item) => (
            <div key={item.id} className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-5">
              <dt className="font-serif text-lg font-semibold text-foreground sm:col-span-1">{item.term}</dt>
              <dd className="text-sm text-muted-foreground leading-relaxed sm:col-span-3">{item.definition}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function RemoteArticlesSection() {
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-card border-y border-border/40">
        <div className="flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (error || !articles || articles.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-card border-y border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">From the Library</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Latest published reads.
          </h2>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(0, 6).map((article, i) => (
            <Link key={article.id} href={`/resources/${article.slug}`}>
              <article
                className="h-full p-7 bg-background rounded-lg border border-border/40 hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col"
                data-testid={`remote-article-${i}`}
              >
                {article.category && (
                  <Badge variant="outline" className="self-start mb-4 text-[10px] uppercase tracking-[0.2em] border-primary/30 text-primary">
                    {article.category}
                  </Badge>
                )}
                <h3 className="font-serif text-xl font-semibold mb-3 tracking-tight line-clamp-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-grow">{article.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary font-semibold">
                  Read <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="py-28 lg:py-36 bg-background">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
        <GraduationCap className="w-12 h-12 text-primary mx-auto mb-8" />
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5" data-testid="text-education-cta">
          Have a property that may fit?
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
          Reading is one thing. A real read on a real property is the next step. Strategy Review is free, written, and routes every property to a path.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sell">
            <Button size="lg" className="gap-2" data-testid="button-education-sell">
              Start a Strategy Review
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/deal-blueprint">
            <Button size="lg" variant="outline" className="gap-2" data-testid="button-education-blueprint">
              Pegasus Deal Blueprint
            </Button>
          </Link>
        </div>
        <p className="mt-10 text-[11px] text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
          Strategy Library content follows the v1.3.1 blueprint, section 11. Educational only. Not legal, tax, securities, or permit advice.
        </p>
      </div>
    </section>
  );
}
