import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routesSource = readFileSync(
  resolve(import.meta.dirname, "../routes.ts"),
  "utf8",
);

describe("launch security route contract", () => {
  it("does not write onboarding payloads or property addresses to logs", () => {
    expect(routesSource).not.toMatch(
      /console\.(?:log|info|warn|error)\([^;]*profileData/s,
    );
    expect(routesSource).not.toMatch(
      /console\.(?:log|info|warn|error)\([^;]*\.propertyAddress/s,
    );
  });

  it("rate-limits every public buyer and Peggy write route", () => {
    expect(routesSource).toMatch(
      /app\.post\(\s*"\/api\/marketplace\/buyer\/inquiries",\s*publicIntakeRateLimit,/s,
    );
    expect(routesSource).toMatch(
      /app\.post\(\s*"\/api\/peggy\/conversations",\s*publicIntakeRateLimit,/s,
    );
    expect(routesSource).toMatch(
      /app\.post\(\s*"\/api\/peggy\/conversations\/new",\s*publicIntakeRateLimit,/s,
    );
    expect(routesSource).toMatch(
      /app\.post\(\s*"\/api\/peggy\/conversations\/:id\/finish",\s*publicIntakeRateLimit,/s,
    );
    expect(routesSource).toMatch(
      /app\.post\(\s*"\/api\/peggy\/messages\/:id\/feedback",\s*publicIntakeRateLimit,/s,
    );
  });

  it("guards every conversation-specific Peggy route before its handler", () => {
    expect(routesSource).toMatch(
      /app\.get\(\s*"\/api\/peggy\/conversations\/:id",\s*requirePeggyConversationAccess,/s,
    );
    expect(routesSource).toMatch(
      /app\.post\(\s*"\/api\/peggy\/chat",\s*rateLimit\([^)]*\),\s*requirePeggyConversationAccess,/s,
    );
    expect(routesSource).toMatch(
      /app\.post\(\s*"\/api\/peggy\/conversations\/:id\/finish",\s*publicIntakeRateLimit,\s*requirePeggyConversationAccess,/s,
    );
    expect(routesSource).toMatch(
      /app\.post\(\s*"\/api\/peggy\/messages\/:id\/feedback",\s*publicIntakeRateLimit,\s*requirePeggyConversationAccess,/s,
    );
    expect(routesSource).toMatch(
      /app\.get\(\s*"\/api\/peggy\/conversations",\s*isHybridAuthenticated,/s,
    );
  });
});
