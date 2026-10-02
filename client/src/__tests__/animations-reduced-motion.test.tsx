import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const motionBoundary = vi.hoisted(() => ({
  latestProps: null as null | Record<string, unknown>,
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");

  const MotionDiv = React.forwardRef<HTMLDivElement, Record<string, unknown>>(
    ({ children, initial, animate, transition, ...domProps }, ref) => {
      motionBoundary.latestProps = { initial, animate, transition };

      return React.createElement(
        "div",
        { ...domProps, ref },
        children as React.ReactNode,
      );
    },
  );

  MotionDiv.displayName = "MotionDiv";

  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

import { ScrollReveal } from "@/components/animations";

const originalMatchMedia = window.matchMedia;
const listeners = new Set<(event: MediaQueryListEvent) => void>();
let reducedMotion = false;
let disconnectObserver: ReturnType<typeof vi.fn>;
let createObserver: ReturnType<typeof vi.fn>;

function createMediaQueryList(query: string): MediaQueryList {
  return {
    matches:
      query === "(prefers-reduced-motion: reduce)" && reducedMotion,
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
  reducedMotion = false;
  listeners.clear();
  motionBoundary.latestProps = null;
  disconnectObserver = vi.fn();
  createObserver = vi.fn(() => ({
    root: null,
    rootMargin: "0px",
    thresholds: [0.08],
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: disconnectObserver,
    takeRecords: vi.fn(() => []),
  }));
  window.matchMedia = vi.fn(createMediaQueryList);

  vi.stubGlobal("IntersectionObserver", createObserver);
});

afterEach(() => {
  cleanup();
  listeners.clear();
  window.matchMedia = originalMatchMedia;
  vi.unstubAllGlobals();
});

describe("ScrollReveal reduced-motion behavior", () => {
  it("renders its settled state without observing when reduced motion is already enabled", () => {
    reducedMotion = true;

    render(
      <ScrollReveal delay={0.4} direction="up">
        <span>MarketFlow detail</span>
      </ScrollReveal>,
    );

    expect(createObserver).not.toHaveBeenCalled();
    expect(motionBoundary.latestProps).toEqual({
      initial: false,
      animate: { opacity: 1, x: 0, y: 0 },
      transition: { duration: 0, delay: 0 },
    });
  });

  it("settles immediately when reduced motion is enabled after mount", () => {
    render(
      <ScrollReveal delay={0.4} direction="up">
        <span>MarketFlow detail</span>
      </ScrollReveal>,
    );

    expect(motionBoundary.latestProps).toMatchObject({
      initial: { opacity: 0, x: 0, y: 40 },
      animate: {},
      transition: { duration: 0.6, delay: 0.4 },
    });

    act(() => {
      reducedMotion = true;
      const event = {
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
      } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    });

    expect(disconnectObserver).toHaveBeenCalled();
    expect(motionBoundary.latestProps).toEqual({
      initial: false,
      animate: { opacity: 1, x: 0, y: 0 },
      transition: { duration: 0, delay: 0 },
    });
  });
});
