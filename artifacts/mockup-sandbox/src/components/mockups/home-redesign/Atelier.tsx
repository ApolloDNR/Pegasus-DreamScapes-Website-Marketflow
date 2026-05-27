import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

const COLORS = {
  navy: '#0D1B2D',
  copper: '#C77A3A',
  cream: '#F6EFE4',
  charcoal: '#1E2328',
  wine: '#6A2A2A', // hint of deep wine/burgundy via copper's warmer tones
};

const FONTS = {
  cinzel: '"Cinzel", serif',
  cormorant: '"Cormorant Garamond", "Cormorant", serif',
  montserrat: '"Montserrat", sans-serif',
  inter: '"Inter", sans-serif',
};

const PlateNumber = ({ num, title }: { num: string; title: string }) => (
  <div className="flex items-center gap-4 mb-16">
    <div className="flex flex-col items-center justify-center border border-[#C77A3A]/40 p-2 w-10 h-10 bg-[#F6EFE4] shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] shrink-0">
      <span style={{ fontFamily: FONTS.cinzel, color: COLORS.copper }} className="text-[10px] leading-none">NO.</span>
      <span style={{ fontFamily: FONTS.cinzel, color: COLORS.navy }} className="text-sm leading-none mt-1">{num}</span>
    </div>
    <div className="flex-1 flex items-center">
      <span style={{ fontFamily: FONTS.cinzel, color: COLORS.charcoal }} className="text-[11px] uppercase tracking-[0.25em] font-semibold whitespace-nowrap mr-4">
        {title}
      </span>
      <div className="flex-1 border-b border-dotted border-[#C77A3A]/60" />
    </div>
  </div>
);

