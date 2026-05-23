import { describe, test, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const PAGES_DIR = join(process.cwd(), "client/src/pages");
const COMPONENTS_DIR = join(process.cwd(), "client/src/components");

const PUBLIC_PAGES = [
  "home.tsx",
  "about.tsx",
  "development.tsx",
  "submit.tsx",
  "capital.tsx",
  "connect.tsx",
  "library.tsx",
  "projects.tsx",
  "project-nelson-dr.tsx",
  "project-detail.tsx",
  "vendor-network.tsx",
  "contact.tsx",
  "disclosures.tsx",
  "privacy.tsx",
  "terms.tsx",
  "marketplace.tsx",
  "marketflow-access.tsx",
  "not-found.tsx",
];

const SHARED_COMPONENTS = [
  "navigation.tsx",
  "footer.tsx",
  "cookie-consent.tsx",
];

const BANNED = [
  /\brounded-xl\b/,
  /\brounded-2xl\b/,
  /\brounded-3xl\b/,
  /\bshadow-xl\b/,
  /\bshadow-2xl\b/,
];

describe("Design token discipline (Empire Doctrine v1.0.1 §Brand System)", () => {
  for (const name of PUBLIC_PAGES) {
    test(`pages/${name} uses no banned radius / shadow utilities`, () => {
      const src = readFileSync(join(PAGES_DIR, name), "utf8");
      for (const rx of BANNED) {
        expect(src, `${name} contains ${rx} — must use rounded-md/lg + shadow-md or CardSurface/CardElevated`).not.toMatch(rx);
      }
    });
  }

  for (const name of SHARED_COMPONENTS) {
    test(`components/${name} uses no banned radius / shadow utilities`, () => {
      const src = readFileSync(join(COMPONENTS_DIR, name), "utf8");
      for (const rx of BANNED) {
        expect(src, `${name} contains ${rx} — must use rounded-md/lg + shadow-md or CardSurface/CardElevated`).not.toMatch(rx);
      }
    });
  }

  test("card-primitives.tsx exists and exports CardSurface + CardElevated", () => {
    const src = readFileSync(join(COMPONENTS_DIR, "ui/card-primitives.tsx"), "utf8");
    expect(src).toMatch(/CardSurface/);
    expect(src).toMatch(/CardElevated/);
    expect(src).toMatch(/export\s*\{[^}]*CardSurface[^}]*\}|export\s+(const|function)\s+CardSurface/);
  });
});
