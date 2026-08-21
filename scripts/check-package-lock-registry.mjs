import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const lockfilePath = process.argv[2] ?? fileURLToPath(new URL("../package-lock.json", import.meta.url));
const lockfile = JSON.parse(readFileSync(lockfilePath, "utf8"));
const invalidEntries = [];

function inspect(value, path = "package-lock.json") {
  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;

    if (key === "resolved" && typeof child === "string" && /^https?:\/\//i.test(child)) {
      try {
        const url = new URL(child);

        if (url.origin !== "https://registry.npmjs.org") {
          invalidEntries.push(`${path}: ${child}`);
        }
      } catch {
        invalidEntries.push(`${path}: ${child} (malformed HTTP(S) URL)`);
      }
    } else {
      inspect(child, childPath);
    }
  }
}

inspect(lockfile);

if (invalidEntries.length > 0) {
  console.error("package-lock.json contains non-portable registry tarball URLs:");
  for (const entry of invalidEntries) {
    console.error(`- ${entry}`);
  }
  process.exitCode = 1;
} else {
  console.log("package-lock.json registry tarball URLs use https://registry.npmjs.org.");
}
