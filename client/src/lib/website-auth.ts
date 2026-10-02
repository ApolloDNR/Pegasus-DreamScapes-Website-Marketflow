import type { Session } from '@supabase/supabase-js';
import type { UserProfile, UserRole } from './supabase';

const PROFILE_ROLES = new Set<string>([
  'admin', 'pegasus_wholesaler', 'wholesaler', 'pegasus_dreamscaper',
  'dreamscaper', 'investor', 'buyer_retail', 'buyer_investment',
]);

/** Read the server's canonical accounts/memberships projection; never provision. */
export async function getWebsiteAuthProfile(session: Session): Promise<{
  profile: UserProfile;
  isAdmin: boolean;
} | null> {
  const token = session.access_token.trim();
  if (!token) return null;
  const response = await fetch('/api/auth/user', {
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error('Account information is temporarily unavailable');

  const account = await response.json();
  // A stale or mismatched response must never hydrate another browser subject.
  if (account?.id !== session.user.id) return null;
  if (typeof account.displayName !== 'string' || typeof account.isAdmin !== 'boolean' || !Array.isArray(account.roles)) {
    throw new Error('Account information is invalid');
  }
  const primaryRole = account.isAdmin ? 'admin' : account.primaryRole;
  return {
    isAdmin: account.isAdmin,
    profile: {
      id: account.id,
      user_id: account.id,
      primary_role: PROFILE_ROLES.has(primaryRole) ? primaryRole as UserRole : null,
      display_name: account.displayName,
      avatar_url: typeof account.profileImageUrl === 'string' ? account.profileImageUrl : undefined,
      is_pegasus_badged: account.isPegasusBadged === true,
      created_at: session.user.created_at,
      updated_at: '',
    },
  };
}
