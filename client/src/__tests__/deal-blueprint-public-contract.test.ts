// @vitest-environment node
import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

function readSource(relPath: string): string {
  return readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("public Deal Blueprint launch contract", () => {
  it("keeps Strategy Lab from creating a public Blueprint checkout or order", () => {
    const source = readSource("client/src/pages/strategy-lab.tsx");

    expect(source).toContain('navigate("/deal-blueprint")');
    expect(source).not.toContain("/api/strategy-lab/blueprint-order");
    expect(source).not.toContain("checkoutUrl");
    expect(source).not.toContain("Stripe checkout");
    expect(source).not.toContain("Place order");
    expect(source).not.toContain("custom invoice");
  });

  it("retires the old Blueprint confirmation page without fabricating a receipt", () => {
    const source = readSource("client/src/pages/strategy-lab-blueprint-confirmed.tsx");

    expect(source).toContain("Blueprint confirmation is not available at this link");
    expect(source).toContain("cannot verify that Pegasus received a request");
    expect(source).toContain("not an order confirmation");
    expect(source).not.toContain("Blueprint request received");
    expect(source).not.toContain("Keep the reference above as proof of receipt");
    expect(source).not.toContain("Order confirmed. Work begins.");
    expect(source).not.toContain("Your Blueprint order is in our queue");
  });

  it("keeps public Blueprint APIs in by-review mode", () => {
    const source = readSource("server/strategyLabRoutes.ts");

    expect(source).toContain('mode: "by_review"');
    expect(source).toContain('res.status(410)');
    expect(source).toContain("Deal Blueprint checkout is not available publicly.");
    expect(source).not.toContain("https://api.stripe.com/v1/checkout/sessions");
    expect(source).not.toContain("loadBlueprintTiers");
  });
});
