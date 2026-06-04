import { afterEach, describe, expect, it, vi } from "vitest";
import { portalServicesEnabled, portalServicesUnavailableError } from "@/lib/runtime-config";

describe("runtime config", () => {
  afterEach(() => {
    delete window.__PEGASUS_PORTAL_SERVICES_ENABLED__;
    vi.unstubAllEnvs();
  });

  it("keeps portal services disabled by default for public/static previews", () => {
    expect(portalServicesEnabled()).toBe(false);
  });

  it("enables portal services from the deployment env flag", () => {
    vi.stubEnv("VITE_PORTAL_SERVICES_ENABLED", "true");
    expect(portalServicesEnabled()).toBe(true);
  });

  it("lets an emergency runtime override take precedence", () => {
    vi.stubEnv("VITE_PORTAL_SERVICES_ENABLED", "true");
    window.__PEGASUS_PORTAL_SERVICES_ENABLED__ = false;

    expect(portalServicesEnabled()).toBe(false);
  });

  it("returns a clear disabled-services error", () => {
    expect(portalServicesUnavailableError().message).toBe("Portal services are not enabled on this host.");
  });
});
