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
  isGuestMode: boolean;
  guestRole: UserRole | null;
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
  enterGuestMode: (role: UserRole) => void;
  exitGuestMode: () => void;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(() => {
    try {
      return localStorage.getItem('guestMode') === 'true';
    } catch {
      return false;
    }
  });
  const [guestRole, setGuestRole] = useState<UserRole | null>(() => {
    try {
      return localStorage.getItem('guestRole') as UserRole | null;
    } catch {
      return null;
    }
  });

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
            let profileData = await fetchProfile(replitUser.id);
            
            // If profile fetch fails, construct from Replit Auth user data
            if (!profileData) {
              const primaryRole = replitUser.roles?.[0] || replitUser.role || 'investor';
              const isPegasus = primaryRole.startsWith('pegasus_');
              profileData = {
                id: replitUser.id,
                user_id: replitUser.id,
                primary_role: primaryRole as UserRole,
                display_name: `${replitUser.firstName || ''} ${replitUser.lastName || ''}`.trim() || replitUser.email?.split('@')[0] || 'User',
                avatar_url: replitUser.profileImageUrl || undefined,
                is_pegasus_badged: isPegasus || replitUser.isStaff || replitUser.role === 'admin',
                pegasus_role_type: isPegasus ? primaryRole : undefined,
                created_at: replitUser.createdAt || new Date().toISOString(),
                updated_at: replitUser.updatedAt || new Date().toISOString()
              };
            }
            
            if (mounted) {
              setProfile(profileData);
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
  const effectiveRole = isGuestMode ? guestRole : currentRole;
  
  const hasPermission = useCallback((permission: MarketplacePermission): boolean => {
    if (!effectiveRole) return false;
    return hasMarketplacePermission(effectiveRole as MarketplaceRole, permission);
  }, [effectiveRole]);

  const enterGuestMode = useCallback((role: UserRole) => {
    setIsGuestMode(true);
    setGuestRole(role);
    try {
      localStorage.setItem('guestMode', 'true');
      localStorage.setItem('guestRole', role);
    } catch {
      // localStorage not available
    }
  }, []);

  const exitGuestMode = useCallback(() => {
    setIsGuestMode(false);
    setGuestRole(null);
    try {
      localStorage.removeItem('guestMode');
      localStorage.removeItem('guestRole');
    } catch {
      // localStorage not available
    }
  }, []);

  const value: SupabaseAuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!profile,
    isGuestMode,
    guestRole,
    userRole: effectiveRole,
    isAdmin: effectiveRole ? isAdminRole(effectiveRole) : false,
    isWholesaler: effectiveRole ? isWholesalerRole(effectiveRole) : false,
    isDreamscaper: effectiveRole ? isDreamscaperRole(effectiveRole) : false,
    isInvestor: effectiveRole ? isInvestorRole(effectiveRole) : false,
    isBuyer: effectiveRole ? isBuyerRole(effectiveRole) : false,
    isPegasus: effectiveRole ? isPegasusRole(effectiveRole as MarketplaceRole) : false,
    hasPermission,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    enterGuestMode,
    exitGuestMode
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

export function canAccessRoute(userRole: UserRole | null, path: string, isGuestMode: boolean = false): boolean {
  if (!userRole && !isGuestMode) return false;
  
  if (userRole === 'admin') return true;
  
  if (path.startsWith('/marketplace/admin')) {
    return false;
  }
  
  const effectiveRole = userRole;
  
  if (path.startsWith('/marketplace/wholesaler')) {
    return effectiveRole === 'pegasus_wholesaler' || effectiveRole === 'wholesaler' || isGuestMode;
  }
  
  if (path.startsWith('/marketplace/dreamscaper')) {
    return effectiveRole === 'pegasus_dreamscaper' || effectiveRole === 'dreamscaper' || isGuestMode;
  }
  
  if (path.startsWith('/marketplace/investor')) {
    return effectiveRole === 'investor' || isGuestMode;
  }
  
  if (path.startsWith('/marketplace/buyer')) {
    return effectiveRole === 'buyer_retail' || effectiveRole === 'buyer_investment' || isGuestMode;
  }
  
  return true;
}
