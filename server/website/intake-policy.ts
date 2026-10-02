import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { canonicalInquiryPayload, capturedLeadSchema, capturedOpportunitySchema, type WebsiteInquiryEnvelopeV1 } from '../../shared/website-inquiry-contract';
import { OPPORTUNITY_CONTACT_CONSENT_VERSION } from './intake-values';

type Submission = WebsiteInquiryEnvelopeV1['submission'];
export class IntakeConfigurationError extends Error {}
export class IntakeConflictError extends Error {}
export function getWebsiteOrgId(env: Record<string,string|undefined> = process.env): string {
  const parsed=z.string().uuid().safeParse(env.WEBSITE_ORG_ID);
  if(!parsed.success) throw new IntakeConfigurationError('Website intake is not configured');
  return parsed.data;
}
export function parseIdempotencyKey(value: unknown): string {
  if(value===undefined) return randomUUID();
  return z.string().uuid().parse(value).toLowerCase();
}
function asRecord(value:unknown):Record<string,unknown>{
  return value!==null && typeof value==='object' && !Array.isArray(value) ? value as Record<string,unknown> : {};
}
function pick(value:Record<string,unknown>,keys:string[]):Record<string,unknown>{
  return Object.fromEntries(keys.filter(key=>value[key]!==undefined).map(key=>[key,value[key]]));
}
export function prepareInquiry(kind:'opportunity'|'lead', payload:unknown, now:Date):Submission {
  const input=asRecord(payload);
  if(kind==='opportunity') {
    const captured=capturedOpportunitySchema.parse(pick(input,Object.keys(capturedOpportunitySchema.shape)));
    return {kind,captured,consent:{contact:captured.consentAccepted,copyVersion:OPPORTUNITY_CONTACT_CONSENT_VERSION,capturedAt:now.toISOString(),privacyAcknowledged:false}};
  }
  const candidate=pick(input,Object.keys(capturedLeadSchema.shape));
  if(candidate.leadData && typeof candidate.leadData==='object' && !Array.isArray(candidate.leadData)) {
    candidate.leadData={...asRecord(candidate.leadData)};
    delete (candidate.leadData as Record<string,unknown>).hp_company;
    delete (candidate.leadData as Record<string,unknown>).ts_elapsed_ms;
    delete (candidate.leadData as Record<string,unknown>).ts_mounted_at;
  }
  const captured=capturedLeadSchema.parse(candidate);
  const audit=asRecord(asRecord(captured.leadData).consentAudit);
  const capturedAt=z.string().datetime().safeParse(audit.capturedAt);
  return {kind,captured,consent:{contact:audit.consentContact===true,privacyAcknowledged:audit.consentCcpaAcknowledged===true,copyVersion:typeof audit.version==='string'?audit.version:null,capturedAt:capturedAt.success?capturedAt.data:null}};
}
export function intakeRequestHash(submission:Submission):string {
  const stable=JSON.parse(JSON.stringify(submission)) as Submission;
  stable.consent.capturedAt=null;
  if(stable.kind==='lead') {
    const data=asRecord(stable.captured.leadData);
    const audit=asRecord(data.consentAudit); delete audit.capturedAt;
    if(stable.captured.leadType==='marketflow_access'){
      const access=asRecord(data.marketflow_access_request); delete access.submittedAt;
    }
  }
  return createHash('sha256').update(canonicalInquiryPayload(stable)).digest('hex');
}
