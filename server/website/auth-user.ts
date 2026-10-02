import { sql } from 'drizzle-orm';
import type {Express} from 'express';
import type {WebsiteDb} from './db';
import {getVerifiedWebsiteAuthSubject} from './identity';
import {getWebsiteOrgId} from './intake-policy';

type AccountProjection={authSubject:string;email:string;displayName:string|null;avatarUrl:string|null;role:string|null};
export async function getWebsiteAuthUser(db:WebsiteDb,subject:string,org:string){
 const result=await db.execute<AccountProjection>(sql`
  select a.auth_user_id as "authSubject",a.email,a.display_name as "displayName",a.avatar_url as "avatarUrl",m.role
  from public.accounts a left join public.memberships m on m.account_id=a.id and m.org_id=${org}::uuid and m.status='active'
  where a.auth_user_id=${subject}::uuid and a.suspended_at is null and a.deleted_at is null
  limit 2
 `);
 if(result.rows.length!==1)return null;
 const account=result.rows[0]; const staff=account.role==='owner'||account.role==='admin';
 const name=account.displayName??'';const roles=staff?['admin']:account.role?[account.role]:[];
 return {id:account.authSubject,email:account.email,firstName:name.split(' ')[0]??'',lastName:name.split(' ').slice(1).join(' '),displayName:name,profileImageUrl:account.avatarUrl??null,primaryRole:roles[0]??null,roles,isStaff:staff,isAdmin:staff,isPegasusBadged:false,isInvestor:account.role==='investor',isWholesaler:false,isBuyer:false,isDreamscaper:false,supabaseAuth:true};
}
export function registerWebsiteAuthUserRoute(app:Express,db:WebsiteDb){
 app.get('/api/auth/user',async(req,res)=>{
  const subject=getVerifiedWebsiteAuthSubject(req);if(!subject){res.status(401).json({message:'Unauthorized'});return;}
  res.setHeader('Cache-Control','no-store');
  try{const account=await getWebsiteAuthUser(db,subject,getWebsiteOrgId());if(!account){res.status(403).json({message:'Account access is unavailable.'});return;}res.json(account);}
  catch{res.status(503).json({message:'Account information is temporarily unavailable.'});}
 });
}
