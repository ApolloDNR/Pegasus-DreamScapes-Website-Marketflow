import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

const privateState = vi.hoisted(() => ({
  user: { id: "user-a", email: "a@example.com" } as any,
  profile: { display_name: "User A" } as any,
  failing: new Set<string>(),
  apiRequest: vi.fn(),
  query: vi.fn(),
  toast: vi.fn(),
}));

function payloadFor(path: string) {
  if (privateState.failing.has(path)) throw new Error(`Unavailable: ${path}`);
  const subject = privateState.user?.id ?? "anonymous";
  if (path === "/api/notifications") {
    return [{
      id: 1,
      type: "message",
      title: `${subject} notification`,
      message: "Private update",
      isRead: false,
      link: null,
      createdAt: "2026-08-30T12:00:00.000Z",
    }];
  }
  if (path === "/api/notifications/unread-count") return { count: 1 };
  if (path === "/api/investor-activity") {
    return [{
      id: 1,
      activityType: "view",
      title: `${subject} activity`,
      description: `${subject} activity`,
      link: null,
      createdAt: "2026-08-30T12:00:00.000Z",
    }];
  }
  if (path === "/api/announcements") {
    return [{
      id: 7,
      title: `${subject} announcement`,
      content: "Private announcement",
      audience: "ALL",
      isPinned: true,
      ctaText: null,
      ctaLink: null,
    }];
  }
  if (path === "/api/community/categories") return [];
  if (path === "/api/community/feed") return [];
  if (path.startsWith("/api/community/posts")) return [];
  return [];
}

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    user: privateState.user,
    profile: privateState.profile,
    isAuthenticated: Boolean(privateState.user),
  }),
}));

vi.mock("@/contexts/notification-context", () => ({
  useNotificationContext: () => ({ isConnected: false }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: privateState.toast }),
}));

vi.mock("@/hooks/use-seo", () => ({ useSEO: () => undefined }));
vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/queryClient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/queryClient")>();
  return { ...actual, apiRequest: privateState.apiRequest };
});

import { ActivityFeed } from "@/components/activity-feed";
import { AnnouncementsBanner } from "@/components/announcements-banner";
import { NotificationDropdown } from "@/components/notification-dropdown";
import {
  NotificationBell as LegacyNotificationBell,
  NotificationPreferences,
} from "@/components/notification-system";
import DealflowCommunity from "@/pages/dealflow-community";

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        queryFn: ({ queryKey }) => privateState.query(String(queryKey[0])),
      },
      mutations: { retry: false },
    },
  });
}

function renderPrivate(ui: React.ReactElement, client = createClient()) {
  const memory = memoryLocation({ path: "/marketflow/community" });
  const view = render(
    <QueryClientProvider client={client}>
      <Router hook={memory.hook}>{ui}</Router>
    </QueryClientProvider>,
  );
  return { ...view, client, memory };
}

function openDropdownNotifications() {
  fireEvent.pointerDown(screen.getByTestId("button-notifications"), {
    button: 0,
    ctrlKey: false,
  });
}

