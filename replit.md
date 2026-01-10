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

### Fonts and Assets
*   **Google Fonts**: Inter font family.