// Website Brief v1.0 §11 — consent-gated Plausible analytics loader.
// Plausible is privacy-friendly and does not require cookies for the
// default pageview script, but per the brief no non-essential script
// loads until the visitor has granted Analytics consent. Domain is
// read from VITE_PLAUSIBLE_DOMAIN; if the env var is unset the loader
// is a no-op (so dev/preview hosts never beacon).
import { onConsentChange, readConsent } from "./consent";

const SCRIPT_ID = "pegasus-plausible-script";
const PLAUSIBLE_SRC = "https://plausible.io/js/script.js";

declare global {
  interface Window {
    plausible?: ((event: string, opts?: { props?: Record<string, unknown> }) => void) & {
      q?: unknown[];
    };
  }
}

function getDomain(): string | null {
  // Test/runtime override: window.__PEGASUS_PLAUSIBLE_DOMAIN__ takes
  // precedence over the build-time env var so tests (and emergency
  // ops switches) can flip the domain without a redeploy.
  const fromWindow =
    typeof window !== "undefined"
      ? (window as unknown as { __PEGASUS_PLAUSIBLE_DOMAIN__?: string })
          .__PEGASUS_PLAUSIBLE_DOMAIN__
      : undefined;
  if (fromWindow) return fromWindow;
  const fromEnv = (import.meta as { env?: Record<string, string | undefined> }).env
    ?.VITE_PLAUSIBLE_DOMAIN;
  if (!fromEnv || fromEnv === "undefined") return null;
  return fromEnv;
}

function injectScript() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SCRIPT_ID)) return;
  const domain = getDomain();
  if (!domain) return;
  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.defer = true;
  s.setAttribute("data-domain", domain);
  s.src = PLAUSIBLE_SRC;
  document.head.appendChild(s);
  // Provide a queueing stub so callers can `trackEvent` before the script
  // has finished loading.
  if (!window.plausible) {
    window.plausible = function plausibleStub(...args: unknown[]) {
      (window.plausible!.q = window.plausible!.q || []).push(args);
    } as Window["plausible"];
  }
}

function removeScript() {
  if (typeof document === "undefined") return;
  document.getElementById(SCRIPT_ID)?.remove();
  if (window.plausible) {
    delete window.plausible;
  }
}

export function initAnalytics(): () => void {
  if (typeof window === "undefined") return () => {};
  const apply = () => {
    if (readConsent().analytics) {
      injectScript();
    } else {
      removeScript();
    }
  };
  apply();
  return onConsentChange(apply);
}

export function trackEvent(name: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!readConsent().analytics) return;
  try {
    window.plausible?.(name, props ? { props } : undefined);
  } catch {
    /* noop */
  }
}
