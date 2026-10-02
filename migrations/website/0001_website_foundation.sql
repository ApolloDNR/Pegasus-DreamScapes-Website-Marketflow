-- Website-only additive foundation. Generated from shared/website-schema.ts,
-- then reviewed for repeat application and least privilege. No public/HQ table,
-- user directory, auth identity, real role or live grant is created or modified.
-- Foreign-key closure: intake -> website opportunities/leads; delivery and
-- notifications -> intake; Peggy messages -> Peggy conversations. No public.users.
-- Legacy hq_outbox is deliberately distinct from new versioned delivery_jobs.
BEGIN;

CREATE SCHEMA IF NOT EXISTS "website";


CREATE TABLE IF NOT EXISTS "website"."admin_audit_log" (
	"org_id" uuid,
	"auth_subject" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"admin_user_id" varchar(255),
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);


CREATE TABLE IF NOT EXISTS "website"."hq_outbox" (
	"org_id" uuid,
	"auth_subject" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"idempotency_key" varchar(64) NOT NULL,
	"surface" varchar(32) NOT NULL,
	"source_id" integer,
	"payload" jsonb NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp with time zone,
	"last_error" text,
	"hq_submission_id" varchar(64),
	"forwarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hq_outbox_idempotency_key_unique" UNIQUE("idempotency_key")
);


CREATE TABLE IF NOT EXISTS "website"."intake_requests" (
	"org_id" uuid NOT NULL,
	"idempotency_key" uuid NOT NULL,
	"kind" varchar(16) NOT NULL,
	"payload_hash" varchar(64) NOT NULL,
	"opportunity_id" uuid,
	"lead_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "intake_requests_org_id_idempotency_key_pk" PRIMARY KEY("org_id","idempotency_key"),
	CONSTRAINT "intake_requests_opportunity_ref" UNIQUE("org_id","idempotency_key","opportunity_id"),
	CONSTRAINT "intake_requests_lead_ref" UNIQUE("org_id","idempotency_key","lead_id"),
	CONSTRAINT "intake_requests_record_ref" CHECK (("website"."intake_requests"."kind" = 'opportunity' AND "website"."intake_requests"."opportunity_id" IS NOT NULL AND "website"."intake_requests"."lead_id" IS NULL) OR ("website"."intake_requests"."kind" = 'lead' AND "website"."intake_requests"."lead_id" IS NOT NULL AND "website"."intake_requests"."opportunity_id" IS NULL)),
	CONSTRAINT "intake_requests_hash_format" CHECK ("website"."intake_requests"."payload_hash" ~ '^[0-9a-f]{64}$')
);


CREATE TABLE IF NOT EXISTS "website"."leads" (
	"org_id" uuid,
	"auth_subject" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"lead_type" varchar(50) NOT NULL,
	"source" varchar(50) NOT NULL,
	"stage" varchar(50) DEFAULT 'new' NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255),
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"company" varchar(255),
	"address" text,
	"city" varchar(100),
	"state" varchar(50),
	"zip_code" varchar(20),
	"lead_data" jsonb,
	"related_deal_type" varchar(50),
	"related_deal_id" integer,
	"priority" varchar(20) DEFAULT 'medium',
	"score" integer,
	"motivation_level" integer,
	"assigned_to" varchar(255),
	"assigned_at" timestamp with time zone,
	"last_contact_at" timestamp with time zone,
	"next_follow_up_at" timestamp with time zone,
	"contact_attempts" integer DEFAULT 0,
	"converted_to_user_id" varchar(255),
	"converted_to_deal_id" integer,
	"conversion_date" timestamp with time zone,
	"notes" text,
	"internal_notes" text,
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(100),
	"referred_by" varchar(255),
	"hq_submission_id" varchar(64),
	"hq_forwarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "website_leads_org_id_id_key" UNIQUE("org_id","id")
);


CREATE TABLE IF NOT EXISTS "website"."notification_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"idempotency_key" uuid NOT NULL,
	"record_type" varchar(16) NOT NULL,
	"opportunity_id" uuid,
	"lead_id" integer,
	"purpose" varchar(16) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"lease_token" uuid,
	"lease_expires_at" timestamp with time zone,
	"last_attempt_at" timestamp with time zone,
	"last_error" text,
	"provider_message_id" text,
	"accepted_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_outbox_record_ref" CHECK (("website"."notification_outbox"."record_type" = 'opportunity' AND "website"."notification_outbox"."opportunity_id" IS NOT NULL AND "website"."notification_outbox"."lead_id" IS NULL) OR ("website"."notification_outbox"."record_type" = 'lead' AND "website"."notification_outbox"."lead_id" IS NOT NULL AND "website"."notification_outbox"."opportunity_id" IS NULL)),
	CONSTRAINT "notification_outbox_purpose" CHECK ("website"."notification_outbox"."purpose" IN ('staff', 'receipt')),
	CONSTRAINT "notification_outbox_attempts_nonnegative" CHECK ("website"."notification_outbox"."attempts" >= 0)
);


