import React from 'react';
import './_group.css';
import { Share2, Download, Save, Send, CircleDot, Activity } from 'lucide-react';

const inputs = {
  identity: [
    { label: 'ADDRESS', value: '1247 Aberdeen Way' },
    { label: 'LOC', value: 'Sacramento CA 95820' },
    { label: 'SPECS', value: '3bd / 2.5ba / 1,850sf' },
    { label: 'YEAR', value: '1982' },
    { label: 'CONDITION', value: 'Moderate Rehab' },
    { label: 'OCCUPANCY', value: 'Vacant' },
  ],
  situation: [
    { label: 'ROLE', value: 'Wholesaler' },
    { label: 'STATUS', value: 'Under Contract' },
    { label: 'TIMELINE', value: '14 Days to Close' },
    { label: 'MOTIVATION', value: 'Distressed / Fast Close' },
  ],
  numbers: [
    { label: 'ASKING', value: '$425,000' },
    { label: 'REHAB', value: '$65,000' },
    { label: 'ARV', value: '$610,000' },
    { label: 'MKT RENT', value: '$2,850/mo' },
    { label: 'FINANCING', value: 'Hard Money' },
    { label: 'EXIT', value: 'Flip / JV' },
  ]
};

const lanes = [
  { name: 'JV Partnership', score: 78 },
  { name: 'Direct Acquisition', score: 64 },
  { name: 'Creative Finance', score: 58 },
  { name: 'Operator Referral', score: 55 },
  { name: 'Wholesale Assignment', score: 42 },
  { name: 'MLS Listing Referral', score: 30 },
  { name: 'Capital Partner Match', score: 28 },
  { name: 'Strategy Education', score: 18 },
];

const risks = [
  { name: 'ARV comp thinness', severity: 'medium', desc: 'Limited recent 3/2.5 comps within 0.5mi' },
  { name: '1982 systems', severity: 'medium', desc: 'Potential HVAC/roof capex required' },
  { name: 'Occupancy', severity: 'low', desc: 'Vacant status eliminates eviction timeline risk' },
  { name: 'Financing speed', severity: 'medium', desc: '14-day close requires aggressive HML draw' },
  { name: 'Exit liquidity', severity: 'low', desc: 'Sacramento submarket DOM remains stable' },
];

