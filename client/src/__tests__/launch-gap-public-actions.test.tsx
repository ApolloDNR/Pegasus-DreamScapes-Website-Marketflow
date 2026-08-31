import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { Footer } from "@/components/footer";
import { CategoryPage } from "@/pegasus/category-page";
import { CATEGORIES } from "@/pegasus/data";

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
}));

vi.mock("@/lib/queryClient", async () => {
  const actual = await vi.importActual<typeof import("@/lib/queryClient")>(
    "@/lib/queryClient",
  );
  return { ...actual, apiRequest: apiRequestMock };
});

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    isAuthenticated: false,
    isGuestMode: false,
    isAdmin: false,
    profile: null,
    userRole: null,
  }),
  getRoleDashboardPath: () => "/marketflow",
}));

vi.mock("@/components/theme-toggle", () => ({ ThemeToggle: () => null }));
vi.mock("@/lib/analytics", () => ({ trackEvent: () => {} }));

function renderWithProviders(node: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const memory = memoryLocation({ path: "/login" });

  return render(
    <QueryClientProvider client={queryClient}>
      <Router hook={memory.hook}>{node}</Router>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  apiRequestMock.mockReset();
});

describe("launch-gap public action truth", () => {
  it("requires explicit newsletter consent and forwards the recorded consent", async () => {
    apiRequestMock.mockResolvedValue(new Response("{}", { status: 201 }));
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<Footer />);

    const subscribe = screen.getByRole("button", { name: /subscribe/i });
    await user.type(screen.getByRole("textbox", { name: "Email address" }), "reader@example.com");
    expect(subscribe).toBeDisabled();

    const consent = screen.getByRole("checkbox", {
      name: /Pegasus may email me strategy updates/i,
    });
    await user.click(consent);
    expect(subscribe).toBeEnabled();
    await user.click(subscribe);

    await waitFor(() => {
      expect(apiRequestMock).toHaveBeenCalledWith("POST", "/api/leads", {
        leadType: "newsletter",
        source: "footer_email_capture",
        firstName: "",
        email: "reader@example.com",
        consentContact: true,
        consentCcpaAcknowledged: true,
      });
    });
    expect(screen.getByText("You're in.")).toBeInTheDocument();
  });

  it("keeps footer receipt copy conditional", () => {
    renderWithProviders(<Footer />);

    expect(
      screen.getByText("Submission receipt does not promise review, follow-up, or response timing."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/within 48 hours/i)).not.toBeInTheDocument();
  });

  it("keeps Operators as a standards explainer and routes to the sole formal intake", () => {
    const { container } = renderWithProviders(
      <CategoryPage
        cat={CATEGORIES.operators}
        go={vi.fn()}
        openPeggy={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Vendor Network is the only formal application of record/i),
    ).toBeInTheDocument();
    expect(container.querySelector("form")).toBeNull();
    expect(screen.queryByRole("button", { name: /submit operator profile/i })).not.toBeInTheDocument();

    const formalIntake = screen.getByRole("link", { name: /apply through vendor network/i });
    expect(formalIntake).toHaveAttribute("href", "/vendor-network#vendor-form");
    fireEvent.click(formalIntake);
    expect(apiRequestMock).not.toHaveBeenCalled();
  });
});
