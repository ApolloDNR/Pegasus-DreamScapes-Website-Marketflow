---
title: Doctrine v1.0.2 — Amendment 2 (two-audiences, four doors, Peggy positioning, ecosystem)
---
# Empire Doctrine v1.0.2 — Amendment 2

Status: RATIFIED (Task #149, Apollo-approved; locked alongside v1.0.2 + Amendment 1)
Supersedes: nothing (additive to v1.0.2 Parts A–G + Amendment 1)
Conflicts with: nothing in v1.0.2; resolves several open ambiguities

## A. Why this amendment exists

External audit (Claude Chrome) plus Apollo's strategist response surfaced one architectural
problem the locked v1.0.2 doctrine does not address: **the website has two audiences and
is serving both badly.**

- **Audience A — Property holders**: owners, agents, families, wholesalers, deal sources.
  Want: someone to look at their property and tell them what to do with it.
- **Audience B — Ecosystem participants**: operators, capital partners, vendors, future
  SaaS users. Want: to understand what Pegasus is building and how to plug in.

v1.0.2's public surface optimizes for Audience A (Submit → Lab → Network funnel) but leaks
ecosystem language (MarketFlow, Peggy, BuildForge, CapStack mentioned in passing) onto the
Audience A surfaces. Audience B lands and gets confused because there is no destination
that explains the ecosystem honestly. This amendment fixes that by adding `/ecosystem` as
a footer-only release valve and by restructuring the homepage around a four-door funnel
that acknowledges visitor readiness varies.

## B. New doctrine principle — Two-Audience Discipline

Locked public principle:

> Pegasus serves two audiences. Property holders come for a path on a specific
> property. Ecosystem participants come to understand what Pegasus is building.
> Every public surface must serve one audience clearly. No surface tries to serve
> both at once.

Operational consequences:
1. Homepage, /strategy-lab, /submit, /projects, /about, /development = **Audience A**.
   Audience B language (BuildForge, CapStack, ecosystem product names) does not appear
   on these surfaces except by deliberate, single-sentence reference.
2. `/ecosystem` (new, footer-only) = **Audience B**. The single destination where the
   four ecosystem products (Pegasus HQ, BuildForge, CapStack, MarketFlow) are introduced
   with honest status badges. Property-funnel CTAs do not appear here.
3. `/marketflow`, `/capital`, `/vendor-network` = mixed but **lean Audience B**. They are
   already gated/private-beta language; no change required.

## C. The Four Doors (replaces v1.0.2 §3 three-door framing)

Friction-ladder funnel architecture. Each door catches a different visitor mindset:

| Door | Friction | For | Surface |
|---|---|---|---|
| 1. Talk to Peggy | Lowest — just chat | "I'm not sure what I have yet" | Floating widget + /peggy |
| 2. Submit a Property | Medium — form | "I know what I have, review it" | /submit (primary CTA) |
| 3. Try Strategy Lab | Medium — tool | "I want to run the numbers myself" | /strategy-lab |
| 4. Join the Network | High — vetted | Operators · capital · vendors | /marketflow + /capital + /vendor-network |

**Locked**: door order on the homepage is Peggy first, Submit second. Peggy lowers friction
for exploration-mode visitors; Submit remains the primary CTA in the header and final CTA.

## D. Peggy — locked positioning

Verbatim public positioning line:

> Peggy — Pegasus' AI strategy assistant. One intelligence, multiple surfaces.
> Plugs into website, phone, HQ, and the ecosystem apps.

Peggy is **not** a chatbot. Public-facing nouns allowed: assistant, concierge,
associate, intake analyst. The word "chatbot" is forbidden on public surfaces.

### D.1 What Peggy does (public)
- Listens to a property situation in plain language.
- Asks one qualifying question at a time.
- Routes to the right path: Submit-a-Property, Strategy Lab, Strategy Review,
  Capital intake, Vendor intake, "needs human review."
- Captures structured intake (identity, property, situation, timeline, want, disposition).
- Hands every conversation off to Apollo as a daily inbound report.

### D.2 What Peggy does NOT do (publish on /peggy)
- Never quotes a price or makes an offer.
- Never makes a binding commitment on behalf of Pegasus.
- Never gives legal, tax, or investment advice.
- Never shares other clients' data.
- Never claims outcomes ("you'll make $X").
- Never bypasses the human review step for actual offers.

Publishing these limits is itself a premium signal.

### D.3 Peggy's voice (training spec)
Warm, calm, precise. Never bubbly. Never robotic. Uses Pegasus vocabulary: "path,"
"structural read," "situation," "strategy." One question at a time, never a wall of
text. First turn always discloses she is an AI assistant.

### D.4 Phone line — Apollo override
Apollo has explicitly chosen to ship Peggy on the existing 925-744-8525 line ASAP,
overriding the conservative "future capability" recommendation. The doctrine ratifies
this scope but **locks four non-negotiable safety requirements before voice cutover**:

1. **CA two-party recording consent (Penal Code §632)** — Peggy's opening turn must
   disclose: "This call is recorded for quality and training. Please say 'stop
   recording' if you'd prefer I don't." If the caller declines, recording stops and
   the conversation continues unrecorded.
2. **Fair Housing refusals** — Peggy must hard-refuse any conversation that touches
   familial status, race, national origin, religion, disability, or any protected
   class steering. Refusal language: "I can't help with that — Pegasus reviews every
   property on the property's merits, not the parties involved. Let me get you to
   Apollo directly."
3. **DRE licensing exposure** — Peggy never makes representations about price, terms,
   value, fitness, or investment quality. She qualifies and routes; she does not advise.
4. **Civil Code §1695 (home equity sales contract law)** — if a caller indicates the
   property is in foreclosure or default and they are an owner-occupant, Peggy reads
   the §1695 disclosure language and routes immediately to Apollo for human handling.
   No qualifying questions beyond identity and callback method.

These four requirements are **launch gates**, not nice-to-haves. Peggy phone does not
go live until each is implemented and tested. Phil Deutscher review recommended but not
hard-blocking per Apollo's call.

## E. The eight-section homepage (replaces v1.0.2 §3 six-section composition)

Locked homepage composition, in order:

1. **Hero** — "Complex property. Structured opportunity." + one-sentence subhead.
   Primary CTA: Submit a Property. Secondary text link: "or talk to Peggy."
   Quiet. Spare. No four-stat bar in the hero.
2. **Trust strip** — single horizontal line, no card treatment:
   *"Decades of East Bay construction in the team · DRE #02333658 · KW East Bay
   · NAR · CAR · Pleasant Hill, CA"*.
   **Attribution lock**: "20+ years" language is forbidden as a Pegasus-the-company
   stat. The construction experience is attributed to the team (Moises Duran), not
   to Pegasus DreamScapes Corp.
3. **The Pegasus Question** — manifesto moment. "What should you do with this property?"
   followed by 3–4 editorial sentences. **No product-pill grid here** (locked: mixing
   property strategies with Pegasus participation lanes is forbidden — that conflation
   was resolved in v1.0.1 and this amendment re-affirms it).
4. **The Four Doors** — Peggy · Submit · Strategy Lab · Join the Network. Each card
   one-line description + one-line for-who + CTA verb. Peggy slightly more prominent
   (subtle copper border or "available now" dot).
5. **Nelson Dr — the proof** — image-first, full-width. Real photos (launch gate;
   currently missing). Property line + one-paragraph story + three data pills
   (Acquired ~$600K · Renovation ~$90–100K · Sold ~$840K) + CTA to full case study.
6. **The Operator** — single Apollo section (merge of the existing "Operator Behind
   the Lens" + "Operator's Edge" duplication). Real photo, two paragraphs, DRE/KW
   credentials, one pull quote.
7. **The Pegasus Standard** — six commitments, kept as-is. This section is already
   strong. Visual upgrade: Cinzel numerals 01–06 large + copper, Cormorant commitment
   text.
8. **Final CTA** — "Bring us the property. We'll show you the path." Two buttons:
   Submit a Property (primary) + Talk to Peggy (secondary).

Removed from homepage: PegasusQuestionSection's redundant philosophy paragraph (rolled
into the new §3 manifesto), PegasusStandardSection's abstract virtue framing (replaced
with the existing six commitments), the SAMPLE VERDICT card (replaced by the real
Nelson card), all testimonials with initials.

