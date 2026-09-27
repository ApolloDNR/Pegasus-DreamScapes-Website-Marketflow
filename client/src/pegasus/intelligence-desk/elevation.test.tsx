import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { PremiumStrategyLab } from '../strategy-lab-experience';
import { emptyWorkspace, illustrativeDraft, serializeDraft, STORAGE_KEY, restoreDraft } from './state';
import { comparisonGeometry, previewAssumption } from './WhatIf';
import { analyzeDraft } from './model';
import { memoText, peggyBrief, peggyModelContext } from './Memo';
import { readStrategyLabHandoff } from '../strategy-lab-handoff';
import { normalizeOwnerSituation } from '../owner-context';

afterEach(() => { cleanup(); window.localStorage.clear(); window.sessionStorage.clear(); vi.restoreAllMocks(); window.history.replaceState({}, '', '/'); });
function desk() { const location = memoryLocation({ path: '/strategy-lab', record: true }); return render(<Router hook={location.hook}><PremiumStrategyLab go={() => {}} openPeggy={() => {}} /></Router>); }

describe('experience elevation', () => {
  it('recomputes each supported preview through the canonical model without mutating Base', () => {
    const base = illustrativeDraft();
    for (const [field, raw] of [['scope', '125000'], ['arv', '900000'], ['marketRent', '5500']] as const) {
      expect(previewAssumption(base, field, raw)).toEqual(analyzeDraft({ ...base, [field]: raw }, new Date(0)));
    }
    expect(base.scope).toBe('105000');
    expect(previewAssumption(base, 'scope', '-1').status).toBe('invalid');
  });

  it('uses a shared zero for negative, positive and zero chart values', () => {
    expect(comparisonGeometry(-100, 100)).toEqual({ zero: 50, bars: [{ left: 0, width: 50 }, { left: 50, width: 50 }] });
    expect(comparisonGeometry(-50, -100).zero).toBe(100);
    expect(comparisonGeometry(0, 0).bars.every(bar => bar.width === 0)).toBe(true);
  });

  it('previews without editing Base, applies one alternative, and undoes the change', async () => {
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    const preview = screen.getByRole('region', { name: 'What changes if…' });
    fireEvent.change(within(preview).getByRole('textbox'), { target: { value: '125000' } });
    expect(preview).toHaveTextContent('$293,000');
    expect(screen.getByRole('region', { name: 'Key economics' })).toHaveTextContent('$273,000');
    expect(screen.getByRole('table', { name: 'Scenario results' })).not.toHaveTextContent('$293,000');
    fireEvent.click(within(preview).getByRole('button', { name: 'Apply preview' }));
    expect(screen.getByRole('table', { name: 'Scenario results' })).toHaveTextContent('$293,000');
    expect(screen.getByRole('region', { name: 'Key economics' })).toHaveTextContent('$273,000');
    fireEvent.click(screen.getByRole('button', { name: 'Use Conservative for brief' }));
    fireEvent.click(screen.getByRole('button', { name: 'Memo' }));
    expect(screen.getByRole('region', { name: 'Decision brief' })).toHaveTextContent('$293,000');
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('region', { name: 'Decision brief' })).toHaveTextContent('$273,000');
  });

  it('withholds missing and invalid previews, and resets to the original amount', async () => {
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    const preview = screen.getByRole('region', { name: 'What changes if…' });
    for (const value of ['', '-1', '100000001', 'not a number']) {
      fireEvent.change(within(preview).getByRole('textbox'), { target: { value } });
      expect(within(preview).getByRole('button', { name: 'Apply preview' })).toBeDisabled();
      expect(preview).toHaveTextContent('Unavailable');
    }
    fireEvent.click(within(preview).getByRole('button', { name: 'Reset preview' }));
    expect(within(preview).getByRole('textbox')).toHaveValue('105000');
  });

  it('reviews a new owner situation before replacing an existing property, with Undo', async () => {
    const saved = { ...emptyWorkspace(), base: { ...illustrativeDraft(), address: 'Existing test property' } };
    window.localStorage.setItem(STORAGE_KEY, serializeDraft(saved));
    window.history.replaceState({}, '', '/strategy-lab?owner_situation=Inherited%20property');
    desk();
    const review = await screen.findByRole('region', { name: 'Review owner context' });
    expect(screen.getAllByText('Existing test property').length).toBeGreaterThan(0);
    fireEvent.click(within(review).getByRole('button', { name: 'Use this situation' }));
    expect(screen.getByRole('textbox', { name: 'Property address or city' })).toHaveValue('');
    expect(restoreDraft(window.sessionStorage.getItem('pegasus.strategy-lab.working.v4')!)?.base).toMatchObject({ ownerSituation: 'Inherited property', situation: 'Inherited or estate property', submitterRole: 'Property owner' });
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('textbox', { name: 'Property address or city' })).toHaveValue('Existing test property');
    expect(normalizeOwnerSituation('__proto__').sourceLabel).toBe('');
  });

  it('carries deliberate owner facts and objective through Memo and intake', async () => {
    const base = { ...illustrativeDraft(), city: 'Test City', ownerSituation: 'Inherited property', objective: 'Preserve control or optionality', entered: ['ownerSituation', 'objective', 'city'] };
    window.sessionStorage.setItem('pegasus.strategy-lab.working.v4', serializeDraft({ ...emptyWorkspace(), base }));
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Memo' }));
    expect(screen.getByRole('region', { name: 'Decision brief' })).toHaveTextContent('Inherited property');
    fireEvent.click(screen.getByRole('button', { name: 'Continue with this property' }));
    expect(readStrategyLabHandoff()).toMatchObject({ ownerSituation: 'Inherited property', city: 'Test City', planningObjective: 'Preserve control or optionality', scenario: 'base' });
    const analysis = analyzeDraft(base);
    if (analysis.status !== 'ready') throw new Error('Expected model fixture');
    expect(memoText(base, analysis, 'base', [])).toContain('Inherited property');
    const prompt = peggyBrief(base, analysis, 'base', 'inquiry');
    expect(peggyModelContext(base, analysis, 'base')).toMatchObject({ schemaVersion: 1, scenario: 'base', cashRequired: 273000 });
    expect(prompt).not.toContain('schemaVersion');
    expect(prompt).toContain('do not send an inquiry for me');
    expect(prompt.length).toBeLessThanOrEqual(3900);
  });
});
