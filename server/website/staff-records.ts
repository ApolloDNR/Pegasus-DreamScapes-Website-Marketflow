import type { Express, RequestHandler } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { leads } from '../../shared/website-schema';
import type {WebsiteDb} from './db';
import { createWebsiteStaffGuard } from './staff-guard';

const staffPatchSchema=z.object({
  stage:z.string().trim().min(1).max(50).optional(),
  internalNotes:z.string().max(50_000).nullable().optional(),
  notes:z.string().max(50_000).nullable().optional(),
  priority:z.enum(['low','medium','high','urgent']).optional(),
}).strict().refine(value=>Object.keys(value).length>0,{message:'At least one review field is required'});
export type WebsiteStaffPatch=z.infer<typeof staffPatchSchema>;
export async function listWebsiteLeads(db:WebsiteDb,org:string,filters:{leadType?:string;stage?:string;assignedTo?:string}){
 const predicates=[eq(leads.orgId,org)];if(filters.leadType)predicates.push(eq(leads.leadType,filters.leadType));if(filters.stage)predicates.push(eq(leads.stage,filters.stage));if(filters.assignedTo)predicates.push(eq(leads.assignedTo,filters.assignedTo));
 return db.select().from(leads).where(and(...predicates)).orderBy(desc(leads.createdAt)).limit(200);
}
export async function getWebsiteLead(db:WebsiteDb,org:string,id:number){const [row]=await db.select().from(leads).where(and(eq(leads.orgId,org),eq(leads.id,id)));return row;}
export async function updateWebsiteLead(db:WebsiteDb,org:string,id:number,patch:WebsiteStaffPatch){const safe=staffPatchSchema.parse(patch);const [row]=await db.update(leads).set({...safe,updatedAt:new Date()}).where(and(eq(leads.orgId,org),eq(leads.id,id))).returning();return row;}
export function registerWebsiteStaffLeadRoutes(app:Express,db:WebsiteDb){
 const guard=createWebsiteStaffGuard({db});
 const handle=(work:RequestHandler):RequestHandler=>async(req,res,next)=>{try{await work(req,res,next);}catch(error){if(error instanceof z.ZodError){res.status(400).json({message:'Invalid review fields.'});return;}console.error('[website-staff] record operation unavailable');res.status(503).json({message:'Records are temporarily unavailable.'});}};
 app.get('/api/hq/leads',guard,handle(async(req,res)=>{res.json(await listWebsiteLeads(db,req.websiteStaff!.orgId,{leadType:typeof req.query.leadType==='string'?req.query.leadType:undefined,stage:typeof req.query.stage==='string'?req.query.stage:undefined,assignedTo:typeof req.query.assignedTo==='string'?req.query.assignedTo:undefined}));}));
 app.get('/api/hq/vendors',guard,handle(async(req,res)=>{res.json(await listWebsiteLeads(db,req.websiteStaff!.orgId,{leadType:'vendor'}));}));
 app.get('/api/hq/leads/:id',guard,handle(async(req,res)=>{const id=z.coerce.number().int().positive().parse(req.params.id);const row=await getWebsiteLead(db,req.websiteStaff!.orgId,id);if(!row){res.status(404).json({message:'Lead not found'});return;}res.json(row);}));
 for(const route of ['/api/hq/leads/:id','/api/hq/leads/:id/stage'])app.patch(route,guard,handle(async(req,res)=>{const id=z.coerce.number().int().positive().parse(req.params.id);const row=await updateWebsiteLead(db,req.websiteStaff!.orgId,id,req.body);if(!row){res.status(404).json({message:'Lead not found'});return;}res.json(row);}));
 // Assignment is a directory-backed operation; never write arbitrary legacy IDs.
 app.patch('/api/hq/leads/:id/assign',guard,handle(async(req,res)=>{
  const id=z.coerce.number().int().positive().parse(req.params.id);
  const assignedTo=z.string().uuid().parse(req.body?.assignedTo);
  const {sql}=await import('drizzle-orm');
  const target=await db.execute(sql`select a.auth_user_id from public.accounts a join public.memberships m on m.account_id=a.id where a.auth_user_id=${assignedTo}::uuid and m.org_id=${req.websiteStaff!.orgId}::uuid and m.status='active' and m.role in ('owner','admin','manager','operator') and a.suspended_at is null and a.deleted_at is null`);
  if(target.rows.length!==1){res.status(400).json({message:'Select an active member of this organization.'});return;}
  const [row]=await db.update(leads).set({assignedTo,assignedAt:new Date(),updatedAt:new Date()}).where(and(eq(leads.orgId,req.websiteStaff!.orgId),eq(leads.id,id))).returning();
  if(!row){res.status(404).json({message:'Lead not found'});return;}res.json(row);
 }));
}
