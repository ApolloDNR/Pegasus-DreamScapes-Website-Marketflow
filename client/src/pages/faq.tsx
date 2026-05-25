import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

type QA = { q: string; a: string };

const SECTIONS: { eyebrow: string; items: QA[] }[] = [
  {
    eyebrow: "Submitting a Property",
    items: [
      {
        q: "What kinds of properties do you review?",
        a: "Any situation where the path forward isn't obvious — deferred maintenance, distressed title, contested ownership, development potential, or creative structure. SFR through small multifamily in the East Bay and surrounding areas.",
      },
      {
        q: "Is there a fee to submit?",
        a: "No. Submissions are free. Apollo reviews every serious intake personally.",
      },
      {
        q: "How long does a review take?",
        a: "Most Strategy Snapshots are reviewed within 5 business days. If we need more information, we reach out directly — no auto-emails.",
      },
      {
        q: "Do you guarantee an offer?",
        a: "No. Every property gets a path, but not every property gets an offer. If Pegasus isn't the right fit, you'll get an honest read and, where appropriate, a referral to someone who is.",
      },
    ],
  },
  {
    eyebrow: "Working with Pegasus",
    items: [
      {
        q: "What makes Pegasus different from a regular real estate investor?",
        a: "Strategy first. We review the structural situation before we decide on a lane — acquisition, JV, creative finance, referral, or something else entirely. We don't chase properties. We design paths.",
      },
      {
        q: "Is Apollo licensed?",
        a: "Yes. Apollo Duran, DRE #02333658, operates under Keller Williams East Bay. Every transaction is under fiduciary standard.",
      },
      {
        q: "Can you help if I just want to list my property?",
        a: "Yes. If a traditional sale is the right path, we'll route you there — through our KW East Bay relationship or an appropriate referral.",
      },
      {
        q: "What is the Strategy Lab?",
        a: "A free property analysis tool that runs your inputs against 14 real estate strategies (Fix & Flip, BRRRR, ADU, Wholesale, etc.) and produces a preliminary verdict. It's a starting point, not a final answer. Apollo reviews the situation before any decisions are made.",
      },
    ],
  },
  {
    eyebrow: "MarketFlow & Network",
    items: [
      {
        q: "What is MarketFlow?",
        a: "The private deal network where reviewed opportunities, trusted operators, buyers, and capital relationships connect. It's not a public marketplace — access is by introduction.",
      },
      {
        q: "How do I get access to MarketFlow?",
        a: "Request access at /marketflow/access. Tell us who introduced you and what role you'd fill. We verify every introduction before sending an invite.",
      },
      {
        q: "I don't have an introduction. Can I still get in?",
        a: "Reach out through the contact form. If there's a fit and the timing is right, we'll figure it out.",
      },
    ],
  },
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function FAQ() {
  useSEO({
    title: "FAQ",
    description:
      "Frequently asked questions about submitting a property, working with Pegasus DreamScapes, and the MarketFlow network.",
    image: "/og/default.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-[hsl(var(--charcoal))] text-cream">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-32 pb-16">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
            Questions & Answers
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

      <section className="max-w-3xl mx-auto px-6 lg:px-12 py-16 lg:py-20 space-y-16">
        {SECTIONS.map((section) => (
          <ScrollReveal key={section.eyebrow}>
            <div data-testid={`faq-section-${slugify(section.eyebrow)}`}>
              <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
                {section.eyebrow}
              </p>
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
        ))}
      </section>
    </div>
  );
}
