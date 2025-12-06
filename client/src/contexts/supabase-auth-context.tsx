import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabase, type UserRole, type UserProfile } from '@/lib/supabase';

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as UserProfile;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const supabase = await getSupabase();
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            const profileData = await fetchProfile(currentSession.user.id);
            setProfile(profileData);
          }
          
          setIsLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (mounted) {
              setSession(newSession);
              setUser(newSession?.user ?? null);
              
              if (newSession?.user) {
                const profileData = await fetchProfile(newSession.user.id);
                setProfile(profileData);
              } else {
                setProfile(null);
              }
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [fetchProfile]);

  const signUp = async (
    email: string, 
    password: string, 
    role: UserRole,
    displayName: string
  ): Promise<{ error: Error | null }> => {
    try {
      const supabase = await getSupabase();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            primary_role: role,
            display_name: displayName
          }
        }
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            primary_role: role,
            display_name: displayName,
            is_pegasus_badged: role.startsWith('pegasus_')
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        const { error: reputationError } = await supabase
          .from('user_reputation')
          .insert({
            user_id: data.user.id,
            trust_score: 50,
            rating: 0,
            deals_closed_count: 0,
            on_time_closings_count: 0,
            cancellations_count: 0
          });

        if (reputationError) {
          console.error('Error creating reputation:', reputationError);
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      const supabase = await getSupabase();
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const value: SupabaseAuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    userRole: profile?.primary_role ?? null,
    signUp,
    signIn,
    signOut,
    refreshProfile
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}

export function getRoleDashboardPath(role: UserRole | null): string {
  if (!role) return '/marketplace';
  
  switch (role) {
    case 'admin':
      return '/marketplace/admin';
    case 'pegasus_wholesaler':
    case 'wholesaler':
      return '/marketplace/wholesaler';
    case 'pegasus_dreamscaper':
    case 'dreamscaper':
      return '/marketplace/dreamscaper';
    case 'investor':
      return '/marketplace/investor';
    case 'buyer_retail':
    case 'buyer_investment':
      return '/marketplace/buyer';
    default:
      return '/marketplace';
  }
}

export function canAccessRoute(userRole: UserRole | null, path: string): boolean {
  if (!userRole) return false;
  
  const adminOnlyPaths = ['/marketplace/admin'];
  const wholesalerPaths = ['/marketplace/wholesaler'];
  const dreamscaperPaths = ['/marketplace/dreamscaper'];
  const investorPaths = ['/marketplace/investor'];
  const buyerPaths = ['/marketplace/buyer'];
  
  if (userRole === 'admin') return true;
  
  if (adminOnlyPaths.some(p => path.startsWith(p))) {
    return userRole === 'admin';
  }
  
  if (wholesalerPaths.some(p => path.startsWith(p))) {
    return ['pegasus_wholesaler', 'wholesaler'].includes(userRole);
  }
  
  if (dreamscaperPaths.some(p => path.startsWith(p))) {
    return ['pegasus_dreamscaper', 'dreamscaper'].includes(userRole);
  }
  
  if (investorPaths.some(p => path.startsWith(p))) {
    return userRole === 'investor';
  }
  
  if (buyerPaths.some(p => path.startsWith(p))) {
    return ['buyer_retail', 'buyer_investment'].includes(userRole);
  }
  
  return true;
}
