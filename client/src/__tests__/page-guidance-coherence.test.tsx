import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePeggyPageGuide } from '@/pegasus/peggy-page-guide';
import { PeggyTour } from '@/pegasus/peggy-guide-ui';
import { JourneyWayfinder } from '@/pegasus/journey';

const rect = (top: number, height = 40) => ({ top, bottom: top + height, left: 0, right: 333, width: 333, height, x: 0, y: top, toJSON: () => ({}) });
function GuideReadout() {
  const guide = usePeggyPageGuide('/faq', true);
  return <output aria-label="Current section">{guide.index + 1} of {guide.sections.length}: {guide.sections[guide.index]?.title}</output>;
}
beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query === '(max-width: 1439px)' || query.includes('prefers-reduced-motion'), addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  vi.stubGlobal('scrollTo', vi.fn());
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
    if (this.classList.contains('site-nav')) return rect(0, 88);
    if (this.classList.contains('journey-wayfinder-row')) return rect(88, 50);
    if (this.classList.contains('peggy-tour')) return rect(88, 108);
    return rect(Number(this.dataset.top ?? 700));
  });
});
afterEach(() => { cleanup(); document.body.innerHTML = ''; vi.restoreAllMocks(); vi.unstubAllGlobals(); document.documentElement.style.cssText = ''; });

describe('optional guidance without covering the current section', () => {
  it('uses compact guidance on an ordinary desktop below the reserved-rail breakpoint', () => {
    const sections = [0, 1].map(index => ({ element: document.createElement('h2'), label: `Section ${index}`, title: `Section ${index}` }));
    render(<PeggyTour section={sections[0]} index={0} sections={sections} context={null} onMove={vi.fn()} onEnd={vi.fn()} onAsk={vi.fn()} />);
    const tour = screen.getByRole('complementary', { name: 'Peggy page guide' });
    expect(tour).toHaveAttribute('data-compact', 'true');
    expect(within(tour).getByRole('button', { name: 'Section details and stops' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapses requested details when advancing so the destination remains readable', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const sections = [0, 1].map(index => ({ element: document.createElement('h2'), label: `Section ${index}`, title: `Section ${index}` }));
    const onMove = vi.fn();
    render(<PeggyTour section={sections[0]} index={0} sections={sections} context={null} onMove={onMove} onEnd={vi.fn()} onAsk={vi.fn()} />);
    const toggle = screen.getByRole('button', { name: 'Section details and stops' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Next section' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(onMove).toHaveBeenCalledWith(1);
  });

  it('scrolls a selected heading below the actual sticky navigation and wayfinder', async () => {
    const elements = [0, 1, 2].map(index => Object.assign(document.createElement(index ? 'h2' : 'h1'), { textContent: `Section ${index}` }));
    elements[2].dataset.top = '500';
    const nav = document.createElement('nav'); nav.className = 'site-nav';
    document.body.append(nav, ...elements);
    const sections = elements.map(element => ({ element, label: element.textContent!, title: element.textContent! }));
    render(<JourneyWayfinder path="/about" sections={sections} index={1} hidden={false} onAsk={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Show page sections/ }));
    fireEvent.click(screen.getByRole('button', { name: /03\s*Section 2/ }));
    await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith({ top: 340, behavior: 'auto' }));
    expect(elements[2]).toHaveFocus();
    nav.remove(); elements.forEach(element => element.remove());
  });
});

describe('the current visible page section', () => {
  it('recognizes a deep-linked section before its inset heading crosses the reading line', () => {
    render(<><nav className="site-nav" /><main data-peggy-page><h1 data-top="-1200">Introduction</h1><section data-top="-600"><h2 data-top="-530">Process</h2></section><section id="vendor-form" data-top="120"><h2 data-top="230">Apply to be considered.</h2><form><input defaultValue="Private field" /></form></section></main><GuideReadout /></>);
    expect(screen.getByLabelText('Current section')).toHaveTextContent('3 of 3: Apply to be considered.');
  });

  it('refreshes sections when filtering changes their visibility through styles', async () => {
    render(<><main data-peggy-page><h1 data-top="-900">Questions</h1><h2 data-top="-600">Working with Pegasus</h2><h2 data-top="-200" data-filtered>Buyboxes</h2></main><GuideReadout /></>);
    expect(screen.getByLabelText('Current section')).toHaveTextContent('3 of 3: Buyboxes');
    act(() => { document.querySelector<HTMLElement>('[data-filtered]')!.style.display = 'none'; });
    await waitFor(() => expect(screen.getByLabelText('Current section')).toHaveTextContent('2 of 2: Working with Pegasus'));
  });

  it('follows a replacement reading surface rather than holding detached headings', async () => {
    const Page = ({ replacement = false }: { replacement?: boolean }) => <><main key={String(replacement)} data-peggy-page><h1 data-top="-600">Questions</h1><h2 data-top="100">{replacement ? 'Working with Pegasus' : 'Buyboxes'}</h2></main><GuideReadout /></>;
    const { rerender } = render(<Page />);
    expect(screen.getByLabelText('Current section')).toHaveTextContent('Buyboxes');
    rerender(<Page replacement />);
    await waitFor(() => expect(screen.getByLabelText('Current section')).toHaveTextContent('Working with Pegasus'));
  });
});
