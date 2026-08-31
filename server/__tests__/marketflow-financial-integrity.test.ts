import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  classifyMarketflowCurrentOffer,
  getMarketflowOfferResponseConflict,
  isMarketflowNegotiationBoundToAuthoritativeDeal,
} from "../marketflow-financial-integrity";

const now = new Date("2026-07-30T18:00:00.000Z");

const offer = {
  id: 41,
  lane: "WHOLESALE",
  dealId: 7,
  negotiationId: 12,
  createdBy: "offer-creator",
  recipientId: "deal-owner",
  status: "sent",
  expiresAt: new Date("2026-07-31T18:00:00.000Z"),
};

const negotiation = {
  id: 12,
  lane: "WHOLESALE",
  dealId: 7,
  posterId: "deal-owner",
  counterpartyId: "offer-creator",
  status: "active",
  currentOfferId: 41,
};

describe("MarketFlow financial-integrity policy", () => {
  it("allows only the current recipient to respond to a live current offer", () => {
    expect(
      getMarketflowOfferResponseConflict({
        offer,
        negotiation,
        userId: "deal-owner",
        now,
      }),
    ).toBeNull();

    expect(
      getMarketflowOfferResponseConflict({
        offer,
        negotiation,
        userId: "offer-creator",
        now,
      }),
    ).toBe("not_recipient");
  });

  it("rejects inactive negotiations, stale offers, and already-resolved offers", () => {
    expect(
      getMarketflowOfferResponseConflict({
        offer,
        negotiation: { ...negotiation, status: "accepted" },
        userId: "deal-owner",
        now,
      }),
    ).toBe("negotiation_inactive");

    expect(
      getMarketflowOfferResponseConflict({
        offer,
        negotiation: { ...negotiation, currentOfferId: 42 },
        userId: "deal-owner",
        now,
      }),
    ).toBe("stale_offer");

    expect(
      getMarketflowOfferResponseConflict({
        offer: { ...offer, status: "countered" },
        negotiation,
        userId: "deal-owner",
        now,
      }),
    ).toBe("already_resolved");
  });

  it("rejects a current-offer pointer that crosses deals or participants", () => {
    expect(
      getMarketflowOfferResponseConflict({
        offer: { ...offer, dealId: 8 },
        negotiation,
        userId: "deal-owner",
        now,
      }),
    ).toBe("state_conflict");

    expect(
      getMarketflowOfferResponseConflict({
        offer: { ...offer, createdBy: "unrelated-user" },
        negotiation,
        userId: "deal-owner",
        now,
      }),
    ).toBe("state_conflict");
  });

  it("rejects negotiations that are not bound to the authoritative deal owner", () => {
    expect(
      isMarketflowNegotiationBoundToAuthoritativeDeal(negotiation, {
        lane: "WHOLESALE",
        dealId: 7,
        ownerId: "deal-owner",
      }),
    ).toBe(true);
    expect(
      isMarketflowNegotiationBoundToAuthoritativeDeal(
        { ...negotiation, posterId: "forged-owner" },
        {
          lane: "WHOLESALE",
          dealId: 7,
          ownerId: "deal-owner",
        },
      ),
    ).toBe(false);
    expect(
      isMarketflowNegotiationBoundToAuthoritativeDeal(negotiation, {
        lane: "CAPITAL",
        dealId: 7,
        ownerId: "deal-owner",
      }),
    ).toBe(false);
  });

  it("treats an expiry at the current instant as expired", () => {
    expect(
      getMarketflowOfferResponseConflict({
        offer: { ...offer, expiresAt: now },
        negotiation,
        userId: "deal-owner",
        now,
      }),
    ).toBe("offer_expired");
  });

  it("blocks a second live offer but explicitly supersedes expired or resolved offers", () => {
    expect(classifyMarketflowCurrentOffer(undefined, now)).toBe("none");
    expect(classifyMarketflowCurrentOffer(offer, now)).toBe("active");
    expect(
      classifyMarketflowCurrentOffer({ ...offer, expiresAt: now }, now),
    ).toBe("expire_and_supersede");

    for (const status of ["countered", "rejected", "expired", "withdrawn"]) {
      expect(
        classifyMarketflowCurrentOffer({ ...offer, status }, now),
      ).toBe("supersedable");
    }

    for (const status of ["accepted", "draft", "unknown"]) {
      expect(
        classifyMarketflowCurrentOffer({ ...offer, status }, now),
      ).toBe("inconsistent");
    }
  });
});

