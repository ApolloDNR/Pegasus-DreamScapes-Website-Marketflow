# WoofWatcher Locked Business Plan + Product Requirements v1.0

Last updated: 2026-06-10
Owner: Apollo / WoofWatcher
Status: Locked strategic direction; implementation details may evolve through controlled backlog.

## 0. Builder note

This document is the source-of-truth brief for the next WoofWatcher build pass. Do not treat the current app as a generic dog tracker. The v1 foundation exists; the next product layer is the living-care companion system.

The builder should preserve the current local-first PWA foundation while evolving the user experience around Phoenix as the interface, Household Pulse, effortless logging, Diet & Treats, Alone Time, Care Pass, and WoofGuide.

## 1. Locked product thesis

WoofWatcher is a living dog-care companion for households.

It is a real-life Tamagotchi-style care companion for an actual dog: the human logs real-world care only when something really happens, and the dog avatar reacts to the shared care state.

Core promise:

> Your dog's day, brought to life.

Expanded promise:

> Log real care in seconds. Watch your dog's avatar react. Keep the household in sync. Spot patterns. Share vet/sitter/trainer-ready Care Passes.

What this is not:

- Not a generic dog log.
- Not a fake virtual pet game.
- Not a veterinary diagnosis tool.
- Not a guilt/streak app that shames owners.
- Not a social network.

## 2. Locked brand choices

### Name

WoofWatcher.

Do not rename to Wolf Watcher, Wolf Watch, Woof Watch, or any other variant. Use one word: WoofWatcher.

### Tagline

Primary: Your dog's day, brought to life.

Secondary: Smarter care. Happier dogs.

### Brand direction

Premium playful care companion.

Visual feeling:

- Warm, premium, trustworthy.
- Illustrated and emotional, not childish.
- Clean enough for real health/records/report use.
- Phoenix-first, not spreadsheet-first.

### Logo direction

Use the favorite logo direction from exploration: a custom navy-and-white shepherd/Phoenix side-profile mark with a copper heart collar tag and a WoofWatcher wordmark.

Refinements:

- Dog should read as custom Phoenix/shepherd-inspired, not generic husky stock art.
- Copper heart should feel integrated as a collar tag, not a floating generic heart.
- Wordmark split: Woof in navy, Watcher in copper.
- Avoid paw-heart stock marks, vet-badge circles, generic happy dog faces, and medical-cross logos.

### Palette

- Deep Navy: #0F1F33 / #1A2332
- Copper: #C46B3A / #C87A3A
- Sage: #6F8F74 / #8FAD98
- Cream/Ivory: #F7F5F1 / #FFF8EC
- Stone: #E5E2DC
- Amber: #D8AA52 for watch/attention states
- Rose: #C96358 for health-review/concern states

Do not drift into bright generic pet-app colors unless testing proves the current palette fails.

## 3. Product positioning

One-sentence pitch:

> WoofWatcher helps households care for their real dog through a living avatar, one-tap logging, smart routines, health-aware patterns, and shareable Care Passes.

Short pitch:

> WoofWatcher turns everyday dog care into a living companion experience. Log meals, treats, walks, potty, moods, vomiting, training wins, alone time, vet visits, vaccines, and documents in seconds. Your dog's avatar reacts to real life, while WoofGuide helps your household spot patterns, stay in sync, and prepare vet/sitter/trainer summaries.

Competitive edge:

Most competitors can log events and show reminders. WoofWatcher must own the emotional household layer:

- Phoenix is the interface.
- Real-world care drives the avatar.
- Household Pulse reduces texting/guessing.
- Diet, Treats, Alone Time, and Bile Watch make it feel built for real anxious/rescue dogs.
- Care Passes convert daily care into useful summaries for vets, sitters, trainers, and emergencies.
- WoofGuide learns the dog's personality and context without pretending to be a vet.

## 4. Target customer

### Primary wedge

Couples, roommates, and families caring for one dog together.

### Beachhead

Anxious/rescue dog households.

Why this beachhead works:

- Routine matters.
- Appetite and food gaps matter.
- Alone time matters.
- Training progress matters.
- Vet-ready context matters.
- Multiple humans need to avoid guessing and nagging.

### Later segments

- Puppies.
- Senior dogs.
- Dogs with medication routines.
- Multi-dog households.
- Sitters/trainers/rescues/fosters.
- Cats later, but not in the first locked scope.

## 5. Product doctrine

### 5.1 Phoenix is the interface

The app opens on Phoenix's current state, not a spreadsheet.

Phoenix should show:

- mood
- energy
- last meal
- last walk
- last potty/poop/pee when known
- next plan
- health watch status
- household presence status
- suggested action
- a short personality comment

### 5.2 Logging must be effortless

Default interaction is one tap:

> Tap what happened. Done.

Optional details appear only when useful.

### 5.3 The app should ask for less than it gives back

Every log should improve:

