import React, { useState } from "react";
import "./_group.css";

export function Ledger() {
  const [mode, setMode] = useState<"quick" | "full">("quick");
  
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

  return (
    <div
      className="min-h-screen pb-32 flex flex-col items-center"
      style={{
        backgroundColor: "var(--pd-cream)",
        color: "var(--pd-charcoal)",
        fontFamily: "var(--pd-font-sans)",
      }}
    >
      <div className="w-full max-w-[1100px] px-12 pt-8">
        {/* Header Bar */}
        <header className="flex items-center justify-between pb-4 border-b border-[var(--pd-navy)] mb-12">
          <div className="flex flex-col">
            <div
              className="leading-none"
              style={{
                fontFamily: "var(--pd-font-display)",
                fontSize: "18px",
                letterSpacing: "0.08em",
                color: "var(--pd-navy)",
              }}
            >
              PEGASUS DREAMSCAPES
            </div>
            <div
              className="text-[9px] tracking-[0.2em] mt-1.5 uppercase font-medium"
              style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
            >
              The Deal Architect
            </div>
          </div>
          
          <div 
            className="text-[10px] tracking-[0.15em] text-right font-medium uppercase"
            style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
          >
            <div style={{ color: "var(--pd-navy)" }}>Prospective Analysis / No. 0001</div>
            <div className="mt-1">Date: {today}</div>
          </div>
        </header>

        {/* Hero Section - Two Column */}
        <section className="flex flex-col md:flex-row gap-16 mb-16">
          <div className="flex-1 max-w-lg">
            <h1
              className="text-5xl mb-4"
              style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500, letterSpacing: "-0.02em", color: "var(--pd-navy)" }}
            >
              Strategy Lab
            </h1>
            <p
              className="text-[15px] italic mb-6"
              style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-copper)" }}
            >
              One address in. Every angle out.
            </p>
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
            <table className="w-full text-xs" style={{ borderTop: "1px solid var(--pd-navy)", borderBottom: "1px solid var(--pd-rule)" }}>
              <tbody>
                {[
                  ["Asset Type", "Single Family Residential"],
                  ["Target Status", "Pre-market / Off-market"],
                  ["Est. Market Value", "TBD — Pending Comps"],
                  ["Rehab Scope", "TBD — Pending Inspection"],
                  ["Strategy Primary", "To Be Determined"],
                ].map(([label, val], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--pd-rule)" }}>
                    <td className="py-2.5 font-medium" style={{ color: "var(--pd-muted)", width: "45%" }}>{label}</td>
                    <td className="py-2.5 text-right" style={{ color: "var(--pd-navy)", fontFamily: "var(--pd-font-serif)", fontSize: "14px" }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Path Map - Bond Coupon Timeline */}
        <section className="mb-16">
          <div className="relative pt-2 pb-6">
            <div className="absolute top-[10px] left-0 right-0 h-[1px]" style={{ backgroundColor: "var(--pd-navy)" }}></div>
            <div className="flex justify-between relative z-10">
              {["PROPERTY", "SITUATION", "NUMBERS", "COMPS", "RISK", "STRATEGY PATHS", "EXIT", "NEXT STEP"].map((step, i) => (
                <div key={step} className="flex flex-col items-center">
                  <div className="w-[1px] h-[6px] mb-2" style={{ backgroundColor: "var(--pd-navy)" }}></div>
                  <div 
                    className="text-[8px] tracking-[0.2em] font-bold uppercase whitespace-nowrap text-center"
                    style={{ 
                      fontFamily: "var(--pd-font-supporting)",
                      color: i === 0 ? "var(--pd-navy)" : "var(--pd-muted)"
                    }}
                  >
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <main>
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Inputs - Spreadsheet Style (Col 1-7) */}
            <div className="lg:col-span-7">
              
              {/* Row Group: Property */}
              <div className="mb-10">
                <div 
                  className="text-[10px] tracking-[0.2em] uppercase font-bold mb-4 pb-2 border-b border-[var(--pd-rule)]"
                  style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
                >
                  Schedule A: Property Identity
                </div>
                
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    <LedgerInputRow label="Address" placeholder="123 Example St, City, ST" />
                    <LedgerInputRow label="Beds" placeholder="0" />
                    <LedgerInputRow label="Baths" placeholder="0" />
                    <LedgerInputRow label="Sqft" placeholder="0" />
                    <LedgerInputRow label="Year Built" placeholder="YYYY" />
                    <tr>
                      <td className="py-3 px-3 border border-[var(--pd-rule)] font-medium" style={{ color: "var(--pd-muted)", width: "35%" }}>
                        Condition
                      </td>
                      <td className="py-0 px-0 border border-[var(--pd-rule)]">
                        <select
                          className="w-full h-full py-3 px-3 bg-transparent focus:outline-none appearance-none cursor-pointer text-right"
                          style={{ color: "var(--pd-navy)", fontFamily: "var(--pd-font-serif)", fontSize: "16px" }}
                        >
                          <option>Select condition...</option>
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
                <div 
                  className="text-[10px] tracking-[0.2em] uppercase font-bold mb-4 pb-2 border-b border-[var(--pd-rule)]"
                  style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
                >
                  Schedule B: Core Numerics
                </div>
                
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    <LedgerInputRow label="Asking Price" placeholder="$0" isCurrency />
                    <LedgerInputRow label="Estimated Rehab" placeholder="$0" isCurrency />
                    <LedgerInputRow label="Projected ARV" placeholder="$0" isCurrency />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verdict Zone (Col 8-12) */}
            <div className="lg:col-span-5">
              <div 
                className="h-full border border-[var(--pd-navy)] p-8 relative overflow-hidden flex flex-col"
                style={{ backgroundColor: "var(--pd-cream)" }}
              >
                {/* Watermark */}
                <div 
                  className="absolute -right-4 -top-4 text-[60px] font-bold opacity-[0.03] select-none pointer-events-none transform rotate-12"
                  style={{ fontFamily: "var(--pd-font-sans)", color: "var(--pd-navy)" }}
                >
                  DRAFT
                </div>

                <div 
                  className="text-[9px] tracking-[0.15em] uppercase font-bold mb-8 flex justify-between"
                  style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
                >
                  <span>Recommendation</span>
                  <span style={{ color: "var(--pd-copper)" }}>Action Required</span>
                </div>
                
                <h3
                  className="text-3xl mb-6"
                  style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-navy)", letterSpacing: "-0.01em" }}
                >
                  Pegasus Verdict
                </h3>
                
                <p 
                  className="text-sm leading-relaxed flex-grow"
                  style={{ color: "var(--pd-navy)", fontFamily: "var(--pd-font-sans)" }}
                >
                  Inputs insufficient for strategy projection. Provide Asking Price, Rehab Estimate, and Target ARV to generate preliminary lane fit and return metrics.
                </p>

                <div className="mt-12 pt-6 border-t border-[var(--pd-navy)]">
                  <div 
                    className="text-xs italic"
                    style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-navy)" }}
                  >
                    —Reviewed by Pegasus Strategy Desk
                  </div>
                  <div 
                    className="text-[8px] tracking-[0.15em] uppercase mt-2 font-bold"
                    style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
                  >
                    Draft — Not for Distribution
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

function LedgerInputRow({ label, placeholder, isCurrency = false }: { label: string; placeholder: string; isCurrency?: boolean }) {
  return (
    <tr>
      <td 
        className="py-3 px-3 border border-[var(--pd-rule)] font-medium bg-[var(--pd-rule-dark)]" 
        style={{ color: "var(--pd-navy)", width: "40%" }}
      >
        {label}
      </td>
      <td className="py-0 px-0 border border-[var(--pd-rule)]">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full h-full py-3 px-3 bg-transparent focus:outline-none placeholder:opacity-30 text-right transition-colors"
          style={{
            color: "var(--pd-navy)",
            fontFamily: isCurrency ? "var(--pd-font-sans)" : "var(--pd-font-serif)",
            fontSize: "16px",
          }}
          onFocus={(e) => (e.target.parentElement!.style.backgroundColor = "rgba(199, 122, 58, 0.05)")}
          onBlur={(e) => (e.target.parentElement!.style.backgroundColor = "transparent")}
        />
      </td>
    </tr>
  );
}
