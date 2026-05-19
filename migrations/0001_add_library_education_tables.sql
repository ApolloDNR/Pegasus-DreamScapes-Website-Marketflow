-- Education page editable content (Beginner Path + Glossary)
-- Applied via `npm run db:push` (Drizzle Kit). This file is the authoritative
-- SQL artifact for the new tables introduced for HQ-editable /education content.

CREATE TABLE IF NOT EXISTS "library_beginner_steps" (
  "id" serial PRIMARY KEY NOT NULL,
  "step" varchar(16) NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "library_glossary_terms" (
  "id" serial PRIMARY KEY NOT NULL,
  "term" varchar(120) NOT NULL,
  "definition" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
