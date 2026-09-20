# Pegasus Intelligence Desk: Design and Implementation Handoff

> **For the implementing Work/Codex session:** Apollo has approved Direction C, the hybrid of institutional underwriting and development intelligence. Execute this document task by task using the repository's existing development workflow. Do not reopen the A/B/C discussion or substitute another planning-only response. Use `superpowers:executing-plans` or the available equivalent. Checkboxes below are execution tracking, not claims of completed implementation.

**Goal:** Upgrade the actual public Strategy Lab into a precise, visual property-decision workspace, then bring the remaining public website up to the same intentional, sophisticated standard.

**Architecture:** Retain the public React/Vite/Wouter/Express application and the shared TypeScript strategy engine. One validated analysis state supplies the five views, charts, scenario comparisons, memo and handoffs. Reuse the existing engine before extending financial models.

**Tech stack:** Existing React 18, TypeScript, Vite, Wouter, shared strategy/calculator modules, Vitest/Testing Library, Playwright/axe verification, existing CSS and chart dependencies. No framework migration.

**Spec:** Sections 1–10 of this document are the design specification. Sections 11–14 are the implementation sequence, verification contract and delivery requirements. This is one handoff, not a second competing website blueprint.

**Status:** Implementation brief, not an implemented Intelligence Desk or a new hosted preview. The application baseline below was read through GitHub while preparing this handoff. No application code or hosting configuration was changed to produce it.

## 1. Source of truth and ownership

| Item | Value |
|---|---|
| Repository | `ApolloDNR/Pegasus-DreamScapes-Website-Marketflow` |
| Canonical integration branch | `codex/launch-recovery-v2` |
| Existing review candidate | PR #26 |
| Inspected application head | `1a34ef52ef03b44894da1ab50ada65a1f617af68` |
| Recorded baseline verification | Launch Verification run `35047601866`, completed successfully |
| Target route | `/strategy-lab` |
| Approved website identity | Pegasus Dreamscapes; founder-led real estate operating company |
| Execution owner | One repository-connected Work/Codex session |
| Owner/design review | Apollo, with this Chat thread available for critique |

Refresh the head and inspect the working tree before editing. If the head advanced, retain the newer work and inspect the relevant diff. Never reset to this recorded SHA merely to match the document. Preserve draft PR status and the recovery history; do not create a competing integration candidate.

### Critical routing correction

The public page mounts through:

`client/src/pegasus/Landing.tsx` → `StrategyLabPage` in `client/src/pegasus/pages.tsx` → `PremiumStrategyLab` in `client/src/pegasus/strategy-lab-experience.tsx`.

The larger `client/src/pages/strategy-lab.tsx` is a different implementation. Its imports and export/share features are not evidence that the public route exposes those capabilities. Trace and test actual public routing. Do not spend the build renovating an unmounted look-alike.

Read `AGENTS.md` and its required repository documents before edits. This specification supersedes the former four-step Lab presentation, not the repository's security, consent, licensing, evidence or production-approval boundaries.

## 2. Global constraints

- Preserve the existing React/Vite/Wouter/Express stack and canonical branch/PR.
- Keep `/strategy-lab` and the public name **Strategy Lab**. Use **Pegasus Intelligence Desk** as its descriptor, not a second product or extra navigation destination.
- Exactly five primary workspace views: **Overview, Assumptions, Scenarios, Risk, Memo**.
- Preserve all nine engine lane identifiers and all eight calculator destinations.
- Preserve the six-section homepage, approved architectural hero, real Nelson/founder imagery, current navigation and cream-first preference behavior.
- Preserve brokerage separation, consent boundaries, private MarketFlow access, calculation integrity and supported intake context.
- No fabricated property data, market feeds, parcel maps, valuations, project evidence, funding commitments, testimonials or artificial confidence percentages.
- No live customer submissions, emails, payments, database migrations, public-domain/DNS changes or production promotion without the relevant approval.
- A protected, noindex preview is separate from production activation. Missing live email/HQ integrations must not indefinitely block a design preview.
- Do not weaken audits, verification gates or failing assertions to obtain a green badge.
- Do not silently turn an unavailable metric into zero, “low risk,” or a positive recommendation.
- Keep new analytical code out of the homepage's initial bundle; no new visualization dependency without demonstrated need.

