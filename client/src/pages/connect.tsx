import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/use-seo";
import { trackCtaClick } from "@/lib/analytics";
import { BrandMark, IMG } from "@/pegasus/primitives";
import {
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
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ConnectLane = {
  id: string;
  href: string;
  eyebrow: string;
  label: string;
  sub: string;
  detail: string;
  proof: string;
  cta: string;
  icon: LucideIcon;
};

const LANES: ConnectLane[] = [
  {
    id: "complex-owner",
    href: "/submit?intent=property",
    eyebrow: "Distressed or complex owner",
    label: "I have a property situation",
    sub: "Inherited, occupied, dated, stuck, or under pressure.",
    detail:
      "Pegasus reviews the situation, runs the numbers, and routes the cleanest path: buy, partner, list, refer, or pass with a reason.",
    proof: "No guaranteed offer. No pressure. Real review first.",
    cta: "Submit the property",
    icon: Building2,
  },
  {
    id: "listing-seller",
    href: "/work-with-apollo",
    eyebrow: "Ready seller",
    label: "I want listing representation",
    sub: "Move-in-ready or traditional sale, represented through KW East Bay.",
    detail:
      "When agency is the right lane, Apollo can represent sellers through Keller Williams Realty East Bay with pricing, prep, launch, negotiation, and closing discipline.",
    proof: "Licensed real estate services are separate from Pegasus property strategy.",
    cta: "See representation",
    icon: KeyRound,
  },
  {
    id: "buyer",
    href: "/buyers",
    eyebrow: "Buyer or investor buyer",
    label: "I want an investor-minded agent",
    sub: "Buy-box discipline, diligence, and offer strategy.",
    detail:
      "Apollo can represent buyers through Keller Williams Realty East Bay when agency is the right lane, with underwriting logic behind the search and offer process.",
    proof: "Useful for first deals, value-add purchases, and long-term operators.",
    cta: "Explore buyer lane",
    icon: Search,
  },
  {
    id: "deal-finder",
    href: "/dealfinders",
    eyebrow: "Wholesaler or deal finder",
    label: "I have a deal or lead",
    sub: "Bring the opportunity, protect your lane, get a straight answer.",
    detail:
      "If it fits the Pegasus buy box, we can buy. If the cleaner move is a vetted buyer, we can discuss JV or network routing under written terms.",
    proof: "We do not build trust by taking someone's lead around them.",
    cta: "Bring the deal",
    icon: Handshake,
  },
  {
    id: "development",
    href: "/development",
    eyebrow: "Build or reposition",
    label: "I want to build or renovate",
    sub: "ADU, value-add, scope control, and finished-product thinking.",
    detail:
      "Pegasus Development turns a property plan into scoped work, budget logic, timeline discipline, and a finished asset strategy.",
    proof: "Renovation and development are handled as operating work, not decoration.",
    cta: "See development",
    icon: Hammer,
  },
  {
    id: "capital",
    href: "/capital",
    eyebrow: "Capital partner",
    label: "I am exploring capital partnership",
    sub: "Specific projects, private review, no public investment offering.",
    detail:
      "Capital conversations are private, project-specific, and suitability-reviewed. This site does not offer securities or guaranteed returns.",
    proof: "Defined terms, real risk language, and no blind-pool promise.",
    cta: "Open capital page",
    icon: Banknote,
  },
  {
    id: "vendor",
    href: "/vendor-network",
    eyebrow: "Vendor or operator",
    label: "I want to work with Pegasus",
    sub: "Contractors, lenders, agents, trades, and operators.",
    detail:
      "The vendor lane is for people who can help active property work move cleanly: reliable scope, clean communication, and repeatable execution.",
    proof: "Good operators get routed to real work when the fit is right.",
    cta: "Apply to network",
    icon: Network,
  },
  {
    id: "question",
    href: "/contact",
    eyebrow: "Direct question",
    label: "I need to talk through the situation",
    sub: "Send the note, make the call, or let Peggy frame the intake.",
    detail:
      "If the lane is not obvious yet, start with the situation. Pegasus will route the conversation instead of forcing you through the wrong form.",
    proof: "Plain language is enough to begin.",
    cta: "Send a note",
    icon: MessageSquare,
  },
];

function ContactRail() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href="tel:+19257448525"
        className="inline-flex items-center gap-2.5 rounded-sm border border-white/[0.18] bg-white/[0.06] px-4 py-3 text-sm text-white/90 transition-colors hover:border-[#C87A3A]/70 hover:bg-[#C87A3A]/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C87A3A]"
        data-testid="link-connect-phone"
        onClick={() => trackCtaClick("connect", "Phone tap", "tel:+19257448525")}
      >
        <Phone className="h-3.5 w-3.5 text-[#D9965D]" aria-hidden="true" />
        <span className="font-medium">925-744-8525</span>
      </a>
      <a
        href="mailto:apollo@pegasusdreamscapes.com"
        className="inline-flex items-center gap-2.5 rounded-sm border border-white/[0.18] bg-white/[0.06] px-4 py-3 text-sm text-white/90 transition-colors hover:border-[#C87A3A]/70 hover:bg-[#C87A3A]/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C87A3A]"
        data-testid="link-connect-email"
        onClick={() => trackCtaClick("connect", "Email tap", "mailto:apollo@pegasusdreamscapes.com")}
      >
        <Mail className="h-3.5 w-3.5 text-[#D9965D]" aria-hidden="true" />
        <span className="font-medium">apollo@pegasusdreamscapes.com</span>
      </a>
      <span className="inline-flex items-center gap-2.5 rounded-sm border border-white/[0.14] px-4 py-3 text-sm text-white/[0.68]">
        <MapPin className="h-3.5 w-3.5 text-[#D9965D]" aria-hidden="true" />
        <span>East Bay, CA</span>
      </span>
    </div>
  );
}

