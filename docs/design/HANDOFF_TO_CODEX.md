# ELEVATION PLAN — Handoff to Codex

Owner: Paolo "Apollo" Duran. Prepared by Claude Code after a full-site audit
(homepage, Strategy Lab, MarketFlow, About, mobile + desktop, dark theme),
2026-07-28, at commit `fb4497b` on `claude/masterpiece-hero-v51`.

The site is strong. This plan is how it becomes undeniable. Execute the
workstreams **in order** — each is self-contained, each ends with the same
verification loop, and each must leave the suite green before the next begins.

## How to work

1. One workstream per session. Read this file, do the workstream, verify, commit, push.
2. Never ask the owner to choose between options mid-workstream — make the
   call this document makes, or the call the existing system implies.
3. **Verification loop (required after every workstream):**
   - `npx tsc --noEmit` → clean
   - `npx vitest run` → **942 tests pass** (or more; never fewer)
   - `npm run build` → clean
   - Playwright screenshots at 1440×900 @2x and 390×844 @2x, **both themes**,
     of every page you touched (chromium at `/opt/pw-browsers/chromium`,
     args `--no-sandbox --disable-dev-shm-usage`). LOOK at every capture.
   - axe sweep on touched routes → zero violations
     (`.claude/skills/master-premium-design/scripts/axe-sweep.js`, run as `.cjs`).
4. Commit messages: `feat|fix|polish: <what> (elevation plan WS<n>)`.

## The locks — never break these

- Headline string `Complex real estate, made executable.` and the locked
  homepage copy, CTAs, and `data-hv` movement order (tests enforce).
- Compliance: not a brokerage; representation only via Paolo "Apollo" Duran
  through Keller Williams East Bay, CA DRE #02333658; "no guaranteed returns"
  only ever negated; never "profit" for Nelson numbers ("not net profit" stays);
  banned-phrase list in `client/src/__tests__/banned-phrases.ts` (test enforces).
- Peggy is an AI assistant, always disclosed; never "chatbot".
- No house numbers anywhere. Nelson Drive imagery is real — never replace with AI.
- AI/architectural imagery is always captioned as vision, never as inventory
  (keep the "Architectural vision · Not property inventory" pattern).
- Fonts stay: Cormorant Garamond display + current body stack. Palette stays:
  navy `#0D1B2A/#091421`, copper `#C87A3A`, brass `#C9A84C`, cream `#F5E6D3`.

---

## WS1 — Imagery unification: one photographic standard

**Problem.** The arrival hero is now a documentary-real photograph (approved).
The mid-page bands still use glossy AI renders
(`/images/hall/pegasus-planning-loggia.webp`, `pegasus-operating-loggia.webp`)
that read as "AI slop" next to it. The owner explicitly rejects that gloss.

**Move.** Regenerate every non-Nelson image on the public site to the approved
photographic recipe, via Higgsfield MCP (`generate_image`, model
`nano_banana_pro`, 2k, 16:9 or 21:9 for bands):

> Authentic documentary-style photograph, shot on a full-frame camera with a
> 35mm lens, [SUBJECT], realistic muted dusk colors, deep blue-hour sky with a
> soft amber horizon band, natural atmospheric haze, realistic photographic
> grain, true-to-life exposure, national-geographic realism, NOT stylized,
> NOT fantasy, no oversaturation. No people, no text, no watermark.

Subjects to produce (one band each): a limestone planning loggia overlooking
the Bay; a working-site loggia; any About/section band that carries a render
today. Corinthian/classical detail belongs in frame but as *architecture in a
real photograph*, never as a rendered showpiece.

CDN egress is blocked from the sandbox: fetch results through the CI relay
(`.github/workflows/vendor-pillar-renders.yml` — update the `declare -A M`
filename map + target branch, push a change to `.github/relay-fire.txt`,
pull the `ci/*` branch it pushes). Approved alternates already vendored:
`client/public/images/hero/bay-photo-alt{1,3,4}.webp`.

**Scrim rule (the "cut-off" fix, owner-approved):** any text over imagery gets
at most a whisper veil — e.g.
`linear-gradient(90deg, rgba(4,17,27,.62) 0, rgba(4,17,27,.4) 30%, rgba(4,17,27,.16) 52%, transparent 72%)`
— never an opaque panel; the photograph must read edge to edge.

**Done when:** no glossy render remains on any public page; every image band
survives a squint test as "photograph", captioned as architectural vision.

## WS2 — Homepage rhythm: give the scroll day and night

**Problem.** The homepage is now one long unbroken navy field from hero to
footer. MarketFlow already alternates dark hero → warm limestone → dark, and
it reads twice as premium because the dark moments *land*.

