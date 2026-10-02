import React, { StrictMode, useState } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const boundary = vi.hoisted(() => ({
  context: null as any,
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    isAuthenticated: true,
    isAdmin: false,
    isDreamscaper: false,
    isInvestor: true,
    isWholesaler: false,
    isBuyer: false,
  }),
}));

import {
  default as PeggyContext,
  PeggyProvider,
  usePeggyContext,
  type PeggyContextData,
} from "@/contexts/peggy-context";
import PeggyDock from "@/components/peggy-dock";
import PeggyChatBubble, { AskPeggyButton } from "@/components/peggy-chat";
import { Peggy } from "@/pegasus/peggy";
import { PEGGY_CONVERSATION_ACCESS_HEADER } from "@shared/peggy-access";

type Deferred<T> = {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error: unknown): void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    statusText: status === 200 ? "OK" : "Injected failure",
    headers: { "Content-Type": "application/json" },
  });
}
function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const memory = memoryLocation({ path: "/calculator/roi" });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Router hook={memory.hook}>{children}</Router>
    </QueryClientProvider>
  );
  return { ...render(ui, { wrapper: Wrapper }), queryClient };
}

function fakeContext(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, any> {
  const result: Record<string, any> = {
    context: { page: "home", userRole: "member" },
    isOpen: false,
    pendingPrompt: null,
    openChat: vi.fn(),
    closeChat: vi.fn(),
    toggleChat: vi.fn(),
    updateContext: vi.fn(),
    setCalculatorData: vi.fn(),
    setDealContext: vi.fn(),
    setPendingPrompt: vi.fn(),
    consumePendingPrompt: vi.fn(() => {
      const prompt = boundary.context.pendingPrompt;
      boundary.context = { ...boundary.context, pendingPrompt: null };
      return prompt;
    }),
    clearContext: vi.fn(),
    ...overrides,
  };
  boundary.context = result;
  return result;
}

function fakePeggyTree(ui: React.ReactElement) {
  return (
    <PeggyContext.Provider value={boundary.context}>
      {ui}
    </PeggyContext.Provider>
  );
}

let fetchMock: ReturnType<typeof vi.fn>;

function callsFor(url: string) {
  return fetchMock.mock.calls.filter(([input]) => String(input) === url);
}

function capturedRequest(url: string, index = 0) {
  const call = callsFor(url)[index];
  if (!call) throw new Error(`Missing captured request ${url} #${index}`);
  const init = (call[1] ?? {}) as RequestInit;
  return {
    method: init.method,
    credentials: init.credentials,
    headers: new Headers(init.headers),
    body: init.body === undefined ? undefined : JSON.parse(String(init.body)),
  };
}

function storedKeys(): Array<string | null> {
  return Array.from(
    { length: window.localStorage.length },
    (_, index) => window.localStorage.key(index),
  );
}

let consoleError: ReturnType<typeof vi.spyOn>;
let unhandled: unknown[];
let onUnhandled: (event: PromiseRejectionEvent) => void;

beforeEach(() => {
  boundary.context = null;
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  window.localStorage.clear();
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => undefined;
  }
  consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
  unhandled = [];
  onUnhandled = (event) => {
    unhandled.push(event.reason);
    event.preventDefault();
  };
  window.addEventListener("unhandledrejection", onUnhandled);
});

