import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(),
  isReachable: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  supabaseAdmin: {
    from: supabaseMocks.from,
  },
  isSupabaseReachable: supabaseMocks.isReachable,
}));

type MarketplaceIdentity = {
  userId: string;
  kind: "supabase" | "external";
};

type MarketplaceContract = {
  resolveSupabaseMarketplaceIdentity?: (
    request: Record<string, unknown>,
  ) => MarketplaceIdentity | null;
  toCapitalCommitmentIdentityColumns?: (
    identity: MarketplaceIdentity,
  ) => {
    investor_id: string | null;
    external_investor_id: string | null;
  };
  toBuyerOfferIdentityColumns?: (
    identity: MarketplaceIdentity,
  ) => {
    buyer_id: string | null;
    external_buyer_id: string | null;
  };
  toCapitalCommitmentDashboardDto?: (
    commitment: Record<string, unknown>,
  ) => Record<string, unknown>;
  toBuyerOfferDashboardDto?: (
    offer: Record<string, unknown>,
  ) => Record<string, unknown>;
  requireCreatedSupabaseMarketplaceRecord?: <T>(
    record: T | null | undefined,
    message: string,
  ) => T;
};

let contract: MarketplaceContract = {};

beforeAll(async () => {
  contract = await vi
    .importActual<MarketplaceContract>("../supabase-marketplace-privacy")
    .catch(() => ({}));
});

describe("Supabase marketplace authentication identities", () => {
  it("uses the UUID identity columns for a verified Supabase user", () => {
    const userId = "c33412de-8b2d-4fd5-9d6c-b40a8efc7ac7";
    const identity = contract.resolveSupabaseMarketplaceIdentity?.({
      user: { claims: { sub: userId } },
      supabaseUser: { id: userId },
    });

    expect(identity).toEqual({ userId, kind: "supabase" });
    expect(contract.toCapitalCommitmentIdentityColumns?.(identity!)).toEqual({
      investor_id: userId,
      external_investor_id: null,
    });
    expect(contract.toBuyerOfferIdentityColumns?.(identity!)).toEqual({
      buyer_id: userId,
      external_buyer_id: null,
    });
  });

  it("uses text identity columns for a legacy authenticated user", () => {
    const identity = contract.resolveSupabaseMarketplaceIdentity?.({
      user: { claims: { sub: "legacy-user-50383971" } },
    });

    expect(identity).toEqual({
      userId: "legacy-user-50383971",
      kind: "external",
    });
    expect(contract.toCapitalCommitmentIdentityColumns?.(identity!)).toEqual({
      investor_id: null,
      external_investor_id: "legacy-user-50383971",
    });
    expect(contract.toBuyerOfferIdentityColumns?.(identity!)).toEqual({
      buyer_id: null,
      external_buyer_id: "legacy-user-50383971",
    });
  });

  it("does not create an identity from an empty or mismatched claim", () => {
    expect(
      contract.resolveSupabaseMarketplaceIdentity?.({
        user: { claims: { sub: "" } },
      }),
    ).toBeNull();
    expect(
      contract.resolveSupabaseMarketplaceIdentity?.({
        user: { claims: { sub: "legacy-user" } },
        supabaseUser: { id: "different-user" },
      }),
    ).toBeNull();
  });
});

