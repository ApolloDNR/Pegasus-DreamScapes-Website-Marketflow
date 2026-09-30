import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Peggy } from '@/pegasus/peggy';
import { readGuideSections, readPageSelection, readSectionContext } from '@/pegasus/peggy-page-guide';
import { sanitizePeggyPageContext } from '@shared/peggy-page-context';

const callbacks = { setOpen: vi.fn(), toStrategyLab: vi.fn(), onHandoffToReview: vi.fn(), go: vi.fn(), toSubmit: vi.fn() };
const json = (value: unknown) => new Response(JSON.stringify(value), { status: 200 });
let secondTop = 700;
function Page({ path = '/', second = 'Actual second section' }: { path?: string; second?: string }) {
  return <><main data-peggy-page><h1>Welcome to Pegasus</h1><p>Published introduction.</p><form><label>Private visitor<input defaultValue="SECRET FIELD" /></label><p>PRIVATE FORM SUMMARY</p></form><div data-peggy-private>SECRET RECORD</div><div hidden>HIDDEN TEXT</div><details><summary>More information</summary><p>COLLAPSED CONTENT</p></details><h2 data-second>{second}</h2><p>A real public explanation.</p></main><Peggy open {...callbacks} pagePath={path} /></>;
}
function setupFetch() {
  const fetcher = vi.fn((url: unknown, _init?: RequestInit) => Promise.resolve(json(url === '/api/peggy/conversations' ? { id: 1, accessToken: 'test-only' } : { response: 'Synthetic reply' })));
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
}
const send = (question: string) => {
  fireEvent.change(screen.getByRole('textbox', { name: 'Talk to Peggy' }), { target: { value: question } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
};
beforeEach(() => {
  secondTop = 700;
  vi.clearAllMocks();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) { return { top: this.hasAttribute('data-second') ? secondTop : 100, left: 0, bottom: 200, right: 600, width: 600, height: 100, x: 0, y: 100, toJSON: () => ({}) }; });
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); window.getSelection()?.removeAllRanges(); });

