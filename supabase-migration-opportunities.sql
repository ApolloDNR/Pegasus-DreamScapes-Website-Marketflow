-- Public Website v1 (issue #22) — deal-routing opportunity records.
-- Mirrors shared/schema.ts `opportunities`. This legacy artifact targets the
-- website Postgres database referenced by DATABASE_URL. Prefer the reviewed,
-- tracked migrations/0005_public_opportunities.sql file for staging and
-- production. Do not run this against the Supabase Auth/Data API project
-- unless that project is intentionally the website's DATABASE_URL database
-- and its exposure, grants, and RLS have been reviewed first.
CREATE TABLE IF NOT EXISTS opportunities (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  source_page varchar(120),
  lead_source varchar(120),
  visitor_type varchar(40) NOT NULL,
  contact_name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  phone varchar(50),
  preferred_contact_method varchar(40),
  best_time_to_contact varchar(120),
  property_address text,
  city varchar(100),
  state varchar(50),
  zip_code varchar(20),
  property_type varchar(60),
  occupancy_status varchar(60),
  condition varchar(60),
  situation varchar(80),
  goal varchar(80),
  urgency varchar(60),
  estimated_value real,
  estimated_debt real,
  notes text,
  recommended_lane varchar(120),
  assigned_department varchar(60),
  status varchar(40) NOT NULL DEFAULT 'New',
  consent_accepted boolean NOT NULL DEFAULT false,
  consent_copy_version varchar(80),
  consent_captured_at timestamp,
  utm_source varchar(100),
  utm_medium varchar(100),
  utm_campaign varchar(100),
  referrer text
);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS consent_copy_version varchar(80);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS consent_captured_at timestamp;
CREATE INDEX IF NOT EXISTS "IDX_opportunities_status" ON opportunities (status);
CREATE INDEX IF NOT EXISTS "IDX_opportunities_visitor_type" ON opportunities (visitor_type);
CREATE INDEX IF NOT EXISTS "IDX_opportunities_created_at" ON opportunities (created_at);
