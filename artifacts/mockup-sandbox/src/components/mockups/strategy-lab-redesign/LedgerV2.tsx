import React, { useState } from "react";
import "./_group.css";

export function LedgerV2() {
  const [mode, setMode] = useState<"quick" | "full">("quick");
  
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

  return (
    <div
      className="min-h-screen pb-16 flex flex-col items-center"
      style={{
        backgroundColor: "var(--pd-cream)",
        color: "var(--pd-charcoal)",
        fontFamily: "var(--pd-font-sans)",
      }}
    >
      <div className="w-full max-w-[1100px] px-12 pt-8 flex-grow flex flex-col">
        {/* Header Bar */}
        <header className="flex items-center justify-between pb-4 border-b border-[var(--pd-navy)] mb-12">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2" style={{ backgroundColor: "var(--pd-copper)" }}></div>
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
          </div>
          
          <div 
            className="text-[10px] tracking-[0.15em] text-right font-medium uppercase"
            style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
          >
            <div style={{ color: "var(--pd-copper)", marginBottom: "4px" }}>Confidential</div>
            <div style={{ color: "var(--pd-navy)" }}>Prospective Analysis / No. 0001</div>
            <div className="mt-1">Date: {today}</div>
          </div>
        </header>

        {/* Hero Section - Two Column */}
        <section className="flex flex-col md:flex-row gap-16 mb-12">
          <div className="flex-1 max-w-lg">
            <h1
              className="text-5xl mb-6"
              style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500, letterSpacing: "-0.02em", color: "var(--pd-navy)" }}
            >
              Strategy Lab
            </h1>
            
            <div className="mb-6 flex flex-col w-[80px]">
              <div className="h-[1px] w-full mb-3" style={{ backgroundColor: "var(--pd-copper)" }}></div>
              <p
                className="text-[18px] italic whitespace-nowrap"
                style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-copper)" }}
              >
                One address in. Every angle out.
              </p>
              <div className="h-[1px] w-full mt-3" style={{ backgroundColor: "var(--pd-copper)" }}></div>
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
                    <td className="py-2.5 font-medium uppercase tracking-wider" style={{ fontFamily: "var(--pd-font-supporting)", fontSize: "10px", color: "var(--pd-muted)", width: "45%" }}>{label}</td>
                    <td className="py-2.5 text-right" style={{ color: "var(--pd-navy)", fontFamily: "var(--pd-font-serif)", fontSize: "15px" }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div 
              className="mt-2 text-right italic"
              style={{ fontFamily: "var(--pd-font-serif)", fontSize: "12px", color: "var(--pd-copper)", opacity: 0.8 }}
            >
              STATUS — AWAITING SUBJECT INPUTS
            </div>
          </div>
        </section>

        {/* Path Map - Bond Coupon Timeline */}
        <section className="mb-12 flex items-center justify-between">
          <div 
            className="text-[8px] tracking-[0.2em] font-bold uppercase"
            style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
          >
            STAGE 01 OF 08
          </div>
          <div className="flex-1 px-8 relative pt-2 pb-6">
            <div className="absolute top-[10px] left-8 right-8 h-[1px]" style={{ backgroundColor: "var(--pd-navy)" }}></div>
            <div className="flex justify-between relative z-10 px-8">
              {["PROPERTY", "SITUATION", "NUMBERS", "COMPS", "RISK", "STRATEGY PATHS", "EXIT", "NEXT STEP"].map((step, i) => (
                <div key={step} className="flex flex-col items-center relative">
                  <div className="w-[1px] h-[6px] mb-2" style={{ backgroundColor: i === 0 ? "var(--pd-copper)" : "var(--pd-navy)" }}></div>
                  <div 
                    className="text-[9px] tracking-[0.2em] font-bold uppercase whitespace-nowrap text-center absolute top-3"
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
          <div 
            className="text-[8px] tracking-[0.2em] font-bold uppercase"
            style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
          >
            PRELIMINARY
          </div>
        </section>

        {/* Main Content Area */}
        <main className="flex-grow mb-12">
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
                  className="text-[10px] tracking-[0.2em] uppercase font-bold mb-4 pb-2 border-b border-[var(--pd-rule)] flex justify-between items-end"
                  style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
                >
                  <span>Schedule A: Property Identity</span>
                </div>
                
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    <LedgerInputRow rowId="A.01" label="Address" placeholder="ex. 1,247 Aberdeen Way" />
                    <LedgerInputRow rowId="A.02" label="Beds" placeholder="ex. 3" />
                    <LedgerInputRow rowId="A.03" label="Baths" placeholder="ex. 2" />
                    <LedgerInputRow rowId="A.04" label="Sqft" placeholder="ex. 1,850" />
                    <LedgerInputRow rowId="A.05" label="Year Built" placeholder="ex. 1985" />
                    <tr>
                      <td className="w-[36px] py-3 border-b border-[var(--pd-rule)] align-top" style={{ color: "var(--pd-muted)" }}>
                        <div style={{ fontFamily: "var(--pd-font-supporting)", fontSize: "9px" }}>A.06</div>
                      </td>
                      <td className="py-3 px-3 border border-[var(--pd-rule)] font-medium bg-[var(--pd-rule-dark)] flex items-center justify-between" style={{ color: "var(--pd-navy)", width: "40%" }}>
                        <span>Condition</span>
                      </td>
                      <td className="py-0 px-0 border border-[var(--pd-rule)] bg-white relative group">
                        <select
                          className="w-full h-full py-3 px-3 bg-transparent focus:outline-none appearance-none cursor-pointer text-right italic"
                          style={{ color: "var(--pd-muted)", fontFamily: "var(--pd-font-serif)", fontSize: "16px" }}
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
                  className="text-[10px] tracking-[0.2em] uppercase font-bold mb-4 pb-2 border-b border-[var(--pd-rule)] flex justify-between items-end"
                  style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
                >
                  <span>Schedule B: Core Numerics</span>
                </div>
                
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    <LedgerInputRow rowId="B.01" label="Asking Price" placeholder="ex. $425,000" />
                    <LedgerInputRow rowId="B.02" label="Estimated Rehab" placeholder="ex. $65,000" />
                    <LedgerInputRow rowId="B.03" label="Projected ARV" placeholder="ex. $550,000" />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verdict Zone (Col 8-12) */}
            <div className="lg:col-span-5">
              <div 
                className="h-full border border-[var(--pd-navy)] p-8 relative flex flex-col overflow-hidden"
                style={{ backgroundColor: "var(--pd-cream)", borderTop: "2px solid var(--pd-copper)" }}
              >
                {/* Watermark */}
                <div 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                >
                  <div 
                    className="text-[120px] font-bold transform -rotate-15 select-none"
                    style={{ fontFamily: "var(--pd-font-sans)", color: "var(--pd-navy)", opacity: 0.06 }}
                  >
                    DRAFT
                  </div>
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div 
                    className="text-[9px] tracking-[0.15em] uppercase font-bold mb-8 flex justify-between"
                    style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
                  >
                    <span>Recommendation</span>
                    <span style={{ color: "var(--pd-copper)" }}>Action Required</span>
                  </div>
                  
                  <div 
                    className="text-[9px] tracking-[0.15em] uppercase mb-2 font-bold"
                    style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-copper)" }}
                  >
                    ANALYST NOTE — NO. 0001
                  </div>
                  <h3
                    className="text-3xl mb-6"
                    style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-navy)", letterSpacing: "-0.01em" }}
                  >
                    Pegasus Verdict
                  </h3>
                  
                  <p 
                    className="text-sm leading-relaxed flex-grow mb-12"
                    style={{ color: "var(--pd-navy)", fontFamily: "var(--pd-font-sans)" }}
                  >
                    Inputs insufficient for strategy projection. Provide Asking Price, Rehab Estimate, and Target ARV to generate preliminary lane fit and return metrics.
                  </p>

                  <div className="pt-6 border-t border-[var(--pd-navy)] relative flex items-center justify-between">
                    <div>
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
                    
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="30" cy="30" r="29" stroke="var(--pd-copper)" strokeWidth="1" strokeDasharray="2 2"/>
                      <text x="30" y="24" textAnchor="middle" fill="var(--pd-copper)" style={{fontFamily: 'var(--pd-font-display)', fontSize: '7px', letterSpacing: '0.1em'}}>PEGASUS</text>
                      <text x="30" y="32" textAnchor="middle" fill="var(--pd-copper)" style={{fontFamily: 'var(--pd-font-display)', fontSize: '6px', letterSpacing: '0.1em'}}>STRATEGY DESK</text>
                      <text x="30" y="40" textAnchor="middle" fill="var(--pd-copper)" style={{fontFamily: 'var(--pd-font-display)', fontSize: '5px', letterSpacing: '0.1em'}}>EST. 2024</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
        
        <footer className="w-full pt-4 border-t border-[var(--pd-rule)]">
          <div 
            className="flex justify-between items-center text-[9px] tracking-[0.2em] uppercase font-bold"
            style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
          >
            <span>PEGASUS DREAMSCAPES CORP</span>
            <span>CONFIDENTIAL</span>
            <span>PAGE 01 OF 08</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function LedgerInputRow({ rowId, label, placeholder }: { rowId: string; label: string; placeholder: string }) {
  return (
    <tr>
      <td className="w-[36px] py-3 border-b border-[var(--pd-rule)] align-top" style={{ color: "var(--pd-muted)" }}>
        <div style={{ fontFamily: "var(--pd-font-supporting)", fontSize: "9px" }}>{rowId}</div>
      </td>
      <td 
        className="py-3 px-3 border border-[var(--pd-rule)] font-medium bg-[var(--pd-rule-dark)] flex items-center justify-between" 
        style={{ color: "var(--pd-navy)", width: "40%" }}
      >
        <span>{label}</span>
      </td>
      <td className="py-0 px-0 border border-[var(--pd-rule)] bg-white relative group">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full h-full py-3 px-3 bg-transparent focus:outline-none placeholder:text-[var(--pd-muted)] placeholder:opacity-100 text-right italic transition-colors"
          style={{
            color: "var(--pd-navy)",
            fontFamily: "var(--pd-font-serif)",
            fontSize: "16px",
          }}
          onFocus={(e) => {
            e.target.parentElement!.style.backgroundColor = "rgba(199, 122, 58, 0.05)";
            e.target.classList.remove("italic");
            e.target.classList.remove("placeholder:opacity-100");
          }}
          onBlur={(e) => {
            e.target.parentElement!.style.backgroundColor = "#ffffff";
            if (!e.target.value) {
              e.target.classList.add("italic");
              e.target.classList.add("placeholder:opacity-100");
            }
          }}
          onChange={(e) => {
            if (e.target.value) {
              e.target.classList.remove("italic");
            } else {
              e.target.classList.add("italic");
            }
          }}
        />
        {/* Subtle diagonal hatch pattern for empty state */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-5 transition-opacity group-focus-within:opacity-0 peer-placeholder-shown:opacity-5 peer-not-placeholder-shown:opacity-0"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, var(--pd-navy) 0, var(--pd-navy) 1px, transparent 1px, transparent 8px)"
          }}
        ></div>
      </td>
    </tr>
  );
}
