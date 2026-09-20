import React from 'react';
import type { StrategySnapshot } from '@shared/strategy-lab';
import { money } from './model';

export function CapitalBreakdown({ snapshot, unknownScope }: { snapshot: StrategySnapshot; unknownScope: boolean }) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const rows = [...snapshot.capitalStack].sort((a, b) => Number(b.source === 'conventional') - Number(a.source === 'conventional'));
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const colors = ['#173a4b', '#8e5030', '#b98160', '#d4b49a'];
  const amountLabel = (row: typeof rows[number]) => unknownScope && row.source === 'rehab_cash' ? 'Unreported' : money(row.amount);
  const inspected = rows.find(row => row.source === selected);
  return <section className="id-capital" aria-label="Acquisition funding"><header><h3>Acquisition funding</h3><span>{money(total)}</span></header><div className="id-funding-bar" role="img" aria-label={`Acquisition funding: ${rows.map(row => `${row.label} ${amountLabel(row)}`).join(', ')}`}>
    {rows.map((row, index) => <span key={row.source} style={{ flexGrow: total > 0 ? row.amount / total : 0, background: colors[index] }} />)}
  </div><dl className="id-funding-legend">{rows.map((row, index) => <div key={row.source}><dt><button type="button" onClick={() => setSelected(row.source)} aria-pressed={selected === row.source}><i style={{ background: colors[index] }} aria-hidden="true" />{row.label}</button></dt><dd>{amountLabel(row)}</dd></div>)}</dl>
  <p className="id-caption">{inspected ? `${inspected.label}: ${amountLabel(inspected)}. ${inspected.source === 'conventional' ? `Modeled at ${inspected.ratePct}% annual interest; not a lending offer.` : 'Cash contribution in the acquisition model.'}` : 'Purchase, scope and closing reserve. Excludes ongoing carrying and exit costs.'}{unknownScope && ' Scope is unreported and excluded from this total.'}</p></section>;
}
