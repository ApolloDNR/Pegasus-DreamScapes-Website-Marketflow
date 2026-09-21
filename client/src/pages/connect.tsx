import { Link } from 'wouter';
import { trackCtaClick } from '@/lib/analytics';
import { PageAction, PageOpening } from '@/pegasus/experience-page';
import { PUBLIC_CONTACT, REPRESENTATION_NOTICE, SUBMISSION_NOTICE } from '@/pegasus/public-content';
import { ArrowRight, Banknote, Building2, Hammer, Handshake, KeyRound, MessageSquare, Network, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ConnectLane = {
  id: string;
  href: string;
  audience: string;
  routeCode: string;
  label: string;
  short: string;
  detail: string;
  nextStep: string;
  standard: string;
  cta: string;
  icon: LucideIcon;
};

const LANES: ConnectLane[] = [
  {
    id: "property-situation",
    href: "/bring-an-opportunity?intent=property",
    audience: "Property owner",
    routeCode: "PROPERTY READ",
    label: "I need to sell or solve a property situation",
    short: "Distress, inherited property, repairs, vacancy, pressure, or a sale that is not simple.",
    detail:
      "Start here to record the property, pressure, and possible paths for consideration. Submission does not promise review, routing, service, or a response.",
    nextStep: "Send the address, condition, timeline, and the truth of the situation.",
    standard: "No blind offers. No pressure. No promise of a result before the facts are known.",
    cta: "Send the property",
    icon: Building2,
  },
  {
    id: "representation",
    href: "/work-with-apollo",
    audience: "Seller or buyer",
    routeCode: "AGENCY LANE",
    label: "I want Apollo to represent me",
    short: "Listing representation, buyer representation, pricing, negotiation, and closing discipline.",
    detail:
      "Use this lane to ask about current licensed-representation availability. Any agency relationship requires current license verification and a separate written brokerage agreement.",
    nextStep: "Review the representation page before any agency conversation begins.",
    standard: "Pegasus strategy and licensed real estate representation stay clearly separated.",
    cta: "See representation",
    icon: KeyRound,
  },
  {
    id: "buyer-investor",
    href: "/buyers",
    audience: "Buyer",
    routeCode: "BUYER READ",
    label: "I am buying or investing",
    short: "Investor-minded search, buy-box discipline, diligence, and offer strategy.",
    detail:
      "For buyers who want more than showings. This lane is for people who want an operator's lens on value, risk, repairs, rent, resale, and offer structure.",
    nextStep: "Share the target area, budget, and the kind of risk you are willing to take.",
    standard: "Useful for first purchases, value-add buyers, and long-term operators.",
    cta: "Open buyer lane",
    icon: Search,
  },
  {
    id: "deal-finder",
    href: "/deal-partners",
    audience: "Wholesaler or finder",
    routeCode: "DEAL FINDER",
    label: "I have a deal or lead",
    short: "Bring the opportunity once, with enough context to discuss a possible path.",
    detail:
      "Pegasus may consider a purchase, JV, or other path, but no buyer, review, source protection, response, or transaction is promised by this page.",
    nextStep:
      "Submit the known facts and your role. Any confidentiality, distribution, JV, or compensation rights require separate signed terms.",
    standard:
      "The intake records submitted source information but does not create a protection or non-circumvention agreement.",
    cta: "Bring the deal",
    icon: Handshake,
  },
  {
    id: "build",
    href: "/development",
    audience: "Build or reposition",
    routeCode: "DEVELOPMENT",
    label: "I want to build, renovate, or reposition",
    short: "ADU, value-add, scope, budget logic, timeline control, and finished-product thinking.",
    detail:
      "This lane explains a framework for thinking about scope, cost, timeline, and the finished asset. Any project service requires separate diligence and written terms.",
    nextStep: "Bring the site, scope, rough budget, and the finished asset you are trying to create.",
    standard: "Development is treated as operating work, not decoration.",
    cta: "See development",
    icon: Hammer,
  },
  {
    id: "capital",
    href: "/capital",
    audience: "Introduced relationship",
    routeCode: "CAPITAL INTRODUCTION",
    label: "I have an existing relationship or personal introduction",
    short: "Existing relationships and personal introductions only. This is not a general application.",
    detail:
      "Pegasus begins capital conversations only through an existing relationship or a personal introduction. The public page records relationship context; it does not offer a project or create access.",
    nextStep: "Continue only if Apollo already knows you or someone personally connected you.",
    standard: "No general application, public offering, access promise, or guaranteed return.",
    cta: "Continue an introduction",
    icon: Banknote,
  },
  {
    id: "vendor",
    href: "/vendor-network",
    audience: "Vendor or operator",
    routeCode: "OPERATOR NETWORK",
    label: "I want to work with Pegasus",
    short: "Contractors, trades, lenders, agents, inspectors, and reliable operators.",
    detail:
      "The vendor lane accepts profiles for possible future scope consideration. It is not evidence of active work or an approved bench.",
    nextStep: "Share the trade, market, capacity, and proof of reliable work.",
    standard: "Application does not promise review, approval, placement, work, or volume.",
    cta: "Apply to network",
    icon: Network,
  },
  {
    id: "not-sure",
    href: "mailto:apollo@pegasusdreamscapes.com",
    audience: "Not sure yet",
    routeCode: "PLAIN NOTE",
    label: "I need to explain it in plain English",
    short: "A general or non-property question can start with a direct note.",
    detail:
      "Email Apollo when the request does not fit property intake, representation, buyer interest, MarketFlow access, capital introduction, or vendor consideration.",
    nextStep: "Write the request in plain English and include only the context needed to identify the right lane.",
    standard: "A note does not promise review, routing, service, or a response.",
    cta: "Email Apollo",
    icon: MessageSquare,
  },
];

export function ConnectChooser({ context = 'card' }: { context?: 'card' | 'contact' }) {
  return <article className="experience-page ep-connect">
    <PageOpening title={context === 'contact' ? 'Let’s understand what you have in mind.' : 'Apollo Duran. Pegasus Dreamscapes.'} image={context === 'card' ? { src: '/images/founder/apollo.webp', alt: 'Apollo Duran', width: 1100, height: 1375, portrait: true } : undefined}>
      <p>{context === 'contact' ? 'Choose the path for your property, project, or question. You can also reach Apollo directly.' : 'Founder, Pegasus Dreamscapes. Residential construction and real estate operations in the East Bay.'}</p>
      <div className="ep-contact-links"><a href={PUBLIC_CONTACT.telephone} data-testid="link-connect-phone">{PUBLIC_CONTACT.phone}</a><a href={`mailto:${PUBLIC_CONTACT.email}`} data-testid="link-connect-email">{PUBLIC_CONTACT.email}</a></div>
      <p className="ep-notice">{REPRESENTATION_NOTICE}</p>
    </PageOpening>
    <section className="ep-section"><div className="experience-wrap ep-split"><div><h2>Where would you like to start?</h2><p>A direct path to the relevant inquiry or tool.</p><p className="ep-notice">{SUBMISSION_NOTICE}</p></div>
      <div className="ep-link-list">{LANES.slice(0,4).map(lane => <Link key={lane.id} href={lane.href} data-testid={`link-connect-${lane.id}`} onClick={() => trackCtaClick('connect',lane.label,lane.href)}><span><strong>{lane.audience}</strong><small>{lane.short}</small></span><ArrowRight aria-hidden="true" /></Link>)}
        <Link href="/tools"><span><strong>Tools</strong><small>Model a property or resume a browser draft.</small></span><ArrowRight aria-hidden="true" /></Link>
      </div>
    </div></section>
    <section className="ep-section ep-warm"><div className="experience-wrap ep-split"><h2>A project, introduction, or another question?</h2><div className="ep-link-list">{LANES.slice(4).map(lane => <Link key={lane.id} href={lane.href} data-testid={`link-connect-${lane.id}`} onClick={() => trackCtaClick('connect',lane.label,lane.href)}><span><strong>{lane.audience}</strong><small>{lane.short}</small></span><ArrowRight aria-hidden="true" /></Link>)}</div></div></section>
    <section className="ep-section ep-dark"><div className="experience-wrap ep-split"><h2>You can start with a note.</h2><div><p>For a general or non-property question, email Apollo with the context needed to understand your request. Review, service, and response timing are not promised.</p><PageAction href={`mailto:${PUBLIC_CONTACT.email}`}>Email Apollo</PageAction></div></div></section>
  </article>;
}
