import React, { useState } from 'react';
import {
  ArrowRight, ArrowUpRight, Check, Minus, ChevronDown, Plus,
  Compass, Home, Target, Calculator, Layers, Hammer, Route as RouteIcon, Shield,
  ConciergeBell, Key, Search, Handshake,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Nav, Theme, Pillar, FaqItem, Route } from './theme';
import { IMG, SectionHead, ContourLines, BeforeAfter } from './primitives';
import {
  STATS, DOORS3, PILLARS3, ENGINE_INPUTS, ENGINE_OUTPUT, PRODUCTS, MARKETFLOW,
  ECOSYSTEM, DOCTRINE, LANE_CARDS, APOLLO, NELSON,
} from './data';

/* ----------------------------------------------------------------
   Icon resolver
---------------------------------------------------------------- */
export const ICONS: Record<string, LucideIcon> = {
  compass: Compass, home: Home, target: Target, calculator: Calculator,
  layers: Layers, hammer: Hammer, route: RouteIcon, shield: Shield,
  sparkles: ConciergeBell, key: Key, search: Search, handshake: Handshake,
};
function Ico({ name, className, strokeWidth = 1.5 }: { name: string; className?: string; strokeWidth?: number }) {
  const C = ICONS[name] ?? Compass;
  return <C className={className} strokeWidth={strokeWidth} />;
}

export type StartAction = 'contact' | 'strategylab' | 'peggy';

