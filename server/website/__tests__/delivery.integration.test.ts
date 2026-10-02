import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { and, eq, sql } from 'drizzle-orm';
import { websiteDeliveryJobs, intakeRequests, opportunities, leads, hqOutbox } from '../../../shared/website-schema';
import { assertWebsiteTestTarget } from '../../../scripts/website-db-test-target.mjs';
import { createWebsiteDb, type WebsiteDb } from '../db';
import { deliverHqBatch, HqHttpError, reschedulePendingHqDelivery, startWebsiteHqWorker, type HqTransport } from '../delivery';
import type { WebsiteInquiryEnvelopeV1, WebsiteInquiryReceiptV1 } from '../../../shared/website-inquiry-contract';

const org = 'c1000000-0000-4000-8000-000000000010';
const otherOrg = 'c1000000-0000-4000-8000-000000000011';
const now = new Date('2026-10-02T03:00:00.000Z');
const environment = { WEBSITE_ORG_ID: org };
const receiptFor = (payload: WebsiteInquiryEnvelopeV1): WebsiteInquiryReceiptV1 => ({ contractVersion: 1, inquiryId: 'c1000000-0000-4000-8000-000000000012', reference: 'SYNTHETIC-1', websiteRecord: payload.websiteRecord, idempotencyKey: payload.idempotencyKey });
const accepted: HqTransport = async payload => receiptFor(payload);

