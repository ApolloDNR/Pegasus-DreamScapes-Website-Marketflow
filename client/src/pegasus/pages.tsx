import React from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, ConciergeBell, Check, Send, Calculator, Compass, Ruler, Landmark, ClipboardList, Layers, Hammer, BadgeCheck } from 'lucide-react';
import type { Nav, Theme, Category, FormCfg, PeggyHandoff } from './theme';
import { IMG, SectionHead, ContourLines, BrandMark } from './primitives';
import {
  CATEGORIES, PILLARS3, FAQ_HOME, APOLLO, NELSON, MARKETFLOW, PEGGY_ROLES, PEGGY_SLA,
} from './data';
import {
  PageHero, Hero, HomeIntro, ThreePillarsBlock, PillarSection, ProcessSteps,
  EngineBlock, DealReadStepper, DoorsBlock, ProductLadderBlock, MarketFlowBlock, EcosystemBlock,
  ApolloBlock, ProofStats, NelsonProof, DoctrineBlock, FAQBlock, Qualifier,
  SplitPaths, NextStep, CTABand, DealFindersExtras, HowADealMovesBlock, ParticipationLanesBlock, StrategyLabFeature, LaneCardsBlock, PegasusStandardBand,
} from './blocks';
import {
  LeadSection, StrategyCalculator, StrategyCommandBoard, StrategyConsole, useStrategyModel, CONTACT_FORM, STRATEGYLAB_FORM, INVESTMENTS_FORM, APOLLO_FORM,
} from './forms';

const INVESTMENTS = PILLARS3[0];

const MARKETFLOW_FORM: FormCfg = {
  role: 'Deal finder / Wholesaler',
  roleOptions: [
    'Deal finder / Wholesaler',
    'Buyer / Investor',
    'Capital partner',
    'Agent / Vendor',
    'Other',
  ],
  intent: 'marketflow-access',
  heading: <>Request <span className="italic text-[var(--accent-bright)]">access.</span></>,
  lead: 'MarketFlow is private, reviewed access. Tell us how you operate or where your capital sits, and our team will review your fit for the network.',
  submit: 'Request MarketFlow Access',
  third: { label: 'Firm, fund, or trade', placeholder: 'Where you operate (optional)' },
  messageLabel: 'How you participate',
  messagePlaceholder: 'Share your market, role, capacity, buy box, or the deal types you focus on.',
};

const MARKETFLOW_PREVIEW = [
  { tag: 'Opportunity record', title: 'Value-add property file', lines: ['Basis, scope, timeline, and source', 'Lane fit and next review step', 'Shown only after approval'] },
  { tag: 'Operator profile', title: 'Licensed GC profile', lines: ['Trade and license reviewed', 'References and capacity noted', 'Matched to the right project type'] },
  { tag: 'Buyer interest', title: 'Capital partner mandate', lines: ['Check size & risk band', 'Asset types they back', 'Matched to projects, not pools'] },
  { tag: 'Trust layer', title: 'Verification badges', lines: ['Identity & license reviewed', 'Source attribution logged', 'Written terms before introductions'] },
];

const APOLLO_REP = {
  seller: {
    label: 'Seller representation',
    desc: 'List with an investor’s read on price, prep, and timing. Standard listing agreement and full MLS exposure, with the Pegasus standard behind it.',
    points: ['Pricing backed by real underwriting, not a guess', 'Prep and staging guidance that earns its cost', 'A strategy for timing, not just a sign in the yard'],
  },
  buyer: {
    label: 'Buyer representation',
    desc: 'Make offers backed by real numbers, and see opportunities through the Pegasus network before they reach the open market.',
    points: ['Offers grounded in what a property is actually worth', 'First look at repositioned and newly built homes', 'A plain read when the right move is to wait or walk'],
  },
};

// PRD §7.11 required copy (issue #22), locked verbatim, plus the page-level
// no-agreement clarifier.
const APOLLO_DISCLOSURE =
  'Paolo “Apollo” Duran · Licensed California real estate salesperson · CA DRE #02333658 · Keller Williams Realty East Bay (each office independently owned and operated). Pegasus Dreamscapes Corp. is not a real estate brokerage. Licensed real estate representation, when applicable, is provided by Paolo “Apollo” Duran through Keller Williams East Bay. No agency relationship is created without a written agreement. This page is not a listing or buyer-representation agreement.';

/* ================================================================
   HOME
   ================================================================ */
