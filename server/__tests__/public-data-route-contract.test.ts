import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routesSource = readFileSync(
  resolve(import.meta.dirname, "../routes.ts"),
  "utf8",
);

describe("reviewed inventory data route contract", () => {
  it("keeps marketing projects and retail listings public", () => {
    expect(routesSource).toMatch(
      /app\.get\("\/api\/projects",\s*async/s,
    );
    expect(routesSource).toMatch(
      /app\.get\("\/api\/projects\/:slug",\s*async/s,
    );
    expect(routesSource).toMatch(
      /app\.get\("\/api\/retail-listings",\s*async/s,
    );
    expect(routesSource).toMatch(
      /app\.get\("\/api\/retail-listings\/:slug",\s*async/s,
    );
  });

  it("guards private MarketFlow inventory reads with hybrid auth and reviewed access", () => {
    const protectedReads = [
      "/api/wholesale-deals",
      "/api/wholesale-deals-active",
      "/api/wholesale-deals/:id",
      "/api/listings",
      "/api/listings/:id",
      "/api/capital-projects",
      "/api/capital-projects/active",
      "/api/capital-projects/:id",
      "/api/marketplace/deals",
      "/api/marketplace/deals/:id",
      "/api/marketplace/projects",
      "/api/marketplace/projects/:id",
      "/api/supabase/wholesale-deals",
      "/api/supabase/wholesale-deals/:id",
      "/api/supabase/capital-projects",
      "/api/supabase/capital-projects/:id",
      "/api/supabase/listings",
      "/api/supabase/listings/:id",
    ];

    for (const route of protectedReads) {
      const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(routesSource).toMatch(
        new RegExp(
          `app\\.get\\(\\s*["']${escaped}["'],\\s*isHybridAuthenticated,\\s*requireMarketflowInventoryAccess,`,
          "s",
        ),
      );
    }
  });

  it("loads reviewed access context on every mixed inventory route", () => {
    const mixedRoutes = [
      ["post", "/api/portal/buyer/saved-properties"],
      ["get", "/api/portal/buyer/saved-properties"],
      ["post", "/api/portal/buyer/offers"],
      ["post", "/api/deals/action"],
      ["get", "/api/deals/saved"],
      ["get", "/api/deals/liked"],
      ["get", "/api/marketplace/buyer/saved"],
      ["post", "/api/marketplace/buyer/offers"],
      ["post", "/api/marketplace/buyer/save"],
      ["post", "/api/marketplace/buyer/inquiries"],
      ["get", "/api/marketplace/investor/stats"],
      ["get", "/api/marketplace/investor/saved"],
      ["get", "/api/marketplace/buyer/stats"],
      ["get", "/api/supabase/saved-items"],
      ["post", "/api/supabase/saved-items"],
      ["delete", "/api/supabase/saved-items"],
      ["get", "/api/supabase/saved-items/check"],
      ["get", "/api/supabase/marketplace/investor/stats"],
      ["get", "/api/supabase/marketplace/buyer/stats"],
      ["get", "/api/supabase/marketplace/saved"],
    ] as const;

    for (const [method, route] of mixedRoutes) {
      const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(routesSource).toMatch(
        new RegExp(
          `app\\.${method}\\(\\s*["']${escaped}["'][\\s\\S]{0,160}loadMarketflowInventoryAccessContext,`,
        ),
      );
    }
  });

  it("resolves reviewed access before new inventory interactions", () => {
    const initiationRoutes = [
      "/api/marketplace/jv-requests",
      "/api/marketplace/investment-interest",
      "/api/supabase/capital-commitments",
      "/api/supabase/buyer-offers",
      "/api/listing-inquiries",
      "/api/capital-projects/:projectId/term-sheet-preview",
      "/api/marketflow/offers",
    ];

    for (const route of initiationRoutes) {
      const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(routesSource).toMatch(
        new RegExp(
          `app\\.post\\(\\s*["']${escaped}["'],\\s*isHybridAuthenticated,\\s*loadMarketflowInventoryAccessContext,`,
          "s",
        ),
      );
    }
  });

  it("preserves authenticated owner and participant reads without beta preemption", () => {
    const participantReads = [
      "/api/listings/:id/inquiries",
      "/api/capital-projects/:projectId/offers",
      "/api/capital-projects/:projectId/commitments",
      "/api/wholesale-deals/:dealId/documents",
      "/api/wholesale-deals/:dealId/offers",
      "/api/marketplace/investor/commitments",
      "/api/supabase/marketplace/investor/commitments",
      "/api/supabase/marketplace/buyer/offers",
    ];

    for (const route of participantReads) {
      const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(routesSource).toMatch(
        new RegExp(
          `app\\.get\\(\\s*["']${escaped}["'],\\s*isHybridAuthenticated,`,
          "s",
        ),
      );
      expect(routesSource).not.toMatch(
        new RegExp(
          `app\\.get\\(\\s*["']${escaped}["'],\\s*isHybridAuthenticated,\\s*requireMarketflowInventoryAccess,`,
          "s",
        ),
      );
    }

    expect(routesSource).toMatch(
      /app\.get\("\/api\/capital-projects\/:projectId\/milestones",\s*isHybridAuthenticated,\s*loadMarketflowInventoryAccessContext,/s,
    );
  });

  it("uses hybrid identity and rejects owner-initiated reviewed interactions", () => {
    expect(routesSource).toMatch(
      /app\.post\("\/api\/capital-projects\/:projectId\/term-sheet-preview"[\s\S]*?const userId = getAuthUserId\(req\);[\s\S]*?canInitiateLegacyDealInteraction\(access, res\)/,
    );
    expect(routesSource).toMatch(
      /app\.post\("\/api\/marketplace\/buyer\/inquiries"[\s\S]*?const userId = getAuthUserId\(req\);[\s\S]*?canInitiateLegacyDealInteraction\(access, res\)/,
    );
    expect(routesSource).toMatch(
      /app\.post\('\/api\/portal\/buyer\/offers'[\s\S]*?canInitiateLegacyDealInteraction\(access, res\)/,
    );
    expect(routesSource).toMatch(
      /app\.post\("\/api\/marketplace\/buyer\/offers"[\s\S]*?canInitiateLegacyDealInteraction\(access, res\)/,
    );
  });

  it("projects approved deal, listing, project, and public buy-box responses", () => {
    expect(routesSource).toMatch(
      /deals\.filter\(isPublicWholesaleDeal\)\.map\(toPublicWholesaleDeal\)/s,
    );
    expect(routesSource).toMatch(
      /activeListings\.filter\(isPublicListing\)\.map\(toPublicListing\)/s,
    );
    expect(routesSource).toMatch(
      /projects\.filter\(isPublicCapitalProject\)\.map\(toPublicCapitalProject\)/s,
    );
    expect(routesSource).toMatch(
      /\.map\(toPublicInvestorWantedDeal\)/s,
    );
  });

  it("does not return full rows from public legacy detail aliases", () => {
    expect(routesSource).toMatch(
      /return res\.json\(toPublicWholesaleDeal\(deal\)\)/s,
    );
    expect(routesSource).toMatch(
      /return res\.json\(toPublicListing\(listing\)\)/s,
    );
    expect(routesSource).toMatch(
      /return res\.json\(toPublicCapitalProject\(project\)\)/s,
    );
    expect(routesSource).toMatch(
      /return res\.json\(toPublicUserProfile\(user\)\)/s,
    );
  });

  it("keeps sensitive PDFs and user activity behind verified identity", () => {
    expect(routesSource).toMatch(
      /app\.get\("\/api\/pdf\/wholesale-deal\/:id",\s*isHybridAuthenticated,/s,
    );
    expect(routesSource).toMatch(
      /app\.get\("\/api\/pdf\/capital-project\/:id",\s*isHybridAuthenticated,/s,
    );
    expect(routesSource).toMatch(
      /app\.get\("\/api\/users\/:userId\/activity",\s*isHybridAuthenticated,/s,
    );
  });
});
