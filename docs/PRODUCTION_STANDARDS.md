# Pegasus Dreamscapes — Production, Monetization & App Store Standards

Owner: Paolo "Apollo" Duran. Maintained by the agent team (Claude / Codex).
This is the bar the product must clear to be (a) live, (b) making money,
(c) distributable through the Apple App Store. Check items off in PRs that
close them; nothing ships to paying customers with an open ☐ in its section.

Legend: ☑ done and verified in repo · ☐ open · ◐ partially done (noted).

---

## 1 · Product completeness — usefulness, function, value

A solid product is one where every public promise has a working mechanism
behind it. The site makes four promises; each needs its loop closed:

- ☑ **"Bring an opportunity" → a real read.** Intake form → `/api/opportunities`
  → DB row + `hq_outbox` + staff notification (built; smoke-verified locally).
  ☐ Verify the same loop **in production** with a marked test lead
  (`npm run smoke:launch -- --base-url <prod> --post-test-lead`), then delete it.
- ◐ **Strategy Lab → a defensible decision.** The 4-step desk works in-browser.
  ☐ Define what a *finished* Lab session hands the user: a written Property
  Read (PDF/email) they can keep. That artifact is the value moment — and the
  natural paywall seam (see §2).
- ◐ **Peggy → guided intake.** UI complete, boundaries written.
  ☐ Production API key, rate limits, and a transcript-handoff test
  (Peggy → human) on the deployed site.
- ◐ **MarketFlow → a vetted room.** Request-access flow exists.
  ☐ The operator-side process: who reviews requests, in what tool, with what
  SLA. A private pilot with no doorman is a dead letterbox.

**Usefulness test (run quarterly):** a stranger with a real property must be
able to (1) understand what Pegasus does in 5 seconds, (2) get a personalized
read on their situation in under 3 minutes of effort, (3) receive a concrete
next step within 48 hours. If any leg fails, that's a P1 product bug —
regardless of how the site looks.

## 2 · Monetization readiness

The business model is services + deal economics, not software subscriptions.
Monetization on the site means capturing and converting qualified intent, and
charging for the two productized artifacts.

**Sellable today (turn these on):**
- ☐ **Deal Blueprint (by review)** — the paid written underwriting/strategy
  packet. Stripe checkout scaffolding exists behind review
  (`deal-blueprint-public-contract` keeps it off the public surface — correct).
  To activate: price it, write the fulfillment SOP (who produces it, in what
  turnaround), connect the Stripe account, and add receipt + refund policy.
- ☐ **Strategy Lab Pro tier** — free: explore paths in-browser; paid: the
  written Property Read + a review call. Gate at the artifact, never the tool.
- ☐ **MarketFlow membership** — reviewed access; annual. Do not price until
  the room has ≥10 credible counterparties; sell the standard, not the software.

**Money plumbing (before the first dollar):**
- ☐ Stripe live keys in production env only (never in repo); webhook signature
  verification; idempotent fulfillment.
- ☐ Receipts, refund policy, and a cancellation path written in plain English
  on `/terms` (page exists — ☐ add the commerce clauses).
- ☐ Sales tax posture confirmed (services in CA; consult the accountant once).
- ☐ Bookkeeping hook: every Stripe event lands somewhere a human reconciles
  (even a monthly CSV export is fine at this stage).

