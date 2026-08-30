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
      ["post", "/api/marketplace/buyer/offers"],
      ["post", "/api/marketplace/buyer/save"],
      ["post", "/api/marketplace/buyer/inquiries"],
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

  it("wires behavior-tested saved-item write handlers", () => {
    expect(routesSource).toMatch(
      /const savedItemHandlers = createSavedItemRouteHandlers\(/,
    );
    expect(routesSource).toMatch(
      /app\.post\('\/api\/supabase\/saved-items',[\s\S]{0,180}savedItemHandlers\.post\)/,
    );
    expect(routesSource).toMatch(
      /app\.delete\('\/api\/supabase\/saved-items',[\s\S]{0,180}savedItemHandlers\.remove\)/,
    );
  });

  it("resolves reviewed access before new inventory interactions", () => {
    const initiationRoutes = [
      "/api/marketplace/jv-requests",
      "/api/supabase/buyer-offers",
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

  it("retires the legacy investment-interest write instead of accepting capital submissions", () => {
    expect(routesSource).toMatch(
      /app\.post\(\s*["']\/api\/marketplace\/investment-interest["'],\s*rejectCapitalInvestmentInterest\s*\)/,
    );
    expect(routesSource).not.toMatch(
      /app\.post\(\s*["']\/api\/marketplace\/investment-interest["'][\s\S]{0,2000}createInvestmentOffer\(/,
    );
  });

  it("fails every generic capital offer and commitment write closed", () => {
    expect(routesSource).toMatch(
      /app\.post\(\s*["']\/api\/supabase\/capital-commitments["'],\s*rejectCapitalInvestmentInterest\s*\)/,
    );

    const createStart = routesSource.indexOf('app.post("/api/marketflow/offers"');
    const createRoute = routesSource.slice(
      createStart,
      routesSource.indexOf("// Get offers for a deal", createStart),
    );
    expect(createRoute).toContain("isCapitalOfferExecution");
    expect(createRoute.indexOf("isCapitalOfferExecution")).toBeLessThan(
      createRoute.indexOf("storage.createCurrentMarketflowOffer"),
    );

    const respondStart = routesSource.indexOf(
      'app.post("/api/marketflow/offers/:offerId/respond"',
    );
    const respondRoute = routesSource.slice(
      respondStart,
      routesSource.indexOf("// Get negotiation by ID", respondStart),
    );
    expect(respondRoute).toContain("isCapitalOfferExecution");
    expect(respondRoute.indexOf("isCapitalOfferExecution")).toBeLessThan(
      respondRoute.indexOf("storage.respondToCurrentMarketflowOffer"),
    );

    for (const route of [
      "/api/investment-offers",
      "/api/investment-offers/:offerId/accept",
      "/api/investment-offers/:offerId/decline",
      "/api/hq/investment-offers/:id/respond",
    ]) {
      const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(routesSource).toMatch(
        new RegExp(
          `app\\.post\\(\\s*["']${escaped}["'](?:,\\s*isAuthenticated)?(?:,\\s*requireStaffRole)?,\\s*rejectCapitalInvestmentInterest\\s*\\)`,
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

  it("parses listing inquiries before reviewed access and storage", () => {
    expect(routesSource).toMatch(
      /app\.post\(\s*"\/api\/listing-inquiries",\s*isHybridAuthenticated,\s*listingInquiryHandlers\.validateInquiry,\s*loadMarketflowInventoryAccessContext,\s*listingInquiryHandlers\.postInquiry,?\s*\)/s,
    );
  });

  it("wires the behavior-tested listing handlers into the application", () => {
    const factoryStart = routesSource.indexOf(
      "const listingInquiryHandlers = createListingInquiryRouteHandlers({",
    );
    expect(factoryStart).toBeGreaterThanOrEqual(0);
    const factoryTail = routesSource.slice(factoryStart);
    const factoryEndMatch = factoryTail.match(/\n\s*\}\);/);
    expect(factoryEndMatch?.index).toBeDefined();
    if (factoryEndMatch?.index === undefined) {
      throw new Error("listing inquiry handler factory is unterminated");
    }
    const factory = factoryTail.slice(
      0,
      factoryEndMatch.index + factoryEndMatch[0].length,
    );

    expect(factory).toContain("getAuthUserId,");
    expect(factory).toMatch(
      /hasReviewedInventoryAccess:\s*\(res\) =>\s*res\.locals\.canAccessReviewedMarketflowInventory === true/s,
    );
    expect(factory).toMatch(
      /getListing:\s*\(listingId\) => storage\.getListing\(listingId\)/,
    );
    expect(factory).toMatch(
      /canInitiateInquiry:\s*async \(req, res, userId, listingId\) => \{[\s\S]*?resolveLegacyDealAccess\(\s*req,\s*userId,\s*"listing",\s*listingId,?\s*\)[\s\S]*?access && canInitiateLegacyDealInteraction\(access, res\)/s,
    );
    expect(factory).toMatch(
      /createListingInquiry:\s*\(inquiry\) =>\s*storage\.createListingInquiry\(inquiry\)/s,
    );
    expect(routesSource).toMatch(
      /app\.get\(\s*"\/api\/deals\/LISTING\/:id\/context",\s*isHybridAuthenticated,\s*loadMarketflowInventoryAccessContext,\s*listingInquiryHandlers\.getContext,?\s*\)/s,
    );
    const focusedContextIndex = routesSource.search(
      /app\.get\(\s*"\/api\/deals\/LISTING\/:id\/context"/s,
    );
    const genericContextIndex = routesSource.indexOf(
      "app.get('/api/deals/:dealType/:id/context'",
    );
    expect(focusedContextIndex).toBeGreaterThanOrEqual(0);
    expect(genericContextIndex).toBeGreaterThanOrEqual(0);
    expect(focusedContextIndex).toBeLessThan(genericContextIndex);
    expect(routesSource).toMatch(
      /app\.get\(\s*'\/api\/deals\/:dealType\/:id\/context',\s*isHybridAuthenticated,\s*async/s,
    );
    const genericContextEnd = routesSource.indexOf(
      "// --- Buyer Offers (Supabase) ---",
      genericContextIndex,
    );
    expect(genericContextEnd).toBeGreaterThan(genericContextIndex);
    const genericContext = routesSource.slice(
      genericContextIndex,
      genericContextEnd,
    );
    expect(genericContext).not.toMatch(/dealType === ['"]LISTING['"]/);
    expect(genericContext).not.toContain("getListingInquiries");
    expect(genericContext).not.toContain("showingInfo:");
    expect(genericContext).not.toContain(
      "submittedBy: listing.submittedBy",
    );
  });

  it("projects approved deal, listing, project, and public buy-box responses", () => {
    expect(routesSource).toMatch(
      /deals\s*\.filter\(isPublicWholesaleDeal\)\s*\.map\(\(deal\)\s*=>\s*toPublicWholesaleDeal\(\s*deal,\s*userId,\s*canViewerInitiateMarketflowJv\(res\),?\s*\)\s*,?\s*\)/s,
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
      /return res\.json\(\s*toPublicWholesaleDeal\(\s*deal,\s*userId,\s*canViewerInitiateMarketflowJv\(res\),?\s*\),?\s*\)/s,
    );
    expect(routesSource).toMatch(
      /return res\.json\(toPublicListing\(listing\)\)/s,
    );
    expect(routesSource).toMatch(
      /return res\.json\(toPublicCapitalProject\(project\)\)/s,
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
