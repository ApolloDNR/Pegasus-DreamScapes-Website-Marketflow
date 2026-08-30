// @vitest-environment node
import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");

const STANDALONE_PUBLIC_SOURCES = [
  "client/src/pages/sell.tsx",
  "client/src/pages/departments.tsx",
  "client/src/pages/deal-blueprint.tsx",
  "client/src/pages/projects.tsx",
  "client/src/pages/project-detail.tsx",
  "client/src/pages/project-nelson-dr.tsx",
  "client/src/pages/case-study.tsx",
  "client/src/pages/vendor-network.tsx",
  "client/src/pages/connect.tsx",
  "client/src/pages/submit-property.tsx",
  "client/src/pages/pegasus-standard.tsx",
  "client/src/pages/strategy-lab-blueprint-confirmed.tsx",
  "client/src/pages/disclosures.tsx",
  "client/src/components/success-view.tsx",
  "shared/faq-data.ts",
];

describe("standalone public truth invariants", () => {
  it("keeps retired public promises out of mounted standalone copy", () => {
    const source = STANDALONE_PUBLIC_SOURCES.map(read).join("\n");

    for (const retired of [
      "Every submission gets a serious review",
      "A free property review comes back within 48 hours",
      "Four sections. Every time.",
      "Most Blueprints are delivered within 7–10 business days",
      "Direct response within 1–2 business days",
      "the team has been notified",
      "Routed to active work",
      "Your Strategy Snapshot is being prepared",
      "Every property gets a path",
    ]) {
      expect(source).not.toContain(retired);
    }
  });

  it("publishes only the evidence-gated Nelson project from API data", () => {
    const projects = read("client/src/pages/projects.tsx");
    const detail = read("client/src/pages/project-detail.tsx");

    expect(projects).toContain("filter(isNelsonProject).map(toPublicNelsonProject)");
    expect(detail).toContain("enabled: slug === NELSON_FACTS.slug");
    expect(detail).toContain("toPublicNelsonProject(rawProject)");
  });

  it("locks Nelson figures and explains that gross spread is not profit", () => {
    const facts = read("shared/nelson-facts.ts");

    for (const amount of ["600_000", "105_000", "705_000", "840_000", "135_000"]) {
      expect(facts).toContain(amount);
    }
    expect(facts).toMatch(/not net profit or return/i);
    expect(facts).toMatch(/does not identify every contractor/i);
  });

  it("seeds the public Nelson record from the same facts without invented execution claims", () => {
    const seed = read("server/seed.ts");

    expect(seed).toContain("NELSON_FACTS.improvementBudget");
    expect(seed).toContain("NELSON_PUBLIC_DESCRIPTION");
    expect(seed).toContain("holdTime: null");
    expect(seed).not.toContain("The first Pegasus-controlled project");
    expect(seed).not.toContain("Permit coordination with the City of Richmond");
    expect(seed).not.toContain("produces on every reviewed property");
  });

  it("uses the verified license-record name and responsible broker", () => {
    const source = [
      read("client/src/pages/connect.tsx"),
      read("client/src/pages/submit-property.tsx"),
      read("client/src/pages/project-nelson-dr.tsx"),
      read("shared/faq-data.ts"),
    ].join("\n");

    expect(source).toContain("Duran Ramirez, Paolo Ariel");
    expect(source).toContain("BMP Realty Inc DBA Keller Williams Realty-East Bay");
    expect(source).toMatch(/public-facing name/i);
    expect(source).toMatch(/does not identify who provided brokerage representation on Nelson/i);
  });
});
