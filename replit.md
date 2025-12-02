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
**Database Tables**: `sessions`, `users`, `seller_leads`, `investor_leads`, `contacts`, `projects`, `articles`, `lead_activities`, `wholesale_deals`, `wholesale_requests`.
**Schema Migrations**: `npm run db:push` to sync schema changes.

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