## F. /ecosystem — new footer-only page (Audience B release valve)

Single page introducing the four ecosystem products with honest status badges. Replaces
all ad-hoc mentions of BuildForge / CapStack / Peggy / MarketFlow on Audience A
surfaces.

Card structure (four cards):
- **Pegasus HQ** — Internal operating layer · *Private, in development*
- **MarketFlow** — Private dealflow network · *Private beta — invite only*
- **BuildForge** — Construction project intelligence · *Internal, not a public surface yet*
- **CapStack** — Capital relationships system · *Internal, not a public surface yet*

Each card: one-paragraph what-it-is, status badge (copper pill, exact text from
status list above), no CTA except "Request to learn more" → /connect.

The page header: "The Pegasus Ecosystem — what we're building, honestly."
The page exists at footer only. It is not in primary nav. It is not linked from
Audience A pages.

## G. Status badges — required design element

Any public mention of an ecosystem product (HQ, BuildForge, CapStack, MarketFlow, Peggy,
Buyboxes) must carry a status badge. Locked status vocabulary:

- **Live** (copper pill) — fully shipped, public, supported.
- **Private beta — invite only** (navy pill) — exists, gated, request-access only.
- **In private training** (warm cream pill, navy text) — being built, placeholder UI.
- **Internal, not a public surface yet** (charcoal pill, cream text) — exists internally,
  no public destination.
- **In development** (outline pill) — planned, not yet built.

No exceptions. No ecosystem product gets mentioned without a status badge. This is the
single highest-leverage anti-overclaim discipline in the doctrine.

## H. "What we are not" anti-claims block (locked /about element)

Mandatory section on /about, prominent placement (above the Doctrine block):

