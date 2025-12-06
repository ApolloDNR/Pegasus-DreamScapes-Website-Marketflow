import { supabaseAdmin } from './lib/supabase';

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function transformKeys<T extends Record<string, any>>(
  obj: T,
  transformer: (key: string) => string
): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transformer));
  }
  if (typeof obj !== 'object') return obj;
  
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = transformer(key);
      result[newKey] = transformKeys(obj[key], transformer);
    }
  }
  return result;
}

export function toCamelCase<T>(obj: T): any {
  return transformKeys(obj as any, snakeToCamel);
}

export function toSnakeCase<T>(obj: T): any {
  return transformKeys(obj as any, camelToSnake);
}

export interface SupabaseUserProfile {
  id: string;
  user_id: string;
  primary_role: string;
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

export interface SupabaseWholesaleDeal {
  id: string;
  wholesaler_id: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: string;
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

export interface SupabaseCapitalProject {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  location?: string;
  property_type?: string;
  structure: 'EQUITY' | 'DEBT' | 'HYBRID';
  funding_goal: number;
  amount_raised: number;
  min_investment?: number;
  projected_return?: string;
  hold_period?: string;
  photos?: string[];
  status: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseJVRequest {
  id: string;
  deal_id: string;
  requester_id: string;
  wholesaler_id: string;
  strategy: string;
  funding_source?: string;
  proposed_fee?: number;
  message?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseCapitalCommitment {
  id: string;
  project_id: string;
  investor_id: string;
  amount: number;
  structure_preference?: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseListing {
  id: string;
  owner_id?: string;
  title: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: string;
  listing_type: 'retail' | 'investment' | 'wholesale';
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lot_size?: string;
  year_built?: number;
  description?: string;
  features?: string[];
  photos?: string[];
  status: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseBuyerOffer {
  id: string;
  listing_id: string;
  buyer_id: string;
  offer_amount: number;
  financing_type?: string;
  contingencies?: string[];
  message?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseSavedItem {
  id: string;
  user_id: string;
  item_type: 'wholesale_deal' | 'capital_project' | 'listing' | 'article';
  item_id: string;
  created_at: string;
}

export interface SupabaseNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export class SupabaseStorage {
  async getUserProfile(userId: string): Promise<SupabaseUserProfile | null> {
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

  async createUserProfile(userId: string, data: {
    primary_role: string;
    display_name: string;
    company_name?: string;
    location?: string;
    bio?: string;
    is_pegasus_badged?: boolean;
    pegasus_role_type?: string;
  }): Promise<SupabaseUserProfile | null> {
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: userId,
        ...data,
        is_pegasus_badged: data.is_pegasus_badged ?? data.primary_role.startsWith('pegasus_')
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    return profile;
  }

  async updateUserProfile(userId: string, data: Partial<SupabaseUserProfile>): Promise<SupabaseUserProfile | null> {
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .update(data)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    return profile;
  }

  async getPublicWholesaleDeals(): Promise<SupabaseWholesaleDeal[]> {
    const { data, error } = await supabaseAdmin
      .from('wholesale_deals')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching wholesale deals:', error);
      return [];
    }
    return data || [];
  }

  async getWholesaleDealsByUser(userId: string): Promise<SupabaseWholesaleDeal[]> {
    const { data, error } = await supabaseAdmin
      .from('wholesale_deals')
      .select('*')
      .eq('wholesaler_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user deals:', error);
      return [];
    }
    return data || [];
  }

  async getWholesaleDeal(id: string): Promise<SupabaseWholesaleDeal | null> {
    const { data, error } = await supabaseAdmin
      .from('wholesale_deals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching wholesale deal:', error);
      return null;
    }
    return data;
  }

  async createWholesaleDeal(deal: Omit<SupabaseWholesaleDeal, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseWholesaleDeal | null> {
    const { data, error } = await supabaseAdmin
      .from('wholesale_deals')
      .insert(deal)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating wholesale deal:', error);
      return null;
    }
    return data;
  }

  async updateWholesaleDeal(id: string, updates: Partial<SupabaseWholesaleDeal>): Promise<SupabaseWholesaleDeal | null> {
    const { data, error } = await supabaseAdmin
      .from('wholesale_deals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating wholesale deal:', error);
      return null;
    }
    return data;
  }

  async getPublicCapitalProjects(): Promise<SupabaseCapitalProject[]> {
    const { data, error } = await supabaseAdmin
      .from('capital_projects')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching capital projects:', error);
      return [];
    }
    return data || [];
  }

  async getCapitalProjectsByUser(userId: string): Promise<SupabaseCapitalProject[]> {
    const { data, error } = await supabaseAdmin
      .from('capital_projects')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user projects:', error);
      return [];
    }
    return data || [];
  }

  async getCapitalProject(id: string): Promise<SupabaseCapitalProject | null> {
    const { data, error } = await supabaseAdmin
      .from('capital_projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching capital project:', error);
      return null;
    }
    return data;
  }

