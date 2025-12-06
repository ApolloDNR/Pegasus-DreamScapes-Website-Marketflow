# Pegasus Dreamscapes Corp - Real Estate Investment Platform

## Overview

Pegasus Dreamscapes Corp is a real estate investment platform connecting property sellers with investors. It targets sellers of distressed properties and investors seeking fix-and-flip or rental opportunities.

**Brand Tagline**: "Designed Profits. Elevated Communities."

**Mission**: "Pegasus Dreamscapes exists to elevate communities by transforming distressed homes, underperforming neighborhoods, and forgotten blocks into restored, thriving, and beautiful environments. We design profits with intention — creating win–win outcomes for sellers, investors, and the communities we serve."

The platform features a light editorial theme with bronze/blood-orange accents, emphasizing premium credibility and design. It includes a single-page homepage with smooth scrolling and additional pages for projects, resources, calculators, and company information. Key capabilities include a four-role portal system (Staff/Dreamscaper, Investors, Wholesalers, Buyers), community discussion boards, direct messaging, and a wholesale deals marketplace.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript on Vite.
**Routing**: Wouter for client-side SPA.
**Key Pages**: Homepage, About, Services, Projects (individual detail pages), Calculators, Resources (blog/articles), Wholesale Deals Marketplace, Seller/Investor lead forms, Contact, and **Marketplace** - a unified role-based platform at /marketplace with dedicated dashboards for Wholesalers, Investors, Dreamsca pers, Buyers, and Admin. Legacy /dealflow/* routes redirect to /marketplace/* for backward compatibility.
**State Management**: TanStack Query for server state, API calls, and caching.
**UI Component Library**: Radix UI primitives wrapped with custom styled components (shadcn/ui pattern) using Tailwind CSS.
**Design System**: Light editorial theme with cream/white backgrounds, dark text, bronze/blood-orange accents, and a custom HSL color palette. Typography uses Playfair Display (serif) for headlines and Inter for body text. Features two-column editorial layouts and component variants with `class-variance-authority`.
**Form Handling**: React Hook Form with Zod for client-side validation.
**Authentication**: Dual support for Replit Auth (legacy via `useAuth` hook) and Supabase Auth (new via `useSupabaseAuth` hook and `SupabaseAuthProvider`). Login/Signup pages with role selection at /login and /signup.

### Backend Architecture

**Server Framework**: Express.js on Node.js with TypeScript. Serves API routes and static frontend.
**API Design**: RESTful API endpoints under `/api`. Includes public routes for leads, projects, articles, and wholesale deals, and protected HQ routes for managing leads, deals, and requests.
**Request Handling**: Express middleware for JSON/URL-encoded body parsing.
**Validation**: Zod schemas shared between frontend and backend for consistent validation.
**Authentication**: Replit Auth via OpenID Connect (`openid-client`, Passport.js). Session storage uses PostgreSQL via `connect-pg-simple`.
**Development Server**: Vite middleware for HMR.

### Data Storage

**Database**: PostgreSQL with Drizzle ORM for type-safe operations.
**Database Tables**: `sessions`, `users`, `user_roles`, `staff_profiles`, `seller_leads`, `investor_leads`, `buyer_leads`, `contacts`, `projects`, `articles`, `lead_activities`, `wholesale_deals`, `wholesale_requests`, `wholesale_deal_offers`, `investor_profiles`, `investor_wanted_deals`, `capital_projects`, `project_milestones`, `investment_offers`, `committed_investments`, `deal_matches`, `deal_bookmarks`, `deal_swipes`, `deal_negotiations`, `deal_messages`, `deal_analyzer_results`, `user_stats`, `user_reviews`, `community_categories`, `community_posts`, `community_replies`, `direct_messages`, `announcements`, `notifications`, `retail_listings`, `buyer_profiles`, `buyer_offers`, `buyer_inquiries`, `saved_properties`, `leads` (unified pipeline), `peggy_conversations`, `peggy_messages`, `saved_analyses`.
**Schema Migrations**: `npm run db:push` to sync schema changes.

## Key Features

### Peggy AI Assistant
Context-aware AI assistant powered by OpenAI (via Replit AI Integrations) that provides real estate investing guidance:
- **Floating Chat Bubble** (client/src/components/peggy-chat.tsx): Global chat bubble visible on all pages
- **PeggyContext Provider** (client/src/contexts/peggy-context.tsx): Tracks current page, user role, deal context, calculator data
- **Backend Service** (server/peggy.ts): OpenAI integration with context-aware prompts and suggestion generation
- **API Routes**: `/api/peggy/*` endpoints for conversations, chat, suggestions, calculator analysis, feedback
- **Calculator Integration**: "Ask Peggy" button component for analyzing calculator results
- **Suggestion Chips**: Dynamic suggestions based on current page and user role
- **Feedback System**: Users can rate responses as helpful/not helpful

### Marketplace Platform (/marketplace)
The new unified marketplace replaces the old /dealflow routes with role-based dashboards:
- **/marketplace/wholesaler**: Wholesaler dashboard with deal stats, recent deals, and submission tools
- **/marketplace/investor**: Investor dashboard with portfolio stats, saved deals, and discovery
- **/marketplace/dreamscaper**: Dreamscaper dashboard for capital project management
- **/marketplace/buyer**: Buyer dashboard for property search and offer tracking
- **/marketplace/admin**: Admin dashboard for platform management (staff only)
- **Shared Layout** (client/src/components/marketplace-layout.tsx): Sidebar with role-aware navigation
- **Auth Guards** (client/src/components/auth-guard.tsx): AuthGuard, GuestGuard, RoleGuard components
- **API Endpoints**: `/api/marketplace/{role}/stats` endpoints for dashboard data
- **Legacy Redirects**: /dealflow/*, /portal/*, /hq → /marketplace/* for backward compatibility

### Community & Messaging
- **Community**: Forum discussions with categories for Market Talk, Deal Analysis, Success Stories, and Q&A
- **Messages**: Direct messaging between users for deal negotiations
- **Peggy AI**: Accessible via sidebar Tools section or floating chat bubble

### Centralized Deal Components (client/src/components/deal-cards.tsx)
Unified component library for consistent deal card rendering across all views:
- **CapitalProjectMatchCard**: Large swipe-style card with match score ring, funding progress, deal chemistry ratings
- **CapitalProjectGridCard**: Compact grid card for capital projects
- **WholesaleDealMatchCard**: Large swipe-style card for wholesale deals with ROI calculations
- **WholesaleDealGridCard**: Compact grid card for wholesale deals
- **MatchScoreRing**: Circular progress indicator showing 0-100% compatibility score
- **RatingBar**: Progress bar for deal quality metrics (ROI potential, design appeal, market demand)

### Compatibility Scoring Engine (client/src/lib/compatibility-score.ts)
Centralized scoring algorithm for matching deals to investor preferences:
- **calculateProjectMatchScore**: Scores capital projects against investor preferences
- **calculateWholesaleMatchScore**: Scores wholesale deals against investor preferences
- **Weighted Factors**: Property type (20%), strategy alignment (20%), location preference (15%), budget fit (15%), experience level (10%), return expectations (10%), structure preference (10%)
- Returns ScoreResult with total score, breakdown by factor, and labels for transparency

### Portal System (Legacy → Marketplace)
- **Dreamscaper HQ** (/marketplace/admin): Staff-only dashboard with lead management, deal overview, and admin tools
- **Marketplace** (/marketplace): Unified platform for Investors, Wholesalers, and Buyers with role-based dashboards
  - Sidebar navigation: My Office, Discover, Community, Messages
  - Tools section: Calculators, Resources, Peggy AI (sidebar)
  - Staff users see HQ Dashboard link in sidebar
- Portal routing: Staff auto-redirect to /marketplace/admin; Investors/Wholesalers/Buyers auto-redirect to /marketplace/{role}
- Legacy route /hq redirects to /marketplace/admin for backwards compatibility

### Deal Negotiation System
- Supports debt (interest rate) and equity (percentage) investment structures
- Counter-offer system with offer history tracking
- Offer states: pending, accepted, countered, rejected, expired

### Investment Offer Dialog (client/src/components/investment-offer-dialog.tsx)
- Unified two-step investment flow used across deal detail and discover pages
- **Step 1 (Choose)**: Shows project summary, "Seeking" statement, operator's asking terms, and two action buttons:
  - "Accept Operator's Terms" - Pre-fills all operator terms into the form
  - "Make Counter-Offer" - Opens blank form for custom terms
- **Step 2 (Form)**: Investment amount, structure selection (Equity/Debt/Hybrid), role (LP/GP), and term inputs
- Prominent "Seeking" banner displays operator's capital goals (e.g., "Seeking $500,000 at 9% interest")
- Integrated in both /dealflow/project/:id (detail page) and /dealflow/deals (discover page)

### Staff Permission System
- Role-based access: admin, project_manager, acquisitions, dispositions, it
- Granular permissions defined in STAFF_PERMISSIONS
- Admin-only staff management at /api/hq/staff/*

### User Profiles (/profile/:userId)
- Stats display: deals completed, volume, returns, response rate
- Reviews and ratings system with 5-star ratings
- Achievement badges and verification levels
- Activity timeline and transaction history

### Wholesale Deal Submission (client/src/components/wholesale-deal-form.tsx)
- 5-step wizard form tailored for wholesale acquisitions
- **Step 1 (Property)**: Address, type, beds/baths/sqft, occupancy status, investment strategy
- **Step 2 (Seller)**: Confidential seller info - name, contact, motivation (1-10 scale), situation notes
- **Step 3 (Contract)**: EMD details, contract dates (signed, inspection, DD, closing), property access (lockbox, showing times)
- **Step 4 (Financials)**: Asking price, contract price, assignment fee, ARV, repairs, holding costs, live deal analysis
- **Step 5 (Marketing)**: Buyer type requirements, disposition method (assignment/double-close/novation), highlights, images
- Real-time deal analysis: ROI, spread %, deal grade (A/B/C/D), 70% rule max offer calculation
- Pipeline stages: sourcing, underwriting, contract, disposition

### Capital Raising (/capital-raising)
- Project posting for flips, rentals, multifamily, commercial investments
- Investment packet downloads and ROI projections
- Funding progress tracking

### Build and Deployment

**Build Process**: Custom script using esbuild for server bundling and Vite for client bundling. Builds client to `dist/public` and server to `dist/index.cjs`.
**Dependency Bundling**: Selective bundling of server dependencies to reduce cold start times.
**Production Server**: Serves static files from `dist/public` with Express static middleware and SPA fallback.

## External Dependencies

### UI and Styling

- **Radix UI**: Headless component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **class-variance-authority**: Type-safe component variant styling.
- **Lucide React**: Icon library.

### Data and Forms

- **React Hook Form**: Form state management.
- **Zod**: Runtime type validation and schema definition.
- **TanStack Query**: Asynchronous state management and data fetching.

### Database

- **Drizzle ORM**: Type-safe SQL query builder for PostgreSQL.
- **Neon Database**: Serverless PostgreSQL database service (`@neondatabase/serverless`).
- **drizzle-zod**: Drizzle schema and Zod integration.

### Authentication

- **openid-client**: OpenID Connect client for Replit Auth.
- **passport**: Authentication middleware for Express.
- **express-session**: Session management.
- **connect-pg-simple**: PostgreSQL session store.

### Development Tools

- **TypeScript**: Type safety.
- **Vite**: Fast development server and optimized builds.
- **ESBuild**: Fast JavaScript bundler.
- **Replit Plugins**: Development environment integration.

### Fonts and Assets

- **Google Fonts**: Inter font family.
- Static assets from `attached_assets` directory.