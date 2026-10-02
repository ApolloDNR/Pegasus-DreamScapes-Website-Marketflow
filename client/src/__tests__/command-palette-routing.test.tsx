import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { CommandPalette } from "@/components/command-palette";

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
  }),
}));

class NoopResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  (globalThis as unknown as { ResizeObserver: typeof NoopResizeObserver })
    .ResizeObserver = NoopResizeObserver;
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

afterEach(() => cleanup());

describe("Command Palette route destinations", () => {
  it("opens the canonical Deal Partners page for the partner command", () => {
    const memory = memoryLocation({ path: "/login", record: true });
    render(
      <Router hook={memory.hook}>
        <CommandPalette />
      </Router>,
    );

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    fireEvent.click(screen.getByTestId("command-wholesale"));

    expect(memory.history.at(-1)).toBe("/deal-partners");
  });

  it("opens the real Saved Work surface instead of the obsolete account library", () => {
    const memory = memoryLocation({ path: "/strategy-lab", record: true });
    render(
      <Router hook={memory.hook}>
        <CommandPalette />
      </Router>,
    );

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    fireEvent.click(screen.getByTestId("command-resources"));

    expect(memory.history.at(-1)).toBe("/saved");
  });
});