- Phoenix's avatar state.
- Household Pulse.
- Plans/reminders.
- Health patterns.
- Diet/treat context.
- Training progress.
- Care Pass quality.
- WoofGuide memory.

### 5.4 No guilt, no micromanagement

Avoid: "You failed to walk Phoenix."

Use: "No walk logged yet."

Unknown is acceptable. Optional details stay optional. Quiet mode and nudge budget are required.

### 5.5 Phoenix is personality; WoofGuide is guidance

Phoenix can be playful and emotional.

WoofGuide must be careful, explanatory, and non-diagnostic.

Example:

Phoenix: "My tummy was weird. Let's keep an eye on me."

WoofGuide: "Phoenix had one yellow-bile event after a longer food gap. This is not veterinary advice, but it may be useful to track appetite and energy and include repeated events in a vet report."

### 5.6 Health language must be vet-safe

Use:

- Pattern noticed.
- Worth monitoring.
- Consider sharing with your vet.
- Not veterinary advice.

Avoid:

- Diagnosing.
- Treatment instructions.
- Medical certainty.

## 6. Core app pillars

### 6.1 Phoenix Home

The living dashboard.

Includes:

- illustrated/animated Phoenix card
- speech bubble
- mood and energy
- last meal, last walk, last potty/poop/pee when known
- next best action
- Household Pulse summary
- health watch status
- quick actions
- presence state: alone, with human, unknown, away, etc.

### 6.2 Effortless Log

One-tap categories:

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

Optional detail examples:

- Meal: ate all / most / some / refused.
- Vomit: yellow bile / food / foam / unknown.
- Walk: calm / excited / reactive / tired.
- Alone Time return: calm / anxious / accident / vomit / destructive / unknown.
- Training: loose leash / recall / place / calm around dogs / other.

### 6.3 Plans

Future intent.

Plan types:

- walk
- meal
- bedtime snack
- medication
- training
- park visit
- vet visit
- grooming
- alone time
- custom routine

Plans can be assigned to a human and appear on Phoenix Home and Household Pulse.

### 6.4 Diet & Treats

Diet must be a first-class pillar, not a meal-count footnote.

Diet Profile includes:

- primary food
- food type
- normal portions
- breakfast/dinner times
- bedtime snack habit
- treats
- toppers
- supplements
- foods to avoid
- allergies/sensitivities
- appetite quirks
- vet notes

Meal logs and treat logs feed Bile Watch, weight goals, training context, and Care Passes.

### 6.5 Health Watch / Bile Watch

Bile Watch is a signature feature.

Track:

- yellow bile events
- time since last meal
- bedtime snack proof
- appetite after vomiting
- energy after vomiting
- repeat patterns
- caregiver actions
- vet-safe boundary language

### 6.6 Household Pulse

Daily shared awareness.

This replaces everyday "handoff" language.

Household Pulse answers:

- who logged what
- what happened today
- what is next
- what is planned
- whether Phoenix is alone
- whether Phoenix is with a human
- whether anything needs attention
- whether everyone is caught up

### 6.7 Care Pass

Formal sharing/export.

Care Pass types:

- Vet Care Pass
- Sitter Care Pass
- Trainer Care Pass
- Emergency Care Pass
- Weekend Care Pass

Each pass includes only what that recipient needs.

### 6.8 WoofGuide

WoofGuide is the assistant.

Capabilities:

- "Tell me about Phoenix" onboarding.
- Talk-to-log.
- Pattern summaries.
- Vet-prep questions.
- Care Pass drafting.
- Memory suggestions that require human approval before saving.
- No diagnosis.

### 6.9 Avatar customization

Meaningful customization only.

Unlocks should be tied to care milestones, not cheap coins:

- Walk streak -> trail bandana.
- Training consistency -> focus badge.
- Calm week -> cozy blanket.
- Records complete -> health badge.
- Bile Watch stable -> happy tummy charm.
- Alone-time improvement -> brave-home badge.

## 7. Realtime household presence: locked product direction

The system should be smart enough that all humans see the same Phoenix state.

Examples:

- If all household humans are out and Phoenix is at home, Phoenix Home shows "Phoenix is home alone" across all humans' phones.
- If one human returns home, Phoenix becomes "with Emma" or "with Apollo" across the household.
- Away humans can open the app and immediately know Phoenix is not alone.
- If presence is unknown, the app must say unknown rather than invent certainty.

Presence should start privacy-first and confidence-based:

1. Manual "Leaving home" and "I'm home" buttons.
2. Planned Alone Time sessions.
3. Human check-ins.
4. Optional geofence later.
5. Optional device/tracker integration later.

Do not require always-on location for v1.5.

## 8. Business model

### Free

- 1 dog
- 1 household
- up to 2 humans
- one-tap logs
- Phoenix Home
- basic Plans
- basic Health Watch
- basic Household Pulse
- 30-day history
- basic records
- local backup/export

### WoofWatcher Plus

Target pricing hypothesis: $4.99/month or $39.99/year.

