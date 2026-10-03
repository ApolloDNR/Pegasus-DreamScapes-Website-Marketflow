import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import {chromium,type Browser} from 'playwright-core';
import express from 'express';
import type {Server} from 'node:http';
import type {AddressInfo} from 'node:net';
import path from 'node:path';
import {sql} from 'drizzle-orm';
import {createWebsiteDb,type WebsiteDb} from '../db';
import {registerWebsiteLeadRoute} from '../lead-route';
import {assertWebsiteTestTarget} from '../../../scripts/website-db-test-target.mjs';
// Explicit opt-in: real production compiled UI + production HTTP handler + disposable PostgreSQL.
// No provider delivery worker or product authentication bypass is installed.
describe.skipIf(process.env.WEBSITE_DB_TESTS!=='1'||process.env.WEBSITE_BROWSER_TESTS!=='1')('buyer operating browser',()=>{
 let db:WebsiteDb,close:()=>Promise<void>,browser:Browser,server:Server,base:string;let oldOrg:string|undefined;
 const org='a5000000-0000-4000-8000-000000000088';
 beforeAll(async()=>{({db,close}=createWebsiteDb(assertWebsiteTestTarget(process.env.WEBSITE_TEST_DATABASE_URL)));oldOrg=process.env.WEBSITE_ORG_ID;process.env.WEBSITE_ORG_ID=org;
  const app=express();app.use(express.json());registerWebsiteLeadRoute(app,{db,rateLimit:(_q,_r,next)=>next()});app.get('/api/site-content',(_q,r)=>r.json({}));app.use('/api',(_q,r)=>r.status(503).json({message:'Synthetic test: unrelated service unavailable'}));app.use(express.static(path.resolve('dist/public')));app.get('*',(_q,r)=>r.sendFile(path.resolve('dist/public/index.html')));server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--disable-dev-shm-usage'],headless:true});
 });
 afterAll(async()=>{await browser?.close();if(server)await new Promise<void>((r,j)=>server.close(e=>e?j(e):r()));if(db){for(const t of ['notification_outbox','delivery_jobs','intake_requests','admin_audit_log','leads'])await db.execute(sql`delete from ${sql.identifier('website')}.${sql.identifier(t)} where org_id=${org}::uuid`);await close();}if(oldOrg===undefined)delete process.env.WEBSITE_ORG_ID;else process.env.WEBSITE_ORG_ID=oldOrg;});
 it('keyboard MarketFlow door submits criteria once and receives its database receipt at phone width',async()=>{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});try{
   await page.goto(`${base}/marketflow`);const buyer=page.getByRole('button',{name:'Buyer',exact:true});await buyer.focus();await page.keyboard.press('Enter');const link=page.getByRole('link',{name:'Share your buying criteria',exact:true});await link.focus();await page.keyboard.press('Enter');await page.waitForURL('**/buyers#buyer-criteria');const form=page.getByRole('form',{name:'Buying criteria'});await form.getByLabel('First name (required)',{exact:true}).fill('Synthetic');await form.getByLabel('Email (required)',{exact:true}).fill('browser-buyer@example.test');await form.getByLabel('State or territory').selectOption('CA');await form.getByRole('button',{name:'Add target area'}).click();await form.getByLabel('Land',{exact:true}).check();await form.getByLabel('Your purchasing role').selectOption('principal');await form.getByLabel(/Contact me about these criteria/).check();await page.waitForTimeout(3100);await form.getByRole('button',{name:'Share buying criteria'}).click();await page.getByText(/Reference: [0-9]+/).waitFor();
   const leads=await db.execute<{id:number;lead_data:any}>(sql`select id,lead_data from website.leads where org_id=${org}::uuid`);expect(leads.rows).toHaveLength(1);expect(await page.getByText(`Reference: ${leads.rows[0].id}`).isVisible()).toBe(true);expect(leads.rows[0].lead_data).toMatchObject({intent:'buyer',buyerAlertConsent:{emailOptIn:false},buyerCriteria:{assetTypes:['land'],geography:[{country:'US',stateCode:'CA',kind:'state'}]}});expect((await db.execute<{n:number}>(sql`select count(*)::int n from website.delivery_jobs where org_id=${org}::uuid`)).rows[0].n).toBe(1);
  }finally{await page.close();}
 },30000);
 it.each([320,390,768,1280])('criteria form stays keyboard-operable without horizontal overflow at %ipx',async width=>{const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});try{await page.goto(`${base}/buyers#buyer-criteria`);const form=page.getByRole('form',{name:'Buying criteria'});await form.waitFor();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await form.getByLabel('First name (required)',{exact:true}).focus();await page.keyboard.type('Synthetic');expect(await form.getByLabel('First name (required)',{exact:true}).inputValue()).toBe('Synthetic');await page.keyboard.press('Tab');expect(await form.getByLabel('Last name (optional)',{exact:true}).evaluate(e=>e===document.activeElement)).toBe(true);}finally{await page.close();}});
});
