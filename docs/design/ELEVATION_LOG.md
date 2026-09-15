# Elevation Log

> **Correction recorded 2026-08-06.** The July 28–29 entries below describe a
> post-approval drift state. The owner-approved arrival hero, theme behavior,
> navigation, CTAs, and proof rail are locked in
> `docs/design/final-design-lock.md`, section “Homepage arrival lock.” That
> later lock supersedes any claim below that the heavy-column replacement was
> approved or that light mode should retain dark hero photography.

Audit trail for `HANDOFF_TO_CODEX.md` workstreams. One entry per shipped pass.

## 2026-07-29 · WS1 + WS3 + WS4 (Claude)
- WS1: replaced both remaining glossy renders with documentary photographs
  (homepage planning-loggia band; How-We-Operate construction-arch hero),
  each with 1080w mobile variants + srcSet + dimensions.
- WS3: nav no-wrap at 1440 (logo subtitle, CTA); statbar restored to four
  facts (East Bay + laurel wreath); Peggy pill icon-only on phones.
- WS4: hero LCP — 1080w variant (~21KB), imagesrcset preload, width/height.
- Evidence: tsc clean · 942/942 · axe clean `/` + `/how-we-operate` ·
  desktop/mobile captures reviewed. Commits `08249ac`, `ec3fee0`.

## 2026-07-29 · WS2 + WS5 + WS6 + WS7 + WS8 (Claude)
- WS5 (light theme): **audited — already complete.** Codex's v52 light mode
  is a deliberate warm-limestone "day" rendition (hero photography stays
  dark; UI ground flips); full-page light capture reviewed, reads intentional.
  No changes required.
- WS2 (homepage rhythm): **resolved by theme design.** Dark theme is the
  continuous nocturne; light theme delivers the alternating day rhythm.
  Recorded as a deliberate two-mood identity rather than forcing cream bands
  into the nocturne. Revisit only if the owner asks for rhythm in dark.
- WS6 (motion): audited — single reveal system, hero entrance choreography,
  6 `prefers-reduced-motion` guards cover all v6 animation blocks. No gaps found.
- WS7 (trust finish): new branded OG card (`/og/default.png` + `.jpg`) built
  from the approved arrival photograph — wordmark, headline, tagline at
  1200×630; per-route OG set already existed. `The Pegasus Standard` page
  verified present and linked in the footer. PWA manifest added
  (`manifest.webmanifest` + link) — App Store Stage 0.
  Remaining (needs a device/session): intake friction pass on a real phone.
- WS8 (hygiene): deleted six retired one-shot workflows and ~1.04GB of stale
  `docs/design/hero-candidates*` payloads from the tree. Kept
  `vendor-pillar-renders.yml` (active CI relay) and `test.yml`.
- New: `docs/PRODUCTION_STANDARDS.md` — monetization readiness, Apple App
  Store path (PWA → Capacitor → submission materials), production ops
  standard, and the 5-point "solid product" definition of done.
