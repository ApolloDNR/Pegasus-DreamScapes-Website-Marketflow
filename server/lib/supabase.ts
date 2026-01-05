import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isSupabaseAdminConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

// Track connectivity state to avoid repeated DNS errors
let supabaseConnectivityChecked = false;
let supabaseIsReachable = false;
let lastConnectivityCheck = 0;
let connectivityCheckInProgress: Promise<boolean> | null = null;
const CONNECTIVITY_CHECK_INTERVAL = 60000; // Re-check every 60 seconds

if (!supabaseUrl) {
  console.warn('Server: SUPABASE_URL not found. Supabase features will fall back to PostgreSQL.');
}

if (!supabaseServiceRoleKey) {
  console.warn('Server: SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will fall back to PostgreSQL.');
}

const dummyClient = {
  auth: { getSession: async () => ({ error: new Error('Supabase not configured') }) },
  from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { code: 'NOT_CONFIGURED' } }) }) }),
    insert: async () => ({ error: { code: 'NOT_CONFIGURED' } }),
    update: async () => ({ data: null, error: { code: 'NOT_CONFIGURED' } }),
  }),
} as unknown as SupabaseClient;

export const supabase: SupabaseClient = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : dummyClient;

export const supabaseAdmin: SupabaseClient = isSupabaseAdminConfigured 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : dummyClient;

export async function isSupabaseReachable(): Promise<boolean> {
  const now = Date.now();
  
  // Return cached result if checked recently
  if (supabaseConnectivityChecked && (now - lastConnectivityCheck) < CONNECTIVITY_CHECK_INTERVAL) {
    return supabaseIsReachable;
  }
  
  if (!isSupabaseConfigured) {
    supabaseConnectivityChecked = true;
    supabaseIsReachable = false;
    return false;
  }
  
  // If a check is already in progress, wait for it
  if (connectivityCheckInProgress) {
    return connectivityCheckInProgress;
  }
  
  // Start the connectivity check
  const wasCheckedBefore = supabaseConnectivityChecked;
  
  connectivityCheckInProgress = (async () => {
    try {
      // Use a simple database query to check connectivity
      // This ensures we actually test the database connection, not just auth
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      supabaseConnectivityChecked = true;
      lastConnectivityCheck = Date.now();
      
      if (error) {
        const errorStr = JSON.stringify(error);
        if (errorStr.includes('ENOTFOUND') || errorStr.includes('getaddrinfo') || errorStr.includes('fetch failed')) {
          supabaseIsReachable = false;
          if (!wasCheckedBefore) {
            console.warn('Supabase unreachable - using PostgreSQL fallback');
          }
          return false;
        }
        // Other errors (like table not found) mean connection works
        supabaseIsReachable = true;
        return true;
      }
      
      supabaseIsReachable = true;
      return true;
    } catch (err: any) {
      supabaseConnectivityChecked = true;
      lastConnectivityCheck = Date.now();
      
      // Check for DNS-related errors
      const errStr = String(err?.message || err);
      if (err?.code === 'ENOTFOUND' || errStr.includes('ENOTFOUND') || 
          err?.code === 'ECONNREFUSED' || errStr.includes('getaddrinfo') || errStr.includes('fetch failed')) {
        supabaseIsReachable = false;
        if (!wasCheckedBefore) {
          console.warn('Supabase unreachable (DNS/connection error) - using PostgreSQL fallback');
        }
        return false;
      }
      
      if (!wasCheckedBefore) {
        console.error('Supabase connectivity check error:', err);
      }
      supabaseIsReachable = false;
      return false;
    } finally {
      connectivityCheckInProgress = null;
    }
  })();
  
  return connectivityCheckInProgress;
}

export async function testSupabaseConnection(): Promise<boolean> {
  const isReachable = await isSupabaseReachable();
  if (isReachable) {
    console.log('Supabase server connection successful');
  } else {
    console.log('Supabase connection unavailable - PostgreSQL fallback active');
  }
  return isReachable;
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
  // Check connectivity first to avoid DNS errors
  if (!await isSupabaseReachable()) {
    throw new Error('SUPABASE_UNREACHABLE');
  }
  
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
  if (!await isSupabaseReachable()) {
    throw new Error('SUPABASE_UNREACHABLE');
  }
  
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
  if (!await isSupabaseReachable()) {
    return null; // Return null to trigger PostgreSQL fallback
  }
  
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('external_user_id', externalUserId)
    .single();
  
  if (error && error.code !== 'PGRST116' && error.code !== 'NOT_CONFIGURED') {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

export async function getUserReputation(externalUserId: string) {
  if (!await isSupabaseReachable()) {
    return null;
  }
  
  const { data, error } = await supabaseAdmin
    .from('user_reputation')
    .select('*')
    .eq('external_user_id', externalUserId)
    .single();
  
  if (error && error.code !== 'PGRST116' && error.code !== 'NOT_CONFIGURED') {
    console.error('Error fetching user reputation:', error);
    return null;
  }
  
  return data;
}

export async function getUserBadges(externalUserId: string) {
  if (!await isSupabaseReachable()) {
    return [];
  }
  
  const { data, error } = await supabaseAdmin
    .from('user_badges')
    .select('*')
    .eq('external_user_id', externalUserId);
  
  if (error && error.code !== 'NOT_CONFIGURED') {
    console.error('Error fetching user badges:', error);
    return [];
  }
  
  return data || [];
}

export async function updateUserProfile(externalUserId: string, updates: Record<string, any>) {
  if (!await isSupabaseReachable()) {
    throw new Error('SUPABASE_UNREACHABLE');
  }
  
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
  if (!await isSupabaseReachable()) {
    throw new Error('SUPABASE_UNREACHABLE');
  }
  
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
  if (!await isSupabaseReachable()) {
    return [];
  }
  
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error && error.code !== 'NOT_CONFIGURED') {
    console.error('Error fetching all users:', error);
    return [];
  }
  
  return data || [];
}
