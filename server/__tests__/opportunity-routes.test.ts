import { afterAll,beforeAll,beforeEach,describe,expect,it,vi } from 'vitest';
import express from 'express';
import type {AddressInfo} from 'node:net';
import type {Server} from 'node:http';
const state=vi.hoisted(()=>({record:vi.fn(),mail:vi.fn(),forward:vi.fn()}));
vi.mock('../db',()=>({db:{}}));
vi.mock('../website/intake',()=>({recordWebsiteInquiry:state.record}));
vi.mock('../email',()=>({sendEmail:state.mail}));
vi.mock('../integrations/hq-client',()=>({forward:state.forward,outreachReasonForLeadType:()=> 'property_review'}));
import {IntakeConfigurationError,IntakeConflictError} from '../website/intake-policy';
const {registerOpportunityRoutes}=await import('../opportunityRoutes');
let server:Server;let url:string;
const payload={visitorType:'owner',contactName:'Synthetic Owner',email:'synthetic@example.test',propertyAddress:'100 Synthetic Ave',consentAccepted:true,hp_company:'',ts_elapsed_ms:4000};
beforeAll(async()=>{const app=express();app.use(express.json());const pass:express.RequestHandler=(_q,_s,n)=>n();registerOpportunityRoutes(app,{isAuthenticated:pass,requireStaffRole:pass,publicIntakeRateLimit:pass});await new Promise<void>(r=>{server=app.listen(0,r);});url=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;});
afterAll(async()=>{await new Promise<void>((r,j)=>server.close(e=>e?j(e):r()));});
beforeEach(()=>{vi.clearAllMocks();state.record.mockImplementation(async(input:any)=>({record:{type:'opportunity',id:'1a7cd03f-d138-4f8e-8c62-73864d5cc0fd'},duplicate:false,row:{id:'1a7cd03f-d138-4f8e-8c62-73864d5cc0fd',status:'New',recommendedLane:input.payload.recommendedLane,assignedDepartment:input.payload.assignedDepartment}}));});
const post=(changes:Record<string,unknown>={},key?:string)=>fetch(`${url}/api/opportunities`,{method:'POST',headers:{'content-type':'application/json',...(key?{'Idempotency-Key':key}:{})},body:JSON.stringify({...payload,...changes})});
describe('opportunity route atomic intake boundary',()=>{
 it.each(['List through Apollo / Keller Williams', 'Hold / rent', 'Find buyer'])(
  'preserves investor mandate facts while routing goal %s for neutral review',
  async (goal) => {
   const mandate = {
    visitorType: 'buyer',
    sourcePage: '/bring-an-opportunity',
    leadSource: 'public_website_v1',
    goal,
    notes: 'Seeking an East Bay duplex within the stated investment budget.',
   };
   const response = await post(mandate);
   expect(response.status).toBe(201);
   expect(await response.json()).toEqual({
    id: '1a7cd03f-d138-4f8e-8c62-73864d5cc0fd',
    status: 'New',
    recommendedLane: 'Investor mandate → human review',
    assignedDepartment: 'Strategy Review',
   });
   const recorded = state.record.mock.calls[0][0];
   expect(recorded.kind).toBe('opportunity');
   expect(recorded.payload).toMatchObject({
    ...mandate,
    recommendedLane: 'Investor mandate → human review',
    assignedDepartment: 'Strategy Review',
   });
   expect(recorded.payload).not.toHaveProperty('leadType');
   expect(recorded.payload).not.toHaveProperty('intent');
   expect(state.mail).not.toHaveBeenCalled();
   expect(state.forward).not.toHaveBeenCalled();
  },
 );
 it('preserves 201 receipt and delegates validated routed facts to atomic intake',async()=>{const key='44f6cd06-c045-4c31-b17b-3c8b2431e315';const response=await post({},key);expect(response.status).toBe(201);expect(await response.json()).toEqual({id:'1a7cd03f-d138-4f8e-8c62-73864d5cc0fd',status:'New',recommendedLane:'Acquisitions → (Development) → Dispositions',assignedDepartment:'Acquisitions'});expect(state.record).toHaveBeenCalledWith(expect.objectContaining({kind:'opportunity',idempotencyKey:key,authSubject:null,payload:expect.objectContaining({consentAccepted:true,contactName:'Synthetic Owner',assignedDepartment:'Acquisitions'})}),expect.anything());expect(state.mail).not.toHaveBeenCalled();expect(state.forward).not.toHaveBeenCalled();});
 it('does not return a recorded receipt when atomic persistence fails',async()=>{state.record.mockRejectedValueOnce(new Error('synthetic queue failure'));const response=await post();expect(response.status).toBe(500);expect(await response.json()).not.toHaveProperty('id');});
 it('does not manufacture CA-only property address for a strategy inquiry',async()=>{expect((await post({visitorType:'strategy_only',propertyAddress:undefined,state:'CA',leadSource:'blueprint_request'})).status).toBe(201);expect(state.record.mock.calls[0][0].payload.propertyAddress).toBeUndefined();});
 it('returns clear unavailable when organization is unconfigured',async()=>{state.record.mockRejectedValueOnce(new IntakeConfigurationError('Website intake is not configured'));expect((await post()).status).toBe(503);});
 it('returns explicit conflict for reused key with different facts',async()=>{state.record.mockRejectedValueOnce(new IntakeConflictError('This request key belongs to a different submission.'));expect((await post()).status).toBe(409);});
 it('rejects malformed idempotency keys before persistence',async()=>{expect((await post({},'bad-key')).status).toBe(400);expect(state.record).not.toHaveBeenCalled();});
 it('keeps anti-spam and required consent before persistence',async()=>{expect((await post({ts_elapsed_ms:1})).status).toBe(400);expect((await post({hp_company:'bot'})).status).toBe(400);expect((await post({consentAccepted:false})).status).toBe(400);expect(state.record).not.toHaveBeenCalled();});
 it('replay preserves its original creation receipt after staff status changes',async()=>{state.record.mockResolvedValueOnce({record:{type:'opportunity',id:'1a7cd03f-d138-4f8e-8c62-73864d5cc0fd'},duplicate:true,row:{status:'Reviewed',recommendedLane:'Property Review',assignedDepartment:'Acquisitions'}});const response=await post();expect(response.status).toBe(201);expect((await response.json()).status).toBe('New');});

});