export function Cockpit() {
  return (
    <div 
      className="min-h-screen h-screen w-full overflow-hidden text-sm flex flex-col"
      style={{ backgroundColor: 'var(--pd-navy)', color: 'var(--pd-cream)' }}
    >
      {/* Header */}
      <header 
        className="flex items-center justify-between px-4 py-2 border-b uppercase tracking-widest text-xs"
        style={{ borderColor: 'var(--pd-charcoal)', fontFamily: 'var(--pd-font-supporting)' }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2" style={{ color: '#4ADE80' }}>
            <Activity size={14} className="animate-pulse" />
            <span>STRATEGY LAB · COCKPIT MODE · LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-6 font-mono text-[10px]" style={{ color: 'var(--pd-copper-light)' }}>
          <span>TGT: 1247 ABERDEEN WAY</span>
          <span>ASK: $425,000</span>
          <span>SYS_TIME: {new Date().toISOString().split('T')[1].substring(0, 8)}</span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-12 gap-px p-px bg-[#1E2328] overflow-hidden">
        
        {/* LEFT RAIL (1-3) */}
        <div className="col-span-3 flex flex-col" style={{ backgroundColor: 'var(--pd-navy)' }}>
          <div className="p-3 border-b" style={{ borderColor: 'var(--pd-charcoal)' }}>
            <h3 className="uppercase tracking-widest text-xs mb-4" style={{ fontFamily: 'var(--pd-font-supporting)', color: 'var(--pd-copper)' }}>Identity Vectors</h3>
            <div className="flex flex-col gap-2">
              {inputs.identity.map(i => (
                <div key={i.label} className="flex justify-between items-baseline border-b pb-1 border-dashed" style={{ borderColor: 'var(--pd-charcoal)' }}>
                  <span className="text-[10px] tracking-wider" style={{ color: 'var(--pd-copper-soft)', fontFamily: 'var(--pd-font-supporting)' }}>{i.label}</span>
                  <span className="font-mono text-xs">{i.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-3 border-b" style={{ borderColor: 'var(--pd-charcoal)' }}>
            <h3 className="uppercase tracking-widest text-xs mb-4" style={{ fontFamily: 'var(--pd-font-supporting)', color: 'var(--pd-copper)' }}>Situation Telemetry</h3>
            <div className="flex flex-col gap-2">
              {inputs.situation.map(i => (
                <div key={i.label} className="flex justify-between items-baseline border-b pb-1 border-dashed" style={{ borderColor: 'var(--pd-charcoal)' }}>
                  <span className="text-[10px] tracking-wider" style={{ color: 'var(--pd-copper-soft)', fontFamily: 'var(--pd-font-supporting)' }}>{i.label}</span>
                  <span className="font-mono text-xs">{i.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 flex-1">
            <h3 className="uppercase tracking-widest text-xs mb-4" style={{ fontFamily: 'var(--pd-font-supporting)', color: 'var(--pd-copper)' }}>Financial Matrix</h3>
            <div className="flex flex-col gap-2">
              {inputs.numbers.map(i => (
                <div key={i.label} className="flex justify-between items-baseline border-b pb-1 border-dashed" style={{ borderColor: 'var(--pd-charcoal)' }}>
                  <span className="text-[10px] tracking-wider" style={{ color: 'var(--pd-copper-soft)', fontFamily: 'var(--pd-font-supporting)' }}>{i.label}</span>
                  <span className="font-mono text-xs" style={{ color: i.label === 'ARV' || i.label === 'ASKING' ? 'var(--pd-cream)' : 'inherit' }}>{i.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE (4-8) */}
        <div className="col-span-5 flex flex-col" style={{ backgroundColor: 'var(--pd-navy)' }}>
          {/* Top Verdict */}
          <div className="p-8 border-b flex-1 flex flex-col justify-center items-center text-center relative" style={{ borderColor: 'var(--pd-charcoal)' }}>
            
            <div className="absolute top-4 left-4 uppercase tracking-widest text-[10px]" style={{ fontFamily: 'var(--pd-font-supporting)', color: 'var(--pd-copper)' }}>
              Primary Recommendation
            </div>

            <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                <circle cx="64" cy="64" r="60" fill="none" stroke="var(--pd-charcoal)" strokeWidth="4" />
                <circle cx="64" cy="64" r="60" fill="none" stroke="var(--pd-copper)" strokeWidth="4" strokeDasharray="377" strokeDashoffset={377 - (377 * 0.78)} className="transition-all duration-1000" />
              </svg>
              <div className="text-center">
                <div className="font-mono text-3xl" style={{ color: 'var(--pd-copper)' }}>78<span className="text-lg">%</span></div>
                <div className="uppercase tracking-widest text-[8px]" style={{ fontFamily: 'var(--pd-font-supporting)', color: 'var(--pd-copper-soft)' }}>Confidence</div>
              </div>
            </div>

            <h2 className="text-4xl mb-4" style={{ fontFamily: 'var(--pd-font-serif)', color: 'var(--pd-cream)' }}>JV Partnership</h2>
            
            <p className="text-sm mb-6 max-w-sm" style={{ fontFamily: 'var(--pd-font-sans)', color: 'var(--pd-copper-light)' }}>
              ARV gap supports equity split. Operator capacity needed.
            </p>

            <div className="inline-block border px-6 py-3" style={{ borderColor: 'var(--pd-copper)', backgroundColor: 'rgba(199, 122, 58, 0.1)' }}>
              <div className="uppercase tracking-widest text-[10px] mb-1" style={{ fontFamily: 'var(--pd-font-supporting)', color: 'var(--pd-copper-soft)' }}>Target Metric</div>
              <div className="font-mono text-xl">~$48k profit / 22% IRR</div>
            </div>

          </div>

          {/* Bottom Fit Board */}
          <div className="p-4" style={{ height: '40%' }}>
            <h3 className="uppercase tracking-widest text-[10px] mb-4" style={{ fontFamily: 'var(--pd-font-supporting)', color: 'var(--pd-copper)' }}>Lane Fit Spectrum</h3>
            <div className="flex flex-col gap-3">
              {lanes.map(lane => (
                <div key={lane.name} className="flex items-center gap-3">
                  <div className="w-32 text-[10px] text-right truncate uppercase tracking-wider" style={{ fontFamily: 'var(--pd-font-supporting)' }}>
                    {lane.name}
                  </div>
                  <div className="flex-1 h-1.5 bg-[#1E2328] relative">
                    <div 
                      className="absolute top-0 left-0 h-full transition-all duration-1000" 
                      style={{ 
                        width: `${lane.score}%`, 
                        backgroundColor: lane.score > 70 ? 'var(--pd-copper)' : lane.score > 50 ? 'var(--pd-copper-soft)' : 'var(--pd-charcoal)' 
                      }} 
                    />
                  </div>
                  <div className="w-8 font-mono text-[10px] text-right" style={{ color: lane.score > 70 ? 'var(--pd-copper)' : 'inherit' }}>
                    {lane.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT RAIL (9-12) */}
        <div className="col-span-4 flex flex-col" style={{ backgroundColor: 'var(--pd-navy)' }}>
          
          {/* Top Risk Register */}
          <div className="p-4 border-b flex-1" style={{ borderColor: 'var(--pd-charcoal)' }}>
            <h3 className="uppercase tracking-widest text-xs mb-4" style={{ fontFamily: 'var(--pd-font-supporting)', color: 'var(--pd-copper)' }}>Risk Register</h3>
            <div className="flex flex-col gap-3">
              {risks.map(risk => (
                <div key={risk.name} className="p-3 bg-[#131B26] border-l-2" style={{ borderColor: risk.severity === 'high' ? '#EF4444' : risk.severity === 'medium' ? '#F59E0B' : '#10B981' }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs uppercase" style={{ color: 'var(--pd-copper-light)' }}>{risk.name}</span>
                    <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-black/50" style={{ 
                      color: risk.severity === 'high' ? '#EF4444' : risk.severity === 'medium' ? '#F59E0B' : '#10B981' 
                    }}>
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-70 leading-snug" style={{ fontFamily: 'var(--pd-font-sans)' }}>{risk.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Memo */}
          <div className="p-6 border-b" style={{ borderColor: 'var(--pd-charcoal)' }}>
            <h3 className="uppercase tracking-widest text-[10px] mb-4" style={{ fontFamily: 'var(--pd-font-supporting)', color: 'var(--pd-copper)' }}>Decision Directive</h3>
            <div className="text-base leading-relaxed italic" style={{ fontFamily: 'var(--pd-font-serif)', color: 'var(--pd-cream)' }}>
              "ARV–acquisition spread is genuine but operator capacity is the bottleneck. Stress-tested at 10% ARV haircut the JV still clears. Next step: package for two pre-vetted operators and re-confirm rehab scope within 5 business days."
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 py-3 px-4 border transition-colors hover:bg-white/5 uppercase tracking-widest text-xs" style={{ borderColor: 'var(--pd-charcoal)', color: 'var(--pd-cream)', fontFamily: 'var(--pd-font-supporting)' }}>
              <Save size={14} /> Save
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 border transition-colors hover:bg-white/5 uppercase tracking-widest text-xs" style={{ borderColor: 'var(--pd-charcoal)', color: 'var(--pd-cream)', fontFamily: 'var(--pd-font-supporting)' }}>
              <Share2 size={14} /> Share
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 border transition-colors hover:bg-white/5 uppercase tracking-widest text-xs" style={{ borderColor: 'var(--pd-charcoal)', color: 'var(--pd-cream)', fontFamily: 'var(--pd-font-supporting)' }}>
              <Download size={14} /> PDF
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 border transition-colors uppercase tracking-widest text-xs" style={{ borderColor: 'var(--pd-copper)', backgroundColor: 'var(--pd-copper)', color: 'var(--pd-navy)', fontFamily: 'var(--pd-font-supporting)' }}>
              <Send size={14} /> Submit
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}