describe("MarketFlow atomic route/storage contract", () => {
  const routesSource = readFileSync(
    resolve(import.meta.dirname, "../routes.ts"),
    "utf8",
  );
  const storageSource = readFileSync(
    resolve(import.meta.dirname, "../storage.ts"),
    "utf8",
  );

  it("routes offer creation and responses through atomic storage operations", () => {
    const createStart = routesSource.indexOf(
      'app.post("/api/marketflow/offers"',
    );
    const createRoute = routesSource.slice(
      createStart,
      routesSource.indexOf("// Get offers for a deal", createStart),
    );
    expect(createRoute).toMatch(/storage\.createCurrentMarketflowOffer\(/);
    expect(createRoute).not.toMatch(/storage\.createMarketflowOffer\(/);
    expect(createRoute).not.toMatch(/storage\.updateMarketflowNegotiation\(/);

    const respondStart = routesSource.indexOf(
      'app.post("/api/marketflow/offers/:offerId/respond"',
    );
    const respondRoute = routesSource.slice(
      respondStart,
      routesSource.indexOf("// Get negotiation by ID", respondStart),
    );
    expect(respondRoute).toMatch(/storage\.respondToCurrentMarketflowOffer\(/);
    expect(respondRoute).not.toMatch(/storage\.updateMarketflowOfferStatus\(/);
    expect(respondRoute).not.toMatch(/storage\.createMarketflowOffer\(/);
    expect(respondRoute).not.toMatch(/storage\.updateMarketflowNegotiation\(/);
  });

  it("serializes both operations and uses conditional state updates", () => {
    for (const methodName of [
      "createCurrentMarketflowOffer",
      "respondToCurrentMarketflowOffer",
    ]) {
      const methodStart = storageSource.indexOf(`async ${methodName}(`);
      expect(methodStart).toBeGreaterThan(-1);
      const methodEnd = storageSource.indexOf("\n  async ", methodStart + 1);
      const methodSource = storageSource.slice(methodStart, methodEnd);
      expect(methodSource).toMatch(/db\.transaction\(/);
      expect(methodSource).toMatch(/pg_advisory_xact_lock/);
    }

    expect(storageSource).toMatch(
      /eq\(marketflowOffers\.status,\s*"sent"\)/,
    );
    expect(storageSource).toMatch(
      /eq\(marketflowNegotiations\.status,\s*"active"\)/,
    );
    expect(storageSource).toMatch(
      /eq\(marketflowNegotiations\.currentOfferId,\s*offer\.id\)/,
    );
  });

  it("stores only per-kind validated initial and counter payloads", () => {
    const createMethodStart = storageSource.indexOf(
      "async createCurrentMarketflowOffer(",
    );
    const createMethod = storageSource.slice(
      createMethodStart,
      storageSource.indexOf(
        "\n  async respondToCurrentMarketflowOffer(",
        createMethodStart,
      ),
    );
    expect(createMethod).toMatch(
      /parseMarketflowOfferPayload\(\s*input\.offerKind,\s*input\.payload,\s*now,/s,
    );
    expect(createMethod).toMatch(/payload: parsedPayload\.data/);

    const respondMethodStart = storageSource.indexOf(
      "async respondToCurrentMarketflowOffer(",
    );
    const respondMethod = storageSource.slice(
      respondMethodStart,
      storageSource.indexOf(
        "\n  async createMarketflowOffer(",
        respondMethodStart,
      ),
    );
    expect(respondMethod).toMatch(
      /parseMarketflowOfferPayload\(\s*offer\.offerKind,\s*input\.counterPayload,\s*now,/s,
    );
    expect(respondMethod).toMatch(/payload: parsedCounterPayload!/);

    const createRouteStart = routesSource.indexOf(
      'app.post("/api/marketflow/offers"',
    );
    const createRoute = routesSource.slice(
      createRouteStart,
      routesSource.indexOf("// Get offers for a deal", createRouteStart),
    );
    expect(createRoute).toMatch(
      /createResult\.reason === "invalid_payload"[\s\S]*status\(400\)/,
    );
  });

  it("revalidates stored terms and authoritative deal ownership", () => {
    const createRouteStart = routesSource.indexOf(
      'app.post("/api/marketflow/offers"',
    );
    const createRoute = routesSource.slice(
      createRouteStart,
      routesSource.indexOf("// Get offers for a deal", createRouteStart),
    );
    expect(createRoute).toMatch(/resolveLegacyDealAccess\(/);
    expect(createRoute.indexOf("resolveLegacyDealAccess(")).toBeLessThan(
      createRoute.indexOf("storage.createCurrentMarketflowOffer("),
    );
    expect(createRoute).toMatch(/posterId: access\.ownerId/);

    const respondRouteStart = routesSource.indexOf(
      'app.post("/api/marketflow/offers/:offerId/respond"',
    );
    const respondRoute = routesSource.slice(
      respondRouteStart,
      routesSource.indexOf("// Get negotiation by ID", respondRouteStart),
    );
    expect(respondRoute).toMatch(/resolveLegacyDealAccess\(/);
    expect(respondRoute).toMatch(/authoritativeOwnerId: access\.ownerId/);

    const respondMethodStart = storageSource.indexOf(
      "async respondToCurrentMarketflowOffer(",
    );
    const respondMethod = storageSource.slice(
      respondMethodStart,
      storageSource.indexOf(
        "\n  async createMarketflowOffer(",
        respondMethodStart,
      ),
    );
    expect(respondMethod).toMatch(
      /parseMarketflowOfferPayload\(\s*offer\.offerKind,\s*offer\.payload,\s*now,/s,
    );
    expect(respondMethod).toMatch(/finalTerms: parsedAcceptedTerms\.data/);
  });
});
