import { describe, expect, it } from "vitest";
import {
  isPublicCapitalProject,
  isPublicListing,
  isPublicWholesaleDeal,
  toPublicCapitalProject,
  toPublicInvestorWantedDeal,
  toPublicListing,
  toPublicRetailListing,
  toPublicUserProfile,
  toPublicWholesaleDeal,
} from "../public-marketplace";

describe("public marketplace projections", () => {
  it("publishes only reviewed marketplace statuses", () => {
    expect(isPublicWholesaleDeal({ status: "listed" })).toBe(true);
    expect(isPublicWholesaleDeal({ status: "under_review" })).toBe(false);
    expect(isPublicListing({ status: "coming_soon" })).toBe(true);
    expect(isPublicListing({ status: "off_market" })).toBe(false);
    expect(isPublicCapitalProject({ status: "OPEN_FOR_INVESTMENT" })).toBe(true);
    expect(isPublicCapitalProject({ status: "DRAFT" })).toBe(false);
  });

  it("removes seller, access, title, document, and internal deal fields", () => {
    const result = toPublicWholesaleDeal({
      id: 1,
      status: "listed",
      propertyAddress: "100 Main St",
      contractPrice: 400_000,
      assignmentFee: 25_000,
      askingPrice: 500_000,
      sellerName: "Private Seller",
      sellerPhone: "555-0100",
      sellerEmail: "private@example.com",
      sellerSituation: "Private circumstances",
      lockboxCode: "1234",
      accessInstructions: "Back door",
      titleContact: "Private title contact",
      documents: ["private-contract.pdf"],
      maxAssignmentFee: 50_000,
      internalNotes: "staff only",
      submittedBy: "private-user-id",
    }) as Record<string, unknown>;

    expect(result.propertyAddress).toBe("100 Main St");
    expect(result.askingPrice).toBe(425_000);
    for (const field of [
      "sellerName",
      "sellerPhone",
      "sellerEmail",
      "sellerSituation",
      "lockboxCode",
      "accessInstructions",
      "titleContact",
      "documents",
      "maxAssignmentFee",
      "internalNotes",
      "submittedBy",
    ]) {
      expect(result).not.toHaveProperty(field);
    }
  });

  it("removes listing access instructions and project documents", () => {
    expect(
      toPublicListing({
        id: 2,
        status: "active",
        lockboxCode: "9999",
        showingInstructions: "Call first",
        submittedBy: "owner-id",
      }),
    ).not.toHaveProperty("lockboxCode");
    expect(
      toPublicCapitalProject({
        id: 3,
        status: "OPEN_FOR_INVESTMENT",
        documents: ["private-model.xlsx"],
        createdBy: "operator-id",
        linkedDealId: 12,
      }),
    ).not.toHaveProperty("documents");

    const retail = toPublicRetailListing({
      id: 7,
      status: "active",
      originalPurchase: 325_000,
      renovationCost: 90_000,
    });
    expect(retail).not.toHaveProperty("originalPurchase");
    expect(retail).not.toHaveProperty("renovationCost");
  });

  it("keeps public buy boxes and profiles free of capital and account fields", () => {
    const wanted = toPublicInvestorWantedDeal({
      id: 4,
      title: "East Bay value-add",
      availableCapital: 1_000_000,
      minBudget: 250_000,
      maxBudget: 2_000_000,
      userId: "private-user-id",
    });
    expect(wanted).not.toHaveProperty("availableCapital");
    expect(wanted).not.toHaveProperty("minBudget");
    expect(wanted).not.toHaveProperty("maxBudget");
    expect(wanted).not.toHaveProperty("userId");

    const profile = toPublicUserProfile({
      id: "user-1",
      firstName: "A",
      email: "private@example.com",
      role: "admin",
      portalType: "staff",
    });
    expect(profile).not.toHaveProperty("email");
    expect(profile).not.toHaveProperty("role");
    expect(profile).not.toHaveProperty("portalType");
  });
});
