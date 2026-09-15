import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import DealflowMessages from "@/pages/dealflow-messages";

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    user: { id: "viewer-1", email: "viewer@example.test" },
  }),
}));

vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const messages = [
  {
    id: 1,
    senderId: "viewer-1",
    receiverId: "member-alpha",
    content: "Renovation scope",
    isRead: true,
    createdAt: "2026-08-29T10:00:00.000Z",
  },
  {
    id: 2,
    senderId: "member-beta",
    receiverId: "viewer-1",
    content: "Timeline question",
    isRead: false,
    createdAt: "2026-08-30T10:00:00.000Z",
  },
];

function renderMessages(path: string) {
  window.history.replaceState({}, "", path);
  const { hook } = memoryLocation({ path, static: true });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(["/api/messages"], messages);
  client.setQueryData(["/api/messages/conversation", "member-beta"], [messages[1]]);

  return render(
    <QueryClientProvider client={client}>
      <Router hook={hook}>
        <DealflowMessages />
      </Router>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

describe("MarketFlow messages", () => {
  it("opens a profile deep-link as a real conversation and removes the inert composer entry point", async () => {
    renderMessages("/marketflow/messages?to=member-beta");

    expect(await screen.findByRole("heading", { name: /member member-beta/i })).toBeInTheDocument();
    expect(screen.getAllByText("Timeline question").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /new conversation/i })).not.toBeInTheDocument();
  });

  it("filters the rendered conversations by member id or message text", () => {
    renderMessages("/marketflow/messages");

    expect(screen.getByTestId("conversation-member-alpha")).toBeInTheDocument();
    expect(screen.getByTestId("conversation-member-beta")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: /search conversations/i }), {
      target: { value: "timeline" },
    });

    expect(screen.queryByTestId("conversation-member-alpha")).not.toBeInTheDocument();
    expect(screen.getByTestId("conversation-member-beta")).toBeInTheDocument();
  });
});
