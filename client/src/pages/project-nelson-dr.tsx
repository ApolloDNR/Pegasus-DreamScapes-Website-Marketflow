import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { useEffect } from "react";
import { Construction, ArrowLeft } from "lucide-react";
import { CardSurface } from "@/components/ui/card-primitives";

// Empire Doctrine v1.0.1 / Addendum §6 — Nelson Dr is held behind a
// "case study coming" placeholder until real photos + founder-confirmed
// economics are signed off. The page skeleton uses the eight section H2s
// from Brief §9.1 so structure ships; bodies are intentionally empty.
//
// Public-safe economics: acquisition ~$600K, scope ~$90–100K, projected
// stabilized value ~$840K. No profit / ROI / net figures are surfaced
// publicly per Addendum §6.

// Website Brief v1.0 §9.1 — seven canonical case-study H2s.
const SECTIONS = [
  "Situation",
  "Strategy",
  "Structure",
  "Scope",
  "Execution",
  "Result",
  "Lesson",
];

const NELSON_JSONLD = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "Nelson Dr · Pleasant Hill case study",
  about: "Pegasus DreamScapes value-add residential acquisition",
  creator: { "@type": "Person", name: "Paolo \"Apollo\" Duran" },
  publisher: { "@type": "Organization", name: "Pegasus DreamScapes Corp." },
  inLanguage: "en",
  workStatus: "placeholder",
};

export default function NelsonDrPage() {
  useSEO({
    title: "Nelson Dr Case Study",
    description:
      "Pegasus DreamScapes' first documented case study from the East Bay. Real photos and final economics pending.",
    image: "/og/nelson-dr.png",
  });

  useEffect(() => {
    const id = "ld-nelson";
    let s = document.head.querySelector<HTMLScriptElement>(`#${id}`);
    if (!s) {
      s = document.createElement("script");
      s.id = id;
      s.type = "application/ld+json";
      document.head.appendChild(s);
    }
    s.text = JSON.stringify(NELSON_JSONLD);
    return () => {
      document.head.querySelector(`#${id}`)?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <Link href="/projects">
          <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6" data-testid="link-nelson-back">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </a>
        </Link>

        <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
          Case Study · Nelson Dr
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] text-foreground leading-tight mb-6">
          Nelson Dr · Pleasant Hill
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-2">
          A complex East Bay residential acquisition routed through a value-add execution path.
        </p>
        <p className="text-base text-muted-foreground/85 leading-relaxed mb-12">
          Acquisition near $600K. Scope $90–100K. Projected stabilized value near $840K.
        </p>

        <CardSurface className="p-8 sm:p-10 text-center mb-12">
          <Construction className="w-10 h-10 text-primary mx-auto mb-5" />
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-3">
            Case study coming
          </p>
          <h2 className="font-serif text-2xl text-foreground mb-3">
            Real photos and final economics pending founder approval.
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We do not publish a case study before the record is clean. The structural sections are
            queued below; each gets its body when Apollo signs off.
          </p>
        </CardSurface>

        <div className="space-y-8 opacity-75">
          {SECTIONS.map((title) => (
            <section key={title}>
              <h2 className="font-serif text-2xl font-semibold text-foreground border-b border-border pb-2 mb-3">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground italic">Coming soon.</p>
            </section>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/submit">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm"
              data-testid="button-nelson-submit"
            >
              Submit a Property
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
