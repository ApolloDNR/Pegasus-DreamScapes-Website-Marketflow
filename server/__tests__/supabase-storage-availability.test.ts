import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(),
  isReachable: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: { from: supabaseMocks.from },
  isSupabaseReachable: supabaseMocks.isReachable,
}));

import {
  SupabaseInfrastructureError,
  SupabaseStorage,
} from '../supabase-storage';

type QueryResult = { data: unknown; error: unknown };

function listQuery(result: QueryResult) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.in.mockReturnValue(query);
  query.order.mockResolvedValue(result);
  return query;
}

function singleQuery(result: QueryResult) {
  const query = {
    select: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.update.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.single.mockResolvedValue(result);
  return query;
}

describe('Supabase marketplace read availability truth', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    supabaseMocks.from.mockReset();
    supabaseMocks.isReachable.mockReset().mockResolvedValue(true);
  });

  it('throws a typed infrastructure failure instead of returning empty on outage', async () => {
    supabaseMocks.isReachable.mockResolvedValue(false);
    const storage = new SupabaseStorage();

    for (const read of [
      () => storage.getPublicWholesaleDeals(),
      () => storage.getWholesaleDealsByUser('member-1'),
      () => storage.getPendingWholesaleDeals(),
      () => storage.getPublicCapitalProjects(),
      () => storage.getCapitalProjectsByUser('member-1'),
      () => storage.getWholesaleDealsByExternalUser('legacy-member-1'),
      () => storage.getCapitalProjectsByExternalUser('legacy-member-1'),
    ]) {
      await expect(read()).rejects.toMatchObject({
        name: 'SupabaseInfrastructureError',
        code: 'SUPABASE_INFRASTRUCTURE_UNAVAILABLE',
        reason: 'unreachable',
      });
    }
    expect(supabaseMocks.from).not.toHaveBeenCalled();
  });

  it('preserves genuine successful empty collections', async () => {
    const storage = new SupabaseStorage();

    for (const read of [
      () => storage.getPublicWholesaleDeals(),
      () => storage.getWholesaleDealsByUser('member-1'),
      () => storage.getPendingWholesaleDeals(),
      () => storage.getPublicCapitalProjects(),
      () => storage.getCapitalProjectsByUser('member-1'),
      () => storage.getWholesaleDealsByExternalUser('legacy-member-1'),
      () => storage.getCapitalProjectsByExternalUser('legacy-member-1'),
    ]) {
      supabaseMocks.from.mockReturnValueOnce(
        listQuery({ data: [], error: null }),
      );
      await expect(read()).resolves.toEqual([]);
    }
  });

  it('throws a typed failure for PostgREST list-query errors', async () => {
    const storage = new SupabaseStorage();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    for (const read of [
      () => storage.getPublicWholesaleDeals(),
      () => storage.getWholesaleDealsByUser('member-1'),
      () => storage.getPendingWholesaleDeals(),
      () => storage.getPublicCapitalProjects(),
      () => storage.getCapitalProjectsByUser('member-1'),
      () => storage.getWholesaleDealsByExternalUser('legacy-member-1'),
      () => storage.getCapitalProjectsByExternalUser('legacy-member-1'),
    ]) {
      supabaseMocks.from.mockReturnValueOnce(
        listQuery({ data: null, error: { code: 'PGRST500' } }),
      );
      await expect(read()).rejects.toBeInstanceOf(
        SupabaseInfrastructureError,
      );
    }
  });

  it('keeps historical submitted records in the authoritative pending query', async () => {
    const storage = new SupabaseStorage();
    const query = listQuery({ data: [], error: null });
    supabaseMocks.from.mockReturnValueOnce(query);

    await storage.getPendingWholesaleDeals();

    expect(query.in).toHaveBeenCalledWith(
      'status',
      expect.arrayContaining([
        'Under Review',
        'under_review',
        'pending_review',
        'submitted',
        'SUBMITTED',
      ]),
    );
  });

  it('distinguishes a missing wholesale record from infrastructure failure', async () => {
    const storage = new SupabaseStorage();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    supabaseMocks.from.mockReturnValueOnce(
      singleQuery({ data: null, error: { code: 'PGRST116' } }),
    );
    await expect(storage.getWholesaleDeal('missing')).resolves.toBeNull();

    supabaseMocks.from.mockReturnValueOnce(
      singleQuery({ data: null, error: { code: 'PGRST500' } }),
    );
    await expect(storage.getWholesaleDeal('deal-1')).rejects.toBeInstanceOf(
      SupabaseInfrastructureError,
    );

    supabaseMocks.from.mockReturnValueOnce(
      singleQuery({ data: null, error: { code: 'PGRST116' } }),
    );
    await expect(
      storage.updateWholesaleDeal('missing', { status: 'approved' }),
    ).resolves.toBeNull();

    supabaseMocks.from.mockReturnValueOnce(
      singleQuery({ data: null, error: { code: 'PGRST500' } }),
    );
    await expect(
      storage.updateWholesaleDeal('deal-1', { status: 'approved' }),
    ).rejects.toBeInstanceOf(SupabaseInfrastructureError);
  });
});
