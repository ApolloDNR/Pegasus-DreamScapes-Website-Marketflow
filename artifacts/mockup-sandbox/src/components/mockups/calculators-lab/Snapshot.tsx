import React from 'react';
import { Pencil, Download, Share, MessageSquare, ArrowRight, Activity, Zap, CheckCircle2, XCircle } from 'lucide-react';
import './SnapshotTokens.css';

export function Snapshot() {
  return (
    <div className="snap-bg-cream min-h-screen snap-text-navy pb-24">
      {/* Header */}
      <header className="border-b snap-border-charcoal-light py-4 px-8 flex justify-between items-center">
        <div className="snap-font-cinzel text-xl tracking-widest font-semibold flex items-center gap-2">
          PEGASUS DREAMSCAPES
        </div>
        <div className="snap-font-montserrat text-xs tracking-[0.2em] uppercase font-medium snap-text-charcoal opacity-60">
          Strategy Lab
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 pt-16 pb-12">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="snap-font-montserrat text-sm tracking-[0.15em] uppercase snap-text-copper font-semibold mb-4">
            Property Strategy Snapshot
          </div>
          <h1 className="snap-font-serif text-5xl md:text-6xl font-medium mb-6 leading-tight">
            One address in.<br />Every angle out.
          </h1>
          <div className="flex items-center gap-3 text-lg snap-text-charcoal snap-font-inter">
            <span>1247 Aberdeen Way, Sacramento CA</span>
            <span className="opacity-50">· analyzed in 2.3 seconds.</span>
            <button className="p-1.5 hover:bg-black/5 rounded-full transition-colors ml-2">
              <Pencil className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </div>
        </div>

        {/* Hero Numeric Strip */}
        <div className="flex flex-col md:flex-row border-y snap-border-charcoal-light divide-y md:divide-y-0 md:divide-x snap-divide-charcoal-light mb-16">
          {[
            { label: 'Purchase', value: '$285,000' },
            { label: 'Rehab', value: '$62,000' },
            { label: 'ARV', value: '$475,000' },
            { label: 'Rent', value: '$1,950/mo' },
          ].map((stat, i) => (
            <div key={i} className="flex-1 py-6 px-4 md:px-8 group flex items-center justify-between cursor-text hover:bg-black/[0.02] transition-colors">
              <div>
                <div className="snap-font-montserrat text-xs tracking-widest uppercase snap-text-charcoal opacity-60 mb-2">
                  {stat.label}
                </div>
                <div className="snap-font-inter text-2xl font-medium tabular-nums">
                  {stat.value}
                </div>
              </div>
              <Pencil className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity" />
            </div>
          ))}
        </div>

        {/* The Diagnosis Panel */}
        <div className="grid md:grid-cols-2 gap-px snap-bg-navy p-px mb-16 shadow-2xl">
          {/* Left: Deal Grade Dial */}
          <div className="snap-bg-cream p-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-6 left-6 snap-font-montserrat text-xs tracking-widest uppercase snap-text-charcoal opacity-50">
              Verdict
            </div>
            
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Dial Background Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" className="stroke-[#0D1B2D]/10" strokeWidth="2" />
                <circle cx="50" cy="50" r="46" fill="none" className="stroke-[#C77A3A]" strokeWidth="2" strokeDasharray="289" strokeDashoffset="50" strokeLinecap="round" />
              </svg>
              
              <div className="text-center">
                <div className="snap-font-serif text-8xl font-medium snap-text-navy mb-2">B+</div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <div className="snap-font-inter text-lg font-medium snap-text-navy">Strong BRRRR / Marginal Flip</div>
              <div className="snap-font-inter text-sm snap-text-charcoal opacity-70 mt-2 max-w-sm">
                Solid fundamentals for buy-and-hold. Fix-and-flip margin is too thin for the required risk.
              </div>
            </div>
          </div>

          {/* Right: Lane Recommendation */}
          <div className="snap-bg-cream p-12 flex flex-col justify-center">
            <div className="snap-font-montserrat text-xs tracking-widest uppercase snap-text-charcoal opacity-50 mb-8">
              Lane Recommendation
            </div>
            
            <div className="space-y-6">
              {/* Top Recommended Lane */}
              <div className="flex items-start gap-4 p-4 border border-[#C77A3A] bg-[#C77A3A]/5 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#C77A3A]" />
                <CheckCircle2 className="w-5 h-5 text-[#C77A3A] mt-0.5 shrink-0" />
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="snap-font-inter font-semibold text-lg">BRRRR</h3>
                    <span className="snap-font-montserrat text-[10px] tracking-wider uppercase text-[#C77A3A] font-bold">Recommended</span>
                  </div>
                  <p className="snap-font-inter text-sm opacity-80 leading-relaxed">
                    Leave ~$24k in the deal after refi. Recovers 85% of initial capital while adding $385/mo in cash flow.
                  </p>
                </div>
              </div>

              {/* Alternate 1 */}
              <div className="flex items-start gap-4 p-4 border snap-border-charcoal-light opacity-60 grayscale hover:grayscale-0 transition-all">
                <ArrowRight className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="snap-font-inter font-medium text-lg">Wholesale Assignment</h3>
                    <span className="snap-font-montserrat text-[10px] tracking-wider uppercase">Viable Alternative</span>
                  </div>
                  <p className="snap-font-inter text-sm opacity-80 leading-relaxed">
                    Can likely assign for $10k-$15k fee to local flippers seeking inventory.
                  </p>
                </div>
              </div>

              {/* Alternate 2 */}
              <div className="flex items-start gap-4 p-4 border snap-border-charcoal-light opacity-60 grayscale hover:grayscale-0 transition-all">
                <ArrowRight className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="snap-font-inter font-medium text-lg">Joint Venture</h3>
                    <span className="snap-font-montserrat text-[10px] tracking-wider uppercase">Viable Alternative</span>
                  </div>
                  <p className="snap-font-inter text-sm opacity-80 leading-relaxed">
                    Bring the deal, partner brings capital. Split equity 50/50.
                  </p>
                </div>
              </div>

              {/* Ruled Out */}
              <div className="flex items-start gap-4 p-4 opacity-40">
                <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="snap-font-inter font-medium text-lg line-through">Direct Flip</h3>
                    <span className="snap-font-montserrat text-[10px] tracking-wider uppercase text-red-700">Margin too thin</span>
                  </div>
                  <p className="snap-font-inter text-sm leading-relaxed">
                    Only 12% projected margin after holding & closing costs. Too tight for unexpected rehab overages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="mb-16">
          <div className="snap-font-serif text-2xl font-medium mb-6">Key Diagnostics</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'ARV %', value: '78.5%', status: 'amber' },
              { label: 'Cash-on-Cash', value: '28.4%', status: 'green' },
              { label: 'BRRRR Cash Left', value: '$16,500', status: 'green' },
              { label: 'Monthly Cash Flow', value: '$385', status: 'green' },
              { label: 'DSCR', value: '1.34', status: 'green' },
              { label: 'Hard Money Cost', value: '$19,200', status: 'amber' },
            ].map((kpi, i) => (
              <div key={i} className={`bg-white p-5 border snap-border-charcoal-light snap-hairline-${kpi.status} relative`}>
                <div className="snap-font-montserrat text-[10px] font-semibold tracking-widest uppercase snap-text-charcoal opacity-60 mb-3 line-clamp-1" title={kpi.label}>
                  {kpi.label}
                </div>
                <div className="snap-font-inter text-2xl font-medium tabular-nums">
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scenario Fan & What Breaks This Deal */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          
          <div className="lg:col-span-2">
            <div className="snap-font-serif text-2xl font-medium mb-6">Scenario Fan</div>
            <div className="border snap-border-charcoal-light bg-white p-8">
              <div className="grid grid-cols-3 gap-8 text-center divide-x snap-divide-charcoal-light">
                
                <div className="px-4">
                  <div className="snap-font-montserrat text-xs tracking-wider uppercase snap-text-charcoal opacity-50 mb-6">Conservative</div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">ARV</div>
                      <div className="text-lg tabular-nums">$440,000</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">Cash Out</div>
                      <div className="text-lg tabular-nums">-$8,500</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">Cash-on-Cash</div>
                      <div className="text-lg tabular-nums">12.1%</div>
                    </div>
                  </div>
                  <div className="mt-8 pt-4 border-t border-dashed snap-border-charcoal-light text-sm italic opacity-60">
                    Walk away
                  </div>
                </div>
                
                <div className="px-4 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 bg-[#C77A3A] text-white text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm">Base Case</div>
                  <div className="snap-font-montserrat text-xs tracking-wider uppercase font-semibold text-[#0D1B2D] mb-6">Expected</div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">ARV</div>
                      <div className="text-xl font-medium tabular-nums">$475,000</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">Cash Out</div>
                      <div className="text-xl font-medium tabular-nums">$16,500</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">Cash-on-Cash</div>
                      <div className="text-xl font-medium tabular-nums">28.4%</div>
                    </div>
                  </div>
                  <div className="mt-8 pt-4 border-t snap-border-charcoal-light text-sm font-medium">
                    Proceed
                  </div>
                </div>
                
                <div className="px-4">
                  <div className="snap-font-montserrat text-xs tracking-wider uppercase snap-text-charcoal opacity-50 mb-6">Optimistic</div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">ARV</div>
                      <div className="text-lg tabular-nums">$510,000</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">Cash Out</div>
                      <div className="text-lg tabular-nums">$42,000</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">Cash-on-Cash</div>
                      <div className="text-lg tabular-nums">41.8%</div>
                    </div>
                  </div>
                  <div className="mt-8 pt-4 border-t border-dashed snap-border-charcoal-light text-sm italic opacity-60">
                    Aggressive bid OK
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div>
            <div className="snap-font-serif text-2xl font-medium mb-6">Stress Test</div>
            <div className="snap-bg-navy text-[#F6EFE4] p-8 h-[calc(100%-3rem)] flex flex-col">
              <div className="snap-font-montserrat text-xs tracking-widest uppercase text-[#C77A3A] font-semibold mb-6">
                What Breaks This Deal
              </div>
              <ul className="space-y-6 flex-1">
                <li className="flex gap-4">
                  <Zap className="w-5 h-5 text-[#C77A3A] shrink-0 opacity-80" />
                  <span className="snap-font-inter text-sm leading-relaxed opacity-90">
                    Rehab pushing over <strong className="text-white">$78,000</strong> forces ARV% past 80%, limiting refinance options.
                  </span>
                </li>
                <li className="flex gap-4">
                  <Zap className="w-5 h-5 text-[#C77A3A] shrink-0 opacity-80" />
                  <span className="snap-font-inter text-sm leading-relaxed opacity-90">
                    ARV dropping below <strong className="text-white">$445,000</strong> completely removes the BRRRR option, requiring a sale to exit.
                  </span>
                </li>
                <li className="flex gap-4">
                  <Zap className="w-5 h-5 text-[#C77A3A] shrink-0 opacity-80" />
                  <span className="snap-font-inter text-sm leading-relaxed opacity-90">
                    Holding time extending past <strong className="text-white">6 months</strong> eats into CoC return by ~2% per month.
                  </span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Footer Action Row */}
        <div className="border-t snap-border-charcoal-light pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0D1B2D] text-[#F6EFE4] px-6 py-3 snap-font-inter font-medium text-sm hover:bg-[#1E2328] transition-colors">
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 border snap-border-charcoal-light px-6 py-3 snap-font-inter font-medium text-sm hover:bg-black/5 transition-colors">
              <Share className="w-4 h-4" /> Save Snapshot
            </button>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[#0D1B2D] border border-[#0D1B2D] px-6 py-3 snap-font-inter font-medium text-sm hover:bg-[#0D1B2D] hover:text-[#F6EFE4] transition-colors">
              <Activity className="w-4 h-4" /> Send to MarketFlow
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#C77A3A] text-white px-6 py-3 snap-font-inter font-medium text-sm hover:bg-[#b06a2f] transition-colors shadow-lg shadow-[#C77A3A]/20">
              <MessageSquare className="w-4 h-4" /> Ask Peggy
            </button>
          </div>
        </div>

        {/* Calculator Coverage — all 8 instruments fired */}
        <div className="mt-16 mb-12">
          <div className="flex items-baseline justify-between mb-6">
            <div className="snap-font-montserrat text-xs tracking-[0.2em] uppercase snap-text-copper font-semibold">
              Instruments Run · 8 of 8
            </div>
            <div className="snap-font-inter text-xs snap-text-charcoal opacity-60">
              Click any to inspect the math.
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 border-y snap-border-charcoal-light divide-x divide-y md:divide-y-0 snap-divide-charcoal-light">
            {[
              { label: 'ARV',          value: '$475,000' },
              { label: 'ROI / Flip',   value: '14.2%' },
              { label: 'BRRRR',        value: '$16,500 left' },
              { label: 'Cash Flow',    value: '$385/mo' },
              { label: 'Wholesale',    value: '$10–15k fee' },
              { label: 'PITI',         value: '$1,565/mo' },
              { label: 'Own vs Rent',  value: 'Own +$190/mo' },
              { label: 'Hard Money',   value: '$19,200 cost' },
            ].map((c, i) => (
              <button key={i} className="text-left py-5 px-5 hover:bg-black/[0.03] transition-colors group">
                <div className="snap-font-montserrat text-[10px] tracking-[0.2em] uppercase snap-text-charcoal opacity-60 mb-1.5">
                  {c.label}
                </div>
                <div className="snap-font-inter text-base font-medium tabular-nums snap-text-navy group-hover:snap-text-copper transition-colors">
                  {c.value}
                </div>
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
