import { describe, expect, it } from "vitest";

async function loadContract() {
  return import("../../scripts/rendered-qa-contract.mjs");
}

describe("rendered QA shard contract", () => {
  it("defines twelve unique deterministic shards", async () => {
    const { renderedQaShardIds, renderedQaShards } = await loadContract();

    expect(renderedQaShards).toHaveLength(12);
    expect(new Set(renderedQaShardIds).size).toBe(12);
    expect(renderedQaShardIds).toEqual(renderedQaShards.map(({ id }) => id));
  });

  it("partitions the full route matrix by theme and viewport", async () => {
    const {
      renderedQaColorSchemes,
      renderedQaFullPublicRoutes,
      renderedQaShards,
      renderedQaViewports,
    } = await loadContract();
    const routeShards = renderedQaShards.filter(({ kind }) => kind === "routes");
    const expectedPairs = renderedQaColorSchemes.flatMap((colorScheme) =>
      renderedQaViewports.map(([viewportName]) => `${colorScheme}:${viewportName}`),
    );
    const actualPairs = routeShards.map(
      ({ colorSchemes, viewportNames }) => `${colorSchemes[0]}:${viewportNames[0]}`,
    );

    expect(routeShards).toHaveLength(8);
    expect(renderedQaFullPublicRoutes).toHaveLength(45);
    expect(new Set(renderedQaFullPublicRoutes).size).toBe(45);
    expect(actualPairs.sort()).toEqual(expectedPairs.sort());
    for (const shard of routeShards) {
      expect(shard.colorSchemes).toHaveLength(1);
      expect(shard.viewportNames).toHaveLength(1);
      expect(shard.journeyIds).toEqual([]);
      expect(shard.expectedRouteChecks).toBe(renderedQaFullPublicRoutes.length);
      expect(shard.expectedJourneyChecks).toBe(0);
      expect(shard.expectedScreenshots).toBe(renderedQaFullPublicRoutes.length);
    }
  });

  it("partitions all seventeen journeys exactly once", async () => {
    const {
      renderedQaJourneyGroups,
      renderedQaJourneyIds,
      renderedQaShards,
    } = await loadContract();
    const interactionShards = renderedQaShards.filter(
      ({ kind }) => kind === "interactions",
    );
    const selectedJourneyIds = interactionShards.flatMap(({ journeyIds }) => journeyIds);

    expect(interactionShards).toHaveLength(4);
    expect(selectedJourneyIds).toHaveLength(17);
    expect(new Set(selectedJourneyIds).size).toBe(17);
    expect([...selectedJourneyIds].sort()).toEqual([...renderedQaJourneyIds].sort());
    expect(renderedQaJourneyGroups.core).toHaveLength(10);
    expect(renderedQaJourneyGroups["intake-wide"]).toHaveLength(2);
    expect(renderedQaJourneyGroups["intake-narrow"]).toHaveLength(2);
    expect(renderedQaJourneyGroups.marketflow).toHaveLength(3);
  });

  it("preserves the full 399-screenshot evidence distribution", async () => {
    const { renderedQaShards } = await loadContract();
    const screenshotsByShard = Object.fromEntries(
      renderedQaShards.map(({ id, expectedScreenshots }) => [id, expectedScreenshots]),
    );

    expect(screenshotsByShard["interactions-core"]).toBe(0);
    expect(screenshotsByShard["interactions-intake-wide"]).toBe(8);
    expect(screenshotsByShard["interactions-intake-narrow"]).toBe(8);
    expect(screenshotsByShard["interactions-marketflow"]).toBe(23);
    expect(
      renderedQaShards.reduce(
        (total, { expectedScreenshots }) => total + expectedScreenshots,
        0,
      ),
    ).toBe(399);
  });

  it("rejects unknown shard IDs and preserves unsharded mode", async () => {
    const { resolveRenderedQaShard } = await loadContract();

    expect(resolveRenderedQaShard(undefined)).toBeNull();
    expect(resolveRenderedQaShard("")).toBeNull();
    expect(() => resolveRenderedQaShard("routes-purple-watch")).toThrow(
      /Unknown A11Y_QA_SHARD_ID/,
    );
  });
});
