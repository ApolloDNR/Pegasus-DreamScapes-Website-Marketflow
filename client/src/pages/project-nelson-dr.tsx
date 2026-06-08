import { Link } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { CardSurface } from "@/components/ui/card-primitives";
import { ScrollReveal } from "@/components/animations";
import { ContourLines } from "@/pegasus/primitives";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Ruler,
  Wallet,
  Hammer,
  DoorOpen,
  ShieldCheck,
} from "lucide-react";

// Nelson Dr — launch-ready proof-of-work case study.
//
// Economics: acquisition ~$600K, improvement budget $100K, finished
// exit ~$840K, settled September 2025. No net profit / ROI figures are
// surfaced — full cost basis is not published. Property photos are real
// project photography: finished/delivered "after" shots plus
// documentation-quality "before" images from the as-acquired listing
// record. No AI-generated or stand-in property imagery.
//
// Location: Richmond / El Sobrante Area, CA. Founder-confirmed public
// address: 4369 Nelson Drive, Richmond, CA 94803.

const METRICS = [
  { label: "Approx. Acquisition", value: "Around $600K" },
  { label: "Improvement Budget", value: "$100K" },
  { label: "Finished Exit", value: "Around $840K" },
  { label: "Settled", value: "September 2025" },
];

const LENS = [
  {
    icon: Compass,
    title: "Condition",
    body: "What needed to change for the home to compete in its finished market.",
  },
  {
    icon: Ruler,
    title: "Scope",
    body: "Which improvements created the most visible and functional value.",
  },
  {
    icon: Wallet,
    title: "Budget",
    body: "Where capital could be deployed with discipline, and where it could not drift.",
  },
  {
    icon: Hammer,
    title: "Execution",
    body: "What had to happen first, sequenced so the project stayed on path.",
  },
  {
    icon: DoorOpen,
    title: "Exit",
    body: "How the finished product needed to present to win buyer confidence.",
  },
];

const PIPELINE = [
  "Acquire · ~$600K",
  "Define Scope",
  "$100K Budget",
  "Execute",
  "Exit · ~$840K",
];

const TIMELINE = [
  { phase: "Acquire", note: "Secured off-market at approximately $600K — below comparable value for the condition and area." },
  { phase: "Define Scope", note: "Set a $100K improvement budget focused on kitchen, bathrooms, flooring, and finish quality — improvements that create visible value without overbuilding." },
  { phase: "Execute", note: "Ran the improvements in sequence on the defined budget, managed by the Pegasus development team." },
  { phase: "Prepare", note: "Staged and positioned the finished product for the retail market." },
  { phase: "Exit", note: "Listed, accepted, and settled at approximately $840K — September 2025." },
];

const CONTROLLED = [
  "Budget discipline",
  "Scope discipline",
  "Execution sequence",
  "Market positioning",
  "Exit readiness",
];

const NELSON_JSONLD = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "Nelson Dr — Value-Add Execution Case Study",
  about: "Pegasus DreamScapes value-add residential acquisition and retail exit",
  creator: { "@type": "Person", name: 'Paolo "Apollo" Duran' },
  publisher: { "@type": "Organization", name: "Pegasus DreamScapes Corp." },
  inLanguage: "en",
};

function Shot({
  src,
  alt,
  tag,
  className = "",
  testId,
  eager = false,
}: {
  src: string;
  alt: string;
  tag?: string;
  className?: string;
  testId?: string;
  eager?: boolean;
}) {
  return (
    <figure
      className={`relative overflow-hidden rounded-md bg-muted ${className}`}
      data-testid={testId}
    >
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="w-full h-full object-cover"
      />
      {tag && (
        <figcaption className="absolute bottom-2 left-2 inline-flex items-center rounded-sm bg-black/55 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/90 font-supporting font-semibold backdrop-blur-sm">
          {tag}
        </figcaption>
      )}
    </figure>
  );
}

