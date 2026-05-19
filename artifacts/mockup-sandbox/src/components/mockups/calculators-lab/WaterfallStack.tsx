import React, { useState } from 'react';
import { Download, Share, MessageSquare, Activity, Plus, Info, LayoutTemplate, BoxSelect, ArrowUpCircle, X } from 'lucide-react';
import './SnapshotTokens.css';

export function WaterfallStack() {
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  
  const layers = [
    {
      id: 'common',
      name: 'COMMON / GP',
      amount: 50000,
      cost: 'Sponsor co-invest. Gets the promote.',
      position: '4th position (First loss)',
      returns: {
        totalOut: 305000,
        multiple: '6.10x',
        irr: '83.4%'
      },
      height: '90px'
    },
    {
      id: 'pref',
      name: 'PREFERRED EQUITY',
      amount: 1000000,
      cost: '8% pref + 70/30 promote. The LP raise.',
      position: '3rd position',
      returns: {
        totalOut: 1595000,
        multiple: '1.60x',
        irr: '17.0%'
      },
      height: '220px'
    },
    {
      id: 'mezz',
      name: 'MEZZANINE',
      amount: 500000,
      cost: '11% interest only',
      position: '2nd position',
      returns: {
        totalOut: 665000,
        multiple: '1.33x',
        irr: '11.0%'
      },
      height: '160px'
    },
    {
      id: 'senior',
      name: 'SENIOR DEBT',
      amount: 1500000,
      cost: '6.5% interest only',
      position: '1st position (Most secure)',
      returns: {
        totalOut: 1792500,
        multiple: '1.20x',
        irr: '6.5%'
      },
      height: '320px'
    }
  ];

  return (
    <div className="snap-bg-cream min-h-screen snap-text-navy pb-24">
      {/* Header */}
      <header className="border-b snap-border-charcoal-light py-4 px-8 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="snap-font-cinzel text-xl tracking-widest font-semibold flex items-center gap-2">
          PEGASUS DREAMSCAPES
        </div>
        <div className="snap-font-montserrat text-xs tracking-[0.2em] uppercase font-medium snap-text-charcoal opacity-60">
          Strategy Lab
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 pt-16 pb-12">
        {/* Hero Section */}
        <div className="mb-16 max-w-3xl">
          <div className="snap-font-montserrat text-sm tracking-[0.15em] uppercase snap-text-copper font-semibold mb-4">
            Capital Waterfall
          </div>
          <h1 className="snap-font-serif text-5xl md:text-6xl font-medium mb-6 leading-tight">
            Stack the structure.<br />The math follows.
          </h1>
          <div className="text-xl snap-text-charcoal snap-font-inter opacity-80 font-light max-w-2xl">
            Build the deal the way it's actually capitalized. The waterfall is an architectural stack. Returns are a consequence of the structure.
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* LEFT: THE STACK CONSTRUCTOR (55%) */}
          <div className="w-full lg:w-[55%]">
            <div className="flex justify-between items-end mb-8 pb-4 border-b border-[#0D1B2D]/10">
              <div>
                <div className="snap-font-serif text-3xl font-medium text-[#0D1B2D]">The Cap Stack</div>
                <div className="snap-font-inter text-sm opacity-60 mt-1">Constructed bottom-up by seniority</div>
              </div>
              <div className="text-right">
                <div className="snap-font-montserrat text-xs tracking-widest uppercase text-[#C77A3A] font-semibold mb-1">Total Deal Size</div>
                <div className="snap-font-inter text-2xl font-medium tabular-nums text-[#0D1B2D]">$3,050,000</div>
              </div>
            </div>

            <div className="relative pb-8 pt-4">
              {/* Top Summary */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#0D1B2D]/20 px-6 py-2 z-10 flex items-center gap-4">
                <div className="snap-font-inter text-sm font-medium">66% Debt</div>
                <div className="w-px h-4 bg-[#0D1B2D]/20"></div>
                <div className="snap-font-inter text-sm font-medium">$3.05M Capitalized</div>
              </div>

              {/* The Building */}
              <div className="flex flex-col border-x border-t border-[#0D1B2D]/20 bg-white">
                {layers.map((layer, idx) => (
                  <React.Fragment key={layer.id}>
                    {/* Add Layer Affordance */}
                    {idx > 0 && (
                      <div className="h-0 relative group">
                        <div className="absolute inset-x-0 -top-4 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button className="bg-[#C77A3A] text-white rounded-full p-1.5 flex items-center gap-2 px-4 hover:bg-[#b06a2f] transition-colors">
                            <Plus className="w-4 h-4" />
                            <span className="snap-font-inter text-xs font-medium">Add layer above</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Layer Card */}
                    <div 
                      className="group relative border-b border-[#0D1B2D]/20 hover:bg-black/[0.02] transition-colors flex flex-col justify-center px-8"
                      style={{ height: layer.height }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C77A3A] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex justify-between items-center w-full">
                        <div>
                          <div className="snap-font-montserrat text-xs tracking-[0.2em] uppercase text-[#0D1B2D]/60 mb-2">
                            {layer.name}
                          </div>
                          <div className="snap-font-serif text-4xl text-[#0D1B2D]">
                            {formatCurrency(layer.amount)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-block bg-[#0D1B2D]/5 px-3 py-1 border border-[#0D1B2D]/10 text-sm snap-font-inter text-[#0D1B2D]/80 mb-2">
                            {layer.cost}
                          </div>
                          <div className="snap-font-montserrat text-[10px] tracking-widest uppercase text-[#C77A3A] font-semibold">
                            {layer.position}
                          </div>
                        </div>
                      </div>
                      
                      <button className="absolute right-4 top-4 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity">
                        <X className="w-4 h-4 text-[#0D1B2D]" />
                      </button>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              
              {/* Foundation */}
              <div className="h-4 bg-[#0D1B2D] w-[104%] -ml-[2%]"></div>
            </div>
            
            {/* Add base layer button */}
            <div className="mt-8 flex justify-center">
              <button className="border border-[#0D1B2D]/20 text-[#0D1B2D]/60 px-6 py-3 snap-font-montserrat text-xs tracking-widest uppercase font-semibold hover:bg-[#0D1B2D]/5 hover:text-[#0D1B2D] transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Foundation Layer
              </button>
            </div>
          </div>

          {/* RIGHT: RETURNS RESULT (45%) */}
          <div className="w-full lg:w-[45%]">
            <div className="sticky top-24">
              <div className="bg-white border border-[#0D1B2D]/15 p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#C77A3A]"></div>
                
                <div className="snap-font-serif text-2xl font-medium mb-8 text-[#0D1B2D]">
                  Expected Returns
                </div>

                <div className="space-y-6">
                  {layers.map(layer => (
                    <div key={`ret-${layer.id}`} className="flex justify-between items-baseline border-b border-dashed border-[#0D1B2D]/10 pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="snap-font-inter font-medium text-[#0D1B2D] mb-1">{layer.name}</div>
                        <div className="snap-font-inter text-sm text-[#0D1B2D]/60">In: {formatCurrency(layer.amount)}</div>
                      </div>
                      <div className="text-right">
                        <div className="snap-font-inter text-lg font-semibold text-[#0D1B2D] tabular-nums mb-1">
                          {formatCurrency(layer.returns.totalOut)}
                        </div>
                        <div className="snap-font-inter text-sm text-[#C77A3A] font-medium flex items-center justify-end gap-3">
                          <span>{layer.returns.multiple}</span>
                          <span className="w-1 h-1 rounded-full bg-[#0D1B2D]/20"></span>
                          <span>{layer.returns.irr} IRR</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-[#0D1B2D]/10">
                  <div className="snap-font-montserrat text-[10px] tracking-widest uppercase text-[#0D1B2D]/50 mb-4">Risk Priority (Who gets paid first)</div>
                  <div className="flex h-3 w-full rounded-sm overflow-hidden">
                    <div className="w-[50%] bg-[#0D1B2D]" title="Senior Debt"></div>
                    <div className="w-[13%] bg-[#0D1B2D]/80" title="Mezzanine"></div>
                    <div className="w-[20%] bg-[#0D1B2D]/60" title="Preferred Equity"></div>
                    <div className="w-[17%] bg-[#C77A3A]" title="Common/GP"></div>
                  </div>
                  <div className="flex justify-between text-[10px] snap-font-montserrat tracking-wider uppercase text-[#0D1B2D]/50 mt-2">
                    <span>Lowest Risk</span>
                    <span>Highest Risk</span>
                  </div>
                </div>
              </div>

              {/* Doctrinal Callout */}
              <div className="bg-[#0D1B2D] text-[#F6EFE4] p-8">
                <div className="flex items-center gap-2 mb-4">
                  <LayoutTemplate className="w-5 h-5 text-[#C77A3A]" />
                  <h3 className="snap-font-serif text-xl font-medium">What if you removed a layer?</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C77A3A] mt-2 shrink-0"></div>
                    <p className="snap-font-inter text-sm text-[#F6EFE4]/80 leading-relaxed">
                      <strong className="text-white font-medium">Remove mezzanine:</strong> GP equity requirement rises to $450k. The blended cost of capital drops, but GP IRR collapses to 14.2% due to lack of leverage.
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C77A3A] mt-2 shrink-0"></div>
                    <p className="snap-font-inter text-sm text-[#F6EFE4]/80 leading-relaxed">
                      <strong className="text-white font-medium">Drop senior to $600k:</strong> De-risks the deal significantly, but forces higher utilization of expensive pref equity. Overall LP returns drag downward.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Row */}
        <div className="mt-24 border-t snap-border-charcoal-light pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0D1B2D] text-[#F6EFE4] px-6 py-3 snap-font-inter font-medium text-sm hover:bg-[#1E2328] transition-colors">
              <Download className="w-4 h-4" /> Export Stack
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 border snap-border-charcoal-light px-6 py-3 snap-font-inter font-medium text-sm hover:bg-black/5 transition-colors">
              <Share className="w-4 h-4" /> Share Model
            </button>
          </div>
          
          <div className="text-xs snap-font-inter text-[#0D1B2D]/50 max-w-md text-right">
            Illustrative scenario. Not an offer of guaranteed returns or principal protection.
          </div>
        </div>
      </main>
    </div>
  );
}
