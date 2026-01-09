# Pegasus Dreamscapes Corp - Real Estate Investment Platform

## Overview

Pegasus Dreamscapes Corp is a real estate investment platform connecting property sellers with investors, focusing on distressed properties for fix-and-flip or rental opportunities. Its mission is to transform distressed properties into thriving environments, creating profitable outcomes for all stakeholders. The platform features a premium design aesthetic, an 8-tier role system, community features, direct messaging, and a wholesale deals marketplace.

## User Preferences

Preferred communication style: Simple, everyday language.

## Supabase Migration Status

The platform is migrating from Replit Auth + PostgreSQL/Drizzle to Supabase (Auth, Database, Storage).

### Completed Migration Steps
- **Phase 1: Role System Consolidation** - 8-tier MARKETPLACE_ROLES enum (admin, pegasus_wholesaler, wholesaler, pegasus_dreamscaper, dreamscaper, investor, buyer_retail, buyer_investment)
- **Phase 2: Action Mutations** - All marketplace actions (deal submission, JV requests, capital commitments, buyer offers) updated to POST to Supabase endpoints
- **Phase 3A: Data Fetching** - Marketplace pages updated to fetch from Supabase endpoints with UUID-compatible ID handling
- **Phase 3B: Stats Endpoints** - Created Supabase stats endpoints (`/api/supabase/marketplace/{role}/stats`) using `external_user_id` lookups for wholesaler, investor, dreamscaper, and buyer dashboards
- **Phase 4: Auth Hook Migration** - ALL marketplace components migrated from legacy `useAuth` to `useSupabaseAuth`:
  - Core: `navigation.tsx`, `command-palette.tsx`, `dealflow-layout.tsx`, `negotiation-history.tsx`
  - Pages: `dealflow-project.tsx`, `user-profile.tsx`, ALL marketplace and portal pages
  - Portal pages: `investor-portal.tsx`, `wholesaler-portal.tsx`, `buyer-portal.tsx`, `dreamscaper-portal.tsx`, `hq.tsx`
  - Dealflow: `dealflow-deals.tsx`, `dealflow-office.tsx`, `capital-raising.tsx`, `community.tsx`
  - Layout: `portal-header.tsx`, `portal-select.tsx`
  - Context: `peggy-context.tsx` updated to use role flags from auth context
  - Property access pattern: `user.isStaff` → `isAdmin` from context, `user.firstName` → `profile?.display_name`
- **Phase 5: Swipe Feature Enhancement** - DeckView component enhanced with dating-app style touch/drag gestures:
  - Framer-motion drag detection with 120px swipe threshold
  - Visual rotation feedback up to 15 degrees while dragging
  - Like/Pass indicators that appear and scale based on drag direction
  - Ring/shadow effects showing intent (green for like, red for pass)
  - Helper text and preserved button controls for accessibility
- **Phase 6: Supabase Connectivity Improvements** - Enhanced Supabase client with graceful fallback:
  - `isSupabaseReachable()` function with 60-second caching prevents repeated DNS lookups
  - All Supabase functions check connectivity before operations
  - DNS errors (ENOTFOUND, ECONNREFUSED) are logged once then cached
  - PostgreSQL fallback automatically triggered when Supabase unavailable
- **Phase 7: MarketFlow 3-Lane Architecture** - Unified deal-flow portal with 3 market lanes:
  - Tab 1: **Wholesale Assignments** - Assignment offers and JV partnership requests
  - Tab 2: **Capital Raises** - Investment opportunities with debt/equity/hybrid structures
  - Tab 3: **Listings** - Property listings with inquiry and tour scheduling
  - Unified context endpoint: `GET /api/deals/:dealType/:id/context` for all 3 lanes
  - Modals open for all users; authentication checked at form submission
- **Phase 8: Canonical Form System** - Separate accept/counter flows with 7 modal forms:
  - **Wholesale Lane:**
    - `WholesaleAcceptTermsModal` - Fast accept path (Assignment Fee, Earnest Money, Closing Date)
    - `WholesaleCounterOfferModal` - Full counter form with all negotiation fields
    - `WholesaleJVRequestModal` - JV partnership wizard with role/split selection
  - **Capital Lane:**
    - `CapitalAcceptTermsModal` - Accept with investment amount + acknowledgements
    - `capital_counter` action redirects to Offer Studio for complex negotiations
  - **Listings Lane:**
    - `ListingRequestInfoModal` - Request property information
    - `ListingScheduleShowingModal` - Schedule property tour with date picker
  - Canonical action types: `wholesale_accept`, `wholesale_counter`, `wholesale_jv`, `capital_accept`, `capital_counter`, `listing_request_info`, `listing_schedule_tour`
  - `openDealAction(dealId, actionType)` routes to correct modal via DealActionModal
  - Legacy action types maintained for backward compatibility