describe("Supabase marketplace dashboard DTOs", () => {
  it("maps a private commitment to the investor dashboard contract", () => {
    const result = contract.toCapitalCommitmentDashboardDto?.({
      id: "commitment-1",
      project_id: "project-1",
      investor_id: null,
      external_investor_id: "legacy-investor",
      amount: 50_000,
      structure_preference: "DEBT",
      notes: "Reviewed commitment",
      status: "pending",
      created_at: "2026-07-30T00:00:00.000Z",
      updated_at: "2026-07-30T01:00:00.000Z",
    });

    expect(result).toEqual({
      id: "commitment-1",
      projectId: "project-1",
      investorId: "legacy-investor",
      committedAmount: 50_000,
      structureType: "debt",
      notes: "Reviewed commitment",
      status: "pending",
      createdAt: "2026-07-30T00:00:00.000Z",
    });
    expect(result).not.toHaveProperty("externalInvestorId");
    expect(result).not.toHaveProperty("updatedAt");
  });

  it("maps a private buyer offer to the buyer dashboard contract", () => {
    const result = contract.toBuyerOfferDashboardDto?.({
      id: "offer-1",
      listing_id: "listing-1",
      buyer_id: "3bb8f9f4-b3ec-42a7-ae51-42c1f59b26d3",
      external_buyer_id: null,
      offer_amount: 700_000,
      financing_type: "cash",
      contingencies: ["21 days", "inspection"],
      message: "Ready to close",
      status: "pending",
      created_at: "2026-07-30T00:00:00.000Z",
      updated_at: "2026-07-30T01:00:00.000Z",
    });

    expect(result).toEqual({
      id: "offer-1",
      userId: "3bb8f9f4-b3ec-42a7-ae51-42c1f59b26d3",
      propertyType: "retail",
      propertyId: "listing-1",
      offerAmount: 700_000,
      fundingType: "cash",
      closingTimeline: "21 days",
      message: "Ready to close",
      status: "pending",
      createdAt: "2026-07-30T00:00:00.000Z",
      updatedAt: "2026-07-30T01:00:00.000Z",
    });
    expect(result).not.toHaveProperty("buyerId");
    expect(result).not.toHaveProperty("contingencies");
  });
});

describe("Supabase marketplace write results", () => {
  it("rejects a null insert result instead of acknowledging it as created", () => {
    expect(() =>
      contract.requireCreatedSupabaseMarketplaceRecord?.(
        null,
        "Failed to create offer",
      ),
    ).toThrow("Failed to create offer");

    const created = { id: "created-record" };
    expect(
      contract.requireCreatedSupabaseMarketplaceRecord?.(
        created,
        "Failed to create offer",
      ),
    ).toBe(created);
  });
});

describe("Supabase marketplace identity queries", () => {
  beforeEach(() => {
    supabaseMocks.from.mockReset();
    supabaseMocks.isReachable.mockReset();
    supabaseMocks.isReachable.mockResolvedValue(true);
  });

  function createSelectQuery() {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.order.mockResolvedValue({ data: [], error: null });
    supabaseMocks.from.mockReturnValue(query);
    return query;
  }

  it("queries capital commitments through the authenticated identity column", async () => {
    const { SupabaseStorage } = await import("../supabase-storage");
    const storage = new SupabaseStorage();

    const supabaseQuery = createSelectQuery();
    await storage.getCapitalCommitmentsByUser({
      userId: "c33412de-8b2d-4fd5-9d6c-b40a8efc7ac7",
      kind: "supabase",
    } as any);
    expect(supabaseQuery.eq).toHaveBeenCalledWith(
      "investor_id",
      "c33412de-8b2d-4fd5-9d6c-b40a8efc7ac7",
    );

    const externalQuery = createSelectQuery();
    await storage.getCapitalCommitmentsByUser({
      userId: "legacy-user-50383971",
      kind: "external",
    } as any);
    expect(externalQuery.eq).toHaveBeenCalledWith(
      "external_investor_id",
      "legacy-user-50383971",
    );
  });

  it("queries buyer offers through the authenticated identity column", async () => {
    const { SupabaseStorage } = await import("../supabase-storage");
    const storage = new SupabaseStorage();

    const supabaseQuery = createSelectQuery();
    await storage.getBuyerOffersByUser({
      userId: "3bb8f9f4-b3ec-42a7-ae51-42c1f59b26d3",
      kind: "supabase",
    } as any);
    expect(supabaseQuery.eq).toHaveBeenCalledWith(
      "buyer_id",
      "3bb8f9f4-b3ec-42a7-ae51-42c1f59b26d3",
    );

    const externalQuery = createSelectQuery();
    await storage.getBuyerOffersByUser({
      userId: "legacy-buyer-42",
      kind: "external",
    } as any);
    expect(externalQuery.eq).toHaveBeenCalledWith(
      "external_buyer_id",
      "legacy-buyer-42",
    );
  });
});