function LanePreview({ lane }: { lane: ConnectLane }) {
  const Icon = lane.icon;

  return (
    <motion.aside
      key={lane.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="relative overflow-hidden rounded-md border border-white/[0.14] bg-[#0B1725]/[0.82] p-5 shadow-2xl shadow-black/30 backdrop-blur"
      data-testid="connect-lane-preview"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D9965D]/80 to-transparent" aria-hidden="true" />
      <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D9965D]">{lane.eyebrow}</p>
          <h2 className="mt-3 break-words font-serif text-3xl leading-tight text-[#F5E6D3]">{lane.label}</h2>
        </div>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-[#D9965D]/40 bg-[#C87A3A]/[0.12] text-[#D9965D]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-5 text-sm leading-7 text-white/[0.72]">{lane.detail}</p>
      <div className="mt-5 rounded-sm border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/[0.44]">Standard</p>
        <p className="mt-2 text-sm leading-6 text-white/[0.72]">{lane.proof}</p>
      </div>
      <Link
        href={lane.href}
        onClick={() => trackCtaClick("connect", lane.cta, lane.href)}
        className="group mt-5 inline-flex w-full items-center justify-between rounded-sm bg-[#C87A3A] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#D9965D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9965D]"
        data-testid={`link-connect-preview-${lane.id}`}
      >
        {lane.cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </Link>
    </motion.aside>
  );
}

function GreetingHero({
  activeLane,
  setActiveLane,
}: {
  activeLane: ConnectLane;
  setActiveLane: (lane: ConnectLane) => void;
}) {
  return (
    <section className="relative min-h-[760px] overflow-hidden bg-[#07111D] text-[#F5E6D3]">
      <img
        src={IMG("hero/luxury-home-1920.jpg")}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.52]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,29,0.98)_0%,rgba(7,17,29,0.86)_34%,rgba(7,17,29,0.52)_70%,rgba(7,17,29,0.78)_100%)]" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#07111D] to-transparent" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[1400px] min-w-0 gap-12 px-6 pb-20 pt-32 lg:grid-cols-12 lg:px-12 lg:pb-24 lg:pt-40">
        <motion.div
          className="min-w-0 lg:col-span-7"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="mb-8 flex items-center gap-4">
            <BrandMark boxClassName="h-14 w-14" onDark />
            <div>
              <p className="font-serif text-2xl leading-none tracking-[0.06em] text-[#F5E6D3]">Pegasus Dreamscapes</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D9965D]">Dream it. Build it. Live it.</p>
            </div>
          </div>

          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#D9965D]">
            One front door | East Bay real estate execution
          </p>
          <h1 className="max-w-[10ch] font-serif text-[clamp(2.35rem,10.2vw,7.4rem)] leading-[0.98] text-[#F5E6D3] sm:max-w-4xl">
            Start with the situation. Pegasus routes the path.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/[0.76] md:text-lg">
            Sellers, buyers, deal finders, vendors, and capital partners all enter through the same standard: a serious review, real underwriting, and a next step that makes sense for the property and the people involved.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/submit?intent=property"
              onClick={() => trackCtaClick("connect", "Submit a property", "/submit?intent=property")}
              className="group inline-flex items-center gap-3 rounded-sm bg-[#C87A3A] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#D9965D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9965D]"
              data-testid="link-submit-property"
            >
              Submit a property
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              href="/strategy-lab"
              onClick={() => trackCtaClick("connect", "Strategy Lab", "/strategy-lab")}
              className="group inline-flex items-center gap-3 rounded-sm border border-white/20 bg-white/[0.04] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:border-[#D9965D]/70 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9965D]"
            >
              Strategy Lab
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-7">
            <ContactRail />
          </div>

          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Quick lane selector">
            {LANES.slice(0, 4).map((lane) => (
              <button
                key={lane.id}
                type="button"
                aria-pressed={activeLane.id === lane.id}
                onClick={() => setActiveLane(lane)}
                className={`rounded-sm border px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  activeLane.id === lane.id
                    ? "border-[#D9965D] bg-[#C87A3A]/[0.18] text-[#F5E6D3]"
                    : "border-white/[0.14] bg-white/[0.04] text-white/[0.58] hover:border-[#D9965D]/60 hover:text-white/[0.86]"
                }`}
              >
                {lane.eyebrow}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="min-w-0 lg:col-span-5 lg:self-end">
          <LanePreview lane={activeLane} />
        </div>
      </div>
    </section>
  );
}

function RouteGrid({
  activeLane,
  setActiveLane,
}: {
  activeLane: ConnectLane;
  setActiveLane: (lane: ConnectLane) => void;
}) {
  return (
    <section className="bg-[#07111D] pb-20 text-[#F5E6D3] lg:pb-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <motion.div
          className="mb-10 grid gap-6 border-t border-white/10 pt-12 lg:grid-cols-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#D9965D]">What brought you here?</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[#F5E6D3] md:text-5xl">
              Pick the lane. The site should not make you guess.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/[0.66] lg:col-span-7 lg:pt-9">
            Each lane sends the right signal into Pegasus intake. Complex owners go to review, clean listings go to representation, buyers get agency guidance, and deal finders get a protected conversation around purchase or JV fit.
          </p>
        </motion.div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {LANES.map((lane, idx) => {
            const Icon = lane.icon;
            const active = activeLane.id === lane.id;
            return (
              <motion.div
                key={lane.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.04 * idx }}
              >
                <Link
                  href={lane.href}
                  onMouseEnter={() => setActiveLane(lane)}
                  onFocus={() => setActiveLane(lane)}
                  onClick={() => trackCtaClick("connect", lane.label, lane.href)}
                  className={`group block min-h-[188px] rounded-md border p-5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9965D] ${
                    active
                      ? "border-[#D9965D]/70 bg-[#C87A3A]/[0.13] shadow-xl shadow-black/20"
                      : "border-white/10 bg-white/[0.035] hover:border-[#D9965D]/50 hover:bg-white/[0.055]"
                  }`}
                  data-testid={`link-connect-${lane.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-[#D9965D]/35 bg-[#C87A3A]/[0.12] text-[#D9965D]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 text-white/30 transition-all group-hover:translate-x-1 group-hover:text-[#D9965D]" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D9965D]">{lane.eyebrow}</p>
                  <h3 className="mt-3 font-serif text-2xl leading-tight text-[#F5E6D3]">{lane.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/[0.62]">{lane.sub}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PeggyPresenceCard() {
  return (
    <section className="bg-[#F4F0E8] py-20 text-[#1A2332] lg:py-28">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 lg:grid-cols-12 lg:px-12">
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C87A3A]">PeggyAI intake</p>
          <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">A smarter first conversation.</h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#5A5147]">
            Peggy is the intake concierge. She helps frame the situation, asks cleaner questions, and routes the handoff. Peggy does not approve deals, make offers, or give legal, tax, lending, or investment advice.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="rounded-md border border-[#D7C7AF] bg-white p-5 shadow-xl shadow-[#1A2332]/[0.08] lg:col-span-7"
          data-testid="card-peggy-presence"
        >
          <div className="flex items-center gap-3 border-b border-[#E2D6BF] pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C87A3A] text-white">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-serif text-xl">Peggy with Pegasus Dreamscapes</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A755E]">Early access | intake only</p>
            </div>
          </div>
          <div className="grid gap-3 pt-5 sm:grid-cols-3">
            {[
              "What is the property address and current condition?",
              "Are you trying to sell, list, buy, partner, or understand options?",
              "What deadline, pressure, or outcome matters most?",
            ].map((line) => (
              <div key={line} className="rounded-sm border border-[#E2D6BF] bg-[#F9F6F0] p-4">
                <p className="text-sm leading-6 text-[#4E463D]">{line}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function ConnectPage() {
  const [activeLane, setActiveLane] = useState<ConnectLane>(LANES[0]);

  useSEO({
    title: "Connect",
    description:
      "Tell Pegasus Dreamscapes what you're working with: property, listing, buyer representation, deal finder opportunity, capital, vendor work, or a direct question.",
    image: "/og/about.png",
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07111D]">
      <GreetingHero activeLane={activeLane} setActiveLane={setActiveLane} />
      <RouteGrid activeLane={activeLane} setActiveLane={setActiveLane} />
      <PeggyPresenceCard />
    </div>
  );
}
