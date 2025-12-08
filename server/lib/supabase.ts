import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  console.warn('Server: SUPABASE_URL not found. Supabase features will not work.');
}

if (!supabaseServiceRoleKey) {
  console.warn('Server: SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will not work.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase server connection test failed:', error.message);
      return false;
    }
    console.log('Supabase server connection successful');
    return true;
  } catch (err) {
    console.error('Supabase server connection test error:', err);
    return false;
  }
}

export async function createUserProfile(externalUserId: string, data: {
  primary_role: string;
  display_name: string;
  company_name?: string;
  location?: string;
  bio?: string;
  is_pegasus_badged?: boolean;
  pegasus_role_type?: string;
}) {
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      external_user_id: externalUserId,
      ...data,
      is_pegasus_badged: data.is_pegasus_badged ?? data.primary_role.startsWith('pegasus_')
    });
  
  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function createUserReputation(externalUserId: string) {
  const { error } = await supabaseAdmin
    .from('user_reputation')
    .insert({
      external_user_id: externalUserId,
      trust_score: 50,
      rating: 0,
      deals_closed_count: 0,
      on_time_closings_count: 0,
      cancellations_count: 0
    });
  
  if (error) {
    console.error('Error creating user reputation:', error);
    throw error;
  }
}

export async function getUserProfile(externalUserId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('external_user_id', externalUserId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

export async function getUserReputation(externalUserId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_reputation')
    .select('*')
    .eq('external_user_id', externalUserId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user reputation:', error);
    return null;
  }
  
  return data;
}

export async function getUserBadges(externalUserId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_badges')
    .select('*')
    .eq('external_user_id', externalUserId);
  
  if (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
  
  return data || [];
}

export async function updateUserProfile(externalUserId: string, updates: Record<string, any>) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('external_user_id', externalUserId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  
  return data;
}

export async function addUserBadge(externalUserId: string, badge: {
  badge_type: string;
  label: string;
  description?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('user_badges')
    .insert({
      external_user_id: externalUserId,
      ...badge
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding user badge:', error);
    throw error;
  }
  
  return data;
}

export async function ensureUserProfileExists(externalUserId: string, userData: {
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}) {
  const existingProfile = await getUserProfile(externalUserId);
  
  if (existingProfile) {
    return existingProfile;
  }
  
  const displayName = userData.firstName && userData.lastName 
    ? `${userData.firstName} ${userData.lastName}`.trim()
    : userData.email?.split('@')[0] || 'User';
  
  try {
    await createUserProfile(externalUserId, {
      primary_role: 'investor',
      display_name: displayName,
    });
    
    await createUserReputation(externalUserId);
    
    console.log(`Created Supabase profile for Replit user: ${externalUserId}`);
    
    return await getUserProfile(externalUserId);
  } catch (error) {
    console.error('Error ensuring user profile exists:', error);
    return null;
  }
}

export async function getAllUsers() {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
  
  return data || [];
}
