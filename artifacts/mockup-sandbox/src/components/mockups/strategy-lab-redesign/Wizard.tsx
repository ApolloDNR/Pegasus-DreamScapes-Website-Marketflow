import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import './_group.css';

export default function Wizard() {
  const [step, setStep] = useState(3);

  const steps = [
    { num: 1, label: 'Property' },
    { num: 2, label: 'Situation' },
    { num: 3, label: 'Numbers' },
    { num: 4, label: 'Verdict' },
  ];

  const fitScores = [
    { name: 'JV Partnership', score: 78, why: 'ARV gap supports equity split. Operator capacity needed.' },
    { name: 'Direct Acquisition', score: 64, why: 'Requires higher capital outlay. Margins tight.' },
    { name: 'Creative Finance', score: 58, why: 'Seller motivation moderate, but rates suboptimal.' },
    { name: 'Operator Referral', score: 55, why: 'Viable fallback if JV terms cannot be met.' },
    { name: 'Wholesale Assignment', score: 42, why: 'Spread too thin for typical wholesale buyer.' },
    { name: 'MLS Listing Referral', score: 30, why: 'Condition requires rehab before retail listing.' },
    { name: 'Capital Partner Match', score: 28, why: 'Lacks operator to execute the capital.' },
    { name: 'Strategy Education', score: 18, why: 'Submitter is experienced, education not primary need.' },
  ];

  const risks = [
    { name: 'ARV Comp Thinness', severity: 'Medium' },
    { name: '1982 Systems', severity: 'Medium' },
    { name: 'Financing Speed (HML)', severity: 'Medium' },
    { name: 'Exit Liquidity (Sacramento)', severity: 'Low' },
    { name: 'Occupancy Vacant', severity: 'Low' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--pd-cream)] text-[var(--pd-navy)] font-sans antialiased overflow-y-auto">
      {/* Stepper Header */}
      <header className="px-8 py-8 md:py-12 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const isPast = step > s.num;
              const isCurrent = step === s.num;
              
              return (
                <React.Fragment key={s.num}>
                  <button 
                    onClick={() => setStep(s.num)}
                    disabled={s.num > 4}
                    className="flex items-center gap-2 group focus:outline-none"
                  >
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300
                        ${isCurrent ? 'bg-[var(--pd-copper)] text-white' : 
                          isPast ? 'border border-[var(--pd-copper)] text-[var(--pd-copper)]' : 
                          'border border-black/10 text-black/40'}`}
                    >
                      {s.num}
                    </div>
                    <span 
                      className={`text-xs font-supporting uppercase tracking-widest hidden md:block transition-colors duration-300
                        ${isCurrent ? 'text-[var(--pd-copper)]' : 
                          isPast ? 'text-[var(--pd-navy)] group-hover:text-[var(--pd-copper)]' : 
                          'text-black/40'}`}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className="w-8 md:w-12 h-px bg-black/10 mx-2" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="text-sm font-serif italic text-black/50 hidden sm:block">
            Strategy Lab · Full Path Analyzer
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-8 py-4 max-w-4xl mx-auto w-full flex flex-col">
        
        {step === 3 && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Breadcrumbs of past steps */}
            <div className="flex flex-wrap gap-2 mb-12">
              <div className="px-3 py-1 bg-black/5 rounded-full text-xs font-medium font-mono text-black/60 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--pd-copper-soft)]"></span>
                1247 Aberdeen Way, Sacramento CA
              </div>
              <div className="px-3 py-1 bg-black/5 rounded-full text-xs font-medium font-mono text-black/60 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--pd-copper-soft)]"></span>
                Moderate Rehab · Vacant
              </div>
              <div className="px-3 py-1 bg-black/5 rounded-full text-xs font-medium font-mono text-black/60 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--pd-copper-soft)]"></span>
                Wholesaler · Off-market
              </div>
            </div>

            <div className="max-w-2xl mb-12">
              <h1 className="font-serif text-5xl md:text-6xl text-[var(--pd-navy)] leading-tight mb-4">
                Run the numbers
              </h1>
              <p className="font-serif italic text-xl md:text-2xl text-[var(--pd-copper)]">
                Structure the capital stack to reveal viable pathways.
              </p>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-16">
              <div className="space-y-2 border-b border-[var(--pd-rule)] pb-2">
                <label className="text-xs font-supporting uppercase tracking-widest text-[var(--pd-navy)]/60">Asking Price</label>
                <div className="flex items-center text-2xl font-mono text-[var(--pd-navy)]">
                  <span className="text-[var(--pd-copper-soft)] mr-1">$</span>
                  <input type="text" defaultValue="425,000" className="bg-transparent border-none outline-none w-full focus:ring-0 p-0" />
                </div>
              </div>
              
              <div className="space-y-2 border-b border-[var(--pd-rule)] pb-2">
                <label className="text-xs font-supporting uppercase tracking-widest text-[var(--pd-navy)]/60">Est. Rehab Budget</label>
                <div className="flex items-center text-2xl font-mono text-[var(--pd-navy)]">
                  <span className="text-[var(--pd-copper-soft)] mr-1">$</span>
                  <input type="text" defaultValue="65,000" className="bg-transparent border-none outline-none w-full focus:ring-0 p-0" />
                </div>
              </div>

              <div className="space-y-2 border-b border-[var(--pd-rule)] pb-2">
                <label className="text-xs font-supporting uppercase tracking-widest text-[var(--pd-navy)]/60">After-Repair Value (ARV)</label>
                <div className="flex items-center text-2xl font-mono text-[var(--pd-navy)]">
                  <span className="text-[var(--pd-copper-soft)] mr-1">$</span>
                  <input type="text" defaultValue="610,000" className="bg-transparent border-none outline-none w-full focus:ring-0 p-0" />
                </div>
              </div>

              <div className="space-y-2 border-b border-[var(--pd-rule)] pb-2">
                <label className="text-xs font-supporting uppercase tracking-widest text-[var(--pd-navy)]/60">Market Rent (Monthly)</label>
                <div className="flex items-center text-2xl font-mono text-[var(--pd-navy)]">
                  <span className="text-[var(--pd-copper-soft)] mr-1">$</span>
                  <input type="text" defaultValue="2,850" className="bg-transparent border-none outline-none w-full focus:ring-0 p-0" />
                </div>
              </div>

              <div className="space-y-2 border-b border-[var(--pd-rule)] pb-2">
                <label className="text-xs font-supporting uppercase tracking-widest text-[var(--pd-navy)]/60">Proposed Financing</label>
                <select className="w-full bg-transparent border-none outline-none text-xl md:text-2xl font-serif text-[var(--pd-navy)] focus:ring-0 p-0 appearance-none cursor-pointer">
                  <option>Hard Money Loan</option>
                  <option>Seller Finance</option>
                  <option>Subject To</option>
                  <option>Cash</option>
                </select>
              </div>

              <div className="space-y-2 border-b border-[var(--pd-rule)] pb-2">
                <label className="text-xs font-supporting uppercase tracking-widest text-[var(--pd-navy)]/60">Exit Strategy</label>
                <select className="w-full bg-transparent border-none outline-none text-xl md:text-2xl font-serif text-[var(--pd-navy)] focus:ring-0 p-0 appearance-none cursor-pointer">
                  <option>Fix & Flip</option>
                  <option>BRRRR</option>
                  <option>Turnkey Rental</option>
                  <option>Wholesale</option>
                </select>
              </div>
            </div>

            {/* Bottom Actions + Live Preview */}
            <div className="mt-auto flex flex-col md:flex-row items-end md:items-center justify-between gap-8 pb-12 pt-8">
              <div className="flex items-center gap-6 w-full md:w-auto order-2 md:order-1">
                <button 
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-4 text-sm font-supporting uppercase tracking-wider text-[var(--pd-navy)]/60 hover:text-[var(--pd-navy)] transition-colors group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
                <button 
                  onClick={() => setStep(4)}
                  className="flex items-center gap-3 px-8 py-4 bg-[var(--pd-copper)] text-white text-sm font-supporting uppercase tracking-wider hover:bg-[#b06a30] transition-colors"
                >
                  Continue to Verdict
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="order-1 md:order-2 w-full md:w-auto">
                <button className="text-sm text-[var(--pd-navy)]/40 hover:text-[var(--pd-navy)]/80 underline decoration-dotted underline-offset-4 transition-colors">
                  Skip — I don't know yet
                </button>
              </div>
            </div>
            
            {/* Floating Live Indicator */}
            <div className="fixed bottom-8 right-8 bg-[var(--pd-navy)] text-white p-4 pr-6 rounded-sm shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-8 duration-700 delay-300 z-50 max-w-[280px]">
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="2" fill="none" className="text-white/10" />
                  <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="120" strokeDashoffset="26.4" className="text-[var(--pd-copper)]" />
                </svg>
                <span className="absolute text-xs font-mono">78<span className="text-[8px]">%</span></span>
              </div>
              <div>
                <div className="text-[10px] font-supporting uppercase tracking-widest text-white/50 mb-0.5">Lane Forming</div>
                <div className="text-sm font-serif">JV Partnership</div>
              </div>
            </div>

            {/* Sneak peek of the verdict step below */}
            <div className="border-t border-[var(--pd-rule)] pt-12 pb-24 opacity-20 pointer-events-none select-none blur-[1px]">
              <h2 className="font-serif text-4xl mb-8">Here's the path.</h2>
              <div className="h-48 bg-black/5 rounded w-full"></div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-24">
            
            {/* Verdict Hero */}
            <div className="max-w-3xl mb-16">
              <h1 className="font-serif text-5xl md:text-6xl text-[var(--pd-navy)] leading-tight mb-4">
                Here's the path.
              </h1>
              <p className="font-serif italic text-xl md:text-2xl text-[var(--pd-copper)] mb-10">
                Where others see impossible, we see a path.
              </p>
              
              <div className="p-8 border border-[var(--pd-rule)] bg-white/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--pd-copper)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full border border-[var(--pd-copper)] flex items-center justify-center relative bg-[var(--pd-cream)]">
                      <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="31" stroke="currentColor" strokeWidth="2" fill="none" className="text-black/5" />
                        <circle cx="32" cy="32" r="31" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="195" strokeDashoffset="42.9" className="text-[var(--pd-copper)]" />
                      </svg>
                      <span className="text-lg font-mono text-[var(--pd-navy)]">78<span className="text-xs">%</span></span>
                    </div>
                    <div>
                      <h2 className="font-serif text-3xl text-[var(--pd-navy)]">JV Partnership</h2>
                      <div className="text-xs font-supporting uppercase tracking-widest text-[var(--pd-navy)]/60 mt-1">Primary Recommendation</div>
                    </div>
                  </div>
                  
                  <div className="text-2xl font-serif text-[var(--pd-navy)] mb-6 leading-snug">
                    ARV gap supports equity split. Operator capacity needed.
                  </div>
                  
                  <div className="inline-block px-4 py-2 bg-[var(--pd-navy)] text-white font-mono text-sm tracking-wider">
                    ~$48k profit / 22% IRR
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Grid: Memo & Risks + Fit Board */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column: Memo & Risks */}
              <div className="lg:col-span-7 space-y-12">
                <section>
                  <h3 className="text-sm font-supporting uppercase tracking-widest text-[var(--pd-navy)]/60 mb-6 border-b border-[var(--pd-rule)] pb-4">Decision Memo</h3>
                  <div className="prose prose-lg font-serif text-[var(--pd-navy)] leading-relaxed">
                    <p>
                      ARV–acquisition spread is genuine but operator capacity is the bottleneck.
                      Stress-tested at 10% ARV haircut the JV still clears. Next step: package for two
                      pre-vetted operators and re-confirm rehab scope within 5 business days.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-supporting uppercase tracking-widest text-[var(--pd-navy)]/60 mb-6 border-b border-[var(--pd-rule)] pb-4">Risk Register</h3>
                  <ul className="space-y-4">
                    {risks.map((risk, idx) => (
                      <li key={idx} className="flex items-center justify-between py-3 border-b border-black/5 last:border-0">
                        <span className="font-sans text-[var(--pd-navy)]">{risk.name}</span>
                        <div className="flex items-center gap-2">
                          {risk.severity === 'Medium' && <AlertTriangle className="w-4 h-4 text-[var(--pd-copper)]" />}
                          <span className={`text-xs font-mono uppercase tracking-widest px-2 py-1 bg-white
                            ${risk.severity === 'Medium' ? 'text-[var(--pd-copper)]' : 'text-black/40'}`}>
                            {risk.severity}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* Right Column: Fit Board */}
              <div className="lg:col-span-5">
                <section className="bg-white border border-[var(--pd-rule)] p-6">
                  <h3 className="text-sm font-supporting uppercase tracking-widest text-[var(--pd-navy)]/60 mb-6 pb-4 border-b border-[var(--pd-rule)]">All Outcomes</h3>
                  <div className="space-y-6">
                    {fitScores.map((fit, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between items-end mb-2">
                          <span className={`font-sans text-sm ${idx === 0 ? 'font-semibold text-[var(--pd-navy)]' : 'text-[var(--pd-navy)]/70'}`}>
                            {fit.name}
                          </span>
                          <span className="font-mono text-xs text-[var(--pd-navy)]/50">{fit.score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/5 overflow-hidden rounded-sm mb-2">
                          <div 
                            className={`h-full ${idx === 0 ? 'bg-[var(--pd-copper)]' : 'bg-black/20'}`} 
                            style={{ width: `${fit.score}%` }}
                          />
                        </div>
                        <p className="text-xs font-serif italic text-black/60 leading-tight">
                          {fit.why}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              
            </div>

            {/* Bottom Actions */}
            <div className="mt-16 flex items-center gap-6 pt-8 border-t border-[var(--pd-rule)]">
              <button 
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-4 text-sm font-supporting uppercase tracking-wider text-[var(--pd-navy)]/60 hover:text-[var(--pd-navy)] transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Numbers
              </button>
              <button 
                className="flex items-center gap-3 px-8 py-4 bg-[var(--pd-navy)] text-white text-sm font-supporting uppercase tracking-wider hover:bg-[var(--pd-charcoal)] transition-colors ml-auto"
              >
                Package & Share Deal
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
