import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
import { trackCtaClick } from "@/lib/analytics";
import {
  Activity,
  ArrowRight,
  Database,
  GitCommit,
  GitMerge,
  Radio,
  ShieldCheck,
  Terminal,
} from "lucide-react";

// Website Structure v1 FINAL §3.3 — Deal Architecture is the public
// "what we do" page. The locked content (doctrine line + 3 routing
// steps + 10 outcome lanes + CTA pair + honest disclosure) is
// preserved verbatim; the chrome is the "Switchboard Console"
// graduation (operator-room aesthetic on Empire Doctrine tokens
// Deep Navy + Rich Copper + Warm Cream + Charcoal).

type LaneType = "internal" | "external" | "market";

const STEPS: {
  id: string;
  phase: "INTAKE" | "ANALYSIS" | "ROUTING";
  title: string;
  desc: string;
}[] = [
  {
    id: "01",
    phase: "INTAKE",
    title: "Submit the situation",
    desc: "Address, condition, what you're trying to solve. Two minutes at /submit.",
  },
  {
    id: "02",
    phase: "ANALYSIS",
    title: "Apollo reads it structurally",
    desc: "Comps, condition, capital stack, timeline, occupancy, exposure. The Pegasus lens.",
  },
  {
    id: "03",
    phase: "ROUTING",
    title: "We name the lane",
    desc: "One of the ten lanes below, including a routed referral if Pegasus isn't the right fit.",
  },
];

const LANES: {
  id: string;
  title: string;
  desc: string;
  type: LaneType;
  cycle: string;
  route: string;
}[] = [
  {
    id: "01",
    title: "Direct acquisition",
    desc: "Pegasus buys the property outright at a structurally honest number.",
    type: "internal",
    cycle: "14-21D",
    route: "ACQ-DIR",
  },
  {
    id: "02",
    title: "Creative finance",
    desc: "Seller-carry, subject-to, lease-option, and other non-conforming structures when the situation calls for it.",
    type: "internal",
    cycle: "VARIES",
    route: "FIN-CRT",
  },
  {
    id: "03",
    title: "Joint venture / co-GP",
    desc: "We bring capital and operational discipline to an aligned operator's project.",
    type: "internal",
    cycle: "30-60D",
    route: "JV-PTNR",
  },
  {
    id: "04",
    title: "Wholesale assignment",
    desc: "When the right buyer is another operator in our network, we route the deal there.",
    type: "external",
    cycle: "7-14D",
    route: "WHL-ASG",
  },
  {
    id: "05",
    title: "Listing through KW",
    desc: "A clean MLS listing through Apollo's Keller Williams East Bay license, with the strategic read built in.",
    type: "market",
    cycle: "STD-MLS",
    route: "LST-KW",
  },
  {
    id: "06",
    title: "Buyer representation",
    desc: "Owner-occupant and investor-side buyer rep, run through the same underwriting lens as every Pegasus acquisition.",
    type: "market",
    cycle: "VARIES",
    route: "REP-BUY",
  },
  {
    id: "07",
    title: "BRRRR acquisition",
    desc: "Buy, rehab, rent, refinance, repeat. For properties that should be held instead of resold.",
    type: "internal",
    cycle: "HOLD",
    route: "ACQ-BRR",
  },
  {
    id: "08",
    title: "ADU upside",
    desc: "Detached or attached accessory dwelling units on East Bay residential lots. Design, permit, build.",
    type: "internal",
    cycle: "180D+",
    route: "DEV-ADU",
  },
  {
    id: "09",
    title: "Value-add rehab",
    desc: "Heavy cosmetic and structural rehabs that take a tired property to its highest defensible value.",
    type: "internal",
    cycle: "90-120D",
    route: "DEV-REH",
  },
  {
    id: "10",
    title: "Routed referral",
    desc: "If the right path is outside Pegasus, we route the owner to a vetted operator who can actually help.",
    type: "external",
    cycle: "N/A",
    route: "REF-OUT",
  },
];

const LANE_DOT: Record<LaneType, string> = {
  internal:
    "bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.4)]",
  external:
    "bg-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
  market:
    "bg-purple-500/80 shadow-[0_0_8px_rgba(168,85,247,0.4)]",
};

