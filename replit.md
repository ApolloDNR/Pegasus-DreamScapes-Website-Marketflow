# Pegasus Dreamscapes Corp - Real Estate Investment Platform

## Overview
Pegasus Dreamscapes Corp is a real estate investment platform connecting property sellers with investors, focusing on distressed properties for fix-and-flip or rental strategies. It aims to transform distressed assets into profitable ventures. Key capabilities include a premium design, an 8-tier role system, community features, direct messaging, a wholesale deals marketplace, and an AI assistant. The platform facilitates deal negotiation, advanced analytics, and personalized user experiences.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
The frontend uses **React 18, TypeScript, and Vite**, with **Wouter** for routing. It features a unified **MarketFlow** portal at `/marketflow` with role-based dashboards. **TanStack Query** manages server state. UI components are built with **Radix UI** primitives and **Tailwind CSS** (shadcn/ui pattern), featuring a light editorial theme with cream/white backgrounds, dark text, and bronze/blood-orange accents. Forms are managed with **React Hook Form** and validated with **Zod**. Authentication is via **Supabase Auth**. Lazy loading and route-level code splitting are implemented for performance.

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
*   **Dark Mode**: Theme toggling with a navy/copper theme.

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