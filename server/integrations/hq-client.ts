import { randomUUID } from "crypto";
import { storage } from "../storage";
import {
  getConfiguredHqEndpoint,
  type HqEnvironment,
} from "./hq-config";

export { hasRequiredHqEndpointConfiguration } from "./hq-config";

// =========================================================================
// Task #153 — Pegasus HQ forwarding client.
//
// Single source of truth for "every website capture lands in Pegasus HQ."
// Contract per replit.md (ratified — supersedes the original task spec
// which called for HMAC; replit.md explicitly says "No HMAC in v1"):
//
//   - Endpoint:  PEGASUS_HQ_PUBLIC_INTAKE_URL
//   - Health:    derived from the endpoint host + /api/health
//   - Auth:      none in v1 (intake is public; idempotency key + payload
//                shape are the contract)
//   - Payload contract (locked with HQ agent):
//                propertyAddress, contactName, outreachReason,
//                sourceChannel, consentContact, consentCcpaAcknowledged,
//                idempotencyKey
//   - leadType → outreachReason mapping (also from replit.md):
//                submit            => property_review
//                vendor            => vendor_application
//                buybox_interest   => buybox_interest
//                blueprint_request => paid_blueprint_request
//                peggy_note        => peggy_inbound
//                peggy_notify      => peggy_inbound  (public Peggy widget
//                                                      while Peggy is in
//                                                      private training)
//
// Outbox-first design: every payload is written to hq_outbox BEFORE the
// network call. If forwarding succeeds, we mark forwarded + write the
// HQ submission id back onto the originating row. If it fails (5xx, net
// error, timeout), the row stays "pending" and a periodic drain or an
// admin retry click pushes it through. 4xx failures mark the row
// "failed" (don't retry validation errors).
//
// The site NEVER blocks on HQ availability — forward() is called fire-
// and-forget from the request path.
// =========================================================================

function endpointUrl(
  environment: HqEnvironment = process.env,
): string | null {
  return getConfiguredHqEndpoint(environment);
}

function healthUrl(): string | null {
  const endpoint = endpointUrl();
  if (!endpoint) return null;
  const url = new URL(endpoint);
  return `${url.protocol}//${url.host}/api/health`;
}

// Surface tags identify which website capture produced the payload.
export type HqSurface =
  | "lead"
  | "peggy"
  | "vendor"
  | "buybox"
  | "cta_batch";

// Canonical HQ payload shape. `extra` carries surface-specific metadata
// (e.g. lead leadData, peggy intake JSON) under a single key so the
// contract stays narrow.
export interface HqPayload {
  propertyAddress?: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  outreachReason: string;
  sourceChannel: string;
  consentContact: boolean;
  consentCcpaAcknowledged: boolean;
  idempotencyKey: string;
  extra?: Record<string, unknown>;
}

export interface HqResponse {
  hq_submission_id?: string;
  received_at?: string;
  next_step?: string;
}

const LEAD_TYPE_TO_REASON: Record<string, string> = {
  submit: "property_review",
  seller: "property_review",
  vendor: "vendor_application",
  buybox_interest: "buybox_interest",
  blueprint_request: "paid_blueprint_request",
  peggy_note: "peggy_inbound",
  peggy_notify: "peggy_inbound",
  investor: "capital_inquiry",
  buyer: "buyer_inquiry",
  contact: "general_inquiry",
  marketflow_access: "marketflow_access_request",
};

export function outreachReasonForLeadType(leadType: string): string {
  return LEAD_TYPE_TO_REASON[leadType] || "general_inquiry";
}

// =========================================================================
// Health probe cache. We don't ping HQ on every request — we cache the
// last-known health for 60s and auto-flip from no-op outbox to live
// forwarding when HQ returns 200 (no redeploy needed, per replit.md).
// =========================================================================

let healthCache: {
  endpoint: string | null;
  ok: boolean;
  checkedAt: number;
} | null = null;
const HEALTH_TTL_MS = 60_000;

async function checkHealth(): Promise<boolean> {
  const now = Date.now();
  const endpoint = healthUrl();
  if (
    healthCache &&
    healthCache.endpoint === endpoint &&
    now - healthCache.checkedAt < HEALTH_TTL_MS
  ) {
    return healthCache.ok;
  }
  if (!endpoint) {
    healthCache = { endpoint, ok: false, checkedAt: now };
    return false;
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(endpoint, { method: "GET", signal: ctrl.signal });
    clearTimeout(t);
    const ok = res.status >= 200 && res.status < 300;
    healthCache = { endpoint, ok, checkedAt: now };
    return ok;
  } catch {
    healthCache = { endpoint, ok: false, checkedAt: now };
    return false;
  }
}

// Exposed for tests + admin dashboard to surface "HQ is down, queueing
// to outbox" state.
export async function isHqHealthy(): Promise<boolean> {
  return checkHealth();
}

export function _resetHealthCacheForTests(): void {
  healthCache = null;
}

