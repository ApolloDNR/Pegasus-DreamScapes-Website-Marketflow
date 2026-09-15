import React from 'react';
import { Link, useLocation } from 'wouter';
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
import { ConnectChooser } from '@/pages/connect';
import { PageAction, PageOpening, PageClosing, ProjectEvidence } from './experience-page';

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
export function InvestmentsPage({ go: _go, openPeggy: _openPeggy }: { go: Nav; openPeggy: () => void }) {
  return <article className="experience-page">
    <PageOpening title="How a possible acquisition is considered." action={{ href: '/bring-an-opportunity?intent=property', label: 'Discuss a property' }}><p>Distressed, dated, and overlooked property may be submitted for consideration. No purchase, project work, capital, or exit is promised.</p></PageOpening>
    <section className="ep-section"><div className="experience-wrap ep-split"><h2>Start with the property and the facts.</h2><div><p>Condition, ownership, proposed terms, timing, and the assumptions behind a possible acquisition all matter. Any transaction requires property-specific diligence, capacity, and accepted written terms.</p><PageAction href="/strategy-lab" secondary>Explore the assumptions in Strategy Lab</PageAction></div></div></section>
    <ProjectEvidence />
    <section className="ep-section ep-dark"><div className="experience-wrap ep-split"><h2>Capital conversations have a separate path.</h2><div><p>Existing relationships and personal introductions only. The public site does not offer an investment, project access, or a funding commitment.</p><PageAction href="/capital" secondary>Review capital-discussion boundaries</PageAction></div></div></section>
    <div className="ep-form-section"><LeadSection cfg={INVESTMENTS_FORM} eyebrow="Share investment context" tone="page" headingLevel={2} /></div>
  </article>;
}

/* ================================================================
   DEVELOPMENT
   ================================================================ */
export function DevelopmentPage({ go: _go }: { go: Nav }) {
  return <article className="experience-page">
    <PageOpening title="A practical plan for the work ahead." action={{ href: '/bring-an-opportunity?intent=explore', label: 'Discuss a project' }}><p>Start with the property, proposed scope, budget, and constraints. Renovation and ground-up work each need clearly defined responsibilities.</p></PageOpening>
    <section id="development-framework" className="ep-section"><div className="experience-wrap ep-split">
      <h2>Define the work before it starts.</h2>
      <ol className="ep-rows ep-numbered">
        <li><div><h3>Scope &amp; budget</h3><p>Identify the proposed work, exclusions, available plans, cost assumptions, and decisions that would change the budget.</p></div></li>
        <li><div><h3>Providers &amp; permissions</h3><p>Document the roles, applicable licenses, permit status, and qualifications that the specific property and scope require.</p></div></li>
        <li><div><h3>Schedule &amp; change control</h3><p>Separate target dates from verified dependencies. Define who approves changes, how they are priced, and how they are recorded.</p></div></li>
        <li><div><h3>Completion &amp; handoff</h3><p>Agree the acceptance criteria, inspections, outstanding items, handoff records, and remedies in the project documents.</p></div></li>
      </ol>
    </div></section>
    <ProjectEvidence title="A documented residential transformation." />
    <PageClosing title="Discuss the work you have in mind." href="/bring-an-opportunity?intent=explore" label="Discuss a project"><p className="ep-notice">This page does not claim an in-house construction team or guaranteed capacity. A future project would require property-specific diligence, qualified providers, applicable licenses and permits, and a signed agreement defining scope, budget, schedule, changes, completion, and remedies.</p></PageClosing>
  </article>;
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
  const choose = (path: typeof APOLLO_SELECTOR[number]) => {
    onSelect(path.key);
    if (path.mode === 'link') { setLocation(path.href); return; }
    leadRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
    roleFieldRef.current?.focus({ preventScroll: true });
  };
  return <section className="ep-section" id="apollo-paths" data-testid="section-apollo-selector"><div className="experience-wrap ep-split">
    <div><h2>Buying or selling?</h2><p>Choose the conversation. Your selection carries into the representation form.</p><PageAction href="/buyers" secondary>Explore the buyer paths</PageAction></div>
    <div className="ep-rep-paths" role="group" aria-label="What brings you here?" data-testid="apollo-selector">
      {APOLLO_SELECTOR.map((path) => <button key={path.key} type="button" aria-pressed={path.key === selectedKey} onClick={() => choose(path)} data-testid={`apollo-selector-${path.key}`}><span>{path.label}</span><ArrowRight aria-hidden="true" /></button>)}
    </div>
    <p className="sr-only" role="status" aria-live="polite" aria-label="Selected path">{APOLLO_SELECTOR.find(path => path.key === selectedKey)?.label}. {APOLLO_SELECTOR.find(path => path.key === selectedKey)?.blurb}</p>
  </div></section>;
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
    <article className="experience-page ep-representation">
      <PageOpening title="Buy or sell with Apollo." image={{ src: '/images/founder/apollo.webp', alt: 'Apollo Duran', width: 1100, height: 1375, portrait: true }} action={{ href: '#apollo-paths', label: 'Discuss representation' }}>
        <p>Ask about current buyer or seller representation with Apollo Duran. Start with your plans, location, and timing.</p>
        <p className="ep-notice">CA DRE #02333658 · Responsible broker: BMP Realty Inc DBA Keller Williams Realty-East Bay. Verify current status. Pegasus Dreamscapes Corp. is not a real estate brokerage.</p>
      </PageOpening>
      <ApolloSelector selectedKey={selectorKey} onSelect={selectPath} leadRef={leadRef} roleFieldRef={roleFieldRef} />
      <section className="ep-section ep-warm"><div className="experience-wrap ep-split">
        <div><h2>Agree the scope together.</h2><p>Seller or buyer representation may be available only after current license and broker verification, fit review, and a separate written brokerage agreement.</p></div>
        <div className="ep-rows"><RepLane rep={APOLLO_REP.seller} /><RepLane rep={APOLLO_REP.buyer} /></div>
      </div></section>
      <section className="ep-section"><div className="experience-wrap ep-split"><h2>A clearly documented relationship.</h2><div><p>{APOLLO_DISCLOSURE}</p><p className="ep-notice">Equal Housing Opportunity. If representation is offered, the policy is to provide it without unlawful discrimination, subject to the signed brokerage agreement.</p></div></div></section>
      <div ref={leadRef} id="apollo-lead" className="ep-form-section">
        <LeadSection cfg={APOLLO_FORM} eyebrow="Represent with Apollo" tone="page" headingLevel={2} showRole preferredRole={preferredRole} roleFieldRef={roleFieldRef} showDecorativeContour={false} />
      </div>
    </article>
  );
}

