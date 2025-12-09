import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabase, type UserRole, type UserProfile } from '@/lib/supabase';
import { 
  isAdminRole, 
  isWholesalerRole, 
  isDreamscaperRole, 
  isInvestorRole, 
  isBuyerRole,
  isPegasusRole,
  hasMarketplacePermission,
  type MarketplaceRole,
  type MarketplacePermission
} from '@shared/schema';

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  isWholesaler: boolean;
  isDreamscaper: boolean;
  isInvestor: boolean;
  isBuyer: boolean;
  isPegasus: boolean;
  hasPermission: (permission: MarketplacePermission) => boolean;
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
      const response = await fetch(`/api/supabase/profile/${userId}`);
      if (!response.ok) {
        return null;
      }
      return await response.json() as UserProfile;
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
        // First, check for Replit Auth user (primary auth method)
        const replitAuthResponse = await fetch('/api/auth/user');
        if (replitAuthResponse.ok) {
          const replitUser = await replitAuthResponse.json();
          if (replitUser?.id) {
            // Fetch profile using Replit Auth user ID (external_user_id)
            const profileData = await fetchProfile(replitUser.id);
            if (mounted) {
              if (profileData) {
                setProfile(profileData);
              }
              setIsLoading(false);
            }
            return;
          }
        }

        // Fallback to Supabase Auth if no Replit Auth session
        const supabase = await getSupabase();
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (currentSession?.user) {
            const profileData = await fetchProfile(currentSession.user.id);
            
            if (profileData) {
              setSession(currentSession);
              setUser(currentSession.user);
              setProfile(profileData);
            } else {
              console.log('No profile found for Supabase session, signing out stale session');
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setProfile(null);
            }
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
          
          setIsLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (mounted) {
              if (newSession?.user) {
                const profileData = await fetchProfile(newSession.user.id);
                if (profileData) {
                  setSession(newSession);
                  setUser(newSession.user);
                  setProfile(profileData);
                } else {
                  console.log('No profile found for new session, clearing auth state');
                  setSession(null);
                  setUser(null);
                  setProfile(null);
                }
              } else {
                setSession(null);
                setUser(null);
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
        const response = await fetch('/api/supabase/provision-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            role,
            displayName
          })
        });

        if (!response.ok) {
          console.error('Error provisioning user profile');
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

  const currentRole = profile?.primary_role ?? null;
  
  const hasPermission = useCallback((permission: MarketplacePermission): boolean => {
    if (!currentRole) return false;
    return hasMarketplacePermission(currentRole as MarketplaceRole, permission);
  }, [currentRole]);

  const value: SupabaseAuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!profile,
    userRole: currentRole,
    isAdmin: currentRole ? isAdminRole(currentRole) : false,
    isWholesaler: currentRole ? isWholesalerRole(currentRole) : false,
    isDreamscaper: currentRole ? isDreamscaperRole(currentRole) : false,
    isInvestor: currentRole ? isInvestorRole(currentRole) : false,
    isBuyer: currentRole ? isBuyerRole(currentRole) : false,
    isPegasus: currentRole ? isPegasusRole(currentRole as MarketplaceRole) : false,
    hasPermission,
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
  
  if (userRole === 'admin') return true;
  
  if (path.startsWith('/marketplace/admin')) {
    return false;
  }
  
  if (path.startsWith('/marketplace/wholesaler')) {
    return userRole === 'pegasus_wholesaler' || userRole === 'wholesaler';
  }
  
  if (path.startsWith('/marketplace/dreamscaper')) {
    return userRole === 'pegasus_dreamscaper' || userRole === 'dreamscaper';
  }
  
  if (path.startsWith('/marketplace/investor')) {
    return userRole === 'investor';
  }
  
  if (path.startsWith('/marketplace/buyer')) {
    return userRole === 'buyer_retail' || userRole === 'buyer_investment';
  }
  
  return true;
}
