import { useQuery, type UseQueryOptions, type QueryKey } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { getQueryFn } from "@/lib/queryClient";

type AuthQueryOptions<T> = Omit<UseQueryOptions<T, Error, T, QueryKey>, "queryFn" | "queryKey"> & {
  requireAuth?: boolean;
};

export function useAuthQuery<T>(
  queryKey: string[],
  options: AuthQueryOptions<T> = {}
) {
  const { isAuthenticated, isLoading: authLoading } = useSupabaseAuth();
  const { requireAuth = true, enabled = true, ...restOptions } = options;

  const shouldBeEnabled = requireAuth 
    ? enabled && isAuthenticated && !authLoading
    : enabled && !authLoading;

  return useQuery<T, Error>({
    queryKey,
    queryFn: getQueryFn<T>({ on401: requireAuth ? "throw" : "returnNull" }),
    enabled: shouldBeEnabled,
    ...restOptions,
  });
}

export function usePublicQuery<T>(
  queryKey: string[],
  options: Omit<UseQueryOptions<T, Error>, "queryFn" | "queryKey"> = {}
) {
  return useQuery<T, Error>({
    queryKey,
    queryFn: getQueryFn<T>({ on401: "returnNull" }),
    ...options,
  });
}
