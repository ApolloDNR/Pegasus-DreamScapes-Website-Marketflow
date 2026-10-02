import React from 'react';
import { webcrypto } from 'node:crypto';
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Contact from '@/pages/contact';
import Invest from '@/pages/invest';
import Sell from '@/pages/sell';
import SubmitPage from '@/pages/submit';
import MarketflowAccessPage from '@/pages/marketflow-access';
import VendorNetwork from '@/pages/vendor-network';
import SubmitPropertyPage from '@/pages/submit-property';
import { Footer } from '@/components/footer';
import { PeggyPublicNote } from '@/components/peggy-public-note';
import { CONTACT_FORM, LeadForm } from '@/pegasus/forms';

const { apiRequestMock, mutations } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
  mutations: [] as Array<(payload: any) => Promise<unknown>>,
}));
// Capture each mounted caller's actual mutation function. Form validation and
// UI states are covered by the existing mounted-form suites; this matrix proves
// every network caller routes its real payload through the retry boundary.
vi.mock('@tanstack/react-query', async () => ({
  ...await vi.importActual('@tanstack/react-query'),
  useMutation: (options: { mutationFn: (payload: any) => Promise<unknown> }) => {
    mutations.push(options.mutationFn);
    return { mutate: vi.fn(), reset: vi.fn(), isPending: false, isSuccess: false, isError: false };
  },
}));
vi.mock('@/lib/queryClient', () => ({ apiRequest: apiRequestMock }));
vi.mock('@/lib/analytics', () => ({ trackEvent: vi.fn(), trackCtaClick: vi.fn() }));
vi.mock('@/hooks/use-seo', () => ({ useSEO: vi.fn() }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/hooks/use-upload', () => ({ useUpload: () => ({ getUploadParameters: vi.fn() }) }));
vi.mock('@/components/ObjectUploader', () => ({ ObjectUploader: () => null }));
vi.mock('@/components/address-autocomplete', () => ({ AddressAutocomplete: () => null }));
vi.mock('@/components/theme-toggle', () => ({ ThemeToggle: () => null }));
vi.mock('@/contexts/supabase-auth-context', () => ({
  useSupabaseAuth: () => ({ isAuthenticated: false, isGuestMode: false, isAdmin: false, profile: null, userRole: null }),
  getRoleDashboardPath: () => '/marketflow',
}));
vi.mock('@/components/animations', () => ({
  ScrollReveal: ({ children }: React.PropsWithChildren) => <>{children}</>,
  StaggerChildren: ({ children }: React.PropsWithChildren) => <>{children}</>,
  StaggerItem: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

const values = {
  name: 'Ada Lovelace', firstName: 'Ada', email: 'ada@example.test', phone: '9255550100', cityState: 'Oakland, CA',
  leadType: 'submit', source: 'form', consentContact: true, consent: true, intent: 'sell', role: 'operator',
  introducedBy: 'Synthetic introducer', propertyAddress: '123 Example St', subject: 'Synthetic question',
  message: 'Original question', notes: 'Original context', leadData: { notes: 'Original context' },
};
const doors = [
  ['contact', <Contact />], ['invest', <Invest />], ['sell', <Sell />], ['legacy submit', <SubmitPage />],
  ['MarketFlow access', <MarketflowAccessPage />], ['vendor', <VendorNetwork />],
  ['canonical opportunity', <SubmitPropertyPage />], ['footer newsletter', <Footer />],
  ['Peggy note', <PeggyPublicNote />], ['Pegasus lane', <LeadForm cfg={CONTACT_FORM} />],
] as const;
let now = 100_000;

beforeEach(() => {
  now = 100_000;
  vi.spyOn(Date, 'now').mockImplementation(() => now);
  vi.stubGlobal('crypto', webcrypto);
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  sessionStorage.clear();
  mutations.length = 0;
  apiRequestMock.mockRejectedValue(new Error('response lost'));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); apiRequestMock.mockReset(); });

describe('every public intake caller uses a stable retry key', () => {
  it.each(doors)('%s preserves the key across failure, retry, Back/remount, and invalid receipt', async (_door, component) => {
    const mounted = render(component);
    now += 5000;
    const send = mutations.at(-1)!;
    await expect(send(values)).rejects.toThrow('response lost');
    expect(apiRequestMock.mock.calls[0][3]).toEqual({ 'Idempotency-Key': expect.stringMatching(/^[0-9a-f-]{36}$/) });
    const firstKey = apiRequestMock.mock.calls[0][3]['Idempotency-Key'];
    now += 5000;
    await expect(send(values)).rejects.toThrow('response lost');
    expect(apiRequestMock.mock.calls[1][3]['Idempotency-Key']).toBe(firstKey);
    mounted.unmount();
    render(component);
    now += 5000;
    apiRequestMock.mockResolvedValueOnce(new Response('{}', { status: 201 }));
    await expect(mutations.at(-1)!(values)).rejects.toThrow(/receipt/);
    expect(apiRequestMock.mock.calls[2][3]['Idempotency-Key']).toBe(firstKey);
    await expect(mutations.at(-1)!(values)).rejects.toThrow('response lost');
    expect(apiRequestMock.mock.calls[3][3]['Idempotency-Key']).toBe(firstKey);
  });
});
