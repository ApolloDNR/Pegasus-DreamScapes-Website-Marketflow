import React from 'react';
import { Link } from 'wouter';
import { ArrowRight, BadgeCheck, ClipboardList, Hammer, Layers } from 'lucide-react';
import type { Category, CategoryTerminal, Nav } from './theme';
import { IMG } from './primitives';
import {
  DealFindersExtras,
  EcosystemBlock,
  EngineBlock,
  FAQBlock,
  MarketFlowBlock,
  NelsonProof,
  NextStep,
  PageHero,
  ProcessSteps,
  ProductLadderBlock,
  ProofStats,
  Qualifier,
  SplitPaths,
} from './blocks';
import { LeadSection } from './forms';

function WhatYouGet({ cat }: { cat: Category }) {
  const label = cat.pointsLabel ?? 'What you get';
  const layout = cat.layout ?? 'timeline';
  const num = (i: number) => String(i + 1).padStart(2, '0');

  if (layout === 'grid') {
    return (
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center mb-14 reveal">
            <div className="pg-label text-[var(--accent)] mb-5">{label}</div>
            <p className="font-serif-display italic text-2xl md:text-[1.9rem] text-[var(--text)] leading-snug">{cat.quote}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {cat.points.map((p, i) => (
              <div key={i} className="surface-card reveal flex gap-6 p-8" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="font-serif-display text-4xl text-[var(--accent)] leading-none shrink-0">{num(i)}</div>
                <div>
                  <h3 className="font-serif-display text-2xl text-[var(--text)] mb-2 leading-tight">{p.t}</h3>
                  <p className="text-[var(--muted)] text-[0.95rem] leading-relaxed">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'ledger') {
    return (
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5 reveal lg:sticky lg:top-28">
            <div className="pg-label text-[var(--accent)]">{label}</div>
            <div className="pg-rule mt-6 mb-7 max-w-[3rem] !bg-[var(--accent)] draw-x" />
            <p className="font-serif-display text-3xl md:text-[2.6rem] text-[var(--text)] leading-[1.15] tracking-normal">{cat.quote}</p>
          </div>
          <div className="lg:col-span-7">
            {cat.points.map((p, i) => (
              <div key={i} className="reveal flex gap-6 sm:gap-8 py-7 border-t border-[var(--line)] first:border-t-0 first:pt-0" style={{ animationDelay: `${i * 90}ms` }}>
                <div className="font-serif-display text-2xl text-[var(--accent)] leading-none shrink-0 pt-1 w-8">{num(i)}</div>
                <div>
                  <h3 className="font-serif-display text-2xl text-[var(--text)] mb-2 leading-tight">{p.t}</h3>
                  <p className="text-[var(--muted)] text-[0.95rem] leading-relaxed">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 lg:py-28">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-4 reveal">
            <div className="pg-label text-[var(--accent)]">{label}</div>
            <div className="pg-rule mt-6 mb-6 max-w-[3rem] !bg-[var(--accent)] draw-x" />
            <p className="font-serif-display italic text-2xl text-[var(--muted)] leading-snug">{cat.quote}</p>
          </div>
          <div className="lg:col-span-8 relative">
            <div aria-hidden="true" className="absolute left-[23px] sm:left-[27px] top-3 bottom-3 w-px bg-gradient-to-b from-[var(--accent)]/40 via-[var(--line)] to-transparent" />
            <ol>
              {cat.points.map((p, i) => (
                <li key={i} className="group reveal relative flex gap-5 sm:gap-7 pb-5 last:pb-0" style={{ animationDelay: `${i * 90}ms` }}>
                  <span className="relative z-10 shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[var(--accent)]/40 bg-[var(--bg)] font-serif-display text-lg sm:text-xl text-[var(--accent)] leading-none transition-all duration-500 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-white group-hover:shadow-[0_12px_26px_-12px_rgba(177,102,49,0.5)]">
                    {num(i)}
                  </span>
                  <div className="surface-card flex-1 p-6 sm:p-7">
                    <h3 className="font-serif-display text-2xl text-[var(--text)] mb-2">{p.t}</h3>
                    <p className="text-[var(--muted)] text-[0.95rem] leading-relaxed">{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

const BUILD_PROCESS = [
  { n: '01', icon: ClipboardList, t: 'Scope & budget', d: 'A future project agreement should define scope, exclusions, budget, draws, schedule assumptions, and change control before work.' },
  { n: '02', icon: Layers, t: 'Qualified providers', d: 'Required licenses, insurance, references, roles, and current capacity should be verified for the specific property and scope.' },
  { n: '03', icon: Hammer, t: 'Completion standard', d: 'Finish specifications, inspections, acceptance criteria, and punch-list responsibility belong in the project documents.' },
  { n: '04', icon: BadgeCheck, t: 'Handoff terms', d: 'Any agreement should state the handoff record, warranties if any, unresolved items, payment conditions, and remedies.' },
];

function BuildProcessBlock() {
  return (
    <ProcessSteps eyebrow="Project-control framework" title="Define the work before it starts."
      copy="These are example controls, not a claim of current staff, contractors, capacity, service, schedule, or delivery. Any work requires property-specific diligence and a signed agreement."
      steps={BUILD_PROCESS} />
  );
}

function TerminalRouteCta({ terminal }: { terminal: CategoryTerminal }) {
  return (
    <section className="relative overflow-hidden bg-[var(--navy)] py-24 text-[var(--cream)] lg:py-28">
      <div className="relative mx-auto grid max-w-[1100px] gap-10 px-6 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12">
        <div className="max-w-3xl">
          <div className="pg-label mb-5 text-[var(--accent-bright)]">{terminal.eyebrow}</div>
          <h2 className="font-serif-display text-4xl leading-[1.05] md:text-5xl [text-wrap:balance]">
            {terminal.title}
          </h2>
          <p className="mt-6 max-w-2xl text-[0.98rem] leading-relaxed text-[rgba(245,230,211,0.78)]">
            {terminal.copy}
          </p>
        </div>
        <Link
          href={terminal.href}
          className="btn-solid-light inline-flex items-center justify-center gap-3 px-8 py-4 pg-label !text-[10px] group"
          data-testid="link-category-formal-intake"
        >
          {terminal.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function CategoryPage({ cat, go, openPeggy }: { cat: Category; go: Nav; openPeggy: () => void }) {
  return (
    <>
      <PageHero eyebrow={cat.eyebrow} title={cat.title} image={IMG(cat.image)} lead={cat.lead} scrimTop={cat.heroScrimTop} />
      <WhatYouGet cat={cat} />
      {cat.splits && <SplitPaths go={go} openPeggy={openPeggy} heading={cat.splits.heading} copy={cat.splits.copy} paths={cat.splits.paths} founderPhoto={cat.splits.founderPhoto} peggyHint={cat.splits.peggyHint} />}
      <Qualifier forYou={cat.forYou} notFit={cat.notFit} />
      {cat.rich.includes('engine') && <EngineBlock go={go} />}
      {cat.rich.includes('ladder') && <ProductLadderBlock go={go} openPeggy={openPeggy} />}
      {cat.rich.includes('buybox') && <DealFindersExtras go={go} />}
      {cat.rich.includes('surfaces') && <EcosystemBlock go={go} openPeggy={openPeggy} />}
      {cat.rich.includes('proof') && <NelsonProof go={go} />}
      {cat.rich.includes('marketflow') && <MarketFlowBlock go={go} />}
      {cat.rich.includes('stats') && <ProofStats />}
      {cat.rich.includes('process') && <BuildProcessBlock />}
      {cat.rich.includes('faq') && cat.faq && <FAQBlock items={cat.faq} eyebrow="Questions" title="What people ask us." allHref={cat.faqAnchor ? `/faq#${cat.faqAnchor}` : '/faq'} />}
      {cat.secondary && <NextStep go={go} label={cat.secondary.label} route={cat.secondary.route} />}
      {cat.form ? (
        <LeadSection cfg={cat.form} eyebrow={cat.eyebrow} tone="navy" />
      ) : (
        <TerminalRouteCta terminal={cat.terminal} />
      )}
    </>
  );
}
