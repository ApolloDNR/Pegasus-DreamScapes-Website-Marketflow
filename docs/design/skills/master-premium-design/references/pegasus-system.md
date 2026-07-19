# Pegasus Dreamscapes — codified design system

The house system for pegasusdreamscapes.com (repo:
ApolloDNR/Pegasus-DreamScapes-Website-Marketflow, spec:
docs/design/WEBSITE_BLUEPRINT_v5.1.md — v5.1 is the single source of
truth; v5.0 is retired).

## Direction, in one line

Quiet luxury, classical architecture, founder-led credibility: a
nocturne of navy and warm light, drawn and painted in code, with real
work as the only proof.

## Tokens

- Navy field: `#0D1B2A` (--hv-navy), deep `#091421` (--hv-navy2),
  lifted surfaces `#11243A` / `#142a44`.
- Copper `#C87A3A` (--hv-copper) — the confident accent, used sparingly.
- Brass `#C9A84C` (--hv-brass) — metallic detail lines, lit rims.
- Cream `#F5E6D3` (--hv-cream) — display text on navy.
- Accessible ink: `--accent-ink` = `#8a5122` on light creams
  (#f5efe4/#ebe2d2 as actually rendered), `#e3a463` on navy. These are
  empirically axe-verified — do not "brighten" small copper text on
  cream, it fails AA.
- Type: Cormorant Garamond (display serif, self-hosted via @fontsource)
  + Space Grotesk (body). Labels: letterspaced uppercase `pg-label`.
- Motion: `--ease-smooth: cubic-bezier(.16,1,.3,1)`; 180/360/640-1100ms.
- Texture: one grain overlay (`hv-grain`, ~5% overlay) on hero-class
  surfaces. One texture treatment site-wide, never a pile.

## Signature moments (one per page, already chosen)

- Home: the painted-light colonnade hero + the Opportunity Plan ring
  (§32.2). Do not add a third.
- How We Operate: the lifecycle rail (role=tab stages).
- Our Work: the before/after transformation pairs.
- Property Owners: situation → path stepper.
- Deal Partners: the composer (Pegasus brings / you keep).
- Strategy Lab: the welcome → cockpit gate.

## The painted-light technique (the house art style)

Architecture is drawn in code (SVG), then painted with light, never
outlined as wireframe (owner: "editorial cinematic, not a sketch"; the
award standard calls this heritage-reimagined + luminous dark). Recipe:
model each form with a lit-from-one-source gradient (deep navy shadow
edge → desaturated stone mid → warm lit face → dark turn-away rim);
silhouette large masses against a warm radial glow; volumetric beams as
blurred gradient polygons (feGaussianBlur ~16); a polished-floor
reflection (mirrored group, opacity .12-.16, userSpaceOnUse fade mask);
a depth wash (navy gradient) so art recedes behind text; film grain on
top. Stone palette stays desaturated (#5d4a31 → #9a7c54 → #c9ab7d), not
metallic. Everything static; light does the drama.

## Photography rules

Real-work photos (Nelson Drive) are documentary proof: no filters, no
AI, honest pairing (the carousel is the pairing bible — never guess room
identities). Watermarks cropped; house numbers retouched out everywhere
(address privacy: "Nelson Drive · El Sobrante", no street number, in
pixels or text). Atmosphere imagery (colonnade band, vision band) is
labeled as brand atmosphere / direction, never presented as inventory or
proof (§32.4). Portraits stay honest.

## Copy and compliance locks (outrank aesthetics)

- Numbers, locked framing: 3/2→4/3; Acquired $600,000 · Renovation,
  in-house $105,000 · All-in ~$705,000 · Sold $840,000; "~$95K"
  in-house edge vs ~$200K retail-GC bid; "~$135,000 above all-in cost,
  before financing, holding, and selling costs"; "Value shown is not
  net profit." NEVER "profit", never "$240K value created".
- Licensed representation strings verbatim per
  docs/launch/BROKER_REVIEW_PACKET.md; DRE #02333658 belongs to the
  founder Person (JSON-LD: never on the Organization).
- Peggy is always disclosed as an AI intake assistant.
- Banned-phrase net lives in client/src/__tests__/banned-phrases.ts
  ("seamless", "trusted partner", "off-market", "delve", "every time",
  etc.) — write copy to survive it.
- Capital surfaces: "private relationship conversations only" — no
  return targets, no invest-now (§21).

## Governance and verification

- Governance tests (vitest) pin structure and copy: homepage-prd-v1,
  lane-pages-prd-v1, redirects-v3, cta-labels/routing, route-map,
  standalone-no-blank-shell. Re-peg them ONLY as a governed change with
  blueprint citations. Baseline: 772 passing; 3 files import-fail
  without env keys (accepted).
- Build for verification: `npx vite build --outDir dist-hero
  --emptyOutDir` (outDir resolves under client/ — never prefix with
  client/).
- Push pipeline: /tmp/push_v51.py (Git Data API, base64 blobs,
  tree-guard); after every push `git fetch origin main && git reset
  --hard origin/main`. One driver at a time (this session OR the
  owner's local Claude Code, never both).
- Playwright: /root/node_modules/playwright-core +
  /opt/pw-browsers/chromium; dark mode via
  localStorage.setItem('pegasus-ui-theme','dark') before load;
  fullPage stitches blank lazy images (artifact — verify via
  naturalWidth probe or element shots).

## Owner's taste, observed

Warm golden light over cold minimalism; drawn/coded art over stock;
"quiet luxury, sophisticated scream"; hates choppy/low-res anything;
hates SaaS-template energy and sketch/wireframe energy; loves seeing
verified proof (retina screenshots) with each change; "keep going" means
continue autonomously in the verified rhythm.
