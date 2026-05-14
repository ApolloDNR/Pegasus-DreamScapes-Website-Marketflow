import { useState, useMemo } from "react";
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
import type { Article } from "@shared/schema";

const CATEGORIES = [
  { key: "all", label: "All", icon: Layers },
  { key: "creative-finance", label: "Creative Finance", icon: Coins },
  { key: "development", label: "Development Strategy", icon: Building2 },
  { key: "capital", label: "Capital & Partnerships", icon: Network },
  { key: "property", label: "Property Strategy", icon: Compass },
  { key: "pegasus-standard", label: "Pegasus Standard", icon: ShieldCheck },
  { key: "marketflow", label: "MarketFlow", icon: Sparkles },
];

const CURATED_ARTICLES = [
  {
    category: "Creative Finance",
    categoryKey: "creative-finance",
    title: "What is creative finance?",
    excerpt:
      "Why most distressed properties don't need cash buyers. The four levers (terms, time, structure, position) that unlock deals traditional financing kills.",
  },
  {
    category: "Creative Finance",
    categoryKey: "creative-finance",
    title: "Seller financing explained.",
    excerpt:
      "How owner-carried notes actually work, where they protect both sides, and the variables that decide whether a seller-finance offer is real or theater.",
  },
  {
    category: "Creative Finance",
    categoryKey: "creative-finance",
    title: "What does subject-to mean?",
    excerpt:
      "Taking title subject to existing financing. What it solves, what it risks, and the disclosures and protections that have to be in place before anyone signs.",
  },
  {
    category: "Capital & Partnerships",
    categoryKey: "capital",
    title: "JV structures in real estate.",
    excerpt:
      "Equity splits, preferred returns, waterfall basics, and how decision rights get assigned when operator and capital are different people.",
  },
  {
    category: "Property Strategy",
    categoryKey: "property",
    title: "What makes an ADU opportunity valuable?",
    excerpt:
      "Lot, zoning, access, utilities, and exit. The five filters we run before an ADU project is worth designing, let alone building.",
  },
  {
    category: "Pegasus Standard",
    categoryKey: "pegasus-standard",
    title: "What is a Strategy Snapshot?",
    excerpt:
      "The free, written read every reviewed property gets. What goes in it, what doesn't, and how it leads to a Pegasus Deal Blueprint or a routed lane.",
  },
];

const BEGINNER_PATH = [
  {
    step: "01",
    title: "Start with the doctrine",
    desc: "Read 'What is creative finance?' and 'What is a Strategy Snapshot?' to understand how Pegasus reads a property before talking numbers.",
  },
  {
    step: "02",
    title: "Learn the structures",
    desc: "Move into seller financing, subject-to, and JV structures. These are the levers behind almost every Pegasus deal.",
  },
  {
    step: "03",
    title: "Apply it to a property",
    desc: "Take what you've learned and run a real situation through Strategy Review. That's where education becomes a path.",
  },
];

const GLOSSARY = [
  { term: "ARV", def: "After-Repair Value. Estimated market value of a property once renovation is complete." },
  { term: "BRRRR", def: "Buy, Rehab, Rent, Refinance, Repeat. A long-term portfolio strategy built on cash recycling." },
  { term: "DSCR Loan", def: "Debt Service Coverage Ratio loan. A rental loan qualified by the property's cash flow, not the borrower's W-2." },
  { term: "JV", def: "Joint Venture. A defined partnership between operator and capital with explicit splits and roles." },
  { term: "Seller Financing", def: "The seller acts as the lender, carrying back a note instead of receiving full cash at closing." },
  { term: "Subject-To", def: "Buyer takes title subject to the existing mortgage, which stays in the seller's name." },
  { term: "Strategy Snapshot", def: "Pegasus's free written read on a reviewed property. Educational only, not an offer." },
  { term: "Deal Blueprint", def: "Paid, in-depth structuring document for a complex property. Maps multiple lanes side-by-side." },
];

export default function Education() {
  useSEO({
    title: "Strategy Library",
    description:
      "Pegasus DreamScapes Strategy Library. Real estate strategy education on creative finance, development, capital, and the Pegasus standard. Educational only, not legal, tax, or securities advice.",
  });

  const [activeCategory, setActiveCategory] = useState<string>("all");

  return (
    <div className="min-h-screen">
      <h1 className="sr-only">Pegasus Strategy Library</h1>
      <HeroSection />
      <CategoryNav active={activeCategory} onChange={setActiveCategory} />
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
            <div className="h-px w-10 bg-copper" />
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-copper font-semibold font-supporting">
              Strategy Library
            </p>
            <div className="h-px w-10 bg-copper" />
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
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-tan to-champagne" />
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
  const filtered = useMemo(
    () => (active === "all" ? CURATED_ARTICLES : CURATED_ARTICLES.filter((a) => a.categoryKey === active)),
    [active],
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
            Six structural reads. Pick the one closest to your situation, then move outward.
          </p>
        </ScrollReveal>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground" data-testid="text-no-curated">
            No articles in this category yet. Check back soon.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a, i) => (
              <motion.article
                key={a.title}
                className="group h-full p-7 bg-card rounded-lg border border-border/40 hover:border-primary/30 transition-all duration-300 flex flex-col"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                data-testid={`curated-article-${i}`}
              >
                <Badge variant="outline" className="self-start mb-5 text-[10px] uppercase tracking-[0.2em] border-primary/30 text-primary">
                  {a.category}
                </Badge>
                <h3 className="font-serif text-xl font-semibold mb-3 tracking-tight">{a.title}</h3>
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BeginnerPathSection() {
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
            Three reads that move from doctrine to structures to applying it on a real property.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {BEGINNER_PATH.map((step, i) => (
            <div
              key={step.step}
              className="relative p-8 bg-background rounded-lg border border-border/40"
              data-testid={`beginner-step-${i}`}
            >
              <p className="font-serif text-6xl text-primary/15 absolute top-4 right-6 leading-none">{step.step}</p>
              <BookOpen className="w-7 h-7 text-primary mb-5" />
              <h3 className="font-serif text-xl font-semibold mb-3 tracking-tight">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GlossarySection() {
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
          {GLOSSARY.map((item) => (
            <div key={item.term} className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-5">
              <dt className="font-serif text-lg font-semibold text-foreground sm:col-span-1">{item.term}</dt>
              <dd className="text-sm text-muted-foreground leading-relaxed sm:col-span-3">{item.def}</dd>
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
