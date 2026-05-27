import React from "react";
import { ArrowRight, Calculator, Handshake, Home, Hammer, Key, Shield } from "lucide-react";

const brand = {
  navy: "#0D1B2D",
  copper: "#C77A3A",
  cream: "#F6EFE4",
  charcoal: "#1E2328"
};

const SectionOpener = ({ num, eyebrow, title, deck, light = false }: { num: string, eyebrow: string, title: string | React.ReactNode, deck?: React.ReactNode, light?: boolean }) => (
  <div className="mb-16">
    <div className="flex items-center gap-4 mb-6" style={{ fontFamily: 'Montserrat' }}>
      <span className="text-[#C77A3A] text-[12px] font-bold">{num}</span>
      <div className="h-[1px] w-8 bg-[#C77A3A]/50" />
      <span className={`text-[12px] uppercase tracking-[0.2em] ${light ? 'text-[#0D1B2D]/60' : 'text-[#F6EFE4]/60'}`}>
        {eyebrow}
      </span>
    </div>
    <h2 className={`text-[64px] leading-[1.1] mb-6 ${light ? 'text-[#0D1B2D]' : 'text-[#F6EFE4]'}`} style={{ fontFamily: 'Cinzel' }}>
      {title}
    </h2>
    {deck && (
      <p className={`text-[32px] leading-snug italic max-w-4xl ${light ? 'text-[#0D1B2D]/80' : 'text-[#F6EFE4]/80'}`} style={{ fontFamily: 'Cormorant' }}>
        {deck}
      </p>
    )}
  </div>
);

const PrimaryButton = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} className="inline-flex items-center justify-center gap-3 bg-[#C77A3A] text-white px-8 py-5 text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-[#C77A3A]/90 transition-colors" style={{ fontFamily: 'Montserrat' }}>
    {children}
  </a>
);

const SecondaryButton = ({ href, children, light = false }: { href: string, children: React.ReactNode, light?: boolean }) => (
  <a href={href} className={`inline-flex items-center justify-center gap-3 px-8 py-5 text-[12px] uppercase tracking-[0.2em] font-bold border-b border-[#C77A3A] hover:bg-[#C77A3A]/5 transition-colors ${light ? 'text-[#0D1B2D]' : 'text-[#F6EFE4]'}`} style={{ fontFamily: 'Montserrat' }}>
    {children}
  </a>
);

