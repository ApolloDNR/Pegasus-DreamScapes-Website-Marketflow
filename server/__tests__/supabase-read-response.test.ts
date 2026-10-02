import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { SupabaseInfrastructureError } from '../supabase-storage';
import { sendSupabaseReadResponse } from '../supabase-read-response';

function responseDouble() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response;
}

describe('mounted Supabase list response contract', () => {
  it('maps a typed infrastructure outage to a retryable 503', async () => {
    const res = responseDouble();

    await sendSupabaseReadResponse(res as any, async () => {
      throw new SupabaseInfrastructureError(
        'getPublicWholesaleDeals',
        'unreachable',
      );
    });

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      message: 'MarketFlow data is temporarily unavailable. Please try again.',
      code: 'SUPABASE_INFRASTRUCTURE_UNAVAILABLE',
    });
  });

  it('keeps a genuine empty result as 200 with an empty array', async () => {
    const res = responseDouble();

    await sendSupabaseReadResponse(res as any, async () => []);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('rethrows unrelated failures for the route-level 500 boundary', async () => {
    const res = responseDouble();
    const failure = new Error('programming failure');

    await expect(
      sendSupabaseReadResponse(res as any, async () => {
        throw failure;
      }),
    ).rejects.toBe(failure);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('wires the behavior-tested boundary into all four canonical list routes', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../routes.ts'),
      'utf8',
    );
    const mountedRoutes = [
      '/api/supabase/capital-projects',
      '/api/supabase/capital-projects/my',
      '/api/supabase/wholesale-deals',
      '/api/supabase/wholesale-deals/my',
    ];

    for (const route of mountedRoutes) {
      const start = source.indexOf(`app.get('${route}'`);
      expect(start, `${route} must remain mounted`).toBeGreaterThanOrEqual(0);
      const nextRoute = source.indexOf('\n  app.', start + 1);
      const block = source.slice(
        start,
        nextRoute === -1 ? source.length : nextRoute,
      );
      expect(block).toContain('sendSupabaseReadResponse');
    }
  });
});
