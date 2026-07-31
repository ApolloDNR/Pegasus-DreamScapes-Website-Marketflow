# Pegasus DreamScapes — Engineering Handoff

Prepared 2026-07-12 for continuation by Codex / ChatGPT (or any engineer).
Owner: Apollo Duran (apollosynd@gmail.com). GitHub org: `ApolloDNR`.

This document is the single source of truth for where the three projects
stand and exactly what to do next. Read it top to bottom before touching
anything.

---

## 0. TL;DR — where everything stands

| Project | Repo | State | Next action |
|---|---|---|---|
| **Pegasus website** | `ApolloDNR/Pegasus-DreamScapes-Website-Marketflow` | main is green, code-complete, deploy kit merged | **Deploy to Render + connect domain** (§3) |
| **WoofWatcher** | `ApolloDNR/WoofWatcher` | main is green (real app promoted) | App-store QA; host the landing page (§5) |
| **Highest-Self-OS** | `ApolloDNR/Highest-Self-OS` | main is green | Finish the core loop per its own roadmap (§5) |
| **Previews (temp)** | `ApolloDNR/apollodnr.github.io` | live static previews | Reference only; not production (§6) |

The **#1 priority** is getting `pegasusdreamscapes.com` live. The site is
already a working lead funnel (Submit-a-Property, Strategy Lab, Peggy,
MarketFlow). It just needs to be deployed. Steps in §3.

---

## 1. What was done this session (all merged to `main`)

### Pegasus website
- **PR #23 — Public website v1** (merged). Deal-routing, homepage PRD
  lock, multi-step Submit-a-Property intake desk. Launch-gate audited:
  35 routes clean at desktop + mobile, no horizontal overflow, no broken
  images, all legacy redirects verified, dark mode verified. Fixed 2
  banned-copy violations ("off-market" → "unlisted" on `/submit-property`
  and `/vendor-network`). Removed a dead CI workflow that was re-vendoring
  video assets on every push (was draining GitHub Actions minutes).
- **PR #24 — Portable auth + Render deploy kit** (merged). This is the
  important architectural change:
  - `server/replitAuth.ts`: Replit OIDC is now **optional**. When
    `REPL_ID` is unset the app skips OIDC discovery entirely and boots
    without needing to reach replit.com. `/api/login` and `/api/callback`
    redirect to `/signup` (the Supabase auth surface).
  - `isAuthenticated` is now **hybrid**: a verified Supabase bearer token
    is accepted on all ~198 protected routes with zero route changes.
    The Replit session + refresh path is untouched when OIDC IS enabled.
  - Bearer users are lazily provisioned into the local users table.
  - `server/supabaseAuth.ts`: token verification falls back to the anon
    client when the service-role key is absent.
  - `render.yaml` (repo root) + `docs/deploy/RENDER_DEPLOY.md` (the
    deploy runbook) + `package.json` engines pinned to Node 20.x.
  - Verified: `tsc` clean, **798/798 tests pass**, and a full staging
    boot WITHOUT `REPL_ID` against the real Supabase project (public
    routes 200, protected routes fail closed 401).