**Compliance boundary (non-negotiable, already encoded in tests):** nothing
sold may promise returns or outcomes; Blueprints/Reads are analysis, not
offers; brokerage services remain with Apollo through KW East Bay
(CA DRE #02333658) and are never sold through site checkout.

## 3 · Apple App Store path

The right sequence is **PWA → TestFlight wrapper → App Store**, and the app
must be *more than the website in a frame* or Apple will reject it
(Guideline 4.2 — minimum functionality).

**Stage 0 — PWA (do first, ~free):**
- ◐ Manifest: `icon-192/512` exist; ☐ add `manifest.webmanifest` (name, short
  name, `display: standalone`, theme `#0D1B2D`, icons incl. maskable),
  ☐ apple-touch startup meta, ☐ service worker for offline shell of
  Strategy Lab + saved briefs. This alone gives "install to home screen."

**Stage 1 — wrapper (Capacitor) when there's a reason to be in the Store:**
- ☐ App-worthy capabilities that clear 4.2: push notifications for deal-read
  status and MarketFlow introductions; camera/LiDAR property capture into an
  opportunity record (this is the owner's proptech direction — it belongs
  here); offline Lab briefs.
- ☐ Apple Developer Program ($99/yr) under Pegasus Dreamscapes Corp.
  (D-U-N-S required for an organization account).

**Store submission materials checklist:**
- ☐ App icon set (1024 master, no transparency) from the brand mark.
- ☐ Screenshots: 6.9" and 6.5" iPhone sets (5–8 each), dark theme, real
  screens only — no device frames with fake data presented as live inventory.
- ☐ App name (≤30 chars: "Pegasus Dreamscapes"), subtitle (≤30: e.g.
  "East Bay Real Estate, Executed"), keywords, description in the house voice.
- ☐ Privacy Policy URL (`/privacy` exists — ☐ audit against actual SDK/data
  collection) and Support URL (`/contact`).
- ☐ App Privacy "nutrition labels": declare contact info, user content
  (submitted opportunities), identifiers; no tracking → no ATT prompt.
- ☐ Account rules: if accounts exist in-app, **in-app account deletion** is
  mandatory (Guideline 5.1.1(v)); if any third-party login is offered,
  **Sign in with Apple** is mandatory (4.8).
- ☐ Demo/review account with fixture data for App Review + review notes
  explaining that opportunities are service requests, not securities.
- ☐ Payments rule: services rendered outside the app (Blueprints, reads,
  representation) may use Stripe web checkout (3.1.3(e) real-world services;
  3.1.1 forbids IAP-bypass only for *digital* goods) — never sell the Blueprint
  as an in-app digital purchase, keep checkout on the website.
- ☐ Age rating 4+, EULA standard, export compliance "standard encryption".

## 4 · Production operations standard

**Deploy & availability**
- ☐ Production deploy (Render config in `docs/deploy/`) on pegasusdreamscapes.com,
  SSL, `www` → apex redirect; branch `claude/masterpiece-hero-v51` merged to main.
- ☐ Health endpoint monitored (UptimeRobot or Render health checks) with
  alerting to apollo@; target 99.9%.
- ☐ Rollback story: previous deploy retained; DB migrations reversible
  (`drizzle-kit` — never destructive without a backup taken first).

**Data**
- ☐ Managed Postgres with daily automated backups + a tested restore.
- ☐ `hq_outbox` drained by a worker/cron in production; dead-letter visibility.
- ☐ PII inventory: leads/opportunities contain names, emails, phones,
  addresses → retention policy written into `/privacy`, deletion on request.

**Security**
- ☐ Security headers (CSP, HSTS, X-Content-Type-Options, frame-ancestors),
  rate limiting on `/api/*`, input validation already via zod (☑).
- ☐ Secrets only in env; `run_secret_scanning` on the repo once per release.
- ☐ Dependency audit (`npm audit --omit=dev`) gate in CI at high severity.

**Observability**
- ☐ Error tracking (Sentry) on client + server with source maps.
- ☐ Analytics events for the funnel: hero CTA → intake start → intake submit →
  Lab open → Lab complete → Peggy open (initAnalytics exists ☑; ☐ verify the
  funnel events fire in production and land in a dashboard someone reads).

**Quality gates (all already in repo — keep them ruthless)**
- ☑ 942-test suite incl. copy locks, banned phrases, keyboard a11y, contracts.
- ☑ axe sweeps clean; ☐ add axe + tsc + vitest as required GitHub checks on main.
- ☑ Performance discipline (responsive images, preload, CLS guards);
  ☐ record LCP/CLS budgets from `perf-probe` in CI output per release.

## 5 · Definition of "solid product"

Ship when — and only when — all are true:
1. A test opportunity submitted on the **production** site reaches the
   database, the HQ outbox, and Apollo's inbox within 60 seconds.
2. Every promise on the site has a named human process behind it (who reads
   intakes, who reviews MarketFlow requests, who produces Blueprints, at what SLA).
3. Broker/legal review of `docs/launch/BROKER_REVIEW_PACKET.md` is complete.
4. Monitoring would page a human if the site or the intake API went down.
5. The first paid artifact (Deal Blueprint) can be bought, fulfilled, and
   refunded without improvisation.

Everything else — including the App Store — is sequenced *after* those five.
