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
const wholesaleReviewRoutesSource = readFileSync(
  resolve(import.meta.dirname, "../wholesale-review-routes.ts"),
  "utf8",
);
const wholesaleSubmissionSource = readFileSync(
  resolve(import.meta.dirname, "../../shared/marketflow-wholesale-submission.ts"),
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

  it("derives JV recipients from a reviewed public deal and transitions once", () => {
    const createRoute = routeSlice(
      'app.post("/api/marketplace/jv-requests"',
      "// Get all reviewed capital projects for approved browsing",
    );
    expect(createRoute).toContain(
      "const userId = getMarketflowInventoryPrincipalId(res)",
    );
    expect(createRoute).not.toContain("const userId = getAuthUserId(req)");
    expect(createRoute).toContain("canInitiateLegacyDealInteraction(access, res)");
    expect(createRoute).toContain("canRequestMarketflowJv({");
    expect(createRoute).toContain(
      "canInitiateJv: canViewerInitiateMarketflowJv(res)",
    );
    expect(createRoute).toContain("wholesalerId: dealOwnerId");
    expect(createRoute).not.toMatch(
      /const\s*\{[^}]*wholesalerId[^}]*\}\s*=\s*req\.body/s,
    );

    const updateRoute = routeSlice(
      'app.patch("/api/marketplace/jv-requests/:id"',
      "// Submit a buyer offer",
    );
    expect(updateRoute).toContain('jvRequest.status !== "pending"');
    expect(updateRoute).toContain("jvRequest.wholesalerId !== userId");
    expect(storageSource).toMatch(
      /updateJvRequestStatus[\s\S]*eq\(jvRequests\.id, id\)[\s\S]*eq\(jvRequests\.status, "pending"\)/,
    );
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
    expect(routesSource).toContain(
      "resolveSupabaseMarketplaceIdentity(request as any)",
    );
    expect(routesSource).toContain(
      "normalizeSubmission: normalizeMarketflowWholesaleSubmission",
    );
    expect(wholesaleReviewRoutesSource).toContain(
      "dependencies.normalizeSubmission(\n        request.body,\n        identity",
    );
    expect(wholesaleReviewRoutesSource).toContain(
      "dependencies.createWholesaleDeal(normalized.data)",
    );
    expect(wholesaleReviewRoutesSource).toContain(
      "normalizeCapitalProjectSubmission(\n        request.body,\n        identity",
    );
    expect(wholesaleReviewRoutesSource).toContain(
      "dependencies.createCapitalProject(normalized.data)",
    );
    expect(wholesaleReviewRoutesSource).toContain(
      'identity.kind === "external" ? identity.userId : null',
    );
    expect(wholesaleReviewRoutesSource).toContain('status: "Under Review"');
    expect(wholesaleReviewRoutesSource).toContain("is_public: false");
    expect(wholesaleReviewRoutesSource).not.toContain("...request.body");
    expect(wholesaleSubmissionSource).toContain(
      'status: "Under Review"',
    );
    expect(wholesaleSubmissionSource).toContain("is_public: false");
    expect(wholesaleSubmissionSource).toContain(
      'identity.kind === "external" ? identity.userId : null',
    );
  });
});
