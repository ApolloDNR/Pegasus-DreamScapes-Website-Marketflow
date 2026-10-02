import { createHash } from 'node:crypto';
import { lstat, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_RENDERED_QA_BUILD_ROOT = 'dist/public';

const DIGEST_DOMAIN = Buffer.from('pegasus-rendered-qa-build-digest-v1\0', 'utf8');
const SHA256_PATTERN = /^[0-9a-f]{64}$/i;

function comparePaths(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function toPosixRelativePath(rootDir, candidate) {
  return path.relative(rootDir, candidate).split(path.sep).join('/');
}

function encodeLength(length) {
  const encoded = Buffer.allocUnsafe(8);
  encoded.writeBigUInt64BE(BigInt(length));
  return encoded;
}

async function inspectBuildRoot(rootDir) {
  let rootStats;
  try {
    rootStats = await lstat(rootDir);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`Rendered QA build root does not exist: ${rootDir}`);
    }
    throw new Error(`Could not inspect rendered QA build root ${rootDir}: ${String(error)}`);
  }

  if (rootStats.isSymbolicLink()) {
    throw new Error(`Rendered QA build digest rejects symbolic link root: ${rootDir}`);
  }
  if (!rootStats.isDirectory()) {
    throw new Error(`Rendered QA build root is not a directory: ${rootDir}`);
  }
}

async function discoverRegularFiles(rootDir) {
  const files = [];

  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => comparePaths(left.name, right.name));

    for (const entry of entries) {
      const candidate = path.join(directory, entry.name);
      const relativePath = toPosixRelativePath(rootDir, candidate);
      const stats = await lstat(candidate);

      if (stats.isSymbolicLink()) {
        throw new Error(`Rendered QA build digest rejects symbolic link: ${relativePath}`);
      }
      if (stats.isDirectory()) {
        await visit(candidate);
        continue;
      }
      if (!stats.isFile()) {
        throw new Error(`Rendered QA build digest rejects non-regular entry: ${relativePath}`);
      }

      files.push({ absolutePath: candidate, relativePath });
    }
  }

  await visit(rootDir);
  files.sort((left, right) => comparePaths(left.relativePath, right.relativePath));
  return files;
}

export async function createRenderedQaBuildDigest(rootDir = DEFAULT_RENDERED_QA_BUILD_ROOT) {
  const resolvedRoot = path.resolve(rootDir);
  await inspectBuildRoot(resolvedRoot);
  const discoveredFiles = await discoverRegularFiles(resolvedRoot);

  if (discoveredFiles.length === 0) {
    throw new Error(`Rendered QA build root does not contain any regular files: ${resolvedRoot}`);
  }

  const aggregateHash = createHash('sha256');
  aggregateHash.update(DIGEST_DOMAIN);
  const files = [];
  let totalBytes = 0;

  for (const { absolutePath, relativePath } of discoveredFiles) {
    const contents = await readFile(absolutePath);
    const pathBytes = Buffer.from(relativePath, 'utf8');
    const fileDigest = createHash('sha256').update(contents).digest('hex');

    aggregateHash.update(encodeLength(pathBytes.length));
    aggregateHash.update(pathBytes);
    aggregateHash.update(encodeLength(contents.length));
    aggregateHash.update(contents);

    totalBytes += contents.length;
    files.push({
      path: relativePath,
      bytes: contents.length,
      sha256: fileDigest,
    });
  }

  return {
    schemaVersion: 1,
    algorithm: 'sha256',
    digest: aggregateHash.digest('hex'),
    fileCount: files.length,
    totalBytes,
    files,
  };
}

function requireOptionValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

export function parseRenderedQaBuildDigestArgs(argv) {
  const parsed = {
    rootDir: DEFAULT_RENDERED_QA_BUILD_ROOT,
    outputPath: null,
    expectedDigest: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === '--root') {
      parsed.rootDir = requireOptionValue(argv, index, option);
      index += 1;
    } else if (option === '--output') {
      parsed.outputPath = requireOptionValue(argv, index, option);
      index += 1;
    } else if (option === '--expect') {
      const expectedDigest = requireOptionValue(argv, index, option);
      if (!SHA256_PATTERN.test(expectedDigest)) {
        throw new Error('--expect must be a 64-character SHA-256 digest');
      }
      parsed.expectedDigest = expectedDigest.toLowerCase();
      index += 1;
    } else {
      throw new Error(`Unknown rendered QA build digest option: ${option}`);
    }
  }

  return parsed;
}

export async function runRenderedQaBuildDigestCli(
  argv = process.argv.slice(2),
  { cwd = process.cwd(), stdout = process.stdout, stderr = process.stderr } = {},
) {
  const { rootDir, outputPath, expectedDigest } = parseRenderedQaBuildDigestArgs(argv);
  const manifest = await createRenderedQaBuildDigest(path.resolve(cwd, rootDir));
  const serializedManifest = `${JSON.stringify(manifest, null, 2)}\n`;

  if (outputPath) {
    const resolvedOutput = path.resolve(cwd, outputPath);
    await mkdir(path.dirname(resolvedOutput), { recursive: true });
    await writeFile(resolvedOutput, serializedManifest);
  }

  stdout.write(serializedManifest);
  if (expectedDigest && manifest.digest !== expectedDigest) {
    stderr.write(
      `Rendered QA build digest ${manifest.digest} does not match expected digest ${expectedDigest}\n`,
    );
    return 1;
  }
  return 0;
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  runRenderedQaBuildDigestCli()
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    });
}
