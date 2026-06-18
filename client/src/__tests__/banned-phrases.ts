// ──────────────────────────────────────────────────────────────────────────
// Banned public-copy phrase list (Task #247)
//
// This is the single source of truth for the negative copy guard enforced by
// `public-copy-banned-phrases.test.ts`. The test scans the Pegasus prototype
// copy sources (client/src/pegasus/*.tsx, *.ts) and FAILS if any phrase below
// appears in them.
//
// WHY THIS EXISTS
//   AI-sounding / filler copy has slipped into the live public site more than
//   once and was only caught after the founder noticed. This list turns that
//   manual hunt-and-replace into an automated build/test-time guard.
//
// THIS IS A *NEGATIVE* GUARD ONLY
//   It asserts these phrases must NOT appear. It is NOT a return to the retired
//   Empire-Doctrine positive brand-lock that required specific wording.
//
// ── HOW TO EXTEND (for a non-engineer-guided agent) ──
//   1. Add the offending phrase as a new string to the right category below.
//      Lowercase it; matching is case-insensitive and ignores curly vs.
//      straight quotes ('  '  ’ are all treated the same).
//   2. Keep phrases as the actual run of words ("vetted team"), not regexes.
//   3. Avoid banning a single common word that has a legitimate real-estate
//      meaning (e.g. "leverage", "curated", "robust") — it will cause false
//      positives. Prefer multi-word filler phrases.
//   4. Run `npx vitest run client/src/__tests__/public-copy-banned-phrases.test.ts`.
//      If it now fails on EXISTING copy, that copy must be rewritten — that is
//      the guard working as intended.
// ─────────────────────────────────────────────────────────────────────────-

export type BannedPhrase = {
  /** The run of words that must not appear (lowercase, quote-insensitive). */
  phrase: string;
  /** Short reason, surfaced in the failure message to guide the rewrite. */
  reason: string;
};

// AI-tells / generic filler the founder has flagged in editorial passes.
// These say nothing specific and read like a template with words swapped.
export const FILLER_PHRASES: BannedPhrase[] = [
  { phrase: "run the same way", reason: "AI-tell filler (slipped in pass #243/#246)" },
  { phrase: "no decoding required", reason: "AI-tell filler (slipped in pass #243/#246)" },
  { phrase: "vetted team", reason: "vague credential filler — name the actual people/role" },
  { phrase: "definition of done", reason: "borrowed jargon filler" },
  { phrase: "hand in hand", reason: "empty connective filler" },
  { phrase: "every time", reason: "filler intensifier — state the concrete standard instead" },
  { phrase: "one standard, every time", reason: "retired Empire-Doctrine filler slogan" },
  { phrase: "the same disciplined read", reason: "retired Empire-Doctrine filler slogan" },
  { phrase: "under one roof", reason: "filler — describe what is actually offered" },
  { phrase: "decades of combined experience", reason: "vague credential filler" },
  { phrase: "governed by virtue", reason: "retired Empire-Doctrine filler slogan" },
];

// "Forbidden filler phrases" from replit.md's Website Director Standard —
// empty connective tissue that says nothing.
export const WEBSITE_DIRECTOR_FILLER: BannedPhrase[] = [
  { phrase: "in today's market", reason: "forbidden filler (replit.md)" },
  { phrase: "we pride ourselves on", reason: "forbidden filler (replit.md)" },
  { phrase: "second to none", reason: "forbidden filler (replit.md)" },
  { phrase: "world-class", reason: "forbidden filler (replit.md)" },
  { phrase: "one-stop shop", reason: "forbidden filler (replit.md)" },
  { phrase: "take it to the next level", reason: "forbidden filler (replit.md)" },
  { phrase: "unlock your potential", reason: "forbidden filler (replit.md)" },
  { phrase: "seamless solutions", reason: "forbidden filler (replit.md)" },
  { phrase: "seamless", reason: "forbidden filler (replit.md)" },
  { phrase: "trusted partner", reason: "forbidden self-claim filler (replit.md)" },
  { phrase: "cutting-edge", reason: "forbidden filler (replit.md)" },
  { phrase: "we're not just a", reason: "forbidden 'we're not just a … we're a …' filler (replit.md)" },
  { phrase: "we are not just a", reason: "forbidden 'we're not just a … we're a …' filler (replit.md)" },
];

