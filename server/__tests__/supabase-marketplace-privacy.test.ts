import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";

type PrivacyPolicy = {
  canReadPrivateDealData?: (input: {
    userId: string;
    ownerId?: string | null;
    participantIds?: Array<string | null | undefined>;
    isStaff?: boolean;
  }) => boolean;
  toPublicSupabaseCapitalProject?: (
    project: Record<string, unknown>,
  ) => Record<string, unknown> | null;
  toPublicSupabaseListing?: (
    listing: Record<string, unknown>,
  ) => Record<string, unknown> | null;
  toPublicSupabaseWholesaleDeal?: (
    deal: Record<string, unknown>,
  ) => Record<string, unknown> | null;
};

let policy: PrivacyPolicy = {};

beforeAll(async () => {
  policy = await vi
    .importActual<PrivacyPolicy>("../supabase-marketplace-privacy")
    .catch(() => ({}));
});

describe("Supabase marketplace public projections", () => {
  it("publishes an available wholesale deal through an explicit allowlist", () => {
    expect(typeof policy.toPublicSupabaseWholesaleDeal).toBe("function");

    const result = policy.toPublicSupabaseWholesaleDeal?.({
      id: "deal-1",
      wholesaler_id: "private-owner",
      address: "100 Main St",
      city: "Oakland",
      state: "CA",
      zip_code: "94601",
      property_type: "single_family",
      arv: 750_000,
      asking_price: 510_000,
      repair_estimate: 85_000,
      assignment_fee: 20_000,
      photos: ["https://example.test/property.jpg"],
      occupancy: "vacant",
      close_timeline: "21 days",
      notes: "Seller circumstances must stay private",
      status: "available",
      is_public: true,
      raising_capital: false,
      created_at: "2026-07-01T00:00:00.000Z",
      updated_at: "2026-07-02T00:00:00.000Z",
    });

    expect(result).toEqual({
      id: "deal-1",
      address: "100 Main St",
      city: "Oakland",
      state: "CA",
      zipCode: "94601",
      propertyType: "single_family",
      arv: 750_000,
      askingPrice: 510_000,
      repairEstimate: 85_000,
      assignmentFee: 20_000,
      photos: ["https://example.test/property.jpg"],
      occupancy: "vacant",
      closeTimeline: "21 days",
      status: "available",
      raisingCapital: false,
    });
    expect(result).not.toHaveProperty("wholesalerId");
    expect(result).not.toHaveProperty("notes");
    expect(result).not.toHaveProperty("isPublic");
    expect(result).not.toHaveProperty("createdAt");
  });

  it("returns no wholesale DTO unless both visibility and status are public", () => {
    expect(
      policy.toPublicSupabaseWholesaleDeal?.({
        id: "deal-private",
        is_public: false,
        status: "available",
      }),
    ).toBeNull();
    expect(
      policy.toPublicSupabaseWholesaleDeal?.({
        id: "deal-review",
        is_public: true,
        status: "Under Review",
      }),
    ).toBeNull();
  });

  it("publishes only active capital projects and strips ownership metadata", () => {
    const result = policy.toPublicSupabaseCapitalProject?.({
      id: "project-1",
      owner_id: "private-owner",
      title: "Oakland infill",
      description: "Reviewed project",
      location: "Oakland, CA",
      property_type: "multifamily",
      structure: "EQUITY",
      funding_goal: 1_200_000,
      amount_raised: 400_000,
      min_investment: 50_000,
      projected_return: "reviewed terms",
      hold_period: "24 months",
      photos: [],
      status: "ACTIVE",
      is_public: true,
      created_at: "2026-07-01T00:00:00.000Z",
      updated_at: "2026-07-02T00:00:00.000Z",
    });

    expect(result).toEqual({
      id: "project-1",
      title: "Oakland infill",
      description: "Reviewed project",
      location: "Oakland, CA",
      propertyType: "multifamily",
      structure: "EQUITY",
      fundingGoal: 1_200_000,
      amountRaised: 400_000,
      minInvestment: 50_000,
      projectedReturn: "reviewed terms",
      holdPeriod: "24 months",
      photos: [],
      status: "ACTIVE",
    });
    expect(result).not.toHaveProperty("ownerId");
    expect(result).not.toHaveProperty("isPublic");
    expect(
      policy.toPublicSupabaseCapitalProject?.({
        id: "project-draft",
        is_public: true,
        status: "DRAFT",
      }),
    ).toBeNull();
  });

  it("publishes only active listings and strips owner and audit fields", () => {
    const result = policy.toPublicSupabaseListing?.({
      id: "listing-1",
      owner_id: "private-owner",
      title: "Ready in Alameda",
      address: "200 Shoreline Dr",
      city: "Alameda",
      state: "CA",
      zip_code: "94501",
      property_type: "condo",
      listing_type: "retail",
      price: 725_000,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1_150,
      lot_size: "n/a",
      year_built: 2001,
      description: "Reviewed listing",
      features: ["parking"],
      photos: [],
      status: "active",
      is_public: true,
      created_at: "2026-07-01T00:00:00.000Z",
      updated_at: "2026-07-02T00:00:00.000Z",
    });

    expect(result).toEqual({
      id: "listing-1",
      title: "Ready in Alameda",
      propertyAddress: "200 Shoreline Dr",
      city: "Alameda",
      state: "CA",
      zipCode: "94501",
      propertyType: "condo",
      listingType: "retail",
      listPrice: 725_000,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1_150,
      lotSize: "n/a",
      yearBuilt: 2001,
      description: "Reviewed listing",
      features: ["parking"],
      images: [],
      status: "active",
    });
    expect(result).not.toHaveProperty("address");
    expect(result).not.toHaveProperty("price");
    expect(result).not.toHaveProperty("photos");
    expect(result).not.toHaveProperty("ownerId");
    expect(result).not.toHaveProperty("isPublic");
    expect(
      policy.toPublicSupabaseListing?.({
        id: "listing-sold",
        is_public: true,
        status: "sold",
      }),
    ).toBeNull();
  });
});

