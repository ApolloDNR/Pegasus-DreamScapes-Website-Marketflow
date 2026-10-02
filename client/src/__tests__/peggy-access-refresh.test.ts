import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({
  getSupabaseSync: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseSync: authState.getSupabaseSync,
}));

import { PEGGY_CONVERSATION_ACCESS_HEADER } from "@shared/peggy-access";
import { authenticatedRequest } from "@/lib/queryClient";

type PeggyFetchTransport = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

interface PeggyAccessCredentialRef {
  current: { id: number; accessToken: string } | null;
}

interface PeggyFetchWithSingleRefreshInput {
  fetcher: PeggyFetchTransport;
  credentialRef: PeggyAccessCredentialRef;
  input: string;
  init: RequestInit;
  onCredentialChange?: (
    credential: { id: number; accessToken: string },
  ) => void;
}

type PeggyFetchWithSingleRefresh = (
  options: PeggyFetchWithSingleRefreshInput,
) => Promise<Response>;

const helperPath = resolve(import.meta.dirname, "../lib/peggy-access.ts");
const helperModule: Record<string, unknown> = existsSync(helperPath)
  ? await import(/* @vite-ignore */ helperPath)
  : {};
const helperExport = helperModule?.peggyFetchWithSingleRefresh;
const peggyFetchWithSingleRefresh: PeggyFetchWithSingleRefresh =
  typeof helperExport === "function"
    ? helperExport as PeggyFetchWithSingleRefresh
    : async ({ fetcher, input, init }) => fetcher(input, init);