/* ----------------------------------------------------------------
   Page hero
---------------------------------------------------------------- */
export function PageHero({ eyebrow, title, image, lead, focus = 'center' }:
  { eyebrow: string; title: React.ReactNode; image: string; lead: string; focus?: 'center' | 'top' }) {
  return (
    <section className="relative h-[68vh] min-h-[520px] max-h-[760px] w-full overflow-hidden">
      <img src={image} alt="" aria-hidden="true" className={`ken-burns absolute inset-0 w-full h-full object-cover ${focus === 'top' ? 'object-top' : 'object-center'}`} />
      <div className="absolute inset-0 hero-vignette pointer-events-none" />
      <div className="absolute inset-0 hero-scrim-bottom" />
      <div className="absolute inset-x-0 bottom-0">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 pb-16 lg:pb-20 text-[var(--cream)]">
          <div className="pg-label !tracking-[0.34em] text-[var(--accent-bright)] text-on-photo mb-6 reveal">{eyebrow}</div>
          <h1 className="font-serif-display font-light leading-[1.02] sm:leading-[0.98] tracking-[-0.01em] text-[clamp(2.35rem,6.2vw,6rem)] max-w-[14ch] [text-wrap:balance] reveal delay-100">{title}</h1>
          <p className="font-serif-display italic text-xl md:text-2xl text-[var(--cream)]/90 leading-snug max-w-2xl mt-7 reveal delay-200">{lead}</p>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Home hero
---------------------------------------------------------------- */
export function Hero({ go, theme, parallaxRef, openPeggy }:
  { go: Nav; theme: Theme; parallaxRef: React.RefObject<HTMLDivElement | null>; openPeggy: () => void }) {
  return (
    <section className="relative h-[96vh] min-h-[680px] max-h-[1000px] w-full overflow-hidden">
      <div ref={parallaxRef as React.RefObject<HTMLDivElement>} className="hero-parallax absolute inset-0">
        <img key={theme} src={IMG(theme === 'dark' ? 'pegasus-hero-cinematic.png' : 'pegasus-hero-light.png')}
          alt="East Bay luxury hillside home" className="ken-burns absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 hero-vignette pointer-events-none" />
      <div className="absolute inset-0 hero-scrim-bottom" />
      <div className="absolute inset-x-0 bottom-0">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 pb-16 lg:pb-20 text-[var(--cream)]">
          <div className="pg-label !tracking-[0.34em] text-[var(--accent-bright)] text-on-photo mb-7 reveal">Investments · Development · Systems · East Bay</div>
          <h1 className="font-serif-display font-light leading-[1.0] sm:leading-[0.96] tracking-[-0.01em] text-[clamp(2.3rem,7vw,6.8rem)] max-w-[18ch] [text-wrap:balance] reveal delay-100">
            We do not just find deals. <span className="italic text-[var(--accent-bright)]">We architect them.</span>
          </h1>
          <div className="draw-x h-px bg-[var(--accent-bright)]/60 max-w-[220px] mt-9 mb-9" aria-hidden="true" />
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 reveal delay-200">
            <div className="max-w-xl">
              <p className="font-serif-display italic text-2xl md:text-3xl text-[var(--cream)]/90 leading-snug">
                A real estate investment, development, and systems company. We read the situation, underwrite the numbers, and design the route forward.
              </p>
              <div className="pg-label !text-[9px] !tracking-[0.26em] text-[var(--cream)]/55 mt-6">
                Built on strategy · Governed by virtue · Executed with discipline
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <button type="button" onClick={() => go('contact')} className="btn-solid-light px-8 py-4 pg-label !text-[10px] !tracking-[0.18em] inline-flex items-center gap-3 group">
                Start a Property Review <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button type="button" onClick={openPeggy} className="link-underline pg-label !text-[10px] !tracking-[0.18em] text-[var(--cream)]/80 hover:text-[var(--cream)] inline-flex items-center gap-2.5 transition-colors">
                Ask PeggyAI
              </button>
              <button type="button" onClick={() => go('strategylab')} className="link-underline pg-label !text-[10px] !tracking-[0.18em] text-[var(--cream)]/80 hover:text-[var(--cream)] inline-flex items-center gap-2.5 transition-colors">
                Enter the Strategy Lab
              </button>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[var(--cream)]/80 scroll-cue">
        <ChevronDown className="w-6 h-6" />
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Home business intro
---------------------------------------------------------------- */
export function HomeIntro() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-4 reveal">
          <div className="pg-label text-[var(--accent)]">What Pegasus is</div>
          <div className="pg-rule mt-6 mb-6 max-w-[3rem] !bg-[var(--accent)] draw-x" />
          <p className="font-serif-display italic text-xl text-[var(--muted)] leading-snug">
            One company, three engines, each one feeding the next.
          </p>
        </div>
        <div className="lg:col-span-8 reveal delay-100">
          <p className="font-serif-display text-3xl md:text-[2.7rem] leading-[1.25] text-[var(--text)] tracking-[-0.01em]">
            Most real estate is a transaction shop that lists it, flips it, and moves on. We built the opposite: we <span className="text-[var(--accent)]">invest</span> in property others overlook, <span className="text-[var(--accent)]">develop</span> it through our own development team, and run the <span className="text-[var(--accent)]">systems</span> that turn each deal into a repeatable process.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Choose your lane (6 audiences)
---------------------------------------------------------------- */
export function LaneCardsBlock({ go }: { go: Nav }) {
  return (
    <section className="relative py-24 lg:py-28 bg-[var(--bg-2)] border-y border-[var(--line)] overflow-hidden">
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead eyebrow="Who we serve" title="Choose your lane."
          copy="Six front doors, one standard behind all of them. Start where you are. Every lane leads to a clear next step." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LANE_CARDS.map((c, i) => (
            <button key={c.key} type="button" onClick={() => go(c.key)}
              className="door-card surface-card group reveal flex flex-col h-full text-left p-8"
              style={{ animationDelay: `${i * 70}ms` }}>
              <div className="flex items-start justify-between mb-7">
                <div className="door-icon"><Ico name={c.icon} className="w-5 h-5" /></div>
                <span aria-hidden="true" className="font-serif-display text-2xl leading-none text-[var(--line)] transition-colors duration-500 group-hover:text-[var(--accent)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="font-serif-display text-2xl text-[var(--text)] mb-3 leading-tight">{c.title}</div>
              <p className="text-[var(--muted)] text-[0.92rem] leading-relaxed mb-7">{c.desc}</p>
              <div className="mt-auto pt-5 border-t border-[var(--line-soft)] pg-label !text-[9px] !tracking-[0.2em] text-[var(--text)] flex items-center gap-2 group-hover:text-[var(--accent)] transition-colors">
                Enter <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Three pillars
---------------------------------------------------------------- */
export function ThreePillarsBlock({ go }: { go: Nav }) {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div aria-hidden="true" className="section-numeral absolute top-0 right-4 lg:right-12 text-[var(--line-soft)]">FIRM</div>
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead eyebrow="What we do" title="Three engines, one company."
          copy="Investments find and reposition the asset. Development builds it. Systems make it repeatable." />
        <div className="grid lg:grid-cols-3 gap-6">
          {PILLARS3.map((p, i) => (
            <div key={p.eyebrow} className="surface-card reveal flex flex-col overflow-hidden" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="img-zoom aspect-[16/10] relative">
                <img src={IMG(p.img)} alt={p.imgAlt ?? p.tag ?? p.eyebrow} className="w-full h-full object-cover" />
                <div className="absolute inset-0 hero-scrim-bottom" />
                <div className="absolute bottom-0 left-0 p-6">
                  <div className="pg-label !text-[9px] text-[var(--cream)]/70 mb-1">{p.eyebrow}</div>
                  <div className="font-serif-display text-3xl text-[var(--cream)]">{p.tag}</div>
                </div>
              </div>
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <p className="text-[var(--muted)] text-[0.95rem] leading-relaxed mb-6">{p.lead}</p>
                <ul className="space-y-3 mb-8">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-3 text-[var(--text-2)] text-[0.92rem] leading-relaxed">
                      <Check className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" strokeWidth={2} /><span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => go(p.route)}
                  className="mt-auto btn-line px-7 py-3.5 pg-label !text-[10px] inline-flex items-center gap-3 group self-start">
                  {p.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Full alternating pillar section (for capability pages)
---------------------------------------------------------------- */
export function PillarSection({ p, go, flip = false, dark = false, numeral }:
  { p: Pillar; go: Nav; flip?: boolean; dark?: boolean; numeral?: string }) {
  const sectionCls = dark
    ? 'relative py-24 lg:py-32 overflow-hidden bg-[var(--navy)] text-[var(--cream)]'
    : 'relative py-24 lg:py-32 overflow-hidden';
  const eyebrowCls = dark ? 'text-[var(--accent-bright)]' : 'text-[var(--accent)]';
  const titleCls = dark ? '' : 'text-[var(--text)]';
  const leadCls = dark ? 'text-[var(--cream)]/75' : 'text-[var(--muted)]';
  const pointCls = dark ? 'text-[var(--cream)]/85' : 'text-[var(--text-2)]';
  const checkCls = dark ? 'text-[var(--accent-bright)]' : 'text-[var(--accent)]';
  const btnCls = dark ? 'btn-solid-light' : 'btn-primary';

  return (
    <section className={sectionCls}>
      {numeral && <div aria-hidden="true" className={`section-numeral absolute top-0 ${flip ? 'left-4 lg:left-12' : 'right-4 lg:right-12'} ${dark ? 'text-white/[0.04]' : 'text-[var(--line-soft)]'}`}>{numeral}</div>}
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className={`lg:col-span-6 reveal ${flip ? 'lg:order-2' : ''}`}>
            <div className="img-zoom peggy-shadow aspect-[5/4]">
              <img src={IMG(p.img)} alt={p.imgAlt ?? p.eyebrow} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className={`lg:col-span-6 reveal delay-100 ${flip ? 'lg:order-1' : ''}`}>
            <div className="flex items-center gap-3 mb-5">
              <span className={`pg-label ${eyebrowCls}`}>{p.eyebrow}</span>
              {p.tag && <span className="pg-label !text-[8px] !tracking-[0.16em] px-2.5 py-1 rounded-full border border-[var(--accent)]/40 text-[var(--accent)]">{p.tag}</span>}
            </div>
            <h2 className={`font-serif-display text-4xl md:text-[3.3rem] leading-[1.04] tracking-[-0.01em] mb-6 ${titleCls}`}>{p.title}</h2>
            <p className={`${leadCls} leading-relaxed mb-8 max-w-xl`}>{p.lead}</p>
            <ul className="space-y-3.5 mb-10">
              {p.points.map((pt) => (
                <li key={pt} className={`flex gap-3.5 leading-relaxed ${pointCls}`}>
                  <Check className={`w-4 h-4 mt-1 shrink-0 ${checkCls}`} strokeWidth={2} />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => go(p.route)} className={`${btnCls} px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group`}>
              {p.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Process steps — reusable numbered icon ribbon with a connecting spine
   (used by Development "How we build" and Strategy Lab "How the Lab works")
---------------------------------------------------------------- */
export type ProcessStep = { n: string; icon: LucideIcon; t: string; d: string };

export function ProcessSteps({ eyebrow, title, copy, steps, tone = 'page' }:
  { eyebrow: string; title: React.ReactNode; copy?: string; steps: ProcessStep[]; tone?: 'page' | 'alt' }) {
  const cols = steps.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4';
  const inset = steps.length === 3 ? 'left-[16.66%] right-[16.66%]' : 'left-[12.5%] right-[12.5%]';
  return (
    <section className={`py-24 lg:py-28 ${tone === 'alt' ? 'bg-[var(--bg-2)] border-y border-[var(--line)]' : ''}`}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead eyebrow={eyebrow} title={title} copy={copy} />
        <div className={`relative grid ${cols} gap-x-6 gap-y-12 mt-4`}>
          <div aria-hidden="true" className={`hidden lg:block absolute top-[26px] ${inset} h-px bg-gradient-to-r from-[var(--accent)]/25 via-[var(--accent)]/45 to-[var(--accent)]/25`} />
          {steps.map((s, i) => (
            <div key={s.n} className="group relative z-10 reveal text-center" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="mx-auto w-[52px] h-[52px] rounded-full border border-[var(--accent)]/40 bg-[var(--bg)] flex items-center justify-center mb-6 transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:shadow-[0_14px_30px_-12px_rgba(177,102,49,0.5)]">
                <s.icon aria-hidden="true" className="w-5 h-5 text-[var(--accent)] transition-colors duration-500 group-hover:text-white" strokeWidth={1.6} />
              </div>
              <div className="pg-label !text-[8px] text-[var(--accent)] mb-2">Step {s.n}</div>
              <h3 className="font-serif-display text-xl text-[var(--text)] mb-2.5 leading-tight">{s.t}</h3>
              <p className="text-[var(--muted)] text-[0.88rem] leading-relaxed max-w-[15rem] mx-auto">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Deal Architecture engine (infographic)
---------------------------------------------------------------- */
export function EngineBlock({ go }: { go: Nav }) {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[var(--navy)] text-[var(--cream)]">
      <ContourLines className="absolute inset-x-0 top-0 w-full h-[60%] text-[var(--accent-2)] opacity-[0.1] float-slow" />
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead dark eyebrow="The engine" center
          title={<>The Deal Architecture Engine</>}
          copy="Eight inputs go in. One clear recommendation comes out. Every situation runs the same disciplined read." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {ENGINE_INPUTS.map((inp, i) => (
            <div key={inp.label} className="engine-node reveal" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="engine-node-icon"><Ico name={inp.icon} className="w-4 h-4" /></span>
                <span className="font-serif-display text-xl text-[var(--cream)]">{inp.label}</span>
              </div>
              <p className="text-[rgba(239,231,218,0.62)] text-[0.85rem] leading-relaxed">{inp.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center mb-8" aria-hidden="true">
          <div className="flex flex-col items-center text-[var(--accent-bright)]">
            <span className="pg-label !text-[8px] !tracking-[0.22em] text-[var(--cream)]/45 mb-2">resolves to</span>
            <ChevronDown className="w-6 h-6 animate-pulse" />
          </div>
        </div>
        <div className="reveal max-w-3xl mx-auto text-center rounded-[3px] border border-[var(--accent)]/40 bg-[rgba(213,127,46,0.1)] p-7 sm:p-9 lg:p-11">
          <div className="pg-label !text-[9px] text-[var(--accent-bright)] mb-4">{ENGINE_OUTPUT.label}</div>
          <p className="font-serif-display text-3xl md:text-4xl text-[var(--cream)] leading-snug mb-5">{ENGINE_OUTPUT.desc}</p>
          <button type="button" onClick={() => go('dealarchitecture')}
            className="btn-solid-light px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
            See how the engine works <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Three doors — choose how to start
---------------------------------------------------------------- */
export function DoorsBlock({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  const run = (a: StartAction) => { if (a === 'peggy') openPeggy(); else go(a); };
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div aria-hidden="true" className="section-numeral absolute top-0 left-4 lg:left-12 text-[var(--line-soft)]">START</div>
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead eyebrow="Getting started" title="Choose how to start."
          copy="Three ways in, no wrong door. Talk to a person, run the numbers yourself, or just ask in plain language." />
        <div className="grid lg:grid-cols-3 gap-6">
          {DOORS3.map((d, i) => (
            <div key={d.key} className="surface-card reveal flex flex-col h-full p-8 lg:p-10" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="door-icon mb-7"><Ico name={d.icon} className="w-5 h-5" /></div>
              <div className="pg-label !text-[9px] text-[var(--accent)] mb-3">{d.kicker}</div>
              <h3 className="font-serif-display text-2xl text-[var(--text)] mb-4 leading-tight">{d.title}</h3>
              <p className="text-[var(--muted)] text-[0.95rem] leading-relaxed mb-5">{d.desc}</p>
              <p className="text-[var(--text-2)] text-[0.85rem] italic leading-relaxed mb-8">{d.best}</p>
              <button type="button" onClick={() => run(d.action)}
                className="mt-auto btn-primary px-7 py-3.5 pg-label !text-[10px] inline-flex items-center gap-3 group self-start">
                {d.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Product ladder (5 steps)
---------------------------------------------------------------- */
export function ProductLadderBlock({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  const run = (a: StartAction) => { if (a === 'peggy') openPeggy(); else go(a); };
  return (
    <section className="relative py-24 lg:py-28 bg-[var(--bg-2)] border-y border-[var(--line)] overflow-hidden">
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead eyebrow="The product ladder" title="How far you go is up to you."
          copy="Five steps, increasing depth and commitment. Each one stands on its own, so go as far as the deal deserves." />
        <div className="border-t border-[var(--line)]">
          {PRODUCTS.map((p, i) => (
            <div key={p.name} className="ladder-rung reveal grid md:grid-cols-12 gap-4 md:gap-8 items-center py-7 border-b border-[var(--line)]" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="md:col-span-1 font-serif-display text-3xl text-[var(--accent)]">{p.step}</div>
              <div className="md:col-span-3">
                <div className="pg-label !text-[9px] text-[var(--accent)] mb-1.5 flex items-center gap-2">
                  {p.kind}
                  {p.paid && <span className="px-1.5 py-0.5 rounded-full border border-[var(--accent)]/40 !text-[7px]">Paid</span>}
                </div>
                <div className="font-serif-display text-3xl text-[var(--text)] leading-none">{p.name}</div>
              </div>
              <div className="md:col-span-5 text-[var(--muted)] text-[0.95rem] leading-relaxed">{p.desc}</div>
              <div className="md:col-span-3 flex md:justify-end">
                <button type="button" onClick={() => run(p.action)}
                  className="btn-line px-6 py-3 pg-label !text-[9px] inline-flex items-center gap-2.5 group">
                  {p.cta} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   MarketFlow (3 lanes)
---------------------------------------------------------------- */
export function MarketFlowBlock({ go, dark = false, enter }: { go: Nav; dark?: boolean; enter?: { label: string; href: string } }) {
  return (
    <section className={`relative py-24 lg:py-32 overflow-hidden ${dark ? 'bg-[var(--navy)] text-[var(--cream)]' : ''}`}>
      {dark && <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[60%] text-[var(--accent-2)] opacity-[0.1] float-slow" />}
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead dark={dark} eyebrow="MarketFlow · The marketplace"
          title="Where deals, capital, and product move."
          copy="Three lanes, one network. Deals flow in, capital matches up, and finished product lands with buyers, all to one standard." />
        <div className="reveal mb-12 lg:mb-14" aria-hidden="true">
          <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
            {['Deals flow in', 'Capital matches up', 'Product lands'].map((s, i) => (
              <span key={s} className="contents">
                <div className="flex items-center gap-2.5">
                  <span className={`mf-step ${dark ? 'is-dark' : ''}`}>{i + 1}</span>
                  <span className={`pg-label !text-[9px] !tracking-[0.18em] ${dark ? 'text-[var(--cream)]/80' : 'text-[var(--text-2)]'}`}>{s}</span>
                </div>
                {i < 2 && (
                  <span className="mf-connector" aria-hidden="true">
                    <ArrowRight className={`w-4 h-4 ${dark ? 'text-[var(--accent-bright)]' : 'text-[var(--accent)]'}`} strokeWidth={1.8} />
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {MARKETFLOW.map((m, i) => (
            <div key={m.key} className={`reveal flex flex-col h-full p-6 sm:p-8 lg:p-9 rounded-[3px] border ${dark ? 'border-[rgba(239,231,218,0.16)] bg-[rgba(239,231,218,0.04)]' : 'surface-card'}`} style={{ animationDelay: `${i * 90}ms` }}>
              <div className="flex items-center justify-between mb-7">
                <div className="door-icon !mb-0"><Ico name={m.icon} className="w-5 h-5" /></div>
                <span className={`font-serif-display text-2xl leading-none ${dark ? 'text-[var(--cream)]/25' : 'text-[var(--line)]'}`}>0{i + 1}</span>
              </div>
              <div className={`pg-label !text-[9px] mb-3 ${dark ? 'text-[var(--accent-bright)]' : 'text-[var(--accent)]'}`}>{m.tag}</div>
              <h3 className={`font-serif-display text-2xl mb-4 leading-tight ${dark ? 'text-[var(--cream)]' : 'text-[var(--text)]'}`}>{m.name}</h3>
              <p className={`text-[0.95rem] leading-relaxed mb-6 ${dark ? 'text-[var(--cream)]/70' : 'text-[var(--muted)]'}`}>{m.desc}</p>
              <ul className="space-y-2.5 mb-7">
                {m.points.map((pt) => (
                  <li key={pt} className={`flex gap-3 text-[0.88rem] leading-relaxed ${dark ? 'text-[var(--cream)]/85' : 'text-[var(--text-2)]'}`}>
                    <Check className={`w-3.5 h-3.5 mt-1 shrink-0 ${dark ? 'text-[var(--accent-bright)]' : 'text-[var(--accent)]'}`} strokeWidth={2} /><span>{pt}</span>
                  </li>
                ))}
              </ul>
              <div className={`mt-auto pg-label !text-[8px] !tracking-[0.18em] ${dark ? 'text-[var(--cream)]/45' : 'text-[var(--muted)]'}`}>For: {m.forWho}</div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center reveal">
          {enter ? (
            <a href={enter.href}
              className={`${dark ? 'btn-solid-light' : 'btn-primary'} px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group`}>
              {enter.label} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          ) : (
            <button type="button" onClick={() => go('marketflow')}
              className={`${dark ? 'btn-solid-light' : 'btn-primary'} px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group`}>
              Explore MarketFlow <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Ecosystem (6 surfaces)
---------------------------------------------------------------- */
export function EcosystemBlock({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  return (
    <section className="relative py-24 lg:py-28 overflow-hidden">
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead eyebrow="The Pegasus Ecosystem" title="One discipline, end to end."
          copy="Six parts of one company — the firm, the guide, the tools, the marketplace, the capital, and the build team. Every one runs a deal through the same underwriting, from the first read to the final close." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ECOSYSTEM.map((s, i) => {
            const clickable = !!s.route;
            const onClick = () => { if (s.route === 'peggy') openPeggy(); else if (s.route) go(s.route); };
            return (
              <button key={s.key} type="button" disabled={!clickable} onClick={onClick}
                className={`surface-card reveal text-left p-8 flex flex-col h-full ${clickable ? 'door-card group' : 'opacity-90 cursor-default'}`}
                style={{ animationDelay: `${i * 70}ms` }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="door-icon"><Ico name={s.icon} className="w-5 h-5" /></div>
                  <span className={`pg-label !text-[8px] !tracking-[0.16em] px-2.5 py-1 rounded-full border ${s.status === 'Operating' ? 'border-[var(--accent)]/40 text-[var(--accent)]' : 'border-[var(--line)] text-[var(--muted)]'}`}>{s.status}</span>
                </div>
                <div className="font-serif-display text-2xl text-[var(--text)] mb-1.5 leading-tight">{s.name}</div>
                <div className="pg-label !text-[8px] !tracking-[0.18em] text-[var(--accent)] mb-4">{s.role}</div>
                <p className="text-[var(--muted)] text-[0.9rem] leading-relaxed mb-6">{s.desc}</p>
                {clickable && (
                  <div className="mt-auto pg-label !text-[9px] !tracking-[0.18em] text-[var(--text)] flex items-center gap-2 group-hover:text-[var(--accent)] transition-colors">
                    Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Apollo block
---------------------------------------------------------------- */
export function ApolloBlock({ go, showCta = true }: { go: Nav; showCta?: boolean }) {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-5 reveal">
          <div className="img-zoom peggy-shadow aspect-[4/5]">
            <img src={IMG('founder/apollo-1200.jpg')} alt={APOLLO.name} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="lg:col-span-7 reveal delay-100">
          <div className="pg-label text-[var(--accent)] mb-5">Work with Apollo</div>
          <h2 className="font-serif-display text-5xl md:text-6xl leading-[1.02] tracking-[-0.01em] text-[var(--text)] mb-7">{APOLLO.name}</h2>
          <p className="text-[var(--muted)] leading-relaxed mb-9 max-w-xl">{APOLLO.lead}</p>
          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {APOLLO.points.map((pt) => (
              <div key={pt.t} className="surface-card p-6">
                <h3 className="font-serif-display text-xl text-[var(--text)] mb-2">{pt.t}</h3>
                <p className="text-[var(--muted)] text-[0.85rem] leading-relaxed">{pt.d}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pg-label !text-[10px] text-[var(--muted)] mb-9">
            <span>Licensed REALTOR</span><span>{APOLLO.license}</span><span>NAR · CAR</span><span>Backed by an in-house development team</span>
          </div>
          {showCta && (
            <button type="button" onClick={() => go('apollo')} className="btn-primary px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
              Work with Apollo <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Proof — stats + Nelson Drive
---------------------------------------------------------------- */
export function ProofStats() {
  return (
    <section className="py-24 lg:py-28 bg-[var(--bg-2)] border-y border-[var(--line)]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead eyebrow="Proof" title="A track record, not a pitch."
          copy="Disciplined underwriting, executed value-add, and reads returned on time. These are the numbers behind the standard." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {STATS.map((s, i) => (
            <div key={i} className={`reveal ${i > 0 ? 'lg:border-l lg:border-[var(--line)] lg:pl-8' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>
              <div className="font-serif-display text-4xl sm:text-5xl md:text-6xl leading-none mb-4 text-[var(--text)]">{s.value}</div>
              <div className="pg-label !text-[10px] !tracking-[0.18em] text-[var(--text-2)] mb-1.5">{s.label}</div>
              <div className="text-[var(--muted)] text-[0.82rem] leading-relaxed">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NelsonProof({ go }: { go: Nav }) {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div aria-hidden="true" className="section-numeral absolute top-0 left-4 lg:left-12 text-[var(--line-soft)]">PROOF</div>
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 reveal">
            <div className="pg-label text-[var(--accent)] mb-5">The work · {NELSON.name}</div>
            <h2 className="font-serif-display text-5xl md:text-6xl leading-[1.02] tracking-[-0.01em] text-[var(--text)] mb-7">
              A tired house, a structured turn.
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-10 max-w-md">{NELSON.blurb} Drag the handle to see the transformation.</p>
            <div className="grid grid-cols-3 gap-6 mb-10">
              {NELSON.rows.map((r, i) => (
                <div key={r.k} className="reveal" style={{ animationDelay: `${i * 90}ms` }}>
                  <div className="font-serif-display text-3xl text-[var(--text)]">{r.v}</div>
                  <div className="pg-label !text-[9px] text-[var(--muted)] mt-1">{r.k}</div>
                  <div className="text-[var(--muted)] text-[0.72rem] mt-1.5 leading-snug">{r.note}</div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => go('dealarchitecture')} className="btn-primary px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
              See how we work <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="lg:col-span-6 reveal delay-100">
            <div className="peggy-shadow"><BeforeAfter /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Doctrine — Dreamscaper Standard
---------------------------------------------------------------- */
export function DoctrineBlock({ dark = false }: { dark?: boolean }) {
  return (
    <section className={`relative py-24 lg:py-28 overflow-hidden ${dark ? 'bg-[var(--navy)] text-[var(--cream)]' : 'bg-[var(--bg-2)]'}`}>
      {dark && <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[60%] text-[var(--accent-2)] opacity-[0.1] float-slow" />}
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead dark={dark} eyebrow="The Dreamscaper Standard" title="What we will not trade away."
          copy="Four commitments that govern every read, every build, and every conversation." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DOCTRINE.map((d, i) => (
            <div key={d.t} className={`reveal p-8 rounded-[3px] border ${dark ? 'border-[rgba(239,231,218,0.16)] bg-[rgba(239,231,218,0.04)]' : 'surface-card'}`} style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`font-serif-display text-4xl mb-5 leading-none ${dark ? 'text-[var(--accent-bright)]' : 'text-[var(--accent)]'}`}>{String(i + 1).padStart(2, '0')}</div>
              <h3 className={`font-serif-display text-2xl mb-3 leading-tight ${dark ? 'text-[var(--cream)]' : 'text-[var(--text)]'}`}>{d.t}</h3>
              <p className={`text-[0.92rem] leading-relaxed ${dark ? 'text-[var(--cream)]/70' : 'text-[var(--muted)]'}`}>{d.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   FAQ (accessible accordion)
---------------------------------------------------------------- */
export function FAQBlock({ items, eyebrow = 'Questions', title = 'Plainly answered.', copy, allHref = '/faq', allLabel = 'See all questions' }:
  { items: FaqItem[]; eyebrow?: string; title?: React.ReactNode; copy?: string; allHref?: string; allLabel?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24 lg:py-28">
      <div className="max-w-[920px] mx-auto px-6 lg:px-12">
        <SectionHead eyebrow={eyebrow} title={title} copy={copy} center />
        <div className="border-t border-[var(--line)]">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-[var(--line)] reveal" style={{ animationDelay: `${i * 50}ms` }}>
                <button type="button" aria-expanded={isOpen} aria-controls={`faq-panel-${i}`} id={`faq-trigger-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left group">
                  <span className="font-serif-display text-xl md:text-2xl text-[var(--text)] leading-snug">{f.q}</span>
                  <span className={`shrink-0 text-[var(--accent)] transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                    <Plus className="w-5 h-5" strokeWidth={1.6} />
                  </span>
                </button>
                <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-trigger-${i}`} hidden={!isOpen}
                  className="pb-7 -mt-1 text-[var(--muted)] leading-relaxed max-w-2xl">
                  {f.a}
                </div>
              </div>
            );
          })}
        </div>
        {allHref && (
          <div className="mt-12 text-center reveal">
            <a href={allHref} data-testid="link-faq-see-all"
              className="btn-line px-7 py-3.5 pg-label !text-[10px] inline-flex items-center gap-3 group">
              {allLabel} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Qualifier — honest fit
---------------------------------------------------------------- */
export function Qualifier({ forYou, notFit }: { forYou: string[]; notFit: string[] }) {
  return (
    <section className="py-20 lg:py-24 bg-[var(--bg-2)] border-y border-[var(--line)]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead eyebrow="Who it's for" title="An honest fit, both ways."
          copy="We say no early and often. Here is who this lane serves, and who it likely does not." />
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          <div className="surface-card p-8 lg:p-10 reveal">
            <div className="pg-label text-[var(--accent)] mb-7 flex items-center gap-2.5">
              <Check className="w-4 h-4" strokeWidth={2} /> This is for you if
            </div>
            <ul className="space-y-5">
              {forYou.map((t, i) => (
                <li key={i} className="flex gap-3.5 text-[var(--text-2)] leading-relaxed">
                  <Check className="w-4 h-4 text-[var(--accent)] mt-1 shrink-0" strokeWidth={2} /><span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-card p-8 lg:p-10 reveal delay-100">
            <div className="pg-label text-[var(--muted)] mb-7 flex items-center gap-2.5">
              <Minus className="w-4 h-4" /> Likely not a fit if
            </div>
            <ul className="space-y-5">
              {notFit.map((t, i) => (
                <li key={i} className="flex gap-3.5 text-[var(--muted)] leading-relaxed">
                  <Minus className="w-4 h-4 mt-1 shrink-0" /><span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Split paths (e.g. three ways to sell)
---------------------------------------------------------------- */
export function SplitPaths({ go, openPeggy, heading, copy, paths, founderPhoto = false, peggyHint = false }:
  { go: Nav; openPeggy: () => void; heading: string; copy: string; paths: { name: string; desc: string; cta: string; route: Route }[]; founderPhoto?: boolean; peggyHint?: boolean }) {
  const run = (r: Route) => { if (r === 'peggy') openPeggy(); else go(r); };
  const gridCols = paths.length === 2 ? 'lg:grid-cols-2 max-w-[920px] mx-auto' : 'lg:grid-cols-3';
  return (
    <section className="py-24 lg:py-28">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead eyebrow="Your options" title={heading} copy={copy} />
        {founderPhoto && (
          <div className="flex items-center gap-4 justify-center -mt-4 mb-12 reveal">
            <img src={IMG('founder/apollo-1200.jpg')} alt="Paolo &quot;Apollo&quot; Duran"
              className="w-14 h-14 rounded-full object-cover object-top shrink-0" loading="lazy" />
            <p className="text-[var(--muted)] text-[0.88rem] leading-relaxed max-w-md">
              When representation is the lane, Apollo is your agent through Keller Williams Realty East Bay. DRE&nbsp;#02333658.
            </p>
          </div>
        )}
        <div className={`grid ${gridCols} gap-6`}>
          {paths.map((p, i) => (
            <div key={p.name} className="surface-card reveal flex flex-col h-full p-8" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="font-serif-display text-3xl text-[var(--accent)] mb-5 leading-none">{String(i + 1).padStart(2, '0')}</div>
              <h3 className="font-serif-display text-2xl text-[var(--text)] mb-3 leading-tight">{p.name}</h3>
              <p className="text-[var(--muted)] text-[0.92rem] leading-relaxed mb-8">{p.desc}</p>
              <button type="button" onClick={() => run(p.route)}
                className="mt-auto btn-line px-7 py-3.5 pg-label !text-[10px] inline-flex items-center gap-3 group self-start">
                {p.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
        {peggyHint && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-x-3 gap-y-2 text-center reveal">
            <span className="text-[var(--muted)] text-[0.92rem]">Not sure which lane fits?</span>
            <button type="button" onClick={openPeggy}
              className="pg-label !text-[10px] text-[var(--accent)] inline-flex items-center gap-2 group hover:opacity-80 transition-opacity">
              Talk it through with PeggyAI <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Deal Finders extras — source protection, Buy Box, JV/disposition
---------------------------------------------------------------- */
const BUYBOX = [
  { label: 'Geography', value: 'East Bay focus — Contra Costa & Alameda counties' },
  { label: 'Asset type', value: 'SFR, 2–4 unit, small multifamily, ADU-able lots' },
  { label: 'Price band', value: '~$400K to $1.5M all-in (flexible on the right deal)' },
  { label: 'Condition', value: 'Cosmetic to full gut — distress is welcome' },
  { label: 'The math', value: 'Room for a real margin after carry and exit, subject to underwriting' },
  { label: 'Title & terms', value: 'Clean path to a signed contract or assignable position' },
];

const PROTECTION = [
  { icon: Shield, t: 'Submit once, in writing', d: 'Every deal you bring is logged with a timestamp and your source attribution. Your submission is documented before anything moves.' },
  { icon: Handshake, t: 'Written terms first', d: 'Your assignment fee or JV split is agreed in a written agreement before your deal is shared with any buyer.' },
  { icon: Check, t: 'We protect your position', d: 'We do not shop your deal around the county or go around you to your seller. Bring it once and deal with one buyer who closes.' },
];

const JV_PATHS = [
  { name: 'Direct buy', desc: 'We purchase as principal on agreed terms when the deal fits the Buy Box. Fast, certain, and clean.', cta: 'Send the deal', route: 'contact' as Route },
  { name: 'Assignment', desc: 'Hold an assignable contract? Assign it to us for a spread agreed in writing up front. What we agree is what you get at close.', cta: 'Submit for review', route: 'contact' as Route },
  { name: 'JV / disposition', desc: 'Bigger or more complex? We can partner on the project or place it through MarketFlow on documented JV terms, subject to review.', cta: 'Start a JV review', route: 'contact' as Route },
];

export function DealFindersExtras({ go }: { go: Nav }) {
  return (
    <>
      <section className="py-24 lg:py-28 bg-[var(--navy)] text-[var(--cream)] relative overflow-hidden">
        <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[60%] text-[var(--accent-2)] opacity-[0.1] float-slow" />
        <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead dark eyebrow="Your deal, protected"
            title={<>Bring it once.<br />Keep your position.</>}
            copy="Sourcing is real work. We treat your deal, and your relationship with the seller, with the respect they deserve. No commitment that every deal is purchased; only an honest, documented process." />
          <div className="grid md:grid-cols-3 gap-6">
            {PROTECTION.map((p, i) => (
              <div key={p.t} className="reveal rounded-[3px] border border-[rgba(239,231,218,0.16)] bg-[rgba(239,231,218,0.04)] p-8" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="door-icon !mb-6"><p.icon className="w-5 h-5" strokeWidth={1.6} /></div>
                <h3 className="font-serif-display text-2xl text-[var(--cream)] mb-3 leading-tight">{p.t}</h3>
                <p className="text-[var(--cream)]/70 text-[0.92rem] leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead eyebrow="The Pegasus Buy Box"
            title="What we are buying right now."
            copy="A guide, not a guarantee. If your deal lines up with most of this, send it. If it does not, send it anyway and we will tell you straight. Every deal is reviewed and subject to underwriting." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BUYBOX.map((b, i) => (
              <div key={b.label} className="surface-card reveal p-7" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="pg-label !text-[9px] text-[var(--accent)] mb-3">{b.label}</div>
                <p className="text-[var(--text-2)] text-[0.95rem] leading-relaxed">{b.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-7 text-[0.82rem] leading-relaxed text-[var(--muted)] max-w-2xl">
            The Buy Box is mock criteria for orientation and may change at any time. It is not an offer to purchase. Every submission is reviewed by a person and any purchase is subject to underwriting and a written agreement.
          </p>
        </div>
      </section>

      <SplitPaths go={go} openPeggy={() => go('contact')}
        heading="Three ways to work the deal"
        copy="Direct buy, assignment, or a JV. We pick the structure that fits the deal and put the terms in writing before anything moves."
        paths={JV_PATHS} />
    </>
  );
}

/* ----------------------------------------------------------------
   Secondary link strip — never a dead end
---------------------------------------------------------------- */
export function NextStep({ go, label, route }: { go: Nav; label: string; route: Parameters<Nav>[0] }) {
  return (
    <section className="py-12 border-b border-[var(--line)]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
        <button type="button" onClick={() => go(route)}
          className="link-underline pg-label !text-[10px] !tracking-[0.18em] text-[var(--accent)] inline-flex items-center gap-3 group">
          {label} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Final CTA band (three doors)
---------------------------------------------------------------- */
export function CTABand({ go, openPeggy, title, text }:
  { go: Nav; openPeggy: () => void; title: string; text: string }) {
  return (
    <section className="relative py-28 lg:py-36 overflow-hidden bg-[var(--navy)] text-[var(--cream)]">
      <img src={IMG('pegasus-closing.png')} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-25" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(13,27,44,0.9), rgba(13,27,44,0.55))' }} />
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12 text-center">
        <div className="pg-label text-[var(--accent-bright)] mb-7 reveal">Dream it · Build it · Live it</div>
        <h2 className="font-serif-display font-light text-5xl md:text-7xl leading-[1.02] tracking-[-0.01em] max-w-3xl mx-auto reveal delay-100">{title}</h2>
        <p className="text-[var(--cream)]/75 max-w-xl mx-auto mt-7 leading-relaxed reveal delay-200">{text}</p>
        <div className="flex flex-wrap gap-4 justify-center mt-11 reveal delay-300">
          <button type="button" onClick={() => go('contact')} className="btn-solid-light px-9 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
            Start a Property Review <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button type="button" onClick={openPeggy} className="btn-line-light px-9 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
            <ConciergeBell className="w-3.5 h-3.5" strokeWidth={1.7} /> Talk to PeggyAI
          </button>
          <button type="button" onClick={() => go('strategylab')} className="btn-line-light px-9 py-4 pg-label !text-[10px]">Enter the Strategy Lab</button>
        </div>
      </div>
    </section>
  );
}
