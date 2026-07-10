import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

/**
 * Public Website v1 (issue #22) — The Pegasus Standard.
 * PRD §7.13 + COPY_DECK §15: the long-term vision page.
 *
 * THE DESCENT — the page opens with a scroll-scrubbed film: a dusk walk
 * down the founder-approved colonnade corridor (docs/design-refs/
 * corridor-dusk.png animated with Seedance, 2K master). The section
 * pins for ~3.5 screens; scrolling down IS walking in.
 *
 * Scrub architecture (the professional pattern, not frame-flipping):
 * the walk ships as an all-intra video (every frame a keyframe — CI
 * encodes H.264 for Safari and a VP9 twin for Chromium), fetched fully
 * into memory as a blob when the visitor approaches, then scroll drives
 * video.currentTime through a lerp. Decoding is hardware, off the main
 * thread, so the scrub is 30fps-smooth with zero image-decode stalls.
 * Seam transitions: the stage fades up from the navy page on entry,
 * dissolves back to navy on exit, and the copy beats drift as they
 * fade so they read as part of the scene.
 *
 * Fallbacks: reduced motion, jsdom, or any media failure ⇒ the poster
 * frame with the title beat — identical text content, no scrub.
 */

// mp4 (all-intra H.264, 1440px) is the primary everywhere; the smaller
// VP9 webm covers browsers without H.264 decode. The codec strings are
// deliberate: canPlayType("video/mp4") answers "maybe" even where H.264
// is missing, so probing must name the exact codec.
const VIDEO_SOURCES: { src: string; type: string }[] = [
  { src: "/media/walk-scrub.mp4", type: 'video/mp4; codecs="avc1.640028"' },
  { src: "/media/walk-scrub-sm.webm", type: 'video/webm; codecs="vp09.00.40.08"' },
];
const POSTER = "/images/standard/descent-poster.webp";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const meterFillRef = useRef<HTMLDivElement>(null);
  const meterNumRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // jsdom's HTMLVideoElement has no real media pipeline; canPlayType
    // returning nothing for both sources means "stay on the poster".
    if (reduceMotion || typeof video.canPlayType !== "function") return;
    const candidates = VIDEO_SOURCES.filter((s) => video.canPlayType(s.type) !== "");
    if (candidates.length === 0) return;

    let disposed = false;
    let objectUrl: string | null = null;
    let raf = 0;

    // Load a source and resolve once metadata proves it is decodable;
    // reject on error or an 8s stall so the next candidate gets a turn.
    const tryLoad = (url: string) =>
      new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          video.removeEventListener("loadedmetadata", ok);
          video.removeEventListener("error", bad);
          window.clearTimeout(timer);
        };
        const ok = () => {
          cleanup();
          resolve();
        };
        const bad = () => {
          cleanup();
          reject(new Error("decode"));
        };
        const timer = window.setTimeout(bad, 8000);
        video.addEventListener("loadedmetadata", ok, { once: true });
        video.addEventListener("error", bad, { once: true });
        video.src = url;
        video.load();
      });

    // Fetch the whole file into memory before the scrub engages so every
    // seek is a buffer hit — no network stalls mid-scroll. Kicks off when
    // the visitor gets near the section (two viewports out). Candidates
    // are tried in order until one actually decodes.
    const arm = async () => {
      for (const source of candidates) {
        if (disposed) return;
        let url = source.src;
        try {
          const res = await fetch(source.src);
          if (res.ok) {
            const blob = await res.blob();
            if (disposed) return;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            objectUrl = URL.createObjectURL(blob);
            url = objectUrl;
          }
        } catch {
          /* stream the original URL — still all-intra seekable */
        }
        try {
          await tryLoad(url);
          return; // decodable — the scrub loop takes it from here
        } catch {
          /* try the next candidate */
        }
      }
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void arm();
        }
      },
      { rootMargin: "200% 0%" },
    );
    io.observe(wrap);

    let target = 0;
    let current = -1;
    const frame = () => {
      const rect = wrap.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      target = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 1;
      const next = current < 0 ? target : current + (target - current) * 0.12;
      if (Math.abs(next - current) > 0.0003 || current < 0) {
        current = next;

        // Scrub: hardware-decoded, every frame a keyframe. Only write
        // currentTime when the delta is a visible fraction of a frame.
        if (video.readyState >= 2 && video.duration > 0) {
          const t = current * Math.max(0, video.duration - 0.05);
          if (Math.abs(t - video.currentTime) > 1 / 60) {
            video.currentTime = t;
            if (video.style.opacity !== "1") video.style.opacity = "1";
          }
        }

        // Exit seam: the walk dissolves back into the navy page.
        if (veilRef.current) {
          const exit = Math.max(0, (current - 0.94) / 0.06);
          veilRef.current.style.opacity = String(Math.min(1, exit));
        }

        // Copy beats fade AND drift so they sit in the scene.
        beatRefs.current.forEach((el, i) => {
          if (!el) return;
          const op = windowOpacity(current, BEATS[i].win);
          el.style.opacity = String(op);
          el.style.transform = `translateY(${(1 - op) * 16}px)`;
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
      io.disconnect();
      cancelAnimationFrame(raf);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative" style={{ height: "380vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#091421]">
        {/* Poster paints instantly (LCP, no-JS, reduced motion); the video
            fades over it once the blob is armed and the first seek lands. */}
        <img
          src={POSTER}
          alt="Concept render — a dusk walk down a marble colonnade hall toward the sea. Future vision imagery, not a current Pegasus property."
          className="absolute inset-0 h-full w-full object-cover"
        />
        <video
          ref={videoRef}
          muted
          playsInline
          preload="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500"
        />
        {/* Seam veil: fades from navy on page-open (CSS, once), and the
            scrub raises it again at the very end so the walk dissolves
            back into the page instead of stopping dead. */}
        <div ref={veilRef} className="descent-veil pointer-events-none absolute inset-0 bg-[#091421]" />
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
