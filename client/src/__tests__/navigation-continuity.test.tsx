import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { NavigationContinuity } from '@/components/navigation-continuity';

function setup(path = '/') {
  const memory = memoryLocation({ path });
  const view = render(<Router hook={memory.hook}><NavigationContinuity /><nav>Navigation</nav><main><h1>Page heading</h1></main></Router>);
  return { memory, ...view };
}

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('Public navigation continuity', () => {
  it('starts a deliberate new page at its heading without leaving focus in the old navigation', async () => {
    const { memory } = setup();
    await waitFor(() => expect(screen.getByRole('heading')).toHaveFocus());
    vi.mocked(window.scrollTo).mockClear();
    act(() => memory.navigate('/tools'));
    await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' }));
    expect(screen.getByRole('heading')).toHaveFocus();
  });

  it('does not reset the page when only an inquiry or filter query changes', async () => {
    const { memory } = setup('/bring-an-opportunity?intent=property');
    await waitFor(() => expect(screen.getByRole('heading')).toHaveFocus());
    vi.mocked(window.scrollTo).mockClear();
    act(() => memory.navigate('/bring-an-opportunity?intent=adu'));
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('does not overwrite browser Back/Forward scroll restoration with a top reset', async () => {
    const { memory } = setup('/tools');
    await waitFor(() => expect(screen.getByRole('heading')).toHaveFocus());
    vi.mocked(window.scrollTo).mockClear();
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
      memory.navigate('/');
    });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('resolves a lazy-rendered deep link below the fixed header and focuses the named section', async () => {
    window.history.replaceState(null, '', '/faq#project-roles');
    setup('/faq');
    const header = screen.getByRole('navigation');
    vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({ height: 88 } as DOMRect);
    const section = document.createElement('section');
    section.id = 'project-roles';
    section.textContent = 'Project roles';
    vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({ top: 640 } as DOMRect);
    await act(async () => { document.querySelector('main')!.append(section); });
    await waitFor(() => expect(section).toHaveFocus());
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 536, behavior: 'instant' });
  });
});
