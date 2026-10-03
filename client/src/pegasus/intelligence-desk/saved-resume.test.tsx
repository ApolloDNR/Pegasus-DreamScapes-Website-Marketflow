import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Route, Router, Switch } from 'wouter';
import { SavedPage } from '../Saved';
import { NavigationContinuity } from '@/components/navigation-continuity';
import { PremiumStrategyLab } from '../strategy-lab-experience';
import { emptyWorkspace, illustrativeDraft, restoreDraft, serializeDraft, STORAGE_KEY, type Workspace } from './state';

const SESSION_KEY = 'pegasus.strategy-lab.working.v4';
const saved: Workspace = {
  ...emptyWorkspace(),
  base: { ...illustrativeDraft(), address: 'Saved synthetic property A', city: 'Test City A', entered: ['address', 'city', 'scope'] },
  variants: { conservative: { scope: '125000', arv: '800000' }, upside: { marketRent: '4900' } },
  activeScenario: 'conservative',
  diligence: ['title', 'scope'],
  phases: emptyWorkspace().phases.map(phase => ({ ...phase, months: phase.id === 'build' ? '7' : '' })),
};
const working: Workspace = {
  ...saved,
  base: { ...saved.base, address: 'Working synthetic property B', city: 'Test City B', scope: '150000' },
  variants: { conservative: { scope: '155000' }, upside: { marketRent: '5500' } },
  activeScenario: 'upside',
  diligence: ['permits'],
};

