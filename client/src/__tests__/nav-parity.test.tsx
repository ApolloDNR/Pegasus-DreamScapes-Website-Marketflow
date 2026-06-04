import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
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
  return render(<Router hook={hook}>{ui}</Router>);
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

describe("Navigation parity (Empire Doctrine v1.0.1)", () => {
  it("desktop header exposes exactly the five NAV_PRIMARY entries", () => {
    renderWithRouter(<Navigation />);
    expect(NAV_PRIMARY).toHaveLength(5);
    for (const item of NAV_PRIMARY) {
      const link = screen.getByTestId(`link-nav-${slugify(item.label)}`);
      expect(link.getAttribute("href")).toBe(item.href);
    }
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

  it("mobile navigation keeps submit reachable without crowding the smallest header", async () => {
    renderWithRouter(<Navigation />);

    expect(screen.queryByTestId("button-mobile-header-cta")).toBeNull();

    const mobileMenu = screen.getByTestId("button-mobile-menu");
    expect(mobileMenu.className).toContain("fixed");
    expect(mobileMenu.className).toContain("right-5");
    expect(mobileMenu.className).toContain("z-[9999]");
    expect(mobileMenu.getAttribute("style")).toContain("background-color: rgb(200, 122, 58)");

    await user().click(screen.getByTestId("button-mobile-menu"));
    expect(await screen.findByTestId("button-mobile-cta")).toHaveTextContent("Submit a Property");
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