// =========================================================================
// Core: queue a payload, attempt forward, return either {hqSubmissionId}
// on success or {queued: true} on any failure path. Callers never await
// the network — they await the queue write so the local DB transaction
// is in a known state, then the network is fire-and-forget.
// =========================================================================

export interface ForwardOptions {
  surface: HqSurface;
  sourceId?: number;
  payload: Omit<HqPayload, "idempotencyKey"> & { idempotencyKey?: string };
}

export interface ForwardResult {
  outboxId: number;
  idempotencyKey: string;
  hqSubmissionId?: string;
  queued: boolean; // true if HQ is down / call failed and we left it in outbox
  // Test-only: the in-flight network attempt promise. Production callers
  // ignore this (fire-and-forget); tests await it for determinism.
  _inFlight?: Promise<void>;
}

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [1_000, 4_000, 16_000];

function jitter(ms: number): number {
  const range = ms * 0.25;
  return ms + (Math.random() * 2 - 1) * range;
}

export async function forward(opts: ForwardOptions): Promise<ForwardResult> {
  const idempotencyKey = opts.payload.idempotencyKey || randomUUID();
  const payload: HqPayload = { ...opts.payload, idempotencyKey };

  const outboxRow = await storage.createHqOutbox({
    idempotencyKey,
    surface: opts.surface,
    sourceId: opts.sourceId,
    payload: payload as any,
    status: "pending",
  });

  // Fire-and-forget attempt. We don't await because the caller is
  // already responding to the user; the outbox row guarantees nothing
  // is lost.
  const inFlight = attemptForward(outboxRow.id, payload).catch(err =>
    console.error("[hq-client] forward attempt failed:", err),
  );

  return { outboxId: outboxRow.id, idempotencyKey, queued: true, _inFlight: inFlight };
}

async function attemptForward(outboxId: number, payload: HqPayload): Promise<void> {
  const healthy = await checkHealth();
  if (!healthy) {
    await storage.updateHqOutbox(outboxId, {
      attempts: 1,
      lastAttemptAt: new Date(),
      lastError: "HQ /api/health not 200 — left in outbox for next drain",
      status: "pending",
    });
    return;
  }
  await drainOutboxRow(outboxId, payload);
}

async function drainOutboxRow(outboxId: number, payload: HqPayload): Promise<HqResponse | null> {
  const endpoint = endpointUrl();
  if (!endpoint) {
    await storage.updateHqOutbox(outboxId, {
      status: "pending",
      lastAttemptAt: new Date(),
      lastError: "HQ endpoint not configured — queued for later",
    });
    return null;
  }

  await storage.updateHqOutbox(outboxId, { status: "forwarding" });
  let lastError = "";

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const backoff = attempt === 0 ? 0 : jitter(BACKOFF_MS[attempt - 1] ?? 16_000);
    if (backoff > 0) await new Promise(r => setTimeout(r, backoff));
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10_000);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      clearTimeout(t);

      const totalAttempts = attempt + 1;

      if (res.status >= 200 && res.status < 300) {
        const body: HqResponse = await res.json().catch(() => ({}));
        await storage.updateHqOutbox(outboxId, {
          attempts: totalAttempts,
          lastAttemptAt: new Date(),
          status: "forwarded",
          hqSubmissionId: body.hq_submission_id,
          forwardedAt: new Date(),
          lastError: null as any,
        });
        // Back-reference the originating row when we know the surface.
        await backReference(outboxId, body.hq_submission_id);
        return body;
      }

      if (res.status >= 400 && res.status < 500) {
        const text = await res.text().catch(() => "");
        lastError = `HQ ${res.status}: ${text.slice(0, 500)}`;
        await storage.updateHqOutbox(outboxId, {
          attempts: totalAttempts,
          lastAttemptAt: new Date(),
          status: "failed",
          lastError,
        });
        return null;
      }

      lastError = `HQ ${res.status}`;
    } catch (err: any) {
      lastError = `network: ${err?.message || String(err)}`;
    }
    await storage.updateHqOutbox(outboxId, {
      attempts: attempt + 1,
      lastAttemptAt: new Date(),
      lastError,
      status: attempt + 1 >= MAX_ATTEMPTS ? "pending" : "forwarding",
    });
  }
  // All attempts exhausted on retryable errors — leave as pending for
  // manual / scheduled retry.
  return null;
}

async function backReference(outboxId: number, hqSubmissionId?: string): Promise<void> {
  if (!hqSubmissionId) return;
  const row = await storage.getHqOutbox(outboxId);
  if (!row || !row.sourceId) return;
  try {
    if (row.surface === "lead" || row.surface === "vendor" || row.surface === "buybox") {
      await storage.updateLead(row.sourceId, {
        hqSubmissionId,
        hqForwardedAt: new Date(),
      } as any);
    } else if (row.surface === "peggy") {
      await storage.updatePeggyConversation(row.sourceId, {
        hqSubmissionId,
        hqForwardedAt: new Date(),
      } as any);
    }
  } catch (err) {
    console.error("[hq-client] back-reference write failed:", err);
  }
}

