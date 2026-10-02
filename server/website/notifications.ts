import { randomUUID } from 'node:crypto';
import { and, asc, eq, gt, gte, inArray, isNull, lte, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { notificationOutbox } from '../../shared/website-schema';
import type { WebsiteRecordRef } from '../../shared/website-inquiry-contract';
import type { WebsiteDb } from './db';

type Environment = Record<string, string | undefined>;
const REQUEST_TIMEOUT_MS = 15_000;
const LEASE_MS = 60_000;
const CONCURRENCY = 5;
const MAX_ATTEMPTS = 10;
const POLL_MS = 5_000;
const BACKOFF_MS = [30_000, 120_000, 600_000, 3_600_000, 21_600_000];
const email = z.string().email().max(255);
const payloadSchema = z.object({
  to: email,
  subject: z.string().min(1).max(1_024).refine(value => !/[\r\n]/.test(value)),
  text: z.string().min(1).max(1_048_576),
}).strict();

export interface NotificationJob {
  id: string;
  orgId: string;
  idempotencyKey: string;
  websiteRecord: WebsiteRecordRef;
  purpose: 'staff' | 'receipt';
  payload: z.infer<typeof payloadSchema>;
}
export type NotificationOutcome =
  | { outcome: 'accepted'; providerMessageId: string }
  | { outcome: 'definitely_not_sent'; reason: string; retryable: boolean }
  | { outcome: 'ambiguous'; reason: string };
export type NotificationSender = ((job: NotificationJob, options: { signal: AbortSignal }) => Promise<NotificationOutcome>) & {
  /** A provider adapter checks this before the database assigns a sending lease. */
  isConfigured?: () => boolean;
};

function providerConfigured(environment: Environment): boolean {
  return Boolean(environment.SENDGRID_API_KEY?.trim())
    && !/[\r\n]/.test(environment.SENDGRID_API_KEY ?? '')
    && email.safeParse(environment.DEFAULT_FROM_EMAIL).success;
}

/**
 * SendGrid v3 Mail Send documents acceptance, not inbox delivery or a deduplication
 * key: https://www.twilio.com/docs/sendgrid/api-reference/mail-send/mail-send
 * custom_args correlates later evidence; it does not make a second send safe.
 */
export function createSendGridNotificationSender(
  environment: Environment = process.env,
  transport: typeof fetch = fetch,
): NotificationSender {
  // Snapshot configuration so the preflight and send use the same settings.
  const config = { ...environment };
  const sender: NotificationSender = async (job, { signal }) => {
    if (!providerConfigured(config)) {
      return { outcome: 'definitely_not_sent', reason: 'provider_configuration_missing', retryable: true };
    }
    try {
      const response = await transport('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        redirect: 'error',
        signal,
        headers: { Authorization: `Bearer ${config.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: job.payload.to }] }],
          from: { email: config.DEFAULT_FROM_EMAIL, name: 'Pegasus Dreamscapes' },
          subject: job.payload.subject,
          content: [{ type: 'text/plain', value: job.payload.text }],
          custom_args: { notification_job_id: job.id, notification_purpose: job.purpose },
        }),
      });
      // We need only status and correlation headers. Never log or persist a
      // provider response body, which may echo private message content.
      void response.body?.cancel().catch(() => {});
      const providerMessageId = response.headers.get('x-message-id');
      if (response.status === 202 && validMessageId(providerMessageId)) {
        return { outcome: 'accepted', providerMessageId: providerMessageId! };
      }
      if ([400, 401, 403, 404, 405, 413, 422, 429].includes(response.status)) {
        return { outcome: 'definitely_not_sent', reason: `provider_http_${response.status}`, retryable: response.status === 429 };
      }
      return { outcome: 'ambiguous', reason: 'provider_response_uncertain' };
    } catch {
      return { outcome: 'ambiguous', reason: 'provider_transport_uncertain' };
    }
  };
  sender.isConfigured = () => providerConfigured(config);
  return sender;
}

function validMessageId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 512 && !/[\x00-\x1f\x7f]/.test(value);
}

function safeReason(value: string): string {
  // Even injected adapters cannot accidentally retain a recipient or exception.
  return /^(provider_http_(400|401|403|404|405|413|422|429)|provider_configuration_missing|provider_response_uncertain|provider_transport_uncertain|provider_timeout|invalid_sender_outcome)$/.test(value)
    ? value : 'provider_response_uncertain';
}

async function attemptNotification(job: NotificationJob, sender: NotificationSender): Promise<NotificationOutcome> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const outcome = await Promise.race([
      Promise.resolve().then(() => sender(job, { signal: controller.signal })),
      new Promise<NotificationOutcome>(resolve => {
        timeout = setTimeout(() => {
          controller.abort();
          resolve({ outcome: 'ambiguous', reason: 'provider_timeout' });
        }, REQUEST_TIMEOUT_MS);
      }),
    ]);
    if (outcome?.outcome === 'accepted' && validMessageId(outcome.providerMessageId)) return outcome;
    if (outcome?.outcome === 'definitely_not_sent' && typeof outcome.retryable === 'boolean' && typeof outcome.reason === 'string') {
      return { ...outcome, reason: safeReason(outcome.reason) };
    }
    if (outcome?.outcome === 'ambiguous' && typeof outcome.reason === 'string') {
      return { outcome: 'ambiguous', reason: safeReason(outcome.reason) };
    }
    return { outcome: 'ambiguous', reason: 'invalid_sender_outcome' };
  } catch {
    return { outcome: 'ambiguous', reason: 'provider_transport_uncertain' };
  } finally {
    clearTimeout(timeout);
  }
}

export async function dispatchNotification(job: NotificationJob, sender: NotificationSender): Promise<'accepted' | 'deferred' | 'needs_reconciliation'> {
  const result = await attemptNotification(job, sender);
  return result.outcome === 'accepted' ? 'accepted'
    : result.outcome === 'definitely_not_sent' ? 'deferred' : 'needs_reconciliation';
}

function isPreview(environment: Environment): boolean {
  return [environment.APP_ENV, environment.VERCEL_ENV].some(value => value?.trim().toLowerCase() === 'preview');
}

export function shouldStartNotificationWorker(runtime: string, environment: Environment): boolean {
  return runtime === 'persistent'
    && environment.PEGASUS_ENABLE_NOTIFICATION_WORKER === 'true'
    && z.string().uuid().safeParse(environment.WEBSITE_ORG_ID).success
    && (!isPreview(environment) || environment.PEGASUS_PREVIEW_ENABLE_NOTIFICATIONS === 'true');
}

export function isNotificationRecipientAllowed(recipient: string, environment: Environment): boolean {
  if (!email.safeParse(recipient).success) return false;
  const vercelEnvironment = environment.VERCEL_ENV?.trim().toLowerCase();
  if (environment.APP_ENV === 'production' && (!vercelEnvironment || vercelEnvironment === 'production')) return true;
  const allowed = (environment.PEGASUS_NOTIFICATION_ALLOWED_RECIPIENTS ?? '').split(',')
    .map(value => value.trim().toLowerCase()).filter(value => email.safeParse(value).success);
  return allowed.includes(recipient.toLowerCase());
}

export interface NotificationBatchResult {
  claimed: number;
  accepted: number;
  deferred: number;
  blocked: number;
  needsReconciliation: number;
  stale: number;
}

export async function dispatchNotificationBatch(
  db: WebsiteDb,
  sender: NotificationSender,
  now: Date = new Date(),
  options: { environment?: Environment; clock?: () => Date } = {},
): Promise<NotificationBatchResult> {
  const environment = options.environment ?? process.env;
  const clock = options.clock ?? (() => new Date());
  const result: NotificationBatchResult = { claimed: 0, accepted: 0, deferred: 0, blocked: 0, needsReconciliation: 0, stale: 0 };
  const org = z.string().uuid().safeParse(environment.WEBSITE_ORG_ID);
  if (!org.success || sender.isConfigured?.() === false) return result;
  const table = notificationOutbox;
  // A crash after transmission cannot establish whether the provider accepted.
  // Recovery always stops for reconciliation instead of sending another email.
  const expired = await db.update(table).set({
    status: 'needs_reconciliation', leaseToken: null, leaseExpiresAt: null,
    lastError: 'sending_lease_expired', updatedAt: now,
  }).where(and(eq(table.orgId, org.data), eq(table.status, 'sending'), or(lte(table.leaseExpiresAt, now), isNull(table.leaseExpiresAt))))
    .returning({ id: table.id });
  result.needsReconciliation = expired.length;

  const exhausted = await db.update(table).set({ status: 'blocked', lastError: 'retry_limit_reached', updatedAt: now })
    .where(and(eq(table.orgId, org.data), inArray(table.status, ['pending', 'retry']), gte(table.attempts, MAX_ATTEMPTS)))
    .returning({ id: table.id });
  result.blocked += exhausted.length;

  // Claim only work that can start concurrently. Claiming 25 and then queuing
  // behind five 15-second sends would age the later leases before their send.
  const jobs = await db.transaction(async tx => {
    const rows = await tx.select().from(table)
      .where(and(eq(table.orgId, org.data), inArray(table.status, ['pending', 'retry']), lte(table.nextAttemptAt, now)))
      .orderBy(asc(table.nextAttemptAt), asc(table.id)).limit(CONCURRENCY).for('update', { skipLocked: true });
    const claimed: Array<{ row: typeof table.$inferSelect; job: NotificationJob }> = [];
    result.claimed = rows.length;
    for (const row of rows) {
      const parsed = payloadSchema.safeParse(row.payload);
      const validPurpose = row.purpose === 'staff' || row.purpose === 'receipt';
      const lastError = !parsed.success || !validPurpose ? 'invalid_notification_payload'
        : !isNotificationRecipientAllowed(parsed.data.to, environment) ? 'recipient_not_allowlisted' : null;
      if (lastError) {
        await tx.update(table).set({ status: 'blocked', lastError, updatedAt: now }).where(eq(table.id, row.id));
        result.blocked++;
        continue;
      }
      const [leased] = await tx.update(table).set({
        status: 'sending', leaseToken: randomUUID(), leaseExpiresAt: new Date(now.getTime() + LEASE_MS),
        attempts: sql`${table.attempts} + 1`, lastAttemptAt: now, lastError: null, updatedAt: now,
      }).where(eq(table.id, row.id)).returning();
      claimed.push({ row: leased, job: {
        id: row.id, orgId: row.orgId, idempotencyKey: row.idempotencyKey,
        websiteRecord: row.recordType === 'opportunity' ? { type: 'opportunity', id: row.opportunityId! } : { type: 'lead', id: row.leadId! },
        purpose: row.purpose as NotificationJob['purpose'], payload: parsed.data!,
      } });
    }
    return claimed;
  });

  // A failure to persist an outcome leaves the sending lease intact. On recovery
  // it will require reconciliation, preserving safety even after acceptance.
  const completions = await Promise.allSettled(jobs.map(async ({ row, job }) => {
    const outcome = await attemptNotification(job, sender);
    const completedAt = clock();
    let update: Partial<typeof table.$inferInsert>;
    let counter: 'accepted' | 'deferred' | 'blocked' | 'needsReconciliation';
    if (outcome.outcome === 'accepted') {
      update = { status: 'accepted', acceptedAt: completedAt, providerMessageId: outcome.providerMessageId };
      counter = 'accepted';
    } else if (outcome.outcome === 'ambiguous') {
      update = { status: 'needs_reconciliation', lastError: outcome.reason };
      counter = 'needsReconciliation';
    } else if (!outcome.retryable || row.attempts >= MAX_ATTEMPTS) {
      update = { status: 'blocked', lastError: row.attempts >= MAX_ATTEMPTS ? 'retry_limit_reached' : outcome.reason };
      counter = 'blocked';
    } else {
      update = { status: 'retry', lastError: outcome.reason, nextAttemptAt: new Date(completedAt.getTime() + BACKOFF_MS[Math.min(row.attempts - 1, BACKOFF_MS.length - 1)]) };
      counter = 'deferred';
    }
    const completed = await db.update(table).set({ ...update, leaseToken: null, leaseExpiresAt: null, updatedAt: completedAt })
      .where(and(eq(table.orgId, org.data), eq(table.id, row.id), eq(table.status, 'sending'), eq(table.leaseToken, row.leaseToken!), gt(table.leaseExpiresAt, completedAt)))
      .returning({ id: table.id });
    if (completed.length) result[counter]++;
    else result.stale++;
  }));
  // Wait for every already-started attempt before reporting a database failure.
  if (completions.some(completion => completion.status === 'rejected')) throw new Error('Notification outcome persistence failed');
  return result;
}

export function startNotificationWorker(db: WebsiteDb, options: {
  runtime: string;
  environment: Environment;
  sender?: NotificationSender;
}): { enabled: boolean; stop(): Promise<void> } {
  const environment = { ...options.environment };
  const sender = options.sender ?? createSendGridNotificationSender(environment);
  if (!shouldStartNotificationWorker(options.runtime, environment) || sender.isConfigured?.() === false) {
    return { enabled: false, stop: async () => {} };
  }
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running: Promise<void>;
  const tick = async () => {
    if (stopped) return;
    try {
      await dispatchNotificationBatch(db, sender, new Date(), { environment });
    } catch {
      console.error('[website notifications] batch failed; queued state retained');
    } finally {
      if (!stopped) {
        timer = setTimeout(() => { running = tick(); }, POLL_MS);
        timer.unref();
      }
    }
  };
  running = Promise.resolve().then(tick);
  return {
    enabled: true,
    async stop() { stopped = true; clearTimeout(timer); await running; },
  };
}