## 3. The product and visual promise

The public website should be easy to understand. The Lab should be capable enough to reward detailed investigation. Simplicity outside does not require superficial analysis inside.

The experience is an investment-analysis desk with an architectural studio's discipline. Its power comes from relationships the visitor can inspect: where capital goes, what assumptions drive the result, what changes under stress, and what remains unverified.

Do not make a wall of equally weighted charts. One dominant analytical canvas, a compact context rail, a readable result rail and focused secondary views are more intentional than displaying every possible metric simultaneously.

### Visual specification

Use the current brand tokens first. The inspected refinement uses parchment `#f5efe4`, navy `#0b1d29` and copper `#8e5030`; tune only as needed for contrast and consistency, not to invent a new palette.

Use a restrained serif for the page identity and major editorial headings. Use the existing clean sans-serif with tabular numerals for inputs, figures, tables and labels. Normal technical labels must remain comfortably readable, not 9–10px decorative microcopy. Default reading text should be approximately 14–16px, with numeric summaries larger by hierarchy.

Light mode starts with parchment and uses bounded navy analytical areas, not an almost entirely dark screen. Dark mode retains the same geometry and content hierarchy. Copper identifies selection, emphasis and thresholds; it does not become a universal border around every box. Risk states also require words/icons and cannot depend on color alone.

No ornamental radar charts, spinning globes, ambient particle effects, animated architecture, fake terminal logs or mandatory scroll animation. Motion should show a changed assumption or selected relationship and respect reduced motion.

### Voice

Use “Compare scenarios,” “Model assumptions,” “Capital required,” “Sensitive inputs,” and “Next diligence step.” Avoid manufactured certainty, decorative jargon and endless procedural narration.

The **Pegasus Read** is explicitly an automated model summary, not an assertion that Apollo personally reviewed the property. “Highest modeled fit” is different from “the best investment.” Confidence should be demonstrated with supporting factors, sensitive factors and missing inputs.

## 4. Capability inventory: reuse, expose, then extend

The inspected public component already has validated inputs, a four-step workspace, private browser draft save/restore, nine-path comparison, a memo, calculator access, a Peggy context handoff and a Strategy Lab-to-intake handoff.

The shared engine already returns:

| Existing output | Intended use |
|---|---|
| `lanes` and `topLane` | Ranked paths and inspected-path detail |
| `capitalStack` and `totalCashIn` | Modeled funding breakdown and cash requirement |
| `scenarios.base/stressed/worst` | Existing rental operating stress analysis, with effective assumptions |
| `sensitivities` | Lane-specific grids with axis values, units and cell metric |
| `breakevens` | Supported thresholds, with undefined values left unavailable |
| `reverseSolvers` | What would need to change for an unsupported path |
| `risks` | Triggered flags, severity, explanation and affected strategies |
| `memo` | Automated narrative and next step |
| `arvBand`, `rentBand`, `compsUsed` | Supplied-comparison context where actually available |

### Do not conflate these capabilities

**Nine paths are not seven new dashboard categories.** Preserve `flip`, `wholetail`, `brrrr`, `rental_hold`, `adu_development`, `ground_up`, `wholesale`, `jv`, `listing_referral`. “Pass / gather evidence” is a decision state when assumptions do not support proceeding, not an invented engine lane.

**Base/Stressed/Worst is not Conservative/Base/Upside.** The current engine's stress cases adjust rental operating assumptions. Keep that analysis with its correct meaning. New whole-model scenarios must rerun the canonical engine with explicit changed property/financing inputs. Never rename “Worst” to “Upside.”

**A declared type is not a supported financing model.** The current engine builds a simple acquisition-loan, down-payment, rehab-capital and closing-reserve breakdown. Do not draw seller carry, layered debt or JV allocations as though modeled merely because their names appear in a type union.

**A score is not calibrated confidence.** The source contract describes `LaneConfidence.score` as sorting-only and requires factor lists, not the bare number. Preserve that rule.

**Public save is currently browser-local.** Do not label it cloud-synced. PDF, public sharing and account-based persistence require tracing the actual route, authentication and endpoint contracts before exposing controls.

## 5. Screen blueprint: Overview

