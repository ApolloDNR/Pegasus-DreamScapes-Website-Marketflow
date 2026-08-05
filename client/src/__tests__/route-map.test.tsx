import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Website Brief v1.0 §1 / route-map enforcement. This test inspects the
// route maps directly (App.tsx legacyRedirects + server/routes.ts LEGACY
// REDIRECTS + GONE_ROUTES) without booting Express, so it stays fast and
// dependency-free. The contract:
//   • Every retired public funnel route either 301s to a canonical
//     destination OR returns 410 Gone server-side.
//   • Every canonical v1 public route is registered in App.tsx.
//   • SPA-side legacyRedirects mirrors the server-side LEGACY_REDIRECTS
//     for the cases where both layers must agree (so direct HTTP hits and
//     in-app navigation both route to the same canonical destination).

function read(rel: string): string {
  return fs.readFileSync(path.join(process.cwd(), rel), "utf-8");
}

function extractTuples(src: string, anchor: string): Array<[string, string]> {
  const start = src.indexOf(anchor);
  if (start === -1) return [];
  const slice = src.slice(start, start + 4000);
  const out: Array<[string, string]> = [];
  const re = /\[\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(slice)) !== null) {
    out.push([m[1], m[2]]);
  }
  return out;
}

function extractStringList(src: string, anchor: string): string[] {
  const start = src.indexOf(anchor);
  if (start === -1) return [];
  const slice = src.slice(start, start + 2000);
  const close = slice.indexOf("]");
  if (close === -1) return [];
  const body = slice.slice(0, close);
  const re = /['"]([^'"]+)['"]/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    out.push(m[1]);
  }
  return out;
}

describe("Route map (Website Brief v1.0 §1)", () => {
  const appSrc = read("client/src/LegacyApp.tsx");
  const serverSrc = read("server/routes.ts");
  // Public pages now render the saved prototype, mounted in App.tsx via
  // PEGASUS_URLS.map(...) rather than literal <Route path="..."> tags.
  // Those canonical URLs live in client/src/pegasus/routes.ts (ROUTE_TO_URL),
  // so a route counts as "registered" if it appears either as a literal
  // App.tsx Route OR as a Pegasus URL in that map.
  const pegasusRoutesSrc = read("client/src/pegasus/routes.ts");
  const isRegistered = (route: string): boolean =>
    appSrc.includes(`path="${route}"`) ||
    pegasusRoutesSrc.includes(`'${route}'`) ||
    pegasusRoutesSrc.includes(`"${route}"`);

  const clientRedirects = extractTuples(appSrc, "const legacyRedirects");
  const serverRedirects = extractTuples(serverSrc, "const LEGACY_REDIRECTS");
  const goneRoutes = extractStringList(serverSrc, "const GONE_ROUTES");

  // Empire Doctrine v1.0.1 canonical public routes. Adding to this list
  // forces the App.tsx route table to register them.
  const CANONICAL_ROUTES = [
    "/",
    "/about",
    "/strategy-lab",
    "/projects",
    "/projects/nelson-dr",
    "/development",
    "/marketflow",
    "/marketflow/access",
    "/capital",
    "/connect",
    "/vendor-network",
    "/contact",
    "/disclosures",
    "/privacy",
    "/terms",
    // Amendment 2 §C / §D — /ecosystem (footer-only Audience-B release
    // valve) and /peggy (public Peggy surface) are canonical.
    "/ecosystem",
    "/peggy",
    // Controlling Pegasus prototype owns /buyers as a real "Who We Serve →
    // Buyers" audience page (client/src/pegasus/), so it is canonical, not
    // retired.
    "/buyers",
    // Website Spec v4 (Re-skin) — restored "Who We Serve" audience lanes and
    // What-We-Do surfaces. Master Blueprint v5.1 (§6) renamed the spine —
    // the canonical URLs below; the old /sellers, /dealfinders, and
    // /deal-strategy paths now 301 forward (see legacyRedirects).
    "/property-owners",
    "/deal-partners",
    "/how-we-operate",
    "/our-work",
    "/bring-an-opportunity",
    "/operators",
    "/referral",
    "/work-with-apollo",
  ];

  // Retired routes that MUST exit via either a 301 redirect or a 410 Gone.
  // Public Website v1 (issue #22): /submit-property is canonical again.
  const RETIRED_ROUTES = [
    "/submit",
    "/sell",
    "/submit-deal",
    "/services",
    "/resources",
    "/invest",
    "/partner",
    "/wholesale",
    "/systems",
    // Amendment 2 §C restored /ecosystem as a footer-only Audience-B
    // release valve. Website Structure v1 FINAL §6 preserves it. No
    // longer retired.
    "/dreamspace",
    "/capital-raising",
    "/education",
    "/calculators",
    "/library",
    "/strategy-library",
  ];

  it("registers every canonical public route in App.tsx", () => {
    for (const route of CANONICAL_ROUTES) {
      expect(
        isRegistered(route),
        `Canonical route ${route} is neither a literal App.tsx Route nor a Pegasus URL`,
      ).toBe(true);
    }
  });

  it("retires every legacy route via either a 301 redirect or a 410 Gone", () => {
    const redirectFroms = new Set([
      ...clientRedirects.map(([from]) => from),
      ...serverRedirects.map(([from]) => from),
    ]);
    const gone = new Set(goneRoutes);

    for (const route of RETIRED_ROUTES) {
      const isRedirected = redirectFroms.has(route);
      const isGone = gone.has(route);
      expect(
        isRedirected || isGone,
        `${route} must be either a 301 redirect or a 410 Gone (got neither)`,
      ).toBe(true);
    }
  });

  it("SPA legacyRedirects mirrors the server LEGACY_REDIRECTS for funnel routes", () => {
    // Both maps must agree on the canonical destination for the core
    // submission-funnel collapse so direct HTTP and in-app navigation
    // land on the same URL.
    const FUNNEL_FROMS = [
      "/sell",
      "/submit",
      "/submit-deal",
      "/submit-property",
      "/wholesale",
      "/services",
      "/resources",
      "/invest",
      "/partner",
    ];
    const clientMap = new Map(clientRedirects);
    const serverMap = new Map(serverRedirects);

    for (const from of FUNNEL_FROMS) {
      const c = clientMap.get(from);
      const s = serverMap.get(from);
      expect(c, `client legacyRedirects missing ${from}`).toBeTruthy();
      expect(s, `server LEGACY_REDIRECTS missing ${from}`).toBeTruthy();
      expect(c).toBe(s);
    }
  });

  it("retired routes never appear as canonical Route registrations", () => {
    // Defense-in-depth: a retired route must not also be a live SPA route.
    for (const route of RETIRED_ROUTES) {
      const literal = `path="${route}"`;
      expect(appSrc.includes(literal), `App.tsx must NOT register a Route for retired ${route}`).toBe(false);
    }
  });
});
