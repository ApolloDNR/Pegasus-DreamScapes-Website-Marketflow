import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

/**
 * Public Website v1 (issue #22) — The Pegasus Standard.
 * PRD §7.13 + COPY_DECK §15: the long-term vision page.
 *
 * THE DESCENT — the page opens with a scroll-scrubbed film sequence:
 * 48 frames of a blue-hour walk through a Hellenic Modern colonnade
 * (real Seedance footage generated for the Pegasus brand world, frames
 * vendored at /images/standard/descent/). The section pins for ~3.5
 * screens; scrolling down IS walking in. Copy beats fade through as the
 * walk advances, and a persistent label keeps the §18 non-negotiable
 * honest: this is concept imagery for a future vision, never current
 * inventory.
 *
 * Motion runs on refs + one rAF loop with lerp easing. Environments
 * that can't paint (jsdom), and visitors who prefer reduced motion,
 * get the first frame as a static hero with the title beat visible —
 * identical text content, no scrub.
 */

// 120 frames (fps 12) of the founder-approved corridor walk
// (docs/design-refs/corridor-dusk.png animated forward with Seedance;
// frames vendored by .github/workflows/fetch-standard-walk.yml). The
// scrub also alpha-blends adjacent frames at fractional positions, so
// the walk reads as continuous motion rather than stepped frames.
const FRAME_COUNT = 120;
const frameSrc = (i: number) =>
  `/images/standard/descent/f-${String(i + 1).padStart(3, "0")}.webp`;

// Copy beats along the walk. [start, end] are scroll-progress windows;
// the first beat starts visible, the last holds to the end.
const BEATS: { label: string; title: string; body: string; win: [number, number] }[] = [
  {
    label: "Future vision · long-term development direction",
    title: "The Pegasus Standard",
    body: "A future living standard shaped by beauty, durability, calm, nature, and human flourishing.",
    win: [-1, 0.24],
  },
  {
    label: "The Architecture",
    title: "Hellenic Modern / Classical Mediterranean.",
    body: "Pale limestone, ivory plaster, travertine, simplified Greek-style columns, courtyards, colonnades, olive and cypress, fountains and water channels.",
    win: [0.3, 0.52],
  },
  {
    label: "The Feeling",
    title: "Cool stone. Warm light. Moving water.",
    body: "Natural shade. Fresh airflow. Quiet focus. Grounded living.",
    win: [0.58, 0.78],
  },
  {
    label: "The idea underneath",
    title: "Eudaimonia — human flourishing.",
    body: "For Pegasus, it means real estate should help people live better — not just occupy space.",
    win: [0.84, 2],
  },
];

function windowOpacity(p: number, [a, b]: [number, number], fade = 0.07): number {
  const rise = (p - a) / fade;
  const fall = (b - p) / fade;
  return Math.max(0, Math.min(1, rise, fall));
}

