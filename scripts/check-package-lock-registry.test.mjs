import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const guardPath = join(scriptsDirectory, "check-package-lock-registry.mjs");

function runGuard(resolved) {
  const fixtureDirectory = mkdtempSync(join(tmpdir(), "package-lock-registry-"));
  const lockfilePath = join(fixtureDirectory, "package-lock.json");
  const lockfile = {
    lockfileVersion: 3,
    packages: {
      "": {},
      "node_modules/example": { resolved },
    },
  };

  writeFileSync(lockfilePath, `${JSON.stringify(lockfile)}\n`);

  try {
    const output = execFileSync(process.execPath, [guardPath, lockfilePath], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, output };
  } catch (error) {
    return {
      status: error.status,
      output: `${error.stdout}${error.stderr}`,
    };
  } finally {
    rmSync(fixtureDirectory, { recursive: true, force: true });
  }
}

test("accepts only the canonical npm registry origin for HTTP(S) resolved URLs", () => {
  const canonical = runGuard("https://registry.npmjs.org/example/-/example-1.0.0.tgz");
  assert.equal(canonical.status, 0);

  for (const resolved of [
    "HTTP://package-firewall.replit.local/npm/example/-/example-1.0.0.tgz",
    "https://registry.npmjs.org:444/example/-/example-1.0.0.tgz",
    "HTTPS://registry.npmjs.org:bad/example/-/example-1.0.0.tgz",
  ]) {
    const result = runGuard(resolved);
    assert.equal(result.status, 1, resolved);
    assert.match(result.output, /package-lock\.json contains non-portable registry tarball URLs:/);
    assert.match(result.output, new RegExp(resolved.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const malformed = runGuard("HTTPS://registry.npmjs.org:bad/example/-/example-1.0.0.tgz");
  assert.match(malformed.output, /malformed HTTP\(S\) URL/);
});
