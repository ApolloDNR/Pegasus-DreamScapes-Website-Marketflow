import React from "react";
import { ArrowRight, Calculator, FileText, Search, Compass, CheckCircle2 } from "lucide-react";

export function Diagnostic() {
  const currentDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#F6EFE4] text-[#0D1B2D] selection:bg-[#0D1B2D] selection:text-[#F6EFE4] overflow-x-hidden">
      <div dangerouslySetInnerHTML={{
        __html: `
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500&family=Montserrat:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
        `
      }} />

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-24" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
        
        {/* Dossier Header */}
        <header className="border-b-2 border-[#0D1B2D] pb-8 mb-16 relative">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="flex-1">
              <h1 className="text-5xl md:text-7xl font-bold leading-none mb-6" style={{ fontFamily: '"Cinzel", serif' }}>
                Every property gets a path.<br/>
                <span className="italic font-normal text-[#C77A3A]">Not every property gets an offer.</span>
              </h1>
              <p className="text-2xl md:text-3xl font-semibold mb-4 text-[#0D1B2D]/80">
                Bring us the property. We'll help find the path.
              </p>
              <p className="text-xl leading-relaxed max-w-3xl">
                Most groups want the property that fits their single playbook. Pegasus is built differently. We review the situation, then match it to the lane that fits, whether that lane is ours or someone else's.
              </p>
            </div>
            
            <div className="shrink-0 flex flex-col gap-2 text-right uppercase tracking-[0.2em] text-xs font-bold border border-[#0D1B2D]/20 p-4 bg-[#F6EFE4]" style={{ fontFamily: '"Space Mono", monospace' }}>
              <div className="flex justify-between gap-8 border-b border-[#0D1B2D]/10 pb-2">
                <span className="text-[#0D1B2D]/50">DOC REF:</span>
                <span>PEG-DIAG-01</span>
              </div>
              <div className="flex justify-between gap-8 border-b border-[#0D1B2D]/10 py-2">
                <span className="text-[#0D1B2D]/50">DATE:</span>
                <span>{currentDate}</span>
              </div>
              <div className="flex justify-between gap-8 py-2">
                <span className="text-[#0D1B2D]/50">REVIEWED BY:</span>
                <span>A. DURAN</span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#0D1B2D] text-center text-[10px] text-[#C77A3A]">
                INTERNAL USE ONLY
              </div>
            </div>
          </div>

          {/* Stamp */}
          <div className="absolute top-0 right-[30%] opacity-20 rotate-[-15deg] pointer-events-none">
            <div className="border-4 border-[#C77A3A] rounded-full w-32 h-32 flex items-center justify-center">
              <span className="text-[#C77A3A] font-bold text-lg uppercase tracking-widest text-center" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                Structural<br/>Review
              </span>
            </div>
          </div>
        </header>

        {/* Phase I: Routing Mechanism */}
        <section className="mb-20 relative">
          <div className="flex items-baseline gap-4 border-b border-[#C77A3A] pb-4 mb-8">
            <span className="text-4xl text-[#C77A3A]" style={{ fontFamily: '"Cinzel", serif' }}>I.</span>
            <h2 className="text-2xl uppercase tracking-[0.3em] font-bold" style={{ fontFamily: '"Montserrat", sans-serif' }}>Routing Mechanism</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Submit the situation",
                desc: "Address, condition, what you're trying to solve. Two minutes.",
                icon: FileText
              },
              {
                step: "02",
                title: "Apollo reads it structurally",
                desc: "Comps, condition, capital stack, timeline, occupancy, exposure. The Pegasus lens.",
                icon: Search
              },
              {
                step: "03",
                title: "We name the lane",
                desc: "One of the ten lanes below, including a routed referral if Pegasus isn't the right fit.",
                icon: Compass
              }
            ].map((step, i) => (
              <div key={i} className="relative p-6 border border-[#0D1B2D]/10 bg-white/40">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <step.icon size={48} />
                </div>
                <div className="text-[#C77A3A] font-bold text-sm uppercase tracking-widest mb-4" style={{ fontFamily: '"Space Mono", monospace' }}>
                  STEP {step.step}
                </div>
                <h3 className="text-xl font-bold mb-3 leading-tight">{step.title}</h3>
                <p className="text-lg leading-snug text-[#0D1B2D]/70">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Phase II: The Outcome Matrix */}
        <section className="mb-24">
          <div className="flex items-baseline gap-4 border-b border-[#C77A3A] pb-4 mb-8">
            <span className="text-4xl text-[#C77A3A]" style={{ fontFamily: '"Cinzel", serif' }}>II.</span>
            <h2 className="text-2xl uppercase tracking-[0.3em] font-bold" style={{ fontFamily: '"Montserrat", sans-serif' }}>Outcome Matrix</h2>
          </div>

          <div className="border border-[#0D1B2D]">
            <div className="grid grid-cols-12 border-b-2 border-[#0D1B2D] bg-[#0D1B2D] text-[#F6EFE4] uppercase tracking-[0.2em] text-[10px] font-bold py-3 px-4" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              <div className="col-span-2 md:col-span-1">CODE</div>
              <div className="col-span-10 md:col-span-3">DESIGNATION</div>
              <div className="col-span-12 md:col-span-8 hidden md:block pl-4">STRUCTURAL DEFINITION</div>
            </div>

            <div className="divide-y divide-[#0D1B2D]/20">
              {[
                { code: "01", title: "Direct acquisition", desc: "Pegasus buys outright at a structurally honest number.", category: "A-ACQ" },
                { code: "02", title: "Creative finance", desc: "Seller-carry, subject-to, lease-option, non-conforming structures.", category: "A-FIN" },
                { code: "03", title: "Joint venture / co-GP", desc: "Capital + operational discipline brought to an aligned operator.", category: "B-PTN" },
                { code: "04", title: "Wholesale assignment", desc: "Route the deal to another operator in our network.", category: "C-RUT" },
                { code: "05", title: "Listing through KW", desc: "Clean MLS listing via Apollo's Keller Williams East Bay license.", category: "D-MKT" },
                { code: "06", title: "Buyer representation", desc: "Owner-occupant and investor-side buyer rep, same underwriting lens.", category: "D-REP" },
                { code: "07", title: "BRRRR acquisition", desc: "Buy, rehab, rent, refinance, repeat. Held instead of resold.", category: "E-HLD" },
                { code: "08", title: "ADU upside", desc: "Detached/attached ADUs on East Bay residential lots. Design, permit, build.", category: "E-DEV" },
                { code: "09", title: "Value-add rehab", desc: "Heavy cosmetic + structural rehab to highest defensible value.", category: "E-REV" },
                { code: "10", title: "Routed referral", desc: "If the right path is outside Pegasus, route owner to a vetted operator.", category: "F-REF" },
              ].map((lane, i) => (
                <div key={i} className="grid grid-cols-12 group hover:bg-[#0D1B2D]/5 transition-colors">
                  <div className="col-span-2 md:col-span-1 p-4 border-r border-[#0D1B2D]/10 flex items-center justify-center font-bold text-lg text-[#C77A3A]" style={{ fontFamily: '"Space Mono", monospace' }}>
                    {lane.code}
                  </div>
                  <div className="col-span-10 md:col-span-3 p-4 border-r border-[#0D1B2D]/10 flex flex-col justify-center">
                    <span className="font-bold text-lg leading-tight">{lane.title}</span>
                    <span className="text-[9px] uppercase tracking-widest text-[#0D1B2D]/40 mt-1 md:hidden" style={{ fontFamily: '"Space Mono", monospace' }}>
                      {lane.category}
                    </span>
                  </div>
                  <div className="col-span-12 md:col-span-7 p-4 flex items-center md:pl-8 text-lg text-[#0D1B2D]/80">
                    {lane.desc}
                  </div>
                  <div className="hidden md:flex col-span-1 p-4 items-center justify-end text-[10px] uppercase tracking-widest text-[#0D1B2D]/40 font-bold" style={{ fontFamily: '"Space Mono", monospace' }}>
                    {lane.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Phase III: Action Directive */}
        <section className="bg-[#0D1B2D] text-[#F6EFE4] p-12 md:p-16 relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#F6EFE4 1px, transparent 1px), linear-gradient(90deg, #F6EFE4 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ fontFamily: '"Cinzel", serif' }}>
              Initiate Diagnostic
            </h2>
            <p className="text-xl mb-12 text-[#F6EFE4]/80">
              Submit the property details to begin the structural review process. Alternatively, access the Strategy Lab to run preliminary calculations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="/submit" className="w-full sm:w-auto px-10 py-5 bg-[#C77A3A] text-white uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#A6612B] transition-colors flex items-center justify-center gap-3" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                Submit a Property <ArrowRight size={16} />
              </a>
              <a href="/strategy-lab" className="w-full sm:w-auto px-10 py-5 border border-[#C77A3A] text-[#C77A3A] uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#C77A3A]/10 transition-colors flex items-center justify-center gap-3" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                Open Strategy Lab <Calculator size={16} />
              </a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
