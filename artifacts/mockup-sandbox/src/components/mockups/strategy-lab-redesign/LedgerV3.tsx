import React, { useState } from "react";
import "./_group.css";

const HatchPattern = () => (
  <svg width="0" height="0">
    <defs>
      <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="8" height="8">
        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="var(--pd-copper)" strokeWidth="1" strokeOpacity="0.12" />
      </pattern>
    </defs>
  </svg>
);

const Crosshair = ({ className }: { className?: string }) => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 0V8M0 4H8" stroke="var(--pd-navy)" strokeWidth="0.5" />
  </svg>
);

const Seal = () => (
  <svg width="70" height="70" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" stroke="var(--pd-copper)" strokeWidth="0.5" />
    <circle cx="50" cy="50" r="42" stroke="var(--pd-copper)" strokeWidth="0.5" />
    <path id="curve-text" d="M 20 50 A 30 30 0 1 1 80 50 A 30 30 0 1 1 20 50" fill="transparent" />
    <text style={{ fontSize: '8px', fontFamily: 'var(--pd-font-supporting)', letterSpacing: '0.15em', fill: 'var(--pd-copper)' }}>
      <textPath href="#curve-text" startOffset="50%" textAnchor="middle">STRATEGY DESK • PEGASUS</textPath>
    </text>
    <path d="M 45 50 L 55 50 M 50 45 L 50 55" stroke="var(--pd-copper)" strokeWidth="0.5" />
  </svg>
);

