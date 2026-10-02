import { useMemo } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { readLeadReceipt, readOpportunityReceipt } from '@/lib/lead-receipt';

type IntakeEndpoint = '/api/leads' | '/api/opportunities';
type Receipt<E extends IntakeEndpoint> = E extends '/api/leads'
  ? Awaited<ReturnType<typeof readLeadReceipt>>
  : Awaited<ReturnType<typeof readOpportunityReceipt>>;
type Attempts = Record<string, string>;

const STORAGE_PREFIX = 'pegasus:intake-attempts:v1:';
const RECEIPT_TIMEOUT_MS = 30_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FINGERPRINT = /^[0-9a-f]{64}$/;
const memoryAttempts = new Map<string, Attempts>();
const unpersistedAttempts = new Set<string>();
// A route can remount before its previous POST settles. Share the receipt (or
// ambiguous failure) across mounts so no old mount clears a retry's active key.
const inFlightAttempts = new Map<string, { canonical: string; promise: Promise<Receipt<IntakeEndpoint>> }>();
const TRANSPORT_FIELDS = new Set(['hp_company', 'ts_elapsed_ms', 'ts_mounted_at']);
const CHANGED_INQUIRY_PROMPT = 'Your earlier submission may already be recorded. Sending these edited details creates a separate inquiry and does not update or cancel the earlier version. Send the edited details as a new inquiry?';

function loadAttempts(storageKey: string): Attempts {
  if (unpersistedAttempts.has(storageKey)) return { ...memoryAttempts.get(storageKey) };
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? '{}');
    const attempts: Attempts = {};
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [fingerprint, key] of Object.entries(value)) {
        if (FINGERPRINT.test(fingerprint) && typeof key === 'string' && UUID.test(key)) {
          attempts[fingerprint] = key;
        }
      }
    }
    memoryAttempts.set(storageKey, attempts);
    return attempts;
  } catch {
    return { ...memoryAttempts.get(storageKey) };
  }
}

function saveAttempts(storageKey: string, attempts: Attempts) {
  memoryAttempts.set(storageKey, { ...attempts });
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(attempts));
    unpersistedAttempts.delete(storageKey);
  } catch {
    unpersistedAttempts.add(storageKey);
    // Storage-blocked tabs still retain retry protection across SPA navigation.
    // No form/contact values are persisted, even in the normal storage path.
  }
}

function canonicalPayload(payload: unknown): string {
  // Match the JSON wire representation, including omitted undefined fields.
  const wire = JSON.parse(JSON.stringify(payload));
  function canonical(value: unknown, path: string[]): unknown {
    if (Array.isArray(value)) return value.map((item) => canonical(item, [...path, '[]']));
    if (!value || typeof value !== 'object') return value;
    const isTransportContainer = path.length === 0 || (path.length === 1 && path[0] === 'leadData');
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
      .filter(([key]) => !(isTransportContainer && TRANSPORT_FIELDS.has(key)))
      .map(([key, item]) => [key, canonical(item, [...path, key])]));
  }
  return JSON.stringify(canonical(wire, []));
}

async function fingerprint(canonical: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** One intake scope, with unresolved attempts retained through tab Back/reload. */
export function createIntakeRequest<E extends IntakeEndpoint>(scope: string, endpoint: E) {
  const storageKey = `${STORAGE_PREFIX}${endpoint}:${scope}`;

  return (payload: unknown): Promise<Receipt<E>> => {
    const canonical = canonicalPayload(payload);
    const inFlight = inFlightAttempts.get(storageKey);
    if (inFlight) {
      if (inFlight.canonical === canonical) return inFlight.promise as Promise<Receipt<E>>;
      return Promise.reject(new Error('Your earlier submission is still being confirmed. Please wait before sending edited details.'));
    }
    const promise = (async () => {
      const hash = await fingerprint(canonical);
      const attempts = loadAttempts(storageKey);
      let key = attempts[hash];
      if (!key) {
        if (Object.keys(attempts).length > 0 && !window.confirm(CHANGED_INQUIRY_PROMPT)) {
          throw new Error('Your earlier submission may already be recorded. No edited inquiry was sent.');
        }
        key = crypto.randomUUID();
        attempts[hash] = key;
        saveAttempts(storageKey, attempts);
      }
      let timeout!: ReturnType<typeof setTimeout>;
      const deadline = new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error('Confirming your submission timed out. Please retry with the same details.')), RECEIPT_TIMEOUT_MS);
      });
      try {
        // A hung request or receipt body must not block this door across SPA
        // remounts. Late responses cannot reach validation or remove retry keys.
        const response = await Promise.race([
          apiRequest('POST', endpoint, payload, { 'Idempotency-Key': key }),
          deadline,
        ]);
        const receipt = await Promise.race([
          endpoint === '/api/leads' ? readLeadReceipt(response) : readOpportunityReceipt(response),
          deadline,
        ]);
        // An HTTP success alone is not a receipt. Remove only the exact confirmed
        // attempt; previous ambiguous versions remain recoverable with their key.
        const current = loadAttempts(storageKey);
        if (current[hash] === key) delete current[hash];
        saveAttempts(storageKey, current);
        return receipt as Receipt<E>;
      } finally {
        clearTimeout(timeout);
      }
    })().finally(() => { inFlightAttempts.delete(storageKey); });
    inFlightAttempts.set(storageKey, { canonical, promise });
    return promise;
  };
}

export function useIntakeRequest<E extends IntakeEndpoint>(scope: string, endpoint: E) {
  return useMemo(() => createIntakeRequest(scope, endpoint), [scope, endpoint]);
}
