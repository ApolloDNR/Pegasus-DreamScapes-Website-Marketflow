# Pegasus Dreamscapes Corp - Real Estate Investment Platform

## Overview

Pegasus Dreamscapes Corp is a real estate investment platform connecting property sellers with investors. It targets sellers of distressed properties and investors seeking fix-and-flip or rental opportunities.

**Brand Tagline**: "Where Designed Profits Are Crafted."

**Mission**: "Pegasus Dreamscapes exists to elevate communities by transforming distressed homes, underperforming neighborhoods, and forgotten blocks into restored, thriving, and beautiful environments. We design profits with intention — creating win–win outcomes for sellers, investors, and the communities we serve."

The platform features a light editorial theme with bronze/blood-orange accents, emphasizing premium credibility and design. It includes a single-page homepage with smooth scrolling and additional pages for projects, resources, calculators, and company information. Key capabilities include a four-role portal system (Staff/Dreamscaper, Investors, Wholesalers, Buyers), community discussion boards, direct messaging, and a wholesale deals marketplace.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript on Vite.
**Routing**: Wouter for client-side SPA.
**Key Pages**: Homepage, About, Services, Projects (individual detail pages), Calculators, Resources (blog/articles), Wholesale Deals Marketplace, Seller/Investor lead forms, Contact, protected HQ Dashboard for staff, and **Dealflow** - a unified marketplace and matching system at /dealflow with My Office dashboard, Marketplace (Deals), Community forums, and Messages.
**State Management**: TanStack Query for server state, API calls, and caching.
**UI Component Library**: Radix UI primitives wrapped with custom styled components (shadcn/ui pattern) using Tailwind CSS.
**Design System**: Light editorial theme with cream/white backgrounds, dark text, bronze/blood-orange accents, and a custom HSL color palette. Typography uses Playfair Display (serif) for headlines and Inter for body text. Features two-column editorial layouts and component variants with `class-variance-authority`.
**Form Handling**: React Hook Form with Zod for client-side validation.
**Authentication**: Replit Auth integration via `useAuth` hook.

### Backend Architecture

**Server Framework**: Express.js on Node.js with TypeScript. Serves API routes and static frontend.
**API Design**: RESTful API endpoints under `/api`. Includes public routes for leads, projects, articles, and wholesale deals, and protected HQ routes for managing leads, deals, and requests.
**Request Handling**: Express middleware for JSON/URL-encoded body parsing.
**Validation**: Zod schemas shared between frontend and backend for consistent validation.
**Authentication**: Replit Auth via OpenID Connect (`openid-client`, Passport.js). Session storage uses PostgreSQL via `connect-pg-simple`.
**Development Server**: Vite middleware for HMR.

### Data Storage

**Database**: PostgreSQL with Drizzle ORM for type-safe operations.
**Database Tables**: `sessions`, `users`, `user_roles`, `staff_profiles`, `seller_leads`, `investor_leads`, `contacts`, `projects`, `articles`, `lead_activities`, `wholesale_deals`, `wholesale_requests`, `investor_profiles`, `investor_wanted_deals`, `capital_projects`, `project_investments`, `deal_offers`, `deal_bookmarks`, `user_stats`, `user_reviews`, `community_categories`, `community_posts`, `community_replies`, `direct_messages`, `notifications`.
**Schema Migrations**: `npm run db:push` to sync schema changes.

## Key Features

### Dealflow Platform (/dealflow)
- **My Office**: Personal dashboard with deal stats, saved deals, and activity feed
- **Marketplace**: Dating-app style swipe interface for browsing deals with Like/Skip/Save actions
- **Community**: Forum discussions with categories for Market Talk, Deal Analysis, Success Stories, and Q&A
- **Messages**: Direct messaging between users for deal negotiations

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

### Portal System (/portal)
- **Dreamscaper HQ** (/dealflow/hq): Staff-only dashboard with lead management, deal overview, and admin tools
- **Dealflow** (/dealflow): Unified platform for Investors, Wholesalers, and Buyers with role-based dashboards
  - Sidebar navigation: My Office, Discover, Community, Messages
  - Tools section: Calculators, Resources, Peggy AI (sidebar)
  - Staff users see HQ Dashboard link in sidebar
- Portal routing: Staff auto-redirect to /dealflow/hq; Investors/Wholesalers/Buyers auto-redirect to /dealflow/office
- Legacy route /hq redirects to /dealflow/hq for backwards compatibility

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