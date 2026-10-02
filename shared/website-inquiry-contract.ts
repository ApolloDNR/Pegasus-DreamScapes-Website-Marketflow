import { z } from 'zod';

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
const jsonValue: z.ZodType<JsonValue> = z.lazy(() => z.union([
  z.string(), z.number().finite(), z.boolean(), z.null(), z.array(jsonValue), z.record(z.string(), jsonValue),
]));
const text = (max?: number) => (max ? z.string().max(max) : z.string()).nullable().optional();
const amount = z.number().finite().nullable().optional();
export const websiteRecordRefSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('opportunity'), id: z.string().uuid() }).strict(),
  z.object({ type: z.literal('lead'), id: z.number().int().positive() }).strict(),
]);
export type WebsiteRecordRef = z.infer<typeof websiteRecordRefSchema>;

// Frozen captured fields. Unknown transport fields are rejected, never stripped.
// These preserve website limits, including names/emails of 255 and phones of 50.
export const capturedOpportunitySchema = z.object({
  visitorType: z.string().min(1).max(40), contactName: z.string().min(1).max(255), email: z.string().max(255),
  sourcePage: text(120), leadSource: text(120), phone: text(50), preferredContactMethod: text(40), bestTimeToContact: text(120),
  propertyAddress: text(), city: text(100), state: text(50), zipCode: text(20), propertyType: text(60), occupancyStatus: text(60), condition: text(60),
  situation: text(80), goal: text(80), urgency: text(60), estimatedValue: amount, estimatedDebt: amount, notes: text(),
  recommendedLane: text(120), assignedDepartment: text(60), consentAccepted: z.boolean(),
  utmSource: text(100), utmMedium: text(100), utmCampaign: text(100), referrer: text(),
}).strict();
export const capturedLeadSchema = z.object({
  leadType: z.string().max(50), source: z.string().max(50), firstName: z.string().max(255), email: z.string().max(255),
  lastName: text(255), phone: text(50), company: text(255), address: text(), city: text(100), state: text(50), zipCode: text(20),
  leadData: jsonValue.optional(), relatedDealType: text(50), relatedDealId: z.number().int().nullable().optional(), notes: text(),
  utmSource: text(100), utmMedium: text(100), utmCampaign: text(100), referredBy: text(255),
}).strict();
export const inquiryConsentSchema = z.object({
  contact: z.boolean(), copyVersion: z.string().max(120).nullable(), capturedAt: z.string().datetime().nullable(), privacyAcknowledged: z.boolean().nullable(),
}).strict();
export const websiteInquiryEnvelopeSchema = z.object({
  contractVersion: z.literal(1), idempotencyKey: z.string().uuid(), websiteRecord: websiteRecordRefSchema,
  submission: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('opportunity'), captured: capturedOpportunitySchema, consent: inquiryConsentSchema }).strict(),
    z.object({ kind: z.literal('lead'), captured: capturedLeadSchema, consent: inquiryConsentSchema }).strict(),
  ]),
}).strict().refine(value => value.websiteRecord.type === value.submission.kind, { message: 'Record type must match submission kind', path: ['websiteRecord'] });
export type WebsiteInquiryEnvelopeV1 = z.infer<typeof websiteInquiryEnvelopeSchema>;
export const websiteInquiryReceiptSchema = z.object({
  contractVersion: z.literal(1), inquiryId: z.string().uuid(), reference: z.string().min(1).max(100),
  websiteRecord: websiteRecordRefSchema, idempotencyKey: z.string().uuid(),
}).strict();
export type WebsiteInquiryReceiptV1 = z.infer<typeof websiteInquiryReceiptSchema>;

/** Deterministic JSON only: sorted object keys, unchanged arrays/null/false. */
export function canonicalInquiryPayload(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) throw new TypeError('Canonical payload must be JSON');
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalInquiryPayload).join(',')}]`;
  return `{${Object.keys(value).sort().filter(key => (value as Record<string, unknown>)[key] !== undefined)
    .map(key => `${JSON.stringify(key)}:${canonicalInquiryPayload((value as Record<string, unknown>)[key])}`).join(',')}}`;
}
