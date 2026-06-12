# WoofWatcher UI Direction Lock — Premium Neo-Retro Pixel Care

Last updated: 2026-06-12
Status: Locked visual direction for next build
Depends on: `docs/strategy/LOCKED_BUSINESS_PLAN_AND_PRD.md` and `docs/strategy/CODEX_BUILD_HANDOFF.md`

## 0. Intent

This is the UI/UX direction to give Replit, Codex, Fable, GitHub/GitLab builders, and future designers.

The selected direction is **Premium Neo-Retro Pixel Care**: a professional, clean, highly navigable care app with a pixel-pet heart. It should feel like real software built by a strong product team, not a loose art moodboard or a toy.

The visual target is the latest focused mockup direction: a polished cream/navy dashboard with a left desktop nav, mobile bottom nav, a large pixel-art Phoenix room on Home, clear status meters, quick action cards, and complete utility pages for logs, plans, health, household, records, reports, Care Pass, WoofGuide, Avatar Studio, and settings.

## 1. Product feel

WoofWatcher should feel like:

- A real-life digital pet care operating system.
- Tamagotchi-inspired, but not fake or manipulative.
- Premium, trustworthy, family-friendly, and usable.
- Fun enough that people want to check in.
- Serious enough for health, medication, records, sitters, trainers, and vets.

Core phrase:

> Real care. Pixel heart.

Primary tagline:

> Your dog's day, brought to life.

Core product promise:

> Care for your real dog. Watch their care twin come alive.

## 2. Design principles

### Clarity first

The app must be easy to navigate. Every important feature must have an obvious home.

### Real care first

The app should never reward fake care. Every playful element must reflect something useful for the living pet.

### Pixel charm with modern reliability

Use pixel art for Phoenix, icons, speech bubbles, badges, status meters, and decorative moments. Use modern, readable UI for cards, lists, forms, and records.

### No guilt, no micromanagement

Avoid shame language. Use neutral, helpful language like "No walk logged yet" instead of "You failed to walk Phoenix."

### Health-safe

Health surfaces must be calm and non-diagnostic. WoofGuide can organize patterns, but never gives veterinary diagnosis.

## 3. Brand system

### Name

WoofWatcher.

### Logo direction

For this neo-retro direction, the logo should lean more pixel-forward than the earlier smooth vector mark.

Recommended logo system:

- Primary wordmark: `WoofWatcher` with a pixel-inspired or blocky display wordmark.
- App icon: pixel Phoenix head or paw/heart mark on deep navy.
- Secondary logo: full pixel Phoenix sitting with copper heart/collar tag.
- Keep the older vector Phoenix profile only as a premium corporate/brand fallback if needed.

### Palette

Use these as design tokens:

```css
:root {
  --cream: #F7F2E8;
  --ivory: #FFF9EF;
  --navy: #081A2A;
  --navy-2: #102C40;
  --copper: #C85A2A;
  --copper-2: #E07A2F;
  --sage: #6DA36F;
  --sage-soft: #E8F3E7;
  --sky: #A9D4FF;
  --amber: #D8A852;
  --rose: #C96358;
  --ink: #142033;
  --muted: #6E7480;
  --stone: #E6DED2;
  --card: #FFFDF7;
}

[data-theme="dark"] {
  --cream: #081420;
  --ivory: #102033;
  --card: #13283C;
  --ink: #F7F2E8;
  --muted: #B9C1CC;
  --stone: #24394D;
}
```

### Typography

Use readable modern type for product UI.

Recommended:

- Primary UI: Inter, Nunito Sans, or system-ui.
- Pixel accent: Press Start 2P, Pixelify Sans, or equivalent. Use sparingly.

Pixel font is allowed for:

- logo/wordmark
- speech bubbles
- badges
- status HUD labels
- XP/level/bond meters

Do not use pixel font for paragraphs, settings, records, reports, health explanation, or form text.

## 4. Navigation architecture

### Mobile bottom nav

Mobile uses a fixed bottom navigation with exactly five primary items:

```text
Home | Log | Plans | Health | More
```

The center `Log` action may be slightly emphasized with a larger paw button.

Do not put every feature in mobile bottom nav. Advanced screens live under More.

### Desktop left sidebar

Desktop uses a left sidebar grouped intentionally:

```text
WoofWatcher logo

CARE & WELLBEING
- Phoenix Home
- Quick Log
- Household Pulse
- Plans
- Health Watch
- Bile Watch
- Diet & Treats

MORE TOOLS
- Care Pass
- WoofGuide
- Avatar Studio

RECORDS
- Timeline
- Records
- Reports
- Achievements

SYSTEM
- Settings

Footer:
- Emma — Primary Human
- Phoenix is with Emma
```

Active state:

- sage/cream active pill
- pixel icon
- high contrast text
- small indicator if useful

## 5. Desktop Home layout

Desktop Home should be a dashboard that feels organized and premium.

