import { describe, it, expect } from "vitest";
import {
  MARKETPLACE_ROLES,
  MARKETPLACE_ROLE_CONFIG,
  isValidMarketplaceRole,
  isPegasusRole,
  isAdminRole,
  isWholesalerRole,
  isDreamscaperRole,
  isInvestorRole,
  isBuyerRole,
  hasMarketplacePermission,
  getRoleDashboard,
  type MarketplaceRole,
} from "@shared/schema";

describe("MarketFlow role gating (8-tier MARKETPLACE_ROLES)", () => {
  it("exposes the canonical 8-role set in a stable order", () => {
    expect([...MARKETPLACE_ROLES]).toEqual([
      "admin",
      "pegasus_wholesaler",
      "wholesaler",
      "pegasus_dreamscaper",
      "dreamscaper",
      "investor",
      "buyer_retail",
      "buyer_investment",
    ]);
  });

  it("validates known roles and rejects unknown roles", () => {
    for (const role of MARKETPLACE_ROLES) {
      expect(isValidMarketplaceRole(role)).toBe(true);
    }
    expect(isValidMarketplaceRole("guest")).toBe(false);
    expect(isValidMarketplaceRole("")).toBe(false);
    expect(isValidMarketplaceRole("ADMIN")).toBe(false);
  });

  it("flags only Pegasus-internal roles as Pegasus-badged", () => {
    const pegasus: MarketplaceRole[] = [
      "admin",
      "pegasus_wholesaler",
      "pegasus_dreamscaper",
    ];
    const external: MarketplaceRole[] = [
      "wholesaler",
      "dreamscaper",
      "investor",
      "buyer_retail",
      "buyer_investment",
    ];
    for (const r of pegasus) expect(isPegasusRole(r)).toBe(true);
    for (const r of external) expect(isPegasusRole(r)).toBe(false);
  });

  it("groups roles correctly via the category helpers", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("wholesaler")).toBe(false);

    expect(isWholesalerRole("wholesaler")).toBe(true);
    expect(isWholesalerRole("pegasus_wholesaler")).toBe(true);
    expect(isWholesalerRole("investor")).toBe(false);

    expect(isDreamscaperRole("dreamscaper")).toBe(true);
    expect(isDreamscaperRole("pegasus_dreamscaper")).toBe(true);
    expect(isDreamscaperRole("buyer_retail")).toBe(false);

    expect(isInvestorRole("investor")).toBe(true);
    expect(isInvestorRole("buyer_investment")).toBe(false);

    expect(isBuyerRole("buyer_retail")).toBe(true);
    expect(isBuyerRole("buyer_investment")).toBe(true);
    expect(isBuyerRole("investor")).toBe(false);
  });

  describe("permission gating (hasMarketplacePermission)", () => {
    it("admin can manage users; nobody else can", () => {
      for (const role of MARKETPLACE_ROLES) {
        const expected = role === "admin";
        expect(hasMarketplacePermission(role, "manage_users")).toBe(expected);
      }
    });

    it("only wholesaler-class roles can submit deals", () => {
      const allowed = new Set<MarketplaceRole>([
        "pegasus_wholesaler",
        "wholesaler",
      ]);
      for (const role of MARKETPLACE_ROLES) {
        expect(hasMarketplacePermission(role, "submit_deals")).toBe(
          allowed.has(role),
        );
      }
    });

    it("only dreamscaper-class roles can create projects", () => {
      const allowed = new Set<MarketplaceRole>([
        "pegasus_dreamscaper",
        "dreamscaper",
      ]);
      for (const role of MARKETPLACE_ROLES) {
        expect(hasMarketplacePermission(role, "create_projects")).toBe(
          allowed.has(role),
        );
      }
    });

    it("only investors can commit capital", () => {
      for (const role of MARKETPLACE_ROLES) {
        expect(hasMarketplacePermission(role, "commit_capital")).toBe(
          role === "investor",
        );
      }
    });

    it("only buyer roles can make offers (browse-listings/make-offers gating)", () => {
      const allowed = new Set<MarketplaceRole>([
        "buyer_retail",
        "buyer_investment",
      ]);
      for (const role of MARKETPLACE_ROLES) {
        expect(hasMarketplacePermission(role, "make_offers")).toBe(
          allowed.has(role),
        );
      }
    });
  });

  it("routes each role to its expected dashboard path", () => {
    expect(getRoleDashboard("admin")).toBe("/marketplace/admin");
    expect(getRoleDashboard("pegasus_wholesaler")).toBe(
      "/marketplace/wholesaler",
    );
    expect(getRoleDashboard("wholesaler")).toBe("/marketplace/wholesaler");
    expect(getRoleDashboard("pegasus_dreamscaper")).toBe(
      "/marketplace/dreamscaper",
    );
    expect(getRoleDashboard("dreamscaper")).toBe("/marketplace/dreamscaper");
    expect(getRoleDashboard("investor")).toBe("/marketplace/investor");
    expect(getRoleDashboard("buyer_retail")).toBe("/marketplace/buyer");
    expect(getRoleDashboard("buyer_investment")).toBe("/marketplace/buyer");
  });

  it("every role has a non-empty permission set in MARKETPLACE_ROLE_CONFIG", () => {
    for (const role of MARKETPLACE_ROLES) {
      const cfg = MARKETPLACE_ROLE_CONFIG[role];
      expect(cfg).toBeDefined();
      expect(cfg.permissions.length).toBeGreaterThan(0);
      expect(cfg.label.length).toBeGreaterThan(0);
    }
  });
});
