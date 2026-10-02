import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { PremiumStrategyLab } from '@/pegasus/strategy-lab-experience';
import { Peggy } from '@/pegasus/peggy';
import { readGuideSections, readPageSelection, readSectionContext } from '@/pegasus/peggy-page-guide';
import { emptyWorkspace, illustrativeDraft, serializeDraft, STORAGE_KEY } from '@/pegasus/intelligence-desk/state';

const ADDRESS = '921 Private Canary Road';
const CITY = 'Private Canary Cove';
const SITUATION = 'Distressed or time-sensitive';
const OBJECTIVE = 'Preserve control or optionality';
const PRIVATE_TEXT = /Private Canary|Distressed or time-sensitive|Preserve control or optionality|612,345|612345|Concern reported|Save locally|Edit property|Clear property/;
const INTRO = 'Start with the property facts you know. Compare assumptions, explore scenarios and review the decision brief before choosing what to share.';

function lab({ cityOnly = false, peggy = false, openPeggy = vi.fn() } = {}) {
  const workspace = emptyWorkspace();
  workspace.base = { ...illustrativeDraft(), address: cityOnly ? '' : ADDRESS, city: CITY, acquisition: '612345', situation: SITUATION, objective: OBJECTIVE, titleStatus: 'Concern reported', illustrative: false };
  window.localStorage.setItem(STORAGE_KEY, serializeDraft(workspace));
  const location = memoryLocation({ path: '/strategy-lab' });
  render(<Router hook={location.hook}><main data-peggy-page><PremiumStrategyLab go={() => {}} openPeggy={openPeggy} /></main>{peggy && <Peggy open setOpen={() => {}} toStrategyLab={() => {}} onHandoffToReview={() => {}} go={() => {}} toSubmit={() => {}} pagePath="/strategy-lab" />}</Router>);
  return document.querySelector<HTMLElement>('[data-peggy-page]')!;
}

function snapshot(root: HTMLElement) {
  const sections = readGuideSections(root);
  return { sections, contexts: sections.map((_, index) => readSectionContext(root, sections, index, '/strategy-lab')) };
}

function select(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  window.getSelection()!.removeAllRanges();
  window.getSelection()!.addRange(range);
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) { return { top: this.tagName === 'H1' ? 100 : 700, left: 0, bottom: 800, right: 600, width: 600, height: 100, x: 0, y: 100, toJSON: () => ({}) }; });
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup(); window.localStorage.clear(); window.sessionStorage.clear();
  window.getSelection()?.removeAllRanges(); vi.unstubAllGlobals(); vi.restoreAllMocks();
  window.history.replaceState({}, '', '/');
});

describe('Strategy Lab public guide privacy', () => {
  it.each(['Overview', 'Assumptions', 'Scenarios', 'Risk', 'Memo'])('keeps restored records and model output out of the %s guide', view => {
    const root = lab();
    fireEvent.click(screen.getByRole('button', { name: view }));
    const { sections, contexts } = snapshot(root);
    expect(JSON.stringify(contexts)).not.toMatch(PRIVATE_TEXT);
    expect(sections[0].summary).toBe(INTRO);
    expect(JSON.stringify(contexts)).not.toMatch(/\$|Visitor marked complete|Listing referral ranks first/);
    expect(contexts[0]?.excerpt).toContain('Compare property costs and outcomes.');
    expect(sections.some(section => section.title === 'The Lab organizes a decision. It does not replace diligence.')).toBe(true);
    if (view !== 'Overview') expect(sections.find(section => section.element.id === 'desk-view-heading')?.summary).toBeTruthy();
  });

  it('also excludes a restored city fallback and incoming owner situation', () => {
    window.history.replaceState({}, '', '/strategy-lab?owner_situation=Inherited%20property');
    const root = lab({ cityOnly: true });
    expect(root.querySelector('.id-property strong')).toHaveTextContent(CITY);
    expect(screen.getByRole('region', { name: 'Review owner context' })).toHaveTextContent('Inherited property');
    expect(JSON.stringify(snapshot(root).contexts)).not.toMatch(/Private Canary|Inherited property|Start with your situation/);
  });

  it('rejects selected property summaries and output while allowing public introduction text', () => {
    const root = lab();
    for (const selector of ['.id-property strong', '.id-property-context', '.id-read dd', '.id-context dd', '.id-economics dd']) {
      select(root.querySelector(selector)!);
      expect(readPageSelection(root), selector).toBe('');
    }
    fireEvent.click(screen.getByRole('button', { name: 'Memo' }));
    select(root.querySelector('.id-memo h2')!);
    expect(readPageSelection(root)).toBe('');
    select(root.querySelector('.id-opening p')!);
    expect(readPageSelection(root)).toBe('Compare property costs and outcomes.');
  });

  it('keeps calculator results outside passive snapshots and selections', async () => {
    const root = lab();
    fireEvent.click(screen.getByRole('button', { name: 'Open calculators' }));
    await screen.findByTestId('input-arv-purchase', {}, { timeout: 5000 });
    const panel = root.querySelector('.id-calculators')!;
    expect(JSON.stringify(snapshot(root).contexts)).not.toContain('Open the worksheet your decision requires.');
    select(panel);
    expect(readPageSelection(root)).toBe('');
  });

  it('sends only the public page context and still offers the reviewed Memo handoff', async () => {
    const fetcher = vi.fn((url: unknown, _init?: RequestInit) => Promise.resolve(new Response(JSON.stringify(url === '/api/peggy/conversations' ? { id: 1, accessToken: 'test-only' } : { response: 'Synthetic guide reply' }), { status: 200 })));
    vi.stubGlobal('fetch', fetcher);
    const openPeggy = vi.fn();
    lab({ peggy: true, openPeggy });
    await waitFor(() => expect(screen.getByTestId('peggy-local-summary')).toHaveTextContent(INTRO));
    expect(fetcher).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Explain this section' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText('Synthetic guide reply');
    const call = fetcher.mock.calls.find(([url]) => url === '/api/peggy/chat') as unknown as [string, RequestInit];
    const body = JSON.parse(String(call[1].body));
    expect(body.context.currentView.path).toBe('/strategy-lab');
    expect(JSON.stringify(body.context.currentView)).not.toMatch(PRIVATE_TEXT);
    expect(JSON.stringify(body.context.currentView)).not.toMatch(/\$/);
    fireEvent.click(screen.getByRole('button', { name: 'Memo' }));
    const before = fetcher.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Discuss with Peggy' }));
    expect(openPeggy).toHaveBeenCalledWith(undefined, expect.stringContaining(ADDRESS));
    expect(openPeggy.mock.calls[0][1]).toContain(SITUATION);
    expect(openPeggy.mock.calls[0][1]).toContain(OBJECTIVE);
    expect(openPeggy.mock.calls[0][1]).toContain('$612,345');
    expect(fetcher).toHaveBeenCalledTimes(before);
  });
});