// Draggable before/after comparison slider. The "delivered" image is the base
// layer; the "as-acquired" image sits on top, clipped to the left of the
// divider. A native range input drives the divider so the control is fully
// keyboard, touch, and pointer accessible (and inherits the global focus ring).
function BeforeAfter({
  before,
  after,
  beforeAlt,
  afterAlt,
  label,
  testId,
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  label: string;
  testId?: string;
}) {
  const [pos, setPos] = useState(50);
  return (
    <figure className="relative" data-testid={testId}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted select-none">
        {/* Delivered (after) — base layer */}
        <img
          src={after}
          alt={afterAlt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* As-acquired (before) — clipped to the left of the divider */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img
            src={before}
            alt={beforeAlt}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Corner labels */}
        <span className="pointer-events-none absolute top-3 left-3 inline-flex items-center rounded-sm bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/90 font-supporting font-semibold backdrop-blur-sm">
          As Acquired
        </span>
        <span className="pointer-events-none absolute top-3 right-3 inline-flex items-center rounded-sm bg-primary/90 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white font-supporting font-semibold backdrop-blur-sm">
          Delivered
        </span>

        {/* Divider + handle */}
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-0.5 w-10 h-10 rounded-full bg-white text-primary shadow-lg ring-1 ring-black/10">
            <ArrowLeft className="w-3 h-3" strokeWidth={2.2} />
            <ArrowRight className="w-3 h-3" strokeWidth={2.2} />
          </span>
        </div>

        {/* Accessible control — drives the divider. opacity-0 hides the native
            track/thumb, so a sibling overlay paints the real focus ring on
            keyboard focus (the input still also keeps the global outline). */}
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`${label}: drag to compare the as-acquired and delivered condition`}
          className="peer absolute inset-0 z-20 w-full h-full cursor-ew-resize opacity-0"
          data-testid={testId ? `${testId}-range` : undefined}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 rounded-md ring-inset ring-[hsl(var(--bronze))] peer-focus-visible:ring-2"
        />
      </div>
      <figcaption className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80 font-supporting font-semibold">
        {label}
      </figcaption>
    </figure>
  );
}

// Finished, delivered-condition interiors (real project photography).
const FINISHED_INTERIORS = [
  {
    src: "/images/nelson/nelson-kitchen-1280.jpg",
    alt: "Nelson Dr — renovated kitchen in finished, delivered condition",
    tag: "Kitchen",
  },
  {
    src: "/images/nelson/nelson-primary-bath-1280.jpg",
    alt: "Nelson Dr — renovated primary bathroom in finished, delivered condition",
    tag: "Primary bath",
  },
  {
    src: "/images/nelson/nelson-bedroom-1280.jpg",
    alt: "Nelson Dr — refreshed bedroom in finished, delivered condition",
    tag: "Bedroom",
  },
  {
    src: "/images/nelson/nelson-bath-detail-1280.jpg",
    alt: "Nelson Dr — bathroom detail in finished, delivered condition",
    tag: "Bath detail",
  },
  {
    src: "/images/nelson/nelson-hallway-1280.jpg",
    alt: "Nelson Dr — interior hallway in finished, delivered condition",
    tag: "Hallway",
  },
  {
    src: "/images/nelson/nelson-patio-1280.jpg",
    alt: "Nelson Dr — exterior patio in finished, delivered condition",
    tag: "Patio",
  },
];

// Same-space before/after pairs for the comparison sliders. Each pairs an
// as-acquired listing photo with finished project photography of the SAME
// room/space. Camera angles may differ slightly between the listing record
// and the finished shoot — this is disclosed in the section caption, and no
// AI-generated or stand-in imagery is used.
const TRANSFORMATIONS = [
  {
    label: "Exterior",
    before: "/images/nelson/nelson-before-exterior-front-1280.jpg",
    after: "/images/nelson/nelson-hero-1280.jpg",
    beforeAlt: "Nelson Dr — front exterior as acquired, from the original listing record",
    afterAlt: "Nelson Dr — front exterior in finished, delivered condition",
  },
  {
    label: "Kitchen",
    before: "/images/nelson/nelson-before-kitchen-1280.jpg",
    after: "/images/nelson/nelson-kitchen-1280.jpg",
    beforeAlt: "Nelson Dr — kitchen as acquired, from the original listing record",
    afterAlt: "Nelson Dr — renovated kitchen in finished, delivered condition",
  },
  {
    label: "Primary bath",
    before: "/images/nelson/nelson-before-bath-01-1280.jpg",
    after: "/images/nelson/nelson-primary-bath-1280.jpg",
    beforeAlt: "Nelson Dr — bathroom as acquired, from the original listing record",
    afterAlt: "Nelson Dr — renovated primary bathroom in finished, delivered condition",
  },
  {
    label: "Bedroom",
    before: "/images/nelson/nelson-before-bedroom-01-1280.jpg",
    after: "/images/nelson/nelson-bedroom-1280.jpg",
    beforeAlt: "Nelson Dr — bedroom as acquired, from the original listing record",
    afterAlt: "Nelson Dr — refreshed bedroom in finished, delivered condition",
  },
];

