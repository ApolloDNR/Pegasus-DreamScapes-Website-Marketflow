import React, { useState } from "react";
import "./_group.css";
import { ArrowRight, Hexagon } from "lucide-react";

export function Architectural() {
  const [mode, setMode] = useState<"quick" | "full">("quick");

  // Path nodes
  const pathNodes = [
    { id: "property", label: "Property" },
    { id: "situation", label: "Situation" },
    { id: "numbers", label: "Numbers" },
    { id: "comps", label: "Comps" },
    { id: "risk", label: "Risk" },
    { id: "strategy", label: "Strategy Paths" },
    { id: "exit", label: "Exit" },
    { id: "next", label: "Next Step" },
  ];

  return (
    <div className="min-h-[1700px] bg-[var(--pd-cream)] text-[var(--pd-navy)] relative overflow-hidden font-[var(--pd-font-sans)] w-[1280px] mx-auto shadow-2xl">
      {/* Blueprint SVG Background motif */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="blueprint-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <pattern id="blueprint-grid-large" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#blueprint-grid)" />
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid-large)" />
        <circle cx="80%" cy="20%" r="300" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        <line x1="0" y1="60%" x2="100%" y2="40%" stroke="currentColor" strokeWidth="0.5" />
        <path d="M 90% 0 L 90% 100%" stroke="currentColor" strokeWidth="0.5" />
        <path d="M 0 80% L 100% 80%" stroke="currentColor" strokeWidth="0.5" />
      </svg>

      {/* Brand Frame */}
      <header className="px-12 py-10 flex justify-between items-start relative z-10">
        <div className="flex flex-col">
          <span className="font-[var(--pd-font-display)] text-xl tracking-widest leading-none">PEGASUS DREAMSCAPES</span>
          <span className="font-[var(--pd-font-supporting)] text-[10px] tracking-[0.25em] text-[var(--pd-muted)] mt-2">THE DEAL ARCHITECT</span>
        </div>
        <button className="flex items-center gap-2 border border-[var(--pd-copper)] text-[var(--pd-copper)] px-6 py-3 hover:bg-[var(--pd-copper)] hover:text-white transition-colors duration-500 font-[var(--pd-font-supporting)] text-[10px] uppercase tracking-widest">
          START A STRATEGY REVIEW
        </button>
      </header>

      {/* Main Grid */}
      <main className="px-12 relative z-10 grid grid-cols-12 gap-x-16 pb-32 pt-16">
        
        {/* Left Column: Vertical Path Map */}
        <div className="col-span-2 relative hidden lg:block">
          <div className="sticky top-20">
            <div className="text-[9px] uppercase tracking-[0.3em] font-[var(--pd-font-supporting)] text-[var(--pd-muted)] mb-12 ml-4 origin-bottom-left rotate-90 absolute -left-12 top-4 opacity-60">
              Pegasus Path Map
            </div>
            <div className="relative pl-8 pt-4">
              <div className="absolute left-0 top-6 bottom-4 w-px bg-[var(--pd-rule)]"></div>
              {pathNodes.map((node, i) => (
                <div key={node.id} className="relative mb-12 last:mb-0 group cursor-pointer">
                  <div className={`absolute -left-[35px] top-1 w-2.5 h-2.5 rounded-none border border-[var(--pd-copper)] bg-[var(--pd-cream)] transition-all rotate-45 ${i === 0 ? 'scale-125 bg-[var(--pd-copper)]' : 'group-hover:bg-[var(--pd-copper-light)]'}`}></div>
                  <span className={`font-[var(--pd-font-supporting)] text-[10px] uppercase tracking-[0.2em] transition-colors ${i === 0 ? 'text-[var(--pd-copper)] font-semibold' : 'text-[var(--pd-muted)] group-hover:text-[var(--pd-navy)]'}`}>
                    {node.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="col-span-12 lg:col-span-10 pt-4">
          
          {/* Hero */}
          <div className="mb-32 relative">
            <div className="absolute -left-16 top-4 text-[var(--pd-copper)] opacity-40 pointer-events-none">
              <svg width="40" height="40" viewBox="0 0 40 40"><path d="M0 0h10v10H0z" fill="currentColor"/><path d="M30 30h10v10H30z" fill="currentColor"/></svg>
            </div>
            
            <h2 className="font-[var(--pd-font-supporting)] text-[10px] uppercase tracking-[0.25em] text-[var(--pd-muted)] mb-8 flex items-center gap-4">
              <span className="w-12 h-px bg-[var(--pd-copper)] block"></span>
              Strategy Lab
            </h2>
            
            <h1 className="font-[var(--pd-font-serif)] text-7xl md:text-8xl lg:text-[110px] leading-[0.85] tracking-tight mb-16 text-[var(--pd-navy)] italic pb-4">
              <span className="text-[var(--pd-copper)]">One address in.</span><br/>
              <span className="ml-16">Every angle out.</span>
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-end">
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-px bg-[var(--pd-rule)]"></div>
                <p className="text-[var(--pd-navy)] text-base md:text-lg leading-[1.8] max-w-md pl-4">
                  Run the property through the Pegasus lens. Lane fit, risk register, scenario stress, and a recommended next step. Preliminary, transparent, and editable.
                </p>
                <div className="text-[9px] uppercase tracking-[0.15em] text-[var(--pd-muted)]/80 mt-8 leading-relaxed max-w-md pl-4">
                  Preliminary analysis only. Human review required before any offer, strategy release, or execution decision. Outputs are illustrative and do not constitute an offer of guaranteed returns or principal protection.
                </div>
              </div>
              <div className="flex flex-col gap-4 items-start pl-8">
                <button className="flex items-center justify-between gap-6 bg-[var(--pd-navy)] text-[var(--pd-cream)] px-8 py-5 font-[var(--pd-font-supporting)] text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--pd-charcoal)] transition-colors w-full md:w-auto min-w-[280px]">
                  <span>Start an Analysis</span>
                  <ArrowRight className="w-4 h-4 text-[var(--pd-copper)]" />
                </button>
                <button className="flex items-center justify-between gap-6 border border-[var(--pd-rule)] text-[var(--pd-navy)] px-8 py-5 font-[var(--pd-font-supporting)] text-[10px] uppercase tracking-[0.2em] hover:border-[var(--pd-copper)] transition-colors w-full md:w-auto min-w-[280px]">
                  <span>View Example Snapshot</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-16">
            <span className="w-4 h-4 border border-[var(--pd-navy)] rotate-45 block"></span>
            <hr className="flex-1 border-t border-[var(--pd-rule)]" />
            <span className="w-4 h-4 border border-[var(--pd-navy)] rotate-45 block"></span>
          </div>

          {/* Controls & Inputs Header */}
          <div className="flex justify-between items-end mb-16">
            <div className="font-[var(--pd-font-serif)] text-4xl italic text-[var(--pd-navy)]">Measured Inputs</div>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-1 bg-transparent border border-[var(--pd-rule)] p-1">
              <button 
                onClick={() => setMode("quick")}
                className={`px-6 py-2.5 font-[var(--pd-font-supporting)] text-[9px] uppercase tracking-[0.25em] transition-all ${mode === "quick" ? "bg-[var(--pd-navy)] text-[var(--pd-cream)]" : "text-[var(--pd-muted)] hover:text-[var(--pd-navy)]"}`}
              >
                Quick Read
              </button>
              <button 
                onClick={() => setMode("full")}
                className={`px-6 py-2.5 font-[var(--pd-font-supporting)] text-[9px] uppercase tracking-[0.25em] transition-all ${mode === "full" ? "bg-[var(--pd-navy)] text-[var(--pd-cream)]" : "text-[var(--pd-muted)] hover:text-[var(--pd-navy)]"}`}
              >
                Full Path
              </button>
            </div>
          </div>

          {/* First Row of Lab (Inputs + Verdict) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Input Columns */}
            <div className="col-span-1 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-16">
              
              {/* Property Identity */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-[var(--pd-rule)] pb-4 mb-8">
                  <span className="w-1.5 h-1.5 bg-[var(--pd-copper)] block rotate-45"></span>
                  <span className="font-[var(--pd-font-supporting)] text-[9px] uppercase tracking-[0.25em] font-semibold text-[var(--pd-navy)]">Property Identity</span>
                </div>
                
                <div className="space-y-6">
                  <div className="border-b border-[var(--pd-rule)] pb-2 group">
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-[var(--pd-muted)] mb-2 group-focus-within:text-[var(--pd-copper)] transition-colors">Address</label>
                    <input type="text" placeholder="123 Main St, City, ST" className="w-full bg-transparent border-none outline-none text-base placeholder:text-[var(--pd-muted)]/30 font-serif italic text-[var(--pd-navy)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="border-b border-[var(--pd-rule)] pb-2 group">
                      <label className="block text-[9px] uppercase tracking-[0.2em] text-[var(--pd-muted)] mb-2 group-focus-within:text-[var(--pd-copper)] transition-colors">Beds</label>
                      <input type="text" placeholder="--" className="w-full bg-transparent border-none outline-none text-base placeholder:text-[var(--pd-muted)]/30 font-serif italic text-[var(--pd-navy)]" />
                    </div>
                    <div className="border-b border-[var(--pd-rule)] pb-2 group">
                      <label className="block text-[9px] uppercase tracking-[0.2em] text-[var(--pd-muted)] mb-2 group-focus-within:text-[var(--pd-copper)] transition-colors">Baths</label>
                      <input type="text" placeholder="--" className="w-full bg-transparent border-none outline-none text-base placeholder:text-[var(--pd-muted)]/30 font-serif italic text-[var(--pd-navy)]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="border-b border-[var(--pd-rule)] pb-2 group">
                      <label className="block text-[9px] uppercase tracking-[0.2em] text-[var(--pd-muted)] mb-2 group-focus-within:text-[var(--pd-copper)] transition-colors">SqFt</label>
                      <input type="text" placeholder="--" className="w-full bg-transparent border-none outline-none text-base placeholder:text-[var(--pd-muted)]/30 font-serif italic text-[var(--pd-navy)]" />
                    </div>
                    <div className="border-b border-[var(--pd-rule)] pb-2 group">
                      <label className="block text-[9px] uppercase tracking-[0.2em] text-[var(--pd-muted)] mb-2 group-focus-within:text-[var(--pd-copper)] transition-colors">Year Built</label>
                      <input type="text" placeholder="--" className="w-full bg-transparent border-none outline-none text-base placeholder:text-[var(--pd-muted)]/30 font-serif italic text-[var(--pd-navy)]" />
                    </div>
                  </div>
                  <div className="border-b border-[var(--pd-rule)] pb-2 group">
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-[var(--pd-muted)] mb-2 group-focus-within:text-[var(--pd-copper)] transition-colors">Condition</label>
                    <select className="w-full bg-transparent border-none outline-none text-base text-[var(--pd-navy)] font-serif italic appearance-none cursor-pointer">
                      <option>Select condition...</option>
                      <option>Light cosmetic</option>
                      <option>Moderate rehab</option>
                      <option>Heavy rehab</option>
                      <option>Gut</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Acquisition + ARV */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-[var(--pd-rule)] pb-4 mb-8">
                  <span className="w-1.5 h-1.5 bg-[var(--pd-navy)] block rotate-45"></span>
                  <span className="font-[var(--pd-font-supporting)] text-[9px] uppercase tracking-[0.25em] font-semibold text-[var(--pd-navy)]">Numbers</span>
                </div>

                <div className="space-y-6">
                  <div className="border-b border-[var(--pd-rule)] pb-2 group relative">
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-[var(--pd-muted)] mb-2 group-focus-within:text-[var(--pd-copper)] transition-colors">Asking Price</label>
                    <div className="flex items-center">
                      <span className="text-[var(--pd-muted)] mr-2 font-serif italic text-base">$</span>
                      <input type="text" placeholder="0" className="w-full bg-transparent border-none outline-none text-base placeholder:text-[var(--pd-muted)]/30 font-serif italic text-[var(--pd-navy)]" />
                    </div>
                  </div>
                  <div className="border-b border-[var(--pd-rule)] pb-2 group relative">
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-[var(--pd-muted)] mb-2 group-focus-within:text-[var(--pd-copper)] transition-colors">Rehab Budget</label>
                    <div className="flex items-center">
                      <span className="text-[var(--pd-muted)] mr-2 font-serif italic text-base">$</span>
                      <input type="text" placeholder="0" className="w-full bg-transparent border-none outline-none text-base placeholder:text-[var(--pd-muted)]/30 font-serif italic text-[var(--pd-navy)]" />
                    </div>
                  </div>
                  <div className="border-b border-[var(--pd-copper)] pb-2 group relative mt-10">
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-[var(--pd-copper)] mb-2 font-semibold">ARV Estimate</label>
                    <div className="flex items-center">
                      <span className="text-[var(--pd-copper)] mr-2 font-serif italic text-base font-semibold">$</span>
                      <input type="text" placeholder="0" className="w-full bg-transparent border-none outline-none text-base placeholder:text-[var(--pd-copper)]/30 font-serif italic text-[var(--pd-copper)] font-semibold" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Verdict Card (Drafted Plan Card) */}
            <div className="col-span-1 lg:col-span-5 relative mt-4">
              <div className="absolute -top-3 -left-3 w-6 h-6 border-t border-l border-[var(--pd-navy)]"></div>
              <div className="absolute -top-3 -right-3 w-6 h-6 border-t border-r border-[var(--pd-navy)]"></div>
              <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b border-l border-[var(--pd-navy)]"></div>
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b border-r border-[var(--pd-navy)]"></div>
              
              {/* Draftsman marks */}
              <div className="absolute top-1/2 -left-8 w-6 h-px bg-[var(--pd-rule)]"></div>
              <div className="absolute top-1/2 -right-8 w-6 h-px bg-[var(--pd-rule)]"></div>
              <div className="absolute -top-8 left-1/2 w-px h-6 bg-[var(--pd-rule)]"></div>
              <div className="absolute -bottom-8 left-1/2 w-px h-6 bg-[var(--pd-rule)]"></div>
              
              <div className="bg-[var(--pd-cream-warm)]/50 border border-[var(--pd-rule)] p-12 relative min-h-[460px] flex flex-col items-center justify-center text-center">
                {/* Stamp overlay */}
                <div className="absolute bottom-6 right-6 w-20 h-20 border-2 border-[var(--pd-copper)]/30 rounded-full flex items-center justify-center rotate-[-15deg] pointer-events-none">
                  <div className="absolute inset-1 border border-[var(--pd-copper)]/20 rounded-full"></div>
                  <span className="font-[var(--pd-font-display)] text-[9px] text-[var(--pd-copper)]/60 text-center leading-tight">PEGASUS<br/>REVIEW</span>
                </div>

                <div className="w-16 h-16 border border-[var(--pd-rule)] flex items-center justify-center mb-8 rotate-45 bg-[var(--pd-cream)]">
                  <Hexagon className="w-8 h-8 text-[var(--pd-muted)] stroke-1 -rotate-45" />
                </div>
                
                <h3 className="font-[var(--pd-font-serif)] text-3xl italic text-[var(--pd-navy)] mb-4">Pegasus Verdict</h3>
                <p className="text-[10px] uppercase tracking-[0.25em] font-[var(--pd-font-supporting)] text-[var(--pd-muted)] max-w-[220px] leading-[1.8]">
                  Provide property and financial details to generate a strategic plan.
                </p>
                
                <div className="mt-12 w-full max-w-[200px] flex flex-col items-center gap-3">
                  <div className="h-px bg-[var(--pd-rule)] w-full"></div>
                  <div className="h-px bg-[var(--pd-rule)] w-3/4"></div>
                  <div className="h-px bg-[var(--pd-rule)] w-1/2"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
