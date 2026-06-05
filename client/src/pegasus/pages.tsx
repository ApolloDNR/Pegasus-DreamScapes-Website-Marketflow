import React from 'react';
import { ArrowRight, ConciergeBell, Check, Send, Calculator, Compass, Ruler, Landmark } from 'lucide-react';
import type { Nav, Theme, Category, FormCfg, PeggyHandoff } from './theme';
import { IMG, SectionHead, ContourLines } from './primitives';
import {
  CATEGORIES, PILLARS3, FAQ_HOME, APOLLO, NELSON, MARKETFLOW, PEGGY_CHIPS, PEGGY_SLA,
} from './data';
import {
  PageHero, Hero, HomeIntro, LaneCardsBlock, ThreePillarsBlock, PillarSection,
  EngineBlock, DoorsBlock, ProductLadderBlock, MarketFlowBlock, EcosystemBlock,
  ApolloBlock, ProofStats, NelsonProof, DoctrineBlock, FAQBlock, Qualifier,
  SplitPaths, NextStep, CTABand,
} from './blocks';
import {
  LeadSection, StrategyCalculator, useStrategyModel, CONTACT_FORM, DEVELOPMENT_FORM, STRATEGYLAB_FORM, INVESTMENTS_FORM,
} from './forms';

const INVESTMENTS = PILLARS3[0];
const DEVELOPMENT = PILLARS3[1];

const MARKETFLOW_FORM: FormCfg = {
  role: 'Capital partner',
  intent: 'marketflow-access',
  heading: <>Request <span className="italic text-[var(--accent-bright)]">access.</span></>,
  lead: 'MarketFlow is invite only. Tell us how you operate or where your capital sits, and a real person will review your fit for the network.',
  submit: 'Request access',
  third: { label: 'Firm, fund, or trade', placeholder: 'Where you operate (optional)' },
  messageLabel: 'How you participate',
  messagePlaceholder: 'Deal finder, capital partner, operator, or buyer. Share your typical check size or build capacity, and the deal types you focus on.',
};

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
            <div className="lg:col-span-8 grid sm:grid-cols-1 gap-5">
              {cat.points.map((p, i) => (
                <div key={i} className="surface-card reveal flex gap-6 p-7" style={{ animationDelay: `${i * 90}ms` }}>
                  <div className="font-serif-display text-3xl text-[var(--accent)] leading-none pt-1">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <h3 className="font-serif-display text-2xl text-[var(--text)] mb-2">{p.t}</h3>
                    <p className="text-[var(--muted)] text-[0.95rem] leading-relaxed">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {cat.splits && <SplitPaths go={go} openPeggy={openPeggy} heading={cat.splits.heading} copy={cat.splits.copy} paths={cat.splits.paths} />}
      <Qualifier forYou={cat.forYou} notFit={cat.notFit} />
      {cat.rich.includes('engine') && <EngineBlock go={go} />}
      {cat.rich.includes('ladder') && <ProductLadderBlock go={go} openPeggy={openPeggy} />}
      {cat.rich.includes('surfaces') && <EcosystemBlock go={go} openPeggy={openPeggy} />}
      {cat.rich.includes('faq') && cat.faq && <FAQBlock items={cat.faq} eyebrow="Questions" title="What people ask us." />}
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
              <img src={IMG('pegasus-process.png')} alt="The Pegasus deal review process" className="w-full h-full object-cover" />
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
export function DevelopmentPage({ go }: { go: Nav }) {
  return (
    <>
      <PageHero eyebrow="Pillar 02 · Development"
        title={<>We build the <span className="italic text-[var(--accent-bright)]">finished product.</span></>}
        image={IMG('pegasus-craft-blueprint.png')}
        lead="With a licensed general contractor on the team, renovation and ground-up work is GC-led, scoped to a real budget and draw schedule, and delivered on time, to a standard." />
      <PillarSection p={DEVELOPMENT} go={go} flip />
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
      <MarketFlowBlock go={go} />
      <section className="relative py-24 lg:py-28 bg-[var(--navy)] text-[var(--cream)] overflow-hidden">
        <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[70%] text-[var(--accent-2)] opacity-[0.12] float-slow" />
        <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead dark eyebrow="How access works"
            title={<>Earned, not opened<br />to everyone.</>}
            copy="Membership is reviewed by a person. We protect the standard of the network over its size." />
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
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
      <LeadSection cfg={MARKETFLOW_FORM} eyebrow="Request access" tone="page" />
    </>
  );
}

/* ================================================================
   WORK WITH APOLLO
   ================================================================ */
const APOLLO_LANES = [
  { name: 'List with intent', desc: 'Sell with an investor’s read on price, prep, and timing, not a guess dressed up as a strategy.' },
  { name: 'Buy with an edge', desc: 'Make offers backed by real underwriting, so you know what a property is actually worth.' },
  { name: 'Off-market access', desc: 'See opportunities through the Pegasus network before they ever reach the open market.' },
  { name: 'Strategy first', desc: 'When the right move is to wait, renovate, or walk away, you will hear it plainly.' },
];

export function WorkWithApolloPage({ go }: { go: Nav }) {
  return (
    <>
      <PageHero eyebrow="What we do · Representation"
        title={<>Work with <span className="italic text-[var(--accent-bright)]">Apollo.</span></>}
        image={IMG('pegasus-exterior-light.png')}
        lead="When agency representation is the right lane, Apollo is your agent through Keller Williams East Bay, backed by the full Pegasus standard." />
      <ApolloBlock go={go} showCta={false} />
      <section className="py-20 lg:py-24 bg-[var(--bg-2)] border-y border-[var(--line)]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead eyebrow="Representation lanes" title="How Apollo can represent you."
            copy="Four ways to work together when agency representation is the right path." />
          <div className="grid sm:grid-cols-2 gap-5">
            {APOLLO_LANES.map((l, i) => (
              <div key={l.name} className="surface-card reveal flex gap-6 p-7" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="font-serif-display text-3xl text-[var(--accent)] leading-none pt-1">{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <h3 className="font-serif-display text-2xl text-[var(--text)] mb-2">{l.name}</h3>
                  <p className="text-[var(--muted)] text-[0.95rem] leading-relaxed">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <LeadSection cfg={CATEGORIES.buyers.form} eyebrow="Work with Apollo" tone="navy" />
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
        image={IMG('pegasus-process.png')}
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
                  <div className="peggy-avatar"><ConciergeBell className="w-4 h-4" strokeWidth={1.8} /></div>
                  <div className="leading-none">
                    <div className="font-serif-display text-2xl text-[var(--cream)]">PeggyAI</div>
                    <div className="pg-label !text-[8px] !tracking-[0.22em] text-[var(--accent-bright)] mt-1.5">The Pegasus guide</div>
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
                <div className="w-11 h-11 rounded-[3px] bg-[rgba(177,102,49,0.1)] flex items-center justify-center mb-6">
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
        image={IMG('pegasus-apollo.png')}
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
              <img src={IMG('pegasus-logo-mark.png')} alt="Pegasus DreamScapes" className="w-12 h-12 object-contain" />
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
          <span>© {new Date().getFullYear()} Pegasus DreamScapes. All rights reserved.</span>
          <span>NAR · CAR · Equal Housing Opportunity</span>
        </div>
      </div>
    </footer>
  );
}
