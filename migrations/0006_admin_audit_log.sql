-- Durable, server-authored audit records for wholesale and capital reviews.
-- Explicit and idempotent so launch readiness never depends on drizzle push.

CREATE TABLE IF NOT EXISTS "admin_audit_log" (
  "id" serial PRIMARY KEY,
  "admin_user_id" varchar(255) NOT NULL,
  "admin_email" varchar(255),
  "admin_name" varchar(255),
  "action_type" varchar(100) NOT NULL,
  "resource_type" varchar(100),
  "resource_id" varchar(255),
  "description" text NOT NULL,
  "previous_value" text,
  "new_value" text,
  "ip_address" varchar(45),
  "user_agent" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "IDX_admin_audit_log_created_at"
  ON "admin_audit_log" ("created_at" DESC, "id" DESC);
CREATE INDEX IF NOT EXISTS "IDX_admin_audit_log_action_type"
  ON "admin_audit_log" ("action_type");
CREATE INDEX IF NOT EXISTS "IDX_admin_audit_log_admin_user_id"
  ON "admin_audit_log" ("admin_user_id");
