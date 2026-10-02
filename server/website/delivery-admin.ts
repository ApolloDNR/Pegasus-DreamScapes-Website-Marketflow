import type {Express,RequestHandler} from 'express';
import {and,desc,eq} from 'drizzle-orm';
import {z} from 'zod';
import {websiteDeliveryJobs} from '../../shared/website-schema';
import type {WebsiteDb} from './db';
import {createWebsiteStaffGuard} from './staff-guard';
import {createWebsiteHqTransport,reschedulePendingHqDelivery} from './delivery';
export async function listWebsiteDeliveryJobs(db:WebsiteDb,org:string,status?:string){
 const filter=[eq(websiteDeliveryJobs.orgId,org)];if(status)filter.push(eq(websiteDeliveryJobs.status,status));
 return db.select().from(websiteDeliveryJobs).where(and(...filter)).orderBy(desc(websiteDeliveryJobs.createdAt)).limit(200);
}
export function registerWebsiteDeliveryAdmin(app:Express,db:WebsiteDb){
 const guard=createWebsiteStaffGuard({db});
 const handle=(fn:RequestHandler):RequestHandler=>async(req,res,next)=>{res.setHeader('Cache-Control','no-store');try{await fn(req,res,next);}catch(error){res.status(error instanceof z.ZodError?400:503).json({message:'Delivery queue operation is unavailable.'});}};
 app.get('/api/admin/hq-outbox',guard,handle(async(req,res)=>{
  const status=z.enum(['pending','processing','delivered','quarantined']).optional().parse(req.query.status||undefined);
  const jobs=await listWebsiteDeliveryJobs(db,req.websiteStaff!.orgId,status);
  res.json({rows:jobs.map(job=>({...job,surface:job.recordType,sourceId:job.opportunityId??job.leadId})),transportConfigured:createWebsiteHqTransport()!==null,legacyRequiresReview:true});
 }));
 app.post('/api/admin/hq-outbox/:id/retry',guard,handle(async(req,res)=>{
  const id=z.string().uuid().parse(req.params.id);
  const ok=await reschedulePendingHqDelivery(db,id);
  res.status(ok?200:409).json(ok?{ok:true,message:'Pending delivery rescheduled.'}:{message:'This delivery cannot be retried automatically. Review its recorded state.'});
 }));
 app.post('/api/admin/hq-outbox/drain',guard,handle(async(req,res)=>{
  const jobs=await listWebsiteDeliveryJobs(db,req.websiteStaff!.orgId,'pending');let rescheduled=0;
  for(const job of jobs.slice(0,25))if(await reschedulePendingHqDelivery(db,job.id))rescheduled++;
  res.json({rescheduled,message:'Pending work was rescheduled; provider delivery is not confirmed by this action.'});
 }));
}
