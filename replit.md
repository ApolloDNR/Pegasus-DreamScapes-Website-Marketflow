# Pegasus Dreamscapes Corp - Real Estate Investment Platform

## Overview

Pegasus Dreamscapes Corp is a real estate investment platform designed to connect motivated property sellers with investment opportunities. The application serves two primary user flows: sellers looking to quickly sell distressed or underperforming properties, and investors seeking to partner on fix-and-flip or rental property ventures.

**Brand Tagline**: "Where Designed Profits Are Crafted."

**Mission**: "Pegasus Dreamscapes exists to elevate communities by transforming distressed homes, underperforming neighborhoods, and forgotten blocks into restored, thriving, and beautiful environments. We design profits with intention — creating win–win outcomes for sellers, investors, and the communities we serve."

The platform features a **light editorial theme** with bronze/blood-orange accents, emphasizing premium credibility, design-forward aesthetics, and community elevation. The homepage is a single-page experience with smooth scrolling, while additional pages (Projects, Resources, Calculators, About) provide deeper content.

## Recent Updates

- **Light Theme Migration (Latest)**: Switched from dark cinematic to clean light editorial aesthetic:
  - Light cream/white backgrounds (HSL 40, 20%, 98%) with dark navy text (HSL 220, 20%, 15%)
  - White cards with tan-tinted borders for clean professional look
  - Bronze/blood-orange accents maintained for brand consistency
  - Hero section retains dramatic dark image overlay for visual impact
- **Luxury Editorial Design**: Complete homepage transformation inspired by high-end real estate photography with:
  - Full-bleed hero image (luxury home at dusk with warm interior lighting)
  - Editorial-style serif typography with uppercase headings
  - Tan/beige accent color (HSL 38, 35%, 75%) alongside bronze/orange primary
  - Two-column editorial service cards (image left, content right)
  - Minimal navigation with tan accent bar
- **Premium Animations**: Fade-in-up effects on hero text, luxury card hover transitions, button glow effects
- **Single-Page Homepage**: Smooth-scrolling layout with sections for Services, Sell, Invest, Dreamscaper Creed, and Contact
- **Dreamscaper Identity Section**: Brand identity section featuring the Dreamscaper Creed and mission statement
- **Four-Service Grid**: Fix & Flip, Buy & Hold, Design & Renovation, and New Construction (Coming Soon)
- **Work Queue Feature**: Queue tab in Pegasus HQ showing overdue, today's, and upcoming follow-ups
- **Serif Typography**: Playfair Display for headlines (H1-H3) with Inter for body text
- **Pegasus HQ Dashboard**: Authenticated dashboard at `/hq` with lead management, protected by Replit Auth
- **Resources/Blog Section**: `/resources` page with real estate investment articles
- **Deal Calculators**: `/calculators` page with ARV Calculator and ROI Calculator
- **Project Detail Pages**: Individual project pages at `/projects/:slug` with before/after galleries
- **Database Migration**: PostgreSQL with Drizzle ORM

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript running on Vite for development and production builds.

**Routing**: Client-side routing implemented using Wouter, a lightweight alternative to React Router. All pages are client-side rendered with a SPA (Single Page Application) architecture.

**Key Pages**:
- `/` - Home page with hero section, dual funnels, and featured projects
- `/about` - Company information and team
- `/services` - Services offered for sellers and investors
- `/projects` - Portfolio of completed projects
- `/projects/:slug` - Individual project detail pages with before/after images
- `/calculators` - ARV and ROI calculators for deal analysis
- `/resources` - Blog/articles section with real estate investment content
- `/resources/:slug` - Individual article detail pages
- `/sell` - Seller lead capture form
- `/invest` - Investor lead capture form
- `/contact` - General contact form
- `/hq` - Protected dashboard for lead management (requires authentication)

**State Management**: TanStack Query (React Query) handles server state management, API calls, and caching. No global state management library is used - component state and React Query suffice for the application's needs.

**UI Component Library**: Radix UI primitives wrapped with custom styled components following the shadcn/ui pattern. Components are stored in `client/src/components/ui/` and use Tailwind CSS for styling with a centralized design system defined in CSS variables.

**Design System**: 
- Light editorial theme with cream/white backgrounds and dark text
- Custom color palette using HSL color space:
  - Background (HSL 40, 20%, 98%) - Warm cream/white
  - Primary bronze/blood-orange (HSL 25, 75%, 50%)
  - Secondary tan/beige (HSL 38, 35%, 75%) - Editorial accent color
  - Foreground dark navy (HSL 220, 20%, 15%)
  - Cards: Pure white with tan-tinted borders
