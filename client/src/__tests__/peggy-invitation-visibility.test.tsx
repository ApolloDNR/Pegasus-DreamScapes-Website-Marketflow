import React, { useState } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExplainWithPeggy } from '@/pegasus/journey';
import { Peggy } from '@/pegasus/peggy';

const callbacks = { toStrategyLab: vi.fn(), onHandoffToReview: vi.fn(), go: vi.fn(), toSubmit: vi.fn() };
let inlineTop = 1100;
let sectionTop = 1000;
let inlineLeft = 40;
let cookieTop = 780;
const rect = (top: number, left = 0, width = 400, height = 44) => ({ top, bottom: top + height, left, right: left + width, width, height, x: left, y: top, toJSON: () => ({}) });
function Page({ invitation = true, cookie = false, path = '/about' }: { invitation?: boolean; cookie?: boolean; path?: string }) {
  const [open, setOpen] = useState(false);
  return <div className="pg-root"><nav className="site-nav"><button aria-label="Open menu">Menu</button></nav>
    <main data-peggy-page><h1>Introduction</h1><p>Public introduction.</p><h2 data-section>Property decisions</h2><p>Public explanation.</p>
      {invitation && <div data-invitation-wrap><ExplainWithPeggy /></div>}
      <h2 data-last>Next steps</h2></main>
    {cookie && <aside className="pg-cookie-bar">Consent choices</aside>}
    <Peggy {...callbacks} open={open} setOpen={setOpen} pagePath={path} />
  </div>;
}
const launcher = () => document.querySelector<HTMLButtonElement>('.peggy-fab')!;
const wayfinderAsk = () => document.querySelector<HTMLButtonElement>('.journey-wayfinder-ask');
const scroll = () => fireEvent.scroll(window);

beforeEach(() => {
  inlineTop = 1100; sectionTop = 1000; inlineLeft = 40; cookieTop = 780;
  vi.stubGlobal('innerWidth', 1440); vi.stubGlobal('innerHeight', 900);
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  vi.stubGlobal('fetch', vi.fn()); vi.stubGlobal('scrollTo', vi.fn());
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.matches('.site-nav')) return rect(0, 0, 1440, 88);
    if (this.matches('.journey-wayfinder-row')) return rect(88, 0, 1440, 50);
    if (this.matches('.pg-cookie-bar')) return rect(cookieTop, 0, 1440, 120);
    if (this.matches('.journey-explain')) return rect(inlineTop, inlineLeft);
    if (this.hasAttribute('data-section')) return rect(sectionTop);
    if (this.hasAttribute('data-last')) return rect(1800);
    if (this.matches('.peggy-fab')) return rect(820, 1160, 256, 56);
    return rect(150);
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); window.getSelection()?.removeAllRanges(); });

describe('one contextual Peggy invitation', () => {
  it('uses a visible inline invitation and restores the launcher when it leaves the viewport', async () => {
    inlineTop = 320;
    render(<Page />);
    expect(screen.getByRole('button', { name: 'Explore this with Peggy' })).toBeVisible();
    await waitFor(() => expect(launcher()).toHaveAttribute('hidden'));
    inlineTop = 1100; scroll();
    await waitFor(() => expect(launcher()).not.toHaveAttribute('hidden'));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('uses the sticky Ask instead of the launcher, yielding only to a usable inline invitation', async () => {
    sectionTop = 130;
    render(<Page />);
    await screen.findByRole('button', { name: 'Ask Peggy' });
    expect(launcher()).toHaveAttribute('hidden');
    inlineTop = 320; scroll();
    await waitFor(() => expect(wayfinderAsk()).toHaveAttribute('hidden'));
    expect(launcher()).toHaveAttribute('hidden');
    inlineTop = 1100; scroll();
    await waitFor(() => expect(wayfinderAsk()).not.toHaveAttribute('hidden'));
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['navigation', 'consent', 'horizontal', 'hidden ancestor', 'transparent ancestor'])('does not suppress access for an inline invitation obscured by %s', async (obstruction) => {
    inlineTop = 320;
    const { container } = render(<Page cookie />);
    await waitFor(() => expect(launcher()).toHaveAttribute('hidden'));
    if (obstruction === 'navigation') inlineTop = 60;
    if (obstruction === 'consent') inlineTop = cookieTop - 20;
    if (obstruction === 'horizontal') inlineLeft = 1300;
    if (obstruction === 'hidden ancestor') act(() => container.querySelector('[data-invitation-wrap]')!.setAttribute('hidden', ''));
    if (obstruction === 'transparent ancestor') act(() => container.querySelector<HTMLElement>('[data-invitation-wrap]')!.style.opacity = '0');
    scroll();
    await waitFor(() => expect(launcher()).not.toHaveAttribute('hidden'));
  });

  it('handles inline invitations added and removed without requiring a scroll', async () => {
    inlineTop = 320;
    const { rerender } = render(<Page invitation={false} />);
    expect(launcher()).not.toHaveAttribute('hidden');
    rerender(<Page />);
    await waitFor(() => expect(launcher()).toHaveAttribute('hidden'));
    rerender(<Page invitation={false} />);
    await waitFor(() => expect(launcher()).not.toHaveAttribute('hidden'));
  });

  it.each(['launcher', 'wayfinder'])('does not hide the focused %s when an inline invitation enters view', async (source) => {
    sectionTop = source === 'wayfinder' ? 130 : 1000;
    render(<Page />);
    const trigger = source === 'wayfinder' ? await screen.findByRole('button', { name: 'Ask Peggy' }) : launcher();
    act(() => trigger.focus());
    inlineTop = 320; scroll();
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).not.toHaveAttribute('hidden');
    act(() => screen.getByRole('button', { name: 'Explore this with Peggy' }).focus());
    await waitFor(() => expect(trigger).toHaveAttribute('hidden'));
  });

  it('keeps the wayfinder available if responsive styles hide the focused launcher', async () => {
    render(<Page />);
    act(() => launcher().focus());
    launcher().style.display = 'none';
    sectionTop = 130;
    fireEvent.resize(window);
    await waitFor(() => expect(wayfinderAsk()).not.toHaveAttribute('hidden'));
    expect(launcher()).toHaveAttribute('hidden');
  });

  it('returns focus to the available sticky Ask when the original launcher yields during chat', async () => {
    render(<Page />);
    act(() => launcher().focus());
    fireEvent.click(launcher());
    await screen.findByRole('dialog', { name: 'Peggy, the Pegasus intake concierge' });
    sectionTop = 130; scroll();
    await waitFor(() => expect(document.querySelector('.peggy-location > summary')).toHaveTextContent('Property decisions'));
    fireEvent.keyDown(document, { key: 'Escape' });
    const ask = await screen.findByRole('button', { name: 'Ask Peggy' });
    await waitFor(() => expect(ask).toHaveFocus());
    expect(fetch).not.toHaveBeenCalled();
  });

  it('keeps the mobile wayfinder available when no inline invitation is on screen', async () => {
    vi.stubGlobal('innerWidth', 390);
    sectionTop = 130;
    render(<Page />);
    const ask = await screen.findByRole('button', { name: 'Ask Peggy' });
    expect(ask).not.toHaveAttribute('hidden');
    fireEvent.click(ask);
    expect(screen.getByRole('textbox', { name: 'Talk to Peggy' })).toHaveValue('Explain “Property decisions” in plain language. What should I notice here?');
    expect(fetch).not.toHaveBeenCalled();
  });
});
