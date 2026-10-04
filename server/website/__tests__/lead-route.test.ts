import {buildBuyerCriteriaLeadSubmission,createEmptyBuyerCriteriaDraft} from '../../../shared/buyer-criteria';
import {beforeAll,afterAll,beforeEach,describe,it,expect,vi} from 'vitest';
import express from 'express';import type {Server} from 'node:http';import type {AddressInfo} from 'node:net';
const state=vi.hoisted(()=>({record:vi.fn()}));
vi.mock('../intake',()=>({recordWebsiteInquiry:state.record}));
import {registerWebsiteLeadRoute} from '../lead-route';
import {IntakeConflictError,IntakeConfigurationError} from '../intake-policy';
let server:Server;let base:string;
const body={leadType:'contact',source:'contact_page',firstName:'Synthetic',email:'synthetic@example.test',consentContact:false,leadData:{message:'General inquiry'}};
beforeAll(async()=>{const app=express();app.use(express.json());registerWebsiteLeadRoute(app,{db:{} as any,rateLimit:(_q,_s,n)=>n()});await new Promise<void>(r=>{server=app.listen(0,r);});base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;});
afterAll(async()=>{await new Promise<void>((r,j)=>server.close(e=>e?j(e):r()));});
beforeEach(()=>{state.record.mockReset().mockImplementation(async(input:any)=>({record:{type:'lead',id:7},duplicate:false,row:{id:7,...input.payload,orgId:'private',authSubject:'private'}}));});
const post=(data:Record<string,unknown>=body,key='a5000000-0000-4000-8000-000000000002')=>fetch(`${base}/api/leads`,{method:'POST',headers:{'content-type':'application/json','Idempotency-Key':key},body:JSON.stringify(data)});
describe('website lead route',()=>{
 it('preserves referral and both permission facts for structured criteria in the immutable payload', async () => {
  const d=createEmptyBuyerCriteriaDraft();Object.assign(d,{firstName:'Synthetic',email:'buyer@example.test',consentContact:true,referredBy:'referral-person'});d.criteria.geography=[{country:'US',stateCode:'TX',kind:'state'}];d.criteria.assetTypes=['land'];d.criteria.purchaser.role='principal';
  const payload={...buildBuyerCriteriaLeadSubmission(d),ts_elapsed_ms:4000};const r=await post(payload);expect(r.status).toBe(201);expect(await r.json()).toEqual({id:7,stage:'new'});
  const captured=state.record.mock.calls[0][0].payload;expect(captured.leadType).toBe('buyer');expect(captured.leadData.referredBy).toBe('referral-person');expect(captured.leadData.buyerCriteria).toEqual(d.criteria);expect(captured.leadData.buyerAlertConsent.emailOptIn).toBe(false);expect(captured.leadData.consentAudit).toMatchObject({consentContact:true,consentCcpaAcknowledged:false});
 });
 it('rejects top-level criteria markers instead of treating them as a legacy inquiry',async()=>{expect((await post({...body,buyerCriteria:{}})).status).toBe(400);expect(state.record).not.toHaveBeenCalled();});
 it.each(['buyerCriteria','buyerAlertConsent'])('rejects malformed %s markers before persistence instead of falling through legacy intake', async marker => {
  const r=await post({...body,leadData:{[marker]:null}});expect(r.status).toBe(400);expect(state.record).not.toHaveBeenCalled();
 });
 it.each([
  ['Buy a home (Buyer representation)', 'buyer'],
  ['List my property (Seller representation)', 'seller'],
 ])('preserves explicit representation intent for %s', async (role, lane) => {
  const leadData = {
   intent: 'representation',
   role,
   context: 'East Bay representation request',
   contextKind: 'context',
   message: 'Please discuss representation with me.',
  };
  const response = await post({
   ...body,
   leadType: 'submit',
   source: 'form',
   consentContact: true,
   ts_elapsed_ms: 4000,
   leadData,
  });
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ id: 7, stage: 'new' });
  const recorded = state.record.mock.calls[0][0];
  expect(recorded.kind).toBe('lead');
  expect(recorded.payload).toMatchObject({
   leadType: lane,
   source: 'form',
   leadData: { ...leadData, lane },
  });
  expect(recorded.payload).not.toHaveProperty('visitorType');
  expect(recorded.payload).not.toHaveProperty('assignedDepartment');
  expect(recorded.payload).not.toHaveProperty('recommendedLane');
 });
 it('preserves integer receipt and actual false consent, excludes private identity from response',async()=>{const r=await post();expect(r.status).toBe(201);const json=await r.json();expect(json.id).toBe(7);expect(json).not.toHaveProperty('orgId');expect(json).not.toHaveProperty('authSubject');expect(state.record.mock.calls[0][0].payload.leadData.consentAudit.consentContact).toBe(false);});
 it('keeps required consent and anti-spam gates before persistence',async()=>{expect((await post({...body,leadType:'submit',ts_elapsed_ms:4000})).status).toBe(400);expect((await post({...body,leadType:'submit',consentContact:true,ts_elapsed_ms:1})).status).toBe(400);expect(state.record).not.toHaveBeenCalled();});
 it('returns409 conflict and503 unavailable without success receipt',async()=>{state.record.mockRejectedValueOnce(new IntakeConflictError('different submission'));expect((await post()).status).toBe(409);state.record.mockRejectedValueOnce(new IntakeConfigurationError('unconfigured'));expect((await post()).status).toBe(503);});
 it('rejects invalid key before persistence',async()=>{expect((await post(body,'invalid')).status).toBe(400);expect(state.record).not.toHaveBeenCalled();});
 it('retains a caller-supplied key and only verified ownership',async()=>{await post({...body,authSubject:'spoof',orgId:'spoof'});expect(state.record.mock.calls[0][0]).toEqual(expect.objectContaining({idempotencyKey:'a5000000-0000-4000-8000-000000000002',authSubject:null}));});
 it('replay returns only the original receipt after private staff updates',async()=>{state.record.mockResolvedValueOnce({record:{type:'lead',id:7},duplicate:true,row:{id:7,stage:'qualified',internalNotes:'PRIVATE STAFF NOTE',assignedTo:'staff-id',score:90,email:'private@example.test'}});const response=await post();expect(response.status).toBe(201);expect(await response.json()).toEqual({id:7,stage:'new'});});

});
