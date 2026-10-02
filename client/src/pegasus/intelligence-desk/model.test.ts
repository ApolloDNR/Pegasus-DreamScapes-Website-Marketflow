import { describe, expect, it } from 'vitest';
import { runStrategyLab } from '@shared/strategy-lab';
import { INITIAL_DRAFT, restoreDraft, serializeDraft, fieldOrigin } from './state';
import { analyzeDraft } from './model';

const now = new Date('2026-09-01T00:00:00Z');
const example = () => ({ ...INITIAL_DRAFT, acquisition: '600000', scope: '105000', arv: '840000', marketRent: '4500' });

describe('Intelligence Desk analysis boundary', () => {
  it('withholds the snapshot until a positive basis and exit evidence exist', () => {
    expect(analyzeDraft(INITIAL_DRAFT, now).status).toBe('missing');
    expect(analyzeDraft({ ...INITIAL_DRAFT, acquisition: '600000' }, now).snapshot).toBeUndefined();
    expect(analyzeDraft(example(), now).status).toBe('ready');
  });

  it('reconciles the existing engine funding fixture and preserves all nine paths', () => {
    const analysis = analyzeDraft(example(), now);
    expect(analysis.status).toBe('ready');
    if (analysis.status !== 'ready') return;
    expect(analysis.snapshot.totalCashIn).toBeCloseTo(273000, 2);
    expect(analysis.snapshot.capitalStack.reduce((sum, row) => sum + row.amount, 0)).toBeCloseTo(723000, 2);
    expect(analysis.snapshot.lanes.map((lane) => lane.lane).sort()).toEqual([
      'adu_development', 'brrrr', 'flip', 'ground_up', 'jv', 'listing_referral', 'rental_hold', 'wholesale', 'wholetail',
    ]);
    expect(analysis.snapshot).toEqual(runStrategyLab(analysis.property, { ...analysis.options, now }));
  });

  it.each(['abc', '$', '.', '-2', '100000001', '1e9', 'NaN', 'Infinity'])('gates malformed or out-of-range basis %s', (acquisition) => {
    const result = analyzeDraft({ ...example(), acquisition }, now);
    expect(result.status).toBe('invalid');
    expect(result.snapshot).toBeUndefined();
  });

  it('keeps a missing scope distinct from a confirmed zero', () => {
    const unknown = analyzeDraft({ ...example(), scope: '' }, now);
    const zero = analyzeDraft({ ...example(), scope: '0' }, now);
    expect(unknown.missing).toContain('scope');
    expect(zero.missing).not.toContain('scope');
    if (unknown.status !== 'ready' || zero.status !== 'ready') return;
    expect(unknown.property.rehabBudget).toBeUndefined();
    expect(zero.property.rehabBudget).toBe(0);
  });

  it('preserves unknown evidence and fails closed for an invalid rate or loan term', () => {
    const result = analyzeDraft(example(), now);
    if (result.status !== 'ready') return expect(result.status).toBe('ready');
    expect(result.property.titleClouded).toBeUndefined();
    expect(result.property.permitConcerns).toBeUndefined();
    expect(result.property.occupancyStatus).toBe('unknown');
    expect(analyzeDraft({ ...example(), loanRate: '101' }, now).status).toBe('invalid');
    expect(analyzeDraft({ ...example(), loanTerm: '0' }, now).status).toBe('invalid');
    expect(analyzeDraft({ ...example(), loanRate: '0' }, now).status).toBe('ready');
  });

  it('does not expose a finite debt coverage ratio when debt service is zero', () => {
    const result = analyzeDraft({ ...example(), loanLtv: '0' }, now);
    expect(result.status).toBe('ready');
    if (result.status === 'ready') expect(result.rentalMetrics.dscr).toBeUndefined();
  });

  it('withholds lane economics and narratives that require missing exit or scope inputs', () => {
    for (const patch of [{ arv: '' }, { scope: '' }]) {
      const result = analyzeDraft({ ...example(), ...patch }, now);
      expect(result.status).toBe('ready');
      if (result.status !== 'ready') continue;
      const lane = result.presentation.lanes.find(lane => lane.lane === 'wholetail')!;
      expect(lane.economics.primaryValue).toBe('Unavailable');
      expect(lane.economics.metrics.every(metric => metric.value === 'Unavailable')).toBe(true);
      expect(lane.confidence.supportingFactors).toEqual([]);
      expect(result.presentation.memo.paragraph).not.toContain('$181,200');
    }
  });

  it('does not present zero cash-on-cash without cash or hide rental operating losses', () => {
    const noCash = analyzeDraft({ ...example(), loanLtv: '100', scope: '0', closingReserve: '0' }, now);
    if (noCash.status !== 'ready') throw new Error('Fixture should run');
    const rental = noCash.presentation.lanes.find(lane => lane.lane === 'rental_hold')!;
    expect(rental.economics.metrics.find(metric => /cash-on-cash/i.test(metric.label))?.value).toBe('Unavailable');
    const loss = analyzeDraft({ ...example(), marketRent: '100', loanLtv: '0' }, now);
    if (loss.status !== 'ready') throw new Error('Fixture should run');
    expect(loss.rentalMetrics.monthlyCashFlow).toBeUndefined();
    expect(loss.presentation.lanes.find(lane => lane.lane === 'rental_hold')?.economics.primaryValue).toBe('Unavailable');
    expect(loss.rentalUnavailableReason).toMatch(/operating expenses exceed/i);
  });
});

describe('Browser-local draft recovery', () => {
  it('labels migrated custom financing as restored visitor input', () => {
    const restored = restoreDraft(JSON.stringify({ schemaVersion: 3, state: { acquisition: '600000', arv: '840000', loanLtv: '60', loanRate: '12' } }))!;
    expect(fieldOrigin(restored.base, 'loanLtv')).toBe('Visitor entered');
    expect(fieldOrigin(restored.base, 'loanRate')).toBe('Visitor entered');
  });
  it('restores v2 and v3 data without replacing explicit zeroes or private addresses', () => {
    const legacy = { ...example(), scope: '0', address: 'Visitor property', occupancy: 'Tenant occupied' };
    for (const envelope of [legacy, { schemaVersion: 3, savedAt: now.toISOString(), state: legacy }]) {
      const restored = restoreDraft(JSON.stringify(envelope));
      expect(restored?.base.scope).toBe('0');
      expect(restored?.base.address).toBe('Visitor property');
      expect(restored?.base.occupancy).toBe('Tenant occupied');
      expect(restored?.activeScenario).toBe('base');
    }
  });

  it('round-trips new draft state and rejects malformed or unsupported envelopes', () => {
    const restored = restoreDraft(JSON.stringify({ schemaVersion: 3, state: example() }));
    expect(restored).not.toBeNull();
    if (!restored) return;
    expect(restoreDraft(serializeDraft(restored, now))).toEqual(restored);
    expect(restoreDraft('{bad')).toBeNull();
    expect(restoreDraft(JSON.stringify({ schemaVersion: 99, state: example() }))).toBeNull();
    expect(restoreDraft('[]')).toBeNull();
  });
});