### Desktop composition

At a 1440px reference viewport, use roughly 32–40px outer margins, a 240–280px context rail, a flexible central canvas and a 280–320px result inspector. Reduce to two columns before any text or controls become cramped. Do not cram three columns into a tablet.

```text
PUBLIC PEGASUS HEADER                            Existing navigation

Strategy Lab / Pegasus Intelligence Desk
[Property / city / asset]  [Active scenario]  [Save locally] [Actions]
Overview     Assumptions     Scenarios     Risk     Memo

[Four to six relevant figures, each with its period and metric basis]

PROPERTY + MODEL       DECISION CANVAS                  CURRENT READ
Identity               Basis → Capital → Execution     Highest modeled fit
Input status                    → Exit                 Main supporting fact
Assumption summary     Inspect a stage or path          Main limiting fact
Edit inputs            Supporting funding breakdown    Next diligence step

                       RANKED STRATEGY TABLE
                       Nine available paths; concise by default
                       Selected path drives the inspector

[Compact risk summary]   [Open relevant sensitivity analysis]
```

The canvas is the visual anchor, not a decorative background. Selecting a stage reveals its inputs, relationships and unresolved requirements in a synchronized inspector. Selecting a strategy changes the relevant outputs and explains what is and is not modeled.

### The first screen with no property entered

Show the actual workspace identity and a concise starter state. Provide **Start a property** and **Load illustrative example**. Essential starting fields are basis and an exit-value or rent assumption, with property context editable alongside them. Keep advanced controls one deliberate action away.

Do not show an apparently analyzed property, fabricated financial results or a polished “recommended path” before a valid basis exists. An example is opt-in, clearly synthetic, and does not overwrite an existing draft without confirmation.

### The first populated screen

Display only four to six summary metrics relevant to the inspected path, with details in the inspector or Assumptions. Examples: required cash, modeled net result, monthly cash flow, debt-service coverage and break-even threshold where supported.

Do not substitute rental cash flow for a flip result, show all-in project cost when only acquisition-plus-rehab has been counted, or call unrealized equity “profit.” Labels must describe the actual calculation and excluded costs.

The read summarizes the leading model output. When a visitor inspects a lower-ranked path, the interface must distinguish **Inspecting this path** from **Highest modeled fit** so the original memo is not falsely attributed to the selected path.

## 6. Screen blueprint: the four supporting views

### Assumptions

Use a compact grouped workbench: property facts; acquisition and scope; debt and capital; operating assumptions; exit assumptions; comps and evidence; execution planning.

Maintain one state across views. Each supported field has units, validation and a clear origin: visitor entered, supplied comparison, model default or derived. Suggested loan terms are not verified facts about the property or current lending offers.

Expose the engine's supported `RunOptions` before adding new models: loan-to-value, interest rate, loan term, management allowance, closing reserve and vacancy. Add relevant `PropertyInput` fields with typed adapters rather than parallel ad hoc calculations in JSX.

Zero and blank are distinct. A confirmed zero rehab budget is not the same as an unknown budget. Unknown permit/title/financing status must remain visibly unknown even where an existing engine boolean cannot express it. The presentation/evidence layer must not silently convert “not reported” into “clear.”

Unsaved changes, local save success, storage failure and reset confirmation are explicit. Switching views preserves inputs; closing the editor returns focus to the affected analysis.

### Scenarios

Use **Base, Conservative, Upside** for three whole-model versions, with an assumption-difference table and comparable outputs. These are user-adjustable stress experiments, not forecasts or probabilities.

Start from the user's current validated inputs. Offer explicit illustrative presets: Conservative reduces exit value and rent by 5%, increases scope by 10%, and increases the interest rate by 1 percentage point; Upside increases exit value and rent by 5% and leaves other inputs unchanged. Do not apply presets silently, exceed validated bounds, populate missing facts or count those changes as market evidence.

Changing a scenario reruns `runStrategyLab` against that scenario's inputs. Show changes in outputs and path order. Preserve the original base and allow reset. Display existing Base/Stressed/Worst rental operating analysis separately under its correct title and assumptions.

Place one relevant sensitivity matrix below the comparison, not a gallery of all grids. Each cell has readable value, axis coordinates and the output's correct meaning. Selecting a cell previews a candidate change; **Apply to scenario** is explicit and undoable.

