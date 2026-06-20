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
  SplitPaths, NextStep, CTABand, DealFindersExtras, HowADealMovesBlock, ParticipationLanesBlock, StrategyLabFeature, LaneCardsBlock,
} from './blocks';
import {
  LeadSection, StrategyCalculator, StrategyCommandBoard, StrategyConsole, StrategyTierStrip, useStrategyModel, CONTACT_FORM, STRATEGYLAB_FORM, INVESTMENTS_FORM, APOLLO_FORM,
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

const APOLLO_DISCLOSURE =
  'Paolo “Apollo” Duran · Licensed California real estate salesperson · DRE #02333658 · Keller Williams Realty East Bay (each office independently owned and operated). Pegasus Dreamscapes is not a licensed brokerage; agency representation is provided through Keller Williams Realty East Bay. This page is not a listing or buyer-representation agreement.';

/* ================================================================
   HOME
   ================================================================ */
export function HomePage({ go, theme, parallaxRef, openPeggy }:
  { go: Nav; theme: Theme; parallaxRef: React.RefObject<HTMLDivElement | null>; openPeggy: () => void }) {
  return (
    <>
      <Hero go={go} theme={theme} parallaxRef={parallaxRef} openPeggy={openPeggy} />
      <HomeIntro />
      <HowADealMovesBlock />
      <StrategyLabFeature go={go} />
      <NelsonProof go={go} />
      <ApolloBlock go={go} portrait={false} />
      <MarketFlowBlock go={go} dark />
      <FAQBlock items={FAQ_HOME} eyebrow="Common questions" title="The honest answers." allHref="/faq" />
      <CTABand go={go} openPeggy={openPeggy} primaryAction="submit" primaryLabel="Submit a Property"
        title="Send us the situation. We'll map the path forward."
        text="Complex, distressed, inherited, or simply complicated: every property gets a plain-language read. No pressure, no obligation." />
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
      <PageHero eyebrow="What we do · The engine"
        title={<>Deal <span className="italic text-[var(--accent-bright)]">Strategy.</span></>}
        image={IMG('pegasus-aerial.png')}
        scrimTop
        lead="Where every Pegasus relationship starts. We read the property and the numbers once, properly, then show you the route forward: the lane that genuinely fits the deal and the person in front of it." />
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
              Most operators have one product and try to fit every situation into it. We do the opposite. We read the situation first (the property, the numbers, the person and their constraints) and only then design the route.
            </p>
            <p className="text-[var(--muted)] leading-relaxed max-w-xl">
              Sometimes that route is a fast sale. Sometimes a value-add reposition, a ground-up build, or a capital partnership. Sometimes the honest answer is that there is no deal, and we will tell you that too.
            </p>
            <button type="button" onClick={() => go('submit')} data-testid="button-deal-strategy-submit"
              className="btn-primary mt-9 px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
              Submit a Deal <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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

const LAB_STEPS = [
  { n: '01', icon: Compass, t: 'Describe the property', d: 'Location, property type, condition, occupancy, your role, and your goal. The console returns a Property Fit Score and flags the right lane before you touch a number.' },
  { n: '02', icon: Calculator, t: 'Underwrite the spread', d: 'Set acquisition basis, rehab scope, hold costs, and exit strategy. The Instant Strategy Preview models carry costs, selling costs, and live margin in real time.' },
  { n: '03', icon: Ruler, t: 'Get a written Property Read', d: 'Hand the situation to the team. A short, candid written read of the path and the risk — not a form letter, back within 48 hours.' },
  { n: '04', icon: Landmark, t: 'Request Blueprint review', d: 'For deals that earn a deeper plan after a Property Read: scope, capital stack, construction approach, exit, and risk in one reviewed engagement.' },
];

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
            Pegasus works with former GCs, project managers, and trades who have run real jobsites. We take on a small number of builds at a time and scope each one before committing — the budget, the draw schedule, and the finish spec in writing first. Bring a property or a site and we'll walk the scope with you.
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
      <PageHero eyebrow="Capital partners"
        title={<>Back specific <span className="italic text-[var(--accent-bright)]">projects.</span></>}
        image={IMG('pegasus-closing.png')}
        lead="Pegasus works with a small number of capital partners on individual real estate projects, reviewed one deal at a time." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[760px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[var(--muted)] leading-relaxed text-lg mb-6">
            Capital partnerships are arranged privately, one project at a time, through direct conversation — never a blind pool. Terms are specific to the project and put in writing before anything moves. If that is how you prefer to work, start a conversation.
          </p>
          <p className="text-[var(--text-2)] text-[0.95rem] leading-relaxed mb-9" data-testid="text-capital-securities">
            No securities are offered through this website.
          </p>
          <button type="button" onClick={() => go('connect')} data-testid="button-capital-connect"
            className="btn-primary px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
            Start a conversation <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
const LAB_OUTPUTS = [
  { label: 'All-in basis', hint: 'Calculated after your acquisition, repair, carry, and exit assumptions are entered.' },
  { label: 'Spread logic', hint: 'The Lab compares your estimated basis against projected delivered value, then flags whether the spread looks strong, thin, or incomplete.' },
  { label: 'Lane fit', hint: 'Possible lanes include Retail Listing, Value-Add Rehab, ADU / Development Screen, Partner / JV Review, MarketFlow Disposition, or Deal Blueprint.' },
  { label: 'Recommended next step', hint: 'Request a written Property Read when the numbers, condition, title, occupancy, and timeline need a closer review.' },
];

function LabPreview() {
  return (
    <section className="py-20 lg:py-24">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-4 reveal">
            <div className="pg-label text-[var(--accent)] mb-5">What you’ll model</div>
            <h2 className="font-serif-display text-4xl md:text-[2.6rem] leading-[1.08] tracking-[-0.01em] text-[var(--text)] mb-5">
              Put one property in.<br />Read four things out.
            </h2>
            <p className="text-[var(--muted)] leading-relaxed max-w-md">
              This is the framework the Lab works through. Enter the property and the numbers in the console below and it generates your read after your input. Directional orientation only, not an offer or an underwrite.
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

export function StrategyLabPage({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  const model = useStrategyModel();
  return (
    <>
      <StrategyCommandBoard go={go} model={model} />
      <ProcessSteps eyebrow="How the Lab works" title="From a property to a plan."
        copy="Four steps, increasing depth. Start self-serve, go as far as the deal deserves, and hand it to a person whenever you want."
        steps={LAB_STEPS} />
      <LabPreview />
      <div id="strategy-console" className="scroll-mt-24">
        <StrategyConsole go={go} model={model} />
      </div>
      <StrategyCalculator go={go} model={model} />
      <StrategyTierStrip />
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
  { num: '03', title: 'You are introduced', desc: 'Approved members are onboarded to reviewed dealflow and the operators behind it, as opportunities match.' },
];

export function MarketFlowPage({ go }: { go: Nav }) {
  return (
    <>
      <PageHero eyebrow="Systems · MarketFlow" title="MarketFlow"
        image={IMG('pegasus-casestudy.png')}
        scrimTop
        lead="A private, vetted network — not an open marketplace. Reviewed deals, capital, and finished product move between people who have been checked out. Access is requested, and our team reviews every fit." />
      <MarketFlowBlock go={go} enter={{ label: 'Request MarketFlow Access', href: '#marketflow-request' }} />
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead eyebrow="A look inside"
            title="What members see."
            copy="A product preview of the records approved members use. No live deal inventory is published here; dealflow, profiles, and introductions only appear after reviewed access." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MARKETFLOW_PREVIEW.map((c, i) => (
              <div key={c.title} className="surface-card reveal p-7" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="pg-label !text-[8px] text-[var(--accent)] mb-3">{c.tag}</div>
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
      <div className="pg-label !text-[9px] text-[var(--accent)] mb-4">{rep.label}</div>
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

// Step 7 — visible sell/buy/situation/deal selector shown before the inline
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
        <div className="pg-label text-[var(--accent)] mb-6">What brings you here?</div>
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
                    ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/[0.08]'
                    : 'border-[var(--line)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]'
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
      <PageHero eyebrow="What we do · Representation"
        title={<>Represent with <span className="italic text-[var(--accent-bright)]">Apollo.</span></>}
        image={IMG('pegasus-craft-blueprint.png')}
        lead="When agency representation is the right lane, Apollo is your agent through Keller Williams Realty East Bay (DRE #02333658), backed by the full Pegasus standard. Pegasus Dreamscapes is not a brokerage." />
      <ApolloBlock go={go} showCta={false} />
      <section className="py-20 lg:py-24 bg-[var(--bg-2)] border-y border-[var(--line)]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead eyebrow="Representation lanes" title="Sell or buy, represented."
            copy="Seller representation or buyer representation — Apollo represents sellers and buyers through Keller Williams Realty East Bay, with an investor's read on every transaction." />
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
        title={<>Meet <span className="italic text-[var(--accent-bright)]">PeggyAI.</span></>}
        image={IMG('pegasus-interior-v2.png')}
        lead="Describe a deal or a situation in plain language. Peggy asks the right questions, frames the options, and points you to the lane that fits — then hands you to a person the moment a deal needs a licensed read. In active training: live now for intake and orientation." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 reveal">
            <div className="pg-label text-[var(--accent)] mb-5">How Peggy helps</div>
            <h2 className="font-serif-display text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.01em] text-[var(--text)] mb-7">
              The fastest way to find your lane.
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-8 max-w-md">
              Not sure where you fit? Start here. Peggy takes a deal or a situation in your own words and points you to the right next step: a review, the Strategy Lab, or the right audience lane. She is in active training, so today she is live for intake and orientation while we keep widening what she can do — and she hands you to a person the moment a deal needs a licensed read.
            </p>
            <ul className="space-y-4 mb-10">
              {['Open any time, no form to fill first', 'Plain language in, clear direction out', 'Hands you to a person when it matters'].map((t) => (
                <li key={t} className="flex gap-3.5 text-[var(--text-2)] leading-relaxed">
                  <Check className="w-4 h-4 text-[var(--accent)] mt-1 shrink-0" strokeWidth={2} /><span>{t}</span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => openPeggy()} className="btn-primary px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
              <ConciergeBell className="w-3.5 h-3.5" strokeWidth={1.7} /> Open PeggyAI
            </button>
          </div>
          <div className="lg:col-span-7 reveal delay-100">
            <div className="rounded-[3px] bg-[var(--navy)] text-[var(--cream)] p-8 lg:p-10 peggy-shadow overflow-hidden relative">
              <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[55%] text-[var(--accent-2)] opacity-[0.1]" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-7">
                  <div className="peggy-avatar"><BrandMark boxClassName="w-full h-full" onDark /></div>
                  <div className="leading-none">
                    <div className="font-serif-display text-2xl text-[var(--cream)]">PeggyAI</div>
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
                  <button type="submit" aria-label="Open PeggyAI"><Send className="w-4 h-4" strokeWidth={1.7} /></button>
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
      <PageHero eyebrow="The Firm"
        title={<>Deal <span className="italic text-[var(--accent-bright)]">strategy.</span></>}
        image={IMG('hero/luxury-home-1280.jpg')}
        lead="Pegasus Dreamscapes is a real estate investment, development, and systems company in the East Bay. One firm that reads the situation, underwrites the numbers, builds the work, and sees a deal through, instead of handing you off." />
      <ApolloBlock go={go} showCta={false} />
      <DoctrineBlock dark />
      <ProofStats />
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
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 lg:gap-12">
          <div className="col-span-2 md:col-span-4">
            <button type="button" onClick={() => go('home')} className="flex items-center gap-3.5 mb-6">
              <BrandMark boxClassName="w-12 h-12" onDark />
              <div className="flex flex-col leading-none text-left">
                <span className="font-serif-display text-[24px] tracking-[0.05em]">Pegasus Dreamscapes</span>
                <span className="pg-label !text-[9px] !tracking-[0.34em] text-[var(--accent-bright)] mt-1.5">Deal Strategy</span>
              </div>
            </button>
            <p className="font-serif-display italic text-xl text-[var(--cream)]/80 max-w-sm leading-snug">
              We read the situation, underwrite the numbers, and tell you what the deal actually is.
            </p>
          </div>

          <FooterCol title="Company">
            <FooterLink label="About the Firm" onClick={() => go('about')} />
            <FooterLink label="Represent with Apollo" onClick={() => go('apollo')} />
            <FooterLink label="The Work" onClick={() => setLocation('/projects/nelson-dr')} />
            <FooterLink label="Pegasus Ecosystem" onClick={() => go('ecosystem')} />
          </FooterCol>

          <FooterCol title="Start here">
            <FooterLink label="Submit a Property" onClick={() => go('submit')} />
            <FooterLink label="Connect" onClick={() => go('connect')} />
          </FooterCol>

          <FooterCol title="Contact">
            <li><a href="mailto:apollo@pegasusdreamscapes.com" className="link-underline">apollo@pegasusdreamscapes.com</a></li>
            <li><a href="tel:9257448525" className="link-underline">925-744-8525</a></li>
            <li>East Bay · CA</li>
          </FooterCol>

          <FooterCol title="Legal">
            <FooterLink label="Privacy" onClick={() => setLocation('/privacy')} />
            <FooterLink label="Terms" onClick={() => setLocation('/terms')} />
            <FooterLink label="Disclosures" onClick={() => setLocation('/disclosures')} />
          </FooterCol>
        </div>
        <div className="mt-16 pt-8 border-t border-[rgba(239,231,218,0.16)] flex flex-col gap-5">
          <p className="text-[var(--cream)]/55 text-[11px] leading-relaxed tracking-[0.03em] max-w-3xl" data-testid="text-footer-identity">
            Paolo &ldquo;Apollo&rdquo; Duran · California DRE #02333658. Pegasus Dreamscapes Corp. is a real estate investment company, not a real estate brokerage. Licensed real estate services are provided separately by Apollo Duran through Keller Williams Realty East Bay — each office independently owned and operated. Nothing on this site is an offer of securities or a solicitation to invest, nor a valuation, appraisal, CMA, or BPO of any specific property.
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
