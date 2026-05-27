import React from 'react';
import { ArrowRight } from "lucide-react";

export function Editorial() {
  return (
    <div className="w-full min-h-screen bg-[#F6EFE4] text-[#0D1B2D] selection:bg-[#C77A3A] selection:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div dangerouslySetInnerHTML={{ __html: `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
      `}} />
      
      {/* 1. HERO - DOCTRINE LINE */}
      <section className="min-h-[80vh] flex flex-col justify-between px-6 py-12 md:px-24 md:py-24 max-w-7xl mx-auto border-b border-[#0D1B2D]/20">
        <div>
          <div className="flex items-center gap-4 mb-24">
            <span className="w-12 h-px bg-[#C77A3A]"></span>
            <span className="uppercase tracking-[0.3em] text-xs font-semibold" style={{ fontFamily: 'Montserrat' }}>The Deal Architect</span>
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight mb-12" style={{ fontFamily: 'Cormorant Garamond' }}>
            Every property<br />
            <span className="italic">gets a path.</span><br />
            Not every property<br />
            gets an offer.
          </h1>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-t border-[#0D1B2D]/10 pt-12">
          <div className="max-w-xl">
            <p className="text-2xl italic leading-relaxed" style={{ fontFamily: 'Cormorant Garamond' }}>
              Most groups want the property that fits their single playbook. Pegasus is built differently. We review the situation, then match it to the lane that fits, whether that lane is ours or someone else's.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-2" style={{ fontFamily: 'Montserrat' }}>The Mandate</p>
            <p className="text-lg italic" style={{ fontFamily: 'Cormorant Garamond' }}>"Bring us the property.<br />We'll help find the path."</p>
          </div>
        </div>
      </section>

      {/* 2. THREE STEPS */}
      <section className="py-32 px-6 md:px-24 max-w-7xl mx-auto border-b border-[#0D1B2D]/20">
        <div className="flex flex-col lg:flex-row gap-24">
          <div className="w-full lg:w-1/3">
            <h2 className="uppercase tracking-[0.3em] text-sm font-semibold mb-8" style={{ fontFamily: 'Montserrat' }}>How we work</h2>
            <p className="text-3xl italic leading-snug border-l border-[#C77A3A] pl-6" style={{ fontFamily: 'Cormorant Garamond' }}>
              A structural read of the situation, then the honest next step. No high-pressure tactics. No promises we can't keep.
            </p>
          </div>
          <div className="w-full lg:w-2/3 space-y-16">
            <div className="relative">
              <span className="absolute -left-16 top-1 text-[#C77A3A] font-bold text-sm tracking-[0.2em]" style={{ fontFamily: 'Montserrat' }}>01</span>
              <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Cinzel' }}>Submit the situation</h3>
              <p className="text-lg text-[#0D1B2D]/80 leading-relaxed max-w-lg">
                <span className="float-left text-5xl leading-none mt-1 mr-2 text-[#C77A3A]" style={{ fontFamily: 'Cormorant Garamond' }}>A</span>ddress, condition, what you're trying to solve. Two minutes.
              </p>
            </div>
            <div className="relative">
              <span className="absolute -left-16 top-1 text-[#C77A3A] font-bold text-sm tracking-[0.2em]" style={{ fontFamily: 'Montserrat' }}>02</span>
              <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Cinzel' }}>Apollo reads it structurally</h3>
              <p className="text-lg text-[#0D1B2D]/80 leading-relaxed max-w-lg">
                Comps, condition, capital stack, timeline, occupancy, exposure. The Pegasus lens applied to your exact situation.
              </p>
            </div>
            <div className="relative">
              <span className="absolute -left-16 top-1 text-[#C77A3A] font-bold text-sm tracking-[0.2em]" style={{ fontFamily: 'Montserrat' }}>03</span>
              <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Cinzel' }}>We name the lane</h3>
              <p className="text-lg text-[#0D1B2D]/80 leading-relaxed max-w-lg">
                One of the ten structural paths, including a routed referral if Pegasus isn't the right fit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TEN OUTCOME LANES */}
      <section className="py-32 px-6 md:px-24 max-w-4xl mx-auto">
        <h2 className="uppercase tracking-[0.3em] text-sm font-semibold mb-24 text-center border-b border-[#0D1B2D]/10 pb-8" style={{ fontFamily: 'Montserrat' }}>A Pattern Language of Outcomes</h2>
        
        <div className="space-y-24">
          {[
            { id: 'I', title: "Direct acquisition", desc: "Pegasus buys outright at a structurally honest number." },
            { id: 'II', title: "Creative finance", desc: "Seller-carry, subject-to, lease-option, non-conforming structures." },
            { id: 'III', title: "Joint venture / co-GP", desc: "Capital + operational discipline brought to an aligned operator." },
            { id: 'IV', title: "Wholesale assignment", desc: "Route the deal to another operator in our network." },
            { id: 'V', title: "Listing through KW", desc: "Clean MLS listing via Apollo's Keller Williams East Bay license." },
            { id: 'VI', title: "Buyer representation", desc: "Owner-occupant and investor-side buyer rep, same underwriting lens." },
            { id: 'VII', title: "BRRRR acquisition", desc: "Buy, rehab, rent, refinance, repeat. Held instead of resold." },
            { id: 'VIII', title: "ADU upside", desc: "Detached/attached ADUs on East Bay residential lots. Design, permit, build." },
            { id: 'IX', title: "Value-add rehab", desc: "Heavy cosmetic + structural rehab to highest defensible value." },
            { id: 'X', title: "Routed referral", desc: "If the right path is outside Pegasus, route owner to a vetted operator." }
          ].map((lane, i) => (
            <div key={i} className="flex gap-8 group">
              <div className="w-16 pt-2 shrink-0 text-[#C77A3A] text-2xl text-right" style={{ fontFamily: 'Cinzel' }}>
                {lane.id}
              </div>
              <div>
                <h3 className="text-3xl mb-4" style={{ fontFamily: 'Cinzel' }}>{lane.title}</h3>
                <p className="text-xl italic text-[#0D1B2D]/70 leading-relaxed" style={{ fontFamily: 'Cormorant Garamond' }}>
                  {lane.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-24 border-t border-[#0D1B2D]/20 bg-[#F6EFE4]">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="w-12 h-px bg-[#C77A3A] mb-8" />
          <h2 className="text-4xl italic mb-12" style={{ fontFamily: 'Cormorant Garamond' }}>
            Bring us the property.<br />We'll help find the path.
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-lg">
            <a href="/submit" className="flex-1 flex items-center justify-center gap-3 bg-[#C77A3A] hover:bg-[#0D1B2D] text-white px-8 py-5 uppercase tracking-[0.2em] text-xs font-bold transition-colors" style={{ fontFamily: 'Montserrat' }}>
              Submit a Property <ArrowRight size={14} />
            </a>
            <a href="/strategy-lab" className="flex-1 flex items-center justify-center bg-transparent border border-[#0D1B2D] text-[#0D1B2D] hover:bg-[#0D1B2D]/5 px-8 py-5 uppercase tracking-[0.2em] text-xs font-bold transition-colors" style={{ fontFamily: 'Montserrat' }}>
              Open Strategy Lab
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