### Risk

Use a structured risk register grouped by title, permit, construction, valuation, financing, timeline, exit, occupancy and market, matching actual engine flags. Evidence completeness is a separate lens, not a tenth measured risk score.

For each flag show severity, trigger, affected paths and next verification action. No flags is not “verified safe.” Empty and unassessed categories say so. Avoid a radar chart: the categories have not been calibrated onto one comparable numeric scale.

Diligence checklists start unverified. Visitor checkmarks record only a visitor statement, not professional validation or a new funding/permit commitment. Contextual timeline planning belongs here or in Assumptions; Overview gets only its relevant status.

### Memo

Produce one coherent brief: property and active scenario; automated thesis; ranked paths; key economics; sensitive assumptions; unresolved flags; verification checklist; next diligence step; model/version/time and boundaries.

The displayed brief, copied text, supported export and intake handoff must refer to the same active scenario and input revision. Do not export stale values after editing the screen.

Keep **Copy summary**, **Save locally**, **Discuss with Peggy** and **Carry into intake** honest about their scope. Add a printer-friendly memo usable with the browser's Save as PDF as an initial local output. A dedicated server PDF or hosted share link is a later integration unless the actual public route is demonstrated to support it. No visible dead controls, false “saved” states or public sharing by default.

## 7. Visualization contracts

| Visual | Meaning and data | Interaction | Integrity / fallback |
|---|---|---|---|
| Decision canvas | Relationships across basis, funding, execution and exit for the active analysis | Select stage; synchronize inspector | A schematic with labeled nodes, not weighted cash flows unless amounts reconcile |
| Funding breakdown | Supported `capitalStack` amounts plus `totalCashIn` | Select segment to inspect inclusion/rate | Direct values and accessible table; label acquisition funding basis, not committed financing |
| Ranked paths | Actual nine lanes, verdicts and reasons | Select path; expand evidence | No synthetic 0–100 badges or forced positive winner |
| Scenario comparison | Separate engine runs with explicit input deltas | Compare and select active scenario | Common units/periods; no relabeling of internal rental stress cases |
| Sensitivity matrix | Actual `SensitivityGrid` axes/cells/metric for a supported path | Keyboard/tap inspection; explicit apply | Text alternative, units, semantic legend; unavailable grid says unavailable |
| Execution timeline | Visitor-entered phases, durations and dependencies | Edit timing and inspect affected phase | Illustrative plan, not permit forecast; timing affects economics only once a tested adapter supports it |
| Risk register | Actual triggers plus explicitly missing evidence | Expand a flag; filter by path | Unassessed is distinct from low severity; no invented global risk grade |

The engine currently calculates sensitivity for a limited set of eligible high-ranked lanes. Selecting a different lane must not show another lane's grid under its name. Extending grid generation is separate typed, tested work.

For an execution timeline, accept due diligence, design/permit, construction, stabilization and exit phases. Use plain durations/dependencies rather than inventing dates. Reject negative durations and dependency cycles. If changing schedule does not yet affect the engine's costs, explicitly label it as planning-only. Do not imply a financial linkage through animation alone.

## 8. Mobile, accessibility and state continuity

At 390px, use one column with a compact property/scenario header, the five-view navigation and a readable analytical focal point. Let the navigation wrap into two rows when necessary. Do not shrink desktop charts or place a long settings form ahead of the results.

Transform the decision canvas into a vertical relationship view. The assumption editor and inspector become labeled sheets or in-flow panels with Escape/close, focus return and keyboard-safe scrolling. All core content must remain reachable without hovering or dragging.

Dense comparisons can use a clearly labeled, locally scrollable table or a single-scenario view with a fixed base comparison. The whole page must not overflow horizontally. A sensitivity grid needs a usable table/list alternative on a phone.

Keep view, selected strategy and calculator deep links shareable through bounded UI state such as `view` and `lane`. Never put contact details or private model inputs into URLs. Preserve the existing `tool=calculators&tab=...` contracts, calculator focus behavior and reduced-motion support.

