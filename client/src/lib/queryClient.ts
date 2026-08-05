import { QueryClient, QueryFunction, InvalidateQueryFilters } from "@tanstack/react-query";
import { getSupabaseSync } from "@/lib/supabase";

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

async function getCurrentSupabaseAccessToken(): Promise<string | null> {
  const supabase = getSupabaseSync();
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return null;
    }

    return data.session?.access_token?.trim() || null;
  } catch {
    return null;
  }
}

function isSameOriginRequest(input: RequestInfo | URL): boolean {
  const requestUrl =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  if (typeof window === "undefined") {
    return !requestUrl.startsWith("//") && !/^[a-z][a-z\d+.-]*:/i.test(requestUrl);
  }

  try {
    return new URL(requestUrl, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

function hasAuthorizationHeader(headers?: HeadersInit): boolean {
  return headers ? new Headers(headers).has("Authorization") : false;
}

function addAuthorizationHeader(headers: HeadersInit | undefined, token: string): HeadersInit {
  const authorization = `Bearer ${token}`;

  if (headers instanceof Headers) {
    const nextHeaders = new Headers(headers);
    nextHeaders.set("Authorization", authorization);
    return nextHeaders;
  }

  if (Array.isArray(headers)) {
    return [...headers, ["Authorization", authorization]];
  }

  return {
    ...(headers ?? {}),
    Authorization: authorization,
  };
}

/**
 * Fetch a Pegasus API route with both supported authentication mechanisms:
 * the legacy session cookie and, when available, the current Supabase bearer
 * token. Bearer credentials are only attached to same-origin requests so this
 * helper is safe to use near presigned-upload flows without leaking the user's
 * site token to object storage.
 */
export async function authenticatedRequest(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const isSameOrigin = isSameOriginRequest(input);
  const requestInit: RequestInit = isSameOrigin
    ? { ...init, credentials: init.credentials ?? "include" }
    : { ...init };

  if (isSameOrigin) {
    const accessToken = await getCurrentSupabaseAccessToken();
    const inheritedHeaders =
      init.headers ??
      (typeof Request !== "undefined" && input instanceof Request
        ? input.headers
        : undefined);

    if (accessToken && !hasAuthorizationHeader(inheritedHeaders)) {
      requestInit.headers = addAuthorizationHeader(inheritedHeaders, accessToken);
    }
  }

  return fetch(input, requestInit);
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  extraHeaders: Record<string, string> = {},
): Promise<Response> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const res = await authenticatedRequest(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

export async function authenticatedJsonRequest<T>(
  url: string,
  accessToken?: string | null,
): Promise<T> {
  const token = accessToken?.trim();
  const res = await fetch(url, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  await throwIfResNotOk(res);
  return res.json() as Promise<T>;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await authenticatedRequest(queryKey.join("/") as string);

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
