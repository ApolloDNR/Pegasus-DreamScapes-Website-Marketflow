# Pegasus Dreamscapes Corp — Strategy-First Real Estate Operating Company

## Overview
Pegasus Dreamscapes Corp is a strategy-first real estate operating company. Positioning: **"The Deal Architect"** — "Where others see impossible, we see a path." The platform operates across three pillars (Development, Investments, Systems) and eight outcome lanes, routing distressed and complex property situations to the best structural path. Private beta / private network only. No lead dies doctrine — every property gets a path.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
The frontend uses **React 18, TypeScript, and Vite**, with **Wouter** for routing. It features a unified **MarketFlow** portal at `/marketflow` with role-based dashboards. **TanStack Query** manages server state. UI components are built with **Radix UI** primitives and **Tailwind CSS** (shadcn/ui pattern), featuring a dark editorial theme with a sophisticated typographic hierarchy. Forms are managed with **React Hook Form** and validated with **Zod**. Authentication is via **Supabase Auth**. Lazy loading and route-level code splitting are implemented for performance.

**Brand Identity (May 2026 — applied from official brand sheet)**:
- **Founder**: Paolo "Apollo" Duran — Founder & Principal, Pegasus Dreamscapes Corp
- **Real contact**: `apollo@pegasusdreamscapes.com` / `925-948-6566` (replaced legacy `hello@`/`info@` variants across footer, contact, home, marketplace-property-detail)
- **Palette** (HSL tokens in `client/src/index.css`):
  - Deep Navy `#0D1B2A` → `--navy: 213 53% 11%` (also `--foreground` light, `--background` dark)
  - Rich Copper `#C77A35` → `--copper: 26 58% 50%` (also `--primary`, `--accent`, `--ring`)
  - Warm Cream `#F6F1E6` → `--cream: 38 50% 94%` (also `--background` light)
  - Charcoal `#22262E` → `--charcoal: 218 16% 16%`
  - New tailwind tokens: `cream`, `charcoal` (added to `tailwind.config.ts` alongside existing `navy`, `copper`)
- **Type system** (4 tiers, all imported via Google Fonts in `index.css`):
  - **Cinzel** → `font-display` / `var(--font-display)` — Trajan-substitute caps for wordmark labels
  - **Cormorant Garamond** → `font-serif` / `var(--font-serif)` — editorial display headlines
  - **Montserrat** → `font-supporting` / `var(--font-supporting)` — letterspaced kicker labels
  - **Inter** → `font-sans` / `var(--font-sans)` — body
- **Brand utilities** (in `index.css`): `.text-headline-gold` (signature cream→copper headline gradient), `.brand-divider` (copper-to-navy hairline), `.brand-stripe` (6px hero footer accent stripe)

### Backend
The backend is built with **Express.js on Node.js with TypeScript**, providing RESTful API endpoints under `/api`. **Zod schemas** ensure validation. Authentication is primarily handled by **Supabase Auth**. Rate limiting is applied to API endpoints. Email notifications are integrated via SendGrid, and WebSocket services provide real-time updates.

### Data Storage
The platform is migrating to **Supabase** as its primary database, utilizing UUID-based IDs and Row Level Security (RLS). Legacy data is stored in **PostgreSQL/Drizzle**.

