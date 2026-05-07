# Pegasus Dreamscapes Corp — Strategy-First Real Estate Operating Company

## Overview
Pegasus Dreamscapes Corp is a strategy-first real estate operating company. Positioning: **"The Deal Architect"** — "Where others see impossible, we see a path." The platform operates across three pillars (Development, Investments, Systems) and eight outcome lanes, routing distressed and complex property situations to the best structural path. Private beta / private network only. No lead dies doctrine — every property gets a path.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
The frontend uses **React 18, TypeScript, and Vite**, with **Wouter** for routing. It features a unified **MarketFlow** portal at `/marketflow` with role-based dashboards. **TanStack Query** manages server state. UI components are built with **Radix UI** primitives and **Tailwind CSS** (shadcn/ui pattern), featuring a dark editorial theme with a sophisticated typographic hierarchy. Forms are managed with **React Hook Form** and validated with **Zod**. Authentication is via **Supabase Auth**. Lazy loading and route-level code splitting are implemented for performance.

**Typography**: Display font is **Cormorant Garamond** (300–700 weight, italic variants imported) — ultra-refined editorial serif. Body is **Inter**. `--font-serif` points to Cormorant Garamond in index.css. Optical sizing enabled on all headings and `.font-serif` elements.

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
*   **Dark Mode**: Theme is hard-locked to dark canvas — `ThemeProvider` always applies `.dark` class. `ThemeToggle` component is NOT used in navigation.
*   **Visual Upgrade (May 2026)**: Full typographic and component refinement — Cormorant Garamond font, architectural `divide-x` stats strip (no icon circles), hero bottom stat bar with pipe dividers, strategy-question cards with left-accent-bar hover, outcome-lane cards with bare icons (no containers), HowItWorks ghosted large numbers (no pill badge), sell/invest feature lists with left-border treatment, Operating Principles carousel with editorial horizontal-rule attribution (no avatar circles), services sub-tiles cleaned up.
*   **Brand Identity**: "The Deal Architect" positioning throughout. Nav subtitle = "The Deal Architect". Hero philosophical line = "Where others see impossible, we see a path." No fake stats, no cash-buyer clichés, no BBB/DRE claims.
*   **Homepage Sections** (10-section strategic order, May 2026): Hero → EveryPropertyGetsAPath → Services (Three Pillars: Development, Investments, Systems) → DevelopmentPathway (4 phases — Today/Next/Growth/Legacy, framed as trajectory not current state) → StrategyStructureStacks (Strategy Stack + Structure Stack side-by-side) → OutcomeLanes (No Lead Dies, 4+4 lanes) → FeaturedProject → MarketFlowBeta (private-beta pitch + sample-lane mock card) → OperatingPrinciples → FinalCTA ("Dream it. Build it. Live it." with sell/invest/contact CTAs). Sell/Invest/HowItWorks/TrustLogos/FeaturedDeals/FAQ/Newsletter/Contact components still exist in the file but are unmounted from the homepage — they live on their dedicated `/sell`, `/invest`, `/contact` routes for funnel clarity.
*   **Hero**: Tagline "Dream it. Build it. Live it." displayed beneath philosophical line "Where others see impossible, we see a path." Secondary CTA jumps to `#development-pathway`. Stat strip is 4-up: Strategy First · 3 Pillars · 8 Lanes · 4 Phases.
*   **Development Pathway language discipline**: Phase 1 = today's actual scope (ADU/flips/BRRRR/small-scale). Phases 2–4 are explicitly framed as trajectory ("Where we are. Where we're going.") with a footer disclaimer "Each phase is earned, not assumed." Do NOT overclaim large-scale development as current capability.
*   **Footer**: 12-column layout — 5/3/4 split (brand block / Explore links / Start a Conversation + contact). Includes "Dream it. Build it. Live it." tagline, expanded disclosures line ("not an offer to buy or sell securities…"), and a Disclosures link.

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