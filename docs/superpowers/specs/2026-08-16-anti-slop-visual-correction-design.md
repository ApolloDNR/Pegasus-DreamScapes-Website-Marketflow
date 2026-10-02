# Pegasus DreamScapes — Anti-Slop Visual Correction Design

Date: 2026-08-16
Status: Design specification for owner review
Authority: `docs/design/final-design-lock.md` (2026-08-06) supersedes older Website Structure / v1 FINAL presentation guidance where they conflict.

## Goal

Remove the visible "AI-generated luxury SaaS" feel without changing the business model, compliance posture, core routes, or proven backend behavior. The finished site should feel like a serious East Bay real-estate operating company designed by a strong architecture/editorial studio: restrained, specific, founder-led, image-led, and operationally credible.

## Audit finding: implementation drift is the main problem

The current recovery branch contains visual decisions that conflict with the newer Final Design Lock. That drift explains much of the generic/AI feeling.

### 1. Homepage hero is using the wrong visual source

Current `HeroPicture` uses the generic `/images/hero/luxury-home-*` family.

Final lock requires one canonical image across desktop/tablet/mobile:

- `/images/hero/pegasus-v6-arrival.webp`
- elevated East Bay/Bay panorama
- slim, close, full-height limestone colonnade on the right
- one photographed environment, not a generic property hero

Correction: restore the canonical arrival artwork as the only homepage hero source and use responsive crop/filter treatment only. Do not substitute a different scene by breakpoint or theme.

### 2. Homepage hero copy and CTA hierarchy drifted

Current implementation leads with:

- `Complex property.`
- `Structured opportunity.`
- additional explanatory paragraphs
- three competing hero buttons including `Work With Apollo`
- repeated philosophical line and tagline

Final lock requires:

- eyebrow: `Real estate operating company` / `Contra Costa & Alameda`
- headline: `Complex real estate,` / italic copper `made executable.`
- actions, in order: `Bring an Opportunity`, `See How We Operate`, `Open Strategy Lab`

Correction: restore the locked hierarchy. The first viewport should communicate one idea, one primary action, and two subordinate actions. Remove nonessential hero prose that makes the fold read like an AI-written pitch deck.

### 3. Prohibited decorative AI motifs are present

The current hero includes animated blurred gradient circles/orbs and multiple color-overlay layers. The Final Design Lock explicitly bans decorative gradient blobs/orbs and limits each page to one signature interaction.

Correction:

- remove animated blur orbs completely
- keep only the minimum photographic grade / legibility treatment needed for the canonical arrival image
- no gratuitous glow, floating decorative graphics, or motion that exists only to make the page feel "premium"
- homepage signature moment remains the Pegasus deal map / Opportunity Plan below the first fold, not animated hero decoration

### 4. Navigation regressed to an older information architecture

Current primary navigation is:

- Deal Strategy
- Development
- Strategy Lab
- Represent With Apollo
- MarketFlow

The Final Design Lock requires:

- How We Operate
- Property Owners
- Deal Partners
- Our Work
- About
- sole header CTA: Bring an Opportunity

Strategy Lab is subordinate utility. MarketFlow must stay out of the primary header and remain a private-pilot/footer path.

Correction: restore the locked primary navigation and make the header quieter. Remove feature/product jargon from the first-level navigation.

### 5. Repeated section formula creates template fatigue

The homepage currently repeats the same visual grammar across many sections:

- section number
- hairline
- uppercase eyebrow
- oversized serif heading
- italic deck
- cards or horizontal rows
- copper micro-labels

This makes the page technically consistent but visually synthetic.

Correction: keep one coherent type/spacing system but vary composition by job:

- Arrival: image-led editorial hero
- Proof rail: thin, quiet four-item evidence row
- Visitor routing: open editorial split/rail, not four identical feature cards
- Nelson proof: large real-property evidence with restrained numeric facts
- Operating method: one Pegasus deal-map signature visual
- Capabilities: editorial index/list, no card grid
- Founder trust: portrait + short verified biography
- Final invitation: minimal close, one dominant CTA

Do not number every section. Use Cinzel/copper labels sparingly, only where they create an architectural/editorial cue.

### 6. Card, icon, badge, and microcopy density is too high

The homepage and product surfaces repeatedly use icon boxes, badges, uppercase micro-labels, pills, numbered tiles, borders, and tiny tracked text. Strategy Lab also stacks multiple explanatory ribbons before the user reaches the actual tool.

Correction:

