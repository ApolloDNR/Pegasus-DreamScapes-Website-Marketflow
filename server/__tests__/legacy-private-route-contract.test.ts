import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routesSource = readFileSync(
  resolve(import.meta.dirname, "../routes.ts"),
  "utf8",
);

describe("legacy private route contract", () => {
  it.each([
    "/api/listings/:id/inquiries",
    "/api/negotiations/:id/thread",
    "/api/my-negotiations",
    "/api/deal-messages/:dealType/:dealId",
    "/api/deal-messages/:dealType/:dealId/unread",
    "/api/wholesale-deals/:dealId/documents",
    "/api/wholesale-deals/:dealId/offers",
    "/api/capital-projects/:projectId/offers",
    "/api/capital-projects/:projectId/commitments",
  ])("requires hybrid authentication for %s", (route) => {
    const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    expect(routesSource).toMatch(
      new RegExp(
        `app\\.get\\(\\s*"${escapedRoute}"\\s*,\\s*isHybridAuthenticated\\s*,`,
        "s",
      ),
    );
  });

  it.each([
    "/api/negotiations",
    "/api/negotiations/:id/respond",
    "/api/deal-messages",
    "/api/wholesale-deals/:dealId/offers",
  ])("requires hybrid authentication for POST %s", (route) => {
    const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    expect(routesSource).toMatch(
      new RegExp(
        `app\\.post\\(\\s*"${escapedRoute}"\\s*,\\s*isHybridAuthenticated\\s*,`,
        "s",
      ),
    );
  });

  it("constrains the deal-wide negotiation route so it cannot shadow threads", () => {
    expect(routesSource).toMatch(
      /app\.get\(\s*"\/api\/negotiations\/:dealType\/:dealId\(\\\\d\+\)"\s*,\s*isHybridAuthenticated\s*,/s,
    );
  });

  it("filters participant reads rather than returning other parties' records", () => {
    expect(routesSource).toMatch(
      /filterLegacyListingInquiriesForUser\(\s*userId,\s*inquiries,/s,
    );
    expect(routesSource).toMatch(
      /filterLegacyNegotiationsForUser\(\s*userId,\s*negotiations,?\s*\)/s,
    );
    expect(routesSource).toMatch(
      /const visibleThread = filterLegacyNegotiationsForUser\(userId,\s*thread\)/s,
    );
    expect(routesSource).toMatch(
      /filterLegacyWholesaleOffersForUser\(userId,\s*offers\)/s,
    );
    expect(routesSource).toMatch(
      /filterLegacyDocumentsForParticipant\(documents\)/s,
    );
  });

  it("keeps replayable legacy wholesale-offer mutations disabled", () => {
    for (const [start, end] of [
      [
        "app.post('/api/supabase/wholesale-offers'",
        "app.get('/api/supabase/wholesale-deals/:dealId/negotiations'",
      ],
      [
        "app.patch('/api/supabase/wholesale-offers/:id/status'",
        "// --- Listings (Supabase) ---",
      ],
      [
        'app.post("/api/wholesale-deals/:dealId/offers"',
        "// Update offer status",
      ],
      [
        'app.patch("/api/wholesale-offers/:id/status"',
        "// Counter an offer",
      ],
      [
        'app.post("/api/wholesale-offers/:id/counter"',
        "// ============== PDF GENERATION ROUTES",
      ],
    ]) {
      const routeStart = routesSource.indexOf(start);
      const route = routesSource.slice(
        routeStart,
        routesSource.indexOf(end, routeStart),
      );
      expect(route).toContain("res.status(501)");
      expect(route).toContain("MarketFlow Offer Studio");
      expect(route).not.toContain("createWholesaleDealOffer(");
      expect(route).not.toContain("updateWholesaleOfferStatus(");
      expect(route).not.toContain("updateWholesaleDealOfferStatus(");
      expect(route).not.toContain("counterWholesaleDealOffer(");
    }
  });

  it("checks ownership before deleting a legacy wholesale document", () => {
    const deleteRoute = routesSource.slice(
      routesSource.indexOf('app.delete("/api/wholesale-deal-documents/:id"'),
      routesSource.indexOf("// Deal Analyzer Routes"),
    );
    expect(
      deleteRoute.indexOf("canDeleteLegacyWholesaleDocument"),
    ).toBeLessThan(
      deleteRoute.indexOf("deleteWholesaleDealDocument(id)"),
    );
  });

  it("keeps legacy negotiation mutations read-only", () => {
    const createRoute = routesSource.slice(
      routesSource.indexOf('app.post("/api/negotiations"'),
      routesSource.indexOf("// Get negotiation thread"),
    );
    expect(createRoute).toContain("res.status(501)");
    expect(createRoute).toContain("Legacy negotiations are read-only");
    expect(createRoute).not.toContain("storage.createDealNegotiation(");

    const respondRoute = routesSource.slice(
      routesSource.indexOf('app.post("/api/negotiations/:id/respond"'),
      routesSource.indexOf("// Deal Messages (Chat) Routes"),
    );
    expect(respondRoute).toContain("res.status(501)");
    expect(respondRoute).not.toContain("storage.updateNegotiationStatus(");
  });

  it("keeps the unsafe deal-wide legacy chat disabled", () => {
    const readRouteStart = routesSource.indexOf(
      'app.get("/api/deal-messages/:dealType/:dealId"',
    );
    const readRoute = routesSource.slice(
      readRouteStart,
      routesSource.indexOf("// Send a message", readRouteStart),
    );
    const createRouteStart = routesSource.indexOf(
      'app.post("/api/deal-messages"',
    );
    const createRoute = routesSource.slice(
      createRouteStart,
      routesSource.indexOf("// Get unread message count", createRouteStart),
    );
    const unreadRouteStart = routesSource.indexOf(
      'app.get("/api/deal-messages/:dealType/:dealId/unread"',
    );
    const unreadRoute = routesSource.slice(
      unreadRouteStart,
      routesSource.indexOf(
        "// Wholesale Deal Documents Routes",
        unreadRouteStart,
      ),
    );
    for (const route of [readRoute, createRoute, unreadRoute]) {
      expect(route).toContain("res.status(501)");
      expect(route).toContain("Legacy deal chat is unavailable");
    }
    expect(readRoute).not.toContain("storage.getDealMessages(");
    expect(readRoute).not.toContain("storage.markDealMessagesRead(");
    expect(createRoute).not.toContain("storage.createDealMessage(");
    expect(unreadRoute).not.toContain("storage.getUnreadDealMessageCount(");
  });

  it("keeps non-persistent quick negotiation actions disabled", () => {
    const acceptRoute = routesSource.slice(
      routesSource.indexOf("app.post('/api/negotiations/accept'"),
      routesSource.indexOf("app.post('/api/negotiations/counter'"),
    );
    const counterRoute = routesSource.slice(
      routesSource.indexOf("app.post('/api/negotiations/counter'"),
      routesSource.indexOf("// --- Notifications (Supabase) ---"),
    );
    for (const route of [acceptRoute, counterRoute]) {
      expect(route).toContain("res.status(501)");
      expect(route).not.toContain("createNotification(");
      expect(route).not.toContain("success: true");
    }
  });

  it("keeps replayable legacy investment-offer mutations relationship-only", () => {
    for (const route of [
      "/api/investment-offers/:offerId/accept",
      "/api/investment-offers/:offerId/decline",
      "/api/investment-offers",
      "/api/hq/investment-offers/:id/respond",
    ]) {
      const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(routesSource).toMatch(
        new RegExp(
          `app\\.post\\(\\s*["']${escapedRoute}["']\\s*,\\s*rejectCapitalInvestmentInterest\\s*\\)`,
          "s",
        ),
      );
    }
  });

  it("does not expose draft capital-project milestones anonymously", () => {
    const milestoneRoute = routesSource.slice(
      routesSource.indexOf(
        'app.get("/api/capital-projects/:projectId/milestones"',
      ),
      routesSource.indexOf("// Create milestone"),
    );
    expect(milestoneRoute).toMatch(/isPublicCapitalProject\(project\)/);
    expect(milestoneRoute).toMatch(/resolveLegacyDealAccess\(/);
    expect(milestoneRoute).toMatch(
      /status\(404\)\.json\(\{ message: "Capital project not found" \}\)/,
    );
  });
});
