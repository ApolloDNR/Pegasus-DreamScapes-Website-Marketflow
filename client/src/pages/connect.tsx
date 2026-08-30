import { useState } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { trackCtaClick } from "@/lib/analytics";
import { IMG } from "@/pegasus/primitives";
import {
  ArrowRight,
  Banknote,
  Building2,
  Hammer,
  Handshake,
  KeyRound,
  Mail,
  MapPin,
  MessageSquare,
  Network,
  Phone,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
    href: "/submit?intent=property",
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
    href: "/dealfinders",
    audience: "Wholesaler or finder",
    routeCode: "DEAL FINDER",
    label: "I have a deal or lead",
    short: "Bring the opportunity once, with enough context to discuss a possible path.",
    detail:
      "Pegasus may consider a purchase, JV, or other path, but no buyer, review, source protection, response, or transaction is promised by this page.",
    nextStep: "Submit the deal once there is enough context to protect the source and the path.",
    standard: "We do not build trust by taking someone's lead around them.",
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
    audience: "Capital partner",
    routeCode: "CAPITAL",
    label: "I am exploring a capital relationship",
    short: "Private, project-specific conversations only. No public investment offering.",
    detail:
      "Capital conversations are handled privately and tied to specific projects, terms, risk, and suitability. This website does not offer securities or guaranteed returns.",
    nextStep: "Start with a private conversation tied to a specific project or mandate.",
    standard: "No blind pool promise. No guaranteed return language.",
    cta: "Open capital page",
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
    href: "/contact",
    audience: "Not sure yet",
    routeCode: "PLAIN NOTE",
    label: "I need to explain it in plain English",
    short: "If the lane is not obvious, start with the situation.",
    detail:
      "A property problem does not always arrive neatly labeled. Send the note, make the call, or use Peggy to frame the intake before you choose a lane.",
    nextStep: "Write the situation in plain English. The lane can be named after the facts are clear.",
    standard: "Plain language is enough to begin.",
    cta: "Send a note",
    icon: MessageSquare,
  },
];

const PRIMARY_LANES = LANES.slice(0, 4);

const ROUTING_STANDARDS = [
  "Private first read",
  "No blind offer",
  "Agency stays separate",
  "Plain answer if it is not a fit",
];

function RouteIllustration() {
  return (
    <svg
      className="connect-route-illustration"
      viewBox="0 0 560 260"
      role="img"
      aria-label="Pegasus routing linework from property situation to the right path"
    >
      <path className="connect-svg-muted" d="M62 214H498" />
      <path className="connect-svg-muted" d="M102 186H458" />
      <path className="connect-svg-muted" d="M146 78L280 28L414 78" />
      <path className="connect-svg-copper" d="M118 116L280 82L442 116" />
      <path className="connect-svg-soft" d="M146 142L280 116L414 142" />
      <path className="connect-svg-soft" d="M180 184V128" />
      <path className="connect-svg-soft" d="M280 184V104" />
      <path className="connect-svg-soft" d="M380 184V128" />
      <circle className="connect-svg-node" cx="118" cy="116" r="5" />
      <circle className="connect-svg-node" cx="280" cy="82" r="5" />
      <circle className="connect-svg-node" cx="442" cy="116" r="5" />
      <path className="connect-svg-copper" d="M84 226C150 210 190 210 250 226C316 244 360 244 476 216" />
    </svg>
  );
}

function ContactRail() {
  return (
    <div className="connect-contact-rail">
      <a
        href="tel:+19257448525"
        data-testid="link-connect-phone"
        onClick={() => trackCtaClick("connect", "Phone tap", "tel:+19257448525")}
      >
        <Phone className="h-4 w-4" aria-hidden="true" />
        <span>925-744-8525</span>
      </a>
      <a
        href="mailto:apollo@pegasusdreamscapes.com"
        data-testid="link-connect-email"
        onClick={() => trackCtaClick("connect", "Email tap", "mailto:apollo@pegasusdreamscapes.com")}
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
        <span>apollo@pegasusdreamscapes.com</span>
      </a>
      <span>
        <MapPin className="h-4 w-4" aria-hidden="true" />
        East Bay, CA
      </span>
    </div>
  );
}

