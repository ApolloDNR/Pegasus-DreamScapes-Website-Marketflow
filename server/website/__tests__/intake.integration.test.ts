import {buildBuyerCriteriaLeadSubmission,createEmptyBuyerCriteriaDraft} from '../../../shared/buyer-criteria';
import { deliverHqBatch } from "../delivery";
import express from "express";
import type { AddressInfo } from "node:net";
import { registerWebsiteLeadRoute } from "../lead-route";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { sql } from 'drizzle-orm';
import { createWebsiteDb, type WebsiteDb } from '../db';
import { recordWebsiteInquiry } from '../intake';
import { assertWebsiteTestTarget } from '../../../scripts/website-db-test-target.mjs';
const org='a5000000-0000-4000-8000-000000000001';
const key='a5000000-0000-4000-8000-000000000002';
const opportunity={visitorType:'owner',contactName:'Synthetic Owner',email:'synthetic@example.test',consentAccepted:true,notes:'Synthetic only'};
const lead={leadType:'contact',source:'contact_page',firstName:'Synthetic',email:'synthetic@example.test',leadData:{message:'General systems inquiry',consentAudit:{consentContact:false,consentCcpaAcknowledged:false,version:'lead-contact-v1',capturedAt:'2026-10-02T00:00:00.000Z'}}};
describe.skipIf(process.env.WEBSITE_DB_TESTS!=='1')('atomic public intake PostgreSQL proof',()=>{
 let db:WebsiteDb; let close:()=>Promise<void>; let oldOrg:string|undefined;
 beforeAll(async()=>{const target=assertWebsiteTestTarget(process.env.WEBSITE_TEST_DATABASE_URL);({db,close}=createWebsiteDb(target));await db.execute(sql.raw(await readFile(new URL('../../../migrations/website/0001_website_foundation.sql',import.meta.url),'utf8')));oldOrg=process.env.WEBSITE_ORG_ID;process.env.WEBSITE_ORG_ID=org;});
 const clean=async()=>{for(const table of ['notification_outbox','delivery_jobs','intake_requests','admin_audit_log','opportunities','leads']) await db.execute(sql`delete from ${sql.identifier('website')}.${sql.identifier(table)} where org_id=${org}::uuid`);};
 beforeEach(clean);
 afterAll(async()=>{if(db){await clean();await close();}if(oldOrg===undefined)delete process.env.WEBSITE_ORG_ID;else process.env.WEBSITE_ORG_ID=oldOrg;});
 it('structured buyer HTTP retry preserves the original envelope and one job without activating alert delivery',async()=>{
  const d=createEmptyBuyerCriteriaDraft();Object.assign(d,{firstName:'Synthetic',email:'buyer@example.test',consentContact:true,referredBy:'synthetic-reference'});d.criteria.geography=[{country:'US',stateCode:'TX',kind:'state'}];d.criteria.assetTypes=['land'];d.criteria.purchaser.role='principal';
  const payload={...buildBuyerCriteriaLeadSubmission(d),ts_elapsed_ms:4000};
  const app=express();app.use(express.json());registerWebsiteLeadRoute(app,{db,rateLimit:(_q,_s,next)=>next()});const server=app.listen(0);await new Promise<void>(resolve=>server.once('listening',resolve));
  const send=()=>fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}/api/leads`,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(payload)});
  try{const a=await send();expect(a.status).toBe(201);const receipt=await a.json();const before=(await db.execute<{payload:any}>(sql`select payload from website.delivery_jobs where org_id=${org}::uuid`)).rows[0].payload;
   const b=await send();expect(b.status).toBe(201);expect(await b.json()).toEqual(receipt);const jobs=await db.execute<{payload:any}>(sql`select payload from website.delivery_jobs where org_id=${org}::uuid`);expect(jobs.rows).toHaveLength(1);expect(jobs.rows[0].payload).toEqual(before);expect(before.submission.captured.leadData).toMatchObject({buyerCriteria:d.criteria,buyerAlertConsent:{emailOptIn:false},referredBy:'synthetic-reference'});expect(before.submission.consent.contact).toBe(true);expect(before.submission.consent.privacyAcknowledged).toBe(false);
   expect((await db.execute<{n:number}>(sql`select count(*)::int n from website.leads where org_id=${org}::uuid`)).rows[0].n).toBe(1);
  }finally{await new Promise<void>((r,j)=>server.close(e=>e?j(e):r()));}
 });
 it('records both receipt types and transactionally queues HQ and email purposes',async()=>{
  const a=await recordWebsiteInquiry({kind:'opportunity',payload:opportunity,idempotencyKey:key,authSubject:null},db);
  expect(a.record.type).toBe('opportunity');expect(a.record.id).toMatch(/^[0-9a-f-]{36}$/);
  const b=await recordWebsiteInquiry({kind:'lead',payload:lead,idempotencyKey:'a5000000-0000-4000-8000-000000000003',authSubject:null},db);
  expect(b.record.type).toBe('lead');expect(typeof b.record.id).toBe('number');
  const counts=await db.execute<{jobs:number;emails:number;audits:number}>(sql`select (select count(*)::int from website.delivery_jobs where org_id=${org}::uuid) jobs,(select count(*)::int from website.notification_outbox where org_id=${org}::uuid) emails,(select count(*)::int from website.admin_audit_log where org_id=${org}::uuid) audits`);
  expect(counts.rows[0]).toEqual({jobs:2,emails:4,audits:2});
 });
 it('twenty concurrent repeats return the same record and one job per destination',async()=>{
  const result=await Promise.all(Array.from({length:20},()=>recordWebsiteInquiry({kind:'opportunity',payload:opportunity,idempotencyKey:key,authSubject:null},db)));
  expect(new Set(result.map(x=>x.record.id)).size).toBe(1);expect(result.filter(x=>!x.duplicate)).toHaveLength(1);
  const count=await db.execute<{n:number}>(sql`select count(*)::int n from website.delivery_jobs where org_id=${org}::uuid`);expect(count.rows[0].n).toBe(1);
 });
 it('reusing key with changed facts conflicts without extra writes',async()=>{
  await recordWebsiteInquiry({kind:'lead',payload:lead,idempotencyKey:key,authSubject:null},db);
  await expect(recordWebsiteInquiry({kind:'lead',payload:{...lead,notes:'Changed'},idempotencyKey:key,authSubject:null},db)).rejects.toThrow('different submission');
  const result=await db.execute<{n:number}>(sql`select count(*)::int n from website.leads where org_id=${org}::uuid`);expect(result.rows[0].n).toBe(1);
 });
 it('preserves genuine nonproperty facts and false consent in HQ payload',async()=>{
  await recordWebsiteInquiry({kind:'lead',payload:lead,idempotencyKey:key,authSubject:null},db);
  const result=await db.execute<{payload:any}>(sql`select payload from website.delivery_jobs where org_id=${org}::uuid`);
  expect(result.rows[0].payload.submission.consent.contact).toBe(false);expect(result.rows[0].payload.submission.consent.privacyAcknowledged).toBe(false);
  expect(result.rows[0].payload.submission.captured).not.toHaveProperty('address');expect(result.rows[0].payload.submission.captured.leadData.message).toBe('General systems inquiry');
 });
 it('notification persistence failure rolls back record audit and HQ job',async()=>{
  await db.execute(sql.raw(`create or replace function website.reject_test_notification() returns trigger language plpgsql as $$ begin if new.org_id='${org}'::uuid then raise exception 'synthetic queue failure'; end if; return new; end $$; create trigger reject_test_notification before insert on website.notification_outbox for each row execute function website.reject_test_notification();`));
  try { await expect(recordWebsiteInquiry({kind:'opportunity',payload:opportunity,idempotencyKey:key,authSubject:null},db)).rejects.toThrow(); }
  finally { await db.execute(sql.raw('drop trigger reject_test_notification on website.notification_outbox; drop function website.reject_test_notification();')); }
  const result=await db.execute<{n:number}>(sql`select count(*)::int n from website.opportunities where org_id=${org}::uuid`);expect(result.rows[0].n).toBe(0);
  const jobs=await db.execute<{n:number}>(sql`select count(*)::int n from website.delivery_jobs where org_id=${org}::uuid`);expect(jobs.rows[0].n).toBe(0);
 });
 it('stores bounded receipt wording and configured staff recipient without sending',async()=>{
  const old=process.env.STAFF_NOTIFICATION_EMAIL;process.env.STAFF_NOTIFICATION_EMAIL='staff@synthetic.test';
  try{await recordWebsiteInquiry({kind:'opportunity',payload:opportunity,idempotencyKey:key,authSubject:null},db);}finally{if(old===undefined)delete process.env.STAFF_NOTIFICATION_EMAIL;else process.env.STAFF_NOTIFICATION_EMAIL=old;}
  const jobs=await db.execute<{purpose:string;payload:{to:string;text:string}}>(sql`select purpose,payload from website.notification_outbox where org_id=${org}::uuid`);
  expect(jobs.rows.find(x=>x.purpose==='staff')?.payload.to).toBe('staff@synthetic.test');
  const receipt=jobs.rows.find(x=>x.purpose==='receipt')!.payload;
  expect(receipt.to).toBe('synthetic@example.test');expect(receipt.text).toContain('This receipt does not promise review, routing, a response, an offer, representation, referral, service, or a transaction.');
  expect(receipt.text).not.toMatch(/will review|will follow up/i);
 });
 it('retains original captured data on retry with a refreshed server audit timestamp',async()=>{
  const first=await recordWebsiteInquiry({kind:'lead',payload:lead,idempotencyKey:key,authSubject:null},db);
  const retry=await recordWebsiteInquiry({kind:'lead',payload:{...lead,leadData:{...lead.leadData,consentAudit:{...lead.leadData.consentAudit,capturedAt:'2026-10-03T00:00:00.000Z'}}},idempotencyKey:key,authSubject:null},db);
  expect(retry.record).toEqual(first.record);expect(retry.duplicate).toBe(true);
  const job=await db.execute<{payload:any}>(sql`select payload from website.delivery_jobs where org_id=${org}::uuid`);
  expect(job.rows[0].payload.submission.consent.capturedAt).toBe('2026-10-02T00:00:00.000Z');
 });

 it('public HTTP replay never returns staff-only updates from a recorded lead',async()=>{
  const app=express();app.use(express.json());registerWebsiteLeadRoute(app,{db,rateLimit:(_q,_s,next)=>next()});
  const server=app.listen(0);await new Promise<void>(resolve=>server.once('listening',resolve));
  const url=`http://127.0.0.1:${(server.address() as AddressInfo).port}/api/leads`;
  const send=()=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(lead)});
  try{
   const first=await send();expect(first.status).toBe(201);const receipt=await first.json();
   await db.execute(sql`update website.leads set internal_notes='PRIVATE STAFF REVIEW',score=90,stage='qualified' where id=${receipt.id} and org_id=${org}::uuid`);
   const retry=await send();expect(retry.status).toBe(201);expect(await retry.json()).toEqual({id:receipt.id,stage:'new'});
  }finally{await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
 });

 it('canonicalizes uppercase UUID keys across PostgreSQL and the immutable HQ envelope',async()=>{
  const first=await recordWebsiteInquiry({kind:'lead',payload:lead,idempotencyKey:key.toUpperCase(),authSubject:null},db);
  const batch=await deliverHqBatch(db,async payload=>({contractVersion:1,inquiryId:'bb2c938a-a23d-457c-a8e1-5fe59c4f3a27',reference:'SYNTHETIC-1',websiteRecord:payload.websiteRecord,idempotencyKey:payload.idempotencyKey}),new Date(Date.now()+1000),{environment:{WEBSITE_ORG_ID:org}});
  expect(batch.delivered).toBe(1);expect(batch.quarantined).toBe(0);
  const retry=await recordWebsiteInquiry({kind:'lead',payload:lead,idempotencyKey:key,authSubject:null},db);expect(retry.record).toEqual(first.record);expect(retry.duplicate).toBe(true);
 });

});
