import { describe, expect, it } from "vitest";
import {
  canAccessMarketflowOffer,
  filterMarketflowOffersForUser,
} from "../marketflow-access";

const offer = {
  id: 17,
  createdBy: "offerer",
  recipientId: "owner",
};

describe("MarketFlow offer access", () => {
  it("allows only the offer participants", () => {
    expect(canAccessMarketflowOffer("offerer", offer)).toBe(true);
    expect(canAccessMarketflowOffer("owner", offer)).toBe(true);
    expect(canAccessMarketflowOffer("unrelated-user", offer)).toBe(false);
  });

  it("filters deal-wide results instead of exposing other users' offers", () => {
    const offers = [
      offer,
      { id: 18, createdBy: "someone-else", recipientId: "another-owner" },
      { id: 19, createdBy: "offerer", recipientId: "second-owner" },
    ];

    expect(filterMarketflowOffersForUser("offerer", offers)).toEqual([
      offers[0],
      offers[2],
    ]);
  });
});