afterEach(async () => {
  await Promise.resolve();
  expect(unhandled).toEqual([]);
  expect(consoleError).not.toHaveBeenCalled();
  window.removeEventListener("unhandledrejection", onUnhandled);
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("PeggyProvider legacy identity cleanup", () => {
  function Probe() {
    const value = usePeggyContext() as unknown as Record<string, unknown>;
    return <output data-testid="context-keys">{Object.keys(value).sort().join(",")}</output>;
  }

  it("purges only the obsolete key once per real StrictMode mount", async () => {
    localStorage.setItem("peggy_session_id", "captured-browser-id");
    localStorage.setItem("pegasus.lab.sessionId", "keep-lab-session");
    localStorage.setItem("pegasus.strategy-lab.v3", "keep-lab-draft");
    localStorage.setItem("pg:saved:chats", "[]");
    localStorage.setItem("peggy_dock_position", "{\"x\":1,\"y\":2}");
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const removeItem = vi.spyOn(Storage.prototype, "removeItem");

    const view = renderWithClient(
      <StrictMode>
        <PeggyProvider><Probe /></PeggyProvider>
      </StrictMode>,
    );
    view.rerender(
      <StrictMode>
        <PeggyProvider><Probe /></PeggyProvider>
      </StrictMode>,
    );

    await waitFor(() =>
      expect(removeItem).toHaveBeenCalledWith("peggy_session_id"),
    );
    expect(
      removeItem.mock.calls.filter(([key]) => key === "peggy_session_id"),
    ).toHaveLength(1);
    expect(storedKeys()).not.toContain("peggy_session_id");
    expect(storedKeys()).toEqual(expect.arrayContaining([
      "pegasus.lab.sessionId",
      "pegasus.strategy-lab.v3",
      "pg:saved:chats",
      "peggy_dock_position",
    ]));
    expect(
      getItem.mock.calls.filter(([key]) => key === "peggy_session_id"),
    ).toHaveLength(0);
    expect(
      setItem.mock.calls.filter(([key]) => key === "peggy_session_id"),
    ).toHaveLength(0);
    expect(screen.getByTestId("context-keys").textContent).not.toMatch(/sessionId/);
  });

  it("still renders when browser storage removal throws", async () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    renderWithClient(<PeggyProvider><Probe /></PeggyProvider>);
    expect(await screen.findByTestId("context-keys")).toBeVisible();
  });
});

function PeggyController() {
  const {
    context,
    isOpen,
    pendingPrompt,
    openChat,
    closeChat,
    updateContext,
    setCalculatorData,
    setPendingPrompt,
  } = usePeggyContext();

  return (
    <div>
      <button
        type="button"
        data-testid="controller-stage-latest-and-open"
        onClick={() => {
          setCalculatorData(
            "roi",
            { purchasePrice: 300_000 },
            { roi: 12.5 },
          );
          updateContext({ surface: "latest-calculator-snapshot" });
          setPendingPrompt("Analyze this pending result");
          openChat();
        }}
      >
        Stage latest and open
      </button>
      <button type="button" data-testid="controller-open" onClick={openChat}>
        Open
      </button>
      <button type="button" data-testid="controller-close" onClick={closeChat}>
        Close
      </button>
      <output data-testid="controller-state">
        {JSON.stringify({ context, isOpen, pendingPrompt })}
      </output>
    </div>
  );
}

function readControllerState(): {
  context: PeggyContextData;
  isOpen: boolean;
  pendingPrompt: string | null;
} {
  return JSON.parse(screen.getByTestId("controller-state").textContent || "{}");
}

function realProviderDock() {
  return (
    <PeggyProvider>
      <PeggyController />
      <PeggyDock />
    </PeggyProvider>
  );
}

describe("PeggyDock real-provider single-flight integration", () => {
  beforeEach(() => {
    boundary.context = null;
  });

  it("coalesces real latest-context, prompt, open, and close/reopen transitions", async () => {
    const create = deferred<Response>();
    fetchMock.mockImplementation(
      (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/peggy/suggestions") {
          return Promise.resolve(jsonResponse({ suggestions: [] }));
        }
        if (url === "/api/peggy/conversations") return create.promise;
        if (url === "/api/peggy/chat") {
          return Promise.resolve(jsonResponse({
            messageId: 71,
            response: "Pending prompt reply",
          }));
        }
        throw new Error(`Unexpected URL ${url}`);
      },
    );
    const view = renderWithClient(realProviderDock());
    await waitFor(() => expect(readControllerState()).toEqual({
      context: { page: "calculator-roi", userRole: "investor" },
      isOpen: false,
      pendingPrompt: null,
    }));

    act(() => {
      fireEvent.click(screen.getByTestId("controller-stage-latest-and-open"));
    });
    const latestContext = {
      page: "calculator-roi",
      userRole: "investor",
      calculatorType: "roi",
      calculatorInputs: { purchasePrice: 300_000 },
      calculatorResults: { roi: 12.5 },
      surface: "latest-calculator-snapshot",
    };
    await waitFor(() => expect(readControllerState()).toEqual({
      context: latestContext,
      isOpen: true,
      pendingPrompt: "Analyze this pending result",
    }));
    await waitFor(() =>
      expect(callsFor("/api/peggy/conversations")).toHaveLength(1),
    );
    const createRequest = capturedRequest("/api/peggy/conversations");
    expect(createRequest.method).toBe("POST");
    expect(createRequest.credentials).toBe("include");
    expect(createRequest.headers.get("content-type")).toBe("application/json");
    expect(createRequest.headers.get("authorization")).toBeNull();
    expect(createRequest.body).toEqual({ context: latestContext });
    expect(callsFor("/api/peggy/chat")).toHaveLength(0);

    fireEvent.click(screen.getByTestId("controller-close"));
    await waitFor(() => expect(readControllerState()).toEqual({
      context: latestContext,
      isOpen: false,
      pendingPrompt: "Analyze this pending result",
    }));
    fireEvent.click(screen.getByTestId("controller-open"));
    await waitFor(() => expect(readControllerState()).toEqual({
      context: latestContext,
      isOpen: true,
      pendingPrompt: "Analyze this pending result",
    }));
    expect(callsFor("/api/peggy/conversations")).toHaveLength(1);

    await act(async () => {
      create.resolve(jsonResponse({ id: 71, accessToken: "v1.pending-token" }));
      await create.promise;
    });
    await waitFor(() => expect(callsFor("/api/peggy/chat")).toHaveLength(1));
    const promptRequest = capturedRequest("/api/peggy/chat");
    expect(promptRequest.method).toBe("POST");
    expect(promptRequest.credentials).toBe("include");
    expect(promptRequest.headers.get("content-type")).toBe("application/json");
    expect(promptRequest.headers.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe(
      "v1.pending-token",
    );
    expect(promptRequest.headers.get("authorization")).toBeNull();
    expect(promptRequest.body).toEqual({
        conversationId: 71,
        message: "Analyze this pending result",
        context: latestContext,
    });
    await waitFor(() => expect(readControllerState()).toEqual({
      context: latestContext,
      isOpen: true,
      pendingPrompt: null,
    }));
    view.rerender(realProviderDock());
    await act(async () => {
      await Promise.resolve();
    });
    expect(callsFor("/api/peggy/conversations")).toHaveLength(1);
    expect(callsFor("/api/peggy/chat")).toHaveLength(1);
  });

  it("resets the real provider boundary after rejection so close/open retries once", async () => {
    const first = deferred<Response>();
    const retry = deferred<Response>();
    let createCount = 0;
    fetchMock.mockImplementation(
      (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/peggy/conversations") {
          createCount += 1;
          return createCount === 1 ? first.promise : retry.promise;
        }
        throw new Error(`Unexpected URL ${url}`);
      },
    );
    renderWithClient(realProviderDock());
    await waitFor(() => expect(readControllerState()).toEqual({
      context: { page: "calculator-roi", userRole: "investor" },
      isOpen: false,
      pendingPrompt: null,
    }));
    fireEvent.click(screen.getByTestId("controller-open"));
    await waitFor(() =>
      expect(callsFor("/api/peggy/conversations")).toHaveLength(1),
    );

    await act(async () => {
      first.resolve(jsonResponse(
        { message: "injected create rejection" },
        500,
      ));
      await first.promise;
      await Promise.resolve();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(callsFor("/api/peggy/conversations")).toHaveLength(1);
    expect(readControllerState().isOpen).toBe(true);
    fireEvent.click(screen.getByTestId("controller-close"));
    await waitFor(() => expect(readControllerState().isOpen).toBe(false));
    fireEvent.click(screen.getByTestId("controller-open"));
    await waitFor(() =>
      expect(callsFor("/api/peggy/conversations")).toHaveLength(2),
    );
    for (const index of [0, 1]) {
      const request = capturedRequest("/api/peggy/conversations", index);
      expect(request.method).toBe("POST");
      expect(request.credentials).toBe("include");
      expect(request.body).toEqual({
        context: { page: "calculator-roi", userRole: "investor" },
      });
    }
    await act(async () => {
      retry.resolve(jsonResponse({ id: 81, accessToken: "v1.retry-token" }));
      await retry.promise;
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(callsFor("/api/peggy/conversations")).toHaveLength(2);
  });
});

type AccessSurface = "Dock" | "dormant";

async function renderAccessSurface(surface: AccessSurface) {
  fakeContext({
    isOpen: true,
    context: { page: "home", surface: `refresh-${surface.toLowerCase()}` },
  });
  renderWithClient(fakePeggyTree(
    surface === "Dock" ? <PeggyDock /> : <PeggyChatBubble />,
  ));
  await waitFor(() =>
    expect(callsFor("/api/peggy/conversations")).toHaveLength(1),
  );
  if (surface === "Dock") {
    fireEvent.click(screen.getByTestId("button-peggy-dock"));
  }
  await waitFor(() =>
    expect(screen.getByTestId("input-peggy-message")).toBeEnabled(),
  );
}

async function sendAccessSurfaceMessage(message: string, reply: string) {
  fireEvent.change(screen.getByTestId("input-peggy-message"), {
    target: { value: message },
  });
  fireEvent.click(screen.getByTestId("button-peggy-send"));
  await waitFor(() => expect(screen.getByText(reply)).toBeVisible());
}
describe("PeggyDock focused control boundary", () => {
  it("discloses storage and AI-provider processing beside the authenticated send control", async () => {
    fakeContext({ isOpen: true });
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/peggy/suggestions") {
        return Promise.resolve(jsonResponse({ suggestions: [] }));
      }
      if (url === "/api/peggy/conversations") {
        return Promise.resolve(jsonResponse({ id: 12, accessToken: "v1.disclosure" }));
      }
      throw new Error(`Unexpected URL ${url}`);
    });

    renderWithClient(fakePeggyTree(<PeggyDock />));
    await waitFor(() => expect(callsFor("/api/peggy/conversations")).toHaveLength(1));
    fireEvent.click(screen.getByTestId("button-peggy-dock"));

    const disclosure = await screen.findByText(
      /your message is stored and processed by an ai service/i,
    );
    await waitFor(() => expect(disclosure).toBeVisible());
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(screen.getByTestId("peggy-dock-send-disclosure")).toHaveClass(
      "text-[11px]",
      "text-foreground/80",
    );
  });

  it("serializes double New, blocks same-stack old-token chat, then scopes chat to token two", async () => {
    const replacement = deferred<Response>();
    const chat = deferred<Response>();
    let createCount = 0;
    fetchMock.mockImplementation(
      (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/peggy/suggestions") {
          return Promise.resolve(jsonResponse({ suggestions: [] }));
        }
        if (url === "/api/peggy/conversations") {
          createCount += 1;
          return createCount === 1
            ? Promise.resolve(jsonResponse({ id: 91, accessToken: "v1.token-one" }))
            : replacement.promise;
        }
        if (url === "/api/peggy/chat") return chat.promise;
        throw new Error(`Unexpected URL ${url}`);
      },
    );
    fakeContext({
      isOpen: true,
      context: { page: "home", surface: "legacy-dock" },
    });
    renderWithClient(fakePeggyTree(<PeggyDock />));
    await waitFor(() => expect(callsFor("/api/peggy/conversations")).toHaveLength(1));
    fireEvent.click(screen.getByTestId("button-peggy-dock"));
    const input = await screen.findByTestId("input-peggy-message");
    await waitFor(() => expect(input).toBeEnabled());
    fireEvent.change(input, { target: { value: "must not use token one" } });
    const newButton = screen.getByTestId("button-peggy-new");
    expect(newButton).toBeEnabled();
    const form = input.closest("form");
    expect(form).not.toBeNull();
    act(() => {
      fireEvent.click(newButton);
      fireEvent.click(newButton);
      fireEvent.submit(form!);
    });
    await waitFor(() =>
      expect(callsFor("/api/peggy/conversations")).toHaveLength(2),
    );
    const replacementRequest = capturedRequest("/api/peggy/conversations", 1);
    expect(replacementRequest.method).toBe("POST");
    expect(replacementRequest.credentials).toBe("include");
    expect(replacementRequest.body).toEqual({
      context: { page: "home", surface: "legacy-dock" },
    });
    expect(callsFor("/api/peggy/chat")).toHaveLength(0);
    expect(screen.getByTestId("button-peggy-new")).toBeDisabled();
    expect(screen.getByTestId("input-peggy-message")).toBeDisabled();

    await act(async () => {
      replacement.resolve(jsonResponse({ id: 92, accessToken: "v1.token-two" }));
      await replacement.promise;
    });
    await waitFor(() => expect(screen.getByTestId("input-peggy-message")).toBeEnabled());
    fireEvent.change(screen.getByTestId("input-peggy-message"), {
      target: { value: "use the replacement only" },
    });
    fireEvent.click(screen.getByTestId("button-peggy-send"));
    await waitFor(() => expect(callsFor("/api/peggy/chat")).toHaveLength(1));
    const chatRequest = capturedRequest("/api/peggy/chat");
    expect(chatRequest.method).toBe("POST");
    expect(chatRequest.credentials).toBe("include");
    expect(chatRequest.headers.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe(
      "v1.token-two",
    );
    expect(chatRequest.body).toEqual({
        conversationId: 92,
        message: "use the replacement only",
        context: { page: "home", surface: "legacy-dock" },
    });
    expect(screen.getByTestId("button-peggy-new")).toBeDisabled();
    await act(async () => {
      chat.resolve(jsonResponse({ messageId: 93, response: "Replacement reply" }));
      await chat.promise;
    });
    await waitFor(() => expect(screen.getByTestId("button-peggy-new")).toBeEnabled());
  });
});
describe("compiled dormant Peggy transport", () => {
  it("retries rejected create and serializes dormant double New", async () => {
    const replacement = deferred<Response>();
    const chat = deferred<Response>();
    let createCount = 0;
    fetchMock.mockImplementation(
      (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/peggy/suggestions") {
          return Promise.resolve(jsonResponse({ suggestions: [] }));
        }
        if (url === "/api/peggy/conversations") {
          createCount += 1;
          if (createCount === 1) {
            return Promise.reject(new Error("dormant create rejection"));
          }
          if (createCount === 2) {
            return Promise.resolve(jsonResponse({ id: 101, accessToken: "v1.dormant-one" }));
          }
          return replacement.promise;
        }
        if (url === "/api/peggy/chat") return chat.promise;
        throw new Error(`Unexpected URL ${url}`);
      },
    );
    fakeContext({
      isOpen: true,
      context: { page: "home", surface: "dormant-bubble" },
    });
    const view = renderWithClient(fakePeggyTree(<PeggyChatBubble />));
    await waitFor(() => expect(callsFor("/api/peggy/conversations")).toHaveLength(1));
    boundary.context = { ...boundary.context, isOpen: false };
    view.rerender(fakePeggyTree(<PeggyChatBubble />));
    boundary.context = { ...boundary.context, isOpen: true };
    view.rerender(fakePeggyTree(<PeggyChatBubble />));
    await waitFor(() => expect(callsFor("/api/peggy/conversations")).toHaveLength(2));
    await waitFor(() => expect(screen.getByTestId("input-peggy-message")).toBeEnabled());

    const input = screen.getByTestId("input-peggy-message");
    fireEvent.change(input, { target: { value: "block the old token" } });
    const form = input.closest("form");
    expect(screen.getByTestId("button-peggy-new")).toBeEnabled();
    act(() => {
      fireEvent.click(screen.getByTestId("button-peggy-new"));
      fireEvent.click(screen.getByTestId("button-peggy-new"));
      fireEvent.submit(form!);
    });
    await waitFor(() =>
      expect(callsFor("/api/peggy/conversations")).toHaveLength(3),
    );
    const replacementRequest = capturedRequest("/api/peggy/conversations", 2);
    expect(replacementRequest.method).toBe("POST");
    expect(replacementRequest.credentials).toBe("include");
    expect(replacementRequest.body).toEqual({
      context: { page: "home", surface: "dormant-bubble" },
    });
    expect(callsFor("/api/peggy/chat")).toHaveLength(0);
    expect(screen.getByTestId("button-peggy-new")).toBeDisabled();

    await act(async () => {
      replacement.resolve(jsonResponse({ id: 102, accessToken: "v1.dormant-two" }));
      await replacement.promise;
    });
    await waitFor(() => expect(screen.getByTestId("input-peggy-message")).toBeEnabled());
    fireEvent.change(screen.getByTestId("input-peggy-message"), {
      target: { value: "dormant replacement" },
    });
    fireEvent.click(screen.getByTestId("button-peggy-send"));
    await waitFor(() => expect(callsFor("/api/peggy/chat")).toHaveLength(1));
    const chatRequest = capturedRequest("/api/peggy/chat");
    expect(chatRequest.method).toBe("POST");
    expect(chatRequest.credentials).toBe("include");
    expect(chatRequest.headers.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe(
      "v1.dormant-two",
    );
    expect(chatRequest.body).toEqual({
        conversationId: 102,
        message: "dormant replacement",
        context: { page: "home", surface: "dormant-bubble" },
    });
    expect(screen.getByTestId("button-peggy-new")).toBeDisabled();
    await act(async () => {
      chat.resolve(jsonResponse({ messageId: 103, response: "Dormant reply" }));
      await chat.promise;
    });
    await waitFor(() => expect(screen.getByTestId("button-peggy-new")).toBeEnabled());
  });

  it("posts calculator data without browser identity", async () => {
    const setCalculatorData = vi.fn();
    fakeContext({ setCalculatorData });
    fetchMock.mockResolvedValue(jsonResponse({
      response: "Calculator reply",
      conversationId: 111,
    }));
    renderWithClient(fakePeggyTree(
      <AskPeggyButton
        calculatorType="roi"
        inputs={{ purchasePrice: 300_000 }}
        results={{ roi: 12.5 }}
      />,
    ));
    fireEvent.click(screen.getByTestId("button-ask-peggy"));
    await screen.findByText("Calculator reply");
    expect(setCalculatorData).toHaveBeenCalledWith(
      "roi",
      { purchasePrice: 300_000 },
      { roi: 12.5 },
    );
    expect(callsFor("/api/peggy/analyze-calculator")).toHaveLength(1);
    const calculatorRequest = capturedRequest("/api/peggy/analyze-calculator");
    expect(calculatorRequest.method).toBe("POST");
    expect(calculatorRequest.credentials).toBe("include");
    expect(calculatorRequest.headers.get("content-type")).toBe("application/json");
    expect(calculatorRequest.body).toEqual({
      calculatorType: "roi",
      inputs: { purchasePrice: 300_000 },
      results: { roi: 12.5 },
    });
  });
});

describe.each(["Dock", "dormant"] as const)(
  "%s bounded access refresh",
  (surface) => {
    it("refreshes chat and feedback through authenticatedRequest without duplicate UI", async () => {
      let chatCount = 0;
      let feedbackCount = 0;
      let refreshCount = 0;
      fetchMock.mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/peggy/suggestions") {
          return Promise.resolve(jsonResponse({ suggestions: [] }));
        }
        if (url === "/api/peggy/conversations") {
          return Promise.resolve(jsonResponse({ id: 201, accessToken: "opaque-old" }));
        }
        if (url === "/api/peggy/chat") {
          chatCount += 1;
          return Promise.resolve(chatCount === 1
            ? jsonResponse({
                message: "Conversation access expired",
                code: "PEGGY_ACCESS_EXPIRED",
              }, 401)
            : jsonResponse({ messageId: 501, response: "One rendered reply" }));
        }
        if (url === "/api/peggy/messages/501/feedback") {
          feedbackCount += 1;
          return Promise.resolve(feedbackCount === 1
            ? jsonResponse({
                message: "Conversation access expired",
                code: "PEGGY_ACCESS_EXPIRED",
              }, 401)
            : jsonResponse({ success: true }));
        }
        if (url === "/api/peggy/conversations/201/access/refresh") {
          refreshCount += 1;
          return Promise.resolve(jsonResponse({
            id: 201,
            accessToken: refreshCount === 1 ? "opaque-chat" : "opaque-feedback",
          }));
        }
        throw new Error(`Unexpected URL ${url}`);
      });

      await renderAccessSurface(surface);
      await sendAccessSurfaceMessage("one optimistic turn", "One rendered reply");
      expect(screen.getAllByText("one optimistic turn")).toHaveLength(1);
      expect(screen.getAllByText("One rendered reply")).toHaveLength(1);
      expect(callsFor("/api/peggy/chat")).toHaveLength(2);
      expect(capturedRequest("/api/peggy/chat", 0).credentials).toBe("include");
      expect(capturedRequest("/api/peggy/chat", 0).headers.get(
        PEGGY_CONVERSATION_ACCESS_HEADER,
      )).toBe("opaque-old");
      expect(capturedRequest("/api/peggy/chat", 1).headers.get(
        PEGGY_CONVERSATION_ACCESS_HEADER,
      )).toBe("opaque-chat");

      fireEvent.click(screen.getByTestId("button-feedback-helpful-501"));
      expect(await screen.findByText("Thanks!")).toBeVisible();
      expect(callsFor("/api/peggy/messages/501/feedback")).toHaveLength(2);
      expect(capturedRequest(
        "/api/peggy/messages/501/feedback",
        0,
      ).headers.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe("opaque-chat");
      expect(capturedRequest(
        "/api/peggy/messages/501/feedback",
        1,
      ).headers.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe("opaque-feedback");
      expect(callsFor(
        "/api/peggy/conversations/201/access/refresh",
      )).toHaveLength(2);
      expect(capturedRequest(
        "/api/peggy/conversations/201/access/refresh",
        0,
      )).toMatchObject({ method: "POST", credentials: "include", body: undefined });
      expect(capturedRequest(
        "/api/peggy/conversations/201/access/refresh",
        1,
      ).headers.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe("opaque-chat");
    });

    it("lets feedback refresh race with New but never overwrite/replay/mark success", async () => {
      const lateRefresh = deferred<Response>();
      let createCount = 0;
      let chatCount = 0;
      fetchMock.mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/peggy/suggestions") {
          return Promise.resolve(jsonResponse({ suggestions: [] }));
        }
        if (url === "/api/peggy/conversations") {
          createCount += 1;
          return Promise.resolve(jsonResponse(createCount === 1
            ? { id: 301, accessToken: "old-row-token" }
            : { id: 302, accessToken: "replacement-row-token" }));
        }
        if (url === "/api/peggy/chat") {
          chatCount += 1;
          return Promise.resolve(jsonResponse({
            messageId: chatCount === 1 ? 601 : 602,
            response: chatCount === 1 ? "Old row reply" : "Replacement reply",
          }));
        }
        if (url === "/api/peggy/messages/601/feedback") {
          return Promise.resolve(jsonResponse({
            message: "Conversation access expired",
            code: "PEGGY_ACCESS_EXPIRED",
          }, 401));
        }
        if (url === "/api/peggy/conversations/301/access/refresh") {
          return lateRefresh.promise;
        }
        throw new Error(`Unexpected URL ${url}`);
      });

      await renderAccessSurface(surface);
      await sendAccessSurfaceMessage("seed old row", "Old row reply");
      fireEvent.click(screen.getByTestId("button-feedback-helpful-601"));
      await waitFor(() => expect(callsFor(
        "/api/peggy/conversations/301/access/refresh",
      )).toHaveLength(1));
      expect(screen.getByTestId("button-peggy-new")).toBeEnabled();
      fireEvent.click(screen.getByTestId("button-peggy-new"));
      await waitFor(() =>
        expect(callsFor("/api/peggy/conversations")).toHaveLength(2),
      );
      await waitFor(() =>
        expect(screen.getByTestId("input-peggy-message")).toBeEnabled(),
      );
      await act(async () => {
        lateRefresh.resolve(jsonResponse({ id: 301, accessToken: "stale-late-token" }));
        await lateRefresh.promise;
        await Promise.resolve();
      });

      expect(callsFor("/api/peggy/messages/601/feedback")).toHaveLength(1);
      expect(screen.queryByText("Thanks!")).toBeNull();
      await sendAccessSurfaceMessage("use replacement row", "Replacement reply");
      const replacementChat = capturedRequest("/api/peggy/chat", 1);
      expect(replacementChat.body).toMatchObject({ conversationId: 302 });
      expect(replacementChat.headers.get(
        PEGGY_CONVERSATION_ACCESS_HEADER,
      )).toBe("replacement-row-token");
      expect(fetchMock.mock.calls.some(([, init]) =>
        new Headers((init as RequestInit | undefined)?.headers).get(
          PEGGY_CONVERSATION_ACCESS_HEADER,
        ) === "stale-late-token",
      )).toBe(false);
    });
  },
);
function CanonicalHarness() {
  const [open, setOpen] = useState(true);
  return (
    <Peggy
      open={open}
      setOpen={setOpen}
      toStrategyLab={() => undefined}
      onHandoffToReview={() => undefined}
      go={() => undefined}
      toSubmit={() => undefined}
    />
  );
}