function Descent() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const meterFillRef = useRef<HTMLDivElement>(null);
  const meterNumRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ctx || reduceMotion) return; // static hero fallback stays

    // Progressive preload: the base <img> already shows frame 1; fetch the
    // rest in the background and draw whatever is loaded nearest.
    const frames: (HTMLImageElement | null)[] = Array(FRAME_COUNT).fill(null);
    let disposed = false;
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = frameSrc(i);
      img.onload = () => {
        if (!disposed) frames[i] = img;
      };
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sizeCanvas = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
    };
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    let target = 0;
    let current = -1;
    let paintedFi = -1;
    let raf = 0;

    // Nearest loaded frame at or below idx, so preload gaps never flash.
    const loadedAt = (idx: number): HTMLImageElement | null => {
      for (let i = idx; i >= 0; i--) if (frames[i]) return frames[i];
      return null;
    };
    const drawCover = (img: HTMLImageElement, alpha: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      ctx.globalAlpha = 1;
    };
    // Fractional-position paint: base frame + the next frame blended on
    // top by the fractional part. This is what makes the walk smooth.
    const paint = (fi: number) => {
      const i0 = Math.min(FRAME_COUNT - 1, Math.floor(fi));
      const i1 = Math.min(FRAME_COUNT - 1, i0 + 1);
      const frac = fi - i0;
      const a = loadedAt(i0);
      if (!a) return;
      drawCover(a, 1);
      const b = frames[i1];
      if (b && b !== a && frac > 0.02) drawCover(b, frac);
      canvas.style.opacity = "1";
    };

    const frame = () => {
      const rect = wrap.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      target = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 1;
      const next = current < 0 ? target : current + (target - current) * 0.14;
      if (Math.abs(next - current) > 0.0003 || paintedFi < 0) {
        current = next;
        const fi = current * (FRAME_COUNT - 1);
        if (Math.abs(fi - paintedFi) > 0.02) {
          paint(fi);
          paintedFi = fi;
        }
        // Copy beats + descent meter
        beatRefs.current.forEach((el, i) => {
          if (el) el.style.opacity = String(windowOpacity(current, BEATS[i].win));
        });
        if (meterFillRef.current) meterFillRef.current.style.height = `${current * 100}%`;
        if (meterNumRef.current) {
          let z = 0;
          BEATS.forEach((b, i) => {
            if (current >= b.win[0]) z = i;
          });
          meterNumRef.current.textContent = `0${z + 1}`;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", sizeCanvas);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative" style={{ height: "380vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Base frame: real <img> so the page has a hero even before JS,
            for reduced motion, and for the LCP. The canvas paints over it. */}
        <img
          src={frameSrc(0)}
          alt="Concept render — a dusk walk down a marble colonnade hall toward the sea. Future vision imagery, not a current Pegasus property."
          className="absolute inset-0 h-full w-full object-cover"
        />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-0"
        />
        {/* Legibility scrims */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#091421]/90 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#091421]/95 via-[#091421]/40 to-transparent" />

        {/* §18 non-negotiable: the vision is labeled the entire time. */}
        <p className="absolute inset-x-0 top-24 z-10 px-6 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#e8ded0]/80 [text-shadow:0_1px_12px_rgba(5,14,24,0.85)]">
          Future vision · concept imagery — not current inventory
        </p>

        {/* Copy beats */}
        {BEATS.map((b, i) => (
          <div
            key={b.label}
            ref={(el) => {
              beatRefs.current[i] = el;
            }}
            className="absolute inset-x-0 bottom-[14vh] z-10 px-6 text-center"
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c8915b]">
              {b.label}
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-[1.06] text-[#f4efe6] sm:text-6xl [text-shadow:0_2px_24px_rgba(5,14,24,0.85)]">
              {b.title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[#e8ded0]/85 sm:text-[17px] [text-shadow:0_1px_14px_rgba(5,14,24,0.9)]">
              {b.body}
            </p>
          </div>
        ))}
        {/* The first beat is the page's h1 for structure/SEO */}
        <h1 className="sr-only">The Pegasus Standard</h1>

        {/* Descent meter */}
        <div className="absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-3 sm:flex">
          <span ref={meterNumRef} className="font-serif text-lg text-[#c8915b] tabular-nums">01</span>
          <div className="relative h-28 w-px bg-[#e8ded0]/20">
            <div ref={meterFillRef} className="absolute left-0 top-0 w-px bg-[#c8915b]" style={{ height: "0%" }} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#e8ded0]/50">04</span>
        </div>
      </div>
    </div>
  );
}

const ARCHITECTURE = [
  "Pale limestone", "Ivory plaster", "Travertine", "Simplified Greek-style columns",
  "Flat rooflines", "Courtyards", "Colonnades", "Pergolas", "Olive trees",
  "Cypress trees", "Fountains", "Water channels", "Fire bowls", "Open-air living",
];

const COMMUNITY = [
  "Walkable paths", "Courtyards", "Small plazas", "Shared gardens",
  "Homes with identity", "Beauty without chaos", "Density with dignity",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8915b] mb-4">
      {children}
    </p>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#b47645]/40 px-4 py-2 text-[13px] text-[#e8ded0]">
      {children}
    </span>
  );
}

export default function PegasusStandardPage() {
  return (
    <main className="min-h-screen bg-[#091421] text-[#f4efe6]">
      {/* the descent — scrolling down is walking in */}
      <Descent />

      {/* eudaimonia, in full */}
      <section className="px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>Eudaimonia</SectionLabel>
          <p className="font-serif text-2xl sm:text-3xl leading-relaxed">
            <span className="text-[#c8915b]">Eudaimonia</span> means human flourishing. For
            Pegasus, it means real estate should help people live better — not just occupy space.
          </p>
        </div>
      </section>

      {/* the architecture */}
      <section className="border-t border-white/10 px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>The Architecture</SectionLabel>
          <h2 className="font-serif text-3xl sm:text-4xl mb-6">Hellenic Modern / Classical Mediterranean.</h2>
          <div className="flex flex-wrap gap-3">
            {ARCHITECTURE.map((a) => <Pill key={a}>{a}</Pill>)}
          </div>
        </div>
      </section>

      {/* the community standard */}
      <section className="border-t border-white/10 bg-[#0d1b2a] px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>The Community Standard</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMMUNITY.map((c) => (
              <div key={c} className="rounded-lg border border-white/10 bg-white/[0.03] px-6 py-5 text-[15px] text-[#e8ded0]/90">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* the business bridge */}
      <section className="border-t border-white/10 px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel>The Business Bridge</SectionLabel>
          <p className="font-serif text-2xl sm:text-3xl leading-relaxed">
            Today Pegasus builds the foundation through acquisitions, development, dispositions,
            and asset management. Long term, those capabilities compound into better homes,
            neighborhoods, and communities.
          </p>
          <p className="mt-8 text-[13px] uppercase tracking-[0.18em] text-[#e8ded0]/45">
            Future vision — not current inventory, not an active development
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="/submit-property"
              className="inline-flex items-center gap-2 rounded-md bg-[#b47645] px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#8b5a36] transition-colors">
              Submit a Property <ArrowRight className="h-4 w-4" />
            </a>
            <a href="/marketflow"
              className="inline-flex items-center gap-2 rounded-md border border-[#b47645]/60 px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#e8ded0] hover:border-[#b47645] transition-colors">
              Explore Pegasus Opportunities
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
