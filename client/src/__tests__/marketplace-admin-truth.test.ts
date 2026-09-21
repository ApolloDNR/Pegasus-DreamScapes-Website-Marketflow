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
      "homepageContentError",
      "faqsError",
      "testimonialsError",
      "teamError",
      "mediaError",
    ]) {
      expect(source).toContain(errorName);
    }
    expect(source).toContain("Admin data unavailable");
    expect(source).toContain("isAuditLogsResponse");
    expect(source).not.toContain("const displayStats: AdminStats = stats ??");
  });

  it("describes only server-recorded wholesale and capital review events", () => {
    expect(source).toContain(
      'import { REVIEW_AUDIT_ACTION_TYPES } from "@shared/schema";',
    );
    expect(source).not.toContain("const REVIEW_AUDIT_ACTION_TYPES = [");
    expect(source).toContain(
      "Server-recorded wholesale and capital review events only.",
    );
    expect(source).not.toContain(
      "Track all administrative actions on the platform",
    );
    expect(source).not.toContain(
      "Admin actions will appear here once they occur.",
    );
    expect(source).toContain('"deal_review_started"');
    expect(source).toContain('"project_review_started"');
    expect(source).toContain("Deal Review Started");
    expect(source).toContain("Project Review Started");
  });

  it("removes controls that point nowhere or cannot act on the record", () => {
    expect(source).not.toContain('href="/marketflow/admin/settings"');
    expect(source).not.toContain('href="/marketflow/admin/leads"');
    expect(source).not.toContain('<Button size="sm" variant="outline">Contact</Button>');
  });
});
