import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const SCRIPT_PATH = path.resolve("scripts/rendered-qa-build-digest.mjs");
const FIXTURE_DIGEST = "c9bf7ed4b811cd6584f08f59bd4fed67b872bf68139be1c32302af87d79927f6";

type BuildDigestManifest = {
  schemaVersion: number;
  algorithm: string;
  digest: string;
  fileCount: number;
  totalBytes: number;
  files: Array<{ path: string; bytes: number; sha256: string }>;
};

type BuildDigestModule = {
  createRenderedQaBuildDigest(rootDir?: string): Promise<BuildDigestManifest>;
};

const cleanupRoots: string[] = [];

afterEach(async () => {
  await Promise.all(cleanupRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function makeTempRoot(prefix = "pegasus-build-digest-") {
  const root = await mkdtemp(path.join(tmpdir(), prefix));
  cleanupRoots.push(root);
  return root;
}

async function loadBuildDigestModule() {
  return import("../../scripts/rendered-qa-build-digest.mjs") as Promise<BuildDigestModule>;
}

async function writeFixture(root: string, reverseCreationOrder = false) {
  const nestedDir = path.join(root, "nested");
  await mkdir(nestedDir, { recursive: true });
  const files: Array<[string, string | Buffer]> = [
    [path.join(root, "a.txt"), "alpha"],
    [path.join(nestedDir, "b.bin"), Buffer.from([0, 255, 10])],
  ];
  if (reverseCreationOrder) files.reverse();
  for (const [filePath, contents] of files) await writeFile(filePath, contents);
}

describe("rendered QA build digest", () => {
  it("hashes sorted POSIX paths and bytes independently of filesystem creation order", async () => {
    const { createRenderedQaBuildDigest } = await loadBuildDigestModule();
    const firstRoot = await makeTempRoot();
    const secondRoot = await makeTempRoot();
    await writeFixture(firstRoot);
    await writeFixture(secondRoot, true);

    const first = await createRenderedQaBuildDigest(firstRoot);
    const second = await createRenderedQaBuildDigest(secondRoot);

    expect(first).toEqual(second);
    expect(first).toEqual({
      schemaVersion: 1,
      algorithm: "sha256",
      digest: FIXTURE_DIGEST,
      fileCount: 2,
      totalBytes: 8,
      files: [
        {
          path: "a.txt",
          bytes: 5,
          sha256: "8ed3f6ad685b959ead7022518e1af76cd816f8e8ec7ccdda1ed4018e8f2223f8",
        },
        {
          path: "nested/b.bin",
          bytes: 3,
          sha256: "712450d3c4a79eea9509e75dc1dacdeff58034df538536cfae2da882bd8a0c50",
        },
      ],
    });
  });

  it("changes the digest when file content or a relative path changes", async () => {
    const { createRenderedQaBuildDigest } = await loadBuildDigestModule();
    const baselineRoot = await makeTempRoot();
    const contentRoot = await makeTempRoot();
    const pathRoot = await makeTempRoot();
    await writeFixture(baselineRoot);
    await writeFixture(contentRoot);
    await writeFixture(pathRoot);
    await writeFile(path.join(contentRoot, "a.txt"), "Alpha");
    await mkdir(path.join(pathRoot, "renamed"));
    await writeFile(path.join(pathRoot, "renamed", "b.bin"), Buffer.from([0, 255, 10]));
    await rm(path.join(pathRoot, "nested", "b.bin"));

    const baseline = await createRenderedQaBuildDigest(baselineRoot);
    const contentChanged = await createRenderedQaBuildDigest(contentRoot);
    const pathChanged = await createRenderedQaBuildDigest(pathRoot);

    expect(contentChanged.digest).not.toBe(baseline.digest);
    expect(pathChanged.digest).not.toBe(baseline.digest);
    expect(pathChanged.files.map((file) => file.path)).toEqual(["a.txt", "renamed/b.bin"]);
  });

  it("rejects missing and empty build roots", async () => {
    const { createRenderedQaBuildDigest } = await loadBuildDigestModule();
    const parent = await makeTempRoot();
    const emptyRoot = path.join(parent, "empty");
    await mkdir(emptyRoot);

    await expect(createRenderedQaBuildDigest(path.join(parent, "missing"))).rejects.toThrow(
      /build root does not exist/i,
    );
    await expect(createRenderedQaBuildDigest(emptyRoot)).rejects.toThrow(
      /does not contain any regular files/i,
    );
  });

  it("rejects symbolic links instead of following or hashing them", async () => {
    const { createRenderedQaBuildDigest } = await loadBuildDigestModule();
    const root = await makeTempRoot();
    await writeFile(path.join(root, "real.txt"), "real bytes");
    await symlink("real.txt", path.join(root, "linked.txt"));

    await expect(createRenderedQaBuildDigest(root)).rejects.toThrow(/symbolic link.*linked\.txt/i);
  });

  it("writes a JSON manifest and exits zero when --expect matches", async () => {
    const tempRoot = await makeTempRoot();
    const buildRoot = path.join(tempRoot, "build");
    const outputPath = path.join(tempRoot, "evidence", "build-digest.json");
    await mkdir(buildRoot);
    await writeFixture(buildRoot);

    const { stdout, stderr } = await execFileAsync(process.execPath, [
      SCRIPT_PATH,
      "--root",
      buildRoot,
      "--output",
      outputPath,
      "--expect",
      FIXTURE_DIGEST,
    ]);

    expect(stderr).toBe("");
    const stdoutManifest = JSON.parse(stdout) as BuildDigestManifest;
    expect(stdoutManifest.digest).toBe(FIXTURE_DIGEST);
    expect(JSON.parse(await readFile(outputPath, "utf8"))).toEqual(stdoutManifest);
  });

  it("uses dist/public by default and exits nonzero when --expect mismatches", async () => {
    const workingDirectory = await makeTempRoot();
    const defaultRoot = path.join(workingDirectory, "dist", "public");
    await mkdir(defaultRoot, { recursive: true });
    await writeFixture(defaultRoot);

    const success = await execFileAsync(process.execPath, [SCRIPT_PATH], { cwd: workingDirectory });
    expect((JSON.parse(success.stdout) as BuildDigestManifest).digest).toBe(FIXTURE_DIGEST);

    await expect(
      execFileAsync(process.execPath, [SCRIPT_PATH, "--expect", "0".repeat(64)], {
        cwd: workingDirectory,
      }),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringMatching(/does not match expected digest/i),
    });
  });
});
