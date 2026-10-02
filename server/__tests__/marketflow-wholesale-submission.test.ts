import { describe, expect, it } from "vitest";

import {
  buildMarketflowWholesaleSubmissionPayload,
  normalizeMarketflowWholesaleSubmission,
} from "@shared/marketflow-wholesale-submission";
import { toPublicSupabaseWholesaleDeal } from "../supabase-marketplace-privacy";

const fullSubmission = {
  propertyAddress: "100 Main St",
  city: "Oakland",
  state: "CA",
  zipCode: "94601",
  county: "Alameda",
  propertyType: "single_family",
  bedrooms: 3,
  bathrooms: "2",
  sqft: 1450,
  yearBuilt: 1948,
  lotSize: "5,000 sf",
  sellerName: "Private Seller",
  sellerPhone: "510-555-0100",
  sellerEmail: "seller@example.com",
  sellerMotivation: "inherited",
  motivationLevel: 8,
  sellerSituation: "Estate timing is private",
  askingPrice: 500_000,
  contractPrice: 470_000,
  assignmentFee: 20_000,
  maxAssignmentFee: 25_000,
  arv: 700_000,
  estimatedRepairs: 85_000,
  repairDetails: "Roof, kitchen, and two baths",
  holdingCosts: 8_000,
  closingCosts: 14_000,
  emdAmount: 5_000,
  emdDueDate: "2026-09-02",
  emdHeldBy: "Example Title",
  contractDate: "2026-08-29",
  inspectionDeadline: "2026-09-06",
  dueDiligenceDeadline: "2026-09-08",
  closingDate: "2026-09-30",
  contractExpiration: "2026-10-01",
  occupancyStatus: "vacant",
  accessInstructions: "Coordinate with the submitter",
  lockboxCode: "PRIVATE-2468",
  showingAvailability: "Weekdays after 2",
  tenantInfo: "",
  titleCompany: "Example Title",
  titleContact: "Title Officer",
  titlePhone: "510-555-0199",
  titleIssues: "Preliminary report pending",
  strategy: "fix_and_flip",
  exitStrategy: "sale",
  description: "Value-add assignment candidate",
  idealBuyerType: "cash_buyer",
  buyerExperienceRequired: "Experienced rehabber",
  proofOfFundsRequired: true,
  assignmentNotes: "Assignment terms remain private",
  pipelineStage: "under_contract",
  dispositionPath: "assignment",
  negotiationAllowed: true,
  jvAllowed: false,
  consentAcknowledged: true,
} as const;

describe("MarketFlow wholesale submission contract", () => {
  it("preserves the complete private intake while mapping public columns exactly", () => {
    const payload = buildMarketflowWholesaleSubmissionPayload(
      fullSubmission,
      ["ADU potential", "Vacant"],
      ["https://example.com/front.jpg"],
    );
    const result = normalizeMarketflowWholesaleSubmission(payload, {
      userId: "user-123",
      kind: "external",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);

    expect(result.data).toEqual(
      expect.objectContaining({
        wholesaler_id: null,
        external_wholesaler_id: "user-123",
        address: "100 Main St",
        asking_price: 490_000,
        repair_estimate: 85_000,
        assignment_fee: 20_000,
        photos: ["https://example.com/front.jpg"],
        occupancy: "vacant",
        close_timeline: "2026-09-30",
        status: "Under Review",
        is_public: false,
        raising_capital: false,
      }),
    );

    const privateEnvelope = JSON.parse(result.data.notes!);
    expect(privateEnvelope.schema).toBe("marketflow-wholesale-private-v1");
    expect(privateEnvelope.submission).toEqual(
      expect.objectContaining({
        sellerName: "Private Seller",
        sellerPhone: "510-555-0100",
        lockboxCode: "PRIVATE-2468",
        assignmentNotes: "Assignment terms remain private",
        highlights: ["ADU potential", "Vacant"],
      }),
    );

    const publicDto = toPublicSupabaseWholesaleDeal({
      id: "deal-1",
      ...result.data,
      status: "available",
      is_public: true,
    });
    expect(publicDto).not.toHaveProperty("notes");
    expect(JSON.stringify(publicDto)).not.toContain("PRIVATE-2468");
    expect(JSON.stringify(publicDto)).not.toContain("seller@example.com");
  });

  it("rejects the submission rather than truncating private notes", () => {
    const result = normalizeMarketflowWholesaleSubmission(
      buildMarketflowWholesaleSubmissionPayload(
        { ...fullSubmission, description: "x".repeat(12_000) },
        [],
        [],
      ),
      { userId: "user-123", kind: "supabase" },
    );

    expect(result).toEqual({
      ok: false,
      message: "Private deal details are too long. Shorten the notes and try again.",
    });
  });

  it("requires affirmative authorization to store and review private deal data", () => {
    const result = normalizeMarketflowWholesaleSubmission(
      buildMarketflowWholesaleSubmissionPayload(
        { ...fullSubmission, consentAcknowledged: false },
        [],
        [],
      ),
      { userId: "user-123", kind: "supabase" },
    );

    expect(result).toEqual({
      ok: false,
      message: "Consent to store and review the deal information is required.",
    });
  });
});
