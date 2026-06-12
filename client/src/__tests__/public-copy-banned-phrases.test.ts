import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

import { BANNED_PHRASES, normalizeForMatch, type BannedPhrase } from "./banned-phrases";

// ──────────────────────────────────────────────────────────────────────────
// Negative copy guard (Task #247)
//
// AI-sounding / filler copy has slipped into the live public site more than
// once (editorial passes #243 and #246), each time caught only after the
// founder noticed and required a manual hunt-and-replace.
//
// This suite scans the Pegasus prototype copy sources — the controlling source
// of truth for the public website per replit.md — and FAILS if any phrase in
// the maintained `BANNED_PHRASES` list appears, reporting the exact offending
// phrase and its file + line location.
//
// To extend the list, edit ./banned-phrases.ts (see the header there). This is
// a NEGATIVE guard only; it does not reintroduce the retired positive
// brand-lock that required specific wording.
// ─────────────────────────────────────────────────────────────────────────-

const PEGASUS_DIR = join(process.cwd(), "client/src/pegasus");

// Only copy-bearing source files. Styling/structure-only files have no prose.
const SCANNED_EXTENSIONS = [".tsx", ".ts"];

function pegasusSourceFiles(): string[] {
  return readdirSync(PEGASUS_DIR)
    .filter((name) => SCANNED_EXTENSIONS.some((ext) => name.endsWith(ext)))
    .sort();
}

type Offense = {
  file: string;
  line: number;
  phrase: string;
  reason: string;
  snippet: string;
};

// Strip code comments so the guard only scans user-facing copy (string + JSX
// text), not engineering notes. Block comments are blanked while preserving
// line count so reported line numbers stay accurate; line comments are removed
// URL-safely (the `:` in `https://` is not treated as a comment start).
function stripComments(source: string): string {
  const withoutBlocks = source.replace(/\/\*[\s\S]*?\*\//g, (match) =>
    match.replace(/[^\n]/g, " "),
  );
  return withoutBlocks
    .split("\n")
    .map((line) => line.replace(/(^|[^:])\/\/.*$/, "$1"))
    .join("\n");
}

function scanText(source: string, fileName: string): Offense[] {
  const lines = stripComments(source).split("\n");
  const offenses: Offense[] = [];

  lines.forEach((rawLine, idx) => {
    const haystack = normalizeForMatch(rawLine);
    for (const entry of BANNED_PHRASES) {
      const needle = normalizeForMatch(entry.phrase);
      if (haystack.includes(needle)) {
        offenses.push({
          file: fileName,
          line: idx + 1,
          phrase: entry.phrase,
          reason: entry.reason,
          snippet: rawLine.trim().slice(0, 120),
        });
      }
    }
  });

  return offenses;
}

// Scan a repo-relative source file. The display name carried into each Offense
// is the repo-relative path so failures point at the exact file — the pegasus
// prototype copy AND the canonical /submit intake page are both guarded.
function scanRepoFile(relPath: string): Offense[] {
  const fullPath = join(process.cwd(), relPath);
  return scanText(readFileSync(fullPath, "utf8"), relPath);
}

function formatOffense(o: Offense): string {
  return `  • "${o.phrase}" (${o.reason})\n    at ${o.file}:${o.line}\n    > ${o.snippet}`;
}

describe("Public copy contains no banned filler / AI-tell phrases (Task #247)", () => {
  const files = pegasusSourceFiles();

  it("the Pegasus copy directory actually has files to scan", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("the banned-phrase list is non-empty and well-formed", () => {
    expect(BANNED_PHRASES.length).toBeGreaterThan(0);
    for (const entry of BANNED_PHRASES as BannedPhrase[]) {
      expect(entry.phrase.trim()).not.toBe("");
      expect(entry.reason.trim()).not.toBe("");
    }
  });

  it("the scanner actually catches a banned phrase in copy-like text", () => {
    // Proves the negative direction: a banned phrase placed in a string/JSX
    // position (not a comment) is reported with its location.
    const synthetic = [
      'const blurb = "Our vetted team works hand in hand with you.";',
      "<p>https://example.com/path // not a comment trap</p>",
    ].join("\n");
    const hits = scanText(synthetic, "synthetic.tsx").map((o) => o.phrase);
    expect(hits).toContain("vetted team");
    expect(hits).toContain("hand in hand");
  });

  it("the scanner ignores banned phrases inside code comments", () => {
    const commented = [
      "// this vetted team note is just an engineering comment",
      "/* hand in hand block comment */",
      'const safe = "concrete, specific, true.";',
    ].join("\n");
    expect(scanText(commented, "synthetic.tsx")).toEqual([]);
  });

  for (const file of files) {
    it(`${file} ships no banned phrases`, () => {
      const offenses = scanRepoFile(join("client/src/pegasus", file));
      expect(
        offenses,
        offenses.length
          ? `Banned public-copy phrase(s) found — rewrite or, if intentional, ` +
              `update client/src/__tests__/banned-phrases.ts:\n` +
              offenses.map(formatOffense).join("\n")
          : "",
      ).toEqual([]);
    });
  }

  // The canonical /submit intake page is public-facing copy too (Task #250) —
  // guard it with the same banned-phrase list even though it lives outside the
  // pegasus prototype directory.
  it("client/src/pages/submit.tsx ships no banned phrases", () => {
    const offenses = scanRepoFile("client/src/pages/submit.tsx");
    expect(
      offenses,
      offenses.length
        ? `Banned public-copy phrase(s) found — rewrite or, if intentional, ` +
            `update client/src/__tests__/banned-phrases.ts:\n` +
            offenses.map(formatOffense).join("\n")
        : "",
    ).toEqual([]);
  });
});