### Key Features
*   **Peggy AI Assistant**: An OpenAI-powered, context-aware AI for real estate investment guidance, accessible via a draggable chat dock.
*   **MarketFlow Platform**: A premium deal-flow portal offering Grid/Swipe deal browsing, match scoring, role-gated submissions, and quick actions.
*   **Community & Messaging**: Discussion forums and direct messaging for deal negotiations.
*   **Compatibility Scoring Engine**: Matches deals to investor preferences using weighted factors.
*   **Deal Negotiation System**: Supports debt/equity investment structures, includes a counter-offer system with offer history, and is presented in a 3-column layout with chat, offer ladder, and AI advisor. Canonical forms standardize deal actions across wholesale, capital, and listing lanes.
*   **Advanced Analytics & AI Features**: Includes AI deal curation, negotiation analytics, collaborative watchlists, and a portfolio scenario planner.
*   **Notification System**: Real-time in-app notifications with priority levels.
*   **Document Management**: Drag-and-drop file uploads with categorization and photo galleries.
*   **User Profiles & Role System**: Detailed profiles with stats, reviews, achievement badges, and an 8-tier role-based access control (`MARKETPLACE_ROLES`).
*   **User Onboarding**: A 5-step guided flow covering role selection, property preferences, and goal setting.
*   **Admin Content Management**: Allows admins to manage homepage content and featured deals.
*   **Admin Edit Mode**: A comprehensive inline content management system for admins (email allowlist: `apollosynd@gmail.com`, `admin@pegasusdreamscapes.com`). Backend's `isAdmin` flag is the authoritative source. Editable content spans nearly the entire homepage including:
    - **Hero Section**: Main headline, subheadline, CTAs
    - **Stats Section**: All 4 stat values and labels
    - **Featured Deals**: Section kicker, title, description (both populated and empty states)
    - **Services Section**: Headers and 2 service cards (titles, descriptions, CTAs, accent badges)
    - **Testimonials**: Section headers (note: actual testimonials are managed via database CMS)
    - **Why Choose Us**: Section header and all 3 trust badges (titles and descriptions)
    - **Investment Philosophy, How It Works, Community Impact**: All section headers and quotes
    - **Trust Logos**: All 4 trust item labels and descriptions
    - **FAQ Section**: Section headers
    - **Contact Section**: Title, description, phone, email, and location
    - **Newsletter Section**: Headers
    Changes persist to the `site_content` PostgreSQL table with content keys following the pattern `home.{section}.{field}` or `home.{section}.{index}.{field}` for array items.
*   **Demo Mode**: Enables browsing with sample data for unregistered users.
*   **Analytics Tracking**: Tracks user activity across deals, projects, listings, and pages.
*   **SEO Support**: Dynamic meta tag management for page-specific titles and descriptions.
*   **Input Sanitization**: DOMPurify-based sanitization for XSS prevention.
*   **Feature Flags System**: Environment-based feature flags for controlled rollout of new features, configured in `shared/featureFlags.ts` and consumed via `useFeatureFlags` hook.
*   **Print-Friendly Layouts**: CSS for optimizing deal summaries for printing to PDF.
*   **Saved Searches Infrastructure**: Allows users to save search criteria with optional email alerts, backed by both local storage and database persistence.
*   **Theme**: Light / Dark / System toggle is restored in navigation (desktop right-side cluster + mobile menu "Appearance" row). Default theme is `light`. `ThemeProvider` (`client/src/components/theme-provider.tsx`) supports all three modes; toggle lives in `client/src/components/theme-toggle.tsx`. On the hero (transparent nav) the toggle button is forced white via a wrapper class so it stays legible against the dark hero image.
*   **Visual Upgrade (May 2026)**: Full typographic and component refinement — Cormorant Garamond font, architectural `divide-x` stats strip (no icon circles), hero bottom stat bar with pipe dividers, strategy-question cards with left-accent-bar hover, outcome-lane cards with bare icons (no containers), HowItWorks ghosted large numbers (no pill badge), sell/invest feature lists with left-border treatment, Operating Principles carousel with editorial horizontal-rule attribution (no avatar circles), services sub-tiles cleaned up.
*   **Launch Polish Pass (May 2026)**: Three targeted readability/positioning fixes applied to PR #6:
    - **Hero glass-panels** on `/sell` ("The Doctrine") and `/invest` ("How we work with capital") strengthened: panel bg `bg-white/5` → `bg-black/55`, blur `backdrop-blur-md` → `backdrop-blur-2xl`, border `border-white/15` → `border-champagne/25`, added outer dark blur halo (`-inset-8 bg-black/50 blur-3xl`) and `shadow-2xl shadow-black/40`, body text contrast bumped (white/60-75 → white/85-90, champagne/80 → champagne).
    - **Home hero body readability**: philosophical line + subheadline + support line now use `text-white/95` with arbitrary `[text-shadow:0_2px_14px_rgba(0,0,0,0.6)]` for clean readability over the lit-window section of the hero photo without darkening the whole hero.
    - **Development Pathway elevated to "the spine"**: section padding bumped (`py-24` → `py-28 lg:py-36`), kicker reframed "Development Pathway" → "Pegasus Development · The Spine", headline rewritten "Where we are. Where we're going." → "Development is the spine. Built phase by phase." (with copper-gradient on second line), intro paragraph now leads with "Pegasus Dreamscapes is, at its core, a real estate development company. Investments and Systems exist to feed and support what gets built." Trajectory disclaimer preserved as italic ledge. The 4 phases (Today/Next/Growth/Legacy) themselves are unchanged.
