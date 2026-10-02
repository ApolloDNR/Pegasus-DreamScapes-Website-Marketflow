import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/components/theme-provider";

const originalMatchMedia = window.matchMedia;
let renderSequence: Array<"dark" | "light"> = [];

function matchMediaWithDarkPreference(query: string): MediaQueryList {
  return {
    matches: query === "(prefers-color-scheme: dark)",
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  } as unknown as MediaQueryList;
}

function ThemeProbe() {
  const { resolvedTheme, setTheme } = useTheme();
  renderSequence.push(resolvedTheme);
  return <><span>{resolvedTheme}</span><button onClick={() => setTheme("dark")}>Choose dark</button></>;
}

beforeEach(() => {
  renderSequence = [];
  localStorage.clear();
  window.matchMedia = vi.fn(matchMediaWithDarkPreference);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  window.matchMedia = originalMatchMedia;
});

describe("ThemeProvider first paint", () => {
  it("opens in parchment light mode on a dark OS until the visitor chooses otherwise", () => {
    const view = render(<ThemeProvider><ThemeProbe /></ThemeProvider>);
    expect(renderSequence[0]).toBe("light");
    expect(document.documentElement).toHaveClass("light");
    expect(localStorage.getItem("pegasus-ui-theme")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Choose dark" }));
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("pegasus-ui-theme")).toBe("dark");
    view.unmount();
    renderSequence = [];
    render(<ThemeProvider><ThemeProbe /></ThemeProvider>);
    expect(renderSequence[0]).toBe("dark");
  });

  it("keeps the site and manual theme choice usable when browser storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    render(<ThemeProvider><ThemeProbe /></ThemeProvider>);
    expect(renderSequence[0]).toBe("light");
    fireEvent.click(screen.getByRole("button", { name: "Choose dark" }));
    expect(document.documentElement).toHaveClass("dark");
  });

  it("resolves a dark system preference before rendering children", () => {
    render(
      <ThemeProvider defaultTheme="system">
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(renderSequence[0]).toBe("dark");
  });

  it("resolves a stored manual preference before rendering children", () => {
    localStorage.setItem("pegasus-ui-theme", "light");

    render(
      <ThemeProvider defaultTheme="system">
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(renderSequence[0]).toBe("light");
  });
});
