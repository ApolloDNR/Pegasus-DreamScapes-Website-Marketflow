import { createHash } from "crypto";
import type { Request } from "express";
import type { InsertLead, InsertSellerLead } from "@shared/schema";

export const DEFAULT_HQ_PUBLIC_INTAKE_URL =
  "https://pegasus-hq-operating-system.vercel.app/api/public/intake";

const PROPERTY_LEAD_TYPES = new Set(["seller", "submit"]);
const HQ_TIMEOUT_MS = 12_000;

export type HqPublicIntakePayload = {
  propertyAddress: string;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  outreachReason: string;
  sourceChannel: string;
  notes: string | null;
  consentContact: boolean;
  consentCcpaAcknowledged: boolean;
  referrer: string | null;
  idempotencyKey: string;
};

export type HqPublicIntakeResponse = {
  ok: boolean;
  reference?: string;
  statusUrl?: string;
  message: string;
};

export class HqIntakeBridgeError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "HqIntakeBridgeError";
    this.status = status;
  }
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export function shouldBridgeLeadToHq(lead: Pick<InsertLead, "leadType" | "address">) {
  return PROPERTY_LEAD_TYPES.has(lead.leadType) && Boolean(normalizeText(lead.address));
}

export function buildHqPayloadFromUnifiedLead(lead: InsertLead, req?: Request): HqPublicIntakePayload {
  if (!shouldBridgeLeadToHq(lead)) {
    throw new HqIntakeBridgeError("Lead is not a property-intake candidate.", 400);
  }

  const leadData = asRecord(lead.leadData);
  const consents = asRecord(leadData.consents);
  const consentContact = lead.leadType === "seller" ? consents.consentContact === true : leadData.consent === true;
  const consentCcpaAcknowledged =
    lead.leadType === "seller"
      ? consents.ackPreliminary === true || consents.consentSnapshot === true
      : leadData.consent === true;

  if (!consentContact || !consentCcpaAcknowledged) {
    throw new HqIntakeBridgeError("Contact and privacy consent are required for HQ intake.", 400);
  }

  const propertyAddress = requiredText(lead.address, "Property address is required for HQ intake.");
  const contactName = fullName(lead.firstName, lead.lastName);
  const outreachReason = buildUnifiedOutreachReason(lead, leadData);
  const notes = buildUnifiedNotes(lead, leadData);

  return {
    propertyAddress,
    contactName,
    contactPhone: normalizeText(lead.phone),
    contactEmail: normalizeEmail(lead.email),
    outreachReason,
    sourceChannel: "public_website_form",
    notes,
    consentContact,
    consentCcpaAcknowledged,
    referrer: requestReferrer(req),
    idempotencyKey: stableUuid([
      "website-unified-lead",
      lead.leadType,
      lead.source,
      propertyAddress.toLowerCase(),
      normalizeEmail(lead.email) ?? "",
      normalizeText(lead.phone) ?? "",
      normalizeText(leadData.situation) ?? "",
    ]),
  };
}

export function buildHqPayloadFromSellerLead(lead: InsertSellerLead, req?: Request): HqPublicIntakePayload {
  const propertyAddress = requiredText(lead.propertyAddress, "Property address is required for HQ intake.");
  const contactName = requiredText(lead.name, "Contact name is required for HQ intake.");
  const outreachReason =
    truncate(
      [
        "Website seller lead.",
        `Condition: ${lead.condition}.`,
        `Timeline: ${lead.timeline}.`,
        lead.notes ? `Notes: ${lead.notes}` : null,
      ],
      2000,
    ) ?? "Website seller lead.";

  return {
    propertyAddress,
    contactName,
    contactPhone: normalizeText(lead.phone),
    contactEmail: normalizeEmail(lead.email),
    outreachReason,
    sourceChannel: "public_website_form",
    notes: truncate(
      [
        "Legacy seller-leads endpoint bridged into Pegasus HQ canonical public intake.",
        `Property type: ${lead.propertyType}.`,
      ],
      2000,
    ),
    consentContact: true,
    consentCcpaAcknowledged: true,
    referrer: requestReferrer(req),
    idempotencyKey: stableUuid([
      "website-seller-lead",
      propertyAddress.toLowerCase(),
      normalizeEmail(lead.email) ?? "",
      normalizeText(lead.phone) ?? "",
      normalizeText(lead.notes) ?? "",
    ]),
  };
}

