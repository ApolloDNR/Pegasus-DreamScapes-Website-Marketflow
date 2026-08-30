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

const capitalIndexSource = readFileSync(
  resolve(
    import.meta.dirname,
    "../../client/src/pages/marketplace-capital.tsx",
  ),
  "utf8",
);

const peggyCharmSource = readFileSync(
  resolve(import.meta.dirname, "../../client/src/components/peggy-charm.tsx"),
  "utf8",
);

const dealflowProjectSource = readFileSync(
  resolve(import.meta.dirname, "../../client/src/pages/dealflow-project.tsx"),
  "utf8",
);

const capitalStudioSource = readFileSync(
  resolve(
    import.meta.dirname,
    "../../client/src/components/capital-raise-investment-studio.tsx",
  ),
  "utf8",
);

const dealActionSource = readFileSync(
  resolve(
    import.meta.dirname,
    "../../client/src/contexts/deal-action-context.tsx",
  ),
  "utf8",
);

const strategyTierSource = readFileSync(
  resolve(
    import.meta.dirname,
    "../../client/src/lib/strategy-tier-ranges.ts",
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
      "No current updates have been posted yet.",
    );
  });

  it("does not invent projected returns when a capital record omits them", () => {
    const capitalSurfaces = `${capitalIndexSource}\n${capitalDetailSource}`;
    expect(capitalSurfaces).not.toContain('projectedReturn || "15-20%"');
    expect(capitalSurfaces).not.toContain(
      "Browse investment opportunities from verified Dreamscapers",
    );
    expect(capitalSurfaces).toContain('projectedReturn || "Not provided"');
  });

  it("removes unsupported ROI, timing, and buyer-vetting claims", () => {
    expect(peggyCharmSource).not.toMatch(/15-20% ROI|3x higher acceptance|40% faster/);
    expect(dealflowProjectSource).not.toContain('project.projectedReturn || "15-20%"');
    expect(dealflowProjectSource).not.toMatch(/project\.holdPeriod \|\| "12-18/);
    expect(strategyTierSource).not.toContain("placed to a vetted buyer");
  });

  it("does not invent capital minimums, preferential treatment, or executable acceptance", () => {
    expect(capitalStudioSource).not.toContain("project.minInvestment || 25000");
    expect(capitalStudioSource).not.toContain("preferred treatment");
    expect(capitalStudioSource).not.toContain("Larger commitments often unlock better terms");
    expect(dealflowProjectSource).not.toContain('data-testid="button-accept-terms"');
    expect(dealActionSource).toContain(
      'if (actionType === "capital_accept") {\n      return <CapitalRelationshipHoldModal',
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
