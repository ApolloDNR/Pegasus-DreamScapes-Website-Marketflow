import { webcrypto } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createIntakeRequest } from '@/lib/intake-idempotency';

const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));
vi.mock('@/lib/queryClient', () => ({ apiRequest: apiRequestMock }));

const lead = { firstName: 'Ada', email: 'ada@example.test', consentContact: false, leadData: { notes: '原文 🐎', privacy: null } };
const receipt = () => new Response(JSON.stringify({ id: 19, stage: 'new' }), { status: 201 });
const key = (index: number) => apiRequestMock.mock.calls[index][3]['Idempotency-Key'];

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

const endpoints = [
  ['/api/leads', { id: 19, stage: 'new' }],
  ['/api/opportunities', { id: '550e8400-e29b-41d4-a716-446655440000', status: 'New' }],
] as const;

beforeEach(() => {
  sessionStorage.clear();
  vi.stubGlobal('crypto', webcrypto);
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  apiRequestMock.mockRejectedValue(new Error('Lost response'));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); apiRequestMock.mockReset(); });

describe('stable visitor intake attempts', () => {
  it('persists a UUID before sending and reuses it after timeout and remount', async () => {
    const send = createIntakeRequest('property-context', '/api/leads');
    await expect(send(lead)).rejects.toThrow('Lost response');
    await expect(createIntakeRequest('property-context', '/api/leads')(lead)).rejects.toThrow('Lost response');
    expect(key(0)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(key(1)).toBe(key(0));
    expect(apiRequestMock.mock.calls[0][2]).toEqual(lead);
    expect(JSON.stringify(sessionStorage)).not.toContain('ada@example.test');
    expect(JSON.stringify(sessionStorage)).not.toContain('原文');
  });

  it('coalesces repeated clicks while the receipt is unresolved', async () => {
    let resolve!: (response: Response) => void;
    apiRequestMock.mockReturnValue(new Promise<Response>((done) => { resolve = done; }));
    const send = createIntakeRequest('double-click', '/api/leads');
    const first = send(lead);
    const second = send({ ...lead, ts_elapsed_ms: 12000 });
    await vi.waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    resolve(receipt());
    expect(await first).toEqual({ id: 19, stage: 'new' });
    expect(await second).toEqual({ id: 19, stage: 'new' });
  });

  it('shares the original receipt with an overlapping remount instead of losing the retry response', async () => {
    let resolveOriginal!: (response: Response) => void;
    let rejectRetry!: (error: Error) => void;
    const originalResponse = new Promise<Response>((resolve) => { resolveOriginal = resolve; });
    const retryResponse = new Promise<Response>((_resolve, reject) => { rejectRetry = reject; });
    // A separate retry response would be lost after the old mount's receipt
    // cleared their shared key, allowing the next retry to create a duplicate.
    void retryResponse.catch(() => {});
    apiRequestMock.mockReturnValueOnce(originalResponse).mockReturnValueOnce(retryResponse);

    const originalMount = createIntakeRequest('overlapping-remount', '/api/leads');
    const first = originalMount(lead);
    await vi.waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    const remounted = createIntakeRequest('overlapping-remount', '/api/leads');
    const retry = remounted({ ...lead, ts_elapsed_ms: 12000 });
    const outcomes = Promise.allSettled([first, retry]);

    // Wait for either shared work or the old implementation's second POST so
    // the original success is guaranteed to overlap the remounted retry.
    await vi.waitFor(() => expect(retry === first || apiRequestMock.mock.calls.length === 2).toBe(true));
    resolveOriginal(receipt());
    await first;
    rejectRetry(new Error('Lost retry response'));

    expect(await outcomes).toEqual([
      { status: 'fulfilled', value: { id: 19, stage: 'new' } },
      { status: 'fulfilled', value: { id: 19, stage: 'new' } },
    ]);
    expect(retry).toBe(first);
    expect(apiRequestMock).toHaveBeenCalledTimes(1);
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it.each(endpoints)('releases a hung %s request after 30 seconds and ignores its late response during retry', async (endpoint, body) => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const originalResponse = deferred<Response>();
    const originalStarted = deferred<void>();
    const retryResponse = deferred<Response>();
    const retryStarted = deferred<void>();
    apiRequestMock
      .mockImplementationOnce(() => { originalStarted.resolve(); return originalResponse.promise; })
      .mockImplementationOnce(() => { retryStarted.resolve(); return retryResponse.promise; });
    const first = createIntakeRequest('hung-response', endpoint)(lead);
    const firstOutcome = first.then((value) => value, (error: Error) => error);
    let failure: unknown;
    void firstOutcome.then((outcome) => { failure = outcome; });
    let retryOutcome: Promise<unknown> | undefined;

    try {
      await originalStarted.promise;
      expect(createIntakeRequest('hung-response', endpoint)(lead)).toBe(first);
      await vi.advanceTimersByTimeAsync(29_999);
      expect(failure).toBeUndefined();
      await vi.advanceTimersByTimeAsync(1);
      expect(failure).toEqual(expect.objectContaining({ message: expect.stringMatching(/timed out/i) }));

      const retry = createIntakeRequest('hung-response', endpoint)(lead);
      retryOutcome = retry.catch((error: Error) => error);
      await retryStarted.promise;
      expect(key(1)).toBe(key(0));
      const lateJson = vi.fn().mockResolvedValue(body);
      originalResponse.resolve({ status: 201, redirected: false, json: lateJson } as unknown as Response);
      await vi.advanceTimersByTimeAsync(0);
      expect(lateJson).not.toHaveBeenCalled();
      expect(createIntakeRequest('hung-response', endpoint)(lead)).toBe(retry);

      retryResponse.reject(new Error('Lost retry response'));
      expect(await retryOutcome).toEqual(new Error('Lost retry response'));
      apiRequestMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status: 201 }));
      await createIntakeRequest('hung-response', endpoint)(lead);
      expect(key(2)).toBe(key(0));
      expect(window.confirm).not.toHaveBeenCalled();
      // Flush the native Response body's zero-delay completion work.
      await vi.advanceTimersByTimeAsync(0);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      originalResponse.resolve(new Response(JSON.stringify(body), { status: 201 }));
      retryResponse.reject(new Error('Test request settled'));
      await Promise.allSettled([firstOutcome, retryOutcome, retryResponse.promise]);
      vi.useRealTimers();
    }
  });

  it.each(endpoints)('retains the %s key when its receipt body hangs beyond the same 30-second deadline', async (endpoint, body) => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const response = deferred<Response>();
    const requestStarted = deferred<void>();
    const receiptBody = deferred<typeof body>();
    const bodyStarted = deferred<void>();
    apiRequestMock.mockImplementationOnce(() => { requestStarted.resolve(); return response.promise; });
    const first = createIntakeRequest('hung-body', endpoint)(lead);
    const firstOutcome = first.then((value) => value, (error: Error) => error);
    let failure: unknown;
    void firstOutcome.then((outcome) => { failure = outcome; });

    try {
      await requestStarted.promise;
      await vi.advanceTimersByTimeAsync(20_000);
      response.resolve({
        status: 201, redirected: false,
        json: () => { bodyStarted.resolve(); return receiptBody.promise; },
      } as unknown as Response);
      await bodyStarted.promise;
      await vi.advanceTimersByTimeAsync(9_999);
      expect(failure).toBeUndefined();
      await vi.advanceTimersByTimeAsync(1);
      expect(failure).toEqual(expect.objectContaining({ message: expect.stringMatching(/timed out/i) }));

      receiptBody.resolve(body);
      await vi.advanceTimersByTimeAsync(0);
      apiRequestMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status: 201 }));
      await createIntakeRequest('hung-body', endpoint)(lead);
      expect(key(1)).toBe(key(0));
      expect(window.confirm).not.toHaveBeenCalled();
      // Flush the native Response body's zero-delay completion work.
      await vi.advanceTimersByTimeAsync(0);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      response.resolve(new Response(JSON.stringify(body), { status: 201 }));
      receiptBody.resolve(body);
      await firstOutcome;
      vi.useRealTimers();
    }
  });

  it('ignores changing anti-spam timing but keeps durable values and payload untouched', async () => {
    const send = createIntakeRequest('timing', '/api/leads');
    const payload = { ...lead, hp_company: '', ts_elapsed_ms: 4000, leadData: { ...lead.leadData, ts_elapsed_ms: 4000, ts_mounted_at: 100 } };
    await expect(send(payload)).rejects.toThrow();
    await expect(send({ ...payload, ts_elapsed_ms: 8000, leadData: { ...payload.leadData, ts_elapsed_ms: 8000, ts_mounted_at: 200 } })).rejects.toThrow();
    expect(key(1)).toBe(key(0));
    expect(apiRequestMock.mock.calls[0][2]).toEqual(payload);
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('canonicalizes object order but preserves array order, null, false and nested timing-named facts', async () => {
    const send = createIntakeRequest('canonical', '/api/leads');
    await expect(send({ b: [1, 2], a: { ts_elapsed_ms: 7, value: false }, c: null })).rejects.toThrow();
    await expect(send({ c: null, a: { value: false, ts_elapsed_ms: 7 }, b: [1, 2] })).rejects.toThrow();
    expect(key(1)).toBe(key(0));
    for (const changed of [
      { b: [2, 1], a: { ts_elapsed_ms: 7, value: false }, c: null },
      { b: [1, 2], a: { ts_elapsed_ms: 8, value: false }, c: null },
      { b: [1, 2], a: { ts_elapsed_ms: 7, value: true }, c: null },
      { b: [1, 2], a: { ts_elapsed_ms: 7, value: false } },
    ]) await expect(send(changed)).rejects.toThrow(/earlier submission/i);
    expect(apiRequestMock).toHaveBeenCalledTimes(2);
  });

  it('requires explicit new-inquiry confirmation for edited ambiguous attempts and retains the original key', async () => {
    const send = createIntakeRequest('edited', '/api/leads');
    await expect(send(lead)).rejects.toThrow('Lost response');
    await expect(send({ ...lead, firstName: 'Grace' })).rejects.toThrow(/earlier submission/i);
    expect(apiRequestMock).toHaveBeenCalledTimes(1);
    expect(window.confirm).toHaveBeenCalledWith(expect.stringMatching(/may already be recorded[\s\S]*separate inquiry[\s\S]*does not update or cancel/i));
    vi.mocked(window.confirm).mockReturnValue(true);
    await expect(send({ ...lead, firstName: 'Grace' })).rejects.toThrow('Lost response');
    expect(key(1)).not.toBe(key(0));
    await expect(send(lead)).rejects.toThrow('Lost response');
    expect(key(2)).toBe(key(0));
  });

  it.each([
    ['missing', () => new Response('{}', { status: 201 })],
    ['wrong type', () => new Response(JSON.stringify({ id: '19', stage: 'new' }), { status: 201 })],
    ['wrong status', () => new Response(JSON.stringify({ id: 19, stage: 'new' }), { status: 200 })],
    ['unreadable', () => new Response('broken', { status: 201 })],
  ])('retains the key after a %s receipt', async (_label, response) => {
    apiRequestMock.mockResolvedValueOnce(response());
    const send = createIntakeRequest('bad-receipt', '/api/leads');
    await expect(send(lead)).rejects.toThrow();
    await expect(send(lead)).rejects.toThrow('Lost response');
    expect(key(1)).toBe(key(0));
  });

  it('starts a new key only after a confirmed durable receipt', async () => {
    apiRequestMock.mockImplementation(async () => receipt());
    const send = createIntakeRequest('success', '/api/leads');
    expect(await send(lead)).toEqual({ id: 19, stage: 'new' });
    await send(lead);
    expect(key(1)).not.toBe(key(0));
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('validates the opportunity receipt independently of the integer lead receipt', async () => {
    apiRequestMock.mockResolvedValueOnce(receipt());
    const send = createIntakeRequest('opportunity', '/api/opportunities');
    await expect(send(lead)).rejects.toThrow(/opportunity receipt/);
    apiRequestMock.mockResolvedValueOnce(new Response(JSON.stringify({ id: '550e8400-e29b-41d4-a716-446655440000', status: 'New' }), { status: 201 }));
    expect(await send(lead)).toEqual({ id: '550e8400-e29b-41d4-a716-446655440000' });
    expect(key(1)).toBe(key(0));
  });

  it('retains retry protection across remounts when browser storage is disabled', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('disabled'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('disabled'); });
    await expect(createIntakeRequest('storage-disabled', '/api/leads')(lead)).rejects.toThrow('Lost response');
    await expect(createIntakeRequest('storage-disabled', '/api/leads')(lead)).rejects.toThrow('Lost response');
    expect(key(1)).toBe(key(0));
  });

  it('retains retry protection when reads work but writes exceed the storage quota', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota exceeded'); });
    await expect(createIntakeRequest('storage-quota', '/api/leads')(lead)).rejects.toThrow('Lost response');
    await expect(createIntakeRequest('storage-quota', '/api/leads')(lead)).rejects.toThrow('Lost response');
    expect(key(1)).toBe(key(0));
  });

  it('keeps independent doors and endpoints separate', async () => {
    await expect(createIntakeRequest('one', '/api/leads')(lead)).rejects.toThrow();
    await expect(createIntakeRequest('two', '/api/leads')(lead)).rejects.toThrow();
    await expect(createIntakeRequest('one', '/api/opportunities')(lead)).rejects.toThrow();
    expect(new Set([key(0), key(1), key(2)]).size).toBe(3);
  });
});