> **What we are not.**
> We are not just a cash buyer. We are not a brokerage. We are not a construction
> company. We are not a proptech app. We are not a marketplace. Pegasus is a
> strategy-first real estate operating company. We review complex property
> situations and design the right path forward.

Locked. Asserted via `public-voice.test.tsx`.

## I. Credentials policy (locks the trust-strip and any logo strips)

Listable on the public site, locked and verified (Apollo confirmed via CCAR screenshot, Task #149):
- **DRE #02333658** (Apollo Duran)
- **Keller Williams East Bay** (independently owned and operated disclosure required)
- **NAR — National Association of Realtors** — NRDS member **#159537628**
- **CAR — California Association of Realtors** — via Contra Costa Association of Realtors (CCAR) **#36424**

Forbidden until/unless real membership is confirmed:
- NAHB, BNI, BiggerPockets, any ULI / NMHC / NAIOP / IRR / Inman badges, any
  certifications not actually held.

Listing a logo for an organization Pegasus does not currently hold an active membership
in is treated as **fake credentialing** and is a launch-blocking violation.

## J. Launch-readiness gates (additive to v1.0.2 Part G)

Hard launch blockers — no public deploy until each is true:

1. No "in progress" / "coming soon" / "sample" copy visible on any public page.
2. /projects/nelson-dr has ≥ 3 real photos and founder-confirmed numbers (or the page
   is delisted from primary nav until it does).
3. All nav links resolve to real pages. No orphan footer links.
4. Peggy floating widget either responds OR is hidden (no broken state).
5. All forms submit successfully AND trigger confirmation email in Pegasus voice.
6. DRE / KW / NAR / CAR disclosure block visible in footer.
7. Privacy, Terms, Disclosures have real content (even short).
8. Favicon, OG image, page titles, meta descriptions present on every page.
9. Mobile pass on hero, four doors, Nelson, Apollo, Standard, footer.
10. Hero loads < 1.5s on mobile.

## K. Explicit doctrine rejections (do NOT integrate, despite Claude Chrome's audit)

These are surfaced to prevent future drift:

- **"Quick Read" as a fifth product term.** Locked taxonomy is four: Strategy Lab,
  Strategy Review, Strategy Snapshot, Deal Blueprint. "Quick Read" is a Lab-internal
  mode, not a public product name.
- **"20+ years construction" attributed to Pegasus the company.** Attribution problem;
  use "team" framing only (see §E.2 trust strip).
- **Cal.com / Savvycal / any scheduling embed.** Undoes Strategy-Review-as-friction-wall.
- **Eight-product-pill grid mixing property strategies with Pegasus participation lanes.**
  Resolved in v1.0.1; do not re-introduce.
- **Fake credential logos** (NAHB, BNI, BiggerPockets unless real membership held).

## L. Anti-drift updates

This amendment updates the following tripwires:

- `client/src/__tests__/public-voice.test.tsx`:
  - Add: "What we are not" block assertion on /about.
  - Add: Peggy positioning line ("One intelligence, multiple surfaces") assertion on /peggy.
  - Add: forbidden phrase check for "20+ years" attributed to Pegasus (must appear only
    in team-experience framing).
  - Add: "chatbot" forbidden on public surfaces.
- `client/src/__tests__/doctrine-anti-drift.test.ts`:
  - No token changes; visual baseline preserved per v1.0.2 Part A.
- `client/src/__tests__/nav-parity.test.tsx`:
  - Add: `/ecosystem` exists as footer-only route (asserted in NAV_MORE under a new
    `ecosystem` group, NOT in NAV_PRIMARY).

## M. Open items requiring Apollo input before execution

These are not blockers for ratifying the amendment, but they are gates for the build
task:

1. **NAR + CAR member IDs.** Required before trust strip can render those badges live.
2. **Nelson Dr photos** (≥ 3 real). Required before /projects/nelson-dr exits placeholder
   mode and before homepage Nelson section can render the real proof card.
3. **Apollo headshot** (real, not stock). Required for §E.6 Operator section.
4. **Peggy chat backend choice.** Vendor selection (OpenAI Assistants, Vapi, Bland,
   custom on Claude/GPT-4) — Apollo to choose or delegate to Replit recommendation.
5. **Peggy phone vendor choice.** Vapi / Bland / Retell / SignalWire — same.
6. **Phil Deutscher review** on Peggy phone safety language (§D.4). Recommended but
   not blocking per Apollo's ASAP override.

## N. Sequencing

Doctrine ratification (this amendment) → Phase 3 build (page restructure +
/ecosystem + /peggy placeholder) → Peggy chat real product → Peggy phone real product
with §D.4 gates. The four execution tasks are tracked separately and may parallelize
where their files do not collide.

## O. Reconciliation with #147

Project task #147 ("Empire Doctrine v1.0.2 — Reconciliation & Structural Corrections")
is still in PROPOSED state in the project task queue, but the work was executed in code
(see replit.md doctrine section, the doctrine-anti-drift test, the public-voice test).
Apollo should mark #147 MERGED to reflect reality before this amendment is ratified.
Amendment 2 builds on the live code state which already implements v1.0.2.

---

End of Amendment 2.