**Move.** Re-seat two homepage movements on the warm limestone/cream ground
already tokenized in the v6 system (see `.hv-router { background:var(--hv-v6-limestone) }`
usage on other pages): the **Visitor Router** ("What are you bringing to
Pegasus?") and the **Partner Proposition** become light movements; Arrival,
Proof, Method/Departments, Strategy teaser, Founder, Final stay dark. Type
flips to the ink tokens on light ground (the lane pages show the pattern).
Check AA contrast on every flipped element.

**Done when:** scrolling the homepage alternates dark → light → dark with
intent; screenshots in both themes look deliberate; axe stays clean.

## WS3 — Craft pass: the details a jury notices in 5 seconds

1. **Nav wrap at 1440px:** the logo subtitle wraps ("DEVELOPMENT · INVESTMENTS ·"
   / "SYSTEMS") and the `BRING AN OPPORTUNITY` button wraps to two lines.
   Fix: `white-space:nowrap` on both, tighten nav item tracking/padding until
   one clean line holds at ≥1280px; collapse earlier into the `MORE` menu if needed.
2. **Statbar is missing its fourth fact.** The owner's reference comp has four.
   Restore `East Bay — Contra Costa & Alameda County.` between Nelson Drive and
   Strategy first (keep the existing gold line-icon set; wreath icon exists in
   git history of `home-v51.tsx`, `StatIcon` name `wreath`).
3. **Peggy pill overlap (mobile):** the floating `TALK TO PEGGY` pill sits on
   top of statbar text at 390px. Give it a safe-area offset (raise `bottom`,
   or add scroll-aware hide) so it never covers content or the footer.
4. **Hairline discipline:** one rule weight (1px, brass at ~.16 alpha) for all
   dividers; kill any 2px or mixed-alpha strays.
5. Sweep every CTA for the locked label style (no bare "Submit"/"Learn more").

**Done when:** 1280/1440/1680 desktop and 390 mobile screenshots show zero
wraps, zero overlaps; the nav holds one line everywhere.

## WS4 — Performance: the hero must be instant

**Problem.** The arrival photo ships as one 670KB webp to every device, with
no preload, no srcset, no dimensions (v52 removed the preload).

**Move.**
1. Generate `pegasus-v6-arrival-m.webp` (~1080w, q80) alongside the 2752w file;
   wire `srcSet` + `sizes="(max-width:900px) 100vw, 100vw"` on the hero `<img>`,
   add `width`/`height` attributes (CLS guard).
2. Restore `<link rel="preload" as="image" href="/images/hero/pegasus-v6-arrival.webp" fetchpriority="high" />`
   in `client/index.html` (imagesrcset-aware if you add srcset).
3. Same treatment for every WS1 band image (`loading="lazy"` below the fold).
4. Run `perf-probe.js` (as `.cjs`): budgets LCP < 1.5s, CLS < 0.05 on the
   production build. Record numbers in the commit message.

**Done when:** budgets met on `/`, `/strategy-lab`, `/marketflow`.

## WS5 — Light theme: finish it or gate it

**Problem.** The nav exposes a light/dark toggle, but the v6 layer styles
`:root.light` in only 4 places across ~3,800 CSS lines — light mode is
unfinished and almost certainly broken somewhere.

**Move.** Screenshot every public route in light theme. Either (a) finish it —
map the v6 surfaces to the light tokens the lane pages already use, keeping
imagery bands dark (they're photographs; only the UI ground flips), or
(b) if the owner's site is meant to be dark-first, make light mode a
*deliberate* warm-limestone rendition, not an accident. Every fix verified in
both themes. Do not remove the toggle.

**Done when:** a full theme sweep (see `theme-sweep.js`) shows every route
intentional in both themes; axe clean in both.

## WS6 — Motion: one choreography, everywhere

Audit against this doctrine (already partially in place):
- ONE orchestrated entrance on the homepage hero (eyebrow → h1 → lead → CTAs →
  statbar, 60–160ms stagger, `--ease-smooth`, transform/opacity only).
- Scroll reveals: the single existing `.reveal` IntersectionObserver system —
  no second system, no per-section reinventions.
- Interactive cards (router rows, department grid, Strategy Lab steps):
  a consistent hover grammar — 2px lift + brass underline/border bloom, 180ms.
- Everything guarded by `prefers-reduced-motion` (6 guards exist; extend to
  anything new).

**Done when:** no unanimated dead sections, no double-animation, 60fps scroll
on a 4× CPU-throttled Playwright run of the homepage.

## WS7 — Trust & conversion finish

1. **OG card:** replace `/og/default.png` with a branded card — the approved
   Bay photograph, wordmark, "Complex real estate, made executable." (1200×630).
2. **The Pegasus Standard** footer link must land on a real, finished page
   (it exists in the footer map — verify it renders and reads finished).
3. **Intake friction pass:** `/bring-an-opportunity` — confirm the form is
   ≤2 screens on mobile, labels always visible, error states written in the
   house voice, success state tells the sender exactly what happens next and
   repeats the 48-hour read promise.
4. **Founder block:** ensure the About/founder portrait section carries the
   full licensed-representation line verbatim (test-locked string).

**Done when:** a cold visitor can go from any page to a submitted opportunity
in under a minute on a phone, and every trust string is in place.

## WS8 (last, optional) — Code architecture hygiene

Only after WS1–7 are green:
- Split `home-v51.tsx` (500+ lines) into `home/` section components with an
  index that preserves the exact render order (tests must stay green untouched).
- `_group.css` is ~3,800 lines with layered v5/v6 overrides; consolidate dead
  v5 blocks (the old `.hv-hero-art`, retired temple CSS) after grepping usage.
- Delete retired one-shot CI workflows (`hero-candidates-v*.yml`,
  `hero-editorial.yml`) and stale `docs/design/hero-candidates-v*` payloads
  (repo hygiene; keep `vendor-pillar-renders.yml` — it is the active relay).

**Done when:** suite green with zero test edits; repo lighter; no visual diff.

---

## Definition of done, globally

Every workstream: tsc clean · 942+ tests green · build clean · both-theme
screenshots reviewed · axe clean · pushed. If a workstream would break a lock,
stop and leave a note in `docs/design/ELEVATION_LOG.md` instead of forcing it.
Keep a running `ELEVATION_LOG.md` entry (date, WS, what shipped, evidence) —
that file is the owner's audit trail.