const CHAT_URL = "/api/peggy/chat";
const OLD = { id: 41, accessToken: "opaque-old-token" };
const FRESH = { id: 41, accessToken: "opaque-fresh-token" };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function expiredResponse(): Response {
  return jsonResponse(
    {
      message: "Conversation access expired",
      code: "PEGGY_ACCESS_EXPIRED",
    },
    401,
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function ref(
  value: PeggyAccessCredentialRef["current"] = { ...OLD },
): PeggyAccessCredentialRef {
  return { current: value };
}

function headersAt(fetcher: ReturnType<typeof vi.fn>, index: number): Headers {
  return new Headers(fetcher.mock.calls[index][1]?.headers);
}

describe("peggyFetchWithSingleRefresh", () => {
  beforeEach(() => {
    authState.getSession.mockReset();
    authState.getSupabaseSync.mockReset().mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["success", jsonResponse({ response: "already fine" })],
    ["ordinary unauthorized", jsonResponse({ message: "Unauthorized" }, 401)],
    ["wrong code", jsonResponse({ code: "SOMETHING_ELSE" }, 401)],
    ["message-only expiry", jsonResponse({ message: "Conversation access expired" }, 401)],
    ["non-object body", jsonResponse(["PEGGY_ACCESS_EXPIRED"], 401)],
    ["malformed JSON", new Response("{", { status: 401 })],
    ["forbidden", jsonResponse({ message: "Forbidden" }, 403)],
    ["not found", jsonResponse({ message: "Conversation not found" }, 404)],
    ["rate limited", jsonResponse({ message: "Too many requests" }, 429)],
    ["server error", jsonResponse({ message: "Internal server error" }, 500)],
  ])("returns the untouched readable original for %s", async (_label, original) => {
    const fetcher = vi.fn(async () => original);
    const credentialRef = ref();
    const response = await peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: 41, message: "Hello" }),
      },
    });

    expect(response).toBe(original);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(credentialRef.current).toEqual(OLD);
    expect(await original.text()).not.toBe("");
  });

  it("refreshes and replays once while cloning headers and preserving request semantics", async () => {
    const controller = new AbortController();
    const originalHeaders = new Headers({
      Authorization: "Bearer account-token",
      "Content-Type": "application/json",
      "X-Custom": "kept",
      [PEGGY_CONVERSATION_ACCESS_HEADER]: OLD.accessToken,
    });
    const body = JSON.stringify({
      conversationId: OLD.id,
      message: "Private question",
    });
    const replay = jsonResponse({ messageId: 900, response: "Bounded answer" });
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(jsonResponse(FRESH))
      .mockResolvedValueOnce(replay);
    const credentialRef = ref();
    const onCredentialChange = vi.fn();

    const response = await peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: {
        method: "POST",
        headers: originalHeaders,
        body,
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      },
      onCredentialChange,
    });

    expect(response).toBe(replay);
    expect(await response.json()).toEqual({
      messageId: 900,
      response: "Bounded answer",
    });
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      CHAT_URL,
      "/api/peggy/conversations/41/access/refresh",
      CHAT_URL,
    ]);

    const originalInit = fetcher.mock.calls[0][1] as RequestInit;
    const refreshInit = fetcher.mock.calls[1][1] as RequestInit;
    const replayInit = fetcher.mock.calls[2][1] as RequestInit;
    expect(originalInit).toMatchObject({
      method: "POST",
      body,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
    expect(refreshInit).toMatchObject({
      method: "POST",
      body: undefined,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
    expect(replayInit).toMatchObject({
      method: "POST",
      body,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
    for (const index of [0, 1]) {
      expect(headersAt(fetcher, index).get("Authorization")).toBe(
        "Bearer account-token",
      );
      expect(headersAt(fetcher, index).get("Content-Type")).toBe(
        "application/json",
      );
      expect(headersAt(fetcher, index).get("X-Custom")).toBe("kept");
      expect(
        headersAt(fetcher, index).get(PEGGY_CONVERSATION_ACCESS_HEADER),
      ).toBe(OLD.accessToken);
    }
    expect(
      headersAt(fetcher, 2).get(PEGGY_CONVERSATION_ACCESS_HEADER),
    ).toBe(FRESH.accessToken);
    expect(originalHeaders.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe(
      OLD.accessToken,
    );
    expect(credentialRef.current).toEqual(FRESH);
    expect(onCredentialChange).toHaveBeenCalledOnce();
    expect(onCredentialChange).toHaveBeenCalledWith(FRESH);
  });

  it.each([201, 204, 299])(
    "rejects unexpected successful refresh status %i without reading or replay",
    async (status) => {
      const unexpectedSuccess = status === 204
        ? new Response(null, { status })
        : jsonResponse(FRESH, status);
      const jsonSpy = vi.spyOn(unexpectedSuccess, "json");
      const fetcher = vi
        .fn()
        .mockResolvedValueOnce(expiredResponse())
        .mockResolvedValueOnce(unexpectedSuccess);
      const credentialRef = ref();
      const onCredentialChange = vi.fn();

      await expect(peggyFetchWithSingleRefresh({
        fetcher,
        credentialRef,
        input: CHAT_URL,
        init: { method: "POST" },
        onCredentialChange,
      })).rejects.toEqual(new Error("Peggy access refresh failed"));
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(jsonSpy).not.toHaveBeenCalled();
      expect(credentialRef.current).toEqual(OLD);
      expect(onCredentialChange).not.toHaveBeenCalled();
    },
  );

  it.each([300, 400, 401, 404, 429, 500, 503])(
    "returns the raw refresh %i response without replacement or replay",
    async (status) => {
      const refreshFailure = jsonResponse({ message: "Refresh failed" }, status);
      const fetcher = vi
        .fn()
        .mockResolvedValueOnce(expiredResponse())
        .mockResolvedValueOnce(refreshFailure);
      const credentialRef = ref();
      const onCredentialChange = vi.fn();

      const response = await peggyFetchWithSingleRefresh({
        fetcher,
        credentialRef,
        input: CHAT_URL,
        init: { method: "POST" },
        onCredentialChange,
      });

      expect(response).toBe(refreshFailure);
      expect(await response.json()).toEqual({ message: "Refresh failed" });
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(credentialRef.current).toEqual(OLD);
      expect(onCredentialChange).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["invalid JSON", new Response("{", { status: 200 })],
    ["null", jsonResponse(null)],
    ["array", jsonResponse([FRESH])],
    ["missing token", jsonResponse({ id: 41 })],
    ["extra key", jsonResponse({ ...FRESH, expiresAt: 1 })],
    ["mismatched id", jsonResponse({ id: 42, accessToken: "other" })],
    ["unsafe id", jsonResponse({ id: Number.MAX_SAFE_INTEGER + 1, accessToken: "other" })],
    ["zero id", jsonResponse({ id: 0, accessToken: "other" })],
    ["blank token", jsonResponse({ id: 41, accessToken: "   " })],
    ["same token", jsonResponse({ id: 41, accessToken: OLD.accessToken })],
    ["non-string token", jsonResponse({ id: 41, accessToken: 7 })],
  ])("fails closed on malformed refresh success: %s", async (_label, malformed) => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(malformed);
    const credentialRef = ref();
    const onCredentialChange = vi.fn();

    await expect(
      peggyFetchWithSingleRefresh({
        fetcher,
        credentialRef,
        input: CHAT_URL,
        init: { method: "POST" },
        onCredentialChange,
      }),
    ).rejects.toEqual(new Error("Peggy access refresh failed"));
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(credentialRef.current).toEqual(OLD);
    expect(onCredentialChange).not.toHaveBeenCalled();
  });

  it("treats a valid replacement token as opaque and trims its boundary whitespace", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(jsonResponse({ id: 41, accessToken: " opaque-no-version " }))
      .mockResolvedValueOnce(jsonResponse({ response: "ok" }));
    const credentialRef = ref();

    await peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { method: "POST" },
    });

    expect(credentialRef.current).toEqual({
      id: 41,
      accessToken: "opaque-no-version",
    });
    expect(
      headersAt(fetcher, 2).get(PEGGY_CONVERSATION_ACCESS_HEADER),
    ).toBe("opaque-no-version");
  });

  it("returns a replayed expiry without recursion", async () => {
    const secondExpiry = expiredResponse();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(jsonResponse(FRESH))
      .mockResolvedValueOnce(secondExpiry);

    const response = await peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef: ref(),
      input: CHAT_URL,
      init: { method: "POST" },
    });

    expect(response).toBe(secondExpiry);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(await response.json()).toMatchObject({
      code: "PEGGY_ACCESS_EXPIRED",
    });
  });

  it("preserves exact transport rejection at original, refresh, and replay", async () => {
    for (const stage of ["original", "refresh", "replay"] as const) {
      const failure = new Error(`${stage} network sentinel`);
      const fetcher = vi.fn();
      if (stage === "original") {
        fetcher.mockRejectedValueOnce(failure);
      } else {
        fetcher.mockResolvedValueOnce(expiredResponse());
        if (stage === "refresh") {
          fetcher.mockRejectedValueOnce(failure);
        } else {
          fetcher
            .mockResolvedValueOnce(jsonResponse(FRESH))
            .mockRejectedValueOnce(failure);
        }
      }
      const credentialRef = ref();
      await expect(peggyFetchWithSingleRefresh({
        fetcher,
        credentialRef,
        input: CHAT_URL,
        init: { method: "POST" },
      })).rejects.toBe(failure);
      expect(fetcher).toHaveBeenCalledTimes(
        stage === "original" ? 1 : stage === "refresh" ? 2 : 3,
      );
      expect(credentialRef.current).toEqual(
        stage === "replay" ? FRESH : OLD,
      );
    }
  });

  it("lets authenticatedRequest add the current bearer and cookie policy to all legs", async () => {
    authState.getSupabaseSync.mockReturnValue({
      auth: { getSession: authState.getSession },
    });
    authState.getSession.mockResolvedValue({
      data: { session: { access_token: "current-account-token" } },
      error: null,
    });
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(jsonResponse(FRESH))
      .mockResolvedValueOnce(jsonResponse({ response: "authenticated replay" }));

    await peggyFetchWithSingleRefresh({
      fetcher: authenticatedRequest,
      credentialRef: ref(),
      input: CHAT_URL,
      init: { method: "POST" },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    for (const [index, expectedToken] of [
      [0, OLD.accessToken],
      [1, OLD.accessToken],
      [2, FRESH.accessToken],
    ] as const) {
      const request = fetchSpy.mock.calls[index][1] as RequestInit;
      expect(request.credentials).toBe("include");
      expect(new Headers(request.headers).get("Authorization")).toBe(
        "Bearer current-account-token",
      );
      expect(new Headers(request.headers).get(
        PEGGY_CONVERSATION_ACCESS_HEADER,
      )).toBe(expectedToken);
    }
    fetchSpy.mockRestore();
  });

  it("never lets a late same-row refresh overwrite another invocation's winner", async () => {
    const refreshes = [deferred<Response>(), deferred<Response>()];
    let originalCount = 0;
    let refreshCount = 0;
    const replayTokens: string[] = [];
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith("/access/refresh")) {
        return refreshes[refreshCount++].promise;
      }
      if (originalCount++ < 2) return expiredResponse();
      replayTokens.push(
        new Headers(init?.headers).get(PEGGY_CONVERSATION_ACCESS_HEADER) || "",
      );
      return jsonResponse({ response: "replayed" });
    });
    const credentialRef = ref();
    const onCredentialChange = vi.fn();

    const first = peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { method: "POST" },
      onCredentialChange,
    });
    const second = peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { method: "POST" },
      onCredentialChange,
    });
    await vi.waitFor(() => expect(refreshCount).toBe(2));

    const winner = { id: 41, accessToken: "winner-from-second" };
    refreshes[1].resolve(jsonResponse(winner));
    await second;
    refreshes[0].resolve(jsonResponse({ id: 41, accessToken: "late-first" }));
    await first;

    expect(credentialRef.current).toEqual(winner);
    expect(onCredentialChange).toHaveBeenCalledOnce();
    expect(onCredentialChange).toHaveBeenCalledWith(winner);
    expect(replayTokens).toEqual([winner.accessToken, winner.accessToken]);
    expect(fetcher).toHaveBeenCalledTimes(6);
  });

  it("returns the original expiry when the conversation changes during refresh", async () => {
    const pendingRefresh = deferred<Response>();
    const original = expiredResponse();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(original)
      .mockImplementationOnce(() => pendingRefresh.promise);
    const credentialRef = ref();
    const onCredentialChange = vi.fn();
    const operation = peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { method: "POST" },
      onCredentialChange,
    });
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    credentialRef.current = { id: 99, accessToken: "new-conversation" };
    pendingRefresh.resolve(jsonResponse(FRESH));

    await expect(operation).resolves.toBe(original);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(credentialRef.current).toEqual({
      id: 99,
      accessToken: "new-conversation",
    });
    expect(onCredentialChange).not.toHaveBeenCalled();
  });

  it("replays with the current same-row token when another invocation already won", async () => {
    const pendingRefresh = deferred<Response>();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockImplementationOnce(() => pendingRefresh.promise)
      .mockResolvedValueOnce(jsonResponse({ response: "winner replay" }));
    const credentialRef = ref();
    const onCredentialChange = vi.fn();
    const operation = peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { method: "POST" },
      onCredentialChange,
    });
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    credentialRef.current = { id: 41, accessToken: "already-won" };
    pendingRefresh.resolve(jsonResponse({ id: 41, accessToken: "late-result" }));

    await operation;
    expect(credentialRef.current).toEqual({ id: 41, accessToken: "already-won" });
    expect(onCredentialChange).not.toHaveBeenCalled();
    expect(
      headersAt(fetcher, 2).get(PEGGY_CONVERSATION_ACCESS_HEADER),
    ).toBe("already-won");
  });

  it("rechecks the ref after the credential callback before replay", async () => {
    const original = expiredResponse();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(original)
      .mockResolvedValueOnce(jsonResponse(FRESH));
    const credentialRef = ref();

    const response = await peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { method: "POST" },
      onCredentialChange: () => {
        credentialRef.current = { id: 99, accessToken: "replacement-row" };
      },
    });

    expect(response).toBe(original);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(credentialRef.current).toEqual({
      id: 99,
      accessToken: "replacement-row",
    });
  });

  it("preserves an already-aborted reason without calling transport", async () => {
    const controller = new AbortController();
    const reason = new DOMException("cancelled before original", "AbortError");
    controller.abort(reason);
    const fetcher = vi.fn();
    const credentialRef = ref();

    await expect(peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { signal: controller.signal },
    })).rejects.toBe(reason);
    expect(fetcher).not.toHaveBeenCalled();
    expect(credentialRef.current).toEqual(OLD);
  });

  it("checks abort after original and expiry-clone awaits", async () => {
    const originalPending = deferred<Response>();
    const firstController = new AbortController();
    const firstReason = new DOMException("after original", "AbortError");
    const firstFetcher = vi.fn(() => originalPending.promise);
    const firstRef = ref();
    const first = peggyFetchWithSingleRefresh({
      fetcher: firstFetcher,
      credentialRef: firstRef,
      input: CHAT_URL,
      init: { signal: firstController.signal },
    });
    firstController.abort(firstReason);
    originalPending.resolve(expiredResponse());
    await expect(first).rejects.toBe(firstReason);
    expect(firstFetcher).toHaveBeenCalledTimes(1);
    expect(firstRef.current).toEqual(OLD);

    const clonePending = deferred<unknown>();
    const cloneResponse = expiredResponse();
    vi.spyOn(cloneResponse, "clone").mockReturnValue({
      json: () => clonePending.promise,
    } as Response);
    const secondController = new AbortController();
    const secondReason = new DOMException("after clone", "AbortError");
    const secondFetcher = vi.fn().mockResolvedValueOnce(cloneResponse);
    const secondRef = ref();
    const second = peggyFetchWithSingleRefresh({
      fetcher: secondFetcher,
      credentialRef: secondRef,
      input: CHAT_URL,
      init: { signal: secondController.signal },
    });
    await vi.waitFor(() => expect(cloneResponse.clone).toHaveBeenCalledOnce());
    secondController.abort(secondReason);
    clonePending.resolve({ code: "PEGGY_ACCESS_EXPIRED" });
    await expect(second).rejects.toBe(secondReason);
    expect(secondFetcher).toHaveBeenCalledTimes(1);
    expect(secondRef.current).toEqual(OLD);
  });

  it("checks abort after refresh fetch/JSON, callback, and replay fetch", async () => {
    const refreshPending = deferred<Response>();
    const refreshController = new AbortController();
    const refreshReason = new DOMException("after refresh", "AbortError");
    const refreshFetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockImplementationOnce(() => refreshPending.promise);
    const refreshRef = ref();
    const refreshOperation = peggyFetchWithSingleRefresh({
      fetcher: refreshFetcher,
      credentialRef: refreshRef,
      input: CHAT_URL,
      init: { signal: refreshController.signal },
    });
    await vi.waitFor(() => expect(refreshFetcher).toHaveBeenCalledTimes(2));
    refreshController.abort(refreshReason);
    refreshPending.resolve(jsonResponse(FRESH));
    await expect(refreshOperation).rejects.toBe(refreshReason);
    expect(refreshFetcher).toHaveBeenCalledTimes(2);
    expect(refreshRef.current).toEqual(OLD);

    const jsonPending = deferred<unknown>();
    const refreshResponse = jsonResponse(FRESH);
    vi.spyOn(refreshResponse, "json").mockImplementation(() => jsonPending.promise);
    const jsonController = new AbortController();
    const jsonReason = new DOMException("after refresh json", "AbortError");
    const jsonFetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(refreshResponse);
    const jsonRef = ref();
    const jsonOperation = peggyFetchWithSingleRefresh({
      fetcher: jsonFetcher,
      credentialRef: jsonRef,
      input: CHAT_URL,
      init: { signal: jsonController.signal },
    });
    await vi.waitFor(() => expect(refreshResponse.json).toHaveBeenCalledOnce());
    jsonController.abort(jsonReason);
    jsonPending.resolve(FRESH);
    await expect(jsonOperation).rejects.toBe(jsonReason);
    expect(jsonFetcher).toHaveBeenCalledTimes(2);
    expect(jsonRef.current).toEqual(OLD);

    const callbackController = new AbortController();
    const callbackReason = new DOMException("inside callback", "AbortError");
    const callbackFetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(jsonResponse(FRESH));
    const callbackRef = ref();
    await expect(peggyFetchWithSingleRefresh({
      fetcher: callbackFetcher,
      credentialRef: callbackRef,
      input: CHAT_URL,
      init: { signal: callbackController.signal },
      onCredentialChange: () => callbackController.abort(callbackReason),
    })).rejects.toBe(callbackReason);
    expect(callbackFetcher).toHaveBeenCalledTimes(2);
    expect(callbackRef.current).toEqual(FRESH);

    const replayPending = deferred<Response>();
    const replayController = new AbortController();
    const replayReason = new DOMException("after replay", "AbortError");
    const replayFetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(jsonResponse(FRESH))
      .mockImplementationOnce(() => replayPending.promise);
    const replayRef = ref();
    const replayOperation = peggyFetchWithSingleRefresh({
      fetcher: replayFetcher,
      credentialRef: replayRef,
      input: CHAT_URL,
      init: { signal: replayController.signal },
    });
    await vi.waitFor(() => expect(replayFetcher).toHaveBeenCalledTimes(3));
    replayController.abort(replayReason);
    replayPending.resolve(jsonResponse({ response: "late" }));
    await expect(replayOperation).rejects.toBe(replayReason);
    expect(replayFetcher).toHaveBeenCalledTimes(3);
    expect(replayRef.current).toEqual(FRESH);
  });

  it("keeps concurrent AbortSignals independent", async () => {
    const firstRefresh = deferred<Response>();
    const secondRefresh = deferred<Response>();
    const firstController = new AbortController();
    const secondController = new AbortController();
    let refreshCount = 0;
    const fetcher: PeggyFetchTransport = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).endsWith("/access/refresh")) {
          refreshCount += 1;
          return refreshCount === 1
            ? firstRefresh.promise
            : secondRefresh.promise;
        }
        const token = new Headers(init?.headers).get(
          PEGGY_CONVERSATION_ACCESS_HEADER,
        );
        return token === OLD.accessToken
          ? expiredResponse()
          : jsonResponse({ response: "second survived" });
      },
    );
    const credentialRef = ref();
    const first = peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { signal: firstController.signal },
    });
    const second = peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { signal: secondController.signal },
    });
    await vi.waitFor(() => expect(refreshCount).toBe(2));
    const firstReason = new DOMException("only first", "AbortError");
    firstController.abort(firstReason);
    firstRefresh.resolve(jsonResponse({ id: 41, accessToken: "aborted-result" }));
    secondRefresh.resolve(jsonResponse(FRESH));

    await expect(first).rejects.toBe(firstReason);
    await expect(second).resolves.toBeInstanceOf(Response);
    expect(firstController.signal.aborted).toBe(true);
    expect(secondController.signal.aborted).toBe(false);
    expect(credentialRef.current).toEqual(FRESH);
    const calls = (fetcher as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.filter(([, init]) =>
      (init as RequestInit | undefined)?.signal === firstController.signal,
    )).toHaveLength(2);
    expect(calls.filter(([, init]) =>
      (init as RequestInit | undefined)?.signal === secondController.signal,
    )).toHaveLength(3);
  });
});
