import { afterEach, describe, expect, it, vi } from "vitest";

type CloseWithinDeadline = (
  label: string,
  close: () => void | Promise<void>,
  timeoutMs?: number,
) => Promise<void>;

async function loadCloseWithinDeadline(): Promise<CloseWithinDeadline> {
  const module = await import("../../scripts/rendered-qa-liveness.mjs");
  return module.closeWithinDeadline as CloseWithinDeadline;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("rendered QA resource liveness", () => {
  it("completes a cooperative close and clears its deadline timer", async () => {
    vi.useFakeTimers();
    const closeWithinDeadline = await loadCloseWithinDeadline();
    let closed = false;

    await closeWithinDeadline("route page", async () => {
      closed = true;
    }, 50);

    expect(closed).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("rejects a frozen close at the deadline without retaining a timer handle", async () => {
    vi.useFakeTimers();
    const closeWithinDeadline = await loadCloseWithinDeadline();
    const frozenClose = closeWithinDeadline(
      "route page dark desktop-1440 /",
      () => new Promise(() => undefined),
      50,
    );
    const rejection = expect(frozenClose).rejects.toMatchObject({
      name: "RenderedQaCloseTimeoutError",
      label: "route page dark desktop-1440 /",
      timeoutMs: 50,
    });

    await vi.advanceTimersByTimeAsync(50);
    await rejection;

    expect(vi.getTimerCount()).toBe(0);
  });

  it("preserves an immediate close failure instead of relabeling it as a timeout", async () => {
    const closeWithinDeadline = await loadCloseWithinDeadline();
    const failure = new Error("transport already failed");

    await expect(
      closeWithinDeadline("interaction context", async () => {
        throw failure;
      }, 50),
    ).rejects.toBe(failure);
  });
});