Recommended grid:

```text
Top bar:
Good morning, Emma!       Search       Notifications       Date       Profile

Main grid:
[Phoenix Home large hero card]     [Phoenix Status]       [Quick Log]
[Today at a Glance]                [Household Pulse]      [Health Snapshot]
[Recent Activity]                  [Upcoming Plans]       [Mini insight / Pixel scene]
```

### Hero card: Phoenix Home

Large pixel-art room card.

Required:

- title: Phoenix Home
- pixel scene: room/backyard/day/night state
- Phoenix avatar with animated-ready pose
- speech bubble
- presence chip: `With Emma`, `Home Alone`, `Unknown`
- mood chip
- status chip
- next action CTA

Example copy:

```text
Good morning!
Ready for our walk?
```

Status row in hero:

```text
Mood: Happy
Status: Ready to go
```

### Phoenix Status card

Shows meters:

```text
Energy     ███████░░ 78%   Good
Hunger     ████████░ Good
Hydration  ████████░ Good
Bile Risk  ████████░ Low
Bond       ████████░ 92%
```

### Quick Log card

Use 2-column or 3-column tiles depending width.

Core tiles:

```text
Meal
Potty
Walk
Hydration
Training
Bile
Note
Mood
```

The Home quick log should be intentionally smaller than the full Log page.

### Today at a Glance card

Summary metrics:

```text
Walks: 1/2
Meals: 2/2
Potties: 3
Training: 1
Next up: Walk with Emma 8:30 AM
```

### Household Pulse card

Shows current household state.

Example:

```text
Phoenix is with Emma
Since 7:10 AM
```

Also shows quick human statuses:

```text
Emma — Home
Apollo — Away
Jordan — Away
```

### Upcoming Plans card

Shows next 3 plans:

```text
Walk with Emma — Today 8:30 AM
Training — Today 5:00 PM
Vet Checkup — May 28 10:00 AM
```

### Health Snapshot card

Shows calm, serious health rows:

```text
Health Score: 92 Good
Bile: Low risk
Hydration: Good
Weight: 68 lb
```

### Recent Activity card

Shows latest 3-5 log events.

```text
7:10 AM Phoenix had breakfast
8:05 AM Potty break — pee
3:20 PM Training session — 15 min
```

## 6. Mobile Home layout

Mobile Home should be the first screen users love.

Order:

1. Top bar: Phoenix dropdown, presence chip, bell.
2. Pixel Phoenix room card.
3. Mood/status strip.
4. Next Up card.
5. Today at a Glance.
6. Quick Actions.
7. Household Pulse mini-card.
8. Health/Bile snapshot.

Mobile hero card must answer in five seconds:

- Where is Phoenix?
- Is Phoenix alone?
- How does Phoenix feel?
- What is next?
- What can I do quickly?

## 7. Core pages

### 7.1 Quick Log

Purpose: log care in under 5 seconds.

Groups:

```text
Care
- Meal
- Treat
- Walk
- Potty

Mood & Behavior
- Happy
- Anxious
- Play
- Zoomies
- Training Win

Health
- Vomit
- Medication
- Appetite
- Weight

Household
- Leaving Home
- I'm Home
- Note
```

Important: Potty is the parent action. Pee and poop are outcomes inside Potty.

Potty detail:

```text
Potty Break
Where? Outside / Inside
What happened? Pee / Poop / Both / Tried, nothing / Accident
Notes
Save Log
```

Meal detail should support lifecycle:

```text
Meal
Status: Served / Eaten / Update earlier meal
Food
Portion offered
Outcome: Pending / Ate all / Ate most / Ate some / Refused / Still grazing
Photo optional
Save
```

### 7.2 Plans

Shows future care and routines.

Tabs:

```text
Upcoming | Calendar | Routines
```

Rows:

```text
Breakfast 7:30 AM
Walk 8:30 AM
Training 5:00 PM
Dinner 6:30 PM
Bedtime snack 9:30 PM
```

Actions:

- Add Plan
- Start
- Mark Done
- Reschedule
- Assign Human

### 7.3 Health Watch

Calm and trustworthy.

Tabs:

```text
Overview | Bile Watch | Trends
```

Overview rows:

```text
Activity
Appetite
Stool
Vomiting
Hydration
Energy
Weight
```

No diagnosis. Use stable/watch/attention language.

### 7.4 Bile Watch

Signature health feature.

Shows:

- status: Low Risk / Watch / Review
- last yellow bile event
- food gap
- bedtime snack proof
- appetite after
- energy after
- 7-day trend

### 7.5 Household Pulse

Shows:

- Humans: home/away/unknown.
- Phoenix: with human / home alone / unknown.
- Recent household activity.
- Buttons: I'm Home, Leaving Home, Edit Status.

If Phoenix is home alone, make it clear across all household accounts.

### 7.6 Alone Time Watch

Flow:

