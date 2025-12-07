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

export async function createUserProfile(userId: string, data: {
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
      user_id: userId,
      ...data,
      is_pegasus_badged: data.is_pegasus_badged ?? data.primary_role.startsWith('pegasus_')
    });
  
  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function createUserReputation(userId: string) {
  const { error } = await supabaseAdmin
    .from('user_reputation')
    .insert({
      user_id: userId,
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

export async function getUserProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

export async function getUserReputation(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_reputation')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user reputation:', error);
    return null;
  }
  
  return data;
}

export async function getUserBadges(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_badges')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
  
  return data || [];
}

export async function updateUserProfile(userId: string, updates: Record<string, any>) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  
  return data;
}

export async function addUserBadge(userId: string, badge: {
  badge_type: string;
  label: string;
  description?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('user_badges')
    .insert({
      user_id: userId,
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
