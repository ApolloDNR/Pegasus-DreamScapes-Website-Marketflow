# Handoff: Cowork (cloud) → Claude Code (Apollo's Mac)

Written 2026-07-19 by the Cowork session that built the v5.1 site.
Purpose: transfer the driver's seat with zero loss. Everything below is
in this repo; nothing lives only in the old chat.

## One-driver rule (owner decision, still in force)

One driver at a time. As of the commit that carries this file, **Claude
Code is the driver**. The Cowork cloud session stands down from repo
writes. If work ever moves back, `git pull` first and announce the swap.

## Where everything lives

- **Spec / source of truth:** `docs/design/WEBSITE_BLUEPRINT_v5.1.md`
  (v5.0 is retired; do not resurrect it).
- **The master design skill:** `.claude/skills/master-premium-design/`
  — Claude Code auto-loads this as a project skill. Read `SKILL.md`
  before ANY visual change; it carries the award rubric, the house
  system (`references/pegasus-system.md`), the researched jury standard
  (`references/award-standard.md`), and runnable verification scripts.
  A mirror copy sits at `docs/design/skills/` for humans.
- **Launch papers:** `docs/launch/BROKER_REVIEW_PACKET.md` (broker
  sign-off, every licensed-rep string verbatim),
  `docs/launch/USER_TEST_SCRIPT.md` (§32.16 sessions),
  `docs/deploy/RENDER_DEPLOY.md` (the ~30-45 min go-live runbook,
  Step 5 smoke test already rewritten for the v5.1 URLs).
- **Copy decks:** `docs/design/copy-deck/` (homepage + Our Work,
  approved wording with locked facts).

## State at handoff (all verified)

- v5.1 spine is BUILT and pushed: `/` (HomePageV51),
  `/how-we-operate`, `/property-owners`, `/deal-partners`, `/our-work`,
  `/about`, `/bring-an-opportunity` intake (§14 choices mapped onto the
  existing backend enum), Strategy Lab welcome gate, legacy redirects
  mirrored client+server.
- Tests: 772 passing; 3 files fail at IMPORT without env keys
  (`DATABASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`) — accepted
  baseline, not a regression signal.
- WCAG 2.2 AA: 12/12 routes axe-clean (script in the skill).
  `--accent-ink` values are empirically tuned — see the skill before
  "brightening" any copper text.
- Perf on the production build: LCP 556ms, CLS 0.0022 (budgets 1500/0.05).
- Dark mode fully verified; hero entrance choreography shipped
  (reduced-motion safe); privacy scrub done: NO house number in any
  shipped photo (curb.webp, nelson-exterior set, nelson-hero,
  nelson-before-driveway all retouched).
- Build gotcha: verification builds use
  `npx vite build --outDir dist-hero` — outDir resolves under
  `client/`; never write `--outDir client/dist-hero` (it nests).

## THE open design thread: the masterpiece hero

Owner direction (verbatim intent): editorial, cinematic, illustrative,
"a masterpiece" — the code-drawn hero is not enough; use generated
painterly art. Four finished candidates already exist on Higgsfield
(Apollo's account). The cloud sandbox could not download them (CDN not
in its egress allowlist) — **Claude Code on the Mac can `curl -L` them
directly**:

1. 21:9 Nano Banana Pro (A):
   https://d8j0ntlcm91z4.cloudfront.net/user_3EqMQTGQ3AQXoXTWf2covcEGyhp/hf_20260719_183123_1b1b8349-9589-46b2-b1ae-8c42ae6ca122.png
2. 21:9 Nano Banana Pro (B):
   https://d8j0ntlcm91z4.cloudfront.net/user_3EqMQTGQ3AQXoXTWf2covcEGyhp/hf_20260719_183123_1a537371-30af-4d15-8c92-ce0c0855fc60.png
3. 16:9 Recraft, brand-hex palette (A):
   https://d8j0ntlcm91z4.cloudfront.net/user_3EqMQTGQ3AQXoXTWf2covcEGyhp/hf_20260719_183110_a91daf34-911b-47ca-a101-5a10007f52a7.png
4. 16:9 Recraft, brand-hex palette (B):
   https://d8j0ntlcm91z4.cloudfront.net/user_3EqMQTGQ3AQXoXTWf2covcEGyhp/hf_20260719_183110_6f0437cd-b2ff-497f-9590-dd892abee248.png

Prompt used (for regeneration if Apollo wants variants) is embedded in
each URL's Higgsfield job; the art direction is codified in
`references/pegasus-system.md` ("painted-light technique" + palette).

### Exact implementation spec (paste-ready)

1. **Grade the chosen PNG** (Apollo picks; default to the strongest
   21:9 if he says "you choose"):
   `python3 .claude/skills/master-premium-design/scripts/grade-hero.py <file>`
   → writes `client/public/images/hero/nocturne.webp` (2000w) and
   `nocturne-m.webp` (1080w), seats shadows toward brand navy, checks
   the left-third is dark enough for the headline (mean luma < 60 — if
   it fails, strengthen the wash below or re-crop).

