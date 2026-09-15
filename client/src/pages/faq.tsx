import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { ContourLines } from "@/pegasus/primitives";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  FileText,
  Compass,
  Network,
  Target,
  Search,
  X,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { FAQ_SECTIONS } from "@shared/faq-data";
import './faq.css';

// Map each shared FAQ section to its display icon by eyebrow. The Q&A copy is
// the single source of truth in shared/faq-data.ts (also feeds the FAQPage
// JSON-LD) so the page and the structured data never drift apart.
const SECTION_ICONS: Record<string, LucideIcon> = {
  "Submitting a Property": FileText,
  "Working with Pegasus": Compass,
  "MarketFlow & Network": Network,
  Buyboxes: Target,
};

const SECTIONS = FAQ_SECTIONS.map((section) => ({
  ...section,
  icon: SECTION_ICONS[section.eyebrow] ?? FileText,
}));

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function FAQ() {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');
  const search = query.trim().toLocaleLowerCase();
  const sections = SECTIONS.map((section) => ({
    ...section,
    items: section.items.map((item, index) => ({ ...item, index })).filter((item) =>
      (topic === 'all' || topic === section.eyebrow) && `${item.q} ${item.a}`.toLocaleLowerCase().includes(search)),
  })).filter((section) => section.items.length > 0);
  const resultCount = sections.reduce((count, section) => count + section.items.length, 0);
  const totalCount = SECTIONS.reduce((count, section) => count + section.items.length, 0);
  // Mirror the single-source /faq entry in shared/seo-routes.ts so the
  // client-applied meta after hydration matches the SSR-injected tags.
  useSEO({
    title: "FAQ",
    description:
      "Straight answers on submitting a property, working with Pegasus DreamScapes, the MarketFlow network, and Buyboxes — fees, timing, and how reviews work.",
    image: "/og/default.png",
  });

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollToTarget = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    };
    const raf = requestAnimationFrame(scrollToTarget);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="faq-page min-h-screen bg-background">
      <section className="relative overflow-hidden bg-[hsl(var(--charcoal))] text-cream">
        <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[70%] text-primary opacity-[0.12] pointer-events-none" />
        <div className="faq-wrap relative pt-32 pb-16">
          <p className="text-[13px] uppercase tracking-[0.32em] text-[hsl(var(--warm-glow))] font-supporting font-semibold mb-6">
            Questions &amp; Answers
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
            Straight answers about how submissions work, what working with Pegasus
            looks like, and how the MarketFlow network operates. If your question
            isn't here, reach out through the contact form.
          </p>
        </div>
      </section>

      <div className="faq-wrap faq-layout">
        <aside className="faq-tools" aria-label="Find an answer">
          <label htmlFor="faq-search">Search the answers</label>
          <div className="faq-search-field">
            <Search aria-hidden="true" />
            <input id="faq-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try fees, timing, or Strategy Lab" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X aria-hidden="true" /></button>}
          </div>
          <div className="faq-topics" role="group" aria-label="Filter by topic">
            <button type="button" aria-pressed={topic === 'all'} onClick={() => setTopic('all')}>All questions <span>{totalCount}</span></button>
            {SECTIONS.map((section) => <button key={section.eyebrow} type="button" aria-pressed={topic === section.eyebrow} onClick={() => setTopic(section.eyebrow)}>{section.eyebrow}<span>{section.items.length}</span></button>)}
          </div>
          <p className="faq-help">Need to share your situation?</p>
          <Link href="/contact" className="faq-contact">Get in touch <ArrowRight aria-hidden="true" /></Link>
        </aside>
        <section className="faq-results" aria-label="Frequently asked questions">
          <p className="faq-result-count" role="status">{resultCount} of {totalCount} questions{search ? ` matching “${query.trim()}”` : ''}</p>
          {resultCount === 0 && <div className="faq-empty">
            <h2>No matching answers.</h2>
            <p>Try a shorter phrase or browse all the questions.</p>
            <button type="button" onClick={() => { setQuery(''); setTopic('all'); }}>Reset search and filters</button>
          </div>}
        {sections.map((section) => {
          const Icon = section.icon;
          return (
              <div
                key={section.eyebrow}
                id={slugify(section.eyebrow)}
                className="faq-section relative scroll-mt-28 lg:scroll-mt-32"
                data-testid={`faq-section-${slugify(section.eyebrow)}`}
              >
                <div className="relative flex items-center gap-4 mb-6">
                  <span className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-full border border-primary/40 bg-primary/5 text-primary">
                    <Icon className="w-5 h-5" strokeWidth={1.6} />
                  </span>
                  <div>
                    <h2 className="text-[13px] uppercase tracking-[0.2em] text-primary font-supporting font-semibold">
                      {section.eyebrow}
                    </h2>
                    <p className="text-[13px] text-muted-foreground mt-1 font-supporting">
                      {section.items.length} question{section.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="border-t border-border/60">
                  {section.items.map((item) => (
                    <AccordionItem
                      key={item.q}
                      value={`${slugify(section.eyebrow)}-${item.index}`}
                      className="border-border/60"
                    >
                      <AccordionTrigger
                        className="text-left font-serif text-lg font-medium text-foreground no-underline hover:no-underline"
                        data-testid={`faq-q-${slugify(section.eyebrow)}-${item.index}`}
                      >
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
          );
        })}
        </section>
      </div>
    </div>
  );
}