- Typography: Playfair Display serif for headlines (H1-H3) with uppercase styling, Inter for body text
- Two-column editorial layouts for key content areas
- Component variants using class-variance-authority for type-safe style variations
- Premium design-forward aesthetic emphasizing community elevation

**Form Handling**: React Hook Form with Zod schema validation for type-safe form inputs. Forms are validated client-side before submission.

**Authentication**: Replit Auth integration via `useAuth` hook in `client/src/hooks/useAuth.ts`. Protected pages redirect to `/api/login` if user is not authenticated.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript. The server handles API routes and serves the built static frontend in production.

**API Design**: RESTful API endpoints under `/api` prefix:

Public Routes:
- `POST /api/seller-leads` - Submit seller lead
- `POST /api/investor-leads` - Submit investor lead
- `POST /api/contacts` - Submit contact form
- `GET /api/projects` - Get all projects
- `GET /api/projects/:slug` - Get single project by slug
- `GET /api/articles` - Get all published articles
- `GET /api/articles/:slug` - Get single article by slug

Authentication Routes:
- `GET /api/login` - Initiate Replit Auth login flow
- `GET /api/callback` - OAuth callback handler
- `GET /api/logout` - Logout and redirect to home
- `GET /api/auth/user` - Get current authenticated user (protected)

Protected HQ Routes (require authentication):
- `GET /api/hq/seller-leads` - Get all seller leads
- `GET /api/hq/investor-leads` - Get all investor leads
- `GET /api/hq/contacts` - Get all contact messages
- `PATCH /api/hq/seller-leads/:id/status` - Update seller lead status
- `PATCH /api/hq/investor-leads/:id/status` - Update investor lead status
- `PATCH /api/hq/contacts/:id/status` - Update contact status

**Request Handling**: Express middleware stack includes JSON body parsing with raw body preservation for webhook compatibility, URL-encoded form data parsing, and custom logging middleware.

**Validation**: Zod schemas shared between frontend and backend (defined in `shared/schema.ts`) ensure consistent validation rules across the stack.

**Authentication**: Replit Auth via OpenID Connect using `openid-client` and Passport.js. Session storage uses PostgreSQL via `connect-pg-simple`.

**Development Server**: Vite middleware integration in development mode provides HMR (Hot Module Replacement) and serves the frontend directly from source files.

### Data Storage

**Current Implementation**: PostgreSQL database with Drizzle ORM for type-safe database operations.

**Storage Interface**: `DatabaseStorage` class implements `IStorage` interface with methods for all CRUD operations. Located in `server/storage.ts`.

**Database Tables** (defined in `shared/schema.ts`):
- `sessions` - Session storage for Replit Auth
- `users` - User accounts (linked to Replit Auth)
- `seller_leads` - Property seller lead submissions
- `investor_leads` - Investor lead submissions
- `contacts` - General contact form submissions
- `projects` - Portfolio projects with investment metrics
- `articles` - Blog/resource articles
- `lead_activities` - Activity tracking for leads (CRM feature)

**Schema Migrations**: Use `npm run db:push` to sync schema changes to the database.

### Build and Deployment

**Build Process**: Custom build script (`script/build.ts`) using esbuild for server bundling and Vite for client bundling. The build process:
1. Clears the dist directory
2. Builds the client-side React app to `dist/public`
3. Bundles the server code to `dist/index.cjs` with selective dependency bundling

**Dependency Bundling**: Server dependencies are selectively bundled based on an allowlist to reduce cold start times by minimizing file system calls. Critical dependencies like database drivers and API clients are bundled; framework dependencies remain external.

**Production Server**: Serves pre-built static files from `dist/public` with Express static middleware and SPA fallback routing.

## External Dependencies

### UI and Styling

- **Radix UI**: Headless component primitives for accessibility-compliant interactive elements
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Type-safe component variant styling
- **Lucide React**: Icon library for consistent iconography

### Data and Forms

- **React Hook Form**: Performant form state management
- **Zod**: Runtime type validation and schema definition
- **TanStack Query**: Asynchronous state management and data fetching

### Database

- **Drizzle ORM**: Type-safe SQL query builder configured for PostgreSQL
- **Neon Database**: Serverless PostgreSQL database service (via `@neondatabase/serverless`)
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

### Authentication

- **openid-client**: OpenID Connect client for Replit Auth
- **passport**: Authentication middleware for Express
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Tools

- **TypeScript**: Type safety across the full stack
- **Vite**: Fast development server and optimized production builds
- **ESBuild**: Fast JavaScript bundler for server code
- **Replit Plugins**: Development environment integration for runtime error handling and cartographer

### Fonts and Assets

- **Google Fonts**: Inter font family for typography
- Static assets served from `attached_assets` directory
