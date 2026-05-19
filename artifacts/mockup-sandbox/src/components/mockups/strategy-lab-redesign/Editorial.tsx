import React, { useState } from "react";
import { Info } from "lucide-react";
import "./_group.css";

export function Editorial() {
  const [mode, setMode] = useState<"quick" | "full">("quick");

  return (
    <div
      className="min-h-screen pb-32 flex flex-col items-center"
      style={{
        backgroundColor: "var(--pd-cream)",
        color: "var(--pd-navy)",
        fontFamily: "var(--pd-font-sans)",
      }}
    >
      {/* Newspaper-style Header Container */}
      <div className="w-full max-w-[1200px] px-8 pt-8">
        
        {/* Brand Frame */}
        <header className="flex items-end justify-between pb-6 border-b border-[var(--pd-navy)]">
          <div className="flex flex-col">
            <div
              className="leading-none"
              style={{
                fontFamily: "var(--pd-font-display)",
                fontSize: "22px",
                letterSpacing: "0.06em",
              }}
            >
              PEGASUS DREAMSCAPES
            </div>
            <div
              className="text-[10px] tracking-[0.25em] mt-2 uppercase font-semibold"
              style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
            >
              The Deal Architect
            </div>
          </div>
          <button
            className="text-[10px] tracking-[0.15em] uppercase font-bold px-4 py-2 border transition-colors hover:bg-[var(--pd-navy)] hover:text-[var(--pd-cream)]"
            style={{
              fontFamily: "var(--pd-font-supporting)",
              color: "var(--pd-copper)",
              borderColor: "var(--pd-copper)",
            }}
          >
            Start a Strategy Review
          </button>
        </header>

        {/* Hero Section - Editorial Layout */}
        <section className="py-12 flex flex-col md:flex-row gap-12 border-b border-[var(--pd-rule)]">
          <div className="flex-1 max-w-2xl pr-8">
            <h1
              className="text-6xl md:text-[5.5rem] leading-[0.9] mb-4"
              style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 400, letterSpacing: "-0.03em" }}
            >
              Strategy Lab
            </h1>
            <p
              className="text-sm italic mb-8"
              style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-copper)" }}
            >
              One address in. Every angle out.
            </p>
            <p
              className="text-sm leading-[1.8] mb-8"
              style={{ color: "var(--pd-navy)", fontFamily: "var(--pd-font-sans)", maxWidth: "480px" }}
            >
              Run the property through the Pegasus lens. Lane fit, risk register, scenario stress, and a recommended next step. Preliminary, transparent, and editable.
            </p>
            <div className="flex items-center gap-6">
              <button
                className="text-[10px] tracking-[0.15em] uppercase px-5 py-3 font-semibold transition-colors"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  backgroundColor: "var(--pd-navy)",
                  color: "var(--pd-cream)",
                }}
              >
                Start an Analysis
              </button>
              <button
                className="text-[10px] tracking-[0.15em] uppercase font-semibold transition-colors hover:text-[var(--pd-copper)]"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  color: "var(--pd-muted)",
                }}
              >
                View Example Snapshot
              </button>
            </div>
          </div>
          
          <div className="md:w-64 flex flex-col justify-end">
            <div className="border-l border-[var(--pd-rule)] pl-6 pb-2">
              <p
                className="text-[10px] leading-[1.6]"
                style={{ color: "var(--pd-muted)", fontFamily: "var(--pd-font-sans)" }}
              >
                Preliminary analysis only. Human review required before any offer, strategy release, or execution decision. Outputs are illustrative and do not constitute an offer of guaranteed returns or principal protection.
              </p>
            </div>
          </div>
        </section>

        {/* Path Map - Table of Contents style */}
        <nav className="py-4 border-b border-[var(--pd-navy)] flex flex-wrap justify-between items-center gap-y-2">
          {["PROPERTY", "SITUATION", "NUMBERS", "COMPS", "RISK", "STRATEGY PATHS", "EXIT", "NEXT STEP"].map(
            (step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span 
                  className="text-[10px] tracking-[0.15em] font-semibold"
                  style={{ 
                    fontFamily: "var(--pd-font-supporting)", 
                    color: i === 0 ? "var(--pd-navy)" : "var(--pd-muted)" 
                  }}
                >
                  {i === 0 ? <span className="mr-2 text-[var(--pd-copper)]">I.</span> : null}
                  {step}
                </span>
                {i < 7 && <span className="text-[var(--pd-rule)]">|</span>}
              </div>
            )
          )}
        </nav>

        {/* Lab Row Area */}
        <main className="pt-10 grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Main Inputs Column (Col 1-8) */}
          <div className="md:col-span-8">
            
            {/* Mode Toggle (Print Tabs) */}
            <div className="flex gap-8 mb-10 border-b border-[var(--pd-rule)]">
              <button
                onClick={() => setMode("quick")}
                className="pb-3 text-[10px] tracking-[0.15em] font-bold uppercase relative"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  color: mode === "quick" ? "var(--pd-navy)" : "var(--pd-muted)",
                }}
              >
                Quick Read
                {mode === "quick" && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--pd-copper)]" />
                )}
              </button>
              <button
                onClick={() => setMode("full")}
                className="pb-3 text-[10px] tracking-[0.15em] font-bold uppercase relative"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  color: mode === "full" ? "var(--pd-navy)" : "var(--pd-muted)",
                }}
              >
                Full Path
                {mode === "full" && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--pd-copper)]" />
                )}
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              
              {/* Property Identity */}
              <div>
                <h2
                  className="text-2xl mb-8"
                  style={{ fontFamily: "var(--pd-font-serif)", letterSpacing: "-0.01em" }}
                >
                  Property Identity
                </h2>
                <div className="space-y-6">
                  <EditorialField label="Address" placeholder="123 Example St, City, ST" />
                  
                  <div className="grid grid-cols-2 gap-6">
                    <EditorialField label="Beds" placeholder="e.g. 3" />
                    <EditorialField label="Baths" placeholder="e.g. 2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <EditorialField label="Sqft" placeholder="e.g. 1500" />
                    <EditorialField label="Year Built" placeholder="e.g. 1990" />
                  </div>
                  
                  <div>
                    <label
                      className="block text-[9px] tracking-[0.15em] uppercase font-bold mb-2"
                      style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
                    >
                      Condition
                    </label>
                    <select
                      className="w-full bg-transparent border-b border-[var(--pd-rule)] py-2 text-sm focus:outline-none focus:border-[var(--pd-copper)] appearance-none rounded-none"
                      style={{ color: "var(--pd-navy)", fontFamily: "var(--pd-font-serif)", fontSize: "16px" }}
                    >
                      <option>Light Cosmetic</option>
                      <option>Moderate Rehab</option>
                      <option>Heavy Rehab</option>
                      <option>Gut</option>
                      <option>Turnkey</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Numbers */}
              <div>
                <h2
                  className="text-2xl mb-8"
                  style={{ fontFamily: "var(--pd-font-serif)", letterSpacing: "-0.01em" }}
                >
                  Numbers
                </h2>
                <div className="space-y-6">
                  <EditorialField label="Asking Price" placeholder="$0" />
                  <EditorialField label="Estimated Rehab" placeholder="$0" />
                  <EditorialField label="Projected ARV" placeholder="$0" />
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Verdict Callout Box (Col 9-12) */}
          <div className="md:col-span-4">
            <aside
              className="p-8 h-full"
              style={{
                borderTop: "3px solid var(--pd-navy)",
                borderBottom: "1px solid var(--pd-navy)",
                backgroundColor: "transparent",
              }}
            >
              <div
                className="text-[9px] tracking-[0.2em] mb-4 uppercase font-bold"
                style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-copper)" }}
              >
                Executive Summary
              </div>
              <h3
                className="text-3xl mb-6"
                style={{ fontFamily: "var(--pd-font-serif)", lineHeight: 1.05, letterSpacing: "-0.01em" }}
              >
                Pegasus Verdict
              </h3>
              
              <div className="prose prose-sm prose-p:leading-relaxed" style={{ color: "var(--pd-navy)" }}>
                <p className="mb-6 font-medium">
                  Inputs insufficient for strategy projection. Provide Asking Price, Rehab Estimate, and Target ARV to generate preliminary lane fit and return metrics.
                </p>
                
                <div 
                  className="mt-8 pt-6 border-t border-[var(--pd-rule)]"
                >
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: "var(--pd-copper)" }} />
                    <p className="text-[11px] leading-[1.6]" style={{ color: "var(--pd-muted)" }}>
                      The lab currently requires 3 primary inputs to build the initial situation matrix. Additional fields will refine the risk register.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

        </main>
      </div>
    </div>
  );
}

function EditorialField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label
        className="block text-[9px] tracking-[0.15em] uppercase font-bold mb-2"
        style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
      >
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent border-b py-2 focus:outline-none placeholder:opacity-30 rounded-none transition-colors"
        style={{
          borderColor: "var(--pd-rule)",
          color: "var(--pd-navy)",
          fontFamily: "var(--pd-font-serif)",
          fontSize: "16px",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--pd-copper)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--pd-rule)")}
      />
    </div>
  );
}
