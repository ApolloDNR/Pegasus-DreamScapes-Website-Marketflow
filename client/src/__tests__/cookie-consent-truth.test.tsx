import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CookieConsent } from "@/components/cookie-consent";
import { CONSENT_STORAGE_KEY } from "@/lib/consent";

describe("cookie consent storage disclosures", () => {
  beforeEach(() => {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document.body.classList.remove("pg-cookie-visible");
  });

  it("truthfully describes local browser storage in compact and detailed views", () => {
    render(<CookieConsent />);
    act(() => vi.advanceTimersByTime(350));

    expect(screen.getByTestId("cookie-consent-banner")).toHaveTextContent(
      /local browser storage.*theme and consent choices/i,
    );
    expect(screen.getByTestId("cookie-consent-banner")).not.toHaveTextContent(
      /essential cookies/i,
    );

    fireEvent.click(screen.getByTestId("button-cookie-customize"));

    expect(screen.getByTestId("cookie-consent-details")).toHaveTextContent(
      /local browser storage.*theme and consent choices/i,
    );
    expect(screen.getByTestId("cookie-consent-details")).not.toHaveTextContent(
      /cookie|store your theme/i,
    );
    expect(screen.getByRole("switch", { name: "Essential preference" })).toBeDisabled();
  });

  it("keeps keyboard focus through preferences without interrupting the initial visit", () => {
    render(<CookieConsent />);
    act(() => vi.advanceTimersByTime(350));
    expect(screen.getByTestId("button-cookie-customize")).not.toHaveFocus();
    fireEvent.click(screen.getByTestId("button-cookie-customize"));
    expect(screen.getByRole("button", { name: "Close privacy preferences" })).toHaveFocus();
    fireEvent.keyDown(screen.getByTestId("cookie-consent-banner"), { key: "Escape" });
    expect(screen.getByTestId("button-cookie-customize")).toHaveFocus();
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
  });

  it("offers only the active analytics purpose and never grants future marketing consent", () => {
    render(<CookieConsent />);
    act(() => vi.advanceTimersByTime(350));
    fireEvent.click(screen.getByTestId("button-cookie-customize"));
    expect(screen.queryByRole("switch", { name: "Marketing preference" })).not.toBeInTheDocument();
    expect(screen.getByText("Marketing tracking is not used.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Analytics preference" }));
    fireEvent.click(screen.getByTestId("button-cookie-save"));
    expect(JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY)!)).toMatchObject({ analytics: true, marketing: false });
  });

  it("leaves existing consent records unchanged until a visitor makes a new choice", () => {
    const existing = JSON.stringify({ essential: true, analytics: false, marketing: true, decidedAt: '2026-09-01T00:00:00Z' });
    window.localStorage.setItem(CONSENT_STORAGE_KEY, existing);
    render(<CookieConsent />);
    act(() => vi.advanceTimersByTime(350));
    expect(screen.queryByTestId("cookie-consent-banner")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe(existing);
  });
});
