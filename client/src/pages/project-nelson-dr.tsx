import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, FileSearch, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardSurface } from "@/components/ui/card-primitives";
import { useSEO } from "@/hooks/use-seo";

const SECTIONS = [
  {
    title: "Situation",
    body: "East Bay residential value-add profile with enough constraint to require a structured read instead of a simple buy/list answer.",
  },
  {
    title: "Strategy",
    body: "Preserve optionality while the team verifies scope, comparable sales, rent posture, and the cleanest stabilization path.",
  },
  {
    title: "Structure",
    body: "Reviewed as a Pegasus acquisition and development file. Public numbers stay limited until the record is complete.",
  },
  {
    title: "Scope",
    body: "Rehab, systems, exterior presentation, leasing readiness, and execution sequencing are the core workstreams under review.",
  },
  {
    title: "Execution",
    body: "Contractor documentation, before/after photography, budget discipline, and milestone evidence must be clean before publication.",
  },
  {
    title: "Result",
    body: "Final result language is intentionally withheld until the project record can be published without guesswork or promotional math.",
  },
  {
    title: "Lesson",
    body: "A premium case study is proof, not theater. Pegasus publishes the file when the facts are strong enough to carry it.",
  },
];

const NELSON_JSONLD = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "Nelson Dr Pleasant Hill case file",
  about: "Pegasus Dreamscapes value-add residential acquisition",
  creator: { "@type": "Person", name: 'Paolo "Apollo" Duran' },
  publisher: { "@type": "Organization", name: "Pegasus Dreamscapes Corp." },
  inLanguage: "en",
  workStatus: "incomplete",
};

export default function NelsonDrPage() {
  useSEO({
    title: "Nelson Dr Case File",
    description:
      "Pegasus Dreamscapes East Bay case file under review. Public-safe numbers, structure, and publication boundaries.",
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
      <div className="mx-auto max-w-3xl px-6 lg:px-12">
        <Link
          href="/projects"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          data-testid="link-nelson-back"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Projects
        </Link>

        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-primary font-supporting">
          Case File · Under Review
        </p>
        <h1 className="mb-6 font-serif text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
          Nelson Dr · Pleasant Hill
        </h1>
        <p className="mb-2 text-lg leading-relaxed text-muted-foreground">
          A complex East Bay residential acquisition routed through a value-add execution path.
        </p>
        <p className="mb-12 text-base leading-relaxed text-muted-foreground/85">
          Public-safe frame: acquisition near $600K, scope near $90K-100K, projected stabilized value near $840K. No final result, profit, ROI, or guarantee is published here.
        </p>

        <CardSurface className="mb-12 p-7 sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-primary/30 bg-primary/10">
              <FileSearch className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary font-supporting">
                Publication Standard
              </p>
              <h2 className="mb-3 font-serif text-2xl text-foreground">
                The file is open. The proof is not final.
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Pegasus can show the structure before publishing the victory lap. Photos, final scope evidence, and confirmed economics stay off the public site until Apollo signs the record.
              </p>
            </div>
          </div>
        </CardSurface>

        <div className="grid gap-4">
          {SECTIONS.map((section) => (
            <section key={section.title} className="border border-border/60 bg-card/70 p-5 sm:p-6">
              <h2 className="mb-3 font-serif text-2xl font-semibold text-foreground">
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 flex items-start gap-3 border-t border-border pt-6 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <p>
            This case file is informational only. It is not an offer, appraisal, investment solicitation, guarantee, or claim of final project performance.
          </p>
        </div>

        <div className="mt-16 text-center">
          <Link href="/submit">
            <Button
              size="lg"
              className="h-12 rounded-sm bg-primary px-8 text-[12px] font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
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
