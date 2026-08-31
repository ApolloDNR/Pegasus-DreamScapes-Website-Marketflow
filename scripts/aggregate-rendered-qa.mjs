import { createHash } from 'node:crypto';
import { readdir, readFile, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  renderedQaColorSchemes,
  renderedQaFullPublicRoutes,
  renderedQaJourneyIds,
  renderedQaJourneyScreenshotCounts,
  renderedQaShardIds,
  renderedQaShards,
  renderedQaViewports,
} from './rendered-qa-contract.mjs';

const SHARD_MANIFEST_FILENAME = 'rendered-qa-manifest.json';
const AGGREGATE_SCHEMA_VERSION = 2;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const SHA_PATTERN = /^[0-9a-f]{40}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

const shardOrder = new Map(renderedQaShardIds.map((shardId, index) => [shardId, index]));
const expectedShardById = new Map(renderedQaShards.map((shard) => [shard.id, shard]));

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeLineageValue(value) {
  return value === undefined || value === null || value === '' ? null : String(value);
}

function parsePositiveRunAttempt(value) {
  const normalized = normalizeLineageValue(value);
  if (!normalized || !/^[1-9][0-9]*$/.test(normalized)) return null;
  const attempt = Number(normalized);
  return Number.isSafeInteger(attempt) ? attempt : null;
}

function routeTupleKey(route, viewportName, colorScheme) {
  return JSON.stringify([route, viewportName, colorScheme]);
}

function formatRouteTuple(route, viewportName, colorScheme) {
  return `${colorScheme}/${viewportName} ${route}`;
}

function countValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function relativeDisplay(rootDir, candidate) {
  const relative = path.relative(rootDir, candidate);
  return relative && !relative.startsWith('..') ? relative.split(path.sep).join('/') : candidate;
}

async function discoverFiles(rootDir, addError) {
  const files = [];
  async function visit(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      addError('EVIDENCE_ROOT_UNREADABLE', `Could not read rendered QA evidence directory ${directory}`, {
        path: directory,
        error: String(error),
      });
      return;
    }
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const candidate = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(candidate);
      else if (entry.isFile()) files.push(candidate);
    }
  }
  await visit(rootDir);
  return files;
}

async function readShardManifest(manifestPath, rootDir, addError) {
  let source;
  try {
    source = await readFile(manifestPath, 'utf8');
  } catch (error) {
    addError('MANIFEST_READ_FAILED', `Could not read ${relativeDisplay(rootDir, manifestPath)}`, {
      manifestPath: relativeDisplay(rootDir, manifestPath),
      error: String(error),
    });
    return null;
  }

  try {
    const manifest = JSON.parse(source);
    if (!isRecord(manifest)) throw new TypeError('manifest root is not an object');
    return {
      manifest,
      manifestPath,
      manifestDir: path.dirname(manifestPath),
    };
  } catch (error) {
    addError('MANIFEST_PARSE_FAILED', `Could not parse ${relativeDisplay(rootDir, manifestPath)}`, {
      manifestPath: relativeDisplay(rootDir, manifestPath),
      error: String(error),
    });
    return null;
  }
}

function compareMultiset({ expectedKeys, actualKeys, missingCode, duplicateCode, extraCode, describe, addError }) {
  const expected = new Set(expectedKeys);
  const actualCounts = countValues(actualKeys);
  for (const key of expected) {
    const count = actualCounts.get(key) ?? 0;
    if (count === 0) addError(missingCode, `Missing ${describe(key)}`, { key });
    if (count > 1) addError(duplicateCode, `Found ${count} copies of ${describe(key)}`, { key, count });
  }
  for (const [key, count] of actualCounts) {
    if (!expected.has(key)) addError(extraCode, `Unexpected ${describe(key)}`, { key, count });
  }
}

function validateCount(manifest, field, expected, shardId, addError) {
  if (manifest[field] !== expected) {
    addError(
      'SHARD_COUNT_MISMATCH',
      `${shardId} recorded ${field}=${JSON.stringify(manifest[field])}; expected ${expected}`,
      { shardId, field, actual: manifest[field], expected },
    );
  }
}

