import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Server: Supabase credentials not found. Some features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
