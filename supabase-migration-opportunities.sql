-- Public Website v1 (issue #22) — deal-routing opportunity records.
-- Mirrors shared/schema.ts `opportunities`. Apply via drizzle-kit push
-- or run directly against Supabase/Postgres.
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
  utm_source varchar(100),
  utm_medium varchar(100),
  utm_campaign varchar(100),
  referrer text
);
CREATE INDEX IF NOT EXISTS "IDX_opportunities_status" ON opportunities (status);
CREATE INDEX IF NOT EXISTS "IDX_opportunities_visitor_type" ON opportunities (visitor_type);
CREATE INDEX IF NOT EXISTS "IDX_opportunities_created_at" ON opportunities (created_at);
