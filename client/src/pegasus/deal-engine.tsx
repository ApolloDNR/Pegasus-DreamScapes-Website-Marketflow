import React, { useEffect, useRef, useState } from 'react';

/* ================================================================
   THE DEAL ENGINE SCHEMATIC — PRD §6.2-3 (issue #22)
   A compact, information-dense routing schematic (replaces the earlier
   pinned marble board, which read too sparse at founder review). One
   viewport, no scroll hijack: the six-step flow across the top, the
   four departments as classical column glyphs, the convergence to
   Exit / Hold, and the five example routes below.

   The routes are live: the active route lights its department columns
   and prints its path. It auto-advances every few seconds (paused for
   reduced-motion users and after a manual selection), and every route
   is a button, so the diagram is explorable rather than decorative.
   All labels are real HTML text per the PRD.
   ================================================================ */

const FLOW: { name: string; note: string }[] = [
  { name: 'Submit', note: 'The property comes in the door.' },
  { name: 'Review', note: 'A person reads it — numbers first.' },
  { name: 'Structure', note: 'Basis, terms, and the exit.' },
  { name: 'Route', note: 'The junction: pick the rails.' },
  { name: 'Execute', note: 'The departments do the work.' },
  { name: 'Exit / Hold', note: 'Sold, assigned, listed — or kept.' },
];

const DEPTS = ['Acquisitions', 'Development', 'Dispositions', 'Asset Management'] as const;

// The five locked example routes and the departments each one lights.
const ROUTES: { name: string; path: string; depts: number[] }[] = [
  { name: 'Direct sale', path: 'Acquisitions → Dispositions', depts: [0, 2] },
  { name: 'Value-add flip', path: 'Acquisitions → Development → Dispositions', depts: [0, 1, 2] },
  { name: 'Rental hold', path: 'Acquisitions → Development → Asset Management', depts: [0, 1, 3] },
  { name: 'Owner needs representation', path: 'Strategy Review → Work With Apollo / Keller Williams', depts: [] },
  { name: 'Deal finder needs buyer', path: 'Acquisitions → Dispositions / MarketFlow', depts: [0, 2] },
];

/* An abstract classical column: capital, fluted shaft, plinth. */
function ColumnGlyph({ lit }: { lit: boolean }) {
  const stroke = lit ? 'var(--accent-bright, #d99a5b)' : 'rgba(245,230,211,0.28)';
  return (
    <svg viewBox="0 0 64 96" className="h-16 w-11 transition-all duration-500 sm:h-20 sm:w-14" aria-hidden="true"
      style={{ filter: lit ? 'drop-shadow(0 0 8px rgba(217,154,91,0.35))' : 'none' }}>
      <line x1="8" y1="8" x2="56" y2="8" stroke={stroke} strokeWidth="3" />
      <line x1="13" y1="16" x2="51" y2="16" stroke={stroke} strokeWidth="2.5" />
      {[22, 32, 42].map((x) => (
        <line key={x} x1={x} y1="22" x2={x} y2="78" stroke={stroke} strokeWidth="2" />
      ))}
      <line x1="13" y1="84" x2="51" y2="84" stroke={stroke} strokeWidth="2.5" />
      <line x1="8" y1="92" x2="56" y2="92" stroke={stroke} strokeWidth="3" />
    </svg>
  );
}

export function DealEngineSchematic() {
  const [active, setActive] = useState(0);
  const pausedUntil = useRef(0);

  // Auto-advance the featured route; a manual pick pauses the cycle.
  useEffect(() => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      setActive((a) => (a + 1) % ROUTES.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  const pick = (i: number) => {
    pausedUntil.current = Date.now() + 12000;
    setActive(i);
  };

  const route = ROUTES[active];
  const litDept = (i: number) => route.depts.includes(i);

  return (
    <div className="deal-schematic relative mt-14 rounded-[3px] border border-[rgba(245,230,211,0.14)] bg-[rgba(5,14,24,0.55)] p-6 sm:p-8 lg:p-12">
      {/* blueprint grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'linear-gradient(rgba(245,230,211,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(245,230,211,0.6) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />

      {/* the six-step flow */}
      <ol className="relative flex flex-wrap items-start gap-y-5" aria-label="Deal flow">
        {FLOW.map((s, i) => (
          <li key={s.name} className="flex min-w-0 flex-1 basis-1/3 items-start gap-3 pr-3 sm:basis-0">
            <span className="mt-[3px] flex items-center gap-2">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${i === 3 ? 'rotate-45 rounded-none border border-[var(--accent-bright)] bg-transparent' : 'bg-[var(--accent-bright)]/80'}`} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="pg-label block !text-[10px] !tracking-[0.18em] text-[var(--cream)]">{s.name}</span>
              <span className="mt-1 hidden text-[0.72rem] leading-snug text-[rgba(245,230,211,0.5)] lg:block">{s.note}</span>
            </span>
          </li>
        ))}
      </ol>

      <div aria-hidden="true" className="mt-6 h-px w-full bg-gradient-to-r from-[var(--accent-bright)]/70 via-[var(--accent-bright)]/30 to-[var(--accent-bright)]/70" />

      {/* the four department columns */}
      <div className="relative mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
        {DEPTS.map((d, i) => (
          <div key={d} className={`flex flex-col items-center text-center transition-opacity duration-500 ${litDept(i) ? 'opacity-100' : 'opacity-45'}`}>
            <ColumnGlyph lit={litDept(i)} />
            <span className={`pg-label mt-3 !text-[9px] !tracking-[0.16em] transition-colors duration-500 ${litDept(i) ? 'text-[var(--accent-bright)]' : 'text-[rgba(245,230,211,0.6)]'}`}>
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* the active route readout */}
      <div className="mt-8 border-t border-[rgba(245,230,211,0.12)] pt-6">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="pg-label !text-[9px] text-[rgba(245,230,211,0.5)]">Route on the board</span>
          <span className="font-serif-display text-xl text-[var(--cream)]">{route.name}</span>
        </div>
        <p className="mt-1.5 text-[0.95rem] text-[var(--accent-bright)]">{route.path}</p>

        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Example routes">
          {ROUTES.map((r, i) => (
            <button key={r.name} type="button" onClick={() => pick(i)}
              aria-pressed={i === active}
              className={`rounded-full border px-4 py-2 pg-label !text-[9px] !tracking-[0.14em] transition-colors duration-300 ${
                i === active
                  ? 'border-[var(--accent-bright)] bg-[var(--accent-bright)]/10 text-[var(--cream)]'
                  : 'border-[rgba(245,230,211,0.25)] text-[rgba(245,230,211,0.65)] hover:border-[rgba(245,230,211,0.5)]'
              }`}>
              {r.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
