import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const lockfilePath = fileURLToPath(new URL("../package-lock.json", import.meta.url));
const lockfile = JSON.parse(readFileSync(lockfilePath, "utf8"));
const invalidEntries = [];

function inspect(value, path = "package-lock.json") {
  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;

    if (key === "resolved" && typeof child === "string" && /^https?:\/\//.test(child)) {
      const url = new URL(child);

      if (url.protocol !== "https:" || url.hostname !== "registry.npmjs.org") {
        invalidEntries.push(`${path}: ${child}`);
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