- **Phase 8b: Negotiation Room 3-Column Layout** - Visual deal negotiation interface:
  - Column 1: **Chat** - Direct messaging with counterparty
  - Column 2: **Offer Ladder** - Visual versioned history of all offers/counters with timeline
  - Column 3: **Peggy AI Advisor** - AI-powered negotiation guidance with quick questions
  - Counter/Accept buttons delegate to canonical forms via `mapNegotiationTypeToDealAction(type, isCounter)`
- **Phase 9: Peggy AI Dock Enhancement** - Floating, draggable AI assistant dock:
  - New `PeggyDock` component replaces `PeggyChatBubble` with enhanced UX
  - Framer Motion drag functionality with localStorage position persistence
  - Expandable chat panel with smooth animations and online indicator
  - Context-aware quick prompts based on current page/route
  - Page detection for MarketFlow routes, Offer Studio, negotiations, calculators
  - Feedback buttons (helpful/not helpful) for telemetry
  - Visual polish with amber gradient styling and sparkle branding
- **Phase 9b: MarketFlow Branding** - Navigation and copy updates:
  - "Marketplace" text renamed to "MarketFlow" across navigation
  - Desktop and mobile nav links updated to `/marketflow`
  - Legacy dialog files removed: `wholesale-deal-action-dialog.tsx`, `investment-offer-dialog.tsx`, `deal-negotiation-dialog.tsx`, `capital-raise-offer-dialog.tsx`, `offer-form-dialog.tsx`

### Pending Steps
- **Supabase Table Creation** - Run `supabase-schema.sql` in Supabase SQL Editor (see `SUPABASE_SETUP.md`)
- **Data Migration** - Migrate existing PostgreSQL data to Supabase with UUID transformation

### Important Files
- `supabase-schema.sql` - Complete database schema for Supabase
- `SUPABASE_SETUP.md` - Setup instructions for Supabase tables
- `server/lib/supabase.ts` - Supabase client configuration
- `client/src/contexts/supabase-auth-context.tsx` - Supabase authentication context with role flags

### Auth Context Pattern
The `useSupabaseAuth` hook provides:
- `user` - Supabase User object (email, id)
- `profile` - UserProfile with `display_name`, `avatar_url`, `role`
- Boolean flags: `isAdmin`, `isWholesaler`, `isDreamscaper`, `isInvestor`, `isBuyer`, `isPegasus`
- `isAuthenticated`, `isLoading` for auth state
- Methods: `signIn`, `signUp`, `signOut`, `refreshProfile`

**Important**: Use context boolean flags instead of user properties:
- ❌ `user?.isStaff` → ✅ `isAdmin`
- ❌ `user?.firstName` → ✅ `profile?.display_name`
- ❌ `user?.profileImageUrl` → ✅ `profile?.avatar_url`

## Code Quality Patterns

### React Query Configuration
- **Stale Time**: 2 minutes for data freshness balance
- **GC Time**: 10 minutes for memory management  
- **Refetch**: Enabled on window focus and reconnect
- **Retry Logic**: Smart retry with exponential backoff, skips auth/permission errors

### Query Hooks
- `useAuthQuery` - Auth-aware queries that wait for authentication, returns `T | null`
- `usePublicQuery` - Public queries that don't require auth
- Query keys accept readonly tuples for type safety with `QUERY_KEYS` constants

### Cache Invalidation Helpers
Located in `client/src/lib/queryClient.ts`:
- `QUERY_KEYS` - Centralized query key constants
- `invalidateMarketplaceData()` - Refresh deals, projects, saved items
- `invalidateDealData(dealId?)` - Refresh wholesale deals
- `invalidateProjectData(projectId?)` - Refresh capital projects
- `invalidateSocialData()` - Refresh messages, community, notifications
- `invalidateUserStats(role)` - Refresh role-specific stats

### Route Configuration
Centralized in `client/src/lib/marketplace-routes.ts`:
- `BASE_NAV_ITEMS` - Common navigation items
- `TOOL_ITEMS` - Tools section items
- `getRoleNavItems(role)` - Role-specific navigation
- `getRoleLabel(role)` - Human-readable role names
- `isPegasusRole(role)` - Check for internal roles

### Error Handling
- `ErrorBoundary` wraps Router in App.tsx
- `QueryErrorFallback` - Handles 404, 401, and general errors
- `PageLoader` / `LoadingSpinner` - Loading state components
- `EmptyState` - Empty data state component