describe.skipIf(process.env.WEBSITE_DB_TESTS !== '1')('HQ lease delivery PostgreSQL proof', () => {
  let db: WebsiteDb;
  let close: () => Promise<void>;
  beforeAll(() => { ({ db, close } = createWebsiteDb(assertWebsiteTestTarget(process.env.WEBSITE_TEST_DATABASE_URL))); });
  const clean = async () => {
    for (const table of ['delivery_jobs', 'intake_requests', 'hq_outbox', 'opportunities', 'leads']) {
      await db.execute(sql`delete from website.${sql.identifier(table)} where org_id in (${org}::uuid, ${otherOrg}::uuid)`);
    }
  };
  beforeEach(clean);
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
  afterAll(async () => { if (db) { await clean(); await close(); } });

  async function seed(kind: 'lead' | 'opportunity' = 'opportunity', orgId = org) {
    const idempotencyKey = randomUUID();
    const record = kind === 'opportunity'
      ? (await db.insert(opportunities).values({ orgId, visitorType: 'owner', contactName: 'Synthetic', email: 'synthetic@example.test' }).returning())[0]
      : (await db.insert(leads).values({ orgId, leadType: 'contact', source: 'contact_page', firstName: 'Synthetic', email: 'synthetic@example.test' }).returning())[0];
    const refs = { orgId, idempotencyKey, opportunityId: kind === 'opportunity' ? String(record.id) : null, leadId: kind === 'lead' ? Number(record.id) : null };
    await db.insert(intakeRequests).values({ ...refs, kind, payloadHash: 'a'.repeat(64) });
    const payload = {
      contractVersion: 1, idempotencyKey,
      websiteRecord: { type: kind, id: record.id },
      submission: { kind, captured: kind === 'opportunity'
        ? { visitorType: 'owner', contactName: 'Synthetic', email: 'synthetic@example.test', consentAccepted: false, notes: '<script>private synthetic</script>' }
        : { leadType: 'contact', source: 'contact_page', firstName: 'Synthetic', email: 'synthetic@example.test' },
      consent: { contact: false, copyVersion: null, capturedAt: null, privacyAcknowledged: false } },
    };
    return (await db.insert(websiteDeliveryJobs).values({ ...refs, recordType: kind, payload, nextAttemptAt: now }).returning())[0];
  }
  const read = async (id: string) => (await db.select().from(websiteDeliveryJobs).where(eq(websiteDeliveryJobs.id, id)))[0];
  const run = (transport: HqTransport = accepted, date = now, clock: () => Date = () => date) => deliverHqBatch(db, transport, date, { environment, clock });

  it.each(['opportunity', 'lead'] as const)('delivers a correlated %s receipt without changing original facts', async kind => {
    const job = await seed(kind);
    expect(await run()).toEqual({ claimed: 1, delivered: 1, deferred: 0, quarantined: 0 });
    expect(await read(job.id)).toMatchObject({ status: 'delivered', attempts: 1, receipt: receiptFor(job.payload as WebsiteInquiryEnvelopeV1), payload: job.payload, idempotencyKey: job.idempotencyKey, deliveredAt: now, leaseToken: null, leaseExpiresAt: null });
  });

  it('two_workers_one_claim', async () => {
    const job = await seed();
    let sends = 0;
    const results = await Promise.all([run(async p => { sends++; return receiptFor(p); }), run(async p => { sends++; return receiptFor(p); })]);
    expect(sends).toBe(1);
    expect(results.reduce((n, r) => n + r.claimed, 0)).toBe(1);
    expect((await read(job.id)).status).toBe('delivered');
  });

  it('lease_expiry_recovers original payload and key', async () => {
    const job = await seed();
    await db.update(websiteDeliveryJobs).set({ status: 'processing', attempts: 1, leaseToken: randomUUID(), leaseExpiresAt: now }).where(eq(websiteDeliveryJobs.id, job.id));
    let received: WebsiteInquiryEnvelopeV1 | undefined;
    expect((await run(async p => { received = p; return receiptFor(p); })).delivered).toBe(1);
    expect(received).toEqual(job.payload);
    expect(await read(job.id)).toMatchObject({ attempts: 2, idempotencyKey: job.idempotencyKey, payload: job.payload });
  });

  it('stale_worker_cannot_complete after another worker recovers the lease', async () => {
    const job = await seed();
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    let started!: () => void;
    const entered = new Promise<void>(resolve => { started = resolve; });
    const first = run(async p => { started(); await gate; return { ...receiptFor(p), reference: 'STALE-RECEIPT' }; });
    await entered;
    const recovered = await run(async p => ({ ...receiptFor(p), reference: 'RECOVERED-RECEIPT' }), new Date(now.getTime() + 60_001));
    release();
    expect(recovered.delivered).toBe(1);
    expect((await first).delivered).toBe(0);
    expect(await read(job.id)).toMatchObject({ status: 'delivered', attempts: 2, receipt: { reference: 'RECOVERED-RECEIPT' } });
  });

  it('expired leases cannot complete without a competing recovery worker', async () => {
    const job = await seed();
    let clock = now;
    expect((await run(async p => { clock = new Date(now.getTime() + 60_001); return receiptFor(p); }, now, () => clock)).delivered).toBe(0);
    expect((await read(job.id)).status).toBe('processing');
    expect((await run(accepted, clock)).delivered).toBe(1);
  });

  it.each(['version', 'key', 'record', 'type', 'missing'] as const)('wrong receipt %s never marks delivered', async mismatch => {
    const job = await seed('lead');
    const result = await run(async p => {
      const receipt: any = receiptFor(p);
      if (mismatch === 'version') receipt.contractVersion = 2;
      if (mismatch === 'key') receipt.idempotencyKey = randomUUID();
      if (mismatch === 'record') receipt.websiteRecord.id += 1;
      if (mismatch === 'type') receipt.websiteRecord = { type: 'opportunity', id: randomUUID() };
      if (mismatch === 'missing') delete receipt.reference;
      return receipt;
    });
    expect(result.quarantined).toBe(1);
    expect(await read(job.id)).toMatchObject({ status: 'quarantined', deliveredAt: null, receipt: null, lastError: 'invalid_hq_receipt' });
  });

  it('legacy_payload_quarantined while historical hqOutbox is never coerced or replayed', async () => {
    const job = await seed();
    const legacy = { contact: 'Synthetic', consent: true };
    await db.update(websiteDeliveryJobs).set({ payload: legacy }).where(eq(websiteDeliveryJobs.id, job.id));
    const [old] = await db.insert(hqOutbox).values({ orgId: org, idempotencyKey: randomUUID(), surface: 'lead', payload: legacy, status: 'pending' }).returning();
    let sends = 0;
    expect((await run(async p => { sends++; return receiptFor(p); })).quarantined).toBe(1);
    expect(sends).toBe(0);
    expect(await read(job.id)).toMatchObject({ status: 'quarantined', payload: legacy, lastError: 'invalid_hq_payload' });
    expect((await db.select().from(hqOutbox).where(eq(hqOutbox.id, old.id)))[0]).toEqual(old);
  });

  it('a valid envelope with a different durable job key is quarantined before sending', async () => {
    const job = await seed();
    await db.update(websiteDeliveryJobs).set({ payload: { ...(job.payload as object), idempotencyKey: randomUUID() } }).where(eq(websiteDeliveryJobs.id, job.id));
    let sends = 0;
    expect((await run(async p => { sends++; return receiptFor(p); })).quarantined).toBe(1);
    expect(sends).toBe(0);
  });

  it.each([400, 401, 403, 409, 422])('permanent HTTP %s quarantines without a blind retry', async status => {
    const job = await seed();
    expect((await run(async () => { throw new HqHttpError(status); })).quarantined).toBe(1);
    expect(await read(job.id)).toMatchObject({ status: 'quarantined', attempts: 1, lastError: `hq_http_${status}` });
    expect((await run()).claimed).toBe(0);
  });

  it.each([408, 429, 500, 503])('transient HTTP %s defers with the same original key', async status => {
    const job = await seed();
    expect((await run(async () => { throw new HqHttpError(status); })).deferred).toBe(1);
    expect(await read(job.id)).toMatchObject({ status: 'pending', attempts: 1, nextAttemptAt: new Date(now.getTime() + 30_000), payload: job.payload, idempotencyKey: job.idempotencyKey });
    expect((await run(accepted, new Date(now.getTime() + 29_999))).claimed).toBe(0);
    expect((await run(accepted, new Date(now.getTime() + 30_000))).delivered).toBe(1);
  });

  it.each([[1, 30_000], [2, 120_000], [3, 600_000], [4, 3_600_000], [5, 21_600_000], [9, 21_600_000]])('attempt %s uses bounded backoff %sms', async (attempt, delay) => {
    const job = await seed();
    await db.update(websiteDeliveryJobs).set({ attempts: attempt - 1 }).where(eq(websiteDeliveryJobs.id, job.id));
    await run(async () => { throw new Error('PRIVATE contact response'); });
    expect(await read(job.id)).toMatchObject({ status: 'pending', attempts: attempt, nextAttemptAt: new Date(now.getTime() + delay), lastError: 'hq_transport_uncertain' });
  });

  it('tenth failed attempt quarantines and exhausted expired leases do not send again', async () => {
    const job = await seed();
    await db.update(websiteDeliveryJobs).set({ attempts: 9 }).where(eq(websiteDeliveryJobs.id, job.id));
    expect((await run(async () => { throw new HqHttpError(503); })).quarantined).toBe(1);
    expect(await read(job.id)).toMatchObject({ status: 'quarantined', attempts: 10, lastError: 'retry_limit_reached' });
    await db.update(websiteDeliveryJobs).set({ status: 'processing', leaseToken: randomUUID(), leaseExpiresAt: now }).where(eq(websiteDeliveryJobs.id, job.id));
    let sends = 0;
    expect((await run(async p => { sends++; return receiptFor(p); })).quarantined).toBe(1);
    expect(sends).toBe(0);
    expect((await read(job.id)).attempts).toBe(10);
  });

  it('ambiguous_timeout_same_key_retries the original HQ acceptance receipt', async () => {
    const job = await seed();
    const hq = new Map<string, WebsiteInquiryReceiptV1>();
    let signal: AbortSignal | undefined;
    let entered!: () => void;
    const started = new Promise<void>(resolve => { entered = resolve; });
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const first = run(async (p, options) => {
      hq.set(p.idempotencyKey, receiptFor(p));
      signal = options?.signal;
      entered();
      return new Promise(() => {});
    });
    await started;
    await vi.advanceTimersByTimeAsync(15_000);
    expect((await first).deferred).toBe(1);
    expect(signal?.aborted).toBe(true);
    vi.useRealTimers();
    const retried = await run(async p => hq.get(p.idempotencyKey)!, new Date(now.getTime() + 30_000));
    expect(retried.delivered).toBe(1);
    expect(hq.size).toBe(1);
    expect(await read(job.id)).toMatchObject({ attempts: 2, receipt: hq.get(job.idempotencyKey), payload: job.payload });
  });

  it('claims at most 25 jobs with at most five concurrent requests', async () => {
    for (let i = 0; i < 28; i++) await seed();
    let concurrent = 0;
    let max = 0;
    const result = await run(async p => {
      concurrent++;
      max = Math.max(max, concurrent);
      await new Promise(resolve => setTimeout(resolve, 3));
      concurrent--;
      return receiptFor(p);
    });
    expect(result).toEqual({ claimed: 25, delivered: 25, deferred: 0, quarantined: 0 });
    expect(max).toBeLessThanOrEqual(5);
    expect(max).toBeGreaterThan(1);
    expect((await db.select().from(websiteDeliveryJobs).where(and(eq(websiteDeliveryJobs.orgId, org), eq(websiteDeliveryJobs.status, 'pending'))))).toHaveLength(3);
  });

  it('a completion database failure awaits sibling work and recovers the original HQ acceptance', async () => {
    const failedJob = await seed();
    const sibling = await seed();
    const acceptedByHq = new Map<string, WebsiteInquiryReceiptV1>();
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    let observedFailure!: () => void;
    const failureObserved = new Promise<void>(resolve => { observedFailure = resolve; });
    const pool = (db as any).$client;
    const query = pool.query.bind(pool);
    // Observe a genuine PostgreSQL failure, preserving the real query path.
    vi.spyOn(pool, 'query').mockImplementation((...args: any[]) => {
      const result = query(...args);
      if (!result || typeof result.catch !== 'function') return result;
      return result.catch((error: unknown) => { observedFailure(); throw error; });
    });
    await db.execute(sql.raw(`
      create function website.reject_c1_completion() returns trigger language plpgsql as $$
      begin
        if new.id = '${failedJob.id}'::uuid and new.status = 'delivered' then
          raise exception 'synthetic completion failure';
        end if;
        return new;
      end $$;
      create trigger reject_c1_completion before update on website.delivery_jobs
      for each row execute function website.reject_c1_completion();
    `));
    let settled = false;
    const running = run(async payload => {
      const receipt = receiptFor(payload);
      acceptedByHq.set(payload.idempotencyKey, receipt);
      if (payload.idempotencyKey === sibling.idempotencyKey) await gate;
      return receipt;
    }).then(() => { settled = true; }, () => { settled = true; });
    try {
      await failureObserved;
      await new Promise<void>(resolve => setImmediate(resolve));
      expect(settled).toBe(false);
    } finally {
      release();
      await running;
      await db.execute(sql.raw('drop trigger reject_c1_completion on website.delivery_jobs; drop function website.reject_c1_completion();'));
    }
    expect(await read(failedJob.id)).toMatchObject({ status: 'processing', attempts: 1, receipt: null });
    const recovered = await run(async payload => acceptedByHq.get(payload.idempotencyKey)!, new Date(now.getTime() + 60_001));
    expect(recovered.delivered).toBe(1);
    expect(acceptedByHq.size).toBe(2);
    expect(await read(failedJob.id)).toMatchObject({ status: 'delivered', attempts: 2, receipt: acceptedByHq.get(failedJob.idempotencyKey) });
  });

  it('isolates configured organization and ignores jobs before their due time', async () => {
    const ours = await seed();
    const other = await seed('lead', otherOrg);
    await db.update(websiteDeliveryJobs).set({ nextAttemptAt: new Date(now.getTime() + 1) }).where(eq(websiteDeliveryJobs.id, ours.id));
    expect((await run()).claimed).toBe(0);
    expect((await read(other.id)).status).toBe('pending');
    expect((await deliverHqBatch(db, accepted, now, { environment: {} })).claimed).toBe(0);
  });

  it('manual requeue only reschedules eligible pending jobs without resetting attempts or facts', async () => {
    const job = await seed();
    await db.update(websiteDeliveryJobs).set({ attempts: 4, nextAttemptAt: new Date(now.getTime() + 60_000) }).where(eq(websiteDeliveryJobs.id, job.id));
    expect(await reschedulePendingHqDelivery(db, job.id, { WEBSITE_ORG_ID: otherOrg }, now)).toBe(false);
    expect(await reschedulePendingHqDelivery(db, job.id, environment, now)).toBe(true);
    expect(await read(job.id)).toMatchObject({ attempts: 4, payload: job.payload, idempotencyKey: job.idempotencyKey, nextAttemptAt: now });
    for (const status of ['processing', 'delivered', 'quarantined']) {
      await db.update(websiteDeliveryJobs).set({ status }).where(eq(websiteDeliveryJobs.id, job.id));
      expect(await reschedulePendingHqDelivery(db, job.id, environment, now)).toBe(false);
    }
    await db.update(websiteDeliveryJobs).set({ status: 'pending', attempts: 10 }).where(eq(websiteDeliveryJobs.id, job.id));
    expect(await reschedulePendingHqDelivery(db, job.id, environment, now)).toBe(false);
  });

  it('worker shutdown awaits current delivery and prevents future polling', async () => {
    const job = await seed();
    let entered!: () => void;
    const started = new Promise<void>(resolve => { entered = resolve; });
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    const worker = startWebsiteHqWorker({
      db, runtime: 'persistent',
      environment: { ...environment, PEGASUS_ENABLE_HQ_DELIVERY_WORKER: 'true', PEGASUS_HQ_WEBSITE_INQUIRY_URL: 'https://hq.example.test/api/public/website-inquiries', PEGASUS_WEBSITE_INQUIRY_TOKEN: 'synthetic-only' },
      transport: async p => { entered(); await gate; return receiptFor(p); },
    });
    expect(worker.enabled).toBe(true);
    await started;
    let stopped = false;
    const stopping = worker.stop().then(() => { stopped = true; });
    await Promise.resolve();
    expect(stopped).toBe(false);
    release();
    await stopping;
    expect((await read(job.id)).status).toBe('delivered');
    expect(stopped).toBe(true);
    await worker.stop();
  });
});
