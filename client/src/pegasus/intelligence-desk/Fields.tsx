import React from 'react';
import { fieldOrigin, OPTIONS, type Draft, type DraftField, type NumericField } from './state';

export const FIELD_LABELS: Record<NumericField, string> = {
  acquisition: 'Acquisition or current basis', scope: 'Scope / improvement budget', arv: 'Projected exit value', marketRent: 'Projected monthly market rent',
  loanLtv: 'Modeled loan-to-value', loanRate: 'Modeled interest rate', loanTerm: 'Loan term', vacancy: 'Vacancy allowance', management: 'Management allowance', closingReserve: 'Closing + reserve allowance',
  taxRate: 'Annual property tax rate', insurance: 'Monthly insurance', hoa: 'Monthly HOA', sqft: 'Building area', beds: 'Bedrooms', baths: 'Bathrooms',
};
export const FIELD_UNITS: Partial<Record<NumericField, string>> = { acquisition: '$', scope: '$', arv: '$', marketRent: '$ / month', loanLtv: '%', loanRate: '% annual', loanTerm: 'years', vacancy: '%', management: '%', closingReserve: '% of basis', taxRate: '% annual', insurance: '$ / month', hoa: '$ / month', sqft: 'sq ft' };

export function InputField({ label, value, onChange, unit, origin, error, numeric = false, field }: { label: string; value: string; onChange: (value: string) => void; unit?: string; origin?: string; error?: string; numeric?: boolean; field?: DraftField }) {
  const id = React.useId();
  return <div className="id-field"><label htmlFor={id}>{label}</label><div className="id-input-wrap"><input id={id} data-desk-field={field} aria-label={label} aria-invalid={Boolean(error)} aria-describedby={`${id}-note`} inputMode={numeric ? 'decimal' : undefined} value={value} onChange={event => onChange(event.target.value)} autoComplete="off" maxLength={180} />{unit && <span aria-hidden="true">{unit}</span>}</div><small id={`${id}-note`} className={error ? 'id-error' : ''}>{error || `${origin || 'Visitor entered'}${unit ? ` · ${unit}` : ''}`}</small></div>;
}

export function DraftInput({ field, draft, onChange, error }: { field: NumericField; draft: Draft; onChange: (key: DraftField, value: string) => void; error?: string }) {
  return <InputField field={field} label={FIELD_LABELS[field]} value={draft[field]} unit={FIELD_UNITS[field]} error={error} origin={fieldOrigin(draft, field)} numeric onChange={value => onChange(field, value)} />;
}

export function DraftSelect({ field, label, draft, onChange }: { field: keyof typeof OPTIONS; label: string; draft: Draft; onChange: (key: DraftField, value: string) => void }) {
  const id = React.useId();
  return <div className="id-field"><label htmlFor={id}>{label}</label><select id={id} data-desk-field={field} aria-label={label} value={draft[field]} onChange={event => onChange(field, event.target.value)}>{OPTIONS[field].map(value => <option key={value}>{value}</option>)}</select><small>{fieldOrigin(draft, field)}</small></div>;
}