// =========================================================================
// Admin retry — called from /api/admin/hq-outbox/:id/retry. Re-runs the
// forward attempt against the stored payload.
// =========================================================================

export async function retryOutboxRow(outboxId: number): Promise<HqResponse | null> {
  const row = await storage.getHqOutbox(outboxId);
  if (!row) return null;
  _resetHealthCacheForTests();
  return drainOutboxRow(outboxId, row.payload as HqPayload);
}

// =========================================================================
// Drain recoverable rows: stale `forwarding` leases are reclaimed before
// ordinary pending work. A process can die after marking a row forwarding;
// without the lease cutoff that payload would be stranded permanently.
// =========================================================================

const FORWARDING_LEASE_MS = 5 * 60_000;

export async function drainPending(limit = 25): Promise<{ tried: number; ok: number; stillPending: number }> {
  const normalizedLimit = Math.max(1, Math.floor(limit));
  const staleForwarding = await storage.getHqOutboxList({
    status: "forwarding",
    updatedBefore: new Date(Date.now() - FORWARDING_LEASE_MS),
    limit: normalizedLimit,
  });
  const pendingSlots = normalizedLimit - staleForwarding.length;
  const pending = pendingSlots > 0
    ? await storage.getHqOutboxList({
        status: "pending",
        limit: pendingSlots,
      })
    : [];
  const rows = [...staleForwarding, ...pending];
  let ok = 0;
  let stillPending = 0;
  for (const row of rows) {
    const res = await drainOutboxRow(row.id, row.payload as HqPayload);
    if (res?.hq_submission_id) ok++;
    else stillPending++;
  }
  return { tried: rows.length, ok, stillPending };
}

const MAX_RECOVERY_BATCH_SIZE = 25;
const MIN_RECOVERY_INTERVAL_MS = 30_000;
const DEFAULT_RECOVERY_INTERVAL_MS = 60_000;

type DrainResult = Awaited<ReturnType<typeof drainPending>>;
type RecoveryTimer = ReturnType<typeof setInterval>;

export interface HqPendingRecoveryOptions {
  batchSize?: number;
  isHealthy?: () => Promise<boolean>;
  drain?: (limit: number) => Promise<DrainResult>;
  onError?: (error: unknown) => void;
}

export interface HqPendingRecoveryWorkerOptions
  extends HqPendingRecoveryOptions {
  intervalMs?: number;
  runImmediately?: boolean;
  setIntervalFn?: (
    callback: () => void,
    delay: number,
  ) => RecoveryTimer;
  clearIntervalFn?: (timer: RecoveryTimer) => void;
}

let pendingRecoveryInFlight = false;
let pendingRecoveryTimer: RecoveryTimer | null = null;
let pendingRecoveryClearInterval: (timer: RecoveryTimer) => void =
  clearInterval;

function boundedBatchSize(requested = MAX_RECOVERY_BATCH_SIZE): number {
  const normalized = Number.isFinite(requested)
    ? Math.floor(requested)
    : MAX_RECOVERY_BATCH_SIZE;
  return Math.max(1, Math.min(MAX_RECOVERY_BATCH_SIZE, normalized));
}

export async function runHqPendingRecoveryOnce(
  options: HqPendingRecoveryOptions = {},
): Promise<boolean> {
  if (pendingRecoveryInFlight) return false;
  pendingRecoveryInFlight = true;

  try {
    const healthy = await (options.isHealthy ?? isHqHealthy)();
    if (!healthy) return false;

    await (options.drain ?? drainPending)(
      boundedBatchSize(options.batchSize),
    );
    return true;
  } catch (error) {
    (options.onError ??
      ((caught) =>
        console.error("[hq-client] pending recovery failed:", caught)))(
      error,
    );
    return false;
  } finally {
    pendingRecoveryInFlight = false;
  }
}

export function startHqPendingRecoveryWorker(
  options: HqPendingRecoveryWorkerOptions = {},
): void {
  if (pendingRecoveryTimer) return;

  const requestedInterval =
    options.intervalMs ?? DEFAULT_RECOVERY_INTERVAL_MS;
  const intervalMs = Math.max(
    MIN_RECOVERY_INTERVAL_MS,
    Number.isFinite(requestedInterval)
      ? Math.floor(requestedInterval)
      : DEFAULT_RECOVERY_INTERVAL_MS,
  );
  const run = () => {
    void runHqPendingRecoveryOnce(options);
  };

  if (options.runImmediately !== false) run();

  const setIntervalFn = options.setIntervalFn ?? setInterval;
  pendingRecoveryClearInterval =
    options.clearIntervalFn ?? clearInterval;
  pendingRecoveryTimer = setIntervalFn(run, intervalMs);
  pendingRecoveryTimer.unref?.();
}

export function stopHqPendingRecoveryWorker(): void {
  if (!pendingRecoveryTimer) return;
  pendingRecoveryClearInterval(pendingRecoveryTimer);
  pendingRecoveryTimer = null;
  pendingRecoveryClearInterval = clearInterval;
}
