import {describe,it,expect,vi} from 'vitest';
import {getWebsiteAuthUser} from '../auth-user';
describe('shared website identity projection',()=>{
 it('uses canonical account display and membership rather than email allowlist or editable metadata',async()=>{
  const db={execute:vi.fn().mockResolvedValue({rows:[{id:'account-id',authSubject:'11000000-0000-4000-8000-000000000001',email:'owner@example.test',displayName:'Canonical Owner',avatarUrl:null,role:'owner'}]})};
  const result=await getWebsiteAuthUser(db as any,'11000000-0000-4000-8000-000000000001','33000000-0000-4000-8000-000000000001');
  expect(result).toEqual(expect.objectContaining({id:'11000000-0000-4000-8000-000000000001',displayName:'Canonical Owner',isStaff:true,isAdmin:true,roles:['admin'],supabaseAuth:true}));
 });
 it('does not elevate a valid account without a staff membership',async()=>{
  const db={execute:vi.fn().mockResolvedValue({rows:[{authSubject:'11000000-0000-4000-8000-000000000001',email:'apollo@pegasusdreamscapes.com',displayName:'Visitor',role:null}]})};
  expect(await getWebsiteAuthUser(db as any,'11000000-0000-4000-8000-000000000001','33000000-0000-4000-8000-000000000001')).toEqual(expect.objectContaining({isStaff:false,isAdmin:false,roles:[]}));
 });
 it('fails closed when canonical identity has no eligible record',async()=>{const db={execute:vi.fn().mockResolvedValue({rows:[]})};expect(await getWebsiteAuthUser(db as any,'11000000-0000-4000-8000-000000000001','33000000-0000-4000-8000-000000000001')).toBeNull();});
});
