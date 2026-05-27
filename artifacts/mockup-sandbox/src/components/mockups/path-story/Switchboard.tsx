import React, { useState, useEffect } from "react";
import { ArrowRight, Terminal, Activity, GitCommit, GitMerge, Power, Database, Radio, Share2 } from "lucide-react";

export function Switchboard() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const int = setInterval(updateTime, 1000);
    return () => clearInterval(int);
  }, []);

  const fonts = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&family=Montserrat:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
  `;

  return (
    <div className="min-h-screen bg-[#0D1B2D] text-[#F6EFE4] relative overflow-hidden font-sans selection:bg-[#C77A3A]/30">
      <style dangerouslySetInnerHTML={{ __html: fonts }} />
      
      {/* Background Grid & Noise */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#F6EFE4 1px, transparent 1px), linear-gradient(90deg, #F6EFE4 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B2D] via-transparent to-[#0D1B2D] pointer-events-none" />

      {/* Top Telemetry Bar */}
      <div className="w-full border-b border-[#F6EFE4]/10 bg-[#0D1B2D]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-2 flex justify-between items-center text-[10px] font-mono tracking-widest text-[#F6EFE4]/60">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            SYSTEM.ONLINE
          </div>
          <div className="hidden sm:block">ROUTING.PROTOCOL: PEGASUS-V1</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <Activity size={12} className="text-[#C77A3A]" />
            GRID.STABLE
          </div>
          <div>{time || "LOADING..."}</div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-24 space-y-32">
        
        {/* DOCTRINE LINE */}
        <section className="relative text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-3 border border-[#C77A3A]/30 bg-[#C77A3A]/5 px-4 py-1.5 rounded-full text-[#C77A3A] font-['Montserrat'] text-[10px] uppercase tracking-[0.2em] font-bold">
            <Radio size={12} />
            System Motto
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-['Cinzel'] leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-[#F6EFE4] to-[#F6EFE4]/60 pb-2">
            Every property gets a path.<br />
            <span className="italic font-['Cormorant_Garamond'] text-[#F6EFE4]/80">Not every property gets an offer.</span>
          </h1>
          
          <h2 className="text-xl sm:text-2xl font-['Inter'] text-[#F6EFE4]/90 font-light tracking-wide border-b border-[#F6EFE4]/10 pb-8 inline-block">
            Bring us the property. We'll help find the path.
          </h2>
          
          <p className="font-['Space_Mono'] text-xs sm:text-sm text-[#F6EFE4]/50 leading-relaxed max-w-2xl mx-auto uppercase tracking-wider">
            &gt; Most groups want the property that fits their single playbook.
            <br />
            &gt; Pegasus is built differently. We review the situation,
            <br />
            &gt; then match it to the lane that fits, whether that lane is
            <br />
            &gt; ours or someone else's.
          </p>
        </section>

        {/* THREE STEPS PIPELINE */}
        <section className="relative">
          <div className="mb-12 border-b border-[#F6EFE4]/10 pb-4 flex items-center justify-between">
            <h3 className="font-['Montserrat'] text-xs text-[#F6EFE4]/60 uppercase tracking-[0.3em] font-bold flex items-center gap-3">
              <GitCommit size={14} className="text-[#C77A3A]" />
              Routing Pipeline Sequence
            </h3>
            <span className="font-mono text-[10px] text-[#F6EFE4]/40">SEQ_NO: 003</span>
          </div>

          <div className="grid md:grid-cols-3 gap-1 px-1 bg-[#F6EFE4]/10 p-1 rounded-sm border border-[#F6EFE4]/20 relative">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#F6EFE4]/10 -translate-y-1/2 hidden md:block" />
            
            {[
              {
                id: "01",
                phase: "INTAKE",
                title: "Submit the situation",
                desc: "Address, condition, what you're trying to solve. Two minutes.",
                status: "ACTIVE"
              },
              {
                id: "02",
                phase: "ANALYSIS",
                title: "Apollo reads it structurally",
                desc: "Comps, condition, capital stack, timeline, occupancy, exposure. The Pegasus lens.",
                status: "PROCESSING"
              },
              {
                id: "03",
                phase: "ROUTING",
                title: "We name the lane",
                desc: "One of the ten lanes, including a routed referral if Pegasus isn't the right fit.",
                status: "STANDBY"
              }
            ].map((step, i) => (
              <div key={step.id} className="relative z-10 bg-[#1E2328] border border-[#F6EFE4]/10 p-6 shadow-2xl flex flex-col justify-between h-full group hover:border-[#C77A3A]/50 transition-colors duration-500">
                <div className="flex justify-between items-start mb-12">
                  <div className="font-mono text-3xl text-[#F6EFE4]/20 font-bold group-hover:text-[#C77A3A]/40 transition-colors">
                    {step.id}
                  </div>
                  <div className="flex items-center gap-2 bg-[#0D1B2D] px-2 py-1 border border-[#F6EFE4]/10">
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-green-500 animate-pulse' : i === 1 ? 'bg-[#C77A3A]' : 'bg-[#F6EFE4]/30'}`} />
                    <span className="font-['Montserrat'] text-[8px] uppercase tracking-[0.2em] font-bold text-[#F6EFE4]/60">{step.phase}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-['Cinzel'] text-xl mb-3 text-[#F6EFE4]">{step.title}</h4>
                  <p className="font-['Space_Mono'] text-xs text-[#F6EFE4]/50 uppercase leading-relaxed tracking-wider">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TEN OUTCOME LANES SWITCHBOARD */}
        <section className="relative">
           <div className="mb-12 border-b border-[#F6EFE4]/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-['Montserrat'] text-xs text-[#F6EFE4]/60 uppercase tracking-[0.3em] font-bold flex items-center gap-3">
              <Database size={14} className="text-[#C77A3A]" />
              Destination Switchboard Grid
            </h3>
            <div className="flex gap-4 font-mono text-[10px] text-[#F6EFE4]/40">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500" /> ACTIVE_INTERNAL</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-blue-500" /> EXTERNAL_ROUTE</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-purple-500" /> MARKET_LISTING</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-[#F6EFE4]/10 border border-[#F6EFE4]/20 p-px">
            {[
              { id: "01", title: "Direct acquisition", desc: "Pegasus buys outright at a structurally honest number.", type: "internal", cycle: "14-21D", route: "ACQ-DIR" },
              { id: "02", title: "Creative finance", desc: "Seller-carry, subject-to, lease-option, non-conforming structures.", type: "internal", cycle: "VARIES", route: "FIN-CRT" },
              { id: "03", title: "Joint venture / co-GP", desc: "Capital + operational discipline brought to an aligned operator.", type: "internal", cycle: "30-60D", route: "JV-PTNR" },
              { id: "04", title: "Wholesale assignment", desc: "Route the deal to another operator in our network.", type: "external", cycle: "7-14D", route: "WHL-ASG" },
              { id: "05", title: "Listing through KW", desc: "Clean MLS listing via Apollo's Keller Williams East Bay license.", type: "market", cycle: "STD-MLS", route: "LST-KW" },
              { id: "06", title: "Buyer representation", desc: "Owner-occupant and investor-side buyer rep, same underwriting lens.", type: "market", cycle: "VARIES", route: "REP-BUY" },
              { id: "07", title: "BRRRR acquisition", desc: "Buy, rehab, rent, refinance, repeat. Held instead of resold.", type: "internal", cycle: "HOLD", route: "ACQ-BRR" },
              { id: "08", title: "ADU upside", desc: "Detached/attached ADUs on East Bay residential lots. Design, permit, build.", type: "internal", cycle: "180D+", route: "DEV-ADU" },
              { id: "09", title: "Value-add rehab", desc: "Heavy cosmetic + structural rehab to highest defensible value.", type: "internal", cycle: "90-120D", route: "DEV-REH" },
              { id: "10", title: "Routed referral", desc: "If the right path is outside Pegasus, route owner to a vetted operator.", type: "external", cycle: "N/A", route: "REF-OUT" },
            ].map((lane) => (
              <div key={lane.id} className="bg-[#1E2328] hover:bg-[#2A313C] p-5 transition-colors duration-200 group relative border border-transparent hover:border-[#C77A3A]/30 flex flex-col justify-between h-[280px]">
                
                <div className="flex justify-between items-start mb-6">
                  <span className="font-mono text-xl text-[#F6EFE4]/30">{lane.id}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    lane.type === 'internal' ? 'bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 
                    lane.type === 'external' ? 'bg-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 
                    'bg-purple-500/80 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                  }`} />
                </div>

                <div>
                  <h4 className="font-['Cinzel'] font-bold text-lg mb-2 leading-tight text-[#F6EFE4] group-hover:text-[#C77A3A] transition-colors">
                    {lane.title}
                  </h4>
                  <p className="font-['Inter'] text-xs text-[#F6EFE4]/50 leading-relaxed mb-6">
                    {lane.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F6EFE4]/5 grid grid-cols-2 gap-2 mt-auto">
                  <div>
                    <div className="font-['Montserrat'] text-[8px] uppercase tracking-[0.2em] text-[#F6EFE4]/30 mb-1">ROUTE_CODE</div>
                    <div className="font-mono text-[10px] text-[#F6EFE4]/70">{lane.route}</div>
                  </div>
                  <div>
                    <div className="font-['Montserrat'] text-[8px] uppercase tracking-[0.2em] text-[#F6EFE4]/30 mb-1">EST_CYCLE</div>
                    <div className="font-mono text-[10px] text-[#F6EFE4]/70">{lane.cycle}</div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="relative text-center border-t border-[#F6EFE4]/10 pt-24 pb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-2xl mx-auto">
            <a 
              href="/submit" 
              className="group relative w-full sm:w-auto bg-[#C77A3A] text-white px-8 py-5 font-['Montserrat'] text-xs uppercase tracking-[0.2em] font-bold overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Terminal size={14} />
                Submit a Property
              </span>
              <div className="absolute inset-0 bg-[#0D1B2D]/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </a>
            
            <a 
              href="/strategy-lab" 
              className="group relative w-full sm:w-auto border border-[#F6EFE4]/30 text-[#F6EFE4] hover:bg-[#F6EFE4]/5 px-8 py-5 font-['Montserrat'] text-xs uppercase tracking-[0.2em] font-bold transition-colors"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <GitMerge size={14} />
                Open Strategy Lab
              </span>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
