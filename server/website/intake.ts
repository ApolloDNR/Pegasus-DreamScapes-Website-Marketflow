import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { opportunities, leads, intakeRequests, websiteDeliveryJobs, notificationOutbox, adminAuditLog } from '../../shared/website-schema';
import { websiteInquiryEnvelopeSchema, type WebsiteRecordRef } from '../../shared/website-inquiry-contract';
import type { WebsiteDb } from './db';
import { prepareInquiry, intakeRequestHash, getWebsiteOrgId, parseIdempotencyKey, IntakeConflictError } from './intake-policy';
import { INQUIRY_CONFIRMATION_BODY } from './intake-values';
import { buildGenericLeadNotificationData, resolveStaffNotificationRecipient } from '../lead-intake-policy';

export interface RecordedWebsiteInquiry { record:WebsiteRecordRef; duplicate:boolean; row:Record<string,unknown> }
export async function recordWebsiteInquiry(input:{kind:'opportunity'|'lead';payload:unknown;idempotencyKey:string;authSubject:string|null},db:WebsiteDb):Promise<RecordedWebsiteInquiry>{
  const orgId=getWebsiteOrgId();
  const idempotencyKey=parseIdempotencyKey(input.idempotencyKey);
  const authSubject=input.authSubject===null?null:z.string().uuid().parse(input.authSubject);
  const now=new Date();
  const submission=prepareInquiry(input.kind,input.payload,now);
  const payloadHash=intakeRequestHash(submission);
  return db.transaction(async tx=>{
    // The lock is transaction-scoped. A lost response can retry without creating
    // a second record, even when the first INSERT hasn't committed yet.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${orgId+':'+idempotencyKey},0))`);
    const [existing]=await tx.select().from(intakeRequests).where(and(eq(intakeRequests.orgId,orgId),eq(intakeRequests.idempotencyKey,idempotencyKey)));
    if(existing){
      if(existing.payloadHash!==payloadHash || existing.kind!==input.kind) throw new IntakeConflictError('This request key belongs to a different submission.');
      if(existing.kind==='opportunity' && existing.opportunityId){
        const [row]=await tx.select().from(opportunities).where(and(eq(opportunities.orgId,orgId),eq(opportunities.id,existing.opportunityId)));
        if(!row) throw new Error('Recorded inquiry is unavailable');
        return {record:{type:'opportunity',id:row.id},duplicate:true,row};
      }
      if(existing.kind==='lead' && existing.leadId){
        const [row]=await tx.select().from(leads).where(and(eq(leads.orgId,orgId),eq(leads.id,existing.leadId)));
        if(!row) throw new Error('Recorded inquiry is unavailable');
        return {record:{type:'lead',id:row.id},duplicate:true,row};
      }
      throw new Error('Recorded inquiry has invalid correlation');
    }
    let row:Record<string,unknown>; let record:WebsiteRecordRef;
    if(submission.kind==='opportunity'){
      const [created]=await tx.insert(opportunities).values({...submission.captured,orgId,authSubject,status:'New',consentCopyVersion:submission.consent.copyVersion,consentCapturedAt:now}).returning();
      row=created;record={type:'opportunity',id:created.id};
    }else{
      const [created]=await tx.insert(leads).values({...submission.captured,orgId,authSubject}).returning();
      row=created;record={type:'lead',id:created.id};
    }
    const refs={orgId,idempotencyKey,opportunityId:record.type==='opportunity'?record.id:null,leadId:record.type==='lead'?record.id:null};
    await tx.insert(intakeRequests).values({...refs,kind:record.type,payloadHash});
    const envelope=websiteInquiryEnvelopeSchema.parse({contractVersion:1,idempotencyKey,websiteRecord:record,submission});
    await tx.insert(websiteDeliveryJobs).values({...refs,recordType:record.type,payload:envelope});
    await tx.insert(adminAuditLog).values({orgId,authSubject,actionType:'website_inquiry_recorded',resourceType:record.type,resourceId:String(record.id),description:'Website inquiry and consent recorded',newValue:JSON.stringify(submission.consent)});
    const staff = submission.kind==='lead'
      ? buildGenericLeadNotificationData({...submission.captured,id:record.id})
      : {subject:`New Pegasus Website Submission: ${submission.captured.visitorType}`,text:`Visitor type: ${submission.captured.visitorType}\nContact: ${submission.captured.contactName} <${submission.captured.email}> ${submission.captured.phone??''}\nProperty: ${submission.captured.propertyAddress??'—'}, ${submission.captured.city??''} ${submission.captured.state??''}\nSituation: ${submission.captured.situation??'—'}\nGoal: ${submission.captured.goal??'—'}\nRouted: ${submission.captured.recommendedLane??'—'} (${submission.captured.assignedDepartment??'—'})\nNotes: ${submission.captured.notes??'—'}\n\nOpportunity ID: ${record.id}`};
    await tx.insert(notificationOutbox).values([
      {...refs,recordType:record.type,purpose:'staff',payload:{to:resolveStaffNotificationRecipient(),...staff}},
      {...refs,recordType:record.type,purpose:'receipt',payload:{to:submission.captured.email,subject:'Pegasus Dreamscapes received your submission',text:INQUIRY_CONFIRMATION_BODY}},
    ]);
    return {record,duplicate:false,row};
  });
}