- **Branch cleanup**: deleted 8 fully-merged stale branches. Kept every
  branch with unique commits (backup/*, vision/*, replit/*, etc.).

### WoofWatcher
- **PR #2 — Reconcile: promote fable5 line to main** (merged). The real,
  actively-developed app (the `claude/woofwatcher-fable5-prompt-rcqv07`
  line, 663 commits, last worked 2026-07-11) is now `main`. Merged with
  main's own 146 commits via a supersede merge (`-s ours`: fable5 tree
  wins wholesale — the two avatar/sprite systems were mutually exclusive
  and only fable5's passes its full verify suite). Both histories are
  preserved (nothing deleted). **CI green on Node 24.**

### Highest-Self-OS
- No code changes. Verified CI green on main. Left as-is (its own launch
  checklist correctly refuses to claim readiness before live proof).

---

## 2. Repo & branch map (what to work in)

- **Production app code**: `ApolloDNR/Pegasus-DreamScapes-Website-Marketflow`,
  branch `main`. This is a pnpm/npm monorepo-ish app: `client/` (React +
  Vite + Wouter + Tailwind), `server/` (Express + Drizzle + Postgres),
  `shared/` (schema, zod). Build: `npm ci && npm run build`. Start:
  `npm run start`. Test: `npm test` (vitest). Typecheck: `npm run check`.
- **Design source of truth**: the saved React prototype under
  `client/src/pegasus/` (Landing.tsx, nav.tsx, peggy.tsx, forms.tsx,
  pages.tsx, blocks.tsx, data.tsx, theme.ts, routes.ts) + its scoped CSS
  `client/src/pegasus/_group.css`. See `replit.md` for the full doctrine,
  palette (navy `#0D1B2A`, copper `#D4872E`, gold `#C9A84C`, cream
  `#F5E6D3`), typography (Cormorant Garamond + Space Grotesk), and the
  compliance/anti-drift copy locks. **Read `replit.md` and
  `docs/design/final-design-lock.md` before any design change.**
- **DO NOT reuse these QA-only edits**: during staging I made local,
  uncommitted driver swaps (`server/db.ts` → node-postgres, a REPL_ID
  stub) purely to boot the app in a sandbox. They were never committed
  and must not be. Production uses the Neon serverless driver as-is.

---

## 3. HOW TO FINISH THE LAUNCH (the one thing that matters)

Full runbook is in the repo: **`docs/deploy/RENDER_DEPLOY.md`**. Summary:

1. **Back up data**: from the Replit shell,
   `pg_dump "$DATABASE_URL" --format=custom --file=backup.dump`, download it.
2. **Database**: either keep the existing Replit `DATABASE_URL` (it's Neon
   under the hood, works off-Replit) or restore the dump into a fresh Neon
   project. Code already uses the Neon driver — zero code change either way.
3. **Supabase** (project ref `knfmdyufodbnqsgkzhqw`): Authentication → URL
   Configuration → Site URL `https://pegasusdreamscapes.com`; copy the
   `anon` and `service_role` keys for step 4. Verify and harden the live
   Supabase RLS, grants, views, and privileged functions before staging.
   The canonical `opportunities` and `hq_outbox` tables belong in the
   Postgres database referenced by `DATABASE_URL`; apply the reviewed files
   in `migrations/` there, not in the Supabase SQL editor.
4. **Render**: render.com → New → Blueprint → select the repo → it reads
   `render.yaml`. Fill the env vars (table below). Deploy (~5–8 min).
5. **Domain**: Render → Custom Domains → add apex + www → it shows an A
   record and a CNAME → set those at Squarespace (where the domain is
   parked), remove the parking records. Wait for cert.
6. **Smoke test**: homepage, submit a real test property (confirm intake
   record), Strategy Lab run, signup → login → a protected action, mobile
   no-overflow check.

### Required env vars (set in Render dashboard)
| Var | Value / source |
|---|---|
| `DATABASE_URL` | Replit secret, or Neon connection string |
| `SUPABASE_URL` | `https://knfmdyufodbnqsgkzhqw.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (secret!) |
| `SESSION_SECRET` | auto-generated by render.yaml |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI key (powers Peggy) |
| `STAFF_NOTIFICATION_EMAIL` | `apollosynd@gmail.com` |
| `SENDGRID_API_KEY` / `DEFAULT_FROM_EMAIL` | optional day-1; leads still save without email |
| `GOOGLE_MAPS_API_KEY` / `VITE_GOOGLE_MAPS_API_KEY` | if maps enabled |

Rollback: Render → Deploys → Rollback (instant), or revert the commit on
main (auto-deploys). Data: restore the step-1 dump.

---

## 4. DESIGN — what Apollo wants improved (the real remaining work)

Apollo's feedback (verbatim intent): the site is **overwhelming and hard
to navigate**; Strategy Lab opens on a confusing cockpit; wants **better
storytelling, better copy, better illustration**, an **iconic** feel, a
strong **lead magnet**, and something **"award-winning, not too AI."**

A full diagnosis + plan is committed at **`docs/design/REDESIGN_BRIEF.md`**.
The four moves:
1. **Cut the nav to ~5 items** (`Start · The Floor · Strategy Lab · Work
   With Apollo · Submit a Property` + Peggy dock). Lanes get *routed to*
   via the intake + Peggy + footer, not browsed to in the top bar.
2. **Homepage → a calm "lobby"** (~3 screens, 5 beats): thesis hero →
   "What brings you here?" router (keep — it's the strongest section) →
   one proof (Nelson) → doorway into departments → Submit CTA.
3. **Strategy Lab → "one desk, one question."** Open on a single centered
   prompt; reveal the full cockpit only behind a "show the instruments"
   action. Keep all existing compliance copy, tier strip, run-limit logic
   — this is re-choreography, not rebuild.
4. **One illustration system**: warm-dusk, navy/copper, no-people imagery
   art-directed from Apollo's own corridor/loggia references (so it never
   reads as stock or generic AI). Generated plates already exist (see §6).

**Compliance is load-bearing.** `replit.md` lists banned public-copy
phrases (real-estate/securities exposure) and forbidden filler. There's a
test suite that enforces some of it. Run `npm test` after any copy change.

---

## 5. WoofWatcher & Highest-Self-OS next steps

- **WoofWatcher**: app is on `main`, CI green. Remaining: native/device
  QA for app-store submission (the repo's own `mobile-beta-doctor` script
  gates this — needs Node 24, EAS build profiles, native proof). A
  landing page was designed (self-contained HTML, in the preview repo at
  `/woofwatcher/`) — host it (Render static, or paste into the marketing
  channel of choice). The 7 `automation/premium-revenue-product-builder*`
  branches are historical/superseded — safe to archive after confirming
  nothing consumes their reports.
- **Highest-Self-OS**: youngest as a product. Per its own
  `docs/ROADMAP.md` the core loop (Capture → Clarity Brief → Identity
  Routing → Act → Remember) isn't complete; app-store readiness is
  deliberately deferred. Pick ONE loop from the roadmap and finish it
  end-to-end with the repo's test/build/smoke gates.

---

## 6. The "cinematic hall" experiment — status & honest note

Apollo asked for an immersive 3D/cinematic walk down a marble colonnade
for the Departments page. This was prototyped in the **preview repo**
(`ApolloDNR/apollodnr.github.io`, path `/hall/`), NOT in the production
app. Current state: an ambient looping walk video (Apollo's own Higgsfield
"Seedance" colonnade footage) with story beats and department cards over
it, plus tap-to-enter department rooms (Higgsfield plates).

**Honest engineering lesson to save the next model time:** scroll-scrubbed
video (`video.currentTime` driven by scroll) was attempted and repeatedly
felt choppy on phones — per-device seek latency makes it unreliable, and
it is NOT worth chasing. The version that worked is **plain playback** (an
ambient background film that just plays, with a two-`<video>` crossfade for
a seamless loop, and a tap-to-start fallback when autoplay is blocked in
iOS Low Power Mode). If continuing this: keep it as an ambient background,
do NOT reintroduce scroll-scrubbing, and test on a real phone before
shipping. Generated department plates live in the preview repo at
`hall/plates/*.webp`; the colonnade reference is `hall/reference-colonnade.jpg`.

This experience is **decoupled from launch** — the production site does
not depend on it. Ship the site first; fold this in later only if desired.

---

## 7. Known issues / unfinished

- `/library` currently 302-redirects to `/` (intentional per current code
  — article pages `/library/:slug` still work; add an index only if wanted).
- `/case-study` Nelson images total ~5.9 MB — a compression pass is
  recommended before broad traffic (not a blocker).
- Supabase security advisor previously reported 32 admin `SECURITY DEFINER`
  functions callable by signed-in users. Because this website issues users
  authenticated tokens for the same project, those function grants are a
  launch blocker until the live catalog is rechecked and every privileged
  function rejects ordinary users or has its effective `EXECUTE` grant revoked,
  including grants inherited through `PUBLIC`. Any deliberately client-callable
  privileged function needs an explicit internal authorization check and a
  normal-user RPC denial test for unauthorized actions.
  Leaked-password protection and MFA settings must also be reviewed before
  broad account traffic.
- Email: SendGrid sender not yet verified. Leads save without it; wire it
  up post-launch for notifications.
- Housekeeping: the `pegasus-hq-replit` GitHub PAT was noted as expiring
  ~2026-07-14 — renew it to keep any Replit↔GitHub sync working. There are
  also ~7 duplicate "Pegasus Dreamscape" Wix sites that can be archived.

---

## 8. Paste-ready kickoff prompt for Codex / ChatGPT

> You are continuing work on the Pegasus DreamScapes real-estate website,
> repo `ApolloDNR/Pegasus-DreamScapes-Website-Marketflow`, branch `main`
> (green). Read `HANDOFF.md`, `replit.md`, `docs/design/final-design-lock.md`,
> and `docs/design/REDESIGN_BRIEF.md` first. The app is a React (Vite +
> Wouter + Tailwind) client + Express/Drizzle/Postgres server; Supabase
> auth; Neon Postgres. Commands: `npm ci`, `npm run check`, `npm test`
> (798 tests — keep them green), `npm run build`, `npm run start`.
> Priority 1: help me deploy to Render and connect pegasusdreamscapes.com
> per `docs/deploy/RENDER_DEPLOY.md`. Priority 2: execute the design
> redesign in `docs/design/REDESIGN_BRIEF.md` — simpler 5-item nav, a calm
> "lobby" homepage, Strategy Lab as "one desk, one question," and a
> consistent warm-dusk illustration system — WITHOUT breaking the
> compliance copy locks in `replit.md` or the passing test suite. Work in
> small, verified steps: propose the change, make it, run typecheck + tests,
> show me before moving on.
