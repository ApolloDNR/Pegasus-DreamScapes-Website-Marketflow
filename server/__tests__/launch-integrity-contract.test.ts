import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routesSource = readFileSync(
  resolve(import.meta.dirname, "../routes.ts"),
  "utf8",
);
const storageSource = readFileSync(
  resolve(import.meta.dirname, "../storage.ts"),
  "utf8",
);
const propertyAnalysisRoutesSource = readFileSync(
  resolve(import.meta.dirname, "../propertyAnalysisRoutes.ts"),
  "utf8",
);

const routeSlice = (start: string, end: string) => {
  const startIndex = routesSource.indexOf(start);
  expect(startIndex, `missing route marker ${start}`).toBeGreaterThanOrEqual(0);
  const endIndex = routesSource.indexOf(end, startIndex);
  expect(endIndex, `missing route end marker ${end}`).toBeGreaterThan(startIndex);
  return routesSource.slice(startIndex, endIndex);
};

describe("launch integrity contract", () => {
  it("applies share-token visibility before generating a strategy PDF", () => {
    const route = propertyAnalysisRoutesSource.slice(
      propertyAnalysisRoutesSource.indexOf(
        'app.get("/api/pdf/strategy-snapshot/by-token/:token"',
      ),
      propertyAnalysisRoutesSource.indexOf(
        "// ── OG image",
        propertyAnalysisRoutesSource.indexOf(
          'app.get("/api/pdf/strategy-snapshot/by-token/:token"',
        ),
      ),
    );
    expect(route).toContain("const visible = applyVisibility(row)");
    expect(route).toContain("generateStrategySnapshotPDF(visible)");
    expect(route).not.toContain("generateStrategySnapshotPDF(row)");
  });

  it("authorizes private term-sheet previews before PDF generation", () => {
    const route = routeSlice(
      'app.post("/api/capital-projects/:projectId/term-sheet-preview"',
      "// Deal Matches Routes",
    );
    expect(route).toContain("resolveLegacyDealAccess(");
    expect(route).toContain("canInitiateLegacyDealInteraction(access, res)");
    expect(route.indexOf("resolveLegacyDealAccess(")).toBeLessThan(
      route.indexOf("generateTermSheetPDF("),
    );
  });

  it("only exposes public reviews and disables unverifiable review creation", () => {
    const readRoute = routeSlice(
      'app.get("/api/users/:userId/reviews"',
      "// Get my given reviews",
    );
    expect(readRoute).toContain("review.isPublic === true");

    const createRoute = routeSlice(
      'app.post("/api/reviews"',
      "// Respond to review",
    );
    expect(createRoute).toContain("res.status(501)");
    expect(createRoute).not.toContain("storage.createUserReview(");
  });

  it("derives JV recipients from a reviewed public deal and transitions once", () => {
    const createRoute = routeSlice(
      'app.post("/api/marketplace/jv-requests"',
      "// Get all reviewed capital projects for approved browsing",
    );
    expect(createRoute).toContain("canInitiateLegacyDealInteraction(access, res)");
    expect(createRoute).toContain("wholesalerId: deal.submittedBy");
    expect(createRoute).not.toMatch(
      /const\s*\{[^}]*wholesalerId[^}]*\}\s*=\s*req\.body/s,
    );

    const updateRoute = routeSlice(
      'app.patch("/api/marketplace/jv-requests/:id"',
      "// Investor Dashboard Stats",
    );
    expect(updateRoute).toContain('jvRequest.status !== "pending"');
    expect(updateRoute).toContain("jvRequest.wholesalerId !== userId");
    expect(storageSource).toMatch(
      /updateJvRequestStatus[\s\S]*eq\(jvRequests\.id, id\)[\s\S]*eq\(jvRequests\.status, "pending"\)/,
    );
  });

  it("projects saved buyer items through public DTOs", () => {
    const route = routeSlice(
      'app.get("/api/marketplace/buyer/saved"',
      "// Buyer Offers - get user's offers",
    );
    expect(route).toContain("getPublicMarketplaceItem(");
    expect(route).not.toContain("storage.getRetailListing(");
    expect(route).not.toContain("storage.getWholesaleDeal(");
  });

  it("reserves community moderation flags for admins", () => {
    const createRoute = routeSlice(
      'app.post("/api/community/posts"',
      "// Update community post",
    );
    expect(createRoute).toContain("isPinned: false");
    expect(createRoute).toContain("isLocked: false");

    const updateRoute = routeSlice(
      'app.patch("/api/community/posts/:id"',
      "// Get replies for a post",
    );
    expect(updateRoute).toContain("if (isAdmin)");
    expect(updateRoute).not.toContain(
      "storage.updateCommunityPost(id, { title, content, isPinned, isLocked })",
    );
  });

  it("does not let the staff analytics route shadow a user's dashboard", () => {
    expect(routesSource).toContain(
      'app.get("/api/admin/analytics/dashboard", requireStaffRole',
    );
    expect(routesSource).not.toContain(
      'app.get("/api/analytics/dashboard", requireStaffRole',
    );
    expect(routesSource).toContain(
      'app.get("/api/analytics/dashboard/:userId?", isHybridAuthenticated',
    );
  });

  it("forces Supabase-created marketplace records private and server-owned", () => {
    const projectRoute = routeSlice(
      "app.post('/api/supabase/capital-projects'",
      "// Update capital project",
    );
    expect(projectRoute).toContain("resolveSupabaseMarketplaceIdentity(req)");
    expect(projectRoute).toContain("is_public: false");
    expect(projectRoute).toContain("external_owner_id:");
    expect(projectRoute).not.toContain("...projectData");

    const dealRoute = routeSlice(
      "app.post('/api/supabase/wholesale-deals'",
      "// Update wholesale deal",
    );
    expect(dealRoute).toContain("resolveSupabaseMarketplaceIdentity(req)");
    expect(dealRoute).toContain("status: 'Under Review'");
    expect(dealRoute).toContain("is_public: false");
    expect(dealRoute).not.toContain("...dealData");
  });
});
