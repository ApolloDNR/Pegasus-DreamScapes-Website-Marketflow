import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const boundary = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    isAuthenticated: true,
    user: { id: "external-user-42" },
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: boundary.toast }),
}));

vi.mock("@/lib/queryClient", async () => {
  const actual = await vi.importActual<typeof import("@/lib/queryClient")>(
    "@/lib/queryClient",
  );
  return { ...actual, apiRequest: boundary.apiRequest };
});

import { useSupabaseMarketplace } from "@/hooks/use-supabase-marketplace";

function SavedItemsHarness() {
  const marketplace = useSupabaseMarketplace();
  return (
    <div>
      <output data-testid="saved-items">
        {JSON.stringify(marketplace.savedItems)}
      </output>
      <output data-testid="listing-42-saved">
        {String(marketplace.isItemSaved("listing", "42"))}
      </output>
      <button
        type="button"
        onClick={() => marketplace.toggleSaveItem("listing", "42")}
      >
        Toggle existing
      </button>
      <button
        type="button"
        onClick={() => marketplace.toggleSaveItem("listing", "99")}
      >
        Toggle new
      </button>
    </div>
  );
}

function renderHarness() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: async () => [],
        retry: false,
        staleTime: Infinity,
        gcTime: 0,
      },
      mutations: { retry: false },
    },
  });
  client.setQueryData(["/api/supabase/saved-items"], [
    {
      id: "saved-42",
      externalUserId: "external-user-42",
      itemType: "listing",
      itemId: 42,
      createdAt: "2026-08-22T12:00:00.000Z",
    },
  ]);
  return render(
    <QueryClientProvider client={client}>
      <SavedItemsHarness />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  boundary.apiRequest.mockReset().mockResolvedValue(
    new Response("{}", {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
  boundary.toast.mockReset();
});

afterEach(() => cleanup());

describe("Supabase marketplace saved-item DTO", () => {
  it("reads camelCase items and normalizes item IDs before choosing DELETE", async () => {
    renderHarness();

    expect(screen.getByTestId("saved-items")).toHaveTextContent(
      '"externalUserId":"external-user-42"',
    );
    expect(screen.getByTestId("listing-42-saved")).toHaveTextContent("true");

    fireEvent.click(screen.getByRole("button", { name: "Toggle existing" }));
    await waitFor(() => expect(boundary.apiRequest).toHaveBeenCalledTimes(1));
    expect(boundary.apiRequest).toHaveBeenCalledWith(
      "DELETE",
      "/api/supabase/saved-items",
      { itemType: "listing", itemId: "42" },
    );
  });

  it("uses the POST branch for an item that is not saved", async () => {
    renderHarness();

    fireEvent.click(screen.getByRole("button", { name: "Toggle new" }));
    await waitFor(() => expect(boundary.apiRequest).toHaveBeenCalledTimes(1));
    expect(boundary.apiRequest).toHaveBeenCalledWith(
      "POST",
      "/api/supabase/saved-items",
      { itemType: "listing", itemId: "99" },
    );
  });
});