// As-acquired documentation from the original listing record. These record the
// property's starting condition; the comparison sliders above pair a subset of
// these with finished photography of the same spaces.
const AS_ACQUIRED = [
  {
    src: "/images/nelson/nelson-before-exterior-front-1280.jpg",
    alt: "Nelson Dr — front exterior as acquired, from the original listing record",
    tag: "Exterior",
  },
  {
    src: "/images/nelson/nelson-before-side-exterior-1280.jpg",
    alt: "Nelson Dr — side exterior as acquired, from the original listing record",
    tag: "Side",
  },
  {
    src: "/images/nelson/nelson-before-kitchen-1280.jpg",
    alt: "Nelson Dr — kitchen as acquired, from the original listing record",
    tag: "Kitchen",
  },
  {
    src: "/images/nelson/nelson-before-living-01-1280.jpg",
    alt: "Nelson Dr — living area as acquired, from the original listing record",
    tag: "Living",
  },
  {
    src: "/images/nelson/nelson-before-bath-01-1280.jpg",
    alt: "Nelson Dr — bathroom as acquired, from the original listing record",
    tag: "Bath",
  },
  {
    src: "/images/nelson/nelson-before-bedroom-01-1280.jpg",
    alt: "Nelson Dr — bedroom as acquired, from the original listing record",
    tag: "Bedroom",
  },
  {
    src: "/images/nelson/nelson-before-yard-01-1280.jpg",
    alt: "Nelson Dr — yard as acquired, from the original listing record",
    tag: "Yard",
  },
  {
    src: "/images/nelson/nelson-before-driveway-1280.jpg",
    alt: "Nelson Dr — driveway as acquired, from the original listing record",
    tag: "Driveway",
  },
];

