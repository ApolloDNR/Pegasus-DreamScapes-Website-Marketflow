import React from 'react';
import { ArrowRight, Calculator, CheckSquare, ChevronRight, FileText, Anchor, Compass, Handshake, Hammer, Building2, Key, Users } from 'lucide-react';

const COLORS = {
  navy: '#0D1B2D',
  copper: '#C77A3A',
  cream: '#F6EFE4',
  charcoal: '#1E2328',
};

const FONTS = {
  cinzel: '"Cinzel", serif',
  cormorant: '"Cormorant Garamond", serif',
  montserrat: '"Montserrat", sans-serif',
  inter: '"Inter", sans-serif',
};

const GridOverlay = () => (
  <div className="pointer-events-none absolute inset-0 z-0 flex justify-center overflow-hidden opacity-5" aria-hidden="true">
    <div className="w-full h-full max-w-[1280px] grid grid-cols-12 gap-4 px-6 md:px-12 border-x border-[#1E2328]">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-full border-x border-[#1E2328]/30" />
      ))}
    </div>
  </div>
);

const SectionHeader = ({ index, title, kicker }: { index: string; title: string; kicker: string }) => (
  <div className="flex flex-col border-b border-[#C77A3A]/30 pb-4 mb-8">
    <div className="flex justify-between items-baseline mb-2">
      <span className="text-[10px] uppercase tracking-widest" style={{ color: COLORS.copper, fontFamily: FONTS.montserrat }}>
        {kicker}
      </span>
      <span className="text-xs font-bold" style={{ color: COLORS.charcoal, fontFamily: FONTS.inter }}>
        {index}
      </span>
    </div>
    <h2 className="text-3xl md:text-4xl uppercase tracking-tight" style={{ color: COLORS.navy, fontFamily: FONTS.cinzel }}>
      {title}
    </h2>
  </div>
);

