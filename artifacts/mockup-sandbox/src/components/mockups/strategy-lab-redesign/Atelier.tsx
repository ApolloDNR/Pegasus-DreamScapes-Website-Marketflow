import React, { useState } from "react";
import "./_group.css";

export function Atelier() {
  const [mode, setMode] = useState<"quick" | "full">("quick");

  return (
    <div
      className="min-h-screen pb-40 flex flex-col items-center"
      style={{
        backgroundColor: "var(--pd-cream)",
        color: "var(--pd-navy)",
        fontFamily: "var(--pd-font-sans)",
      }}
    >
      {/* Brand Frame */}
      <header className="w-full px-8 py-8 flex items-start justify-between">
        <div className="flex flex-col">
          <div
            className="leading-none tracking-[0.08em]"
            style={{
              fontFamily: "var(--pd-font-display)",
              fontSize: "14px",
            }}
          >
            PEGASUS DREAMSCAPES
          </div>
          <div
            className="text-[9px] tracking-[0.2em] mt-2 uppercase"
            style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
          >
            The Deal Architect
          </div>
        </div>
        <button
          className="text-[9px] tracking-[0.15em] uppercase px-5 py-2.5 border transition-colors hover:bg-[var(--pd-navy)] hover:text-[var(--pd-cream)]"
          style={{
            fontFamily: "var(--pd-font-supporting)",
            color: "var(--pd-navy)",
            borderColor: "var(--pd-navy)",
          }}
        >
          Start a Strategy Review
        </button>
      </header>

      {/* Magazine Cover Statement (Hero) */}
      <section className="flex-1 w-full max-w-[1200px] flex flex-col items-center justify-center pt-32 pb-48 px-8 text-center">
        <div 
          className="text-[9px] tracking-[0.25em] uppercase font-medium mb-16"
          style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
        >
          Pegasus Dreamscapes — Vol. I, Strategy Lab
        </div>
        
        <h1 
          className="italic leading-none mb-16 w-full"
          style={{ 
            fontFamily: "var(--pd-font-serif)", 
            color: "var(--pd-copper)",
            fontSize: "clamp(72px, 9vw, 120px)",
            fontWeight: 400,
          }}
        >
          One address in.<br/>Every angle out.
        </h1>
        
        <div className="w-16 h-px mb-16" style={{ backgroundColor: "var(--pd-copper)" }} />
        
        <p 
          className="text-[13px] leading-[1.8] mb-16 max-w-[500px] text-center"
          style={{ fontFamily: "var(--pd-font-sans)", color: "var(--pd-navy)" }}
        >
          Run the property through the Pegasus lens. Lane fit, risk register, scenario stress, and a recommended next step. Preliminary, transparent, and editable.
        </p>
        
        <div className="flex items-center justify-center gap-6 mb-32">
          <button
            className="text-[9px] tracking-[0.15em] uppercase px-8 py-3.5 transition-colors border hover:bg-[var(--pd-navy)] hover:text-[var(--pd-cream)]"
            style={{
              fontFamily: "var(--pd-font-supporting)",
              color: "var(--pd-navy)",
              borderColor: "var(--pd-navy)",
            }}
          >
            Start an Analysis
          </button>
          <button
            className="text-[9px] tracking-[0.15em] uppercase px-8 py-3.5 transition-colors border hover:bg-[var(--pd-navy)] hover:text-[var(--pd-cream)]"
            style={{
              fontFamily: "var(--pd-font-supporting)",
              color: "var(--pd-navy)",
              borderColor: "var(--pd-rule)",
            }}
          >
            View Example Snapshot
          </button>
        </div>

        <p 
          className="text-[10px] leading-[1.6] max-w-3xl text-center"
          style={{ color: "var(--pd-muted)", fontFamily: "var(--pd-font-sans)" }}
        >
          Preliminary analysis only. Human review required before any offer, strategy release, or execution decision. Outputs are illustrative and do not constitute an offer of guaranteed returns or principal protection.
        </p>
      </section>

      {/* Path Map & Lab Interface */}
      <main className="w-full max-w-[1400px] px-12">
        {/* Path Map */}
        <div className="relative mb-32 pt-8">
          {/* Hairline */}
          <div className="absolute top-[36px] left-12 right-12 h-px" style={{ backgroundColor: "var(--pd-rule)" }} />
          
          <div className="relative flex justify-between items-start">
            {["PROPERTY", "SITUATION", "NUMBERS", "COMPS", "RISK", "STRATEGY PATHS", "EXIT", "NEXT STEP"].map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-5 relative z-10 w-24">
                <div 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: "var(--pd-copper)" }} 
                />
                <span 
                  className="text-[8px] tracking-[0.2em] uppercase text-center"
                  style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-24">
          <div 
            className="text-[10px] tracking-[0.2em] uppercase flex items-center gap-5"
            style={{ fontFamily: "var(--pd-font-supporting)" }}
          >
            <button 
              onClick={() => setMode("quick")}
              className="pb-1 transition-colors relative"
              style={{ color: mode === "quick" ? "var(--pd-navy)" : "var(--pd-muted)" }}
            >
              Quick Read
              {mode === "quick" && <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--pd-copper)]" />}
            </button>
            <span style={{ color: "var(--pd-rule)" }}>/</span>
            <button 
              onClick={() => setMode("full")}
              className="pb-1 transition-colors relative"
              style={{ color: mode === "full" ? "var(--pd-navy)" : "var(--pd-muted)" }}
            >
              Full Path
              {mode === "full" && <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--pd-copper)]" />}
            </button>
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          
          {/* Col 1: Property Identity */}
          <div className="space-y-16">
            <h2 className="text-[10px] tracking-[0.2em] uppercase border-b pb-5" style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)", borderColor: "var(--pd-rule)" }}>
              Property Identity
            </h2>
            <div className="space-y-10">
              <AtelierField label="Address" placeholder="" />
              <div className="grid grid-cols-2 gap-10">
                <AtelierField label="Beds" placeholder="" />
                <AtelierField label="Baths" placeholder="" />
              </div>
              <div className="grid grid-cols-2 gap-10">
                <AtelierField label="Sqft" placeholder="" />
                <AtelierField label="Year Built" placeholder="" />
              </div>
              <AtelierField label="Condition" placeholder="" />
            </div>
          </div>

          {/* Col 2: Numbers */}
          <div className="space-y-16">
            <h2 className="text-[10px] tracking-[0.2em] uppercase border-b pb-5" style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)", borderColor: "var(--pd-rule)" }}>
              Numbers
            </h2>
            <div className="space-y-10">
              <AtelierField label="Asking Price" placeholder="" />
              <AtelierField label="Rehab" placeholder="" />
              <AtelierField label="ARV" placeholder="" />
            </div>
          </div>

          {/* Col 3: Verdict */}
          <div>
            <div 
              className="p-12 h-full flex flex-col"
              style={{ border: "1px solid var(--pd-rule)" }}
            >
              <h3 
                className="text-[11px] tracking-[0.1em] mb-6 uppercase"
                style={{ fontFamily: "var(--pd-font-display)", color: "var(--pd-navy)" }}
              >
                Pegasus Verdict
              </h3>
              
              <div className="w-full h-px mb-8" style={{ backgroundColor: "var(--pd-copper)" }} />
              
              <p 
                className="text-sm italic leading-relaxed"
                style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-muted)" }}
              >
                Awaiting sufficient inputs to project a strategy path. Provide asking price, estimated rehab, and target ARV to generate preliminary fit and return metrics.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function AtelierField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label
        className="block text-[8px] tracking-[0.2em] uppercase mb-3"
        style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
      >
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent border-b pb-2 focus:outline-none transition-colors"
        style={{
          borderColor: "var(--pd-rule)",
          color: "var(--pd-navy)",
          fontFamily: "var(--pd-font-serif)",
          fontSize: "18px",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--pd-copper)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--pd-rule)")}
      />
    </div>
  );
}
