import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(import.meta.dirname, "../../scripts/check-visual-accessibility.mjs"),
  "utf8",
);

function sliceBetween(start: string, end: string): string {
  const startIndex = source.indexOf(start);
  expect(startIndex, `missing start marker: ${start}`).toBeGreaterThanOrEqual(0);
  const endIndex = source.indexOf(end, startIndex);
  expect(endIndex, `missing end marker: ${end}`).toBeGreaterThan(startIndex);
  return source.slice(startIndex, endIndex);
}

describe("rendered visual-accessibility gate contract", () => {
  it("adds anonymous MarketFlow deals without dropping the original matrix or journeys", () => {
    const routeBlock = sliceBetween("const routes = [", "];\n\nconst viewports");
    const routeLiterals = [...routeBlock.matchAll(/'\/(?:[^']*)'/g)].map(
      ([route]) => route.slice(1, -1),
    );

    expect(routeLiterals).toEqual([
      "/",
      "/property-owners",
      "/deal-partners",
      "/how-we-operate",
      "/development",
      "/investments",
      "/strategy-lab",
      "/marketflow",
      "/marketflow/deals",
      "/bring-an-opportunity",
      "/work-with-apollo",
      "/connect",
      "/peggy",
      "/contact",
      "/privacy",
      "/terms",
      "/disclosures",
      "/__launch-404-check",
    ]);
    expect(source.match(/await runInteraction\(/g)).toHaveLength(12);
    expect(source).toContain("routes.length * viewports.length * colorSchemes.length");
  });

  it("renders the anonymous deals hold in premium chrome with only public actions", () => {
    const interaction = sliceBetween(
      "await runInteraction('MarketFlow",
      "await runInteraction('Peggy open and close'",
    );

    expect(interaction).toContain("openPage(page, '/marketflow/deals')");
    expect(interaction).toContain(".pg-root nav");
    expect(interaction).toContain("button-marketflow-submit-deal");
    expect(interaction).toContain("/bring-an-opportunity?intent=deal-jv");
    expect(interaction).toContain("text-deals-title");
    expect(interaction).toContain("button-sidebar-toggle");
  });

  it("checks mobile Peggy against the undecided consent banner geometry", () => {
    const interaction = sliceBetween(
      "await runInteraction('mobile navigation destination'",
      "await runInteraction('theme toggle persistence'",
    );

    expect(interaction).toContain("seedConsent: false");
    expect(interaction).toContain("Talk to Peggy");
    expect(interaction).toContain(".peggy-panel");
    expect(interaction).toContain("cookie-consent-banner");
    const transitionWait = interaction.indexOf("await page.waitForFunction");
    const geometryRead = interaction.indexOf("const geometry = await page.evaluate");
    expect(transitionWait).toBeGreaterThanOrEqual(0);
    expect(transitionWait).toBeLessThan(geometryRead);
    expect(interaction).toContain("Number(style.opacity) >= 0.99");
    expect(interaction).toMatch(/panelRect\.left\s*>=\s*0/);
    expect(interaction).toMatch(/panelRect\.right\s*<=\s*innerWidth/);
    expect(interaction).toMatch(/panelRect\.top\s*>=\s*0/);
    expect(interaction).toMatch(/panelRect\.bottom\s*<=\s*innerHeight/);
    expect(interaction).toContain("overlapsConsent");
  });

  it("uses the visible homepage hero conversion CTA instead of navigation chrome", () => {
    const interaction = sliceBetween(
      "await runInteraction('homepage primary CTA'",
      "await runInteraction('opportunity intake initial validation'",
    );

    expect(interaction).toContain("[data-hv=\"arrival\"]");
    expect(interaction).toContain("getByRole('link', { name: 'Bring an Opportunity', exact: true })");
    expect(interaction).toContain("waitFor({ state: 'visible' })");
    expect(interaction).toContain("getAttribute('href')");
    expect(interaction).toContain("/bring-an-opportunity");
    expect(interaction).toContain("await homepagePrimaryCta.click()");
    expect(interaction).toContain("await page.waitForURL(/\\/bring-an-opportunity$/)");
    expect(interaction).not.toContain("nav a[");
  });

  it("fails with evidence for traffic outside the exact preview origin", () => {
    expect(source).toContain("function isAllowedBrowserUrl");
    expect(source).toContain("url.origin === baseUrl");
    expect(source).toContain("webSocketOrigin === baseUrl");
    expect(source).not.toContain("function isLoopbackUrl");
    expect(source).not.toMatch(/hostname\s*===\s*['\"](?:localhost|::1)/);
    expect(source).toContain("context.route('**/*'");
    expect(source).toContain("route.abort('blockedbyclient')");
    expect(source).toContain("context.routeWebSocket('**/*'");
    expect(source).toContain("webSocket.close({ code: 1008");
    expect(source.match(/blockedEgress\.push\(/g)).toHaveLength(2);
    expect(source).toContain("protocol: url.protocol");
    expect(source).toContain("url: request.url()");
    expect(source).toContain("resourceType: request.resourceType()");
    expect(source).toContain("url: webSocket.url()");
    expect(source).toContain("blockedEgress: blockedEgress.slice(blockedEgressStart)");
    expect(source).toContain("page.on('console'");
    expect(source).toContain("page.on('requestfailed'");
    expect(source).toContain("page.on('response'");
    expect(source).toContain("x-pegasus-preview-stub");
    expect(source).toContain("serviceWorkers: 'block'");
  });
});
