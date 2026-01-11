# Pegasus Dreamscapes Corp - Real Estate Investment Platform

## Overview
Pegasus Dreamscapes Corp is a real estate investment platform that connects property sellers with investors, specializing in distressed properties suitable for fix-and-flip or rental strategies. The platform aims to transform distressed assets into profitable ventures for all participants. Key features include a premium design, an 8-tier role system, community functionalities, direct messaging, and a wholesale deals marketplace.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
The frontend is built with **React 18, TypeScript, and Vite**, using **Wouter** for client-side routing. It features a unified **MarketFlow** portal at `/marketflow` with role-based dashboards. **TanStack Query** manages server state, and **Radix UI** primitives combined with **Tailwind CSS** (following a shadcn/ui pattern) form the UI component library. The design system employs a light editorial theme with cream/white backgrounds, dark text, bronze/blood-orange accents, and specific typography. Forms are managed with **React Hook Form** and validated with **Zod**. Authentication is supported via **Supabase Auth**.

### Backend
The backend utilizes **Express.js on Node.js with TypeScript**, providing RESTful API endpoints under `/api`. **Zod schemas** ensure consistent validation. Authentication is primarily handled by **Supabase Auth**.

### Data Storage
The platform is in a migration phase to **Supabase**, which will serve as the primary database with UUID-based IDs and Row Level Security (RLS). Legacy data is currently stored in **PostgreSQL/Drizzle**.

### Key Features
*   **Peggy AI Assistant**: A context-aware AI powered by OpenAI (via Replit AI Integrations) offering real estate investment guidance, accessible through a draggable, floating chat dock with quick prompts.
*   **MarketFlow Platform**: A premium deal-flow portal at `/marketflow` offering Grid/Swipe deal browsing with Match Score badges, role-gated submission, and quick action buttons.
*   **Community & Messaging**: Features for discussion forums and direct messaging to facilitate deal negotiations.
*   **Compatibility Scoring Engine**: An algorithm that matches deals to investor preferences based on weighted factors.
*   **Deal Negotiation System**: Supports debt/equity investment structures and includes a counter-offer system with offer history, presented in a 3-column layout with chat, offer ladder, and AI advisor.
*   **Canonical Form System**: Standardized forms for accepting, countering, and initiating various deal actions across wholesale, capital, and listing lanes.
*   **Advanced Analytics & AI Features**: Includes a virtualized grid for performance, AI deal curation with personalized recommendations, negotiation analytics, collaborative watchlists, and a portfolio scenario planner.
*   **Notification System**: Real-time in-app notifications with priority levels and actionable alerts.
*   **Document Management**: Drag-and-drop file uploads with categorization and photo galleries integrated with object storage.
*   **User Profiles & Role System**: Detailed profiles with stats, reviews, achievement badges, and an 8-tier role-based access control system (`MARKETPLACE_ROLES`).
*   **User Onboarding**: A guided 5-step flow for new users, covering role selection, property preferences, and goal setting.
*   **Admin Content Management**: Admins can manage homepage content and featured deals through the "Content" tab in the Admin Dashboard, including hero section customization and deal featuring capabilities.
*   **Demo Mode**: Allows visitors to explore the marketplace without signing up. Demo mode enables browsing deals with sample data while prompting users to sign up for protected actions like saving deals or submitting offers.
*   **Analytics Tracking**: User activity tracking system with support for views, saves, offers, messages, and shares across deals, projects, listings, and pages. Accessible via `useAnalytics` hook.
*   **SEO Support**: Dynamic meta tag management via `useSEO` hook for page-specific titles, descriptions, and Open Graph tags.
*   **Input Sanitization**: DOMPurify-based sanitization utilities in `client/src/lib/sanitize.ts` for XSS prevention with URL protocol allowlisting.
*   **Rate Limiting**: In-memory rate limiting for API endpoints (20 req/min for Peggy AI, 100 req/min for analytics) with automatic cleanup.

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

### Fonts and Assets
*   **Google Fonts**: Inter font family.

## Recent Changes (January 2026)
- Enhanced homepage hero section with animated floating gradient orbs
- Added testimonials carousel with auto-play (5s), pause-on-hover, navigation arrows, and dot indicators
- Created FAQ accordion section with 6 real estate investment questions using Radix Accordion
- Added section dividers with gradient styling for visual separation
- Implemented premium micro-interactions and hover effects throughout
- Added SEO meta tags and `useSEO` hook for dynamic page titles
- Created reusable error/loading components (`ErrorMessage`, `PageLoader`)
- Implemented DOMPurify-based input sanitization with URL protocol allowlisting
- Fixed TypeScript errors in server routes (iterator conversions, type mismatches)
- Added rate limiting with automatic memory cleanup for API endpoints
- Cleaned up debug console.log statements from client code
- **Route Consolidation**: Consolidated 35+ legacy redirect routes into a data-driven `legacyRedirects` array in App.tsx
- **Community Impact Section**: Added "Dreamscaper Creed" section to homepage with 4 impact stats, 4 core values, and CTAs
- **Lazy Loading**: Added `loading="lazy"` attribute to below-fold images for improved LCP performance
- **Analytics Lane Filter**: Enhanced analytics dashboard with lane-specific filtering (wholesale/capital/listings) using multiplier-based data filtering
- **TypeScript Fixes**: Corrected bathroom type from number to string in marketflow-dashboard.tsx mock data to match schema
- **Email Notifications**: Added email notification system in `server/email.ts` with SendGrid integration (requires SENDGRID_API_KEY). Functions: sendOfferNotification, sendMessageNotification, sendDealUpdateNotification. Configure STAFF_NOTIFICATION_EMAIL for recipient routing.
- **Dark Mode**: Added ThemeProvider (`client/src/components/theme-provider.tsx`) and ThemeToggle (`client/src/components/theme-toggle.tsx`) components. Dark mode CSS tokens defined in index.css (lines 104-174) with navy/copper theme.
- **WebSocket Real-time Updates**: WebSocket server on `/ws` path with user subscription and broadcast functionality. Client hooks: `useWebSocket` and `useNotificationSocket` in `client/src/hooks/use-websocket.ts`. Broadcasts wired for offer status updates and direct messages.
- **PDF Export**: Existing routes for calculator, deal packet, and term sheet PDFs confirmed functional.
- **Portfolio Scenario Planner**: Complete 628-line component at `client/src/components/portfolio-scenario.tsx`.