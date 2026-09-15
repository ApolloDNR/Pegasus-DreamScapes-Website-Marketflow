import { Check, ChevronRight } from 'lucide-react';

/** Keep the selected answer beside its control, including on narrow screens. */
export function ResponsiveChoiceList({ id, label, options, value, onChange, controls, className, itemClassName }: {
  id: string; label: string; options: ReadonlyArray<{ label: string }>; value: number;
  onChange: (index: number) => void; controls: string; className: string; itemClassName: string;
}) {
  return (
    <div className="pg-choice-control">
      <div className="pg-choice-mobile">
        <label htmlFor={id}>{label}</label>
        <select id={id} value={value} onChange={(event) => onChange(Number(event.target.value))} aria-controls={controls}>
          {options.map((option, index) => <option key={option.label} value={index}>{option.label}</option>)}
        </select>
      </div>
      <div className={`${className} pg-choice-desktop`} role="group" aria-label={label}>
        {options.map((option, index) => (
          <button key={option.label} type="button" aria-pressed={index === value} aria-controls={controls}
            className={itemClassName} data-on={index === value || undefined} onClick={() => onChange(index)}>
            <span>{option.label}</span>{index === value ? <Check aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
}