beforeEach(() => {
  privateState.user = { id: "user-a", email: "a@example.com" };
  privateState.profile = { display_name: "User A" };
  privateState.failing.clear();
  privateState.toast.mockReset();
  privateState.query.mockReset();
  privateState.query.mockImplementation((path: string) => Promise.resolve(payloadFor(path)));
  privateState.apiRequest.mockReset();
  privateState.apiRequest.mockImplementation(async (method: string, path: string) => {
    if (method === "GET") return jsonResponse(payloadFor(path));
    return jsonResponse({ success: true });
  });
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("subject-scoped private reads", () => {
  it("does not reuse another identity's notification cache", async () => {
    const view = renderPrivate(<NotificationDropdown />);
    openDropdownNotifications();
    expect(await screen.findByText("user-a notification")).toBeVisible();

    privateState.user = { id: "user-b", email: "b@example.com" };
    privateState.profile = { display_name: "User B" };
    view.rerender(
      <QueryClientProvider client={view.client}>
        <Router hook={view.memory.hook}>
          <NotificationDropdown />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("user-b notification")).toBeVisible();
    expect(screen.queryByText("user-a notification")).not.toBeInTheDocument();
    const keys = view.client.getQueryCache().getAll().map((query) => query.queryKey);
    expect(keys).toContainEqual(["/api/notifications", "user-b"]);
    expect(keys).not.toContainEqual(["/api/notifications"]);
  });

  it("does not reuse another identity's activity cache", async () => {
    const view = renderPrivate(<ActivityFeed compact />);
    expect(await screen.findByText("user-a activity")).toBeVisible();

    privateState.user = { id: "user-b", email: "b@example.com" };
    view.rerender(
      <QueryClientProvider client={view.client}>
        <Router hook={view.memory.hook}>
          <ActivityFeed compact />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("user-b activity")).toBeVisible();
    expect(screen.queryByText("user-a activity")).not.toBeInTheDocument();
  });

  it("keeps dismissed announcements scoped to the current identity", async () => {
    const view = renderPrivate(<AnnouncementsBanner />);
    expect(await screen.findByText("user-a announcement")).toBeVisible();
    fireEvent.click(screen.getByTestId("button-dismiss-announcement-7"));
    expect(screen.queryByText("user-a announcement")).not.toBeInTheDocument();

    privateState.user = { id: "user-b", email: "b@example.com" };
    view.rerender(
      <QueryClientProvider client={view.client}>
        <Router hook={view.memory.hook}>
          <AnnouncementsBanner />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("user-b announcement")).toBeVisible();
    expect(window.localStorage.getItem("dismissedAnnouncements:user-a")).toBe("[7]");
  });
});

describe("private surfaces fail closed", () => {
  it.each([
    ["notifications", "/api/notifications", <NotificationDropdown />, "button-notifications", /notifications unavailable/i],
    ["activity", "/api/investor-activity", <ActivityFeed compact />, null, /activity unavailable/i],
    ["announcements", "/api/announcements", <AnnouncementsBanner />, null, /announcements unavailable/i],
  ] as const)("shows an explicit %s error instead of an empty state", async (_label, path, ui, trigger, message) => {
    privateState.failing.add(path);
    renderPrivate(ui);
    if (trigger === "button-notifications") openDropdownNotifications();
    else if (trigger) fireEvent.click(screen.getByTestId(trigger));
    expect(await screen.findByText(message)).toBeVisible();
  });

  it("shows community unavailability and removes unsupported feed actions", async () => {
    privateState.failing.add("/api/community/feed");
    renderPrivate(<DealflowCommunity />);

    expect(await screen.findByText(/community unavailable/i)).toBeVisible();
    expect(screen.queryByTestId("tab-following")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tab-trending")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Project" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Deal" })).not.toBeInTheDocument();
  });
});

describe("notification actions use implemented endpoints", () => {
  it("uses PATCH read and the real mark-all route", async () => {
    renderPrivate(<LegacyNotificationBell userId="user-a" />);
    fireEvent.click(screen.getByTestId("button-notifications"));
    const notification = await screen.findByTestId("notification-1");
    fireEvent.click(notification);
    await waitFor(() => {
      expect(privateState.apiRequest).toHaveBeenCalledWith(
        "PATCH",
        "/api/notifications/1/read",
      );
    });

    fireEvent.click(screen.getByTestId("button-mark-all-read"));
    await waitFor(() => {
      expect(privateState.apiRequest).toHaveBeenCalledWith(
        "POST",
        "/api/notifications/mark-all-read",
      );
    });
  });

  it("does not present unsaved notification preferences as working controls", () => {
    renderPrivate(<NotificationPreferences />);
    expect(screen.getByRole("status")).toHaveTextContent(
      /notification preferences are not available/i,
    );
    expect(screen.queryByText("Push Notifications")).not.toBeInTheDocument();
  });
});