export function HomePage({ go, theme, parallaxRef, openPeggy }:
  { go: Nav; theme: Theme; parallaxRef: React.RefObject<HTMLDivElement | null>; openPeggy: () => void }) {
  return (
    <>
      {/* PRD §6.2 homepage order (issue #22): hero → router → engine/departments →
          Strategy Lab → MarketFlow → Apollo → case study → Pegasus Standard → final CTA. */}
      <Hero go={go} theme={theme} parallaxRef={parallaxRef} openPeggy={openPeggy} />
      <HomeIntro go={go} />
      <HowADealMovesBlock />
      <StrategyLabFeature go={go} />
      <MarketFlowBlock go={go} dark />
      <ApolloBlock go={go} />
      <NelsonProof go={go} />
      <PegasusStandardBand go={go} />
      <FAQBlock items={FAQ_HOME} eyebrow="Common questions" title="The honest answers." allHref="/faq" />
      <CTABand go={go} openPeggy={openPeggy} primaryAction="submit" primaryLabel="Submit a Property"
        title="Have a property, deal, or situation worth reviewing?"
        text="Submit the property, explain the situation, and Pegasus will route it to the right lane." />
    </>
  );
}

/* ================================================================
   AUDIENCE CATEGORY PAGE
   ================================================================ */
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
            <p className="font-serif-display text-3xl md:text-[2.6rem] text-[var(--text)] leading-[1.15] tracking-[-0.01em]">{cat.quote}</p>
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
      <LeadSection cfg={cat.form} eyebrow={cat.eyebrow} tone="navy" />
    </>
  );
}

/* ================================================================
   DEAL STRATEGY
   ================================================================ */