async function sendCanonical(message: string, expectedReply: string) {
  const input = screen.getByLabelText("Talk to Peggy");
  fireEvent.change(input, { target: { value: message } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText(expectedReply);
}

describe("canonical PublicApp Peggy page-memory contract", () => {
  it("continues only while mounted, saves transcript-only, refreshes after remount, and aborts", async () => {
    localStorage.setItem("peggy_session_id", "captured-stale-key");
    let createCount = 0;
    let chatCount = 0;
    let deferChat = false;
    const hangingChat = deferred<Response>();
    const chatSignals: AbortSignal[] = [];
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/peggy/conversations") {
        createCount += 1;
        return Promise.resolve(jsonResponse({
          id: createCount * 100,
          accessToken: `v1.canonical-${createCount}`,
        }));
      }
      if (url === "/api/peggy/chat") {
        chatCount += 1;
        if (init?.signal) chatSignals.push(init.signal);
        if (deferChat) return hangingChat.promise;
        return Promise.resolve(jsonResponse({
          response: `Canonical reply ${chatCount}`,
        }));
      }
      throw new Error(`Unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const firstMount = renderWithClient(<CanonicalHarness />);
    await sendCanonical("first mounted turn", "Canonical reply 1");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", {
      name: /Talk to Peggy, the Pegasus intake concierge/,
    }));
    await sendCanonical("same mounted page", "Canonical reply 2");
    expect(fetchMock.mock.calls.filter(([url]) =>
      String(url) === "/api/peggy/conversations")).toHaveLength(1);

    const createInit = fetchMock.mock.calls.find(([url]) =>
      String(url) === "/api/peggy/conversations")?.[1] as RequestInit;
    expect(createInit.method).toBe("POST");
    expect(JSON.parse(String(createInit.body))).toEqual({
      context: { surface: "public-peggy" },
    });
    const chatInits = fetchMock.mock.calls
      .filter(([url]) => String(url) === "/api/peggy/chat")
      .map((call) => call[1] as RequestInit);
    expect(JSON.parse(String(chatInits[0].body))).toEqual({
      conversationId: 100,
      message: "first mounted turn",
      context: { surface: "public-peggy" },
    });
    expect(new Headers(chatInits[0].headers).get(
      PEGGY_CONVERSATION_ACCESS_HEADER,
    )).toBe("v1.canonical-1");

    fireEvent.click(screen.getByRole("button", {
      name: "Save this conversation",
    }));
    const saved = localStorage.getItem("pg:saved:chats");
    expect(saved).toMatch(/first mounted turn|same mounted page/);
    expect(saved).not.toMatch(/accessToken|conversationId|v1\.canonical/);
    expect(localStorage.getItem("peggy_session_id")).toBe("captured-stale-key");

    firstMount.unmount();
    const secondMount = renderWithClient(<CanonicalHarness />);
    await sendCanonical("fresh after remount", "Canonical reply 3");
    expect(fetchMock.mock.calls.filter(([url]) =>
      String(url) === "/api/peggy/conversations")).toHaveLength(2);
    const lastChat = fetchMock.mock.calls
      .filter(([url]) => String(url) === "/api/peggy/chat")
      .at(-1)?.[1] as RequestInit;
    expect(JSON.parse(String(lastChat.body))).toEqual({
      conversationId: 200,
      message: "fresh after remount",
      context: { surface: "public-peggy" },
    });
    expect(new Headers(lastChat.headers).get(
      PEGGY_CONVERSATION_ACCESS_HEADER,
    )).toBe("v1.canonical-2");

    deferChat = true;
    const input = screen.getByLabelText("Talk to Peggy");
    fireEvent.change(input, { target: { value: "abort this turn" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(chatSignals).toHaveLength(4));
    expect(chatSignals.at(-1)?.aborted).toBe(false);
    secondMount.unmount();
    expect(chatSignals.at(-1)?.aborted).toBe(true);
  });
});
