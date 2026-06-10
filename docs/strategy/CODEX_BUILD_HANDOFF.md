# WoofWatcher Codex Build Handoff — Edge Layer v1.5

Last updated: 2026-06-10
Status: Ready for implementation planning
Depends on: `docs/strategy/LOCKED_BUSINESS_PLAN_AND_PRD.md`

## 1. Purpose

This document tells the builder what to build next after the existing local-first v1 foundation.

The next layer is not another generic tracking screen. It is the WoofWatcher edge layer: Phoenix as the living interface, effortless logging, household presence, Diet & Treats, Alone Time, Care Pass, and WoofGuide memory.

## 2. Current foundation assumption

Do not restart the app. Preserve the current PWA architecture and care model.

Existing foundation includes:

- local-first state
- logs
- routines/schedule
- handoff/care coordination
- goals/milestones
- care calendar
- training/social progress
- editable records
- Health Watch / Bile Watch
- reports
- backup/import
- OpenAI-ready `/api/care-helper`
- SwiftUI handoff starter

## 3. Build priority

### Slice 1 — Rename and information architecture cleanup

Goal: align the existing app language to the locked product model.

Required changes:

- Rename everyday `handoff` UI concepts to `Household Pulse`.
- Reserve `Care Pass` for export/share with vet, sitter, trainer, emergency contact, or another household.
- Update tab labels and copy so the app no longer feels like formal caregiver handoff when Apollo and Emma are in the same household.
- Do not delete the underlying handoff logic; migrate terminology and structure.

Acceptance criteria:

- UI says Household Pulse for everyday shared status.
- Care Pass is introduced as the formal sharing/export surface.
- Existing tested handoff digest still works under the new naming.
- Reports and WoofGuide can still reference the shared status.

### Slice 2 — Phoenix State Engine

Create a deterministic engine that converts real care data into Phoenix's current avatar state.

Suggested files:

```text
src/phoenix-state.js
test/phoenix-state.test.mjs
```

Inputs:

- logs
- plans
- routines
- health flags
- diet/treat data
- alone time
- household presence
- time of day
- personality memory

Output:

```js
{
  mood: "playful" | "calm" | "bored" | "impatient" | "hungry" | "anxious" | "sleepy" | "watchful" | "not_feeling_great",
  energy: 0,
  scene: "home" | "yard" | "walk" | "park" | "alone_home" | "bedtime" | "vet" | "unknown",
  animation: "idle" | "tail_wag" | "paw_tap" | "sleepy_blink" | "ears_back" | "zoomies" | "low_energy",
  quote: "string",
  suggestedAction: { type: "walk", label: "Walk in 35 min" },
  why: ["No walk logged today", "Walk is planned for 5:30 PM"],
  severity: "playful" | "helpful" | "watch" | "serious"
}
```

Acceptance criteria:

- Deterministic for the same state/time input.
- Health events override silly copy.
- Every avatar state has a `why` explanation.
- No diagnosis language.
- Test states: bored, hungry/watchful, excited for planned walk, home alone, happy/calm when supervised, proud after training win, not-feeling-great after vomit.

### Slice 3 — Household Presence and Alone Time Watch

The system must know, with clear confidence, whether Phoenix is alone or with a human.

Start manual/privacy-first before geolocation.

Suggested model:

```js
householdPresence: {
  humans: {
    apollo: { status: "home" | "away" | "unknown", source: "manual" | "plan" | "geofence", updatedAt: "ISO" },
    emma: { status: "home" | "away" | "unknown", source: "manual" | "plan" | "geofence", updatedAt: "ISO" }
  },
  petStatus: "with_human" | "home_alone" | "away_with_human" | "unknown",
  supervisedBy: ["emma"],
  aloneStartedAt: "ISO or null",
  confidence: "high" | "medium" | "low"
}
```

Required UI:

- `Leaving home` action.
- `I'm home` action.
- Home screen presence card.
- Away human sees whether Phoenix is alone or with another human.
- Return check-in sheet: calm, excited, anxious, barking/whining, accident, vomit, destructive, unknown.

Acceptance criteria:

- If all humans are away and Phoenix is marked at home, all devices should show `Phoenix is home alone` once cloud sync exists.
- For local-only prototype, the state should still be modeled cleanly and visible.
- If one human checks in as home, Phoenix state becomes supervised and calmer/happier.
- If data is stale, display uncertainty instead of pretending.
- No mandatory background location in this slice.

### Slice 4 — Effortless Log v2

Improve Quick Log to become the data-feeding loop for the living care twin.