export function DealStrategyPage({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  return (
    <>
      <PageHero eyebrow="Deal Strategy"
        title={<>Deal <span className="italic text-[var(--accent-bright)]">Strategy.</span></>}
        image={IMG('pegasus-aerial.png')}
        scrimTop
        lead="A property is not a product. It is a situation with constraints, pressure, numbers, duty, and timing. Pegasus reads those parts before naming the path." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 reveal">
            <div className="img-zoom peggy-shadow aspect-[4/5]">
              <img src={IMG('pegasus-architecture.png')} alt="A precise scale model on a studio table" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-7 reveal delay-100">
            <div className="pg-label text-[var(--accent)] mb-5">Why it exists</div>
            <h2 className="font-serif-display text-4xl md:text-[3.2rem] leading-[1.05] tracking-[-0.01em] text-[var(--text)] mb-7">
              We never lead with the lane.
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-5 max-w-xl">
              Most real estate conversations start with the thing someone wants to sell: a listing, an offer, a loan, a JV, a contractor, or a buyer. Pegasus starts with the read.
            </p>
            <p className="text-[var(--muted)] leading-relaxed max-w-xl">
              Sometimes the responsible path is representation. Sometimes it is acquisition, value-add repositioning, development, MarketFlow routing, or a documented JV. Sometimes the honest answer is that Pegasus should pass.
            </p>
            <button type="button" onClick={() => go('submit')} data-testid="button-deal-strategy-submit"
              className="btn-primary mt-9 px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
              Start a Property Read <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>
      <DealReadStepper go={go} />
      <ProductLadderBlock go={go} openPeggy={openPeggy} />
      <DoorsBlock go={go} openPeggy={openPeggy} />
      <LeadSection cfg={CONTACT_FORM} eyebrow="Start a review" tone="navy" />
    </>
  );
}

/* ================================================================
   INVESTMENTS
   ================================================================ */
export function InvestmentsPage({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  return (
    <>
      <PageHero eyebrow="Pillar 01 · Investments"
        title={<>We acquire what <span className="italic text-[var(--accent-bright)]">others overlook.</span></>}
        image={IMG('pegasus-after.png')}
        scrimTop
        lead="Distressed, dated, and overlooked property. We buy it right, reposition it with discipline, and exit on a plan written before we close." />
      <PillarSection p={INVESTMENTS} go={go} />
      <Qualifier forYou={CATEGORIES.capital.forYou} notFit={CATEGORIES.capital.notFit} />
      <NextStep go={go} label="Partner on a deal as a capital partner" route="capital" />
      <LeadSection cfg={INVESTMENTS_FORM} eyebrow="Explore an investment" tone="navy" />
    </>
  );
}

/* ================================================================
   DEVELOPMENT
   ================================================================ */
const BUILD_PROCESS = [
  { n: '01', icon: ClipboardList, t: 'Scope & budget', d: 'Every project opens with a real budget and a draw schedule, agreed before the first hammer swings.' },
  { n: '02', icon: Layers, t: 'The right bench', d: 'Licensed GCs and subcontractors are matched to the job and scaled to the project, never limited to one crew.' },
  { n: '03', icon: Hammer, t: 'Build to standard', d: 'A written finish spec and punch list every job is held to, from a cosmetic refresh to a ground-up build.' },
  { n: '04', icon: BadgeCheck, t: 'Deliver, finished', d: 'Walked and handed over complete, on a real timeline, not left half-open.' },
];

function BuildProcessBlock() {
  return (
    <ProcessSteps eyebrow="How we build" title="Scope to finished product."
      copy="Every job is scoped before it starts, built to a written finish spec, and walked before we hand it over."
      steps={BUILD_PROCESS} />
  );
}

export function DevelopmentPage({ go }: { go: Nav }) {
  return (
    <>
      <PageHero eyebrow="Pillar 02 · Development"
        title={<>We build the <span className="italic text-[var(--accent-bright)]">finished product.</span></>}
        image={IMG('nelson/nelson-kitchen-1280.jpg')}
        lead="Renovation and ground-up development, scoped to a real budget and draw schedule, built to a written finish spec, and delivered finished." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[760px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[var(--muted)] leading-relaxed text-lg">
            Pegasus works with former GCs, project managers, and trades who have run real jobsites. We take on a small number of builds at a time and scope each one before committing. The budget, draw schedule, and finish spec go in writing first. Bring a property or a site and we'll walk the scope with you.
          </p>
          <button type="button" onClick={() => go('connect')} data-testid="button-development-connect"
            className="btn-primary mt-9 px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
            Start a build conversation <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>
    </>
  );
}

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

/* ================================================================
   STRATEGY LAB
   ================================================================ */
const LAB_OUTPUTS: Array<{ label: string; hint: string }> = [];

function LabPreview() {
  return (
    <section className="py-20 lg:py-24">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-4 reveal">
            <div className="pg-label text-[var(--accent)] mb-5">What you’ll model</div>
            <h2 className="font-serif-display text-4xl md:text-[2.6rem] leading-[1.08] tracking-[-0.01em] text-[var(--text)] mb-5">
              One cockpit in.<br />One clear read out.
            </h2>
            <p className="text-[var(--muted)] leading-relaxed max-w-md">
              The Strategy Lab now works as one cockpit: property signals, underwriting assumptions, lane fit, and next step in the same flow. Directional orientation only, not an offer or an underwrite.
            </p>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
            {LAB_OUTPUTS.map((o, i) => (
              <div key={o.label} className="surface-card reveal p-7 flex flex-col" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="pg-label !text-[8px] !tracking-[0.18em] text-[var(--accent)] mb-4">Output {String(i + 1).padStart(2, '0')}</div>
                <div className="font-serif-display text-xl text-[var(--text)] mb-2 leading-tight">{o.label}</div>
                <p className="text-[var(--muted)] text-[0.85rem] leading-relaxed">{o.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// The calm "one desk, one question" opening. A newcomer lands here on a single
// invitation and only steps up to the instruments (command board / console /
// calculator) once they choose to. Keeps the working machinery untouched —
// this is the entrance, not the engine.
function StrategyLabWelcome({ onBegin, go }: { onBegin: () => void; go: Nav }) {
  return (
    <section className="strategy-command-section strategy-cockpit-hero" data-testid="strategy-lab-welcome">
      <div className="strategy-welcome">
        <div className="pg-label text-[var(--accent-bright)]">Pegasus Strategy Lab</div>
        <h1 className="strategy-welcome-title mt-6 font-serif-display text-[var(--cream)]">
          Start with a single property.
        </h1>
        <p className="strategy-welcome-copy">
          Give me the numbers on one property and I&rsquo;ll show you the paths it could take &mdash;
          hold, improve, list, or step back &mdash; with a directional read you can think with.
          When it&rsquo;s worth a closer look, Apollo reviews it himself.
        </p>
        <div className="strategy-welcome-actions">
          <button
            type="button"
            onClick={onBegin}
            className="btn-solid-light inline-flex items-center gap-3 px-8 py-4 pg-label !text-[10px] group"
          >
            Begin a read
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            type="button"
            onClick={() => go('submit')}
            className="strategy-welcome-secondary"
          >
            Or send a property straight to Pegasus
          </button>
        </div>
        <p className="strategy-welcome-fine">
          Directional only. Not an offer, appraisal, legal advice, tax advice, financial advice,
          lending commitment, or investment recommendation.
        </p>
      </div>
    </section>
  );
}

export function StrategyLabPage({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  const model = useStrategyModel();
  const [entered, setEntered] = React.useState(false);

  if (!entered) {
    return <StrategyLabWelcome onBegin={() => setEntered(true)} go={go} />;
  }

  return (
    <>
      <StrategyCommandBoard go={go} model={model} />
      <div className="strategy-cockpit-flow">
        <StrategyConsole go={go} model={model} />
        <StrategyCalculator go={go} model={model} />
      </div>
      <LeadSection cfg={STRATEGYLAB_FORM} eyebrow="Property Read" tone="navy" strategy={model.snapshot} />
    </>
  );
}

/* ================================================================
   MARKETFLOW
   ================================================================ */
const MARKETFLOW_ACCESS = [
  { num: '01', title: 'Apply', desc: 'Tell us how you operate and where your capital or capacity sits. One short request, no obligation.' },
  { num: '02', title: 'We review fit', desc: 'Our team reviews every request for fit. We would rather add fewer partners and actually service them.' },
  { num: '03', title: 'You are introduced', desc: 'Approved members are onboarded to reviewed opportunities and the operators behind them, as fit appears.' },
];

export function MarketFlowPage({ go }: { go: Nav }) {
  return (
    <>
      {/* Master Blueprint v5.1 §18: MarketFlow presents as a private
          distribution network in CONTROLLED PILOT — it never overclaims
          scale, verification, or a public marketplace. */}
      <PageHero eyebrow="Systems · MarketFlow · Controlled pilot"
        title={<>A private network for <span className="italic text-[var(--accent-bright)]">reviewed opportunities.</span></>}
        image={IMG('pegasus-casestudy.png')}
        scrimTop
        lead="MarketFlow is Pegasus's private opportunity-distribution network, currently in a controlled pilot. It connects buyers, investors, deal finders, capital partners, vendors, and operators around opportunities Pegasus has already reviewed. Access is reviewed by a person, not open." />
      <MarketFlowBlock go={go} enter={{ label: 'Request MarketFlow Access', href: '#marketflow-request' }} />
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead eyebrow="A look inside"
            title="What members see."
            copy="A product preview of the records approved members use. No live deal inventory is published here; opportunities, profiles, and introductions only appear after reviewed access." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MARKETFLOW_PREVIEW.map((c, i) => (
              <div key={c.title} className="surface-card reveal p-7" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="pg-label !text-[8px] text-[var(--accent-ink)] mb-3">{c.tag}</div>
                <h3 className="font-serif-display text-xl text-[var(--text)] mb-4 leading-tight">{c.title}</h3>
                <ul className="space-y-2.5">
                  {c.lines.map((l) => (
                    <li key={l} className="flex gap-2.5 text-[var(--muted)] text-[0.85rem] leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" strokeWidth={2} /><span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-7 text-[0.8rem] text-[var(--muted)] max-w-2xl">
            Preview content shows record types only. It is not live inventory, an offer, a listing, or a solicitation. Access is private and reviewed by a person; participation is subject to a written agreement.
          </p>
        </div>
      </section>
      <section className="relative py-24 lg:py-28 bg-[var(--navy)] text-[var(--cream)] overflow-hidden">
        <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[70%] text-[var(--accent-2)] opacity-[0.12] float-slow" />
        <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead dark eyebrow="How access works"
            title={<>Earned, not opened<br />to everyone.</>}
            copy="Membership is reviewed by a person. We protect the standard of the network over its size." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 lg:gap-8">
            {MARKETFLOW_ACCESS.map((s, i) => (
              <div key={i} className="reveal" style={{ animationDelay: `${i * 110}ms` }}>
                <div className="path-node relative z-10 w-[54px] h-[54px] rounded-full border border-[var(--accent-2)] bg-[var(--navy)] flex items-center justify-center mb-7">
                  <span className="font-serif-display text-xl text-[var(--accent-bright)]">{s.num}</span>
                </div>
                <h3 className="font-serif-display text-2xl text-[var(--cream)] mb-3">{s.title}</h3>
                <p className="text-[rgba(239,231,218,0.65)] text-[0.92rem] leading-relaxed lg:pr-4">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div id="marketflow-request" className="scroll-mt-24">
        <LeadSection cfg={MARKETFLOW_FORM} eyebrow="Request access" tone="page" showRole />
      </div>
    </>
  );
}

/* ================================================================
   WORK WITH APOLLO
   ================================================================ */
function RepLane({ rep }: { rep: { label: string; desc: string; points: string[] } }) {
  return (
    <div className="surface-card reveal h-full p-6 sm:p-8 lg:p-9">
      <div className="pg-label !text-[9px] text-[var(--accent-ink)] mb-4">{rep.label}</div>
      <p className="text-[var(--text-2)] leading-relaxed mb-6">{rep.desc}</p>
      <ul className="space-y-3.5">
        {rep.points.map((p) => (
          <li key={p} className="flex gap-3 text-[var(--muted)] text-[0.92rem] leading-relaxed">
            <Check className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" strokeWidth={2} /><span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Step 7 - visible sell/buy/situation/deal selector shown before the inline
// representation lead form. "Sell"/"Buy" scroll to the form (Apollo's two
// roleOptions); "complex situation"/"deal" route to the canonical /submit
// intake with a valid ?intent= so nothing falls back to a default.
const APOLLO_SELECTOR = [
  {
    key: 'sell',
    label: 'I want to sell',
    blurb: 'List with Apollo through Keller Williams Realty East Bay, priced and prepped with the Pegasus standard behind it. Pick “Seller representation” in the form below.',
    cta: 'Continue below',
    mode: 'form' as const,
  },
  {
    key: 'buy',
    label: 'I want to buy',
    blurb: 'Buyer representation with an investor’s read on every property, for owner-occupants and investors alike. Pick “Buyer representation” in the form below.',
    cta: 'Continue below',
    mode: 'form' as const,
  },
  {
    key: 'situation',
    label: 'I have a complex situation',
    blurb: 'Distressed, inherited, occupied, stalled, or up against a deadline? Send it for a property review and Apollo will lay out the real options, with no guaranteed offer until the numbers and the agreement are real.',
    cta: 'Request a Property Review',
    mode: 'link' as const,
    href: '/submit?intent=property',
  },
  {
    key: 'deal',
    label: 'I have a deal to submit',
    blurb: 'Bring a deal and get a straight answer. If it fits, Apollo may buy, partner, or route it, with written JV or compensation terms before anything moves.',
    cta: 'Submit a Deal',
    mode: 'link' as const,
    href: '/submit?intent=deal-jv',
  },
];

function ApolloSelector() {
  const [key, setKey] = React.useState('sell');
  const [, setLocation] = useLocation();
  const active = APOLLO_SELECTOR.find((s) => s.key === key) ?? APOLLO_SELECTOR[0];
  const onCta = () => {
    if (active.mode === 'form') {
      document.getElementById('apollo-lead')?.scrollIntoView({ behavior: 'smooth' });
    } else if (active.href) {
      setLocation(active.href);
    }
  };
  return (
    <section className="py-14 lg:py-16 border-b border-[var(--line)]" data-testid="section-apollo-selector">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 text-center">
        <div className="pg-label text-[var(--accent-ink)] mb-6">What brings you here?</div>
        <div className="flex flex-wrap justify-center gap-3 mb-8" role="group" aria-label="What brings you here?" data-testid="apollo-selector">
          {APOLLO_SELECTOR.map((s) => {
            const isActive = s.key === key;
            return (
              <button
                key={s.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setKey(s.key)}
                data-testid={`apollo-selector-${s.key}`}
                className={`rounded-full px-6 py-3 pg-label !text-[10px] !tracking-[0.16em] border transition-colors ${
                  isActive
                    ? 'border-[var(--accent)] text-[var(--accent-ink)] bg-[var(--accent)]/[0.08]'
                    : 'border-[var(--line)] text-[var(--muted)] hover:text-[var(--accent-ink)] hover:border-[var(--accent)]'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <p className="max-w-2xl mx-auto text-[var(--text-2)] leading-relaxed mb-8" data-testid="text-apollo-selector-blurb">
          {active.blurb}
        </p>
        <button
          type="button"
          onClick={onCta}
          data-testid="button-apollo-selector-cta"
          className="btn-primary px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group"
        >
          {active.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </section>
  );
}

export function WorkWithApolloPage({ go }: { go: Nav }) {
  return (
    <>
      {/* PRD §7.11 / COPY_DECK §13 locked hero (issue #22) */}
      <PageHero eyebrow="Work With Apollo"
        title={<>Founder-led strategy. <span className="italic text-[var(--accent-bright)]">Licensed representation when the lane fits.</span></>}
        image={IMG('pegasus-craft-blueprint.png')}
        lead="Paolo “Apollo” Duran leads Pegasus Dreamscapes as founder/operator. When buyer or seller representation is the right path, Apollo provides licensed real estate services through Keller Williams East Bay (CA DRE #02333658). Pegasus Dreamscapes is not a brokerage." />
      <ApolloBlock go={go} showCta={false} />
      <section className="py-20 lg:py-24 bg-[var(--bg-2)] border-y border-[var(--line)]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead eyebrow="Representation lanes" title="Sell or buy, represented."
            copy="Seller representation or buyer representation. Apollo represents sellers and buyers through Keller Williams Realty East Bay, with an investor's read on every transaction." />
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12 items-stretch">
            <RepLane rep={APOLLO_REP.seller} />
            <RepLane rep={APOLLO_REP.buyer} />
          </div>
          <div className="reveal rounded-[3px] border border-[var(--line)] bg-[var(--bg)] p-5 lg:p-6 flex gap-4 items-start">
            <BrandMark boxClassName="w-10 h-10 shrink-0" />
            <div>
              <p className="text-[0.8rem] leading-relaxed text-[var(--muted)]">{APOLLO_DISCLOSURE}</p>
              <p className="mt-3 text-[0.8rem] leading-relaxed text-[var(--muted)]">
                Equal Housing Opportunity. Representation is offered without regard to race, color, religion, sex, disability, familial status, or national origin.
              </p>
            </div>
          </div>
        </div>
      </section>
      <ApolloSelector />
      <div id="apollo-lead" className="scroll-mt-24">
        <LeadSection cfg={APOLLO_FORM} eyebrow="Represent with Apollo" tone="navy" showRole />
      </div>
    </>
  );
}

/* ================================================================
   ECOSYSTEM
   ================================================================ */
export function EcosystemPage({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  return (
    <>
      <PageHero eyebrow="Systems · The Ecosystem"
        title={<>One company. <span className="italic text-[var(--accent-bright)]">Every part feeds the next.</span></>}
        image={IMG('pegasus-closing.png')}
        lead="When the people who read the deal also build it, fund it, and bring it to market, nothing gets lost between steps. Every part runs on the same underwriting." />
      <EcosystemBlock go={go} openPeggy={openPeggy} />
      <ThreePillarsBlock go={go} />
      <MarketFlowBlock go={go} dark />
      <CTABand go={go} openPeggy={openPeggy}
        title="Plug into the whole machine."
        text="Whether you enter as a seller, a finder, a partner, or a buyer, the underwriting behind the deal is the same." />
    </>
  );
}

/* ================================================================
   PEGGY (first-class page)
   ================================================================ */
const PEGGY_PAGE_ROLE_KEYS = ['seller', 'dealfinder', 'capital', 'unsure'];
const PEGGY_PAGE_ROLES = PEGGY_PAGE_ROLE_KEYS
  .map((k) => PEGGY_ROLES.find((r) => r.role === k))
  .filter((r): r is (typeof PEGGY_ROLES)[number] => Boolean(r));

export function PeggyPage({ go, openPeggy }: { go: Nav; openPeggy: (role?: string) => void }) {
  return (
    <>
      <PageHero eyebrow="Systems · The front door · Early access"
        title={<>Meet <span className="italic text-[var(--accent-bright)]">Peggy.</span></>}
        image={IMG('pegasus-interior-v2.png')}
        lead="Describe a deal or a situation in plain language. Peggy asks the right questions, frames the options, and points you to the lane that fits. She hands you to a person the moment a deal needs a licensed read. In active training: live now for intake and orientation." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 reveal">
            <div className="pg-label text-[var(--accent)] mb-5">How Peggy helps</div>
            <h2 className="font-serif-display text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.01em] text-[var(--text)] mb-7">
              The fastest way to find your lane.
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-8 max-w-md">
              Not sure where you fit? Start here. Peggy takes a deal or a situation in your own words and points you to the right next step: a review, the Strategy Lab, or the right audience lane. She is in active training, so today she is live for intake and orientation while we keep widening what she can do. She hands you to a person the moment a deal needs a licensed read.
            </p>
            <ul className="space-y-4 mb-10">
              {['Open any time, no form to fill first', 'Plain language in, clear direction out', 'Hands you to a person when it matters'].map((t) => (
                <li key={t} className="flex gap-3.5 text-[var(--text-2)] leading-relaxed">
                  <Check className="w-4 h-4 text-[var(--accent)] mt-1 shrink-0" strokeWidth={2} /><span>{t}</span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => openPeggy()} className="btn-primary px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
              <ConciergeBell className="w-3.5 h-3.5" strokeWidth={1.7} /> Open Peggy
            </button>
          </div>
          <div className="lg:col-span-7 reveal delay-100">
            <div className="rounded-[3px] bg-[var(--navy)] text-[var(--cream)] p-8 lg:p-10 peggy-shadow overflow-hidden relative">
              <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[55%] text-[var(--accent-2)] opacity-[0.1]" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-7">
                  <div className="peggy-avatar"><BrandMark boxClassName="w-full h-full" onDark /></div>
                  <div className="leading-none">
                    <div className="font-serif-display text-2xl text-[var(--cream)]">Peggy</div>
                    <div className="flex items-center gap-2.5 mt-2">
                      <span className="pg-label !text-[8px] !tracking-[0.22em] text-[var(--accent-bright)]">Pegasus intake concierge</span>
                      <span className="inline-flex items-center gap-1.5 pg-label !text-[7px] !tracking-[0.16em] px-2 py-0.5 rounded-full border border-[var(--accent-bright)]/40 text-[var(--accent-bright)]" data-testid="badge-peggy-status">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-bright)]" aria-hidden="true" /> Early access · in training
                      </span>
                    </div>
                  </div>
                </div>
                <p className="peggy-msg mb-6">
                  I&rsquo;m Peggy. Tell me about a property, a deal, or what you&rsquo;re exploring, and I&rsquo;ll point you to the right path.
                </p>
                <div className="pg-label !text-[8px] !tracking-[0.22em] text-[var(--cream)]/45 mb-3">Pick where you fit and Peggy starts there</div>
                <div className="flex flex-col gap-2.5 mb-8">
                  {PEGGY_PAGE_ROLES.map((r) => (
                    <button key={r.role} type="button" onClick={() => openPeggy(r.role)} data-testid={`button-peggy-role-${r.role}`} className="peggy-chip text-left inline-flex items-center justify-between gap-3 group">
                      <span>{r.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:translate-x-0.5 group-hover:opacity-100 transition" />
                    </button>
                  ))}
                </div>
                <form className="peggy-input !relative !rounded-[3px]" onSubmit={(e) => { e.preventDefault(); openPeggy(); }}>
                  <input type="text" aria-label="Describe your deal" placeholder="Describe your deal..." />
                  <button type="submit" aria-label="Open Peggy"><Send className="w-4 h-4" strokeWidth={1.7} /></button>
                </form>
                <div className="pg-label !text-[8px] !tracking-[0.14em] normal-case text-[var(--cream)]/40 mt-4 text-center">{PEGGY_SLA}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative py-20 lg:py-24 border-t border-[var(--line-soft)] overflow-hidden">
        <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mb-14 reveal">
            <div className="pg-label text-[var(--accent)] mb-5">What Peggy can actually do</div>
            <h2 className="font-serif-display text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.01em] text-[var(--text)]">
              Fluent in the deal, not just the chat.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line-soft)] rounded-[3px] overflow-hidden">
            {[
              { icon: Calculator, title: 'Reads the numbers', desc: 'Talks basis, ARV, rehab budget, carry, and exit costs in plain language, so you walk in oriented.' },
              { icon: Compass, title: 'Routes the deal', desc: 'Sorts a situation into the right lane: a sale, a value-add, a capital placement, or a referral.' },
              { icon: Ruler, title: 'Scopes the work', desc: 'Speaks to draw schedules, scope discipline, and what a renovation timeline really looks like.' },
              { icon: Landmark, title: 'Hands to a person', desc: 'Knows its limits. When a deal needs a licensed read, it sets up the handoff and the transcript travels with it.' },
            ].map((c, i) => (
              <div key={c.title} className={`bg-[var(--bg)] p-8 lg:p-9 reveal`} style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="w-11 h-11 rounded-[3px] bg-[rgba(213,127,46,0.1)] flex items-center justify-center mb-6">
                  <c.icon className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.7} />
                </div>
                <div className="font-serif-display text-xl text-[var(--text)] mb-3">{c.title}</div>
                <p className="text-[var(--muted)] text-[0.92rem] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <DoorsBlock go={go} openPeggy={openPeggy} />
      <LeadSection cfg={CONTACT_FORM} eyebrow="Prefer a person?" tone="navy" />
    </>
  );
}

/* ================================================================
   ABOUT
   ================================================================ */
export function AboutPage({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  return (
    <>
      {/* Master Blueprint v5.1 §12: why Pegasus exists, the founder story,
          the honest current state, and the long-term vision clearly labeled
          as future direction. The hero backdrop is Nelson Drive — a real,
          completed project, not atmosphere. */}
      <PageHero eyebrow="About the Firm"
        title={<>Why Pegasus <span className="italic text-[var(--accent-bright)]">exists.</span></>}
        image={IMG('nelson/curb.webp')}
        lead="Complex properties usually fail because the pieces live in different hands: the read, the money, the build, the sale. Pegasus DreamScapes was built to hold them together, one accountable operator carrying a deal from first look to final outcome." />
      <ApolloBlock go={go} showCta={false} />
      <section className="py-20 lg:py-24">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead eyebrow="Where the firm stands today"
            title="Founder-led, and honest about it."
            copy="Pegasus is founder-led. The operating record is real and small: sourced, structured, built, and sold in-house, with licensed representation through Keller Williams East Bay and specialized work performed by appropriately licensed professionals. We would rather show one finished project truthfully than imply a staff we do not have." />
          <button type="button" onClick={() => go('ourwork')}
            className="btn-line px-7 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
            See the Nelson Drive project <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
      <DoctrineBlock dark />
      <ProofStats />
      {/* Long-term vision, explicitly labeled future (§12). */}
      <section className="hv-photoband" aria-label="Long-term direction">
        <img src={IMG('hall/colonnade-hero-1600.webp')}
          alt="Concept render: a warm marble colonnade at dusk. Long-term design direction, not current inventory."
          loading="lazy" />
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow">The long horizon</div>
          <p className="font-serif-display">Communities built to a classical standard.</p>
          <p className="pg-label !text-[9px] !tracking-[0.2em] text-[rgba(245,230,211,0.6)] mt-4">
            Long-term development direction, not current inventory
          </p>
        </div>
      </section>
      <CTABand go={go} openPeggy={openPeggy}
        primaryLabel="Start with one honest read"
        title="Start with one honest read."
        text="If you have a property, a question, or capital to deploy, start a conversation. The right path, or no path." />
    </>
  );
}

/* ================================================================
   CONTACT
   ================================================================ */
export function ContactPage({ handoff = null }: { handoff?: PeggyHandoff | null }) {
  return <LeadSection cfg={CONTACT_FORM} eyebrow="Start a property review" showRole tone="page" handoff={handoff} />;
}

/* ================================================================
   FOOTER
   ================================================================ */
function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="md:col-span-2">
      <div className="pg-label !text-[9px] text-[var(--accent-bright)] mb-5">{title}</div>
      <ul className="space-y-3 pg-label !text-[10px] !tracking-[0.16em] text-[var(--cream)]/70">{children}</ul>
    </div>
  );
}

function FooterLink({ label, onClick, tag }: { label: string; onClick: () => void; tag?: string }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="link-underline text-left">
        {label}
        {tag && <span className="ml-2 align-middle text-[var(--accent-bright)] !text-[8px]">{tag}</span>}
      </button>
    </li>
  );
}

export function Footer({ go }: { go: Nav }) {
  const [, setLocation] = useLocation();
  return (
    <footer className="bg-[var(--navy)] text-[var(--cream)]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 lg:gap-12">
          <div className="col-span-2 md:col-span-4">
            <button type="button" onClick={() => go('home')} className="flex items-center gap-3.5 mb-6">
              <BrandMark boxClassName="w-12 h-12" onDark />
              <div className="flex flex-col leading-none text-left">
                <span className="font-serif-display text-[24px] tracking-[0.05em]">Pegasus Dreamscapes</span>
                <span className="pg-label !text-[9px] !tracking-[0.34em] text-[var(--accent-bright)] mt-1.5">Development &middot; Investments &middot; Systems</span>
              </div>
            </button>
            <p className="font-serif-display italic text-xl text-[var(--cream)]/80 max-w-sm leading-snug">
              Dream it. Build it. Live it.
            </p>
            <ul className="mt-6 space-y-2.5 pg-label !text-[10px] !tracking-[0.16em] text-[var(--cream)]/70">
              <li><a href="mailto:apollo@pegasusdreamscapes.com" className="link-underline break-all">apollo@pegasusdreamscapes.com</a></li>
              <li><a href="tel:9257448525" className="link-underline">925-744-8525</a></li>
              <li>East Bay · CA</li>
            </ul>
          </div>

          {/* Footer link map per PRD §5.2 (issue #22): the audience lanes,
              the proof + vision pages, and the legal set. */}
          <FooterCol title="Who We Serve">
            <FooterLink label="Sellers & Owners" onClick={() => go('sellers')} />
            <FooterLink label="Deal Finders" onClick={() => go('dealfinders')} />
            <FooterLink label="Buyers" onClick={() => go('buyers')} />
            <FooterLink label="Capital Partners" onClick={() => go('capital')} />
            <FooterLink label="Operators & Vendors" onClick={() => go('operators')} />
            <FooterLink label="Referral Partners" onClick={() => go('referral')} />
          </FooterCol>

          <FooterCol title="Company">
            <FooterLink label="About the Firm" onClick={() => go('about')} />
            <FooterLink label="How We Operate" onClick={() => go('dealstrategy')} />
            <FooterLink label="Our Work" onClick={() => go('ourwork')} />
            <FooterLink label="Departments" onClick={() => setLocation('/departments')} />
            <FooterLink label="Work With Apollo" onClick={() => go('apollo')} />
            <FooterLink label="Case Study" onClick={() => setLocation('/case-study')} />
            <FooterLink label="The Pegasus Standard" onClick={() => setLocation('/pegasus-standard')} />
          </FooterCol>

          <FooterCol title="Start Here">
            {/* v5.1 §31: the primary public action. */}
            <FooterLink label="Bring an Opportunity" onClick={() => setLocation('/bring-an-opportunity')} />
            <FooterLink label="Strategy Lab" onClick={() => go('strategylab')} />
            <FooterLink label="MarketFlow" onClick={() => go('marketflow')} />
            <FooterLink label="Contact" onClick={() => go('contact')} />
          </FooterCol>

          <FooterCol title="Legal">
            <FooterLink label="Privacy Policy" onClick={() => setLocation('/privacy')} />
            <FooterLink label="Terms" onClick={() => setLocation('/terms')} />
            <FooterLink label="Disclosures" onClick={() => setLocation('/disclosures')} />
            <FooterLink label="FAQ" onClick={() => setLocation('/faq')} />
          </FooterCol>
        </div>
        <div className="mt-16 pt-8 border-t border-[rgba(239,231,218,0.16)] flex flex-col gap-5">
          <p className="text-[var(--cream)]/55 text-[11px] leading-relaxed tracking-[0.03em] max-w-3xl" data-testid="text-footer-identity">
            Pegasus Dreamscapes Corp. is a real estate investment, development, and strategy company. Pegasus Dreamscapes Corp. is not a real estate brokerage. Licensed real estate representation, when applicable, is provided by Paolo &ldquo;Apollo&rdquo; Duran through Keller Williams East Bay. CA DRE #02333658. No agency relationship is created without a written agreement. Strategy reviews are preliminary and are not legal, tax, lending, appraisal, financial, or investment advice. Each Keller Williams office is independently owned and operated. Equal Housing Opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pg-label !text-[9px] !tracking-[0.16em] text-[var(--cream)]/55">
            <span>© {new Date().getFullYear()} Pegasus Dreamscapes Corp. All rights reserved.</span>
            <span>NAR · CAR · Equal Housing Opportunity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
