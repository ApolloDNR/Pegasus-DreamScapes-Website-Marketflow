import React from 'react';
import { ArrowRight } from 'lucide-react';
import { DraftInput, DraftSelect, InputField } from './Fields';
import { money, type Analysis } from './model';
import { fieldOrigin, type Draft, type DraftField, type NumericField, type ScenarioId, SCENARIO_NAMES } from './state';
import { Unavailable } from './Overview';

export function Assumptions({ draft, analysis, scenario, onChange, onOverview }: { draft: Draft; analysis: Analysis; scenario: ScenarioId; onChange: (key: DraftField, value: string) => void; onOverview: () => void }) {
  const group = (title: string, fields: NumericField[]) => <fieldset><legend>{title}</legend><div className="id-field-grid">{fields.map(field => <DraftInput key={field} field={field} draft={draft} error={analysis.errors[field]} onChange={onChange} />)}</div></fieldset>;
  return <div className="id-assumptions-layout">
    <div className="id-assumption-core">
      <p className="id-view-intro">{scenario === 'base' ? 'Edit the base model. Results update as you work.' : `Editing ${SCENARIO_NAMES[scenario]} overrides. Base inputs remain intact.`} Suggested terms are model defaults, not lending offers.</p>
      {group('Acquisition and exit', ['acquisition', 'scope', 'arv', 'marketRent'])}
      <InputField label="Property address or city" value={draft.address} onChange={value => onChange('address', value)} origin={fieldOrigin(draft, 'address')} />
    </div>
    <aside className="id-assumption-read" aria-label="Live assumption summary">
      <h3>Live model</h3>
      {analysis.status === 'ready' ? <><dl><div><dt>Modeled cash required</dt><dd>{money(analysis.snapshot.totalCashIn)}</dd></div><div><dt>Triggered risk flags</dt><dd>{analysis.snapshot.risks.length}</dd></div></dl><p>{analysis.missing.includes('scope') ? 'The scope budget is unreported and excluded from cash required.' : 'Results use the active scenario and update with every valid edit.'}</p></> : <Unavailable analysis={analysis} onEdit={() => document.querySelector<HTMLInputElement>('.id-field input')?.focus()} />}
      <button type="button" className="id-button" onClick={onOverview}>Open Overview <ArrowRight aria-hidden="true" /></button><p className="id-caption">Blank and zero have different meanings. Leave missing facts blank.</p>
    </aside>
    <div className="id-assumption-advanced">
      {group('Debt and capital', ['loanLtv', 'loanRate', 'loanTerm', 'closingReserve'])}
      <details className="id-details"><summary>Operating assumptions</summary>{group('Rental operating model', ['vacancy', 'management', 'taxRate', 'insurance', 'hoa'])}<p className="id-caption">The engine also allows 8% of collected rent for repairs and 5% for capital expenditure in its base rental case.</p></details>
      <details className="id-details"><summary>Property context and evidence</summary><div className="id-field-grid"><InputField label="City / submarket" value={draft.city} onChange={value => onChange('city', value)} origin={fieldOrigin(draft, 'city')} />{([['propertyType', 'Property type'], ['situation', 'Situation'], ['condition', 'Condition'], ['occupancy', 'Occupancy'], ['submitterRole', 'Your position'], ['timing', 'Timing'], ['titleStatus', 'Title evidence'], ['permitStatus', 'Permit evidence'], ['financingStatus', 'Financing evidence']] as const).map(([field, label]) => <DraftSelect key={field} field={field} label={label} draft={draft} onChange={onChange} />)}</div><p className="id-caption">Context and evidence are shared across scenarios. A visitor statement is not professional verification. Comparable property data is not connected to this public desk.</p></details>
    </div>
  </div>;
}
