import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import {
  AUTHENTICATED_QUERY_META,
  authenticatedJsonRequest,
} from "@/lib/queryClient";

interface AuthenticatedQueryOptions {
  enabled?: boolean;
}

export function useAuthenticatedQuery<T>(
  queryKey: QueryKey,
  options: AuthenticatedQueryOptions = {},
) {
  const { isGuestMode, session, user } = useSupabaseAuth();
  const authSubject = isGuestMode
    ? null
    : user?.id ?? session?.user.id ?? null;

  return useQuery<T>({
    // Private responses must never share a cache entry across authenticated
    // subjects, even when two people use the same browser in succession.
    // Keep the API root first so existing collection/detail invalidations
    // continue to cover the complete resource family.
    queryKey: [
      ...queryKey,
      { authenticatedSubject: authSubject ?? "none" },
    ],
    queryFn: () =>
      authenticatedJsonRequest<T>(
        queryKey.join("/"),
        session?.access_token,
      ),
    enabled: Boolean(authSubject) && (options.enabled ?? true),
    meta: AUTHENTICATED_QUERY_META,
  });
}
