-- Canonical public opportunity intake table.
-- Kept explicit and idempotent so staging/production schema review does not
-- depend on an interactive `drizzle-kit push`.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "opportunities" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "source_page" varchar(120),
  "lead_source" varchar(120),
  "visitor_type" varchar(40) NOT NULL,
  "contact_name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "phone" varchar(50),
  "preferred_contact_method" varchar(40),
  "best_time_to_contact" varchar(120),
  "property_address" text,
  "city" varchar(100),
  "state" varchar(50),
  "zip_code" varchar(20),
  "property_type" varchar(60),
  "occupancy_status" varchar(60),
  "condition" varchar(60),
  "situation" varchar(80),
  "goal" varchar(80),
  "urgency" varchar(60),
  "estimated_value" real,
  "estimated_debt" real,
  "notes" text,
  "recommended_lane" varchar(120),
  "assigned_department" varchar(60),
  "status" varchar(40) NOT NULL DEFAULT 'New',
  "consent_accepted" boolean NOT NULL DEFAULT false,
  "consent_copy_version" varchar(80),
  "consent_captured_at" timestamp,
  "utm_source" varchar(100),
  "utm_medium" varchar(100),
  "utm_campaign" varchar(100),
  "referrer" text
);

ALTER TABLE "opportunities"
  ADD COLUMN IF NOT EXISTS "consent_copy_version" varchar(80),
  ADD COLUMN IF NOT EXISTS "consent_captured_at" timestamp;

CREATE INDEX IF NOT EXISTS "IDX_opportunities_status"
  ON "opportunities" ("status");
CREATE INDEX IF NOT EXISTS "IDX_opportunities_visitor_type"
  ON "opportunities" ("visitor_type");
CREATE INDEX IF NOT EXISTS "IDX_opportunities_created_at"
  ON "opportunities" ("created_at");
