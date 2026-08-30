import { describe, expect, it } from "vitest";

import {
  classifyPegasusLead,
  normalizePegasusLeadSubmission,
  pegasusLeadSuccessCopy,
} from "@shared/lead-routing";

describe("Pegasus reusable lead routing", () => {
  it.each([
    ["property-review", "I have a property (Seller)", "seller"],
    ["representation", "Buy a home (Buyer representation)", "buyer"],
    ["deal-finder", "Deal finder / Wholesaler", "wholesaler"],
    ["capital-partner", "Capital partner", "investor"],
    ["capital-introduction", "Introduced relationship", "investor"],
    ["operator", "Operator / Vendor", "vendor"],
    ["referral", "Referral partner", "referral"],
    ["contact", "Something else", "contact"],
  ] as const)("classifies %s / %s as %s", (intent, role, expected) => {
    expect(classifyPegasusLead({ intent, role })).toBe(expected);
  });

  it("routes contextual text without inventing a property address", () => {
    const normalized = normalizePegasusLeadSubmission({
      leadType: "submit",
      source: "form",
      firstName: "Riley",
      email: "riley@example.com",
      leadData: {
        lane: "seller",
        intent: "capital-partner",
        role: "Capital partner",
        context: "$100k-$250k or an Oakland project",
        contextKind: "context",
        message: "Interested in a relationship conversation.",
      },
    });

    expect(normalized.leadType).toBe("investor");
    expect(normalized).not.toHaveProperty("address");
    expect(normalized.leadData).toEqual(
      expect.objectContaining({
        lane: "investor",
        context: "$100k-$250k or an Oakland project",
        contextKind: "context",
      }),
    );
  });

  it("promotes only an explicitly typed property address", () => {
    const normalized = normalizePegasusLeadSubmission({
      leadType: "submit",
      source: "form",
      firstName: "Riley",
      email: "riley@example.com",
      leadData: {
        intent: "development",
        role: "I have a property (Seller)",
        context: "123 Main St, Oakland, CA",
        contextKind: "property-address",
      },
    });

    expect(normalized.leadType).toBe("seller");
    expect(normalized.address).toBe("123 Main St, Oakland, CA");
  });

  it.each([
    "seller",
    "buyer",
    "wholesaler",
    "investor",
    "vendor",
    "referral",
    "contact",
  ] as const)("returns conditional, non-promissory success copy for %s", (lane) => {
    const copy = pegasusLeadSuccessCopy(lane);
    expect(copy.heading.length).toBeGreaterThan(0);
    expect(copy.body.length).toBeGreaterThan(0);
    expect(copy.body).not.toMatch(/within\s+\d|guaranteed|approved|now listed|will contact/i);
    expect(copy.body).not.toMatch(/recorded for review|records? .* for review/i);
    expect(copy.body).toMatch(/possible consideration|review .* not promised|not .* promise .* review/i);
  });
});
