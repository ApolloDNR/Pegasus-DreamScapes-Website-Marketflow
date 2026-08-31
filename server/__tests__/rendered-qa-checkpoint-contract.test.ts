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

describe("rendered QA checkpoint manifest contract", () => {
  it("serializes atomic checkpoint writes through a temporary manifest", () => {
    const setup = sliceBetween("const manifestPath =", "function createManifest(");
    const writer = sliceBetween(
      "function writeManifest(",
      "await writeManifest({ result: 'running' });",
    );

    expect(setup).toContain("const manifestTemporaryPath = manifestPath ? `${manifestPath}.tmp` : null;");
    expect(setup).toContain("let manifestWriteQueue = Promise.resolve();");
    expect(setup).toContain("let manifestFinalized = false;");
    expect(writer).toContain("if (manifestFinalized) return Promise.resolve();");
    expect(writer).toContain("const serializedManifest = `${JSON.stringify(");
    expect(writer).toContain("const checkpoint = manifestWriteQueue.then(writeCheckpoint, writeCheckpoint);");
    expect(writer).toContain("manifestWriteQueue = checkpoint.catch(() => undefined);");

    const temporaryWrite = writer.indexOf(
      "await writeFile(manifestTemporaryPath, serializedManifest, 'utf8');",
    );
    const atomicRename = writer.indexOf("await rename(manifestTemporaryPath, manifestPath);");
    const finalization = writer.indexOf("if (final) manifestFinalized = true;");

    expect(temporaryWrite).toBeGreaterThanOrEqual(0);
    expect(atomicRename).toBeGreaterThan(temporaryWrite);
    expect(finalization).toBeGreaterThan(atomicRename);
  });

  it("records checkpoint timestamps and exact build lineage in every manifest", () => {
    const lineage = sliceBetween("const qaLineage = Object.freeze({", "const githubRunAttempt");
    const manifest = sliceBetween("function createManifest(", "function writeManifest(");
    const writer = sliceBetween(
      "function writeManifest(",
      "await writeManifest({ result: 'running' });",
    );

    expect(lineage).toContain(
      "buildSha256: process.env.RENDERED_QA_BUILD_SHA256 || null,",
    );
    expect(manifest).toContain("...qaLineage,");
    expect(manifest).toContain("lastCheckpointAt = null,");
    expect(manifest).toContain("lastCheckpointAt,");
    expect(writer).toContain("const lastCheckpointAt = new Date().toISOString();");
    expect(writer).toContain("createManifest({ ...state, lastCheckpointAt })");
  });

  it("checkpoints each route only after its complete outcome and screenshot reference are recorded", () => {
    const routeLoop = sliceBetween(
      "for (const route of routes) {",
      "await closeQaContext(",
    );
    const routeOutcome = routeLoop.indexOf("routeChecks.push({");
    const screenshotReference = routeLoop.indexOf(
      "screenshotPath: routeScreenshot?.path ?? null,",
      routeOutcome,
    );
    const checkpoint = routeLoop.indexOf(
      "await writeManifest({ result: 'running' });",
      routeOutcome,
    );
    const pageCleanup = routeLoop.indexOf("await closeQaPage(", checkpoint);

    expect(routeOutcome).toBeGreaterThanOrEqual(0);
    expect(screenshotReference).toBeGreaterThan(routeOutcome);
    expect(checkpoint).toBeGreaterThan(screenshotReference);
    expect(pageCleanup).toBeGreaterThan(checkpoint);
    expect(routeLoop.match(/await writeManifest\(\{ result: 'running' \}\);/g)).toHaveLength(1);
  });

  it("checkpoints each journey outcome and each journey-owned screenshot", () => {
    const screenshotCapture = sliceBetween(
      "async function captureScreenshot(",
      "const pendingControlledReleases",
    );
    const screenshotEvidence = screenshotCapture.indexOf("screenshots.push(metadata);");
    const screenshotCheckpoint = screenshotCapture.indexOf(
      "await writeManifest({ result: 'running' });",
      screenshotEvidence,
    );

    expect(screenshotCapture).toContain("if (owner?.kind === 'journey') {");
    expect(screenshotEvidence).toBeGreaterThanOrEqual(0);
    expect(screenshotCheckpoint).toBeGreaterThan(screenshotEvidence);

    const journey = sliceBetween("async function runInteraction(", "async function openPage(");
    const journeyOutcome = journey.indexOf("journeyChecks.push({");
    const completedCount = journey.indexOf(
      "interactionJourneyCount = journeyChecks.length;",
      journeyOutcome,
    );
    const journeyCheckpoint = journey.indexOf(
      "await writeManifest({ result: 'running' });",
      completedCount,
    );

    expect(journeyOutcome).toBeGreaterThanOrEqual(0);
    expect(completedCount).toBeGreaterThan(journeyOutcome);
    expect(journeyCheckpoint).toBeGreaterThan(completedCount);
    expect(journey.match(/await writeManifest\(\{ result: 'running' \}\);/g)).toHaveLength(1);
  });

  it("finalizes one terminal manifest with the result, completion time, and final counts", () => {
    const terminal = sliceBetween(
      "const result = failures.length",
      "if (result === 'failed') {",
    );

    expect(terminal).toContain("const finalManifestCounts = {");
    expect(terminal).toMatch(
      /await writeManifest\(\{[\s\S]*?result,[\s\S]*?completedAt: new Date\(\)\.toISOString\(\),[\s\S]*?counts: finalManifestCounts,[\s\S]*?\}, \{ final: true \}\);/,
    );
  });

  it("rejects CI shard evidence without a valid exact-build SHA-256 digest", () => {
    const ciInvariants = sliceBetween(
      "if (process.env.GITHUB_ACTIONS === 'true') {",
      "if (releaseRoutes.length !== 17)",
    );

    expect(ciInvariants).toContain(
      "if (selectedShard && !/^[0-9a-f]{64}$/.test(String(qaLineage.buildSha256 ?? ''))) {",
    );
    expect(ciInvariants).toContain(
      "Rendered QA shard did not record a valid exact-build SHA-256 digest",
    );
  });
});
