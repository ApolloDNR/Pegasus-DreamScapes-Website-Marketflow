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

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    user: null,
    profile: null,
    isAuthenticated: false,
    isAdmin: false,
  }),
  SupabaseAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/components/command-palette", () => ({
  CommandPalette: () => null,
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => null,
}));

import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

function renderWithRouter(ui: React.ReactElement, path = "/") {
  const { hook } = memoryLocation({ path, static: true });
  return render(<Router hook={hook}>{ui}</Router>);
}

// Radix dropdown / dialog triggers open on pointerdown, and JSDOM doesn't
// implement pointer capture or scrollIntoView. Augment the prototype so
// userEvent's pointer events don't blow up Radix internals.
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

describe("Navigation parity (header / mobile sheet / footer)", () => {
  it("desktop header exposes the canonical NAV_PRIMARY entries", () => {
    renderWithRouter(<Navigation />);
    for (const item of NAV_PRIMARY) {
      const link = screen.getByTestId(`link-nav-${item.label.toLowerCase()}`);
      expect(link.getAttribute("href")).toBe(item.href);
    }
  });

  it("desktop header dropdown exposes the canonical NAV_MORE entries", async () => {
    renderWithRouter(<Navigation />);
    await user().click(screen.getByTestId("button-nav-more"));
    for (const item of NAV_MORE) {
      const link = await screen.findByTestId(`link-nav-more-${slugify(item.label)}`);
      const anchor = link.closest("a");
      expect(anchor?.getAttribute("href")).toBe(item.href);
    }
  });

  it("mobile sheet exposes both NAV_PRIMARY and NAV_MORE entries", async () => {
    renderWithRouter(<Navigation />);
    await user().click(screen.getByTestId("button-mobile-menu"));

    for (const item of NAV_PRIMARY) {
      const links = await screen.findAllByTestId(`link-nav-${item.label.toLowerCase()}`);
      expect(links.length).toBeGreaterThan(0);
      links.forEach((l) => expect(l.getAttribute("href")).toBe(item.href));
    }

    for (const item of NAV_MORE) {
      const link = await screen.findByTestId(`link-mobile-${slugify(item.label)}`);
      expect(link.getAttribute("href")).toBe(item.href);
    }
  });

  it("footer exposes NAV_PRIMARY in Explore and NAV_MORE (+ extra) in More", () => {
    renderWithRouter(<Footer />);
    for (const item of NAV_PRIMARY) {
      // MarketFlow has a second occurrence in the legal row, so allow
      // multiple matches and assert that at least one points at the right
      // href (and they all agree).
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

  it("header dropdown, mobile sheet, and footer all expose the same More label/href set", async () => {
    // 1. Header dropdown
    renderWithRouter(<Navigation />);
    const u = user();
    await u.click(screen.getByTestId("button-nav-more"));
    const headerMore = new Set<string>();
    for (const item of NAV_MORE) {
      const link = await screen.findByTestId(`link-nav-more-${slugify(item.label)}`);
      const anchor = link.closest("a");
      headerMore.add(`${item.label}|${anchor?.getAttribute("href")}`);
    }

    // 2. Mobile sheet "More" group (same Navigation render)
    await u.click(screen.getByTestId("button-mobile-menu"));
    const mobileMore = new Set<string>();
    for (const item of NAV_MORE) {
      const link = await screen.findByTestId(`link-mobile-${slugify(item.label)}`);
      mobileMore.add(`${item.label}|${link.getAttribute("href")}`);
    }
    cleanup();

    // 3. Footer "More" column (filtered to the canonical NAV_MORE subset)
    renderWithRouter(<Footer />);
    const footerMore = new Set<string>();
    for (const item of NAV_MORE) {
      const links = screen.getAllByTestId(`link-footer-more-${slugify(item.label)}`);
      const anchor = links[0].closest("a");
      footerMore.add(`${item.label}|${anchor?.getAttribute("href")}`);
    }

    expect(headerMore).toEqual(mobileMore);
    expect(headerMore).toEqual(footerMore);
    expect(headerMore.size).toBe(NAV_MORE.length);
  });
});
