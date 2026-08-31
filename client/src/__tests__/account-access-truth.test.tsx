import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

const auth = vi.hoisted(() => ({
  signUp: vi.fn(),
  signIn: vi.fn(),
  enterGuestMode: vi.fn(),
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    signUp: auth.signUp,
    signIn: auth.signIn,
    enterGuestMode: auth.enterGuestMode,
    isLoading: false,
    profile: null,
  }),
  getRoleDashboardPath: (role: string | null) =>
    role === "investor" ? "/marketflow/investor" : "/marketflow",
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/queryClient", () => ({ apiRequest: vi.fn() }));

import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import MarketflowAccessPage from "@/pages/marketflow-access";

class NoopResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = NoopResizeObserver;
}

function renderAt(path: string, node: React.ReactNode) {
  const memory = memoryLocation({ path, record: true });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <Router hook={memory.hook}>{node}</Router>
    </QueryClientProvider>,
  );
  return memory;
}

beforeEach(() => {
  auth.signUp.mockReset().mockResolvedValue({ error: null });
  auth.signIn.mockReset().mockResolvedValue({ error: null });
  auth.enterGuestMode.mockReset();
});

afterEach(() => cleanup());

describe("account and MarketFlow access truth", () => {
  it("describes login as general preview-account access only", () => {
    renderAt("/login", <LoginPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Welcome Back" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/general Pegasus preview account/i)).toBeInTheDocument();
    expect(screen.getByText(/MarketFlow is invitation-led and requires separate approval/i)).toBeInTheDocument();
    expect(screen.getByTestId("link-signup")).toHaveTextContent("Create a preview account");
  });

  it("labels the signup selection as declared interest and requires policy acknowledgement", async () => {
    renderAt("/signup", <SignupPage />);

    expect(screen.getByRole("heading", { name: "Create a Pegasus preview account" })).toBeInTheDocument();
    expect(screen.getByText(/selected role records declared interest/i)).toBeInTheDocument();
    expect(screen.getByText(/does not verify or approve you/i)).toBeInTheDocument();
    expect(screen.getByText(/does not grant MarketFlow inventory access or submission privileges/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("button-next-step"));

    const policies = await screen.findByTestId("checkbox-signup-policies");
    expect(policies).toHaveAttribute("data-state", "unchecked");
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
  });

  it("lands a new preview account on the public MarketFlow explanation, not a role workspace", async () => {
    const memory = renderAt("/signup", <SignupPage />);
    fireEvent.click(screen.getByTestId("button-next-step"));

    fireEvent.change(await screen.findByTestId("input-display-name"), {
      target: { value: "Taylor Preview" },
    });
    fireEvent.change(screen.getByTestId("input-email"), {
      target: { value: "taylor@example.com" },
    });
    fireEvent.change(screen.getByTestId("input-password"), {
      target: { value: "strong-password" },
    });
    fireEvent.change(screen.getByTestId("input-confirm-password"), {
      target: { value: "strong-password" },
    });
    fireEvent.click(screen.getByTestId("checkbox-signup-policies"));
    fireEvent.click(screen.getByTestId("button-signup"));

    await waitFor(() => expect(auth.signUp).toHaveBeenCalledTimes(1));
    expect(memory.history.at(-1)).toBe("/marketflow");
    expect(memory.history.at(-1)).not.toBe("/marketflow/investor");
  });

  it("frames the access form as an invitation-led interest record with no promised review", () => {
    renderAt("/marketflow/access", <MarketflowAccessPage />);

    expect(screen.getAllByText(/private and invitation-led/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/records the context for possible consideration/i)).toBeInTheDocument();
    expect(screen.getByText(/does not guarantee human review, a response, approval, an invitation, inventory, or access/i)).toBeInTheDocument();
    expect(screen.getByTestId("button-access-submit")).toHaveTextContent("Record access interest");
    expect(screen.queryByText(/Pegasus reviews each request|real review|before responding/i)).toBeNull();
  });
});