## System Architecture

### Frontend

The frontend is built with **React 18, TypeScript, and Vite**, utilizing **Wouter** for client-side routing. It features a unified **Marketplace** at `/marketplace` with role-based dashboards. **TanStack Query** manages server state and API calls, while **Radix UI** primitives and **Tailwind CSS** (following a shadcn/ui pattern) form the UI component library. The design system incorporates a light editorial theme with cream/white backgrounds, dark text, bronze/blood-orange accents, and specific typography. Forms are handled with **React Hook Form** and validated using **Zod**. Authentication supports both Replit Auth (legacy) and **Supabase Auth**.

### Backend

The backend uses **Express.js on Node.js with TypeScript**, providing RESTful API endpoints under `/api`. **Zod schemas** are shared for consistent validation. Authentication is managed via both **Replit Auth (OpenID Connect)** using Passport.js and **Supabase Auth**, with session storage in PostgreSQL via `connect-pg-simple`.

### Data Storage

**Dual database system during migration:**
- **PostgreSQL/Drizzle** (Legacy) - Existing data with numeric IDs
- **Supabase** (Target) - New tables with UUID IDs, RLS policies

Schema managed via `npm run db:push` for Drizzle and `supabase-schema.sql` for Supabase.

### Key Features

*   **Peggy AI Assistant**: A context-aware AI assistant powered by OpenAI (via Replit AI Integrations) providing real estate investing guidance, accessible via a floating chat bubble and integrated with calculators.
*   **MarketFlow Platform**: A premium app-like deal-flow portal at `/marketflow` featuring Grid/Swipe deal browsing with Match Score badges, role-gated submission (Dreamscaper/Wholesaler only), and quick action buttons. Routes under `/marketplace` redirect to `/marketflow`.
*   **Community & Messaging**: Features discussion forums and direct messaging for deal negotiations.
*   **Centralized Deal Components**: Reusable UI components for consistent rendering of various deal types (Capital Projects, Wholesale Deals) across the platform.
*   **Compatibility Scoring Engine**: An algorithm that matches deals to investor preferences based on weighted factors like property type, strategy, location, and budget.
*   **Deal Negotiation System**: Supports debt/equity investment structures and includes a counter-offer system with offer history.
*   **Investment Offer Dialog**: A unified two-step investment flow for making and countering offers on deals.
*   **JV Partnership Form**: Multi-step wizard for wholesaler-to-wholesaler partnerships with role selection (deal bringer/buyer bringer), assignment fee split slider (10-90%), contribution selectors, and JV agreement summary. Note: Properties can be purchased by developers, flippers, builders, and dreamscapers - wholesalers can only JV partner (not purchase directly).
*   **Staff Permission System**: Role-based access control for internal team members with granular permissions.
*   **User Profiles**: Detailed profiles with stats, reviews, ratings, achievement badges, and a rank tier system.
*   **Notification System**: In-app notifications for deal and project updates, JV requests, and investment offers.
*   **Pegasus Role Privileges**: Enhanced features and visual badges for internal team members.
*   **Buyer Marketplace**: Dedicated sections for property browsing, saving, and submitting offers.
*   **Wholesale Deal Submission**: A multi-step wizard form for submitting wholesale deals, including real-time deal analysis.
*   **Capital Raising**: Project posting and funding progress tracking.

## External Dependencies

### UI and Styling

*   **Radix UI**: Headless component primitives.
*   **Tailwind CSS**: Utility-first CSS framework.
*   **class-variance-authority**: Type-safe component variant styling.
*   **Lucide React**: Icon library.

### Data and Forms

*   **React Hook Form**: Form state management.
*   **Zod**: Runtime type validation and schema definition.
*   **TanStack Query**: Asynchronous state management and data fetching.

### Database

*   **Drizzle ORM**: Type-safe SQL query builder for PostgreSQL.
*   **Neon Database**: Serverless PostgreSQL database service (`@neondatabase/serverless`).
*   **drizzle-zod**: Drizzle schema and Zod integration.

### Authentication

*   **openid-client**: OpenID Connect client for Replit Auth.
*   **passport**: Authentication middleware for Express.
*   **express-session**: Session management.
*   **connect-pg-simple**: PostgreSQL session store.

### Development Tools

*   **TypeScript**: Type safety.
*   **Vite**: Fast development server and optimized builds.
*   **ESBuild**: Fast JavaScript bundler.

### Fonts and Assets

*   **Google Fonts**: Inter font family.