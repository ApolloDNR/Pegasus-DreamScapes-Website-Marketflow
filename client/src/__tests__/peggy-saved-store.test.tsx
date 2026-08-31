import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Peggy } from "@/pegasus/peggy";
import { addChat, listChats } from "@/pegasus/savedStore";

const callbacks = {
  setOpen: vi.fn(),
  toStrategyLab: vi.fn(),
  onHandoffToReview: vi.fn(),
  go: vi.fn(),
  toSubmit: vi.fn(),
};

function renderPeggy() {
  return render(<Peggy open {...callbacks} />);
}

async function startConversation() {
  fireEvent.change(screen.getByLabelText("Talk to Peggy"), {
    target: { value: "Help me think through this property" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  return screen.findByRole("button", { name: "Save this conversation" });
}

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL) => {
      if (String(input) === "/api/peggy/conversations") {
        return Promise.resolve(
          new Response(JSON.stringify({ id: 19, accessToken: "opaque-test-token" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
      if (String(input) === "/api/peggy/chat") {
        return Promise.resolve(
          new Response(JSON.stringify({ response: "Here is a bounded planning path." }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
      throw new Error(`Unexpected fetch: ${String(input)}`);
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Peggy saved conversation storage", () => {
  it("treats a non-array legacy payload as an empty saved list", () => {
    window.localStorage.setItem(
      "pg:saved:chats",
      JSON.stringify({ id: "legacy-object", transcript: [] }),
    );

    expect(listChats()).toEqual([]);
  });

  it("returns the storage error when the browser denies a chat write", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    const result = addChat("Denied conversation", [
      { role: "user", content: "This must not report a false save." },
    ]);

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ name: "QuotaExceededError" }),
    });
  });

  it("keeps Save available and reports the failure when persistence is denied", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    renderPeggy();

    const save = await startConversation();
    fireEvent.click(save);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Retry saving this conversation" }),
      ).toBeEnabled();
    });
    expect(screen.getByRole("status")).toHaveTextContent("Save failed — retry");
    expect(screen.queryByText(/^Saved$/)).not.toBeInTheDocument();
  });

  it("confirms Saved only after the transcript is persisted", async () => {
    renderPeggy();

    const save = await startConversation();
    fireEvent.click(save);

    await waitFor(() => expect(save).toBeDisabled());
    expect(save).toHaveTextContent("Saved");
    expect(listChats()).toHaveLength(1);
    expect(listChats()[0].transcript).toEqual(
      expect.arrayContaining([
        { role: "user", content: "Help me think through this property" },
      ]),
    );
  });
});
