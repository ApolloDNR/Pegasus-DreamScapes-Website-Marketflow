/**
 * Pure policy helpers for the transitional `/api/leads` intake.
 *
 * This module intentionally has no database, Express, or email-transport
 * dependencies. The route can use it to keep consent facts truthful, persist
 * a small audit record in `leadData`, and construct a bounded staff alert.
 */

export interface NormalizedLeadConsent {
  consentContact: boolean;
  consentCcpaAcknowledged: boolean;
}

export type LeadConsentRequirementResult =
  | { ok: true }
  | { ok: false; message: string };

export interface LeadConsentAuditOptions {
  leadType?: unknown;
  source?: unknown;
  capturedAt?: Date;
}

export interface GenericLeadNotificationData {
  subject: string;
  text: string;
}

export interface StaffNotificationEnvironment {
  STAFF_NOTIFICATION_EMAIL?: string;
  INTERNAL_NOTIFY_EMAIL?: string;
}

export const REQUIRED_CONTACT_CONSENT_LEAD_TYPES: ReadonlySet<string> = new Set([
  "submit",
  "blueprint_request",
  "seller",
  "marketflow_access",
]);

const DEFAULT_STAFF_NOTIFICATION_EMAIL = "apollo@pegasusdreamscapes.com";
const CONSENT_REQUIRED_MESSAGE = "Consent to follow up is required.";
const MAX_NOTIFICATION_FIELD_LENGTH = 2_000;

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function cleanString(value: unknown, maxLength = MAX_NOTIFICATION_FIELD_LENGTH): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function cleanSubjectPart(value: unknown): string {
  return cleanString(value, 160).replace(/[\r\n]+/g, " ");
}

function displayValue(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "bigint") return String(value);
  return cleanString(value) || "—";
}

/**
 * Reads only explicit boolean consent. Strings such as `"true"`, presence of
 * an email address, and a generic form submit action do not count as consent.
 * The nested fallbacks preserve the two existing checked-checkbox contracts.
 */
export function normalizeLeadConsent(body: unknown): NormalizedLeadConsent {
  const candidate = asRecord(body);
  const leadData = asRecord(candidate.leadData);
  const nestedConsents = asRecord(leadData.consents);

  return {
    consentContact:
      candidate.consentContact === true ||
      nestedConsents.consentContact === true ||
      leadData.consent === true,
    consentCcpaAcknowledged:
      candidate.consentCcpaAcknowledged === true ||
      nestedConsents.consentCcpaAcknowledged === true,
  };
}

export function requiresExplicitContactConsent(leadType: unknown): boolean {
  return (
    typeof leadType === "string" &&
    REQUIRED_CONTACT_CONSENT_LEAD_TYPES.has(leadType)
  );
}

/**
 * Returns a route-friendly result rather than throwing. Non-required legacy
 * lead types remain accepted, but their normalized HQ consent flag stays false.
 */
export function validateLeadConsentRequirement(
  leadType: unknown,
  consent: NormalizedLeadConsent,
): LeadConsentRequirementResult {
  if (requiresExplicitContactConsent(leadType) && !consent.consentContact) {
    return { ok: false, message: CONSENT_REQUIRED_MESSAGE };
  }
  return { ok: true };
}

/**
 * Consent copy is versioned by a server-known surface rather than trusting an
 * arbitrary client-supplied version string.
 */
export function consentVersionForLead(leadType: unknown, source: unknown): string {
  const normalizedType = cleanString(leadType, 50);
  const normalizedSource = cleanString(source, 100);

  if (normalizedSource === "marketflow_access_page" || normalizedType === "marketflow_access") {
    return "marketflow-access-contact-v1";
  }
  if (normalizedSource === "sell_page" || normalizedType === "seller") {
    return "seller-strategy-contact-v1";
  }
  if (normalizedSource === "submit_page" || normalizedSource === "blueprint_page") {
    return "submit-property-contact-v1";
  }
  if (normalizedSource === "launch_smoke") {
    return "launch-smoke-contact-v1";
  }
  if (["form", "strategy-lab", "peggy"].includes(normalizedSource)) {
    return "pegasus-followup-contact-v1";
  }
  return "lead-contact-v1";
}

