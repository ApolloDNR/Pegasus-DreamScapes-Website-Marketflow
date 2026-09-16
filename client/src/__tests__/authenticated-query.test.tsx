import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";
import { AuthSessionBoundary } from "@/contexts/supabase-auth-context";
import {
  clearSessionQueries,
  evictAuthenticatedQueries,
  transitionSessionPrincipal,
} from "@/lib/queryClient";

const authState = vi.hoisted(() => ({
  accessToken: "signed-user-token" as string | null,
  isGuestMode: false,
  userId: "user-a" as string | null,
}));

vi.mock("@/contexts/supabase-auth-context", async () => {
  const actual = await vi.importActual<
    typeof import("@/contexts/supabase-auth-context")
  >("@/contexts/supabase-auth-context");
  return {
    ...actual,
    useSupabaseAuth: () => ({
      isGuestMode: authState.isGuestMode,
      user: authState.userId ? { id: authState.userId } : null,
      session: authState.accessToken && authState.userId
        ? {
            access_token: authState.accessToken,
            user: { id: authState.userId },
          }
        : null,
    }),
  };
});

function StatsProbe() {
  const { data } = useAuthenticatedQuery<{ active: number }>([
    "/api/supabase/marketplace",
    "wholesaler",
    "stats",
  ]);
  return <output>{data?.active ?? "loading"}</output>;
}

function RawPrivateProbe() {
  const { data } = useQuery<{ propertyAddress: string }>({
    queryKey: ["/api/listings", "72"],
    queryFn: () => new Promise<never>(() => undefined),
  });
  return <output>{data?.propertyAddress ?? "loading"}</output>;
}

function renderProbe(queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })) {
  const view = render(
    <QueryClientProvider client={queryClient}>
      <StatsProbe />
    </QueryClientProvider>,
  );
  return { ...view, queryClient };
}