// Classic large-language-model tells — words/phrases that rarely appear in
// concrete, true human prose and signal generated marketing copy.
export const AI_TELLS: BannedPhrase[] = [
  { phrase: "delve", reason: "classic AI-tell" },
  { phrase: "tapestry", reason: "classic AI-tell" },
  { phrase: "testament to", reason: "classic AI-tell" },
  { phrase: "in the realm of", reason: "classic AI-tell" },
  { phrase: "navigate the", reason: "classic AI-tell filler" },
  { phrase: "in conclusion", reason: "classic AI-tell" },
  { phrase: "furthermore", reason: "classic AI-tell connector" },
  { phrase: "moreover", reason: "classic AI-tell connector" },
  { phrase: "it's worth noting", reason: "classic AI-tell hedge" },
  { phrase: "when it comes to", reason: "classic AI-tell filler" },
  { phrase: "plays a crucial role", reason: "classic AI-tell filler" },
  { phrase: "ever-evolving", reason: "classic AI-tell filler" },
  { phrase: "fast-paced", reason: "classic AI-tell filler" },
  { phrase: "harness the power", reason: "classic AI-tell filler" },
];

// Real-estate / securities compliance-risk phrases from replit.md's "Voice /
// copy" list. These create legal exposure regardless of how they read, so they
// must never appear in public marketing copy. (Negative-disclosure use lives on
// /capital and /terms, which are NOT part of the scanned Pegasus prototype.)
export const COMPLIANCE_RISK: BannedPhrase[] = [
  { phrase: "invest now", reason: "compliance-risk (securities)" },
  { phrase: "invest with us", reason: "compliance-risk (securities)" },
  { phrase: "investor returns", reason: "compliance-risk (securities)" },
  { phrase: "guaranteed returns", reason: "compliance-risk (securities)" },
  { phrase: "passive income", reason: "compliance-risk (securities)" },
  { phrase: "principal protected", reason: "compliance-risk (securities)" },
  { phrase: "we buy houses fast", reason: "compliance-risk (guru language)" },
  { phrase: "fiduciary", reason: "compliance-risk overclaim — Pegasus is a real estate investment company, not a brokerage; do not imply a statutory fiduciary duty to the public" },
];

// Brand guard: Peggy is an AI strategy assistant / concierge — never a "chatbot".
export const BRAND_GUARDS: BannedPhrase[] = [
  { phrase: "chatbot", reason: 'Peggy is an "AI strategy assistant / concierge", never a "chatbot"' },
];

// v4 re-skin (Website Spec LOCKED) bans. Three groups:
//   1. Real-estate compliance — "off-market" implies pre-/below-market access and
//      "below comparable value" implies a valuation/BPO; neither is permitted.
//   2. Voice — speak as the company / its departments, not as a single named
//      person ("a real person", "talk to Apollo", "Apollo personally"). Founder
//      name + DRE# live in the footer disclosure only. "Deal Architecture" was
//      renamed to "Deal Strategy" — we ban the brand PHRASE, not the bare word,
//      so the 'pegasus-architecture.png' asset reference does not false-positive.
//   3. Stat / timing claims — no unverified "$180M+" figure; the read promise is
//      "within 48 hours", never "2-day" / "2 days".
export const RESKIN_V4: BannedPhrase[] = [
  { phrase: "off-market", reason: "v4 re-skin: implies pre-/below-market access — use 'overlooked' / 'early access'" },
  { phrase: "below comparable value", reason: "v4 re-skin: implies a valuation/BPO claim — not permitted" },
  { phrase: "a real person", reason: "v4 re-skin: company/department voice — not 'a real person'" },
  { phrase: "real person", reason: "v4 re-skin: company/department voice — not 'real person'" },
  { phrase: "apollo personally", reason: "v4 re-skin: founder personification — use company/department voice" },
  { phrase: "talk to apollo", reason: "v4 re-skin: founder personification — route to Submit / the team" },
  { phrase: "deal architecture", reason: "v4 re-skin: renamed to 'Deal Strategy'" },
  { phrase: "$180m", reason: "v4 re-skin: unverified dollar claim — use defensible figures" },
  { phrase: "180m+", reason: "v4 re-skin: unverified dollar claim — use defensible figures" },
  { phrase: "2-day", reason: "v4 re-skin: read promise is 'within 48 hours', not '2-day'" },
  { phrase: "2 days", reason: "v4 re-skin: read promise is 'within 48 hours', not '2 days'" },
];

export const BANNED_PHRASES: BannedPhrase[] = [
  ...FILLER_PHRASES,
  ...WEBSITE_DIRECTOR_FILLER,
  ...AI_TELLS,
  ...COMPLIANCE_RISK,
  ...BRAND_GUARDS,
  ...RESKIN_V4,
];

/** Normalize text so matching ignores case, curly quotes, and extra spacing. */
export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, " ");
}
