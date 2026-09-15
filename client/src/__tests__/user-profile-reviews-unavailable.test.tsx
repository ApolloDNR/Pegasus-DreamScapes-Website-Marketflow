import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import UserProfile from "@/pages/user-profile";

const boundary = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  authenticatedRequest: vi.fn(),
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    user: { id: "viewer-1", email: "viewer@example.test" },
    isAuthenticated: true,
  }),
}));

vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/queryClient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/queryClient")>();
  return {
    ...actual,
    apiRequest: boundary.apiRequest,
    authenticatedRequest: boundary.authenticatedRequest,
  };
});

function jsonResponse(value: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(value), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
}

describe("unavailable profile review creation", () => {
  beforeEach(() => {
    boundary.apiRequest.mockReset();
    boundary.authenticatedRequest.mockReset().mockImplementation(() => jsonResponse([]));
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith("/api/users/member-2")) {
        return jsonResponse({
          id: "member-2",
          firstName: "Morgan",
          lastName: "Member",
          profileImageUrl: null,
          roles: ["investor"],
        });
      }
      if (url.endsWith("/api/users/member-2/stats")) {
        return jsonResponse({
          userId: "member-2",
          totalDealsCompleted: 0,
          totalDealsValue: 0,
          totalReviews: 0,
          verificationLevel: "basic",
        });
      }
      if (url.endsWith("/api/users/member-2/reputation")) return jsonResponse(null);
      return jsonResponse([]);
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("explains the unavailable review pilot and cannot submit to the disabled endpoint", async () => {
    const { hook } = memoryLocation({ path: "/profile/member-2", static: true });
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={client}>
        <Router hook={hook}>
          <Route path="/profile/:userId">
            <UserProfile />
          </Route>
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Morgan Member")).toBeInTheDocument();
    expect(
      screen.getByText(/reviews are unavailable until Pegasus can verify a completed transaction/i),
    ).toBeInTheDocument();

    const unavailableReview = screen.getByRole("button", { name: /reviews unavailable/i });
    expect(unavailableReview).toBeDisabled();
    fireEvent.click(unavailableReview);

    expect(screen.queryByRole("dialog", { name: /write a review/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /submit review/i })).not.toBeInTheDocument();
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });

  it("deep-links Message to the selected member without publishing unverified performance claims", async () => {
    const { hook } = memoryLocation({ path: "/profile/member-2", static: true });
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={client}>
        <Router hook={hook}>
          <Route path="/profile/:userId">
            <UserProfile />
          </Route>
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Morgan Member")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^message$/i })).toHaveAttribute(
      "href",
      "/marketflow/messages?to=member-2",
    );
    expect(screen.getByText(/performance metrics are not published/i)).toBeInTheDocument();
    expect(screen.queryByText(/trust score/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/rank progress/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/avg return/i)).not.toBeInTheDocument();

    const requestedUrls = vi.mocked(globalThis.fetch).mock.calls.map(([input]) => String(input));
    expect(requestedUrls).toEqual(["/api/users/member-2"]);
  });
});