*   **Inner Pages Premium Pass (May 2026)**: `/sell`, `/invest`, `/contact`, `/projects`, `/projects/:slug` rebuilt to match homepage editorial standard — dark cinematic hero with bg image + golden-gradient headline word + Cormorant Garamond, kicker labels with hairline rules, asymmetric 7/5 hero layouts with right-side glassmorphic info panel (sell = "The Doctrine" stats, invest = "How we work with capital"), bare-icon outcome cards, ScrollReveal/StaggerChildren motion. `/sell` adds OutcomeRoutingSection (No Lead Dies — 6 lanes), MarketFlowConnectionSection (cross-link), and OperatorSection (founder-by-name + direct line). `/invest` reframes as "Capital meets structure" private-network inquiry (no public offering language) with three structures (Debt/Equity/JV), illustrative project snapshot card, FounderSection (Paolo "Apollo" Duran name card with copper-frame brand treatment, philosophy quote, direct line / email / entity divide-x strip), and MarketFlowConnectionSection. `/contact` adds ContactRoutingSection (3 lanes). `/projects` adds filter bar (status + strategy), image-first ProjectCards, and skeleton-loading state. `/projects/:slug` (`project-detail.tsx`) is fully rebuilt — dark hero with afterImage bg + copper kicker badges + brand-stripe footer, 7/5 asymmetric body with editorial "The Situation/After/Before/Scope of Work" sections (left) + sticky "The Asset / Project Economics" cards with divide-y rows + navy/charcoal "Next Project" CTA card (right), and a "Continue the conversation" routing section linking to Projects + MarketFlow. All form schemas, mutations, and `/api/leads` payloads preserved exactly — visual rework only.
*   **Brand Identity**: "The Deal Architect" positioning throughout. Nav subtitle = "The Deal Architect". Hero philosophical line = "Where others see impossible, we see a path." No fake stats, no cash-buyer clichés, no BBB/DRE claims.
*   **Homepage Sections** (10-section strategic order, May 2026): Hero → EveryPropertyGetsAPath → Services (Three Pillars: Development, Investments, Systems) → DevelopmentPathway (4 phases — Today/Next/Growth/Legacy, framed as trajectory not current state) → StrategyStructureStacks (Strategy Stack + Structure Stack side-by-side) → OutcomeLanes (No Lead Dies, 4+4 lanes) → FeaturedProject → MarketFlowBeta (private-beta pitch + sample-lane mock card) → OperatingPrinciples → FinalCTA ("Dream it. Build it. Live it." with sell/invest/contact CTAs). Sell/Invest/HowItWorks/TrustLogos/FeaturedDeals/FAQ/Newsletter/Contact components still exist in the file but are unmounted from the homepage — they live on their dedicated `/sell`, `/invest`, `/contact` routes for funnel clarity.
*   **Hero**: Tagline "Dream it. Build it. Live it." displayed beneath philosophical line "Where others see impossible, we see a path." Secondary CTA jumps to `#development-pathway`. Stat strip is 4-up: Strategy First · 3 Pillars · 8 Lanes · 4 Phases.
*   **Development Pathway language discipline**: Phase 1 = today's actual scope (ADU/flips/BRRRR/small-scale). Phases 2–4 are explicitly framed as trajectory ("Where we are. Where we're going.") with a footer disclaimer "Each phase is earned, not assumed." Do NOT overclaim large-scale development as current capability.
*   **Footer**: 12-column layout — 5/3/4 split (brand block / Explore links / Start a Conversation + contact). Includes "Dream it. Build it. Live it." tagline, expanded disclosures line ("not an offer to buy or sell securities…"), and a Disclosures link.
*   **Website Experience Blueprint v1.0**: The public website doctrine is documented in `docs/architecture/website-experience-blueprint-v1.md`. This blueprint locks the public sitemap, homepage order, role-mode router, page jobs, CTA paths, PR #6 visual rules, copy guardrails, compliance placement, Website-vs-HQ ownership boundary, and QA checklist. Future website visual, copy, routing, or page-structure changes should cite the blueprint and preserve the Website → HQ boundary from PR #7.
*   **Website + MarketFlow Blueprint v1.3.1**: Controlling document for the v1.3.1 build at `docs/architecture/website-marketflow-blueprint-v1.3.1.md`. Supersedes v1.0 for public website + MarketFlow scope (Strategy Review funnel, free Property Strategy Snapshot, paid Pegasus Deal Blueprint, MarketFlow boundary, Peggy Strategy Assistant, Strategy Library, Vendor Network, transitional data stance, prohibitions). Every later v1.3.1 phase task cites a section of this doc.

