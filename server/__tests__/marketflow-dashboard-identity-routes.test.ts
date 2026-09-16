import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routesSource = readFileSync(
  resolve(import.meta.dirname, "../routes.ts"),
  "utf8",
);

function getRouteSource(route: string, nextRoute: string) {
  const start = routesSource.indexOf(`app.get(${JSON.stringify(route)}`);
  expect(start, `missing GET ${route}`).toBeGreaterThanOrEqual(0);

  const end = routesSource.indexOf(`app.get(${JSON.stringify(nextRoute)}`, start);
  expect(end, `missing route after GET ${route}`).toBeGreaterThan(start);

  return routesSource.slice(start, end);
}

describe("MarketFlow dashboard history dual-auth route contract", () => {
  it.each([
    {
      route: "/api/supabase/marketplace/wholesaler/deals",
      nextRoute: "/api/supabase/marketplace/investor/stats",
      nativeLookup: "storage.getWholesaleDealsByUser(userId)",
      fallbackLookup: "supabaseStorage.getWholesaleDealsByExternalUser(userId)",
      resultName: "deals",
    },
    {
      route: "/api/supabase/marketplace/dreamscaper/projects",
      nextRoute: "/api/supabase/marketplace/buyer/stats",
      nativeLookup: "storage.getCapitalProjectsByUser(userId)",
      fallbackLookup: "supabaseStorage.getCapitalProjectsByExternalUser(userId)",
      resultName: "projects",
    },
  ])(
    "$route serves native Supabase identities and Replit external identities",
    ({ route, nextRoute, nativeLookup, fallbackLookup, resultName }) => {
      const source = getRouteSource(route, nextRoute);
      const nativeLookupIndex = source.indexOf(nativeLookup);
      const fallbackGuard = `if (${resultName}.length === 0 && isReplitAuthUser(req))`;
      const fallbackGuardIndex = source.indexOf(fallbackGuard);
      const fallbackLookupIndex = source.indexOf(fallbackLookup);

      expect(source.slice(0, source.indexOf("async"))).toContain(
        "isHybridAuthenticated",
      );
      expect(source).toContain("const userId = getAuthUserId(req)");
      expect(nativeLookupIndex).toBeGreaterThanOrEqual(0);
      expect(fallbackGuardIndex).toBeGreaterThan(nativeLookupIndex);
      expect(fallbackLookupIndex).toBeGreaterThan(fallbackGuardIndex);
      expect(source.indexOf(`res.json(toCamelCase(${resultName}))`)).toBeGreaterThan(
        fallbackLookupIndex,
      );
    },
  );
});
