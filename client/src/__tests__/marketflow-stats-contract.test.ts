import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { QUERY_KEYS } from "@/lib/queryClient";

const DASHBOARDS = [
  ["wholesaler", "client/src/pages/marketplace-wholesaler.tsx"],
  ["investor", "client/src/pages/marketplace-investor.tsx"],
  ["dreamscaper", "client/src/pages/marketplace-dreamscaper.tsx"],
  ["buyer", "client/src/pages/marketplace-buyer.tsx"],
] as const;

describe("MarketFlow dashboard stats API contract", () => {
  it.each(DASHBOARDS)(
    "%s dashboard uses the shared server-backed stats query key",
    (role, relativePath) => {
      expect(QUERY_KEYS.userStats(role).join("/")).toBe(
        `/api/supabase/marketplace/${role}/stats`,
      );

      const source = fs.readFileSync(
        path.join(process.cwd(), relativePath),
        "utf8",
      );
      expect(source).toContain(`QUERY_KEYS.userStats("${role}")`);
      expect(source).toContain("useAuthenticatedQuery");
      expect(source).not.toContain(
        `/api/supabase/marketflow/${role}/stats`,
      );
    },
  );
});
