import type { Request, Response } from "express";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  isCapitalOfferExecution,
  rejectCapitalInvestmentInterest,
} from "../capital-relationship-only";

describe("retired capital investment-interest endpoint", () => {
  it("fails closed without reading or persisting the submission", () => {
    const status = vi.fn();
    const json = vi.fn();
    const response = { status, json } as unknown as Response;
    status.mockReturnValue(response);

    rejectCapitalInvestmentInterest(
      { body: { projectId: 17, amount: 25_000, notes: "private" } } as Request,
      response,
      vi.fn(),
    );

    expect(status).toHaveBeenCalledWith(410);
    expect(json).toHaveBeenCalledWith({
      code: "CAPITAL_RELATIONSHIP_ONLY",
      message:
        "MarketFlow does not accept investment interest, funds, offers, allocations, or commitments through this endpoint.",
      relationshipPath: "/capital#capital-introduction",
    });
  });

  it("recognizes capital writes without blocking property-specific lanes", () => {
    expect(isCapitalOfferExecution({ lane: "capital" })).toBe(true);
    expect(isCapitalOfferExecution({ offerKind: "CAPITAL_INVESTMENT" })).toBe(true);
    expect(isCapitalOfferExecution({ lane: "WHOLESALE", offerKind: "WHOLESALE_ASSIGNMENT" })).toBe(false);
    expect(isCapitalOfferExecution({ lane: "LISTING", offerKind: "LISTING_INQUIRY" })).toBe(false);
  });

  it("does not let an admin status update open a project for capital activity", () => {
    const routesSource = readFileSync(
      resolve(import.meta.dirname, "../wholesale-review-routes.ts"),
      "utf8",
    );
    const routeStart = routesSource.indexOf("const updateCapitalStatus");
    const routeSource = routesSource.slice(
      routeStart,
      routesSource.indexOf("return {", routeStart),
    );

    expect(routeStart).toBeGreaterThan(-1);
    expect(routeSource).toMatch(
      /if \(status === ["']funding["']\) \{\s*return sendCapitalRelationshipOnly\(response\);\s*\}/,
    );
    expect(routeSource).not.toContain(
      '["approved", "funding", "rejected", "under_review"]',
    );
    expect(routeSource).not.toContain("open for capital review");
    expect(routeSource).not.toContain("has been approved!");
    expect(routeSource).toContain(
      "Administrative approval is not an offering or a publication action",
    );
    expect(routeSource).toContain("is_public: false");
  });
});
