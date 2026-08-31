import { describe, expect, it } from "vitest";
import {
  canChangeLegacyWholesaleOfferStatus,
  canCounterLegacyWholesaleOffer,
  canDeleteLegacyWholesaleDocument,
  filterLegacyCapitalInvestmentsForUser,
  filterLegacyDocumentsForParticipant,
  filterLegacyListingInquiriesForUser,
  filterLegacyNegotiationsForUser,
  filterLegacyWholesaleOffersForUser,
  getLegacyDealTypeAliases,
  isLegacyDealParticipant,
  normalizeLegacyDealType,
} from "../legacy-private-access";

describe("legacy private route access", () => {
  it("normalizes only the supported legacy deal aliases", () => {
    expect(normalizeLegacyDealType("WHOLESALE_ASSIGNMENT")).toBe("wholesale");
    expect(normalizeLegacyDealType("capital-project")).toBe("capital");
    expect(normalizeLegacyDealType("retail_listing")).toBe("listing");
    expect(normalizeLegacyDealType("unknown")).toBeNull();
    expect(getLegacyDealTypeAliases("capital_project")).toContain("capital");
  });

  it("recognizes only stored negotiation, offer, or inquiry participants", () => {
    const sources = {
      negotiations: [{ initiatorId: "initiator", responderId: "responder" }],
      offers: [{ buyerId: "buyer" }],
      inquiries: [{ userId: "inquirer" }],
      capitalInvestments: [{ investorId: "investor" }],
    };

    expect(isLegacyDealParticipant("initiator", sources)).toBe(true);
    expect(isLegacyDealParticipant("responder", sources)).toBe(true);
    expect(isLegacyDealParticipant("buyer", sources)).toBe(true);
    expect(isLegacyDealParticipant("inquirer", sources)).toBe(true);
    expect(isLegacyDealParticipant("investor", sources)).toBe(true);
    expect(isLegacyDealParticipant("unrelated", sources)).toBe(false);
  });

  it("filters deal-wide records to the caller's own participation", () => {
    const negotiations = [
      { id: 1, initiatorId: "caller", responderId: "owner" },
      { id: 2, initiatorId: "other", responderId: "owner" },
    ];
    const offers = [
      { id: 1, buyerId: "caller" },
      { id: 2, buyerId: "other" },
    ];
    const inquiries = [
      { id: 1, userId: "caller" },
      { id: 2, userId: "other" },
    ];
    const investments = [
      { id: 1, investorId: "caller" },
      { id: 2, investorId: "other" },
    ];

    expect(filterLegacyNegotiationsForUser("caller", negotiations)).toEqual([
      negotiations[0],
    ]);
    expect(filterLegacyWholesaleOffersForUser("caller", offers)).toEqual([
      offers[0],
    ]);
    expect(filterLegacyListingInquiriesForUser("caller", inquiries)).toEqual([
      inquiries[0],
    ]);
    expect(
      filterLegacyCapitalInvestmentsForUser("caller", investments),
    ).toEqual([investments[0]]);
  });

  it("does not disclose owner-only wholesale documents to a participant", () => {
    const documents = [
      { id: 1, isPublic: true },
      { id: 2, isPublic: false },
      { id: 3, isPublic: null },
    ];

    expect(filterLegacyDocumentsForParticipant(documents)).toEqual([
      documents[0],
    ]);
  });

  it("keeps offer status transitions scoped to the correct side", () => {
    const base = {
      dealOwnerId: "owner",
      buyerId: "buyer",
      isStaff: false,
    };

    expect(
      canChangeLegacyWholesaleOfferStatus({
        ...base,
        userId: "owner",
        status: "accepted",
      }),
    ).toBe(true);
    expect(
      canChangeLegacyWholesaleOfferStatus({
        ...base,
        userId: "buyer",
        status: "accepted",
      }),
    ).toBe(false);
    expect(
      canChangeLegacyWholesaleOfferStatus({
        ...base,
        userId: "buyer",
        status: "withdrawn",
      }),
    ).toBe(true);
    expect(
      canChangeLegacyWholesaleOfferStatus({
        ...base,
        userId: "owner",
        status: "withdrawn",
      }),
    ).toBe(false);
  });

  it("allows counters only from the deal side or staff", () => {
    expect(
      canCounterLegacyWholesaleOffer({
        userId: "owner",
        dealOwnerId: "owner",
        isStaff: false,
      }),
    ).toBe(true);
    expect(
      canCounterLegacyWholesaleOffer({
        userId: "buyer",
        dealOwnerId: "owner",
        isStaff: false,
      }),
    ).toBe(false);
    expect(
      canCounterLegacyWholesaleOffer({
        userId: "staff",
        dealOwnerId: "owner",
        isStaff: true,
      }),
    ).toBe(true);
  });

  it("allows document deletion only to uploader, deal owner, or staff", () => {
    const base = {
      dealOwnerId: "owner",
      uploadedBy: "uploader",
      isStaff: false,
    };

    expect(
      canDeleteLegacyWholesaleDocument({ ...base, userId: "uploader" }),
    ).toBe(true);
    expect(
      canDeleteLegacyWholesaleDocument({ ...base, userId: "owner" }),
    ).toBe(true);
    expect(
      canDeleteLegacyWholesaleDocument({ ...base, userId: "unrelated" }),
    ).toBe(false);
  });
});
