import React from 'react';
import { ArrowRight } from 'lucide-react';
import { STRATEGY_LANES, LANE_LABELS, type StrategyLane, type SensitivityGrid } from '@shared/strategy-lab';
import { analyzeDraft, money, laneName, safeMetric, numericValue, rentalCaseAvailable, type Analysis } from './model';
import { scenarioDraft, resultDifference } from './scenario-model';
import { SCENARIOS, SCENARIO_NAMES, DEFAULTS, NUMERIC_FIELDS, type Draft, type NumericField, type Workspace, type ScenarioId, type ScenarioPatch } from './state';
import { Unavailable } from './Overview';
import { FIELD_LABELS, FIELD_UNITS } from './Fields';

const GRID_LANES: StrategyLane[] = ['flip', 'wholetail', 'brrrr', 'rental_hold', 'ground_up', 'wholesale'];
function cellPatch(grid: SensitivityGrid, x: number, y: number): ScenarioPatch | null {
  if (['flip', 'wholetail'].includes(grid.lane) && grid.xAxis.label === 'Rehab budget' && grid.yAxis.label === 'After-Repair Value') return { scope: String(x), arv: String(y) };
  if (grid.lane === 'rental_hold' && grid.xAxis.label === 'Purchase price' && grid.yAxis.label === 'Monthly rent') return { acquisition: String(x), marketRent: String(y) };
  if (grid.lane === 'brrrr' && grid.xAxis.label === 'Refi appraised value' && grid.yAxis.label === 'Monthly rent') return { arv: String(x), marketRent: String(y) };
  return null;
}

function effectiveInput(draft: Draft, key: NumericField) {
  const raw = draft[key] || (DEFAULTS as Partial<Record<NumericField, string>>)[key] || '';
  return numericValue(key, raw);
}

function inputChanged(draft: Draft, base: Draft, key: NumericField): boolean {
  const current = effectiveInput(draft, key);
  const reference = effectiveInput(base, key);
  return current.error || reference.error ? draft[key] !== base[key] : current.value !== reference.value;
}

function shownInput(draft: Draft, key: NumericField): string {
  const parsed = effectiveInput(draft, key);
  if (parsed.error) return 'Invalid input';
  if (parsed.value === undefined) return 'Unreported';
  return ['acquisition', 'scope', 'arv', 'marketRent', 'insurance', 'hoa'].includes(key) ? money(parsed.value) : `${parsed.value}${FIELD_UNITS[key] ? ` ${FIELD_UNITS[key]}` : ''}`;
}

