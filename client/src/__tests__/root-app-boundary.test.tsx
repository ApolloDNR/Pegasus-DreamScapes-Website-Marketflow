import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

const renderCounts = vi.hoisted(() => ({
  public: 0,
  legacy: 0,
}));

vi.mock("@/PublicApp", () => ({
  default: () => {
    renderCounts.public += 1;
    return <div data-testid="public-root">Public root</div>;
  },
}));

vi.mock("@/LegacyApp", () => ({
  default: () => {
    renderCounts.legacy += 1;
    return <div data-testid="legacy-root">Legacy root</div>;
  },
}));

import App from "@/App";

afterEach(() => {
  cleanup();
  renderCounts.public = 0;
  renderCounts.legacy = 0;
});

describe("root application boundary", () => {
  it("keeps Pegasus URLs on the public root and loads the legacy root only when leaving it", async () => {
    const memory = memoryLocation({ path: "/", record: true });

    render(
      <Router hook={memory.hook}>
        <App />
      </Router>,
    );

    expect(screen.getByTestId("public-root")).toBeInTheDocument();
    expect(screen.queryByTestId("legacy-root")).not.toBeInTheDocument();
    expect(renderCounts.legacy).toBe(0);

    act(() => memory.navigate("/login"));
    expect(await screen.findByTestId("legacy-root")).toBeInTheDocument();
    expect(screen.queryByTestId("public-root")).not.toBeInTheDocument();

    act(() => memory.navigate("/"));
    expect(await screen.findByTestId("public-root")).toBeInTheDocument();
    expect(screen.queryByTestId("legacy-root")).not.toBeInTheDocument();
  });
});
