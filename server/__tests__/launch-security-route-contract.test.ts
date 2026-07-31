import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routesSource = readFileSync(
  resolve(import.meta.dirname, "../routes.ts"),
  "utf8",
);

const offerStudioSource = readFileSync(
  resolve(
    import.meta.dirname,
    "../../client/src/pages/marketflow/offer-studio.tsx",
  ),
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

  it("does not expose the legacy client-selected WebSocket channel", () => {
    expect(routesSource).not.toMatch(/new WebSocketServer/);
    expect(routesSource).not.toMatch(
      /message\.payload\?\.userId|subscribedUserId/,
    );
    expect(routesSource).not.toMatch(
      /\(app as any\)\.broadcastToUser\s*=/,
    );
  });

  it("guards canonical MarketFlow offer reads and recipient-only responses", () => {
    expect(routesSource).toMatch(
      /app\.get\(\s*"\/api\/marketflow\/offers\/deal\/:lane\/:dealId",\s*isHybridAuthenticated,/s,
    );
    expect(routesSource).toMatch(
      /filterMarketflowOffersForUser\(userId,\s*offers\)/s,
    );
    expect(routesSource).toMatch(
      /app\.get\(\s*"\/api\/marketflow\/offers\/:offerId",\s*isHybridAuthenticated,/s,
    );
    expect(routesSource).toMatch(
      /canAccessMarketflowOffer\(userId,\s*offer\)/s,
    );
    expect(routesSource).toMatch(
      /if\s*\(offer\.recipientId !== userId\)\s*\{\s*return res\.status\(404\)/s,
    );
  });

  it("keeps raw user profile reads authenticated and self-only", () => {
    const profileRouteStart = routesSource.indexOf(
      "app.get('/api/supabase/profile/:userId'",
    );
    const profileRoute = routesSource.slice(
      profileRouteStart,
      routesSource.indexOf("// Update user profile", profileRouteStart),
    );

    expect(profileRoute).toMatch(/isHybridAuthenticated/);
    expect(profileRoute).toMatch(/getAuthUserId\(req\)/);
    expect(profileRoute).toMatch(/canReadUserProfile\(/);
    expect(profileRoute).not.toMatch(/hasMarketflowStaffAccess\(/);
  });

  it("derives canonical offer recipients from server-side deal ownership", () => {
    const createRouteStart = routesSource.indexOf(
      'app.post("/api/marketflow/offers"',
    );
    const createRoute = routesSource.slice(
      createRouteStart,
      routesSource.indexOf("// Get offers for a deal", createRouteStart),
    );
    expect(createRoute).toMatch(/storage\.getMarketflowNegotiationsByDeal\(/);
    expect(createRoute).toMatch(/resolveLegacyDealAccess\(/);
    expect(createRoute).toMatch(
      /const recipientId = existingNegotiation[\s\S]*: access\.ownerId;/,
    );
    expect(createRoute).toMatch(/posterId: access\.ownerId/);
    expect(createRoute).not.toMatch(
      /access\.isOwner\s*\|\|\s*normalizedLane === "LISTING"/,
    );
    expect(createRoute).not.toMatch(
      /const\s*\{[^}]*recipientId[^}]*\}\s*=\s*req\.body/s,
    );
    expect(offerStudioSource).not.toMatch(
      /recipientId\s*,\s*\n\s*offerKind:/,
    );
  });

  it("keeps canonical negotiation messages participant-only and text-only", () => {
    const messageRouteStart = routesSource.indexOf(
      'app.post("/api/marketflow/negotiations/:negotiationId/messages"',
    );
    const messageRoute = routesSource.slice(
      messageRouteStart,
      routesSource.indexOf("// Mark messages as read", messageRouteStart),
    );
    expect(messageRoute).toMatch(/content\.length > 5_000/);
    expect(messageRoute).toMatch(/messageType: "text"/);
    expect(messageRoute).toMatch(/relatedOfferId: null/);
    expect(messageRoute).toMatch(
      /status\(404\)\.json\(\{ message: "Negotiation not found" \}\)/,
    );
  });
});
