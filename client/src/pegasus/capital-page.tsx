import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Nav } from './theme';
import { IMG } from './primitives';
import { PageHero } from './blocks';
import { CAPITAL_RELATIONSHIP_FORM, LeadForm } from './forms';

/* ================================================================
   CAPITAL (compliance-careful stub)
   ================================================================ */
export function CapitalPage({ go: _go }: { go: Nav }) {
  const scrollToIntroduction = () => {
    document.getElementById('capital-introduction')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <>
      <PageHero eyebrow="Introduced relationships"
        title={<>Capital should <span className="italic text-[var(--accent-bright)]">follow discipline.</span></>}
        image={IMG('pegasus-closing.png')}
        lead="Pegasus begins these conversations only through an existing relationship or a personal introduction. This page records relationship context; it does not present project terms or create access, eligibility, or an agreement." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[760px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[var(--muted)] leading-relaxed text-lg mb-6">
            If Apollo already knows you or someone personally connected you, use the introduction
            form below to identify that relationship. Do not send account details, tax identifiers,
            or other sensitive financial information.
          </p>
          <p className="text-[var(--text-2)] text-[0.95rem] leading-relaxed mb-9">
            A form submission records context only. Any later conversation is separate and
            conditional; neither side makes a commitment here.
          </p>
          <button type="button" onClick={scrollToIntroduction} data-testid="button-capital-connect"
            className="btn-primary px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
            Continue an Introduction <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <div className="mt-6">
            <a href="mailto:apollo@pegasusdreamscapes.com" className="link-underline pg-label !text-[10px] !tracking-[0.18em] text-[var(--muted)]">
              apollo@pegasusdreamscapes.com
            </a>
          </div>
        </div>
      </section>
      <section id="capital-introduction" className="scroll-mt-24 py-24 lg:py-28 bg-[var(--bg-2)] border-y border-[var(--line)]">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <div className="pg-label text-[var(--accent)] mb-5">Existing relationship or personal introduction</div>
            <h2 className="font-serif-display font-light text-4xl sm:text-5xl leading-[1.04] text-[var(--text)] mb-6">
              Continue the relationship privately.
            </h2>
            <p className="text-[var(--muted)] leading-relaxed">
              Identify who connected you and provide enough context for Apollo to recognize the
              relationship. This is not a general application.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="lead-card p-6 sm:p-8 lg:p-10">
              <LeadForm cfg={CAPITAL_RELATIONSHIP_FORM} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
