import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render, cleanup, waitFor } from "@testing-library/react";
import { Router, Switch, Route, Redirect, useLocation } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { PEGASUS_URLS } from "@/pegasus/routes";

// Server-side legacy-redirect dead-end net (Task #216).
//
// server/routes.ts holds a SECOND, independent redirect map, `LEGACY_REDIRECTS`,
// that issues the true HTTP 301s crawlers and direct (non-SPA) hits receive —
// separate from App.tsx's client-side `legacyRedirects` (covered by Task #213's
// legacy-redirects.test.tsx). Nothing verified that each server 301's `to`
// destination still resolves to a real, registered surface. A future rename of
// a canonical route (e.g. <Route path="/development"> → "/dev") would silently
// leave `/services → /development` pointing at a 404 for every crawler and
// direct visitor.
//
// This suite extracts the server's LEGACY_REDIRECTS tuples from source (booting
// Express here is unnecessary and slow) and drives each `to` through the SAME
// faithful wouter router used by the client net: the real registered-route
// table read from App.tsx plus the public URLs owned by the Pegasus shell. A
// destination that no longer resolves renders the NotFound catch-all and fails
// CI.

function read(rel: string): string {
  return fs.readFileSync(path.join(process.cwd(), rel), "utf-8");
}

// Extract the [from, to] tuples inside the server's LEGACY_REDIRECTS literal.
function extractServerRedirects(): Array<[string, string]> {
  const src = read("server/routes.ts");
  const start = src.indexOf("const LEGACY_REDIRECTS");
  if (start === -1) return [];
  const slice = src.slice(start, start + 4000);
  const close = slice.indexOf("];");
  const body = close === -1 ? slice : slice.slice(0, close);
  const out: Array<[string, string]> = [];
  const re = /\[\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) out.push([m[1], m[2]]);
  return out;
}

const SERVER_REDIRECTS = extractServerRedirects();

// Every literal `<Route path="...">` registered in App.tsx, plus the public
// URLs owned by the Pegasus prototype shell. These are the real surfaces a
// redirect is allowed to land on — identical to the client net's table so both
// layers are checked against the same source of truth.
const REGISTERED_PATTERNS: string[] = (() => {
  const src = read("client/src/LegacyApp.tsx");
  const re = /path="([^"]+)"/g;
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) out.add(m[1]);
  for (const u of PEGASUS_URLS) out.add(u);
  return Array.from(out);
})();

const pathnameOf = (url: string): string => url.split(/[?#]/)[0];

function LocationProbe({ sink }: { sink: { current: string } }) {
  const [loc] = useLocation();
  sink.current = loc;
  return null;
}

function buildSwitch(
  redirects: Array<[string, string]>,
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
  redirects: Array<[string, string]>,
) {
  const probe = { current: pathnameOf(routePath) };
  const mem = memoryLocation({ path: routePath });
  // Browser location matches on pathname only; wouter's memoryLocation hook
  // returns the full path including query. Strip query/hash so Switch matching
  // mirrors production — otherwise `/submit?intent=sell` never matches
  // <Route path="/submit">.
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

describe("Server LEGACY_REDIRECTS all land on a live registered route (Task #216)", () => {
  it("has redirects to test (non-vacuous)", () => {
    expect(SERVER_REDIRECTS.length).toBeGreaterThan(0);
  });

  for (const [from, to] of SERVER_REDIRECTS) {
    it(`${from} → ${to} resolves to a real route`, async () => {
      const { container, probe } = renderAt(from, SERVER_REDIRECTS);

      // 1) The redirect fired and landed on `to` (compare by pathname; query
      //    such as ?intent=sell is carried separately).
      await waitFor(() => {
        expect(probe.current).toBe(pathnameOf(to));
      });

      // 2) `to` resolved to a real registered page, not the NotFound catch-all.
      expect(
        container.querySelector('[data-testid="not-found"]'),
        `${from} 301s to ${to}, which resolves to NotFound (dead path)`,
      ).toBeNull();
      expect(
        container.querySelector('[data-testid="real-page"]'),
        `${from} → ${to} did not render a real registered page`,
      ).not.toBeNull();
    });
  }
});

describe("Harness regression: a server redirect to an unknown path fails (Task #216)", () => {
  it("a from→bogus redirect resolves to NotFound (would fail the suite above)", async () => {
    const bogus: Array<[string, string]> = [
      ["/__server_legacy_probe__", "/__path_that_does_not_exist__"],
    ];
    const { container, probe } = renderAt("/__server_legacy_probe__", bogus);

    await waitFor(() => {
      expect(probe.current).toBe("/__path_that_does_not_exist__");
    });

    expect(
      container.querySelector('[data-testid="not-found"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-testid="real-page"]'),
    ).toBeNull();
  });
});
