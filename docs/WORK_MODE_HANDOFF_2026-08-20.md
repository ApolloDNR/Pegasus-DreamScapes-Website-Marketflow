# Pegasus DreamScapes — Work Mode Handoff

Date: 2026-08-20
Canonical integration branch: `codex/launch-recovery-v2`
Canonical PR: #26
Production status: **DO NOT LAUNCH YET**
Owner visual approval: **NOT YET GRANTED**

## Mission

Finish the anti-slop visual correction and produce a materially improved protected noindex preview that Apollo can actually review. Do not spend the Work session rediscovering old branches or redesigning the business model.

## Read first

1. `docs/design/final-design-lock.md`
2. `docs/superpowers/specs/2026-08-16-anti-slop-visual-correction-design.md`
3. `docs/superpowers/plans/2026-08-16-anti-slop-visual-correction.md`
4. PR #26 conversation, newest owner-approved execution directive

## Current branch truth

- PR #26 is the single website consolidation candidate against `main`.
- Do not merge ancestor PR #25 independently.
- The active public site uses the v5.1 Pegasus shell (`HomePageV51`, Pegasus `NavBar`, active Pegasus route components). Do not waste time polishing obsolete homepage/navigation code that is not mounted.
- The v5.1 homepage already contains the locked canonical hero asset `/images/hero/pegasus-v6-arrival.webp`, the locked headline `Complex real estate, made executable.`, the locked public navigation, and `Bring an Opportunity` as the primary header CTA.
- The visual problem is primarily composition/rhythm below the hero, density, repeated section formula, over-explanation, and tool surfaces that can read as demos of tools rather than mature operational products.

## Current CI blocker — solve this first

GitHub Actions `Launch Verification` cannot currently reach tests because `npm ci` crashes on the hosted Ubuntu runner with:

`npm error Exit handler never called!`

This happened repeatedly on Node 22 / npm 10.9.8 and again after explicitly pinning npm 10.9.2. Therefore, do not assume a transient runner failure and do not keep blindly rerunning.

Work must root-cause the install failure in an isolated checkout. Inspect the lockfile/install graph and npm debug log if reproducible. A safe fix may involve the lockfile, package graph, install lifecycle, npm/runtime combination, or CI setup, but do not weaken dependency auditing, delete the lockfile casually, use `--force`, or replace deterministic CI with a non-reproducible install just to get green.

After repair, the full workflow must execute:

1. dependency install
2. matching Chromium install
3. production dependency audit
4. launch environment contract
5. TypeScript check
6. production build
7. rendered accessibility gate
8. full test suite

## Visual implementation order

### 1. Homepage / global chrome

Preserve the approved hero. Improve what comes after it.

- Make the homepage feel editorial and architectural before it feels like software.
- Reduce the repeated number + eyebrow + giant serif + explanatory paragraph + card/row formula.
- Reduce excessive micro-labels, all-caps tracked text, badges, icon boxes, and decorative containment.
- Keep the visitor-routing job obvious without making it a bento-grid or SaaS dashboard.
- Let Nelson Drive carry credibility through real evidence and restrained facts.
- Use the Opportunity Plan/deal map as the one signature interaction.
- Keep founder trust concise and specific.
- End with a quiet, decisive invitation rather than another feature section.

### 2. Strategy Lab

Preserve underwriting/calculation behavior and the three-zone cockpit. Remove demo-like scaffolding around it.

- one concise orientation layer
- one clear view switcher
- prioritize inputs, economics, assumptions, risk, route, and next move
- remove redundant journey/tier ribbons and repeated explanation
- keep disclosures visible but proportionate
- functional typography dominates inside the tool

### 3. Work With Apollo

- make KW / DRE brokerage separation unmistakable
- make seller vs buyer representation paths obvious
- make Apollo feel like a real licensed operator, not a generic personal-brand funnel

### 4. MarketFlow

- controlled private-pilot identity
- no public-marketplace or securities-platform impression
- real buy-box/deal information over decorative dashboard chrome
- no fake activity, fake metrics, fake inventory, or fake status

### 5. Submit / forms / Peggy-facing transitions

- premium intake experience
- loading / validation / error / success states
- preserve backend contracts and security boundaries
- no dead buttons or ambiguous next step

## Browser evidence required

Use the rendered application throughout the Work session, not only source inspection.

Validate priority routes at:

- 1440px desktop
- 1024px / 768px tablet
- 390px mobile

For every priority route:

- inspect first viewport and full scroll
- exercise primary CTA and navigation
- verify imagery/crops
- verify motion and reduced-motion behavior
- verify no horizontal overflow or clipping
- inspect console/network errors
- inspect loading/error/empty states where applicable
- capture before/after screenshots for material changes
- maintain a visual mismatch ledger and keep correcting until a strong architecture/editorial studio would sign off

## Safety boundaries

Do not:

- merge `main`
- deploy production
- change DNS
- mutate live customer data
- change production aliases
- weaken auth/security/disclosures
- weaken CI/audit gates to force a pass

A fresh **protected noindex preview** is allowed and is the required final deliverable.

## Definition of done for this Work session

Do not finish with only a report. Finish with:

1. exact final branch commit SHA
2. exact-head CI evidence
3. fresh protected noindex preview of the materially improved candidate
4. desktop/tablet/mobile screenshot evidence
5. routes/interactions actually tested
6. concise remaining owner-only production gates
7. explicit statement: `Requires Apollo visual approval before merge or launch.`
