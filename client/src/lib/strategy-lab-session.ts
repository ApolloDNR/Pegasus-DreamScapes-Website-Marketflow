/**
 * Strategy Lab — anonymous session helpers (Task #84).
 *
 * Anonymous Lab users get a localStorage- AND cookie-persisted sessionId so
 * that (a) we can claim their saved analyses on signup via
 * /api/property-analyses/claim and (b) we can throttle a soft account wall
 * after FREE_RUN_LIMIT engine runs. The cookie copy survives localStorage
 * clears in the same browser session; a soft fingerprint (UA + screen + tz)
 * recovers the run count when both are wiped. Save / Share / Export PDF /
 * Submit-to-Pegasus always require auth.
 */

export const FREE_RUN_LIMIT = 3;

const SESSION_KEY = "pegasus.lab.sessionId";
const RUNS_KEY = "pegasus.lab.runCount";
const FP_KEY_PREFIX = "pegasus.lab.fp.";
const COOKIE_MAX_AGE_DAYS = 30;

function safeStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

/**
 * Soft, non-cryptographic browser fingerprint. Used only to recover the
 * anonymous run counter when localStorage AND the run cookie were both
 * cleared in the same session. Not used for tracking, identification, or
 * cross-site correlation.
 */
function softFingerprint(): string {
  if (typeof navigator === "undefined" || typeof window === "undefined") return "node";
  const parts = [
    navigator.userAgent || "",
    navigator.language || "",
    String(window.screen?.width ?? 0),
    String(window.screen?.height ?? 0),
    String(new Date().getTimezoneOffset()),
  ].join("|");
  let h = 0;
  for (let i = 0; i < parts.length; i++) {
    h = (h * 31 + parts.charCodeAt(i)) | 0;
  }
  return `fp${(h >>> 0).toString(36)}`;
}

function randomId(): string {
  const c: Crypto | undefined =
    typeof globalThis !== "undefined" ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (c?.randomUUID) {
    return c.randomUUID().replace(/-/g, "").slice(0, 22);
  }
  return `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function freeRunsRemaining(): number {
  return Math.max(0, FREE_RUN_LIMIT - getLabRunCount());
}

export function getOrCreateLabSessionId(): string {
  const ls = safeStorage();
  const cookieId = readCookie(SESSION_KEY);
  let id = ls?.getItem(SESSION_KEY) ?? cookieId ?? null;
  if (!id) id = randomId();
  ls?.setItem(SESSION_KEY, id);
  if (cookieId !== id) writeCookie(SESSION_KEY, id);
  return id;
}

export function getLabRunCount(): number {
  const ls = safeStorage();
  // Take the MAX of localStorage, cookie, and fingerprint-keyed slot so
  // clearing any single store cannot reset the soft wall.
  const lsCount = Number(ls?.getItem(RUNS_KEY) || "0");
  const cookieCount = Number(readCookie(RUNS_KEY) || "0");
  const fpCount = Number(ls?.getItem(FP_KEY_PREFIX + softFingerprint()) || "0");
  const candidates = [lsCount, cookieCount, fpCount].filter(Number.isFinite);
  return candidates.length ? Math.max(...candidates) : 0;
}

export function bumpLabRunCount(): number {
  const next = getLabRunCount() + 1;
  const ls = safeStorage();
  ls?.setItem(RUNS_KEY, String(next));
  ls?.setItem(FP_KEY_PREFIX + softFingerprint(), String(next));
  writeCookie(RUNS_KEY, String(next));
  return next;
}

export function clearLabRunCount(): void {
  const ls = safeStorage();
  ls?.removeItem(RUNS_KEY);
  ls?.removeItem(FP_KEY_PREFIX + softFingerprint());
  writeCookie(RUNS_KEY, "0");
}
