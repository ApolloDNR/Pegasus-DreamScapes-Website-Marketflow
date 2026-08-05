import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  PEGASUS_URLS,
  isPegasusUrl,
  isStandaloneChromeUrl,
  isSolidNavUrl,
  isNotFoundUrl,
} from "@/pegasus/routes";

// Public-chrome parity net (Task #234).
//
// Whether a public page wears the new premium pegasus chrome (the prototype
// shell OR the PegasusStandaloneShell) or silently falls back to the legacy
// global Navigation/Footer is decided in App.tsx's AppShell purely from the
// classification helpers in client/src/pegasus/routes.ts:
//
//   const pegasus    = isPegasusUrl(location);
//   const standalone = !pegasus && (isStandaloneChromeUrl(location) || isNotFoundUrl(location));
//   const legacy     = !pegasus && !standalone;
//
// So a public route gets premium chrome iff
//   isPegasusUrl(url) || isStandaloneChromeUrl(url)   (known routes)
// and an UNKNOWN public url still gets premium chrome via isNotFoundUrl().
//
// The failure mode this guards: someone adds a new public page to App.tsx as
// a `<Route path="X" component={...}>` but forgets to add it to the
// standalone-chrome lists in routes.ts. Nothing else fails — the page just
// quietly renders the retired legacy chrome. This test derives the public
// route set straight from App.tsx and asserts every one classifies as
// pegasus/standalone, so the omission fails CI instead of shipping.

function read(rel: string): string {
  return fs.readFileSync(path.join(process.cwd(), rel), "utf-8");
}

// Every statically-mounted `<Route path="X" component={...}>` in App.tsx.
// Redirect routes (`<Route path="X">{() => <Redirect/>}</Route>`) and
// AuthGuard-wrapped routes use the children-render form (no `component=`),
// so this regex naturally excludes them.
function componentRoutesFromApp(): string[] {
  const appSrc = read("client/src/LegacyApp.tsx");
  const re = /<Route\s+path="([^"]+)"\s+component=/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(appSrc)) !== null) {
    out.push(m[1]);
  }
  return out;
}

// Surfaces that intentionally keep the legacy global chrome and are therefore
// out of scope for the public-premium-chrome contract:
//   • /login, /signup — auth forms.
//   • /admin/*        — admin-only surfaces (own in-page auth).
//   • private /marketflow/* operator and auth surfaces. The landing,
//     request-access page, and public criteria belong to the premium public
//     journey and must not be blanket-excluded with the private product.
//   • /snapshot/*     — shared-analysis snapshot links are functional output
//                       surfaces (an operator-generated share view), not part
//                       of the public marketing site, and carry their own
//                       layout rather than the marketing chrome.
// Dynamic :param routes are excluded only from the literal-URL classification
// assertions (no canned id), but their prefix is still covered below.
const AUTH_FORMS = new Set(["/login", "/signup"]);
const PUBLIC_MARKETFLOW = new Set(["/marketflow/access", "/marketflow/buyboxes"]);
const isAdmin = (u: string) => u.startsWith("/admin");
const isPrivateMarketflow = (u: string) =>
  u.startsWith("/marketflow/") && !PUBLIC_MARKETFLOW.has(u);
const isSnapshot = (u: string) => u.startsWith("/snapshot");
const isDynamic = (u: string) => u.includes(":");

function isExcluded(u: string): boolean {
  return AUTH_FORMS.has(u) || isAdmin(u) || isPrivateMarketflow(u) || isSnapshot(u);
}

// A url wears the new premium chrome (prototype OR standalone) — i.e. NOT the
// retired legacy global Navigation/Footer.
function hasPremiumChrome(u: string): boolean {
  return isPegasusUrl(u) || isStandaloneChromeUrl(u);
}

