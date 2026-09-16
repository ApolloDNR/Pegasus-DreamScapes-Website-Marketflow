import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { writeConsent, resetConsent, readConsent, CONSENT_STORAGE_KEY } from "@/lib/consent";
import { trackEvent, trackCtaClick, initAnalytics } from "@/lib/analytics";

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
  const originalSendBeacon = navigator.sendBeacon;

  beforeEach(() => {
    resetConsent();
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    document.getElementById("pegasus-plausible-script")?.remove();
    delete (window as unknown as { plausible?: unknown }).plausible;
  });

  afterEach(() => {
    (window as unknown as { __PEGASUS_PLAUSIBLE_DOMAIN__: string }).__PEGASUS_PLAUSIBLE_DOMAIN__ =
      "pegasusdreamscapes.com";
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: originalSendBeacon,
    });
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

  it("does not send first-party CTA telemetry before analytics consent", () => {
    const sendBeacon = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: sendBeacon,
    });

    trackCtaClick("home_hero", "Bring an opportunity", "/bring-an-opportunity");

    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it("sends a consented CTA event without a raw referrer", async () => {
    const sendBeacon = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: sendBeacon,
    });
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://example.com/private?email=person%40example.com",
    });
    writeConsent({ analytics: true, marketing: false });

    trackCtaClick("home_hero", "Bring an opportunity", "/bring-an-opportunity");

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [, body] = sendBeacon.mock.calls[0];
    expect(body).toBeInstanceOf(Blob);
    const payload = JSON.parse(await (body as Blob).text()) as Record<string, unknown>;
    expect(payload).toEqual({
      source: "home_hero",
      label: "Bring an opportunity",
      href: "/bring-an-opportunity",
      path: window.location.pathname,
    });
    expect(payload).not.toHaveProperty("referrer");
  });
});
