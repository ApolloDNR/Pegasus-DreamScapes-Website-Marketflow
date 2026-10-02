import React from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { analyzeDraft, laneName, money, numericValue, safeMetric, type Analysis } from './model';
import { fieldOrigin, SCENARIO_NAMES, type Draft, type ScenarioPatch } from './state';
import { resultDifference } from './scenario-model';
import { FIELD_LABELS } from './Fields';

const ASSUMPTIONS = ['scope', 'arv', 'marketRent'] as const;
type Assumption = typeof ASSUMPTIONS[number];
const LABELS: Record<Assumption, string> = { scope: 'Improvement budget', arv: 'Exit value', marketRent: 'Monthly rent' };
const RELATIONSHIPS: Record<Assumption, string> = {
  scope: 'Scope is paid in cash in this model. Increasing it increases the cash required by the same amount and changes the path economics. The acquisition loan stays tied to purchase basis.',
  arv: 'Exit value changes sale and refinance comparisons. It does not change the acquisition loan or cash required. An entered value needs comparable-property evidence.',
  marketRent: 'Rent changes collected income, percentage-based operating costs and rental cash flow. Financing and fixed operating assumptions stay at Base.',
};

export function previewAssumption(base: Draft, key: Assumption, raw: string): Analysis {
  return analyzeDraft({ ...base, [key]: raw, entered: [...new Set([...base.entered, key])] }, new Date(0));
}

/** A shared zero origin preserves the meaning of negative and unequal values. */
export function comparisonGeometry(a: number, b: number) {
  const min = Math.min(0, a, b);
  const max = Math.max(0, a, b);
  const range = max - min || 1;
  const zero = -min / range * 100;
  return { zero, bars: [a, b].map(value => ({ left: Math.min(zero, (value - min) / range * 100), width: Math.abs(value) / range * 100 })) };
}

function Comparison({ label, base, preview, monthly = false }: { label: string; base?: number; preview?: number; monthly?: boolean }) {
  const available = base !== undefined && preview !== undefined;
  const chart = available ? comparisonGeometry(base, preview) : null;
  return <div className="id-whatif-metric"><h4>{label}{monthly ? ' / month' : ''}</h4><dl>{[base, preview].map((value, index) => <div key={index}>
    <dt>{index ? 'Preview' : 'Base'}</dt><dd>{money(value)}</dd>
    {chart && <div className="id-whatif-track" aria-hidden="true"><i style={{ left: `${chart.zero}%` }}><small>0</small></i><span data-preview={Boolean(index)} style={{ left: `${chart.bars[index].left}%`, width: `${chart.bars[index].width}%` }} /></div>}
  </div>)}</dl>{available && <p className="id-caption">{resultDifference(preview, base, monthly ? 'monthly' : 'cash')}</p>}</div>;
}

