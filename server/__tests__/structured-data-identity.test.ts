import { describe, expect, it } from "vitest";
import { jsonLdFor } from "../../shared/structured-data";

type JsonLdNode = Record<string, unknown>;

function nodeNamed(nodes: JsonLdNode[], name: string): JsonLdNode | undefined {
  return nodes.find((node) => node.name === name);
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
      expect(organization).not.toHaveProperty("identifier");
      expect(organization).not.toHaveProperty("memberOf");
    });

    it("puts the DRE license and Keller Williams affiliation on Apollo", () => {
      const apollo = nodeNamed(
        jsonLdFor(pathname),
        'Paolo "Apollo" Duran',
      );

      expect(apollo).toMatchObject({
        "@type": "Person",
        "@id": "https://pegasusdreamscapes.com/#apollo-duran",
        identifier: "CA DRE #02333658",
        affiliation: {
          "@type": "Organization",
          name: "Keller Williams East Bay",
        },
      });
    });
  },
);