function resolveScreenshotPath(record, screenshotPath, addError) {
  if (typeof screenshotPath !== 'string' || screenshotPath.length === 0) {
    addError('SCREENSHOT_PATH_INVALID', `${record.manifest.shardId ?? 'unknown shard'} has an empty screenshot path`, {
      shardId: record.manifest.shardId ?? null,
      path: screenshotPath ?? null,
    });
    return null;
  }
  if (path.extname(screenshotPath).toLowerCase() !== '.png') {
    addError('SCREENSHOT_PATH_INVALID', `${screenshotPath} is not a PNG path`, {
      shardId: record.manifest.shardId ?? null,
      path: screenshotPath,
    });
  }
  const resolved = path.resolve(record.manifestDir, screenshotPath);
  const relative = path.relative(record.manifestDir, resolved);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    addError('SCREENSHOT_PATH_INVALID', `${screenshotPath} escapes its shard evidence directory`, {
      shardId: record.manifest.shardId ?? null,
      path: screenshotPath,
    });
    return null;
  }
  return resolved;
}

function expectedLineageFrom(records, suppliedExpected) {
  const first = records[0]?.manifest ?? {};
  const observedAttempts = records
    .map(({ manifest }) => parsePositiveRunAttempt(manifest.githubRunAttempt))
    .filter((attempt) => attempt !== null);
  const suppliedAttempt = parsePositiveRunAttempt(suppliedExpected.githubRunAttempt);
  return {
    githubRunId: normalizeLineageValue(suppliedExpected.githubRunId ?? first.githubRunId),
    githubRunAttempt: suppliedAttempt ?? (observedAttempts.length > 0 ? Math.max(...observedAttempts) : null),
    testedSourceSha: normalizeLineageValue(suppliedExpected.testedSourceSha ?? first.testedSourceSha),
    prHeadSha: normalizeLineageValue(suppliedExpected.prHeadSha ?? first.prHeadSha),
    prMergeSha: normalizeLineageValue(suppliedExpected.prMergeSha ?? first.prMergeSha),
    githubEvent: normalizeLineageValue(suppliedExpected.githubEvent ?? first.githubEvent),
    buildSha256: normalizeLineageValue(suppliedExpected.buildSha256 ?? first.buildSha256),
  };
}

function sortRecords(records) {
  return [...records].sort((left, right) => {
    const leftOrder = shardOrder.get(left.manifest.shardId) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = shardOrder.get(right.manifest.shardId) ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder || left.manifestPath.localeCompare(right.manifestPath);
  });
}

