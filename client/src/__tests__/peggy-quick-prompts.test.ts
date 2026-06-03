import { describe, it, expect } from "vitest";
import { getQuickPrompts } from "@/components/peggy-dock";

describe("Peggy quick-prompt route mapping", () => {
  describe("default (homepage / unknown page) router prompts", () => {
    const prompts = getQuickPrompts();

    it("returns the full 6-route router set", () => {
      expect(prompts).toHaveLength(6);
      for (const p of prompts) {
        expect(p.context).toBe("router");
        expect(typeof p.href).toBe("string");
        expect(p.href!.startsWith("/")).toBe(true);
      }
    });

    it("maps each label to its canonical route", () => {
      const map = Object.fromEntries(prompts.map((p) => [p.label, p.href]));
      expect(map["I have a property"]).toBe("/submit?intent=property");
      expect(map["I have a deal or JV idea"]).toBe("/submit?intent=deal-jv");
      expect(map["Capital conversation"]).toBe("/capital");
      expect(map["ADU / development"]).toBe("/submit?intent=adu");
      expect(map["Learn strategies"]).toBe("/library");
      expect(map["Vendor or operator"]).toBe("/vendor-network");
    });

    it("does not surface forbidden public marketing phrasing in prompt copy", () => {
      const forbidden = [
        "Invest Now",
        "Invest With Us",
        "Investor Returns",
        "Passive Income",
        "Guaranteed Returns",
        "Principal Protected",
        "we buy houses fast",
      ];
      for (const p of prompts) {
        for (const phrase of forbidden) {
          expect(p.label.toLowerCase()).not.toContain(phrase.toLowerCase());
          expect(p.prompt.toLowerCase()).not.toContain(phrase.toLowerCase());
        }
      }
    });
  });

  describe("calculator-page context", () => {
    it("returns calculator-scoped prompts with no router hrefs", () => {
      const prompts = getQuickPrompts("/calculators/brrrr");
      expect(prompts.length).toBeGreaterThan(0);
      for (const p of prompts) {
        expect(p.context).toBe("calculator");
        expect(p.href).toBeUndefined();
      }
    });
  });

  describe("deal/wholesale/capital context", () => {
    it.each(["/marketflow/deals", "wholesale-deal", "capital-project"])(
      "returns deal-scoped prompts for page=%s",
      (page) => {
        const prompts = getQuickPrompts(page);
        expect(prompts.length).toBeGreaterThan(0);
        for (const p of prompts) {
          expect(["deal", "marketplace", "router"]).toContain(p.context);
        }
      },
    );
  });

  describe("marketflow / marketplace context", () => {
    const prompts = getQuickPrompts("/marketflow");

    it("includes a 'Request access' prompt that routes to the access request form", () => {
      const requestAccess = prompts.find((p) => p.label === "Request access");
      expect(requestAccess).toBeDefined();
      expect(requestAccess?.href).toBe("/marketflow/access");
      expect(requestAccess?.context).toBe("marketplace");
    });

    it("includes a 'What is MarketFlow?' explainer prompt without an href", () => {
      const explainer = prompts.find((p) => p.label === "What is MarketFlow?");
      expect(explainer).toBeDefined();
      expect(explainer?.href).toBeUndefined();
    });

    it("appends the first two router prompts for cross-routing", () => {
      const hrefs = prompts.map((p) => p.href).filter(Boolean);
      expect(hrefs).toContain("/submit?intent=property");
      expect(hrefs).toContain("/submit?intent=deal-jv");
    });
  });
});
