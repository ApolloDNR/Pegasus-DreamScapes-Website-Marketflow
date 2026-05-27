import React from "react";
import { ArrowRight, ChevronRight, Activity, Terminal as TerminalIcon, CheckCircle2, Server, Globe, Cpu, Database, Command, LayoutDashboard, Code, Network, Users } from "lucide-react";

export function Terminal() {
  const THEME = {
    bg: "#0A1118", // Darker navy for terminal feel
    navy: "#0D1B2D",
    copper: "#C77A3A",
    cream: "#F6EFE4",
    charcoal: "#1E2328",
    mutedText: "rgba(246, 239, 228, 0.4)",
    border: "rgba(199, 122, 58, 0.2)",
    accent: "#C77A3A"
  };

  const FONTS = {
    cinzel: '"Cinzel", serif',
    cormorant: '"Cormorant Garamond", serif',
    montserrat: '"Montserrat", sans-serif',
    inter: '"Inter", sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  };

  return (
    <div 
      className="min-h-screen text-[#F6EFE4] antialiased selection:bg-[#C77A3A] selection:text-white"
      style={{ backgroundColor: THEME.bg, fontFamily: FONTS.inter }}
    >
      {/* Faint Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(${THEME.copper} 1px, transparent 1px), linear-gradient(90deg, ${THEME.copper} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '-1px -1px'
        }}
      />
      
      {/* 2. TRUST STRIP (Moved to top as status bar) */}
      <div className="relative z-20 border-b flex items-center px-4 py-1 text-[10px] uppercase tracking-widest font-mono sticky top-0 bg-[#0A1118]/90 backdrop-blur-md" style={{ borderColor: THEME.border, color: THEME.mutedText }}>
        <div className="flex items-center gap-2 mr-6">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-500">SYSTEM.ONLINE</span>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <span>DRE_02333658</span>
          <span>KW_EAST_BAY</span>
          <span>CA_TWO_PARTY_CONSENT</span>
          <span>NAR_159537628</span>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-4">
          <Activity size={12} />
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto p-4 sm:p-8 flex flex-col gap-8">
        
        {/* TOP ROW: HERO & SIDEBAR NAV */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 6. WHAT WE DO (Sidebar Navigation) */}
          <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col gap-4 border p-4 bg-[#0D1B2D]/50 backdrop-blur-sm rounded-sm" style={{ borderColor: THEME.border }}>
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono mb-4 flex justify-between items-center" style={{ color: THEME.copper }}>
              <span>DIRECTORY.SYS</span>
              <Database size={12} />
            </div>
            <nav className="flex flex-col gap-1">
              {[
                { name: "Deal Architecture", href: "/deal-architecture", status: "live", icon: LayoutDashboard },
                { name: "Development", href: "/development", status: "live", icon: Code },
                { name: "Strategy Lab", href: "/strategy-lab", status: "live", icon: Cpu },
                { name: "Work With Apollo", href: "/work-with-apollo", status: "live", icon: Users },
                { name: "MarketFlow", href: "/marketflow", status: "beta", icon: Network }
              ].map(item => (
                <a key={item.name} href={item.href} className="group flex items-center justify-between p-2 text-sm hover:bg-[#1E2328] rounded-sm transition-colors border border-transparent hover:border-[#C77A3A]/30">
                  <div className="flex items-center gap-3">
                    <item.icon size={14} className="text-[#C77A3A] opacity-70 group-hover:opacity-100" />
                    <span style={{ fontFamily: FONTS.montserrat }} className="text-xs font-semibold tracking-wide uppercase">{item.name}</span>
                  </div>
                  {item.status === 'live' ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Live" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C77A3A]" title="Private beta" />
                  )}
                </a>
              ))}
            </nav>
            
            <div className="mt-auto pt-8">
              <div className="text-[10px] font-mono uppercase mb-2" style={{ color: THEME.mutedText }}>
                SYSTEM_MESSAGE
              </div>
              <p className="text-xs leading-relaxed" style={{ color: THEME.mutedText }}>
                "Built on strategy. Governed by virtue. Executed with discipline."
              </p>
            </div>
          </div>

          {/* 1. HERO */}
          <div className="lg:col-span-9 order-1 lg:order-2 grid grid-cols-1 xl:grid-cols-2 gap-8 border p-8 bg-[#0D1B2D]/50 backdrop-blur-sm rounded-sm" style={{ borderColor: THEME.border }}>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-6" style={{ color: THEME.copper }}>
                <TerminalIcon size={14} />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em]">The Deal Architect</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] mb-6" style={{ fontFamily: FONTS.cinzel }}>
                Complex property.<br/>
                <span className="opacity-70">Structured opportunity.</span>
              </h1>
              
              <p className="text-sm font-mono mb-10 max-w-md leading-relaxed" style={{ color: THEME.mutedText }}>
                &gt; INITIALIZING STRATEGY REVIEW...<br/>
                &gt; A strategy-first real estate operating company.<br/>
                &gt; Every property gets a path.
              </p>
              
              <div className="flex items-center gap-4">
                <a href="/submit" className="inline-flex items-center gap-2 bg-[#C77A3A] text-[#0A1118] px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#F6EFE4] transition-colors">
                  <Command size={14} />
                  Submit a Property
                </a>
              </div>
            </div>

            {/* HERO RIGHT: Deal Ticker & Snapshot Panel */}
            <div className="flex flex-col gap-4">
              <div className="border p-4 bg-[#0A1118]" style={{ borderColor: THEME.border }}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: THEME.border }}>
                  <span className="text-[10px] font-mono text-green-500">LIVE_DEAL_TICKER</span>
                  <Activity size={12} className="text-green-500 animate-pulse" />
                </div>
                
                <div className="space-y-4">
                  {[
                    { blur: "14** N****** Dr", arv: "$1,450,000", type: "Rehab", status: "EXECUTED" },
                    { blur: "8** W******* Ave", arv: "$920,000", type: "Wholesale", status: "PENDING" },
                    { blur: "2** P******* Ct", arv: "$2,100,000", type: "Development", status: "UNDERWRITING" }
                  ].map((deal, i) => (
                    <div key={i} className="flex items-center justify-between font-mono text-[11px] hover:bg-[#1E2328] p-2 rounded cursor-default transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="opacity-50">[{i+1}]</span>
                        <span className="w-24 font-bold">{deal.blur}</span>
                        <span style={{ color: THEME.copper }}>{deal.arv}</span>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <span className="hidden sm:inline-block w-20 opacity-70">{deal.type}</span>
                        <span className={`w-20 ${deal.status === 'EXECUTED' ? 'text-green-500' : 'text-yellow-500'}`}>
                          {deal.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border p-4 bg-[#0A1118]" style={{ borderColor: THEME.border }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono text-[#C77A3A]">LATEST_SNAPSHOT</span>
                  <span className="text-[10px] font-mono opacity-50">3_DAYS_AGO</span>
                </div>
                <div className="text-[10px] font-mono opacity-70">
                  <span className="text-green-500">✔</span> Analysis complete. Most Strategy Snapshots are reviewed within 5 business days.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. AUDIENCE SORT (4 Dashboard Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: "SELLERS", metric: "Path designed in 5 days avg", href: "/submit", desc: "Complex, distressed, inherited." },
            { id: "BUYERS", metric: "47 active listings tracked", href: "/work-with-apollo", desc: "List or buy with Apollo." },
            { id: "CAPITAL", metric: "Written agreement on every deal", href: "/capital", desc: "JV, co-GP, or capital conversations." },
            { id: "VENDORS", metric: "12 active projects", href: "/vendor-network", desc: "GCs, subs, suppliers." }
          ].map(card => (
            <a key={card.id} href={card.href} className="block border p-4 bg-[#0D1B2D]/50 hover:bg-[#1E2328] transition-colors relative group" style={{ borderColor: THEME.border }}>
              <div className="absolute top-0 right-0 p-2">
                <ChevronRight size={14} className="text-[#C77A3A] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-4" style={{ color: THEME.copper }}>
                /{card.id}
              </div>
              <div className="font-mono text-xs text-green-500 mb-2">{card.metric}</div>
              <p className="text-[11px] font-mono leading-relaxed" style={{ color: THEME.mutedText }}>{card.desc}</p>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 4. NELSON DR & 7. OPERATOR BIO */}
          <div className="flex flex-col gap-4">
            
            {/* NELSON DR DEAL CARD */}
            <div className="border p-4 bg-[#0D1B2D]/50" style={{ borderColor: THEME.border }}>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-4" style={{ color: THEME.copper }}>
                CASE_STUDY: NELSON_DR
              </div>
              <div className="flex gap-4">
                <img src="/nelson/nelson-01.jpg" alt="Nelson Dr" className="w-24 h-24 object-cover border border-[#C77A3A]/30 grayscale contrast-125" />
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <div className="font-mono text-sm font-bold mb-1">Nelson Dr. Rehab</div>
                    <div className="font-mono text-[10px] text-green-500 mb-2">STATUS: EXECUTED</div>
                    <div className="font-mono text-[11px]" style={{ color: THEME.mutedText }}>ARV: $1,450,000 | Direct Acq.</div>
                  </div>
                  <a href="/projects/nelson-dr" className="text-[10px] font-mono text-[#C77A3A] hover:underline uppercase inline-flex items-center gap-1">
                    [View Case] <ArrowRight size={10} />
                  </a>
                </div>
              </div>
            </div>

            {/* OPERATOR BIO CARD */}
            <div className="border p-4 bg-[#0D1B2D]/50 flex gap-4 items-center" style={{ borderColor: THEME.border }}>
              <img src="/images/founder/apollo-768.jpg" alt="Apollo Duran" className="w-16 h-16 object-cover border border-[#C77A3A]/50 grayscale" />
              <div>
                <div className="font-mono text-sm font-bold mb-1">Paolo "Apollo" Duran</div>
                <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: THEME.copper }}>Founder & Principal</div>
                <div className="font-mono text-[10px]" style={{ color: THEME.mutedText }}>
                  DRE #02333658<br/>
                  "Built on strategy. Governed by virtue. Executed with discipline."
                </div>
              </div>
            </div>

          </div>

          {/* 5. STRATEGY LAB TEASER & 8. DREAMSCAPER STANDARD */}
          <div className="flex flex-col gap-4">
            
            {/* STRATEGY LAB CTA */}
            <div className="border p-6 bg-[#0D1B2D]/50 flex flex-col justify-center h-full" style={{ borderColor: THEME.border }}>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-4 flex items-center gap-2" style={{ color: THEME.copper }}>
                <Cpu size={12} />
                STRATEGY_LAB_TERMINAL
              </div>
              <h3 className="text-xl font-bold mb-4 font-mono uppercase tracking-tight">Run a Snapshot</h3>
              <p className="text-xs font-mono mb-6 leading-relaxed" style={{ color: THEME.mutedText }}>
                Input initial parameters to generate a preliminary path evaluation.
              </p>
              
              <div className="flex gap-2">
                <div className="flex-1 bg-[#0A1118] border border-[#1E2328] px-3 py-2 flex items-center">
                  <span className="font-mono text-[10px] opacity-50 mr-2">$</span>
                  <span className="font-mono text-[11px] text-white opacity-30 animate-pulse">Enter Property Address...</span>
                </div>
                <a href="/strategy-lab" className="bg-[#C77A3A] text-[#0A1118] px-4 py-2 text-[10px] font-mono font-bold uppercase hover:bg-[#F6EFE4] transition-colors whitespace-nowrap flex items-center">
                  EXECUTE
                </a>
              </div>
            </div>

            {/* DREAMSCAPER STANDARD */}
            <div className="border p-6 bg-[#0D1B2D]/50" style={{ borderColor: THEME.border }}>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-4" style={{ color: THEME.copper }}>
                OPERATING_VIRTUES
              </div>
              <h3 className="text-lg mb-4" style={{ fontFamily: FONTS.cinzel }}>The Dreamscaper Standard.</h3>
              <div className="space-y-3">
                {[
                  "Discipline in underwriting.",
                  "Clarity in communication.",
                  "Integrity in structure.",
                  "Excellence in execution."
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={14} className="text-[#C77A3A] mt-0.5 shrink-0" />
                    <span className="font-mono text-[11px]" style={{ color: THEME.mutedText }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* 9. FINAL CTA (Terminal Command Bar) */}
        <div className="border border-[#C77A3A] bg-[#0A1118] p-6 sm:p-8 mt-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C77A3A]/5 rounded-full blur-3xl" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="font-mono text-[11px] text-[#C77A3A] mb-2 uppercase">
                Dream it. Build it. Live it.
              </div>
              <h2 className="text-2xl sm:text-3xl tracking-tight mb-2" style={{ fontFamily: FONTS.cinzel }}>
                Bring us the property.<br className="hidden sm:block" />
                <span className="opacity-70">We'll help find the path.</span>
              </h2>
            </div>
            
            <a href="/submit" className="w-full sm:w-auto font-mono text-[11px] sm:text-xs bg-[#1E2328] border border-[#C77A3A]/50 text-[#F6EFE4] px-6 py-4 flex items-center justify-between gap-4 hover:border-[#C77A3A] hover:bg-[#0D1B2D] transition-all cursor-pointer">
              <span><span className="text-[#C77A3A] mr-2">$</span>submit-property --route=apollo</span>
              <div className="w-2 h-4 bg-[#C77A3A] animate-pulse" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
