import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseState = vi.hoisted(() => ({
  getSupabaseSync: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseSync: supabaseState.getSupabaseSync,
}));

import {
  apiRequest,
  authenticatedRequest,
  getQueryFn,
} from "@/lib/queryClient";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

async function runGenericGet() {
  const queryFn = getQueryFn<{ active: number }>({ on401: "throw" });
  return (queryFn as any)({ queryKey: ["/api/private/stats"] });
}

describe("shared API authentication", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    supabaseState.getSession.mockReset();
    supabaseState.getSupabaseSync.mockReset().mockReturnValue({
      auth: { getSession: supabaseState.getSession },
    });
  });

  it("adds the current Supabase bearer token to a generic GET", async () => {
    supabaseState.getSession.mockResolvedValue({
      data: { session: { access_token: "current-user-token" } },
      error: null,
    });
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ active: 7 }));

    await expect(runGenericGet()).resolves.toEqual({ active: 7 });
    expect(fetchMock).toHaveBeenCalledWith("/api/private/stats", {
      credentials: "include",
      headers: { Authorization: "Bearer current-user-token" },
    });
  });

  it("adds the current Supabase bearer token to a JSON mutation", async () => {
    supabaseState.getSession.mockResolvedValue({
      data: { session: { access_token: "current-user-token" } },
      error: null,
    });
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ success: true }));

    await apiRequest("POST", "/api/private/offers", { amount: 125_000 });

    expect(fetchMock).toHaveBeenCalledWith("/api/private/offers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer current-user-token",
      },
      body: JSON.stringify({ amount: 125_000 }),
      credentials: "include",
    });
  });

  it("preserves a scoped Peggy access header on a JSON mutation", async () => {
    supabaseState.getSession.mockResolvedValue({
      data: { session: { access_token: "current-user-token" } },
      error: null,
    });
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ success: true }));

    await apiRequest(
      "POST",
      "/api/peggy/chat",
      { conversationId: 41, message: "Hello" },
      { "X-Peggy-Conversation-Token": "v1.scoped-token" },
    );

    expect(fetchMock).toHaveBeenCalledWith("/api/peggy/chat", {
      method: "POST",
      headers: {
        "X-Peggy-Conversation-Token": "v1.scoped-token",
        "Content-Type": "application/json",
        Authorization: "Bearer current-user-token",
      },
      body: JSON.stringify({ conversationId: 41, message: "Hello" }),
      credentials: "include",
    });
  });

  it("preserves the cookie-only generic GET when Supabase is not initialized", async () => {
    supabaseState.getSupabaseSync.mockReturnValue(null);
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ active: 3 }));

    await expect(runGenericGet()).resolves.toEqual({ active: 3 });
    expect(supabaseState.getSession).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith("/api/private/stats", {
      credentials: "include",
    });
  });

  it("preserves the cookie-only JSON mutation when no Supabase session exists", async () => {
    supabaseState.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ success: true }));

    await apiRequest("POST", "/api/private/offers", { amount: 125_000 });

    expect(fetchMock).toHaveBeenCalledWith("/api/private/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 125_000 }),
      credentials: "include",
    });
  });

  it("preserves request options while adding bearer auth to same-origin calls", async () => {
    supabaseState.getSession.mockResolvedValue({
      data: { session: { access_token: "current-user-token" } },
      error: null,
    });
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ success: true }));

    await authenticatedRequest("/api/private/upload-ticket", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Source": "upload",
      },
      body: JSON.stringify({ name: "offering.pdf" }),
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/private/upload-ticket", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Source": "upload",
        Authorization: "Bearer current-user-token",
      },
      body: JSON.stringify({ name: "offering.pdf" }),
      credentials: "include",
    });
  });

  it("does not leak the site bearer token to a cross-origin presigned URL", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await authenticatedRequest("https://storage.example.test/presigned-upload", {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: new Blob(["pdf"], { type: "application/pdf" }),
    });

    expect(supabaseState.getSession).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://storage.example.test/presigned-upload",
      {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: expect.any(Blob),
      },
    );
  });

  it("does not replace an explicit Authorization header", async () => {
    supabaseState.getSession.mockResolvedValue({
      data: { session: { access_token: "current-user-token" } },
      error: null,
    });
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ success: true }));

    await authenticatedRequest("/api/private/delegated", {
      headers: { Authorization: "Bearer delegated-token" },
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/private/delegated", {
      headers: { Authorization: "Bearer delegated-token" },
      credentials: "include",
    });
  });
});
