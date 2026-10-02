import { describe, expect, it } from 'vitest';
import { websiteInquiryEnvelopeSchema, websiteInquiryReceiptSchema, canonicalInquiryPayload } from '../../../shared/website-inquiry-contract';

const envelope = { contractVersion: 1, idempotencyKey: '44f6cd06-c045-4c31-b17b-3c8b2431e315', websiteRecord: { type: 'lead', id: 42 }, submission: { kind: 'lead', captured: { leadType: 'contact', source: 'contact_page', firstName: 'A', email: 'a@example.test', leadData: { message: 'Systems question', consentAudit: { consentCcpaAcknowledged: false } } }, consent: { contact: true, copyVersion: 'contact-v1', capturedAt: '2026-10-02T00:00:00.000Z', privacyAcknowledged: false } } };
describe('versioned website inquiry contract', () => {
  it('accepts genuine non-property inquiry without inventing address or acknowledgement', () => {
    const parsed = websiteInquiryEnvelopeSchema.parse(envelope);
    expect(parsed.submission.captured).not.toHaveProperty('address');
    expect(parsed.submission.consent.privacyAcknowledged).toBe(false);
    expect(parsed.submission.captured.leadData).toEqual(envelope.submission.captured.leadData);
  });
  it('rejects unknown top-level context and mismatched record kind', () => {
    expect(websiteInquiryEnvelopeSchema.safeParse({ ...envelope, token: 'not-allowed' }).success).toBe(false);
    expect(websiteInquiryEnvelopeSchema.safeParse({ ...envelope, websiteRecord: { type: 'opportunity', id: '44f6cd06-c045-4c31-b17b-3c8b2431e315' } }).success).toBe(false);
  });
  it('rejects unrecognized captured fields without stripping them silently', () => {
    expect(websiteInquiryEnvelopeSchema.safeParse({ ...envelope, submission: { ...envelope.submission, captured: { ...envelope.submission.captured, password: 'never' } } }).success).toBe(false);
  });
  it('retains website maximum contact lengths and arbitrary JSON lead context', () => {
    const captured = { ...envelope.submission.captured, firstName: 'x'.repeat(255), email: 'x'.repeat(255), phone: '1'.repeat(50), leadData: { nested: [false, null, 'é'] } };
    expect(websiteInquiryEnvelopeSchema.parse({ ...envelope, submission: { ...envelope.submission, captured } }).submission.captured).toEqual(captured);
  });
  it('canonicalizes object order but preserves arrays null and false', () => {
    expect(canonicalInquiryPayload({ b: false, a: { y: null, x: [2,1] } })).toBe(canonicalInquiryPayload({ a: { x: [2,1], y: null }, b: false }));
    expect(canonicalInquiryPayload([1,2])).not.toBe(canonicalInquiryPayload([2,1]));
    expect(canonicalInquiryPayload(false)).not.toBe(canonicalInquiryPayload(null));
  });
  it('requires a full versioned receipt with the correct ID type', () => {
    const receipt = { contractVersion: 1, inquiryId:'bb2c938a-a23d-457c-a8e1-5fe59c4f3a27', reference:'WI-42', websiteRecord: envelope.websiteRecord, idempotencyKey: envelope.idempotencyKey };
    expect(websiteInquiryReceiptSchema.parse(receipt)).toEqual(receipt);
    expect(websiteInquiryReceiptSchema.safeParse({ ok:true }).success).toBe(false);
    expect(websiteInquiryReceiptSchema.safeParse({ ...receipt, websiteRecord: { type: 'lead', id: '42' } }).success).toBe(false);
  });
});