- cards only for repeated objects that genuinely need containment
- no card-inside-card patterns
- remove decorative icon containers where text hierarchy is sufficient
- reduce all-caps microcopy count by at least half on marketing pages
- use copper as a punctuation mark, not a fill color on every component
- eliminate duplicate "how it works" ribbons in Strategy Lab; one concise orientation layer is enough
- no public-facing internal-product taxonomy unless it helps the visitor make a decision

### 7. Strategy Lab should feel like a real underwriting workstation, not a demo of a workstation

The core three-zone cockpit architecture is strong and should remain. The problem is the amount of explanation wrapped around it.

Correction:

- keep the cockpit hero concise
- one short directional disclosure near the first meaningful action
- one view switcher: Cockpit / Assumption Desk / Calculators
- remove redundant tier ribbon + second guided ribbon if both communicate the same journey
- prioritize property inputs, live read, economics, risk, and next move
- keep typography functional inside the tool: Inter for UI, Playfair sparingly for key verdict/section moments
- remove visual ornament that competes with the numbers

### 8. MarketFlow must visually read as a controlled private pilot

MarketFlow should not resemble a broad public marketplace or generic proptech SaaS dashboard.

Correction:

- remove it from primary navigation
- use restrained access-state language and explicit reviewed/private-pilot framing
- emphasize real deal/buy-box information over decorative status UI
- no fake metrics, fake inventory, fake activity, or dashboard chrome used only as visual filler
- visually distinguish MarketFlow as an operational tool inside Pegasus, not a second unrelated brand

## Visual system

### Typography

- Marketing display: Playfair Display
- Body + functional UI: Inter
- Cinzel: rare architectural accent only
- no negative tracking on large display type
- avoid excessive italic copy; reserve italic for the copper headline phrase and occasional editorial quotation

### Color

- deep midnight/navy as the primary digital base
- warm cream as editorial contrast
- copper used sparingly for focus, rules, CTA emphasis, or one phrase
- no purple/blue SaaS gradients
- no ambient gradient blobs
- dark and light themes should feel deliberately composed, not mechanically inverted

### Geometry

- radius <= 8px unless a pre-existing functional control requires otherwise
- favor open composition, rails, rules, lists, editorial columns, and image fields over nested boxes
- fewer borders; borders should organize information, not decorate every element

### Imagery

- real East Bay/property/founder evidence where available
- one canonical architectural hero image
- no generic luxury-home hero photography
- no raw AI-looking lifestyle/property renders
- architectural linework only where it explains routing/underwriting/operation

### Motion

- one signature moment per page maximum
- homepage: Opportunity Plan / deal map
- Strategy Lab: live state changes in the actual cockpit
- quiet hover/focus transitions elsewhere
- remove decorative perpetual motion from the hero

## Page-specific acceptance criteria

### Home

- first viewport matches the Final Design Lock composition and locked copy
- primary action obvious in under 3 seconds
- no decorative orb/glow effects
- MarketFlow not in primary nav
- proof rail directly supports credibility
- no repetitive numbered-section template down the page
- Nelson proof uses real project evidence
- page feels editorial before it feels "software"

### Strategy Lab

- user reaches real inputs quickly
- visual hierarchy prioritizes deal data over explanation
- redundant ribbons removed
- full cockpit remains understandable at 1440px and usable at 390px
- directional/disclosure copy remains legally clear without dominating the screen

### Work With Apollo

- brokerage/KW/DRE role separation is unmistakable
- Apollo is presented as a real licensed operator, not a generic personal-brand funnel
- seller and buyer paths are straightforward

### MarketFlow

- private-pilot state obvious
- controlled-access identity visually clear
- no impression of a public securities/investment marketplace
- product chrome is functional and restrained

## Verification gate

A page does not pass because CI is green. Each priority route must pass:

1. exact-source build and tests
2. desktop 1440px visual review
3. tablet 768/1024px review
4. mobile 390px review
5. real interaction check for primary CTA/navigation/tool flow
6. no horizontal overflow, broken image, overlay, or console error
7. owner visual acceptance

The squint test: the page has one obvious visual hierarchy.

The swap test: if the Pegasus name were removed, the composition should still not look interchangeable with an AI-generated SaaS or generic luxury real-estate template.

## Implementation order

1. Homepage arrival + header/navigation restoration
2. Homepage section rhythm / card-density reduction
3. Strategy Lab de-cluttering without changing engine behavior
4. Work With Apollo visual and role-clarity pass
5. MarketFlow private-pilot visual pass
6. Submit/form states
7. Desktop/tablet/mobile evidence pass
8. Owner review and final correction loop

## Non-goals

- no new business surfaces
- no new routes for visual novelty
- no backend rewrite
- no public investment claims
- no fake social proof
- no redesign of Pegasus HQ
- no production deployment or DNS change as part of this correction pass
