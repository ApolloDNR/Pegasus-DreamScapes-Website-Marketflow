import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const verifierPath = resolve(
  process.cwd(),
  "scripts/verify-merge-provenance.mjs",
);

function runGit(cwd: string, ...args: string[]) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `git ${args.join(" ")} failed`);
  }
  return result.stdout.trim();
}

describe("synthetic merge provenance verifier", () => {
  let repositoryPath: string;
  let baseSha: string;
  let headSha: string;

  beforeEach(() => {
    repositoryPath = mkdtempSync(join(tmpdir(), "pegasus-merge-provenance-"));
    runGit(repositoryPath, "init", "--initial-branch=main");
    runGit(repositoryPath, "config", "user.email", "ci@example.com");
    runGit(repositoryPath, "config", "user.name", "Pegasus CI");

    writeFileSync(join(repositoryPath, "fixture.txt"), "base\n");
    runGit(repositoryPath, "add", "fixture.txt");
    runGit(repositoryPath, "commit", "-m", "base");
    baseSha = runGit(repositoryPath, "rev-parse", "HEAD");

    runGit(repositoryPath, "switch", "-c", "candidate");
    writeFileSync(join(repositoryPath, "candidate.txt"), "candidate\n");
    runGit(repositoryPath, "add", "candidate.txt");
    runGit(repositoryPath, "commit", "-m", "candidate");
    headSha = runGit(repositoryPath, "rev-parse", "HEAD");

    runGit(repositoryPath, "switch", "main");
    runGit(repositoryPath, "merge", "--no-ff", "--no-edit", "candidate");
  });

  afterEach(() => {
    rmSync(repositoryPath, { recursive: true, force: true });
  });

  function runVerifier(overrides: Record<string, string> = {}) {
    return spawnSync(process.execPath, [verifierPath], {
      cwd: repositoryPath,
      encoding: "utf8",
      env: {
        ...process.env,
        EXPECTED_BASE_SHA: baseSha,
        EXPECTED_HEAD_SHA: headSha,
        ...overrides,
      },
    });
  }

  it("accepts the current merge parents when the event merge SHA is stale", () => {
    const result = runVerifier({
      EXPECTED_MERGE_SHA: "0000000000000000000000000000000000000000",
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(`base ${baseSha}`);
    expect(result.stdout).toContain(`head ${headSha}`);
    expect(result.stdout).toContain("event merge SHA was stale");
  });

  it("fails closed when the checked-out merge does not contain the expected head", () => {
    const result = runVerifier({
      EXPECTED_HEAD_SHA: "1111111111111111111111111111111111111111",
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("head parent mismatch");
  });
});