Preserve browser-local draft restoration from v3 and v2. New fields require a validated schema migration or a compatible envelope; never discard a user's draft because the interface changed. If browser storage is blocked, the current in-memory model must continue to work and saving must report failure honestly.

Do not infer cloud persistence, email delivery or auth success from a local UI state. Share/export permissions and consent are distinct concerns.

## 9. Site-wide refinement after the first Lab preview

Retain the approved homepage structure and visual identity. The Lab gets richer analysis; the website does not inherit a dashboard everywhere.

| Page / journey | Specific refinement | Preserve |
|---|---|---|
| Home | Stronger editorial hierarchy, clear service positioning, deliberate photograph/text rhythm, fewer repeated explanations | Six sections, approved hero and founder/project assets, three visitor paths |
| Property Owners | Calm property-specific prompts, useful evidence and clear next action | Nine situations, selected context into intake, no implied acquisition/repair guarantee |
| Work With Apollo | More precise construction/operations story, distinctive portrait composition, decisive buying/selling paths | Real identity, current verified representation boundaries, distinct brokerage form |
| Deal Partners | Clear contribution/need relationship, tighter hierarchy and selective tone | Partner-need continuity, general proposal not defaulting to capital, role/consent constraints |
| Our Work / Nelson | Challenge → decisions → intervention → documented outcome | Canonical facts, genuine role attribution, accounting qualifications and real imagery |
| About | Founder point of view grounded in actual experience, not a generic large-firm biography | No invented team, achievements, portfolio or capacity |
| Contact / intake / footer | One clear next action, consistent type/spacing, humane errors and accurate receipts | Existing validated submission contracts, notices, privacy and context |

Every retained section must earn its place by explaining the business, demonstrating evidence, enabling a decision or supporting the next action. Remove redundant marketing explanation, not substantive disclosures. Locked/legal copy changes require their designated approval; a design pass must not silently delete them to look more confident.

## 10. Definition of the first meaningful delivery

A protected preview of `/strategy-lab` must demonstrate this complete interaction:

**Load clearly labeled example → see real engine-backed Overview → edit basis/scope → observe funding, path information and relevant results update → open Scenarios → compare explicit alternatives → inspect a risk → read the matching Memo.**

Both the fresh empty state and populated state must work. Owner, calculator and intake paths remain accessible. A working core slice is a checkpoint, not a claim that the whole website redesign or live business operation is finished. Produce this before broad site-wide refinements; remaining advanced extensions must be named explicitly rather than implied by the first preview.

Do not wait to perfect every supporting page before showing this slice. During Tasks 1–2, render and inspect the Overview on desktop and mobile; publish that coherent interim screen as soon as it is testable, explicitly labeling which of the five views are not finished. Do not present unfinished views as working. Do not deliver five impressive tab labels around empty or decorative panels. Unsupported integration actions stay honestly unavailable until implemented.

## 11. Implementation map and review focus

### Existing integration points

- `client/src/pegasus/strategy-lab-experience.tsx`: actual public entry and existing behavior to retain.
- `client/src/pegasus/strategy-lab.css`: existing Lab styles; scope changes to the Lab.
- `client/src/pegasus/strategy-lab-handoff.ts`: intake handoff contract.
- `client/src/pegasus/Landing.tsx` and `client/src/pegasus/pages.tsx`: routing proof; minimal changes only.
- `client/src/components/strategy-lab/calculator-tools-panel.tsx`: existing calculator selector/deep links.
- `shared/strategy-lab/index.ts` and `types.ts`: canonical engine and types.
- `shared/strategy-lab/scenarios.ts`, `sensitivity.ts`, `lanes.ts`: focused inspection before numerical extensions.
- `client/src/__tests__/pegasus-landing-a11y-v6.test.tsx`: mounted public-shell regression coverage to update for the approved five-view design without dropping accessibility assertions.
- Existing tests for drafts, handoffs, calculator routing and public-route safety must remain passing.

### Proposed new files, not existing capabilities

Create a focused `client/src/pegasus/intelligence-desk/` folder with `state.ts`, `model.ts`, `scenario-model.ts`, `Overview.tsx`, `Assumptions.tsx`, `Scenarios.tsx`, `Risk.tsx`, `Memo.tsx`, `DecisionCanvas.tsx`, `CapitalBreakdown.tsx` and scoped styles. Collapse files only when their responsibility is genuinely trivial; do not build another thousand-line parallel page.