export default function NelsonDrPage() {
  useSEO({
    title: "Nelson Dr — Value-Add Execution Case Study",
    description:
      "How Pegasus DreamScapes read a Richmond / El Sobrante Area property, defined the improvement path, controlled scope and budget, and prepared it for a stronger finished-market exit.",
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
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[hsl(var(--charcoal))] text-cream">
        <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[70%] text-primary opacity-[0.12] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-12 pt-28 pb-16">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-primary transition-colors mb-8"
            data-testid="link-nelson-back"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>

          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-5">
            Case Study · Value-Add Execution
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-tight mb-6">
            Nelson Dr
          </h1>
          <p className="text-lg sm:text-xl text-white/85 leading-relaxed max-w-2xl mb-8">
            A value-add project shaped by strategy, scope control, and disciplined
            execution — from an overlooked property to a finished retail exit.
          </p>

          <div className="flex flex-wrap gap-2 mb-10">
            {["Richmond / El Sobrante Area, CA", "Value-Add / Rehab", "Retail Exit"].map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/75 font-supporting"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/submit">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.18em] font-semibold px-7 h-12 rounded-sm w-full sm:w-auto"
                data-testid="button-nelson-review"
              >
                Start a Property Review <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/peggy">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white text-[12px] uppercase tracking-[0.18em] font-semibold px-7 h-12 rounded-sm w-full sm:w-auto"
                data-testid="button-nelson-peggy"
              >
                Talk to PeggyAI
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key numbers strip */}
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-md overflow-hidden">
            {METRICS.map((m) => (
              <div
                key={m.label}
                className="bg-background p-5 sm:p-6"
                data-testid={`metric-${m.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
              >
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/80 font-supporting font-semibold mb-2">
                  {m.label}
                </p>
                <p className="font-serif text-xl sm:text-2xl text-foreground leading-tight">
                  {m.value}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/75 mt-4 max-w-3xl leading-relaxed">
            Figures are approximate project-level figures and should be confirmed
            against final closing and project records. Past project outcomes are not
            guarantees of future results.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16 lg:py-20 space-y-20">
        {/* Photos */}
        <ScrollReveal>
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-5">
              The Property
            </p>

            {/* Hero — finished exterior, delivered condition */}
            <Shot
              src="/images/nelson/nelson-hero-1280.jpg"
              alt="Nelson Dr · 4369 Nelson Drive, Richmond — finished exterior in delivered condition"
              tag="Delivered · Exterior"
              className="aspect-[16/9] mb-4"
              testId="photo-nelson-hero"
              eager
            />

            {/* Before & After comparison sliders */}
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground/70 font-supporting font-semibold mb-3 mt-12">
              Before &amp; After — Drag to Compare
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TRANSFORMATIONS.map((t) => (
                <BeforeAfter
                  key={t.label}
                  before={t.before}
                  after={t.after}
                  beforeAlt={t.beforeAlt}
                  afterAlt={t.afterAlt}
                  label={t.label}
                  testId={`slider-nelson-${t.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-3">
              Each slider pairs an as-acquired photo from the original listing record
              with finished project photography of the same space. Camera angles may
              differ slightly between the listing record and the finished shoot. All
              images are real project photography — Pegasus does not publish
              AI-generated or stand-in property images.
            </p>

            {/* Finished interior gallery */}
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground/70 font-supporting font-semibold mb-3 mt-12">
              Inside the Finished Home
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-16">
              {FINISHED_INTERIORS.map((shot) => (
                <Shot
                  key={shot.src}
                  src={shot.src}
                  alt={shot.alt}
                  tag={shot.tag}
                  className="aspect-[4/3]"
                  testId={`photo-nelson-${shot.tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                />
              ))}
            </div>

            {/* As-acquired documentation — original listing record, not angle-matched */}
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground/70 font-supporting font-semibold mb-3">
              As-Acquired Documentation
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {AS_ACQUIRED.map((shot) => (
                <Shot
                  key={shot.src}
                  src={shot.src}
                  alt={shot.alt}
                  tag={shot.tag}
                  className="aspect-[4/3]"
                  testId={`photo-nelson-acquired-${shot.tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-3">
              These are documentation-quality photos from the property's as-acquired
              listing record, shown to record its full starting condition. Pegasus does
              not publish AI-generated or stand-in property images.
            </p>
          </div>
        </ScrollReveal>

        {/* The Situation */}
        <ScrollReveal>
          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
              The Situation
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nelson Dr was the type of property Pegasus is built to read: not simply
              "good" or "bad," but unfinished in its potential. The opportunity was not
              just the house — it was the spread between current condition, improvement
              scope, buyer expectations, and exit strategy.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The opportunity required more than a listing mindset. It needed a clear
              understanding of condition, capital exposure, and the finished exit. The
              value was not unlocked by one move. It came from sequencing the right
              moves in the right order.
            </p>
          </section>
        </ScrollReveal>

        {/* The Pegasus Read */}
        <ScrollReveal>
          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-3">
              The Pegasus Read
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              Pegasus approached Nelson Dr through one disciplined question:{" "}
              <span className="text-foreground font-medium">
                what path creates the strongest realistic outcome for this property?
              </span>{" "}
              The answer was not to overbuild or chase every possible upgrade — it was
              to focus the scope around visible value, buyer confidence, and exit
              readiness.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LENS.map((item) => {
                const Icon = item.icon;
                return (
                  <CardSurface key={item.title} className="p-5">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-primary/40 bg-primary/5 text-primary mb-4">
                      <Icon className="w-5 h-5" strokeWidth={1.6} />
                    </span>
                    <h3 className="font-serif text-lg text-foreground mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.body}
                    </p>
                  </CardSurface>
                );
              })}
            </div>
          </section>
        </ScrollReveal>

        {/* Deal Architecture diagram */}
        <ScrollReveal>
          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-6">
              The Deal Architecture
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-stretch gap-2">
              {PIPELINE.map((step, i) => (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div className="flex-1 rounded-md border border-border bg-muted/40 px-4 py-5 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-supporting mb-1">
                      Step {i + 1}
                    </p>
                    <p className="font-serif text-lg text-foreground">{step}</p>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mx-auto rotate-90 sm:rotate-0" />
                  )}
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Timeline */}
        <ScrollReveal>
          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-6">
              The Execution Path
            </h2>
            <ol className="relative border-l border-border ml-2 space-y-6">
              {TIMELINE.map((t, i) => (
                <li key={t.phase} className="ml-6">
                  <span className="absolute -left-[9px] flex items-center justify-center w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                    {i + 1}
                  </span>
                  <h3 className="font-serif text-lg text-foreground leading-none mb-1">
                    {t.phase}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t.note}</p>
                </li>
              ))}
            </ol>
          </section>
        </ScrollReveal>

        {/* Outcome */}
        <ScrollReveal>
          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
              The Outcome
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The result was a clean value-add execution path: acquire at the right
              basis, improve the property with a controlled scope, and position the
              finished product for a stronger exit. On a project level, the asset was
              acquired around $600K, improved with a $100K budget, and exited around
              $840K, settling in September 2025.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Nelson Dr is not presented as a promise that every property can produce
              the same result. It is proof of process: Pegasus reads the asset, studies
              the path, and executes with discipline.
            </p>
          </section>
        </ScrollReveal>

        {/* What Pegasus controlled */}
        <ScrollReveal>
          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-6">
              What Pegasus Controlled
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONTROLLED.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-4 py-3"
                >
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* What this proves */}
        <ScrollReveal>
          <CardSurface className="p-8 sm:p-10 bg-muted/30">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              What This Demonstrates
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Some properties are not obvious wins at first glance. Some need the right
              scope, the right capital plan, or the right exit. Some need someone to
              architect the deal before the market sees the finished version. That is
              where Pegasus DreamScapes operates — in the architecture of the path, not
              just the purchase.
            </p>
          </CardSurface>
        </ScrollReveal>

        {/* CTA band */}
        <ScrollReveal>
          <section className="text-center py-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-3">
              Have a property with hidden value?
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
              Whether the property is distressed, dated, inherited, underused, or simply
              unclear in its next move, Pegasus can review the situation and help
              identify the path.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/submit">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm w-full sm:w-auto"
                  data-testid="button-nelson-submit"
                >
                  Start a Property Review <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/peggy">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm w-full sm:w-auto"
                  data-testid="button-nelson-peggy-footer"
                >
                  Talk to PeggyAI
                </Button>
              </Link>
            </div>
          </section>
        </ScrollReveal>

        {/* Disclaimer */}
        <ScrollReveal>
          <section className="border-t border-border pt-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground/70 font-supporting font-semibold mb-3">
              Case Study Disclaimer
            </p>
            <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3" data-testid="text-nelson-address">
              Property: 4369 Nelson Drive, Richmond, CA 94803 (Richmond / El Sobrante
              Area). Settled September 2025.
            </p>
            <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3">
              This case study is provided for informational and illustrative purposes
              only. Project figures are approximate unless otherwise stated and may
              exclude certain transaction costs, financing costs, holding costs,
              commissions, taxes, insurance, legal fees, accounting treatment, and other
              project-specific expenses.
            </p>
            <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3">
              Past project outcomes are not guarantees of future results. Every property,
              market, seller situation, capital structure, construction scope, timeline,
              and exit path is different. Pegasus DreamScapes reviews opportunities on a
              case-by-case basis, and any acquisition, partnership, listing, referral,
              JV, or disposition path is subject to underwriting, diligence, written
              agreement, and applicable law.
            </p>
            <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3">
              Pegasus DreamScapes does not provide legal, tax, accounting, lending,
              insurance, appraisal, engineering, architectural, or securities advice.
              Visitors should consult the appropriate licensed professionals before
              making decisions.
            </p>
            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              Licensed real estate representation, when applicable, is provided by Paolo
              "Apollo" Duran, California real estate salesperson, DRE #02333658, through
              Keller Williams Realty East Bay. Pegasus DreamScapes is not currently
              presented as its own real estate brokerage.
            </p>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
