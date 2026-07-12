import { describe, expect, it } from "vitest";
import { routeOpportunity } from "../opportunityRouting";
import { insertOpportunitySchema, OPPORTUNITY_STATUSES } from "@shared/schema";

describe("routeOpportunity (PRD §11.4 / schema doc §3)", () => {
  it("routes distressed owners to Acquisitions", () => {
    expect(routeOpportunity({ visitorType: "owner", situation: "Pre-foreclosure", goal: "Sell" }))
      .toMatchObject({ assignedDepartment: "Acquisitions" });
  });
  it("routes list-through-KW goals to Work With Apollo regardless of type", () => {
    expect(routeOpportunity({ visitorType: "owner", goal: "List through Apollo / Keller Williams" }))
      .toMatchObject({ assignedDepartment: "Work With Apollo / KW" });
  });
  it("routes hold/rent goals through Asset Management lane", () => {
    expect(routeOpportunity({ visitorType: "owner", goal: "Hold / rent" }).recommendedLane)
      .toContain("Asset Management");
  });
  it("routes deal finders to Acquisitions with Dispositions/MarketFlow lane", () => {
    const r = routeOpportunity({ visitorType: "deal_finder" });
    expect(r.assignedDepartment).toBe("Acquisitions");
    expect(r.recommendedLane).toContain("MarketFlow");
  });
  it("routes buyers to Work With Apollo / KW", () => {
    expect(routeOpportunity({ visitorType: "buyer" }).assignedDepartment).toBe("Work With Apollo / KW");
  });
  it("routes capital partners to private review", () => {
    expect(routeOpportunity({ visitorType: "capital_partner" }).assignedDepartment).toBe("Private Capital Review");
  });
  it("routes vendors to the bench and unsure owners to Strategy Review", () => {
    expect(routeOpportunity({ visitorType: "vendor_operator" }).assignedDepartment).toBe("Vendor Bench");
    expect(routeOpportunity({ visitorType: "owner", goal: "Not sure" }).assignedDepartment)
      .toBe("Strategy Review");
  });
});

describe("insertOpportunitySchema", () => {
  const base = { visitorType: "owner", contactName: "Test Owner", email: "t@example.com", consentAccepted: true };
  it("accepts a minimal valid submission", () => {
    expect(insertOpportunitySchema.safeParse(base).success).toBe(true);
  });
  it("rejects missing consent and bad email", () => {
    expect(insertOpportunitySchema.safeParse({ ...base, consentAccepted: false }).success).toBe(false);
    expect(insertOpportunitySchema.safeParse({ ...base, email: "nope" }).success).toBe(false);
  });
  it("locks the twelve status labels", () => {
    expect(OPPORTUNITY_STATUSES).toHaveLength(12);
    expect(OPPORTUNITY_STATUSES[0]).toBe("New");
    expect(OPPORTUNITY_STATUSES[11]).toBe("Passed / Archived");
  });
});
