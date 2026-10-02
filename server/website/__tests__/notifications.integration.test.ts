import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { and, eq, sql } from 'drizzle-orm';
import { notificationOutbox, opportunities, intakeRequests } from '../../../shared/website-schema';
import { assertWebsiteTestTarget } from '../../../scripts/website-db-test-target.mjs';
import { createWebsiteDb, type WebsiteDb } from '../db';
import { dispatchNotificationBatch, createSendGridNotificationSender, type NotificationSender } from '../notifications';

const org = 'c2000000-0000-4000-8000-000000000010';
const now = new Date('2026-10-02T03:00:00.000Z');
const environment = { APP_ENV: 'preview', WEBSITE_ORG_ID: org, PEGASUS_NOTIFICATION_ALLOWED_RECIPIENTS: 'synthetic@example.test' };
const accepted: NotificationSender = async () => ({ outcome: 'accepted', providerMessageId: 'synthetic-message' });
describe.skipIf(process.env.WEBSITE_DB_TESTS !== '1')('durable notification PostgreSQL proof', () => {
  let db: WebsiteDb;
  let close: () => Promise<void>;
  beforeAll(() => { ({ db, close } = createWebsiteDb(assertWebsiteTestTarget(process.env.WEBSITE_TEST_DATABASE_URL))); });
  const clean = async () => {
    for (const table of ['notification_outbox', 'intake_requests', 'opportunities']) {
      await db.execute(sql`delete from website.${sql.identifier(table)} where org_id = ${org}::uuid`);
    }
  };
  beforeEach(clean);
  afterAll(async () => { if (db) { await clean(); await close(); } });
  async function seed(purposes: Array<'staff'|'receipt'> = ['receipt']) {
    const idempotencyKey = randomUUID();
    const [record] = await db.insert(opportunities).values({ orgId: org, visitorType: 'other', contactName: 'Synthetic', email: 'synthetic@example.test' }).returning();
    await db.insert(intakeRequests).values({ orgId: org, idempotencyKey, kind: 'opportunity', opportunityId: record.id, payloadHash: 'a'.repeat(64) });
    return db.insert(notificationOutbox).values(purposes.map(purpose => ({ orgId: org, idempotencyKey, recordType: 'opportunity', opportunityId: record.id, purpose, payload: { to: 'synthetic@example.test', subject: 'Synthetic receipt', text: '<script>private</script>' }, nextAttemptAt: now }))).returning();
  }
  const run = (sender: NotificationSender = accepted, date = now, clock?: () => Date) => dispatchNotificationBatch(db, sender, date, { environment, clock: clock ?? (() => date) });
  const read = async (id: string) => (await db.select().from(notificationOutbox).where(and(eq(notificationOutbox.orgId, org), eq(notificationOutbox.id, id))))[0];

  it('one_job_per_purpose with separate acceptance and no claimed inbox delivery', async () => {
    const jobs = await seed(['staff', 'receipt']);
    await expect(db.insert(notificationOutbox).values({ ...jobs[0], id: randomUUID() })).rejects.toThrow();
    expect(await run()).toMatchObject({ claimed: 2, accepted: 2, needsReconciliation: 0 });
    for (const job of jobs) {
      expect(await read(job.id)).toMatchObject({ status: 'accepted', attempts: 1, providerMessageId: 'synthetic-message', acceptedAt: now, deliveredAt: null, leaseToken: null });
    }
  });

  it('two_workers_one_claim never invokes the sender twice', async () => {
    const [job] = await seed();
    let sends = 0;
    const sender: NotificationSender = async () => { sends++; await new Promise(resolve => setTimeout(resolve, 30)); return { outcome: 'accepted', providerMessageId: 'synthetic-message' }; };
    const results = await Promise.all([run(sender), run(sender)]);
    expect(results.reduce((n, result) => n + result.accepted, 0)).toBe(1);
    expect(sends).toBe(1);
    expect((await read(job.id)).attempts).toBe(1);
  });

  it('ambiguous_send_is_not_resent across batches and database reconnection', async () => {
    const [job] = await seed();
    await run(async () => ({ outcome: 'ambiguous', reason: 'provider_transport_uncertain' }));
    await close();
    ({ db, close } = createWebsiteDb(assertWebsiteTestTarget(process.env.WEBSITE_TEST_DATABASE_URL)));
    let sends = 0;
    await run(async () => { sends++; return { outcome: 'accepted', providerMessageId: 'unexpected' }; }, new Date(now.getTime() + 86_400_000));
    expect(sends).toBe(0);
    expect(await read(job.id)).toMatchObject({ status: 'needs_reconciliation', attempts: 1, acceptedAt: null, deliveredAt: null });
  });

  it('definite_failure_retries only after persisted backoff', async () => {
    const [job] = await seed();
    await run(async () => ({ outcome: 'definitely_not_sent', reason: 'provider_http_429', retryable: true }));
    expect(await read(job.id)).toMatchObject({ status: 'retry', attempts: 1, nextAttemptAt: new Date(now.getTime() + 30_000) });
    expect((await run(accepted, new Date(now.getTime() + 29_999))).claimed).toBe(0);
    expect((await run(accepted, new Date(now.getTime() + 30_000))).accepted).toBe(1);
    expect((await read(job.id)).attempts).toBe(2);
  });

  it('permanent rejection and exhausted retries remain blocked for review', async () => {
    const [job] = await seed();
    await run(async () => ({ outcome: 'definitely_not_sent', reason: 'provider_http_403', retryable: false }));
    expect((await read(job.id)).status).toBe('blocked');
    await db.update(notificationOutbox).set({ status: 'retry', attempts: 9 }).where(eq(notificationOutbox.id, job.id));
    await run(async () => ({ outcome: 'definitely_not_sent', reason: 'provider_http_429', retryable: true }));
    expect(await read(job.id)).toMatchObject({ status: 'blocked', attempts: 10, lastError: 'retry_limit_reached' });
  });

  it('expired sending leases require reconciliation instead of being resent', async () => {
    const [job] = await seed();
    await db.update(notificationOutbox).set({ status: 'sending', attempts: 1, leaseToken: randomUUID(), leaseExpiresAt: now }).where(eq(notificationOutbox.id, job.id));
    let sends = 0;
    expect(await run(async () => { sends++; return { outcome: 'accepted', providerMessageId: 'unexpected' }; })).toMatchObject({ claimed: 0, needsReconciliation: 1 });
    expect(sends).toBe(0);
    expect((await read(job.id)).status).toBe('needs_reconciliation');
  });

  it('stale_worker_cannot_complete after lease recovery', async () => {
    const [job] = await seed();
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    let entered!: () => void;
    const started = new Promise<void>(resolve => { entered = resolve; });
    const pending = run(async () => { entered(); await gate; return { outcome: 'accepted', providerMessageId: 'late-message' }; });
    await started;
    await run(accepted, new Date(now.getTime() + 60_001));
    release();
    expect(await pending).toMatchObject({ accepted: 0, stale: 1 });
    expect(await read(job.id)).toMatchObject({ status: 'needs_reconciliation', providerMessageId: null });
  });

  it('acceptance arriving after lease expiry cannot complete even without a competing worker', async () => {
    const [job] = await seed();
    let clock = now;
    const result = await run(async () => { clock = new Date(now.getTime() + 60_001); return { outcome: 'accepted', providerMessageId: 'late-message' }; }, now, () => clock);
    expect(result.accepted).toBe(0);
    expect((await read(job.id)).status).not.toBe('accepted');
    await run(accepted, clock);
    expect((await read(job.id)).status).toBe('needs_reconciliation');
  });

  it('staging_recipient_not_allowlisted_blocked and immutable original payload retained', async () => {
    const [job] = await seed();
    let sends = 0;
    const result = await dispatchNotificationBatch(db, async () => { sends++; return { outcome: 'accepted', providerMessageId: 'unexpected' }; }, now, { environment: { ...environment, PEGASUS_NOTIFICATION_ALLOWED_RECIPIENTS: '' }, clock: () => now });
    expect(result.blocked).toBe(1);
    expect(sends).toBe(0);
    expect(await read(job.id)).toMatchObject({ status: 'blocked', payload: job.payload, lastError: 'recipient_not_allowlisted' });
  });

  it('invalid queued payload is blocked and never interpreted as HTML', async () => {
    const [job] = await seed();
    await db.update(notificationOutbox).set({ payload: { to: 'synthetic@example.test', subject: 's', html: '<script>private</script>' } }).where(eq(notificationOutbox.id, job.id));
    const sender = vi.fn(accepted);
    expect((await run(sender)).blocked).toBe(1);
    expect(sender).not.toHaveBeenCalled();
    expect((await read(job.id)).lastError).toBe('invalid_notification_payload');
  });

  it('missing provider configuration leaves pending jobs unclaimed', async () => {
    const [job] = await seed();
    const transport = vi.fn();
    expect((await run(createSendGridNotificationSender({}, transport))).claimed).toBe(0);
    expect(transport).not.toHaveBeenCalled();
    expect(await read(job.id)).toMatchObject({ status: 'pending', attempts: 0, leaseToken: null });
  });

  it('a batch starts at most five concurrent attempts without aging waiting leases', async () => {
    for (let i = 0; i < 8; i++) await seed();
    let active = 0; let maximum = 0;
    const result = await run(async () => {
      active++; maximum = Math.max(maximum, active);
      await new Promise(resolve => setTimeout(resolve, 20));
      active--;
      return { outcome: 'accepted', providerMessageId: 'synthetic-message' };
    });
    expect(result.claimed).toBe(5);
    expect(result.accepted).toBe(5);
    expect(maximum).toBeLessThanOrEqual(5);
    expect((await run()).accepted).toBe(3);
  });

  it('claims are scoped to the configured organization', async () => {
    const [job] = await seed();
    const result = await dispatchNotificationBatch(db, accepted, now, { environment: { ...environment, WEBSITE_ORG_ID: randomUUID() }, clock: () => now });
    expect(result.claimed).toBe(0);
    expect((await read(job.id)).status).toBe('pending');
  });
});