export function CinematicV2() {
  return (
    <div className="w-full min-h-screen text-[#F6EFE4] bg-[#0D1B2D] selection:bg-[#C77A3A] selection:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* 01. HERO */}
      <section className="relative w-full min-h-screen flex items-center pt-32 pb-32 overflow-hidden border-b border-[#C77A3A]/30">
        <div className="absolute inset-0 z-0">
          <img 
            src="/__mockup/images/cinematic-hero.png" 
            alt="Hero Architectural" 
            className="w-full h-full object-cover mix-blend-luminosity opacity-40"
          />
          <div className="absolute inset-0 bg-[#0D1B2D]/60" />
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col justify-center h-full">
          <SectionOpener 
            num="01" 
            eyebrow="The Deal Architect" 
            title={
              <span className="text-[96px] md:text-[112px] leading-none block">
                Complex property.<br />
                <span className="text-[#C77A3A] italic">Structured</span> opportunity.
              </span>
            } 
            deck="Bring us the property. We'll help find the path." 
          />
          
          <div className="mt-12 flex flex-col sm:flex-row gap-8 items-start sm:items-center">
            <PrimaryButton href="/submit">
              Submit a Property <ArrowRight size={16} />
            </PrimaryButton>
            <SecondaryButton href="#how-it-works">
              See How It Works <ArrowRight size={16} />
            </SecondaryButton>
          </div>
        </div>
      </section>

      {/* 02. TRUST STRIP */}
      <section className="w-full py-24 bg-[#0D1B2D] border-b border-[#C77A3A]/30 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <SectionOpener 
            num="02" 
            eyebrow="Credentials" 
            title="Governed by virtue." 
            deck="Decades of East Bay construction in the team." 
          />
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[12px] uppercase tracking-[0.2em] text-[#F6EFE4]/60" style={{ fontFamily: 'Montserrat' }}>
            <span>DRE #02333658</span>
            <span className="text-[#C77A3A]">/</span>
            <span>Keller Williams Realty East Bay</span>
            <span className="text-[#C77A3A]">/</span>
            <span>CA Two-Party Consent</span>
            <span className="text-[#C77A3A]">/</span>
            <span>NAR NRDS #159537628</span>
          </div>
        </div>
      </section>

      {/* 03. AUDIENCE SORT */}
      <section className="w-full py-32 bg-[#0D1B2D] border-b border-[#C77A3A]/30 relative" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <SectionOpener 
            num="03" 
            eyebrow="Orientation" 
            title="What brings you here?" 
            deck="Four specialized lanes. One unified standard of architecture." 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {[
              { title: "Sellers", icon: Home, desc: "Complex or standard property transitions.", href: "/submit" },
              { title: "Buyers", icon: Key, desc: "Strategic acquisition and deal structuring.", href: "/work-with-apollo" },
              { title: "Capital", icon: Handshake, desc: "Yield and equity deployment vehicles.", href: "/capital" },
              { title: "Vendors", icon: Hammer, desc: "The ecosystem of execution.", href: "/vendor-network" }
            ].map((lane, i) => (
              <a key={i} href={lane.href} className="group block bg-[#1E2328] h-[360px] p-10 relative overflow-hidden border-t-2 border-transparent hover:border-[#C77A3A] transition-all duration-300">
                <lane.icon size={32} className="text-[#C77A3A] mb-12" strokeWidth={1.5} />
                <h3 className="text-[32px] mb-4" style={{ fontFamily: 'Cinzel' }}>{lane.title}</h3>
                <p className="text-[#F6EFE4]/60 text-[18px] mb-8 leading-relaxed" style={{ fontFamily: 'Cormorant' }}>{lane.desc}</p>
                <div className="absolute bottom-10 left-10 flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#C77A3A] font-bold" style={{ fontFamily: 'Montserrat' }}>
                  Explore <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 04. NELSON DR PROOF */}
      <section className="w-full py-32 relative flex items-center border-b border-[#C77A3A]/30">
        <div className="absolute inset-0 z-0">
          <img src="/__mockup/images/cinematic-nelson.png" alt="Nelson Dr Project" className="w-full h-full object-cover opacity-30 grayscale mix-blend-luminosity" />
          <div className="absolute inset-0 bg-[#0D1B2D]/80 mix-blend-multiply" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <SectionOpener 
            num="04" 
            eyebrow="Case Study" 
            title="Nelson Dr." 
            deck="A flagship testament to our structural approach." 
          />
          <div className="mt-12">
            <PrimaryButton href="/projects/nelson-dr">
              View the Project <ArrowRight size={16} />
            </PrimaryButton>
          </div>
        </div>
      </section>

      {/* 05. STRATEGY LAB TEASER */}
      <section className="w-full py-32 bg-[#F6EFE4] text-[#0D1B2D] border-b border-[#C77A3A]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-24 items-start">
            <div className="lg:w-1/2">
              <SectionOpener 
                num="05" 
                eyebrow="Underwriting" 
                title="Strategy Lab" 
                deck="Run the numbers before you bring the property." 
                light
              />
              <p className="text-[18px] text-[#0D1B2D]/80 mb-12 leading-relaxed max-w-lg">
                Access our proprietary calculation engines. Most Strategy Snapshots are reviewed within 5 business days, giving you the clarity needed to make structural decisions.
              </p>
              <SecondaryButton href="/strategy-lab" light>
                Open Calculator <Calculator size={16} />
              </SecondaryButton>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="bg-[#0D1B2D] text-[#F6EFE4] p-12 shadow-2xl relative">
                <div className="absolute inset-0 border border-[#C77A3A]/30 -translate-x-4 -translate-y-4 pointer-events-none" />
                <div className="flex justify-between items-center mb-16">
                  <span className="text-[12px] uppercase tracking-[0.2em] text-[#C77A3A]" style={{ fontFamily: 'Montserrat' }}>Terminal Value</span>
                  <Shield size={24} className="text-[#C77A3A]" />
                </div>
                <div className="space-y-10">
                  <div>
                    <div className="text-[12px] uppercase tracking-[0.2em] text-[#F6EFE4]/50 mb-2" style={{ fontFamily: 'Montserrat' }}>Estimated ARV</div>
                    <div className="text-[64px] leading-none font-light" style={{ fontFamily: 'Cinzel' }}>$1,450,000</div>
                  </div>
                  <div className="h-[1px] w-full bg-[#F6EFE4]/10" />
                  <div>
                    <div className="text-[12px] uppercase tracking-[0.2em] text-[#F6EFE4]/50 mb-2" style={{ fontFamily: 'Montserrat' }}>Target Yield</div>
                    <div className="text-[64px] leading-none font-light" style={{ fontFamily: 'Cinzel' }}>18.4%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 06. WHAT WE DO */}
      <section className="w-full py-32 bg-[#0D1B2D] border-b border-[#C77A3A]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
          <SectionOpener 
            num="06" 
            eyebrow="Capabilities" 
            title="The Ecosystem" 
            deck="Execution with discipline." 
          />
        </div>
        <div className="w-full border-t border-[#F6EFE4]/10">
          {[
            { title: "Deal Architecture", tag: "Structuring the path.", href: "/deal-architecture", num: "01" },
            { title: "Development", tag: "Execution with discipline.", href: "/development", num: "02" },
            { title: "Strategy Lab", tag: "Precision underwriting.", href: "/strategy-lab", num: "03" },
            { title: "Work With Apollo", tag: "Direct representation.", href: "/work-with-apollo", num: "04" },
            { title: "MarketFlow", tag: "Ecosystem engine.", href: "/marketflow", num: "05", badge: "Private beta · invite only" }
          ].map((item, i) => (
            <a key={i} href={item.href} className="group block w-full border-b border-[#F6EFE4]/10 hover:bg-[#1E2328] transition-colors duration-300">
              <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-baseline py-12">
                <span className="w-24 shrink-0 text-[#C77A3A] text-[18px]" style={{ fontFamily: 'Montserrat' }}>{item.num}</span>
                <h3 className="w-1/3 shrink-0 text-[32px] text-[#F6EFE4]" style={{ fontFamily: 'Cinzel' }}>{item.title}</h3>
                <span className="flex-1 text-[18px] text-[#F6EFE4]/60 italic" style={{ fontFamily: 'Cormorant' }}>{item.tag}</span>
                {item.badge && (
                  <span className="shrink-0 ml-4 px-4 py-2 border border-[#0D1B2D] bg-[#0D1B2D] text-[#F6EFE4]/50 text-[12px] uppercase tracking-[0.2em]" style={{ fontFamily: 'Montserrat' }}>
                    {item.badge}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 07. OPERATOR BIO */}
      <section className="w-full py-32 bg-[#1E2328] border-b border-[#C77A3A]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <SectionOpener 
            num="07" 
            eyebrow="Leadership" 
            title="Built on strategy." 
            deck="Executed with discipline." 
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mt-16 items-center">
            <div className="relative aspect-[3/4] w-full max-w-md">
              <img src="/__mockup/images/cinematic-apollo.png" alt="Apollo Duran" className="w-full h-full object-cover grayscale opacity-80" />
              <div className="absolute inset-0 border border-[#C77A3A]/30 translate-x-6 translate-y-6 pointer-events-none" />
            </div>
            <div>
              <div className="space-y-8 text-[18px] text-[#F6EFE4]/80 leading-relaxed max-w-xl mb-16" style={{ fontFamily: 'Inter' }}>
                <p>Apollo Duran oversees the structural architecture of every deal passing through Pegasus DreamScapes.</p>
                <p>An obsession with the downside. A reverence for the upside. Deal architecture is not just about making numbers work—it is about ensuring the vehicle is resilient enough to reach the destination.</p>
              </div>
              <div className="flex flex-col gap-2 text-[12px] uppercase tracking-[0.2em] font-bold" style={{ fontFamily: 'Montserrat' }}>
                <span className="text-[#C77A3A]">Paolo "Apollo" Duran</span>
                <span className="text-[#F6EFE4]/50">Founder & Principal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 08. MANIFESTO (Dreamscaper Standard) */}
      <section className="w-full py-32 bg-[#0D1B2D] relative overflow-hidden border-b border-[#C77A3A]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="flex justify-center mb-16">
            <div className="flex items-center gap-4" style={{ fontFamily: 'Montserrat' }}>
              <span className="text-[#C77A3A] text-[12px] font-bold">08</span>
              <div className="h-[1px] w-8 bg-[#C77A3A]/50" />
              <span className="text-[12px] uppercase tracking-[0.2em] text-[#F6EFE4]/60">Doctrine</span>
            </div>
          </div>
          <h2 className="text-[32px] text-[#C77A3A] mb-12" style={{ fontFamily: 'Cinzel' }}>
            The Dreamscaper Standard.
          </h2>
          <p className="text-[64px] leading-[1.1] max-w-5xl mx-auto" style={{ fontFamily: 'Cinzel' }}>
            "We do not bend reality to fit a pre-determined model. We observe the terrain, acknowledge the friction, and engineer a structure capable of moving through it."
          </p>
        </div>
      </section>

      {/* 09. FINAL CTA */}
      <section className="w-full py-32 bg-[#F6EFE4] text-[#0D1B2D] relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <SectionOpener 
            num="09" 
            eyebrow="Next Steps" 
            title="Bring us the property." 
            deck="Dream it. Build it. Live it." 
            light
          />
          <div className="mt-16">
            <PrimaryButton href="/submit">
              Submit a Property <ArrowRight size={16} />
            </PrimaryButton>
          </div>
        </div>
      </section>

    </div>
  );
}
