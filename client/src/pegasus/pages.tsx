import React from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, ConciergeBell, Check, Send, Calculator, Compass, Ruler, Landmark } from 'lucide-react';
import type { Nav, Theme, PeggyHandoff } from './theme';
import { IMG, SectionHead, ContourLines, BrandMark } from './primitives';
import {
  CATEGORIES, PILLARS3, FAQ_HOME, APOLLO, NELSON, MARKETFLOW, PEGGY_ROLES, PEGGY_SLA,
} from './data';
import {
  PageHero, Hero, HomeIntro, ThreePillarsBlock, PillarSection,
  DealReadStepper, DoorsBlock, ProductLadderBlock, MarketFlowBlock, EcosystemBlock,
  ApolloBlock, ProofStats, NelsonProof, DoctrineBlock, FAQBlock, Qualifier,
  NextStep, CTABand, HowADealMovesBlock, ParticipationLanesBlock, StrategyLabFeature, LaneCardsBlock, PegasusStandardBand,
} from './blocks';
import {
  LeadSection, CONTACT_FORM, INVESTMENTS_FORM, APOLLO_FORM,
} from './forms';
import { PremiumStrategyLab } from './strategy-lab-experience';
import { PremiumMarketFlow } from './marketflow-experience';

export { CategoryPage } from './category-page';
export { CapitalPage } from './capital-page';

const INVESTMENTS = PILLARS3[0];

const APOLLO_REP = {
  seller: {
    label: 'Seller representation',
    desc: 'Ask about current seller-representation availability. Duties, pricing work, preparation, timing, MLS exposure, and fees require a separate written brokerage agreement.',
    points: ['Current license and broker status verified first', 'Scope and duties documented in writing', 'No pricing or sale outcome promised'],
  },
  buyer: {
    label: 'Buyer representation',
    desc: 'Ask about current buyer-representation availability. Search, diligence, pricing, offer, and compensation duties require a separate written brokerage agreement.',
    points: ['Current license and broker status verified first', 'Independent diligence remains property specific', 'No inventory, acceptance, or value outcome promised'],
  },
};

