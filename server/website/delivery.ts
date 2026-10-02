import { randomUUID } from 'node:crypto';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { websiteDeliveryJobs } from '../../shared/website-schema';
import {
  websiteInquiryEnvelopeSchema,
  websiteInquiryReceiptSchema,
  type WebsiteInquiryEnvelopeV1,
  type WebsiteInquiryReceiptV1,
  type WebsiteRecordRef,
} from '../../shared/website-inquiry-contract';
import { getConfiguredWebsiteHqEndpoint, type HqEnvironment } from '../integrations/hq-config';
import type { WebsiteDb } from './db';

const MAX_BATCH = 25;
const MAX_CONCURRENCY = 5;
const MAX_ATTEMPTS = 10;
const LEASE_MS = 60_000;
const REQUEST_TIMEOUT_MS = 15_000;
const POLL_INTERVAL_MS = 30_000;
const RETRY_DELAYS_MS = [30_000, 120_000, 600_000, 3_600_000, 21_600_000];

export type HqTransport = (
  payload: WebsiteInquiryEnvelopeV1,
  options?: { signal: AbortSignal },
) => Promise<WebsiteInquiryReceiptV1>;

export interface HqBatchResult {
  claimed: number;
  delivered: number;
  deferred: number;
  quarantined: number;
}

export class HqHttpError extends Error {
  constructor(readonly status: number) {
    super(`hq_http_${status}`);
    this.name = 'HqHttpError';
  }
}

class InvalidHqReceiptError extends Error {
  constructor() { super('invalid_hq_receipt'); }
}

class HqTimeoutError extends Error {
  constructor() { super('hq_request_timeout'); }
}

function configuredOrg(environment: HqEnvironment): string | null {
  const parsed = z.string().uuid().safeParse(environment.WEBSITE_ORG_ID?.trim());
  return parsed.success ? parsed.data : null;
}

/** Missing configuration cannot consume a job attempt or fall back to legacy HQ. */
export function createWebsiteHqTransport(
  environment: HqEnvironment = process.env,
  fetcher: typeof fetch = fetch,
): HqTransport | null {
  const endpoint = getConfiguredWebsiteHqEndpoint(environment);
  const token = environment.PEGASUS_WEBSITE_INQUIRY_TOKEN?.trim();
  if (!endpoint || !token || /[\r\n]/.test(token)) return null;
  const bypassToken = environment.PEGASUS_HQ_DEPLOYMENT_BYPASS_TOKEN;
  if (bypassToken) {
    if (!bypassToken.trim() || /[\r\n]/.test(bypassToken)) return null;
    const approvedOrigin = environment.PEGASUS_HQ_DEPLOYMENT_BYPASS_ORIGIN;
    // Exact canonical origin equality excludes credentials, paths, query/hash,
    // whitespace and alternate hosts/ports. Never expand approval to wildcards.
    if (!approvedOrigin || approvedOrigin.includes('*') || approvedOrigin !== new URL(endpoint).origin) return null;
  }

  return async (payload, options) => {
    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(bypassToken ? { 'x-vercel-protection-bypass': bypassToken } : {}),
      },
      body: JSON.stringify(payload),
      signal: options?.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      // Never forward the transport credential or private envelope to a redirect.
      redirect: 'error',
    });
    if (!response.ok) throw new HqHttpError(response.status);
    try {
      return await response.json() as WebsiteInquiryReceiptV1;
    } catch {
      throw new InvalidHqReceiptError();
    }
  };
}

function sameRecord(left: WebsiteRecordRef, right: WebsiteRecordRef): boolean {
  return left.type === right.type && left.id === right.id;
}

async function requestReceipt(transport: HqTransport, payload: WebsiteInquiryEnvelopeV1): Promise<WebsiteInquiryReceiptV1> {
  const expectedKey = payload.idempotencyKey;
  const expectedRecord = { ...payload.websiteRecord };
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      // Reject before abort listeners settle so timeouts have one safe error code.
      reject(new HqTimeoutError());
      controller.abort();
    }, REQUEST_TIMEOUT_MS);
  });
  try {
    const raw = await Promise.race([
      Promise.resolve().then(() => transport(payload, { signal: controller.signal })),
      timeout,
    ]);
    const parsed = websiteInquiryReceiptSchema.safeParse(raw);
    if (!parsed.success || parsed.data.idempotencyKey !== expectedKey || !sameRecord(parsed.data.websiteRecord, expectedRecord)) {
      throw new InvalidHqReceiptError();
    }
    return parsed.data;
  } finally {
    clearTimeout(timer);
  }
}

interface ClaimedJob extends Record<string, unknown> {
  id: string;
  orgId: string;
  idempotencyKey: string;
  recordType: string;
  opportunityId: string | null;
  leadId: number | null;
  payload: unknown;
  attempts: number;
  priorAttempts: number;
  leaseToken: string;
}

