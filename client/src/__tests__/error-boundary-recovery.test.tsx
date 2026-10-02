import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router, useLocation } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { ErrorBoundary } from '@/components/error-boundary';

beforeEach(() => {
  // These cases deliberately exercise React's caught render-error path.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Error boundary recovery', () => {
  it('shows the home page when returning from a failed public route', () => {
    const memory = memoryLocation({ path: '/tools', record: true });
    function Page() {
      const [location] = useLocation();
      if (location === '/tools') throw new Error('The tools view failed to render');
      return <h1>Pegasus home</h1>;
    }
    render(<Router hook={memory.hook}><ErrorBoundary><Page /></ErrorBoundary></Router>);

    expect(screen.getByRole('heading', { name: "Something didn't load." })).toBeVisible();
    fireEvent.click(screen.getByRole('link', { name: 'Back to home' }));

    expect(memory.history).toEqual(['/tools', '/']);
    expect(screen.getByRole('heading', { name: 'Pegasus home' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: "Something didn't load." })).not.toBeInTheDocument();
  });

  it('can retry the current view after a transient render error clears', () => {
    let unavailable = true;
    function Page() {
      if (unavailable) throw new Error('A transient render error');
      return <h1>Recovered tools</h1>;
    }
    render(<ErrorBoundary><Page /></ErrorBoundary>);

    unavailable = false;
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByRole('heading', { name: 'Recovered tools' })).toBeVisible();
  });
});
