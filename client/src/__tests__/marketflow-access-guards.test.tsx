import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

type GuardAuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuestMode: boolean;
  guestRole: string | null;
  userRole: string | null;
  isAdmin: boolean;
  profile: { primary_role?: string; is_pegasus_badged?: boolean } | null;
};

let authState: GuardAuthState;

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => authState,
  canAccessRoute: () => true,
  getRoleDashboardPath: (role: string | null) =>
    role ? `/marketflow/${role}` : "/marketflow",
}));

import { AuthGuard } from "@/components/auth-guard";

function renderGuard(path: string) {
  const memory = memoryLocation({ path, record: true });
  render(
    <Router hook={memory.hook}>
      <AuthGuard>
        <p>Private workspace</p>
      </AuthGuard>
    </Router>,
  );
  return memory;
}

afterEach(() => cleanup());

describe("governed MarketFlow client access", () => {
  it("redirects an ordinary authenticated preview account away from role workspaces", () => {
    authState = {
      isAuthenticated: true,
      isLoading: false,
      isGuestMode: false,
      guestRole: null,
      userRole: "investor",
      isAdmin: false,
      profile: { primary_role: "investor", is_pegasus_badged: false },
    };

    const memory = renderGuard("/marketflow/investor");

    expect(screen.queryByText("Private workspace")).toBeNull();
    expect(memory.history.at(-1)).toBe("/marketflow/access");
  });

  it("redirects guest walkthrough identities away from community and submission routes", () => {
    authState = {
      isAuthenticated: false,
      isLoading: false,
      isGuestMode: true,
      guestRole: "wholesaler",
      userRole: "wholesaler",
      isAdmin: false,
      profile: null,
    };

    const community = renderGuard("/marketflow/community");
    expect(screen.queryByText("Private workspace")).toBeNull();
    expect(community.history.at(-1)).toBe("/marketflow/access");
    cleanup();

    const submit = renderGuard("/marketflow/submit");
    expect(screen.queryByText("Private workspace")).toBeNull();
    expect(submit.history.at(-1)).toBe("/marketflow/access");
  });

  it("keeps the exact role dashboards available as clearly bounded guest walkthroughs", () => {
    authState = {
      isAuthenticated: false,
      isLoading: false,
      isGuestMode: true,
      guestRole: "investor",
      userRole: "investor",
      isAdmin: false,
      profile: null,
    };

    const memory = renderGuard("/marketflow/investor");

    expect(screen.getByText("Private workspace")).toBeInTheDocument();
    expect(memory.history.at(-1)).toBe("/marketflow/investor");
  });

  it("admits a separately governed Pegasus-badged profile", () => {
    authState = {
      isAuthenticated: true,
      isLoading: false,
      isGuestMode: false,
      guestRole: null,
      userRole: "wholesaler",
      isAdmin: false,
      profile: { primary_role: "wholesaler", is_pegasus_badged: true },
    };

    renderGuard("/marketflow/submit");

    expect(screen.getByText("Private workspace")).toBeInTheDocument();
  });
});
