# Pegasus Dreamscapes Corp - Real Estate Investment Platform

## Overview

Pegasus Dreamscapes Corp is a dual-funnel real estate investment platform designed to connect motivated property sellers with investment opportunities. The application serves two primary user flows: sellers looking to quickly sell distressed or underperforming properties, and investors seeking to partner on fix-and-flip or rental property ventures.

The platform features a sophisticated dark-themed design inspired by modern SaaS applications, emphasizing trust, transparency, and professional presentation of real estate investment opportunities. The site includes informational pages about the company's services, past projects, and design studio capabilities, along with lead capture forms for both seller and investor prospects.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript running on Vite for development and production builds.

**Routing**: Client-side routing implemented using Wouter, a lightweight alternative to React Router. All pages are client-side rendered with a SPA (Single Page Application) architecture.

**State Management**: TanStack Query (React Query) handles server state management, API calls, and caching. No global state management library is used - component state and React Query suffice for the application's needs.

**UI Component Library**: Radix UI primitives wrapped with custom styled components following the shadcn/ui pattern. Components are stored in `client/src/components/ui/` and use Tailwind CSS for styling with a centralized design system defined in CSS variables.

**Design System**: 
- Dark theme by default with sophisticated use of opacity and gradients
- Custom color palette using HSL color space for better control
- Typography system based on Inter font family
- Standardized spacing using Tailwind's spacing scale (4, 8, 12, 16, 20, 24)
- Component variants using class-variance-authority for type-safe style variations

**Form Handling**: React Hook Form with Zod schema validation for type-safe form inputs. Forms are validated client-side before submission.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript. The server handles API routes and serves the built static frontend in production.

**API Design**: RESTful API endpoints under `/api` prefix:
- `/api/seller-leads` - POST and GET for seller lead submissions
- `/api/investor-leads` - POST and GET for investor lead submissions  
- `/api/contacts` - POST and GET for general contact form submissions

**Request Handling**: Express middleware stack includes JSON body parsing with raw body preservation for webhook compatibility, URL-encoded form data parsing, and custom logging middleware.

**Validation**: Zod schemas shared between frontend and backend (defined in `shared/schema.ts`) ensure consistent validation rules across the stack.

**Development Server**: Vite middleware integration in development mode provides HMR (Hot Module Replacement) and serves the frontend directly from source files.

### Data Storage

**Current Implementation**: In-memory storage using Map data structures (`MemStorage` class). Data persists only during server runtime and is lost on restart.

**Storage Interface**: Abstract `IStorage` interface defined to allow easy swapping between storage implementations. The interface defines methods for creating and retrieving seller leads, investor leads, and contact submissions.

**Database Ready**: Configuration includes Drizzle ORM setup with PostgreSQL dialect (`drizzle.config.ts`), indicating planned migration to persistent database storage. The application is structured to work with Neon Database based on the `@neondatabase/serverless` dependency.

**Schema Design**: Zod schemas in `shared/schema.ts` define three main data models:
- Seller Leads: Property information, contact details, timeline, condition
- Investor Leads: Investment preferences, capital range, experience level
- Contact Forms: General inquiry submissions

All records include auto-generated IDs and timestamps.

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

### Database (Planned)

- **Drizzle ORM**: Type-safe SQL query builder configured for PostgreSQL
- **Neon Database**: Serverless PostgreSQL database service
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

### Development Tools

- **TypeScript**: Type safety across the full stack
- **Vite**: Fast development server and optimized production builds
- **ESBuild**: Fast JavaScript bundler for server code
- **Replit Plugins**: Development environment integration for runtime error handling and cartographer

### Fonts and Assets

- **Google Fonts**: Inter font family for typography
- Static assets served from `attached_assets` directory