The public `PremiumStrategyLab` entry remains a thin integration shell. The state/model modules own validation and adapters; views consume typed data and callbacks. Charts never introduce independent financial formulas.

### Five review traps requiring explicit tests

1. A user enters blank, malformed, negative, excessive or zero-denominator values: results become unavailable as appropriate, never reassuring zeroes or NaN/Infinity text.
2. The user changes scenario or inspects another path: cards, charts, memo and handoff agree on their scope; no borrowed grid or stale top-path memo.
3. The user restores an old draft or storage is blocked: old valid data survives; failures do not break editing or falsely report persistence.
4. A user arrives through an existing calculator link or uses Back: the intended view/selector, state and focus remain correct.
5. A phone keyboard or small viewport is active: fields, chart inspection, panel close and the main action remain reachable without page overflow.

## 12. Execution tasks

### Task 0: Recover once and prove the preview route

- [ ] Read `AGENTS.md` and required source-of-truth documents; inspect dirty work without overwriting it.
- [ ] Confirm the canonical branch head and public mount chain above. Record baseline failures separately from introduced failures.
- [ ] Open the current project with the existing repository-connected environment and verify a supported preview deployment method before major UI work.
- [ ] Prove a protected preview can be opened using a fresh owner-access link. A project URL or READY state alone is not sufficient.
- [ ] Do not repeat the Chat Vercel connector's known empty-argument deployment call. It repeatedly failed schema validation before any deployment. Use the existing authenticated Work environment's supported deployment path; if no supported path exists, identify the exact one-time approval/configuration needed immediately.

Useful recovery commands, run from the existing repository:

```bash
git status --short --branch
git fetch origin
git rev-parse HEAD
git log -5 --oneline
rg -n 'PremiumStrategyLab|StrategyLabPage|strategy-lab-experience' client/src/pegasus
```

This task is not permission to create a new hosting account, expose production secrets or move domains.

### Task 1: Pin the engine and state contract before rearranging the public UI

**Files:** proposed `intelligence-desk/state.ts`, `model.ts`; existing public component; new focused model/draft tests.

**Consumes:** `PropertyInput`, `RunOptions`, `StrategySnapshot` and the current draft/handoff contracts.

**Produces:** a validated draft representation, a discriminated ready/missing/invalid analysis state and a single adapter that calls `runStrategyLab`. Keep engine output typed; do not parse formatted display strings back into money for calculations.

- [ ] Add characterization coverage for all nine lane identifiers, sample cash requirements, missing inputs and existing draft recovery before implementation.
- [ ] Run targeted tests and establish which failures describe new desired behavior.
- [ ] Extract the current input adapter and draft logic without changing financial behavior. Define provenance/missingness explicitly for new fields.
- [ ] Keep one immutable base state plus explicit scenario modifications. Bind the active output to a stable input revision.
- [ ] Run targeted and existing draft/handoff tests; review the diff; commit this coherent unit.

A concrete independent engine fixture to include in characterization tests:

```ts
import { expect, it } from 'vitest';
import { runStrategyLab } from '@shared/strategy-lab';

it('reconciles the modeled acquisition funding without inventing capital', () => {
  const snapshot = runStrategyLab({
    askingPrice: 600_000,
    purchasePrice: 600_000,
    rehabBudget: 105_000,
    arvEstimate: 840_000,
    marketRent: 4_500,
  }, {
    loanLtvPct: 75,
    loanRatePct: 7.5,
    closingReservePct: 3,
    now: new Date('2026-09-01T00:00:00Z'),
  });
  expect(snapshot.totalCashIn).toBeCloseTo(273_000, 2);
  expect(snapshot.capitalStack.reduce((sum, row) => sum + row.amount, 0))
    .toBeCloseTo(723_000, 2);
  expect(snapshot.lanes).toHaveLength(9);
});
```

These amounts are a synthetic model fixture, not Nelson results or an investment claim. `723,000` is the modeled acquisition/scope/closing-reserve basis, not a fully burdened lifetime project cost.

### Task 2: Build the engine-backed Overview and Assumptions

