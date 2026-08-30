// @vitest-environment node
import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  path.join(process.cwd(), "client/src/pages/marketplace-admin.tsx"),
  "utf8",
);

describe("MarketFlow admin truth contract", () => {
  it("calls the authenticated server routes that actually exist", () => {
    expect(source).not.toContain("/api/marketflow/admin");
    expect(source).toContain("/api/marketplace/admin/stats");
    expect(source).toContain("/api/marketplace/admin/pending");
    expect(source).toContain("/api/marketplace/admin/users");
    expect(source).toContain("/api/marketplace/admin/leads");
  });

  it("does not convert request failures into authoritative zero or empty states", () => {
    for (const errorName of [
      "statsError",
      "pendingError",
      "usersError",
      "leadsError",
      "auditLogsError",
    ]) {
      expect(source).toContain(errorName);
    }
    expect(source).toContain("Admin data unavailable");
    expect(source).not.toContain("const displayStats: AdminStats = stats ??");
  });

  it("removes controls that point nowhere or cannot act on the record", () => {
    expect(source).not.toContain('href="/marketflow/admin/settings"');
    expect(source).not.toContain('href="/marketflow/admin/leads"');
    expect(source).not.toContain('<Button size="sm" variant="outline">Contact</Button>');
  });
});
