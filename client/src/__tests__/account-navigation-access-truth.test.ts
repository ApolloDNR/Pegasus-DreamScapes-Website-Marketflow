import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readClientSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), "client/src", relativePath), "utf8");

describe("account navigation respects governed MarketFlow access", () => {
  it.each(["components/navigation.tsx", "components/footer.tsx"])(
    "%s never sends a generic preview account to the retired generic dashboard",
    (relativePath) => {
      const source = readClientSource(relativePath);

      expect(source).toContain("hasGovernedMarketflowAccess");
      expect(source).not.toContain('href="/marketflow/dashboard"');
      expect(source).toContain('href="/marketflow/access"');
    },
  );

  it("shows messages and the role dashboard only inside the approved navigation branch", () => {
    const source = readClientSource("components/navigation.tsx");
    const approvedBranch = source.slice(
      source.indexOf("{hasMarketflowAccess ? ("),
      source.indexOf("{isAdmin &&"),
    );

    expect(approvedBranch).toContain("dashboardHref");
    expect(approvedBranch).toContain('href="/marketflow/messages"');
    expect(approvedBranch).toContain('href="/marketflow/access"');
  });

  it("never treats a self-selected display name as an administrator identity", () => {
    const authSource = readClientSource("contexts/supabase-auth-context.tsx");

    expect(authSource).not.toContain("profile?.display_name?.toLowerCase()");
  });
});