/* ================================================================
   ECOSYSTEM
   ================================================================ */
export function EcosystemPage({ go: _go, openPeggy: _openPeggy }: { go: Nav; openPeggy: () => void }) {
  return <article className="experience-page">
    <PageOpening title="The right path for each part of the work."><p>Property planning, licensed representation, and private network access each have separate roles, qualifications, and written terms.</p></PageOpening>
    <section className="ep-section"><div className="experience-wrap ep-split"><h2>Find what you need.</h2><div className="ep-link-list">{[
      ['Property planning', 'Explore the practical questions about a property or proposed project.', '/property-owners'],
      ['Licensed representation', 'Discuss a separately documented buyer or seller relationship with Apollo.', '/work-with-apollo'],
      ['Tools', 'Use the existing Strategy Lab or resume a browser draft.', '/tools'],
      ['MarketFlow', 'Understand the controlled private pilot and reviewed access path.', '/marketflow'],
      ['Project partners', 'Clarify a possible operator, vendor, or specialist role.', '/deal-partners'],
    ].map(([title, detail, href]) => <Link key={href} href={href}><span><strong>{title}</strong><small>{detail}</small></span><ArrowRight aria-hidden="true" /></Link>)}</div></div></section>
    <PageClosing title="Need help choosing a path?" href="/contact" label="Contact Apollo"><p>The public framework does not merge professional duties, promise capacity, or create an engagement.</p></PageClosing>
  </article>;
}

/* ================================================================
   PEGGY (first-class page)
   ================================================================ */
const PEGGY_PAGE_ROLE_KEYS = ['seller', 'dealfinder', 'capital', 'unsure'];
const PEGGY_PAGE_ROLES = PEGGY_PAGE_ROLE_KEYS
  .map((k) => PEGGY_ROLES.find((r) => r.role === k))
  .filter((r): r is (typeof PEGGY_ROLES)[number] => Boolean(r));

export function PeggyPage({ go: _go, openPeggy }: { go: Nav; openPeggy: (role?: string, prompt?: string) => void }) {
  const [prompt, setPrompt] = React.useState('');
  return <article className="experience-page">
    <PageOpening title="Meet Peggy."><p>Peggy is Pegasus’s AI intake assistant. Ask about public paths, explain a property situation, or get help understanding Strategy Lab.</p><p className="ep-notice">Website early access. Peggy does not approve deals, make offers, or provide legal, tax, lending, or investment advice. Phone and voice remain in development.</p></PageOpening>
    <section className="ep-section"><div className="experience-wrap ep-split"><div><h2>Start in your own words.</h2><p>You can prepare a question here, then review it in Peggy before sending.</p><form className="ep-peggy-prompt" onSubmit={event => { event.preventDefault(); if (prompt.trim()) openPeggy(undefined, prompt.trim()); }}><label htmlFor="peggy-page-prompt">Describe your deal</label><textarea id="peggy-page-prompt" placeholder="What are you considering?" value={prompt} onChange={event => setPrompt(event.target.value)} rows={4} /><button type="submit" className="experience-button" disabled={!prompt.trim()}>Open Peggy <ArrowRight size={17} aria-hidden="true" /></button></form></div>
      <div><h3>Or choose a starting point.</h3><div className="ep-rep-paths">{PEGGY_PAGE_ROLES.map(role => <button type="button" key={role.role} onClick={() => openPeggy(role.role)} data-testid={`button-peggy-role-${role.role}`}><span>{role.label}</span><ArrowRight aria-hidden="true" /></button>)}</div></div>
    </div></section>
    <section className="ep-section ep-dark"><div className="experience-wrap ep-split"><h2>Prefer to contact Apollo?</h2><div><p>The current assistant provides orientation and intake support. Human review, follow-up, and response timing are not promised.</p><PageAction href="/contact">Contact Apollo</PageAction></div></div></section>
  </article>;
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
  if (handoff) {
    return <LeadSection cfg={CONTACT_FORM} eyebrow="Continue the property handoff" showRole tone="page" handoff={handoff} />;
  }
  return <ConnectChooser context="contact" />;
}