export function Blueprint() {
  return (
    <div className="min-h-screen relative w-full overflow-x-hidden" style={{ backgroundColor: COLORS.cream, color: COLORS.charcoal }}>
      <GridOverlay />

      <main className="relative z-10 w-full max-w-[1280px] mx-auto flex flex-col pt-12 pb-24 border-x border-[#1E2328]/10 shadow-2xl">
        
        {/* HERO SECTION */}
        <section className="px-6 md:px-12 pb-16 pt-16 border-b border-[#1E2328]/20">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-8 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] mb-6" style={{ color: COLORS.copper, fontFamily: FONTS.montserrat }}>
                  Document Ref: 001-A — The Deal Architect
                </p>
                <h1 className="text-5xl md:text-7xl lg:text-[80px] leading-[0.95] mb-8" style={{ color: COLORS.navy, fontFamily: FONTS.cinzel }}>
                  Complex property.<br/>
                  <span className="italic" style={{ color: COLORS.copper }}>Structured opportunity.</span>
                </h1>
                <p className="text-xl md:text-2xl max-w-2xl mb-12 leading-relaxed" style={{ fontFamily: FONTS.cormorant, color: COLORS.charcoal }}>
                  Where others see impossible, we see a path. A strategy-first real estate operating company that reviews the situation, then designs the route forward.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <a href="/submit" className="group flex items-center justify-between w-full sm:w-auto px-6 py-4 border border-[#0D1B2D] bg-[#0D1B2D] text-[#F6EFE4] hover:bg-[#1E2328] transition-colors" style={{ fontFamily: FONTS.montserrat }}>
                  <span className="text-xs uppercase tracking-widest font-semibold mr-8">Submit a Property</span>
                  <ArrowRight className="w-4 h-4 text-[#C77A3A]" />
                </a>
                <a href="#architecture" className="group flex items-center justify-between w-full sm:w-auto px-6 py-4 border border-[#1E2328]/30 hover:border-[#1E2328] text-[#1E2328] transition-colors" style={{ fontFamily: FONTS.montserrat }}>
                  <span className="text-xs uppercase tracking-widest font-semibold mr-8">See How It Works</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div className="col-span-12 md:col-span-4 border-l border-[#1E2328]/20 pl-6 hidden md:flex flex-col justify-end">
              <div className="p-4 border border-[#1E2328]/10 bg-[#F6EFE4] relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C77A3A]" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#C77A3A]" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#C77A3A]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#C77A3A]" />
                
                <h3 className="text-[10px] uppercase tracking-widest mb-2" style={{ color: COLORS.copper, fontFamily: FONTS.inter }}>Memo Summary</h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily: FONTS.inter, color: COLORS.charcoal }}>
                  We buy, build, list, and structure deals on East Bay residential property. Bring us the property. We'll help find the path. Dream it. Build it. Live it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="px-6 md:px-12 py-4 border-b border-[#1E2328]/20 bg-[#1E2328]/5 flex items-center justify-center">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-center" style={{ color: COLORS.charcoal, fontFamily: FONTS.inter }}>
            DRE #02333658 <span className="mx-2 text-[#C77A3A]">•</span> 
            Keller Williams Realty East Bay <span className="mx-2 text-[#C77A3A]">•</span> 
            CA Two-Party Consent <span className="mx-2 text-[#C77A3A]">•</span> 
            NAR NRDS #159537628
          </p>
        </section>

        {/* AUDIENCE SORT */}
        <section className="px-6 md:px-12 py-20 border-b border-[#1E2328]/20">
          <SectionHeader index="SEC.01" title="Strategic Quadrants" kicker="Audience Diagram" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1E2328]/20 border border-[#1E2328]/20">
            {/* Sellers */}
            <a href="/submit?intent=property" className="block p-8 bg-[#F6EFE4] hover:bg-[#F6EFE4]/80 transition-colors relative group">
              <div className="absolute top-4 right-4 text-[#C77A3A] opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5" />
              </div>
              <Building2 className="w-6 h-6 mb-4 text-[#1E2328]" />
              <h3 className="text-xl mb-2 uppercase tracking-wide" style={{ fontFamily: FONTS.cinzel, color: COLORS.navy }}>Sellers</h3>
              <p className="text-sm leading-relaxed max-w-sm" style={{ fontFamily: FONTS.inter, color: COLORS.charcoal }}>Complex, distressed, inherited, tired, or just complicated. Send it for a structural read.</p>
            </a>
            
            {/* Buyers */}
            <a href="/work-with-apollo" className="block p-8 bg-[#F6EFE4] hover:bg-[#F6EFE4]/80 transition-colors relative group">
              <div className="absolute top-4 right-4 text-[#C77A3A] opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5" />
              </div>
              <Key className="w-6 h-6 mb-4 text-[#1E2328]" />
              <h3 className="text-xl mb-2 uppercase tracking-wide" style={{ fontFamily: FONTS.cinzel, color: COLORS.navy }}>Buyers</h3>
              <p className="text-sm leading-relaxed max-w-sm" style={{ fontFamily: FONTS.inter, color: COLORS.charcoal }}>List or buy a home with Apollo through Keller Williams East Bay.</p>
            </a>
            
            {/* Capital Partners */}
            <a href="/capital" className="block p-8 bg-[#F6EFE4] hover:bg-[#F6EFE4]/80 transition-colors relative group">
              <div className="absolute top-4 right-4 text-[#C77A3A] opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5" />
              </div>
              <Handshake className="w-6 h-6 mb-4 text-[#1E2328]" />
              <h3 className="text-xl mb-2 uppercase tracking-wide" style={{ fontFamily: FONTS.cinzel, color: COLORS.navy }}>Capital Partners</h3>
              <p className="text-sm leading-relaxed max-w-sm" style={{ fontFamily: FONTS.inter, color: COLORS.charcoal }}>JV, co-GP, or capital conversations. Written agreement on every deal.</p>
            </a>
            
            {/* Vendors */}
            <a href="/vendor-network" className="block p-8 bg-[#F6EFE4] hover:bg-[#F6EFE4]/80 transition-colors relative group">
              <div className="absolute top-4 right-4 text-[#C77A3A] opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5" />
              </div>
              <Hammer className="w-6 h-6 mb-4 text-[#1E2328]" />
              <h3 className="text-xl mb-2 uppercase tracking-wide" style={{ fontFamily: FONTS.cinzel, color: COLORS.navy }}>Vendors</h3>
              <p className="text-sm leading-relaxed max-w-sm" style={{ fontFamily: FONTS.inter, color: COLORS.charcoal }}>GCs, subs, suppliers, and aligned operators. Join the vendor network.</p>
            </a>
          </div>
        </section>

        {/* NELSON DR PROOF */}
        <section className="px-6 md:px-12 py-20 border-b border-[#1E2328]/20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwdjQwaDQwdjQwSDB6IiBmaWxsPSJub25lIj48L3BhdGg+Cjxwb2x5Z29uIHBvaW50cz0iMCAwIDQwIDAgNDAgNDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMUUyMzI4IiBzdHJva2Utb3BhY2l0eT0iMC4wNSI+PC9wb2x5Z29uPgo8L3N2Zz4=')]">
          <SectionHeader index="SEC.02" title="Case Study: Nelson Dr" kicker="Architectural Proof" />
          
          <div className="max-w-3xl mx-auto border border-[#1E2328]/30 bg-[#F6EFE4] p-2 relative shadow-lg">
            <div className="border border-[#C77A3A]/50 p-6 sm:p-10 relative">
              <div className="absolute top-0 right-0 bg-[#C77A3A] text-[#F6EFE4] text-[10px] uppercase font-bold px-3 py-1" style={{ fontFamily: FONTS.inter }}>Executed</div>
              <h3 className="text-3xl mb-4" style={{ fontFamily: FONTS.cinzel, color: COLORS.navy }}>Nelson Dr. Project</h3>
              <p className="text-lg italic mb-6" style={{ fontFamily: FONTS.cormorant, color: COLORS.charcoal }}>
                A flagship project demonstrating the Pegasus methodology in action.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 border-y border-[#1E2328]/10 py-4">
                <div>
                  <span className="block text-[9px] uppercase text-[#C77A3A]" style={{ fontFamily: FONTS.inter }}>Type</span>
                  <span className="block text-sm font-semibold" style={{ fontFamily: FONTS.inter }}>Complete Rehab</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-[#C77A3A]" style={{ fontFamily: FONTS.inter }}>Location</span>
                  <span className="block text-sm font-semibold" style={{ fontFamily: FONTS.inter }}>East Bay, CA</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-[#C77A3A]" style={{ fontFamily: FONTS.inter }}>Strategy</span>
                  <span className="block text-sm font-semibold" style={{ fontFamily: FONTS.inter }}>Direct Acq.</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-[#C77A3A]" style={{ fontFamily: FONTS.inter }}>Timeline</span>
                  <span className="block text-sm font-semibold" style={{ fontFamily: FONTS.inter }}>12 Weeks</span>
                </div>
              </div>
              <a href="/projects/nelson-dr" className="inline-flex items-center text-xs uppercase tracking-widest font-semibold text-[#1E2328] hover:text-[#C77A3A] transition-colors" style={{ fontFamily: FONTS.montserrat }}>
                View Project Blueprint <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* STRATEGY LAB TEASER */}
        <section className="px-6 md:px-12 py-20 border-b border-[#1E2328]/20">
          <SectionHeader index="SEC.03" title="Strategy Lab" kicker="Diagnostic Tools" />
          
          <div className="flex flex-col md:flex-row items-center border border-[#1E2328]/20 bg-[#1E2328] text-[#F6EFE4] overflow-hidden">
            <div className="p-8 md:p-12 md:w-1/2">
              <Calculator className="w-8 h-8 text-[#C77A3A] mb-6" />
              <h3 className="text-2xl uppercase mb-4" style={{ fontFamily: FONTS.cinzel }}>Run the Numbers</h3>
              <p className="text-sm leading-relaxed mb-8 opacity-80" style={{ fontFamily: FONTS.inter }}>
                Access our free calculator suite. Most Strategy Snapshots are reviewed within 5 business days. Bring us the property. We'll show you the path.
              </p>
              <a href="/strategy-lab" className="inline-flex items-center px-6 py-3 border border-[#C77A3A] text-[#C77A3A] hover:bg-[#C77A3A] hover:text-[#1E2328] transition-colors text-xs uppercase tracking-widest font-semibold" style={{ fontFamily: FONTS.montserrat }}>
                Open Calculator
              </a>
            </div>
            <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-[#F6EFE4]/10 p-8 h-full bg-[#0D1B2D]">
              <pre className="text-[10px] text-[#C77A3A] opacity-70 overflow-hidden" style={{ fontFamily: 'monospace' }}>
{`> INITIALIZING DIAGNOSTIC
> LOADING PARAMETERS...
[+] LTV RATIO: CALCULATING
[+] ARV EST: PENDING
[+] REHAB COST: $ --
========================
> READY FOR INPUT`}
              </pre>
            </div>
          </div>
        </section>

        {/* WHAT WE DO - SPEC SHEET */}
        <section id="architecture" className="px-6 md:px-12 py-20 border-b border-[#1E2328]/20">
          <SectionHeader index="SEC.04" title="Service Surface Specs" kicker="Operational Functions" />
          
          <div className="border border-[#1E2328]/20 bg-white">
            <div className="grid grid-cols-12 border-b border-[#1E2328]/20 bg-[#1E2328]/5 p-4 hidden md:grid text-[10px] uppercase tracking-widest text-[#C77A3A]" style={{ fontFamily: FONTS.inter }}>
              <div className="col-span-1">No.</div>
              <div className="col-span-3">Surface</div>
              <div className="col-span-5">Function</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Link</div>
            </div>
            
            {[
              { no: "01", name: "Deal Architecture", desc: "Structuring complex transactions.", href: "/deal-architecture", status: "Live", badgeColor: "#C77A3A", badgeText: "#F6EFE4" },
              { no: "02", name: "Development", desc: "Design and execution of real estate projects.", href: "/development", status: "Live", badgeColor: "#C77A3A", badgeText: "#F6EFE4" },
              { no: "03", name: "Strategy Lab", desc: "Underwriting and preliminary read diagnostics.", href: "/strategy-lab", status: "Live", badgeColor: "#C77A3A", badgeText: "#F6EFE4" },
              { no: "04", name: "Work With Apollo", desc: "Representation through Keller Williams East Bay.", href: "/work-with-apollo", status: "Live", badgeColor: "#C77A3A", badgeText: "#F6EFE4" },
              { no: "05", name: "MarketFlow", desc: "Proprietary marketplace and deal syndication.", href: "/marketflow", status: "Private beta · invite only", badgeColor: "#0D1B2D", badgeText: "#F6EFE4" },
            ].map((row, i) => (
              <a href={row.href} key={i} className="group grid grid-cols-1 md:grid-cols-12 border-b border-[#1E2328]/10 last:border-0 p-4 items-center hover:bg-[#F6EFE4] transition-colors cursor-pointer">
                <div className="col-span-1 text-xs text-[#1E2328]/50 md:text-left mb-2 md:mb-0" style={{ fontFamily: FONTS.inter }}>{row.no}</div>
                <div className="col-span-3 text-sm font-semibold uppercase tracking-wide md:text-left mb-2 md:mb-0" style={{ fontFamily: FONTS.cinzel, color: COLORS.navy }}>{row.name}</div>
                <div className="col-span-5 text-sm md:text-left mb-3 md:mb-0" style={{ fontFamily: FONTS.inter, color: COLORS.charcoal }}>{row.desc}</div>
                <div className="col-span-2 md:text-left mb-3 md:mb-0">
                  <span className="inline-block px-2 py-1 text-[9px] uppercase tracking-widest" style={{ backgroundColor: row.badgeColor, color: row.badgeText, fontFamily: FONTS.inter }}>
                    {row.status}
                  </span>
                </div>
                <div className="col-span-1 text-right flex justify-end">
                  <ArrowRight className="w-4 h-4 text-[#1E2328]/30 group-hover:text-[#C77A3A] transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* OPERATOR & DREAMSCAPER STANDARD */}
        <section className="px-6 md:px-12 py-20 border-b border-[#1E2328]/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
            
            {/* Operator */}
            <div>
              <SectionHeader index="SEC.05A" title="The Operator" kicker="Executive Profile" />
              <p className="text-xl italic border-l-2 border-[#C77A3A] pl-6 py-2 mb-6" style={{ fontFamily: FONTS.cormorant, color: COLORS.navy }}>
                "Built on strategy. Governed by virtue. Executed with discipline."
              </p>
              <p className="text-sm leading-relaxed mb-6" style={{ fontFamily: FONTS.inter, color: COLORS.charcoal }}>
                Paolo "Apollo" Duran is the Deal Architect. 
                Focusing on the East Bay, Apollo designs solutions for complex real estate situations, ensuring that every property gets a clear path forward.
              </p>
            </div>

            {/* Standard */}
            <div>
              <SectionHeader index="SEC.05B" title="The Dreamscaper Standard" kicker="Operating Virtues" />
              <div className="space-y-4">
                {[
                  "Discipline in underwriting.",
                  "Clarity in communication.",
                  "Integrity in structure.",
                  "Excellence in execution."
                ].map((item, i) => (
                  <div key={i} className="flex items-start">
                    <CheckSquare className="w-5 h-5 text-[#C77A3A] mr-4 flex-shrink-0 mt-0.5" />
                    <span className="text-sm" style={{ fontFamily: FONTS.inter, color: COLORS.charcoal }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 md:px-12 py-24 bg-[#0D1B2D] text-[#F6EFE4]">
          <div className="max-w-2xl mx-auto text-center border-4 border-double border-[#C77A3A] p-12 relative">
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#0D1B2D] border border-[#C77A3A]" />
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#0D1B2D] border border-[#C77A3A]" />
            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#0D1B2D] border border-[#C77A3A]" />
            <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#0D1B2D] border border-[#C77A3A]" />
            
            <h2 className="text-4xl md:text-5xl uppercase mb-6" style={{ fontFamily: FONTS.cinzel }}>
              Initiate Review
            </h2>
            <p className="text-lg md:text-xl italic mb-10" style={{ fontFamily: FONTS.cormorant, color: COLORS.cream }}>
              Bring us the property. We'll help find the path.
            </p>
            
            <a href="/submit" className="inline-block bg-[#C77A3A] text-[#1E2328] px-8 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#F6EFE4] transition-colors" style={{ fontFamily: FONTS.montserrat }}>
              Submit a Property
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}
