import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { SavedPage } from "@/pegasus/Saved";

describe("saved workspace", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);

  it("resumes the current Strategy Lab draft and ignores obsolete model records", () => {
    window.localStorage.setItem(
      "pegasus.strategy-lab.v3",
      JSON.stringify({
        schemaVersion: 3,
        savedAt: "2026-08-30T08:00:00.000Z",
        state: { address: "19 Bay View Avenue" },
      }),
    );
    window.localStorage.setItem(
      "pg:saved:strategies",
      JSON.stringify([{ id: "old", title: "Obsolete profit card", model: { spread: 999999 } }]),
    );
    const go = vi.fn();

    render(<SavedPage go={go} />);

    expect(screen.getByRole("heading", { name: "19 Bay View Avenue" })).toBeVisible();
    expect(screen.queryByText("Obsolete profit card")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Resume in Strategy Lab/i }));
    expect(go).toHaveBeenCalledWith("strategylab");
  });
});
