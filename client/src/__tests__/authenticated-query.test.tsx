import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";

const authState = vi.hoisted(() => ({
  accessToken: "signed-user-token" as string | null,
  userId: "user-a",
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    session: authState.accessToken
      ? {
          access_token: authState.accessToken,
          user: { id: authState.userId },
        }
      : null,
  }),
}));

function StatsProbe() {
  const { data } = useAuthenticatedQuery<{ active: number }>([
    "/api/supabase/marketplace",
    "wholesaler",
    "stats",
  ]);
  return <output>{data?.active ?? "loading"}</output>;
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
    authState.userId = "user-a";
    vi.restoreAllMocks();
  });

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
});
