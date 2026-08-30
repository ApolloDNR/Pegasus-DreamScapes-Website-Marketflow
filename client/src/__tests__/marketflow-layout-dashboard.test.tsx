import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

let userRole = "investor";

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    user: { id: "approved-user", email: "approved@example.com" },
    profile: {
      display_name: "Approved User",
      avatar_url: null,
      primary_role: userRole,
      is_pegasus_badged: true,
    },
    userRole,
    signOut: vi.fn(),
  }),
  getRoleDashboardPath: (role: string | null) => {
    if (role === "wholesaler") return "/marketflow/wholesaler";
    if (role === "buyer_investment") return "/marketflow/buyer";
    if (role === "investor") return "/marketflow/investor";
    return "/marketflow";
  },
}));

vi.mock("@/components/notification-dropdown", () => ({
  NotificationDropdown: () => null,
}));

import { MarketplaceLayout } from "@/components/marketplace-layout";

function renderLayout(path: string) {
  const memory = memoryLocation({ path, static: true });
  render(
    <Router hook={memory.hook}>
      <MarketplaceLayout>
        <h1>Workspace</h1>
      </MarketplaceLayout>
    </Router>,
  );
}

afterEach(() => cleanup());

describe("MarketFlow global dashboard navigation", () => {
  it.each([
    ["investor", "/marketflow/investor"],
    ["wholesaler", "/marketflow/wholesaler"],
    ["buyer_investment", "/marketflow/buyer"],
    ["project_manager", "/marketflow/dashboard"],
  ])("routes %s to its real workspace and marks it active", (role, expectedHref) => {
    userRole = role;
    renderLayout(expectedHref);

    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard).toHaveAttribute("href", expectedHref);
    expect(dashboard).toHaveAttribute("data-active", "true");
  });
});
