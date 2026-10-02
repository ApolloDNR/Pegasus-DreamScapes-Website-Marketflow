import { Fragment, createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  getSupabase,
  type UserRole,
  type UserProfile,
} from '@/lib/supabase';
import {
  clearSessionQueries,
  transitionSessionPrincipal,
} from '@/lib/queryClient';
import { getWebsiteAuthProfile } from '@/lib/website-auth';
import { 
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
  const desiredSessionRef = useRef<Session | null>(null);
  const hydrationEpochRef = useRef(0);
  const signingOutRef = useRef(false);
  const refreshSessionRef = useRef<() => Promise<void>>(async () => {});
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

  const refreshProfile = useCallback(() => refreshSessionRef.current(), []);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const clearIdentity = () => {
      setSession(null);
      setUser(null);
      setProfile(null);
      setBackendIsAdmin(false);
    };

    const hydrate = async (nextSession: Session | null, event?: string) => {
      if (signingOutRef.current && nextSession) return;
      const epoch = ++hydrationEpochRef.current;
      desiredSessionRef.current = nextSession;
      const nextSubject = nextSession?.user.id ?? null;
      const identityChanged = authUserIdRef.current !== nextSubject;
      if (identityChanged) {
        clearIdentity();
        setIsLoading(true);
      }
      transitionUserCache(nextSubject);
      if (!nextSession) {
        clearIdentity();
        setIsLoading(false);
        return;
      }

      try {
        const account = await getWebsiteAuthProfile(nextSession);
        if (!mounted || epoch !== hydrationEpochRef.current) return;
        if (!account) {
          transitionUserCache(null);
          clearIdentity();
          return;
        }
        if (identityChanged) {
          // Discard legacy requests that settled during identity hydration
          // before allowing the newly verified subject's consumers to mount.
          forceSessionReset(cachePrincipalRef.current);
        }
        setSession(nextSession);
        setUser(nextSession.user);
        setProfile(account.profile);
        setBackendIsAdmin(account.isAdmin);

        // Claim only an existing anonymous Lab snapshot after verified sign-in.
        try {
          const sid = window.localStorage.getItem('pegasus.lab.sessionId');
          if (sid && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            void fetch('/api/property-analyses/claim', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${nextSession.access_token}`,
              },
              body: JSON.stringify({ sessionId: sid }),
            }).catch(() => undefined);
          }
        } catch {
          // A blocked browser store must not undo verified authentication.
        }
      } catch {
        if (!mounted || epoch !== hydrationEpochRef.current) return;
        // An unavailable account service is not a revoked Supabase session.
        // Preserve previously verified same-subject state, but never create
        // a profile or privileges from the token's editable metadata.
        setSession((previous) => previous?.user.id === nextSubject ? nextSession : previous);
      } finally {
        if (mounted && epoch === hydrationEpochRef.current) setIsLoading(false);
      }
    };
    refreshSessionRef.current = () => hydrate(desiredSessionRef.current);

    const initAuth = async () => {
      try {
        const supabase = await getSupabase();
        if (!mounted) return;
        const initialEpoch = hydrationEpochRef.current;
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
          // Do not await Supabase API calls inside its auth-state callback.
          if (mounted) void hydrate(nextSession, event);
        });
        unsubscribe = () => subscription.unsubscribe();
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        // An auth event received while loading the initial snapshot wins.
        if (mounted && hydrationEpochRef.current === initialEpoch) await hydrate(currentSession);
      } catch {
        if (mounted) setIsLoading(false);
      }
    };
    void initAuth();

    return () => {
      mounted = false;
      hydrationEpochRef.current += 1;
      refreshSessionRef.current = async () => {};
      unsubscribe?.();
    };
  }, [forceSessionReset, transitionUserCache]);

  const signUp = async (
    email: string, 
    password: string, 
    role: UserRole,
    displayName: string
  ): Promise<{ error: Error | null }> => {
    try {
      const supabase = await getSupabase();
      
      const { error } = await supabase.auth.signUp({
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
    signingOutRef.current = true;
    hydrationEpochRef.current += 1;
    desiredSessionRef.current = null;
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
    setIsLoading(false);
    try {
      const supabase = await getSupabase();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      // Catch any request that completed while provider sign-out was pending.
      hydrationEpochRef.current += 1;
      desiredSessionRef.current = null;
      authUserIdRef.current = null;
      signingOutRef.current = false;
      forceSessionReset(signedOutPrincipal);
      setUser(null);
      setSession(null);
      setProfile(null);
      setBackendIsAdmin(false);
      setIsLoading(false);
    }
  };

  const currentRole = profile?.primary_role ?? null;
  const effectiveRole = isGuestMode ? guestRole : currentRole;
  
  // Canonical membership is the sole source of staff authority.
  const isAdminUser = !isGuestMode && backendIsAdmin;

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
