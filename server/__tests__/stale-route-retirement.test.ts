import { readdirSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { LEGACY_SPA_EXACT_REDIRECTS } from "../../shared/redirects";

const routesSource = readFileSync(
  resolve(import.meta.dirname, "../routes.ts"),
  "utf8",
);

function runtimeClientSource(directory: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.name !== "__tests__")
    .map((entry) => {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) return runtimeClientSource(entryPath);
      return [".ts", ".tsx"].includes(extname(entry.name))
        ? readFileSync(entryPath, "utf8")
        : "";
    })
    .join("\n");
}

const clientSource = runtimeClientSource(
  resolve(import.meta.dirname, "../../client/src"),
);

const RETIRED_MARKETPLACE_DASHBOARD_GETS = [
  "/api/marketplace/wholesaler/stats",
  "/api/marketplace/wholesaler/deals",
  "/api/marketplace/investor/stats",
  "/api/marketplace/investor/saved",
  "/api/marketplace/investor/commitments",
  "/api/marketplace/dreamscaper/stats",
  "/api/marketplace/dreamscaper/projects",
  "/api/marketplace/buyer/stats",
  "/api/marketplace/buyer/saved",
  "/api/marketplace/buyer/offers",
] as const;

describe("stale route retirement", () => {
  it("registers the calculator alias once through the shared legacy map", () => {
    expect(
      LEGACY_SPA_EXACT_REDIRECTS.filter(([from]) => from === "/calculators"),
    ).toEqual([["/calculators", "/strategy-lab?tool=calculators"]]);
    expect(routesSource.match(/["']\/calculators["']/g) ?? []).toHaveLength(0);
    expect(routesSource).toMatch(
      /app\.get\(\s*["']\/strategy-lab\/classic["']/,
    );
  });

  it.each(RETIRED_MARKETPLACE_DASHBOARD_GETS)(
    "has no live client caller or GET handler for %s",
    (endpoint) => {
      expect(clientSource).not.toContain(endpoint);
      expect(routesSource).not.toContain(`app.get("${endpoint}"`);
      expect(routesSource).not.toContain(`app.get('${endpoint}'`);
    },
  );

  it("preserves the live wholesaler JV request handlers and callers", () => {
    expect(routesSource).toContain(
      'app.get("/api/marketplace/wholesaler/jv-requests"',
    );
    expect(routesSource).toContain(
      'app.patch("/api/marketplace/jv-requests/:id"',
    );
    expect(clientSource).toContain("/api/marketplace/wholesaler/jv-requests");
    expect(clientSource).toContain("/api/marketplace/jv-requests/");
  });
});
