import { describe, expect, it } from 'vitest';
import { runStrategyLab } from '@shared/strategy-lab';
import { emptyWorkspace, illustrativeDraft } from './state';
import { analyzeDraft } from './model';
import { applyPreset, scenarioDraft, validatePhases, resultDifference } from './scenario-model';

describe('Whole-model scenario experiments', () => {
  const setup = () => ({ ...emptyWorkspace(), base: illustrativeDraft() });
  const now = new Date('2026-09-01T00:00:00Z');
  it('applies explicit deltas without mutating the base or another scenario', () => {
    const base = setup();
    const conservative = applyPreset(base, 'conservative');
    expect(base.variants.conservative).toEqual({});
    expect(conservative.base).toEqual(base.base);
    expect(conservative.variants.upside).toEqual({});
    expect(scenarioDraft(conservative, 'conservative')).toMatchObject({ arv: '798000', marketRent: '4275', scope: '115500', loanRate: '8.5' });
    const upside = applyPreset(conservative, 'upside');
    expect(scenarioDraft(upside, 'upside')).toMatchObject({ arv: '882000', marketRent: '4725', scope: '105000', loanRate: '7.5' });
  });
  it('reruns each scenario through the canonical engine with the exact input deltas', () => {
    const workspace = applyPreset(applyPreset(setup(), 'conservative'), 'upside');
    for (const id of ['base', 'conservative', 'upside'] as const) {
      const result = analyzeDraft(scenarioDraft(workspace, id), now);
      expect(result.status).toBe('ready');
      if (result.status === 'ready') expect(result.snapshot).toEqual(runStrategyLab(result.property, { ...result.options, now }));
    }
  });
  it('leaves unknown facts blank and refuses to exceed validated limits', () => {
    const workspace = setup();
    workspace.base.scope = '';
    workspace.base.marketRent = '';
    workspace.base.arv = '100000000';
    workspace.base.loanRate = '100';
    const conservative = applyPreset(workspace, 'conservative');
    expect(scenarioDraft(conservative, 'conservative').scope).toBe('');
    expect(scenarioDraft(conservative, 'conservative').marketRent).toBe('');
    expect(scenarioDraft(conservative, 'conservative').loanRate).toBe('100');
    expect(scenarioDraft(applyPreset(workspace, 'upside'), 'upside').arv).toBe('100000000');
  });
});

describe('Readable scenario result differences', () => {
  it('distinguishes cash needs from monthly cash-flow changes, including negative results', () => {
    expect(resultDifference(283500, 273000, 'cash')).toBe('$10,500 more cash than Base');
    expect(resultDifference(250000, 273000, 'cash')).toBe('$23,000 less cash than Base');
    expect(resultDifference(-412, -576, 'monthly')).toBe('$164 higher / month than Base');
    expect(resultDifference(-1053, -576, 'monthly')).toBe('$477 lower / month than Base');
    expect(resultDifference(0, 0, 'cash')).toBe('Same as Base');
  });
  it('preserves sub-dollar differences and never turns absent or nonfinite results into zero', () => {
    expect(resultDifference(273000.01, 273000, 'cash')).toBe('$0.01 more cash than Base');
    expect(resultDifference(273000.001, 273000, 'cash')).toBe('Less than $0.01 more cash than Base');
    expect(resultDifference(undefined, 0, 'monthly')).toBe('Comparison unavailable');
    expect(resultDifference(5, undefined, 'cash')).toBe('Comparison unavailable');
    expect(resultDifference(Infinity, 0, 'cash')).toBe('Comparison unavailable');
  });
});

describe('Planning-only timeline', () => {
  it('rejects negative duration and cycles without pretending to change economics', () => {
    const phases = emptyWorkspace().phases;
    expect(validatePhases(phases)).toEqual({});
    expect(validatePhases(phases.map(phase => phase.id === 'build' ? { ...phase, months: '-1' } : phase)).build).toMatch(/zero/i);
    const cycle = phases.map(phase => phase.id === 'diligence' ? { ...phase, after: 'exit' } : phase);
    expect(Object.values(validatePhases(cycle)).join(' ')).toMatch(/cycle/i);
  });
});
