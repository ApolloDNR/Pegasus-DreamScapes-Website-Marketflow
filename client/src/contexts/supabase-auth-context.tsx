import { Fragment, createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  ensureAuthenticatedUserProfile,
  getSupabase,
  type UserRole,
  type UserProfile,
} from '@/lib/supabase';
import {
  authenticatedRequest,
  clearSessionQueries,
  transitionSessionPrincipal,
} from '@/lib/queryClient';
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

// Admin email allowlist for site editing
const ADMIN_EMAILS = [
  "apollosynd@gmail.com",
  "admin@pegasusdreamscapes.com",
];

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

export function AuthSessionBoundary({
  epoch,
  children,
}: {
  epoch: number;
  children: React.ReactNode;
}) {
  return <Fragment key={epoch}>{children}</Fragment>;
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Store backend's authoritative isAdmin flag separately
  const [backendIsAdmin, setBackendIsAdmin] = useState(false);
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
  const [sessionEpoch, setSessionEpoch] = useState(0);
  const authUserIdRef = useRef<string | null>(null);
  const guestModeRef = useRef(isGuestMode);
  const guestRoleRef = useRef(guestRole);
  const cachePrincipalRef = useRef(
    isGuestMode
      ? `guest:${guestRole ?? "unknown"}:anonymous`
      : "anonymous",
  );

  const transitionUserCache = useCallback((nextUserId: string | null) => {
    const nextUserPrincipal = nextUserId
      ? `user:${nextUserId}`
      : "anonymous";
    const nextPrincipal = guestModeRef.current
      ? `guest:${guestRoleRef.current ?? "unknown"}:${nextUserPrincipal}`
      : nextUserPrincipal;
    const didChange = cachePrincipalRef.current !== nextPrincipal;
    authUserIdRef.current = nextUserId;
    cachePrincipalRef.current = transitionSessionPrincipal(
      cachePrincipalRef.current,
      nextPrincipal,
    );
    if (didChange) {
      // QueryClient.clear() removes cached Query objects, but mounted observers
      // retain their current result. Remount consumers before the new identity
      // is committed so stale private data cannot remain visible.
      setSessionEpoch((epoch) => epoch + 1);
    }
    return didChange;
  }, []);

  const forceSessionReset = useCallback((nextPrincipal: string) => {
    clearSessionQueries();
    cachePrincipalRef.current = nextPrincipal;
    setSessionEpoch((epoch) => epoch + 1);
  }, []);

  const fetchProfile = useCallback(async (
    userId: string,
    accessToken?: string,
  ) => {
    try {
      const token = accessToken?.trim();
      const response = await authenticatedRequest(
        `/api/supabase/profile/${userId}`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        },
      );
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
              const primaryRole = replitUser.isAdmin ? 'admin' : (replitUser.roles?.[0] || replitUser.role || 'investor');
              const isPegasus = primaryRole.startsWith('pegasus_') || replitUser.isAdmin;
              profileData = {
                id: replitUser.id,
                user_id: replitUser.id,
                primary_role: primaryRole as UserRole,
                display_name: `${replitUser.firstName || ''} ${replitUser.lastName || ''}`.trim() || replitUser.email?.split('@')[0] || 'User',
                avatar_url: replitUser.profileImageUrl || undefined,
                is_pegasus_badged: isPegasus || replitUser.isStaff || replitUser.isAdmin,
                pegasus_role_type: isPegasus ? primaryRole : undefined,
                created_at: replitUser.createdAt || new Date().toISOString(),
                updated_at: replitUser.updatedAt || new Date().toISOString()
              };
            }
            
            // Also create a synthetic user object with email for admin detection
            if (mounted) {
              transitionUserCache(replitUser.id);
              const syntheticUser = {
                id: replitUser.id,
                email: replitUser.email,
                app_metadata: {},
                user_metadata: {},
                aud: 'authenticated',
                created_at: replitUser.createdAt || new Date().toISOString()
              } as User;
              setUser(syntheticUser);
              setProfile(profileData);
              // Use backend's authoritative isAdmin flag
              setBackendIsAdmin(Boolean(replitUser.isAdmin));
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
            transitionUserCache(currentSession.user.id);
            const profileData = await ensureAuthenticatedUserProfile(
              currentSession,
              fetchProfile,
            );
            
            if (profileData) {
              setSession(currentSession);
              setUser(currentSession.user);
              setProfile(profileData);
            } else {
              await supabase.auth.signOut();
              transitionUserCache(null);
              setSession(null);
              setUser(null);
              setProfile(null);
            }
          } else {
            transitionUserCache(null);
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
                const identityChanged =
                  authUserIdRef.current !== newSession.user.id;
                if (identityChanged) {
                  setSession(null);
                  setUser(null);
                  setProfile(null);
                  setBackendIsAdmin(false);
                }
                transitionUserCache(newSession.user.id);
                const profileData = await ensureAuthenticatedUserProfile(
                  newSession,
                  fetchProfile,
                );
                if (profileData) {
                  if (identityChanged) {
                    // The neutral remount above prevents stale display while
                    // provisioning. Clear once more immediately before the new
                    // identity mounts so any uncancellable legacy request that
                    // settled in the interim cannot seed the next session.
                    forceSessionReset(cachePrincipalRef.current);
                  }
                  setSession(newSession);
                  setUser(newSession.user);
                  setProfile(profileData);
                  // Strategy Lab — claim anonymous snapshots (Task #84)
                  try {
                    const sid = window.localStorage.getItem("pegasus.lab.sessionId");
                    if (sid && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
                      await fetch("/api/property-analyses/claim", {
                        method: "POST",
                        credentials: "include",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${newSession.access_token}`,
                        },
                        body: JSON.stringify({ sessionId: sid }),
                      }).catch(() => undefined);
                    }
                  } catch {
                    // localStorage / fetch unavailable — non-fatal.
                  }
                } else {
                  transitionUserCache(null);
                  setSession(null);
                  setUser(null);
                  setProfile(null);
                }
              } else {
                transitionUserCache(null);
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
        // Auth init can fail benignly in environments without Supabase configured.
        // Surface it at info level so it doesn't pollute Best-Practices audits.
        console.info('[auth] Initialization completed without Supabase session.', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [fetchProfile, forceSessionReset, transitionUserCache]);

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
            declared_role_interest: role,
            account_scope: "general_preview",
            display_name: displayName
          }
        }
      });

      if (error) {
        return { error };
      }

      if (data.session) {
        try {
          await ensureAuthenticatedUserProfile(data.session, fetchProfile);
        } catch (provisioningError) {
          console.error('Error provisioning user profile', provisioningError);
        }
      }

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ENOTFOUND')) {
        return { 
          error: new Error('Unable to connect to authentication service. Please try again later or use guest mode to explore the platform.') 
        };
      }
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
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ENOTFOUND')) {
        return { 
          error: new Error('Unable to connect to authentication service. Please try again later or use guest mode to explore the platform.') 
        };
      }
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    // Clear before waiting on the identity provider so a slow or failed
    // sign-out cannot leave any legacy untagged private response readable.
    authUserIdRef.current = null;
    const signedOutPrincipal = guestModeRef.current
      ? `guest:${guestRoleRef.current ?? "unknown"}:anonymous`
      : "anonymous";
    forceSessionReset(signedOutPrincipal);
    setUser(null);
    setSession(null);
    setProfile(null);
    setBackendIsAdmin(false);
    try {
      const supabase = await getSupabase();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      // Catch any request that completed while provider sign-out was pending.
      forceSessionReset(signedOutPrincipal);
      setUser(null);
      setSession(null);
      setProfile(null);
      setBackendIsAdmin(false);
    }
  };

  const currentRole = profile?.primary_role ?? null;
  const effectiveRole = isGuestMode ? guestRole : currentRole;
  
  // Check admin status - use backend's authoritative flag as primary source
  const isAdminUser = useMemo(() => {
    // Backend's isAdmin flag is the source of truth (set from OIDC/Replit Auth)
    if (backendIsAdmin) {
      return true;
    }
    // Fallback checks for Supabase Auth users
    const userEmail = user?.email?.toLowerCase();
    if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
      return true;
    }
    if (effectiveRole && isAdminRole(effectiveRole)) {
      return true;
    }
    return false;
  }, [backendIsAdmin, user?.email, effectiveRole]);
  
  const hasPermission = useCallback((permission: MarketplacePermission): boolean => {
    if (!effectiveRole) return false;
    return hasMarketplacePermission(effectiveRole as MarketplaceRole, permission);
  }, [effectiveRole]);

  const enterGuestMode = useCallback((role: UserRole) => {
    guestModeRef.current = true;
    guestRoleRef.current = role;
    transitionUserCache(authUserIdRef.current);
    setIsGuestMode(true);
    setGuestRole(role);
    try {
      localStorage.setItem('guestMode', 'true');
      localStorage.setItem('guestRole', role);
    } catch {
      // localStorage not available
    }
  }, [transitionUserCache]);

  const exitGuestMode = useCallback(() => {
    guestModeRef.current = false;
    guestRoleRef.current = null;
    transitionUserCache(authUserIdRef.current);
    setIsGuestMode(false);
    setGuestRole(null);
    try {
      localStorage.removeItem('guestMode');
      localStorage.removeItem('guestRole');
    } catch {
      // localStorage not available
    }
  }, [transitionUserCache]);

  const value: SupabaseAuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!profile,
    isGuestMode,
    guestRole,
    userRole: effectiveRole,
    isAdmin: isAdminUser,
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
      <AuthSessionBoundary epoch={sessionEpoch}>
        {children}
      </AuthSessionBoundary>
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
  if (!role) return '/marketflow';
  
  switch (role) {
    case 'admin':
      return '/marketflow/admin';
    case 'pegasus_wholesaler':
    case 'wholesaler':
      return '/marketflow/wholesaler';
    case 'pegasus_dreamscaper':
    case 'dreamscaper':
      return '/marketflow/dreamscaper';
    case 'investor':
      return '/marketflow/investor';
    case 'buyer_retail':
    case 'buyer_investment':
      return '/marketflow/buyer';
    default:
      return '/marketflow';
  }
}

export function canAccessRoute(userRole: UserRole | null, path: string, isGuestMode: boolean = false): boolean {
  if (!userRole && !isGuestMode) return false;
  
  if (userRole === 'admin') return true;
  
  if (path.startsWith('/marketflow/admin')) {
    return false;
  }
  
  const effectiveRole = userRole;
  
  if (path.startsWith('/marketflow/wholesaler')) {
    return effectiveRole === 'pegasus_wholesaler' || effectiveRole === 'wholesaler' || isGuestMode;
  }
  
  if (path.startsWith('/marketflow/dreamscaper')) {
    return effectiveRole === 'pegasus_dreamscaper' || effectiveRole === 'dreamscaper' || isGuestMode;
  }
  
  if (path.startsWith('/marketflow/investor')) {
    return effectiveRole === 'investor' || isGuestMode;
  }
  
  if (path.startsWith('/marketflow/buyer')) {
    return effectiveRole === 'buyer_retail' || effectiveRole === 'buyer_investment' || isGuestMode;
  }
  
  return true;
}
