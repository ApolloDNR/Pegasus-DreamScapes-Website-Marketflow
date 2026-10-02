import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createWebsiteHqTransport,
  deliverHqBatch,
  HqHttpError,
  shouldStartWebsiteHqWorker,
  startWebsiteHqWorker,
} from '../delivery';
import type { WebsiteInquiryEnvelopeV1 } from '../../../shared/website-inquiry-contract';

const org = 'c1000000-0000-4000-8000-000000000001';
const configured = {
  WEBSITE_ORG_ID: org,
  PEGASUS_HQ_WEBSITE_INQUIRY_URL: 'https://hq.example.test/api/public/website-inquiries',
  PEGASUS_WEBSITE_INQUIRY_TOKEN: 'synthetic-test-token',
  PEGASUS_ENABLE_HQ_DELIVERY_WORKER: 'true',
};
const payload: WebsiteInquiryEnvelopeV1 = {
  contractVersion: 1,
  idempotencyKey: 'c1000000-0000-4000-8000-000000000002',
  websiteRecord: { type: 'lead', id: 42 },
  submission: {
    kind: 'lead',
    captured: { leadType: 'contact', source: 'contact_page', firstName: 'Synthetic', email: 'synthetic@example.test' },
    consent: { contact: false, copyVersion: null, capturedAt: null, privacyAcknowledged: false },
  },
};
const receipt = {
  contractVersion: 1 as const,
  inquiryId: 'c1000000-0000-4000-8000-000000000003',
  reference: 'SYNTHETIC-1',
  websiteRecord: payload.websiteRecord,
  idempotencyKey: payload.idempotencyKey,
};

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('versioned HQ transport', () => {
  it('posts the unchanged envelope with server-only authentication and rejects redirects', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(receipt), { status: 201 }));
    const transport = createWebsiteHqTransport(configured, fetcher)!;
    const signal = new AbortController().signal;
    expect(await transport(payload, { signal })).toEqual(receipt);
    const [endpoint, options] = fetcher.mock.calls[0];
    expect(endpoint).toBe(configured.PEGASUS_HQ_WEBSITE_INQUIRY_URL);
    expect(options).toMatchObject({ method: 'POST', redirect: 'error', signal, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer synthetic-test-token' } });
    expect(JSON.parse(String(options?.body))).toEqual(payload);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([400, 401, 403, 409, 429, 500, 503])('returns typed HTTP %s without reading private error content', async status => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('PRIVATE error payload', { status }));
    const transport = createWebsiteHqTransport(configured, fetcher)!;
    await expect(transport(payload)).rejects.toMatchObject({ status, message: `hq_http_${status}` });
  });

  it('invalid success JSON is a receipt error without the response content', async () => {
    const transport = createWebsiteHqTransport(configured, async () => new Response('PRIVATE broken JSON', { status: 200 }))!;
    await expect(transport(payload)).rejects.toThrow('invalid_hq_receipt');
  });

  it.each([
    {},
    { ...configured, PEGASUS_WEBSITE_INQUIRY_TOKEN: '' },
    { ...configured, PEGASUS_WEBSITE_INQUIRY_TOKEN: 'invalid\r\ntoken' },
    { ...configured, PEGASUS_HQ_WEBSITE_INQUIRY_URL: '' },
    { ...configured, PEGASUS_HQ_WEBSITE_INQUIRY_URL: 'http://hq.example.test/api/public/website-inquiries' },
    { ...configured, PEGASUS_HQ_WEBSITE_INQUIRY_URL: 'https://user:secret@hq.example.test/api/public/website-inquiries' },
  ])('missing or unsafe transport configuration leaves work untouched', async environment => {
    const fetcher = vi.fn<typeof fetch>();
    const db = { execute: vi.fn() };
    const transport = createWebsiteHqTransport(environment, fetcher);
    expect(transport).toBeNull();
    expect(await deliverHqBatch(db as any, transport, new Date(), { environment: configured })).toEqual({ claimed: 0, delivered: 0, deferred: 0, quarantined: 0 });
    expect(db.execute).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('typed errors never retain supplied response text', () => {
    expect(new HqHttpError(401).message).toBe('hq_http_401');
  });
});

describe('HQ delivery worker startup', () => {
  it.each([undefined, 'false', 'TRUE', '1', ' true '])('requires exact worker opt-in %s', flag => {
    expect(shouldStartWebsiteHqWorker('persistent', { ...configured, PEGASUS_ENABLE_HQ_DELIVERY_WORKER: flag })).toBe(false);
  });

  it('requires explicit organization, persistent runtime, and transport configuration', () => {
    expect(shouldStartWebsiteHqWorker('persistent', configured)).toBe(true);
    expect(shouldStartWebsiteHqWorker('serverless', configured)).toBe(false);
    expect(shouldStartWebsiteHqWorker('persistent', { ...configured, WEBSITE_ORG_ID: '' })).toBe(false);
    expect(shouldStartWebsiteHqWorker('persistent', { ...configured, PEGASUS_WEBSITE_INQUIRY_TOKEN: '' })).toBe(false);
  });

  it('requires preview opt-in even when APP_ENV incorrectly says production', () => {
    for (const environment of [{ ...configured, APP_ENV: 'preview' }, { ...configured, APP_ENV: 'production', VERCEL_ENV: 'preview' }]) {
      expect(shouldStartWebsiteHqWorker('persistent', environment)).toBe(false);
      expect(shouldStartWebsiteHqWorker('persistent', { ...environment, PEGASUS_PREVIEW_ENABLE_HQ_RECOVERY: 'true' })).toBe(true);
    }
  });

  it('disabled workers never touch the database and shutdown is idempotent', async () => {
    const db = { execute: vi.fn() };
    const worker = startWebsiteHqWorker({ db: db as any, runtime: 'serverless', environment: configured });
    expect(worker.enabled).toBe(false);
    await worker.stop();
    await worker.stop();
    expect(db.execute).not.toHaveBeenCalled();
  });
});
