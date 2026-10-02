import { sql } from "drizzle-orm";
import { pgSchema, text, serial, timestamp, varchar, integer, boolean, jsonb, index, uniqueIndex, real, uuid, primaryKey, unique, foreignKey, check } from "drizzle-orm/pg-core";

// Only the public website dependency closure belongs here. Existing legacy
// MarketFlow/operator tables remain in shared/schema.ts in their original schema.
// No website table depends on the legacy public.users identity directory.
export const websiteSchema = pgSchema("website");

export const opportunities = websiteSchema.table("opportunities", {
  orgId: uuid("org_id"),
  authSubject: uuid("auth_subject"),
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

  // intake provenance
  sourcePage: varchar("source_page", { length: 120 }),
  leadSource: varchar("lead_source", { length: 120 }),
  visitorType: varchar("visitor_type", { length: 40 }).notNull(),

  // contact
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  preferredContactMethod: varchar("preferred_contact_method", { length: 40 }),
  bestTimeToContact: varchar("best_time_to_contact", { length: 120 }),

  // property
  propertyAddress: text("property_address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  propertyType: varchar("property_type", { length: 60 }),
  occupancyStatus: varchar("occupancy_status", { length: 60 }),
  condition: varchar("condition", { length: 60 }),

  // situation + intent
  situation: varchar("situation", { length: 80 }),
  goal: varchar("goal", { length: 80 }),
  urgency: varchar("urgency", { length: 60 }),
  estimatedValue: real("estimated_value"),
  estimatedDebt: real("estimated_debt"),
  notes: text("notes"),

  // routing (PRD §11.4)
  recommendedLane: varchar("recommended_lane", { length: 120 }),
  assignedDepartment: varchar("assigned_department", { length: 60 }),
  status: varchar("status", { length: 40 }).notNull().default("New"),

  // compliance + attribution
  consentAccepted: boolean("consent_accepted").notNull().default(false),
  consentCopyVersion: varchar("consent_copy_version", { length: 80 }),
  consentCapturedAt: timestamp("consent_captured_at", { withTimezone: true }),
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  referrer: text("referrer"),
}, (table) => [
  unique("website_opportunities_org_id_id_key").on(table.orgId, table.id),
  index("IDX_opportunities_status").on(table.status),
  index("IDX_opportunities_visitor_type").on(table.visitorType),
  index("IDX_opportunities_created_at").on(table.createdAt),
]);

export const leads = websiteSchema.table("leads", {
  orgId: uuid("org_id"),
  authSubject: uuid("auth_subject"),
  id: serial("id").primaryKey(),
  
  // === CORE LEAD INFO ===
  leadType: varchar("lead_type", { length: 50 }).notNull(), // seller, investor, buyer, contact, dreamscaper, wholesaler
  source: varchar("source", { length: 50 }).notNull(), // where lead came from
  stage: varchar("stage", { length: 50 }).notNull().default("new"),
  
  // === CONTACT INFO ===
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  
  // === LOCATION ===
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  
  // === TYPE-SPECIFIC FIELDS (JSON) ===
  // Seller fields: propertyType, condition, timeline, motivation
  // Investor fields: capitalRange, investmentPreference, experienceLevel, accredited
  // Buyer fields: buyerType, budgetRange, propertyTypes, fundingStatus
  // Contact fields: subject, message
  // Dreamscaper fields: bio, experience, portfolio, strategy
  leadData: jsonb("lead_data"), // Flexible storage for type-specific fields
  
  // === DEAL REFERENCE ===
  relatedDealType: varchar("related_deal_type", { length: 50 }), // wholesale_deal, capital_project, retail_listing
  relatedDealId: integer("related_deal_id"),
  
  // === SCORING & PRIORITY ===
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  score: integer("score"), // 0-100 lead quality score
  motivationLevel: integer("motivation_level"), // 1-10 for sellers
  
  // === ASSIGNMENT ===
  assignedTo: varchar("assigned_to", { length: 255 }), // Staff user ID
  assignedAt: timestamp("assigned_at", { withTimezone: true }),
  
  // === TRACKING ===
  lastContactAt: timestamp("last_contact_at", { withTimezone: true }),
  nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
  contactAttempts: integer("contact_attempts").default(0),
  
  // === CONVERSION ===
  convertedToUserId: varchar("converted_to_user_id", { length: 255 }), // If converted to registered user
  convertedToDealId: integer("converted_to_deal_id"),
  conversionDate: timestamp("conversion_date", { withTimezone: true }),
  
  // === NOTES ===
  notes: text("notes"),
  internalNotes: text("internal_notes"), // Staff only
  
  // === UTM/ATTRIBUTION ===
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  referredBy: varchar("referred_by", { length: 255 }), // User ID if referral
  
  // === HQ FORWARDING (Task #153) ===
  // ID returned by Pegasus HQ after successful forwarding via
  // /api/public/intake. Empty until HQ accepts the payload. After HQ
  // ratification, this is the canonical cross-system reference.
  hqSubmissionId: varchar("hq_submission_id", { length: 64 }),
  hqForwardedAt: timestamp("hq_forwarded_at", { withTimezone: true }),

  // === TIMESTAMPS ===
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [unique("website_leads_org_id_id_key").on(table.orgId, table.id)]);

export const hqOutbox = websiteSchema.table("hq_outbox", {
  orgId: uuid("org_id"),
  authSubject: uuid("auth_subject"),
  id: serial("id").primaryKey(),
  // Stable client-generated id (UUID v4). Same key replayed = no-op on HQ.
  idempotencyKey: varchar("idempotency_key", { length: 64 }).notNull().unique(),
  // What surface this came from: lead | peggy | vendor | buybox | cta_batch
  surface: varchar("surface", { length: 32 }).notNull(),
  // Local row id this payload was generated from (for back-reference)
  sourceId: integer("source_id"),
  // The exact JSON body POSTed to HQ /api/public/intake
  payload: jsonb("payload").notNull(),
  // pending | forwarding | forwarded | failed
  status: varchar("status", { length: 16 }).notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
  lastError: text("last_error"),
  // HQ-returned identifier on success
  hqSubmissionId: varchar("hq_submission_id", { length: 64 }),
  forwardedAt: timestamp("forwarded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const peggyConversations = websiteSchema.table("peggy_conversations", {
  orgId: uuid("org_id"),
  authSubject: uuid("auth_subject"),
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }), // null for anonymous users
  sessionId: varchar("session_id", { length: 255 }).notNull(), // Browser session for anonymous
  
  // === CONTEXT ===
  // What page/context the conversation started in
  contextType: varchar("context_type", { length: 50 }), // calculator, deal, page, general
  contextPage: varchar("context_page", { length: 255 }), // URL path
  contextDealType: varchar("context_deal_type", { length: 50 }),
  contextDealId: integer("context_deal_id"),
  contextCalculator: varchar("context_calculator", { length: 50 }), // arv, roi, brrrr, cashflow, mao
  
  // === METADATA ===
  title: varchar("title", { length: 255 }), // Auto-generated or user-set title
  messageCount: integer("message_count").default(0),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  
  // === STATUS ===
  isActive: boolean("is_active").default(true),
  isPinned: boolean("is_pinned").default(false),

  // === CHANNEL (Task #152 — Peggy ASAP phone) ===
  // web | phone. Voice conversations share schema with chat for daily-report parity.
  channel: varchar("channel", { length: 16 }).default("web").notNull(),
  // E.164 caller ID for phone channel
  callerNumber: varchar("caller_number", { length: 32 }),
  // Vendor-side call identifier (Vapi callId, etc.) for cross-referencing recordings
  callSid: varchar("call_sid", { length: 128 }),
  // Recording consent state: pending | granted | declined | revoked
  recordingConsent: varchar("recording_consent", { length: 16 }),
  // Set when caller says "stop recording" mid-call (CA Penal Code §632)
  recordingStoppedAt: timestamp("recording_stopped_at", { withTimezone: true }),
  // Total call duration in seconds (phone only)
  durationSec: integer("duration_sec"),

  // === HQ FORWARDING (Task #153) ===
  hqSubmissionId: varchar("hq_submission_id", { length: 64 }),
  hqForwardedAt: timestamp("hq_forwarded_at", { withTimezone: true }),

  // === INTAKE (Task #151 — Peggy ASAP chat) ===
  // Structured intake captured progressively during the conversation
  intake: jsonb("intake"),
  // Peggy's read of where this conversation should go:
  // submit_property | strategy_lab | strategy_review | capital_intake |
  // vendor_intake | deal_blueprint | human_required
  disposition: varchar("disposition", { length: 40 }),
  routedTo: varchar("routed_to", { length: 80 }),
  contactName: varchar("contact_name", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  // One-line summary of the conversation for Apollo's inbound report
  summary: text("summary"),
  // Set true the moment any §1695 or Fair Housing trigger fires;
  // when true we email Apollo immediately.
  humanRequired: boolean("human_required").default(false),
  // Why human_required was set (audit trail)
  humanRequiredReason: varchar("human_required_reason", { length: 80 }),
  // Whether the daily report has already notified on this conversation
  reportedAt: timestamp("reported_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),

  // === TIMESTAMPS ===
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [unique("peggy_conversations_org_id_id_key").on(table.orgId, table.id)]);

export const peggyMessages = websiteSchema.table("peggy_messages", {
  orgId: uuid("org_id"),
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => peggyConversations.id),
  
  // === MESSAGE ===
  role: varchar("role", { length: 20 }).notNull(), // user, assistant, system
  content: text("content").notNull(),
  
  // === CONTEXT AT TIME OF MESSAGE ===
  contextSnapshot: jsonb("context_snapshot"), // Snapshot of context when message sent
  
  // === AI METADATA ===
  model: varchar("model", { length: 100 }), // gpt-4, gpt-3.5-turbo, etc.
  tokensUsed: integer("tokens_used"),
  
  // === FEEDBACK ===
  feedback: varchar("feedback", { length: 20 }), // helpful, not_helpful
  feedbackNotes: text("feedback_notes"),
  
  // === TIMESTAMPS ===
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  foreignKey({ name: "peggy_messages_org_conversation_fk", columns: [table.orgId, table.conversationId], foreignColumns: [peggyConversations.orgId, peggyConversations.id] }),
]);

export const adminAuditLog = websiteSchema.table("admin_audit_log", {
  orgId: uuid("org_id"),
  authSubject: uuid("auth_subject"),
  id: serial("id").primaryKey(),
  
  // === ACTOR INFO ===
  adminUserId: varchar("admin_user_id", { length: 255 }), // legacy display identity only; verified identity is authSubject
  adminEmail: varchar("admin_email", { length: 255 }),
  adminName: varchar("admin_name", { length: 255 }),
  
  // === ACTION DETAILS ===
  actionType: varchar("action_type", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }), // user, deal, project, badge, setting
  resourceId: varchar("resource_id", { length: 255 }), // ID of affected resource
  
  // === CHANGE DETAILS ===
  description: text("description").notNull(),
  previousValue: text("previous_value"), // JSON stringified
  newValue: text("new_value"), // JSON stringified
  
  // === METADATA ===
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  
  // === TIMESTAMP ===
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// A stable visitor request belongs to one server-selected organization. Nullable
// organization fields above keep legacy API inserts type-compatible during the
// staged rollout; the new intake transaction must supply organization identity.
export const intakeRequests = websiteSchema.table("intake_requests", {
  orgId: uuid("org_id").notNull(),
  idempotencyKey: uuid("idempotency_key").notNull(),
  kind: varchar("kind", { length: 16 }).notNull(),
  payloadHash: varchar("payload_hash", { length: 64 }).notNull(),
  opportunityId: uuid("opportunity_id"),
  leadId: integer("lead_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.orgId, table.idempotencyKey] }),
  unique("intake_requests_opportunity_ref").on(table.orgId, table.idempotencyKey, table.opportunityId),
  unique("intake_requests_lead_ref").on(table.orgId, table.idempotencyKey, table.leadId),
  foreignKey({ name: "intake_requests_opportunity_fk", columns: [table.orgId, table.opportunityId], foreignColumns: [opportunities.orgId, opportunities.id] }),
  foreignKey({ name: "intake_requests_lead_fk", columns: [table.orgId, table.leadId], foreignColumns: [leads.orgId, leads.id] }),
  check("intake_requests_record_ref", sql`(${table.kind} = 'opportunity' AND ${table.opportunityId} IS NOT NULL AND ${table.leadId} IS NULL) OR (${table.kind} = 'lead' AND ${table.leadId} IS NOT NULL AND ${table.opportunityId} IS NULL)`),
  check("intake_requests_hash_format", sql`${table.payloadHash} ~ '^[0-9a-f]{64}$'`),
]);

// New versioned HQ jobs are separate from hqOutbox so legacy recovery cannot
// misinterpret or automatically replay a new-contract payload.
export const websiteDeliveryJobs = websiteSchema.table("delivery_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull(),
  idempotencyKey: uuid("idempotency_key").notNull(),
  recordType: varchar("record_type", { length: 16 }).notNull(),
  opportunityId: uuid("opportunity_id"),
  leadId: integer("lead_id"),
  payload: jsonb("payload").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }).notNull().defaultNow(),
  leaseToken: uuid("lease_token"),
  leaseExpiresAt: timestamp("lease_expires_at", { withTimezone: true }),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
  lastError: text("last_error"),
  receipt: jsonb("receipt"),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique("delivery_jobs_org_request_key").on(table.orgId, table.idempotencyKey),
  foreignKey({ name: "delivery_jobs_request_fk", columns: [table.orgId, table.idempotencyKey], foreignColumns: [intakeRequests.orgId, intakeRequests.idempotencyKey] }),
  foreignKey({ name: "delivery_jobs_opportunity_fk", columns: [table.orgId, table.idempotencyKey, table.opportunityId], foreignColumns: [intakeRequests.orgId, intakeRequests.idempotencyKey, intakeRequests.opportunityId] }),
  foreignKey({ name: "delivery_jobs_lead_fk", columns: [table.orgId, table.idempotencyKey, table.leadId], foreignColumns: [intakeRequests.orgId, intakeRequests.idempotencyKey, intakeRequests.leadId] }),
  check("delivery_jobs_record_ref", sql`(${table.recordType} = 'opportunity' AND ${table.opportunityId} IS NOT NULL AND ${table.leadId} IS NULL) OR (${table.recordType} = 'lead' AND ${table.leadId} IS NOT NULL AND ${table.opportunityId} IS NULL)`),
  check("delivery_jobs_attempts_nonnegative", sql`${table.attempts} >= 0`),
  index("delivery_jobs_ready_idx").on(table.status, table.nextAttemptAt),
]);

export const notificationOutbox = websiteSchema.table("notification_outbox", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull(),
  idempotencyKey: uuid("idempotency_key").notNull(),
  recordType: varchar("record_type", { length: 16 }).notNull(),
  opportunityId: uuid("opportunity_id"),
  leadId: integer("lead_id"),
  purpose: varchar("purpose", { length: 16 }).notNull(),
  payload: jsonb("payload").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }).notNull().defaultNow(),
  leaseToken: uuid("lease_token"),
  leaseExpiresAt: timestamp("lease_expires_at", { withTimezone: true }),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
  lastError: text("last_error"),
  providerMessageId: text("provider_message_id"),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("notification_outbox_opportunity_purpose_key").on(table.orgId, table.opportunityId, table.purpose).where(sql`${table.opportunityId} IS NOT NULL`),
  uniqueIndex("notification_outbox_lead_purpose_key").on(table.orgId, table.leadId, table.purpose).where(sql`${table.leadId} IS NOT NULL`),
  foreignKey({ name: "notification_outbox_request_fk", columns: [table.orgId, table.idempotencyKey], foreignColumns: [intakeRequests.orgId, intakeRequests.idempotencyKey] }),
  foreignKey({ name: "notification_outbox_opportunity_fk", columns: [table.orgId, table.idempotencyKey, table.opportunityId], foreignColumns: [intakeRequests.orgId, intakeRequests.idempotencyKey, intakeRequests.opportunityId] }),
  foreignKey({ name: "notification_outbox_lead_fk", columns: [table.orgId, table.idempotencyKey, table.leadId], foreignColumns: [intakeRequests.orgId, intakeRequests.idempotencyKey, intakeRequests.leadId] }),
  check("notification_outbox_record_ref", sql`(${table.recordType} = 'opportunity' AND ${table.opportunityId} IS NOT NULL AND ${table.leadId} IS NULL) OR (${table.recordType} = 'lead' AND ${table.leadId} IS NOT NULL AND ${table.opportunityId} IS NULL)`),
  check("notification_outbox_purpose", sql`${table.purpose} IN ('staff', 'receipt')`),
  check("notification_outbox_attempts_nonnegative", sql`${table.attempts} >= 0`),
  index("notification_outbox_ready_idx").on(table.status, table.nextAttemptAt),
]);