describe('Peggy as a companion to the current page', () => {
  it('reads public section text without form values, private, hidden or collapsed content', () => {
    render(<Page />);
    const root = document.querySelector<HTMLElement>('[data-peggy-page]')!;
    const sections = readGuideSections(root);
    expect(sections.map(item => item.title)).toEqual(['Welcome to Pegasus', 'Actual second section']);
    const context = readSectionContext(root, sections, 0, '/?private=secret#token');
    expect(context?.path).toBe('/');
    expect(context?.excerpt).toContain('Published introduction.');
    expect(JSON.stringify(context)).not.toMatch(/SECRET|PRIVATE FORM|HIDDEN|COLLAPSED|private=|token/);
  });

  it('updates the current section on scrolling, creates no conversation until Send, and takes a fresh snapshot', async () => {
    const fetcher = setupFetch();
    render(<Page />);
    expect(screen.getByRole('button', { name: 'Explain this section' })).toBeVisible();
    secondTop = 130;
    fireEvent.scroll(window);
    await waitFor(() => expect(screen.getByTestId('peggy-local-summary')).toHaveTextContent('A real public explanation.'));
    expect(fetcher).not.toHaveBeenCalled();
    send('Explain what I am looking at.');
    await screen.findByText('Synthetic reply');
    const body = JSON.parse(String(fetcher.mock.calls.find(([url]) => url === '/api/peggy/chat')?.[1]?.body));
    expect(body.context.currentView).toEqual({ path: '/', page: 'Home', section: 'Actual second section', excerpt: 'A real public explanation.' });
    expect(document.querySelector('.peggy-message-source')).toHaveTextContent('Actual second section');
  });

  it('shows the authored section guide immediately without representing it as an AI response', async () => {
    const fetcher = setupFetch();
    render(<Page />);
    expect(screen.getByTestId('peggy-local-summary')).toHaveTextContent('Published introduction.');
    expect(screen.getByRole('log', { name: 'Conversation with Peggy' })).toBeEmptyDOMElement();
    act(() => {
      document.querySelector('[data-second]')!.setAttribute('data-peggy-summary', 'Compare the choices here before deciding where to begin.');
      secondTop = 130;
    });
    fireEvent.resize(window);
    await waitFor(() => expect(screen.getByTestId('peggy-local-summary')).toHaveTextContent('Compare the choices here before deciding where to begin.'));
    expect(screen.getByText('A guide to this section')).toBeVisible();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('keeps an explained section pinned while the visitor scrolls and sends only after review', async () => {
    const fetcher = setupFetch();
    render(<Page />);
    fireEvent.click(screen.getByRole('button', { name: 'Explain this section' }));
    expect(screen.getByRole('textbox', { name: 'Talk to Peggy' })).toHaveValue('Explain “Welcome to Pegasus” in plain language. What should I notice here?');
    expect(fetcher).not.toHaveBeenCalled();
    secondTop = 130; fireEvent.scroll(window);
    await waitFor(() => expect(screen.getByTestId('peggy-local-summary')).toHaveTextContent('A real public explanation.'));
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText('Synthetic reply');
    const body = JSON.parse(String(fetcher.mock.calls.find(([url]) => url === '/api/peggy/chat')?.[1]?.body));
    expect(body.context.currentView.section).toBe('Welcome to Pegasus');
  });

  it('supports turning context off and removing an attached snapshot', async () => {
    const fetcher = setupFetch();
    render(<Page />);
    fireEvent.click(screen.getByRole('button', { name: 'Explain this section' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove attached page context' }));
    expect(document.querySelector('.peggy-attached-context')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Page context included' }));
    send('Just this question');
    await screen.findByText('Synthetic reply');
    const body = JSON.parse(String(fetcher.mock.calls.find(([url]) => url === '/api/peggy/chat')?.[1]?.body));
    expect(body.context).toEqual({ surface: 'public-peggy' });
  });

  it('clears a previous route attachment while retaining the editable question', async () => {
    setupFetch();
    const { rerender } = render(<Page />);
    fireEvent.click(screen.getByRole('button', { name: 'Explain this section' }));
    rerender(<Page path="/about?secret=never-share" />);
    await waitFor(() => expect(document.querySelector('.peggy-location strong')).toHaveTextContent('About'));
    expect(document.querySelector('.peggy-attached-context')).not.toBeInTheDocument();
    expect((screen.getByRole('textbox', { name: 'Talk to Peggy' }) as HTMLTextAreaElement).value).toContain('Welcome to Pegasus');
  });

  it('takes a real local page tour, offers a reviewed question and never sends automatically', async () => {
    const fetcher = setupFetch();
    render(<Page />);
    fireEvent.click(screen.getByRole('button', { name: /Show me around/ }));
    const tour = screen.getByRole('complementary', { name: 'Peggy page guide' });
    expect(within(tour).getByRole('button', { name: 'Previous section' })).toBeDisabled();
    fireEvent.click(within(tour).getByRole('button', { name: 'Next section' }));
    expect(within(tour).getByRole('heading')).toHaveTextContent('Actual second section');
    expect(document.querySelector('[data-second]')).toHaveClass('peggy-tour-target');
    fireEvent.click(within(tour).getByRole('button', { name: 'Ask about this' }));
    expect(screen.queryByRole('complementary', { name: 'Peggy page guide' })).not.toBeInTheDocument();
    expect((screen.getByRole('textbox', { name: 'Talk to Peggy' }) as HTMLTextAreaElement).value).toContain('Actual second section');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('captures deliberate public selections and rejects selections crossing a form', () => {
    render(<Page />);
    const root = document.querySelector<HTMLElement>('[data-peggy-page]')!;
    const range = document.createRange();
    range.selectNodeContents(root.querySelector('p')!);
    window.getSelection()!.addRange(range);
    expect(readPageSelection(root)).toBe('Published introduction.');
    range.setEndAfter(root.querySelector('form')!);
    expect(readPageSelection(root)).toBe('');
  });

  it('does not collect saved records or private paths and bounds untrusted API snapshots', () => {
    render(<Page path="/saved" />);
    expect(screen.queryByRole('button', { name: 'Explain this section' })).not.toBeInTheDocument();
    expect(sanitizePeggyPageContext({ path: '/admin/peggy', page: 'Private', section: 'Records', excerpt: 'secret' })).toBeNull();
    expect(sanitizePeggyPageContext({ path: '/marketplace/buyer', page: 'Private', section: 'Records', excerpt: 'secret' })).toBeNull();
    expect(sanitizePeggyPageContext({ path: '/', page: 'Home', section: 'Intro', excerpt: 'x'.repeat(9999), selection: 'y'.repeat(9999), inputValues: { secret: 'never' } })).toEqual({ path: '/', page: 'Home', section: 'Intro', excerpt: 'x'.repeat(1600), selection: 'y'.repeat(800) });
  });

  it('refreshes section text when the public tool view changes', async () => {
    render(<Page />);
    secondTop = 130; fireEvent.scroll(window);
    await waitFor(() => expect(screen.getByTestId('peggy-local-summary')).toHaveTextContent('A real public explanation.'));
    act(() => { document.querySelector('[data-second]')!.textContent = 'Changed model view'; });
    await waitFor(() => expect(document.querySelector('.peggy-location > summary')).toHaveTextContent('Changed model view'));
  });

  it('restores page awareness after the mobile menu releases its inert background', async () => {
    render(<Page />);
    const root = document.querySelector('[data-peggy-page]')!;
    act(() => root.setAttribute('inert', ''));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Explain this section' })).not.toBeInTheDocument());
    act(() => root.removeAttribute('inert'));
    await screen.findByRole('button', { name: 'Explain this section' });
  });
});
