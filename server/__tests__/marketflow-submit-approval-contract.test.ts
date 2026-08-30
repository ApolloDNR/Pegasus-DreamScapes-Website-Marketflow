import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(
  path.join(process.cwd(), "server/routes.ts"),
  "utf8",
);

function declarationFor(route: string): string {
  const start = source.indexOf(`app.post(${JSON.stringify(route)}`);
  if (start < 0) {
    const singleQuotedStart = source.indexOf(`app.post('${route}'`);
    expect(singleQuotedStart, `missing POST ${route}`).toBeGreaterThan(-1);
    return source.slice(singleQuotedStart, source.indexOf("async", singleQuotedStart));
  }
  return source.slice(start, source.indexOf("async", start));
}

describe("MarketFlow submission approval boundary", () => {
  it.each([
    "/api/supabase/wholesale-deals",
    "/api/wholesale-deals",
    "/api/listings",
  ])(
    "requires verified hybrid identity and governed MarketFlow access before POST %s",
    (route) => {
      const declaration = declarationFor(route);

      expect(declaration).toContain("isHybridAuthenticated");
      expect(declaration).toContain("requireMarketflowInventoryAccess");
    },
  );
});
