import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render, cleanup, waitFor } from "@testing-library/react";
import { Router, Switch, Route, Redirect, useLocation } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { legacyRedirects } from "@/LegacyApp";
import { PEGASUS_URLS } from "@/pegasus/routes";

// Legacy-redirect dead-end net (Task #213).
//
// App.tsx's `legacyRedirects` 301s old URLs (e.g. /sell, /invest, /wholesale)
// to their canonical replacements. route-map.test.tsx already checks, by source
// inspection, that every retired route *has* a redirect. But nothing verified
// the redirect's *destination* still resolves to a live route: a future rename
// of a canonical surface (e.g. <Route path="/development"> → "/dev") would
// leave `/services → /development` pointing at a dead path, silently sending
// visitors (and crawlers) to a 404. This is the same dead-end class as the CTA
// nets (Task #201/#210), applied to redirects.
//
// This suite *renders* a wouter router built from the real `legacyRedirects`
// array plus the real registered-route table, drives each `from`, and asserts:
//   1. it redirects to the matching `to`, and
//   2. `to` resolves to a real registered route (renders a page, not NotFound).
//
// The registered-route table is read straight from the App.tsx source, so a
// rename of any <Route path="..."> is reflected here automatically and a now
// dead redirect fails CI.

function readAppSrc(): string {
  return fs.readFileSync(
    path.join(process.cwd(), "client/src/LegacyApp.tsx"),
    "utf-8",
  );
}

// Every literal `<Route path="...">` registered in App.tsx, plus the public
// URLs owned by the Pegasus prototype shell (mounted via PEGASUS_URLS.map).
// These are the *real* surfaces a redirect is allowed to land on. The redirect
// `from` paths use `path={from}` (a variable), so they are deliberately NOT
// captured here — a redirect must resolve to a real page, not another redirect.
const REGISTERED_PATTERNS: string[] = (() => {
  const src = readAppSrc();
  const re = /path="([^"]+)"/g;
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) out.add(m[1]);
  for (const u of PEGASUS_URLS) out.add(u);
  return Array.from(out);
})();

const pathnameOf = (url: string): string => url.split(/[?#]/)[0];

// Records the live pathname so we can assert where a redirect actually landed.
function LocationProbe({ sink }: { sink: { current: string } }) {
  const [loc] = useLocation();
  sink.current = loc;
  return null;
}

// Builds the faithful router: registered pages render a "real-page" sentinel,
// the real legacyRedirects render <Redirect>, and the catch-all is a NotFound
// sentinel — exactly the three outcomes App.tsx's <Switch> can produce.
function buildSwitch(
  redirects: Array<[string, string]> = legacyRedirects,
): React.ReactElement {
  return (
    <Switch>
      {REGISTERED_PATTERNS.map((p) => (
        <Route key={`page:${p}`} path={p}>
          {() => <div data-testid="real-page" data-path={p} />}
        </Route>
      ))}
      {redirects.map(([from, to]) => (
        <Route key={`redir:${from}`} path={from}>
          {() => <Redirect to={to} />}
        </Route>
      ))}
      <Route>
        {() => <div data-testid="not-found" />}
      </Route>
    </Switch>
  );
}

function renderAt(
  routePath: string,
  redirects?: Array<[string, string]>,
) {
  const probe = { current: pathnameOf(routePath) };
  const mem = memoryLocation({ path: routePath });
  // The browser location hook matches on pathname only (search/hash are carried
  // separately); wouter's memoryLocation hook returns the full path including
  // query. Wrap it to strip query/hash so Switch matching mirrors production —
  // otherwise `/submit?intent=sell` would never match <Route path="/submit">.
  const hook = ((...args: unknown[]) => {
    const [loc, navigate] = (mem.hook as (...a: unknown[]) => [string, unknown])(
      ...args,
    );
    return [pathnameOf(loc), navigate];
  }) as typeof mem.hook;
  const utils = render(
    <Router hook={hook}>
      <LocationProbe sink={probe} />
      {buildSwitch(redirects)}
    </Router>,
  );
  return { ...utils, probe };
}

afterEach(() => cleanup());

describe("Legacy redirects all land on a live registered route (Task #213)", () => {
  it("has redirects to test (non-vacuous)", () => {
    expect(legacyRedirects.length).toBeGreaterThan(10);
  });

  for (const [from, to] of legacyRedirects) {
    it(`${from} → ${to} redirects there and resolves to a real route`, async () => {
      const { container, probe } = renderAt(from);

      // 1) The redirect fired and landed on `to` (compare by pathname; wouter's
      //    location hook is path-only, query/hash are carried separately).
      await waitFor(() => {
        expect(probe.current).toBe(pathnameOf(to));
      });

      // 2) `to` resolved to a real registered page, not the NotFound catch-all.
      expect(
        container.querySelector('[data-testid="not-found"]'),
        `${from} redirects to ${to}, which resolves to NotFound (dead path)`,
      ).toBeNull();
      expect(
        container.querySelector('[data-testid="real-page"]'),
        `${from} → ${to} did not render a real registered page`,
      ).not.toBeNull();
    });
  }
});

describe("Harness regression: a redirect to an unknown path fails (Task #213)", () => {
  it("a from→bogus redirect resolves to NotFound (would fail the suite above)", async () => {
    const bogus: Array<[string, string]> = [
      ["/__legacy_probe__", "/__path_that_does_not_exist__"],
    ];
    const { container, probe } = renderAt("/__legacy_probe__", bogus);

    await waitFor(() => {
      expect(probe.current).toBe("/__path_that_does_not_exist__");
    });

    // Proves the net has teeth: a dead destination lands on NotFound, which the
    // per-redirect assertions above treat as a failure.
    expect(
      container.querySelector('[data-testid="not-found"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-testid="real-page"]'),
    ).toBeNull();
  });
});
