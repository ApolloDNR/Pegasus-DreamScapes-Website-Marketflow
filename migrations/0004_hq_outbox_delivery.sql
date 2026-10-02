-- Launch-critical HQ delivery schema.
-- Idempotent by design: inspect and back up the target database before
-- applying, then verify /api/ready and a marked staging intake.

CREATE TABLE IF NOT EXISTS "hq_outbox" (
  "id" serial PRIMARY KEY,
  "idempotency_key" varchar(64) NOT NULL UNIQUE,
  "surface" varchar(32) NOT NULL,
  "source_id" integer,
  "payload" jsonb NOT NULL,
  "status" varchar(16) NOT NULL DEFAULT 'pending',
  "attempts" integer NOT NULL DEFAULT 0,
  "last_attempt_at" timestamp,
  "last_error" text,
  "hq_submission_id" varchar(64),
  "forwarded_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "IDX_hq_outbox_status_created"
  ON "hq_outbox" ("status", "created_at");

ALTER TABLE IF EXISTS "leads"
  ADD COLUMN IF NOT EXISTS "hq_submission_id" varchar(64),
  ADD COLUMN IF NOT EXISTS "hq_forwarded_at" timestamp;

ALTER TABLE IF EXISTS "peggy_conversations"
  ADD COLUMN IF NOT EXISTS "hq_submission_id" varchar(64),
  ADD COLUMN IF NOT EXISTS "hq_forwarded_at" timestamp;
