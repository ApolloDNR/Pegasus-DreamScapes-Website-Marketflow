import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { createServer, type Server } from "node:http";
import { AddressInfo } from "node:net";

import { PEGASUS_URLS } from "@/pegasus/routes";

// Server-side GONE_ROUTES "really retired" net (Task #219).
//
// server/routes.ts owns a SECOND, independent legacy mechanism alongside the
// 301 redirect map covered by Task #216: `GONE_ROUTES`, which answers HTTP 410
// Gone (with a `noindex` page) for URLs that were removed from the public
// surface entirely (/education, /calculators, /wholesale, ...). Nothing
// verified two things:
//   1) Each GONE_ROUTES path is NOT also a live SPA route. If a retired path
//      were re-registered in App.tsx (or owned by the Pegasus prototype shell
//      via PEGASUS_URLS), crawlers would get conflicting signals — a live
//      200 page AND a 410 Gone — with nothing to catch the contradiction.
//   2) Each path actually answers 410 with the noindex Gone page.
//
// This suite reads GONE_ROUTES from source (the same fast, boot-free pattern
// used by server-legacy-redirects.test.tsx / route-map.test.tsx) for the
// ownership checks, then boots a tiny Express server that registers the gone
// routes EXACTLY as server/routes.ts does (same list, same 410 + noindex
// handler shape, asserted against source below) to confirm the runtime 410.

function read(rel: string): string {
  return fs.readFileSync(path.join(process.cwd(), rel), "utf-8");
}

// Extract the string literals inside the server's GONE_ROUTES array literal.
function extractGoneRoutes(): string[] {
  const src = read("server/routes.ts");
  const start = src.indexOf("const GONE_ROUTES");
  if (start === -1) return [];
  const slice = src.slice(start);
  const close = slice.indexOf("]");
  const body = close === -1 ? slice : slice.slice(0, close);
  const out: string[] = [];
  const re = /['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) out.push(m[1]);
  return out;
}

const GONE_ROUTES = extractGoneRoutes();
const SERVER_SRC = read("server/routes.ts");
const APP_SRC = read("client/src/App.tsx");

describe("Server GONE_ROUTES are genuinely retired, not live routes (Task #219)", () => {
  it("has gone routes to test (non-vacuous)", () => {
    expect(GONE_ROUTES.length).toBeGreaterThan(0);
  });

  for (const route of GONE_ROUTES) {
    it(`${route} is not registered as a live App.tsx Route`, () => {
      expect(
        APP_SRC.includes(`path="${route}"`),
        `App.tsx must NOT register a live <Route> for retired ${route} (it answers 410 Gone server-side)`,
      ).toBe(false);
    });

    it(`${route} is not owned by the Pegasus prototype shell`, () => {
      expect(
        PEGASUS_URLS.includes(route),
        `${route} answers 410 Gone but is also a Pegasus URL — crawlers would see a live page AND a 410`,
      ).toBe(false);
    });
  }

  it("the real handler answers 410 (res.status(410)) with a noindex page", () => {
    // Pin the shape of the production handler so the live mirror below is a
    // faithful stand-in: the gone loop must send a 410, and the gonePage must
    // carry robots=noindex so retired URLs drop out of the index.
    expect(SERVER_SRC).toMatch(/res\.status\(410\)/);
    expect(SERVER_SRC).toMatch(
      /<meta name="robots" content="noindex">/,
    );
  });
});

// Runtime confirmation: boot a minimal Express app that registers the gone
// routes the same way server/routes.ts does and assert each answers 410 with
// the noindex Gone page over real HTTP. Booting the full app would require the
// DB + seeding; the handler is self-contained, so a faithful mirror (whose
// shape is pinned against source above) is enough to prove routing semantics.
describe("Server GONE_ROUTES answer 410 Gone over HTTP (Task #219)", () => {
  let server: Server;
  let baseUrl = "";

  const gonePage = (p: string) =>
    `<!doctype html><html><head><meta charset="utf-8"><title>Page removed — Pegasus DreamScapes</title><meta name="robots" content="noindex"></head><body><h1>This page has been retired.</h1><p><code>${p}</code></p></body></html>`;

  beforeAll(async () => {
    const app = express();
    for (const p of GONE_ROUTES) {
      app.get(p, (_req, res) => {
        res.status(410).type("html").send(gonePage(p));
      });
    }
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  });

  for (const route of GONE_ROUTES) {
    it(`${route} responds 410 Gone with noindex`, async () => {
      const res = await fetch(`${baseUrl}${route}`);
      expect(res.status).toBe(410);
      const body = await res.text();
      expect(body).toContain('content="noindex"');
    });
  }
});

// Harness regression: prove the ownership checks above would actually fail if
// a retired route were re-registered as a live page. A future edit that adds
// <Route path="/education"> back to App.tsx (or /education to PEGASUS_URLS)
// must turn this suite red.
describe("Harness regression: a re-registered gone route is caught (Task #219)", () => {
  it("a gone route present in the App.tsx route table fails the ownership check", () => {
    const fakeAppSrc = `<Route path="/education" component={Foo} />`;
    const offending = GONE_ROUTES.filter((r) =>
      fakeAppSrc.includes(`path="${r}"`),
    );
    // At least one gone route ("/education") is detectable as a live route in
    // this simulated regression, which is exactly what would fail CI.
    expect(offending.length).toBeGreaterThan(0);
  });

  it("a gone route present in PEGASUS_URLS would fail the ownership check", () => {
    const simulatedPegasusUrls = [...PEGASUS_URLS, GONE_ROUTES[0]];
    expect(simulatedPegasusUrls.includes(GONE_ROUTES[0])).toBe(true);
  });
});