function LaneButton({
  lane,
  active,
  onSelect,
}: {
  lane: ConnectLane;
  active: boolean;
  onSelect: (lane: ConnectLane) => void;
}) {
  const Icon = lane.icon;

  return (
    <button
      type="button"
      className={active ? "connect-lane-button is-active" : "connect-lane-button"}
      aria-pressed={active}
      onClick={() => onSelect(lane)}
      onMouseEnter={() => onSelect(lane)}
      data-testid={`button-connect-lane-${lane.id}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{lane.audience}</span>
    </button>
  );
}

function ActiveLanePanel({ lane }: { lane: ConnectLane }) {
  const Icon = lane.icon;

  return (
    <aside className="connect-panel" data-testid="connect-active-lane">
      <div className="connect-panel-kicker">
        <span>{lane.routeCode}</span>
        <small>Route card</small>
      </div>
      <div className="connect-panel-head">
        <div>
          <p>Best starting point</p>
          <h2>{lane.label}</h2>
        </div>
        <span>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <RouteIllustration />

      <p className="connect-panel-detail">{lane.detail}</p>

      <div className="connect-panel-next">
        <small>Next move</small>
        <p>{lane.nextStep}</p>
      </div>

      <div className="connect-panel-standard">
        <small>Standard</small>
        <p>{lane.standard}</p>
      </div>

      <Link
        href={lane.href}
        onClick={() => trackCtaClick("connect", lane.cta, lane.href)}
        className="connect-panel-cta"
        data-testid={`link-connect-active-${lane.id}`}
      >
        {lane.cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </aside>
  );
}

function Hero({
  activeLane,
  setActiveLane,
}: {
  activeLane: ConnectLane;
  setActiveLane: (lane: ConnectLane) => void;
}) {
  return (
    <section className="connect-hero" data-testid="section-connect-hero">
      <img
        src={IMG("hero/luxury-home-1920.jpg")}
        alt=""
        aria-hidden="true"
        className="connect-hero-image"
      />
      <div className="connect-hero-shade" aria-hidden="true" />

      <div className="connect-shell connect-hero-grid">
        <div className="connect-hero-copy">
          <p className="connect-eyebrow">Private QR front door</p>
          <h1>The right door, before the wrong conversation.</h1>
          <p className="connect-lead">
            Use this card page to choose the correct Pegasus lane: property intake, Apollo representation, buyer strategy, deal finder or JV, development, capital, vendor work, or a direct note.
          </p>

          <div className="connect-actions">
            <Link
              href="/submit?intent=property"
              onClick={() => trackCtaClick("connect", "Send a property", "/submit?intent=property")}
              className="connect-primary"
              data-testid="link-connect-submit"
            >
              Send a property
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/work-with-apollo"
              onClick={() => trackCtaClick("connect", "Work with Apollo", "/work-with-apollo")}
              className="connect-secondary"
            >
              Work with Apollo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <ContactRail />

          <div className="connect-proof-row" aria-label="Pegasus routing standards">
            {ROUTING_STANDARDS.map((standard) => (
              <span key={standard}>{standard}</span>
            ))}
          </div>

          <div className="connect-quick-lanes" aria-label="Choose a primary lane">
            {PRIMARY_LANES.map((lane) => (
              <LaneButton
                key={lane.id}
                lane={lane}
                active={activeLane.id === lane.id}
                onSelect={setActiveLane}
              />
            ))}
          </div>
        </div>

        <ActiveLanePanel lane={activeLane} />
      </div>
    </section>
  );
}

function LaneDirectory({
  activeLane,
  setActiveLane,
}: {
  activeLane: ConnectLane;
  setActiveLane: (lane: ConnectLane) => void;
}) {
  return (
    <section className="connect-directory" data-testid="section-connect-directory">
      <div className="connect-shell">
        <div className="connect-section-head">
          <p className="connect-eyebrow">Routing ledger</p>
          <h2>Choose the lane that best describes the request.</h2>
          <p>
            Pick the door that matches the work. If the situation is messy, start with property intake or send a plain note. Pegasus can name the lane after the facts are clear.
          </p>
        </div>

        <div className="connect-lane-list">
          {LANES.map((lane) => {
            const Icon = lane.icon;
            const active = lane.id === activeLane.id;
            return (
              <Link
                key={lane.id}
                href={lane.href}
                onMouseEnter={() => setActiveLane(lane)}
                onFocus={() => setActiveLane(lane)}
                onClick={() => trackCtaClick("connect", lane.label, lane.href)}
                className={active ? "connect-lane-row is-active" : "connect-lane-row"}
                data-testid={`link-connect-${lane.id}`}
              >
                <span className="connect-row-icon">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="connect-row-main">
                  <small>{lane.audience}</small>
                  <strong>{lane.label}</strong>
                </span>
                <span className="connect-row-copy">{lane.short}</span>
                <ArrowRight className="connect-row-arrow h-4 w-4" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StandardsBand() {
  return (
    <section className="connect-standards" data-testid="section-connect-standards">
      <div className="connect-shell connect-standards-grid">
        <div>
          <p className="connect-eyebrow">Pegasus standard</p>
          <h2>The public page keeps the boundaries clear.</h2>
        </div>
        <div className="connect-standards-copy">
          <p>
            Pegasus Dreamscapes presents educational frameworks and request paths for property situations, development, possible JV discussions, buyer needs, and vendor profiles. Availability is conditional.
          </p>
          <p>
            This site uses Paolo “Apollo” Duran as a public-facing name. For license verification, CA DRE #02333658 is listed under Duran Ramirez, Paolo Ariel, with responsible broker BMP Realty Inc DBA Keller Williams Realty-East Bay. Verify current status. Any representation requires a separate written brokerage agreement.
          </p>
        </div>
        <div className="connect-standard-tags" aria-label="Compliance and trust standards">
          <span>DRE #02333658</span>
          <span>Responsible broker: BMP Realty Inc DBA Keller Williams Realty-East Bay</span>
          <span>Equal Housing</span>
          <span>No public securities offering</span>
        </div>
      </div>
    </section>
  );
}

export default function ConnectPage() {
  const [activeLane, setActiveLane] = useState<ConnectLane>(LANES[0]);

  useSEO({
    title: "Connect",
    description:
      "Choose the right Pegasus Dreamscapes starting point: property intake, representation, buyer strategy, deal finder path, development, capital, vendor work, or a direct note.",
    image: "/og/about.png",
  });

  return (
    <div className="connect-premium">
      <Hero activeLane={activeLane} setActiveLane={setActiveLane} />
      <LaneDirectory activeLane={activeLane} setActiveLane={setActiveLane} />
      <StandardsBand />
    </div>
  );
}