describe("private deal data authorization", () => {
  it("allows only the owner, a participant, or staff", () => {
    expect(typeof policy.canReadPrivateDealData).toBe("function");

    expect(
      policy.canReadPrivateDealData?.({
        userId: "owner",
        ownerId: "owner",
        participantIds: [],
      }),
    ).toBe(true);
    expect(
      policy.canReadPrivateDealData?.({
        userId: "buyer",
        ownerId: "owner",
        participantIds: ["buyer"],
      }),
    ).toBe(true);
    expect(
      policy.canReadPrivateDealData?.({
        userId: "staff",
        ownerId: "owner",
        participantIds: [],
        isStaff: true,
      }),
    ).toBe(true);
    expect(
      policy.canReadPrivateDealData?.({
        userId: "unrelated",
        ownerId: "owner",
        participantIds: ["buyer"],
      }),
    ).toBe(false);
  });
});

describe("Supabase marketplace route wiring", () => {
  const routesSource = readFileSync(
    resolve(import.meta.dirname, "../routes.ts"),
    "utf8",
  );

  it("guards commitments and negotiation history with hybrid authentication", () => {
    expect(routesSource).toMatch(
      /app\.get\(\s*['"]\/api\/supabase\/capital-projects\/:id\/commitments['"],\s*isHybridAuthenticated,/s,
    );
    expect(routesSource).toMatch(
      /app\.get\(\s*['"]\/api\/supabase\/wholesale-deals\/:dealId\/negotiations['"],\s*isHybridAuthenticated,/s,
    );
    expect(routesSource).toMatch(
      /getWholesaleDealNegotiationsByParticipant\(\s*dealId,\s*userId,/s,
    );
  });

  it("keeps exactly one authenticated deal-context route", () => {
    const registrations =
      routesSource.match(
        /app\.get\(\s*['"]\/api\/deals\/:dealType\/:(?:id|dealId)\/context['"]/g,
      ) || [];

    expect(registrations).toHaveLength(1);
    expect(routesSource).toMatch(
      /app\.get\(\s*['"]\/api\/deals\/:dealType\/:id\/context['"],\s*isHybridAuthenticated,/s,
    );
  });
});
