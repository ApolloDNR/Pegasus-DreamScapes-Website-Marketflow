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
});
