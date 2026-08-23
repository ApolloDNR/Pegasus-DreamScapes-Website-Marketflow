import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(import.meta.dirname, "../../scripts/check-visual-accessibility.mjs"),
  "utf8",
);
const workflow = readFileSync(
  resolve(import.meta.dirname, "../../.github/workflows/test.yml"),
  "utf8",
);
const baseStyles = readFileSync(
  resolve(import.meta.dirname, "../../client/src/index.css"),
  "utf8",
);
const reducedMotionStyleSheets = [
  "../../client/src/index.css",
  "../../client/src/pegasus/_group.css",
  "../../client/src/pegasus/about-v6.css",
].map((relativePath) => ({
  relativePath,
  source: readFileSync(resolve(import.meta.dirname, relativePath), "utf8"),
}));

function sliceBetween(start: string, end: string): string {
  const startIndex = source.indexOf(start);
  expect(startIndex, `missing start marker: ${start}`).toBeGreaterThanOrEqual(0);
  const endIndex = source.indexOf(end, startIndex);
  expect(endIndex, `missing end marker: ${end}`).toBeGreaterThan(startIndex);
  return source.slice(startIndex, endIndex);
}

describe("rendered visual-accessibility gate contract", () => {
  it("keeps the public route matrix while expanding deterministic interaction journeys", () => {
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
    expect(source).toContain("interactionJourneyCount !== 17");
    expect(source).toContain("PASS: 17 rendered launch journeys");
    expect(source).toContain("routes.length * viewports.length * colorSchemes.length");
  });

  it("locks the 144-check responsive evidence matrix to named release viewports", () => {
    const viewportBlock = sliceBetween("const viewports = [", "];\n\nconst colorSchemes");

    expect(viewportBlock).toContain("'desktop-1440', { width: 1440, height: 940 }");
    expect(viewportBlock).toContain("'tablet-1024', { width: 1024, height: 900 }");
    expect(viewportBlock).toContain("'tablet-768', { width: 768, height: 1024 }");
    expect(viewportBlock).toContain("'mobile-390', { width: 390, height: 844 }");
    expect(viewportBlock).not.toMatch(/\['(?:desktop|tablet|mobile)',/);
    expect(source).not.toMatch(/viewports\[\d+\]/);
    expect(source).toContain("`${slug}-${viewportName}-${colorScheme}.png`");
    expect(source).not.toContain("colorScheme === 'dark'");
    expect(source).toContain("PASS: 144 rendered route/viewport/theme checks");
  });

  it("settles and inspects the complete rendered page before recording evidence", () => {
    expect(source).toContain("async function settleRenderedPage");
    expect(source).toContain("await document.fonts.ready");
    expect(source).toContain("image.decode()");
    expect(source).toContain("fontsTimedOut");
    expect(source).toContain("imageDecodeTimedOut");
    expect(source).toContain("incompleteImages");
    expect(source).toContain("pass < 160 && stableBottomPasses < 2");
    expect(source).toContain("window.scrollTo(0, document.documentElement.scrollHeight)");
    expect(source).toContain("window.scrollTo(0, 0)");
    expect(source).toContain("scrollWidth");
    expect(source).toContain("prefers-reduced-motion: reduce");
    expect(source).toContain("document.getAnimations()");
    expect(source).toContain("consoleWarnings");
    expect(source).toContain("page.on('requestfailed'");
    expect(source).toContain("page.on('response'");
    expect(source).toContain("await settleRenderedPage(page)");
    expect(source).toContain("async function settleAfterInteraction");
    expect(source).toContain("async function waitForActiveRequestCount");
    expect(source).toContain("stableMs = 150");
    expect(source).toContain("requestActivityGeneration");
    expect(source).toContain("lastRequestActivityAt");
    expect(source).toContain("markRequestActivity()");
    expect(source).toContain("requestState.settled");
    expect(source).toContain("async function settleEvidenceState");
    expect(source).toContain("async function captureEvidenceScreenshot");
    expect(source).toContain("await settleAfterInteraction(page, health)");
    expect(source).toContain("text === 'Google Maps API key not configured.'");

    const requestMonitor = sliceBetween(
      "function monitorPageHealth(page)",
      "function browserHealthFailures",
    );
    expect(requestMonitor.match(/markRequestActivity\(\)/g)).toHaveLength(3);
    const requestWait = sliceBetween(
      "async function waitForActiveRequestCount(",
      "async function settleEvidenceState",
    );
    expect(requestWait).toContain(
      "health.requestActivityGeneration !== observedGeneration",
    );
    expect(requestWait).toContain("health.lastRequestActivityAt >= stableMs");

    const fixedPoint = sliceBetween(
      "async function settleEvidenceState(",
      "async function settleAfterInteraction",
    );
    expect(fixedPoint.match(/await settleRenderedPage\(page\)/g)).toHaveLength(2);
    expect(fixedPoint.match(/await waitForActiveRequestCount\(/g)).toHaveLength(2);

    const routeEvidence = sliceBetween(
      "for (const route of routes) {",
      "const browserHealth = browserHealthFailures",
    );
    const firstSettle = routeEvidence.indexOf("await settleRenderedPage(page)");
    const firstRequestWait = routeEvidence.indexOf("await waitForActiveRequestCount(health, 0)");
    const axeRun = routeEvidence.indexOf("await globalThis.axe.run(document");
    const secondSettle = routeEvidence.indexOf("await settleRenderedPage(page)", firstSettle + 1);
    const secondRequestWait = routeEvidence.indexOf(
      "await waitForActiveRequestCount(health, 0)",
      firstRequestWait + 1,
    );
    expect(firstSettle).toBeLessThan(firstRequestWait);
    expect(firstRequestWait).toBeLessThan(axeRun);
    expect(axeRun).toBeLessThan(secondSettle);
    expect(secondSettle).toBeLessThan(secondRequestWait);
  });

  it("exercises controlled intake pending, failure, focused retry, and success at every release viewport", () => {
    const interaction = sliceBetween(
      "for (const [intakeViewportName, intakeViewport] of viewports)",
      "await runInteraction('Strategy Lab primary interaction'",
    );

    expect(interaction).toContain("createControlledRelease(");
    expect(interaction).toContain("firstAttemptRelease.wait()");
    expect(interaction).toContain("secondAttemptRelease.wait()");
    expect(interaction).toContain("firstAttemptRelease.release()");
    expect(interaction).toContain("secondAttemptRelease.release()");
    expect(interaction).toContain("page.route(`${baseUrl}/api/opportunities`");
    expect(interaction).toContain("request.method() === 'POST'");
    expect(interaction).toContain("page.waitForRequest(");
    expect(interaction).toContain("{ timeout: 10_000 }");
    expect(interaction).toContain("[qaResponseHeader]: qaFailureMarker");
    expect(interaction).toContain("status: 503");
    expect(interaction).toContain("status: 201");
    expect(interaction).toContain("api/opportunities");
    expect(interaction).toContain("sourcePage: '/bring-an-opportunity'");
    expect(interaction).toContain("leadSource: 'public_website_v1'");
    expect(interaction).toContain("visitorType: 'owner'");
    expect(interaction).toContain("contactName: 'Avery Stone'");
    expect(interaction).toContain("email: 'qa.intake@example.com'");
    expect(interaction).toContain("consentAccepted: true");
    expect(interaction).toContain("captureEvidenceScreenshot(");
    expect(interaction).toContain("`intake-pending-${intakeViewportName}.png`");
    expect(interaction).toContain("`intake-error-${intakeViewportName}.png`");
    expect(interaction).toContain("`intake-retrying-${intakeViewportName}.png`");
    expect(interaction).toContain("`intake-success-${intakeViewportName}.png`");
    expect(interaction.match(/expectedActiveRequests: 1/g)).toHaveLength(2);
    expect(interaction).toContain("data-rendered-qa-retry-identity");
    expect(interaction).toContain("getAttribute('aria-disabled') === 'true'");
    expect(interaction).toContain("retrying.click({ force: true })");
    expect(interaction).toContain("attempt === 2");
    expect(interaction).toContain("document.activeElement");
    expect(interaction).toContain("Received.");
  });

  it("keeps deferred browser observers handled when an interaction exits early", () => {
    const interactionRunner = sliceBetween(
      "async function runInteraction",
      "async function openPage",
    );
    const intakeInteraction = sliceBetween(
      "for (const [intakeViewportName, intakeViewport] of viewports)",
      "await runInteraction('Strategy Lab primary interaction'",
    );

    expect(source).toContain("function observeBrowserEvent");
    expect(source).toContain("function unwrapBrowserEvent");
    expect(intakeInteraction.match(/observeBrowserEvent\(/g)).toHaveLength(4);
    expect(intakeInteraction.match(/unwrapBrowserEvent\(/g)).toHaveLength(4);
    expect(interactionRunner).toContain("console.error(`[interaction-detail]");
    expect(source).toContain("const pendingControlledReleases = new Set();");
    expect(source).toContain("pendingControlledReleases.add(releaseControl)");
    expect(interactionRunner).toContain("releasePendingControlledEvents()");
    expect(interactionRunner).toContain("page.unrouteAll({ behavior: 'wait' })");
  });

  it("never re-enables CSS motion after reduced motion is requested", () => {
    const nonZeroTime = (value: string) => value
      .split(",")
      .some((part) => !/^0(?:\.0+)?(?:ms|s)?$/i.test(part.trim()));
    const violations: string[] = [];

    for (const { relativePath, source: styleSource } of reducedMotionStyleSheets) {
      const root = postcss.parse(styleSource, { from: relativePath });
      root.walkAtRules("media", (media) => {
        if (!media.params.includes("prefers-reduced-motion: reduce")) return;
        media.walkDecls((declaration) => {
          const property = declaration.prop.toLowerCase();
          const value = declaration.value.trim().toLowerCase();
          const hasMotionShorthand = (property === "animation" || property === "transition")
            && value !== "none";
          const hasMotionName = (property === "animation-name" || property === "transition-property")
            && value !== "none";
          const hasNonZeroTiming = [
            "animation-duration",
            "animation-delay",
            "transition-duration",
            "transition-delay",
          ].includes(property) && nonZeroTime(value);

          if (hasMotionShorthand || hasMotionName || hasNonZeroTiming) {
            violations.push(`${relativePath}:${declaration.source?.start?.line ?? "?"} ${property}: ${value}`);
          }
        });
      });
    }

    const baseRoot = postcss.parse(baseStyles);
    const globalReducedMotionRules: Record<string, string> = {};
    baseRoot.walkAtRules("media", (media) => {
      if (!media.params.includes("prefers-reduced-motion: reduce")) return;
      media.walkRules((rule) => {
        const selectors = rule.selectors.map((selector) => selector.trim());
        if (!["*", "*::before", "*::after"].every((selector) => selectors.includes(selector))) return;
        rule.walkDecls((declaration) => {
          globalReducedMotionRules[declaration.prop] = declaration.value;
        });
      });
    });

    expect(globalReducedMotionRules).toMatchObject({
      "scroll-behavior": "auto",
      animation: "none",
      transition: "none",
    });
    expect(violations).toEqual([]);
  });

  it("tests and uploads exact PR-head evidence while checking the synthetic merge separately", () => {
    expect(workflow).toContain("concurrency:");
    expect(workflow).toContain("cancel-in-progress: true");
    expect(workflow).toContain("timeout-minutes: 45");
    expect(workflow).toContain("TESTED_SOURCE_SHA: ${{ github.event.pull_request.head.sha || github.sha }}");
    expect(workflow).toContain("ref: ${{ env.TESTED_SOURCE_SHA }}");
    expect(workflow).toContain('test "$actual_sha" = "$TESTED_SOURCE_SHA"');
    expect(workflow).toContain("name: Upload rendered QA evidence");
    expect(workflow).toContain("if: always()");
    expect(workflow).toContain("uses: actions/upload-artifact@v4");
    expect(workflow).toContain("name: ${{ steps.provenance.outputs.artifact_name }}");
    expect(workflow).toContain("retention-days: 14");
    expect(workflow).toContain("if-no-files-found: error");
    expect(workflow).toContain("A11Y_SCREENSHOT_DIR:");
    expect(workflow).toContain("RENDERED_QA_TESTED_SHA:");
    expect(workflow.match(/node-version: '22\.23\.2'/g)).toHaveLength(2);
    expect(workflow.match(/npm@10\.9\.2/g)).toHaveLength(2);
    expect(workflow).toContain("merge-compatibility:");
    expect(workflow).toContain("refs/pull/${{ github.event.pull_request.number }}/merge");
    expect(workflow).toContain("fetch-depth: 2");
    expect(workflow).toContain("EXPECTED_BASE_SHA: ${{ github.event.pull_request.base.sha }}");
    expect(workflow).toContain("EXPECTED_HEAD_SHA: ${{ github.event.pull_request.head.sha }}");
    expect(workflow).toContain("node scripts/verify-merge-provenance.mjs");
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

  it("renders approved MarketFlow loading/error/retry/empty/data and owner-safe JV evidence", () => {
    const interaction = sliceBetween(
      "await runInteraction('MarketFlow approved inventory state matrix",
      "await runInteraction(\n    'MarketFlow approved operator mobile shell'",
    );

    expect(source).toContain("async function installApprovedMarketflowStubs");
    expect(source).toContain("primary_role: 'pegasus_wholesaler'");
    expect(source).toContain("is_pegasus_badged: true");
    for (const state of ['loading', 'error', 'empty']) {
      for (const presentation of [
        'wholesale-grid',
        'wholesale-swipe',
        'capital-grid',
        'capital-swipe',
        'listings-grid',
      ]) {
        expect(interaction).toContain(`state-${presentation}-${state}`);
      }
    }
    expect(interaction).toContain("button-retry-wholesale-grid");
    expect(interaction).toContain("button-retry-capital-swipe");
    expect(interaction).toContain("button-retry-listings-grid");
    expect(interaction).toContain("button-view-deal-501");
    expect(interaction).toContain("button-view-project-601");
    expect(interaction).toContain("button-view-listing-701");
    expect(source).toContain("/api/listings/701");
    expect(interaction).toContain("/\\/marketflow\\/listings\\/701$/");
    expect(interaction).toContain("Reviewed listing detail did not render the source inventory price");
    expect(interaction).toContain("quick-jv-501");
    expect(interaction).toContain("button-request-jv");
    expect(interaction).toContain("marketflow.setCanRequestJv(false)");
    expect(interaction).toContain("Owner-safe detail DTO exposed the JV action");
    expect(source).toContain("marketflow-approved-shell-mobile-390.png");
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
      "for (const [intakeViewportName, intakeViewport] of viewports)",
    );

    expect(interaction).toContain("[data-hv=\"arrival\"]");
    expect(interaction).toContain("getByRole('link', { name: 'Bring an Opportunity', exact: true })");
    expect(interaction).toContain("waitFor({ state: 'visible' })");
    expect(interaction).toContain("getAttribute('href')");
    expect(interaction).toContain("/bring-an-opportunity");
    expect(interaction).toContain("await homepagePrimaryCta.click()");
    expect(interaction).toContain("await page.waitForURL(/\\/bring-an-opportunity$/)");
    expect(interaction).toContain("name: 'Bring the property, the contract, the project, or the plan.'");
    expect(interaction).toContain("destinationHeading.waitFor({ state: 'visible' })");
    expect(interaction).not.toContain("nav a[");
  });

  it("fails with evidence for traffic outside the exact preview origin", () => {
    expect(source).toContain("function isAllowedBrowserUrl");
    expect(source).toContain("url.origin === baseUrl");
    expect(source).toContain("webSocketOrigin === baseUrl");
    expect(source).toContain("['about:', 'data:', 'blob:'].includes(url.protocol)");
    expect(source).toContain("if (!['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol)) return false");
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

  it("writes SHA-bound artifact lineage and exact evidence counts", () => {
    expect(source).toContain("rendered-qa-manifest.json");
    expect(source).toContain("RENDERED_QA_TESTED_SHA");
    expect(source).toContain("RENDERED_QA_PR_HEAD_SHA");
    expect(source).toContain("RENDERED_QA_PR_MERGE_SHA");
    expect(source).toContain("testedSourceSha !== prHeadSha");
    expect(source).toContain("const result = failures.length");
    expect(source).toContain("result,");
    expect(source).toContain("routeCheckCount: expectedRouteCheckCount");
    expect(source).toContain("routeFailureCount: failures.length");
    expect(source).toContain("interactionJourneyCount");
    expect(source).toContain("interactionFailureCount: interactionFailures.length");
    expect(source).toContain("invariantFailureCount: invariantFailures.length");
    expect(source).toContain("fatalFailureCount: fatalFailure ? 1 : 0");
    expect(source).toContain("expectedScreenshotCount");
    expect(source).toContain("screenshotCount");
    expect(source).toContain("expectedRouteCheckCount + 39");
    expect(source.indexOf("const result = failures.length")).toBeLessThan(
      source.indexOf("rendered-qa-manifest.json"),
    );
  });
});
