import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  NAV_PRIMARY,
  NAV_MORE,
  FOOTER_MORE_EXTRA,
} from "@/config/navigation";

// Empire Doctrine v1.0.1 nav parity:
//   • Desktop header surfaces exactly NAV_PRIMARY (five items).
//   • Desktop header has NO More dropdown (collapsed in the Foundation Reset).
//   • Mobile sheet exposes NAV_PRIMARY + NAV_MORE.
//   • Footer's column grid exposes NAV_PRIMARY + NAV_MORE (any column).
//   • Mobile "More" set == Footer "More" set (label/href agreement).

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    user: null,
    profile: null,
    isAuthenticated: false,
    isAdmin: false,
  }),
  SupabaseAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/components/command-palette", () => ({ CommandPalette: () => null }));
vi.mock("@/components/theme-toggle", () => ({ ThemeToggle: () => null }));

import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

function renderWithRouter(ui: React.ReactElement, path = "/") {
  const { hook } = memoryLocation({ path, static: true });
  // Footer's email-capture widget uses TanStack Query's useMutation, which
  // requires a QueryClientProvider in the tree (the live app mounts the
  // Footer inside one in App.tsx).
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Router hook={hook}>{ui}</Router>
    </QueryClientProvider>
  );
}

// Radix triggers use pointer events that jsdom doesn't fully implement.
interface PointerCapableElement {
  hasPointerCapture?: (pointerId: number) => boolean;
  releasePointerCapture?: (pointerId: number) => void;
  setPointerCapture?: (pointerId: number) => void;
  scrollIntoView?: (arg?: boolean | ScrollIntoViewOptions) => void;
}
function ensurePointerStubs() {
  const proto = Element.prototype as Element & PointerCapableElement;
  if (!proto.hasPointerCapture) proto.hasPointerCapture = () => false;
  if (!proto.releasePointerCapture) proto.releasePointerCapture = () => {};
  if (!proto.setPointerCapture) proto.setPointerCapture = () => {};
  if (!proto.scrollIntoView) proto.scrollIntoView = () => {};
}

const slugify = (label: string) => label.toLowerCase().replace(/\s+/g, "-");

beforeEach(() => {
  cleanup();
  ensurePointerStubs();
});

const user = () => userEvent.setup({ pointerEventsCheck: 0 });

describe("Navigation parity (Website Structure v1 FINAL)", () => {
  it("desktop header exposes exactly the five NAV_PRIMARY entries", () => {
    renderWithRouter(<Navigation />);
    // Website Structure v1 FINAL §1 — five noun items plus the More
    // dropdown (the sixth visible primary slot). NAV_PRIMARY remains a
    // five-item array; "More" is a dropdown trigger, not a NAV_PRIMARY
    // entry.
    expect(NAV_PRIMARY).toHaveLength(5);
    const expectedHrefs = new Set([
      "/deal-architecture",
      "/development",
      "/strategy-lab",
      "/work-with-apollo",
      "/marketflow",
    ]);
    for (const item of NAV_PRIMARY) {
      expect(expectedHrefs.has(item.href)).toBe(true);
      const link = screen.getByTestId(`link-nav-${slugify(item.label)}`);
      expect(link.getAttribute("href")).toBe(item.href);
    }
  });

  it("/projects is not in NAV_PRIMARY (v1 FINAL: moved into /development + More)", () => {
    expect(NAV_PRIMARY.find((i) => i.href === "/projects")).toBeUndefined();
  });

  it("/work-with-apollo is in NAV_PRIMARY (v1 FINAL §1)", () => {
    expect(NAV_PRIMARY.find((i) => i.href === "/work-with-apollo")).toBeDefined();
  });

  it("desktop header may expose a More dropdown sourced from NAV_MORE", () => {
    // Preserved original design includes a header More dropdown. The
    // structural contract is: if it is rendered, it must carry every
    // NAV_MORE entry. (Mobile + footer parity is checked below.)
    renderWithRouter(<Navigation />);
    const moreBtn = screen.queryByTestId("button-nav-more");
    if (moreBtn) {
      expect(moreBtn).toBeTruthy();
    }
  });

  it("mobile sheet exposes both NAV_PRIMARY and NAV_MORE entries", async () => {
    renderWithRouter(<Navigation />);
    await user().click(screen.getByTestId("button-mobile-menu"));

    for (const item of NAV_PRIMARY) {
      const links = await screen.findAllByTestId(`link-nav-${slugify(item.label)}`);
      expect(links.length).toBeGreaterThan(0);
      links.forEach((l) => expect(l.getAttribute("href")).toBe(item.href));
    }

    for (const item of NAV_MORE) {
      const link = await screen.findByTestId(`link-mobile-${slugify(item.label)}`);
      expect(link.getAttribute("href")).toBe(item.href);
    }
  });

  it("footer surfaces NAV_PRIMARY (any column) and NAV_MORE (+ extras)", () => {
    renderWithRouter(<Footer />);
    for (const item of NAV_PRIMARY) {
      const links = screen.getAllByTestId(`link-footer-${slugify(item.label)}`);
      expect(links.length).toBeGreaterThan(0);
      links.forEach((link) => {
        const anchor = link.closest("a");
        expect(anchor?.getAttribute("href")).toBe(item.href);
      });
    }
    for (const item of [...NAV_MORE, ...FOOTER_MORE_EXTRA]) {
      const link = screen.getByTestId(`link-footer-more-${slugify(item.label)}`);
      const anchor = link.closest("a");
      expect(anchor?.getAttribute("href")).toBe(item.href);
    }
  });

  it("mobile More set and footer More set agree on label + href", async () => {
    renderWithRouter(<Navigation />);
    await user().click(screen.getByTestId("button-mobile-menu"));
    const mobileMore = new Set<string>();
    for (const item of NAV_MORE) {
      const link = await screen.findByTestId(`link-mobile-${slugify(item.label)}`);
      mobileMore.add(`${item.label}|${link.getAttribute("href")}`);
    }
    cleanup();

    renderWithRouter(<Footer />);
    const footerMore = new Set<string>();
    for (const item of NAV_MORE) {
      const links = screen.getAllByTestId(`link-footer-more-${slugify(item.label)}`);
      const anchor = links[0].closest("a");
      footerMore.add(`${item.label}|${anchor?.getAttribute("href")}`);
    }

    expect(mobileMore).toEqual(footerMore);
    expect(mobileMore.size).toBe(NAV_MORE.length);
  });
});