function seed() {
  const raw = serializeDraft(saved, new Date('2026-10-01T12:00:00Z'));
  window.localStorage.setItem(STORAGE_KEY, raw);
  window.sessionStorage.setItem(SESSION_KEY, serializeDraft(working));
  return raw;
}
function desk(query = '?resume=saved') {
  window.history.replaceState({}, '', `/strategy-lab${query}`);
  return render(<Router><PremiumStrategyLab go={() => {}} openPeggy={() => {}} /></Router>);
}
function sessionWorkspace() {
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  return raw ? restoreDraft(raw) : null;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('saved Strategy Lab return', () => {
  it('offers clear tool and saved-work navigation on the empty desk', () => {
    desk('');
    const nav = screen.getByRole('navigation', { name: 'Strategy Lab tools' });
    expect(within(nav).getByRole('link', { name: 'All tools' })).toHaveAttribute('href', '/tools');
    expect(within(nav).getByRole('link', { name: 'Saved work' })).toHaveAttribute('href', '/saved');
  });

  it('keeps working B by default and asks before restoring saved A', async () => {
    const rawSaved = seed();
    desk();
    const review = screen.getByRole('region', { name: 'Review saved draft' });
    expect(review).toHaveTextContent('Saved synthetic property A');
    expect(review).toHaveTextContent('Working synthetic property B');
    expect(review).toHaveAttribute('data-peggy-private');
    expect(sessionWorkspace()).toEqual(working);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(rawSaved);
    await waitFor(() => expect(within(review).getByRole('button', { name: 'Cancel' })).toHaveFocus());
  });

  it('retains focus on the safe Cancel choice after central page arrival settles', async () => {
    seed();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    window.history.replaceState({}, '', '/strategy-lab?resume=saved');
    render(<Router><NavigationContinuity /><main data-navigation-path="/strategy-lab">
      <PremiumStrategyLab go={() => {}} openPeggy={() => {}} />
    </main></Router>);
    // Let the Lab's focus frame and the central arrival's deferred layout/focus
    // frames finish, rather than passing on the brief intermediate Cancel focus.
    await act(async () => {
      for (let frame = 0; frame < 4; frame += 1) {
        await new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()));
      }
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    expect(sessionWorkspace()).toEqual(working);
  });

  it('carries the actual Saved-page action through routing to the conflict review', () => {
    seed();
    window.history.replaceState({}, '', '/saved');
    render(<Router><Switch>
      <Route path="/saved"><SavedPage go={() => {}} /></Route>
      <Route path="/strategy-lab"><PremiumStrategyLab go={() => {}} openPeggy={() => {}} /></Route>
    </Switch></Router>);
    expect(screen.getByRole('heading', { name: saved.base.address })).toBeVisible();
    fireEvent.click(screen.getByRole('link', { name: 'Resume in Strategy Lab' }));
    expect(window.location.pathname).toBe('/strategy-lab');
    expect(screen.getByRole('region', { name: 'Review saved draft' })).toHaveTextContent(saved.base.address);
    expect(sessionWorkspace()).toEqual(working);
    fireEvent.click(screen.getByRole('button', { name: 'Resume saved draft' }));
    expect(sessionWorkspace()).toEqual(saved);
  });

  it('cancels without changing B and does not reopen the prompt on refresh', () => {
    const rawSaved = seed();
    const first = desk();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('region', { name: 'Review saved draft' })).not.toBeInTheDocument();
    expect(sessionWorkspace()).toEqual(working);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(rawSaved);
    expect(window.location.search).not.toContain('resume=');
    first.unmount();
    desk(window.location.search);
    expect(sessionWorkspace()).toEqual(working);
    expect(screen.queryByRole('region', { name: 'Review saved draft' })).not.toBeInTheDocument();
  });

  it('restores every saved field only on confirmation, preserves the saved record and supports Undo', () => {
    const rawSaved = seed();
    desk();
    fireEvent.click(screen.getByRole('button', { name: 'Resume saved draft' }));
    expect(sessionWorkspace()).toEqual(saved);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(rawSaved);
    expect(screen.getByRole('status', { name: 'Workspace status' })).toHaveTextContent('No unsaved changes');
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(sessionWorkspace()).toEqual(working);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(rawSaved);
    fireEvent.click(screen.getByRole('button', { name: 'Save locally' }));
    expect(restoreDraft(window.localStorage.getItem(STORAGE_KEY)!)).toEqual(working);
  });

  it('dismisses the saved-draft confirmation with Escape while retaining B', () => {
    seed();
    desk();
    fireEvent.keyDown(screen.getByRole('region', { name: 'Review saved draft' }), { key: 'Escape' });
    expect(screen.queryByRole('region', { name: 'Review saved draft' })).not.toBeInTheDocument();
    expect(sessionWorkspace()).toEqual(working);
  });

  it.each(['', '?resume=working', '?resume=Saved', '?resume=saved&resume=working'])('preserves ordinary recovery for an unapproved intent %s', query => {
    seed();
    desk(query);
    expect(sessionWorkspace()).toEqual(working);
    expect(screen.queryByRole('region', { name: 'Review saved draft' })).not.toBeInTheDocument();
  });

  it('restores the saved record without a conflict when no working draft exists', () => {
    window.localStorage.setItem(STORAGE_KEY, serializeDraft(saved));
    desk();
    expect(sessionWorkspace()).toEqual(saved);
    expect(screen.queryByRole('region', { name: 'Review saved draft' })).not.toBeInTheDocument();
    expect(window.location.search).not.toContain('resume=');
  });

  it('keeps the confirmed saved workspace through a route remount', () => {
    const rawSaved = seed();
    const first = desk('?resume=saved&view=assumptions');
    fireEvent.click(screen.getByRole('button', { name: 'Resume saved draft' }));
    expect(window.location.search).toBe('?view=assumptions');
    first.unmount();
    desk(window.location.search);
    expect(screen.getByRole('textbox', { name: 'Property address or city' })).toHaveValue(saved.base.address);
    expect(sessionWorkspace()).toEqual(saved);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(rawSaved);
    expect(screen.queryByRole('region', { name: 'Review saved draft' })).not.toBeInTheDocument();
  });

  it('does not ask to replace a working draft identical to the saved version', () => {
    window.localStorage.setItem(STORAGE_KEY, serializeDraft(saved));
    window.sessionStorage.setItem(SESSION_KEY, serializeDraft(saved));
    desk();
    expect(sessionWorkspace()).toEqual(saved);
    expect(screen.queryByRole('region', { name: 'Review saved draft' })).not.toBeInTheDocument();
  });

  it.each([2, 3])('resumes a validated older schema %s with the same conflict protection', schemaVersion => {
    const raw = JSON.stringify({ schemaVersion, savedAt: '2026-10-01T12:00:00Z', state: { address: 'Older synthetic saved property', acquisition: '300000' } });
    window.localStorage.setItem(`pegasus.strategy-lab.v${schemaVersion}`, raw);
    window.sessionStorage.setItem(SESSION_KEY, serializeDraft(working));
    desk();
    fireEvent.click(screen.getByRole('button', { name: 'Resume saved draft' }));
    expect(sessionWorkspace()).toEqual(restoreDraft(raw));
    expect(window.localStorage.getItem(`pegasus.strategy-lab.v${schemaVersion}`)).toBe(raw);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it.each([null, '{broken', JSON.stringify({ schemaVersion: 99, workspace: saved })])('keeps B and explains unavailable saved data', raw => {
    if (raw) window.localStorage.setItem(STORAGE_KEY, raw);
    window.sessionStorage.setItem(SESSION_KEY, serializeDraft(working));
    desk();
    expect(sessionWorkspace()).toEqual(working);
    expect(screen.queryByRole('region', { name: 'Review saved draft' })).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Workspace status' })).toHaveTextContent('No readable saved draft was found');
  });

  it('preserves B and explains blocked saved storage without discarding current work', () => {
    seed();
    const getItem = Storage.prototype.getItem;
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (this: Storage, key) {
      if (this === window.localStorage) throw new Error('blocked');
      return getItem.call(this, key);
    });
    desk();
    expect(sessionWorkspace()).toEqual(working);
    expect(screen.queryByRole('region', { name: 'Review saved draft' })).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Workspace status' })).toHaveTextContent('blocked local storage');
  });

  it('can open a saved draft when session recovery is blocked', () => {
    const rawSaved = seed();
    const getItem = Storage.prototype.getItem;
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (this: Storage, key) {
      if (this === window.sessionStorage) throw new Error('blocked');
      return getItem.call(this, key);
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (this === window.sessionStorage) throw new Error('blocked');
      return setItem.call(this, key, value);
    });
    desk('?resume=saved&view=assumptions');
    expect(screen.getByRole('textbox', { name: 'Property address or city' })).toHaveValue(saved.base.address);
    expect(screen.getByRole('status', { name: 'Workspace status' })).toHaveTextContent('blocked current-visit recovery');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(rawSaved);
  });
});
