import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { PremiumStrategyLab } from '../strategy-lab-experience';
import { readStrategyLabHandoff } from '../strategy-lab-handoff';

afterEach(() => { cleanup(); window.localStorage.clear(); window.sessionStorage.clear(); vi.restoreAllMocks(); window.history.replaceState({}, '', '/'); });
function desk() {
  const location = memoryLocation({ path: '/strategy-lab', record: true });
  return { ...render(<Router hook={location.hook}><PremiumStrategyLab go={() => {}} openPeggy={() => {}} /></Router>), location };
}

describe('Public Intelligence Desk', () => {
  it('opens without a fabricated analysis and keeps all five views keyboard reachable', async () => {
    desk();
    const nav = await screen.findByRole('navigation', { name: 'Analysis views' });
    expect(within(nav).getAllByRole('button').map(button => button.textContent)).toEqual(['Overview', 'Assumptions', 'Scenarios', 'Risk', 'Memo']);
    expect(screen.queryByText('Leading path')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start a property' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Model assumptions' })).toHaveFocus());
    expect(screen.getByRole('textbox', { name: 'Acquisition or current basis' })).toBeVisible();
  });

  it('updates real funding when scope changes and withholds output for invalid inputs', async () => {
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    expect(screen.getByRole('region', { name: 'Key economics' })).toHaveTextContent('$273,000');
    fireEvent.click(screen.getByRole('button', { name: 'Assumptions' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Scope / improvement budget' }), { target: { value: '125000' } });
    expect(screen.getByRole('region', { name: 'Key economics' })).toHaveTextContent('$293,000');
    fireEvent.change(screen.getByRole('textbox', { name: 'Modeled interest rate' }), { target: { value: '101' } });
    expect(screen.getByRole('textbox', { name: 'Modeled interest rate' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('region', { name: 'Key economics' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Overview' }));
    expect(screen.queryByText('Leading path')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Analysis unavailable' })).toHaveTextContent('Correct the highlighted inputs');
  });

  it('distinguishes an inspected path from the leading model and keeps nine paths', async () => {
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    fireEvent.click(screen.getByRole('button', { name: 'View all nine paths' }));
    const paths = screen.getByRole('table', { name: 'Ranked strategy paths' });
    expect(within(paths).getAllByRole('row')).toHaveLength(10);
    fireEvent.click(within(paths).getByRole('button', { name: 'Inspect Rental Hold' }));
    const inspector = screen.getByRole('complementary', { name: 'Result inspector' });
    expect(within(inspector).getByRole('heading', { name: 'Rental Hold' })).toHaveFocus();
    expect(inspector).toHaveTextContent('Inspecting this path');
    expect(inspector).toHaveTextContent('Rental Hold');
    expect(inspector).toHaveTextContent('Leading path: Listing referral');
  });

  it('explains the leading metric and opens the exact next assumption with focus', async () => {
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    const inspector = screen.getByRole('complementary', { name: 'Result inspector' });
    expect(inspector).toHaveTextContent('$840,000 exit value less a $483,000 investor allowance');
    expect(inspector).toHaveTextContent('This gap is not additional sale proceeds.');
    expect(inspector).toHaveTextContent('exceeds the model’s $30,000 comparison point');
    fireEvent.click(within(inspector).getByRole('button', { name: 'Check exit value' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Projected exit value' })).toHaveFocus());
    fireEvent.change(screen.getByRole('textbox', { name: 'Scope / improvement budget' }), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Overview' }));
    expect(screen.getByRole('complementary', { name: 'Result inspector' })).toHaveTextContent('Economics unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'Add scope budget' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Scope / improvement budget' })).toHaveFocus());
  });

  it('opens a closed evidence disclosure and routes unsupported development inputs to diligence', async () => {
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    fireEvent.click(screen.getByRole('button', { name: 'View all nine paths' }));
    fireEvent.click(screen.getByRole('button', { name: 'Inspect Joint Venture' }));
    fireEvent.click(screen.getByRole('button', { name: 'Review financing evidence' }));
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Financing evidence' })).toHaveFocus());
    expect(screen.getByRole('combobox', { name: 'Financing evidence' }).closest('details')).toHaveAttribute('open');
    fireEvent.click(screen.getByRole('button', { name: 'Overview' }));
    fireEvent.click(screen.getByRole('button', { name: 'View all nine paths' }));
    fireEvent.click(screen.getByRole('button', { name: /Inspect ADU/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Open evidence checks' }));
    await waitFor(() => expect(screen.getByRole('region', { name: 'Next diligence checks' })).toHaveFocus());
  });

  it('makes identical scenarios explicit until a preset is applied and restores that state on reset', async () => {
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    const conservative = screen.getByRole('region', { name: 'Scenario comparison' });
    expect(conservative).toHaveTextContent('Same inputs as Base');
    fireEvent.click(screen.getByRole('button', { name: 'Use Conservative scenario' }));
    expect(conservative).toHaveTextContent('Same inputs as Base');
    expect(conservative).toHaveTextContent('$273,000');
    fireEvent.click(screen.getByRole('button', { name: 'Assumptions' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Acquisition or current basis' }), { target: { value: '600000.01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    expect(screen.getByRole('region', { name: 'Scenario comparison' })).toHaveTextContent('1 assumption changed');
    fireEvent.click(screen.getByRole('button', { name: 'Assumptions' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Acquisition or current basis' }), { target: { value: '600000.00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    expect(screen.getByRole('region', { name: 'Scenario comparison' })).toHaveTextContent('Same inputs as Base');
    fireEvent.click(screen.getByRole('button', { name: 'Apply Conservative preset' }));
    const changedScenario = screen.getByRole('region', { name: 'Scenario comparison' });
    expect(changedScenario).toHaveTextContent('4 assumptions changed');
    expect(changedScenario).toHaveTextContent('$283,500');
    expect(changedScenario).toHaveTextContent('$10,500 more cash than Base');
    expect(changedScenario).toHaveTextContent('lower / month than Base');
    expect(within(screen.getByRole('table', { name: 'Scenario results' })).getByRole('row', { name: /Cash required/ })).toHaveTextContent('$273,000');
    fireEvent.click(screen.getByRole('button', { name: 'Reset Conservative to base' }));
    expect(changedScenario).toHaveTextContent('Same inputs as Base');
    expect(changedScenario).toHaveTextContent('$273,000');
    expect(changedScenario).toHaveTextContent('Same as Base');
  });

  it('previews alternatives without changing the brief or Base, with preset Undo', async () => {
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Upside' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply Upside preset' }));
    expect(screen.getByRole('region', { name: 'Scenario comparison' })).toHaveTextContent('Brief uses Base');
    expect(screen.getByRole('table', { name: 'Scenario results' })).toHaveTextContent('$412');
    fireEvent.click(screen.getByRole('button', { name: 'Memo' }));
    expect(screen.getByRole('region', { name: 'Decision brief' })).toHaveTextContent('Base scenario');
    expect(screen.getByRole('region', { name: 'Decision brief' })).toHaveTextContent('$840,000');
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Upside' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use Upside scenario' }));
    fireEvent.click(screen.getByRole('button', { name: 'Memo' }));
    expect(screen.getByRole('region', { name: 'Decision brief' })).toHaveTextContent('Upside scenario');
    expect(screen.getByRole('region', { name: 'Decision brief' })).toHaveTextContent('$882,000');
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('region', { name: 'Decision brief' })).toHaveTextContent('Base scenario');
    expect(screen.getByRole('region', { name: 'Decision brief' })).toHaveTextContent('$840,000');
  });

  it('copies the concise brief with all appendix detail and restores disclosure after printing', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    fireEvent.click(screen.getByRole('button', { name: 'Memo' }));
    const memo = screen.getByRole('region', { name: 'Decision brief' });
    const appendix = within(memo).getByText('Appendix: assumptions, all paths and evidence').closest('details')!;
    expect(appendix.open).toBe(false);
    expect(within(memo).getByRole('heading', { name: 'Next step' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Copy summary' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    const text = writeText.mock.calls[0][0];
    expect(text.indexOf('Next step:')).toBeLessThan(text.indexOf('APPENDIX'));
    expect(text).toContain('This gap is not additional sale proceeds.');
    expect(text).toContain('9.');
    expect(text).toContain('Rental check (high)');
    expect(text).toContain('Illustrative example with synthetic inputs.');
    fireEvent(window, new Event('beforeprint'));
    expect(appendix.open).toBe(true);
    fireEvent(window, new Event('afterprint'));
    expect(appendix.open).toBe(false);
    fireEvent.click(within(memo).getByText('Appendix: assumptions, all paths and evidence'));
    appendix.open = true;
    fireEvent(window, new Event('beforeprint'));
    fireEvent(window, new Event('afterprint'));
    expect(appendix.open).toBe(true);
  });

  it('reports storage failures without discarding the active model', async () => {
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    fireEvent.click(screen.getByRole('button', { name: 'Save locally' }));
    expect(screen.getByRole('status', { name: 'Workspace status' })).toHaveTextContent('blocked local saving');
    expect(screen.getByRole('region', { name: 'Key economics' })).toHaveTextContent('$273,000');
  });

  it('keeps risk and copied-memo inputs tied to the active scenario after edits', async () => {
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply Conservative preset' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use Conservative scenario' }));
    fireEvent.click(screen.getByRole('button', { name: 'Risk' }));
    expect(screen.getByRole('region', { name: 'Evidence completeness' })).toHaveTextContent('Title: Unreported');
    fireEvent.click(screen.getByRole('button', { name: 'Memo' }));
    const memo = screen.getByRole('region', { name: 'Decision brief' });
    expect(memo).toHaveTextContent('Conservative');
    expect(memo).toHaveTextContent('$798,000');
    expect(memo).toHaveTextContent('$283,500');
    fireEvent.click(screen.getByRole('button', { name: 'Assumptions' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Scope / improvement budget' }), { target: { value: '125000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Memo' }));
    expect(screen.getByRole('region', { name: 'Decision brief' })).toHaveTextContent('$293,000');
    expect(screen.getByRole('region', { name: 'Decision brief' })).not.toHaveTextContent('$283,500');
  });

  it('restores the active scenario and carries its current inputs into intake', async () => {
    const first = desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply Conservative preset' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use Conservative scenario' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save locally' }));
    first.unmount();
    const restored = desk();
    expect(await screen.findByRole('region', { name: 'Key economics' })).toHaveTextContent('$283,500');
    fireEvent.click(screen.getByRole('button', { name: 'Memo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue with this property' }));
    expect(readStrategyLabHandoff()).toMatchObject({ scenario: 'conservative', askingPrice: 600000, rehabBudget: 115500, arvEstimate: 798000, marketRent: 4275, illustrative: true });
    expect(readStrategyLabHandoff()?.modelAssumptions).toContain('8.5% interest');
    expect(readStrategyLabHandoff()?.memoNextStep).toContain('Validate the exit value');
    expect(restored.location.history).toContain('/bring-an-opportunity?intent=property&ref=strategy-lab');
  });

  it('keeps sensitivity tied to its selected path and requires explicit application', async () => {
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    expect(screen.queryByRole('table', { name: /sensitivity$/i })).not.toBeInTheDocument();
    expect(screen.getByText(/No supported sensitivity grid is available for Listing referral/)).toBeVisible();
    fireEvent.change(screen.getByRole('combobox', { name: 'Sensitivity path' }), { target: { value: 'wholetail' } });
    const matrix = screen.getByRole('table', { name: 'Wholetail sensitivity' });
    fireEvent.click(within(matrix).getAllByRole('button')[0]);
    expect(screen.getByRole('region', { name: 'Key economics' })).toHaveTextContent('$273,000');
    fireEvent.click(screen.getByRole('button', { name: 'Apply to Base scenario' }));
    expect(screen.getByRole('region', { name: 'Key economics' })).not.toHaveTextContent('$273,000');
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('region', { name: 'Key economics' })).toHaveTextContent('$273,000');
  });

  it('retains an unsaved working scenario across a route remount', async () => {
    const first = desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    fireEvent.click(screen.getByRole('button', { name: 'Assumptions' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Scope / improvement budget' }), { target: { value: '125000' } });
    first.unmount();
    desk();
    expect(await screen.findByRole('region', { name: 'Key economics' })).toHaveTextContent('$293,000');
    expect(screen.getByRole('status', { name: 'Workspace status' })).toHaveTextContent('Unsaved changes');
    expect(window.localStorage.getItem('pegasus.strategy-lab.v4')).toBeNull();
  });

  it('allows recovery from an invalid scenario and explains every numeric override', async () => {
    desk();
    fireEvent.click(await screen.findByRole('button', { name: 'Load illustrative example' }));
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use Conservative scenario' }));
    fireEvent.click(screen.getByRole('button', { name: 'Assumptions' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Modeled loan-to-value' }), { target: { value: '60' } });
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    expect(within(screen.getByRole('table', { name: 'Scenario assumption differences' })).getByRole('row', { name: /Modeled loan-to-value/ })).toHaveTextContent('60');
    fireEvent.click(screen.getByRole('button', { name: 'Assumptions' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Modeled interest rate' }), { target: { value: '101' } });
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use Base scenario' }));
    expect(screen.getByRole('region', { name: 'Key economics' })).toHaveTextContent('$273,000');
  });
});