export async function submitHqPublicIntake(
  payload: HqPublicIntakePayload,
  fetchImpl: FetchLike = fetch,
): Promise<HqPublicIntakeResponse> {
  const endpoint = process.env.PEGASUS_HQ_PUBLIC_INTAKE_URL?.trim() || DEFAULT_HQ_PUBLIC_INTAKE_URL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HQ_TIMEOUT_MS);

  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const rawBody = await response.text();
    const parsed = parseJson(rawBody);

    if (!response.ok || !parsed?.ok) {
      const message =
        typeof parsed?.message === "string" && parsed.message.trim()
          ? parsed.message
          : `Pegasus HQ intake rejected the submission with status ${response.status}.`;
      throw new HqIntakeBridgeError(message, response.ok ? 502 : response.status);
    }

    return {
      ok: true,
      reference: typeof parsed.reference === "string" ? parsed.reference : undefined,
      statusUrl: typeof parsed.statusUrl === "string" ? parsed.statusUrl : undefined,
      message:
        typeof parsed.message === "string" && parsed.message.trim()
          ? parsed.message
          : "Intake received by Pegasus HQ.",
    };
  } catch (error) {
    if (error instanceof HqIntakeBridgeError) throw error;
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Pegasus HQ intake timed out before confirming receipt."
        : "Pegasus HQ intake is unavailable.";
    throw new HqIntakeBridgeError(message, 502);
  } finally {
    clearTimeout(timeout);
  }
}

export function hqIntakeJson(response: HqPublicIntakeResponse) {
  return {
    id: response.reference ?? null,
    canonicalSystem: "pegasus_hq",
    hqIntake: response,
  };
}

function buildUnifiedOutreachReason(lead: InsertLead, leadData: Record<string, unknown>) {
  return (
    truncate(
      [
        `Website ${lead.leadType} intake from ${lead.source}.`,
        label("Intent", leadData.intent ?? leadData.desiredOutcome),
        label("Submitter role", leadData.submitterRole),
        label("Situation", leadData.situation),
        label("Condition", leadData.condition),
        label("Timeline", leadData.timeline),
        label("Creative finance openness", leadData.creativeFinanceOpenness),
        label("Proposed terms", leadData.proposedTerms),
        label("Notes", lead.notes),
      ],
      2000,
    ) ?? `Website ${lead.leadType} intake.`
  );
}

function buildUnifiedNotes(lead: InsertLead, leadData: Record<string, unknown>) {
  return truncate(
    [
      "Bridged from Pegasus Dreamscapes public website into Pegasus HQ canonical intake.",
      label("Source", lead.source),
      label("Property type", leadData.propertyType),
      label("Occupancy", leadData.occupancy),
      label("Desired outcome", leadData.desiredOutcome),
      label("Photo count", Array.isArray(leadData.photos) ? String(leadData.photos.length) : null),
    ],
    2000,
  );
}

function label(name: string, value: unknown) {
  const text = normalizeText(value);
  return text ? `${name}: ${text}.` : null;
}

function truncate(lines: Array<string | null | undefined>, max: number) {
  const text = lines.filter(Boolean).join("\n").replace(/\s+\n/g, "\n").trim();
  if (text.length <= max) return text || null;
  return `${text.slice(0, Math.max(0, max - 1)).trim()}...`;
}

function normalizeText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim().toLowerCase() : null;
}

function requiredText(value: unknown, message: string) {
  const normalized = normalizeText(value);
  if (!normalized) throw new HqIntakeBridgeError(message, 400);
  return normalized;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function fullName(firstName: unknown, lastName: unknown) {
  return requiredText([normalizeText(firstName), normalizeText(lastName)].filter(Boolean).join(" "), "Contact name is required for HQ intake.");
}

function requestReferrer(req?: Request) {
  return req?.get("referer") ?? req?.get("referrer") ?? null;
}

function parseJson(rawBody: string): Record<string, unknown> | null {
  try {
    return rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function stableUuid(parts: unknown[]) {
  const hash = createHash("sha256").update(JSON.stringify(parts)).digest();
  const bytes = Array.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
