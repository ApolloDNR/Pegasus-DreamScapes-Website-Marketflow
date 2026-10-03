import React, { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocation } from 'wouter';
import { PeggyReviewHandoffProvider, useBeginPeggyReview, usePreparedPeggyReview } from '@/pegasus/peggy-review-handoff';

function Draft() {
  const { handoff, pending } = usePreparedPeggyReview();
  return <p>{pending ? 'Loading draft' : handoff?.message ?? 'No available draft'}</p>;
}
function QueueHarness() {
  const prepare = useBeginPeggyReview();
  const [location] = useLocation();
  const [target, setTarget] = useState('');
  return <>
    <button onClick={() => setTarget(prepare({ message: 'First synthetic draft', transcript: [] }))}>Stage first</button>
    <button onClick={() => setTarget(prepare({ message: 'Second synthetic draft', transcript: [] }))}>Stage second</button>
    <output aria-label="Review destination">{target}</output>
    {location === '/contact' && <Draft />}
  </>;
}
function visit(path: string) { act(() => window.history.pushState(null, '', path)); }
function destination() { return screen.getByLabelText('Review destination').textContent!; }
function stage() {
  render(<PeggyReviewHandoffProvider><QueueHarness /></PeggyReviewHandoffProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Stage first' }));
  return destination();
}
beforeEach(() => window.history.replaceState(null, '', '/faq'));
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('ephemeral Peggy review transport', () => {
  it('expires an unconsumed transfer after ten minutes', () => {
    vi.useFakeTimers();
    const url = stage();
    act(() => vi.advanceTimersByTime(10 * 60 * 1000));
    visit(url);
    expect(screen.getByText('No available draft')).toBeInTheDocument();
  });

  it('keeps only the most recently prepared context', () => {
    const first = stage();
    fireEvent.click(screen.getByRole('button', { name: 'Stage second' }));
    const second = destination();
    expect(second).not.toBe(first);
    visit(second);
    expect(screen.getByText('Second synthetic draft')).toBeInTheDocument();
    visit('/faq'); visit(first);
    expect(screen.getByText('No available draft')).toBeInTheDocument();
  });

  it('discards an unconsumed transfer when its navigation is abandoned', () => {
    const url = stage();
    visit('/about'); visit(url);
    expect(screen.getByText('No available draft')).toBeInTheDocument();
  });

  it('never recovers private context from a mismatched marker', () => {
    const url = stage();
    visit('/contact?peggy-review=unrelated');
    expect(screen.getByText('No available draft')).toBeInTheDocument();
    visit('/faq'); visit(url);
    expect(screen.getByText('No available draft')).toBeInTheDocument();
  });
});
