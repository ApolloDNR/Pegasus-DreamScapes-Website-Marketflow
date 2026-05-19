import React from 'react';
import './_group.css';
import { ArrowRight, CheckCircle2, ChevronRight, CornerDownRight, ShieldAlert } from 'lucide-react';

export function Conversation() {
  return (
    <div 
      className="min-h-screen bg-pd-cream text-pd-navy selection:bg-pd-copper selection:text-white"
      style={{
        backgroundColor: 'var(--pd-cream)',
        color: 'var(--pd-navy)',
        fontFamily: 'var(--pd-font-sans)'
      }}
    >
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between border-b border-pd-rule">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-pd-copper animate-pulse" />
          <span 
            className="text-[10px] tracking-[0.15em] uppercase text-pd-navy/60 font-medium"
            style={{ fontFamily: 'var(--pd-font-supporting)' }}
          >
            Peggy · Strategy Assistant
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-xs uppercase tracking-widest text-pd-copper hover:text-pd-navy transition-colors" style={{ fontFamily: 'var(--pd-font-supporting)' }}>
            Reset Session
          </button>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-6 py-16 pb-32">
        {/* Conversation History */}
        <div className="space-y-12 mb-12">
          {/* Exchange 1 */}
          <div className="group relative pl-6 border-l-2 border-pd-rule/40 hover:border-pd-copper/40 transition-colors">
            <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-pd-cream border-2 border-pd-rule group-hover:border-pd-copper transition-colors" />
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-[10px] tracking-widest uppercase text-pd-navy/40 mt-1 w-12 shrink-0" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Peggy</span>
                <p className="text-lg leading-relaxed font-serif text-pd-charcoal" style={{ fontFamily: 'var(--pd-font-serif)' }}>
                  Let's map out this opportunity. What is the identity of the property?
                </p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[10px] tracking-widest uppercase text-pd-copper mt-1 w-12 shrink-0" style={{ fontFamily: 'var(--pd-font-supporting)' }}>You</span>
                <p className="text-base text-pd-navy bg-white/50 px-4 py-3 rounded border border-pd-rule">
                  1247 Aberdeen Way, Sacramento CA 95820.<br/>
                  <span className="text-sm text-pd-navy/60 mt-1 block">3 bed / 2.5 bath / 1,850 sqft · Built 1982</span>
                </p>
              </div>
            </div>
          </div>

          {/* Exchange 2 */}
          <div className="group relative pl-6 border-l-2 border-pd-rule/40 hover:border-pd-copper/40 transition-colors">
            <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-pd-cream border-2 border-pd-rule group-hover:border-pd-copper transition-colors" />
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-[10px] tracking-widest uppercase text-pd-navy/40 mt-1 w-12 shrink-0" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Peggy</span>
                <p className="text-lg leading-relaxed font-serif text-pd-charcoal" style={{ fontFamily: 'var(--pd-font-serif)' }}>
                  Understood. Sacramento market. What are the core acquisition numbers?
                </p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[10px] tracking-widest uppercase text-pd-copper mt-1 w-12 shrink-0" style={{ fontFamily: 'var(--pd-font-supporting)' }}>You</span>
                <div className="flex gap-4">
                  <div className="bg-white/50 px-4 py-3 rounded border border-pd-rule">
                    <span className="text-[10px] tracking-widest uppercase text-pd-navy/40 block mb-1" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Asking</span>
                    <span className="font-mono text-pd-navy">$425,000</span>
                  </div>
                  <div className="bg-white/50 px-4 py-3 rounded border border-pd-rule">
                    <span className="text-[10px] tracking-widest uppercase text-pd-navy/40 block mb-1" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Rehab</span>
                    <span className="font-mono text-pd-navy">$65,000</span>
                  </div>
                  <div className="bg-white/50 px-4 py-3 rounded border border-pd-rule">
                    <span className="text-[10px] tracking-widest uppercase text-pd-navy/40 block mb-1" style={{ fontFamily: 'var(--pd-font-supporting)' }}>ARV</span>
                    <span className="font-mono text-pd-navy">$610,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Question */}
          <div className="relative pl-6 border-l-2 border-pd-copper">
            <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-pd-copper" />
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="text-[10px] tracking-widest uppercase text-pd-copper mt-1 w-12 shrink-0" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Peggy</span>
                <div className="space-y-4">
                  <p className="text-2xl leading-relaxed text-pd-charcoal" style={{ fontFamily: 'var(--pd-font-serif)' }}>
                    The ARV-acquisition spread is solid. Before I run the final structural reads, what is your intended exit strategy and current situation?
                  </p>
                  <p className="text-sm text-pd-navy/60 leading-relaxed max-w-lg">
                    This helps me weigh operator referrals against direct acquisition or JV models.
                  </p>
                </div>
              </div>

              {/* Active Composer */}
              <div className="flex items-start gap-4 ml-16 relative">
                <div className="absolute -left-[30px] top-4 text-pd-copper opacity-50">
                  <CornerDownRight size={16} />
                </div>
                <div className="flex-1 bg-white rounded-lg border-2 border-pd-copper/20 shadow-sm focus-within:border-pd-copper transition-colors overflow-hidden">
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] tracking-widest uppercase text-pd-navy/60" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Intended Exit</label>
                        <select className="w-full bg-transparent border-b border-pd-rule py-2 text-pd-navy focus:outline-none focus:border-pd-copper text-sm">
                          <option>Select strategy...</option>
                          <option>Fix & Flip</option>
                          <option>Buy & Hold</option>
                          <option>Wholesale</option>
                          <option>Unsure / Seeking Advice</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] tracking-widest uppercase text-pd-navy/60" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Deal Status</label>
                        <select className="w-full bg-transparent border-b border-pd-rule py-2 text-pd-navy focus:outline-none focus:border-pd-copper text-sm">
                          <option>Select status...</option>
                          <option>Under Contract</option>
                          <option>Evaluating</option>
                          <option>Making Offer</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] tracking-widest uppercase text-pd-navy/60" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Motivation / Context</label>
                      <textarea 
                        className="w-full bg-transparent border border-pd-rule rounded p-3 text-pd-navy focus:outline-none focus:border-pd-copper resize-none text-sm placeholder:text-pd-navy/30"
                        rows={2}
                        placeholder="e.g. Need operator capacity to execute rehab..."
                      />
                    </div>
                  </div>
                  <div className="bg-pd-cream/50 p-3 border-t border-pd-rule flex justify-end">
                    <button className="bg-pd-navy text-pd-cream px-6 py-2 text-sm font-medium hover:bg-pd-copper transition-colors flex items-center gap-2" style={{ fontFamily: 'var(--pd-font-supporting)' }}>
                      Send to Peggy <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verdict Progress Panel (Sticky-ish bottom) */}
        <div className="mt-16 bg-white border border-pd-rule shadow-sm relative overflow-hidden">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 h-1 bg-pd-rule w-full">
            <div className="h-full bg-pd-copper w-[65%] transition-all duration-1000" />
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-pd-copper">
                <span className="text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Verdict Crystallizing</span>
                <span className="w-1 h-1 rounded-full bg-pd-copper animate-ping" />
              </div>
              <div className="text-right">
                <div className="text-xs text-pd-navy/60 uppercase tracking-wider" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Data Completion</div>
                <div className="font-mono text-pd-navy">65%</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Primary Read */}
              <div className="col-span-12 md:col-span-5 space-y-6">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-pd-navy/40 mb-2" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Top Emerging Lane</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl text-pd-navy" style={{ fontFamily: 'var(--pd-font-serif)' }}>JV Partnership</span>
                    <span className="text-lg font-mono text-pd-copper">78%</span>
                  </div>
                  <p className="text-pd-charcoal text-sm mt-2 border-l-2 border-pd-copper pl-3">
                    ARV gap supports equity split. Operator capacity needed.
                  </p>
                </div>

                <div className="pt-4 border-t border-pd-rule border-dashed">
                  <h3 className="text-[10px] uppercase tracking-widest text-pd-navy/40 mb-3" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Identified Risks (Pending Info)</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <ShieldAlert size={14} className="text-pd-copper mt-0.5 shrink-0" />
                      <span className="text-pd-navy">ARV comp thinness</span>
                      <span className="text-pd-navy/40 text-xs ml-auto uppercase" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Medium</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <ShieldAlert size={14} className="text-pd-copper mt-0.5 shrink-0" />
                      <span className="text-pd-navy">1982 systems age</span>
                      <span className="text-pd-navy/40 text-xs ml-auto uppercase" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Medium</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm opacity-40">
                      <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                      <span className="italic">Financing speed constraints...</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Fit Board Preview */}
              <div className="col-span-12 md:col-span-7 border-t md:border-t-0 md:border-l border-pd-rule md:pl-8 pt-6 md:pt-0">
                <h3 className="text-xs uppercase tracking-widest text-pd-navy/40 mb-4" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Lane Viability Readout</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { name: 'JV Partnership', score: 78, active: true },
                    { name: 'Direct Acquisition', score: 64, active: true },
                    { name: 'Creative Finance', score: 58, active: true },
                    { name: 'Operator Referral', score: 55, active: true },
                    { name: 'Wholesale Assignment', score: 42, active: true },
                    { name: 'MLS Referral', score: 30, active: true },
                    { name: 'Capital Match', score: null, active: false },
                    { name: 'Strategy Education', score: null, active: false },
                  ].map((lane) => (
                    <div key={lane.name} className={`flex items-center justify-between border-b border-pd-rule/50 pb-2 ${!lane.active && 'opacity-30'}`}>
                      <span className="text-sm text-pd-navy">{lane.name}</span>
                      {lane.active ? (
                        <span className="font-mono text-xs text-pd-charcoal">{lane.score}</span>
                      ) : (
                        <span className="font-mono text-xs text-pd-navy/40">--</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
