import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const publicDirectory = path.join(projectRoot, "dist", "public");
const manifestPath = path.join(publicDirectory, ".vite", "manifest.json");

const limits = {
  entryRaw: 200_000,
  entryGzip: 65_000,
  initialRaw: 475_000,
  initialGzip: 145_000,
};

function fail(message) {
  console.error(`[bundle-budget] ${message}`);
  process.exitCode = 1;
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (error) {
  fail(`Unable to read ${manifestPath}: ${error.message}`);
  process.exit();
}

const entryRecord = Object.entries(manifest).find(
  ([key, value]) =>
    value?.isEntry === true &&
    (key === "index.html" ||
      value.src === "index.html" ||
      key === "src/main.tsx" ||
      value.src === "src/main.tsx"),
);

if (!entryRecord) {
  fail("Vite manifest does not contain the client HTML/JavaScript entry.");
  process.exit();
}

const [entryKey, entryChunk] = entryRecord;
const initialChunkKeys = new Set();

function collectStaticImports(key) {
  if (initialChunkKeys.has(key)) return;
  const chunk = manifest[key];
  if (!chunk) {
    throw new Error(`Manifest import ${key} is missing.`);
  }

  initialChunkKeys.add(key);
  for (const importedKey of chunk.imports ?? []) {
    collectStaticImports(importedKey);
  }
}

try {
  collectStaticImports(entryKey);
} catch (error) {
  fail(error.message);
  process.exit();
}

function measure(file) {
  const absolutePath = path.join(publicDirectory, file);
  const bytes = readFileSync(absolutePath);
  return {
    file,
    raw: statSync(absolutePath).size,
    gzip: gzipSync(bytes, { level: 9 }).length,
  };
}

const initialChunks = Array.from(initialChunkKeys, (key) =>
  measure(manifest[key].file),
).sort((left, right) => right.raw - left.raw);
const entry = measure(entryChunk.file);
const initial = initialChunks.reduce(
  (total, chunk) => ({
    raw: total.raw + chunk.raw,
    gzip: total.gzip + chunk.gzip,
  }),
  { raw: 0, gzip: 0 },
);

console.log(
  `[bundle-budget] entry ${entry.raw} B raw / ${entry.gzip} B gzip ` +
    `(limits ${limits.entryRaw} / ${limits.entryGzip})`,
);
console.log(
  `[bundle-budget] initial JS ${initial.raw} B raw / ${initial.gzip} B gzip ` +
    `(limits ${limits.initialRaw} / ${limits.initialGzip})`,
);
for (const chunk of initialChunks) {
  console.log(
    `[bundle-budget]   ${chunk.file}: ${chunk.raw} B raw / ${chunk.gzip} B gzip`,
  );
}

if (entry.raw > limits.entryRaw) {
  fail(`Entry raw size exceeds its budget by ${entry.raw - limits.entryRaw} B.`);
}
if (entry.gzip > limits.entryGzip) {
  fail(
    `Entry gzip size exceeds its budget by ${entry.gzip - limits.entryGzip} B.`,
  );
}
if (initial.raw > limits.initialRaw) {
  fail(
    `Initial raw JavaScript exceeds its budget by ${initial.raw - limits.initialRaw} B.`,
  );
}
if (initial.gzip > limits.initialGzip) {
  fail(
    `Initial gzip JavaScript exceeds its budget by ${initial.gzip - limits.initialGzip} B.`,
  );
}

if (process.exitCode !== 1) {
  console.log("[bundle-budget] PASS");
}
