import React from "react";
import { ArrowRight, Calculator, CheckCircle2, ChevronRight, Handshake, Map, Shield, Hammer, Key, Home, HardHat } from "lucide-react";

const brand = {
  navy: "#0D1B2D",
  copper: "#C77A3A",
  cream: "#F6EFE4",
  charcoal: "#1E2328"
};

const SectionNumeral = ({ current, total }: { current: string, total: string }) => (
  <div className="absolute left-6 md:left-12 top-24 origin-top-left -rotate-90 flex items-center gap-4 text-[#F6EFE4]/50">
    <div className="h-[1px] w-12 bg-[#C77A3A]" />
    <span className="uppercase tracking-[0.3em] text-[10px] font-bold" style={{ fontFamily: 'Montserrat' }}>
      {current} / {total}
    </span>
  </div>
);

const DuotoneImage = ({ src, alt, className = "" }: { src: string, alt: string, className?: string }) => (
  <div className={`relative ${className}`}>
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover"
      style={{ filter: 'grayscale(1) sepia(0.1)' }}
    />
    <div className="absolute inset-0 bg-[#0D1B2D] mix-blend-multiply opacity-40" />
    <div className="absolute inset-0 bg-[#0D1B2D]/20" />
  </div>
);

export function CinematicV3() {
  return (
    <div className="w-full min-h-screen text-[#F6EFE4] bg-[#0D1B2D] selection:bg-[#C77A3A] selection:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. HERO */}
      <section className="relative w-full h-screen flex flex-col justify-end pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <DuotoneImage src="/__mockup/images/cinematic-hero.png" alt="Hero Architectural" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2D] via-transparent to-[#0D1B2D]/30" />
        </div>
        
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-24 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="flex-1">
            <div className="mb-8 flex items-center gap-4">
              <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-[#F6EFE4]" style={{ fontFamily: 'Montserrat' }}>
                Dream it. Build it. Live it.
              </span>
              <div className="h-[1px] w-12 bg-[#C77A3A]" />
              <span className="uppercase tracking-[0.2em] text-[10px] font-medium text-[#F6EFE4]/60" style={{ fontFamily: 'Montserrat' }}>
                The Deal Architect
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[110px] leading-[0.9] text-[#F6EFE4]" style={{ fontFamily: 'Cinzel' }}>
              Complex property.<br />
              <span className="italic text-[#F6EFE4]/80">Structured opportunity.</span>
            </h1>
          </div>
          
          <div className="flex flex-col gap-4 items-end pb-4 shrink-0">
            <a href="/submit" className="group relative px-10 py-5 bg-[#C77A3A] text-white uppercase tracking-[0.2em] text-[10px] font-bold overflow-hidden w-full text-center md:w-auto md:text-left" style={{ fontFamily: 'Montserrat' }}>
              <span className="relative z-10 flex items-center justify-center gap-3">Submit a Property <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
            </a>
            <a href="/work-with-apollo" className="px-10 py-4 border border-[#F6EFE4]/20 text-[#F6EFE4] hover:bg-[#F6EFE4]/5 uppercase tracking-[0.2em] text-[10px] font-bold transition-colors w-full text-center md:w-auto" style={{ fontFamily: 'Montserrat' }}>
              Work With Apollo
            </a>
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="w-full border-y border-[#F6EFE4]/10 bg-[#0D1B2D] py-8 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-24 flex flex-wrap justify-between items-center gap-4 text-[9px] uppercase tracking-[0.3em] text-[#F6EFE4]/40" style={{ fontFamily: 'Montserrat' }}>
          <span>DRE #02333658</span>
          <span className="hidden md:inline w-1 h-1 bg-[#C77A3A]" />
          <span>Keller Williams Realty East Bay</span>
          <span className="hidden md:inline w-1 h-1 bg-[#C77A3A]" />
          <span>CA Two-Party Consent</span>
          <span className="hidden md:inline w-1 h-1 bg-[#C77A3A]" />
          <span>NAR NRDS #159537628</span>
        </div>
      </section>

      {/* 3. AUDIENCE SORT */}
      <section className="w-full py-40 relative" id="how-it-works">
        <SectionNumeral current="01" total="09" />
        <div className="max-w-[1000px] mx-auto pl-24 md:pl-48 pr-6 md:pr-24">
          <div className="mb-24">
            <h2 className="text-4xl md:text-5xl mb-6" style={{ fontFamily: 'Cinzel' }}>What brings you here?</h2>
            <p className="text-xl text-[#F6EFE4]/60 italic" style={{ fontFamily: 'Cormorant' }}>
              Four specialized lanes. One unified standard of architecture.
            </p>
          </div>

          <div className="flex flex-col">
            {[
              { title: "Sellers", desc: "Complex or standard property transitions.", href: "/submit" },
              { title: "Buyers", desc: "Strategic acquisition and deal structuring.", href: "/work-with-apollo" },
              { title: "Capital Partners", desc: "Yield and equity deployment vehicles.", href: "/capital" },
              { title: "Vendors", desc: "The ecosystem of execution.", href: "/vendor-network" }
            ].map((lane, i) => (
              <a key={i} href={lane.href} className="group block py-12 border-t border-[#C77A3A]/20 last:border-b transition-colors hover:bg-[#F6EFE4]/5 px-6 -mx-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <h3 className="text-4xl md:text-5xl" style={{ fontFamily: 'Cinzel' }}>{lane.title}</h3>
                  <div className="flex items-center gap-8 md:text-right">
                    <p className="text-xl text-[#F6EFE4]/60 italic" style={{ fontFamily: 'Cormorant' }}>{lane.desc}</p>
                    <ArrowRight size={24} className="text-[#C77A3A] group-hover:translate-x-2 transition-transform shrink-0" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 4. NELSON DR PROOF */}
      <section className="w-full h-screen relative flex items-end pb-24">
        <div className="absolute inset-0 z-0">
          <DuotoneImage src="/__mockup/images/cinematic-nelson.png" alt="Nelson Dr Project" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2D] via-transparent to-[#0D1B2D]/40" />
        </div>
        
        <SectionNumeral current="02" total="09" />
        
        <div className="relative z-10 w-full max-w-[1400px] mx-auto pl-24 md:pl-48 pr-6 md:pr-24 flex justify-between items-end">
          <div>
            <div className="inline-block bg-[#0D1B2D] p-6 mb-8 border border-[#F6EFE4]/10">
              <div className="flex gap-8 text-[9px] uppercase tracking-[0.3em] font-bold text-[#F6EFE4]" style={{ fontFamily: 'Montserrat' }}>
                <div>
                  <div className="text-[#F6EFE4]/40 mb-2">Year</div>
                  <div>2024</div>
                </div>
                <div>
                  <div className="text-[#F6EFE4]/40 mb-2">Type</div>
                  <div>Ground-Up Build</div>
                </div>
                <div>
                  <div className="text-[#F6EFE4]/40 mb-2">Location</div>
                  <div>East Bay</div>
                </div>
              </div>
            </div>
            <h2 className="text-6xl md:text-8xl mb-4" style={{ fontFamily: 'Cinzel' }}>Nelson Dr.</h2>
            <p className="text-2xl text-[#F6EFE4]/60 italic max-w-lg" style={{ fontFamily: 'Cormorant' }}>
              A flagship testament to our structural approach. Every property gets a path.
            </p>
          </div>
          <a href="/projects/nelson-dr" className="group flex items-center justify-center w-24 h-24 rounded-full border border-[#C77A3A] text-[#C77A3A] hover:bg-[#C77A3A] hover:text-[#F6EFE4] transition-all duration-500 shrink-0">
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      {/* 5. STRATEGY LAB TEASER */}
      <section className="w-full py-40 relative">
        <SectionNumeral current="03" total="09" />
        <div className="max-w-[1000px] mx-auto pl-24 md:pl-48 pr-6 md:pr-24">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl mb-8" style={{ fontFamily: 'Cinzel' }}>Strategy Lab</h2>
              <p className="text-2xl mb-8 italic text-[#F6EFE4]/80" style={{ fontFamily: 'Cormorant' }}>
                Run the numbers before you bring the property.
              </p>
              <p className="text-[#F6EFE4]/50 leading-relaxed mb-12">
                Access our proprietary calculation engines. Most Strategy Snapshots are reviewed within 5 business days, giving you the clarity needed to make structural decisions.
              </p>
              <a href="/strategy-lab" className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-[#C77A3A] hover:text-[#F6EFE4] transition-colors" style={{ fontFamily: 'Montserrat' }}>
                Open Calculator <ArrowRight size={14} />
              </a>
            </div>
            
            <div className="relative aspect-square border border-[#F6EFE4]/10 p-10 flex flex-col justify-between bg-[#1E2328]/30">
              <div className="flex justify-between items-start mb-12">
                <span className="uppercase tracking-[0.3em] text-[9px] text-[#F6EFE4]/40 font-bold" style={{ fontFamily: 'Montserrat' }}>Terminal Value</span>
                <Calculator size={20} className="text-[#C77A3A]" />
              </div>
              <div className="space-y-8">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.3em] text-[#F6EFE4]/40 mb-2 font-bold" style={{ fontFamily: 'Montserrat' }}>Estimated ARV</div>
                  <div className="text-4xl" style={{ fontFamily: 'Cinzel' }}>$1,450,000</div>
                </div>
                <div className="h-[1px] w-full bg-[#C77A3A]/20" />
                <div>
                  <div className="text-[9px] uppercase tracking-[0.3em] text-[#F6EFE4]/40 mb-2 font-bold" style={{ fontFamily: 'Montserrat' }}>Target Yield</div>
                  <div className="text-4xl" style={{ fontFamily: 'Cinzel' }}>18.4%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHAT WE DO (5 Bands) */}
      <section className="w-full relative">
        {[
          { title: "Deal Architecture", tag: "Structuring the path.", href: "/deal-architecture", num: "04" },
          { title: "Development", tag: "Execution with discipline.", href: "/development", num: "05" },
          { title: "Strategy Lab", tag: "Precision underwriting.", href: "/strategy-lab", num: "06" },
          { title: "Work With Apollo", tag: "Direct representation.", href: "/work-with-apollo", num: "07" },
          { title: "MarketFlow", tag: "Ecosystem engine.", href: "/marketflow", num: "08", badge: "Private beta · invite only" }
        ].map((item, i) => (
          <div key={i} className="group w-full h-[100vh] flex flex-col md:flex-row relative border-t border-[#F6EFE4]/10">
            <SectionNumeral current={item.num} total="09" />
            
            <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
              <DuotoneImage src={`/__mockup/images/cinematic-nelson.png`} alt={item.title} className="h-full" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D1B2D] hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0D1B2D] md:hidden" />
            </div>
            
            <div className="w-full md:w-1/2 h-1/2 md:h-full bg-[#0D1B2D] flex items-center pl-12 md:pl-24 pr-6 relative">
              <div className="absolute inset-0 bg-[#C77A3A]/0 group-hover:bg-[#C77A3A]/5 transition-colors duration-700" />
              <a href={item.href} className="w-full block relative z-10">
                <div className="mb-6 flex items-center gap-4">
                  {item.badge && (
                    <>
                      <div className="w-1.5 h-1.5 bg-[#0D1B2D] ring-1 ring-[#C77A3A]" />
                      <span className="uppercase tracking-[0.2em] text-[9px] text-[#F6EFE4]/60 font-bold" style={{ fontFamily: 'Montserrat' }}>
                        {item.badge}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-5xl md:text-7xl mb-6 transition-transform duration-500 group-hover:translate-x-4" style={{ fontFamily: 'Cinzel' }}>
                  {item.title}
                </h3>
                <div className="flex items-center justify-between transition-transform duration-500 delay-75 group-hover:translate-x-4">
                  <span className="text-2xl text-[#F6EFE4]/60 italic" style={{ fontFamily: 'Cormorant' }}>{item.tag}</span>
                  <ArrowRight size={24} className="text-[#C77A3A] group-hover:translate-x-2 transition-transform" />
                </div>
              </a>
            </div>
          </div>
        ))}
      </section>

      {/* 7. OPERATOR BIO */}
      <section className="w-full relative bg-[#1E2328] py-40 border-t border-[#F6EFE4]/5">
        <SectionNumeral current="09" total="09" />
        <div className="max-w-[1400px] mx-auto pl-24 md:pl-48 pr-6 md:pr-24">
          <div className="flex flex-col md:flex-row gap-24 items-center">
            <div className="w-full md:w-1/2 relative aspect-[3/4]">
              <DuotoneImage src="/__mockup/images/cinematic-apollo.png" alt="Apollo Duran" />
            </div>
            
            <div className="w-full md:w-1/2">
              <h2 className="text-4xl md:text-5xl mb-12 leading-[1.2]" style={{ fontFamily: 'Cinzel' }}>
                "Built on strategy.<br />
                <span className="italic text-[#F6EFE4]/70">Governed by virtue.</span><br />
                Executed with discipline."
              </h2>
              
              <div className="space-y-6 text-[#F6EFE4]/60 text-lg leading-relaxed max-w-lg mb-16 italic" style={{ fontFamily: 'Cormorant' }}>
                <p>Apollo Duran oversees the structural architecture of every deal passing through Pegasus DreamScapes.</p>
                <p>An obsession with the downside. A reverence for the upside. Deal architecture is not just about making numbers work—it is about ensuring the vehicle is resilient enough to reach the destination.</p>
              </div>
              
              <div className="border-t border-[#F6EFE4]/10 pt-8 flex flex-col gap-3 uppercase tracking-[0.2em] text-[10px] font-bold text-[#F6EFE4]/40" style={{ fontFamily: 'Montserrat' }}>
                <span className="text-[#F6EFE4]">Paolo "Apollo" Duran</span>
                <span>Founder & Principal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MANIFESTO (Dreamscaper Standard) */}
      <section className="w-full py-40 bg-[#0D1B2D] relative border-y border-[#F6EFE4]/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-[10px] uppercase tracking-[0.4em] mb-16 text-[#F6EFE4]/50 font-bold" style={{ fontFamily: 'Montserrat' }}>
            <span className="w-1.5 h-1.5 bg-[#C77A3A] inline-block mr-4 -translate-y-0.5" />
            The Dreamscaper Standard.
          </h2>
          <p className="text-3xl md:text-5xl leading-snug italic text-[#F6EFE4]/90" style={{ fontFamily: 'Cormorant' }}>
            "We do not bend reality to fit a pre-determined model. We observe the terrain, acknowledge the friction, and engineer a structure capable of moving through it."
          </p>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="w-full py-40 bg-[#F6EFE4] text-[#0D1B2D]">
        <div className="max-w-[1000px] mx-auto px-6 md:px-24 text-center">
          <h2 className="text-5xl md:text-7xl mb-12 leading-[1.1]" style={{ fontFamily: 'Cinzel' }}>
            Bring us the property.<br />
            <span className="italic text-[#0D1B2D]/70">We'll help find the path.</span>
          </h2>
          
          <a href="/submit" className="inline-flex items-center gap-4 bg-[#C77A3A] text-[#F6EFE4] px-12 py-6 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-[#0D1B2D] transition-colors" style={{ fontFamily: 'Montserrat' }}>
            Submit a Property <ArrowRight size={14} />
          </a>
        </div>
      </section>

    </div>
  );
}