export async function aggregateRenderedQaEvidence({ rootDir, outputPath, expected = {} }) {
  const resolvedRoot = path.resolve(rootDir);
  const resolvedOutput = path.resolve(outputPath ?? path.join(resolvedRoot, 'rendered-qa-aggregate.json'));
  const validationErrors = [];
  const addError = (code, message, details = {}) => {
    validationErrors.push({ code, message, ...details });
  };

  const allFiles = await discoverFiles(resolvedRoot, addError);
  const manifestPaths = allFiles
    .filter((filePath) => path.basename(filePath) === SHARD_MANIFEST_FILENAME)
    .sort();
  const parsedRecords = (
    await Promise.all(manifestPaths.map((manifestPath) => (
      readShardManifest(manifestPath, resolvedRoot, addError)
    )))
  ).filter(Boolean);
  const records = sortRecords(parsedRecords);

  const observedShardIds = records.map(({ manifest }) => manifest.shardId).filter((id) => typeof id === 'string');
  const observedShardCounts = countValues(observedShardIds);
  for (const expectedShardId of renderedQaShardIds) {
    const count = observedShardCounts.get(expectedShardId) ?? 0;
    if (count === 0) {
      addError('MISSING_SHARD', `Missing rendered QA shard ${expectedShardId}`, { shardId: expectedShardId });
    } else if (count > 1) {
      addError('DUPLICATE_SHARD', `Rendered QA shard ${expectedShardId} appears ${count} times`, {
        shardId: expectedShardId,
        count,
      });
    }
  }
  for (const [shardId, count] of observedShardCounts) {
    if (!expectedShardById.has(shardId)) {
      addError('EXTRA_SHARD', `Unexpected rendered QA shard ${shardId}`, { shardId, count });
    }
  }
  if (records.length !== renderedQaShardIds.length) {
    addError('SHARD_COUNT_MISMATCH', `Found ${records.length} shard manifests; expected exactly 12`, {
      actual: records.length,
      expected: 12,
    });
  }

  const lineage = expectedLineageFrom(records, expected);
  const expectedRunAttemptWasSupplied = normalizeLineageValue(expected.githubRunAttempt) !== null;
  if (expectedRunAttemptWasSupplied && parsePositiveRunAttempt(expected.githubRunAttempt) === null) {
    addError('AGGREGATE_RUN_ATTEMPT_INVALID', 'The aggregate workflow attempt must be a positive integer', {
      actual: expected.githubRunAttempt,
    });
  }
  const expectedBuildDigestWasSupplied = normalizeLineageValue(expected.buildSha256) !== null;
  if (expectedBuildDigestWasSupplied && !SHA256_PATTERN.test(String(expected.buildSha256))) {
    addError('AGGREGATE_BUILD_SHA256_INVALID', 'The aggregate expected build digest must be lowercase SHA-256', {
      actual: expected.buildSha256,
    });
  }
  const lineageFields = [
    ['githubRunId', 'RUN_ID_MISMATCH'],
    ['testedSourceSha', 'TESTED_SHA_MISMATCH'],
    ['prHeadSha', 'PR_HEAD_SHA_MISMATCH'],
    ['prMergeSha', 'PR_MERGE_SHA_MISMATCH'],
    ['githubEvent', 'GITHUB_EVENT_MISMATCH'],
    ['buildSha256', 'BUILD_SHA256_MISMATCH'],
  ];

  const aggregateRouteChecks = [];
  const aggregateJourneyChecks = [];
  const aggregateScreenshots = [];
  const referencedScreenshotKeys = [];
  const screenshotMetadataKeys = [];

  for (const record of records) {
    const { manifest } = record;
    const shardId = typeof manifest.shardId === 'string' ? manifest.shardId : 'unknown-shard';
    const shard = expectedShardById.get(shardId);

    if (manifest.schemaVersion !== AGGREGATE_SCHEMA_VERSION) {
      addError(
        'SCHEMA_VERSION_MISMATCH',
        `${shardId} uses rendered QA schema ${JSON.stringify(manifest.schemaVersion)}; expected 2`,
        { shardId, actual: manifest.schemaVersion, expected: AGGREGATE_SCHEMA_VERSION },
      );
    }
    for (const [field, code] of lineageFields) {
      const actual = normalizeLineageValue(manifest[field]);
      if (actual !== lineage[field]) {
        addError(code, `${shardId} has incompatible ${field}`, {
          shardId,
          field,
          actual,
          expected: lineage[field],
        });
      }
    }
    if (!normalizeLineageValue(manifest.githubRunId)) {
      addError('LINEAGE_FIELD_MISSING', `${shardId} omitted githubRunId`, { shardId, field: 'githubRunId' });
    }
    const shardRunAttempt = parsePositiveRunAttempt(manifest.githubRunAttempt);
    if (shardRunAttempt === null) {
      addError('RUN_ATTEMPT_INVALID', `${shardId} did not record a positive integer run attempt`, {
        shardId,
        actual: manifest.githubRunAttempt ?? null,
      });
    } else if (
      expectedRunAttemptWasSupplied
      && lineage.githubRunAttempt !== null
      && shardRunAttempt > lineage.githubRunAttempt
    ) {
      addError('RUN_ATTEMPT_INCOMPATIBLE', `${shardId} came from a future workflow attempt`, {
        shardId,
        actual: shardRunAttempt,
        aggregateAttempt: lineage.githubRunAttempt,
      });
    }
    if (!SHA_PATTERN.test(String(manifest.testedSourceSha ?? ''))) {
      addError('TESTED_SHA_INVALID', `${shardId} did not record a 40-character tested source SHA`, { shardId });
    }
    if (!SHA256_PATTERN.test(String(manifest.buildSha256 ?? ''))) {
      addError('BUILD_SHA256_INVALID', `${shardId} did not record a valid exact-build SHA-256`, {
        shardId,
        actual: manifest.buildSha256 ?? null,
      });
    }
    if (manifest.githubEvent === 'pull_request') {
      if (!SHA_PATTERN.test(String(manifest.prHeadSha ?? ''))) {
        addError('PR_HEAD_SHA_INVALID', `${shardId} did not record a valid PR head SHA`, { shardId });
      }
      if (manifest.testedSourceSha !== manifest.prHeadSha) {
        addError('TESTED_SHA_PR_HEAD_MISMATCH', `${shardId} did not test the exact PR head`, {
          shardId,
          testedSourceSha: manifest.testedSourceSha ?? null,
          prHeadSha: manifest.prHeadSha ?? null,
        });
      }
    }

    if (!shard) continue;
    if (manifest.shardKind !== shard.kind) {
      addError('SHARD_KIND_MISMATCH', `${shardId} recorded shardKind=${manifest.shardKind}; expected ${shard.kind}`, {
        shardId,
        actual: manifest.shardKind,
        expected: shard.kind,
      });
    }
    if (manifest.publicRouteCoverage !== 'full') {
      addError('SHARD_COVERAGE_MISMATCH', `${shardId} did not use full public-route coverage`, { shardId });
    }
    if (manifest.result === 'running' || manifest.completedAt === null || manifest.completedAt === undefined) {
      addError('SHARD_INCOMPLETE', `${shardId} did not write a completed final manifest`, {
        shardId,
        result: manifest.result ?? null,
        completedAt: manifest.completedAt ?? null,
      });
    } else if (manifest.result !== 'passed') {
      addError('SHARD_RESULT_FAILED', `${shardId} result is ${JSON.stringify(manifest.result)}`, {
        shardId,
        result: manifest.result ?? null,
      });
    }
    if (manifest.routeFailureCount !== 0) {
      addError('ROUTE_FAILURES_PRESENT', `${shardId} recorded route failures`, {
        shardId,
        count: manifest.routeFailureCount,
      });
    }
    if (manifest.interactionFailureCount !== 0) {
      addError('JOURNEY_FAILURES_PRESENT', `${shardId} recorded journey failures`, {
        shardId,
        count: manifest.interactionFailureCount,
      });
    }
    if (manifest.invariantFailureCount !== 0 || asArray(manifest.invariantFailures).length !== 0) {
      addError('INVARIANT_FAILURES_PRESENT', `${shardId} recorded invariant failures`, {
        shardId,
        count: manifest.invariantFailureCount,
        failures: asArray(manifest.invariantFailures),
      });
    }
    if (manifest.fatalFailureCount !== 0 || manifest.fatalFailure !== null) {
      addError('FATAL_FAILURE_PRESENT', `${shardId} recorded a fatal rendered QA failure`, {
        shardId,
        count: manifest.fatalFailureCount,
        fatalFailure: manifest.fatalFailure ?? null,
      });
    }

    const routeChecks = asArray(manifest.routeChecks);
    const journeyChecks = asArray(manifest.journeyChecks);
    const screenshots = asArray(manifest.screenshots);
    validateCount(manifest, 'routeCheckCount', shard.expectedRouteChecks, shardId, addError);
    validateCount(manifest, 'actualRouteCheckCount', routeChecks.length, shardId, addError);
    validateCount(manifest, 'actualRouteCheckCount', shard.expectedRouteChecks, shardId, addError);
    validateCount(manifest, 'interactionJourneyCount', journeyChecks.length, shardId, addError);
    validateCount(
      manifest,
      'expectedInteractionJourneyCount',
      shard.expectedJourneyChecks,
      shardId,
      addError,
    );
    validateCount(manifest, 'interactionJourneyCount', shard.expectedJourneyChecks, shardId, addError);
    validateCount(manifest, 'expectedScreenshotCount', shard.expectedScreenshots, shardId, addError);
    validateCount(manifest, 'screenshotCount', screenshots.length, shardId, addError);
    validateCount(manifest, 'screenshotCount', shard.expectedScreenshots, shardId, addError);

    for (const check of routeChecks) {
      const key = routeTupleKey(check?.route, check?.viewportName, check?.colorScheme);
      const resolved = resolveScreenshotPath(record, check?.screenshotPath, addError);
      aggregateRouteChecks.push({
        shardId,
        key,
        route: check?.route ?? null,
        viewportName: check?.viewportName ?? null,
        colorScheme: check?.colorScheme ?? null,
        result: check?.result ?? null,
        failure: check?.failure ?? null,
        screenshotPath: check?.screenshotPath ?? null,
        resolvedScreenshotPath: resolved,
      });
      if (check?.result !== 'passed' || check?.failure !== null) {
        addError('ROUTE_CHECK_FAILED', `${shardId} contains a failed route check`, { shardId, key });
      }
      if (resolved) referencedScreenshotKeys.push(resolved);
    }

    for (const check of journeyChecks) {
      const screenshotPaths = asArray(check?.screenshotPaths);
      const resolvedScreenshotPaths = screenshotPaths
        .map((screenshotPath) => resolveScreenshotPath(record, screenshotPath, addError))
        .filter(Boolean);
      aggregateJourneyChecks.push({
        shardId,
        journeyId: check?.journeyId ?? null,
        result: check?.result ?? null,
        failure: check?.failure ?? null,
        screenshotPaths,
        resolvedScreenshotPaths,
      });
      if (check?.result !== 'passed' || check?.failure !== null) {
        addError('JOURNEY_CHECK_FAILED', `${shardId} contains a failed journey check`, {
          shardId,
          journeyId: check?.journeyId ?? null,
        });
      }
      const expectedJourneyScreenshots = renderedQaJourneyScreenshotCounts[check?.journeyId];
      if (expectedJourneyScreenshots !== undefined && screenshotPaths.length !== expectedJourneyScreenshots) {
        addError('JOURNEY_SCREENSHOT_COUNT_MISMATCH', `${check.journeyId} referenced ${screenshotPaths.length} screenshots; expected ${expectedJourneyScreenshots}`, {
          shardId,
          journeyId: check.journeyId,
          actual: screenshotPaths.length,
          expected: expectedJourneyScreenshots,
        });
      }
      referencedScreenshotKeys.push(...resolvedScreenshotPaths);
    }

    for (const screenshot of screenshots) {
      const resolved = resolveScreenshotPath(record, screenshot?.path, addError);
      if (!resolved) continue;
      screenshotMetadataKeys.push(resolved);
      aggregateScreenshots.push({
        shardId,
        path: relativeDisplay(resolvedRoot, resolved),
        filename: screenshot?.filename ?? null,
        bytes: screenshot?.bytes ?? null,
        sha256: screenshot?.sha256 ?? null,
        owner: screenshot?.owner ?? null,
        resolvedPath: resolved,
      });
    }
  }

  const expectedRouteKeys = renderedQaColorSchemes.flatMap((colorScheme) =>
    renderedQaViewports.flatMap(([viewportName]) =>
      renderedQaFullPublicRoutes.map((route) => routeTupleKey(route, viewportName, colorScheme)),
    ),
  );
  compareMultiset({
    expectedKeys: expectedRouteKeys,
    actualKeys: aggregateRouteChecks.map(({ key }) => key),
    missingCode: 'ROUTE_TUPLE_MISSING',
    duplicateCode: 'ROUTE_TUPLE_DUPLICATE',
    extraCode: 'ROUTE_TUPLE_EXTRA',
    describe: (key) => {
      const [route, viewportName, colorScheme] = JSON.parse(key);
      return `route tuple ${formatRouteTuple(route, viewportName, colorScheme)}`;
    },
    addError,
  });

  const screenshotByResolvedPath = new Map(
    aggregateScreenshots.map((screenshot) => [screenshot.resolvedPath, screenshot]),
  );
  for (const routeCheck of aggregateRouteChecks) {
    const screenshot = screenshotByResolvedPath.get(routeCheck.resolvedScreenshotPath);
    const owner = screenshot?.owner;
    if (
      !screenshot
      || !isRecord(owner)
      || owner.kind !== 'route'
      || owner.route !== routeCheck.route
      || owner.viewportName !== routeCheck.viewportName
      || owner.colorScheme !== routeCheck.colorScheme
    ) {
      addError('SCREENSHOT_OWNER_MISMATCH', `${routeCheck.shardId} route evidence owner does not match its route tuple`, {
        shardId: routeCheck.shardId,
        route: routeCheck.route,
        viewportName: routeCheck.viewportName,
        colorScheme: routeCheck.colorScheme,
        screenshotPath: routeCheck.screenshotPath,
        owner: owner ?? null,
      });
    }
  }
  for (const journeyCheck of aggregateJourneyChecks) {
    for (let index = 0; index < journeyCheck.resolvedScreenshotPaths.length; index += 1) {
      const screenshot = screenshotByResolvedPath.get(journeyCheck.resolvedScreenshotPaths[index]);
      const owner = screenshot?.owner;
      if (
        !screenshot
        || !isRecord(owner)
        || owner.kind !== 'journey'
        || owner.journeyId !== journeyCheck.journeyId
      ) {
        addError('SCREENSHOT_OWNER_MISMATCH', `${journeyCheck.shardId} journey evidence owner does not match its journey`, {
          shardId: journeyCheck.shardId,
          journeyId: journeyCheck.journeyId,
          screenshotPath: journeyCheck.screenshotPaths[index] ?? null,
          owner: owner ?? null,
        });
      }
    }
  }
  compareMultiset({
    expectedKeys: renderedQaJourneyIds,
    actualKeys: aggregateJourneyChecks.map(({ journeyId }) => journeyId),
    missingCode: 'JOURNEY_MISSING',
    duplicateCode: 'JOURNEY_DUPLICATE',
    extraCode: 'JOURNEY_EXTRA',
    describe: (journeyId) => `journey ${JSON.stringify(journeyId)}`,
    addError,
  });
  compareMultiset({
    expectedKeys: referencedScreenshotKeys,
    actualKeys: screenshotMetadataKeys,
    missingCode: 'SCREENSHOT_REFERENCE_MISSING',
    duplicateCode: 'SCREENSHOT_DUPLICATE',
    extraCode: 'SCREENSHOT_EXTRA',
    describe: (filePath) => `screenshot ${relativeDisplay(resolvedRoot, filePath)}`,
    addError,
  });

  const diskPngPaths = allFiles.filter((filePath) => path.extname(filePath).toLowerCase() === '.png');
  const metadataPathSet = new Set(screenshotMetadataKeys);
  for (const diskPath of diskPngPaths) {
    if (!metadataPathSet.has(diskPath)) {
      addError('SCREENSHOT_FILE_EXTRA', `PNG is not declared by a shard manifest: ${relativeDisplay(resolvedRoot, diskPath)}`, {
        path: relativeDisplay(resolvedRoot, diskPath),
      });
    }
  }
  if (screenshotMetadataKeys.length !== 399 || new Set(screenshotMetadataKeys).size !== 399) {
    addError('SCREENSHOT_COUNT_MISMATCH', `Aggregate declared ${screenshotMetadataKeys.length} screenshots (${new Set(screenshotMetadataKeys).size} unique); expected exactly 399`, {
      actual: screenshotMetadataKeys.length,
      unique: new Set(screenshotMetadataKeys).size,
      expected: 399,
    });
  }
  if (diskPngPaths.length !== 399) {
    addError('SCREENSHOT_FILE_COUNT_MISMATCH', `Evidence directory contains ${diskPngPaths.length} PNGs; expected exactly 399`, {
      actual: diskPngPaths.length,
      expected: 399,
    });
  }

  await Promise.all(aggregateScreenshots.map(async (screenshot) => {
    let bytes;
    try {
      const details = await stat(screenshot.resolvedPath);
      if (!details.isFile()) throw new TypeError('path is not a regular file');
      bytes = await readFile(screenshot.resolvedPath);
    } catch (error) {
      addError('SCREENSHOT_FILE_MISSING', `Could not read ${screenshot.path}`, {
        shardId: screenshot.shardId,
        path: screenshot.path,
        error: String(error),
      });
      return;
    }
    if (bytes.length === 0) {
      addError('SCREENSHOT_FILE_EMPTY', `${screenshot.path} is empty`, {
        shardId: screenshot.shardId,
        path: screenshot.path,
      });
      return;
    }
    if (bytes.length < PNG_SIGNATURE.length || !bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
      addError('SCREENSHOT_INVALID_PNG', `${screenshot.path} does not have a PNG signature`, {
        shardId: screenshot.shardId,
        path: screenshot.path,
      });
    }
    if (screenshot.bytes !== bytes.length) {
      addError('SCREENSHOT_BYTE_COUNT_MISMATCH', `${screenshot.path} byte count does not match its manifest`, {
        shardId: screenshot.shardId,
        path: screenshot.path,
        actual: bytes.length,
        expected: screenshot.bytes,
      });
    }
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (!SHA256_PATTERN.test(String(screenshot.sha256 ?? '')) || screenshot.sha256 !== digest) {
      addError('SCREENSHOT_DIGEST_MISMATCH', `${screenshot.path} SHA-256 does not match its manifest`, {
        shardId: screenshot.shardId,
        path: screenshot.path,
        actual: digest,
        expected: screenshot.sha256,
      });
    }
    if (screenshot.filename !== path.basename(screenshot.path)) {
      addError('SCREENSHOT_FILENAME_MISMATCH', `${screenshot.path} filename metadata is inconsistent`, {
        shardId: screenshot.shardId,
        path: screenshot.path,
        filename: screenshot.filename,
      });
    }
  }));

  aggregateRouteChecks.sort((left, right) => {
    const leftIndex = expectedRouteKeys.indexOf(left.key);
    const rightIndex = expectedRouteKeys.indexOf(right.key);
    return leftIndex - rightIndex || left.shardId.localeCompare(right.shardId);
  });
  aggregateJourneyChecks.sort((left, right) => {
    const leftIndex = renderedQaJourneyIds.indexOf(left.journeyId);
    const rightIndex = renderedQaJourneyIds.indexOf(right.journeyId);
    return leftIndex - rightIndex || left.shardId.localeCompare(right.shardId);
  });
  aggregateScreenshots.sort((left, right) => left.path.localeCompare(right.path));

  const publicRouteChecks = aggregateRouteChecks.map(
    ({ resolvedScreenshotPath: _resolvedScreenshotPath, ...routeCheck }) => routeCheck,
  );
  const publicJourneyChecks = aggregateJourneyChecks.map(
    ({ resolvedScreenshotPaths: _resolvedScreenshotPaths, ...journeyCheck }) => journeyCheck,
  );
  const publicScreenshots = aggregateScreenshots.map(({ resolvedPath: _resolvedPath, ...screenshot }) => screenshot);
  const shardRunAttempts = Object.fromEntries(records
    .filter(({ manifest }) => typeof manifest.shardId === 'string')
    .map(({ manifest }) => [manifest.shardId, parsePositiveRunAttempt(manifest.githubRunAttempt)]));
  const aggregate = {
    schemaVersion: AGGREGATE_SCHEMA_VERSION,
    result: validationErrors.length === 0 ? 'passed' : 'failed',
    generatedAt: new Date().toISOString(),
    rootDir: resolvedRoot,
    lineage,
    shardRunAttempts,
    expected: {
      shards: 12,
      routeChecks: 360,
      journeyChecks: 17,
      screenshots: 399,
    },
    counts: {
      shards: records.length,
      routeChecks: aggregateRouteChecks.length,
      journeyChecks: aggregateJourneyChecks.length,
      screenshots: publicScreenshots.length,
    },
    shards: records.map(({ manifest, manifestPath }) => ({
      shardId: manifest.shardId ?? null,
      shardKind: manifest.shardKind ?? null,
      result: manifest.result ?? null,
      manifestPath: relativeDisplay(resolvedRoot, manifestPath),
      routeCheckCount: asArray(manifest.routeChecks).length,
      journeyCheckCount: asArray(manifest.journeyChecks).length,
      screenshotCount: asArray(manifest.screenshots).length,
    })),
    routeChecks: publicRouteChecks,
    journeyChecks: publicJourneyChecks,
    screenshots: publicScreenshots,
    validationErrorCount: validationErrors.length,
    validationErrors,
  };

  await mkdir(path.dirname(resolvedOutput), { recursive: true });
  await writeFile(resolvedOutput, `${JSON.stringify(aggregate, null, 2)}\n`, 'utf8');
  return aggregate;
}

