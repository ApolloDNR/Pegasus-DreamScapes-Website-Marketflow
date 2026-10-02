import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return { ...actual, useQuery: useQueryMock };
});

vi.mock("@/hooks/use-seo", () => ({
  useSEO: vi.fn(),
}));

import AdminVendorsPage from "@/pages/admin-vendors";

afterEach(() => {
  cleanup();
  useQueryMock.mockReset();
});

describe("operator submissions in Vendor HQ", () => {
  it("renders the reusable form context and message without legacy vendor fields", () => {
    useQueryMock.mockReturnValue({
      data: [
        {
          id: 41,
          leadType: "vendor",
          source: "form",
          stage: "new",
          firstName: "Jordan",
          lastName: "Builder",
          email: "jordan@example.com",
          phone: null,
          notes: null,
          createdAt: "2026-08-30T12:00:00.000Z",
          leadData: {
            lane: "vendor",
            role: "Operator",
            intent: "operator",
            context: "Licensed GC, East Bay",
            contextKind: "context",
            message: "Occupied renovation capacity this fall",
          },
        },
      ],
      isLoading: false,
      error: null,
    });

    render(<AdminVendorsPage />);

    expect(screen.getByText("Submitted profile / context")).toBeInTheDocument();
    expect(screen.getByText("Licensed GC, East Bay")).toBeInTheDocument();
    expect(screen.getByText("About their work")).toBeInTheDocument();
    expect(
      screen.getByText("Occupied renovation capacity this fall"),
    ).toBeInTheDocument();
  });
});
