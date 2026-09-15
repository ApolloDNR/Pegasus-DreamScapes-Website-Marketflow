#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const SHA_PATTERN = /^[0-9a-f]{40}$/;

function requiredSha(name) {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value || !SHA_PATTERN.test(value)) {
    throw new Error(`${name} must be a full 40-character Git SHA`);
  }
  return value;
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

try {
  const expectedBaseSha = requiredSha("EXPECTED_BASE_SHA");
  const expectedHeadSha = requiredSha("EXPECTED_HEAD_SHA");
  const mergeRef = process.env.MERGE_REF?.trim() || "HEAD";
  const actualSha = git("rev-parse", `${mergeRef}^{commit}`);
  const parentShas = git("show", "-s", "--format=%P", actualSha)
    .split(/\s+/)
    .filter(Boolean);

  if (parentShas.length !== 2) {
    throw new Error(
      `expected a two-parent synthetic merge, received ${parentShas.length} parent(s)`,
    );
  }
  if (parentShas[0] !== expectedBaseSha) {
    throw new Error(
      `base parent mismatch: expected ${expectedBaseSha}, received ${parentShas[0]}`,
    );
  }
  if (parentShas[1] !== expectedHeadSha) {
    throw new Error(
      `head parent mismatch: expected ${expectedHeadSha}, received ${parentShas[1]}`,
    );
  }

  const eventMergeSha = process.env.EXPECTED_MERGE_SHA?.trim().toLowerCase();
  const staleEventNote = eventMergeSha && eventMergeSha !== actualSha
    ? " (event merge SHA was stale)"
    : "";

  console.log(
    `Synthetic merge ${actualSha}: base ${expectedBaseSha}; head ${expectedHeadSha}${staleEventNote}`,
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Synthetic merge provenance failed: ${message}`);
  process.exitCode = 1;
}