CREATE TABLE IF NOT EXISTS "website"."opportunities" (
	"org_id" uuid,
	"auth_subject" uuid,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
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
	"status" varchar(40) DEFAULT 'New' NOT NULL,
	"consent_accepted" boolean DEFAULT false NOT NULL,
	"consent_copy_version" varchar(80),
	"consent_captured_at" timestamp with time zone,
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(100),
	"referrer" text,
	CONSTRAINT "website_opportunities_org_id_id_key" UNIQUE("org_id","id")
);


CREATE TABLE IF NOT EXISTS "website"."peggy_conversations" (
	"org_id" uuid,
	"auth_subject" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"session_id" varchar(255) NOT NULL,
	"context_type" varchar(50),
	"context_page" varchar(255),
	"context_deal_type" varchar(50),
	"context_deal_id" integer,
	"context_calculator" varchar(50),
	"title" varchar(255),
	"message_count" integer DEFAULT 0,
	"last_message_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"is_pinned" boolean DEFAULT false,
	"channel" varchar(16) DEFAULT 'web' NOT NULL,
	"caller_number" varchar(32),
	"call_sid" varchar(128),
	"recording_consent" varchar(16),
	"recording_stopped_at" timestamp with time zone,
	"duration_sec" integer,
	"hq_submission_id" varchar(64),
	"hq_forwarded_at" timestamp with time zone,
	"intake" jsonb,
	"disposition" varchar(40),
	"routed_to" varchar(80),
	"contact_name" varchar(255),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"summary" text,
	"human_required" boolean DEFAULT false,
	"human_required_reason" varchar(80),
	"reported_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "peggy_conversations_org_id_id_key" UNIQUE("org_id","id")
);


CREATE TABLE IF NOT EXISTS "website"."peggy_messages" (
	"org_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"context_snapshot" jsonb,
	"model" varchar(100),
	"tokens_used" integer,
	"feedback" varchar(20),
	"feedback_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);


CREATE TABLE IF NOT EXISTS "website"."delivery_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"idempotency_key" uuid NOT NULL,
	"record_type" varchar(16) NOT NULL,
	"opportunity_id" uuid,
	"lead_id" integer,
	"payload" jsonb NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"lease_token" uuid,
	"lease_expires_at" timestamp with time zone,
	"last_attempt_at" timestamp with time zone,
	"last_error" text,
	"receipt" jsonb,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_jobs_org_request_key" UNIQUE("org_id","idempotency_key"),
	CONSTRAINT "delivery_jobs_record_ref" CHECK (("website"."delivery_jobs"."record_type" = 'opportunity' AND "website"."delivery_jobs"."opportunity_id" IS NOT NULL AND "website"."delivery_jobs"."lead_id" IS NULL) OR ("website"."delivery_jobs"."record_type" = 'lead' AND "website"."delivery_jobs"."lead_id" IS NOT NULL AND "website"."delivery_jobs"."opportunity_id" IS NULL)),
	CONSTRAINT "delivery_jobs_attempts_nonnegative" CHECK ("website"."delivery_jobs"."attempts" >= 0)
);


DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'website.intake_requests'::regclass AND conname = 'intake_requests_opportunity_fk') THEN
    ALTER TABLE "website"."intake_requests" ADD CONSTRAINT "intake_requests_opportunity_fk" FOREIGN KEY ("org_id","opportunity_id") REFERENCES "website"."opportunities"("org_id","id") ON DELETE no action ON UPDATE no action;
  END IF;
END $migration$;

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'website.intake_requests'::regclass AND conname = 'intake_requests_lead_fk') THEN
    ALTER TABLE "website"."intake_requests" ADD CONSTRAINT "intake_requests_lead_fk" FOREIGN KEY ("org_id","lead_id") REFERENCES "website"."leads"("org_id","id") ON DELETE no action ON UPDATE no action;
  END IF;
END $migration$;

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'website.notification_outbox'::regclass AND conname = 'notification_outbox_request_fk') THEN
    ALTER TABLE "website"."notification_outbox" ADD CONSTRAINT "notification_outbox_request_fk" FOREIGN KEY ("org_id","idempotency_key") REFERENCES "website"."intake_requests"("org_id","idempotency_key") ON DELETE no action ON UPDATE no action;
  END IF;
