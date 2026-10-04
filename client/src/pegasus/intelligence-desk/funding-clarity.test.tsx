import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Route, Router, Switch } from 'wouter';
import { OpportunityPlan } from '../opportunity-plan';
import { PremiumStrategyLab } from '../strategy-lab-experience';
import { emptyWorkspace, illustrativeDraft, restoreDraft, serializeDraft, STORAGE_KEY, type Workspace } from './state';

const SESSION_KEY = 'pegasus.strategy-lab.working.v4';
function desk(query = '') {
  window.history.replaceState({}, '', `/strategy-lab${query}`);
  return render(<Router><PremiumStrategyLab go={() => {}} openPeggy={() => {}} /></Router>);
}
function workingDraft() { return restoreDraft(window.sessionStorage.getItem(SESSION_KEY)!); }
function example() { desk(); fireEvent.click(screen.getByRole('button', { name: 'Load illustrative example' })); }

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('funding-first Strategy Lab', () => {
  it('carries the homepage funding question into the existing assumptions view', () => {
    window.history.replaceState({}, '', '/');
    render(<Router><Switch><Route path="/"><OpportunityPlan /></Route><Route path="/strategy-lab"><PremiumStrategyLab go={() => {}} openPeggy={() => {}} /></Route></Switch></Router>);
    fireEvent.click(screen.getByRole('button', { name: 'More planning questions' }));
    fireEvent.click(screen.getByRole('button', { name: 'What would funding require?' }));
    expect(screen.getByText(/Allow separately for ongoing carrying and exit costs/)).toBeVisible();
    const link = screen.getByRole('link', { name: 'Model the assumptions' });
    expect(link).toHaveAttribute('href', '/strategy-lab?question=funding');
    fireEvent.click(link);
    const context = screen.getByRole('region', { name: 'Planning question' });
    expect(context).toHaveTextContent('What would funding require?');
    expect(context).toHaveTextContent('does not arrange funding');
    expect(context).toHaveAttribute('data-peggy-private');
    expect(screen.getByRole('button', { name: 'Assumptions' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('textbox', { name: 'Acquisition or current basis' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Modeled loan-to-value' })).toHaveValue('75');
    expect(screen.queryByRole('region', { name: 'Key economics' })).not.toBeInTheDocument();
    expect(workingDraft()).toEqual(emptyWorkspace());
  });

  it.each(['saved', 'working'] as const)('opens the funding question without replacing the %s property or scenario', source => {
    const saved: Workspace = { ...emptyWorkspace(), base: { ...illustrativeDraft(), address: 'Synthetic saved property' }, activeScenario: 'conservative', variants: { conservative: { scope: '125000' }, upside: {} }, diligence: ['title'] };
    const working: Workspace = { ...saved, base: { ...saved.base, address: 'Synthetic working property' }, activeScenario: 'upside', variants: { ...saved.variants, upside: { scope: '135000' } }, diligence: ['permits'] };
    const rawSaved = serializeDraft(saved);
    window.localStorage.setItem(STORAGE_KEY, rawSaved);
    if (source === 'working') window.sessionStorage.setItem(SESSION_KEY, serializeDraft(working));
    const expected = source === 'working' ? working : saved;
    desk('?question=funding');
    expect(screen.getByRole('region', { name: 'Planning question' })).toHaveTextContent('Your current inputs and selected scenario are unchanged.');
    expect(screen.getByRole('textbox', { name: 'Property address or city' })).toHaveValue(expected.base.address);
    expect(screen.getByRole('textbox', { name: 'Scope / improvement budget' })).toHaveValue(source === 'working' ? '135000' : '125000');
    expect(workingDraft()).toEqual(expected);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(rawSaved);
  });

  it.each(['?question=private-canary', '?question=funding&question=private-canary', '?question=funding&question=funding'])('ignores unknown or repeated question context: %s', query => {
    desk(query);
    expect(screen.queryByRole('region', { name: 'Planning question' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start a property' })).toBeVisible();
    expect(document.body).not.toHaveTextContent('private-canary');
  });

  it('keeps a deliberate view selection when the funding prompt is present and after reload', () => {
    const first = desk('?question=funding');
    fireEvent.click(screen.getByRole('button', { name: 'Overview' }));
    expect(new URLSearchParams(window.location.search).get('view')).toBe('overview');
    first.unmount();
    desk(window.location.search);
    expect(screen.getByRole('button', { name: 'Start a property' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Planning question' })).toBeVisible();
  });

  it.each(['overview', 'scenarios', 'risk', 'memo'] as const)('respects an explicit %s view alongside funding context on a saved draft', view => {
    const saved = { ...emptyWorkspace(), base: illustrativeDraft() };
    window.localStorage.setItem(STORAGE_KEY, serializeDraft(saved));
    desk(`?question=funding&view=${view}`);
    expect(screen.getByRole('region', { name: 'Planning question' })).toBeVisible();
    expect(screen.getByRole('button', { name: view[0].toUpperCase() + view.slice(1) })).toHaveAttribute('aria-current', 'page');
    expect(workingDraft()).toEqual(saved);
  });

  it('restores the question and view on Back and Forward without changing the working inputs', async () => {
    desk('?view=scenarios');
    act(() => { window.history.pushState({}, '', '/strategy-lab?question=funding'); window.dispatchEvent(new PopStateEvent('popstate')); });
    expect(screen.getByRole('region', { name: 'Planning question' })).toBeVisible();
    fireEvent.change(screen.getByRole('textbox', { name: 'Acquisition or current basis' }), { target: { value: '612345' } });
    const draft = workingDraft();
    act(() => { window.history.back(); });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Scenarios' })).toHaveAttribute('aria-current', 'page'));
    expect(screen.queryByRole('region', { name: 'Planning question' })).not.toBeInTheDocument();
    expect(workingDraft()).toEqual(draft);
    act(() => { window.history.forward(); });
    await waitFor(() => expect(screen.getByRole('region', { name: 'Planning question' })).toBeVisible());
    expect(screen.getByRole('textbox', { name: 'Acquisition or current basis' })).toHaveValue('612345');
    expect(workingDraft()).toEqual(draft);
  });

  it('leads the overview with cash, costs and assumptions before the ranked path', () => {
    example();
    const economics = screen.getByRole('region', { name: 'Key economics' });
    const assumptions = screen.getByRole('complementary', { name: 'Property and model' });
    const inspector = screen.getByRole('complementary', { name: 'Result inspector' });
    expect(economics.compareDocumentPosition(inspector) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(assumptions.compareDocumentPosition(inspector) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(economics).getAllByRole('term')[0]).toHaveTextContent('Cash required');
    expect(economics).toHaveTextContent('$273,000');
    expect(economics).toHaveTextContent('$723,000');
    expect(economics).toHaveTextContent('Excludes ongoing carrying and exit costs.');
    expect(assumptions).toHaveTextContent('75%');
    expect(assumptions).toHaveTextContent('3%');
  });

  it('keeps the investor comparison secondary with its actual calculation and limits', () => {
    example();
    const inspector = screen.getByRole('complementary', { name: 'Result inspector' });
    const disclosure = within(inspector).getByText('How the listing comparison works').closest('details')!;
    expect(disclosure).not.toHaveAttribute('open');
    expect(within(inspector).getByText('$357,000')).not.toBeVisible();
    fireEvent.click(within(inspector).getByText('How the listing comparison works'));
    expect(within(inspector).getByText('$357,000')).toBeVisible();
    expect(disclosure).toHaveTextContent('$840,000 exit value less a $483,000 investor allowance');
    expect(disclosure).toHaveTextContent('This gap is not additional sale proceeds.');
    expect(disclosure).toHaveTextContent('not profit, an offer, or a return');
    expect(screen.getByText('Each path reports a different measure. Dollar amounts are not comparable returns.')).toBeVisible();
    expect(screen.getByTestId('text-strategy-disclaimer')).toHaveTextContent('not legal, tax, lending, accounting, appraisal, engineering, securities, construction, or investment advice');
  });
});