/**
 * Returns a fresh JSON-compatible leadData object and never mutates the input.
 * Existing type-specific fields and legacy consent keys are preserved.
 */
export function mergeLeadConsentAudit(
  leadData: unknown,
  consent: NormalizedLeadConsent,
  options: LeadConsentAuditOptions = {},
): Record<string, unknown> {
  const existing = asRecord(leadData);
  const capturedAt = options.capturedAt ?? new Date();

  return {
    ...existing,
    consentAudit: {
      consentContact: consent.consentContact,
      consentCcpaAcknowledged: consent.consentCcpaAcknowledged,
      source: cleanString(options.source, 100) || "unknown",
      version: consentVersionForLead(options.leadType, options.source),
      capturedAt: capturedAt.toISOString(),
    },
  };
}

export function resolveStaffNotificationRecipient(
  environment: StaffNotificationEnvironment = {
    STAFF_NOTIFICATION_EMAIL: process.env.STAFF_NOTIFICATION_EMAIL,
    INTERNAL_NOTIFY_EMAIL: process.env.INTERNAL_NOTIFY_EMAIL,
  },
): string {
  return (
    cleanString(environment.STAFF_NOTIFICATION_EMAIL, 320) ||
    cleanString(environment.INTERNAL_NOTIFY_EMAIL, 320) ||
    DEFAULT_STAFF_NOTIFICATION_EMAIL
  );
}

function notificationLabel(leadType: string): string {
  const labels: Record<string, string> = {
    submit: "Property Review",
    blueprint_request: "Deal Blueprint Request",
    contact: "Contact Message",
    marketflow_access: "MarketFlow Access Request",
    buybox_interest: "Buybox Interest",
    newsletter: "Newsletter Signup",
    peggy_note: "Peggy Note",
    peggy_notify: "Peggy Note",
  };
  return labels[leadType] ?? "Website Lead";
}

/**
 * Builds a plain-text, size-bounded staff alert from a whitelist of fields.
 * It deliberately does not serialize arbitrary `leadData`, Strategy Lab data,
 * or Peggy transcripts into email.
 */
export function buildGenericLeadNotificationData(
  lead: unknown,
): GenericLeadNotificationData {
  const row = asRecord(lead);
  const leadData = asRecord(row.leadData);
  const marketflow = asRecord(leadData.marketflow_access_request);
  const consentAudit = asRecord(leadData.consentAudit);

  const leadType = cleanString(row.leadType, 50) || "unknown";
  const firstName = cleanString(row.firstName, 255);
  const lastName = cleanString(row.lastName, 255);
  const fallbackName = cleanString(row.contactName, 255);
  const fullName = `${firstName} ${lastName}`.trim() || fallbackName || "Unknown";
  const role = cleanString(marketflow.role ?? leadData.role ?? leadData.lane, 160);
  const introducedBy = cleanString(marketflow.introducedBy ?? leadData.introducedBy);
  const message = cleanString(
    leadData.message ?? marketflow.notes ?? leadData.notes ?? row.notes,
  );
  const intent = cleanString(leadData.intent, 160);
  const label = notificationLabel(leadType);

  const subjectSuffix =
    leadType === "marketflow_access" && role
      ? `${cleanSubjectPart(fullName)} (${cleanSubjectPart(role)})`
      : cleanSubjectPart(fullName);

  const lines = [
    `Lead ID: ${displayValue(row.id)}`,
    `Type: ${leadType}`,
    `Source: ${displayValue(row.source)}`,
    `Name: ${fullName}`,
    `Email: ${displayValue(marketflow.email ?? row.email)}`,
    `Phone: ${displayValue(row.phone)}`,
    `Address: ${displayValue(row.address)}`,
  ];

  if (role) lines.push(`Role: ${role}`);
  if (intent) lines.push(`Intent: ${intent}`);
  if (introducedBy) lines.push(`Introduced by: ${introducedBy}`);
  if (message) lines.push(`Notes: ${message}`);

  lines.push(
    `Consent to contact: ${consentAudit.consentContact === true ? "Yes" : "No"}`,
    `Privacy acknowledged: ${consentAudit.consentCcpaAcknowledged === true ? "Yes" : "No"}`,
  );

  return {
    subject: `New ${label}: ${subjectSuffix}`.slice(0, 200),
    text: lines.join("\n"),
  };
}
