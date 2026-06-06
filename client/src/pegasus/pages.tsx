import React from 'react';
import { ArrowRight, ConciergeBell, Check, Send, Calculator, Compass, Ruler, Landmark, ClipboardList, Layers, Hammer, BadgeCheck } from 'lucide-react';
import type { Nav, Theme, Category, FormCfg, PeggyHandoff } from './theme';
import { IMG, SectionHead, ContourLines, BrandMark } from './primitives';
import {
  CATEGORIES, PILLARS3, FAQ_HOME, APOLLO, NELSON, MARKETFLOW, PEGGY_CHIPS, PEGGY_SLA, DEV_TEAM,
} from './data';
import {
  PageHero, Hero, HomeIntro, LaneCardsBlock, ThreePillarsBlock, PillarSection, ProcessSteps,
  EngineBlock, DoorsBlock, ProductLadderBlock, MarketFlowBlock, EcosystemBlock,
  ApolloBlock, ProofStats, NelsonProof, DoctrineBlock, FAQBlock, Qualifier,
  SplitPaths, NextStep, CTABand, DealFindersExtras,
} from './blocks';
import {
  LeadSection, StrategyCalculator, StrategyConsole, useStrategyModel, CONTACT_FORM, DEVELOPMENT_FORM, STRATEGYLAB_FORM, INVESTMENTS_FORM, APOLLO_FORM,
} from './forms';

const INVESTMENTS = PILLARS3[0];
const DEVELOPMENT = PILLARS3[1];

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
  lead: 'MarketFlow is private, reviewed access. Tell us how you operate or where your capital sits, and a real person will review your fit for the network.',
  submit: 'Request access',
  third: { label: 'Firm, fund, or trade', placeholder: 'Where you operate (optional)' },
  messageLabel: 'How you participate',
  messagePlaceholder: 'Share your typical check size or build capacity, and the deal types you focus on.',
};

const MARKETFLOW_PREVIEW = [
  { tag: 'Sample deal card', title: 'Value-add SFR · East Bay', lines: ['All-in vs. delivered value', 'Scope & projected timeline', 'Status: reviewed · under contract'] },
  { tag: 'Operator profile', title: 'Licensed GC · verified operator', lines: ['Trade verified · references checked', 'On-time delivery record', 'Active in Contra Costa'] },
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
    points: ['Offers grounded in what a property is actually worth', 'First look at off-market and repositioned homes', 'A plain read when the right move is to wait or walk'],
  },
};

const APOLLO_DISCLOSURE =
  'Paolo “Apollo” Duran · Licensed California real estate salesperson · DRE #02333658 · Keller Williams Realty East Bay (each office independently owned and operated). Pegasus DreamScapes is not a licensed brokerage; agency representation is provided through Keller Williams Realty East Bay. This page is not a listing or buyer-representation agreement.';

/* ================================================================
   HOME
   ================================================================ */
export function HomePage({ go, theme, parallaxRef, openPeggy }:
  { go: Nav; theme: Theme; parallaxRef: React.RefObject<HTMLDivElement | null>; openPeggy: () => void }) {
  return (
    <>
      <Hero go={go} theme={theme} parallaxRef={parallaxRef} openPeggy={openPeggy} />
      <HomeIntro />
      <LaneCardsBlock go={go} />
      <ThreePillarsBlock go={go} />
      <EngineBlock go={go} />
      <ProductLadderBlock go={go} openPeggy={openPeggy} />
      <MarketFlowBlock go={go} />
      <ApolloBlock go={go} />
      <PillarSection p={DEVELOPMENT} go={go} flip dark numeral="DEV" />
      <EcosystemBlock go={go} openPeggy={openPeggy} />
      <ProofStats />
      <NelsonProof go={go} />
      <DoctrineBlock />
      <FAQBlock items={FAQ_HOME} eyebrow="Common questions" title="The honest answers." />
      <CTABand go={go} openPeggy={openPeggy}
        title="Send us the situation. We will architect the path."
        text="Complex, distressed, inherited, or simply complicated: every property gets a plain-language read. No pressure, no obligation." />
    </>
  );
}

/* ================================================================
   AUDIENCE CATEGORY PAGE
   ================================================================ */
