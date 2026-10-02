import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseAuthProvider, useSupabaseAuth } from '@/contexts/supabase-auth-context';
import { RoleCategoryGuard } from '@/components/auth-guard';
import AdminHqOutbox from '@/pages/admin-hq-outbox';
import { queryClient } from '@/lib/queryClient';

const provider = vi.hoisted(() => ({
  session: null as Session | null,
  listener: null as ((event: AuthChangeEvent, session: Session | null) => unknown) | null,
  signOut: vi.fn(),
  signUp: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock('@/lib/supabase', async () => {
  const actual = await vi.importActual<typeof import('@/lib/supabase')>('@/lib/supabase');
  const client = { auth: {
    getSession: async () => ({ data: { session: provider.session }, error: null }),
    onAuthStateChange: (listener: typeof provider.listener) => {
      provider.listener = listener;
      return { data: { subscription: { unsubscribe: provider.unsubscribe } } };
    },
    signOut: provider.signOut,
    signUp: provider.signUp,
  } };
  return { ...actual, getSupabase: async () => client, getSupabaseSync: () => client };
});

const subject = '11000000-0000-4000-8000-000000000001';
function session(id = subject, token = 'synthetic-staff-token'): Session {
  return { access_token: token, refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600,
    user: { id, email: 'owner@example.test', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2026-01-01T00:00:00Z' },
  };
}
function account(id = subject, staff = true) {
  return { id, email: 'owner@example.test', displayName: 'Canonical Owner', profileImageUrl: null,
    roles: staff ? ['admin'] : [], primaryRole: staff ? 'admin' : null,
    isAdmin: staff, isStaff: staff, isPegasusBadged: false, supabaseAuth: true };
}
function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
}
let authResponse: () => Promise<Response>;
let requests: { path: string; authorization: string | null; method: string }[];

function Probe() {
  const auth = useSupabaseAuth();
  return <>
    <output data-testid="identity">{auth.isLoading ? 'loading' : auth.isAuthenticated ? auth.profile?.display_name : 'anonymous'}</output>
    <output data-testid="admin">{String(auth.isAdmin)}</output>
    <output data-testid="token">{auth.session?.access_token ?? 'none'}</output>
    <button onClick={() => void auth.refreshProfile()}>Refresh account</button>
    <button onClick={() => void auth.signOut()}>Sign out</button>
    {auth.isAuthenticated && <RoleCategoryGuard category="admin"><AdminHqOutbox /></RoleCategoryGuard>}
  </>;
}
function mount() {
  return render(<QueryClientProvider client={queryClient}><SupabaseAuthProvider><Probe /></SupabaseAuthProvider></QueryClientProvider>);
}
async function emit(event: AuthChangeEvent, next: Session | null) {
  provider.session = next;
  await act(async () => { await provider.listener?.(event, next); });
}

beforeEach(() => {
  provider.session = session();
  provider.listener = null;
  provider.signOut.mockReset();
  provider.signUp.mockReset();
  provider.unsubscribe.mockReset();
  localStorage.clear();
  queryClient.clear();
  requests = [];
  authResponse = async () => json(account());
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const path = String(input);
    const authorization = new Headers(init?.headers).get('Authorization');
    requests.push({ path, authorization, method: init?.method ?? 'GET' });
    if (path === '/api/auth/user') return authorization ? authResponse() : json({ message: 'Unauthorized' }, 401);
    if (path === '/api/admin/hq-outbox') return json({ rows: [], transportConfigured: true, legacyRequiresReview: false });
    // A canonical shared account deliberately has neither legacy profile table.
    if (path.startsWith('/api/supabase/profile/')) return json({ message: 'Profile not found' }, 404);
    return json({ message: 'Unsupported legacy write' }, 410);
  });
});
afterEach(() => { cleanup(); queryClient.clear(); vi.restoreAllMocks(); });

describe('mounted shared-platform auth provider', () => {
  it('hydrates a canonical staff account without legacy profiles and opens the private delivery desk', async () => {
    mount();
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('Canonical Owner'));
    expect(await screen.findByText('Connection configured')).toBeInTheDocument();
    expect(screen.getByTestId('admin')).toHaveTextContent('true');
    expect(screen.getByTestId('token')).toHaveTextContent('synthetic-staff-token');
    expect(requests).toContainEqual({ path: '/api/auth/user', authorization: 'Bearer synthetic-staff-token', method: 'GET' });
    expect(requests).toContainEqual({ path: '/api/admin/hq-outbox', authorization: 'Bearer synthetic-staff-token', method: 'GET' });
    expect(requests.every(({ path, method }) => !path.includes('/supabase/profile/') && method === 'GET')).toBe(true);
    expect(provider.signOut).not.toHaveBeenCalled();
    expect(provider.signUp).not.toHaveBeenCalled();
  });

  it('never provisions from editable signup metadata when hydrating a shared account', async () => {
    provider.session!.user.user_metadata = { primary_role: 'admin', display_name: 'Forged admin' };
    mount();
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('Canonical Owner'));
    expect(requests.some(({ path }) => path.includes('provision'))).toBe(false);
    expect(provider.signUp).not.toHaveBeenCalled();
  });

  it.each([401, 403])('keeps a rejected identity unauthorized after HTTP %s', async (status) => {
    provider.session!.user.email = 'apollosynd@gmail.com';
    provider.session!.user.user_metadata = { primary_role: 'admin', display_name: 'Forged admin' };
    authResponse = async () => json({ message: 'Unauthorized' }, status);
    mount();
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('anonymous'));
    expect(screen.getByTestId('admin')).toHaveTextContent('false');
    expect(screen.getByTestId('token')).toHaveTextContent('none');
    expect(requests.some(({ path }) => path === '/api/admin/hq-outbox' || path.includes('provision'))).toBe(false);
  });

  it('does not infer staff authority from an email allowlist or editable metadata', async () => {
    provider.session!.user.email = 'apollosynd@gmail.com';
    provider.session!.user.user_metadata = { primary_role: 'admin' };
    authResponse = async () => json({ ...account(subject, false), email: 'apollosynd@gmail.com' });
    mount();
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('Canonical Owner'));
    expect(screen.getByTestId('admin')).toHaveTextContent('false');
    expect(requests.some(({ path }) => path === '/api/admin/hq-outbox')).toBe(false);
  });

  it.each(['server', 'network'])('retains the provider session through an initial %s outage and can recover', async (failure) => {
    authResponse = async () => { if (failure === 'network') throw new TypeError('Failed to fetch'); return json({ message: 'Unavailable' }, 503); };
    mount();
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('anonymous'));
    expect(screen.getByTestId('admin')).toHaveTextContent('false');
    expect(provider.signOut).not.toHaveBeenCalled();
    expect(provider.listener).toBeTypeOf('function');
    authResponse = async () => json(account());
    await emit('TOKEN_REFRESHED', session(subject, 'recovered-token'));
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('Canonical Owner'));
    expect(screen.getByTestId('token')).toHaveTextContent('recovered-token');
  });

  it('preserves verified same-subject state on a transient refresh failure and unsubscribes on unmount', async () => {
    const view = mount();
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('Canonical Owner'));
    authResponse = async () => json({ message: 'Unavailable' }, 503);
    await emit('TOKEN_REFRESHED', session(subject, 'refreshed-token'));
    expect(screen.getByTestId('identity')).toHaveTextContent('Canonical Owner');
    expect(screen.getByTestId('token')).toHaveTextContent('refreshed-token');
    expect(provider.signOut).not.toHaveBeenCalled();
    view.unmount();
    expect(provider.unsubscribe).toHaveBeenCalledOnce();
  });

  it('ignores a late account response after explicit sign-out during hydration', async () => {
    let finish!: (response: Response) => void;
    authResponse = () => new Promise((resolve) => { finish = resolve; });
    mount();
    await waitFor(() => expect(requests.some(({ path }) => path === '/api/auth/user')).toBe(true));
    fireEvent.click(screen.getByText('Sign out'));
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('anonymous'));
    await act(async () => { finish(json(account())); });
    expect(screen.getByTestId('identity')).toHaveTextContent('anonymous');
    expect(screen.getByTestId('admin')).toHaveTextContent('false');
    expect(requests.some(({ path }) => path === '/api/admin/hq-outbox')).toBe(false);
  });

  it('clears a prior subject immediately and ignores its late response after an account change', async () => {
    mount();
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('Canonical Owner'));
    expect(await screen.findByText('Connection configured')).toBeInTheDocument();
    queryClient.setQueryData(['/api/legacy-private-record'], { secret: 'prior account' });
    let finish!: (response: Response) => void;
    authResponse = () => new Promise((resolve) => { finish = resolve; });
    await emit('TOKEN_REFRESHED', session());
    authResponse = async () => json({ message: 'Denied' }, 403);
    await emit('SIGNED_IN', session('11000000-0000-4000-8000-000000000002', 'denied-account-token'));
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('anonymous'));
    await act(async () => { finish(json(account())); });
    expect(screen.getByTestId('identity')).toHaveTextContent('anonymous');
    expect(screen.queryByText('Connection configured')).not.toBeInTheDocument();
    expect(queryClient.getQueryData(['/api/legacy-private-record'])).toBeUndefined();
  });

  it('does not restore an account from a refresh that raced with provider sign-out', async () => {
    mount();
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('Canonical Owner'));
    let finishSignOut!: () => void;
    provider.signOut.mockImplementation(() => new Promise<void>((resolve) => { finishSignOut = resolve; }));
    fireEvent.click(screen.getByText('Sign out'));
    await waitFor(() => expect(provider.signOut).toHaveBeenCalledOnce());
    let finishAccount!: (response: Response) => void;
    const pendingAccount = new Promise<Response>((resolve) => { finishAccount = resolve; });
    authResponse = () => pendingAccount;
    await emit('TOKEN_REFRESHED', session());
    await act(async () => { finishSignOut(); });
    await act(async () => { finishAccount(json(account())); });
    expect(screen.getByTestId('identity')).toHaveTextContent('anonymous');
    expect(screen.getByTestId('admin')).toHaveTextContent('false');
  });

  it('refreshes canonical profile data without touching a legacy profile or provisioning route', async () => {
    mount();
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('Canonical Owner'));
    authResponse = async () => json({ ...account(), displayName: 'Updated Canonical Owner' });
    fireEvent.click(screen.getByText('Refresh account'));
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('Updated Canonical Owner'));
    expect(requests.every(({ path, method }) => !path.includes('/supabase/profile/') && method === 'GET')).toBe(true);
  });

  it('refuses to hydrate an account response belonging to a different verified subject', async () => {
    authResponse = async () => json(account('11000000-0000-4000-8000-000000000002'));
    mount();
    await waitFor(() => expect(screen.getByTestId('identity')).toHaveTextContent('anonymous'));
    expect(screen.getByTestId('admin')).toHaveTextContent('false');
    expect(requests.some(({ path }) => path === '/api/admin/hq-outbox')).toBe(false);
  });
});
