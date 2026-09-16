import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { DealPartnersPage } from '@/pegasus/deal-partners';
import SubmitPropertyPage from '@/pages/submit-property';

const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));
vi.mock('@/lib/queryClient', () => ({ apiRequest: apiRequestMock }));
vi.mock('@/lib/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('@/hooks/use-seo', () => ({ useSEO: vi.fn() }));

function mountPartners(path = '/deal-partners') {
  const memory = memoryLocation({ path, record: true });
  return render(<Router hook={memory.hook}><DealPartnersPage go={() => {}} /></Router>);
}
function mountIntake(path: string) {
  window.history.replaceState({}, '', path);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><SubmitPropertyPage /></QueryClientProvider>);
}
function completeIntake() {
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.click(screen.getByRole('button', { name: /Just exploring/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.click(screen.getByRole('button', { name: /^Not sure/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.change(screen.getByLabelText('Full name (required)'), { target: { value: 'Synthetic Partner QA' } });
  fireEvent.change(screen.getByLabelText('Email (required)'), { target: { value: 'partner-qa@example.com' } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Record Opportunity' }));
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  apiRequestMock.mockResolvedValue({ status: 201, redirected: false, json: async () => ({ id: 'synthetic-partner-qa', status: 'New' }) });
});
afterEach(() => {
  cleanup();
  apiRequestMock.mockReset();
  window.history.replaceState({}, '', '/');
});

describe('Partner to intake continuity', () => {
  it('lets a general partnership proposer choose a truthful role instead of preselecting capital', () => {
    mountPartners();
    const href = screen.getByRole('link', { name: 'Share a partnership proposal' }).getAttribute('href')!;
    cleanup();
    mountIntake(href);
    expect(screen.getByRole('button', { name: /A property I own/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /A capital relationship/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /Something else/ })).toHaveAttribute('aria-pressed', 'false');
    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it('carries the selected deal need visibly through to the recorded request', async () => {
    mountPartners();
    fireEvent.click(screen.getByRole('button', { name: 'Capital planning' }));
    const href = screen.getByRole('link', { name: 'Bring this opportunity' }).getAttribute('href')!;
    expect(new URL(href, 'https://example.test').searchParams.get('partner_need')).toBe('Capital planning');
    cleanup();
    mountIntake(href);
    expect(screen.getByText('From Deal Partners: Capital planning')).toBeInTheDocument();
    completeIntake();
    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    const [method, path, payload] = apiRequestMock.mock.calls[0];
    expect(method).toBe('POST');
    expect(path).toBe('/api/opportunities');
    expect(payload.visitorType).toBe('deal_finder');
    expect(payload.consentAccepted).toBe(true);
    expect(payload.notes).toContain('Partner need: Capital planning');
    expect(payload.notes).toContain('Referral reference: deal-partners');
    expect(payload).not.toHaveProperty('consentMarketing');
  }, 5_000);

  it('restores a recognized partner need from the source page URL', () => {
    mountPartners('/deal-partners?partner_need=Renovation%20execution');
    expect(screen.getByRole('button', { name: 'Renovation execution' })).toHaveAttribute('aria-pressed', 'true');
    const href = screen.getByRole('link', { name: 'Bring this opportunity' }).getAttribute('href')!;
    expect(new URL(href, 'https://example.test').searchParams.get('partner_need')).toBe('Renovation execution');
  });

  it('ignores an unrecognized partner need rather than inserting it into the request', async () => {
    mountIntake('/bring-an-opportunity?intent=deal-jv&partner_need=Unrecognized%20or%20injected%20need');
    expect(screen.queryByText(/From Deal Partners:/)).not.toBeInTheDocument();
    completeIntake();
    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    expect(apiRequestMock.mock.calls[0][2].notes).not.toContain('Partner need:');
    expect(apiRequestMock.mock.calls[0][2].notes).not.toContain('Unrecognized or injected need');
  }, 5_000);
});
