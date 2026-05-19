import React, { useState } from "react";
import "./_group.css";

export function Monograph() {
  const [mode, setMode] = useState<"quick" | "full">("quick");

  const pathSteps = [
    "PROPERTY",
    "SITUATION",
    "NUMBERS",
    "COMPS",
    "RISK",
    "STRATEGY PATHS",
    "EXIT",
    "NEXT STEP",
  ];

  return (
    <div
      className="min-h-screen flex justify-center pb-32 selection:bg-[var(--pd-copper-light)]"
      style={{
        backgroundColor: "var(--pd-cream)",
        color: "var(--pd-navy)",
        fontFamily: "var(--pd-font-sans)",
      }}
    >
      <div className="w-full max-w-[1280px] flex px-8 pt-8 md:pt-16">
        
        {/* Left Gutter: Marginalia Path Map */}
        <aside className="hidden md:flex w-48 flex-shrink-0 flex-col border-r border-[var(--pd-rule)] pr-8 mr-12 relative">
          <div className="sticky top-16">
            <div className="mb-12">
              <div
                className="leading-none"
                style={{
                  fontFamily: "var(--pd-font-display)",
                  fontSize: "14px",
                  letterSpacing: "0.06em",
                }}
              >
                PEGASUS
                <br />
                DREAMSCAPES
              </div>
              <div
                className="text-[8px] tracking-[0.25em] mt-3 uppercase font-semibold"
                style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
              >
                The Deal Architect
              </div>
            </div>

            <nav className="flex flex-col gap-6">
              {pathSteps.map((step, i) => (
                <div key={step} className="flex items-start gap-3">
                  <span
                    className="text-[9px] font-semibold leading-none pt-[2px]"
                    style={{
                      fontFamily: "var(--pd-font-supporting)",
                      color: i === 0 ? "var(--pd-copper)" : "var(--pd-rule)",
                    }}
                  >
                    §0{i + 1}
                  </span>
                  <span
                    className="text-[9px] tracking-[0.15em] font-semibold uppercase leading-tight"
                    style={{
                      fontFamily: "var(--pd-font-supporting)",
                      color: i === 0 ? "var(--pd-navy)" : "var(--pd-muted)",
                    }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </nav>
            
            <div className="mt-32">
              <span
                className="text-[9px] tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
              >
                PAGE 01 OF 08
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-[800px] pt-2">
          
          {/* Top Brand Frame CTA */}
          <div className="flex justify-end mb-16">
            <button
              className="text-[9px] tracking-[0.15em] uppercase font-bold px-5 py-3 border border-[var(--pd-copper)] transition-colors hover:bg-[var(--pd-navy)] hover:text-[var(--pd-cream)] hover:border-[var(--pd-navy)]"
              style={{
                fontFamily: "var(--pd-font-supporting)",
                color: "var(--pd-copper)",
              }}
            >
              Start a Strategy Review
            </button>
          </div>

          {/* Chapter Header */}
          <div className="flex justify-center mb-16">
            <h2
              className="text-[11px] tracking-[0.3em] uppercase font-semibold"
              style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
            >
              STRATEGY LAB — CHAPTER I
            </h2>
          </div>

          {/* Epigraph */}
          <div className="py-12 border-y border-[var(--pd-rule)] mb-16 text-center px-12">
            <p
              className="text-4xl md:text-5xl italic"
              style={{
                fontFamily: "var(--pd-font-serif)",
                color: "var(--pd-copper)",
                letterSpacing: "-0.01em",
                lineHeight: 1.2
              }}
            >
              "One address in. Every angle out."
            </p>
          </div>

          {/* Body Lead (Drop cap + justified columns) */}
          <div className="mb-24 relative">
            <div className="columns-1 md:columns-2 gap-12 text-sm leading-[1.9] text-justify" style={{ color: "var(--pd-navy)" }}>
              <p>
                <span
                  className="float-left text-[5.5rem] leading-[0.7] pt-2 pr-3 pb-0 italic font-medium"
                  style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-copper)" }}
                >
                  R
                </span>
                un the property through the Pegasus lens. Lane fit, risk register, scenario stress, and a recommended next step. Preliminary, transparent, and editable. The inputs shape the architectural output, determining the contours of viability. We assess each dimension through rigorous structural filters.
              </p>
              <p>
                To proceed, establish the foundational attributes of the asset. The values you input below initiate our synthesis. The Strategy Lab converts raw figures into a comprehensive, multi-path scenario map. 
              </p>
            </div>
            
            <div className="flex justify-center items-center gap-6 mt-16 border-t border-[var(--pd-rule)] pt-12">
              <button
                className="text-[10px] tracking-[0.15em] uppercase px-8 py-3 font-semibold transition-colors"
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

            <div className="mt-12 text-center max-w-lg mx-auto">
              <p
                className="text-[9px] leading-[1.7] uppercase tracking-wider"
                style={{ color: "var(--pd-muted)", fontFamily: "var(--pd-font-supporting)" }}
              >
                Preliminary analysis only. Human review required before any offer, strategy release, or execution decision. Outputs are illustrative and do not constitute an offer of guaranteed returns or principal protection.
              </p>
            </div>
          </div>

          {/* Form Sheet Section */}
          <section className="mt-24 pt-16 border-t-[3px] border-[var(--pd-navy)] relative">
            
            {/* Print Tabs */}
            <div className="absolute top-[-30px] right-0 flex gap-6">
              <button
                onClick={() => setMode("quick")}
                className="text-[9px] tracking-[0.2em] font-bold uppercase relative pb-1 transition-colors"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  color: mode === "quick" ? "var(--pd-navy)" : "var(--pd-muted)",
                }}
              >
                Quick Read
                {mode === "quick" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--pd-copper)]" />
                )}
              </button>
              <button
                onClick={() => setMode("full")}
                className="text-[9px] tracking-[0.2em] font-bold uppercase relative pb-1 transition-colors"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  color: mode === "full" ? "var(--pd-navy)" : "var(--pd-muted)",
                }}
              >
                Full Path
                {mode === "full" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--pd-copper)]" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-12">
              
              {/* Form Inputs Area */}
              <div>
                {/* Section I */}
                <div className="mb-12">
                  <h3
                    className="text-lg italic mb-6 border-b border-[var(--pd-rule)] pb-3"
                    style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-navy)" }}
                  >
                    1.0 Property Identity
                  </h3>
                  <div className="space-y-4">
                    <FormSheetField label="Address" placeholder="Enter Full Address..." full />
                    <div className="grid grid-cols-2 gap-4">
                      <FormSheetField label="Beds" placeholder="--" />
                      <FormSheetField label="Baths" placeholder="--" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormSheetField label="Sq. Ft." placeholder="--" />
                      <FormSheetField label="Year Built" placeholder="--" />
                    </div>
                    <div className="border border-[var(--pd-rule)] p-3">
                      <label
                        className="block text-[8px] tracking-[0.2em] uppercase font-semibold mb-2"
                        style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
                      >
                        Condition
                      </label>
                      <select
                        className="w-full bg-transparent text-sm focus:outline-none appearance-none rounded-none cursor-pointer"
                        style={{ color: "var(--pd-navy)", fontFamily: "var(--pd-font-serif)" }}
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

                {/* Section II */}
                <div>
                  <h3
                    className="text-lg italic mb-6 border-b border-[var(--pd-rule)] pb-3"
                    style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-navy)" }}
                  >
                    2.0 Baseline Numbers
                  </h3>
                  <div className="space-y-4">
                    <FormSheetField label="Asking Price" placeholder="$" full />
                    <FormSheetField label="Estimated Rehab" placeholder="$" full />
                    <FormSheetField label="Projected ARV" placeholder="$" full />
                  </div>
                </div>
              </div>

              {/* Reader's Note Callout */}
              <div>
                <aside 
                  className="bg-[var(--pd-cream-warm)] p-6 relative border border-[var(--pd-rule)]"
                >
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--pd-copper)]" />
                  
                  <div
                    className="text-[9px] tracking-[0.2em] mb-4 uppercase font-bold border-b border-[var(--pd-rule)] pb-3"
                    style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
                  >
                    Reader's Note
                  </div>
                  
                  <h4
                    className="text-2xl mb-4 italic"
                    style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-copper)" }}
                  >
                    Pegasus Verdict
                  </h4>
                  
                  <div className="text-sm leading-relaxed" style={{ color: "var(--pd-navy)", fontFamily: "var(--pd-font-sans)" }}>
                    <p className="mb-4">
                      Inputs currently insufficient for strategy projection.
                    </p>
                    <p className="text-xs text-[var(--pd-muted)] leading-relaxed italic">
                      Please provide Asking Price, Rehab Estimate, and Target ARV to generate preliminary lane fit and return metrics. Additional fields will refine the risk register.
                    </p>
                  </div>
                </aside>
              </div>

            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

function FormSheetField({ label, placeholder, full = false }: { label: string; placeholder: string; full?: boolean }) {
  return (
    <div className={`border border-[var(--pd-rule)] p-3 ${full ? 'col-span-2' : ''} bg-transparent transition-colors focus-within:border-[var(--pd-copper)] focus-within:bg-white/30`}>
      <label
        className="block text-[8px] tracking-[0.2em] uppercase font-semibold mb-1"
        style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
      >
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent text-sm focus:outline-none placeholder:opacity-30 rounded-none"
        style={{
          color: "var(--pd-navy)",
          fontFamily: "var(--pd-font-serif)",
          fontSize: "16px",
        }}
      />
    </div>
  );
}