Plus unlocks:

- unlimited history
- cloud household sync
- more humans
- multiple pets
- Care Pass PDF exports
- advanced Diet & Treats
- Bile Watch history
- Training Progress
- Alone Time Watch
- document uploads
- vaccine/med reminders
- avatar outfits/accessories
- WoofGuide memory
- talk-to-log
- AI summaries with fair-use limits

### Future Family / Pro

Family: multiple pets and larger households.

Pro: trainers, sitters, rescues, fosters, and small care teams.

## 9. MVP / v1.5 build priority

Next implementation sequence:

1. Rename everyday handoff concepts to Household Pulse. Reserve Care Pass for export/share.
2. Add Phoenix State Engine.
3. Redesign Phoenix Home around avatar, presence, next action, pulse, and quick log.
4. Add Diet Profile and Treat Log as first-class models.
5. Add Alone Time Watch.
6. Add household presence model and shared-state architecture spec.
7. Add WoofGuide onboarding: "Tell me about Phoenix."
8. Add Talk-to-log draft extraction.
9. Upgrade Care Pass with vet/sitter/trainer variants.
10. Add avatar state visuals and basic animations.

## 10. Product requirements

### 10.1 Phoenix State Engine

Input:

- logs
- routines
- plans
- health flags
- diet/treat data
- alone time
- household presence
- time of day
- pet profile/personality memory

Output:

- mood
- energy
- hunger
- boredom
- anxiety
- healthWatch
- scene
- outfit
- animation
- quote
- suggestedAction
- whyExplanation

Acceptance criteria:

- State is deterministic for the same inputs.
- No random medical concern language.
- Every smart nudge can explain why.
- Health events override playful copy.

### 10.2 Household Presence

Input:

- human home/away status
- last check-in
- source
- confidence
- planned Alone Time
- optional future geofence

Output:

- petPresenceState: withHuman / homeAlone / awayWithHuman / unknown
- supervisedBy
- aloneDuration
- displayCopy
- avatarMoodModifier

Acceptance criteria:

- If all humans are away and Phoenix is home, all devices show home-alone state.
- If one human checks in home, all devices show Phoenix supervised by that human.
- If presence is stale or mixed, show uncertainty.
- Users can override mistaken presence.
- No forced background location in the first version.

### 10.3 Effortless Log v2

Acceptance criteria:

- One-tap log works for core categories.
- Optional detail can be added after the tap.
- Save updates Phoenix State, Household Pulse, Calendar, Health, and Reports.
- Log time should be under 5 seconds for common events.

### 10.4 Diet & Treats

Acceptance criteria:

- User can set default meals, portions, treats, avoid list, toppers, supplements.
- Meal log uses defaults.
- Treats are separate from meals.
- Diet shows in Care Pass.
- Bile Watch can inspect food gaps and bedtime snack proof.

### 10.5 Alone Time Watch

Acceptance criteria:

- User can tap Leaving Home.
- Timer starts.
- Phoenix Home shows home-alone state.
- Returning human can end session and log outcome.
- Outcome options include calm, anxious, accident, vomit, destructive, unknown.
- Data feeds patterns and WoofGuide.

### 10.6 WoofGuide Memory

Acceptance criteria:

- User can describe Phoenix naturally.
- WoofGuide proposes structured memory cards.
- Human approves before saving.
- Memory can be edited/deleted.
- WoofGuide can turn natural language into draft logs.
- No veterinary diagnosis.

## 11. Metrics

Activation:

- dog profile created
- first log created
- first plan created
- first Household Pulse viewed
- first "Tell WoofGuide about Phoenix" completed

Retention:

- 3-day repeat log
- 7-day repeat log
- weekly Pulse viewed
- monthly Care Pass/Report generated

Quality:

- average log time
- notification mute rate
- user-reported overwhelm
- correction rate for presence state
- care-pass export success

Monetization:

- Plus trial start
- Plus conversion
- cloud sync adoption
- Care Pass usage
- WoofGuide usage

## 12. Risks and safeguards

### Risk: Too much logging

Safeguard: one-tap first, optional details, smart defaults, no guilt.

### Risk: Health overclaiming

Safeguard: pattern tracking, not diagnosis; vet-safe language.

### Risk: Location/privacy concern

Safeguard: manual presence first, opt-in geofence later, no precise location display by default.

### Risk: Avatar feels random

Safeguard: deterministic Phoenix State Engine and "Why Phoenix says this" explanations.

### Risk: Generic pet app positioning

Safeguard: lead with Living Care Twin, Household Pulse, Diet/Bile, Alone Time, Care Pass, WoofGuide.

## 13. Definition of done for the next build slice

A build slice is not done unless:

- Tests exist for new core logic.
- Existing smoke route covers the new primary screen.
- Docs are updated.
- Health language is vet-safe.
- UI follows the locked palette/style.
- No private Phoenix data is exposed publicly.
- New smart behavior has a "why" explanation.

