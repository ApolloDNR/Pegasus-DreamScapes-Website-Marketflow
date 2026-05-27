import React from "react";
import { ArrowRight, Calculator, CheckCircle2, ChevronRight, Handshake, Map, Shield, Hammer, Key, Home, HardHat } from "lucide-react";

export function Cinematic() {
  const brand = {
    navy: "#0D1B2D",
    copper: "#C77A3A",
    cream: "#F6EFE4",
    charcoal: "#1E2328"
  };

  return (
    <div className="w-full min-h-screen text-[#F6EFE4] bg-[#0D1B2D] selection:bg-[#C77A3A] selection:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. HERO */}
      <section className="relative w-full h-[95vh] flex items-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/__mockup/images/cinematic-hero.png" 
            alt="Hero Architectural" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2D] via-transparent to-[#0D1B2D]/50" />
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col justify-end h-full">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-[1px] w-12 bg-[#C77A3A]" />
            <span className="uppercase tracking-[0.25em] text-xs font-semibold text-[#C77A3A]" style={{ fontFamily: 'Montserrat' }}>
              The Deal Architect
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl mb-4 tracking-tight leading-[0.95]" style={{ fontFamily: 'Cinzel' }}>
            Complex <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#C77A3A] to-[#E6A86A]">property.</span><br />
            Structured <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#C77A3A] to-[#E6A86A]">opportunity.</span>
          </h1>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <a href="/submit" className="group relative px-8 py-4 bg-[#C77A3A] text-white uppercase tracking-widest text-xs font-bold overflow-hidden" style={{ fontFamily: 'Montserrat' }}>
              <span className="relative z-10 flex items-center gap-3">Submit a Property <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
            </a>
            <a href="#how-it-works" className="group flex items-center gap-3 uppercase tracking-widest text-xs font-bold text-[#F6EFE4]/70 hover:text-[#C77A3A] transition-colors" style={{ fontFamily: 'Montserrat' }}>
              See How It Works <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="w-full border-y border-[#F6EFE4]/10 bg-[#0D1B2D] py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-wrap justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-[#F6EFE4]/50" style={{ fontFamily: 'Montserrat' }}>
          <span>DRE #02333658</span>
          <span className="hidden md:inline text-[#C77A3A]">•</span>
          <span>Keller Williams Realty East Bay</span>
          <span className="hidden md:inline text-[#C77A3A]">•</span>
          <span>CA Two-Party Consent</span>
          <span className="hidden md:inline text-[#C77A3A]">•</span>
          <span>NAR NRDS #159537628</span>
        </div>
      </section>

      {/* 3. AUDIENCE SORT */}
      <section className="w-full py-32 bg-[#0D1B2D] relative" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row gap-12 items-end justify-between mb-20">
            <div>
              <div className="text-[#C77A3A] text-sm tracking-[0.2em] mb-4" style={{ fontFamily: 'Montserrat' }}>01 / 09</div>
              <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Cinzel' }}>What brings you here?</h2>
            </div>
            <p className="max-w-md text-lg text-[#F6EFE4]/70" style={{ fontFamily: 'Cormorant' }}>
              Four specialized lanes. One unified standard of architecture. Choose the path that matches your current standing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Sellers", icon: Home, desc: "Complex or standard property transitions.", href: "/submit" },
              { title: "Buyers", icon: Key, desc: "Strategic acquisition and deal structuring.", href: "/work-with-apollo" },
              { title: "Capital Partners", icon: Handshake, desc: "Yield and equity deployment vehicles.", href: "/capital" },
              { title: "Vendors", icon: Hammer, desc: "The ecosystem of execution.", href: "/vendor-network" }
            ].map((lane, i) => (
              <a key={i} href={lane.href} className="group block bg-[#1E2328] p-8 border border-transparent hover:border-[#C77A3A]/50 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 text-[#F6EFE4] group-hover:text-[#C77A3A] transition-colors">
                  <lane.icon size={80} strokeWidth={1} />
                </div>
                <lane.icon size={24} className="text-[#C77A3A] mb-8" />
                <h3 className="text-2xl mb-4" style={{ fontFamily: 'Cinzel' }}>{lane.title}</h3>
                <p className="text-[#F6EFE4]/60 text-sm mb-12" style={{ fontFamily: 'Inter' }}>{lane.desc}</p>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C77A3A] font-bold" style={{ fontFamily: 'Montserrat' }}>
                  Explore <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 4. NELSON DR PROOF */}
      <section className="w-full h-[80vh] relative flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/__mockup/images/cinematic-nelson.png" alt="Nelson Dr Project" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-[#0D1B2D]/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2D] via-[#0D1B2D]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-2xl">
            <div className="text-[#C77A3A] text-sm tracking-[0.2em] mb-4" style={{ fontFamily: 'Montserrat' }}>02 / 09</div>
            <h2 className="text-5xl md:text-7xl mb-6" style={{ fontFamily: 'Cinzel' }}>Nelson Dr.</h2>
            <p className="text-2xl text-[#F6EFE4]/90 mb-10 italic" style={{ fontFamily: 'Cormorant' }}>
              A flagship testament to our structural approach.
            </p>
            <a href="/projects/nelson-dr" className="inline-flex items-center gap-3 border border-[#C77A3A] text-[#F6EFE4] px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-[#C77A3A] transition-colors" style={{ fontFamily: 'Montserrat' }}>
              View the Project <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* 5. STRATEGY LAB TEASER */}
      <section className="w-full py-32 bg-[#F6EFE4] text-[#0D1B2D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="text-[#C77A3A] text-sm tracking-[0.2em] mb-4" style={{ fontFamily: 'Montserrat' }}>03 / 09</div>
              <h2 className="text-4xl md:text-6xl mb-8" style={{ fontFamily: 'Cinzel' }}>Strategy Lab</h2>
              <p className="text-xl mb-8 italic" style={{ fontFamily: 'Cormorant' }}>
                Run the numbers before you bring the property.
              </p>
              <p className="text-[#0D1B2D]/70 mb-10 leading-relaxed">
                Access our proprietary calculation engines. Most Strategy Snapshots are reviewed within 5 business days, giving you the clarity needed to make structural decisions.
              </p>
              <a href="/strategy-lab" className="inline-flex items-center gap-3 bg-[#0D1B2D] text-[#F6EFE4] px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-[#C77A3A] transition-colors" style={{ fontFamily: 'Montserrat' }}>
                Open Calculator <Calculator size={14} className="ml-2" />
              </a>
            </div>
            <div className="lg:w-1/2 relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 border border-[#0D1B2D]/10 translate-x-4 translate-y-4" />
              <div className="absolute inset-0 bg-[#0D1B2D] text-[#F6EFE4] p-10 flex flex-col justify-between shadow-2xl">
                <div>
                  <div className="flex justify-between items-center mb-12">
                    <span className="uppercase tracking-widest text-[10px] text-[#C77A3A]" style={{ fontFamily: 'Montserrat' }}>Terminal Value</span>
                    <Shield size={20} className="text-[#C77A3A]" />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[#F6EFE4]/50 mb-1" style={{ fontFamily: 'Montserrat' }}>Estimated ARV</div>
                      <div className="text-3xl font-light" style={{ fontFamily: 'Cinzel' }}>$1,450,000</div>
                    </div>
                    <div className="h-[1px] w-full bg-[#F6EFE4]/10" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[#F6EFE4]/50 mb-1" style={{ fontFamily: 'Montserrat' }}>Target Yield</div>
                      <div className="text-3xl font-light" style={{ fontFamily: 'Cinzel' }}>18.4%</div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-[#F6EFE4]/40 uppercase tracking-widest" style={{ fontFamily: 'Montserrat' }}>* Simulated Projection</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHAT WE DO (5 Bands) */}
      <section className="w-full bg-[#0D1B2D]">
        {[
          { title: "Deal Architecture", tag: "Structuring the path.", href: "/deal-architecture", num: "04" },
          { title: "Development", tag: "Execution with discipline.", href: "/development", num: "05" },
          { title: "Strategy Lab", tag: "Precision underwriting.", href: "/strategy-lab", num: "06" },
          { title: "Work With Apollo", tag: "Direct representation.", href: "/work-with-apollo", num: "07" },
          { title: "MarketFlow", tag: "Ecosystem engine.", href: "/marketflow", num: "08", badge: "Private beta · invite only" }
        ].map((item, i) => (
          <div key={i} className="group border-b border-[#F6EFE4]/10 first:border-t hover:bg-[#1E2328] transition-colors duration-500">
            <a href={item.href} className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex gap-8 items-start">
                <span className="text-[#C77A3A] text-lg font-light pt-2" style={{ fontFamily: 'Cinzel' }}>{item.num}</span>
                <div>
                  <h3 className="text-4xl md:text-6xl mb-4 transition-transform duration-500 group-hover:translate-x-4" style={{ fontFamily: 'Cinzel' }}>{item.title}</h3>
                  <div className="flex items-center gap-4 transition-transform duration-500 delay-75 group-hover:translate-x-4">
                    <span className="text-xl text-[#F6EFE4]/70 italic" style={{ fontFamily: 'Cormorant' }}>{item.tag}</span>
                    {item.badge && (
                      <span className="px-3 py-1 bg-[#1E2328] border border-[#C77A3A]/30 text-[#C77A3A] text-[9px] uppercase tracking-widest font-bold" style={{ fontFamily: 'Montserrat' }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center w-16 h-16 rounded-full border border-[#F6EFE4]/20 group-hover:border-[#C77A3A] group-hover:bg-[#C77A3A] transition-all duration-500">
                <ArrowRight size={20} className="text-[#F6EFE4]" />
              </div>
            </a>
          </div>
        ))}
      </section>

      {/* 7. OPERATOR BIO */}
      <section className="w-full py-32 bg-[#1E2328] border-y border-[#F6EFE4]/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-[#C77A3A] text-sm tracking-[0.2em] mb-16" style={{ fontFamily: 'Montserrat' }}>08 / 09</div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 relative">
              <div className="aspect-[3/4] relative z-10">
                <img src="/__mockup/images/cinematic-apollo.png" alt="Apollo Duran" className="w-full h-full object-cover grayscale contrast-125 brightness-90 hover:grayscale-0 transition-all duration-1000" />
                <div className="absolute inset-0 ring-1 ring-inset ring-[#C77A3A]/20" />
              </div>
              <div className="absolute -inset-4 bg-[#0D1B2D] z-0 -rotate-3" />
            </div>
            <div className="lg:col-span-7">
              <h2 className="text-4xl md:text-5xl mb-12 leading-tight" style={{ fontFamily: 'Cinzel' }}>
                "Built on strategy.<br />
                <span className="italic text-[#C77A3A]">Governed by virtue.</span><br />
                Executed with discipline."
              </h2>
              <div className="space-y-6 text-[#F6EFE4]/70 leading-relaxed max-w-lg mb-12">
                <p>Apollo Duran oversees the structural architecture of every deal passing through Pegasus DreamScapes.</p>
                <p>An obsession with the downside. A reverence for the upside. Deal architecture is not just about making numbers work—it is about ensuring the vehicle is resilient enough to reach the destination.</p>
              </div>
              <div className="flex flex-col gap-2 uppercase tracking-widest text-xs font-bold text-[#F6EFE4]/50" style={{ fontFamily: 'Montserrat' }}>
                <span className="text-[#F6EFE4]">Paolo "Apollo" Duran</span>
                <span>Founder & Principal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MANIFESTO (Dreamscaper Standard) */}
      <section className="w-full py-32 bg-[#0D1B2D] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(199,122,58,0.05)_0%,transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-8 border border-[#C77A3A]/30 rotate-45">
            <div className="w-2 h-2 bg-[#C77A3A]" />
          </div>
          <h2 className="text-3xl uppercase tracking-[0.2em] mb-12 text-[#C77A3A]" style={{ fontFamily: 'Montserrat' }}>The Dreamscaper Standard.</h2>
          <p className="text-2xl md:text-4xl leading-snug italic text-[#F6EFE4]/90" style={{ fontFamily: 'Cormorant' }}>
            "We do not bend reality to fit a pre-determined model. We observe the terrain, acknowledge the friction, and engineer a structure capable of moving through it."
          </p>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="w-full py-32 bg-[#F6EFE4] text-[#0D1B2D] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0D1B2D]/5 -skew-x-12 translate-x-32" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="max-w-2xl">
              <div className="text-[#C77A3A] text-sm tracking-[0.2em] mb-4" style={{ fontFamily: 'Montserrat' }}>09 / 09</div>
              <h2 className="text-5xl md:text-7xl mb-6" style={{ fontFamily: 'Cinzel' }}>
                Bring us the property.<br />
                <span className="italic">We'll help find the path.</span>
              </h2>
              <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-[#0D1B2D]/60" style={{ fontFamily: 'Montserrat' }}>
                <span>Dream it.</span>
                <span className="w-1 h-1 bg-[#C77A3A]" />
                <span>Build it.</span>
                <span className="w-1 h-1 bg-[#C77A3A]" />
                <span>Live it.</span>
              </div>
            </div>
            
            <a href="/submit" className="shrink-0 flex items-center justify-center w-48 h-48 rounded-full bg-[#0D1B2D] text-[#F6EFE4] hover:bg-[#C77A3A] hover:scale-105 transition-all duration-500 group shadow-2xl">
              <div className="text-center">
                <span className="block uppercase tracking-widest text-[10px] font-bold mb-2" style={{ fontFamily: 'Montserrat' }}>Submit a</span>
                <span className="block font-serif text-xl" style={{ fontFamily: 'Cinzel' }}>Property</span>
                <ArrowRight size={16} className="mx-auto mt-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