export function Atelier() {
  return (
    <div 
      className="min-h-screen relative w-full overflow-x-hidden selection:bg-[#C77A3A] selection:text-[#F6EFE4]" 
      style={{ 
        backgroundColor: COLORS.cream, 
        color: COLORS.charcoal,
        backgroundImage: 'radial-gradient(#1E2328 0.5px, transparent 0.5px)',
        backgroundSize: '32px 32px',
        backgroundPosition: '0 0',
      }}
    >
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[#F6EFE4]/95 pointer-events-none mix-blend-overlay" style={{ boxShadow: 'inset 0 0 100px rgba(0,0,0,0.05)' }} />

      <main className="relative z-10 w-full max-w-[1000px] mx-auto flex flex-col pt-12 pb-24 px-8 md:px-20 shadow-[0_0_50px_rgba(0,0,0,0.08)] bg-[#F6EFE4] border-x border-[#1E2328]/10 min-h-screen">
        
        {/* FRAME BORDER */}
        <div className="absolute inset-4 border border-[#1E2328]/10 pointer-events-none" />
        <div className="absolute inset-6 border border-[#C77A3A]/20 pointer-events-none" />

        {/* HEADER */}
        <header className="flex justify-between items-end py-8 border-b border-[#1E2328]/20 mb-24 relative z-20">
          <div style={{ fontFamily: FONTS.cinzel, color: COLORS.navy }} className="text-xl tracking-[0.25em] uppercase">
            Pegasus DreamScapes
          </div>
          <div style={{ fontFamily: FONTS.montserrat, color: COLORS.copper }} className="text-[9px] uppercase tracking-[0.3em] font-semibold pb-1">
            The Deal Architect
          </div>
        </header>

        {/* 1. HERO */}
        <section className="pb-32 relative z-20 text-center flex flex-col items-center">
          <h1 className="mb-12 flex flex-col items-center gap-2">
            <span style={{ fontFamily: FONTS.cormorant, color: COLORS.navy }} className="text-6xl md:text-[90px] italic font-light leading-none">
              Complex property.
            </span>
            <span style={{ fontFamily: FONTS.cormorant, color: COLORS.charcoal }} className="text-3xl md:text-5xl font-light tracking-wide lowercase">
              structured opportunity.
            </span>
          </h1>
          
          <div className="w-px h-16 bg-[#C77A3A]/40 mb-12" />

          <p style={{ fontFamily: FONTS.cormorant, color: COLORS.charcoal }} className="text-2xl md:text-3xl max-w-2xl mx-auto mb-16 leading-relaxed italic">
            "Where others see impossible, we see a path. A strategy-first real estate operating company that reviews the situation, then designs the route forward."
          </p>

          <a 
            href="/submit" 
            className="group flex items-center justify-center gap-4 px-10 py-4 border border-[#0D1B2D] hover:bg-[#0D1B2D] hover:text-[#F6EFE4] transition-colors bg-transparent text-[#0D1B2D]"
          >
            <span style={{ fontFamily: FONTS.montserrat }} className="text-[10px] uppercase tracking-[0.25em] font-semibold">Submit a Property</span>
            <ArrowRight className="w-4 h-4 text-[#C77A3A] group-hover:translate-x-1 transition-transform" />
          </a>
        </section>

        {/* 2. TRUST STRIP */}
        <section className="py-8 border-y border-[#1E2328]/10 mb-32 relative z-20 flex justify-center text-center">
          <p style={{ fontFamily: FONTS.montserrat, color: COLORS.charcoal }} className="text-[9px] uppercase tracking-[0.3em] font-semibold flex flex-wrap justify-center gap-x-6 gap-y-3 opacity-70">
            <span>DRE #02333658</span>
            <span className="text-[#C77A3A]/50">|</span>
            <span>Keller Williams Realty East Bay</span>
            <span className="text-[#C77A3A]/50 hidden md:inline">|</span>
            <span>CA Two-Party Consent</span>
            <span className="text-[#C77A3A]/50">|</span>
            <span>NAR NRDS #159537628</span>
          </p>
        </section>

        {/* 3. AUDIENCE SORT */}
        <section className="pb-32 relative z-20">
          <PlateNumber num="I" title="PARTIES OF INTEREST" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Sellers", desc: "Complex, distressed, inherited, or complicated. Send it for a structural read.", href: "/submit" },
              { title: "Buyers", desc: "List or buy a home with Apollo through Keller Williams East Bay.", href: "/work-with-apollo" },
              { title: "Capital Partners", desc: "JV, co-GP, or capital conversations. Written agreement on every deal.", href: "/capital" },
              { title: "Vendors", desc: "GCs, subs, suppliers, and aligned operators. Join the vendor network.", href: "/vendor-network" }
            ].map((item, i) => (
              <a key={i} href={item.href} className="group relative aspect-[3/4] flex flex-col justify-between p-6 border border-[#1E2328]/10 bg-[#F6EFE4] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all">
                {/* Ornamental Corners */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#C77A3A]/40" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#C77A3A]/40" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#C77A3A]/40" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#C77A3A]/40" />
                
                <div>
                  <div style={{ fontFamily: FONTS.cormorant, color: COLORS.navy }} className="text-3xl mb-4 italic group-hover:text-[#C77A3A] transition-colors">{item.title}</div>
                  <p style={{ fontFamily: FONTS.cormorant, color: COLORS.charcoal }} className="text-[17px] leading-snug opacity-90">{item.desc}</p>
                </div>
                
                <div className="flex justify-end">
                  <ArrowRight className="w-5 h-5 text-[#C77A3A] group-hover:translate-x-1 transition-transform opacity-70 group-hover:opacity-100" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* 4. NELSON DR PROOF */}
        <section className="pb-32 relative z-20">
          <PlateNumber num="II" title="FEATURED PROPERTY" />
          
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/2 p-4 bg-white border border-[#1E2328]/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative">
              {/* Inner matte */}
              <div className="border border-[#1E2328]/5 p-1 bg-[#F6EFE4]">
                <img src="/__mockup/images/atelier-nelson.png" alt="Nelson Dr Project" className="w-full aspect-[4/3] object-cover" />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-[#F6EFE4] border border-[#1E2328]/20 px-6 py-3 shadow-md text-center">
                <span style={{ fontFamily: FONTS.cinzel, color: COLORS.navy }} className="block text-sm tracking-widest">LOT 42</span>
              </div>
            </div>
            
            <div className="w-full md:w-1/2">
              <h3 style={{ fontFamily: FONTS.cormorant, color: COLORS.navy }} className="text-5xl italic mb-6 leading-none">Nelson Dr.</h3>
              <p style={{ fontFamily: FONTS.cormorant, color: COLORS.charcoal }} className="text-2xl leading-relaxed mb-10">
                A flagship project demonstrating the execution of discipline. Every property gets a path. This one became a masterpiece.
              </p>
              <a href="/projects/nelson-dr" className="inline-flex items-center gap-3 border-b border-[#C77A3A]/50 pb-1 hover:border-[#C77A3A] transition-colors group">
                <span style={{ fontFamily: FONTS.montserrat, color: COLORS.navy }} className="text-[10px] uppercase tracking-[0.2em] font-semibold">Examine Lot</span>
                <ChevronRight className="w-3 h-3 text-[#C77A3A] group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

        {/* 5. STRATEGY LAB TEASER */}
        <section className="pb-32 relative z-20">
          <PlateNumber num="III" title="APPRAISAL & DIAGNOSTIC" />
          
          <div className="text-center max-w-3xl mx-auto border border-[#1E2328]/10 p-16 bg-white relative shadow-[inset_0_0_40px_rgba(0,0,0,0.02)]">
            <h3 style={{ fontFamily: FONTS.cinzel, color: COLORS.navy }} className="text-3xl uppercase tracking-widest mb-6">Strategy Lab</h3>
            <div className="w-12 h-px bg-[#C77A3A]/40 mx-auto mb-8" />
            <p style={{ fontFamily: FONTS.cormorant, color: COLORS.charcoal }} className="text-2xl italic leading-relaxed mb-8">
              "Most Strategy Snapshots are reviewed within 5 business days."
            </p>
            <p style={{ fontFamily: FONTS.montserrat, color: COLORS.charcoal }} className="text-[10px] leading-relaxed mb-12 opacity-60 uppercase tracking-[0.3em]">
              Bring us the situation, we'll design the route forward.
            </p>
            <a href="/strategy-lab" className="inline-flex items-center gap-3 px-10 py-4 border border-[#C77A3A] text-[#C77A3A] hover:bg-[#C77A3A] hover:text-[#F6EFE4] transition-colors">
              <span style={{ fontFamily: FONTS.montserrat }} className="text-[10px] uppercase tracking-[0.2em] font-semibold">Request Appraisal</span>
            </a>
          </div>
        </section>

        {/* 6. WHAT WE DO */}
        <section className="pb-32 relative z-20">
          <PlateNumber num="IV" title="CATALOG OF SERVICES" />
          
          <div className="space-y-0 border-y border-[#1E2328]/10">
            {[
              { num: "01", title: "Deal Architecture", desc: "Structuring complex transactions.", href: "/deal-architecture" },
              { num: "02", title: "Development", desc: "Design and execution of real estate projects.", href: "/development" },
              { num: "03", title: "Strategy Lab", desc: "Underwriting and preliminary read diagnostics.", href: "/strategy-lab" },
              { num: "04", title: "Work With Apollo", desc: "Representation through Keller Williams East Bay.", href: "/work-with-apollo" },
              { num: "05", title: "MarketFlow", desc: "Proprietary marketplace and deal syndication.", href: "/marketflow", badge: "Private beta · invite only" },
            ].map((item, i) => (
              <a key={i} href={item.href} className="group flex items-center justify-between py-8 border-b border-[#1E2328]/10 last:border-b-0 hover:bg-black/[0.02] px-6 transition-colors -mx-6">
                <div className="flex items-center gap-10 w-full md:w-auto">
                  <span style={{ fontFamily: FONTS.cinzel, color: COLORS.copper }} className="text-xl w-8">{item.num}.</span>
                  <div>
                    <h4 style={{ fontFamily: FONTS.cormorant, color: COLORS.navy }} className="text-3xl italic flex items-center gap-4">
                      {item.title}
                      {item.badge && (
                        <span style={{ fontFamily: FONTS.montserrat, backgroundColor: COLORS.navy, color: COLORS.cream }} className="text-[8px] uppercase tracking-[0.2em] px-2 py-1 rounded-[1px] font-sans not-italic ml-2">
                          {item.badge}
                        </span>
                      )}
                    </h4>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-8">
                  <span style={{ fontFamily: FONTS.cormorant, color: COLORS.charcoal }} className="text-[19px] opacity-80">{item.desc}</span>
                  <div className="flex items-center gap-2 border-b border-transparent group-hover:border-[#C77A3A] transition-colors pb-0.5">
                    <span style={{ fontFamily: FONTS.montserrat, color: COLORS.navy }} className="text-[9px] uppercase tracking-[0.2em] font-semibold group-hover:text-[#C77A3A]">View Lot</span>
                    <ArrowRight className="w-3 h-3 text-[#C77A3A]" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* 7. OPERATOR BIO & 8. STANDARD */}
        <section className="pb-32 relative z-20">
          <PlateNumber num="V" title="THE CONNOISSEUR'S NOTE" />
          
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/3 flex flex-col items-center text-center">
              <div className="w-48 h-48 rounded-full overflow-hidden border-[6px] border-[#F6EFE4] shadow-[0_0_0_1px_rgba(199,122,58,0.3)] mb-8 bg-white p-2">
                <img src="/__mockup/images/atelier-apollo.png" alt="Apollo Duran" className="w-full h-full object-cover rounded-full mix-blend-multiply" />
              </div>
              <h3 style={{ fontFamily: FONTS.cormorant, color: COLORS.navy }} className="text-5xl italic mb-3 leading-none">Apollo</h3>
              <p style={{ fontFamily: FONTS.montserrat, color: COLORS.charcoal }} className="text-[9px] uppercase tracking-[0.3em] opacity-60 font-semibold mb-6">
                FOUNDER & PRINCIPAL
              </p>
            </div>
            
            <div className="md:w-2/3 border-l border-[#C77A3A]/30 pl-8 md:pl-16 flex flex-col justify-center">
              <p style={{ fontFamily: FONTS.cormorant, color: COLORS.navy }} className="text-3xl leading-relaxed mb-10 italic">
                "Built on strategy.<br/>Governed by virtue.<br/>Executed with discipline."
              </p>
              
              <div className="mt-4 pt-10 border-t border-[#1E2328]/10">
                <h4 style={{ fontFamily: FONTS.cinzel, color: COLORS.navy }} className="text-xl tracking-widest uppercase mb-4">The Dreamscaper Standard.</h4>
                <p style={{ fontFamily: FONTS.montserrat, color: COLORS.charcoal }} className="text-[10px] leading-relaxed opacity-60 uppercase tracking-[0.3em] mb-6">
                  Dream it. Build it. Live it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. FINAL CTA */}
        <section className="relative z-20 text-center pb-12">
          <div className="border border-[#1E2328]/10 p-2 bg-white shadow-[inset_0_2px_15px_rgba(0,0,0,0.03)] mx-auto max-w-4xl">
            <div className="border border-[#C77A3A]/40 px-8 py-20 flex flex-col items-center bg-[#F6EFE4] shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)]">
              <h2 style={{ fontFamily: FONTS.cinzel, color: COLORS.copper }} className="text-3xl md:text-5xl uppercase tracking-widest mb-10 leading-tight">
                Bring us the property.<br />We'll help find the path.
              </h2>
              
              <a 
                href="/submit" 
                className="inline-flex items-center justify-center gap-4 px-12 py-5 bg-[#0D1B2D] text-[#F6EFE4] hover:bg-[#C77A3A] transition-colors shadow-[0_4px_15px_rgba(13,27,45,0.3)]"
              >
                <span style={{ fontFamily: FONTS.montserrat }} className="text-[10px] uppercase tracking-[0.25em] font-semibold">Submit a Property</span>
                <ArrowRight className="w-4 h-4 text-[#F6EFE4]" />
              </a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