END $migration$;

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'website.notification_outbox'::regclass AND conname = 'notification_outbox_opportunity_fk') THEN
    ALTER TABLE "website"."notification_outbox" ADD CONSTRAINT "notification_outbox_opportunity_fk" FOREIGN KEY ("org_id","idempotency_key","opportunity_id") REFERENCES "website"."intake_requests"("org_id","idempotency_key","opportunity_id") ON DELETE no action ON UPDATE no action;
  END IF;
END $migration$;

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'website.notification_outbox'::regclass AND conname = 'notification_outbox_lead_fk') THEN
    ALTER TABLE "website"."notification_outbox" ADD CONSTRAINT "notification_outbox_lead_fk" FOREIGN KEY ("org_id","idempotency_key","lead_id") REFERENCES "website"."intake_requests"("org_id","idempotency_key","lead_id") ON DELETE no action ON UPDATE no action;
  END IF;
END $migration$;

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'website.peggy_messages'::regclass AND conname = 'peggy_messages_conversation_id_peggy_conversations_id_fk') THEN
    ALTER TABLE "website"."peggy_messages" ADD CONSTRAINT "peggy_messages_conversation_id_peggy_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "website"."peggy_conversations"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $migration$;

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'website.peggy_messages'::regclass AND conname = 'peggy_messages_org_conversation_fk') THEN
    ALTER TABLE "website"."peggy_messages" ADD CONSTRAINT "peggy_messages_org_conversation_fk" FOREIGN KEY ("org_id","conversation_id") REFERENCES "website"."peggy_conversations"("org_id","id") ON DELETE no action ON UPDATE no action;
  END IF;
END $migration$;

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'website.delivery_jobs'::regclass AND conname = 'delivery_jobs_request_fk') THEN
    ALTER TABLE "website"."delivery_jobs" ADD CONSTRAINT "delivery_jobs_request_fk" FOREIGN KEY ("org_id","idempotency_key") REFERENCES "website"."intake_requests"("org_id","idempotency_key") ON DELETE no action ON UPDATE no action;
  END IF;
END $migration$;

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'website.delivery_jobs'::regclass AND conname = 'delivery_jobs_opportunity_fk') THEN
    ALTER TABLE "website"."delivery_jobs" ADD CONSTRAINT "delivery_jobs_opportunity_fk" FOREIGN KEY ("org_id","idempotency_key","opportunity_id") REFERENCES "website"."intake_requests"("org_id","idempotency_key","opportunity_id") ON DELETE no action ON UPDATE no action;
  END IF;
END $migration$;

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'website.delivery_jobs'::regclass AND conname = 'delivery_jobs_lead_fk') THEN
    ALTER TABLE "website"."delivery_jobs" ADD CONSTRAINT "delivery_jobs_lead_fk" FOREIGN KEY ("org_id","idempotency_key","lead_id") REFERENCES "website"."intake_requests"("org_id","idempotency_key","lead_id") ON DELETE no action ON UPDATE no action;
  END IF;
END $migration$;

CREATE UNIQUE INDEX IF NOT EXISTS "notification_outbox_opportunity_purpose_key" ON "website"."notification_outbox" USING btree ("org_id","opportunity_id","purpose") WHERE "website"."notification_outbox"."opportunity_id" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "notification_outbox_lead_purpose_key" ON "website"."notification_outbox" USING btree ("org_id","lead_id","purpose") WHERE "website"."notification_outbox"."lead_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "notification_outbox_ready_idx" ON "website"."notification_outbox" USING btree ("status","next_attempt_at");

CREATE INDEX IF NOT EXISTS "IDX_opportunities_status" ON "website"."opportunities" USING btree ("status");

CREATE INDEX IF NOT EXISTS "IDX_opportunities_visitor_type" ON "website"."opportunities" USING btree ("visitor_type");

CREATE INDEX IF NOT EXISTS "IDX_opportunities_created_at" ON "website"."opportunities" USING btree ("created_at");

CREATE INDEX IF NOT EXISTS "delivery_jobs_ready_idx" ON "website"."delivery_jobs" USING btree ("status","next_attempt_at");

-- Browser access is denied even if platform default privileges are permissive.
ALTER TABLE "website"."admin_audit_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "website"."hq_outbox" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "website"."intake_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "website"."leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "website"."notification_outbox" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "website"."opportunities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "website"."peggy_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "website"."peggy_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "website"."delivery_jobs" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON SCHEMA website FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA website FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA website FROM PUBLIC;
DO $security$
DECLARE browser_role text;
BEGIN
  FOREACH browser_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = browser_role) THEN
      EXECUTE format('REVOKE ALL ON SCHEMA website FROM %I', browser_role);
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA website FROM %I', browser_role);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA website FROM %I', browser_role);
    END IF;
  END LOOP;
END $security$;

-- No application role is granted access here; provisioning is separately approved.
COMMIT;
