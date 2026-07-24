import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { authenticatedJsonRequest } from "@/lib/queryClient";

export function useAuthenticatedQuery<T>(queryKey: QueryKey) {
  const { session } = useSupabaseAuth();
  const authSubject = session?.user.id ?? "cookie-session";

  return useQuery<T>({
    // Private responses must never share a cache entry across authenticated
    // subjects, even when two people use the same browser in succession.
    queryKey: ["authenticated", authSubject, ...queryKey],
    queryFn: () =>
      authenticatedJsonRequest<T>(
        queryKey.join("/"),
        session?.access_token,
      ),
  });
}
