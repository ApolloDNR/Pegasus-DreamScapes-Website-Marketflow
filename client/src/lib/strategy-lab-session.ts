/**
 * Strategy Lab — anonymous session helpers (Task #84).
 *
 * Anonymous Lab users get a random localStorage sessionId so that saved
 * analyses can be claimed on signup via /api/property-analyses/claim. The
 * FREE_RUN_LIMIT counter is intentionally scoped to sessionStorage: it lasts
 * only for the current browsing session and is never recovered from browser
 * characteristics or a persistent cookie. Save / Share / Export PDF /
 * Submit-to-Pegasus always require auth.
 */

export const FREE_RUN_LIMIT = 3;

const SESSION_KEY = "pegasus.lab.sessionId";
const RUNS_KEY = "pegasus.lab.runCount";
const FP_KEY_PREFIX = "pegasus.lab.fp.";

function safeLocalStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeSessionStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** Remove artifacts written by the previous persistent/fingerprint scheme. */
function cleanupLegacyPersistence(): void {
  const local = safeLocalStorage();
  if (local) {
    try {
      local.removeItem(RUNS_KEY);
      for (let index = local.length - 1; index >= 0; index -= 1) {
        const key = local.key(index);
        if (key?.startsWith(FP_KEY_PREFIX)) local.removeItem(key);
      }
    } catch {
      // Storage may be unavailable under hardened browser settings.
    }
  }

  if (typeof document !== "undefined") {
    try {
      document.cookie = `${RUNS_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
      document.cookie = `${SESSION_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
    } catch {
      // Cookie access may be blocked in sandboxed or hardened contexts.
    }
  }
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
  cleanupLegacyPersistence();
  const local = safeLocalStorage();
  let id: string | null = null;
  try {
    id = local?.getItem(SESSION_KEY) ?? null;
  } catch {
    // Continue with a generated ID when local storage is unavailable.
  }
  if (!id) id = randomId();
  try {
    local?.setItem(SESSION_KEY, id);
  } catch {
    // Claim continuity is best effort under hardened browser settings.
  }
  return id;
}

export function getLabRunCount(): number {
  cleanupLegacyPersistence();
  try {
    const count = Number(safeSessionStorage()?.getItem(RUNS_KEY) || "0");
    return Number.isFinite(count) ? Math.max(0, count) : 0;
  } catch {
    return 0;
  }
}

export function bumpLabRunCount(): number {
  const next = getLabRunCount() + 1;
  try {
    safeSessionStorage()?.setItem(RUNS_KEY, String(next));
  } catch {
    // The soft wall is best effort when session storage is unavailable.
  }
  return next;
}

export function clearLabRunCount(): void {
  cleanupLegacyPersistence();
  try {
    safeSessionStorage()?.removeItem(RUNS_KEY);
  } catch {
    // Nothing else to clear when session storage is unavailable.
  }
}