async function claimJobs(db: WebsiteDb, orgId: string, dueAt: Date, claimedAt: Date, limit: number, alreadyClaimed: string[]): Promise<ClaimedJob[]> {
  // One statement owns each claim atomically. Five fresh leases at a time keep
  // the last requests in a 25-job batch from waiting behind four timeouts.
  const result = await db.execute<ClaimedJob>(sql`
    with ready as (
      select id, attempts as prior_attempts
      from website.delivery_jobs
      where org_id = ${orgId}::uuid and not (id = any(${sql.param(alreadyClaimed)}::uuid[])) and (
        (status = 'pending' and next_attempt_at <= ${dueAt}) or
        (status = 'processing' and (lease_expires_at is null or lease_expires_at <= ${claimedAt}))
      )
      order by next_attempt_at, created_at, id
      for update skip locked
      limit ${limit}
    )
    update website.delivery_jobs as job
    set status = 'processing', attempts = least(job.attempts + 1, ${MAX_ATTEMPTS}),
        lease_token = ${randomUUID()}::uuid, lease_expires_at = ${new Date(claimedAt.getTime() + LEASE_MS)},
        last_attempt_at = ${claimedAt}, updated_at = ${claimedAt}
    from ready where job.id = ready.id
    returning job.id, job.org_id as "orgId", job.idempotency_key as "idempotencyKey",
      job.record_type as "recordType", job.opportunity_id as "opportunityId", job.lead_id as "leadId",
      job.payload, job.attempts, ready.prior_attempts as "priorAttempts", job.lease_token as "leaseToken"
  `);
  return result.rows;
}

type Completion = {
  status: 'delivered' | 'pending' | 'quarantined';
  lastError: string | null;
  receipt?: WebsiteInquiryReceiptV1;
  deliveredAt?: Date;
  nextAttemptAt?: Date;
};

async function completeJob(db: WebsiteDb, job: ClaimedJob, completedAt: Date, outcome: Completion): Promise<boolean> {
  const updated = await db.update(websiteDeliveryJobs).set({
    ...outcome, leaseToken: null, leaseExpiresAt: null, updatedAt: completedAt,
  }).where(and(
    eq(websiteDeliveryJobs.id, job.id),
    eq(websiteDeliveryJobs.orgId, job.orgId),
    eq(websiteDeliveryJobs.status, 'processing'),
    eq(websiteDeliveryJobs.leaseToken, job.leaseToken),
    gt(websiteDeliveryJobs.leaseExpiresAt, completedAt),
  )).returning({ id: websiteDeliveryJobs.id });
  return updated.length === 1;
}

function validJobPayload(job: ClaimedJob): WebsiteInquiryEnvelopeV1 | null {
  const parsed = websiteInquiryEnvelopeSchema.safeParse(job.payload);
  if (!parsed.success || parsed.data.idempotencyKey !== job.idempotencyKey) return null;
  const record = parsed.data.websiteRecord;
  if (record.type !== job.recordType) return null;
  if (record.type === 'opportunity' && (record.id !== job.opportunityId || job.leadId !== null)) return null;
  if (record.type === 'lead' && (record.id !== job.leadId || job.opportunityId !== null)) return null;
  return parsed.data;
}

function classifyFailure(error: unknown): { permanent: boolean; reason: string } {
  if (error instanceof InvalidHqReceiptError) return { permanent: true, reason: 'invalid_hq_receipt' };
  if (error instanceof HqHttpError) {
    const retryable = error.status === 408 || error.status === 429 || (error.status >= 500 && error.status < 600);
    return { permanent: !retryable, reason: `hq_http_${error.status}` };
  }
  return { permanent: false, reason: error instanceof HqTimeoutError ? 'hq_request_timeout' : 'hq_transport_uncertain' };
}

