import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { writeConsent, resetConsent, readConsent, CONSENT_STORAGE_KEY } from "@/lib/consent";
import { trackEvent, initAnalytics } from "@/lib/analytics";

vi.stubEnv("VITE_PLAUSIBLE_DOMAIN", "pegasusdreamscapes.com");

// Website Brief v1.0 §11 — analytics consent gate. The Plausible script
// must not load and trackEvent() must be a no-op until the visitor opts
// in to Analytics. Switching consent off after the fact must remove the
// script and resume no-op behavior.

declare global {
  // eslint-disable-next-line no-var
  var window: Window & typeof globalThis;
}

describe("Analytics consent gate (Website Brief v1.0 §11)", () => {
  beforeEach(() => {
    resetConsent();
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    document.getElementById("pegasus-plausible-script")?.remove();
    delete (window as unknown as { plausible?: unknown }).plausible;
  });

  afterEach(() => {
    (window as unknown as { __PEGASUS_PLAUSIBLE_DOMAIN__: string }).__PEGASUS_PLAUSIBLE_DOMAIN__ =
      "pegasusdreamscapes.com";
  });

  it("defaults to off — readConsent reports analytics=false before any decision", () => {
    const c = readConsent();
    expect(c.analytics).toBe(false);
    expect(c.marketing).toBe(false);
    expect(c.essential).toBe(true);
    expect(c.decidedAt).toBe(null);
  });

  it("trackEvent is a no-op when analytics consent has not been granted", () => {
    const stub = vi.fn();
    (window as unknown as { plausible?: typeof stub }).plausible = stub;
    trackEvent("submit_completed", { intent: "property" });
    expect(stub).not.toHaveBeenCalled();
  });

  it("initAnalytics does not inject the Plausible script pre-consent", () => {
    initAnalytics();
    expect(document.getElementById("pegasus-plausible-script")).toBeNull();
  });

  it("initAnalytics injects the Plausible script after consent flips to true", () => {
    const cleanup = initAnalytics();
    expect(document.getElementById("pegasus-plausible-script")).toBeNull();
    writeConsent({ analytics: true, marketing: false });
    const script = document.getElementById("pegasus-plausible-script") as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    expect(script?.getAttribute("data-domain")).toBe("pegasusdreamscapes.com");
    cleanup();
  });

  it("removing analytics consent removes the Plausible script", () => {
    const cleanup = initAnalytics();
    writeConsent({ analytics: true, marketing: false });
    expect(document.getElementById("pegasus-plausible-script")).not.toBeNull();
    writeConsent({ analytics: false, marketing: false });
    expect(document.getElementById("pegasus-plausible-script")).toBeNull();
    cleanup();
  });

  it("trackEvent forwards to window.plausible only when consent is granted", () => {
    const stub = vi.fn();
    writeConsent({ analytics: true, marketing: false });
    (window as unknown as { plausible?: typeof stub }).plausible = stub;
    trackEvent("strategy_lab_started");
    trackEvent("cta_click", { id: "hero_primary" });
    expect(stub).toHaveBeenCalledTimes(2);
    expect(stub).toHaveBeenNthCalledWith(1, "strategy_lab_started", undefined);
    expect(stub).toHaveBeenNthCalledWith(2, "cta_click", { props: { id: "hero_primary" } });
  });
});