**Files:** public entry, proposed Overview/Assumptions/DecisionCanvas/CapitalBreakdown components and scoped CSS; public-shell and interaction tests.

**Consumes:** the single validated draft/analysis state from Task 1.

**Produces:** five-view navigation, empty/example/populated states, actual canvas relationships, ranked paths and editable assumptions, with remaining views supplied by subsequent tasks rather than fake content.

- [ ] Write a mounted-route test expecting the approved view names and no recommendation in the empty state. Run it before the change to capture the expected failure.
- [ ] Replace the four-step wizard chrome in the actual public component, preserving calculator/draft/Peggy/intake boundaries.
- [ ] Implement responsive context/canvas/inspector composition and an opt-in labeled example. Inputs affect the canonical snapshot, not dummy numbers.
- [ ] Add capital reconciliation and selected-path/inspector tests. Explicitly test that selecting a lane cannot impersonate the top-lane memo or another lane's sensitivity.
- [ ] Test changing a valid scope amount and then an invalid rate; visible summaries update or gate correctly. Test keyboard use and dark-mode geometry.
- [ ] Capture populated and empty desktop/mobile renders, visually inspect them, run targeted tests and commit.

### Task 3: Implement whole-model Scenarios and truthful sensitivity

**Files:** proposed `scenario-model.ts`, `Scenarios.tsx`; reuse existing sensitivity components only after reviewing their accepted props and semantics.

**Consumes:** normalized base input and the canonical engine. **Produces:** independent Base/Conservative/Upside runs, explicit deltas, active scenario and correctly attributed sensitivity inspection.

- [ ] Add tests proving each scenario equals a direct `runStrategyLab` call using its own inputs and a fixed clock.
- [ ] Add tests that scenario edits cannot mutate base or another scenario, unknown values remain unknown, and preset percentages stay within input bounds.
- [ ] Implement the explicit presets in Section 6 and the difference table. Keep internal rental stress cases separately labeled.
- [ ] Render only a sensitivity grid that matches the selected lane; otherwise show a precise unavailable state. Add keyboard/tap cell inspection and an explicit apply/reset action only where the axis-to-input mapping is defined.
- [ ] Verify a downside edit changes the economic outputs as the engine specifies; do not assume every strategy rank must move monotonically.
- [ ] Run tests, inspect phone comparisons and commit.

### Task 4: Risk, Memo and execution context

**Files:** proposed Risk/Memo components; public integration/handoff; dedicated print styles and focused tests.

**Consumes:** active scenario output, missing evidence and user-entered planning context. **Produces:** coherent flags/read/checklist and outputs tied to the same analysis revision.

- [ ] Add tests for an unassessed title/permit state, a triggered risk and a memo that changes after an input/scenario change.
- [ ] Implement the risk register from engine flags; never invent a severity for an unmeasured category.
- [ ] Implement the matching automated memo, copy action, local save and printer-friendly output. Clipboard, browser-save and print limitations must be reported accurately.
- [ ] Keep existing handoff data fields compatible. New scenario/provenance additions require versioned validation and tests so old consumers remain safe. Do not silently drop active-scenario context.
- [ ] Add a compact user-entered execution timeline with validated durations/dependencies. Clearly distinguish planning-only timing from financially modeled timing until a tested cost adapter exists.
- [ ] Verify all of this with synthetic/local requests only. Preserve real email, account and production activation as separate gates.
- [ ] Run targeted tests, inspect the complete core journey and commit.

### Task 5: Deliver the first working desk before broad site polishing

- [ ] Complete the Section 10 interaction sequence above using the actual route in desktop and phone-sized browsers.
- [ ] Run `npm run check`, `npm test`, `npm run build` and the repository's full rendered accessibility/route gate. Use current documented runner setup; do not invent success from an unfinished job.
- [ ] Deploy the exact reviewed revision to the existing protected preview project using the verified deployment method.
- [ ] Open the fresh share URL in a clean browser context; confirm images, route, current code and at least one real local-model interaction.
- [ ] Deliver the link, build SHA, screenshots and plain statement of tested/unavailable integrations to Apollo. Obtain visual feedback before propagating unapproved style changes across the rest of the website.

### Task 6: Apply approved sophistication across the site

