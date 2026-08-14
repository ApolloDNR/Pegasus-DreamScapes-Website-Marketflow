/**
 * Peggy — handoff directive parsing + next-step action buttons (Task #179).
 *
 * Peggy embeds an inline [[HANDOFF]]{...}[[/HANDOFF]] directive in the
 * assistant stream to decide which next-step CTA to surface. `splitHandoff`
 * parses that directive and strips it from the visible prose; the component
 * then renders either "Open Strategy Lab" or "Start my Review" once streaming
 * finishes. This guards the path from a Peggy chat into a captured lead.
 */
import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { Peggy, splitHandoff } from "@/pegasus/peggy";
import { PEGGY_CONVERSATION_ACCESS_HEADER } from "@shared/peggy-access";

describe("splitHandoff", () => {
  it("extracts a strategylab action and strips the directive from the prose", () => {
    const raw =
      'Let me point you to the lab. [[HANDOFF]]{"action":"strategylab"}[[/HANDOFF]]';
    const { text, action } = splitHandoff(raw);
    expect(action).toEqual({ action: "strategylab" });
    expect(text).toBe("Let me point you to the lab.");
    expect(text).not.toContain("HANDOFF");
  });

  it("extracts a review action with its fields and strips the directive", () => {
    const raw =
      'I will get a person on this. [[HANDOFF]]{"action":"review","role":"seller","area":"East Bay","situation":"probate"}[[/HANDOFF]] trailing';
    const { text, action } = splitHandoff(raw);
    expect(action).toEqual({
      action: "review",
      role: "seller",
      area: "East Bay",
      situation: "probate",
    });
    expect(text).toBe("I will get a person on this.");
    expect(text).not.toContain("HANDOFF");
  });

  it("returns no action for plain prose with no directive", () => {
    const { text, action } = splitHandoff("Just a normal answer.");
    expect(action).toBeNull();
    expect(text).toBe("Just a normal answer.");
  });

  it("ignores an unknown action type but still strips the directive", () => {
    const { text, action } = splitHandoff(
      'Hmm. [[HANDOFF]]{"action":"explode"}[[/HANDOFF]]',
    );
    expect(action).toBeNull();
    expect(text).toBe("Hmm.");
  });

  it("returns no action for malformed JSON inside the directive", () => {
    const { text, action } = splitHandoff(
      "oops [[HANDOFF]]{not json}[[/HANDOFF]]",
    );
    expect(action).toBeNull();
    expect(text).toBe("oops");
  });

  it("hides a still-streaming partial directive from the visible text", () => {
    const raw = 'Here is my read. [[HANDOFF]]{"action":"rev';
    const { text, action } = splitHandoff(raw);
    // The closing marker has not arrived yet, so no action is parsed and the
    // half-written directive must never flash on screen.
    expect(action).toBeNull();
    expect(text).toBe("Here is my read.");
    expect(text).not.toContain("HANDOFF");
  });
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    statusText: status === 200 ? "OK" : "Injected failure",
    headers: { "Content-Type": "application/json" },
  });
}

function renderPeggy() {
  const setOpen = vi.fn();
  const toStrategyLab = vi.fn();
  const onHandoffToReview = vi.fn();
  const go = vi.fn();
  const toSubmit = vi.fn();
  render(
    <Peggy
      open={true}
      setOpen={setOpen}
      toStrategyLab={toStrategyLab}
      onHandoffToReview={onHandoffToReview}
      go={go}
      toSubmit={toSubmit}
    />,
  );
  return { setOpen, toStrategyLab, onHandoffToReview, go, toSubmit };
}

