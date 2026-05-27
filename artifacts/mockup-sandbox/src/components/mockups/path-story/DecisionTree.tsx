import React from "react";
import { ArrowRight, FileText, Search, Compass, ShieldCheck } from "lucide-react";

const LANES = [
  {
    num: "01",
    title: "Direct acquisition",
    desc: "Pegasus buys outright at a structurally honest number."
  },
  {
    num: "02",
    title: "Creative finance",
    desc: "Seller-carry, subject-to, lease-option, non-conforming structures."
  },
  {
    num: "03",
    title: "Joint venture / co-GP",
    desc: "Capital + operational discipline brought to an aligned operator."
  },
  {
    num: "04",
    title: "Wholesale assignment",
    desc: "Route the deal to another operator in our network."
  },
  {
    num: "05",
    title: "Listing through KW",
    desc: "Clean MLS listing via Apollo's Keller Williams East Bay license."
  },
  {
    num: "06",
    title: "Buyer representation",
    desc: "Owner-occupant and investor-side buyer rep, same underwriting lens."
  },
  {
    num: "07",
    title: "BRRRR acquisition",
    desc: "Buy, rehab, rent, refinance, repeat. Held instead of resold."
  },
  {
    num: "08",
    title: "ADU upside",
    desc: "Detached/attached ADUs on East Bay residential lots. Design, permit, build."
  },
  {
    num: "09",
    title: "Value-add rehab",
    desc: "Heavy cosmetic + structural rehab to highest defensible value."
  },
  {
    num: "10",
    title: "Routed referral",
    desc: "If the right path is outside Pegasus, route owner to a vetted operator."
  }
];

export function DecisionTree() {
  return (
    <div className="min-h-screen bg-[#0D1B2D] text-[#F6EFE4] selection:bg-[#C77A3A] selection:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div dangerouslySetInnerHTML={{ __html: `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
      `}} />

      {/* Hero / Doctrine */}
      <section className="relative w-full pt-32 pb-16 px-6 md:px-12 max-w-[1280px] mx-auto text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6" style={{ fontFamily: 'Cinzel' }}>
          Every property gets a path.<br/>
          <span className="text-[#C77A3A] italic" style={{ fontFamily: 'Cormorant Garamond' }}>Not every property gets an offer.</span>
        </h1>
        <p className="text-2xl md:text-3xl italic text-[#F6EFE4]/80 mb-8" style={{ fontFamily: 'Cormorant Garamond' }}>
          Bring us the property. We'll help find the path.
        </p>
        <p className="max-w-3xl mx-auto text-[#F6EFE4]/60 text-lg leading-relaxed">
          Most groups want the property that fits their single playbook. Pegasus is built differently. We review the situation, then match it to the lane that fits, whether that lane is ours or someone else's.
        </p>
      </section>

      {/* Decision Tree Diagram */}
      <section className="relative w-full max-w-[1280px] mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col items-center">
          
          {/* Step 1 */}
          <div className="relative z-10 w-full max-w-lg bg-[#1E2328] border border-[#C77A3A]/40 p-6 text-center">
            <div className="text-[#C77A3A] text-[10px] tracking-[0.2em] uppercase font-bold mb-3" style={{ fontFamily: 'Montserrat' }}>Step 01</div>
            <h3 className="text-2xl mb-2" style={{ fontFamily: 'Cinzel' }}>Submit the situation</h3>
            <p className="text-[#F6EFE4]/60 text-sm">Address, condition, what you're trying to solve. Two minutes.</p>
          </div>

          {/* Copper Line */}
          <div className="w-px h-12 bg-[#C77A3A]"></div>

          {/* Step 2 */}
          <div className="relative z-10 w-full max-w-lg bg-[#1E2328] border border-[#C77A3A]/40 p-6 text-center">
            <div className="text-[#C77A3A] text-[10px] tracking-[0.2em] uppercase font-bold mb-3" style={{ fontFamily: 'Montserrat' }}>Step 02</div>
            <h3 className="text-2xl mb-2" style={{ fontFamily: 'Cinzel' }}>Apollo reads it structurally</h3>
            <p className="text-[#F6EFE4]/60 text-sm">Comps, condition, capital stack, timeline, occupancy, exposure. The Pegasus lens.</p>
          </div>

          {/* Copper Line */}
          <div className="w-px h-12 bg-[#C77A3A]"></div>

          {/* Step 3 */}
          <div className="relative z-10 w-full max-w-lg bg-[#1E2328] border border-[#C77A3A] p-6 text-center shadow-[0_0_30px_rgba(199,122,58,0.1)]">
            <div className="text-[#C77A3A] text-[10px] tracking-[0.2em] uppercase font-bold mb-3" style={{ fontFamily: 'Montserrat' }}>Step 03</div>
            <h3 className="text-2xl mb-2" style={{ fontFamily: 'Cinzel' }}>We name the lane</h3>
            <p className="text-[#F6EFE4]/60 text-sm">One of the ten lanes, including a routed referral if Pegasus isn't the right fit.</p>
          </div>

          {/* Tree branching */}
          <div className="w-px h-12 bg-[#C77A3A]"></div>
          
          <div className="w-full max-w-5xl relative">
            {/* Horizontal connecting line for the tree branches */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-[#C77A3A]"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-12">
              {LANES.map((lane, idx) => (
                <div key={lane.num} className="relative group">
                  {/* Vertical line connecting from the horizontal branch down to each card.
                      Since we have a 2-col grid, we can just use CSS to draw a line from the top. */}
                  <div className="absolute -top-12 left-8 w-px h-12 bg-[#C77A3A]/40 group-hover:bg-[#C77A3A] transition-colors"></div>
                  
                  <div className="bg-[#1E2328]/50 border border-[#F6EFE4]/10 p-6 h-full hover:border-[#C77A3A] hover:bg-[#1E2328] transition-all flex gap-6 items-start">
                    <div className="text-[#C77A3A] text-xl font-bold" style={{ fontFamily: 'Cinzel' }}>
                      {lane.num}
                    </div>
                    <div>
                      <h4 className="text-lg mb-2 text-[#F6EFE4]" style={{ fontFamily: 'Cinzel' }}>{lane.title}</h4>
                      <p className="text-[#F6EFE4]/60 text-sm leading-relaxed">{lane.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative w-full max-w-[1280px] mx-auto px-6 md:px-12 py-24 text-center border-t border-[#F6EFE4]/10 mt-12">
        <h2 className="text-3xl md:text-4xl mb-8" style={{ fontFamily: 'Cinzel' }}>
          Ready to find the path?
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="/submit" className="bg-[#C77A3A] text-[#F6EFE4] hover:bg-[#A6632D] transition-colors uppercase tracking-[0.2em] text-[10px] font-bold py-4 px-8 flex items-center gap-3 w-full sm:w-auto justify-center" style={{ fontFamily: 'Montserrat' }}>
            Submit a Property <ArrowRight size={14} />
          </a>
          <a href="/strategy-lab" className="border border-[#F6EFE4]/30 text-[#F6EFE4] hover:bg-[#F6EFE4]/10 transition-colors uppercase tracking-[0.2em] text-[10px] font-bold py-4 px-8 w-full sm:w-auto justify-center" style={{ fontFamily: 'Montserrat' }}>
            Open Strategy Lab
          </a>
        </div>
      </section>

    </div>
  );
}
