# Doctrine Plates — Asset Manifest

**v17 (business build, current):** the operating site uses only grounded
imagery — the East Bay aerial pair (hero + founder), the carved-stone pair,
and real Nelson Drive photography (lane cards, sample listing-site mockup).
Concept renders appear ONLY in the labeled "Long Game" section. The Passage
runs on the drawn colonnade, no footage. All cinematic/sunset plates below
remain vendored for the preserved vision build (`vision/dreamscapes-v16`).


The brand world: realistic classical-estate photography carries the operating
sections; marble concept renders live only in the labeled Dreamscapes Vision
chapter. Paired plates exist as **day** and **night** versions of the same
architecture (each night plate generated with its day plate as reference).
Case evidence (Nelson Drive) is real photography, never generated. All
generated plates 2K (2752×1536).

## Paired plates (`plates/`)

| Pair | Day job | Night job | Used in |
|---|---|---|---|
| The Boulevard at Sunset (classical villas, rotunda) | `56060a6a` | `96a9fd67` | Hero (v14) |
| The Estate at Golden Hour (`estate-sunset`, single) | `313b963b` | — | Signature Gallery + social card |
| The Sunset Gate (`gate-sunset`, single) | `b3970b92` | — | Studio mock gallery |
| The Estate Street (villa street, retired from hero) | `865e834f` | `ad33bd4d` | — held in `plates/` |
| The Loggia (colonnade over the fountain garden) | `19646bf7` | `02173e09` | Lane card 01 · Studio mockups · Villa Aurelia · Private Commons · Door chapter |
| The Columns (Corinthian macro detail) | `eed249dd` | `6d791a90` | Pegasus Standard strip |
| The Carved Record (stone) | `c1534da8` | `064bcda5` | Lane card 03 · Nelson ledger slab |
| The East Bay (aerial) | `68efe569` | `04b667fd` | Operator |

## The Passage footage (scroll-scrubbed)

Two Seedance 2.0 dollies along the loggia colonnade of the sunset world,
upscaled to 2K before extraction (frames at 1600px, 6 fps, 48/set):

- Day walk `d2b12cdc` → 2K master → `plates/walk2-day/`
- Night walk `4b37f230` → 2K master → `plates/walk2-night/`
- `plates/colonnade-walk.mp4` = night loggia walk 720p (ambient door-chapter video)
- Hero ambient dolly (v15): Seedance `b1a6cc62` → 2K upscale `271a05e3` →
  CI-transcoded `plates/hero-loop.mp4` (1920px h264, light-theme hero only)

## Dreamscapes vision renders (`vision/`) — always labeled conceptual

Scenario (GPT Image 2, 2752×1536, quality high):

- `vision/aerial.webp` — `asset_kse575VzmxsRcRTMpgTPwrur` (the hills, golden hour)
- `vision/gate.webp` — `asset_2a3t5WdJm32LLssrPakVkuvA` (the gated arrival)
- `vision/boulevard.webp` — `asset_Eh1bnHxYNqnGALraJXKehs3j` (the boulevard, dusk)

Higgsfield element tiles: `estates` `lanes` `forum` `academy` `water` `infra`.

## Real photography (`nelson/`)

`slide-01..18.webp` — Nelson Drive case file, 900×1125, from the founder's
carousel. Drives both the pinned scroll tour and the swipe strip.

All fetching/extraction: `.github/workflows/fetch-doctrine-plates.yml` on push.
Higgsfield CDN base: `https://d8j0ntlcm91z4.cloudfront.net/user_3EqMQTGQ3AQXoXTWf2covcEGyhp/`

## Standing placeholders (v13 compliance footer)

- Keller Williams [Market Center Name] · License #: [License Number] ·
  Office: [Office Phone] — replace with exact details before publishing;
  broker/compliance review of representation language before running ads.
- Intake form front-end gated (nothing transmitted) until the RLS hotfix clears.
- Nelson Drive figures are real, from the closing statement and project records, rounded.
- Villa Aurelia is a fictional sample marketing campaign, labeled on-site.