2. **Wire the art into the hero** (`client/src/pegasus/home-v51.tsx`):
   inside `<section className="hv-hero hv-grain" data-hv="arrival">`,
   REPLACE `<ColonnadeArt className="hv-colonnade" />` with:

   ```jsx
   <div className="hv-hero-art-wrap" aria-hidden="true">
     <img className="hv-hero-art" src={`${import.meta.env.BASE_URL}images/hero/nocturne.webp`}
       srcSet={`${import.meta.env.BASE_URL}images/hero/nocturne-m.webp 1080w, ${import.meta.env.BASE_URL}images/hero/nocturne.webp 2000w`}
       sizes="(max-width: 900px) 100vw, 72vw"
       alt="" fetchpriority="high" decoding="async" />
     <div className="hv-hero-art-wash" />
   </div>
   ```

   Keep `ColonnadeArt` exported (it becomes the reduced-bandwidth /
   error fallback and is used nowhere else once swapped — safe to keep
   for history).

3. **CSS** (append near the hero block in
   `client/src/pegasus/_group.css`):

   ```css
   .hv-hero-art-wrap { position:absolute; inset:0; z-index:1; overflow:hidden; }
   .hv-hero-art { position:absolute; right:0; top:0; height:100%; width:72%;
     object-fit:cover; object-position:center right; }
   .hv-hero-art-wash { position:absolute; inset:0;
     background: linear-gradient(90deg, var(--hv-navy2) 0%, rgba(9,20,33,.86) 26%,
       rgba(9,20,33,.4) 46%, rgba(9,20,33,0) 64%),
       linear-gradient(0deg, rgba(9,20,33,.55) 0%, rgba(9,20,33,0) 22%); }
   @media (max-width: 900px) {
     .hv-hero-art { width:100%; object-position: 62% center; }
     .hv-hero-art-wash { background:
       linear-gradient(90deg, rgba(9,20,33,.92) 0%, rgba(9,20,33,.55) 40%, rgba(9,20,33,.28) 100%),
       linear-gradient(0deg, rgba(9,20,33,.6) 0%, rgba(9,20,33,0) 26%); }
   }
   ```

   Retarget the entrance bloom: change the `.hv-hero .hv-colonnade`
   animation rule to `.hv-hero .hv-hero-art-wrap` (same keyframes; set
   `hv-bloom-in`'s `to` opacity to 1). Keep grain + `::after` vignette.

4. **Preload** (`client/index.html`, in `<head>`):
   `<link rel="preload" as="image" href="/images/hero/nocturne.webp" fetchpriority="high" />`

5. **Verify like a jury** (all from repo root):
   - `npx tsc --noEmit` && `npx vitest run` (expect 772 / 3 env-fails)
   - `npx vite build --outDir dist-hero --emptyOutDir`
   - `node .claude/skills/master-premium-design/scripts/verify.js client/dist-hero / /our-work /about`
   - `node .claude/skills/master-premium-design/scripts/axe-sweep.js client/dist-hero`
   - `node .claude/skills/master-premium-design/scripts/perf-probe.js client/dist-hero /`
     (hero image is now LCP: budget still <1500ms — the preload plus
     webp sizes are what keep this true; check it, don't assume)
   - LOOK at the captures. Headline must sit on near-black; art must
     read painterly, not stock. Then commit, push (native git), and
     send Apollo the retina screenshots.

### §32.4 guardrail

The painting is brand atmosphere. It must never be captioned or
presented as Pegasus's own property, project, or proof. Real-work
surfaces (Nelson Drive photos) stay documentary and unfiltered.

## Owner locks (outrank everything — full list in the skill)

Numbers framing (never "profit"; the locked $600K/$105K/~$705K/$840K/
~$95K/~$135K stack) · address privacy (no house number, text OR pixels)
· compliance strings verbatim (broker packet) · banned-phrase test ·
DRE on founder Person only in JSON-LD · Peggy always disclosed as AI ·
Capital = private conversations only.

## Outstanding launch gates (Apollo's clicks + reviews)

Render deploy (runbook Step 0-5), KW East Bay broker sign-off (packet
ready), legal glance at Nelson numbers, 2-3 user-test participants
(script ready), full-res construction photos for "down to the studs".

## What the cloud session had that you don't need

Its GitHub push went through an API script because the sandbox blocked
`git push` — you have native git; ignore any mention of
`pages_upload.py`. Its Playwright chromium lives at
`/opt/pw-browsers/chromium`; on the Mac, point the skill scripts'
`executablePath` (and `playwright-core` require path) at a local
install, or just run `npx playwright install chromium` once and edit
the two constants at the top of each script.
