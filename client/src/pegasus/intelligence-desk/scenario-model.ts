import { type Workspace, type ScenarioId, type PlanPhase, type Draft, type ScenarioPatch, type NumericField } from './state';
import { numericValue, money } from './model';

const PRECISE_DOLLARS = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
export function resultDifference(value: number | undefined, base: number | undefined, kind: 'cash' | 'monthly'): string {
  if (value === undefined || base === undefined || !Number.isFinite(value) || !Number.isFinite(base)) return 'Comparison unavailable';
  const delta = value - base;
  if (delta === 0) return 'Same as Base';
  const amount = Math.abs(delta);
  const shown = amount < 0.005 ? 'Less than $0.01' : amount < 1 ? PRECISE_DOLLARS.format(amount) : money(amount);
  return kind === 'cash'
    ? `${shown} ${delta > 0 ? 'more' : 'less'} cash than Base`
    : `${shown} ${delta > 0 ? 'higher' : 'lower'} / month than Base`;
}

export function scenarioDraft(workspace: Workspace, id: ScenarioId): Draft {
  const overrides = id === 'base' ? {} : workspace.variants[id];
  return { ...workspace.base, ...overrides, entered: [...new Set([...workspace.base.entered, ...Object.keys(overrides)])] };
}

export function applyPreset(workspace: Workspace, id: 'conservative' | 'upside'): Workspace {
  const patch: ScenarioPatch = {};
  const changes: Array<[NumericField, number, number]> = id === 'conservative'
    ? [['arv', .95, 0], ['marketRent', .95, 0], ['scope', 1.1, 0], ['loanRate', 1, 1]]
    : [['arv', 1.05, 0], ['marketRent', 1.05, 0]];
  for (const [key, multiplier, delta] of changes) {
    const value = numericValue(key, workspace.base[key]).value;
    if (value === undefined) continue;
    const next = String(Math.round((value * multiplier + delta) * 100) / 100);
    if (!numericValue(key, next).error) patch[key] = next;
  }
  return { ...workspace, variants: { ...workspace.variants, [id]: patch } };
}

export function validatePhases(phases: PlanPhase[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const phase of phases) {
    if (phase.months.trim() && (!/^\d+(?:\.\d+)?$/.test(phase.months) || Number(phase.months) > 120)) errors[phase.id] = 'Use a duration from zero to 120 months.';
    const visited = new Set<string>([phase.id]);
    let after = phase.after;
    while (after) {
      if (visited.has(after)) { errors[phase.id] = 'This dependency creates a cycle.'; break; }
      visited.add(after);
      const parent = phases.find(item => item.id === after);
      if (!parent) { errors[phase.id] = 'Choose an existing phase.'; break; }
      after = parent.after;
    }
  }
  return errors;
}
