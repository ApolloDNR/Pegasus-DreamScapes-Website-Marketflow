import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(import.meta.dirname, "..", path), "utf8");
}

describe("generic capital execution surfaces", () => {
  it("keeps every registered client path relationship-only", () => {
    const detail = source("pages/marketplace-capital-detail.tsx");
    const capitalDirectory = source("pages/marketplace-capital.tsx");
    const legacyStudio = source("pages/offer-studio.tsx");
    const canonicalStudio = source("pages/marketflow/offer-studio.tsx");
    const negotiation = source("pages/marketflow-negotiate.tsx");
    const dealDirectory = source("pages/marketflow-deals.tsx");
    const dealActions = source("contexts/deal-action-context.tsx");
    const marketplaceHook = source("hooks/use-supabase-marketplace.ts");

    expect(detail).not.toContain("/api/marketplace/investment-interest");
    expect(detail).not.toContain("OpenOfferStudioButton");
    expect(capitalDirectory).not.toContain("Funding Progress");
    expect(capitalDirectory).not.toContain("Minimum Capital");
    expect(capitalDirectory).not.toContain("Projected Return");
    expect(capitalDirectory).not.toContain("createCapitalCommitment");
    expect(legacyStudio).not.toContain("/api/supabase/capital-commitments");
    expect(canonicalStudio).not.toContain("CAPITAL_INVESTMENT");
    expect(negotiation).not.toContain("CAPITAL_INVESTMENT");
    expect(dealDirectory).not.toContain('lane="CAPITAL"');
    expect(dealDirectory).not.toContain("Commit Capital");
    expect(dealDirectory).not.toContain("Minimum Capital");
    expect(dealDirectory).not.toContain("Funding Progress");
    expect(dealDirectory).not.toContain("Operator Terms");
    expect(dealActions).not.toContain("/api/supabase/capital-investments");
    expect(dealActions).not.toContain("/api/supabase/capital-raises");
    expect(dealActions).not.toContain("function CapitalInvestmentForm");
    expect(dealActions).not.toContain("function CapitalAcceptTermsModal");
    expect(dealActions).not.toContain("function CapitalRaiseTermsForm");
    expect(marketplaceHook).not.toMatch(
      /apiRequest\(\s*["']POST["'],\s*["']\/api\/supabase\/capital-commitments["']/,
    );

    expect(legacyStudio).toContain("CapitalRelationshipOnlyNotice");
    expect(canonicalStudio).toContain('if (lane === "CAPITAL")');
    expect(canonicalStudio).toContain("CapitalRelationshipOnlyNotice");
    expect(negotiation).toContain('if (lane === "CAPITAL")');
    expect(negotiation).toContain("CapitalRelationshipOnlyNotice");
    expect(dealDirectory).toContain("Relationship information only");
    expect(capitalDirectory).toContain("Relationship information only");
    expect(dealActions).toContain("CapitalRelationshipHoldModal");
  });
});
