import React, { useState } from 'react';
import { Pencil, Download, Share, MessageSquare, Activity, ChevronRight } from 'lucide-react';
import './SnapshotTokens.css';

export function WaterfallSankey() {
  const [inputs, setInputs] = useState({
    totalRaise: 1000000,
    holdPeriod: 3,
    prefReturn: 8,
    lpSplit: 70,
    exitMultiple: 1.85,
  });

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Math
  const calculateWaterfall = () => {
    const multiple = inputs.exitMultiple;
    const capitalCalled = inputs.totalRaise;
    const totalExit = capitalCalled * multiple;
    
    // Tier 1: Return of Capital
    const rocLP = capitalCalled;
    let remainingProceeds = totalExit - rocLP;

    // Tier 2: Pref
    const prefLP = (inputs.prefReturn / 100) * capitalCalled * inputs.holdPeriod;
    const actualPrefLP = Math.min(prefLP, remainingProceeds);
    remainingProceeds -= actualPrefLP;

    // Tier 3: GP Catch-up
    const gpSplit = 100 - inputs.lpSplit;
    const targetCatchupGP = (actualPrefLP * gpSplit) / inputs.lpSplit;
    const actualCatchupGP = Math.min(targetCatchupGP, Math.max(0, remainingProceeds));
    remainingProceeds -= actualCatchupGP;

    // Tier 4: Promote Split
    const promoteLP = Math.max(0, remainingProceeds) * (inputs.lpSplit / 100);
    const promoteGP = Math.max(0, remainingProceeds) * (gpSplit / 100);

    const totalLP = rocLP + actualPrefLP + promoteLP;
    const totalGP = actualCatchupGP + promoteGP;

    const lpIRR = (Math.pow(totalLP / capitalCalled, 1 / inputs.holdPeriod) - 1) * 100;
    const lpMultiple = totalLP / capitalCalled;

    return {
      capitalCalled,
      totalExit,
      rocLP,
      actualPrefLP,
      actualCatchupGP,
      promoteLP,
      promoteGP,
      totalLP,
      totalGP,
      lpIRR,
      lpMultiple,
      gpPercent: (totalGP / (totalExit - capitalCalled)) * 100 || 0,
    };
  };

  const math = calculateWaterfall();

  // Sankey Layout Engine
  const width = 1000;
  const height = 500;
  const paddingY = 20; // top/bottom padding
  const totalFlowHeight = height - paddingY * 2;
  const pixelsPerDollar = totalFlowHeight / math.totalExit;
  
  const getH = (dollars: number) => Math.max(2, dollars * pixelsPerDollar);

  // X positions
  const xStart = 50;
  const xTrunkStart = 250;
  const xTrunkEnd = 650;
  const xEnd = 950;

  // Calculate stream heights and y-offsets
  const hCapital = getH(math.capitalCalled);
  const hProfit = getH(math.totalExit - math.capitalCalled);
  const hTotal = getH(math.totalExit);

  // Output streams
  const hRoc = getH(math.rocLP);
  const hPref = getH(math.actualPrefLP);
  const hCatchup = getH(math.actualCatchupGP);
  const hPromoteLP = getH(math.promoteLP);
  const hPromoteGP = getH(math.promoteGP);

  // Output Y positions
  let currentYOut = paddingY;
  const yRoc = currentYOut; currentYOut += hRoc + 4;
  const yPref = currentYOut; currentYOut += hPref + 4;
  const yCatchup = currentYOut; currentYOut += hCatchup + 4;
  const yPromoteLP = currentYOut; currentYOut += hPromoteLP + 2; // tight grouping for promote
  const yPromoteGP = currentYOut;

  // Input Y positions
  const yCapital = paddingY + (hTotal - hCapital) / 2; // Center capital in trunk if we wanted, but let's top align the trunk
  
  // Trunk Y positions (we combine them at xTrunkStart)
  let currentYTrunk = paddingY;
  const tRocY = currentYTrunk; currentYTrunk += hRoc;
  const tPrefY = currentYTrunk; currentYTrunk += hPref;
  const tCatchupY = currentYTrunk; currentYTrunk += hCatchup;
  const tPromoteLPY = currentYTrunk; currentYTrunk += hPromoteLP;
  const tPromoteGPY = currentYTrunk;

  // Path generator
  const drawStream = (x1: number, y1: number, h1: number, x2: number, y2: number, h2: number) => {
    return `M ${x1} ${y1} C ${x1 + (x2-x1)*0.5} ${y1}, ${x2 - (x2-x1)*0.5} ${y2}, ${x2} ${y2} L ${x2} ${y2 + h2} C ${x2 - (x2-x1)*0.5} ${y2 + h2}, ${x1 + (x2-x1)*0.5} ${y1 + h1}, ${x1} ${y1 + h1} Z`;
  };

  const drawStraightStream = (x1: number, y1: number, x2: number, y2: number, h: number) => {
    return `M ${x1} ${y1} L ${x2} ${y2} L ${x2} ${y2 + h} L ${x1} ${y1 + h} Z`;
  };

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

      <main className="max-w-[1200px] mx-auto px-8 pt-16 pb-12">
        {/* Editorial Hero */}
        <div className="mb-12 flex justify-between items-end">
          <div>
            <div className="snap-font-montserrat text-sm tracking-[0.15em] uppercase snap-text-copper font-semibold mb-4">
              Capital Waterfall
            </div>
            <h1 className="snap-font-serif text-5xl md:text-6xl font-medium leading-tight">
              Read the deal at a glance.
            </h1>
          </div>
          <div className="text-right">
            <div className="snap-font-inter text-lg opacity-70 max-w-sm ml-auto">
              Stream width is dollars. Color is who gets paid. The math proves the picture.
            </div>
          </div>
        </div>

        {/* Inputs Strip (Narrower) */}
        <div className="mb-16 border-y snap-border-charcoal-light bg-white/40 flex flex-wrap divide-x snap-divide-charcoal-light">
          {[
            { label: 'Total Raise', value: formatCurrency(inputs.totalRaise) },
            { label: 'Hold Period', value: `${inputs.holdPeriod} yrs` },
            { label: 'Pref Return', value: `${inputs.prefReturn}%` },
            { label: 'LP/GP Split', value: `${inputs.lpSplit}/${100-inputs.lpSplit}` },
            { label: 'Exit Multiple', value: `${inputs.exitMultiple}x` },
          ].map((stat, i) => (
            <div key={i} className="flex-1 py-4 px-6 group flex items-center justify-between cursor-text hover:bg-black/[0.02] transition-colors relative">
              <div>
                <div className="snap-font-montserrat text-[10px] tracking-widest uppercase snap-text-charcoal opacity-60 mb-1">{stat.label}</div>
                <div className="snap-font-inter text-xl font-medium tabular-nums">{stat.value}</div>
              </div>
              <Pencil className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity text-[#C77A3A]" />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-8 justify-center snap-font-montserrat text-xs tracking-widest uppercase font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-transparent border-2 border-[#C77A3A]"></div>
            <span className="opacity-70">LP Capital Return</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#C77A3A]"></div>
            <span className="opacity-70">LP Profit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0D1B2D]"></div>
            <span className="opacity-70">GP Profit</span>
          </div>
        </div>

        {/* SANKEY DIAGRAM HERO */}
        <div className="mb-16 relative bg-white border border-[#0D1B2D]/10 py-12 px-6 flex justify-center">
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            
            {/* Input Capital -> Trunk */}
            <path 
              d={drawStream(xStart, yCapital, hCapital, xTrunkStart, tRocY, hCapital)}
              fill="transparent" 
              stroke="#C77A3A" 
              strokeWidth="1"
              strokeDasharray="4 4"
              className="opacity-40"
            />
            <path 
              d={drawStream(xStart, yCapital, hCapital, xTrunkStart, tRocY, hCapital)}
              fill="#C77A3A" 
              className="opacity-[0.03] hover:opacity-[0.08] transition-opacity duration-300"
            />
            
            {/* Value Creation -> Trunk */}
            {hProfit > 0 && (
              <path 
                d={drawStream(xStart, yCapital + hCapital + 20, hProfit, xTrunkStart, tPrefY, hProfit)}
                fill="#C77A3A" 
                className="opacity-10 hover:opacity-20 transition-opacity duration-300"
              />
            )}

            {/* Trunk -> ROC */}
            <path 
              d={drawStream(xTrunkStart, tRocY, hRoc, xTrunkEnd, yRoc, hRoc)}
              fill="transparent" 
              stroke="#C77A3A" 
              strokeWidth="2"
              className="opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
            
            {/* Trunk -> Pref */}
            {hPref > 0 && (
              <path 
                d={drawStream(xTrunkStart, tPrefY, hPref, xTrunkEnd, yPref, hPref)}
                fill="#C77A3A" 
                className="opacity-70 hover:opacity-90 transition-opacity duration-300"
              />
            )}

            {/* Trunk -> Catchup */}
            {hCatchup > 0 && (
              <path 
                d={drawStream(xTrunkStart, tCatchupY, hCatchup, xTrunkEnd, yCatchup, hCatchup)}
                fill="#0D1B2D" 
                className="opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
            )}

            {/* Trunk -> Promote LP */}
            {hPromoteLP > 0 && (
              <path 
                d={drawStream(xTrunkStart, tPromoteLPY, hPromoteLP, xTrunkEnd, yPromoteLP, hPromoteLP)}
                fill="#C77A3A" 
                className="opacity-40 hover:opacity-60 transition-opacity duration-300"
              />
            )}

            {/* Trunk -> Promote GP */}
            {hPromoteGP > 0 && (
              <path 
                d={drawStream(xTrunkStart, tPromoteGPY, hPromoteGP, xTrunkEnd, yPromoteGP, hPromoteGP)}
                fill="#0D1B2D" 
                className="opacity-60 hover:opacity-80 transition-opacity duration-300"
              />
            )}

            {/* Straight Extensions to edges */}
            <path d={drawStraightStream(xTrunkEnd, yRoc, xEnd, yRoc, hRoc)} fill="transparent" stroke="#C77A3A" strokeWidth="2" className="opacity-60" />
            {hPref > 0 && <path d={drawStraightStream(xTrunkEnd, yPref, xEnd, yPref, hPref)} fill="#C77A3A" className="opacity-70" />}
            {hCatchup > 0 && <path d={drawStraightStream(xTrunkEnd, yCatchup, xEnd, yCatchup, hCatchup)} fill="#0D1B2D" className="opacity-80" />}
            {hPromoteLP > 0 && <path d={drawStraightStream(xTrunkEnd, yPromoteLP, xEnd, yPromoteLP, hPromoteLP)} fill="#C77A3A" className="opacity-40" />}
            {hPromoteGP > 0 && <path d={drawStraightStream(xTrunkEnd, yPromoteGP, xEnd, yPromoteGP, hPromoteGP)} fill="#0D1B2D" className="opacity-60" />}

            {/* Labels - Input Nodes */}
            <text x={xStart - 10} y={yCapital + hCapital/2} textAnchor="end" dominantBaseline="middle" className="snap-font-inter text-sm font-medium fill-[#0D1B2D]">LP Capital</text>
            <text x={xStart - 10} y={yCapital + hCapital/2 + 16} textAnchor="end" className="snap-font-inter text-xs fill-[#0D1B2D] opacity-60">{formatCurrency(math.capitalCalled)}</text>
            
            {hProfit > 0 && (
              <>
                <text x={xStart - 10} y={yCapital + hCapital + 20 + hProfit/2} textAnchor="end" dominantBaseline="middle" className="snap-font-inter text-sm font-medium fill-[#C77A3A]">Value Creation</text>
                <text x={xStart - 10} y={yCapital + hCapital + 20 + hProfit/2 + 16} textAnchor="end" className="snap-font-inter text-xs fill-[#C77A3A] opacity-80">{formatCurrency(hProfit / pixelsPerDollar)}</text>
              </>
            )}

            {/* Labels - Output Nodes */}
            <text x={xEnd + 10} y={yRoc + Math.max(hRoc/2, 10)} dominantBaseline="middle" className="snap-font-inter text-sm font-medium fill-[#0D1B2D]">Return of Capital</text>
            <text x={xEnd + 10} y={yRoc + Math.max(hRoc/2, 10) + 16} className="snap-font-inter text-xs fill-[#0D1B2D] opacity-60">{formatCurrency(math.rocLP)}</text>

            {hPref > 0 && (
              <>
                <text x={xEnd + 10} y={yPref + hPref/2} dominantBaseline="middle" className="snap-font-inter text-sm font-medium fill-[#0D1B2D]">Preferred Return</text>
                <text x={xEnd + 10} y={yPref + hPref/2 + 16} className="snap-font-inter text-xs fill-[#0D1B2D] opacity-60">{formatCurrency(math.actualPrefLP)}</text>
              </>
            )}

            {hCatchup > 0 && (
              <>
                <text x={xEnd + 10} y={yCatchup + Math.max(hCatchup/2, 0)} dominantBaseline="middle" className="snap-font-inter text-sm font-medium fill-[#0D1B2D]">GP Catch-up</text>
                <text x={xEnd + 10} y={yCatchup + Math.max(hCatchup/2, 0) + 16} className="snap-font-inter text-xs fill-[#0D1B2D] opacity-60">{formatCurrency(math.actualCatchupGP)}</text>
              </>
            )}

            {hPromoteLP > 0 && (
              <>
                <text x={xEnd + 10} y={yPromoteLP + hPromoteLP/2} dominantBaseline="middle" className="snap-font-inter text-sm font-medium fill-[#0D1B2D]">LP Promote</text>
                <text x={xEnd + 10} y={yPromoteLP + hPromoteLP/2 + 16} className="snap-font-inter text-xs fill-[#0D1B2D] opacity-60">{formatCurrency(math.promoteLP)}</text>
              </>
            )}

            {hPromoteGP > 0 && (
              <>
                <text x={xEnd + 10} y={yPromoteGP + hPromoteGP/2} dominantBaseline="middle" className="snap-font-inter text-sm font-medium fill-[#0D1B2D]">GP Promote</text>
                <text x={xEnd + 10} y={yPromoteGP + hPromoteGP/2 + 16} className="snap-font-inter text-xs fill-[#0D1B2D] opacity-60">{formatCurrency(math.promoteGP)}</text>
              </>
            )}

            {/* Total Lines */}
            <line x1={xEnd + 160} y1={yRoc} x2={xEnd + 160} y2={yPromoteLP + hPromoteLP} stroke="#C77A3A" strokeWidth="2" className="opacity-30" />
            <text x={xEnd + 175} y={(yRoc + yPromoteLP + hPromoteLP)/2} dominantBaseline="middle" className="snap-font-inter font-medium text-lg fill-[#C77A3A]">{formatCurrency(math.totalLP)}</text>
            <text x={xEnd + 175} y={(yRoc + yPromoteLP + hPromoteLP)/2 + 20} className="snap-font-montserrat text-[10px] uppercase tracking-widest fill-[#C77A3A] opacity-70">Total LP</text>

            {(hCatchup > 0 || hPromoteGP > 0) && (
              <>
                <line x1={xEnd + 160} y1={yCatchup} x2={xEnd + 160} y2={yPromoteGP + hPromoteGP} stroke="#0D1B2D" strokeWidth="2" className="opacity-30" />
                <text x={xEnd + 175} y={(yCatchup + yPromoteGP + hPromoteGP)/2} dominantBaseline="middle" className="snap-font-inter font-medium text-lg fill-[#0D1B2D]">{formatCurrency(math.totalGP)}</text>
                <text x={xEnd + 175} y={(yCatchup + yPromoteGP + hPromoteGP)/2 + 20} className="snap-font-montserrat text-[10px] uppercase tracking-widest fill-[#0D1B2D] opacity-50">Total GP</text>
              </>
            )}

          </svg>
        </div>

        {/* Outcomes Ledger */}
        <div className="mb-12">
          <div className="snap-font-serif text-2xl font-medium mb-6">Distributions Ledger</div>
          <div className="bg-white border snap-border-charcoal-light">
            
            {/* LP Row */}
            <div className="flex border-b snap-border-charcoal-light divide-x snap-divide-charcoal-light relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C77A3A]" />
              <div className="w-48 py-5 px-6 flex items-center snap-font-montserrat text-xs tracking-widest uppercase font-semibold snap-text-copper">
                LP Position
              </div>
              <div className="flex-1 grid grid-cols-6 divide-x snap-divide-charcoal-light">
                <div className="py-4 px-4 flex flex-col justify-center">
                  <div className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-50 mb-1">Capital Return</div>
                  <div className="snap-font-inter tabular-nums font-medium text-sm">{formatCurrency(math.rocLP)}</div>
                </div>
                <div className="py-4 px-4 flex flex-col justify-center">
                  <div className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-50 mb-1">Pref Return</div>
                  <div className="snap-font-inter tabular-nums font-medium text-sm">{formatCurrency(math.actualPrefLP)}</div>
                </div>
                <div className="py-4 px-4 flex flex-col justify-center">
                  <div className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-50 mb-1">Promote</div>
                  <div className="snap-font-inter tabular-nums font-medium text-sm">{formatCurrency(math.promoteLP)}</div>
                </div>
                <div className="py-4 px-4 flex flex-col justify-center bg-[#C77A3A]/5">
                  <div className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-70 mb-1 text-[#C77A3A] font-bold">Total Payout</div>
                  <div className="snap-font-inter tabular-nums font-medium text-lg text-[#C77A3A]">{formatCurrency(math.totalLP)}</div>
                </div>
                <div className="py-4 px-4 flex flex-col justify-center bg-[#C77A3A]/5">
                  <div className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-70 mb-1 text-[#C77A3A] font-bold">Multiple</div>
                  <div className="snap-font-inter tabular-nums font-medium text-lg text-[#C77A3A]">{math.lpMultiple.toFixed(2)}x</div>
                </div>
                <div className="py-4 px-4 flex flex-col justify-center bg-[#C77A3A]/5">
                  <div className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-70 mb-1 text-[#C77A3A] font-bold">IRR</div>
                  <div className="snap-font-inter tabular-nums font-medium text-lg text-[#C77A3A]">{math.lpIRR.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* GP Row */}
            <div className="flex divide-x snap-divide-charcoal-light relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0D1B2D]" />
              <div className="w-48 py-5 px-6 flex items-center snap-font-montserrat text-xs tracking-widest uppercase font-semibold text-[#0D1B2D]">
                GP Position
              </div>
              <div className="flex-1 grid grid-cols-6 divide-x snap-divide-charcoal-light">
                <div className="py-4 px-4 flex flex-col justify-center bg-black/[0.02]">
                  <div className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-40 mb-1">—</div>
                  <div className="snap-font-inter tabular-nums font-medium text-sm opacity-40">—</div>
                </div>
                <div className="py-4 px-4 flex flex-col justify-center bg-black/[0.02]">
                  <div className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-40 mb-1">—</div>
                  <div className="snap-font-inter tabular-nums font-medium text-sm opacity-40">—</div>
                </div>
                <div className="py-4 px-4 flex flex-col justify-center">
                  <div className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-50 mb-1">Catch-up & Promote</div>
                  <div className="snap-font-inter tabular-nums font-medium text-sm">{formatCurrency(math.totalGP)}</div>
                </div>
                <div className="py-4 px-4 flex flex-col justify-center bg-[#0D1B2D]/5">
                  <div className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-70 mb-1 text-[#0D1B2D] font-bold">Total Payout</div>
                  <div className="snap-font-inter tabular-nums font-medium text-lg text-[#0D1B2D]">{formatCurrency(math.totalGP)}</div>
                </div>
                <div className="py-4 px-4 flex flex-col justify-center bg-[#0D1B2D]/5 col-span-2">
                  <div className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-70 mb-1 text-[#0D1B2D] font-bold">% of Profit</div>
                  <div className="snap-font-inter tabular-nums font-medium text-lg text-[#0D1B2D]">{math.gpPercent.toFixed(1)}%</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Doctrinal Call-out */}
        <div className="bg-[#0D1B2D] text-[#F6EFE4] p-8 md:p-10 flex flex-col md:flex-row gap-10 items-center mb-16">
          <div className="shrink-0 w-48 text-center md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-8">
            <div className="snap-font-montserrat text-[10px] tracking-[0.2em] uppercase font-semibold text-[#C77A3A] mb-3">
              Read This Deal
            </div>
            <div className="snap-font-serif text-3xl font-medium">
              What the<br />picture says
            </div>
          </div>
          <ul className="flex-1 space-y-4">
            <li className="flex gap-4">
              <ChevronRight className="w-5 h-5 text-[#C77A3A] shrink-0 opacity-80" />
              <span className="snap-font-inter text-sm leading-relaxed opacity-90">
                The GP Catch-up tier is fully funded. At this exit multiple, the sponsor achieves their target ratio before the promote split begins.
              </span>
            </li>
            <li className="flex gap-4">
              <ChevronRight className="w-5 h-5 text-[#C77A3A] shrink-0 opacity-80" />
              <span className="snap-font-inter text-sm leading-relaxed opacity-90">
                Most LP profit is generated in the promote tier, not the preferred return. The deal economics rely heavily on achieving the target exit value.
              </span>
            </li>
          </ul>
        </div>

        {/* Footer Action Row */}
        <div className="border-t snap-border-charcoal-light pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0D1B2D] text-[#F6EFE4] px-6 py-3 snap-font-inter font-medium text-sm hover:bg-[#1E2328] transition-colors">
              <Download className="w-4 h-4" /> Export Diagram
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 border snap-border-charcoal-light px-6 py-3 snap-font-inter font-medium text-sm hover:bg-black/5 transition-colors">
              <Share className="w-4 h-4" /> Save Scenario
            </button>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[#0D1B2D] border border-[#0D1B2D] px-6 py-3 snap-font-inter font-medium text-sm hover:bg-[#0D1B2D] hover:text-[#F6EFE4] transition-colors">
              <Activity className="w-4 h-4" /> Compare Scenarios
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#C77A3A] text-white px-6 py-3 snap-font-inter font-medium text-sm hover:bg-[#b06a2f] transition-colors">
              <MessageSquare className="w-4 h-4" /> Ask Peggy
            </button>
          </div>
        </div>
        
        <div className="text-center mt-12 snap-font-inter text-xs snap-text-charcoal opacity-40">
          Illustrative scenario. Not an offer of guaranteed returns or principal protection.
        </div>

      </main>
    </div>
  );
}
