import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const dealDetailSource = readFileSync(
  resolve(
    import.meta.dirname,
    "../../client/src/pages/marketplace-deal-detail.tsx",
  ),
  "utf8",
);

const capitalDetailSource = readFileSync(
  resolve(
    import.meta.dirname,
    "../../client/src/pages/marketplace-capital-detail.tsx",
  ),
  "utf8",
);

const negotiationAnalyticsSource = readFileSync(
  resolve(
    import.meta.dirname,
    "../../client/src/components/negotiation-analytics.tsx",
  ),
  "utf8",
);

const analyticsPageSource = readFileSync(
  resolve(import.meta.dirname, "../../client/src/pages/my-analytics.tsx"),
  "utf8",
);

const routesSource = readFileSync(
  resolve(import.meta.dirname, "../routes.ts"),
  "utf8",
);

describe("marketplace deal trust copy", () => {
  it("does not present fabricated source ratings or performance claims", () => {
    const launchSources = `${dealDetailSource}\n${capitalDetailSource}\n${negotiationAnalyticsSource}\n${routesSource}`;
    expect(launchSources).not.toContain("4.8 rating");
    expect(launchSources).not.toContain("12 deals");
    expect(launchSources).not.toContain("95% on-time");
    expect(launchSources).not.toContain("Strong Negotiator");
    expect(launchSources).not.toContain("23% ROI potential");
    expect(dealDetailSource).not.toContain("mockUpdates");
    expect(negotiationAnalyticsSource).not.toContain("mockStats");
    expect(negotiationAnalyticsSource).not.toContain("mockInsights");
  });

  it("labels unavailable source details and milestones truthfully", () => {
    expect(dealDetailSource).toContain("Source identity is kept private");
    expect(dealDetailSource).toContain(
      "No verified updates have been posted yet.",
    );
  });

  it("does not fabricate an authenticated analytics identity for guests", () => {
    expect(analyticsPageSource).not.toContain('"demo-user"');
  });

  it.each([
    "/api/analytics/dashboard/:userId?",
    "/api/analytics/activity/:userId?",
    "/api/analytics/market-insights",
    "/api/analytics/negotiations/:userId?",
    "/api/analytics/negotiation-insights/:userId?",
    "/api/ai/curated-deals/:userId?",
    "/api/watchlists/shared/:userId?",
    "/api/watchlists/shared/:watchlistId/deals",
    "/api/documents/:dealId/:dealType?",
  ])("protects unfinished GET surface %s with hybrid auth", (route) => {
    const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    expect(routesSource).toMatch(
      new RegExp(
        `app\\.get\\(\\s*"${escapedRoute}"\\s*,\\s*isHybridAuthenticated\\s*,`,
        "s",
      ),
    );
  });

  it.each([
    "/api/ai/curation-feedback",
    "/api/watchlists/shared",
    "/api/user/onboarding",
    "/api/documents/upload",
  ])("protects unfinished POST surface %s with hybrid auth", (route) => {
    const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    expect(routesSource).toMatch(
      new RegExp(
        `app\\.post\\(\\s*"${escapedRoute}"\\s*,\\s*isHybridAuthenticated\\s*,`,
        "s",
      ),
    );
  });
});
