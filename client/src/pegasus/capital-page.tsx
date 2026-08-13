import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Nav } from './theme';
import { IMG } from './primitives';
import { PageHero } from './blocks';

/* ================================================================
   CAPITAL (compliance-careful stub)
   ================================================================ */
export function CapitalPage({ go }: { go: Nav }) {
  return (
    <>
      {/* COPY_DECK §8 locked hero + required no-public-offering note (issue #22) */}
      <PageHero eyebrow="Capital partners"
        title={<>Capital should <span className="italic text-[var(--accent-bright)]">follow discipline.</span></>}
        image={IMG('pegasus-closing.png')}
        lead="Pegasus reviews capital relationships project-by-project. No public offering, no guaranteed returns, no pooled fund. Any capital relationship must be privately reviewed and documented appropriately." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[760px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[var(--muted)] leading-relaxed text-lg mb-6">
            Capital partnerships are arranged privately, one project at a time, through direct conversation. Never a blind pool. Terms are specific to the project and put in writing before anything moves. If that is how you prefer to work, request a private review.
          </p>
          <p className="text-[var(--text-2)] text-[0.95rem] leading-relaxed mb-9" data-testid="text-capital-securities">
            No securities are offered through this website.
          </p>
          <button type="button" onClick={() => go('connect')} data-testid="button-capital-connect"
            className="btn-primary px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
            Request Private Review <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <div className="mt-6">
            <a href="mailto:apollo@pegasusdreamscapes.com" className="link-underline pg-label !text-[10px] !tracking-[0.18em] text-[var(--muted)]">
              apollo@pegasusdreamscapes.com
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
