import type { Express, RequestHandler } from "express";
import { describe, expect, it } from "vitest";

import { registerLegacySpaRedirects } from "../legacy-spa-redirects";

function registeredHandlers(): Map<string, RequestHandler> {
  const handlers = new Map<string, RequestHandler>();
  const app = {
    get(path: string, handler: RequestHandler) {
      handlers.set(path, handler);
      return app;
    },
  } as unknown as Express;
  registerLegacySpaRedirects(app);
  return handlers;
}

function requestRedirect(routePattern: string, originalUrl: string) {
  const handler = registeredHandlers().get(routePattern);
  if (!handler) throw new Error(`Missing redirect handler for ${routePattern}`);

  let status = 0;
  let location = "";
  handler(
    { originalUrl } as never,
    {
      redirect(value: number, target: string) {
        status = value;
        location = target;
      },
    } as never,
    (() => undefined) as never,
  );
  return { status, location };
}

describe("legacy SPA server redirects", () => {
  it("preserves a calculator tab deep link at the canonical Strategy Lab desk", () => {
    expect(
      requestRedirect("/calculators", "/calculators?tab=roi"),
    ).toEqual({
      status: 301,
      location: "/strategy-lab?tool=calculators&tab=roi",
    });
  });

  it("canonicalizes Connect to Contact with a real 301 and preserves attribution", () => {
    expect(
      requestRedirect(
        "/connect",
        "/connect?utm_source=printed-card&intent=vendor",
      ),
    ).toEqual({
      status: 301,
      location: "/contact?utm_source=printed-card&intent=vendor",
    });
  });

  it("retires Investments with a real 301 while preserving attribution", () => {
    expect(
      requestRedirect(
        "/investments",
        "/investments?utm_source=printed-card&relationship=development",
      ),
    ).toEqual({
      status: 301,
      location: "/capital?utm_source=printed-card&relationship=development",
    });
  });

  it("retires the obsolete Strategy Lab account library into Saved Work", () => {
    expect(
      requestRedirect("/strategy-lab/library", "/strategy-lab/library"),
    ).toEqual({
      status: 301,
      location: "/saved",
    });
  });

  it.each([
    ["/marketplace/admin/*", "/marketplace/admin/users/operator-42", "/marketflow/admin"],
    ["/marketplace/deals/*", "/marketplace/deals/deal-42/negotiate", "/marketflow/deals"],
    ["/marketplace/properties/*", "/marketplace/properties/east-bay/listing-42", "/marketflow/properties"],
  ])("301s multi-segment alias %s", (pattern, originalUrl, expected) => {
    expect(requestRedirect(pattern, originalUrl)).toEqual({
      status: 301,
      location: expected,
    });
  });
});