export function parseAggregateRenderedQaArgs(argv = process.argv.slice(2), env = process.env) {
  let rootDir = env.RENDERED_QA_SHARDS_DIR || env.RENDERED_QA_AGGREGATE_ROOT || null;
  let outputPath = env.RENDERED_QA_AGGREGATE_MANIFEST || null;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--root' || argument === '--input') {
      rootDir = argv[++index];
    } else if (argument === '--output') {
      outputPath = argv[++index];
    } else if (!argument.startsWith('-') && !rootDir) {
      rootDir = argument;
    } else {
      throw new Error(`Unknown aggregate-rendered-qa argument ${JSON.stringify(argument)}`);
    }
  }
  rootDir ||= 'artifacts/rendered-qa-shards';
  outputPath ||= path.join(rootDir, 'rendered-qa-aggregate.json');
  return {
    rootDir,
    outputPath,
    expected: {
      githubRunId: env.RENDERED_QA_GITHUB_RUN_ID || env.GITHUB_RUN_ID || undefined,
      githubRunAttempt: env.RENDERED_QA_GITHUB_RUN_ATTEMPT || env.GITHUB_RUN_ATTEMPT || undefined,
      testedSourceSha: env.RENDERED_QA_TESTED_SHA || undefined,
      prHeadSha: env.RENDERED_QA_PR_HEAD_SHA || undefined,
      prMergeSha: env.RENDERED_QA_PR_MERGE_SHA || undefined,
      githubEvent: env.RENDERED_QA_GITHUB_EVENT || env.GITHUB_EVENT_NAME || undefined,
      buildSha256: env.RENDERED_QA_BUILD_SHA256 || undefined,
    },
  };
}

async function main() {
  const options = parseAggregateRenderedQaArgs();
  const aggregate = await aggregateRenderedQaEvidence(options);
  const summary = `[rendered-qa-aggregate] ${aggregate.result.toUpperCase()}: ${aggregate.counts.shards}/12 shards, ${aggregate.counts.routeChecks}/360 routes, ${aggregate.counts.journeyChecks}/17 journeys, ${aggregate.counts.screenshots}/399 screenshots`;
  if (aggregate.result === 'passed') console.log(summary);
  else {
    console.error(summary);
    console.error(JSON.stringify(aggregate.validationErrors, null, 2));
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
