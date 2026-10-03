import React, { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';

const { apiRequestMock, handoff } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
  handoff: {
    role: 'Deal finder / Wholesaler',
    third: 'Synthetic Oakland area',
    message: 'Synthetic property situation prepared with Peggy',
    transcript: [
      { role: 'user' as const, content: 'Synthetic private conversation context' },
      { role: 'assistant' as const, content: 'Synthetic suggested next step' },
    ],
  },
}));

// Keep both real shell callbacks and the actual Contact form. Only unrelated
// page/chrome dependencies and the external request boundary are replaced.
vi.mock('@/PublicApp', async () => ({ default: (await import('@/pegasus/Landing')).Landing }));
vi.mock('@/LegacyApp', async () => {
  const { PegasusStandaloneShell } = await import('@/pegasus/standalone-shell');
  return { default: () => <PegasusStandaloneShell><h1>Synthetic standalone page</h1></PegasusStandaloneShell> };
});
vi.mock('@/pegasus/peggy', () => ({ Peggy: ({ onHandoffToReview }: { onHandoffToReview: (value: typeof handoff) => void }) => <button onClick={() => onHandoffToReview(handoff)}>Prepare synthetic review</button> }));
vi.mock('@/pegasus/nav', () => ({ NavBar: () => null }));
vi.mock('@/pegasus/footer', () => ({ Footer: () => null }));
vi.mock('@/pegasus/journey', () => ({ JourneyContinuation: () => null, GuideInvite: () => null }));
vi.mock('@/components/theme-provider', () => ({ useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }) }));
vi.mock('@/components/navigation-continuity', () => ({ NavigationContinuity: () => null }));
vi.mock('@/hooks/use-seo', () => ({ useSEO: vi.fn() }));
vi.mock('@/lib/analytics', () => ({ trackEvent: vi.fn(), trackCtaClick: vi.fn() }));
vi.mock('@/lib/queryClient', () => ({ apiRequest: apiRequestMock }));

function visit(path: string) {
  act(() => { window.history.pushState(null, '', path); });
}
function renderApp(strict = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } });
  const app = <QueryClientProvider client={client}><App /></QueryClientProvider>;
  return render(strict ? <StrictMode>{app}</StrictMode> : app);
}
async function prepareReview() {
  fireEvent.click(await screen.findByRole('button', { name: 'Prepare synthetic review' }));
  return screen.findByLabelText('The situation');
}

beforeEach(() => {
  window.history.replaceState(null, '', '/faq');
  sessionStorage.clear(); localStorage.clear();
  apiRequestMock.mockReset();
  apiRequestMock.mockResolvedValue({ ok: true });
  vi.stubGlobal('fetch', vi.fn());
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('Peggy review continuity across public shells', () => {
  it.each(['/faq', '/projects/nelson-drive', '/deal-blueprint', '/contact'])('carries the prepared review from %s into an editable, unsent form', async (path) => {
    window.history.replaceState(null, '', path);
    renderApp();
    expect(await prepareReview()).toHaveValue(handoff.message);
    expect(screen.getByLabelText('Property address or area')).toHaveValue(handoff.third);
    expect(screen.getByLabelText('I am a…')).toHaveValue(handoff.role);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(window.location.pathname).toBe('/contact');
    expect(new URLSearchParams(window.location.search).has('peggy-review')).toBe(true);
    expect(window.location.href).not.toContain('Synthetic');
    expect(JSON.stringify(window.history.state)).not.toContain('Synthetic');
    expect(localStorage.length).toBe(0); expect(sessionStorage.length).toBe(0);
    expect(apiRequestMock).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  });

  it('preserves the editable draft under StrictMode without sending it', async () => {
    renderApp(true);
    expect(await prepareReview()).toHaveValue(handoff.message);
    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it('submits edited context and the carried transcript only after explicit contact consent', async () => {
    renderApp();
    fireEvent.change(await prepareReview(), { target: { value: 'Visitor edited synthetic situation' } });
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Synthetic Visitor' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'synthetic@example.invalid' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Send property context' }).closest('form')!);
    expect(apiRequestMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.submit(screen.getByRole('button', { name: 'Send property context' }).closest('form')!);
    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    expect(apiRequestMock.mock.calls[0][2]).toMatchObject({ consentContact: true, source: 'peggy', leadData: { message: 'Visitor edited synthetic situation', transcript: handoff.transcript } });
  });

  it('does not revive the draft through plain Contact or a consumed history marker', async () => {
    renderApp();
    await prepareReview();
    const markerUrl = window.location.pathname + window.location.search;
    visit('/contact');
    expect(screen.queryByLabelText('The situation')).not.toBeInTheDocument();
    expect(screen.queryByText(/prepared Peggy context is no longer available/i)).not.toBeInTheDocument();
    visit(markerUrl);
    expect(await screen.findByText(/prepared Peggy context is no longer available/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('The situation')).not.toBeInTheDocument();
    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it('clears a consumed draft after leaving for another shell', async () => {
    renderApp(); await prepareReview();
    const markerUrl = window.location.pathname + window.location.search;
    visit('/faq');
    await screen.findByRole('heading', { name: 'Synthetic standalone page' });
    visit(markerUrl);
    expect(await screen.findByText(/prepared Peggy context is no longer available/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('The situation')).not.toBeInTheDocument();
  });

  it('explains unavailable ephemeral context on a fresh load without implying submission', async () => {
    window.history.replaceState(null, '', '/contact?peggy-review=old-marker');
    renderApp();
    expect(await screen.findByText(/prepared Peggy context is no longer available/i)).toHaveTextContent(/opening this page does not send anything/i);
    expect(screen.queryByLabelText('The situation')).not.toBeInTheDocument();
    expect(apiRequestMock).not.toHaveBeenCalled();
  });
});
