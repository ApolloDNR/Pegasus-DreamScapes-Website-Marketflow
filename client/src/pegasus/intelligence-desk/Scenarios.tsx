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
  const [cell, setCell] = React.useState<{ x: number; y: number; value: number } | null>(null);
  const snapshot = analysis.status === 'ready' ? analysis.presentation : undefined;
  const lane = selectedLane ?? snapshot?.topLane ?? 'flip';
  const grid = GRID_LANES.includes(lane) ? snapshot?.sensitivities.find(item => item.lane === lane) : undefined;
  React.useEffect(() => setCell(null), [snapshot, lane]);
  const active = workspace.activeScenario;
  const base = runs[0].analysis;
  const metric = grid?.metric === 'monthly_cash_flow' ? 'Monthly cash flow in the grid' : grid?.metric === 'cash_left_in' ? 'Capital remaining in the deal' : 'Modeled spread in the grid';
  return <>
    <p className="id-view-intro">Explicit experiments against your base model. Presets are illustrative, never forecasts or probabilities.</p>
    {analysis.status !== 'ready' && <Unavailable analysis={analysis} onEdit={onEdit} />}
    <div className="id-scenario-columns">{runs.map(run => {
      const differences = NUMERIC_FIELDS.filter(key => inputChanged(run.draft, workspace.base, key));
      const variant = run.id === 'base' ? null : run.id;
      const hasOverrides = variant !== null && Object.keys(workspace.variants[variant]).length > 0;
      return <section key={run.id} className={active === run.id ? 'is-active' : ''} aria-label={`${SCENARIO_NAMES[run.id]} comparison`}>
        <header><h3>{SCENARIO_NAMES[run.id]}</h3>{active === run.id && <span className="id-scenario-active">Active</span>}</header>
        <p className="id-scenario-state">{!variant ? 'Your reference model' : differences.length ? `${differences.length} assumption${differences.length === 1 ? '' : 's'} changed` : 'Same inputs as Base'}</p>
        {run.analysis.status === 'ready' ? <><dl><div><dt>Cash required</dt><dd>{money(run.analysis.presentation.totalCashIn)}<small className="id-result-delta">{variant ? resultDifference(run.analysis.presentation.totalCashIn, base.status === 'ready' ? base.presentation.totalCashIn : undefined, 'cash') : 'Reference amount'}</small></dd></div><div><dt>Monthly rental cash flow</dt><dd>{money(run.analysis.rentalMetrics.monthlyCashFlow)}<small className="id-result-delta">{variant ? resultDifference(run.analysis.rentalMetrics.monthlyCashFlow, base.status === 'ready' ? base.rentalMetrics.monthlyCashFlow : undefined, 'monthly') : 'Reference cash flow'}</small></dd></div><div><dt>Highest modeled fit</dt><dd>{laneName(run.analysis.presentation.lanes[0])}<small className="id-result-delta">{!variant ? 'Reference path' : base.status !== 'ready' ? 'Comparison unavailable' : base.presentation.topLane === run.analysis.presentation.topLane ? 'Same path as Base' : `Base: ${laneName(base.presentation.lanes[0])}`}</small></dd></div></dl>{run.analysis.missing.includes('scope') && <p className="id-caption">Scope is unreported and excluded from cash required.</p>}{run.analysis.rentalUnavailableReason && <p className="id-caption">{run.analysis.rentalUnavailableReason}</p>}</> : <p>Needs valid scenario inputs.</p>}
        {variant && <div className="id-preset-note"><h4>Illustrative preset</h4><p>{variant === 'conservative' ? 'Exit value and rent −5%. Scope +10%. Interest rate +1 percentage point.' : 'Exit value and rent +5%. Other assumptions stay at Base.'}</p></div>}
        <div className="id-scenario-controls">
          {variant && !differences.length && <button type="button" className="id-button" aria-label={`Apply ${SCENARIO_NAMES[variant]} preset`} onClick={() => onPreset(variant)}>Apply illustrative preset <ArrowRight aria-hidden="true" /></button>}
          <button type="button" className={!variant || differences.length ? 'id-button' : 'id-text-button'} aria-label={`Use ${SCENARIO_NAMES[run.id]} scenario`} aria-pressed={active === run.id} onClick={() => onUse(run.id)}>{active === run.id ? 'Active scenario' : 'Use this scenario'}</button>
          {variant && hasOverrides && <div className="id-scenario-actions">{differences.length > 0 && <button type="button" className="id-text-button" aria-label={`Apply ${SCENARIO_NAMES[variant]} preset`} onClick={() => onPreset(variant)}>Apply preset</button>}<button type="button" className="id-text-button" aria-label={`Reset ${SCENARIO_NAMES[variant]} to base`} onClick={() => onReset(variant)}>Reset to base</button></div>}
        </div>
      </section>;
    })}</div>
    <p className="id-caption">Differences are calculated before rounding. Higher cash flow may still be negative. Presets apply only when chosen; missing and out-of-range inputs stay unchanged. A preset replaces that scenario’s overrides. Undo restores the prior state.</p>
    <section className="id-scenario-deltas"><h3>Assumption differences</h3><div className="id-table-scroll" tabIndex={0} role="region" aria-label="Scenario differences, scroll horizontally on small screens"><table aria-label="Scenario assumption differences"><thead><tr><th>Assumption</th>{SCENARIOS.map(id => <th key={id}>{SCENARIO_NAMES[id]}</th>)}</tr></thead><tbody>{NUMERIC_FIELDS.filter(key => ['acquisition', 'scope', 'arv', 'marketRent', 'loanRate'].includes(key) || Object.hasOwn(workspace.variants.conservative, key) || Object.hasOwn(workspace.variants.upside, key)).map(key => <tr key={key}><th scope="row">{FIELD_LABELS[key]}</th>{runs.map(run => <td key={run.id}>{shownInput(run.draft, key)}{!run.draft[key] && Object.hasOwn(DEFAULTS, key) && <small>Model default used</small>}{run.id !== 'base' && inputChanged(run.draft, workspace.base, key) && <small>Changed from base</small>}</td>)}</tr>)}</tbody></table></div><button type="button" className="id-text-button" onClick={onEdit}>Edit {SCENARIO_NAMES[active]} assumptions <ArrowRight aria-hidden="true" /></button></section>
    <section className="id-sensitivity"><header><div><h3>Sensitivity analysis</h3><p className="id-caption">Inspect one path at a time.</p></div><label>Sensitivity path<select value={lane} onChange={event => onLane(event.target.value as StrategyLane)}>{STRATEGY_LANES.map(id => <option key={id} value={id}>{id === 'listing_referral' ? 'Listing referral' : LANE_LABELS[id]}</option>)}</select></label></header>{grid ? <><p><strong>{metric}</strong>. {grid.yAxis.label} against {grid.xAxis.label}.</p><div className="id-table-scroll" tabIndex={0} role="region" aria-label="Sensitivity matrix, scroll horizontally on small screens"><table className="id-matrix" aria-label={`${LANE_LABELS[lane]} sensitivity`}><thead><tr><th>{grid.yAxis.label} ↓<br />{grid.xAxis.label} →</th>{grid.xAxis.values.map((value, index) => <th scope="col" key={index}>{money(value)}</th>)}</tr></thead><tbody>{grid.yAxis.values.map((y, row) => <tr key={row}><th scope="row">{money(y)}</th>{grid.xAxis.values.map((x, column) => { const value = grid.cells[row * grid.xAxis.values.length + column]; return <td key={column} data-sign={value < 0 ? 'negative' : value === 0 ? 'neutral' : 'positive'}><button type="button" aria-label={`${grid.yAxis.label} ${money(y)}, ${grid.xAxis.label} ${money(x)}: ${money(value)}`} aria-pressed={cell?.x === x && cell?.y === y} onClick={() => setCell({ x, y, value })}>{money(value)}</button></td>; })}</tr>)}</tbody></table></div><p className="id-caption">Negative / zero / positive values are labeled numerically. {grid.metric === 'cash_left_in' ? 'Lower means less capital remains invested; negative means modeled proceeds exceed basis plus scope.' : 'Higher means a larger modeled spread or cash flow.'} {lane === 'rental_hold' ? 'This sensitivity grid uses 75% acquisition LTV and holds current operating expenses fixed.' : ['flip', 'wholetail'].includes(lane) ? 'The grid allows 6% of exit value for closing and 12% for a buyer profit allowance. Carrying and other project costs are excluded.' : 'Grid-specific assumptions may differ from the complete lane model.'} A full engine run follows an applied change.</p>{cell && <div className="id-cell-inspector" role="status"><p>{grid.xAxis.label}: {money(cell.x)} · {grid.yAxis.label}: {money(cell.y)}<br /><strong>{metric}: {money(cell.value)}</strong></p>{cellPatch(grid, cell.x, cell.y) ? <button type="button" className="id-button" onClick={() => onApply(cellPatch(grid, cell.x, cell.y)!)}>Apply to {SCENARIO_NAMES[active]} scenario</button> : <p className="id-caption">Inspect only. These axes have no direct input mapping.</p>}</div>}</> : <p className="id-unavailable-text">No supported sensitivity grid is available for {lane === 'listing_referral' ? 'Listing referral' : LANE_LABELS[lane]} in this run. The engine provides grids for selected eligible paths only. Choose another path to inspect availability.</p>}</section>
    {analysis.status === 'ready' && (analysis.property.marketRent ?? 0) > 0 && <details className="id-details"><summary>Rental operating stress: Base / Stressed / Worst</summary><p className="id-caption">Operating stresses within the active {SCENARIO_NAMES[active]} model. These are separate from the whole-model scenarios above. Cases where operating expenses exceed collected rent are unavailable because this engine does not represent negative operating income.</p><div className="id-table-scroll" tabIndex={0} role="region" aria-label="Rental stress comparison, scroll horizontally on small screens"><table aria-label="Rental operating stress"><thead><tr><th>Case</th><th>Monthly rent</th><th>Vacancy</th><th>Annual cash flow</th><th>DSCR</th></tr></thead><tbody>{(['base', 'stressed', 'worst'] as const).map(id => { const item = analysis.presentation.scenarios[id]; return <tr key={id}><th scope="row">{id === 'base' ? 'Base' : id === 'stressed' ? 'Stressed' : 'Worst'}</th><td>{money(item.effectiveRent)}</td><td>{item.effectiveVacancyPct}%</td><td>{rentalCaseAvailable(item) ? money(item.annualCashFlow) : 'Unavailable'}</td><td>{!rentalCaseAvailable(item) ? 'Unavailable' : item.annualDebtService > 0 ? safeMetric(item.dscr.toFixed(2)) : 'No debt service'}</td></tr>; })}</tbody></table></div></details>}
  </>;
}
