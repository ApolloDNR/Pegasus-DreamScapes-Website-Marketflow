import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let initializationPromise: Promise<SupabaseClient> | null = null;

export type UserRole = 
  | 'admin'
  | 'pegasus_wholesaler'
  | 'wholesaler'
  | 'pegasus_dreamscaper'
  | 'dreamscaper'
  | 'investor'
  | 'buyer_retail'
  | 'buyer_investment';

export interface UserProfile {
  id: string;
  user_id: string;
  primary_role: UserRole;
  display_name: string;
  company_name?: string;
  location?: string;
  avatar_url?: string;
  bio?: string;
  is_pegasus_badged: boolean;
  pegasus_role_type?: string;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: string;
  label: string;
  description?: string;
  created_at: string;
}

export interface UserReputation {
  id: string;
  user_id: string;
  trust_score: number;
  rating: number;
  deals_closed_count: number;
  on_time_closings_count: number;
  cancellations_count: number;
  last_updated_at: string;
}

export interface SellerLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  property_type: string;
  reason: string;
  best_time?: string;
  notes?: string;
  source: string;
  status: string;
  created_at: string;
}

export interface WholesaleDeal {
  id: string;
  wholesaler_id: string;
  address: string;
  arv: number;
  asking_price: number;
  repair_estimate: number;
  assignment_fee: number;
  photos?: string[];
  occupancy?: string;
  close_timeline?: string;
  notes?: string;
  status: string;
  is_public: boolean;
  raising_capital: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedItem {
  id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  created_at: string;
}

async function initializeSupabase(): Promise<SupabaseClient> {
  try {
    const response = await fetch('/api/config/supabase');
    if (!response.ok) {
      throw new Error('Failed to fetch Supabase config');
    }
    const config = await response.json();
    
    if (!config.url || !config.anonKey) {
      console.warn('Supabase configuration not available');
      return createClient('', '');
    }
    
    return createClient(config.url, config.anonKey);
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return createClient('', '');
  }
}

export async function getSupabase(): Promise<SupabaseClient> {
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  if (!initializationPromise) {
    initializationPromise = initializeSupabase().then(client => {
      supabaseInstance = client;
      return client;
    });
  }
  
  return initializationPromise;
}

export function getSupabaseSync(): SupabaseClient | null {
  return supabaseInstance;
}

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase connection test error:', err);
    return false;
  }
}

export { supabaseInstance as supabase };
