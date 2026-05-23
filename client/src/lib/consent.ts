// Website Brief v1.0 §11 — cookie consent + consent-gated analytics.
// Non-essential cookies / analytics / marketing scripts MUST NOT load until
// the visitor has granted the matching consent category. Consent is stored
// in localStorage under `pegasus-cookie-consent` and changes emit a
// `pegasus:consent-changed` window event so listeners (e.g. the analytics
// loader) can react without a page reload.

export type ConsentCategory = "essential" | "analytics" | "marketing";

export interface ConsentState {
  essential: true; // always granted; site cannot function without it
  analytics: boolean;
  marketing: boolean;
  decidedAt: string | null; // ISO timestamp of the user's most recent decision
}

const STORAGE_KEY = "pegasus-cookie-consent";
const EVENT_NAME = "pegasus:consent-changed";

export const DEFAULT_CONSENT: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
  decidedAt: null,
};

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONSENT;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    return {
      essential: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : null,
    };
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function hasDecided(): boolean {
  return readConsent().decidedAt !== null;
}

export function writeConsent(next: Omit<ConsentState, "essential" | "decidedAt"> & { decidedAt?: string | null }): ConsentState {
  const state: ConsentState = {
    essential: true,
    analytics: !!next.analytics,
    marketing: !!next.marketing,
    decidedAt: next.decidedAt ?? new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }));
    } catch {
      // localStorage may be unavailable in private mode; we silently fall
      // back to in-memory defaults so the site still renders.
    }
  }
  return state;
}

export function resetConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: DEFAULT_CONSENT }));
  } catch {
    /* noop */
  }
}

export function onConsentChange(handler: (state: ConsentState) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<ConsentState>).detail ?? readConsent();
    handler(detail);
  };
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

export const CONSENT_STORAGE_KEY = STORAGE_KEY;
export const CONSENT_EVENT_NAME = EVENT_NAME;