export async function deliverHqBatch(
  db: WebsiteDb,
  transport: HqTransport | null,
  now: Date,
  options: { environment?: HqEnvironment; clock?: () => Date } = {},
): Promise<HqBatchResult> {
  const counts: HqBatchResult = { claimed: 0, delivered: 0, deferred: 0, quarantined: 0 };
  const orgId = configuredOrg(options.environment ?? process.env);
  if (!transport || !orgId) return counts;
  const startedAt = Date.now();
  const clock = options.clock ?? (() => new Date(now.getTime() + Date.now() - startedAt));
  const alreadyClaimed: string[] = [];

  while (counts.claimed < MAX_BATCH) {
    const jobs = await claimJobs(db, orgId, now, clock(), Math.min(MAX_CONCURRENCY, MAX_BATCH - counts.claimed), alreadyClaimed);
    if (jobs.length === 0) break;
    counts.claimed += jobs.length;
    alreadyClaimed.push(...jobs.map(job => job.id));
    const completed = await Promise.allSettled(jobs.map(async job => {
      const payload = validJobPayload(job);
      if (job.priorAttempts >= MAX_ATTEMPTS || !payload) {
        const changed = await completeJob(db, job, clock(), {
          status: 'quarantined', lastError: job.priorAttempts >= MAX_ATTEMPTS ? 'retry_limit_reached' : 'invalid_hq_payload',
        });
        if (changed) counts.quarantined++;
        else counts.deferred++;
        return;
      }

      let receipt: WebsiteInquiryReceiptV1;
      try {
        receipt = await requestReceipt(transport, payload);
      } catch (error) {
        const failure = classifyFailure(error);
        const completedAt = clock();
        const quarantined = failure.permanent || job.attempts >= MAX_ATTEMPTS;
        const changed = await completeJob(db, job, completedAt, quarantined ? {
          status: 'quarantined', lastError: !failure.permanent && job.attempts >= MAX_ATTEMPTS ? 'retry_limit_reached' : failure.reason,
        } : {
          status: 'pending', lastError: failure.reason,
          nextAttemptAt: new Date(completedAt.getTime() + RETRY_DELAYS_MS[Math.min(job.attempts - 1, RETRY_DELAYS_MS.length - 1)]),
        });
        if (changed && quarantined) counts.quarantined++;
        else counts.deferred++;
        return;
      }
      const completedAt = clock();
      const changed = await completeJob(db, job, completedAt, { status: 'delivered', lastError: null, receipt, deliveredAt: completedAt });
      if (changed) counts.delivered++;
      else counts.deferred++;
    }));
    // A database failure must not let shutdown or the next poll outrun other
    // transports in this wave. Their leases still protect eventual recovery.
    const failed = completed.find(result => result.status === 'rejected');
    if (failed?.status === 'rejected') throw failed.reason;
  }
  return counts;
}

/** An operator can accelerate a safe retry, never revive a quarantined attempt. */
export async function reschedulePendingHqDelivery(
  db: WebsiteDb,
  jobId: string,
  environment: HqEnvironment = process.env,
  now: Date = new Date(),
): Promise<boolean> {
  const orgId = configuredOrg(environment);
  if (!orgId || !z.string().uuid().safeParse(jobId).success) return false;
  const rows = await db.update(websiteDeliveryJobs).set({ nextAttemptAt: now, updatedAt: now }).where(and(
    eq(websiteDeliveryJobs.id, jobId), eq(websiteDeliveryJobs.orgId, orgId),
    eq(websiteDeliveryJobs.status, 'pending'), lt(websiteDeliveryJobs.attempts, MAX_ATTEMPTS),
  )).returning({ id: websiteDeliveryJobs.id });
  return rows.length === 1;
}

export function shouldStartWebsiteHqWorker(runtime: 'persistent' | 'serverless', environment: HqEnvironment = process.env): boolean {
  const preview = environment.APP_ENV?.trim().toLowerCase() === 'preview' || environment.VERCEL_ENV?.trim().toLowerCase() === 'preview';
  return runtime === 'persistent'
    && environment.PEGASUS_ENABLE_HQ_DELIVERY_WORKER === 'true'
    && (!preview || environment.PEGASUS_PREVIEW_ENABLE_HQ_RECOVERY === 'true')
    && configuredOrg(environment) !== null
    && createWebsiteHqTransport(environment) !== null;
}

export function startWebsiteHqWorker(options: {
  db: WebsiteDb;
  runtime: 'persistent' | 'serverless';
  environment?: HqEnvironment;
  transport?: HqTransport;
}): { enabled: boolean; stop(): Promise<void> } {
  // Capture one deployment's organization/configuration for the worker lifetime.
  const environment = { ...(options.environment ?? process.env) };
  if (!shouldStartWebsiteHqWorker(options.runtime, environment)) return { enabled: false, stop: async () => {} };
  const transport = options.transport ?? createWebsiteHqTransport(environment)!;
  let stopped = false;
  let inFlight: Promise<void> | null = null;
  const run = () => {
    if (stopped || inFlight) return;
    inFlight = deliverHqBatch(options.db, transport, new Date(), { environment })
      .then(() => {})
      .catch(() => {
        // Never print database errors, transport errors, credentials or payloads.
        console.error('[website-hq] delivery batch failed; leased jobs remain recoverable');
      })
      .finally(() => { inFlight = null; });
  };
  const timer = setInterval(run, POLL_INTERVAL_MS);
  timer.unref?.();
  run();
  return {
    enabled: true,
    async stop() {
      stopped = true;
      clearInterval(timer);
      await inFlight;
    },
  };
}