function useUtcClock(): string {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export default function DealArchitecture() {
  useSEO({
    title: "Deal Strategy",
    description:
      "Every complex property has a path. Direct acquisition, creative finance, JV, listing, buyer rep, BRRRR, ADU upside, value-add, or a routed referral. Pegasus reviews the situation and matches it to the lane that fits.",
    image: "/og/default.png",
  });

  const time = useUtcClock();

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-[#0D1B2D] text-[#F6EFE4] font-sans selection:bg-[#C77A3A]/30"
      data-testid="page-deal-architecture"
    >
      {/* Background grid + soft vertical wash. Pointer-events-none so
          nothing under the nav loses click targets. */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(#F6EFE4 1px, transparent 1px), linear-gradient(90deg, #F6EFE4 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0D1B2D] via-transparent to-[#0D1B2D] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top telemetry strip. Sits below the global nav (which is
          translucent over navy) so the two read as a stacked HUD. */}
      <div
        className="relative z-20 w-full border-b border-[#F6EFE4]/10 bg-[#0D1B2D]/80 backdrop-blur-md px-6 py-2 mt-20 lg:mt-24 flex justify-between items-center text-[10px] font-mono tracking-widest text-[#F6EFE4]/60"
        data-testid="bar-deal-architecture-telemetry"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            SYSTEM.ONLINE
          </div>
          <div className="hidden sm:block">ROUTING.PROTOCOL: PEGASUS-V1</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <Activity size={12} className="text-[#C77A3A]" />
            GRID.STABLE
          </div>
          <div data-testid="text-deal-architecture-clock">
            {time || "LOADING..."}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-20 lg:py-28 space-y-24 lg:space-y-32">
        {/* DOCTRINE LINE */}
        <section
          className="relative text-center max-w-4xl mx-auto space-y-8"
          data-testid="section-deal-architecture-doctrine"
        >
          <ScrollReveal>
            <div className="inline-flex items-center gap-3 border border-[#C77A3A]/30 bg-[#C77A3A]/5 px-4 py-1.5 rounded-full text-[#C77A3A] font-['Montserrat'] text-[10px] uppercase tracking-[0.2em] font-bold">
              <Radio size={12} />
              Deal Strategy &amp; Real Estate Execution
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-['Cinzel'] leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-[#F6EFE4] to-[#F6EFE4]/60 pb-2 mt-6"
              data-testid="text-deal-architecture-headline"
            >
              Deal Strategy
              <br />
              <span className="italic font-['Cormorant_Garamond'] text-[#F6EFE4]/80">
                Every property gets a path. Not every property gets an offer.
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal>
            <h2
              className="text-xl sm:text-2xl font-['Inter'] text-[#F6EFE4]/90 font-light tracking-wide border-b border-[#F6EFE4]/10 pb-8 inline-block"
              data-testid="text-deal-architecture-doctrine"
            >
              Bring us the property. We'll help find the path.
            </h2>
          </ScrollReveal>

          <ScrollReveal>
            <p className="font-['Space_Mono'] text-xs sm:text-sm text-[#F6EFE4]/55 leading-relaxed max-w-2xl mx-auto uppercase tracking-wider mt-8">
              &gt; Most groups want the property that fits their single playbook.
              <br />
              &gt; Pegasus is built differently. We review the situation,
              <br />
              &gt; then match it to the lane that fits, whether that lane is
              <br />
              &gt; ours or someone else's.
            </p>
          </ScrollReveal>
        </section>

        {/* THREE STEPS PIPELINE */}
        <section
          className="relative"
          data-testid="section-deal-architecture-how-it-works"
        >
          <ScrollReveal>
            <div className="mb-10 border-b border-[#F6EFE4]/10 pb-4 flex items-center justify-between">
              <h3 className="font-['Montserrat'] text-xs text-[#F6EFE4]/60 uppercase tracking-[0.3em] font-bold flex items-center gap-3">
                <GitCommit size={14} className="text-[#C77A3A]" />
                Routing pipeline sequence
              </h3>
              <span className="font-mono text-[10px] text-[#F6EFE4]/40">
                SEQ_NO: 003
              </span>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-1 bg-[#F6EFE4]/10 p-1 rounded-sm border border-[#F6EFE4]/20 relative">
            <div
              className="absolute top-1/2 left-0 right-0 h-px bg-[#F6EFE4]/10 -translate-y-1/2 hidden md:block"
              aria-hidden="true"
            />
            {STEPS.map((step, i) => (
              <div
                key={step.id}
                data-testid={`step-routing-${step.id}`}
                className="relative z-10 bg-[#1E2328] border border-[#F6EFE4]/10 p-6 shadow-2xl flex flex-col justify-between h-full group hover:border-[#C77A3A]/50 transition-colors duration-500"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="font-mono text-3xl text-[#F6EFE4]/20 font-bold group-hover:text-[#C77A3A]/40 transition-colors">
                    {step.id}
                  </div>
                  <div className="flex items-center gap-2 bg-[#0D1B2D] px-2 py-1 border border-[#F6EFE4]/10">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        i === 0
                          ? "bg-green-500 animate-pulse"
                          : i === 1
                            ? "bg-[#C77A3A]"
                            : "bg-[#F6EFE4]/30"
                      }`}
                    />
                    <span className="font-['Montserrat'] text-[8px] uppercase tracking-[0.2em] font-bold text-[#F6EFE4]/60">
                      {step.phase}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-['Cinzel'] text-xl mb-3 text-[#F6EFE4]">
                    {step.title}
                  </h4>
                  <p className="font-['Space_Mono'] text-xs text-[#F6EFE4]/55 uppercase leading-relaxed tracking-wider">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TEN OUTCOME LANES */}
        <section className="relative">
          <ScrollReveal>
            <div className="mb-10 border-b border-[#F6EFE4]/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-['Montserrat'] text-xs text-[#F6EFE4]/60 uppercase tracking-[0.3em] font-bold flex items-center gap-3">
                <Database size={14} className="text-[#C77A3A]" />
                Destination switchboard grid
              </h3>
              <div className="flex flex-wrap gap-4 font-mono text-[10px] text-[#F6EFE4]/50">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/80" />
                  ACTIVE_INTERNAL
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
                  EXTERNAL_ROUTE
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500/80" />
                  MARKET_LISTING
                </span>
              </div>
            </div>
          </ScrollReveal>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-[#F6EFE4]/10 border border-[#F6EFE4]/20 p-px"
            data-testid="grid-deal-architecture-lanes"
          >
            {LANES.map((lane, i) => (
              <div
                key={lane.id}
                data-testid={`chip-lane-${i}`}
                className="bg-[#1E2328] hover:bg-[#262C37] p-5 transition-colors duration-200 group relative border border-transparent hover:border-[#C77A3A]/30 flex flex-col justify-between min-h-[280px]"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="font-mono text-xl text-[#F6EFE4]/30">
                    {lane.id}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${LANE_DOT[lane.type]}`}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h4 className="font-['Cinzel'] font-semibold text-lg mb-2 leading-tight text-[#F6EFE4] group-hover:text-[#C77A3A] transition-colors">
                    {lane.title}
                  </h4>
                  <p className="font-['Inter'] text-xs text-[#F6EFE4]/55 leading-relaxed mb-6">
                    {lane.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F6EFE4]/5 grid grid-cols-2 gap-2 mt-auto">
                  <div>
                    <div className="font-['Montserrat'] text-[8px] uppercase tracking-[0.2em] text-[#F6EFE4]/30 mb-1">
                      ROUTE_CODE
                    </div>
                    <div className="font-mono text-[10px] text-[#F6EFE4]/70">
                      {lane.route}
                    </div>
                  </div>
                  <div>
                    <div className="font-['Montserrat'] text-[8px] uppercase tracking-[0.2em] text-[#F6EFE4]/30 mb-1">
                      EST_CYCLE
                    </div>
                    <div className="font-mono text-[10px] text-[#F6EFE4]/70">
                      {lane.cycle}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HONEST DISCLOSURE — v1 FINAL §3.3 anti-overclaim block.
            Retained verbatim, re-themed to read as a system console
            notice instead of a paper card. */}
        <section
          className="relative"
          data-testid="section-deal-architecture-honest"
        >
          <ScrollReveal>
            <div className="border border-[#C77A3A]/25 bg-[#0D1B2D] p-8 lg:p-12 max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-4 h-4 text-[#C77A3A]" aria-hidden="true" />
                <p className="font-['Montserrat'] text-[10px] uppercase tracking-[0.3em] text-[#C77A3A] font-bold">
                  Honest disclosure
                </p>
              </div>
              <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-semibold tracking-tight mb-5 leading-tight text-[#F6EFE4]">
                Every property gets a path. Not every property gets an offer.
              </h2>
              <p className="font-['Inter'] text-sm sm:text-base text-[#F6EFE4]/70 leading-relaxed mb-3">
                Some properties don't fit any Pegasus lane. When that happens we
                say so directly and route the owner to a vetted operator who can
                actually help, instead of stringing the conversation along.
              </p>
              <p className="font-['Inter'] text-sm sm:text-base text-[#F6EFE4]/70 leading-relaxed">
                No high-pressure tactics. No bandit-sign marketing. No promises
                we can't keep. The first review is free, structural, and honest.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* CLOSING CTA */}
        <section className="relative text-center border-t border-[#F6EFE4]/10 pt-16 pb-4">
          <ScrollReveal>
            <h3 className="font-['Cinzel'] text-3xl sm:text-4xl mb-3 text-[#F6EFE4]">
              Bring us the property.
            </h3>
            <p className="font-['Inter'] text-sm sm:text-base text-[#F6EFE4]/70 max-w-xl mx-auto mb-9">
              Submit the situation. The first review is free, structural, and honest.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
              <Link
                href="/submit"
                onClick={() =>
                  trackCtaClick(
                    "deal_architecture_footer",
                    "Submit a Property",
                    "/submit",
                  )
                }
                className="group relative w-full sm:w-auto bg-[#C77A3A] hover:bg-[#B06A30] text-white px-8 py-5 font-['Montserrat'] text-xs uppercase tracking-[0.2em] font-bold overflow-hidden transition-colors"
                data-testid="button-deal-arch-submit"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Terminal size={14} />
                  Submit a Property
                  <ArrowRight size={14} />
                </span>
              </Link>

              <Link
                href="/strategy-lab"
                onClick={() =>
                  trackCtaClick(
                    "deal_architecture_footer",
                    "Open Strategy Lab",
                    "/strategy-lab",
                  )
                }
                className="group relative w-full sm:w-auto border border-[#F6EFE4]/30 text-[#F6EFE4] hover:bg-[#F6EFE4]/5 hover:border-[#F6EFE4]/50 px-8 py-5 font-['Montserrat'] text-xs uppercase tracking-[0.2em] font-bold transition-colors"
                data-testid="button-deal-arch-strategy-lab"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <GitMerge size={14} />
                  Open Strategy Lab
                </span>
              </Link>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
}