export function Scenarios({ workspace, analysis, selectedLane, onLane, onUse, onPreset, onReset, onApply, onEdit }: { workspace: Workspace; analysis: Analysis; selectedLane: StrategyLane | null; onLane: (lane: StrategyLane) => void; onUse: (id: ScenarioId) => void; onPreset: (id: 'conservative' | 'upside') => void; onReset: (id: 'conservative' | 'upside') => void; onApply: (patch: ScenarioPatch) => void; onEdit: () => void }) {
  const runs = React.useMemo(() => SCENARIOS.map(id => ({ id, draft: scenarioDraft(workspace, id), analysis: analyzeDraft(scenarioDraft(workspace, id), new Date(0)) })), [workspace]);
  const [comparison, setComparison] = React.useState<'conservative' | 'upside'>(workspace.activeScenario === 'upside' ? 'upside' : 'conservative');
  const [cell, setCell] = React.useState<{ x: number; y: number; value: number } | null>(null);
  const snapshot = analysis.status === 'ready' ? analysis.presentation : undefined;
  const lane = selectedLane ?? snapshot?.topLane ?? 'flip';
  const grid = GRID_LANES.includes(lane) ? snapshot?.sensitivities.find(item => item.lane === lane) : undefined;
  React.useEffect(() => setCell(null), [snapshot, lane]);
  const active = workspace.activeScenario;
  const base = runs[0].analysis;
  const compared = runs.find(run => run.id === comparison)!;
  const pair = [runs[0], compared];
  const differences = NUMERIC_FIELDS.filter(key => inputChanged(compared.draft, workspace.base, key));
  const hasOverrides = Object.keys(workspace.variants[comparison]).length > 0;
  const metric = grid?.metric === 'monthly_cash_flow' ? 'Monthly cash flow in the grid' : grid?.metric === 'cash_left_in' ? 'Capital remaining in the deal' : 'Modeled spread in the grid';
  return <>
    <p className="id-view-intro">Keep Base in view while testing one alternative. Presets are illustrative assumptions, never forecasts.</p>
    {analysis.status !== 'ready' && <Unavailable analysis={analysis} onEdit={onEdit} />}
    <section className="id-comparison" aria-label="Scenario comparison">
      <div className="id-comparison-header"><div><h3>Base compared with</h3><div className="id-comparison-picker" role="group" aria-label="Scenario to compare">{(['conservative', 'upside'] as const).map(id => <button type="button" key={id} aria-pressed={comparison === id} onClick={() => setComparison(id)}>{SCENARIO_NAMES[id]}</button>)}</div></div><p className="id-brief-scenario" role="status">Brief uses <strong>{SCENARIO_NAMES[active]}</strong></p></div>
      <p className="id-scenario-state">{SCENARIO_NAMES[comparison]}: {differences.length ? `${differences.length} assumption${differences.length === 1 ? '' : 's'} changed` : 'Same inputs as Base'}. Selecting a comparison does not change your brief.</p>
      <table className="id-pair-table" aria-label="Scenario results"><thead><tr><th scope="col">Model result</th>{pair.map(run => <th scope="col" key={run.id}>{SCENARIO_NAMES[run.id]}{active === run.id && <small>Used in brief</small>}</th>)}</tr></thead><tbody>
        <tr><th scope="row">Cash required</th>{pair.map(run => <td key={run.id}><strong>{run.analysis.status === 'ready' ? money(run.analysis.presentation.totalCashIn) : 'Unavailable'}</strong>{run.id !== 'base' && <small>{resultDifference(run.analysis.status === 'ready' ? run.analysis.presentation.totalCashIn : undefined, base.status === 'ready' ? base.presentation.totalCashIn : undefined, 'cash')}</small>}</td>)}</tr>
        <tr><th scope="row">Monthly rental cash flow</th>{pair.map(run => <td key={run.id}><strong>{run.analysis.status === 'ready' ? money(run.analysis.rentalMetrics.monthlyCashFlow) : 'Unavailable'}</strong>{run.id !== 'base' && <small>{resultDifference(run.analysis.status === 'ready' ? run.analysis.rentalMetrics.monthlyCashFlow : undefined, base.status === 'ready' ? base.rentalMetrics.monthlyCashFlow : undefined, 'monthly')}</small>}</td>)}</tr>
        <tr><th scope="row">Leading path</th>{pair.map(run => <td key={run.id}>{run.analysis.status === 'ready' ? laneName(run.analysis.presentation.lanes[0]) : 'Unavailable'}{run.id !== 'base' && run.analysis.status === 'ready' && base.status === 'ready' && <small>{base.presentation.topLane === run.analysis.presentation.topLane ? 'Same path as Base' : 'Different path from Base'}</small>}</td>)}</tr>
      </tbody></table>
      {pair.some(run => run.analysis.missing.includes('scope')) && <p className="id-caption">Unreported scope is excluded from cash required.</p>}
      {pair.map(run => run.analysis.status === 'ready' && run.analysis.rentalUnavailableReason ? <p className="id-caption" key={run.id}>{SCENARIO_NAMES[run.id]}: {run.analysis.rentalUnavailableReason}</p> : null)}
      <div className="id-preset-note"><div><h4>{SCENARIO_NAMES[comparison]} preset</h4><p>{comparison === 'conservative' ? 'Exit value and rent −5%. Scope +10%. Interest rate +1 percentage point.' : 'Exit value and rent +5%. Other assumptions stay at Base.'}</p><p>Apply to preview the result, then choose which scenario the brief uses.</p></div><button type="button" className="id-button" aria-label={`Apply ${SCENARIO_NAMES[comparison]} preset`} onClick={() => onPreset(comparison)}>Apply preset <ArrowRight aria-hidden="true" /></button></div>
      <div className="id-actions id-comparison-actions"><button type="button" className="id-button is-primary" aria-label={`Use ${SCENARIO_NAMES[comparison]} scenario`} aria-pressed={active === comparison} onClick={() => onUse(comparison)}>{active === comparison ? `${SCENARIO_NAMES[comparison]} is used in brief` : `Use ${SCENARIO_NAMES[comparison]} for brief`}</button><button type="button" className="id-text-button" aria-label="Use Base scenario" aria-pressed={active === 'base'} onClick={() => onUse('base')}>{active === 'base' ? 'Base is used in brief' : 'Use Base for brief'}</button>{hasOverrides && <button type="button" className="id-text-button" aria-label={`Reset ${SCENARIO_NAMES[comparison]} to base`} onClick={() => onReset(comparison)}>Reset comparison to Base</button>}</div>
    </section>
    <p className="id-caption">Differences are calculated before rounding. Higher cash flow may still be negative. Presets apply only when chosen; missing and out-of-range inputs stay unchanged. A preset replaces that scenario’s overrides. Undo restores the prior state.</p>
    <section className="id-scenario-deltas"><h3>Assumption differences</h3><table className="id-pair-table" aria-label="Scenario assumption differences"><thead><tr><th scope="col">Assumption</th>{pair.map(run => <th scope="col" key={run.id}>{SCENARIO_NAMES[run.id]}</th>)}</tr></thead><tbody>{NUMERIC_FIELDS.filter(key => ['acquisition', 'scope', 'arv', 'marketRent', 'loanRate'].includes(key) || Object.hasOwn(workspace.variants[comparison], key)).map(key => <tr key={key}><th scope="row">{FIELD_LABELS[key]}</th>{pair.map(run => <td key={run.id}>{shownInput(run.draft, key)}{!run.draft[key] && Object.hasOwn(DEFAULTS, key) && <small>Model default</small>}{run.id !== 'base' && inputChanged(run.draft, workspace.base, key) && <small>Changed</small>}</td>)}</tr>)}</tbody></table><button type="button" className="id-text-button" onClick={onEdit}>Edit {SCENARIO_NAMES[active]} assumptions <ArrowRight aria-hidden="true" /></button></section>
    <section className="id-sensitivity"><header><div><h3>Sensitivity analysis</h3><p className="id-caption">Inspect one path at a time.</p></div><label>Sensitivity path<select value={lane} onChange={event => onLane(event.target.value as StrategyLane)}>{STRATEGY_LANES.map(id => <option key={id} value={id}>{id === 'listing_referral' ? 'Listing referral' : LANE_LABELS[id]}</option>)}</select></label></header>{grid ? <><p><strong>{metric}</strong>. {grid.yAxis.label} against {grid.xAxis.label}.</p><div className="id-table-scroll" tabIndex={0} role="region" aria-label="Sensitivity matrix, scroll horizontally on small screens"><table className="id-matrix" aria-label={`${LANE_LABELS[lane]} sensitivity`}><thead><tr><th>{grid.yAxis.label} ↓<br />{grid.xAxis.label} →</th>{grid.xAxis.values.map((value, index) => <th scope="col" key={index}>{money(value)}</th>)}</tr></thead><tbody>{grid.yAxis.values.map((y, row) => <tr key={row}><th scope="row">{money(y)}</th>{grid.xAxis.values.map((x, column) => { const value = grid.cells[row * grid.xAxis.values.length + column]; return <td key={column} data-sign={value < 0 ? 'negative' : value === 0 ? 'neutral' : 'positive'}><button type="button" aria-label={`${grid.yAxis.label} ${money(y)}, ${grid.xAxis.label} ${money(x)}: ${money(value)}`} aria-pressed={cell?.x === x && cell?.y === y} onClick={() => setCell({ x, y, value })}>{money(value)}</button></td>; })}</tr>)}</tbody></table></div><p className="id-caption">Negative / zero / positive values are labeled numerically. {grid.metric === 'cash_left_in' ? 'Lower means less capital remains invested; negative means modeled proceeds exceed basis plus scope.' : 'Higher means a larger modeled spread or cash flow.'} {lane === 'rental_hold' ? 'This sensitivity grid uses 75% acquisition LTV and holds current operating expenses fixed.' : ['flip', 'wholetail'].includes(lane) ? 'The grid allows 6% of exit value for closing and 12% for a buyer profit allowance. Carrying and other project costs are excluded.' : 'Grid-specific assumptions may differ from the complete lane model.'} A full engine run follows an applied change.</p>{cell && <div className="id-cell-inspector" role="status"><p>{grid.xAxis.label}: {money(cell.x)} · {grid.yAxis.label}: {money(cell.y)}<br /><strong>{metric}: {money(cell.value)}</strong></p>{cellPatch(grid, cell.x, cell.y) ? <button type="button" className="id-button" onClick={() => onApply(cellPatch(grid, cell.x, cell.y)!)}>Apply to {SCENARIO_NAMES[active]} scenario</button> : <p className="id-caption">Inspect only. These axes have no direct input mapping.</p>}</div>}</> : <p className="id-unavailable-text">No supported sensitivity grid is available for {lane === 'listing_referral' ? 'Listing referral' : LANE_LABELS[lane]} in this run. The engine provides grids for selected eligible paths only. Choose another path to inspect availability.</p>}</section>
    {analysis.status === 'ready' && (analysis.property.marketRent ?? 0) > 0 && <details className="id-details"><summary>Rental operating stress: Base / Stressed / Worst</summary><p className="id-caption">Operating stresses within the active {SCENARIO_NAMES[active]} model. These are separate from the whole-model scenarios above. Cases where operating expenses exceed collected rent are unavailable because this engine does not represent negative operating income.</p><div className="id-table-scroll" tabIndex={0} role="region" aria-label="Rental stress comparison, scroll horizontally on small screens"><table aria-label="Rental operating stress"><thead><tr><th>Case</th><th>Monthly rent</th><th>Vacancy</th><th>Annual cash flow</th><th>DSCR</th></tr></thead><tbody>{(['base', 'stressed', 'worst'] as const).map(id => { const item = analysis.presentation.scenarios[id]; return <tr key={id}><th scope="row">{id === 'base' ? 'Base' : id === 'stressed' ? 'Stressed' : 'Worst'}</th><td>{money(item.effectiveRent)}</td><td>{item.effectiveVacancyPct}%</td><td>{rentalCaseAvailable(item) ? money(item.annualCashFlow) : 'Unavailable'}</td><td>{!rentalCaseAvailable(item) ? 'Unavailable' : item.annualDebtService > 0 ? safeMetric(item.dscr.toFixed(2)) : 'No debt service'}</td></tr>; })}</tbody></table></div></details>}
  </>;
}
