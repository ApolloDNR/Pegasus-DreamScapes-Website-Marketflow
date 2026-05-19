import React, { useState, useMemo } from 'react';
import { Download, Share, MessageSquare, Activity, Settings2, Sliders } from 'lucide-react';
import './SnapshotTokens.css';

export function WaterfallTuning() {
  const [inputs, setInputs] = useState({
    totalRaise: 1000000,
    holdPeriod: 3,
    prefReturn: 8,
    lpSplit: 70,
    exitMultiple: 1.85,
  });

  const [logs, setLogs] = useState([
    "Initialized at Base Case.",
  ]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 3));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Math
  const calculateWaterfall = (currentInputs: typeof inputs) => {
    const capitalCalled = currentInputs.totalRaise;
    const totalExit = capitalCalled * currentInputs.exitMultiple;
    const profit = totalExit - capitalCalled;

    const rocLP = capitalCalled;
    let remainingProceeds = Math.max(0, totalExit - rocLP);

    const prefLP = (currentInputs.prefReturn / 100) * capitalCalled * currentInputs.holdPeriod;
    const actualPrefLP = Math.min(prefLP, remainingProceeds);
    remainingProceeds -= actualPrefLP;

    const gpSplit = 100 - currentInputs.lpSplit;
    const targetCatchupGP = actualPrefLP > 0 && currentInputs.lpSplit > 0 ? (actualPrefLP * gpSplit) / currentInputs.lpSplit : 0;
    const actualCatchupGP = Math.min(targetCatchupGP, remainingProceeds);
    remainingProceeds -= actualCatchupGP;

    const promoteLP = remainingProceeds * (currentInputs.lpSplit / 100);
    const promoteGP = remainingProceeds * (gpSplit / 100);

    const totalLP = rocLP + actualPrefLP + promoteLP;
    const totalGP = actualCatchupGP + promoteGP;

    const lpIRR = currentInputs.holdPeriod > 0 ? (Math.pow(totalLP / capitalCalled, 1 / currentInputs.holdPeriod) - 1) * 100 : 0;
    const lpMultiple = totalLP / capitalCalled;

    // Calc Break Multiple (IRR = 12%)
    const targetLPFor12 = capitalCalled * Math.pow(1.12, currentInputs.holdPeriod);
    const targetProfitLP = targetLPFor12 - rocLP;
    
    let breakMultiple = 1.0;
    if (targetProfitLP <= prefLP) {
      breakMultiple = (rocLP + targetProfitLP) / capitalCalled;
    } else {
      const requiredPromoteLP = targetProfitLP - prefLP;
      const requiredRemaining = requiredPromoteLP / (currentInputs.lpSplit / 100);
      const totalExitReq = rocLP + prefLP + targetCatchupGP + requiredRemaining;
      breakMultiple = totalExitReq / capitalCalled;
    }

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
      breakMultiple
    };
  };

  const math = useMemo(() => calculateWaterfall(inputs), [inputs]);

  const updateInput = (key: keyof typeof inputs, val: number, label: string) => {
    setInputs(prev => {
      const oldVal = prev[key];
      const newInputs = { ...prev, [key]: val };
      const oldMath = calculateWaterfall(prev);
      const newMath = calculateWaterfall(newInputs);
      
      let valStr = val.toString();
      if (key === 'totalRaise') valStr = formatCurrency(val);
      else if (key === 'holdPeriod') valStr = val + 'y';
      else if (key === 'prefReturn' || key === 'lpSplit') valStr = val + '%';
      else if (key === 'exitMultiple') valStr = val.toFixed(2) + 'x';
      
      addLog(`${label} → ${valStr} · LP IRR: ${oldMath.lpIRR.toFixed(1)}% → ${newMath.lpIRR.toFixed(1)}%`);
      return newInputs;
    });
  };

  const renderSlider = (
    label: string, 
    key: keyof typeof inputs, 
    min: number, 
    max: number, 
    step: number, 
    unit: string, 
    formatVal?: (v: number) => string
  ) => {
    const val = inputs[key];
    const percent = ((val - min) / (max - min)) * 100;
    const displayVal = formatVal ? formatVal(val) : (unit === '$' ? formatCurrency(val) : val + unit);
    const displayMin = formatVal ? formatVal(min) : (unit === '$' ? formatCurrency(min) : min + unit);
    const displayMax = formatVal ? formatVal(max) : (unit === '$' ? formatCurrency(max) : max + unit);

    return (
      <div className="mb-10">
        <div className="flex justify-between items-end mb-3">
          <div className="snap-font-montserrat text-xs tracking-widest uppercase snap-text-charcoal opacity-70 font-semibold">{label}</div>
          <div className="snap-font-serif text-3xl font-medium tabular-nums">{displayVal}</div>
        </div>
        <div className="relative h-6 group">
          <input 
            type="range" 
            min={min} 
            max={max} 
            step={step} 
            value={val} 
            onChange={e => updateInput(key, parseFloat(e.target.value), label)} 
            className="absolute z-20 w-full h-full opacity-0 cursor-ew-resize" 
          />
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-white border border-[#1E2328]/10 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-0 bottom-0 left-0 bg-[#0D1B2D]" style={{ width: `${percent}%` }}></div>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-[#C77A3A] pointer-events-none z-10 transition-transform group-hover:scale-110" style={{ left: `calc(${percent}% - 10px)` }}>
            <div className="absolute inset-0 bg-white/20 w-px h-2 m-auto"></div>
          </div>
        </div>
        <div className="flex justify-between mt-2 snap-font-inter text-[10px] uppercase tracking-wider text-[#1E2328]/40 tabular-nums font-semibold">
          <span>{displayMin}</span>
          <span>{displayMax}</span>
        </div>
      </div>
    );
  };

  // Stacked Bar Heights
  const maxBarValue = Math.max(math.totalLP, math.totalGP) * 1.1; // 10% headroom
  const lpRocPct = (math.rocLP / maxBarValue) * 100;
  const lpPrefPct = (math.actualPrefLP / maxBarValue) * 100;
  const lpPromPct = (math.promoteLP / maxBarValue) * 100;
  
  const gpCatchPct = (math.actualCatchupGP / maxBarValue) * 100;
  const gpPromPct = (math.promoteGP / maxBarValue) * 100;

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

      <main className="max-w-[1400px] mx-auto px-8 pt-16 pb-12">
        {/* Editorial Hero */}
        <div className="mb-16">
          <div className="snap-font-montserrat text-sm tracking-[0.15em] uppercase snap-text-copper font-semibold mb-4">
            Capital Waterfall
          </div>
          <h1 className="snap-font-serif text-5xl md:text-6xl font-medium mb-4 leading-tight">
            Tune the terms.<br />Watch the returns.
          </h1>
          <div className="flex items-center gap-3 text-lg snap-text-charcoal snap-font-inter opacity-70">
            <span>Five dials. One verdict.</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* LEFT: 40% Control Panel */}
          <div className="lg:col-span-5 bg-white/40 border snap-border-charcoal-light p-8 md:p-12 relative">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#F6EFE4] px-4 snap-font-montserrat text-[10px] tracking-[0.2em] uppercase font-semibold text-[#0D1B2D]/40 flex items-center gap-2">
              <Sliders className="w-3 h-3" /> Console
            </div>

            {renderSlider("Total Raise", "totalRaise", 250000, 5000000, 50000, "$")}
            {renderSlider("Hold Period", "holdPeriod", 1, 7, 0.5, "y")}
            {renderSlider("Preferred Return", "prefReturn", 4, 12, 0.5, "%")}
            {renderSlider("LP / GP Split", "lpSplit", 60, 90, 5, "", (v) => `${v} / ${100-v}`)}
            {renderSlider("Exit Multiple", "exitMultiple", 1.0, 2.5, 0.05, "x", (v) => v.toFixed(2) + "x")}

            <div className="pt-6 border-t border-dashed snap-border-charcoal-light flex items-center justify-between gap-2 mt-4">
              <span className="snap-font-montserrat text-[10px] uppercase tracking-wider font-semibold opacity-40">Presets</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setInputs({totalRaise: 1000000, holdPeriod: 3, prefReturn: 8, lpSplit: 70, exitMultiple: 1.3});
                    addLog("Recalled Preset: Conservative");
                  }}
                  className="px-4 py-2 border snap-border-charcoal-light hover:bg-[#0D1B2D] hover:text-[#F6EFE4] transition-colors snap-font-montserrat text-[10px] font-bold uppercase tracking-wider"
                >
                  Conservative
                </button>
                <button 
                  onClick={() => {
                    setInputs({totalRaise: 1000000, holdPeriod: 3, prefReturn: 8, lpSplit: 70, exitMultiple: 1.85});
                    addLog("Recalled Preset: Base");
                  }}
                  className="px-4 py-2 bg-[#0D1B2D] text-[#F6EFE4] transition-colors snap-font-montserrat text-[10px] font-bold uppercase tracking-wider"
                >
                  Base
                </button>
                <button 
                  onClick={() => {
                    setInputs({totalRaise: 1000000, holdPeriod: 3, prefReturn: 8, lpSplit: 70, exitMultiple: 2.5});
                    addLog("Recalled Preset: Aggressive");
                  }}
                  className="px-4 py-2 border snap-border-charcoal-light hover:bg-[#0D1B2D] hover:text-[#F6EFE4] transition-colors snap-font-montserrat text-[10px] font-bold uppercase tracking-wider"
                >
                  Aggressive
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: 60% Verdict & Live Readout */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <h2 className="snap-font-serif text-5xl font-medium mb-12 uppercase tracking-wide">Verdict</h2>

            {/* Stacked Bars Visualization */}
            <div className="flex-1 min-h-[400px] border-b-2 snap-border-navy relative flex items-end justify-center gap-16 pb-4">
              
              {/* Y-Axis Guide Lines (optional, maybe just one at max to frame it) */}
              <div className="absolute top-0 left-0 w-full border-t border-dashed snap-border-charcoal-light opacity-30"></div>
              <div className="absolute top-1/2 left-0 w-full border-t border-dashed snap-border-charcoal-light opacity-30"></div>

              {/* LP Bar */}
              <div className="w-32 flex flex-col justify-end relative group">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 snap-font-montserrat text-sm font-bold tracking-wider snap-text-navy">
                  LP
                </div>
                
                {math.promoteLP > 0 && (
                  <div style={{ height: `${lpPromPct}%` }} className="w-full bg-[#0D1B2D] border-b border-white/20 flex flex-col items-center justify-center text-white relative transition-all duration-200">
                    <span className="snap-font-inter font-medium text-sm tabular-nums">{formatCurrency(math.promoteLP)}</span>
                    <span className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-60">Promote</span>
                  </div>
                )}
                
                {math.actualPrefLP > 0 && (
                  <div style={{ height: `${lpPrefPct}%` }} className="w-full bg-[#1E2328] border-b border-white/20 flex flex-col items-center justify-center text-white relative transition-all duration-200">
                    <span className="snap-font-inter font-medium text-sm tabular-nums">{formatCurrency(math.actualPrefLP)}</span>
                    <span className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-60">Pref</span>
                  </div>
                )}

                {math.rocLP > 0 && (
                  <div style={{ height: `${lpRocPct}%` }} className="w-full bg-[#E5DCD0] flex flex-col items-center justify-center snap-text-navy relative transition-all duration-200">
                    <span className="snap-font-inter font-medium text-sm tabular-nums">{formatCurrency(math.rocLP)}</span>
                    <span className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-60">Capital</span>
                  </div>
                )}
                
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 snap-font-inter font-semibold tabular-nums snap-text-navy whitespace-nowrap">
                  {formatCurrency(math.totalLP)}
                </div>
              </div>

              {/* GP Bar */}
              <div className="w-32 flex flex-col justify-end relative group">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 snap-font-montserrat text-sm font-bold tracking-wider snap-text-copper">
                  GP
                </div>
                
                {math.promoteGP > 0 && (
                  <div style={{ height: `${gpPromPct}%` }} className="w-full bg-[#C77A3A] border-b border-white/20 flex flex-col items-center justify-center text-white relative transition-all duration-200">
                    <span className="snap-font-inter font-medium text-sm tabular-nums">{formatCurrency(math.promoteGP)}</span>
                    <span className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-80">Promote</span>
                  </div>
                )}
                
                {math.actualCatchupGP > 0 && (
                  <div style={{ height: `${gpCatchPct}%` }} className="w-full bg-[#b06a2f] flex flex-col items-center justify-center text-white relative transition-all duration-200">
                    <span className="snap-font-inter font-medium text-sm tabular-nums">{formatCurrency(math.actualCatchupGP)}</span>
                    <span className="snap-font-montserrat text-[9px] uppercase tracking-widest opacity-80">Catch-up</span>
                  </div>
                )}

                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 snap-font-inter font-semibold tabular-nums snap-text-copper whitespace-nowrap">
                  {formatCurrency(math.totalGP)}
                </div>
              </div>

              {/* Break Line Annotation */}
              <div className="absolute right-0 top-1/4 h-32 border-l border-[#C77A3A] pl-4 flex flex-col justify-center opacity-80">
                <div className="snap-font-montserrat text-[10px] tracking-widest uppercase font-bold text-[#C77A3A] mb-1">
                  12% IRR Break Line
                </div>
                <div className="snap-font-inter text-sm font-medium tabular-nums text-[#0D1B2D]">
                  Exit drops to <span className="font-bold">{math.breakMultiple.toFixed(2)}x</span>
                </div>
                <div className="w-8 h-px bg-[#C77A3A] absolute left-0 top-1/2 -translate-x-full"></div>
              </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-3 gap-6 mt-16">
              <div className="bg-white p-6 border snap-border-charcoal-light">
                <div className="snap-font-montserrat text-[10px] font-semibold tracking-[0.15em] uppercase snap-text-charcoal opacity-50 mb-2">
                  LP Multiple
                </div>
                <div className="snap-font-inter text-4xl font-medium tabular-nums snap-text-navy">
                  {math.lpMultiple.toFixed(2)}x
                </div>
              </div>
              <div className="bg-white p-6 border snap-border-charcoal-light relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#C77A3A] opacity-50"></div>
                <div className="snap-font-montserrat text-[10px] font-semibold tracking-[0.15em] uppercase snap-text-charcoal opacity-50 mb-2">
                  LP IRR
                </div>
                <div className="snap-font-inter text-4xl font-medium tabular-nums snap-text-navy">
                  {math.lpIRR.toFixed(1)}%
                </div>
              </div>
              <div className="bg-[#0D1B2D] p-6">
                <div className="snap-font-montserrat text-[10px] font-semibold tracking-[0.15em] uppercase text-[#F6EFE4] opacity-70 mb-2">
                  GP Take
                </div>
                <div className="snap-font-inter text-4xl font-medium tabular-nums text-white">
                  {formatCurrency(math.totalGP)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Log Strip */}
        <div className="mt-12 mb-16 border-y snap-border-charcoal-light py-3 flex gap-6 overflow-hidden items-center bg-[#1E2328]/[0.02]">
          <div className="snap-font-montserrat text-[10px] tracking-widest uppercase font-bold text-[#0D1B2D] shrink-0 pl-4">
            Live Log
          </div>
          <div className="flex gap-8 opacity-60">
            {logs.map((log, i) => (
              <div key={i} className="snap-font-inter text-sm tabular-nums whitespace-nowrap flex items-center gap-3">
                {i > 0 && <span className="opacity-30">·</span>}
                <span className={i === 0 ? "font-medium text-[#0D1B2D]" : ""}>{log}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Action Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0D1B2D] text-[#F6EFE4] px-6 py-3 snap-font-inter font-medium text-sm hover:bg-[#1E2328] transition-colors">
              <Settings2 className="w-4 h-4" /> Save Tuning
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 border snap-border-charcoal-light px-6 py-3 snap-font-inter font-medium text-sm hover:bg-black/5 transition-colors">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
          
          <div className="text-center md:text-right text-xs snap-font-inter opacity-50 px-4 md:px-0 order-last md:order-none max-w-sm">
            Illustrative scenario. Not an offer of guaranteed returns or principal protection.
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[#0D1B2D] border border-[#0D1B2D] px-6 py-3 snap-font-inter font-medium text-sm hover:bg-[#0D1B2D] hover:text-[#F6EFE4] transition-colors">
              <Activity className="w-4 h-4" /> Send to MarketFlow
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#C77A3A] text-white px-6 py-3 snap-font-inter font-medium text-sm hover:bg-[#b06a2f] transition-colors">
              <MessageSquare className="w-4 h-4" /> Ask Peggy
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
