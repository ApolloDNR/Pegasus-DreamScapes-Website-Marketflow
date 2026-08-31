import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const TESTED_SHA = "a".repeat(40);
const MERGE_SHA = "b".repeat(40);
const BUILD_SHA256 = "c".repeat(64);
const RUN_ID = "123456789";
const RUN_ATTEMPT = "3";
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);
const PNG_SHA256 = createHash("sha256").update(PNG).digest("hex");

type AggregateModule = typeof import("../../scripts/aggregate-rendered-qa.mjs");
type JsonRecord = Record<string, any>;

let cleanupRoots: string[] = [];

afterEach(async () => {
  await Promise.all(cleanupRoots.map((root) => rm(root, { recursive: true, force: true })));
  cleanupRoots = [];
});

async function loadModules() {
  const [aggregateModule, contract] = await Promise.all([
    import("../../scripts/aggregate-rendered-qa.mjs") as Promise<AggregateModule>,
    import("../../scripts/rendered-qa-contract.mjs"),
  ]);
  return { ...aggregateModule, contract };
}

async function createValidEvidence(options: { reverse?: boolean } = {}) {
  const { contract } = await loadModules();
  const rootDir = await mkdtemp(path.join(tmpdir(), "pegasus-rendered-qa-"));
  cleanupRoots.push(rootDir);
  const outputPath = path.join(rootDir, "rendered-qa-aggregate.json");
  const shardDefinitions = options.reverse
    ? [...contract.renderedQaShards].reverse()
    : [...contract.renderedQaShards];

  for (const shard of shardDefinitions) {
    const shardDir = path.join(rootDir, shard.id);
    await mkdir(shardDir, { recursive: true });
    const routeChecks: JsonRecord[] = [];
    const journeyChecks: JsonRecord[] = [];
    const screenshots: JsonRecord[] = [];

    if (shard.kind === "routes") {
      const routes = options.reverse
        ? [...contract.renderedQaFullPublicRoutes].reverse()
        : [...contract.renderedQaFullPublicRoutes];
      for (const [index, route] of routes.entries()) {
        const filename = `route-${String(index).padStart(2, "0")}.png`;
        await writeFile(path.join(shardDir, filename), PNG);
        routeChecks.push({
          route,
          viewportName: shard.viewportNames[0],
          colorScheme: shard.colorSchemes[0],
          result: "passed",
          failure: null,
          screenshotPath: filename,
        });
        screenshots.push({
          path: filename,
          filename,
          bytes: PNG.length,
          sha256: PNG_SHA256,
          owner: {
            kind: "route",
            route,
            viewportName: shard.viewportNames[0],
            colorScheme: shard.colorSchemes[0],
          },
        });
      }
    } else {
      const journeyIds = options.reverse ? [...shard.journeyIds].reverse() : shard.journeyIds;
      for (const journeyId of journeyIds) {
        const screenshotPaths: string[] = [];
        const screenshotTotal = contract.renderedQaJourneyScreenshotCounts[journeyId];
        for (let index = 0; index < screenshotTotal; index += 1) {
          const filename = `journey-${journeyChecks.length}-${index}.png`;
          await writeFile(path.join(shardDir, filename), PNG);
          screenshotPaths.push(filename);
          screenshots.push({
            path: filename,
            filename,
            bytes: PNG.length,
            sha256: PNG_SHA256,
            owner: { kind: "journey", journeyId },
          });
        }
        journeyChecks.push({
          journeyId,
          result: "passed",
          failure: null,
          screenshotPaths,
        });
      }
    }

    const manifest = {
      schemaVersion: 2,
      result: "passed",
      shardId: shard.id,
      shardKind: shard.kind,
      githubRunId: RUN_ID,
      githubRunAttempt: RUN_ATTEMPT,
      testedSourceSha: TESTED_SHA,
      prHeadSha: TESTED_SHA,
      prMergeSha: MERGE_SHA,
      buildSha256: BUILD_SHA256,
      githubEvent: "pull_request",
      publicRouteCoverage: "full",
      selectedExpectations: {
        routeCheckCount: shard.expectedRouteChecks,
        interactionJourneyCount: shard.expectedJourneyChecks,
        screenshotCount: shard.expectedScreenshots,
        routes: shard.kind === "routes" ? contract.renderedQaFullPublicRoutes : [],
        viewportNames: shard.viewportNames,
        colorSchemes: shard.colorSchemes,
        journeyIds: shard.journeyIds,
      },
      routeChecks,
      journeyChecks,
      screenshots,
      routeCheckCount: shard.expectedRouteChecks,
      actualRouteCheckCount: routeChecks.length,
      routeFailureCount: 0,
      interactionJourneyCount: journeyChecks.length,
      expectedInteractionJourneyCount: shard.expectedJourneyChecks,
      interactionFailureCount: 0,
      invariantFailureCount: 0,
      invariantFailures: [],
      fatalFailureCount: 0,
      fatalFailure: null,
      expectedScreenshotCount: shard.expectedScreenshots,
      screenshotCount: screenshots.length,
      startedAt: "2026-08-31T12:00:00.000Z",
      completedAt: "2026-08-31T12:01:00.000Z",
    };
    await writeFile(
      path.join(shardDir, "rendered-qa-manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
  }

  return { rootDir, outputPath, contract };
}

async function readShardManifest(rootDir: string, directoryName: string) {
  const manifestPath = path.join(rootDir, directoryName, "rendered-qa-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  return {
    manifest,
    manifestPath,
    async save() {
      await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    },
  };
}

function errorCodes(aggregate: JsonRecord) {
  return aggregate.validationErrors.map((error: JsonRecord) => error.code);
}

describe.sequential("rendered QA aggregate evidence", () => {
  it("accepts the shard workflow lineage environment and explicit CLI paths", async () => {
    const { parseAggregateRenderedQaArgs } = await loadModules();

    expect(parseAggregateRenderedQaArgs([
      "--root",
      "downloaded-shards",
      "--output",
      "aggregate/manifest.json",
    ], {
      RENDERED_QA_GITHUB_RUN_ID: RUN_ID,
      RENDERED_QA_GITHUB_RUN_ATTEMPT: RUN_ATTEMPT,
      RENDERED_QA_TESTED_SHA: TESTED_SHA,
      RENDERED_QA_PR_HEAD_SHA: TESTED_SHA,
      RENDERED_QA_PR_MERGE_SHA: MERGE_SHA,
      RENDERED_QA_BUILD_SHA256: BUILD_SHA256,
      RENDERED_QA_GITHUB_EVENT: "pull_request",
    })).toEqual({
      rootDir: "downloaded-shards",
      outputPath: "aggregate/manifest.json",
      expected: {
        githubRunId: RUN_ID,
        githubRunAttempt: RUN_ATTEMPT,
        testedSourceSha: TESTED_SHA,
        prHeadSha: TESTED_SHA,
        prMergeSha: MERGE_SHA,
        buildSha256: BUILD_SHA256,
        githubEvent: "pull_request",
      },
    });
  });

  it("accepts all twelve shards in shuffled order and writes deterministic complete evidence", async () => {
    const { aggregateRenderedQaEvidence } = await loadModules();
    const { rootDir, outputPath, contract } = await createValidEvidence({ reverse: true });

    const aggregate = await aggregateRenderedQaEvidence({
      rootDir,
      outputPath,
      expected: {
        githubRunId: RUN_ID,
        githubRunAttempt: RUN_ATTEMPT,
        testedSourceSha: TESTED_SHA,
        prHeadSha: TESTED_SHA,
        buildSha256: BUILD_SHA256,
        githubEvent: "pull_request",
      },
    });

    expect(aggregate.result).toBe("passed");
    expect(aggregate.validationErrors).toEqual([]);
    expect(aggregate.lineage).toEqual({
      githubRunId: RUN_ID,
      githubRunAttempt: 3,
      testedSourceSha: TESTED_SHA,
      prHeadSha: TESTED_SHA,
      prMergeSha: MERGE_SHA,
      buildSha256: BUILD_SHA256,
      githubEvent: "pull_request",
    });
    expect(aggregate.counts).toEqual({
      shards: 12,
      routeChecks: 360,
      journeyChecks: 17,
      screenshots: 399,
    });
    expect(aggregate.shards.map((shard: JsonRecord) => shard.shardId)).toEqual(
      contract.renderedQaShardIds,
    );
    expect(new Set(aggregate.routeChecks.map((check: JsonRecord) => check.key)).size).toBe(360);
    expect(new Set(aggregate.journeyChecks.map((check: JsonRecord) => check.journeyId)).size).toBe(17);
    expect(new Set(aggregate.screenshots.map((shot: JsonRecord) => shot.path)).size).toBe(399);
    expect(JSON.parse(await readFile(outputPath, "utf8"))).toEqual(aggregate);
  });

  it("accepts successful shards from earlier attempts in the same run and records each attempt", async () => {
    const { aggregateRenderedQaEvidence } = await loadModules();
    const { rootDir, outputPath, contract } = await createValidEvidence();
    const earlierShardId = contract.renderedQaShardIds[0];
    const earlierShard = await readShardManifest(rootDir, earlierShardId);
    earlierShard.manifest.githubRunAttempt = 2;
    await earlierShard.save();

    const aggregate = await aggregateRenderedQaEvidence({
      rootDir,
      outputPath,
      expected: {
        githubRunId: RUN_ID,
        githubRunAttempt: RUN_ATTEMPT,
        testedSourceSha: TESTED_SHA,
        prHeadSha: TESTED_SHA,
        buildSha256: BUILD_SHA256,
        githubEvent: "pull_request",
      },
    });

    expect(aggregate.result).toBe("passed");
    expect(aggregate.shardRunAttempts).toEqual(Object.fromEntries(
      contract.renderedQaShardIds.map((shardId: string) => [
        shardId,
        shardId === earlierShardId ? 2 : 3,
      ]),
    ));
  });

  it.each([
    ["missing", "MISSING_SHARD"],
    ["duplicate", "DUPLICATE_SHARD"],
    ["extra", "EXTRA_SHARD"],
  ])("rejects a %s shard ID", async (variant, expectedCode) => {
    const { aggregateRenderedQaEvidence } = await loadModules();
    const { rootDir, outputPath, contract } = await createValidEvidence();
    const target = contract.renderedQaShardIds[0];

    if (variant === "missing") {
      await rm(path.join(rootDir, target), { recursive: true });
    } else {
      const source = await readShardManifest(rootDir, target);
      const directory = variant === "duplicate" ? "duplicate-copy" : "extra-copy";
      const extraDir = path.join(rootDir, directory);
      await mkdir(extraDir);
      if (variant === "extra") source.manifest.shardId = "routes-dark-watch-999";
      await writeFile(
        path.join(extraDir, "rendered-qa-manifest.json"),
        `${JSON.stringify(source.manifest, null, 2)}\n`,
      );
    }

    const aggregate = await aggregateRenderedQaEvidence({ rootDir, outputPath });

    expect(aggregate.result).toBe("failed");
    expect(errorCodes(aggregate)).toContain(expectedCode);
    expect(JSON.parse(await readFile(outputPath, "utf8")).result).toBe("failed");
  });

  it.each([
    ["missing", "ROUTE_TUPLE_MISSING"],
    ["duplicate", "ROUTE_TUPLE_DUPLICATE"],
    ["extra", "ROUTE_TUPLE_EXTRA"],
  ])("rejects a %s route tuple", async (variant, expectedCode) => {
    const { aggregateRenderedQaEvidence } = await loadModules();
    const { rootDir, outputPath } = await createValidEvidence();
    const shard = await readShardManifest(rootDir, "routes-dark-desktop-1440");
    if (variant === "missing") shard.manifest.routeChecks.shift();
    if (variant === "duplicate") shard.manifest.routeChecks.push(shard.manifest.routeChecks[0]);
    if (variant === "extra") {
      shard.manifest.routeChecks.push({
        ...shard.manifest.routeChecks[0],
        route: "/not-a-public-route",
      });
    }
    await shard.save();

    const aggregate = await aggregateRenderedQaEvidence({ rootDir, outputPath });

    expect(aggregate.result).toBe("failed");
    expect(errorCodes(aggregate)).toContain(expectedCode);
  });

  it.each([
    ["missing", "JOURNEY_MISSING"],
    ["duplicate", "JOURNEY_DUPLICATE"],
    ["extra", "JOURNEY_EXTRA"],
  ])("rejects a %s journey", async (variant, expectedCode) => {
    const { aggregateRenderedQaEvidence } = await loadModules();
    const { rootDir, outputPath } = await createValidEvidence();
    const shard = await readShardManifest(rootDir, "interactions-core");
    if (variant === "missing") shard.manifest.journeyChecks.shift();
    if (variant === "duplicate") shard.manifest.journeyChecks.push(shard.manifest.journeyChecks[0]);
    if (variant === "extra") {
      shard.manifest.journeyChecks.push({
        journeyId: "invented rendered journey",
        result: "passed",
        failure: null,
        screenshotPaths: [],
      });
    }
    await shard.save();

    const aggregate = await aggregateRenderedQaEvidence({ rootDir, outputPath });

    expect(aggregate.result).toBe("failed");
    expect(errorCodes(aggregate)).toContain(expectedCode);
  });

  it("collects every lineage inconsistency instead of stopping at the first one", async () => {
    const { aggregateRenderedQaEvidence } = await loadModules();
    const { rootDir, outputPath } = await createValidEvidence();
    const shard = await readShardManifest(rootDir, "interactions-core");
    Object.assign(shard.manifest, {
      schemaVersion: 99,
      githubRunId: "different-run",
      githubRunAttempt: "4",
      testedSourceSha: "c".repeat(40),
      prHeadSha: "d".repeat(40),
      prMergeSha: "e".repeat(40),
      buildSha256: "f".repeat(64),
      githubEvent: "push",
    });
    await shard.save();

    const aggregate = await aggregateRenderedQaEvidence({ rootDir, outputPath });

    expect(errorCodes(aggregate)).toEqual(expect.arrayContaining([
      "SCHEMA_VERSION_MISMATCH",
      "RUN_ID_MISMATCH",
      "TESTED_SHA_MISMATCH",
      "PR_HEAD_SHA_MISMATCH",
      "PR_MERGE_SHA_MISMATCH",
      "BUILD_SHA256_MISMATCH",
      "GITHUB_EVENT_MISMATCH",
    ]));
  });

  it.each([
    ["mismatched", "d".repeat(64), ["BUILD_SHA256_MISMATCH"]],
    ["missing", undefined, ["BUILD_SHA256_MISMATCH", "BUILD_SHA256_INVALID"]],
    ["invalid", "not-a-sha-256", ["BUILD_SHA256_MISMATCH", "BUILD_SHA256_INVALID"]],
  ])("rejects a %s exact-build digest", async (_variant, buildSha256, expectedCodes) => {
    const { aggregateRenderedQaEvidence } = await loadModules();
    const { rootDir, outputPath } = await createValidEvidence();
    const shard = await readShardManifest(rootDir, "interactions-core");
    if (buildSha256 === undefined) delete shard.manifest.buildSha256;
    else shard.manifest.buildSha256 = buildSha256;
    await shard.save();

    const aggregate = await aggregateRenderedQaEvidence({
      rootDir,
      outputPath,
      expected: { buildSha256: BUILD_SHA256 },
    });

    expect(aggregate.result).toBe("failed");
    expect(errorCodes(aggregate)).toEqual(expectedCodes);
  });

  it("rejects internally consistent shards from a build other than the expected workflow build", async () => {
    const { aggregateRenderedQaEvidence } = await loadModules();
    const { rootDir, outputPath, contract } = await createValidEvidence();
    const otherBuildSha256 = "d".repeat(64);
    for (const shardId of contract.renderedQaShardIds) {
      const shard = await readShardManifest(rootDir, shardId);
      shard.manifest.buildSha256 = otherBuildSha256;
      await shard.save();
    }

    const aggregate = await aggregateRenderedQaEvidence({
      rootDir,
      outputPath,
      expected: { buildSha256: BUILD_SHA256 },
    });
    const buildErrors = aggregate.validationErrors.filter(
      (error: JsonRecord) => error.code === "BUILD_SHA256_MISMATCH",
    );

    expect(aggregate.result).toBe("failed");
    expect(buildErrors).toHaveLength(12);
    expect(buildErrors.every((error: JsonRecord) => (
      error.actual === otherBuildSha256 && error.expected === BUILD_SHA256
    ))).toBe(true);
  });

  it("rejects an invalid or future shard attempt relative to the aggregate attempt", async () => {
    const { aggregateRenderedQaEvidence } = await loadModules();
    const { rootDir, outputPath } = await createValidEvidence();
    const invalidShard = await readShardManifest(rootDir, "interactions-core");
    const futureShard = await readShardManifest(rootDir, "interactions-intake-wide");
    invalidShard.manifest.githubRunAttempt = 0;
    futureShard.manifest.githubRunAttempt = 4;
    await invalidShard.save();
    await futureShard.save();

    const aggregate = await aggregateRenderedQaEvidence({
      rootDir,
      outputPath,
      expected: { githubRunAttempt: RUN_ATTEMPT },
    });

    expect(errorCodes(aggregate)).toEqual(expect.arrayContaining([
      "RUN_ATTEMPT_INVALID",
      "RUN_ATTEMPT_INCOMPATIBLE",
    ]));
  });

  it.each([
    ["failed", "SHARD_RESULT_FAILED"],
    ["fatal", "FATAL_FAILURE_PRESENT"],
    ["incomplete", "SHARD_INCOMPLETE"],
  ])("rejects a %s shard", async (variant, expectedCode) => {
    const { aggregateRenderedQaEvidence } = await loadModules();
    const { rootDir, outputPath } = await createValidEvidence();
    const shard = await readShardManifest(rootDir, "interactions-core");
    if (variant === "failed") {
      shard.manifest.result = "failed";
      shard.manifest.invariantFailureCount = 1;
      shard.manifest.invariantFailures = ["fixture failure"];
    }
    if (variant === "fatal") {
      shard.manifest.result = "failed";
      shard.manifest.fatalFailureCount = 1;
      shard.manifest.fatalFailure = { error: "browser crashed" };
    }
    if (variant === "incomplete") {
      shard.manifest.result = "running";
      shard.manifest.completedAt = null;
    }
    await shard.save();

    const aggregate = await aggregateRenderedQaEvidence({ rootDir, outputPath });

    expect(aggregate.result).toBe("failed");
    expect(errorCodes(aggregate)).toContain(expectedCode);
  });

  it("rejects route screenshots swapped between otherwise valid route checks", async () => {
    const { aggregateRenderedQaEvidence } = await loadModules();
    const { rootDir, outputPath } = await createValidEvidence();
    const shard = await readShardManifest(rootDir, "routes-dark-desktop-1440");
    const firstPath = shard.manifest.routeChecks[0].screenshotPath;
    shard.manifest.routeChecks[0].screenshotPath = shard.manifest.routeChecks[1].screenshotPath;
    shard.manifest.routeChecks[1].screenshotPath = firstPath;
    await shard.save();

    const aggregate = await aggregateRenderedQaEvidence({ rootDir, outputPath });
    const ownerErrors = aggregate.validationErrors.filter(
      (error: JsonRecord) => error.code === "SCREENSHOT_OWNER_MISMATCH",
    );

    expect(aggregate.result).toBe("failed");
    expect(errorCodes(aggregate)).toEqual([
      "SCREENSHOT_OWNER_MISMATCH",
      "SCREENSHOT_OWNER_MISMATCH",
    ]);
    expect(ownerErrors).toHaveLength(2);
    expect(ownerErrors.map((error: JsonRecord) => error.route)).toEqual([
      shard.manifest.routeChecks[0].route,
      shard.manifest.routeChecks[1].route,
    ]);
  });

  it("rejects journey screenshots swapped between otherwise valid journeys", async () => {
    const { aggregateRenderedQaEvidence } = await loadModules();
    const { rootDir, outputPath } = await createValidEvidence();
    const shard = await readShardManifest(rootDir, "interactions-intake-wide");
    const firstPath = shard.manifest.journeyChecks[0].screenshotPaths[0];
    shard.manifest.journeyChecks[0].screenshotPaths[0] =
      shard.manifest.journeyChecks[1].screenshotPaths[0];
    shard.manifest.journeyChecks[1].screenshotPaths[0] = firstPath;
    await shard.save();

    const aggregate = await aggregateRenderedQaEvidence({ rootDir, outputPath });
    const ownerErrors = aggregate.validationErrors.filter(
      (error: JsonRecord) => error.code === "SCREENSHOT_OWNER_MISMATCH",
    );

    expect(aggregate.result).toBe("failed");
    expect(errorCodes(aggregate)).toEqual([
      "SCREENSHOT_OWNER_MISMATCH",
      "SCREENSHOT_OWNER_MISMATCH",
    ]);
    expect(ownerErrors).toHaveLength(2);
    expect(ownerErrors.map((error: JsonRecord) => error.journeyId)).toEqual([
      shard.manifest.journeyChecks[0].journeyId,
      shard.manifest.journeyChecks[1].journeyId,
    ]);
  });

  it.each([
    ["missing", "SCREENSHOT_FILE_MISSING"],
    ["empty", "SCREENSHOT_FILE_EMPTY"],
    ["corrupt", "SCREENSHOT_INVALID_PNG"],
    ["digest-mismatch", "SCREENSHOT_DIGEST_MISMATCH"],
  ])("rejects a %s screenshot while preserving the aggregate manifest", async (variant, expectedCode) => {
    const { aggregateRenderedQaEvidence } = await loadModules();
    const { rootDir, outputPath } = await createValidEvidence();
    const shard = await readShardManifest(rootDir, "routes-dark-desktop-1440");
    const screenshot = shard.manifest.screenshots[0];
    const screenshotPath = path.join(rootDir, "routes-dark-desktop-1440", screenshot.path);
    if (variant === "missing") await rm(screenshotPath);
    if (variant === "empty") await writeFile(screenshotPath, Buffer.alloc(0));
    if (variant === "corrupt") await writeFile(screenshotPath, Buffer.from("not a png"));
    if (variant === "digest-mismatch") screenshot.sha256 = "0".repeat(64);
    await shard.save();

    const aggregate = await aggregateRenderedQaEvidence({ rootDir, outputPath });

    expect(aggregate.result).toBe("failed");
    expect(errorCodes(aggregate)).toContain(expectedCode);
    expect(JSON.parse(await readFile(outputPath, "utf8")).validationErrorCount).toBeGreaterThan(0);
  });
});
