import React, { useState } from "react";
import { 
  Calculator, 
  GripVertical, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Share2, 
  MessageSquare, 
  Send,
  Plus,
  Home,
  DollarSign,
  TrendingUp,
  RefreshCcw,
  Percent,
  Key,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TOOLS = [
  { id: "arv", name: "ARV PROJECTION", icon: Home },
  { id: "roi", name: "ROI / FLIP", icon: TrendingUp },
  { id: "brrrr", name: "BRRRR METRICS", icon: RefreshCcw },
  { id: "cashflow", name: "CASH FLOW", icon: DollarSign },
  { id: "wholesale", name: "WHOLESALE", icon: Building },
  { id: "piti", name: "PITI SCHEDULE", icon: Percent },
  { id: "own_rent", name: "OWN VS RENT", icon: Key },
  { id: "hard_money", name: "HARD MONEY", icon: Calculator },
];

export function Workbench() {
  return (
    <div className="min-h-screen bg-[#F6EFE4] text-[#1E2328] font-['Inter'] relative selection:bg-[#C77A3A]/20 selection:text-[#0D1B2D]">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Montserrat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        .blueprint-grid {
          background-size: 20px 20px;
          background-image: 
            linear-gradient(to right, rgba(13, 27, 45, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(13, 27, 45, 0.04) 1px, transparent 1px);
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #C77A3A;
          border-radius: 10px;
        }
      `}} />

      {/* Hero Header */}
      <header className="border-b border-[#0D1B2D]/10 bg-[#F6EFE4]/95 sticky top-0 z-20 backdrop-blur-sm">
        <div className="px-8 py-6 max-w-[1600px] mx-auto flex items-end justify-between">
          <div>
            <div className="font-montserrat text-[10px] tracking-[0.2em] text-[#C77A3A] mb-2 font-semibold">DEAL ARCHITECT'S DESK</div>
            <h1 className="font-serif text-4xl text-[#0D1B2D] leading-none">Build the deal. One instrument at a time.</h1>
          </div>
          <div className="text-right pb-1">
            <div className="font-mono text-xs text-[#0D1B2D]/50 uppercase">Active Deal Sheet</div>
            <div className="font-cinzel text-lg text-[#0D1B2D]">1247 Aberdeen Way</div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex max-w-[1600px] mx-auto h-[calc(100vh-101px)]">
        
        {/* Left Rail: Toolbox */}
        <aside className="w-[260px] border-r border-[#0D1B2D]/10 flex flex-col bg-[#F6EFE4] shrink-0 h-full overflow-y-auto hidden lg:flex">
          <div className="p-6">
            <div className="font-montserrat text-[10px] tracking-[0.1em] text-[#0D1B2D]/60 mb-6 uppercase border-b border-[#0D1B2D]/10 pb-2">Instrument Library</div>
            
            <div className="flex flex-col gap-2">
              {TOOLS.map((tool) => (
                <button 
                  key={tool.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-[#0D1B2D]/5 group transition-colors text-left border border-transparent hover:border-[#C77A3A]/20"
                >
                  <tool.icon className="w-4 h-4 text-[#0D1B2D]/40 group-hover:text-[#C77A3A] transition-colors" />
                  <span className="font-mono text-[11px] text-[#0D1B2D]/80 group-hover:text-[#0D1B2D] transition-colors tracking-wide">{tool.name}</span>
                  <Plus className="w-3 h-3 ml-auto text-[#0D1B2D]/0 group-hover:text-[#C77A3A] transition-all opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Deal Sheet (Canvas) */}
        <main className="flex-1 bg-[#F6EFE4] blueprint-grid relative h-full overflow-y-auto">
          <div className="max-w-2xl mx-auto py-12 px-6 lg:px-12 flex flex-col gap-6 pb-32">
            
            {/* Context Card */}
            <div className="bg-[#F6EFE4] border border-[#0D1B2D]/20 p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#0D1B2D]/20"></div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-cinzel text-xl text-[#0D1B2D] mb-1">Subject Property</h3>
                  <p className="font-mono text-xs text-[#0D1B2D]/60">1247 Aberdeen Way, Sacramento CA 95820</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-[#0D1B2D]/40 mb-1">Acquisition Target</div>
                  <div className="font-montserrat text-lg text-[#0D1B2D] font-medium">$285,000</div>
                </div>
              </div>
            </div>

            {/* Calculator Stack */}
            <div className="flex flex-col gap-6 relative">
              
              {/* Connector line behind cards */}
              <div className="absolute left-[20px] top-[20px] bottom-[20px] w-px bg-[#0D1B2D]/10 z-0"></div>

              {/* ARV Card */}
              <div className="bg-[#F6EFE4] border border-[#C77A3A]/30 shadow-[0_2px_10px_rgba(13,27,45,0.02)] relative z-10 transition-all hover:border-[#C77A3A]/50 group">
                {/* Drag Handle & Controls */}
                <div className="flex items-center justify-between border-b border-[#0D1B2D]/10 px-3 py-2 bg-white/40">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-[#0D1B2D]/20 cursor-grab hover:text-[#C77A3A]" />
                    <span className="font-mono text-[10px] tracking-wider text-[#0D1B2D]/60 uppercase">01 / After Repair Value</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-[#0D1B2D]/5 rounded"><ChevronUp className="w-3.5 h-3.5 text-[#0D1B2D]/40" /></button>
                    <button className="p-1 hover:bg-[#0D1B2D]/5 rounded"><X className="w-3.5 h-3.5 text-[#0D1B2D]/40" /></button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5 flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] text-[#0D1B2D]/50 mb-1">As-Is Value</label>
                      <input type="text" value="$285,000" readOnly className="w-full bg-white/50 border border-[#0D1B2D]/10 rounded-sm px-3 py-1.5 font-mono text-sm text-[#0D1B2D] focus:outline-none focus:border-[#C77A3A]/50" />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-[#0D1B2D]/50 mb-1">Estimated Rehab</label>
                      <input type="text" value="$62,000" readOnly className="w-full bg-white/50 border border-[#0D1B2D]/10 rounded-sm px-3 py-1.5 font-mono text-sm text-[#0D1B2D] focus:outline-none focus:border-[#C77A3A]/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                      <label className="block font-mono text-[10px] text-[#0D1B2D]/50 mb-1">Comp A (1240 Aberdeen)</label>
                      <input type="text" value="$485,000" readOnly className="w-full bg-white/50 border border-[#0D1B2D]/10 rounded-sm px-3 py-1.5 font-mono text-sm text-[#0D1B2D] focus:outline-none focus:border-[#C77A3A]/50" />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-[#0D1B2D]/50 mb-1">Comp B (1301 Aberdeen)</label>
                      <input type="text" value="$465,000" readOnly className="w-full bg-white/50 border border-[#0D1B2D]/10 rounded-sm px-3 py-1.5 font-mono text-sm text-[#0D1B2D] focus:outline-none focus:border-[#C77A3A]/50" />
                    </div>
                  </div>
                  
                  {/* Card Output */}
                  <div className="mt-2 bg-[#0D1B2D]/[0.02] border-t border-[#0D1B2D]/10 -mx-5 -mb-5 p-4 flex justify-between items-center">
                    <span className="font-montserrat text-xs tracking-widest text-[#0D1B2D]/60">COMPUTED ARV</span>
                    <span className="font-serif text-2xl text-[#C77A3A]">$475,000</span>
                  </div>
                </div>
              </div>

              {/* BRRRR Card */}
              <div className="bg-[#F6EFE4] border border-[#C77A3A]/30 shadow-[0_2px_10px_rgba(13,27,45,0.02)] relative z-10 transition-all hover:border-[#C77A3A]/50 group">
                <div className="flex items-center justify-between border-b border-[#0D1B2D]/10 px-3 py-2 bg-white/40">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-[#0D1B2D]/20 cursor-grab hover:text-[#C77A3A]" />
                    <span className="font-mono text-[10px] tracking-wider text-[#0D1B2D]/60 uppercase">02 / BRRRR Refinance</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-[#0D1B2D]/5 rounded"><ChevronUp className="w-3.5 h-3.5 text-[#0D1B2D]/40" /></button>
                    <button className="p-1 hover:bg-[#0D1B2D]/5 rounded"><X className="w-3.5 h-3.5 text-[#0D1B2D]/40" /></button>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] text-[#0D1B2D]/50 mb-1">Holding Costs</label>
                      <input type="text" value="$11,500" readOnly className="w-full bg-white/50 border border-[#0D1B2D]/10 rounded-sm px-3 py-1.5 font-mono text-sm text-[#0D1B2D] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-[#0D1B2D]/50 mb-1">Closing Costs</label>
                      <input type="text" value="$14,250" readOnly className="w-full bg-white/50 border border-[#0D1B2D]/10 rounded-sm px-3 py-1.5 font-mono text-sm text-[#0D1B2D] focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] text-[#0D1B2D]/50 mb-1">Refi LTV %</label>
                      <input type="text" value="75%" readOnly className="w-full bg-white/50 border border-[#0D1B2D]/10 rounded-sm px-3 py-1.5 font-mono text-sm text-[#0D1B2D] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-[#0D1B2D]/50 mb-1">New Loan Amount</label>
                      <input type="text" value="$356,250" readOnly className="w-full bg-white/50 border border-transparent rounded-sm px-3 py-1.5 font-mono text-sm text-[#0D1B2D]/60" />
                    </div>
                  </div>
                  
                  <div className="mt-2 bg-[#0D1B2D]/[0.02] border-t border-[#0D1B2D]/10 -mx-5 -mb-5 p-4 flex justify-between items-center">
                    <span className="font-montserrat text-xs tracking-widest text-[#0D1B2D]/60">CAPITAL LEFT IN DEAL</span>
                    <span className="font-serif text-2xl text-[#1E2328]">$24,400</span>
                  </div>
                </div>
              </div>

              {/* Cash Flow Card */}
              <div className="bg-[#F6EFE4] border border-[#C77A3A]/30 shadow-[0_2px_10px_rgba(13,27,45,0.02)] relative z-10 transition-all hover:border-[#C77A3A]/50 group">
                <div className="flex items-center justify-between border-b border-[#0D1B2D]/10 px-3 py-2 bg-white/40">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-[#0D1B2D]/20 cursor-grab hover:text-[#C77A3A]" />
                    <span className="font-mono text-[10px] tracking-wider text-[#0D1B2D]/60 uppercase">03 / Cash Flow Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-[#0D1B2D]/5 rounded"><ChevronDown className="w-3.5 h-3.5 text-[#0D1B2D]/40" /></button>
                    <button className="p-1 hover:bg-[#0D1B2D]/5 rounded"><X className="w-3.5 h-3.5 text-[#0D1B2D]/40" /></button>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col gap-5 hidden">
                  {/* Collapsed state simulation */}
                </div>
                
                <div className="p-5 flex flex-col gap-5">
                   <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] text-[#0D1B2D]/50 mb-1">Gross Rent</label>
                      <input type="text" value="$3,100" readOnly className="w-full bg-white/50 border border-[#0D1B2D]/10 rounded-sm px-3 py-1.5 font-mono text-sm text-[#0D1B2D] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-[#0D1B2D]/50 mb-1">OpEx (Taxes, Ins, PM, Maint)</label>
                      <input type="text" value="$845" readOnly className="w-full bg-white/50 border border-[#0D1B2D]/10 rounded-sm px-3 py-1.5 font-mono text-sm text-[#0D1B2D] focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#0D1B2D]/50 mb-1">Debt Service (Refi Loan)</label>
                    <input type="text" value="$1,870" readOnly className="w-full bg-white/50 border border-[#0D1B2D]/10 rounded-sm px-3 py-1.5 font-mono text-sm text-[#0D1B2D] focus:outline-none" />
                  </div>

                  <div className="mt-2 bg-[#0D1B2D]/[0.02] border-t border-[#0D1B2D]/10 -mx-5 -mb-5 p-4 flex justify-between items-center">
                    <span className="font-montserrat text-xs tracking-widest text-[#0D1B2D]/60">NET CASH FLOW</span>
                    <span className="font-serif text-2xl text-[#C77A3A]">$385<span className="text-sm text-[#0D1B2D]/40 font-mono ml-1">/mo</span></span>
                  </div>
                </div>
              </div>

            </div>

            {/* Empty Add State */}
            <button className="border border-dashed border-[#0D1B2D]/20 rounded-sm py-6 text-center hover:bg-white/30 hover:border-[#C77A3A]/40 transition-colors group">
              <Plus className="w-5 h-5 mx-auto text-[#0D1B2D]/30 group-hover:text-[#C77A3A] mb-2 transition-colors" />
              <span className="font-mono text-xs text-[#0D1B2D]/50 group-hover:text-[#0D1B2D]/80">Drag or click a tool from the library</span>
            </button>

          </div>

          {/* Inline Action Bar */}
          <div className="fixed bottom-0 left-[260px] right-[280px] bg-[#F6EFE4]/90 backdrop-blur-md border-t border-[#0D1B2D]/10 p-4 flex justify-between items-center z-20">
            <div className="flex gap-4">
              <button className="flex items-center gap-2 font-mono text-[11px] text-[#0D1B2D]/60 hover:text-[#0D1B2D] transition-colors">
                <Download className="w-3.5 h-3.5" /> EXPORT PDF
              </button>
              <button className="flex items-center gap-2 font-mono text-[11px] text-[#0D1B2D]/60 hover:text-[#0D1B2D] transition-colors">
                <Share2 className="w-3.5 h-3.5" /> SHARE SHEET
              </button>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="font-mono text-[11px] h-8 rounded-sm border-[#0D1B2D]/20 hover:bg-[#0D1B2D]/5 text-[#0D1B2D]">
                <MessageSquare className="w-3.5 h-3.5 mr-2" /> ASK PEGGY
              </Button>
              <Button className="font-mono text-[11px] h-8 rounded-sm bg-[#0D1B2D] hover:bg-[#C77A3A] text-[#F6EFE4] transition-colors">
                <Send className="w-3.5 h-3.5 mr-2" /> SUBMIT DEAL
              </Button>
            </div>
          </div>
        </main>

        {/* Right Rail: Deal Rollup */}
        <aside className="w-[280px] border-l border-[#0D1B2D]/10 bg-[#1E2328] text-[#F6EFE4] shrink-0 h-full overflow-y-auto hidden xl:block">
          <div className="p-6">
            <div className="font-montserrat text-[10px] tracking-[0.1em] text-[#F6EFE4]/50 mb-8 uppercase border-b border-[#F6EFE4]/10 pb-2">Deal Rollup</div>

            <div className="space-y-8">
              <div>
                <div className="font-mono text-[10px] text-[#F6EFE4]/50 mb-1 uppercase">Total Capital In</div>
                <div className="font-serif text-3xl text-[#C77A3A]">$372,750</div>
                <div className="font-mono text-[9px] text-[#F6EFE4]/40 mt-1">Acq + Rehab + Hold + Close</div>
              </div>

              <div>
                <div className="font-mono text-[10px] text-[#F6EFE4]/50 mb-1 uppercase">All-In Basis</div>
                <div className="font-montserrat text-xl text-[#F6EFE4] font-light">76.1%</div>
                <div className="font-mono text-[9px] text-[#F6EFE4]/40 mt-1">Of computed ARV ($475k)</div>
              </div>

              <div>
                <div className="font-mono text-[10px] text-[#F6EFE4]/50 mb-1 uppercase">Est. Equity Position</div>
                <div className="font-montserrat text-xl text-[#F6EFE4] font-light">$113,250</div>
                <div className="font-mono text-[9px] text-[#F6EFE4]/40 mt-1">Post-rehab forced appreciation</div>
              </div>

              <div className="pt-6 border-t border-[#F6EFE4]/10">
                <div className="font-mono text-[10px] text-[#F6EFE4]/50 mb-3 uppercase">Suggested Lane</div>
                <div className="bg-[#C77A3A]/10 border border-[#C77A3A]/30 rounded-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCcw className="w-4 h-4 text-[#C77A3A]" />
                    <span className="font-cinzel text-sm text-[#C77A3A]">BRRRR</span>
                  </div>
                  <p className="font-mono text-[10px] text-[#F6EFE4]/70 leading-relaxed">
                    Strong equity capture and minimal cash left in deal ($24.4k). Cash flow ($385/mo) supports debt service comfortably.
                  </p>
                </div>
              </div>
              
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
