import { describe, test, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const PAGES_DIR = join(process.cwd(), "client/src/pages");
const COMPONENTS_DIR = join(process.cwd(), "client/src/components");

// All .tsx files under client/src/pages — full surface enforcement, including
// retired-but-still-resident pages so future edits can't regress the rule.
const PUBLIC_PAGES = readdirSync(PAGES_DIR, { withFileTypes: true })
  .filter((d) => d.isFile() && d.name.endsWith(".tsx"))
  .map((d) => d.name);

const SHARED_COMPONENTS = [
  "navigation.tsx",
  "footer.tsx",
  "cookie-consent.tsx",
];

describe("Design token discipline (prototype design system)", () => {
  // The Empire Doctrine radius/shadow brand-lock has been retired: the saved
  // prototype under client/src/pegasus/ is now the visual source of truth and
  // uses the full Tailwind radius/shadow scale freely. The still-active guard
  // below is brand casing, which remains a real rule per replit.md.

  describe("Brand casing — no uppercase transform on mixed-case 'Pegasus DreamScapes'", () => {
    const ALL_SOURCES = [
      ...PUBLIC_PAGES.map((n) => join(PAGES_DIR, n)),
      ...SHARED_COMPONENTS.map((n) => join(COMPONENTS_DIR, n)),
    ];
    for (const path of ALL_SOURCES) {
      test(`${path.split("/").slice(-2).join("/")} does not uppercase the brand string`, () => {
        const src = readFileSync(path, "utf8");
        // Find every JSX element with className containing 'uppercase' and assert it does not contain the literal brand string.
        const elementRx = /<[a-zA-Z]+[^>]*className=("([^"]*)"|\{`([^`]*)`\}|\{"([^"]*)"\})[^>]*>([\s\S]*?)<\//g;
        let m: RegExpExecArray | null;
        while ((m = elementRx.exec(src)) !== null) {
          const cls = m[2] || m[3] || m[4] || "";
          const body = m[5] || "";
          if (/\buppercase\b/.test(cls) && /Pegasus DreamScapes/.test(body)) {
            throw new Error(`Mixed-case 'Pegasus DreamScapes' rendered inside className with 'uppercase' in ${path}: ${m[0].slice(0, 160)}`);
          }
        }
      });
    }
  });

  test("card-primitives.tsx exists and exports CardSurface + CardElevated", () => {
    const src = readFileSync(join(COMPONENTS_DIR, "ui/card-primitives.tsx"), "utf8");
    expect(src).toMatch(/CardSurface/);
    expect(src).toMatch(/CardElevated/);
    expect(src).toMatch(/export\s*\{[^}]*CardSurface[^}]*\}|export\s+(const|function)\s+CardSurface/);
  });
});
