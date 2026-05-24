/**
 * Empire Doctrine v1.0.2 Part F — Anti-Drift Lock tripwire.
 *
 * v1.0.2 ratifies the live visual baseline (palette + typography) as
 * canonical. Part F locks the doctrine .md files in project knowledge as
 * the only source of truth and forbids silent drift in code.
 *
 * This test fails the build if any of the locked Part A values diverge
 * from what the live source ships:
 *
 *   --copper            v1.0.2 Part A.1   27 56% 50%
 *   --font-display      v1.0.2 Part A.2   Cinzel
 *   --font-serif        v1.0.2 Part A.2   Cormorant Garamond
 *   --font-supporting   v1.0.2 Part A.2   Montserrat
 *   --font-sans         v1.0.2 Part A.2   Inter
 *   <meta theme-color>  v1.0.2 Part A.1   #0D1B2D
 *
 * If a future change needs to touch these values, the change is a
 * doctrine amendment first, code change second. Never the other way
 * around.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(__dirname, "..", "..", "..");

const indexCss = readFileSync(resolve(ROOT, "client/src/index.css"), "utf8");
const indexHtml = readFileSync(resolve(ROOT, "client/index.html"), "utf8");

describe("Empire Doctrine v1.0.2 Part F — Anti-Drift Lock", () => {
  describe("Part A.1 — palette", () => {
    it("--copper matches v1.0.2 Part A.1 (27 56% 50%)", () => {
      // Match the light-mode :root declaration only (the .dark override at
      // line ~159 may legitimately retune for contrast).
      expect(indexCss).toMatch(/--copper:\s*27\s+56%\s+50%\s*;/);
    });

    it("<meta name=\"theme-color\"> matches v1.0.2 Part A.1 Deep Navy (#0D1B2D)", () => {
      expect(indexHtml).toMatch(
        /<meta\s+name="theme-color"\s+content="#0D1B2D"\s*\/?>/,
      );
    });
  });

  describe("Part A.2 — typography", () => {
    it("--font-display = Cinzel", () => {
      expect(indexCss).toMatch(/--font-display:\s*'Cinzel'/);
    });

    it("--font-serif = Cormorant Garamond", () => {
      expect(indexCss).toMatch(/--font-serif:\s*'Cormorant Garamond'/);
    });

    it("--font-supporting = Montserrat", () => {
      expect(indexCss).toMatch(/--font-supporting:\s*'Montserrat'/);
    });

    it("--font-sans = Inter", () => {
      expect(indexCss).toMatch(/--font-sans:\s*'Inter'/);
    });
  });
});