Categories:

- Meal
- Treat
- Walk
- Potty
- Pee
- Poop
- Play
- Zoomies
- Training Win
- Mood
- Anxious
- Vomit
- Medication
- Alone Time
- Vet
- Note

Rules:

- One tap creates a valid useful log.
- Optional details appear only after selection.
- Smart defaults come from Diet Profile and routine schedule.
- Save triggers Phoenix reaction.

Acceptance criteria:

- Meal logs can use default food/portion.
- Treat is separate from Meal.
- Training Win captures accomplishment, not just duration.
- Vomit has yellow bile/food/foam/unknown options.
- Alone Time starts or ends a session.
- Average common log path should be under 5 seconds.

### Slice 5 — Diet Profile and Treat Log

Diet must become first-class.

Suggested model:

```js
dietProfile: {
  foodName: "Blue Buffalo Lamb",
  foodType: "kibble",
  breakfastPortion: "1.5 cups",
  dinnerPortion: "1.5 cups",
  bedtimeSnack: "small chew",
  toppers: ["pumpkin"],
  supplements: ["omega-3"],
  treats: ["training treats", "dental chew"],
  avoid: ["grapes", "chocolate", "onions"],
  appetiteNotes: "Food-anxiety history; watch long gaps."
}
```

Acceptance criteria:

- Diet Profile can be viewed and edited.
- Meal logs pull defaults.
- Treat logs are separate and count toward diet context.
- Bile Watch can inspect food gaps and bedtime snack proof.
- Diet Snapshot appears in Care Pass.

### Slice 6 — WoofGuide Memory

WoofGuide should let the human describe Phoenix naturally and convert that into structured memory.

Flow:

1. Prompt: `Tell me about Phoenix.`
2. User writes or speaks naturally.
3. WoofGuide proposes memory cards.
4. Human approves before saving.

Memory card types:

- Personality
- Diet notes
- Favorite things
- Triggers
- Training focus
- Health watch
- Handling tips

Acceptance criteria:

- No AI silently mutates profile.
- Human must approve memory changes.
- WoofGuide can generate draft logs from natural text.
- All health copy stays non-diagnostic.

### Slice 7 — Care Pass v2

Care Pass is the polished export/share product.

Types:

- Vet Care Pass
- Sitter Care Pass
- Trainer Care Pass
- Emergency Care Pass
- Weekend Care Pass

Acceptance criteria:

- Each pass type includes the right sections.
- Vet Pass includes diet, meds, vaccines, health events, vomit/appetite/stool/energy, records, recent concerns.
- Sitter Pass includes routine, food instructions, anxiety triggers, emergency contacts, medications, house notes.
- Trainer Pass includes training wins, rough spots, triggers, dog exposure, focus areas.
- Export should be PDF-ready later, but can begin as structured HTML/text.

## 4. UI/UX direction

Stay close to the favored mockup direction:

- cream/ivory base
- deep navy shell/sidebar/bottom nav
- copper accents
- sage healthy/completed states
- illustrated Phoenix card as the emotional center
- premium playful, not childish
- desktop dashboard + mobile screen story board

Main nav target:

```text
Phoenix | Log | Plans | Health | More
```

More contains:

- Humans
- Diet & Treats
- Records
- Vaccines
- Documents
- Reports
- Care Pass
- WoofGuide
- Settings

## 5. Future but not now

Do not block v1.5 on these:

- cats
- GPS/AirTag integrations
- public social features
- trainer marketplace
- hardware
- fully animated Rive/Lottie pipeline
- cloud sync if local model is still changing

Design the architecture so they can come later.

## 6. Testing requirements

Every slice must include tests for core behavior.

Minimum gates:

- Node tests pass.
- JS syntax checks pass.
- Chrome render smoke covers the new primary route.
- Health language remains non-diagnostic.
- Backup/import does not break new state.
- Docs are updated.

## 7. Suggested first PR plan

PR 1: `Household Pulse + Phoenix State Engine model`

Include:

- terminology migration in docs/UI
- `phoenix-state.js`
- tests for avatar states
- Home UI consumes state output
- simple Phoenix quote/why block
- no cloud sync yet

PR 2: `Alone Time + Presence model`

Include:

- Leaving Home / I'm Home controls
- presence model
- alone session logs
- return outcome sheet
- Phoenix Home reflects home-alone/supervised state

PR 3: `Effortless Log v2 + Diet/Treats`

Include:

- expanded quick log grid
- diet profile model/UI
- treat log
- smart meal defaults
- report/care pass diet section

