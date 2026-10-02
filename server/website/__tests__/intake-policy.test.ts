import { describe, expect, it } from 'vitest';
import { prepareInquiry, intakeRequestHash, getWebsiteOrgId, parseIdempotencyKey } from '../intake-policy';
const lead = { leadType:'contact',source:'contact_page',firstName:'Synthetic',email:'synthetic@example.test',leadData:{ message:'Original context', consentAudit:{consentContact:false,consentCcpaAcknowledged:false,version:'lead-contact-v1',capturedAt:'2026-10-02T00:00:00.000Z'} } };
describe('atomic intake policy',()=>{
  it('preserves actual consent and captured narrative',()=>{
    const result=prepareInquiry('lead',lead,new Date('2026-10-02T01:00:00Z'));
    expect(result.consent.contact).toBe(false); expect(result.consent.privacyAcknowledged).toBe(false);
    expect(result.captured.leadData).toEqual(lead.leadData);
    expect(result.consent.capturedAt).toBe('2026-10-02T00:00:00.000Z');
  });
  it('excludes transport timing and generated audit timestamps from retry identity',()=>{
    const a=prepareInquiry('lead',lead,new Date());
    const b=prepareInquiry('lead',{...lead,leadData:{...lead.leadData,ts_elapsed_ms:9999,consentAudit:{...lead.leadData.consentAudit,capturedAt:'2026-10-03T00:00:00.000Z'}}},new Date());
    expect(intakeRequestHash(a)).toBe(intakeRequestHash(b));
    expect(intakeRequestHash(prepareInquiry('lead',{...lead,notes:'changed'},new Date()))).not.toBe(intakeRequestHash(a));
  });
  it('never captures client-controlled staff or ownership properties',()=>{
    const result=prepareInquiry('lead',{...lead,orgId:'evil',authSubject:'evil',assignedTo:'evil',internalNotes:'private'},new Date());
    expect(result.captured).not.toHaveProperty('orgId'); expect(result.captured).not.toHaveProperty('internalNotes'); expect(result.captured).not.toHaveProperty('assignedTo');
  });
  it('validates configured organization without fallback to visitor fields',()=>{
    expect(()=>getWebsiteOrgId({})).toThrow('Website intake is not configured');
    expect(()=>getWebsiteOrgId({WEBSITE_ORG_ID:'invalid'})).toThrow();
    expect(getWebsiteOrgId({WEBSITE_ORG_ID:'44f6cd06-c045-4c31-b17b-3c8b2431e315'})).toBe('44f6cd06-c045-4c31-b17b-3c8b2431e315');
  });
  it('rejects malformed supplied keys and generates a key only for absent old-client headers',()=>{
    expect(()=>parseIdempotencyKey('wrong')).toThrow();
    expect(parseIdempotencyKey(undefined)).toMatch(/^[0-9a-f-]{36}$/);
    const key='44f6cd06-c045-4c31-b17b-3c8b2431e315'; expect(parseIdempotencyKey(key)).toBe(key);
  });
  it('preserves visitor timestamp context outside the server-owned MarketFlow request shape',()=>{
    const make=(submittedAt:string)=>prepareInquiry('lead',{...lead,leadData:{...lead.leadData,marketflow_access_request:{submittedAt}}},new Date());
    expect(intakeRequestHash(make('visitor first value'))).not.toBe(intakeRequestHash(make('visitor changed value')));
  });

});
