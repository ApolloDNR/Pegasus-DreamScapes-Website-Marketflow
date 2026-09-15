import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import StrategyLabSubmittedPage from "@/pages/strategy-lab-submitted";
import StrategyLabBlueprintConfirmedPage from "@/pages/strategy-lab-blueprint-confirmed";

const requestState = vi.hoisted(() => ({
  authenticatedRequest: vi.fn(),
}));

vi.mock("@/lib/queryClient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/queryClient")>();
  return {
    ...actual,
    authenticatedRequest: requestState.authenticatedRequest,
  };
});

vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));

function renderAt(path: string, page: React.ReactNode) {
  const url = new URL(path, "https://pegasus.test");
  const { hook } = memoryLocation({ path: url.pathname, static: true });
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <Router hook={hook} searchHook={() => url.search}>{page}</Router>
    </QueryClientProvider>,
  );
}

describe("Strategy Lab receipt verification", () => {
  beforeEach(() => {
    requestState.authenticatedRequest.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not treat an arbitrary submission query value as a receipt", () => {
    renderAt(
      "/strategy-lab/submitted?id=forged-reference",
      <StrategyLabSubmittedPage />,
    );

    expect(
      screen.getByRole("heading", { name: /no verified submission receipt is available/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/your request was recorded/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/#forged-reference/i)).not.toBeInTheDocument();
    expect(requestState.authenticatedRequest).not.toHaveBeenCalled();
  });

  it("shows a neutral failure state when the server cannot verify ownership", async () => {
    requestState.authenticatedRequest.mockResolvedValue(
      new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      }),
    );

    renderAt("/strategy-lab/submitted?id=42", <StrategyLabSubmittedPage />);

    expect(
      await screen.findByRole("heading", { name: /we could not verify this submission receipt/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/your request was recorded/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^#42$/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in to verify/i })).toHaveAttribute(
      "href",
      "/login?returnTo=%2Fstrategy-lab%2Fsubmitted%3Fid%3D42",
    );
    expect(requestState.authenticatedRequest).toHaveBeenCalledWith(
      "/api/strategy-lab/submission/42",
    );
  });

  it("renders a receipt only after the owner-scoped endpoint verifies the record", async () => {
    requestState.authenticatedRequest.mockResolvedValue(
      new Response(
        JSON.stringify({ id: 42, status: "received", createdAt: "2026-08-30T00:00:00.000Z" }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    renderAt("/strategy-lab/submitted?id=42", <StrategyLabSubmittedPage />);

    expect(
      await screen.findByRole("heading", { name: /submission receipt verified/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("#42")).toBeInTheDocument();
    expect(screen.getByText("received")).toBeInTheDocument();
    await waitFor(() => {
      expect(requestState.authenticatedRequest).toHaveBeenCalledTimes(1);
    });
  });

  it("retires the unverified Blueprint confirmation URL", () => {
    renderAt(
      "/strategy-lab/blueprint-confirmed?orderId=123",
      <StrategyLabBlueprintConfirmedPage />,
    );

    expect(
      screen.getByRole("heading", { name: /blueprint confirmation is not available at this link/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/cannot verify that Pegasus received a request/i)).toBeInTheDocument();
    expect(screen.queryByText(/blueprint request received/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/#123/i)).not.toBeInTheDocument();
  });
});
