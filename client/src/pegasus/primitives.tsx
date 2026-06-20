import React, { useEffect, useRef, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import type { Theme } from './theme';
import brandEmblem from '@/assets/brand/pegasus-emblem.png';

export const IMG = (name: string) => `${import.meta.env.BASE_URL}images/${name}`;

/* ----------------------------------------------------------------
   Brand mark — the official Pegasus Dreamscapes emblem (navy winged
   Pegasus over the house roof), used as a transparent PNG so the real
   logo shows consistently across every public surface. On dark
   backgrounds (onDark) a soft glow keeps the navy elements legible
   over the hero photo without recoloring the logo.
---------------------------------------------------------------- */
export function BrandMark({ boxClassName = 'w-11 h-11', onDark = false, className = '' }:
  { boxClassName?: string; onDark?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${boxClassName} ${className}`}>
      <img src={brandEmblem} alt="Pegasus Dreamscapes"
        className="w-full h-full object-contain"
        style={onDark ? { filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.55))' } : undefined} />
    </span>
  );
}

export const usd0 = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/* ----------------------------------------------------------------
   Animated counter
---------------------------------------------------------------- */
export function AnimatedCounter({ end, prefix = '', suffix = '', decimals = 0, duration = 1800 }:
  { end: number | string; prefix?: string; suffix?: string; decimals?: number; duration?: number; }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (typeof end === 'string') return;
    let raf = 0;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !done.current) {
        done.current = true;
        let start: number | null = null;
        const step = (t: number) => {
          if (!start) start = t;
          const p = Math.min((t - start) / duration, 1);
          setCount((end as number) * (1 - Math.pow(1 - p, 3)));
          if (p < 1) raf = requestAnimationFrame(step);
          else setCount(end as number);
        };
        raf = requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => { obs.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [end, duration]);

  if (typeof end === 'string') return <span ref={ref}>{end}</span>;
  return <span ref={ref}>{prefix}{count.toFixed(decimals)}{suffix}</span>;
}

/* ----------------------------------------------------------------
   East Bay hills contour motif
---------------------------------------------------------------- */
export function ContourLines({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 1200 600" fill="none" preserveAspectRatio="xMidYMid slice"
      aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <path d="M-50 460 C 200 380, 380 420, 600 360 S 1000 280, 1260 340" />
        <path d="M-50 500 C 220 430, 400 470, 620 410 S 1010 330, 1260 390" />
        <path d="M-50 540 C 240 480, 420 520, 640 460 S 1020 380, 1260 440" />
        <path d="M-50 420 C 180 330, 360 370, 580 300 S 990 220, 1260 290" />
        <path d="M-50 380 C 160 290, 340 320, 560 250 S 980 170, 1260 240" />
      </g>
    </svg>
  );
}

/* ----------------------------------------------------------------
   Section heading
---------------------------------------------------------------- */
export function SectionHead({ eyebrow, title, copy, dark = false, center = false }:
  { eyebrow: string; title: React.ReactNode; copy?: string; dark?: boolean; center?: boolean }) {
  if (center) {
    return (
      <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-16 reveal">
        <div className={`pg-label mb-5 ${dark ? 'text-[var(--accent-bright)]' : 'text-[var(--accent)]'}`}>{eyebrow}</div>
        <h2 className="font-serif-display text-5xl md:text-7xl leading-[1.0] tracking-[-0.01em] mx-auto [text-wrap:balance]"
          style={{ color: dark ? 'var(--cream)' : 'var(--text)' }}>{title}</h2>
        {copy && <p className={`max-w-xl mx-auto leading-relaxed mt-6 ${dark ? 'text-[rgba(239,231,218,0.7)]' : 'text-[var(--muted)]'}`}>{copy}</p>}
      </div>
    );
  }
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14 lg:mb-16 reveal">
      <div>
        <div className={`pg-label mb-5 ${dark ? 'text-[var(--accent-bright)]' : 'text-[var(--accent)]'}`}>{eyebrow}</div>
        <h2 className="font-serif-display text-5xl md:text-7xl leading-[1.0] tracking-[-0.01em] max-w-2xl [text-wrap:balance]"
          style={{ color: dark ? 'var(--cream)' : 'var(--text)' }}>{title}</h2>
      </div>
      {copy && <p className={`max-w-sm leading-relaxed ${dark ? 'text-[rgba(239,231,218,0.7)]' : 'text-[var(--muted)]'}`}>{copy}</p>}
    </div>
  );
}

/* ----------------------------------------------------------------
   Theme toggle
---------------------------------------------------------------- */
export function ThemeToggle({ theme, onToggle, light }: { theme: Theme; onToggle: () => void; light: boolean }) {
  return (
    <button type="button" onClick={onToggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`theme-toggle ${light ? 'text-[var(--cream)]' : 'text-[var(--text)]'}`}>
      {theme === 'dark' ? <Sun className="w-4 h-4" strokeWidth={1.6} /> : <Moon className="w-4 h-4" strokeWidth={1.6} />}
    </button>
  );
}