1. Start Leaving Home.
2. Show Phoenix Home Alone timer.
3. On return, ask how Phoenix was.
4. Save outcome.

Return outcome options:

- Calm
- Excited
- Anxious
- Barking/whining
- Accident
- Vomit
- Destructive
- Unknown

### 7.7 Diet & Treats

Shows:

- current food
- daily target
- breakfast/dinner portions
- treats today
- water
- feeding schedule
- food notes
- avoid list

Buttons:

- Log Meal
- Log Treat
- Edit Diet Profile

### 7.8 Timeline

Filters:

```text
All | Care | Health | Notes
```

Rows should be editable.

Every log must support:

- view detail
- edit
- update outcome
- add note
- add photo
- delete
- edit history/corrections

### 7.9 Records

Professional vault:

- Vet visits
- Vaccines
- Medications
- Allergies
- Weight
- Microchip
- Documents
- Insurance

### 7.10 Reports

Monthly/weekly summary.

Cards:

- walks
- training
- active time
- vomiting
- meals
- treats
- alone time
- health watch

Buttons:

- View Full Report
- Export PDF
- Share

### 7.11 Care Pass

Shareable pack for vets, sitters, trainers, emergencies.

Care Pass types:

- Vet Care Pass
- Sitter Care Pass
- Trainer Care Pass
- Emergency Care Pass

Care Pass must look professional, not too game-like.

### 7.12 WoofGuide

Assistant screen.

Use cases:

- talk-to-log
- explain patterns
- prepare vet questions
- summarize week
- help build Care Pass
- help understand logs

Always separate WoofGuide from Phoenix. Phoenix is personality; WoofGuide is guidance.

### 7.13 Avatar Studio

Bring your real dog into the app.

Flow:

1. Upload Photo
2. Detect Traits
3. Customize
4. Generate Emotes
5. Save Avatar

Supported states:

- Happy
- Calm
- Excited
- Sleepy
- Anxious
- Bored
- Hungry
- Proud
- Home Alone
- Not Feeling Well

## 8. Family safety / trust

This must be included in the product logic, even if not fully in first UI pass.

Roles:

- Adult Admin
- Adult
- Teen
- Kid
- Sitter
- Trainer
- Vet Viewer

Kid logs should be configurable as pending adult confirmation.

Medication and serious health logs should be adult-controlled by default.

Logs should support confirmation status:

```text
Confirmed
Pending
Estimated
Corrected
```

Parent controls:

- require photo for kid meal logs
- require confirmation for medication
- require confirmation for health logs
- allow kids to mark helped but not finalize important care

## 9. Avatar animation requirements

Pixel avatars must be designed as animatable sprite states.

Required v1 states:

```text
Happy
Calm
Excited
Bored
Hungry
Anxious
Sleepy
Proud
Home Alone
Not Feeling Well
```

Each state needs a loop:

- Happy: tail wag + blink
- Excited: bounce + fast wag
- Calm: slow blink
- Bored: paw tap
- Hungry: look at bowl
- Anxious: ears back/glance
- Sleepy: zzz/eyes close
- Proud: sparkle/chest up
- Home Alone: lying by door/window
- Not Feeling Well: low posture

## 10. Component system

Reusable components:

```text
AppShell
DesktopSidebar
MobileBottomNav
TopBar
PixelRoomCard
PhoenixStatusMeters
StatusChip
QuickActionTile
PlanRow
HealthMetricRow
PulseCard
TimelineRow
EditableLogDetail
CarePassCard
RecordRow
ReportMetricCard
AvatarStudioStepper
AchievementBadge
ThemeToggle
```

## 11. What to avoid

Avoid:

- toy-like clutter
- fake coins
- too many neon colors
- full pixel font body text
- making serious health screens look like a game
- guilt mechanics
- random avatar moods with no explanation
- hiding important features too deep

## 12. Replit/Codex implementation instruction

Build the UI as a responsive React/Vite app.

Prioritize:

1. App shell with desktop sidebar and mobile bottom nav.
2. Home dashboard.
3. Quick Log with Potty as parent action and editable meal lifecycle.
4. Plans.
5. Health Watch + Bile Watch.
6. Household Pulse + Alone Time state.
7. Timeline with editable logs.
8. Diet & Treats.
9. Records, Reports, Care Pass, WoofGuide, Avatar Studio.
10. Light/dark mode.

Use local mock state first. Build the UI to feel real and navigable before deeper backend work.

Definition of good:

- User understands Phoenix's status in 5 seconds.
- User can log common care in under 5 seconds.
- Desktop left nav and mobile bottom nav both work.
- Every screen has a clear purpose.
- Pixel art adds delight without harming usability.
- Health and Care Pass screens feel professional.
- App feels premium, memorable, and build-ready.

Final design sentence:

> WoofWatcher is a professional real-life dog care app with a neo-retro pixel pet heart: delightful enough to love, useful enough to trust. 