  async createCapitalProject(project: Omit<SupabaseCapitalProject, 'id' | 'created_at' | 'updated_at' | 'amount_raised'>): Promise<SupabaseCapitalProject | null> {
    const { data, error } = await supabaseAdmin
      .from('capital_projects')
      .insert({ ...project, amount_raised: 0 })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating capital project:', error);
      return null;
    }
    return data;
  }

  async createJVRequest(request: Omit<SupabaseJVRequest, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseJVRequest | null> {
    const { data, error } = await supabaseAdmin
      .from('jv_requests')
      .insert(request)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating JV request:', error);
      return null;
    }
    return data;
  }

  async getJVRequestsByUser(userId: string): Promise<SupabaseJVRequest[]> {
    const { data, error } = await supabaseAdmin
      .from('jv_requests')
      .select('*')
      .or(`requester_id.eq.${userId},wholesaler_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching JV requests:', error);
      return [];
    }
    return data || [];
  }

  async updateJVRequestStatus(id: string, status: string): Promise<SupabaseJVRequest | null> {
    const { data, error } = await supabaseAdmin
      .from('jv_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating JV request:', error);
      return null;
    }
    return data;
  }

  async createCapitalCommitment(commitment: Omit<SupabaseCapitalCommitment, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseCapitalCommitment | null> {
    const { data, error } = await supabaseAdmin
      .from('capital_commitments')
      .insert(commitment)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating capital commitment:', error);
      return null;
    }
    return data;
  }

  async getCapitalCommitmentsByUser(userId: string): Promise<SupabaseCapitalCommitment[]> {
    const { data, error } = await supabaseAdmin
      .from('capital_commitments')
      .select('*')
      .eq('investor_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching commitments:', error);
      return [];
    }
    return data || [];
  }

  async getCapitalCommitmentsByProject(projectId: string): Promise<SupabaseCapitalCommitment[]> {
    const { data, error } = await supabaseAdmin
      .from('capital_commitments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching project commitments:', error);
      return [];
    }
    return data || [];
  }

  async getPublicListings(): Promise<SupabaseListing[]> {
    const { data, error } = await supabaseAdmin
      .from('listings')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
    return data || [];
  }

  async getListing(id: string): Promise<SupabaseListing | null> {
    const { data, error } = await supabaseAdmin
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching listing:', error);
      return null;
    }
    return data;
  }

  async createBuyerOffer(offer: Omit<SupabaseBuyerOffer, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseBuyerOffer | null> {
    const { data, error } = await supabaseAdmin
      .from('buyer_offers')
      .insert(offer)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating buyer offer:', error);
      return null;
    }
    return data;
  }

  async getBuyerOffersByUser(userId: string): Promise<SupabaseBuyerOffer[]> {
    const { data, error } = await supabaseAdmin
      .from('buyer_offers')
      .select('*')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching buyer offers:', error);
      return [];
    }
    return data || [];
  }

  async saveItem(userId: string, itemType: SupabaseSavedItem['item_type'], itemId: string): Promise<SupabaseSavedItem | null> {
    const { data, error } = await supabaseAdmin
      .from('saved_items')
      .upsert({
        user_id: userId,
        item_type: itemType,
        item_id: itemId
      }, {
        onConflict: 'user_id,item_type,item_id'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving item:', error);
      return null;
    }
    return data;
  }

  async unsaveItem(userId: string, itemType: SupabaseSavedItem['item_type'], itemId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('saved_items')
      .delete()
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId);
    
    if (error) {
      console.error('Error unsaving item:', error);
      return false;
    }
    return true;
  }

  async getSavedItems(userId: string, itemType?: SupabaseSavedItem['item_type']): Promise<SupabaseSavedItem[]> {
    let query = supabaseAdmin
      .from('saved_items')
      .select('*')
      .eq('user_id', userId);
    
    if (itemType) {
      query = query.eq('item_type', itemType);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching saved items:', error);
      return [];
    }
    return data || [];
  }

  async isItemSaved(userId: string, itemType: SupabaseSavedItem['item_type'], itemId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('saved_items')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .single();
    
    if (error) {
      return false;
    }
    return !!data;
  }

  async createNotification(notification: Omit<SupabaseNotification, 'id' | 'created_at' | 'is_read'>): Promise<SupabaseNotification | null> {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({ ...notification, is_read: false })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }
    return data;
  }

  async getNotifications(userId: string, unreadOnly = false): Promise<SupabaseNotification[]> {
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId);
    
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data || [];
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (error) {
      console.error('Error marking notification read:', error);
      return false;
    }
    return true;
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) {
      console.error('Error marking all notifications read:', error);
      return false;
    }
    return true;
  }
}

export const supabaseStorage = new SupabaseStorage();
