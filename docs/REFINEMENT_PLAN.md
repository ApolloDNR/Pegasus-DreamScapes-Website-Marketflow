# Pegasus DreamScapes Empire - Full Refinement & Redesign Plan

## What This Chat Is Asking For

The user (Apollo) is building a real estate tech empire called **Pegasus DreamScapes** with 4 core products and 1 embedded AI. A previous Claude Chat session performed extensive strategic planning including:

1. **Structural refinement** - Consolidated from 6 products to 4 (merged FundBase into CapStack, made Peggy an embedded capability not a product)
2. **Competitive analysis** - Confirmed no competitor does exactly this (REsimpli, Altrio, Juniper Square, Procore, Dealpath all do pieces but not the unified ecosystem)
3. **12-week sprint plan** - Weeks 1-8 for HQ, 9-10 for CapStack V1, 11-12 for BuildForge V1
4. **Connector audit** - Found Supabase (paused), Stripe (sandbox), existing website/MarketFlow on Replit

The chat identified that the user already has significant code built and needs **refinement, not rebuild**. The user now wants a comprehensive structural refinement across both GitHub repos to make this "the best empire."

---

## The 4 Products + 1 AI

| Product | Target User | Status | Repo |
|---------|-------------|--------|------|
| **Pegasus HQ** | Real estate operators (Apollo first, then others) | ~80% built | `pegasus-hq-operating-system` |
| **MarketFlow** | Deal marketplace connecting all parties | Feature-rich, needs cleanup | `pegasus-dreamscapes-website-marketflow` |
| **BuildForge** | Contractors & construction management | Not started (Phase 2) | TBD |
| **CapStack** | Capital partners (equity + debt unified) | Not started (Phase 2) | TBD |
| **Peggy AI** | Embedded across all products | Basic implementation in MarketFlow, tier-gated in HQ | Both repos |

---

## Current State of Both Repos

### REPO 1: `apollodnr/pegasus-hq-operating-system`

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Supabase (PostgreSQL + Auth + Edge Functions + Realtime + Storage), Stripe, Tailwind CSS, Zod, Vitest

**What's Built & Working:**
- Full authentication (login, signup, password reset, email verification)
- Deal lifecycle pipeline with 8 stages and stage transitions
- War Rooms with 8 tabs (Overview, Strategy, Tasks, Calendar, Documents, Milestones, Money, Activity)
- Document management with upload, approval, expiration tracking
- Financial tracking with append-only money entry logging
- Task management with assignments and completion tracking
- Team collaboration with member invites, roles (admin/member/viewer), real-time updates
- AI Center (tier-gated, Claude/OpenAI configurable)
- Command palette (Cmd+K search)
- Notification center
- Demo mode with full sandbox environment
- Responsive UI with dark/light theme, mobile navigation
- 17 SQL migrations defining full schema
- 16 Deno edge functions (create-deal, stage-move, approve-strategy, log-money-entry, etc.)
- Tier system (Starter free trial vs Pro) with feature gates
- Stripe webhook handling for billing

**What's Scaffolded/Incomplete:**
- CRM Contacts (component exists, data operations incomplete)
- Calendar (UI present, full integration partial)
- Marketplace (Pro-only, UI skeleton only)
- Maps (Leaflet setup, basic only)
- Reporting (UI exists, analytics queries incomplete)
- Research Tools (shell only, no data sources)
- Integrations (UI panels, no 3rd-party APIs connected)
- Properties (dashboard exists, schema may lack fields)
- Investors (tracking UI, relationship management partial)
- Departments (UI exists, org structure features partial)

**Key Files & Sizes:**
- `src/components/pipeline-board.tsx` - 55KB (largest component)
- `src/components/ai-center.tsx` - 31KB
- `src/components/command-palette.tsx` - 31KB
- `src/components/notification-center.tsx` - 30KB
- `src/components/contacts-crm.tsx` - 27KB
- `src/lib/demo-data.ts` - 51KB
- `src/lib/types.ts` - 20KB
- `docs/MASTER_BLUEPRINT_v2.0.md` - 82KB
- 17 migration files in `supabase/migrations/`
- 16 edge functions in `supabase/functions/`