export function CategoryPage({ cat, go, openPeggy }: { cat: Category; go: Nav; openPeggy: () => void }) {
  return (
    <>
      <PageHero eyebrow={cat.eyebrow} title={cat.title} image={IMG(cat.image)} lead={cat.lead} />
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-4 reveal">
              <div className="pg-label text-[var(--accent)]">What you get</div>
              <div className="pg-rule mt-6 mb-6 max-w-[3rem] !bg-[var(--accent)] draw-x" />
              <p className="font-serif-display italic text-2xl text-[var(--muted)] leading-snug">{cat.quote}</p>
            </div>
            <ol className="lg:col-span-8 relative">
              <div aria-hidden="true" className="absolute left-[23px] sm:left-[27px] top-3 bottom-3 w-px bg-gradient-to-b from-[var(--accent)]/40 via-[var(--line)] to-transparent" />
              {cat.points.map((p, i) => (
                <li key={i} className="group reveal relative flex gap-5 sm:gap-7 pb-5 last:pb-0" style={{ animationDelay: `${i * 90}ms` }}>
                  <span className="relative z-10 shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[var(--accent)]/40 bg-[var(--bg)] font-serif-display text-lg sm:text-xl text-[var(--accent)] leading-none transition-all duration-500 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-white group-hover:shadow-[0_12px_26px_-12px_rgba(177,102,49,0.5)]">
                    {String(i + 1).padStart(2, '0')}
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
      </section>
      {cat.splits && <SplitPaths go={go} openPeggy={openPeggy} heading={cat.splits.heading} copy={cat.splits.copy} paths={cat.splits.paths} founderPhoto={cat.splits.founderPhoto} peggyHint={cat.splits.peggyHint} />}
      <Qualifier forYou={cat.forYou} notFit={cat.notFit} />
      {cat.rich.includes('engine') && <EngineBlock go={go} />}
      {cat.rich.includes('ladder') && <ProductLadderBlock go={go} openPeggy={openPeggy} />}
      {cat.rich.includes('buybox') && <DealFindersExtras go={go} />}
      {cat.rich.includes('surfaces') && <EcosystemBlock go={go} openPeggy={openPeggy} />}
      {cat.rich.includes('faq') && cat.faq && <FAQBlock items={cat.faq} eyebrow="Questions" title="What people ask us." allHref={cat.faqAnchor ? `/faq#${cat.faqAnchor}` : '/faq'} />}
      {cat.secondary && <NextStep go={go} label={cat.secondary.label} route={cat.secondary.route} />}
      <LeadSection cfg={cat.form} eyebrow={cat.eyebrow} tone="navy" />
    </>
  );
}

/* ================================================================
   DEAL ARCHITECTURE
   ================================================================ */
export function DealArchitecturePage({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  return (
    <>
      <PageHero eyebrow="What we do · The engine"
        title={<>Deal <span className="italic text-[var(--accent-bright)]">Architecture.</span></>}
        image={IMG('pegasus-aerial.png')}
        lead="The core of the firm. One disciplined review, then the route forward: the lane that genuinely fits the deal and the person in front of it." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 reveal">
            <div className="img-zoom peggy-shadow aspect-[4/5]">
              <img src={IMG('pegasus-architecture.png')} alt="A precise architectural scale model on a studio table" className="w-full h-full object-cover" />
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
          </div>
        </div>
      </section>
      <EngineBlock go={go} />
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
        image={IMG('pegasus-aerial.png')}
        lead="Distressed, dated, off-market, and overlooked property. We buy it right, reposition it with discipline, and exit on a plan written before we close." />
      <PillarSection p={INVESTMENTS} go={go} />
      <NelsonProof go={go} />
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
  { n: '02', icon: Layers, t: 'The right bench', d: 'Vetted GCs and subcontractors are matched to the job and scaled to the project, never limited to one crew.' },
  { n: '03', icon: Hammer, t: 'Build to standard', d: 'One definition of done, applied the same way to every renovation and ground-up build.' },
  { n: '04', icon: BadgeCheck, t: 'Deliver, finished', d: 'Walked and handed over complete, on a real timeline, not left half-open.' },
];

function BuildProcessBlock() {
  return (
    <ProcessSteps eyebrow="How we build" title="Scope to finished product."
      copy="The same disciplined path on every job: planned before it starts, built to one standard, and delivered complete."
      steps={BUILD_PROCESS} />
  );
}

const LAB_STEPS = [
  { n: '01', icon: Compass, t: 'Start with the property', d: 'Describe the property and your goal. The console frames a Property Fit Score and points you to the right lane.' },
  { n: '02', icon: Calculator, t: 'Underwrite the numbers', d: 'Set basis, scope, and exit. The Instant Strategy Preview models carry and selling costs into a live margin.' },
  { n: '03', icon: Ruler, t: 'Get a written read', d: 'Send the situation for a human Strategy Snapshot: a short, candid read, usually within two business days.' },
  { n: '04', icon: Landmark, t: 'Commission the Blueprint', d: 'When a deal earns it, the paid Deal Blueprint documents scope, capital, construction, exit, and risk.' },
];

export function DevelopmentPage({ go }: { go: Nav }) {
  return (
    <>
      <PageHero eyebrow="Pillar 02 · Development"
        title={<>We build the <span className="italic text-[var(--accent-bright)]">finished product.</span></>}
        image={IMG('pegasus-craft-blueprint.png')}
        lead="Our development team — former GCs, project managers, and trades with decades of combined experience — scopes every renovation and ground-up build to a real budget and draw schedule, and delivers on time, to a standard." />
      <PillarSection p={DEVELOPMENT} go={go} flip />
      <BuildProcessBlock />
      <section className="py-24 lg:py-28 bg-[var(--bg-2)] border-y border-[var(--line)]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead eyebrow="The development team" title="A bench, not a single hire."
            copy="Construction is run by a team, not one person we hope sticks around. Decades of combined experience, scaled to the project." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEV_TEAM.map((c, i) => (
              <div key={c.t} className="surface-card reveal p-7" style={{ animationDelay: `${i * 70}ms` }}>
                <h3 className="font-serif-display text-xl text-[var(--text)] mb-3 leading-tight">{c.t}</h3>
                <p className="text-[var(--muted)] text-[0.85rem] leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <NelsonProof go={go} />
      <DoctrineBlock />
      <NextStep go={go} label="Work with us as an operator or vendor" route="operators" />
      <LeadSection cfg={DEVELOPMENT_FORM} eyebrow="Start a build conversation" tone="navy" />
    </>
  );
}

/* ================================================================
   STRATEGY LAB
   ================================================================ */
export function StrategyLabPage({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  const model = useStrategyModel();
  return (
    <>
      <PageHero eyebrow="Systems · Strategy Lab"
        title={<>Model it. Read it. <span className="italic text-[var(--accent-bright)]">Get it in writing.</span></>}
        image={IMG('pegasus-living.png')}
        lead="The Strategy Lab is where a situation becomes a plan: a self-serve calculator, an Instant Strategy Preview, a human review, and the full Deal Blueprint." />
      <ProcessSteps eyebrow="How the Lab works" title="From a property to a plan."
        copy="Four steps, increasing depth. Start self-serve, go as far as the deal deserves, and hand it to a person whenever you want."
        steps={LAB_STEPS} />
      <StrategyConsole go={go} model={model} />
      <StrategyCalculator go={go} model={model} />
      <ProductLadderBlock go={go} openPeggy={openPeggy} />
      <LeadSection cfg={STRATEGYLAB_FORM} eyebrow="Strategy Snapshot" tone="navy" strategy={model.snapshot} />
    </>
  );
}

/* ================================================================
   MARKETFLOW
   ================================================================ */
const MARKETFLOW_ACCESS = [
  { num: '01', title: 'Apply', desc: 'Tell us how you operate and where your capital or capacity sits. One short request, no obligation.' },
  { num: '02', title: 'We review fit', desc: 'A person reviews every request against the standard of the network. Alignment comes before volume, always.' },
  { num: '03', title: 'You are introduced', desc: 'Approved members are onboarded to reviewed dealflow and the operators behind it, as opportunities match.' },
];

export function MarketFlowPage({ go }: { go: Nav }) {
  return (
    <>
      <PageHero eyebrow="Systems · MarketFlow" title="MarketFlow"
        image={IMG('pegasus-casestudy.png')}
        lead="The marketplace layer: three lanes that move deals, match capital to projects, and place finished inventory, all to one standard." />
      <MarketFlowBlock go={go} enter={{ label: 'Sign in to MarketFlow', href: '/login' }} />
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="flex justify-center mb-8 reveal">
            <BrandMark boxClassName="w-16 h-16" />
          </div>
          <SectionHead eyebrow="A look inside"
            title="What members see."
            copy="A preview of the MarketFlow experience. These are sample cards for illustration; live dealflow, profiles, and matches appear once your access is reviewed and approved." />
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
            Preview content is illustrative and not an offer, a listing, or a solicitation. Access is private and reviewed by a person; participation is subject to a written agreement.
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
      <LeadSection cfg={MARKETFLOW_FORM} eyebrow="Request access" tone="page" showRole />
    </>
  );
}

/* ================================================================
   WORK WITH APOLLO
   ================================================================ */
function RepLane({ rep }: { rep: { label: string; desc: string; points: string[] } }) {
  return (
    <div className="surface-card reveal p-6 sm:p-8 lg:p-9">
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

export function WorkWithApolloPage({ go }: { go: Nav }) {
  return (
    <>
      <PageHero eyebrow="What we do · Representation"
        title={<>Work with <span className="italic text-[var(--accent-bright)]">Apollo.</span></>}
        image={IMG('pegasus-exterior-light.png')}
        lead="When agency representation is the right lane, Apollo is your agent through Keller Williams Realty East Bay, backed by the full Pegasus standard." />
      <ApolloBlock go={go} showCta={false} />
      <section className="py-20 lg:py-24 bg-[var(--bg-2)] border-y border-[var(--line)]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead eyebrow="Representation lanes" title="Sell or buy, represented."
            copy="Two clear lanes when agency representation is the right path. Pick the one that fits and Apollo follows up to discuss it." />
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center mb-12">
            <div className="reveal relative">
              <div className="absolute -inset-3 border border-[var(--line)] rounded-[4px] -z-10 translate-x-3 translate-y-3" />
              <img src={IMG('founder/apollo-1200.jpg')} alt="Paolo &quot;Apollo&quot; Duran" className="w-full rounded-[3px] object-cover aspect-[4/5]" loading="lazy" />
            </div>
            <div className="grid gap-5">
              <RepLane rep={APOLLO_REP.seller} />
              <RepLane rep={APOLLO_REP.buyer} />
            </div>
          </div>
          <div className="reveal rounded-[3px] border border-[var(--line)] bg-[var(--bg)] p-5 lg:p-6 flex gap-4 items-start">
            <BrandMark boxClassName="w-10 h-10 shrink-0" />
            <p className="text-[0.8rem] leading-relaxed text-[var(--muted)]">{APOLLO_DISCLOSURE}</p>
          </div>
        </div>
      </section>
      <LeadSection cfg={APOLLO_FORM} eyebrow="Work with Apollo" tone="navy" showRole />
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
        title={<>One company, <span className="italic text-[var(--accent-bright)]">one standard.</span></>}
        image={IMG('pegasus-architecture.png')}
        lead="The Pegasus Ecosystem is the whole of real estate under one roof: the firm, the guide, the tools, the marketplace, the capital layer, and the build arm." />
      <EcosystemBlock go={go} openPeggy={openPeggy} />
      <ThreePillarsBlock go={go} />
      <MarketFlowBlock go={go} dark />
      <DoctrineBlock />
      <CTABand go={go} openPeggy={openPeggy}
        title="Plug into the whole machine."
        text="Wherever you enter, as a seller, a finder, a partner, or a buyer, you inherit the same standard." />
    </>
  );
}

/* ================================================================
   PEGGY (first-class page)
   ================================================================ */
export function PeggyPage({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  return (
    <>
      <PageHero eyebrow="Systems · The front door"
        title={<>Meet <span className="italic text-[var(--accent-bright)]">PeggyAI.</span></>}
        image={IMG('pegasus-interior-v2.png')}
        lead="Describe a deal in plain language. Peggy asks the right questions, frames the options, and routes you to the lane that fits, day or night." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 reveal">
            <div className="pg-label text-[var(--accent)] mb-5">How Peggy helps</div>
            <h2 className="font-serif-display text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.01em] text-[var(--text)] mb-7">
              The fastest way to find your lane.
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-8 max-w-md">
              Not sure where you fit? Start here. Peggy takes a deal or a situation in your own words and points you to the right next step: a review, the Strategy Lab, or the right audience lane.
            </p>
            <ul className="space-y-4 mb-10">
              {['Open any time, no form to fill first', 'Plain language in, clear direction out', 'Hands you to a person when it matters'].map((t) => (
                <li key={t} className="flex gap-3.5 text-[var(--text-2)] leading-relaxed">
                  <Check className="w-4 h-4 text-[var(--accent)] mt-1 shrink-0" strokeWidth={2} /><span>{t}</span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={openPeggy} className="btn-primary px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
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
                    <div className="pg-label !text-[8px] !tracking-[0.22em] text-[var(--accent-bright)] mt-1.5">Pegasus intake concierge</div>
                  </div>
                </div>
                <p className="peggy-msg mb-6">
                  I&rsquo;m Peggy. Tell me about a property, a deal, or what you&rsquo;re exploring, and I&rsquo;ll point you to the right path.
                </p>
                <div className="pg-label !text-[8px] !tracking-[0.22em] text-[var(--cream)]/45 mb-3">People often start with</div>
                <div className="flex flex-col gap-2.5 mb-8">
                  {PEGGY_CHIPS.map((c) => (
                    <button key={c} type="button" onClick={openPeggy} className="peggy-chip text-left">{c}</button>
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
              { icon: Calculator, title: 'Reads the numbers', desc: 'Talks basis, ARV, rehab budget, carry, and exit costs, and frames the spread before you commit.' },
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
        title={<>Deal <span className="italic text-[var(--accent-bright)]">architecture.</span></>}
        image={IMG('pegasus-hero-light.png')}
        lead="Pegasus DreamScapes is a real estate investment, development, and systems company in the East Bay, built on strategy, governed by virtue, and executed with discipline." />
      <ApolloBlock go={go} showCta={false} />
      <DoctrineBlock dark />
      <ProofStats />
      <FAQBlock items={FAQ_HOME} eyebrow="Common questions" title="The honest answers." />
      <CTABand go={go} openPeggy={openPeggy}
        title="Built on strategy. Governed by virtue."
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

export function Footer({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  return (
    <footer className="bg-[var(--navy)] text-[var(--cream)]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 lg:gap-12">
          <div className="col-span-2 md:col-span-4">
            <button type="button" onClick={() => go('home')} className="flex items-center gap-3.5 mb-6">
              <BrandMark boxClassName="w-12 h-12" onDark />
              <div className="flex flex-col leading-none text-left">
                <span className="font-serif-display text-[24px] tracking-[0.05em]">Pegasus DreamScapes</span>
                <span className="pg-label !text-[9px] !tracking-[0.34em] text-[var(--accent-bright)] mt-1.5">Deal Architecture</span>
              </div>
            </button>
            <p className="font-serif-display italic text-xl text-[var(--cream)]/80 max-w-sm leading-snug mb-7">
              Built on strategy. Governed by virtue. Executed with discipline.
            </p>
            <button type="button" onClick={openPeggy}
              className="peggy-footer-cta inline-flex items-center gap-2.5 pg-label !text-[10px] !tracking-[0.18em] text-[var(--cream)]">
              <ConciergeBell className="w-3.5 h-3.5 text-[var(--accent-bright)]" strokeWidth={1.6} /> Talk to PeggyAI
            </button>
          </div>

          <FooterCol title="What we do">
            <FooterLink label="Deal Architecture" onClick={() => go('dealarchitecture')} />
            <FooterLink label="Investments" onClick={() => go('investments')} />
            <FooterLink label="Development" onClick={() => go('development')} />
            <FooterLink label="Strategy Lab" onClick={() => go('strategylab')} />
            <FooterLink label="MarketFlow" onClick={() => go('marketflow')} />
            <FooterLink label="Pegasus Ecosystem" onClick={() => go('ecosystem')} />
          </FooterCol>

          <FooterCol title="Who we serve">
            <FooterLink label="Sellers & Owners" onClick={() => go('sellers')} />
            <FooterLink label="Buyers" onClick={() => go('buyers')} />
            <FooterLink label="Deal Finders" onClick={() => go('dealfinders')} />
            <FooterLink label="Capital Partners" onClick={() => go('capital')} />
            <FooterLink label="Operators & Vendors" onClick={() => go('operators')} />
            <FooterLink label="Referral Partners" onClick={() => go('referral')} />
          </FooterCol>

          <FooterCol title="Company">
            <FooterLink label="About the Firm" onClick={() => go('about')} />
            <FooterLink label="Work with Apollo" onClick={() => go('apollo')} />
            <FooterLink label="Talk to PeggyAI" onClick={() => go('peggy')} />
            <FooterLink label="Start a Review" onClick={() => go('contact')} />
          </FooterCol>

          <FooterCol title="Contact">
            <li><a href="mailto:apollo@pegasusdreamscapes.com" className="link-underline">apollo@pegasusdreamscapes.com</a></li>
            <li><a href="tel:9257448525" className="link-underline">925-744-8525</a></li>
            <li>Pleasant Hill · East Bay · CA</li>
            <li className="!tracking-[0.16em]">DRE #02333658 · KW East Bay</li>
          </FooterCol>
        </div>
        <div className="mt-16 pt-8 border-t border-[rgba(239,231,218,0.16)] flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pg-label !text-[9px] !tracking-[0.16em] text-[var(--cream)]/55">
          <span>© {new Date().getFullYear()} Pegasus DreamScapes Corp. All rights reserved.</span>
          <span>NAR · CAR · Equal Housing Opportunity</span>
        </div>
      </div>
    </footer>
  );
}
