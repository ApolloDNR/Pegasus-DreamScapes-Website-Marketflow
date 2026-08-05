import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routesSource = readFileSync(
  resolve(import.meta.dirname, "../routes.ts"),
  "utf8",
);

const sourceSlice = (startMarker: string, endMarker: string) => {
  const start = routesSource.indexOf(startMarker);
  expect(start, `missing start marker: ${startMarker}`).toBeGreaterThanOrEqual(0);
  const end = routesSource.indexOf(endMarker, start);
  expect(end, `missing end marker: ${endMarker}`).toBeGreaterThan(start);
  return routesSource.slice(start, end);
};

const pickedFields = (schemaName: string) => {
  const start = routesSource.indexOf(`const ${schemaName}`);
  expect(start, `missing schema: ${schemaName}`).toBeGreaterThanOrEqual(0);
  const end = routesSource.indexOf(";", start);
  expect(end, `unterminated schema: ${schemaName}`).toBeGreaterThan(start);
  const schema = routesSource.slice(start, end + 1);

  expect(schema).toMatch(/\.partial\(\)\s*\.strict\(\)/s);
  return [...schema.matchAll(/(\w+): true/g)].map((match) => match[1]);
};

const expectStrictNumericId = (route: string, variable: string) => {
  expect(route).toContain(`const ${variable} = Number(req.params.id);`);
  expect(route).toContain(`!Number.isSafeInteger(${variable})`);
  expect(route).toContain(`${variable} <= 0`);
  expect(route).not.toMatch(/parseInt\(req\.params\.id\)/);
};

const expectValidatedUpdate = (
  route: string,
  schemaName: string,
  updateCall: string,
) => {
  const validation = `${schemaName}.safeParse(req.body)`;
  expect(route).toContain(validation);
  expect(route).toContain(updateCall);
  expect(route.indexOf(validation)).toBeLessThan(route.indexOf(updateCall));
  expect(route).not.toMatch(/storage\.update(?:CapitalProject|WholesaleDeal|Listing)\([^;]*req\.body/s);
};

describe("owner update route governance contract", () => {
  it("defines exact, strict content-only update schemas", () => {
    expect(pickedFields("capitalProjectOwnerUpdateSchema")).toEqual([
      "title",
      "fundingGoal",
      "minInvestment",
      "projectedReturn",
      "description",
    ]);
    expect(pickedFields("wholesaleDealOwnerUpdateSchema")).toEqual([
      "askingPrice",
      "arv",
      "estimatedRepairs",
      "description",
      "assignmentFee",
    ]);
    expect(pickedFields("listingOwnerUpdateSchema")).toEqual([
      "listPrice",
      "bedrooms",
      "bathrooms",
      "sqft",
      "description",
    ]);
  });

  it("validates the Supabase-named numeric capital alias before mutation", () => {
    const route = sourceSlice(
      "app.patch('/api/supabase/capital-projects/:id'",
      "// --- Capital Commitments (Supabase) ---",
    );

    expectStrictNumericId(route, "projectId");
    expectValidatedUpdate(
      route,
      "capitalProjectOwnerUpdateSchema",
      "storage.updateCapitalProject(projectId, updateResult.data)",
    );
  });

  it("validates the Supabase-named numeric wholesale alias before mutation", () => {
    const route = sourceSlice(
      "app.patch('/api/supabase/wholesale-deals/:id'",
      "// --- Wholesale Deal Offers (Supabase) ---",
    );

    expectStrictNumericId(route, "dealId");
    expectValidatedUpdate(
      route,
      "wholesaleDealOwnerUpdateSchema",
      "storage.updateWholesaleDeal(dealId, updateResult.data)",
    );
  });

  it("validates the canonical wholesale owner route before mutation", () => {
    const route = sourceSlice(
      'app.patch("/api/wholesale-deals/:id"',
      "// User-owned capital project update",
    );

    expectStrictNumericId(route, "dealId");
    expectValidatedUpdate(
      route,
      "wholesaleDealOwnerUpdateSchema",
      "storage.updateWholesaleDeal(dealId, updateResult.data)",
    );
  });

  it("validates the canonical capital owner route before mutation", () => {
    const route = sourceSlice(
      'app.patch("/api/capital-projects/:id"',
      "// Admin Featured Deals API",
    );

    expectStrictNumericId(route, "projectId");
    expectValidatedUpdate(
      route,
      "capitalProjectOwnerUpdateSchema",
      "storage.updateCapitalProject(projectId, updateResult.data)",
    );
  });

  it("validates the listing owner route before mutation", () => {
    const route = sourceSlice(
      'app.patch("/api/listings/:id"',
      'app.post("/api/listing-inquiries"',
    );

    expectStrictNumericId(route, "listingId");
    expectValidatedUpdate(
      route,
      "listingOwnerUpdateSchema",
      "storage.updateListing(listingId, updateResult.data)",
    );
  });
});
