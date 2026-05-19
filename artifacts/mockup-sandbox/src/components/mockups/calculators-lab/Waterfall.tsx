import React, { useState } from 'react';
import { Pencil, Download, Share, MessageSquare, Activity, Zap } from 'lucide-react';
import './SnapshotTokens.css';

export function Waterfall() {
  const [inputs, setInputs] = useState({
    totalRaise: 1000000,
    holdPeriod: 3,
    prefReturn: 8,
    lpSplit: 70,
    exitMultiple: 1.85,
  });

  const [activeScenario, setActiveScenario] = useState('base');

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Math
  const calculateWaterfall = (overrideMultiple?: number) => {
    const multiple = overrideMultiple || inputs.exitMultiple;
    const capitalCalled = inputs.totalRaise;
    const totalExit = capitalCalled * multiple;
    const profit = totalExit - capitalCalled;

    // Tier 1: Return of Capital
    const rocLP = capitalCalled;
    let remainingProceeds = totalExit - rocLP;

    // Tier 2: Pref
    const prefLP = (inputs.prefReturn / 100) * capitalCalled * inputs.holdPeriod;
    const actualPrefLP = Math.min(prefLP, remainingProceeds);
    remainingProceeds -= actualPrefLP;

    // Tier 3: GP Catch-up
    // GP wants their catch-up to equal: Catchup / (Pref + Catchup) = GP%
    // Catchup = (Pref * GP%) / LP%
    const gpSplit = 100 - inputs.lpSplit;
    const targetCatchupGP = (actualPrefLP * gpSplit) / inputs.lpSplit;
    const actualCatchupGP = Math.min(targetCatchupGP, remainingProceeds);
    remainingProceeds -= actualCatchupGP;

    // Tier 4: Promote Split
    const promoteLP = remainingProceeds * (inputs.lpSplit / 100);
    const promoteGP = remainingProceeds * (gpSplit / 100);

    const totalLP = rocLP + actualPrefLP + promoteLP;
    const totalGP = actualCatchupGP + promoteGP;

    const lpIRR = (Math.pow(totalLP / capitalCalled, 1 / inputs.holdPeriod) - 1) * 100;
    const lpMultiple = totalLP / capitalCalled;

    return {
      capitalCalled,
      rocLP,
      actualPrefLP,
      actualCatchupGP,
      promoteLP,
      promoteGP,
      totalLP,
      totalGP,
      lpIRR,
      lpMultiple,
    };
  };

  const currentMath = calculateWaterfall();
  const consMath = calculateWaterfall(1.3);
  const optMath = calculateWaterfall(2.5);

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
        {/* Hero Section */}
        <div className="mb-16">
          <div className="snap-font-montserrat text-sm tracking-[0.15em] uppercase snap-text-copper font-semibold mb-4">
            Capital Waterfall
          </div>
          <h1 className="snap-font-serif text-5xl md:text-6xl font-medium mb-6 leading-tight">
            Every dollar. Every tier.<br />Every split.
          </h1>
          <div className="flex items-center gap-3 text-lg snap-text-charcoal snap-font-inter">
            <span className="opacity-70">See exactly where your capital lands when the deal exits.</span>
          </div>
        </div>

        {/* Inputs Strip */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row border-y snap-border-charcoal-light divide-y md:divide-y-0 md:divide-x snap-divide-charcoal-light bg-white/40">
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
          <div className="flex gap-2 mt-4 ml-8">
            {['Conservative', 'Base case', 'Aggressive'].map((preset) => (
              <button 
                key={preset}
                className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase snap-font-montserrat border transition-colors ${
                  (preset.toLowerCase() === 'base case' && activeScenario === 'base') || 
                  (preset.toLowerCase() === 'conservative' && activeScenario === 'cons') ||
                  (preset.toLowerCase() === 'aggressive' && activeScenario === 'opt')
                  ? 'bg-[#0D1B2D] text-white border-[#0D1B2D]' 
                  : 'bg-transparent border-[#0D1B2D]/20 text-[#0D1B2D]/60 hover:bg-[#0D1B2D]/5'
                }`}
                onClick={() => {
                  if (preset === 'Conservative') { setInputs({...inputs, exitMultiple: 1.3}); setActiveScenario('cons'); }
                  if (preset === 'Base case') { setInputs({...inputs, exitMultiple: 1.85}); setActiveScenario('base'); }
                  if (preset === 'Aggressive') { setInputs({...inputs, exitMultiple: 2.5}); setActiveScenario('opt'); }
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* The Diagnosis Panel - WATERFALL DIAGRAM */}
        <div className="border border-[#0D1B2D]/10 snap-bg-cream shadow-2xl mb-16 overflow-hidden mt-16 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#0D1B2D]"></div>
          <div className="p-12 pb-16">
            <div className="snap-font-montserrat text-xs tracking-widest uppercase snap-text-charcoal opacity-50 mb-12 text-center">
              Distributions Flow
            </div>
            
            <div className="max-w-[900px] mx-auto relative snap-font-inter">
              {/* Center Line Guide */}
              <div className="absolute left-[35%] top-0 bottom-0 w-px bg-[#0D1B2D]/10"></div>

              {/* Tier 0 */}
              <div className="flex mb-8 relative z-10 items-center">
                <div className="w-[35%] pr-8 text-right">
                  <div className="text-3xl font-medium tabular-nums text-[#0D1B2D]">{formatCurrency(currentMath.capitalCalled)}</div>
                  <div className="text-xs text-[#0D1B2D]/50 uppercase tracking-widest snap-font-montserrat mt-1">Starting Capital</div>
                </div>
                <div className="w-[65%] pl-8">
                  <div className="bg-[#0D1B2D] text-white px-6 py-4 inline-block w-full max-w-[400px]">
                    <div className="snap-font-serif text-2xl mb-1">Capital Called</div>
                    <div className="text-sm opacity-80">Initial LP investment pool</div>
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="h-10 border-l border-[#0D1B2D]/20 ml-[35%] mb-8 relative">
                <div className="absolute top-1/2 left-0 w-4 border-t border-[#0D1B2D]/20"></div>
              </div>

              {/* Tier 1 */}
              <div className="flex mb-8 relative z-10 items-center">
                <div className="w-[35%] pr-8 text-right">
                  <div className="text-2xl font-medium tabular-nums text-[#0D1B2D]">{formatCurrency(currentMath.capitalCalled * currentMath.lpMultiple)}</div>
                  <div className="text-[10px] text-[#0D1B2D]/40 uppercase tracking-widest snap-font-montserrat mt-1">Gross Exit Proceeds</div>
                </div>
                <div className="w-[65%] pl-8">
                  <div className="border border-[#0D1B2D]/20 bg-white px-6 py-5 flex items-start gap-6 relative">
                    <div className="flex-1">
                      <div className="snap-font-serif text-xl mb-1 font-medium text-[#0D1B2D]">Return of Capital</div>
                      <div className="text-sm text-[#0D1B2D]/60">LPs are made whole before any profits are split.</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#C77A3A] font-medium text-lg">{formatCurrency(currentMath.rocLP)}</div>
                      <div className="text-[10px] font-bold text-[#C77A3A] tracking-wider uppercase mt-1 bg-[#C77A3A]/10 px-2 py-0.5 inline-block">100% LP</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="h-10 border-l border-[#0D1B2D]/20 ml-[35%] mb-8"></div>

              {/* Tier 2 */}
              <div className="flex mb-8 relative z-10 items-center">
                <div className="w-[35%] pr-8 text-right">
                  <div className="text-xl font-medium tabular-nums text-[#0D1B2D]/80">
                    {formatCurrency((currentMath.capitalCalled * currentMath.lpMultiple) - currentMath.rocLP)}
                  </div>
                  <div className="text-[10px] text-[#0D1B2D]/40 uppercase tracking-widest snap-font-montserrat mt-1">Remaining</div>
                </div>
                <div className="w-[65%] pl-8">
                  <div className="border border-[#0D1B2D]/20 bg-white px-6 py-5 flex items-start gap-6 relative">
                    <div className="flex-1">
                      <div className="snap-font-serif text-xl mb-1 font-medium text-[#0D1B2D]">Preferred Return</div>
                      <div className="text-sm text-[#0D1B2D]/60">{inputs.prefReturn}% annually to LPs over {inputs.holdPeriod} years.</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#C77A3A] font-medium text-lg">{formatCurrency(currentMath.actualPrefLP)}</div>
                      <div className="text-[10px] font-bold text-[#C77A3A] tracking-wider uppercase mt-1 bg-[#C77A3A]/10 px-2 py-0.5 inline-block">100% LP</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="h-10 border-l border-[#0D1B2D]/20 ml-[35%] mb-8"></div>

              {/* Tier 3 */}
              <div className="flex mb-8 relative z-10 items-center opacity-90">
                <div className="w-[35%] pr-8 text-right">
                  <div className="text-lg font-medium tabular-nums text-[#0D1B2D]/70">
                    {formatCurrency(Math.max(0, (currentMath.capitalCalled * currentMath.lpMultiple) - currentMath.rocLP - currentMath.actualPrefLP))}
                  </div>
                  <div className="text-[10px] text-[#0D1B2D]/40 uppercase tracking-widest snap-font-montserrat mt-1">Remaining</div>
                </div>
                <div className="w-[65%] pl-8">
                  <div className="border border-[#0D1B2D]/20 bg-white px-6 py-5 flex items-start gap-6 relative">
                    <div className="flex-1">
                      <div className="snap-font-serif text-xl mb-1 font-medium text-[#0D1B2D]">GP Catch-up</div>
                      <div className="text-sm text-[#0D1B2D]/60">Sponsor catches up to target {100-inputs.lpSplit}% ratio.</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#0D1B2D] font-medium text-lg">{formatCurrency(currentMath.actualCatchupGP)}</div>
                      <div className="text-[10px] font-bold text-[#0D1B2D] tracking-wider uppercase mt-1 bg-[#0D1B2D]/5 px-2 py-0.5 inline-block">100% GP</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="h-10 border-l border-[#0D1B2D]/20 ml-[35%] mb-8"></div>

              {/* Tier 4 */}
              <div className="flex relative z-10 items-center opacity-90">
                <div className="w-[35%] pr-8 text-right">
                  <div className="text-lg font-medium tabular-nums text-[#0D1B2D]/60">
                    {formatCurrency(Math.max(0, (currentMath.capitalCalled * currentMath.lpMultiple) - currentMath.rocLP - currentMath.actualPrefLP - currentMath.actualCatchupGP))}
                  </div>
                  <div className="text-[10px] text-[#0D1B2D]/40 uppercase tracking-widest snap-font-montserrat mt-1">Promote Pool</div>
                </div>
                <div className="w-[65%] pl-8">
                  <div className="border border-[#0D1B2D]/20 bg-white px-6 py-5 flex flex-col gap-4 relative">
                    <div>
                      <div className="snap-font-serif text-xl mb-1 font-medium text-[#0D1B2D]">Promote Split</div>
                      <div className="text-sm text-[#0D1B2D]/60">Remaining profit distributed {inputs.lpSplit}/{100-inputs.lpSplit}.</div>
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-[#0D1B2D]/10">
                      <div className="flex-1 bg-[#C77A3A]/5 p-3 border border-[#C77A3A]/20">
                        <div className="text-[10px] font-bold text-[#C77A3A] tracking-wider uppercase mb-1">{inputs.lpSplit}% LP</div>
                        <div className="text-[#C77A3A] font-medium text-lg">{formatCurrency(currentMath.promoteLP)}</div>
                      </div>
                      <div className="flex-1 bg-[#0D1B2D]/5 p-3 border border-[#0D1B2D]/10">
                        <div className="text-[10px] font-bold text-[#0D1B2D]/70 tracking-wider uppercase mb-1">{100-inputs.lpSplit}% GP</div>
                        <div className="text-[#0D1B2D] font-medium text-lg">{formatCurrency(currentMath.promoteGP)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Verdict Strip */}
        <div className="mb-16">
          <div className="snap-font-serif text-2xl font-medium mb-6">Key Diagnostics</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`bg-white p-6 border snap-border-charcoal-light snap-hairline-green relative`}>
              <div className="snap-font-montserrat text-xs font-semibold tracking-widest uppercase snap-text-charcoal opacity-60 mb-3">
                Total LP Returns
              </div>
              <div className="snap-font-inter text-3xl font-medium tabular-nums text-[#0D1B2D]">
                {formatCurrency(currentMath.totalLP)}
              </div>
            </div>
            <div className={`bg-white p-6 border snap-border-charcoal-light snap-hairline-green relative`}>
              <div className="snap-font-montserrat text-xs font-semibold tracking-widest uppercase snap-text-charcoal opacity-60 mb-3">
                LP Multiple
              </div>
              <div className="snap-font-inter text-3xl font-medium tabular-nums text-[#0D1B2D]">
                {currentMath.lpMultiple.toFixed(2)}x
              </div>
            </div>
            <div className={`bg-white p-6 border snap-border-charcoal-light snap-hairline-green relative`}>
              <div className="snap-font-montserrat text-xs font-semibold tracking-widest uppercase snap-text-charcoal opacity-60 mb-3">
                LP IRR
              </div>
              <div className="snap-font-inter text-3xl font-medium tabular-nums text-[#0D1B2D]">
                {currentMath.lpIRR.toFixed(1)}%
              </div>
            </div>
            <div className={`bg-white p-6 border snap-border-charcoal-light snap-hairline-amber relative`}>
              <div className="snap-font-montserrat text-xs font-semibold tracking-widest uppercase snap-text-charcoal opacity-60 mb-3">
                GP Take
              </div>
              <div className="snap-font-inter text-3xl font-medium tabular-nums text-[#0D1B2D]">
                {formatCurrency(currentMath.totalGP)}
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Fan & What Breaks This Deal */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="snap-font-serif text-2xl font-medium mb-6">Scenario Fan</div>
            <div className="border snap-border-charcoal-light bg-white p-8">
              <div className="grid grid-cols-3 gap-8 text-center divide-x snap-divide-charcoal-light">
                
                <div className="px-4">
                  <div className="snap-font-montserrat text-xs tracking-wider uppercase snap-text-charcoal opacity-50 mb-6">Conservative (1.3x)</div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">LP IRR</div>
                      <div className="text-lg tabular-nums text-[#0D1B2D]">{consMath.lpIRR.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">LP Multiple</div>
                      <div className="text-lg tabular-nums text-[#0D1B2D]">{consMath.lpMultiple.toFixed(2)}x</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">GP Take</div>
                      <div className="text-lg tabular-nums text-[#0D1B2D]">{formatCurrency(consMath.totalGP)}</div>
                    </div>
                  </div>
                  <div className="mt-8 pt-4 border-t border-dashed snap-border-charcoal-light text-sm italic opacity-60">
                    Baseline preservation
                  </div>
                </div>
                
                <div className="px-4 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 bg-[#C77A3A] text-white text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm">Base Case (1.85x)</div>
                  <div className="snap-font-montserrat text-xs tracking-wider uppercase font-semibold text-[#0D1B2D] mb-6">Expected</div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">LP IRR</div>
                      <div className="text-xl font-medium tabular-nums text-[#0D1B2D]">{currentMath.lpIRR.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">LP Multiple</div>
                      <div className="text-xl font-medium tabular-nums text-[#0D1B2D]">{currentMath.lpMultiple.toFixed(2)}x</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">GP Take</div>
                      <div className="text-xl font-medium tabular-nums text-[#0D1B2D]">{formatCurrency(currentMath.totalGP)}</div>
                    </div>
                  </div>
                  <div className="mt-8 pt-4 border-t snap-border-charcoal-light text-sm font-medium">
                    Target returns
                  </div>
                </div>
                
                <div className="px-4">
                  <div className="snap-font-montserrat text-xs tracking-wider uppercase snap-text-charcoal opacity-50 mb-6">Aggressive (2.5x)</div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">LP IRR</div>
                      <div className="text-lg tabular-nums text-[#0D1B2D]">{optMath.lpIRR.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">LP Multiple</div>
                      <div className="text-lg tabular-nums text-[#0D1B2D]">{optMath.lpMultiple.toFixed(2)}x</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-40 mb-1">GP Take</div>
                      <div className="text-lg tabular-nums text-[#0D1B2D]">{formatCurrency(optMath.totalGP)}</div>
                    </div>
                  </div>
                  <div className="mt-8 pt-4 border-t border-dashed snap-border-charcoal-light text-sm italic opacity-60">
                    Outperformance
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div>
            <div className="snap-font-serif text-2xl font-medium mb-6">Stress Test</div>
            <div className="snap-bg-navy text-[#F6EFE4] p-8 h-[calc(100%-3rem)] flex flex-col">
              <div className="snap-font-montserrat text-xs tracking-widest uppercase text-[#C77A3A] font-semibold mb-6">
                Where this breaks
              </div>
              <ul className="space-y-6 flex-1">
                <li className="flex gap-4">
                  <Zap className="w-5 h-5 text-[#C77A3A] shrink-0 opacity-80" />
                  <span className="snap-font-inter text-sm leading-relaxed opacity-90">
                    Hold extending past <strong className="text-white">5 years</strong> drops LP IRR below 12% even with a 1.85x multiple.
                  </span>
                </li>
                <li className="flex gap-4">
                  <Zap className="w-5 h-5 text-[#C77A3A] shrink-0 opacity-80" />
                  <span className="snap-font-inter text-sm leading-relaxed opacity-90">
                    Pref rate above <strong className="text-white">9%</strong> severely delays the GP catch-up tier, misaligning incentives.
                  </span>
                </li>
                <li className="flex gap-4">
                  <Zap className="w-5 h-5 text-[#C77A3A] shrink-0 opacity-80" />
                  <span className="snap-font-inter text-sm leading-relaxed opacity-90">
                    Exit multiple under <strong className="text-white">1.3x</strong> leaves the promote tier completely untouched.
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
              <Share className="w-4 h-4" /> Save Scenario
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

        <div className="mt-12 text-center text-xs opacity-40 snap-font-inter">
          Illustrative scenario. Not an offer of guaranteed returns or principal protection.
        </div>

      </main>
    </div>
  );
}