export function WhatIf({ base, onApply }: { base: Draft; onApply: (patch: ScenarioPatch, target: 'conservative' | 'upside') => void }) {
  const [field, setField] = React.useState<Assumption>('scope');
  const [raw, setRaw] = React.useState(base.scope);
  const [target, setTarget] = React.useState<'conservative' | 'upside'>('conservative');
  const [applied, setApplied] = React.useState('');
  const id = React.useId();
  React.useEffect(() => { setRaw(base[field]); setApplied(''); }, [base, field]);
  const original = React.useMemo(() => analyzeDraft(base, new Date(0)), [base]);
  const preview = React.useMemo(() => previewAssumption(base, field, raw), [base, field, raw]);
  const parsed = numericValue(field, raw);
  const originalValue = numericValue(field, base[field]).value;
  const error = parsed.error || (!raw.trim() ? 'Enter an amount to preview this assumption.' : '');
  const changed = !error && parsed.value !== originalValue;
  const ratio = originalValue && parsed.value !== undefined ? parsed.value / originalValue * 100 : undefined;
  const sliderMax = originalValue ? Math.min(150, Math.floor(100000000 / originalValue * 100)) : 150;
  const canSlide = ratio !== undefined && ratio >= 50 && ratio <= sliderMax;
  const result = preview.status === 'ready' && !error ? preview : undefined;
  const reference = original.status === 'ready' ? original : undefined;
  const basePath = reference?.presentation.lanes[0];
  const samePath = result?.presentation.lanes.find(lane => lane.lane === basePath?.lane);
  return <section className="id-whatif" aria-labelledby={`${id}-title`}>
    <header><h3 id={`${id}-title`}>What changes if…</h3><p>Try one assumption against Base. Your saved scenarios stay as they are until you apply.</p></header>
    <div className="id-whatif-layout"><div className="id-whatif-controls">
      <label htmlFor={`${id}-field`}>Explore an assumption</label><select id={`${id}-field`} value={field} onChange={event => setField(event.target.value as Assumption)}>{ASSUMPTIONS.map(key => <option key={key} value={key}>{LABELS[key]}</option>)}</select>
      <label htmlFor={`${id}-amount`}>{LABELS[field]} in this preview {field === 'marketRent' ? '($ / month)' : '($)'}</label><input id={`${id}-amount`} inputMode="decimal" value={raw} onChange={event => { setRaw(event.target.value); setApplied(''); }} maxLength={30} aria-invalid={Boolean(error)} aria-describedby={`${id}-input-note`} />
      <p className="id-caption" id={`${id}-input-note`}>{error || `Base: ${originalValue === undefined ? 'Unreported' : money(originalValue)} · ${fieldOrigin(base, field)}. Enter $0 to $100,000,000.`}</p>
      {Boolean(originalValue) && <><label htmlFor={`${id}-range`}>Adjustment from Base</label><input id={`${id}-range`} type="range" min="50" max={sliderMax} step="1" value={canSlide ? ratio : 100} disabled={!canSlide} onChange={event => { setRaw(String(Math.round(originalValue! * Number(event.target.value)) / 100)); setApplied(''); }} aria-valuetext={`${Math.round(ratio ?? 100)}% of Base`} /><p className="id-caption">Slider: 50% to {sliderMax}% of Base. {!canSlide ? 'Use the amount field outside this range.' : 'The amount field also accepts exact values.'}</p></>}
      <button type="button" className="id-text-button" onClick={() => { setRaw(base[field]); setApplied(''); }}><RotateCcw aria-hidden="true" />Reset preview</button>
    </div><div className="id-whatif-results" aria-live="polite" aria-atomic="true">
      <Comparison label="Cash required" base={reference?.presentation.totalCashIn} preview={result?.presentation.totalCashIn} />
      <Comparison label="Rental cash flow" base={reference?.rentalMetrics.monthlyCashFlow} preview={result?.rentalMetrics.monthlyCashFlow} monthly />
      {basePath && <div className="id-whatif-path"><h4>{laneName(basePath)} · {basePath.lane === 'listing_referral' ? 'Exit value above investor allowance' : basePath.economics.primaryMetric}</h4><p>Base <strong>{safeMetric(basePath.economics.primaryValue)}</strong><ArrowRight aria-hidden="true" />Preview <strong>{safeMetric(samePath?.economics.primaryValue)}</strong></p><p className="id-caption">The same path is compared on both sides.</p></div>}
      <p className="id-caption">{error ? `Enter a valid ${LABELS[field].toLowerCase()} to see the preview.` : result?.rentalUnavailableReason || (!result ? 'Add a valid positive purchase basis and positive exit value or rent to compare the full model.' : 'Acquisition cash excludes ongoing carrying and exit costs.')}{(reference?.missing.includes('scope') || result?.missing.includes('scope')) && ' Unreported scope is excluded from cash required.'}</p>
    </div></div>
    <details className="id-whatif-why"><summary>Why did this change?</summary><p>{RELATIONSHIPS[field]}</p><p>{FIELD_LABELS[field]} is the only input changed in this preview. All other inputs come from Base. Results use the same complete model as the brief.</p></details>
    <div className="id-whatif-apply"><label htmlFor={`${id}-target`}>Save preview to<select id={`${id}-target`} value={target} onChange={event => setTarget(event.target.value as 'conservative' | 'upside')}><option value="conservative">Conservative</option><option value="upside">Upside</option></select></label><button type="button" className="id-button is-primary" disabled={!changed || !result} onClick={() => { onApply({ [field]: raw }, target); setApplied(`Applied to ${SCENARIO_NAMES[target]}. Review the scenario results below.`); }}>Apply preview <ArrowRight aria-hidden="true" /></button>{applied && <p role="status">{applied}</p>}<p className="id-caption">Replaces {SCENARIO_NAMES[target]} with Base plus this change. Base stays unchanged. Undo restores the previous scenario.</p></div>
  </section>;
}
