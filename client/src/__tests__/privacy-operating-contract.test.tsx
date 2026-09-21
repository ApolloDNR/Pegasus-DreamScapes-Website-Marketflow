import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Privacy from "@/pages/privacy";

const { useSEOMock } = vi.hoisted(() => ({ useSEOMock: vi.fn() }));

vi.mock("@/hooks/use-seo", () => ({ useSEO: useSEOMock }));

afterEach(() => {
  cleanup();
  useSEOMock.mockReset();
});

describe("privacy operating contract", () => {
  it("is visibly a draft, stays out of search, and describes every mounted data surface", () => {
    render(<Privacy />);

    expect(
      screen.getByText(/operator-prepared draft pending qualified legal review/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/account identity, declared role, and sign-in activity/i)).toBeInTheDocument();
    expect(screen.getByText(/private MarketFlow product activity/i)).toBeInTheDocument();
    expect(screen.getByText(/browser-only Strategy Lab draft/i)).toBeInTheDocument();
    expect(screen.getByText(/public share[- ]link/i)).toBeInTheDocument();
    expect(useSEOMock).toHaveBeenCalledWith(
      expect.objectContaining({ noIndex: true, noCanonical: true }),
    );
  });

  it("does not promise undisclosed professional sharing or a fixed deletion deadline", () => {
    const { container } = render(<Privacy />);
    const text = container.textContent ?? "";

    expect(text).toMatch(/separate notice and permission before sharing.*independent professional/i);
    expect(text).not.toMatch(/respond within 30 days/i);
    expect(text).not.toMatch(/random anonymous Strategy Lab session identifier/i);
  });
});