describe("Public routes never fall back to the retired legacy chrome (Task #234)", () => {
  // The union of public surfaces we hold to the premium-chrome contract:
  // prototype-owned URLs (mounted via PEGASUS_URLS.map) + the statically
  // mounted standalone/functional component routes in App.tsx.
  const componentRoutes = componentRoutesFromApp();
  const publicComponentRoutes = componentRoutes.filter(
    (u) => !isExcluded(u) && !isDynamic(u),
  );
  const publicRoutes = Array.from(
    new Set<string>([...PEGASUS_URLS, ...publicComponentRoutes]),
  );

  it("App.tsx still mounts static component routes in the expected form", () => {
    // Non-vacuous guard: if the extraction breaks (regex/App.tsx shape change)
    // the suite must not silently pass with an empty set.
    expect(componentRoutes.length).toBeGreaterThan(15);
    expect(publicRoutes.length).toBeGreaterThanOrEqual(20);
  });

  it("keeps the public MarketFlow continuation pages in premium chrome", () => {
    PUBLIC_MARKETFLOW.forEach((url) => {
      expect(componentRoutes).toContain(url);
      expect(hasPremiumChrome(url)).toBe(true);
    });
    expect(isSolidNavUrl("/marketflow/access")).toBe(true);
    expect(isSolidNavUrl("/marketflow/buyboxes")).toBe(false);
  });

  it.each(publicRoutes.map((u) => [u]))(
    "%s resolves to pegasus/standalone chrome, not legacy",
    (url) => {
      expect(
        hasPremiumChrome(url),
        `${url} is a public route but classifies as LEGACY chrome — add it to the ` +
          `standalone-chrome lists in client/src/pegasus/routes.ts ` +
          `(STANDALONE_DARK_HERO / STANDALONE_SOLID_NAV or a *_PREFIX), ` +
          `or, if it is genuinely an admin/marketflow/auth surface, exclude it here.`,
      ).toBe(true);
    },
  );

  // The dynamic-detail routes can't be classified by exact url, but their
  // prefixes must still resolve to premium chrome so e.g. /projects/anything
  // and /library/anything never drop to legacy. Verify with a sample slug.
  const dynamicPublicRoutes = componentRoutes.filter(
    (u) => isDynamic(u) && !isExcluded(u),
  );
  it.each(dynamicPublicRoutes.map((u) => [u]))(
    "dynamic public route %s resolves to premium chrome for a sample slug",
    (pattern) => {
      const sample = pattern.replace(/:[^/]+/g, "sample-slug");
      expect(
        hasPremiumChrome(sample),
        `${pattern} (sampled as ${sample}) is a public detail route but ` +
          `classifies as LEGACY chrome — add its prefix to a *_PREFIX list in ` +
          `client/src/pegasus/routes.ts.`,
      ).toBe(true);
    },
  );

  it("an unknown public URL still gets premium chrome (404 wears standalone)", () => {
    // New top-level public paths that aren't yet wired render the catch-all
    // NotFound page, which must wear the unified premium chrome — never legacy.
    const unknown = "/some-brand-new-public-page";
    expect(isPegasusUrl(unknown)).toBe(false);
    expect(isStandaloneChromeUrl(unknown)).toBe(false);
    expect(
      isNotFoundUrl(unknown),
      "an unknown top-level path must classify as a 404 (which renders premium standalone chrome)",
    ).toBe(true);
  });

  it("a known route is never misclassified as a 404", () => {
    for (const url of publicRoutes) {
      expect(
        isNotFoundUrl(url),
        `${url} is a real route but isNotFoundUrl() reports it as a 404 — ` +
          `its top-level segment is missing from KNOWN_TOP_SEGMENTS in routes.ts`,
      ).toBe(false);
    }
  });

  it("solid-nav classification is a subset of standalone chrome", () => {
    // isSolidNavUrl only meaningfully applies to standalone-chrome pages
    // (it tunes the standalone shell's nav). Any url it flags must also be a
    // standalone-chrome url, or the flag is dead.
    const solidButNotStandalone = publicRoutes.filter(
      (u) => isSolidNavUrl(u) && !isStandaloneChromeUrl(u),
    );
    expect(
      solidButNotStandalone,
      `these urls are flagged solid-nav but aren't standalone-chrome: ${solidButNotStandalone.join(", ")}`,
    ).toEqual([]);
  });
});
