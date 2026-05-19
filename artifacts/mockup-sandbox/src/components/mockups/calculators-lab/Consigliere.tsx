import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Download, Bookmark, FileText, ChevronRight, Activity, Percent, ArrowRight } from "lucide-react";

export function Consigliere() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="min-h-[100dvh] bg-[#F6EFE4] text-[#1E2328] font-['Inter'] relative flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&family=Montserrat:wght@400;500;600&display=swap');
        
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-caps { font-family: 'Cinzel', serif; }
        .font-kicker { font-family: 'Montserrat', sans-serif; }
        
        .editable-value {
          color: #C77A3A;
          border-bottom: 1px dashed #C77A3A;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .editable-value:hover {
          background-color: rgba(199, 122, 58, 0.1);
        }
        
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />

      {/* Header / Actions Rail */}
      <header className="w-full flex justify-between items-start p-8 absolute top-0 left-0 z-10">
        <div>
          {/* Logo area could go here */}
        </div>
        <div className="flex gap-4 items-center bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-[#0D1B2D]/10 shadow-sm">
          <button className="flex items-center gap-2 text-sm font-kicker tracking-widest text-[#0D1B2D] hover:text-[#C77A3A] transition-colors uppercase text-xs">
            <Bookmark className="w-4 h-4" /> Save Deal Sheet
          </button>
          <div className="w-px h-4 bg-[#0D1B2D]/20"></div>
          <button className="flex items-center gap-2 text-sm font-kicker tracking-widest text-[#0D1B2D] hover:text-[#C77A3A] transition-colors uppercase text-xs">
            <Download className="w-4 h-4" /> PDF
          </button>
          <div className="w-px h-4 bg-[#0D1B2D]/20"></div>
          <button className="flex items-center gap-2 text-sm font-kicker tracking-widest text-[#0D1B2D] hover:text-[#C77A3A] transition-colors uppercase text-xs">
            <FileText className="w-4 h-4" /> MarketFlow
          </button>
        </div>
      </header>

      {/* Main Stream */}
      <main className="flex-1 w-full max-w-[880px] mx-auto pt-32 pb-48 px-6 flex flex-col">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="font-kicker text-sm tracking-[0.2em] text-[#C77A3A] uppercase mb-4">Ask The Architect</p>
          <h1 className="font-serif text-5xl md:text-6xl text-[#0D1B2D] leading-tight">
            Tell me about the property.<br />I'll do the math.
          </h1>
        </div>

        {/* Conversation Stream */}
        <div className="flex flex-col gap-10">
          
          {/* User Bubble */}
          <div className="flex justify-end w-full">
            <div className="max-w-[80%] md:max-w-[60%] text-right">
              <div className="bg-[#1E2328] text-[#F6EFE4] px-6 py-4 rounded-2xl rounded-tr-sm text-lg font-light leading-relaxed shadow-sm">
                1247 Aberdeen Way, Sacramento. Asking $285k. Needs about $62k of work. Comps suggest $475k ARV.
              </div>
            </div>
          </div>

          {/* Peggy Bubble 1 */}
          <div className="flex justify-start w-full gap-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0D1B2D] flex items-center justify-center text-[#C77A3A] font-caps text-lg border-2 border-[#C77A3A]/30">
              P
            </div>
            <div className="max-w-[85%] md:max-w-[75%]">
              <div className="bg-white/60 backdrop-blur-sm border border-[#C77A3A]/20 px-8 py-6 rounded-3xl rounded-tl-sm shadow-sm relative">
                <p className="font-serif text-2xl text-[#0D1B2D] mb-4 leading-normal">
                  Reading this as a BRRRR candidate, not a flip. Here's why.
                </p>
                <p className="text-[#1E2328] text-lg leading-relaxed mb-8 font-light">
                  At <span className="editable-value">$285,000</span> purchase + <span className="editable-value">$62,000</span> rehab + <span className="editable-value">$11,500</span> holding + <span className="editable-value">$14,250</span> closing, your all-in basis is <strong>$372,750</strong>. Against a <span className="editable-value">$475,000</span> ARV, that's 78.5% ARV. Inside the 75% rule, with a thin margin.
                </p>
                
                {/* Numeric Strip */}
                <div className="flex flex-wrap gap-x-12 gap-y-6 pt-6 border-t border-[#0D1B2D]/10">
                  <div>
                    <p className="font-kicker text-xs tracking-widest text-[#0D1B2D]/50 uppercase mb-1">All-In Basis</p>
                    <p className="font-serif text-3xl text-[#0D1B2D]">$372,750</p>
                  </div>
                  <div>
                    <p className="font-kicker text-xs tracking-widest text-[#0D1B2D]/50 uppercase mb-1">ARV Ratio</p>
                    <p className="font-serif text-3xl text-[#0D1B2D]">78.5%</p>
                  </div>
                  <div>
                    <p className="font-kicker text-xs tracking-widest text-[#0D1B2D]/50 uppercase mb-1">Refi Cash Out</p>
                    <p className="font-serif text-3xl text-[#0D1B2D]">$356,250</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Peggy Bubble 2 */}
          <div className="flex justify-start w-full gap-6 mt-2">
            <div className="flex-shrink-0 w-10"></div>
            <div className="max-w-[85%] md:max-w-[75%]">
              <div className="bg-white/60 backdrop-blur-sm border border-[#C77A3A]/20 px-8 py-6 rounded-3xl shadow-sm">
                <p className="text-[#1E2328] text-lg leading-relaxed mb-8 font-light">
                  If you refinance at <span className="editable-value">75%</span> LTV after seasoning, you pull $356,250, leaving <strong>$16,500</strong> in the deal. Cash flow at <span className="editable-value">$1,950</span> rent − PITI <span className="editable-value">$1,565</span> = <strong>$385/mo</strong>. Cash-on-cash on remaining capital: ~28%.
                </p>
                
                {/* Numeric Strip */}
                <div className="flex flex-wrap gap-x-12 gap-y-6 pt-6 border-t border-[#0D1B2D]/10">
                  <div>
                    <p className="font-kicker text-xs tracking-widest text-[#0D1B2D]/50 uppercase mb-1">Cash Left In</p>
                    <p className="font-serif text-3xl text-[#0D1B2D]">$16,500</p>
                  </div>
                  <div>
                    <p className="font-kicker text-xs tracking-widest text-[#0D1B2D]/50 uppercase mb-1">Cash Flow</p>
                    <p className="font-serif text-3xl text-[#0D1B2D]">$385<span className="text-lg text-[#0D1B2D]/50">/mo</span></p>
                  </div>
                  <div>
                    <p className="font-kicker text-xs tracking-widest text-[#0D1B2D]/50 uppercase mb-1">Cash-on-Cash</p>
                    <p className="font-serif text-3xl text-[#0D1B2D]">28.0%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verdict Card */}
          <div className="flex justify-start w-full gap-6 mt-4">
            <div className="flex-shrink-0 w-10"></div>
            <div className="max-w-[85%] md:max-w-[75%] w-full">
              <div className="bg-[#0D1B2D] text-[#F6EFE4] px-8 py-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C77A3A] opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <h3 className="font-kicker text-xs tracking-[0.2em] text-[#C77A3A] uppercase mb-4">Structural Verdict</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex gap-4 items-start">
                    <div className="mt-1"><ArrowRight className="w-5 h-5 text-[#C77A3A]" /></div>
                    <div>
                      <p className="font-serif text-2xl mb-1">Best fit: BRRRR.</p>
                      <p className="font-light text-white/70">The numbers support a strong hold strategy with minimal capital trapped.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="mt-1"><ArrowRight className="w-5 h-5 text-white/30" /></div>
                    <div>
                      <p className="font-serif text-xl mb-1 text-white/80">Second look: JV with capital partner.</p>
                      <p className="font-light text-white/50">If you want to scale this approach across multiple properties.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10">
                  <button className="px-5 py-2.5 rounded-full border border-white/20 hover:border-[#C77A3A] hover:bg-[#C77A3A]/10 transition-all text-sm font-medium flex items-center gap-2">
                    Run as Flip instead
                  </button>
                  <button className="px-5 py-2.5 rounded-full border border-white/20 hover:border-[#C77A3A] hover:bg-[#C77A3A]/10 transition-all text-sm font-medium flex items-center gap-2">
                    What if rehab is $80k?
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Fixed Input Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#F6EFE4] via-[#F6EFE4] to-transparent pt-20 pb-8 px-6 z-20">
        <div className="max-w-[880px] mx-auto">
          
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-2 pl-2">
            <button className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/60 border border-[#0D1B2D]/10 text-xs font-kicker tracking-wider uppercase text-[#0D1B2D]/70 hover:text-[#0D1B2D] hover:bg-white transition-all shadow-sm">
              Run BRRRR
            </button>
            <button className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/60 border border-[#0D1B2D]/10 text-xs font-kicker tracking-wider uppercase text-[#0D1B2D]/70 hover:text-[#0D1B2D] hover:bg-white transition-all shadow-sm">
              Run Flip ROI
            </button>
            <button className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/60 border border-[#0D1B2D]/10 text-xs font-kicker tracking-wider uppercase text-[#0D1B2D]/70 hover:text-[#0D1B2D] hover:bg-white transition-all shadow-sm">
              Compare Own vs Rent
            </button>
          </div>

          <div className="relative flex items-center bg-white rounded-2xl shadow-lg border border-[#0D1B2D]/10 p-2 focus-within:ring-2 focus-within:ring-[#C77A3A]/30 focus-within:border-[#C77A3A]/50 transition-all">
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe a property, a scenario, or ask a question..." 
              className="border-0 focus-visible:ring-0 shadow-none text-lg py-6 px-4 bg-transparent placeholder:text-[#0D1B2D]/30 placeholder:font-light"
            />
            <Button className="rounded-xl bg-[#C77A3A] hover:bg-[#A9662E] text-white px-6 py-6 font-kicker tracking-widest uppercase text-sm h-auto flex items-center gap-2">
              Ask <Send className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="mt-4 text-center">
             <button className="text-xs font-kicker tracking-widest uppercase text-[#0D1B2D]/40 hover:text-[#0D1B2D]/70 transition-colors flex items-center justify-center gap-1 mx-auto">
                What calculators can Peggy run? <ChevronRight className="w-3 h-3" />
             </button>
             <p className="text-[10px] text-[#0D1B2D]/30 mt-2 font-kicker uppercase tracking-widest max-w-[600px] mx-auto leading-relaxed">
               ARV • ROI/Flip • BRRRR • Cash Flow • Wholesale • PITI • Own vs Rent • Hard Money
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