**Files:** the existing mounted page files listed in Section 9, shared public styles as necessary, relevant route/layout tests.

- [ ] Begin with a current screenshot and one concrete finding per page, not a new wholesale redesign.
- [ ] Refine hierarchy, wording, image placement and section purpose in small reviewable page groups.
- [ ] Test every visitor path to its actual destination, including owner/partner context and brokerage separation.
- [ ] Preserve the approved homepage sequence and imagery; do not turn the marketing pages into miniature Lab dashboards.
- [ ] Run the full matrix, publish one current preview, and show Apollo the complete paths rather than another isolated hero image.

## 13. Verification and acceptance gates

Use the repository's actual commands:

```bash
npm run check
npm test
npm run build
npm run check:a11y:full
```

Run the last command in the repository's documented browser/fixture environment. Existing CI provides its own setup. Do not invoke `db:push` or a live intake smoke script as a substitute for local UI verification without checking its effects and required authorization.

Required evidence: desktop 1440px, tablet 1024px and 768px, phone 390px, light and dark; additional narrow checks at 320/360/430px for the new workspace. Check readable zoomed text, no full-page overflow, fixed headers, keyboard focus, reduced motion, storage/clipboard failures, empty/error states and console/network errors. Distinguish physical-device testing from browser emulation.

### Acceptance gates

**Numerical:** deterministic input/output tests; scenario equivalence; funding reconciliation; no NaN/Infinity; correct units, periods and exclusions; no misuse of confidence scores; missingness respected.

**Functional:** five working views; synchronized selection; original calculators/deep links; old draft recovery; active-scenario memo/handoff; preserved owner/partner/representation paths.

**Visual:** obvious focal point; no equal-weight dashboard wall; legible real numbers; parchment/navy/copper restraint; desktop and mobile composed deliberately; dense data does not become cramped.

**Preview:** actual current revision, working owner-access URL, correct route content and visible interaction verified after deployment. Label controlled fixtures and unavailable live services explicitly.

**Production:** separate approval and environment/receipt verification. Passing the other gates does not grant production approval.

## 14. Progress, stopping and delivery rules

Make focused commits; verify locally where the environment permits before triggering expensive full runs. Preserve deterministic installs and all required release gates. Diagnose a failed assertion once, fix the cause, rerun the relevant test; do not run an unchanged failing job repeatedly or inflate timeouts reflexively.

Progress reports should say: **completed / evidence / next / blocked**. Do not report “still working” without a concrete artifact, tested change or precise blocker. Do not repeatedly request permission for details already settled in this document. Ask only for genuine business/source contradictions, consequential scope changes, missing private configuration or regulated/production decisions.

Preview publishing is an early work item, not a surprise discovered after the whole build. A working fallback cannot be a fake live URL or an old deployment with a new label. Clearly labeled local/browser evidence is useful but does not satisfy the hosted-preview gate.

The final delivery includes one current protected preview link, exact source revision and deployment identity, passing verification evidence, desktop/mobile images, a short list of meaningful changes, and known limitations. Preserve the accepted application state even when one optional integration remains blocked.

## Source references

Repository observations in this brief are anchored to the inspected application revision, not to screenshots of an older hosted deployment:

- [Public mount](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/blob/1a34ef52ef03b44894da1ab50ada65a1f617af68/client/src/pegasus/Landing.tsx)
- [Public page wrapper](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/blob/1a34ef52ef03b44894da1ab50ada65a1f617af68/client/src/pegasus/pages.tsx)
- [Actual public Strategy Lab](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/blob/1a34ef52ef03b44894da1ab50ada65a1f617af68/client/src/pegasus/strategy-lab-experience.tsx)
- [Engine implementation](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/blob/1a34ef52ef03b44894da1ab50ada65a1f617af68/shared/strategy-lab/index.ts)
- [Engine type contracts](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/blob/1a34ef52ef03b44894da1ab50ada65a1f617af68/shared/strategy-lab/types.ts)
- [Recorded baseline verification](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/actions/runs/35047601866)
- [Repository instructions](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/blob/1a34ef52ef03b44894da1ab50ada65a1f617af68/AGENTS.md)
- [Package scripts](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/blob/1a34ef52ef03b44894da1ab50ada65a1f617af68/package.json)
