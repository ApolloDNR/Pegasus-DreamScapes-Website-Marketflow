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

### Pending Steps
- **Supabase Table Creation** - Run `supabase-schema.sql` in Supabase SQL Editor (see `SUPABASE_SETUP.md`)
- **Data Migration** - Migrate existing PostgreSQL data to Supabase with UUID transformation

### Important Files
- `supabase-schema.sql` - Complete database schema for Supabase
- `SUPABASE_SETUP.md` - Setup instructions for Supabase tables
- `server/lib/supabase.ts` - Supabase client configuration
- `client/src/hooks/use-supabase-auth.tsx` - Supabase authentication context

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
*   **Marketplace Platform**: A unified, role-based platform (`/marketplace`) for Wholesalers, Investors, Dreamscapers, and Buyers, replacing legacy portal routes.
*   **Community & Messaging**: Features discussion forums and direct messaging for deal negotiations.
*   **Centralized Deal Components**: Reusable UI components for consistent rendering of various deal types (Capital Projects, Wholesale Deals) across the platform.
*   **Compatibility Scoring Engine**: An algorithm that matches deals to investor preferences based on weighted factors like property type, strategy, location, and budget.
*   **Deal Negotiation System**: Supports debt/equity investment structures and includes a counter-offer system with offer history.
*   **Investment Offer Dialog**: A unified two-step investment flow for making and countering offers on deals.
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