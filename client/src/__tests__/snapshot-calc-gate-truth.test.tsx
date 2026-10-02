import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

vi.mock("@/pages/snapshot-property", () => ({
  default: () => <div data-testid="property-snapshot">Property snapshot</div>,
}));

vi.mock("@/pages/snapshot-calc", () => ({
  default: () => <div data-testid="legacy-snapshot">Legacy snapshot</div>,
}));

import SnapshotCalcGate from "@/pages/snapshot-calc-gate";

const fetchMock = vi.fn();

function renderGate(token = "shared-token") {
  const memory = memoryLocation({ path: `/snapshot/calc/${token}` });
  render(
    <Router hook={memory.hook}>
      <Route path="/snapshot/calc/:token">
        <SnapshotCalcGate />
      </Route>
    </Router>,
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("shared snapshot service probe", () => {
  it("opens a property snapshot only after a successful property probe", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200 });
    renderGate();

    expect(await screen.findByTestId("property-snapshot")).toBeInTheDocument();
    expect(screen.queryByTestId("legacy-snapshot")).not.toBeInTheDocument();
  });

  it("falls back to the legacy calculator only for a confirmed 404", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404 });
    renderGate();

    expect(await screen.findByTestId("legacy-snapshot")).toBeInTheDocument();
    expect(screen.queryByTestId("property-snapshot")).not.toBeInTheDocument();
  });

  it("does not misclassify a property-service error as an expired legacy link", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });
    renderGate();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "This snapshot is temporarily unavailable.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.queryByTestId("legacy-snapshot")).not.toBeInTheDocument();
  });

  it("shows a retryable unavailable state after a network failure", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ ok: true, status: 200 });
    renderGate();

    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));

    expect(await screen.findByTestId("property-snapshot")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
