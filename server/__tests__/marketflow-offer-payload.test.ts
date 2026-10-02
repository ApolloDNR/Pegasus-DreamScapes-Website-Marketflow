import { describe, expect, it } from "vitest";
import { parseMarketflowOfferPayload } from "../marketflow-offer-payload";

const now = new Date("2026-07-30T18:00:00.000Z");

const financialTerms = {
  offerPrice: 425_000,
  earnestMoney: 10_000,
  closeDate: "2026-09-15",
  inspectionPeriod: 10,
  fundingType: "cash",
  notes: "  Proof of funds available.  ",
};

describe("MarketFlow offer payload validation", () => {
  it.each([
    "WHOLESALE_ASSIGNMENT",
    "CAPITAL_INVESTMENT",
    "LISTING_INQUIRY",
  ])("preserves and sanitizes the live Offer Studio contract for %s", (kind) => {
    const result = parseMarketflowOfferPayload(kind, financialTerms, now);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        ...financialTerms,
        notes: "Proof of funds available.",
      });
    }
  });

  it("rejects empty, unknown, negative, non-numeric, and oversized financial terms", () => {
    const invalidPayloads = [
      {},
      { ...financialTerms, hiddenOverride: true },
      { ...financialTerms, offerPrice: -1 },
      { ...financialTerms, offerPrice: "425000" },
      { ...financialTerms, earnestMoney: -1 },
      { ...financialTerms, earnestMoney: 500_000 },
      { ...financialTerms, inspectionPeriod: 366 },
      { ...financialTerms, notes: "x".repeat(4_001) },
    ];

    for (const payload of invalidPayloads) {
      expect(
        parseMarketflowOfferPayload(
          "WHOLESALE_ASSIGNMENT",
          payload,
          now,
        ).success,
      ).toBe(false);
    }
  });

  it("rejects malformed, past, and unreasonably distant close dates", () => {
    for (const closeDate of [
      "09/15/2026",
      "2026-02-30",
      "2026-07-29",
      "2032-01-01",
    ]) {
      expect(
        parseMarketflowOfferPayload(
          "CAPITAL_INVESTMENT",
          { ...financialTerms, closeDate },
          now,
        ).success,
      ).toBe(false);
    }
  });

  it.each(["", "   ", "\t\n"])(
    "rejects an empty or whitespace-only wholesale close date (%j)",
    (closeDate) => {
      expect(
        parseMarketflowOfferPayload(
          "WHOLESALE_ASSIGNMENT",
          { ...financialTerms, closeDate },
          now,
        ),
      ).toEqual({ success: false, reason: "invalid_payload" });
    },
  );

  it.each(["2026-07-30", "2031-07-30"])(
    "accepts a wholesale close date on the inclusive UTC boundary (%s)",
    (closeDate) => {
      expect(
        parseMarketflowOfferPayload(
          "WHOLESALE_ASSIGNMENT",
          { ...financialTerms, closeDate },
          now,
        ).success,
      ).toBe(true);
    },
  );

  it("validates strict wholesale JV terms independently", () => {
    const valid = parseMarketflowOfferPayload(
      "WHOLESALE_JV",
      {
        roleSelection: "buyer_bringer",
        proposedSplit: 50,
        contributions: ["buyer_network", "due_diligence"],
        message: "  Buyer is vetted and ready.  ",
      },
      now,
    );
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.message).toBe("Buyer is vetted and ready.");
    }

    for (const payload of [
      financialTerms,
      {
        roleSelection: "buyer_bringer",
        proposedSplit: 0,
        contributions: ["buyer_network"],
        message: "Ready",
      },
      {
        roleSelection: "buyer_bringer",
        proposedSplit: 50,
        contributions: ["invented"],
        message: "Ready",
      },
    ]) {
      expect(
        parseMarketflowOfferPayload("WHOLESALE_JV", payload, now).success,
      ).toBe(false);
    }
  });

  it("validates and bounds strict showing-request terms independently", () => {
    const valid = parseMarketflowOfferPayload(
      "SHOWING_REQUEST",
      {
        preferredDates: ["2026-08-10", "2026-08-12"],
        hasAgent: false,
        financingType: "conventional",
        message: "  Afternoon preferred.  ",
      },
      now,
    );
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.message).toBe("Afternoon preferred.");
    }

    for (const payload of [
      {},
      {
        preferredDates: ["2026-07-01"],
        hasAgent: false,
        financingType: "conventional",
        message: "Afternoon",
      },
      {
        preferredDates: [
          "2026-08-10",
          "2026-08-11",
          "2026-08-12",
          "2026-08-13",
        ],
        hasAgent: false,
        financingType: "conventional",
        message: "Afternoon",
      },
    ]) {
      expect(
        parseMarketflowOfferPayload("SHOWING_REQUEST", payload, now).success,
      ).toBe(false);
    }
  });

  it("fails closed for an unknown offer kind", () => {
    expect(
      parseMarketflowOfferPayload("INVENTED_KIND", financialTerms, now)
        .success,
    ).toBe(false);
  });
});