// PRD §7.11 required copy (issue #22), locked verbatim, plus the page-level
// no-agreement clarifier.
const APOLLO_DISCLOSURE =
  'This site uses Paolo “Apollo” Duran as a public-facing name. For license verification, CA DRE #02333658 is listed under Duran Ramirez, Paolo Ariel. The responsible broker listed in DRE records is BMP Realty Inc DBA Keller Williams Realty-East Bay. Verify current status before engagement. Pegasus Dreamscapes Corp. is not a real estate brokerage. Licensed representation may be available only through a separate written brokerage agreement. No agency relationship is created without a written agreement. This page is not an agency agreement.';

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
        text="Share the property and situation for possible consideration. No review, route, offer, service, or response time is promised." />
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
        lead="A property is not a product. It is a situation with constraints, pressure, numbers, duty, and timing. This framework organizes those parts before comparing possible paths." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 reveal">
            <div className="img-zoom peggy-shadow aspect-[4/5]">
              <img src={IMG('pegasus-architecture.png')} alt="A precise scale model on a studio table" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-7 reveal delay-100">
            <div className="pg-label text-[var(--accent)] mb-5">Why it exists</div>
            <h2 className="font-serif-display text-4xl md:text-[3.2rem] leading-[1.05] tracking-normal text-[var(--text)] mb-7">
              Start before choosing a lane.
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-5 max-w-xl">
              Many real estate conversations start with a proposed product: a listing, offer, loan, JV, contractor, or buyer. This framework starts by organizing the facts and constraints.
            </p>
            <p className="text-[var(--muted)] leading-relaxed max-w-xl">
              A scenario may point toward representation, acquisition, value-add work, development, a MarketFlow record, a documented JV, or no Pegasus path at all. Any real role requires further diligence and the applicable written agreement.
            </p>
            <button type="button" onClick={() => go('submit')} data-testid="button-deal-strategy-submit"
              className="btn-primary mt-9 px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
              Share Property Context <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>
      <DealReadStepper go={go} />
      <ProductLadderBlock go={go} openPeggy={openPeggy} />
      <DoorsBlock go={go} openPeggy={openPeggy} />
      <LeadSection cfg={CONTACT_FORM} eyebrow="Property intake" tone="navy" />
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
        title={<>How a possible acquisition <span className="italic text-[var(--accent-bright)]">is considered.</span></>}
        image={IMG('pegasus-after.png')}
        scrimTop
        lead="Distressed, dated, and overlooked property may be submitted for consideration. No purchase, project work, capital, or exit is promised." />
      <PillarSection p={INVESTMENTS} go={go} />
      <Qualifier forYou={CATEGORIES.capital.forYou} notFit={CATEGORIES.capital.notFit} />
      <NextStep go={go} label="Review capital-discussion boundaries" route="capital" />
      <LeadSection cfg={INVESTMENTS_FORM} eyebrow="Share investment context" tone="navy" />
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
        title={<>Define project work <span className="italic text-[var(--accent-bright)]">before it begins.</span></>}
        image={IMG('nelson/nelson-kitchen-1280.jpg')}
        lead="A framework for renovation or ground-up scopes: budget, schedule, qualified providers, permits, change control, and written completion criteria." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[760px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[var(--muted)] leading-relaxed text-lg">
            This page does not claim an in-house construction team or guaranteed capacity. A future project would require property-specific diligence, qualified providers, applicable licenses and permits, and a signed agreement defining scope, budget, schedule, changes, completion, and remedies.
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
   STRATEGY LAB + MARKETFLOW
   Premium product surfaces share the public shell but keep distinct jobs:
   Strategy Lab is a private decision desk; MarketFlow is the permissioned
   relationship layer after review.
   ================================================================ */
export function StrategyLabPage({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  return <PremiumStrategyLab go={go} openPeggy={openPeggy} />;
}

export function MarketFlowPage({ go }: { go: Nav }) {
  return <PremiumMarketFlow go={go} />;
}

/* ================================================================
   WORK WITH APOLLO
   ================================================================ */
function RepLane({ rep }: { rep: { label: string; desc: string; points: string[] } }) {
  return (
    <article className="apollo-rep-lane reveal">
      <h3 className="font-serif-display">{rep.label}</h3>
      <p>{rep.desc}</p>
      <ul>
        {rep.points.map((p) => (
          <li key={p}>
            <Check className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" strokeWidth={2} /><span>{p}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

// Step 7 - visible sell/buy/situation/deal selector shown before the inline
// representation lead form. "Sell"/"Buy" scroll to the form (Apollo's two
// roleOptions); "complex situation"/"deal" route to the canonical intake
// intake with a valid ?intent= so nothing falls back to a default.
const APOLLO_SELECTOR = [
  {
    key: 'sell',
    label: 'I want to sell',
    blurb: 'Ask about current seller-representation availability. Any pricing, preparation, marketing, timing, or agency duty requires a separate written brokerage agreement.',
    cta: 'Continue below',
    mode: 'form' as const,
    role: 'List my property (Seller representation)',
  },
  {
    key: 'buy',
    label: 'I want to buy',
    blurb: 'Ask about current buyer-representation availability. Any search, diligence, pricing, or offer duty requires a separate written brokerage agreement.',
    cta: 'Continue below',
    mode: 'form' as const,
    role: 'Buy a home (Buyer representation)',
  },
  {
    key: 'situation',
    label: 'I have a complex situation',
    blurb: 'Distressed, inherited, occupied, stalled, or facing a deadline? Share it for possible consideration. No review, options, offer, or response is promised.',
    cta: 'Request a Property Review',
    mode: 'link' as const,
    href: '/bring-an-opportunity?intent=property',
  },
  {
    key: 'deal',
    label: 'I have a deal to submit',
    blurb: 'Bring a deal once for possible consideration. A review, buyer, partnership, route, compensation, or response is not promised.',
    cta: 'Submit a Deal',
    mode: 'link' as const,
    href: '/bring-an-opportunity?intent=deal-jv',
  },
] as const;

type ApolloSelectorKey = (typeof APOLLO_SELECTOR)[number]['key'];

function ApolloSelector({
  selectedKey,
  onSelect,
  leadRef,
  roleFieldRef,
}: {
  selectedKey: ApolloSelectorKey;
  onSelect: (key: ApolloSelectorKey) => void;
  leadRef: React.RefObject<HTMLDivElement>;
  roleFieldRef: React.RefObject<HTMLSelectElement>;
}) {
  const [, setLocation] = useLocation();
  const active = APOLLO_SELECTOR.find((s) => s.key === selectedKey) ?? APOLLO_SELECTOR[0];
  const onCta = () => {
    if (active.mode === 'form') {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      leadRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      roleFieldRef.current?.focus({ preventScroll: true });
    } else if (active.href) {
      setLocation(active.href);
    }
  };
  return (
    <section className="apollo-paths" data-testid="section-apollo-selector">
      <div className="apollo-paths__inner">
        <div className="pg-label text-[var(--accent-ink)]">Choose the right conversation</div>
        <h2 className="font-serif-display">What brings you here?</h2>
        <div className="apollo-paths__rail" role="group" aria-label="What brings you here?" data-testid="apollo-selector">
          {APOLLO_SELECTOR.map((s) => {
            const isActive = s.key === selectedKey;
            return (
              <button
                key={s.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelect(s.key)}
                data-testid={`apollo-selector-${s.key}`}
                className={isActive ? 'is-active' : undefined}
              >
                <span>{s.label}</span>
                <ArrowRight aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <p
          role="status"
          aria-label="Selected path"
          aria-live="polite"
          aria-atomic="true"
          className="apollo-paths__status"
          data-testid="text-apollo-selector-blurb"
        >
          <strong>Selected path: {active.label}.</strong> {active.blurb}
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
  const [selectorKey, setSelectorKey] = React.useState<ApolloSelectorKey>('sell');
  const [preferredRole, setPreferredRole] = React.useState(APOLLO_FORM.role);
  const leadRef = React.useRef<HTMLDivElement>(null);
  const roleFieldRef = React.useRef<HTMLSelectElement>(null);

  const selectPath = (nextKey: ApolloSelectorKey) => {
    setSelectorKey(nextKey);
    const nextPath = APOLLO_SELECTOR.find((path) => path.key === nextKey);
    if (nextPath && 'role' in nextPath) setPreferredRole(nextPath.role);
  };

  return (
    <>
      <ApolloBlock go={go} showCta={false} variant="work" />
      <section className="apollo-representation">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead eyebrow="Representation lanes" title="Ask about current availability."
            copy="Seller or buyer representation may be available only after current license and broker verification, fit review, and a separate written brokerage agreement." />
          <div className="apollo-representation__lanes">
            <RepLane rep={APOLLO_REP.seller} />
            <RepLane rep={APOLLO_REP.buyer} />
          </div>
          <div className="apollo-representation__disclosure reveal">
            <p>{APOLLO_DISCLOSURE}</p>
            <p>
              Equal Housing Opportunity. If representation is offered, the policy is to provide it without unlawful discrimination, subject to the signed brokerage agreement.
            </p>
          </div>
        </div>
      </section>
      <ApolloSelector
        selectedKey={selectorKey}
        onSelect={selectPath}
        leadRef={leadRef}
        roleFieldRef={roleFieldRef}
      />
      <div ref={leadRef} id="apollo-lead" className="scroll-mt-24">
        <LeadSection
          cfg={APOLLO_FORM}
          eyebrow="Represent with Apollo"
          tone="navy"
          showRole
          preferredRole={preferredRole}
          roleFieldRef={roleFieldRef}
          showDecorativeContour={false}
        />
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
        title={<>One framework. <span className="italic text-[var(--accent-bright)]">Clear boundaries between parts.</span></>}
        image={IMG('pegasus-closing.png')}
        lead="Educational modeling, intake, licensed representation, project work, capital, and MarketFlow each have separate roles, qualifications, and written terms." />
      <EcosystemBlock go={go} openPeggy={openPeggy} />
      <ThreePillarsBlock go={go} />
      <MarketFlowBlock go={go} dark />
      <CTABand go={go} openPeggy={openPeggy}
        title="Plug into the whole machine."
        text="Each lane has separate eligibility, diligence, professional duties, and written terms. The public framework does not merge those responsibilities." />
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
        lead="Describe a deal or situation in plain language. Peggy can explain public paths and help create an intake record. It cannot recommend, promise routing, or provide licensed advice. Phone and voice remain in development." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 reveal">
            <div className="pg-label text-[var(--accent-ink)] mb-5">How Peggy helps</div>
            <h2 className="font-serif-display text-4xl md:text-[3rem] leading-[1.05] tracking-normal text-[var(--text)] mb-7">
              A guided way to understand the public paths.
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-8 max-w-md">
              Not sure where to start? Peggy can explain the public intake, Strategy Lab, and audience pages. The current experience is website intake only; Peggy does not answer the main line and cannot promise a human handoff or response.
            </p>
            <ul className="space-y-4 mb-10">
              {['Open the website assistant without an account', 'Plain-language orientation, not advice', 'Human follow-up is not guaranteed'].map((t) => (
                <li key={t} className="flex gap-3.5 text-[var(--text-2)] leading-relaxed">
                  <Check className="w-4 h-4 text-[var(--accent-ink)] mt-1 shrink-0" strokeWidth={2} /><span>{t}</span>
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
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-bright)]" aria-hidden="true" /> Web early access · voice in development
                      </span>
                    </div>
                  </div>
                </div>
                <p className="peggy-msg mb-6">
                  I&rsquo;m Peggy. Tell me what you are exploring and I can explain the relevant public paths or help start an intake record.
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
            <div className="pg-label text-[var(--accent-ink)] mb-5">What Peggy can actually do</div>
            <h2 className="font-serif-display text-4xl md:text-[3rem] leading-[1.05] tracking-normal text-[var(--text)]">
              Fluent in the deal, not just the chat.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line-soft)] rounded-[3px] overflow-hidden">
            {[
              { icon: Calculator, title: 'Explains inputs', desc: 'Defines basis, ARV, improvement budget, carry, and exit-cost concepts without valuing a property.' },
              { icon: Compass, title: 'Explains public lanes', desc: 'Describes possible sale, project, capital, representation, or introduction paths without recommending one.' },
              { icon: Ruler, title: 'Explains scope concepts', desc: 'Defines draw, schedule, change-control, and completion concepts without promising project services.' },
              { icon: Landmark, title: 'States its limits', desc: 'Refuses licensed advice and commitments. A contact path may be shown, but handoff and response are not promised.' },
            ].map((c, i) => (
              <div key={c.title} className={`bg-[var(--bg)] p-8 lg:p-9 reveal`} style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="w-11 h-11 rounded-[3px] bg-[rgba(213,127,46,0.1)] flex items-center justify-center mb-6">
                  <c.icon className="w-5 h-5 text-[var(--accent-ink)]" strokeWidth={1.7} />
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
        lead="Complex properties can involve separate strategy, capital, construction, brokerage, and legal responsibilities. Pegasus explains a coordinated framework while keeping each licensed or contracted role explicit." />
      <ApolloBlock go={go} showCta={false} />
      <section className="py-20 lg:py-24">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <SectionHead eyebrow="Where the firm stands today"
            title="Founder-led, and honest about it."
            copy="Pegasus is founder-led and publishes one evidence-bounded case study. Nelson's limited public record does not identify every contractor, license, permit, vendor, financing, project-management, or brokerage role. Current licensed representation is separate and requires verification and written agreement." />
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
