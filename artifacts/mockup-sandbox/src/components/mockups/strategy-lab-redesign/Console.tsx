import { useState } from "react";
import { ArrowRight, Activity, Terminal, ShieldAlert, Cpu } from "lucide-react";
import "./_group.css";

export function Console() {
  const [mode, setMode] = useState<"quick" | "full">("quick");

  const pathNodes = [
    { id: "property", label: "Property", active: true },
    { id: "situation", label: "Situation", active: false },
    { id: "numbers", label: "Numbers", active: false },
    { id: "comps", label: "Comps", active: false },
    { id: "risk", label: "Risk", active: false },
    { id: "paths", label: "Strategy Paths", active: false },
    { id: "exit", label: "Exit", active: false },
    { id: "next", label: "Next Step", active: false },
  ];

  return (
    <div 
      className="min-h-screen text-[var(--pd-cream)]" 
      style={{ backgroundColor: "var(--pd-navy)", fontFamily: "var(--pd-font-sans)" }}
    >
      {/* Top Nav */}
      <div 
        className="flex items-center justify-between px-8 py-6 border-b" 
        style={{ borderColor: "rgba(232, 219, 197, 0.15)" }}
      >
        <div>
          <div style={{ fontFamily: "var(--pd-font-display)", letterSpacing: "0.15em" }} className="text-lg">
            PEGASUS DREAMSCAPES
          </div>
          <div style={{ fontFamily: "var(--pd-font-supporting)", letterSpacing: "0.3em", color: "var(--pd-copper-soft)" }} className="text-[10px] mt-1 font-semibold uppercase">
            The Deal Architect
          </div>
        </div>
        <button 
          className="px-6 py-2.5 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-all"
          style={{ 
            fontFamily: "var(--pd-font-supporting)", 
            backgroundColor: "var(--pd-copper)", 
            color: "var(--pd-navy)" 
          }}
        >
          Start a Strategy Review
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="px-8 py-10 grid grid-cols-12 gap-12">
        {/* Left Col - Hero & Controls */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-10">
          <div className="max-w-2xl">
            <h1 
              style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-cream)" }} 
              className="text-5xl lg:text-6xl font-light mb-4"
            >
              Strategy Lab
            </h1>
            <div 
              style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-copper)" }} 
              className="text-2xl lg:text-3xl italic mb-6"
            >
              One address in. Every angle out.
            </div>
            <p 
              className="text-lg leading-relaxed mb-8" 
              style={{ color: "rgba(246, 239, 228, 0.8)" }}
            >
              Run the property through the Pegasus lens. Lane fit, risk register, scenario stress, and a recommended next step. Preliminary, transparent, and editable.
            </p>
            
            <div className="flex items-center gap-4 mb-10">
              <button 
                className="px-8 py-3.5 text-sm font-semibold uppercase tracking-widest transition-all"
                style={{ 
                  fontFamily: "var(--pd-font-supporting)", 
                  backgroundColor: "var(--pd-copper)", 
                  color: "var(--pd-navy)" 
                }}
              >
                Start an Analysis
              </button>
              <button 
                className="px-8 py-3.5 text-sm font-semibold uppercase tracking-widest border transition-all hover:bg-white/5"
                style={{ 
                  fontFamily: "var(--pd-font-supporting)", 
                  borderColor: "rgba(246, 239, 228, 0.2)",
                  color: "var(--pd-cream)" 
                }}
              >
                View Example Snapshot
              </button>
            </div>
            
            <p className="text-xs leading-relaxed max-w-xl" style={{ color: "rgba(246, 239, 228, 0.4)" }}>
              Preliminary analysis only. Human review required before any offer, strategy release, or execution decision. Outputs are illustrative and do not constitute an offer of guaranteed returns or principal protection.
            </p>
          </div>

          <div className="pt-6 border-t" style={{ borderColor: "rgba(232, 219, 197, 0.15)" }}>
            <div className="flex items-center justify-between mb-8">
              <div 
                style={{ fontFamily: "var(--pd-font-supporting)", letterSpacing: "0.2em", color: "var(--pd-copper-soft)" }} 
                className="text-xs font-semibold uppercase"
              >
                Terminal Input Array
              </div>
              <div className="flex border rounded" style={{ borderColor: "rgba(232, 219, 197, 0.2)" }}>
                <button 
                  onClick={() => setMode("quick")}
                  className={`px-4 py-2 text-[10px] font-semibold tracking-widest uppercase transition-colors ${mode === "quick" ? "bg-[var(--pd-copper)] text-[var(--pd-navy)]" : "text-white/60 hover:bg-white/5"}`}
                  style={{ fontFamily: "var(--pd-font-supporting)" }}
                >
                  Quick Read
                </button>
                <div className="w-px" style={{ backgroundColor: "rgba(232, 219, 197, 0.2)" }}></div>
                <button 
                  onClick={() => setMode("full")}
                  className={`px-4 py-2 text-[10px] font-semibold tracking-widest uppercase transition-colors ${mode === "full" ? "bg-[var(--pd-copper)] text-[var(--pd-navy)]" : "text-white/60 hover:bg-white/5"}`}
                  style={{ fontFamily: "var(--pd-font-supporting)" }}
                >
                  Full Path
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-6">
                <h3 style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-cream)" }} className="text-2xl border-b pb-2 border-white/10">Property Identity</h3>
                
                <TerminalField label="Target Address" id="address" value="1247 Aberdeen Way" />
                <div className="grid grid-cols-3 gap-4">
                  <TerminalField label="Beds" id="beds" value="3" />
                  <TerminalField label="Baths" id="baths" value="2.5" />
                  <TerminalField label="Sqft" id="sqft" value="1,850" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <TerminalField label="Year Built" id="year" value="1982" />
                  <div className="flex flex-col gap-1.5">
                    <label style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-copper-soft)", letterSpacing: "0.15em" }} className="text-[9px] uppercase font-semibold">Condition</label>
                    <select className="bg-black/30 border border-white/10 text-white font-mono text-sm px-3 py-2 w-full outline-none focus:border-[var(--pd-copper)] transition-colors">
                      <option>Moderate Rehab</option>
                      <option>Light Cosmetic</option>
                      <option>Heavy Rehab</option>
                      <option>Turnkey</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-cream)" }} className="text-2xl border-b pb-2 border-white/10">Acquisition + ARV</h3>
                
                <TerminalField label="Asking Price" id="asking" value="$425,000" />
                <TerminalField label="Rehab Est." id="rehab" value="$65,000" />
                <TerminalField label="Target ARV" id="arv" value="$610,000" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Live Verdict Panel */}
        <div className="col-span-12 lg:col-span-5 relative">
          <div 
            className="absolute inset-0 bg-black/40 border-l border-t" 
            style={{ 
              borderColor: "var(--pd-copper)",
              boxShadow: "-1px -1px 20px rgba(199, 122, 58, 0.1)"
            }}
          ></div>
          
          <div className="relative p-8 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <Cpu className="w-5 h-5" style={{ color: "var(--pd-copper)" }} />
              <h2 style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-copper)" }} className="text-3xl">Pegasus Verdict</h2>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-mono text-xs text-green-500/80">SYSTEM LIVE</span>
              </div>
            </div>

            <div className="flex-1 border border-white/10 bg-black/50 p-6 flex flex-col gap-6 font-mono text-sm">
              <div className="text-white/40 mb-2">{'// WAITING FOR INPUT STREAM...'}</div>
              
              <div className="border-l-2 pl-4 py-1" style={{ borderColor: "var(--pd-copper)" }}>
                <div className="text-[10px] uppercase text-white/50 tracking-widest mb-1 font-sans">LANE FIT</div>
                <div className="text-xl text-white">Calculating...</div>
              </div>
              
              <div className="border-l-2 pl-4 py-1 border-white/10">
                <div className="text-[10px] uppercase text-white/50 tracking-widest mb-1 font-sans">SCENARIO STRESS</div>
                <div className="text-white/70">Awaiting acquisition metrics</div>
              </div>
              
              <div className="border-l-2 pl-4 py-1 border-white/10">
                <div className="text-[10px] uppercase text-white/50 tracking-widest mb-1 font-sans">RISK REGISTER</div>
                <div className="text-white/70">Monitoring property flags</div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/10">
                <div className="text-[10px] uppercase text-white/50 tracking-widest mb-2 font-sans">RECOMMENDED NEXT STEP</div>
                <div className="text-white/30 italic font-sans">Complete terminal input array to generate execution path.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Path Map Strip (Bottom) */}
      <div 
        className="w-full mt-auto py-8 border-t bg-black/30 backdrop-blur-sm" 
        style={{ borderColor: "rgba(232, 219, 197, 0.15)" }}
      >
        <div className="px-8 max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-white/10 z-0"></div>
            
            {pathNodes.map((node, i) => (
              <div key={node.id} className="relative z-10 flex flex-col items-center gap-3">
                <div 
                  className={`w-3 h-3 rounded-full border-2 transition-all ${node.active ? "bg-[var(--pd-copper)] border-[var(--pd-copper)] shadow-[0_0_12px_rgba(199,122,58,0.6)]" : "bg-[var(--pd-navy)] border-white/20"}`}
                ></div>
                <div 
                  className={`text-[9px] uppercase font-semibold tracking-[0.2em] whitespace-nowrap ${node.active ? "text-[var(--pd-copper)]" : "text-white/40"}`}
                  style={{ fontFamily: "var(--pd-font-supporting)" }}
                >
                  {node.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

function TerminalField({ label, id, value }: { label: string; id: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-copper-soft)", letterSpacing: "0.15em" }} className="text-[9px] uppercase font-semibold">
        {label}
      </label>
      <input 
        id={id}
        type="text" 
        defaultValue={value}
        className="bg-black/30 border border-white/10 text-white font-mono text-sm px-3 py-2 w-full outline-none focus:border-[var(--pd-copper)] focus:shadow-[0_0_8px_rgba(199,122,58,0.2)] transition-all"
      />
    </div>
  );
}
