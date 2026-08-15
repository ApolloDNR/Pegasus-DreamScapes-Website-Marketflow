import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routesSource = readFileSync(
  resolve(import.meta.dirname, "../routes.ts"),
  "utf8",
);
const peggyIdentityPath = resolve(import.meta.dirname, "../peggy-route-auth.ts");
const peggyIdentitySource = existsSync(peggyIdentityPath)
  ? readFileSync(peggyIdentityPath, "utf8")
  : "";
const peggySource = readFileSync(
  resolve(import.meta.dirname, "../peggy.ts"),
  "utf8",
);

function sliceBetweenOnce(
  source: string,
  start: string,
  end: string,
  label: string,
): string {
  const startIndex = source.indexOf(start);
  expect(startIndex, `${label}: missing start anchor`).toBeGreaterThanOrEqual(0);
  expect(source.lastIndexOf(start), `${label}: duplicate start anchor`).toBe(startIndex);
  const endIndex = source.indexOf(end, startIndex + start.length);
  expect(endIndex, `${label}: missing end anchor`).toBeGreaterThan(startIndex);
  expect(source.lastIndexOf(end), `${label}: duplicate end anchor`).toBe(endIndex);
  return source.slice(startIndex, endIndex);
}

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
    expect(peggyIdentitySource).toMatch(
      /app\.post\(\s*"\/api\/peggy\/conversations",\s*dependencies\.noStore,\s*dependencies\.publicCreateRateLimit,/s,
    );
    expect(peggyIdentitySource).toMatch(
      /app\.post\(\s*"\/api\/peggy\/conversations\/new",\s*dependencies\.noStore,\s*dependencies\.publicCreateRateLimit,/s,
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
  it("composes the focused Peggy identity registrar exactly once", () => {
    expect(peggyIdentitySource, "Task 4A must create focused registrar").not.toBe("");
    for (const path of [
      "/api/peggy/conversations",
      "/api/peggy/conversations/new",
      "/api/peggy/analyze-calculator",
    ]) {
      expect(peggyIdentitySource.split(`"${path}"`)).toHaveLength(2);
    }
    const calculatorRoute = sliceBetweenOnce(
      peggyIdentitySource,
      'app.post(\n    "/api/peggy/analyze-calculator",',
      "\n  );\n}",
      "calculator registration",
    );
    const ordered = [
      "dependencies.noStore",
      "dependencies.calculatorRateLimit",
      "dependencies.isHybridAuthenticated",
      "async (req, res)",
    ].map((anchor) => calculatorRoute.indexOf(anchor));
    expect(ordered.every((index) => index >= 0)).toBe(true);
    expect(ordered).toEqual([...ordered].sort((a, b) => a - b));
    expect(calculatorRoute.indexOf("dependencies.parseCalculatorRequest(req.body)")).toBeLessThan(
      calculatorRoute.indexOf("dependencies.getVerifiedPeggyUserId(req)"),
    );
    expect(calculatorRoute.indexOf("dependencies.getVerifiedPeggyUserId(req)")).toBeLessThan(
      calculatorRoute.indexOf("dependencies.randomUUID()"),
    );
  });

  it("wires real auth-normalized production dependencies and replaceable parser", () => {
    expect(
      routesSource.match(/import \{ randomUUID \} from "node:crypto";/g),
    ).toHaveLength(1);
    expect(
      routesSource.match(
        /import \{ registerPeggyIdentityRoutes \} from "\.\/peggy-route-auth";/g,
      ),
    ).toHaveLength(1);
    expect(
      routesSource.match(
        /import \{ parsePeggyCalculatorRequest \} from "@shared\/peggy-calculator";/g,
      ),
    ).toHaveLength(1);
    const wiring = sliceBetweenOnce(
      routesSource,
      "registerPeggyIdentityRoutes(app, {",
      "\n  // Get conversation history",
      "Peggy registrar composition",
    );
    for (const dependency of [
      "publicCreateRateLimit: publicIntakeRateLimit",
      "calculatorRateLimit: peggyCalculatorRateLimit",
      "isHybridAuthenticated",
      "getVerifiedPeggyUserId",
      "randomUUID",
      "getAccessSecret: getPeggyConversationAccessSecret",
      "createAccessToken: createPeggyConversationAccessToken",
      "startWebConversation: peggy.startWebConversation",
      "parseCalculatorRequest: parsePeggyCalculatorRequest",
      "analyzeCalculator: peggy.analyzeCalculatorResults",
    ]) {
      expect(wiring).toContain(dependency);
    }
    expect(routesSource).not.toContain("parseTransitionalPeggyCalculatorRequest");
    expect(routesSource).not.toContain("isTransitionalPeggyObject");
    const verifiedResolver = sliceBetweenOnce(
      routesSource,
      "const getVerifiedPeggyUserId =",
      "\n\nconst hasMarketflowStaffAccess",
      "narrow Peggy verified-user resolver",
    );
    expect(verifiedResolver).toMatch(/req\.user\?\.claims\?\.sub/);
    expect(verifiedResolver).toMatch(/req\.supabaseUser\?\.id/);
    expect(verifiedResolver).toMatch(/for \(const candidate of \[/);
    expect(verifiedResolver).toMatch(
      /typeof candidate === "string" && candidate\.trim\(\)/,
    );
    expect(verifiedResolver).not.toMatch(
      /req\.(?:session|body|query|headers)|req\.get\(/,
    );
    const oidcSetup = routesSource.indexOf("await setupAuth(app)");
    const supabaseSetup = routesSource.indexOf("app.use(supabaseAuthMiddleware)");
    const registrarSetup = routesSource.indexOf("registerPeggyIdentityRoutes(app, {");
    expect(oidcSetup).toBeGreaterThanOrEqual(0);
    expect(supabaseSetup).toBeGreaterThan(oidcSetup);
    expect(registrarSetup).toBeGreaterThan(supabaseSetup);
    expect(routesSource.lastIndexOf("registerPeggyIdentityRoutes(app, {")).toBe(
      registrarSetup,
    );
    expect(routesSource).not.toMatch(
      /app\.post\(\s*"\/api\/peggy\/(?:conversations(?:\/new)?|analyze-calculator)"/s,
    );
  });

  it("keeps authenticated owner history anchored and unextracted", () => {
    const ownerList = sliceBetweenOnce(
      routesSource,
      'app.get("/api/peggy/conversations", isHybridAuthenticated,',
      "// Send a message to Peggy",
      "owner history route",
    );
    expect(ownerList).toMatch(/req\.user\?\.claims\?\.sub/);
    expect(ownerList).toMatch(/storage\.getPeggyConversations\(userId\)/);
    expect(ownerList).not.toMatch(/sessionId|req\.sessionID|getOrCreate/);
    expect(peggyIdentitySource).not.toContain('app.get("/api/peggy/conversations"');
  });

  it("uses required object arguments with no browser-session fallback", () => {
    const start = sliceBetweenOnce(
      peggySource,
      "export async function startWebConversation(",
      "// Quick analysis helper",
      "web conversation adapter",
    );
    const analyze = sliceBetweenOnce(
      peggySource,
      "export async function analyzeCalculatorResults(",
      "// Task #151",
      "calculator adapter",
    );
    expect(start).toMatch(/\{\s*userId,\s*correlationId,\s*context,?\s*\}/s);
    expect(start).toContain("sessionId: correlationId");
    expect(start).not.toMatch(/Date\.now|Math\.random|getPeggyConversations/);
    expect(analyze).toMatch(
      /\{\s*userId,\s*correlationId,\s*calculatorType,\s*inputs,\s*results,?\s*\}/s,
    );
    expect(analyze).toMatch(
      /startWebConversation\(\{\s*userId,\s*correlationId,\s*context\s*\}\)/s,
    );
    expect(peggySource).not.toMatch(
      /export async function (?:startConversation|getOrCreateConversation)/,
    );
  });

  it("composes refresh and singular Peggy no-store prefixes in exact order", () => {
    expect(
      routesSource.match(/registerPeggyConversationAccessRefreshRoute/g),
    ).toHaveLength(2);
    expect(
      routesSource.match(
        /app\.use\("\/api\/peggy", peggyIdentityNoStore\);/g,
      ),
    ).toHaveLength(1);
    expect(
      routesSource.match(
        /app\.use\("\/api\/admin\/peggy", peggyIdentityNoStore\);/g,
      ),
    ).toHaveLength(1);

    const guardFactory = sliceBetweenOnce(
      routesSource,
      "const requirePeggyConversationAccess =",
      "\n\n  const peggyIdentityNoStore",
      "Peggy access guard factory",
    );
    for (const dependency of [
      "createPeggyConversationAccessGuard({",
      "getConversation: (id) => storage.getPeggyConversation(id)",
      "getVerifiedUserId: getVerifiedPeggyUserId",
    ]) expect(guardFactory).toContain(dependency);

    const peggyComposition = sliceBetweenOnce(
      routesSource,
      "const requirePeggyConversationAccess =",
      "\n  // Get conversation history",
      "Peggy access composition",
    );
    const ordered = [
      "registerPeggyIdentityRoutes(app, {",
      "registerPeggyConversationAccessRefreshRoute(app, {",
      'app.use("/api/peggy", peggyIdentityNoStore);',
      'app.use("/api/admin/peggy", peggyIdentityNoStore);',
    ].map((anchor) => peggyComposition.indexOf(anchor));
    expect(ordered.every((index) => index >= 0)).toBe(true);
    expect(ordered).toEqual([...ordered].sort((a, b) => a - b));

    const refreshWiring = sliceBetweenOnce(
      peggyComposition,
      "registerPeggyConversationAccessRefreshRoute(app, {",
      '\n\n  app.use("/api/peggy", peggyIdentityNoStore);',
      "Peggy refresh registrar wiring",
    );
    for (const dependency of [
      "noStore: peggyIdentityNoStore", "rateLimit: publicIntakeRateLimit",
      "getConversation: (id) => storage.getPeggyConversation(id)",
      "getVerifiedUserId: getVerifiedPeggyUserId", "getSecret: getPeggyConversationAccessSecret",
      "verifyAccessToken: verifyPeggyConversationAccessToken", "createAccessToken: createPeggyConversationAccessToken",
    ]) expect(refreshWiring).toContain(dependency);
    expect(refreshWiring).not.toMatch(/startWebConversation|createPeggyConversation\s*\(|updatePeggy|deletePeggy|peggy\.chat|analyzeCalculator/);

    const publicPrefix = routesSource.indexOf('app.use("/api/peggy", peggyIdentityNoStore);');
    for (const route of [
      'app.get("/api/peggy/conversations/:id"', 'app.get("/api/peggy/conversations"',
      'app.post("/api/peggy/chat"', 'app.post("/api/peggy/conversations/:id/finish"',
      '"/api/peggy/phone/webhook"', 'app.post("/api/peggy/suggestions"',
      'app.post("/api/peggy/messages/:id/feedback"',
    ]) expect(routesSource.indexOf(route), `${route} after public no-store`).toBeGreaterThan(publicPrefix);
    const adminPrefix = routesSource.indexOf('app.use("/api/admin/peggy", peggyIdentityNoStore);');
    for (const route of [
      'app.get("/api/admin/peggy/conversations", isHybridAuthenticated,',
      'app.get("/api/admin/peggy/conversations/:id", isHybridAuthenticated,',
    ]) expect(routesSource.indexOf(route), `${route} after admin no-store`).toBeGreaterThan(adminPrefix);
  });
});