### v1.3.1 launch state (May 2026)
- **Public routes locked**: `/`, `/sell`, `/invest`, `/projects`, `/projects/:slug`, `/contact`, `/marketflow`, `/deal-blueprint`, `/snapshot/:token`, `/resources`, `/education`, `/vendor-network`. Until the dedicated Education and Vendor Network pages ship, `/education` is aliased to the existing Resources component and `/vendor-network` is aliased to the Contact component so the homepage role-router and Peggy quick-prompts (which target `/education` and `/vendor-network`) never dead-end.
- **MarketFlow public positioning** (home + `/marketflow`): "MarketFlow is the private dealflow layer for reviewed opportunities, trusted operators, buyers, and capital relationships." Both pages also render the explicit "What MarketFlow is not" panel (not raw intake, not a public marketplace, not an investment solicitation platform) and the 9-step intake-to-listing funnel.
- **Peggy = Strategy Assistant**: Header label, opener copy, and 6-route quick-prompt router (sell, capital, calculators, MarketFlow, learn, vendor) live in `peggy-dock.tsx` / `peggy-chat.tsx`. `server/peggy.ts` system prompt enforces an explicit CAN/CANNOT block and a bounded response template for value, offer, and guarantee asks.
- **Locked voice rules**:
    - Required visible homepage lines: "Complex property. Structured opportunity." / "Every property gets a serious review. Not every property gets an offer." / "Built on strategy. Governed by virtue. Executed with discipline." / "Dream it. Build it. Live it."
    - No spaced em-dashes in public copy; rewrite contextually with periods, commas, or colons. Preserved exclusions: `return "—"` empty-cell formatters, code comments, en-dash number ranges (`7–14 days`, `2–4 unit`), and editorial title attributions (e.g., `Page Title — Pegasus Dreamscapes`).
    - Forbidden public phrases: "Invest Now," "Invest With Us," "Investor Returns," "Passive Income," "Guaranteed Returns," "Principal Protected," "we buy houses fast," any AI-sounding phrasing, and generic luxury / guru language. Negative disclaimer use ("not an offer of guaranteed returns or principal protection") is preserved on `/invest` and `/terms` because it serves the disclosure, not a promise.
- **Visual baseline**: Light mode runs warm cream (`--background: 38 50% 96%`, `--cream: 38 50% 94%`), not white SaaS. Type tiers stay Cinzel / Cormorant Garamond / Montserrat / Inter; primary CTAs stay copper, secondary stay outline. No fake stats, no fake testimonials, no glassmorphism overuse on the v1.3.1 pages.

## External Dependencies

### UI and Styling
*   **Radix UI**: Headless component primitives.
*   **Tailwind CSS**: Utility-first CSS framework.
*   **class-variance-authority**: Type-safe component variant styling.
*   **Lucide React**: Icon library.
*   **Google Fonts**: Inter font family.

### Data and Forms
*   **React Hook Form**: Form state management.
*   **Zod**: Runtime type validation and schema definition.
*   **TanStack Query**: Asynchronous state management and data fetching.

### Database
*   **Supabase**: Authentication, Database, and Storage services.
*   **Drizzle ORM**: Type-safe SQL query builder (for legacy PostgreSQL).
*   **Neon Database**: Serverless PostgreSQL database service.

### Authentication
*   **passport**: Authentication middleware for Express.
*   **express-session**: Session management.
*   **connect-pg-simple**: PostgreSQL session store.

### Development Tools
*   **TypeScript**: Type safety.
*   **Vite**: Fast development server and optimized builds.

### Security
*   **DOMPurify / isomorphic-dompurify**: HTML sanitization for XSS prevention.

### Communication
*   **SendGrid**: Email notification service.
*   **OpenAI**: Powering the Peggy AI Assistant.