export function LedgerV3() {
  const [mode, setMode] = useState<"quick" | "full">("quick");
  
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundColor: "var(--pd-cream)",
        color: "var(--pd-charcoal)",
        fontFamily: "var(--pd-font-sans)",
      }}
    >
      <HatchPattern />
      
      {/* Outer Frame */}
      <div className="relative border border-[var(--pd-navy)] w-full max-w-[1232px] mx-auto min-h-[calc(100vh-48px)] flex flex-col pt-8 pb-12 px-12">
        {/* Registration Crosshairs */}
        <Crosshair className="absolute -top-[4px] -left-[4px]" />
        <Crosshair className="absolute -top-[4px] -right-[4px]" />
        <Crosshair className="absolute -bottom-[4px] -left-[4px]" />
        <Crosshair className="absolute -bottom-[4px] -right-[4px]" />

        {/* Header Bar */}
        <header className="mb-12">
          <div className="flex items-end justify-between pb-4">
            <div
              className="leading-none"
              style={{
                fontFamily: "var(--pd-font-display)",
                fontSize: "16px",
                letterSpacing: "0.08em",
                color: "var(--pd-navy)",
              }}
            >
              PEGASUS DREAMSCAPES CORP
            </div>
            
            <div 
              className="text-[11px] tracking-[0.15em] font-medium uppercase absolute left-1/2 transform -translate-x-1/2"
              style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
            >
              Strategy Lab / Prospective Analysis No. 0001
            </div>

            <div 
              className="text-[10px] tracking-[0.15em] text-right font-medium uppercase"
              style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
            >
              VOL. I · SHEET 01
            </div>
          </div>
          
          {/* Double Rule */}
          <div className="w-full h-[1px] bg-[var(--pd-navy)]"></div>
          <div className="w-full h-[3px]"></div>
          <div className="w-full h-[0.5px] bg-[var(--pd-navy)]"></div>
        </header>

        {/* Hero Section - Two Column */}
        <section className="flex flex-col md:flex-row gap-16 mb-12">
          <div className="flex-1 max-w-lg">
            <div 
              className="text-[10px] tracking-[0.2em] uppercase font-bold mb-3"
              style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
            >
              § I · ENGAGEMENT BRIEF
            </div>
            <h1
              className="text-5xl mb-6"
              style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500, letterSpacing: "-0.02em", color: "var(--pd-navy)" }}
            >
              Strategy Lab
            </h1>
            
            <div className="w-[320px] mb-8 py-3 border-y border-[var(--pd-copper)]">
              <p
                className="text-[18px] italic text-center"
                style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-copper)" }}
              >
                One address in. Every angle out.
              </p>
            </div>

            <p
              className="text-sm leading-relaxed mb-8"
              style={{ color: "var(--pd-navy)", maxWidth: "420px" }}
            >
              Run the property through the Pegasus lens. Lane fit, risk register, scenario stress, and a recommended next step. Preliminary, transparent, and editable.
            </p>
            
            <div className="flex items-center gap-6">
              <button
                className="text-[10px] tracking-[0.15em] uppercase font-bold border-b border-[var(--pd-navy)] pb-1 transition-colors hover:text-[var(--pd-copper)] hover:border-[var(--pd-copper)]"
                style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
              >
                Start an Analysis
              </button>
              <button
                className="text-[10px] tracking-[0.15em] uppercase font-bold border-b border-transparent pb-1 transition-colors hover:text-[var(--pd-copper)] hover:border-[var(--pd-copper)]"
                style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
              >
                View Example Snapshot
              </button>
            </div>
            
            <p
              className="text-[9px] leading-[1.6] mt-10"
              style={{ color: "var(--pd-muted)", maxWidth: "420px" }}
            >
              Preliminary analysis only. Human review required before any offer, strategy release, or execution decision. Outputs are illustrative and do not constitute an offer of guaranteed returns or principal protection.
            </p>
          </div>
          
          {/* Subject Tear Sheet Table */}
          <div className="md:w-[400px] flex-shrink-0 pt-2">
            <div 
              className="text-[9px] tracking-[0.15em] uppercase font-bold mb-3"
              style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
            >
              Subject Target
            </div>
            <table className="w-full text-[10px] tracking-[0.05em] uppercase" style={{ borderTop: "1px solid var(--pd-navy)", borderBottom: "1px solid var(--pd-rule)", fontFamily: "var(--pd-font-supporting)" }}>
              <tbody>
                {[
                  ["Asset Type", "Single Family Residential"],
                  ["Target Status", "Pre-market / Off-market"],
                  ["Est. Market Value", "TBD — Pending Comps"],
                  ["Rehab Scope", "TBD — Pending Inspection"],
                  ["Strategy Primary", "To Be Determined"],
                ].map(([label, val], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--pd-rule)" }}>
                    <td className="py-3 font-medium flex items-center" style={{ color: "var(--pd-navy)", width: "50%" }}>
                      <span className="mr-2 text-[var(--pd-copper)]">§</span> {label}
                    </td>
                    <td className="py-3 text-right lowercase capitalize-first" style={{ color: "var(--pd-navy)", fontFamily: "var(--pd-font-serif)", fontSize: "15px", letterSpacing: "normal", textTransform: "none" }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div 
              className="text-[8px] tracking-[0.15em] uppercase mt-2 text-right"
              style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
            >
              STATUS — AWAITING INPUTS · LAST UPDATED {today}
            </div>
          </div>
        </section>

        {/* Path Map - TOC */}
        <section className="mb-12">
          <div className="relative pt-2 pb-6">
            <div className="absolute top-[10px] left-0 right-0 h-[1px]" style={{ backgroundColor: "var(--pd-navy)" }}></div>
            <div className="flex justify-between relative z-10">
              {[
                { n: "I", t: "PROPERTY" },
                { n: "II", t: "SITUATION" },
                { n: "III", t: "NUMBERS" },
                { n: "IV", t: "COMPS" },
                { n: "V", t: "RISK" },
                { n: "VI", t: "STRATEGY PATHS" },
                { n: "VII", t: "EXIT" },
                { n: "VIII", t: "NEXT STEP" }
              ].map((step, i) => (
                <div key={step.t} className="flex flex-col items-center">
                  {i === 0 ? (
                    <div className="w-[6px] h-[6px] rotate-45 mb-2 relative top-[0px]" style={{ backgroundColor: "var(--pd-copper)" }}></div>
                  ) : (
                    <div className="w-[1px] h-[6px] mb-2" style={{ backgroundColor: "var(--pd-navy)" }}></div>
                  )}
                  
                  <div 
                    className="text-[8px] tracking-[0.2em] font-bold uppercase whitespace-nowrap text-center mt-1"
                    style={{ 
                      fontFamily: "var(--pd-font-supporting)",
                      color: i === 0 ? "var(--pd-navy)" : "var(--pd-muted)"
                    }}
                  >
                    <span className="mr-1 opacity-70">§ {step.n}</span> {step.t}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mode Toggle */}
        <div className="flex gap-6 mb-8 border-b border-[var(--pd-rule)]">
          <button
            onClick={() => setMode("quick")}
            className="pb-2 text-[10px] tracking-[0.15em] font-bold uppercase relative"
            style={{
              fontFamily: "var(--pd-font-supporting)",
              color: mode === "quick" ? "var(--pd-navy)" : "var(--pd-muted)",
            }}
          >
            Quick Read
            {mode === "quick" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-[var(--pd-navy)]" />
            )}
          </button>
          <button
            onClick={() => setMode("full")}
            className="pb-2 text-[10px] tracking-[0.15em] font-bold uppercase relative"
            style={{
              fontFamily: "var(--pd-font-supporting)",
              color: mode === "full" ? "var(--pd-navy)" : "var(--pd-muted)",
            }}
          >
            Full Path
            {mode === "full" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-[var(--pd-navy)]" />
            )}
          </button>
        </div>

        {/* Main Content Area - Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-grow">
          
          {/* Inputs - Spreadsheet Style (Col 1-7) */}
          <div className="lg:col-span-7">
            
            {/* Row Group: Property */}
            <div className="mb-12">
              <div className="flex justify-between items-end mb-4 pb-2 border-b border-[var(--pd-rule)]">
                <div 
                  className="text-[10px] tracking-[0.2em] uppercase font-bold"
                  style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
                >
                  Schedule A · Property Identity
                </div>
                <div 
                  className="text-[9px] tracking-[0.1em] font-bold"
                  style={{ fontFamily: "var(--pd-font-display)", color: "var(--pd-copper)" }}
                >
                  § II.A
                </div>
              </div>
              
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <LedgerInputRow id="A.01" label="Address" placeholder="123 Example St, City, ST" />
                  <LedgerInputRow id="A.02" label="Beds" placeholder="" emptyHatch />
                  <LedgerInputRow id="A.03" label="Baths" placeholder="" emptyHatch />
                  <LedgerInputRow id="A.04" label="Sqft" placeholder="" emptyHatch />
                  <LedgerInputRow id="A.05" label="Year Built" placeholder="" emptyHatch />
                  <tr>
                    <td className="py-3 px-3 border-y border-l border-[var(--pd-rule)] font-medium bg-[var(--pd-rule-dark)]" style={{ color: "var(--pd-navy)", width: "10%" }}>
                      <span className="text-[10px] text-[var(--pd-muted)] font-mono">A.06</span>
                    </td>
                    <td className="py-3 px-3 border-y border-[var(--pd-rule)] font-medium bg-[var(--pd-rule-dark)]" style={{ color: "var(--pd-navy)", width: "35%" }}>
                      Condition
                    </td>
                    <td className="py-0 px-0 border border-[var(--pd-rule)] relative" style={{ background: "url(#diagonalHatch)" }}>
                      <select
                        className="w-full h-full py-3 px-3 bg-transparent focus:outline-none appearance-none cursor-pointer text-right relative z-10"
                        style={{ color: "var(--pd-navy)", fontFamily: "var(--pd-font-serif)", fontSize: "16px" }}
                        defaultValue=""
                      >
                        <option value="" disabled style={{ display: 'none' }}></option>
                        <option>Light Cosmetic</option>
                        <option>Moderate Rehab</option>
                        <option>Heavy Rehab</option>
                        <option>Gut</option>
                        <option>Turnkey</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Row Group: Acquisition & ARV */}
            <div>
              <div className="flex justify-between items-end mb-4 pb-2 border-b border-[var(--pd-rule)]">
                <div 
                  className="text-[10px] tracking-[0.2em] uppercase font-bold"
                  style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
                >
                  Schedule B · Core Numerics
                </div>
                <div 
                  className="text-[9px] tracking-[0.1em] font-bold"
                  style={{ fontFamily: "var(--pd-font-display)", color: "var(--pd-copper)" }}
                >
                  § II.B
                </div>
              </div>
              
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <LedgerInputRow id="B.01" label="Asking Price" placeholder="" isCurrency emptyHatch />
                  <LedgerInputRow id="B.02" label="Estimated Rehab" placeholder="" isCurrency emptyHatch />
                  <LedgerInputRow id="B.03" label="Projected ARV" placeholder="" isCurrency emptyHatch tag="DERIVED" />
                </tbody>
              </table>
            </div>
          </div>

          {/* Analyst Recommendation Sheet (Col 8-12) */}
          <div className="lg:col-span-5 border-l-[3px] border-[var(--pd-copper)] pl-8 py-2 flex flex-col relative h-full">
            
            {/* Watermark */}
            <div 
              className="absolute right-0 top-1/3 text-[80px] font-bold opacity-[0.03] select-none pointer-events-none transform -rotate-[30deg]"
              style={{ fontFamily: "var(--pd-font-sans)", color: "var(--pd-navy)", whiteSpace: 'nowrap' }}
            >
              DRAFT
            </div>

            <div className="flex justify-between items-start mb-6">
              <div 
                className="text-[10px] tracking-[0.15em] uppercase font-bold"
                style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
              >
                Analyst Recommendation
              </div>
              <div 
                className="text-[12px] font-bold"
                style={{ fontFamily: "var(--pd-font-display)", color: "var(--pd-copper)" }}
              >
                § III
              </div>
            </div>
            
            <h3
              className="text-[32px] leading-none mb-6"
              style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-navy)", letterSpacing: "-0.01em" }}
            >
              Pegasus Verdict
            </h3>
            
            <p 
              className="text-[15px] leading-relaxed flex-grow"
              style={{ color: "var(--pd-navy)", fontFamily: "var(--pd-font-serif)" }}
            >
              Inputs insufficient for strategy projection. Provide <span className="italic">Asking Price</span>, <span className="italic">Rehab Estimate</span>, and <span className="italic">Target ARV</span> to generate preliminary lane fit and return metrics.
            </p>

            <div className="mt-16 relative">
              <div className="absolute -top-12 right-0 opacity-80 pointer-events-none">
                <Seal />
              </div>

              <div className="w-48 border-b border-[var(--pd-navy)] pb-1 mb-2">
                <div 
                  className="text-[18px] italic"
                  style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-navy)" }}
                >
                  Paolo Duran, Principal
                </div>
              </div>
              <div 
                className="text-[9px] tracking-[0.15em] uppercase font-bold mb-4"
                style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
              >
                Pegasus Strategy Desk
              </div>
              
              <div className="inline-flex items-center px-3 py-1.5 border border-[var(--pd-copper)] mt-4">
                <span 
                  className="text-[8px] tracking-[0.2em] uppercase font-bold"
                  style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-copper)" }}
                >
                  RECEIVED — {today}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer inside the frame */}
        <footer className="mt-12 pt-4">
          <div className="w-full h-[0.5px] bg-[var(--pd-navy)] mb-[3px]"></div>
          <div className="w-full h-[1px] bg-[var(--pd-navy)] mb-4"></div>
          <div 
            className="flex justify-between items-center text-[8px] tracking-[0.2em] uppercase font-bold"
            style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
          >
            <div>PEGASUS DREAMSCAPES CORP</div>
            <div className="text-center">CONFIDENTIAL · NOT FOR DISTRIBUTION</div>
            <div className="text-right">SHEET 01 OF 08</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function LedgerInputRow({ id, label, placeholder, isCurrency = false, emptyHatch = false, tag }: { id: string; label: string; placeholder: string; isCurrency?: boolean; emptyHatch?: boolean; tag?: string }) {
  return (
    <tr>
      <td 
        className="py-3 px-3 border-y border-l border-[var(--pd-rule)] font-medium bg-[var(--pd-rule-dark)]" 
        style={{ color: "var(--pd-navy)", width: "10%" }}
      >
        <span className="text-[10px] text-[var(--pd-muted)] font-mono">{id}</span>
      </td>
      <td 
        className="py-3 px-3 border-y border-[var(--pd-rule)] font-medium bg-[var(--pd-rule-dark)]" 
        style={{ color: "var(--pd-navy)", width: "35%" }}
      >
        <div className="flex items-center justify-between">
          {label}
          {tag && (
            <span className="text-[7px] tracking-[0.1em] text-[var(--pd-muted)] uppercase border border-[var(--pd-rule)] px-1 ml-2">{tag}</span>
          )}
        </div>
      </td>
      <td 
        className="py-0 px-0 border border-[var(--pd-rule)] relative"
        style={emptyHatch ? { background: "url(#diagonalHatch)" } : {}}
      >
        <input
          type="text"
          placeholder={placeholder}
          className="w-full h-full py-3 px-3 bg-transparent focus:outline-none placeholder:opacity-30 text-right transition-colors relative z-10"
          style={{
            color: "var(--pd-navy)",
            fontFamily: isCurrency ? "var(--pd-font-sans)" : "var(--pd-font-serif)",
            fontSize: "16px",
          }}
          onFocus={(e) => (e.target.parentElement!.style.backgroundColor = "rgba(199, 122, 58, 0.05)")}
          onBlur={(e) => {
            if (!e.target.value && emptyHatch) {
              e.target.parentElement!.style.background = "url(#diagonalHatch)";
            } else if (!e.target.value) {
              e.target.parentElement!.style.backgroundColor = "transparent";
            } else {
              e.target.parentElement!.style.background = "transparent";
            }
          }}
        />
      </td>
    </tr>
  );
}
