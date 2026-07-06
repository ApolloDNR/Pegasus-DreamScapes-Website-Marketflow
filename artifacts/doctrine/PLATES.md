# Doctrine v6 — Plate Manifest

The five Higgsfield plates wired into `index.html`. All are **atmosphere-only** per the
locked media policy: generated imagery may set mood (marble, light, architecture, landscape);
it may never depict a property, a person, or anything a seller could mistake for Pegasus work.
Case evidence (Nelson Dr, etc.) uses real licensed photography only.

Every slot in `index.html` paints a hand-drawn SVG fallback beneath its plate, so the page
degrades cleanly if an image is ever unreachable. Plates are graded in CSS
(`saturate(.74) contrast(1.07) brightness(.9)` + midnight tint + global grain) — do not
bake grading into replacement renders.

| Plate | Role in page | Job ID | Model | Size |
|---|---|---|---|---|
| PL. I — The Lit Doorway | Two Paths · For Owners | `f9edcb0b-5118-4096-b256-3161c0f1b0c2` | nano_banana_flash | 896×1200 |
| PL. II — The Inner Chamber | Two Paths · For Capital | `4a1df506-682f-4d45-bb06-1ec6a3fab073` | nano_banana_flash | 896×1200 |
| PL. III — The Passage, Lit | "The door is open." chapter | `e13964d0-cbce-4152-90ec-a0e232af646d` (2K upscale of `c7898eff-8298-4c3b-819e-387ca0ad1deb`) | bytedance_image_upscale | 3856×2160 |
| PL. IV — The East Bay, at Night | Operator background | `04b667fd-09a2-44fc-bffc-3b0121041527` | nano_banana_2 | 2752×1536 |
| PL. V — The Carved Record | Ledger slab surface | `064bcda5-bc72-4f74-a86a-d5a1a9ecaf85` | nano_banana_2 | 2752×1536 |

## Files

All assets are vendored in `plates/` by the `fetch-doctrine-plates` workflow
(GitHub runners fetch the CDN; this session's container cannot). The page
references the local files — no generation-CDN dependency remains at runtime.

- `plates/hero-temple.webp` — PL. 0, hero base (job `670bdc4c-b2f3-4c06-9dbd-63c1db909763`, 2752×1536)
- `plates/passage-walk.mp4` — Seedance 2.0 ambient walk, chapter band (job `f1c73b33-552b-4618-a6f9-86141d3ae04f`, 8s 720p, plays muted/looped, image fallback)

## Source URLs

CDN base: `https://d8j0ntlcm91z4.cloudfront.net/user_3EqMQTGQ3AQXoXTWf2covcEGyhp/`

- PL. I  — `hf_20260706_045434_f9edcb0b-5118-4096-b256-3161c0f1b0c2.png` (`_min.webp` in page)
- PL. II — `hf_20260706_045438_4a1df506-682f-4d45-bb06-1ec6a3fab073.png` (`_min.webp` in page)
- PL. III — `hf_20260706_045424_e13964d0-cbce-4152-90ec-a0e232af646d.png` (`_min.webp` in page)
- PL. IV — `hf_20260706_040841_04b667fd-09a2-44fc-bffc-3b0121041527.png` (`_min.webp` in page)
- PL. V — `hf_20260706_040849_064bcda5-bc72-4f74-a86a-d5a1a9ecaf85.png` (`_min.webp` in page)

## Integration note

Before production launch, download the raw PNGs, convert to self-hosted WebP/AVIF
(~1600w for full-bleed, ~900w for panels), and swap the CDN URLs for local paths —
do not ship a marketing site pointing at a generation CDN. The build container's
egress policy blocked `d8j0ntlcm91z4.cloudfront.net`, which is why the files are
referenced by URL here rather than committed.

## Standing placeholders in index.html (dashed underlines)

- Ledger figures — swap for actuals from closing statements (Nelson Dr, assignment).
- DRE entity name + KW corporate license number — pending Phil.
- KW lane copy/placement — pending Phil sign-off per Lock 19.
- Intake form is front-end gated (nothing transmitted) until the RLS hotfix clears.
