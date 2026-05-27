import React from "react";
import { ArrowRight } from "lucide-react";

export function Monolith() {
  const brand = {
    navy: "#0D1B2D",
    copper: "#C77A3A",
    cream: "#F6EFE4",
    charcoal: "#1E2328"
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden text-[#F6EFE4] bg-[#0D1B2D]" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. HERO */}
      <section className="relative w-full min-h-[90vh] flex flex-col justify-between pt-12 pb-16 px-6 lg:px-12 border-b-8 border-[#1E2328]">
        <div className="absolute top-0 right-[-10vw] text-[400px] leading-none opacity-5 font-bold pointer-events-none" style={{ fontFamily: 'Cinzel', color: '#F6EFE4' }}>
          00
        </div>
        
        <div>
          <div className="inline-block border-b-8 pb-2 mb-12" style={{ borderColor: brand.copper }}>
            <span className="uppercase tracking-[0.3em] text-sm font-bold text-[#F6EFE4]" style={{ fontFamily: 'Montserrat' }}>
              The Deal Architect
            </span>
          </div>
        </div>

        <div className="relative z-10 w-full flex flex-col items-start justify-end">
          <h1 className="text-[14vw] lg:text-[180px] leading-[0.8] tracking-tighter uppercase font-black break-words w-full" style={{ fontFamily: 'Cinzel' }}>
            <span className="block w-[120vw] -ml-2">Complex</span>
            <span className="block w-[120vw] -ml-2">Property.</span>
            <span className="block w-[120vw] -ml-2 mt-4 text-[#1E2328] drop-shadow-[0_0_1px_rgba(246,239,228,0.5)]">Structured</span>
            <span className="block w-[120vw] -ml-2 text-[#1E2328] drop-shadow-[0_0_1px_rgba(246,239,228,0.5)]">Opportunity.</span>
          </h1>
          
          <a href="/submit" className="mt-24 group inline-flex items-center gap-6 bg-[#1E2328] hover:bg-[#F6EFE4] hover:text-[#0D1B2D] transition-none px-12 py-8 border border-transparent">
            <span className="uppercase tracking-[0.2em] text-xl font-bold" style={{ fontFamily: 'Montserrat' }}>
              Submit a Property
            </span>
            <ArrowRight size={32} />
          </a>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="w-full bg-[#1E2328] py-8 px-6 lg:px-12">
        <div className="uppercase tracking-[0.2em] text-sm font-bold text-[#F6EFE4]/60 flex flex-wrap gap-x-8 gap-y-4" style={{ fontFamily: 'Montserrat' }}>
          <span>DRE #02333658</span>
          <span>Keller Williams Realty East Bay</span>
          <span>CA Two-Party Consent</span>
          <span>NAR NRDS #159537628</span>
        </div>
      </section>

      {/* 3. AUDIENCE SORT */}
      <section className="w-full relative py-32 border-b-8 border-[#1E2328] overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[450px] leading-none opacity-5 font-bold pointer-events-none select-none" style={{ fontFamily: 'Cinzel', color: '#F6EFE4' }}>
          01
        </div>
        <div className="px-6 lg:px-12 mb-20 relative z-10">
          <div className="inline-block border-b-8 pb-2" style={{ borderColor: brand.copper }}>
            <span className="uppercase tracking-[0.3em] text-sm font-bold text-[#F6EFE4]" style={{ fontFamily: 'Montserrat' }}>
              Select Path
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col relative z-10">
          {[
            { title: "Sellers", desc: "Complex, distressed, or inherited.", href: "/submit" },
            { title: "Buyers", desc: "List or buy a home with Apollo.", href: "/work-with-apollo" },
            { title: "Capital Partners", desc: "JV, co-GP, or capital conversations.", href: "/capital" },
            { title: "Vendors", desc: "GCs, subs, and aligned operators.", href: "/vendor-network" }
          ].map((lane, i) => (
            <a key={i} href={lane.href} className="group flex items-center justify-between w-full border-t border-[#1E2328] hover:bg-[#1E2328] transition-none px-6 lg:px-12 py-16 relative">
              <div className="absolute top-0 right-0 w-8 h-8 bg-[#C77A3A] opacity-0 group-hover:opacity-100 transition-none" />
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <span className="text-8xl md:text-9xl uppercase font-black tracking-tighter" style={{ fontFamily: 'Cinzel' }}>{lane.title}</span>
                <span className="text-2xl opacity-60 font-light italic mb-4" style={{ fontFamily: 'Cormorant' }}>{lane.desc}</span>
              </div>
              <ArrowRight size={48} className="opacity-20 group-hover:opacity-100 transition-none hidden md:block" />
            </a>
          ))}
        </div>
      </section>

      {/* 4. NELSON DR PROOF */}
      <section className="w-full relative py-32 px-6 lg:px-12 border-b-8 border-[#1E2328] overflow-hidden">
        <div className="absolute -top-20 right-[-5vw] text-[500px] leading-none opacity-5 font-bold pointer-events-none select-none" style={{ fontFamily: 'Cinzel', color: '#F6EFE4' }}>
          02
        </div>
        
        <div className="inline-block border-b-8 pb-2 mb-20 relative z-10" style={{ borderColor: brand.copper }}>
          <span className="uppercase tracking-[0.3em] text-sm font-bold text-[#F6EFE4]" style={{ fontFamily: 'Montserrat' }}>
            Proof of Execution
          </span>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-[10vw] lg:text-[140px] leading-[0.85] tracking-tighter uppercase font-black break-words mb-12" style={{ fontFamily: 'Cinzel' }}>
              Nelson Dr.
            </h2>
            <p className="text-3xl lg:text-5xl leading-tight font-light italic opacity-80 max-w-2xl mb-16" style={{ fontFamily: 'Cormorant' }}>
              Every property gets a path. Not every property gets an offer. This one demanded complete reconstruction.
            </p>
            <a href="/projects/nelson-dr" className="inline-flex items-center gap-6 border-b-4 border-[#F6EFE4] pb-2 hover:text-[#C77A3A] hover:border-[#C77A3A] transition-none">
              <span className="uppercase tracking-[0.2em] text-2xl font-bold" style={{ fontFamily: 'Montserrat' }}>
                View Blueprint
              </span>
            </a>
          </div>
          <div className="aspect-[4/3] bg-[#1E2328] relative">
            <img src="/__mockup/images/monolith-nelson.png" alt="Nelson Dr" className="w-full h-full object-cover grayscale contrast-125" />
          </div>
        </div>
      </section>

      {/* 5. STRATEGY LAB TEASER */}
      <section className="w-full relative py-32 px-6 lg:px-12 border-b-8 border-[#1E2328]">
        <div className="absolute bottom-0 right-0 text-[400px] leading-none opacity-5 font-bold pointer-events-none select-none translate-y-1/4" style={{ fontFamily: 'Cinzel', color: '#F6EFE4' }}>
          03
        </div>

        <div className="inline-block border-b-8 pb-2 mb-20 relative z-10" style={{ borderColor: brand.copper }}>
          <span className="uppercase tracking-[0.3em] text-sm font-bold text-[#F6EFE4]" style={{ fontFamily: 'Montserrat' }}>
            Diagnostic
          </span>
        </div>

        <div className="relative z-10 max-w-5xl">
          <h2 className="text-[8vw] lg:text-[120px] leading-[0.85] tracking-tighter uppercase font-black break-words mb-12" style={{ fontFamily: 'Cinzel' }}>
            Strategy Lab
          </h2>
          <p className="text-4xl lg:text-6xl leading-none font-light italic opacity-80 mb-16" style={{ fontFamily: 'Cormorant' }}>
            Most Strategy Snapshots are reviewed within 5 business days.
          </p>
          <a href="/strategy-lab" className="inline-flex items-center gap-6 bg-[#F6EFE4] text-[#0D1B2D] px-12 py-8 hover:bg-[#C77A3A] hover:text-[#F6EFE4] transition-none">
            <span className="uppercase tracking-[0.2em] text-xl font-bold" style={{ fontFamily: 'Montserrat' }}>
              Run the Numbers
            </span>
          </a>
        </div>
      </section>

      {/* 6. WHAT WE DO */}
      <section className="w-full relative py-32 border-b-8 border-[#1E2328] overflow-hidden">
        <div className="absolute top-0 right-[10vw] text-[600px] leading-none opacity-5 font-bold pointer-events-none select-none -translate-y-20" style={{ fontFamily: 'Cinzel', color: '#F6EFE4' }}>
          04
        </div>

        <div className="px-6 lg:px-12 mb-20 relative z-10">
          <div className="inline-block border-b-8 pb-2" style={{ borderColor: brand.copper }}>
            <span className="uppercase tracking-[0.3em] text-sm font-bold text-[#F6EFE4]" style={{ fontFamily: 'Montserrat' }}>
              Index
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col relative z-10">
          {[
            { num: "I", title: "Deal Architecture", desc: "Complex transaction structuring.", href: "/deal-architecture" },
            { num: "II", title: "Development", desc: "Design and execution of real estate projects.", href: "/development" },
            { num: "III", title: "Strategy Lab", desc: "Underwriting and diagnostics.", href: "/strategy-lab" },
            { num: "IV", title: "Work With Apollo", desc: "Direct representation.", href: "/work-with-apollo" },
            { num: "V", title: "MarketFlow", desc: "Proprietary marketplace engine.", href: "/marketflow", badge: "Private beta · invite only" }
          ].map((item, i) => (
            <a key={i} href={item.href} className="group flex flex-col md:flex-row md:items-center border-t border-[#1E2328] hover:bg-[#1E2328] transition-none px-6 lg:px-12 py-12 relative">
              <span className="text-4xl font-black text-[#1E2328] w-24 mb-4 md:mb-0" style={{ fontFamily: 'Cinzel' }}>{item.num}</span>
              <div className="flex-1 flex flex-col md:flex-row md:items-baseline gap-6">
                <span className="text-6xl md:text-8xl uppercase font-black tracking-tighter" style={{ fontFamily: 'Cinzel' }}>{item.title}</span>
                <span className="text-2xl opacity-60 font-light italic" style={{ fontFamily: 'Cormorant' }}>{item.desc}</span>
                {item.badge && (
                  <span className="px-4 py-2 border-2 border-[#1E2328] text-xs uppercase tracking-widest font-bold ml-0 md:ml-auto" style={{ fontFamily: 'Montserrat' }}>
                    {item.badge}
                  </span>
                )}
              </div>
              <ArrowRight size={48} className="text-[#1E2328] group-hover:text-[#C77A3A] transition-none hidden md:block ml-8" />
            </a>
          ))}
        </div>
      </section>

      {/* 7. OPERATOR BIO & 8. MANIFESTO */}
      <section className="w-full relative py-32 px-6 lg:px-12 border-b-8 border-[#1E2328]">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[500px] leading-none opacity-5 font-bold pointer-events-none select-none" style={{ fontFamily: 'Cinzel', color: '#F6EFE4' }}>
          05
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
          <div className="lg:col-span-4 flex flex-col items-start">
            <div className="inline-block border-b-8 pb-2 mb-12" style={{ borderColor: brand.copper }}>
              <span className="uppercase tracking-[0.3em] text-sm font-bold text-[#F6EFE4]" style={{ fontFamily: 'Montserrat' }}>
                The Operator
              </span>
            </div>
            <div className="w-48 h-64 bg-[#1E2328] mb-8">
              <img src="/__mockup/images/monolith-apollo.png" alt="Apollo Duran" className="w-full h-full object-cover grayscale contrast-150 brightness-75" />
            </div>
            <p className="text-3xl font-light italic leading-tight max-w-sm" style={{ fontFamily: 'Cormorant' }}>
              Built on strategy. Governed by virtue. Executed with discipline.
            </p>
          </div>
          
          <div className="lg:col-span-8 flex flex-col justify-center">
            <h2 className="text-[12vw] lg:text-[160px] leading-[0.8] tracking-tighter uppercase font-black break-words mb-12" style={{ fontFamily: 'Cinzel' }}>
              Apollo<br />Duran
            </h2>
            <div className="uppercase tracking-[0.3em] text-2xl font-bold opacity-60 mb-24" style={{ fontFamily: 'Montserrat' }}>
              Founder & Principal
            </div>

            <div className="mt-12">
              <div className="inline-block border-b-8 pb-2 mb-12" style={{ borderColor: brand.copper }}>
                <span className="uppercase tracking-[0.3em] text-sm font-bold text-[#F6EFE4]" style={{ fontFamily: 'Montserrat' }}>
                  Manifesto
                </span>
              </div>
              <h3 className="text-6xl md:text-8xl uppercase font-black tracking-tighter mb-8" style={{ fontFamily: 'Cinzel' }}>
                The Dreamscaper<br/>Standard.
              </h3>
              <p className="text-3xl font-bold uppercase tracking-[0.2em] opacity-40" style={{ fontFamily: 'Montserrat' }}>
                Dream it. Build it. Live it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="w-full bg-[#1E2328] text-[#F6EFE4] relative">
        <a href="/submit" className="block w-full py-40 px-6 lg:px-12 hover:bg-[#C77A3A] transition-none group text-center cursor-pointer">
          <h2 className="text-5xl md:text-7xl font-light italic opacity-80 mb-16" style={{ fontFamily: 'Cormorant' }}>
            Bring us the property.<br/>We'll help find the path.
          </h2>
          <div className="text-[8vw] lg:text-[80px] uppercase font-black tracking-tighter group-hover:text-[#1E2328] transition-none" style={{ fontFamily: 'Cinzel' }}>
            Submit a Property
          </div>
        </a>
      </section>

    </div>
  );
}
