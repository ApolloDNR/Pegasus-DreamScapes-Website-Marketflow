import {beforeAll,afterAll,describe,it,expect} from 'vitest';
import {readFile} from 'node:fs/promises';import {sql} from 'drizzle-orm';
import {createWebsiteDb,type WebsiteDb} from '../db';
import {listWebsiteLeads,getWebsiteLead,updateWebsiteLead} from '../staff-records';
import {assertWebsiteTestTarget} from '../../../scripts/website-db-test-target.mjs';
const org='a6000000-0000-4000-8000-000000000001',other='a6000000-0000-4000-8000-000000000002';
describe.skipIf(process.env.WEBSITE_DB_TESTS!=='1')('staff inquiry organization isolation',()=>{
 let db:WebsiteDb,close:()=>Promise<void>,id:number;
 beforeAll(async()=>{({db,close}=createWebsiteDb(assertWebsiteTestTarget(process.env.WEBSITE_TEST_DATABASE_URL)));await db.execute(sql.raw(await readFile(new URL('../../../migrations/website/0001_website_foundation.sql',import.meta.url),'utf8')));const result=await db.execute<{id:number}>(sql`insert into website.leads(org_id,lead_type,source,first_name,email) values(${other}::uuid,'contact','test','Synthetic','synthetic@example.test') returning id`);id=result.rows[0].id;});
 afterAll(async()=>{if(db){await db.execute(sql`delete from website.leads where org_id in (${org}::uuid,${other}::uuid)`);await close();}});
 it('never lists another organization record',async()=>{expect(await listWebsiteLeads(db,org,{})).toEqual([]);expect((await listWebsiteLeads(db,other,{})).map(x=>x.id)).toContain(id);});
 it('cannot retrieve or modify a guessed cross-organization ID',async()=>{expect(await getWebsiteLead(db,org,id)).toBeUndefined();expect(await updateWebsiteLead(db,org,id,{notes:'forbidden'})).toBeUndefined();expect((await getWebsiteLead(db,other,id))?.notes).toBeNull();});
 it('cannot move records or rewrite consent using staff patch',async()=>{await expect(updateWebsiteLead(db,other,id,{orgId:org} as any)).rejects.toThrow();await expect(updateWebsiteLead(db,other,id,{leadData:{consentAudit:{consentContact:true}}} as any)).rejects.toThrow();});
 it('can update ordinary review notes within organization',async()=>{expect((await updateWebsiteLead(db,other,id,{internalNotes:'Synthetic review note'}))?.internalNotes).toBe('Synthetic review note');});
});
