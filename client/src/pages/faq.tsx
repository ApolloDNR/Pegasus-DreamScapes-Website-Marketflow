import { useEffect } from "react";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
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
  type LucideIcon,
} from "lucide-react";
import { FAQ_SECTIONS } from "@shared/faq-data";

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
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-[hsl(var(--charcoal))] text-cream">
        <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[70%] text-primary opacity-[0.12] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 lg:px-12 pt-32 pb-16">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
            Questions &amp; Answers
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-tight mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
            Straight answers about how submissions work, what working with Pegasus
            looks like, and how the MarketFlow network operates. If your question
            isn't here, reach out through the contact form.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 lg:px-12 py-16 lg:py-20 space-y-16 lg:space-y-20">
        {SECTIONS.map((section, si) => {
          const Icon = section.icon;
          return (
            <ScrollReveal key={section.eyebrow}>
              <div
                id={slugify(section.eyebrow)}
                className="relative scroll-mt-28 lg:scroll-mt-32"
                data-testid={`faq-section-${slugify(section.eyebrow)}`}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none select-none absolute -top-6 right-0 font-serif text-7xl sm:text-8xl leading-none text-primary/[0.07]"
                >
                  {String(si + 1).padStart(2, "0")}
                </span>

                <div className="relative flex items-center gap-4 mb-6">
                  <span className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-full border border-primary/40 bg-primary/5 text-primary">
                    <Icon className="w-5 h-5" strokeWidth={1.6} />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold">
                      {section.eyebrow}
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-1 font-supporting">
                      {section.items.length} question{section.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="border-t border-border/60">
                  {section.items.map((item, i) => (
                    <AccordionItem
                      key={item.q}
                      value={`${slugify(section.eyebrow)}-${i}`}
                      className="border-border/60"
                    >
                      <AccordionTrigger
                        className="text-left font-serif text-lg font-medium text-foreground no-underline hover:no-underline"
                        data-testid={`faq-q-${slugify(section.eyebrow)}-${i}`}
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
            </ScrollReveal>
          );
        })}
      </section>
    </div>
  );
}
