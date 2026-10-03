import { z } from 'zod';

export const US_STATE_CODES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','AS','GU','MP','PR','VI'] as const;
export const BUYER_ASSET_TYPES = ['single_family','duplex','triplex','fourplex','multifamily_5_plus','land','mixed_use','commercial','other'] as const;
export const BUYER_STRATEGIES = ['buy_and_hold','renovate_resell','brrrr','development','other','undecided'] as const;
export const BUYER_REHAB_EXCLUSIONS = ['turnkey','light_cosmetic','moderate_repairs','heavy_repairs','fire_water_damage','unfinished_project','ground_up'] as const;
export const BUYER_OCCUPANCY_EXCLUSIONS = ['owner_occupied','tenant_occupied','vacant','partially_occupied','unknown'] as const;
const text = (max:number) => z.string().trim().min(1).max(max);
const location = {country:z.literal('US'),stateCode:z.enum(US_STATE_CODES)};
const geography = z.discriminatedUnion('kind',[
 z.object({...location,kind:z.literal('state')}).strict(),
 z.object({...location,kind:z.literal('county'),name:text(100)}).strict(),
 z.object({...location,kind:z.literal('city'),name:text(100)}).strict(),
 z.object({...location,kind:z.literal('zip'),postalCode:z.string().trim().regex(/^\d{5}$/)}).strict(),
]);
const unique = <T extends z.ZodTypeAny>(schema:T,min:number,max:number) => z.array(schema).min(min).max(max).refine(a=>new Set(a.map(v=>typeof v==='string'?v:JSON.stringify(v).toLocaleLowerCase('en-US'))).size===a.length,'Remove duplicate selections');
const dollars=z.number().int().nonnegative().max(1_000_000_000_000).nullable();
export const buyerCriteriaV1Schema=z.object({
 version:z.literal(1),geography:unique(geography,1,20),assetTypes:unique(z.enum(BUYER_ASSET_TYPES),1,9),
 priceRange:z.object({currency:z.literal('USD'),min:dollars,max:dollars,basis:z.enum(['purchase_price','all_in','undecided'])}).strict().refine(p=>p.basis==='undecided'?p.min===null&&p.max===null:p.max!==null&&p.max>0&&(p.min===null||p.min<=p.max),'Specify a positive maximum and a valid range, or choose undecided'),
 strategies:unique(z.enum(BUYER_STRATEGIES),1,6).refine(a=>!a.includes('undecided')||a.length===1,'Undecided cannot be combined with a strategy'),
 rehabExclusions:unique(z.enum(BUYER_REHAB_EXCLUSIONS),0,7),occupancyExclusions:unique(z.enum(BUYER_OCCUPANCY_EXCLUSIONS),0,5),
 timing:z.object({purchaseHorizon:z.enum(['within_30_days','31_90_days','3_6_months','6_plus_months','exploring']),closingDays:z.number().int().min(1).max(365).nullable()}).strict(),
 purchaser:z.object({entityType:z.enum(['individual','entity','undecided']),entityName:text(255).nullable(),role:z.enum(['principal','entity_representative','broker_agent','other'])}).strict(),
 funding:z.object({selfReported:z.literal(true),status:z.enum(['cash','financing_preapproved','financing_needed','combination','undecided'])}).strict(),
}).strict();
export const buyerAlertConsentV1Schema=z.object({version:z.literal(1),emailOptIn:z.boolean(),copyVersion:z.literal('buyer-alerts-v1')}).strict();
export const buyerCriteriaLeadSubmissionV1Schema=z.object({
 leadType:z.literal('submit'),source:z.literal('form'),firstName:text(255),lastName:text(255).optional(),email:z.string().trim().email().max(255),phone:text(50).optional(),message:text(2000).optional(),referredBy:text(160).optional(),consentContact:z.boolean(),consentVersion:z.literal('pegasus-followup-contact-v1').optional(),hp_company:z.string().max(500).optional(),ts_elapsed_ms:z.number().finite().nonnegative().optional(),
 leadData:z.object({lane:z.literal('buyer'),role:z.literal('Buyer'),intent:z.literal('buyer'),contextKind:z.literal('context'),context:text(2500),consentContact:z.boolean(),buyerCriteria:buyerCriteriaV1Schema,buyerAlertConsent:buyerAlertConsentV1Schema,referredBy:text(160).optional(),message:text(2000).optional()}).strict(),
}).strict().refine(p=>p.consentContact===p.leadData.consentContact,'Contact consent must agree').refine(p=>!p.message||!p.leadData.message||p.message===p.leadData.message,'Message copies must agree').transform(p=>({...p,leadData:{...p.leadData,...(p.message?{message:p.message}:{})}}));
export type BuyerCriteriaV1=z.infer<typeof buyerCriteriaV1Schema>;
export type BuyerAlertConsentV1=z.infer<typeof buyerAlertConsentV1Schema>;
export type BuyerCriteriaLeadSubmissionV1=z.infer<typeof buyerCriteriaLeadSubmissionV1Schema>;
export type BuyerCriteriaDraft={firstName:string;lastName:string;email:string;phone:string;message:string;referredBy:string;consentContact:boolean;emailOptIn:boolean;criteria:Omit<BuyerCriteriaV1,'purchaser'> & {purchaser:Omit<BuyerCriteriaV1['purchaser'],'role'> & {role:BuyerCriteriaV1['purchaser']['role']|''}}};
export function createEmptyBuyerCriteriaDraft():BuyerCriteriaDraft{return {firstName:'',lastName:'',email:'',phone:'',message:'',referredBy:'',consentContact:false,emailOptIn:false,criteria:{version:1,geography:[],assetTypes:[],priceRange:{currency:'USD',min:null,max:null,basis:'undecided'},strategies:['undecided'],rehabExclusions:[],occupancyExclusions:[],timing:{purchaseHorizon:'exploring',closingDays:null},purchaser:{entityType:'undecided',entityName:null,role:''},funding:{selfReported:true,status:'undecided'}}};}
export function buyerGeographySummary(areas:BuyerCriteriaV1['geography']):string{return areas.map(a=>a.kind==='state'?a.stateCode:a.kind==='zip'?`${a.postalCode}, ${a.stateCode}`:`${a.name}, ${a.stateCode}`).join('; ');}
export function buildBuyerCriteriaLeadSubmission(draft:BuyerCriteriaDraft):BuyerCriteriaLeadSubmissionV1{
 const criteria=buyerCriteriaV1Schema.parse(draft.criteria);
 return buyerCriteriaLeadSubmissionV1Schema.parse({leadType:'submit',source:'form',firstName:draft.firstName,...(draft.lastName.trim()?{lastName:draft.lastName}:{}),email:draft.email,...(draft.phone.trim()?{phone:draft.phone}:{}),...(draft.referredBy.trim()?{referredBy:draft.referredBy}:{}),consentContact:draft.consentContact,consentVersion:'pegasus-followup-contact-v1',leadData:{lane:'buyer',role:'Buyer',intent:'buyer',contextKind:'context',context:buyerGeographySummary(criteria.geography),consentContact:draft.consentContact,buyerCriteria:criteria,buyerAlertConsent:{version:1,emailOptIn:draft.emailOptIn,copyVersion:'buyer-alerts-v1'},...(draft.referredBy.trim()?{referredBy:draft.referredBy}:{}),...(draft.message.trim()?{message:draft.message}:{})}});
}
