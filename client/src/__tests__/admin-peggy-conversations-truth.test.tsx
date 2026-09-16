import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryFunction,
} from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminPeggyConversationsPage from "@/pages/admin-peggy-conversations";
import type { PeggyConversation, PeggyMessage } from "@shared/schema";

vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const conversation: PeggyConversation = {
  id: 17,
  userId: null,
  sessionId: "session-17",
  contextType: "general",
  contextPage: "/peggy",
  contextDealType: null,
  contextDealId: null,
  contextCalculator: null,
  title: "Owner-occupant foreclosure question",
  messageCount: 1,
  lastMessageAt: new Date("2026-08-30T12:01:00.000Z"),
  isActive: false,
  isPinned: false,
  channel: "web",
  callerNumber: null,
  callSid: null,
  recordingConsent: null,
  recordingStoppedAt: null,
  durationSec: null,
  hqSubmissionId: null,
  hqForwardedAt: null,
  intake: { situation: "foreclosure" },
  disposition: "human_required",
  routedTo: "Apollo",
  contactName: "Morgan Owner",
  contactEmail: "morgan@example.test",
  contactPhone: null,
  summary: "Owner-occupant asked about a pending trustee sale.",
  humanRequired: true,
  humanRequiredReason: "Civil Code §1695",
  reportedAt: null,
  endedAt: new Date("2026-08-30T12:02:00.000Z"),
  createdAt: new Date("2026-08-30T12:00:00.000Z"),
  updatedAt: new Date("2026-08-30T12:02:00.000Z"),
};

const message: PeggyMessage = {
  id: 44,
  conversationId: 17,
  role: "user",
  content: "I live in the property and received a trustee-sale notice.",
  contextSnapshot: null,
  model: null,
  tokensUsed: null,
  feedback: null,
  feedbackNotes: null,
  createdAt: new Date("2026-08-30T12:01:00.000Z"),
};

function requestPath(queryKey: readonly unknown[]) {
  return queryKey.map(String).join("/");
}

function renderPage(queryFn: QueryFunction<unknown>) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, queryFn },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <AdminPeggyConversationsPage />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Peggy HQ review-queue truth states", () => {
  it("withholds human-review counts until the list is a verified array", async () => {
    const request = deferred<unknown>();
    renderPage(() => request.promise);

    expect(screen.getByRole("status")).toHaveTextContent(/loading peggy review queue/i);
    expect(screen.queryByTestId("text-peggy-total")).not.toBeInTheDocument();
    expect(screen.queryByTestId("text-peggy-human")).not.toBeInTheDocument();
    expect(screen.queryByText(/no peggy conversations/i)).not.toBeInTheDocument();

    request.resolve([]);

    expect(await screen.findByTestId("text-peggy-total")).toHaveTextContent("0");
    expect(screen.getByTestId("text-peggy-human")).toHaveTextContent("0");
    expect(screen.getByText(/no peggy conversations in the last 30 days/i)).toBeVisible();
  });

  it("fails closed on a list error and only shows zero counts after retry verifies an empty array", async () => {
    let attempt = 0;
    renderPage(() => {
      attempt += 1;
      return attempt === 1
        ? Promise.reject(new Error("review database unavailable"))
        : Promise.resolve([]);
    });

    const failure = await screen.findByRole("alert");
    expect(failure).toHaveTextContent(/peggy review queue unavailable/i);
    expect(failure).toHaveTextContent(/fair housing and civil code §1695 flags have not been verified/i);
    expect(screen.queryByTestId("text-peggy-total")).not.toBeInTheDocument();
    expect(screen.queryByTestId("text-peggy-human")).not.toBeInTheDocument();
    expect(screen.queryByText(/no peggy conversations/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /retry conversations/i }));

    expect(await screen.findByTestId("text-peggy-total")).toHaveTextContent("0");
    expect(screen.getByTestId("text-peggy-human")).toHaveTextContent("0");
    expect(screen.getByText(/no peggy conversations in the last 30 days/i)).toBeVisible();
  });

  it("treats a malformed successful list payload as unverified instead of empty", async () => {
    renderPage(() => Promise.resolve({ conversations: [] }));

    const failure = await screen.findByRole("alert");
    expect(failure).toHaveTextContent(/peggy review queue unavailable/i);
    expect(screen.queryByTestId("text-peggy-total")).not.toBeInTheDocument();
    expect(screen.queryByTestId("text-peggy-human")).not.toBeInTheDocument();
    expect(screen.queryByText(/no peggy conversations/i)).not.toBeInTheDocument();
  });

  it("shows transcript loading and failure states before a verified retry succeeds", async () => {
    const detailRequest = deferred<unknown>();
    let detailAttempt = 0;

    renderPage(({ queryKey }) => {
      const path = requestPath(queryKey);
      if (path === "/api/admin/peggy/conversations") {
        return Promise.resolve([conversation]);
      }
      if (path === "/api/admin/peggy/conversations/17") {
        detailAttempt += 1;
        return detailAttempt === 1
          ? detailRequest.promise
          : Promise.resolve({ conversation, messages: [message] });
      }
      return Promise.reject(new Error(`Unexpected query: ${path}`));
    });

    const row = await screen.findByTestId("row-peggy-17");
    fireEvent.click(row);

    expect(screen.getByRole("status")).toHaveTextContent(/loading transcript #17/i);
    expect(screen.queryByText(message.content)).not.toBeInTheDocument();

    detailRequest.reject(new Error("transcript unavailable"));

    const failure = await screen.findByRole("alert");
    expect(failure).toHaveTextContent(/transcript #17 unavailable/i);
    expect(failure).toHaveTextContent(/fair housing and civil code §1695 review status cannot be confirmed/i);
    expect(screen.queryByText(message.content)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /retry transcript/i }));

    expect(await screen.findByText(message.content)).toBeVisible();
    expect(screen.getByText("Civil Code §1695")).toBeVisible();
  });
});