describe("useAuthenticatedQuery", () => {
  beforeEach(() => {
    authState.accessToken = "signed-user-token";
    authState.isGuestMode = false;
    authState.userId = "user-a";
    vi.restoreAllMocks();
  });

  afterEach(() => cleanup());

  it("sends the current Supabase bearer token with dashboard stats requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ active: 7 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    renderProbe();

    expect(await screen.findByText("7")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/supabase/marketplace/wholesaler/stats",
      {
        credentials: "include",
        headers: { Authorization: "Bearer signed-user-token" },
      },
    );
  });

  it("preserves cookie-authenticated requests when no Supabase token exists", async () => {
    authState.accessToken = null;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ active: 3 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    renderProbe();
    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/supabase/marketplace/wholesaler/stats",
      {
        credentials: "include",
        headers: {},
      },
    );
  });

  it("does not reuse one authenticated subject's private cache for another", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ active: 7 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ active: 2 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 10 * 60 * 1_000,
        },
      },
    });

    const first = renderProbe(queryClient);
    expect(await screen.findByText("7")).toBeInTheDocument();
    first.unmount();

    authState.userId = "user-b";
    authState.accessToken = "second-user-token";
    renderProbe(queryClient);

    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/supabase/marketplace/wholesaler/stats",
      {
        credentials: "include",
        headers: { Authorization: "Bearer second-user-token" },
      },
    );
  });

  it("does not reuse one cookie-authenticated user's private cache for another", async () => {
    authState.accessToken = null;
    authState.userId = "cookie-user-a";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ active: 7 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ active: 2 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 10 * 60 * 1_000,
        },
      },
    });

    const first = renderProbe(queryClient);
    expect(await screen.findByText("7")).toBeInTheDocument();
    first.unmount();

    authState.userId = "cookie-user-b";
    renderProbe(queryClient);

    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps root invalidation compatible with subject-scoped entries", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ active: 7 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ active: 8 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    const { queryClient } = renderProbe();
    expect(await screen.findByText("7")).toBeInTheDocument();

    await queryClient.invalidateQueries({
      queryKey: ["/api/supabase/marketplace"],
    });

    expect(await screen.findByText("8")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not request or reveal private data without an authenticated subject", () => {
    authState.accessToken = null;
    authState.userId = null;
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
      },
    });
    queryClient.setQueryData(
      [
        "/api/supabase/marketplace",
        "wholesaler",
        "stats",
        { authenticatedSubject: "prior-user" },
      ],
      { active: 7 },
    );

    renderProbe(queryClient);

    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(screen.queryByText("7")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not expose an authenticated user's cache while guest mode is active", () => {
    authState.isGuestMode = true;
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
      },
    });
    queryClient.setQueryData(
      [
        "/api/supabase/marketplace",
        "wholesaler",
        "stats",
        { authenticatedSubject: "user-a" },
      ],
      { active: 7 },
    );

    renderProbe(queryClient);

    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(screen.queryByText("7")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("selectively evicts authenticated metadata when requested", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ active: 7 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const first = renderProbe();
    expect(await screen.findByText("7")).toBeInTheDocument();
    first.unmount();
    first.queryClient.setQueryData(["/api/site-content"], {
      headline: "Public cache",
    });

    evictAuthenticatedQueries(first.queryClient);

    expect(
      first.queryClient.getQueriesData({
        queryKey: ["/api/supabase/marketplace"],
      }),
    ).toEqual([]);
    expect(
      first.queryClient.getQueryData(["/api/site-content"]),
    ).toEqual({ headline: "Public cache" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("clears untagged private data when the authenticated principal changes", () => {
    const client = new QueryClient();
    client.setQueryData(["/api/listings", "72"], {
      propertyAddress: "Private cache",
    });
    client.setQueryData(["/api/site-content"], {
      headline: "Public cache accepted for refetch",
    });

    const nextPrincipal = transitionSessionPrincipal(
      "user:approved-a",
      "user:unapproved-b",
      client,
    );

    expect(nextPrincipal).toBe("user:unapproved-b");
    expect(client.getQueryCache().getAll()).toEqual([]);
  });

  it("preserves the cache for a same-subject token refresh", () => {
    const client = new QueryClient();
    client.setQueryData(["/api/listings", "72"], {
      propertyAddress: "Current viewer cache",
    });

    const nextPrincipal = transitionSessionPrincipal(
      "user:approved-a",
      "user:approved-a",
      client,
    );

    expect(nextPrincipal).toBe("user:approved-a");
    expect(client.getQueryData(["/api/listings", "72"])).toEqual({
      propertyAddress: "Current viewer cache",
    });
  });

  it("clears all cache state at explicit sign-out and guest boundaries", () => {
    const client = new QueryClient();
    client.setQueryData(["/api/wholesale-deals"], [{ id: 1 }]);
    clearSessionQueries(client);
    expect(client.getQueryCache().getAll()).toEqual([]);

    client.setQueryData(["/api/capital-projects"], [{ id: 2 }]);
    transitionSessionPrincipal(
      "user:approved-a",
      "guest:investor",
      client,
    );
    expect(client.getQueryCache().getAll()).toEqual([]);
  });

  it("remounts mounted raw observers so prior-user data disappears", () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
      },
    });
    client.setQueryData(["/api/listings", "72"], {
      propertyAddress: "Prior Viewer Private Cache",
    });
    let epoch = 0;
    const view = render(
      <QueryClientProvider client={client}>
        <AuthSessionBoundary epoch={epoch}>
          <RawPrivateProbe />
        </AuthSessionBoundary>
      </QueryClientProvider>,
    );
    expect(screen.getByText("Prior Viewer Private Cache")).toBeInTheDocument();

    transitionSessionPrincipal("user:a", "user:b", client);
    // Clearing storage alone is insufficient: the mounted observer still
    // holds its last result until the auth boundary remounts it.
    expect(screen.getByText("Prior Viewer Private Cache")).toBeInTheDocument();
    epoch += 1;
    view.rerender(
      <QueryClientProvider client={client}>
        <AuthSessionBoundary epoch={epoch}>
          <RawPrivateProbe />
        </AuthSessionBoundary>
      </QueryClientProvider>,
    );

    expect(screen.queryByText("Prior Viewer Private Cache")).not.toBeInTheDocument();
    expect(screen.getByText("loading")).toBeInTheDocument();
  });
});