**Known Issues (from repo's own checklists):**
- Rate limiting is in-memory only (needs Redis/Upstash for production)
- Storage bucket `deal-documents` must be created manually
- Edge functions not deployed to Supabase project
- Supabase project is PAUSED/INACTIVE
- No error monitoring (Sentry/LogRocket recommended)
- No legal pages (privacy, terms)
- Pre-launch checklist and release blocker report exist with unresolved items

---

### REPO 2: `apollodnr/pegasus-dreamscapes-website-marketflow`

**Tech Stack:** React 18 + Vite + Wouter (routing), Express.js backend, Neon PostgreSQL + Drizzle ORM, Hybrid Auth (Supabase + Replit), Google Cloud Storage, OpenAI (Peggy AI), Radix UI + Tailwind, TanStack React Query, WebSockets

**What's Built & Working:**
- Full public website: Home, About, Services, Sell, Invest, Projects, Calculators, Resources, Contact, Partner, Privacy, Terms
- MarketFlow marketplace with 4 user portals: Wholesaler, Dreamscaper (Developer), Investor, Buyer
- Deal submission and workflow for wholesale, capital raising, and retail listings
- Deal negotiation flow with status tracking and counter-offers
- Capital raising with investor commitments
- Peggy AI assistant (OpenAI-powered, dock component)
- Term sheet PDF generation (PDFKit)
- User reputation system with badges
- Notifications system
- Admin dashboard with analytics
- Role-based access control (8-tier MARKETPLACE_ROLES)
- 100+ API endpoints
- Saved items/favorites, saved searches
- JV (Joint Venture) request system
- Content management (articles, projects with milestones)
- WebSocket real-time updates
- Feature flag system
- Compatibility scoring for deal matching

**40+ Pages including:**
- Public: `/`, `/about`, `/services`, `/sell`, `/invest`, `/projects`, `/calculators`, `/resources`, `/contact`
- MarketFlow: `/marketflow`, `/marketflow/wholesaler`, `/marketflow/investor`, `/marketflow/buyer`, `/marketflow/dreamscaper`, `/marketflow/admin`, `/marketflow/deals`, `/marketflow/capital`, `/marketflow/properties`, `/marketflow/community`, `/marketflow/messages`, `/marketflow/submit`, `/marketflow/negotiate/:lane/:id`
- User: `/profile/:userId`, `/dashboard`, `/offer-studio/:dealType/:dealId`

**Key Files & Sizes:**
- `server/routes.ts` - 295KB (ALL 100+ endpoints in ONE file - critical monolith)
- `shared/schema.ts` - 117KB (ALL database schemas in ONE file)
- `server/storage.ts` - 116KB
- `server/seed.ts` - 42KB
- `server/supabase-storage.ts` - 23KB
- `server/email.ts` - 21KB
- `server/peggy.ts` - 20KB
- `server/term-sheet-generator.ts` - 15KB
- `client/src/App.tsx` - 12KB (main routing)

**Known Issues:**
- `routes.ts` at 295KB is unmaintainable - needs decomposition into domain modules
- `schema.ts` at 117KB needs splitting by domain
- Uses Neon PostgreSQL + Drizzle ORM instead of Supabase (different DB than HQ)
- Hybrid Replit + Supabase auth is fragile and Replit-specific
- Legacy route redirects from old paths (`/dealflow`, `/marketplace`, `/portal`)
- Replit-specific integrations won't work on other platforms
- No shared code or data layer with HQ repo
- Express server serves both API and static frontend (monolithic deployment)

---

## Critical Structural Problems

### 1. Tech Stack Divergence
- **HQ**: Next.js 14 + Supabase (server components, edge functions, RLS)
- **Website/MarketFlow**: Vite + Express + Neon PostgreSQL + Drizzle ORM
- These are the SAME ecosystem but use completely different backends and databases

### 2. Database Split
- HQ has its own Supabase PostgreSQL with 17 migrations, RLS policies, edge functions
- Website has Neon PostgreSQL with Drizzle ORM schemas
- No shared data layer - a deal in HQ can't appear in MarketFlow

### 3. Auth Fragmentation
- HQ: Pure Supabase Auth with org_id claims, RLS-enforced
- Website: Hybrid Replit Auth + Supabase Auth (messy, platform-dependent)

### 4. Monolithic Files
- `routes.ts` (295KB), `schema.ts` (117KB), `storage.ts` (116KB) in Website repo
- `pipeline-board.tsx` (55KB), `demo-data.ts` (51KB) in HQ repo
- These are unmaintainable and slow down development

### 5. No Ecosystem Connectivity
- The two products share no code, no database, no auth, no types
- MarketFlow deals can't flow into HQ War Rooms
- HQ financial data can't appear in MarketFlow capital raising

### 6. Deployment Fragmentation
- HQ targets Vercel (vercel.json present)
- Website targets Replit (.replit config, Replit-specific integrations)

---

## Refinement Plan

### TIER 1: CRITICAL (Do First - Foundation)

#### 1A. Unify Database Layer
**Goal:** Both products read/write to the same Supabase instance.

- **Resume the Supabase project** ("Pegasus Command Center" - currently paused)
- **Audit HQ's 17 migrations** against the PRD v7 schema - identify gaps
- **Create migration to add MarketFlow tables** to the same Supabase instance:
  - `wholesale_deals`, `wholesale_deal_offers`, `capital_projects`, `capital_commitments`
  - `retail_listings`, `buyer_offers`, `jv_requests`, `saved_items`
  - `seller_leads`, `investor_leads`, `buyer_leads`
  - `articles`, `user_reputation`, `user_badges`
- **Add RLS policies** for MarketFlow tables (public read for listings, auth write for owners)
- **Create shared types** that both repos can reference

**Files to modify:**
- `pegasus-hq-operating-system/supabase/migrations/` - add new migration files
- `pegasus-dreamscapes-website-marketflow/server/routes.ts` - migrate from Drizzle/Neon to Supabase client
- `pegasus-dreamscapes-website-marketflow/shared/schema.ts` - keep as TypeScript types but remove Drizzle table definitions

#### 1B. Unify Authentication
**Goal:** Single Supabase Auth across both products.

- **Remove Replit Auth entirely** from the website repo
- **Implement pure Supabase Auth** in the website (same as HQ)
- **Share auth patterns**: login, signup, password reset, email verification
- **Add org_id support** to website for multi-tenant marketplace

**Files to modify:**
- `pegasus-dreamscapes-website-marketflow/server/replitAuth.ts` - DELETE
- `pegasus-dreamscapes-website-marketflow/server/supabaseAuth.ts` - make primary
- `pegasus-dreamscapes-website-marketflow/client/src/contexts/supabase-auth-context.tsx` - update
- `pegasus-dreamscapes-website-marketflow/server/routes.ts` - remove `isAuthenticated` Replit middleware, use Supabase middleware

#### 1C. Decompose Monolithic Files (Website Repo)
**Goal:** Make `routes.ts` (295KB) and `schema.ts` (117KB) maintainable.

Split `server/routes.ts` into domain modules:
- `server/routes/auth.ts` - Authentication endpoints
- `server/routes/deals.ts` - Wholesale deal CRUD + offers + negotiations
- `server/routes/capital.ts` - Capital projects + commitments
- `server/routes/listings.ts` - Retail listings + buyer offers
- `server/routes/users.ts` - Profiles, reputation, badges, roles
- `server/routes/leads.ts` - Seller/investor/buyer lead capture
- `server/routes/admin.ts` - Admin dashboard, analytics, featured deals
- `server/routes/content.ts` - Articles, projects, resources
- `server/routes/notifications.ts` - Notification CRUD
- `server/routes/peggy.ts` - Peggy AI endpoints
- `server/routes/index.ts` - Router aggregator

Split `shared/schema.ts` into:
- `shared/schemas/users.ts`
- `shared/schemas/deals.ts`
- `shared/schemas/capital.ts`
- `shared/schemas/listings.ts`
- `shared/schemas/content.ts`
- `shared/schemas/index.ts` - re-exports all

---

### TIER 2: HIGH PRIORITY (Production Readiness)

#### 2A. HQ Production Hardening
- **Deploy all 16 edge functions** to Supabase
- **Run all 17 migrations** on the live Supabase instance
- **Create storage bucket** `deal-documents`
- **Replace in-memory rate limiter** with Upstash Redis (`src/lib/rate-limit.ts`)
- **Verify RLS policies** on all tables
- **Complete the pre-launch checklist** items in `PRELAUNCH_CHECKLIST.md`
- **Address release blockers** in `RELEASE_BLOCKER_REPORT.md`

#### 2B. Website Platform Independence
- **Remove all Replit-specific code:**
  - `server/replit_integrations/` - DELETE
  - `.replit` config - can keep for dev convenience but remove dependencies
  - `server/replitAuth.ts` - DELETE (covered in 1B)
- **Migrate storage** from Google Cloud Storage to Supabase Storage (already has `supabase-storage.ts`)
- **Add Vercel/production deployment config** (or keep Express for flexibility)

#### 2C. Decompose Large HQ Components
Split oversized components:
- `pipeline-board.tsx` (55KB) -> `pipeline-board/index.tsx`, `pipeline-column.tsx`, `deal-card.tsx`, `pipeline-filters.tsx`, `pipeline-actions.tsx`
- `ai-center.tsx` (31KB) -> `ai-center/index.tsx`, `chat-messages.tsx`, `chat-input.tsx`, `ai-suggestions.tsx`
- `command-palette.tsx` (31KB) -> `command-palette/index.tsx`, `command-search.tsx`, `command-results.tsx`
- `demo-data.ts` (51KB) -> `demo-data/deals.ts`, `demo-data/members.ts`, `demo-data/documents.ts`, etc.

#### 2D. Complete Scaffolded HQ Features
Priority order for scaffolded features:
1. **Properties** - Core to deal management, needs full schema + CRUD
2. **Investors** - Required for CapStack integration later
3. **Reporting/Analytics** - Operators need this to see ROI
4. **CRM Contacts** - Important for lead tracking
5. **Calendar** - Nice-to-have, not blocking

Lower priority (Phase 2):
- Marketplace, Maps, Research Tools, Integrations, Departments

---

### TIER 3: MEDIUM PRIORITY (Ecosystem & Polish)

#### 3A. Create Ecosystem Connectivity
- **Deal flow bridge:** When a deal is approved in MarketFlow, create a corresponding deal in HQ's pipeline
- **Shared deal ID:** Universal deal identifier across both systems
- **Capital integration:** MarketFlow capital commitments visible in HQ's Money tab
- **Lead pipeline:** Website seller form submissions create leads in HQ's CRM

#### 3B. Unified Design System
- Both repos use Tailwind but with different token names
- HQ uses `brand-*` and `navy-*` custom colors
- Website uses Radix UI + shadcn patterns
- **Align color tokens and component patterns** across both repos

#### 3C. Website Content & SEO
- Complete the public website pages
- Add proper SEO metadata (HQ already has `robots.ts` and `sitemap.ts`)
- Ensure seller form connects to Supabase (not just Neon)
- Clean up legacy route redirects

#### 3D. Stripe Integration Completion
- HQ has Stripe webhook handling but only 1 product defined
- **Add pricing tiers:** Starter (free trial), Pro ($X/mo), Enterprise
- **Add MarketFlow transaction fee processing**
- **Connect subscription status** to tier gates

---

### TIER 4: FUTURE (Phase 2 Products)

#### 4A. CapStack V1
- Read-only investor viewport into HQ's deal data
- Different RLS policies (investors see their deals only)
- Dashboard: deal stage, budget summary, projected returns, approved documents
- Can be a separate Next.js app or a section within the website

#### 4B. BuildForge V1
- Contractor project view
- Draw request submission -> approval in HQ -> ledger entry
- Scope pushed from HQ to BuildForge
- Can be a separate app or section within HQ

#### 4C. Peggy AI Enhancement
- Currently basic: OpenAI chat in MarketFlow, Claude/OpenAI in HQ
- Phase 2: Deal analysis, template suggestions, risk scoring
- Phase 3: Automated underwriting, market comps, predictive analytics

---

## Verification Plan

After each tier of changes:

### Tier 1 Verification:
- [ ] Both repos can authenticate against the same Supabase instance
- [ ] Website endpoints read/write to Supabase (not Neon)
- [ ] `routes.ts` is split into <30KB modules that all still work
- [ ] `schema.ts` is split into domain modules
- [ ] No Replit Auth references remain in website repo
- [ ] All existing website features still work after migration

### Tier 2 Verification:
- [ ] HQ edge functions deploy and respond correctly
- [ ] All 17 migrations run without errors
- [ ] RLS policies block cross-org access
- [ ] Rate limiter works with Redis
- [ ] Storage bucket accepts file uploads
- [ ] Large components split and render correctly
- [ ] Properties and Investors features have working CRUD

### Tier 3 Verification:
- [ ] A deal submitted on MarketFlow appears in HQ pipeline
- [ ] Seller form submissions create leads in HQ
- [ ] Design tokens match across both repos
- [ ] Stripe subscriptions gate features correctly

---

## Execution Order (Recommended)

1. Resume Supabase project
2. Audit existing HQ schema against PRD v7
3. Split website monolithic files (routes.ts, schema.ts) - this unblocks everything
4. Remove Replit Auth, implement pure Supabase Auth in website
5. Migrate website DB calls from Neon/Drizzle to Supabase
6. Deploy HQ edge functions and run migrations
7. Production-harden HQ (rate limiting, storage, RLS verification)
8. Decompose large HQ components
9. Complete scaffolded features (Properties, Investors, Reporting)
10. Build ecosystem bridges (deal flow, leads, capital)
11. Unify design system
12. Stripe integration completion

---

## Files Summary - What Gets Modified

### pegasus-hq-operating-system (HQ Repo)
- `supabase/migrations/` - New migrations for MarketFlow tables + schema fixes
- `src/lib/rate-limit.ts` - Replace with Redis/Upstash
- `src/components/pipeline-board.tsx` - Split into sub-components
- `src/components/ai-center.tsx` - Split into sub-components
- `src/components/command-palette.tsx` - Split into sub-components
- `src/lib/demo-data.ts` - Split by domain
- `src/app/dashboard/properties/` - Complete implementation
- `src/app/dashboard/investors/` - Complete implementation
- `src/app/dashboard/reports/` - Complete analytics queries
- `src/app/dashboard/contacts/` - Complete CRM operations

### pegasus-dreamscapes-website-marketflow (Website Repo)
- `server/routes.ts` (295KB) - Split into 10+ domain modules
- `shared/schema.ts` (117KB) - Split into domain schemas
- `server/replitAuth.ts` - DELETE
- `server/replit_integrations/` - DELETE
- `server/supabaseAuth.ts` - Make primary auth
- `server/db.ts` - Switch from Neon to Supabase client
- `server/storage.ts` - Consolidate to Supabase Storage
- `client/src/contexts/supabase-auth-context.tsx` - Update for pure Supabase
- `client/src/App.tsx` - Clean up legacy route redirects
- `drizzle.config.ts` - May be removed after Supabase migration
