import React, { useState } from 'react';
import { Pencil, Download, Share, MessageSquare, Activity, ChevronRight } from 'lucide-react';
import './SnapshotTokens.css';

export function WaterfallTimeline() {
  const [inputs, setInputs] = useState({
    totalRaise: 1000000,
    holdPeriod: 3,
    prefReturn: 8,
    lpSplit: 70,
    exitMultiple: 1.85,
  });

  const formatCurrency = (val: number, showSign = false) => {
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(val));
    if (val < 0) return `-${formatted}`;
    if (showSign && val > 0) return `+${formatted}`;
    return formatted;
  };

  // Timeline Math
  const calculateTimeline = () => {
    const capitalCalled = inputs.totalRaise;
    const totalExit = capitalCalled * inputs.exitMultiple;
    const profit = totalExit - capitalCalled;
    const prefPerYear = (inputs.prefReturn / 100) * capitalCalled;
    
    let remainingProceeds = totalExit - capitalCalled; // after return of capital
    const totalPref = prefPerYear * inputs.holdPeriod;
    const actualPrefLP = Math.min(totalPref, remainingProceeds);
    remainingProceeds = Math.max(0, remainingProceeds - actualPrefLP);

    const gpSplit = 100 - inputs.lpSplit;
    const targetCatchupGP = (actualPrefLP * gpSplit) / inputs.lpSplit;
    const actualCatchupGP = Math.min(targetCatchupGP, remainingProceeds);
    remainingProceeds = Math.max(0, remainingProceeds - actualCatchupGP);

    const promoteLP = remainingProceeds * (inputs.lpSplit / 100);
    const promoteGP = remainingProceeds * (gpSplit / 100);

    const totalLP = capitalCalled + actualPrefLP + promoteLP;
    const totalGP = actualCatchupGP + promoteGP;
    const lpMultiple = totalLP / capitalCalled;
    const lpIRR = (Math.pow(totalLP / capitalCalled, 1 / inputs.holdPeriod) - 1) * 100;

    // Build timeline events
    const events = [];
    let lpCumulative = -capitalCalled;
    let gpCumulative = 0;

    events.push({
      year: 0,
      label: 'Capital Called',
      lpCashflow: -capitalCalled,
      gpCashflow: 0,
      lpCumulative,
      gpCumulative,
      type: 'initial'
    });

    for (let i = 1; i <= inputs.holdPeriod; i++) {
      if (i < inputs.holdPeriod) {
        // Just pref
        lpCumulative += prefPerYear;
        events.push({
          year: i,
          label: 'Preferred Return',
          lpCashflow: prefPerYear,
          gpCashflow: 0,
          lpCumulative,
          gpCumulative,
          type: 'pref'
        });
      } else {
        // Exit year
        const finalLPCashflow = prefPerYear + capitalCalled + promoteLP;
        const finalGPCashflow = actualCatchupGP + promoteGP;
        
        lpCumulative += finalLPCashflow;
        gpCumulative += finalGPCashflow;
        
        events.push({
          year: i,
          label: 'Exit & Final Distributions',
          lpCashflow: finalLPCashflow,
          gpCashflow: finalGPCashflow,
          lpCumulative,
          gpCumulative,
          type: 'exit'
        });
      }
    }

    return {
      capitalCalled,
      totalLP,
      totalGP,
      lpIRR,
      lpMultiple,
      events,
      prefPerYear
    };
  };

  const math = calculateTimeline();

  // For the ribbon chart max height
  const maxCumulative = Math.max(math.totalLP, math.totalGP, math.capitalCalled);

  return (
    <div className="snap-bg-cream min-h-screen snap-text-navy pb-24 overflow-x-hidden">
      {/* Header */}
      <header className="border-b snap-border-charcoal-light py-4 px-8 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="snap-font-cinzel text-xl tracking-widest font-semibold flex items-center gap-2">
          PEGASUS DREAMSCAPES
        </div>
        <div className="snap-font-montserrat text-xs tracking-[0.2em] uppercase font-medium snap-text-charcoal opacity-60">
          Strategy Lab
        </div>
      </header>

      <main className="w-full">
        {/* Editorial Hero */}
        <div className="px-8 pt-16 pb-12 max-w-[1400px] mx-auto">
          <div className="snap-font-montserrat text-sm tracking-[0.15em] uppercase snap-text-copper font-semibold mb-4">
            Capital Waterfall
          </div>
          <h1 className="snap-font-serif text-5xl md:text-6xl font-medium mb-6 leading-tight">
            Three years. Four moments.<br />One exit.
          </h1>
          <div className="flex items-center gap-3 text-lg snap-text-charcoal snap-font-inter">
            <span className="opacity-70">Your money's life inside the deal.</span>
          </div>
        </div>

        {/* Inputs Strip */}
        <div className="border-y snap-border-charcoal-light bg-white/40 mb-16">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x snap-divide-charcoal-light">
            <div className="flex-1 py-6 px-4 md:px-8 group flex items-center justify-between cursor-text hover:bg-black/[0.02] transition-colors relative">
              <div>
                <div className="snap-font-montserrat text-xs tracking-widest uppercase snap-text-charcoal opacity-60 mb-2">Total Raise</div>
                <div className="snap-font-inter text-2xl font-medium tabular-nums">{formatCurrency(inputs.totalRaise)}</div>
              </div>
              <Pencil className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity text-[#C77A3A]" />
            </div>
            <div className="flex-1 py-6 px-4 md:px-8 group flex items-center justify-between cursor-text hover:bg-black/[0.02] transition-colors relative">
              <div>
                <div className="snap-font-montserrat text-xs tracking-widest uppercase snap-text-charcoal opacity-60 mb-2">Hold Period</div>
                <div className="snap-font-inter text-2xl font-medium tabular-nums">{inputs.holdPeriod} yrs</div>
              </div>
              <Pencil className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity text-[#C77A3A]" />
            </div>
            <div className="flex-1 py-6 px-4 md:px-8 group flex items-center justify-between cursor-text hover:bg-black/[0.02] transition-colors relative">
              <div>
                <div className="snap-font-montserrat text-xs tracking-widest uppercase snap-text-charcoal opacity-60 mb-2">Preferred Return</div>
                <div className="snap-font-inter text-2xl font-medium tabular-nums">{inputs.prefReturn}%</div>
              </div>
              <Pencil className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity text-[#C77A3A]" />
            </div>
            <div className="flex-1 py-6 px-4 md:px-8 group flex items-center justify-between cursor-text hover:bg-black/[0.02] transition-colors relative">
              <div>
                <div className="snap-font-montserrat text-xs tracking-widest uppercase snap-text-charcoal opacity-60 mb-2">LP/GP Split</div>
                <div className="snap-font-inter text-2xl font-medium tabular-nums">{inputs.lpSplit} / {100 - inputs.lpSplit}</div>
              </div>
              <Pencil className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity text-[#C77A3A]" />
            </div>
            <div className="flex-1 py-6 px-4 md:px-8 group flex items-center justify-between cursor-text hover:bg-black/[0.02] transition-colors relative">
              <div>
                <div className="snap-font-montserrat text-xs tracking-widest uppercase snap-text-charcoal opacity-60 mb-2">Exit Multiple</div>
                <div className="snap-font-inter text-2xl font-medium tabular-nums">{inputs.exitMultiple}x</div>
              </div>
              <Pencil className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity text-[#C77A3A]" />
            </div>
          </div>
        </div>

        {/* Timeline Visual - EDGE TO EDGE */}
        <div className="w-full relative pb-32 mb-16 pt-32 px-12 overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* The Axis */}
            <div className="absolute left-12 right-12 top-64 h-px bg-[#0D1B2D]"></div>
            
            <div className="flex justify-between relative">
              {math.events.map((ev, i) => {
                const lpHeight = Math.max(10, (ev.lpCumulative + math.capitalCalled) / maxCumulative * 200);
                const gpHeight = Math.max(0, ev.gpCumulative / maxCumulative * 200);
                
                return (
                  <div key={i} className="flex flex-col items-center relative w-48">
                    {/* Upper Ribbon / Chart */}
                    <div className="absolute bottom-[calc(100%+24px)] flex items-end justify-center w-full group">
                      {ev.year > 0 && (
                        <div className="flex gap-1 items-end opacity-90 transition-all group-hover:opacity-100 group-hover:-translate-y-2">
                          <div 
                            className="bg-[#C77A3A] w-12 rounded-t-sm transition-all duration-500 flex flex-col justify-end"
                            style={{ height: `${lpHeight}px` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 -translate-y-8 absolute w-32 text-center -ml-10 text-[10px] uppercase tracking-wider snap-font-montserrat font-bold text-[#C77A3A]">
                              LP {formatCurrency(ev.lpCumulative)}
                            </div>
                          </div>
                          {ev.gpCumulative > 0 && (
                            <div 
                              className="bg-[#0D1B2D] w-12 rounded-t-sm transition-all duration-500"
                              style={{ height: `${gpHeight}px` }}
                            >
                              <div className="opacity-0 group-hover:opacity-100 -translate-y-8 absolute w-32 text-center -ml-10 text-[10px] uppercase tracking-wider snap-font-montserrat font-bold text-[#0D1B2D]">
                                GP {formatCurrency(ev.gpCumulative)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Axis Marker */}
                    <div className="w-3 h-3 rounded-full bg-[#0D1B2D] z-10 border-4 border-[#F6EFE4]"></div>
                    <div className="absolute top-[18px] snap-font-montserrat text-xs tracking-[0.2em] font-bold text-[#0D1B2D] mt-2">
                      YEAR {ev.year}
                    </div>

                    {/* Drop Lines & Cards Below */}
                    <div className="mt-12 flex flex-col items-center">
                      <div className="w-px h-12 bg-[#0D1B2D]/20 mb-4"></div>
                      
                      <div className="bg-white border snap-border-charcoal-light p-4 w-56 relative group">
                        {/* Event Label */}
                        <div className="snap-font-inter text-xs font-semibold text-[#0D1B2D] mb-3 pb-2 border-b border-[#0D1B2D]/10">
                          {ev.label}
                        </div>
                        
                        {/* Cashflows */}
                        <div className="space-y-3">
                          {ev.lpCashflow !== 0 && (
                            <div className="flex justify-between items-end">
                              <div>
                                <div className="snap-font-montserrat text-[9px] uppercase tracking-wider text-[#C77A3A] font-bold mb-1">LP Cashflow</div>
                                <div className={`snap-font-serif text-xl font-medium ${ev.lpCashflow < 0 ? 'text-[#0D1B2D]/60' : 'text-[#C77A3A]'}`}>
                                  {formatCurrency(ev.lpCashflow, true)}
                                </div>
                              </div>
                            </div>
                          )}
                          {ev.gpCashflow !== 0 && (
                            <div className="flex justify-between items-end border-t border-[#0D1B2D]/5 pt-2">
                              <div>
                                <div className="snap-font-montserrat text-[9px] uppercase tracking-wider text-[#0D1B2D] font-bold mb-1">GP Cashflow</div>
                                <div className="snap-font-serif text-xl font-medium text-[#0D1B2D]">
                                  {formatCurrency(ev.gpCashflow, true)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid lg:grid-cols-3 gap-16 mb-16">
            
            {/* Story / Context */}
            <div className="lg:col-span-1 space-y-8">
              <div className="snap-font-serif text-2xl font-medium">The Narrative Arc</div>
              <div className="bg-white p-8 border snap-border-charcoal-light">
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C77A3A] mt-2 shrink-0"></div>
                    <span className="snap-font-inter text-sm leading-relaxed opacity-90 text-[#0D1B2D]">
                      <strong>The first {inputs.holdPeriod - 1} years pay nothing but the pref accrues.</strong> The capital is locked in value creation.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C77A3A] mt-2 shrink-0"></div>
                    <span className="snap-font-inter text-sm leading-relaxed opacity-90 text-[#0D1B2D]">
                      <strong>Year {inputs.holdPeriod} is the liquidity event.</strong> This single moment delivers {((math.events[math.events.length-1].lpCashflow / math.totalLP) * 100).toFixed(0)}% of the total LP distributions.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C77A3A] mt-2 shrink-0"></div>
                    <span className="snap-font-inter text-sm leading-relaxed opacity-90 text-[#0D1B2D]">
                      <strong>The math earns its keep at exit.</strong> GP catches up and participates in the upside only after LPs hit their required {inputs.prefReturn}% pref hurdle.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-end mb-6">
                <div className="snap-font-serif text-2xl font-medium">Cashflow Ledger</div>
                <button className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider snap-font-montserrat text-[#0D1B2D]/60 hover:text-[#0D1B2D] transition-colors">
                  <Download className="w-4 h-4" /> Download CSV
                </button>
              </div>
              <div className="border border-[#0D1B2D]/10 bg-white">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-[#0D1B2D]/10 bg-black/[0.02]">
                      <th className="py-4 px-6 snap-font-montserrat text-[10px] tracking-widest uppercase text-[#0D1B2D]/60 font-semibold">Date</th>
                      <th className="py-4 px-6 snap-font-montserrat text-[10px] tracking-widest uppercase text-[#0D1B2D]/60 font-semibold">Event</th>
                      <th className="py-4 px-6 snap-font-montserrat text-[10px] tracking-widest uppercase text-[#0D1B2D]/60 font-semibold text-right">LP Cashflow</th>
                      <th className="py-4 px-6 snap-font-montserrat text-[10px] tracking-widest uppercase text-[#0D1B2D]/60 font-semibold text-right">GP Cashflow</th>
                    </tr>
                  </thead>
                  <tbody className="snap-font-inter divide-y divide-[#0D1B2D]/5">
                    {math.events.map((ev, i) => (
                      <tr key={i} className="hover:bg-black/[0.01] transition-colors">
                        <td className="py-4 px-6 font-medium text-[#0D1B2D]">Year {ev.year}</td>
                        <td className="py-4 px-6 text-[#0D1B2D]/80">{ev.label}</td>
                        <td className={`py-4 px-6 text-right tabular-nums font-medium ${ev.lpCashflow < 0 ? 'text-[#0D1B2D]/60' : 'text-[#C77A3A]'}`}>
                          {formatCurrency(ev.lpCashflow, true)}
                        </td>
                        <td className="py-4 px-6 text-right tabular-nums font-medium text-[#0D1B2D]">
                          {ev.gpCashflow !== 0 ? formatCurrency(ev.gpCashflow, true) : '—'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-black/[0.03] border-t border-[#0D1B2D]/20 font-bold">
                      <td colSpan={2} className="py-5 px-6 uppercase tracking-widest text-[11px] snap-font-montserrat">Total Net</td>
                      <td className="py-5 px-6 text-right tabular-nums text-[#C77A3A]">{formatCurrency(math.totalLP - math.capitalCalled, true)}</td>
                      <td className="py-5 px-6 text-right tabular-nums text-[#0D1B2D]">{formatCurrency(math.totalGP, true)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <div className="bg-white p-6 border snap-border-charcoal-light snap-hairline-green relative">
              <div className="snap-font-montserrat text-xs font-semibold tracking-widest uppercase snap-text-charcoal opacity-60 mb-3">Cumulative LP</div>
              <div className="snap-font-inter text-3xl font-medium tabular-nums text-[#0D1B2D]">{formatCurrency(math.totalLP)}</div>
            </div>
            <div className="bg-white p-6 border snap-border-charcoal-light snap-hairline-green relative">
              <div className="snap-font-montserrat text-xs font-semibold tracking-widest uppercase snap-text-charcoal opacity-60 mb-3">LP IRR</div>
              <div className="snap-font-inter text-3xl font-medium tabular-nums text-[#0D1B2D]">{math.lpIRR.toFixed(1)}%</div>
            </div>
            <div className="bg-white p-6 border snap-border-charcoal-light snap-hairline-amber relative">
              <div className="snap-font-montserrat text-xs font-semibold tracking-widest uppercase snap-text-charcoal opacity-60 mb-3">GP Take</div>
              <div className="snap-font-inter text-3xl font-medium tabular-nums text-[#0D1B2D]">{formatCurrency(math.totalGP)}</div>
            </div>
            <div className="bg-white p-6 border snap-border-charcoal-light relative">
              <div className="snap-font-montserrat text-xs font-semibold tracking-widest uppercase snap-text-charcoal opacity-60 mb-3">Time to First Dist</div>
              <div className="snap-font-inter text-3xl font-medium tabular-nums text-[#0D1B2D]">~365 Days</div>
            </div>
          </div>

          {/* Footer Action Row */}
          <div className="border-t snap-border-charcoal-light pt-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
            <div className="flex gap-4 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0D1B2D] text-[#F6EFE4] px-6 py-3 snap-font-inter font-medium text-sm hover:bg-[#1E2328] transition-colors">
                <Download className="w-4 h-4" /> Export Pitchbook
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 border snap-border-charcoal-light px-6 py-3 snap-font-inter font-medium text-sm hover:bg-black/5 transition-colors">
                <Share className="w-4 h-4" /> Share Timeline
              </button>
            </div>
            
            <div className="text-[10px] uppercase tracking-wider snap-font-montserrat opacity-40 text-right max-w-sm">
              Illustrative scenario. Not an offer of guaranteed returns or principal protection.
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
