import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const originalMatchMedia = window.matchMedia;
const listeners = new Set<(event: MediaQueryListEvent) => void>();
let matches = false;

function createMediaQueryList(query: string): MediaQueryList {
  return {
    matches: query === "(prefers-reduced-motion: reduce)" && matches,
    media: query,
    onchange: null,
    addListener: vi.fn((listener) => listeners.add(listener)),
    removeListener: vi.fn((listener) => listeners.delete(listener)),
    addEventListener: vi.fn((_type, listener) => {
      listeners.add(listener as (event: MediaQueryListEvent) => void);
    }),
    removeEventListener: vi.fn((_type, listener) => {
      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    }),
    dispatchEvent: vi.fn(() => false),
  };
}

beforeEach(() => {
  matches = false;
  listeners.clear();
  window.matchMedia = vi.fn(createMediaQueryList);
});

afterEach(() => {
  listeners.clear();
  window.matchMedia = originalMatchMedia;
});

describe("usePrefersReducedMotion", () => {
  it("reacts when the operating-system preference changes after mount", () => {
    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);

    act(() => {
      matches = true;
      const event = { matches, media: "(prefers-reduced-motion: reduce)" } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    });

    expect(result.current).toBe(true);
  });
});
