import React, { useEffect, useRef } from 'react';

/* ================================================================
   THE DEAL ROUTING BOARD — PRD §6.2-3 (issue #22)
   The PRD's visual direction for the Deal Engine: a premium routing
   diagram, bronze tracks on dark navy, an opportunity as a small
   marble sphere traveling the routed path. The board is pinned for
   ~2.5 screens while scroll scrubs the journey:

     Submit → Review → Structure → Route  (the spine)
       ↳ then down through the four department rails — a colonnade —
         Acquisitions → Development → Dispositions
     → Execute → Exit / Hold

   Asset Management's rail stays visibly on the board but unlit on
   this pass ("when the hold is the strategy"), which is honest: not
   every deal takes every rail. All labels are real HTML text.

   Motion notes: the scrub runs on refs + direct DOM writes inside a
   single rAF loop (no per-frame React state), eased with a lerp so it
   glides instead of stepping. If the browser can't measure SVG path
   length (jsdom), or the visitor prefers reduced motion, the board
   renders fully lit and static — same content, no scrub.
   ================================================================ */

const VB_W = 1000;
const VB_H = 1600;

// The single traveled path: spine, swing into the rails, switchback
// descent across three rails, convergence, exit.
const TRACK_D = [
  'M 500 80',
  'L 500 680',
  'C 500 770, 170 730, 170 820',
  'L 170 960',
  'C 170 1030, 390 1010, 390 1080',
  'L 390 1150',
  'C 390 1230, 610 1150, 610 1220',
  'L 610 1300',
  'C 610 1380, 500 1340, 500 1400',
  'L 500 1520',
].join(' ');

// Spine stations (the locked six-step flow) + their live captions.
const STAGES: { name: string; note: string; x: number; y: number; side: 'l' | 'r' }[] = [
  { name: 'Submit', note: 'The property comes in the door — address, condition, story.', x: 500, y: 80, side: 'r' },
  { name: 'Review', note: 'A person reads it. Numbers before adjectives.', x: 500, y: 280, side: 'l' },
  { name: 'Structure', note: 'Basis, terms, and the exit get written down.', x: 500, y: 480, side: 'r' },
  { name: 'Route', note: 'The junction. The deal takes the rails it needs.', x: 500, y: 680, side: 'l' },
  { name: 'Execute', note: 'The departments do the work they were built for.', x: 500, y: 1400, side: 'r' },
  { name: 'Exit / Hold', note: 'Sold, assigned, listed — or kept and operated.', x: 500, y: 1520, side: 'l' },
];

// The four department rails — drawn like a colonnade. The marble rides
// the first three on this pass; Asset Management stays on the board,
// unlit, with its own caption.
// labelRow staggers the rail names into two lines so the long names never
// collide at narrow widths.
const RAILS: { name: string; x: number; labelRow: 0 | 1; entry?: { x: number; y: number } }[] = [
  { name: 'Acquisitions', x: 170, labelRow: 1, entry: { x: 170, y: 820 } },
  { name: 'Development', x: 390, labelRow: 0, entry: { x: 390, y: 1080 } },
  { name: 'Dispositions', x: 610, labelRow: 1, entry: { x: 610, y: 1220 } },
  { name: 'Asset Management', x: 830, labelRow: 0 },
];
const RAIL_TOP = 820;
const RAIL_BOTTOM = 1300;

const px = (x: number) => `${(x / VB_W) * 100}%`;
const py = (y: number) => `${(y / VB_H) * 100}%`;

