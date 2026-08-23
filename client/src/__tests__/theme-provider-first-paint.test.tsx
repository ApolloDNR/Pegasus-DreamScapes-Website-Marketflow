import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
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
  const { resolvedTheme } = useTheme();
  renderSequence.push(resolvedTheme);
  return <span>{resolvedTheme}</span>;
}

beforeEach(() => {
  renderSequence = [];
  localStorage.clear();
  window.matchMedia = vi.fn(matchMediaWithDarkPreference);
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.matchMedia = originalMatchMedia;
});

describe("ThemeProvider first paint", () => {
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
