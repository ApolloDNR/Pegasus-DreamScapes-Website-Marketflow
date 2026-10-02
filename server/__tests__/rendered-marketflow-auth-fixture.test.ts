import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWebsiteAuthProfile } from '../../client/src/lib/website-auth';
import { hasGovernedMarketflowAccess } from '../../client/src/lib/marketflow-access';

const source = readFileSync(new URL('../../scripts/check-visual-accessibility.mjs', import.meta.url), 'utf8');
const fixtureStart = source.indexOf('async function installApprovedMarketflowStubs(');
const fixtureEnd = source.indexOf('\nasync function captureInventoryState(', fixtureStart);
assert(fixtureStart >= 0 && fixtureEnd > fixtureStart);
const baseUrl = 'http://127.0.0.1:4317';
let client: SupabaseClient | undefined;

async function installFixture({ seedSession = true } = {}) {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  let handler: (route: unknown) => Promise<void>;
  const install = new Function('baseUrl', 'assert', `${source.slice(fixtureStart, fixtureEnd)}; return installApprovedMarketflowStubs;`)(baseUrl, assert);
  await install({
    addInitScript: async (callback: Function, arg: unknown) => {
      if (seedSession) new Function('localStorage', 'arg', `return (${callback.toString()})(arg);`)(storage, arg);
    },
    route: async (pattern: string, callback: typeof handler) => {
      expect(pattern).toBe(`${baseUrl}/api/**`);
      handler = callback;
    },
  }, { initialState: 'data' });

  const requests: { path: string; authorization: string | null }[] = [];
  const anonymousFallbacks: string[] = [];
  const request = async (path: string, authorization?: string) => {
    requests.push({ path, authorization: authorization ?? null });
    let response: Response | undefined;
    await handler({
      request: () => ({
        url: () => `${baseUrl}${path}`,
        method: () => 'GET',
        headers: () => authorization ? { authorization } : {},
      }),
      fulfill: async ({ status, body, headers, contentType }: {
        status: number; body: string; headers?: Record<string, string>; contentType: string;
      }) => { response = new Response(body, { status, headers: { ...headers, 'content-type': contentType } }); },
      fallback: async () => {
        anonymousFallbacks.push(path);
        response = new Response(JSON.stringify({ message: 'Anonymous preview' }), { status: 404 });
      },
    });
    assert(response, `The fixture did not answer ${path}`);
    return response;
  };
  const config = await (await request('/api/config/supabase')).json();
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const path = String(input);
    assert(path === '/api/auth/user', `Unexpected provider or legacy request: ${path}`);
    return request(path, new Headers(init?.headers).get('Authorization') ?? undefined);
  });
  // Match the production client's fallback so the old empty-config fixture
  // reproduces its anonymous session instead of failing during test setup.
  client = createClient(config.url || 'https://placeholder.supabase.co', config.anonKey || 'placeholder', {
    auth: { storage, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data: { session }, error } = await client.auth.getSession();
  expect(error).toBeNull();
  return { config, session, requests, request, anonymousFallbacks };
}

afterEach(async () => {
  await client?.auth.stopAutoRefresh();
  client = undefined;
  vi.restoreAllMocks();
});

describe('rendered MarketFlow approved-operator auth fixture', () => {
  it('recovers a real SDK session and hydrates canonical reviewed access using its bearer token', async () => {
    const fixture = await installFixture();
    expect(fixture.session).not.toBeNull();
    assert(fixture.session);
    expect(new URL(fixture.config.url).origin).toBe(baseUrl);
    expect(fixture.session.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000) + 300);

    const account = await getWebsiteAuthProfile(fixture.session);
    expect(account?.profile).toMatchObject({
      user_id: fixture.session.user.id,
      display_name: 'QA Operator',
      primary_role: 'pegasus_wholesaler',
      is_pegasus_badged: true,
    });
    expect(account?.isAdmin).toBe(false);
    expect(hasGovernedMarketflowAccess({
      isAuthenticated: account !== null,
      profile: account?.profile,
      isAdmin: account?.isAdmin,
    })).toBe(true);
    expect(fixture.requests).toEqual([
      { path: '/api/config/supabase', authorization: null },
      { path: '/api/auth/user', authorization: `Bearer ${fixture.session.access_token}` },
    ]);
  });

  it('keeps an unseeded browser anonymous and rejects absent or unrelated bearer tokens', async () => {
    const fixture = await installFixture({ seedSession: false });
    expect(fixture.session).toBeNull();
    expect((await fixture.request('/api/auth/user')).status).toBe(404);
    expect(fixture.anonymousFallbacks).toEqual(['/api/auth/user']);
    expect((await fixture.request('/api/auth/user', 'Bearer unrelated-session')).status).toBe(401);
    expect(hasGovernedMarketflowAccess({ isAuthenticated: false })).toBe(false);
  });

  it('does not expose the retired legacy-profile response', async () => {
    const fixture = await installFixture();
    const response = await fixture.request('/api/supabase/profile/qa-marketflow-operator');
    expect(response.status).toBe(418);
  });
});
