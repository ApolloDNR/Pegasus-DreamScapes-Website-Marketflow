# Decision Log — owner decisions and their reasons

The "why" behind the build, distilled from the working sessions so no
future driver (human or Claude) re-litigates settled questions. Newest
last. Anything here outranks aesthetic or technical preference; change
only with Apollo's explicit say-so.

## Governance

- **v5.1 is the only spec.** Apollo: "Use v5.1 as the source of truth.
  Retire v5.0 as superseded." Do not redesign the company while
  building the website.
- **One driver at a time.** Cloud session and local Claude Code never
  edit the repo simultaneously. Driver as of 2026-07-19: Claude Code
  (see HANDOFF_TO_CLAUDE_CODE.md).
- **Path B chosen:** build fully to spec, then launch once (single
  deploy gate needing Apollo's ~30-45 min of clicks), rather than
  launching early and iterating in public.

## Numbers and claims (legal-sensitive)

- Retired: the standalone "$240K value created" headline (Apollo asked
  for advice, accepted this framing). Lead with the 3/2→4/3
  transformation and the ~$95K in-house edge vs a ~$200K retail-GC bid.
- Locked stack: Acquired $600,000 · Renovation, in-house $105,000 ·
  All-in ~$705,000 · Sold $840,000 · "~$135,000 above all-in cost,
  before financing, holding, and selling costs." NEVER the word
  "profit". Micro-disclosure: "Value shown is not net profit."
- Legacy /projects/nelson-dr aligned to $105K (was $100K).

## Privacy

- Address shown as "Nelson Drive · El Sobrante" — no street number,
  in text OR pixels. All shipped photos scrubbed (facade plaque, curb
  paint, legacy exterior set). If new photos arrive, scrub before
  commit; the technique notes live in the master skill.

## Imagery

- bridgeMLS watermark strips cropped off all listing photos (Apollo:
  "just crop that little top section off").
- Real-work photos are documentary proof — no filters, no AI, and the
  carousel is the pairing bible for before/after room identity (Apollo
  corrected a wrong bath pairing once; never guess rooms again).
- AI/generated imagery is allowed ONLY as labeled brand atmosphere,
  never as proof or inventory (§32.4).

## The hero (taste history — read before touching it)

1. Colonnade hallway photo rejected AS HERO ("that's more for the
   middle of the site") — it became the mid-page atmosphere band.
2. Drawn colonnade on navy chosen ("A, but with some touch of B" =
   warm golden light + copper rule).
3. Line-art version later rejected: "too SaaS… looks like a sketch."
   Repainted with light (filled forms, chiaroscuro) — better, but:
4. Code-rendered art rejected as "too cheap, fake." Owner authorized
   Higgsfield/Scenario for real painterly assets: "editorial, cinematic,
   illustrative… a masterpiece." Four candidates generated; selection
   and composite spec in HANDOFF_TO_CLAUDE_CODE.md. This is the open
   design thread.

Pattern to honor: warm golden light over cold minimalism; painterly
over photoreal-AI; bespoke over stock; nothing choppy or low-res;
proof-of-work screenshots with every change.

## Copy and compliance

- Broker packet strings are verbatim-locked pending KW East Bay
  sign-off; DRE #02333658 attaches to the founder Person only (never
  the Organization) in structured data.
- Peggy is always disclosed as an AI intake assistant; her greeting and
  hard-refusal categories are published on /disclosures.
- Banned-phrase net is enforced by test; write copy to survive it.
- Capital surfaces stay "private relationship conversations only" — no
  return targets, no LP units, no invest-now (§21, securities counsel
  gate).

## Design system decisions

- WCAG AA copper ink is empirically tuned (--accent-ink #8a5122 light /
  #e3a463 dark against the real rendered creams); do not brighten
  small copper text.
- One orchestrated motion sequence per page (hero entrance); scroll
  reveals stay on the single IntersectionObserver system; everything
  transform/opacity with reduced-motion collapse.
- Award standard adopted (jury weights, perf budgets LCP<1.5s
  CLS<0.05) via the master-premium-design project skill — run its loop
  for every visual change.

## Assets preserved in-repo

- docs/assets-source/nelson-clean/ — full-res watermark-cropped,
  number-scrubbed photo masters (source for any future page or
  marketing cut). docs/assets-source/founder/ — portrait masters.
- Shipped web-sized derivatives live in client/public/images/.

## Parked (do not delete, do not work unprompted)

WoofWatcher hosting + native builds · Highest-Self-OS · Wix duplicate
sites cleanup · Strategy Lab 2.0 taxonomy (§15, may trail launch) ·
MarketFlow stays out of primary nav (§18, "controlled pilot" framing).