export function DealRoutingBoard() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const marbleRef = useRef<SVGGElement>(null);
  const stageNumRef = useRef<HTMLSpanElement>(null);
  const stageNameRef = useRef<HTMLSpanElement>(null);
  const stageNoteRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const board = boardRef.current;
    const track = trackRef.current;
    const marble = marbleRef.current;
    if (!wrap || !board || !track || !marble) return;

    // Static fallback: no measurable path (jsdom) or reduced motion.
    let totalLen = 0;
    try {
      if (typeof track.getTotalLength === 'function') totalLen = track.getTotalLength();
    } catch {
      totalLen = 0;
    }
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!totalLen || reduceMotion) return; // stays fully lit

    // Arc-length of each station / rail entry, found by sampling once.
    const targets = [
      ...STAGES.map((s) => ({ x: s.x, y: s.y })),
      ...RAILS.filter((r) => r.entry).map((r) => r.entry!),
    ];
    const lens = targets.map(() => 0);
    const dists = targets.map(() => Infinity);
    const SAMPLES = 640;
    for (let i = 0; i <= SAMPLES; i++) {
      const l = (i / SAMPLES) * totalLen;
      const pt = track.getPointAtLength(l);
      targets.forEach((t, ti) => {
        const d = (pt.x - t.x) ** 2 + (pt.y - t.y) ** 2;
        if (d < dists[ti]) {
          dists[ti] = d;
          lens[ti] = l;
        }
      });
    }
    const stageLens = lens.slice(0, STAGES.length);
    const railLens = lens.slice(STAGES.length);

    board.classList.add('is-scrubbing');
    track.style.strokeDasharray = `${totalLen}`;

    let target = 0;
    let current = -1; // force first paint
    let raf = 0;
    let lastStage = -1;

    const readScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      target = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 1;
    };

    const stations = Array.from(board.querySelectorAll<HTMLElement>('[data-station]'));
    const railEls = Array.from(board.querySelectorAll<HTMLElement>('[data-rail-lit]'));

    const frame = () => {
      readScroll();
      const next = current < 0 ? target : current + (target - current) * 0.12;
      if (Math.abs(next - current) > 0.0004) {
        current = next;
        const l = current * totalLen;
        track.style.strokeDashoffset = `${totalLen - l}`;
        const pt = track.getPointAtLength(l);
        marble.setAttribute('transform', `translate(${pt.x} ${pt.y})`);

        stations.forEach((el, i) => {
          el.classList.toggle('is-on', l >= stageLens[i] - 2);
        });
        railEls.forEach((el, i) => {
          el.classList.toggle('is-on', l >= railLens[i] - 2);
        });

        let stage = 0;
        for (let i = 0; i < stageLens.length; i++) if (l >= stageLens[i] - 2) stage = i;
        if (stage !== lastStage) {
          lastStage = stage;
          if (stageNumRef.current) stageNumRef.current.textContent = `0${stage + 1}`;
          if (stageNameRef.current) stageNameRef.current.textContent = STAGES[stage].name;
          if (stageNoteRef.current) stageNoteRef.current.textContent = STAGES[stage].note;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    // ~2.6 screens of scroll while the stage stays pinned.
    <div ref={wrapRef} className="deal-board-wrap relative mt-14" style={{ height: '260vh' }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div ref={boardRef} className="deal-board mx-auto grid w-full max-w-[1320px] items-center gap-10 px-6 lg:grid-cols-12 lg:gap-14 lg:px-12">

          {/* Live stage readout */}
          <div className="lg:col-span-4">
            <div className="pg-label !text-[9px] text-[var(--accent-bright)]">On the board</div>
            <div className="mt-5 flex items-baseline gap-4">
              <span ref={stageNumRef} className="font-serif-display text-6xl text-[var(--accent-bright)] tabular-nums lg:text-7xl">01</span>
              <span ref={stageNameRef} className="font-serif-display text-3xl text-[var(--cream)] lg:text-4xl">Submit</span>
            </div>
            <p ref={stageNoteRef} className="mt-4 min-h-[3.5rem] max-w-xs leading-relaxed text-[rgba(245,230,211,0.68)]">
              {STAGES[0].note}
            </p>
            <p className="mt-8 hidden max-w-xs text-[0.82rem] leading-relaxed text-[rgba(245,230,211,0.45)] lg:block">
              Keep scrolling — the deal rides the track. Four rails, one routed path, and the
              hold rail waiting for the deals that should be kept.
            </p>
          </div>

          {/* The board itself. The container is aspect-locked to the SVG's
              viewBox so the HTML label overlay positions line up exactly. */}
          <div className="relative mx-auto aspect-[1000/1600] h-[min(68vh,150vw)] lg:col-span-8 lg:h-[88vh]">
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <defs>
                <filter id="marble-glow" x="-120%" y="-120%" width="340%" height="340%">
                  <feGaussianBlur stdDeviation="10" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* blueprint grid */}
              {[200, 400, 600, 800].map((gx) => (
                <line key={gx} x1={gx} y1="40" x2={gx} y2={VB_H - 40} stroke="rgba(245,230,211,0.045)" strokeWidth="1" />
              ))}

              {/* the four department rails — the colonnade */}
              {RAILS.map((r) => (
                <g key={r.name}>
                  {/* abstract column capital */}
                  <line x1={r.x - 26} y1={RAIL_TOP - 18} x2={r.x + 26} y2={RAIL_TOP - 18} stroke="rgba(200,145,91,0.4)" strokeWidth="3" />
                  <line x1={r.x - 18} y1={RAIL_TOP - 8} x2={r.x + 18} y2={RAIL_TOP - 8} stroke="rgba(200,145,91,0.3)" strokeWidth="2.5" />
                  <line x1={r.x} y1={RAIL_TOP} x2={r.x} y2={RAIL_BOTTOM} stroke="rgba(245,230,211,0.14)" strokeWidth="2.5" strokeDasharray="1 7" strokeLinecap="round" />
                  {/* plinth */}
                  <line x1={r.x - 20} y1={RAIL_BOTTOM + 10} x2={r.x + 20} y2={RAIL_BOTTOM + 10} stroke="rgba(200,145,91,0.25)" strokeWidth="2.5" />
                </g>
              ))}

              {/* faint full track (the route ahead) */}
              <path d={TRACK_D} fill="none" stroke="rgba(245,230,211,0.13)" strokeWidth="2.5" />
              {/* lit track (the route traveled) — scrubbed by scroll */}
              <path ref={trackRef} d={TRACK_D} fill="none" stroke="var(--accent-bright, #d99a5b)" strokeWidth="3.5" strokeLinecap="round" className="deal-track-lit" />

              {/* junction diamond at Route */}
              <rect x="-9" y="-9" width="18" height="18" transform="translate(500 680) rotate(45)" fill="none" stroke="rgba(200,145,91,0.55)" strokeWidth="2.5" />

              {/* spine + exit stations */}
              {STAGES.map((s) => (
                <g key={s.name} transform={`translate(${s.x} ${s.y})`}>
                  <circle r="14" fill="none" stroke="rgba(245,230,211,0.22)" strokeWidth="2" />
                </g>
              ))}

              {/* the marble */}
              <g ref={marbleRef} transform="translate(500 1520)">
                <circle r="22" fill="rgba(217,154,91,0.16)" />
                <circle r="10" fill="var(--accent-bright, #d99a5b)" filter="url(#marble-glow)" />
                <circle r="4" cx="-3" cy="-3" fill="rgba(255,244,229,0.85)" />
              </g>
            </svg>

            {/* HTML labels over the SVG — real text, per the PRD */}
            {STAGES.map((s, i) => (
              <div
                key={s.name}
                data-station
                className="deal-station is-on absolute"
                style={{
                  left: px(s.x + (s.side === 'r' ? 34 : -34)),
                  top: py(s.y),
                  transform: s.side === 'r' ? 'translateY(-50%)' : 'translate(-100%, -50%)',
                }}
              >
                <span className="pg-label whitespace-nowrap !text-[10px] !tracking-[0.2em] text-[var(--cream)]">
                  {`0${i + 1}`} · {s.name}
                </span>
              </div>
            ))}
            {RAILS.map((r) =>
              r.entry ? (
                <div
                  key={r.name}
                  data-rail-lit
                  className="deal-station is-on absolute -translate-x-1/2"
                  style={{ left: px(r.x), top: py(RAIL_TOP - 56 - r.labelRow * 58) }}
                >
                  <span className="pg-label whitespace-nowrap !text-[9px] !tracking-[0.18em] text-[var(--accent-bright)]">{r.name}</span>
                </div>
              ) : (
                <div
                  key={r.name}
                  className="absolute -translate-x-1/2 text-center"
                  style={{ left: px(r.x), top: py(RAIL_TOP - 56 - r.labelRow * 58) }}
                >
                  <span className="pg-label whitespace-nowrap !text-[9px] !tracking-[0.18em] text-[rgba(245,230,211,0.4)]">{r.name}</span>
                  <span className="mt-1 hidden whitespace-nowrap text-[0.62rem] text-[rgba(245,230,211,0.35)] sm:block">
                    when the hold is the strategy
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
