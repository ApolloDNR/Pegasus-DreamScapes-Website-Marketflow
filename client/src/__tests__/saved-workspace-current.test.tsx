import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { SavedPage } from "@/pegasus/Saved";
import { emptyWorkspace, illustrativeDraft, serializeDraft, STORAGE_KEY } from "@/pegasus/intelligence-desk/state";

describe("saved workspace", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);

  it("provides a direct return to the tools index", () => {
    render(<SavedPage go={vi.fn()} />);
    const link = screen.getByRole("link", { name: "Back to tools" });
    expect(link).toHaveAttribute("href", "/tools");
    expect(screen.getByRole("heading", { name: "Your saved work." }).closest("header")).toContainElement(link);
  });

  it("resumes a readable version-two draft", () => {
    window.localStorage.setItem("pegasus.strategy-lab.v2", JSON.stringify({ schemaVersion: 2, savedAt: "2026-08-30T08:00:00.000Z", state: { address: "Older synthetic property" } }));
    render(<SavedPage go={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Older synthetic property" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Resume in Strategy Lab" })).toHaveAttribute("href", "/strategy-lab?resume=saved");
  });

  it("uses the same validated workspace as the Lab when its saved date is unavailable", () => {
    window.localStorage.setItem("pegasus.strategy-lab.v3", JSON.stringify({ schemaVersion: 3, savedAt: "2026-08-30T08:00:00.000Z", state: { address: "Older saved property" } }));
    const workspace = { ...emptyWorkspace(), base: { ...illustrativeDraft(), address: "Current saved property" } };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 4, savedAt: "invalid", workspace }));
    render(<SavedPage go={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Current saved property" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Older saved property" })).not.toBeInTheDocument();
    expect(screen.getByText("Browser draft")).toBeVisible();
  });

  it("resumes the new Intelligence Desk draft ahead of an older saved model", () => {
    window.localStorage.setItem("pegasus.strategy-lab.v3", JSON.stringify({ schemaVersion: 3, savedAt: "2026-08-30T08:00:00.000Z", state: { address: "Old property" } }));
    const workspace = { ...emptyWorkspace(), base: { ...illustrativeDraft(), address: "New property" } };
    window.localStorage.setItem(STORAGE_KEY, serializeDraft(workspace));
    render(<SavedPage go={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "New property" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Old property" })).not.toBeInTheDocument();
  });

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
    expect(screen.getByRole("link", { name: /Resume in Strategy Lab/i })).toHaveAttribute("href", "/strategy-lab?resume=saved");
  });
});
