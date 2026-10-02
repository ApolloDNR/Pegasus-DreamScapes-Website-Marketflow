import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StaggerChildren, StaggerItem } from "@/components/animations";

const originalMatchMedia = window.matchMedia;
const listeners = new Set<() => void>();
let reducedMotion = false;
let createObserver: ReturnType<typeof vi.fn>;

beforeEach(() => {
  reducedMotion = false;
  listeners.clear();
  window.matchMedia = vi.fn((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)" && reducedMotion,
    media: query,
    onchange: null,
    addListener: vi.fn((listener) => listeners.add(listener)),
    removeListener: vi.fn((listener) => listeners.delete(listener)),
    addEventListener: vi.fn((_type, listener) => listeners.add(listener)),
    removeEventListener: vi.fn((_type, listener) => listeners.delete(listener)),
    dispatchEvent: vi.fn(() => false),
  }));
  createObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  vi.stubGlobal("IntersectionObserver", createObserver);
});

afterEach(() => {
  cleanup();
  listeners.clear();
  window.matchMedia = originalMatchMedia;
  vi.unstubAllGlobals();
});

function InventoryGrid({ loaded = true }: { loaded?: boolean }) {
  return (
    <StaggerChildren staggerDelay={0.4}>
      {loaded && (
        <StaggerItem>
          <article>Reviewed property</article>
        </StaggerItem>
      )}
    </StaggerChildren>
  );
}

function expectSettledCard() {
  expect(screen.getByRole("article").parentElement).toHaveStyle({
    opacity: "1",
    transform: "none",
  });
}

describe("Staggered inventory reduced-motion behavior", () => {
  it("renders cards in their settled state without waiting for the viewport", () => {
    reducedMotion = true;

    render(<InventoryGrid />);

    expectSettledCard();
    expect(createObserver).not.toHaveBeenCalled();
  });

  it("immediately reveals cards that arrive after the grid mounts", () => {
    reducedMotion = true;
    const { rerender } = render(<InventoryGrid loaded={false} />);

    rerender(<InventoryGrid />);

    expectSettledCard();
    expect(createObserver).not.toHaveBeenCalled();
  });

  it("settles existing cards when the visitor enables reduced motion", async () => {
    render(<InventoryGrid />);
    expect(screen.getByRole("article").parentElement).toHaveStyle({ opacity: "0" });

    act(() => {
      reducedMotion = true;
      listeners.forEach((listener) => listener());
    });

    await waitFor(expectSettledCard);
  });

  it("preserves the viewport entrance when reduced motion is disabled", () => {
    render(<InventoryGrid />);

    expect(screen.getByRole("article").parentElement).toHaveStyle({
      opacity: "0",
      transform: "translateY(16px)",
    });
  });
});