async function sendMessage(text: string) {
  fireEvent.change(screen.getByLabelText("Talk to Peggy"), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  // Streaming begins: the input is disabled until the reply resolves.
  await waitFor(() =>
    expect(screen.getByLabelText("Talk to Peggy")).toBeDisabled(),
  );
}

describe("Peggy — handoff action buttons", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the Strategy Lab CTA only after streaming, then routes to the lab", async () => {
    const chat = deferred<Response>();
    const fetchMock = vi.fn((url: RequestInfo | URL) => {
      if (String(url).includes("/conversations")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 1, accessToken: "v1.test-token" }),
        } as unknown as Response);
      }
      return chat.promise;
    });
    vi.stubGlobal("fetch", fetchMock);

    const { toStrategyLab, setOpen } = renderPeggy();
    await sendMessage("model these numbers for me");

    // While the reply is still streaming, no handoff CTA is shown.
    expect(
      screen.queryByRole("button", { name: /Open Strategy Lab/ }),
    ).toBeNull();

    chat.resolve({
      ok: true,
      json: async () => ({
        response:
          'Run the numbers yourself. [[HANDOFF]]{"action":"strategylab"}[[/HANDOFF]]',
      }),
    } as unknown as Response);

    const cta = await screen.findByRole("button", {
      name: /Open Strategy Lab/,
    });
    fireEvent.click(cta);
    expect(toStrategyLab).toHaveBeenCalledTimes(1);
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("renders the Review CTA only after streaming, then opens the review handoff", async () => {
    const chat = deferred<Response>();
    const fetchMock = vi.fn((url: RequestInfo | URL) => {
      if (String(url).includes("/conversations")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 7, accessToken: "v1.test-token" }),
        } as unknown as Response);
      }
      return chat.promise;
    });
    vi.stubGlobal("fetch", fetchMock);

    const { onHandoffToReview, setOpen } = renderPeggy();
    await sendMessage("I have a probate property in the East Bay");

    expect(screen.queryByRole("button", { name: /Start my Review/ })).toBeNull();

    chat.resolve({
      ok: true,
      json: async () => ({
        response:
          'A person should look at this. [[HANDOFF]]{"action":"review","role":"seller","area":"East Bay","situation":"probate"}[[/HANDOFF]]',
      }),
    } as unknown as Response);

    const cta = await screen.findByRole("button", { name: /Start my Review/ });
    fireEvent.click(cta);
    expect(onHandoffToReview).toHaveBeenCalledTimes(1);
    expect(onHandoffToReview).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "seller",
        third: "East Bay",
        message: "probate",
      }),
    );
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("uses raw fetch for one bounded refresh/replay without a duplicate visual turn", async () => {
    const replay = deferred<Response>();
    let chatCount = 0;
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/peggy/conversations") {
        return Promise.resolve(jsonResponse({
          id: 31,
          accessToken: "opaque-canonical-old",
        }));
      }
      if (url === "/api/peggy/conversations/31/access/refresh") {
        return Promise.resolve(jsonResponse({
          id: 31,
          accessToken: "opaque-canonical-fresh",
        }));
      }
      if (url === "/api/peggy/chat") {
        chatCount += 1;
        return chatCount === 1
          ? Promise.resolve(jsonResponse({
              message: "Conversation access expired",
              code: "PEGGY_ACCESS_EXPIRED",
            }, 401))
          : replay.promise;
      }
      throw new Error(`Unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    renderPeggy();
    await sendMessage("refresh this one visual turn");
    expect(screen.getAllByText("refresh this one visual turn")).toHaveLength(1);

    await waitFor(() => {
      expect(fetchMock.mock.calls.filter(([input]) =>
        String(input).endsWith("/access/refresh"),
      )).toHaveLength(1);
      expect(fetchMock.mock.calls.filter(([input]) =>
        String(input) === "/api/peggy/chat",
      )).toHaveLength(2);
    });

    const refreshCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).endsWith("/access/refresh"),
    );
    const chatCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input) === "/api/peggy/chat",
    );
    expect(refreshCalls).toHaveLength(1);
    expect(chatCalls).toHaveLength(2);
    const originalInit = chatCalls[0][1] as RequestInit;
    const refreshInit = refreshCalls[0][1] as RequestInit;
    const replayInit = chatCalls[1][1] as RequestInit;
    expect(originalInit.signal).toBeInstanceOf(AbortSignal);
    expect(refreshInit.signal).toBe(originalInit.signal);
    expect(replayInit.signal).toBe(originalInit.signal);
    expect(refreshInit.method).toBe("POST");
    expect(refreshInit.body).toBeUndefined();
    expect(originalInit.credentials).toBeUndefined();
    expect(refreshInit.credentials).toBeUndefined();
    expect(replayInit.credentials).toBeUndefined();
    expect(new Headers(originalInit.headers).get(
      PEGGY_CONVERSATION_ACCESS_HEADER,
    )).toBe("opaque-canonical-old");
    expect(new Headers(refreshInit.headers).get(
      PEGGY_CONVERSATION_ACCESS_HEADER,
    )).toBe("opaque-canonical-old");
    expect(new Headers(replayInit.headers).get(
      PEGGY_CONVERSATION_ACCESS_HEADER,
    )).toBe("opaque-canonical-fresh");
    expect(new Headers(originalInit.headers).get("Authorization")).toBeNull();
    expect(new Headers(refreshInit.headers).get("Authorization")).toBeNull();

    replay.resolve(jsonResponse({
      response:
        'Refreshed once. [[HANDOFF]]{"action":"strategylab"}[[/HANDOFF]]',
    }));
    expect(await screen.findByText("Refreshed once.")).toBeVisible();
    expect(screen.getAllByText("refresh this one visual turn")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /Open Strategy Lab/ })).toBeVisible();
  });

  it.each([
    ["raw 404", () => jsonResponse({ message: "Conversation not found" }, 404)],
    ["valid DTO with unexpected 201", () => jsonResponse({
      id: 32,
      accessToken: "must-not-install",
    }, 201)],
    ["empty unexpected 204", () => new Response(null, { status: 204 })],
  ] as const)("renders the existing error fallback after %s without replay", async (
    _label,
    refreshResponse,
  ) => {
    const refresh = deferred<Response>();
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/peggy/conversations") {
        return Promise.resolve(jsonResponse({ id: 32, accessToken: "opaque-old" }));
      }
      if (url === "/api/peggy/chat") {
        return Promise.resolve(jsonResponse({
          message: "Conversation access expired",
          code: "PEGGY_ACCESS_EXPIRED",
        }, 401));
      }
      if (url === "/api/peggy/conversations/32/access/refresh") {
        return refresh.promise;
      }
      throw new Error(`Unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    renderPeggy();
    await sendMessage("fail closed once");
    refresh.resolve(refreshResponse());

    expect(await screen.findByText(/I can.t reach my brain at the moment/)).toBeVisible();
    expect(screen.getByRole("button", { name: /Start a Review/ })).toBeVisible();
    expect(fetchMock.mock.calls.filter(([input]) =>
      String(input) === "/api/peggy/chat",
    )).toHaveLength(1);
    expect(fetchMock.mock.calls.filter(([input]) =>
      String(input).endsWith("/access/refresh"),
    )).toHaveLength(1);
    expect(screen.getAllByText("fail closed once")).toHaveLength(1);
  });
});
