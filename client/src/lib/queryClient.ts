import { QueryClient, QueryFunction, InvalidateQueryFilters } from "@tanstack/react-query";

export class ApiError extends Error {
  status: number;
  statusText: string;
  
  constructor(status: number, message: string, statusText: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
  }
  
  get isUnauthorized() {
    return this.status === 401;
  }
  
  get isForbidden() {
    return this.status === 403;
  }
  
  get isNotFound() {
    return this.status === 404;
  }
  
  get isServerError() {
    return this.status >= 500;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new ApiError(res.status, `${res.status}: ${text}`, res.statusText);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && (error.isUnauthorized || error.isForbidden || error.isNotFound)) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: false,
    },
  },
});

export const QUERY_KEYS = {
  wholesaleDeals: ['/api/supabase/wholesale-deals'] as const,
  capitalProjects: ['/api/supabase/capital-projects'] as const,
  savedItems: ['/api/supabase/marketplace/saved-items'] as const,
  notifications: ['/api/supabase/notifications'] as const,
  messages: ['/api/supabase/messages'] as const,
  community: ['/api/supabase/community'] as const,
  userStats: (role: string) => ['/api/supabase/marketplace', role, 'stats'] as const,
  dealDetail: (id: string) => ['/api/supabase/wholesale-deals', id] as const,
  projectDetail: (id: string) => ['/api/supabase/capital-projects', id] as const,
};

export function invalidateMarketplaceData() {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wholesaleDeals }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.capitalProjects }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.savedItems }),
  ]);
}

export function invalidateDealData(dealId?: string) {
  const promises = [
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wholesaleDeals }),
  ];
  if (dealId) {
    promises.push(queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dealDetail(dealId) }));
  }
  return Promise.all(promises);
}

export function invalidateProjectData(projectId?: string) {
  const promises = [
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.capitalProjects }),
  ];
  if (projectId) {
    promises.push(queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projectDetail(projectId) }));
  }
  return Promise.all(promises);
}

export function invalidateSocialData() {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.community }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications }),
  ]);
}

export function invalidateUserStats(role: string) {
  return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats(role) });
}
