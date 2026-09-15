import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { jsonLdFor } from "../../shared/structured-data";

type JsonLdNode = Record<string, unknown>;

function nodeNamed(nodes: JsonLdNode[], name: string): JsonLdNode | undefined {
  return nodes.find((node) => node.name === name);
}

const UNVERIFIED_TRADE_MEMBERSHIP = /\b(?:REALTOR®?|NAR|CAR|CCAR|NRDS)\b/i;

function expectNoUnverifiedTradeMembership(value: unknown): void {
  expect(JSON.stringify(value)).not.toMatch(UNVERIFIED_TRADE_MEMBERSHIP);
}

describe.each(["/", "/about", "/contact"])(
  "structured identity on %s",
  (pathname) => {
    it("keeps Pegasus Dreamscapes Corp. an operating company, not a brokerage", () => {
      const organization = nodeNamed(
        jsonLdFor(pathname),
        "Pegasus Dreamscapes Corp.",
      );

      expect(organization).toMatchObject({
        "@type": "Organization",
        "@id": "https://pegasusdreamscapes.com/#organization",
        name: "Pegasus Dreamscapes Corp.",
      });
      expect(organization?.description).toContain(
        "Pegasus Dreamscapes Corp. is not a real estate brokerage.",
      );
      expect(organization).not.toHaveProperty("identifier");
      expect(organization).not.toHaveProperty("memberOf");
    });

    it("uses Apollo's legal identity and verified responsible broker", () => {
      const apollo = nodeNamed(
        jsonLdFor(pathname),
        "Paolo Ariel Duran Ramirez",
      );

      expect(apollo).toMatchObject({
        "@type": "Person",
        "@id": "https://pegasusdreamscapes.com/#apollo-duran",
        name: "Paolo Ariel Duran Ramirez",
        alternateName: 'Paolo "Apollo" Duran',
        identifier: "CA DRE #02333658",
        affiliation: {
          "@type": "Organization",
          name: "BMP Realty Inc.",
          alternateName: "Keller Williams Realty-East Bay",
          identifier: "CA DRE #01277896",
        },
      });
    });

    it("does not publish unverified trade-association membership", () => {
      expectNoUnverifiedTradeMembership(jsonLdFor(pathname));
    });
  },
);

describe("static HTML structured identity", () => {
  const html = readFileSync(resolve(process.cwd(), "client/index.html"), "utf8");
  const jsonLdMatch = html.match(
    /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );

  it("matches the verified identity used by route-aware JSON-LD", () => {
    expect(jsonLdMatch).not.toBeNull();
    const structuredIdentity = JSON.parse(jsonLdMatch?.[1] ?? "null");

    expect(structuredIdentity).toMatchObject({
      "@type": "Organization",
      name: "Pegasus Dreamscapes Corp.",
      founder: {
        "@type": "Person",
        name: "Paolo Ariel Duran Ramirez",
        alternateName: 'Paolo "Apollo" Duran',
        identifier: "CA DRE #02333658",
        affiliation: {
          "@type": "Organization",
          name: "BMP Realty Inc.",
          alternateName: "Keller Williams Realty-East Bay",
          identifier: "CA DRE #01277896",
        },
      },
    });
    expect(structuredIdentity.description).toContain(
      "Pegasus Dreamscapes Corp. is not a real estate brokerage.",
    );
    expectNoUnverifiedTradeMembership(structuredIdentity);
  });
});
