-- Task #84 — Strategy Lab share visibility tiers + run counter.
-- Adds two columns on property_analysis. Both are idempotent so this file
-- can be re-applied safely. The default values mean existing rows survive
-- without backfill: every pre-existing row becomes a "summary" share with
-- a single recorded run.

ALTER TABLE "property_analysis"
  ADD COLUMN IF NOT EXISTS "visibility" varchar(16) NOT NULL DEFAULT 'summary';

ALTER TABLE "property_analysis"
  ADD COLUMN IF NOT EXISTS "run_count" integer NOT NULL DEFAULT 1;
