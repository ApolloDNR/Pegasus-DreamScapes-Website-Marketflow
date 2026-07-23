import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Peggy } from "@/pegasus/peggy";

afterEach(cleanup);

const callbacks = {
  setOpen: vi.fn(),
  toStrategyLab: vi.fn(),
  onHandoffToReview: vi.fn(),
  go: vi.fn(),
  toSubmit: vi.fn(),
};

describe("Peggy role-prefill lifecycle", () => {
  it("clears a stale role when Peggy is reopened from a generic entry point", async () => {
    const { rerender } = render(
      <Peggy open initialRole="seller" {...callbacks} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Try one of these, or just type")).toBeInTheDocument();
    });
    expect(screen.queryByText("First, who am I helping?")).not.toBeInTheDocument();

    rerender(<Peggy open={false} initialRole={null} {...callbacks} />);
    rerender(<Peggy open initialRole={null} {...callbacks} />);

    await waitFor(() => {
      expect(screen.getByText("First, who am I helping?")).toBeInTheDocument();
    });
    expect(screen.queryByText("Try one of these, or just type")).not.toBeInTheDocument();
  });
});
