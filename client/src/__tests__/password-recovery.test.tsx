import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import {
  buildPasswordRecoveryRedirect,
  inspectPasswordRecoveryLocation,
  isExpiredPasswordRecoveryError,
  passwordUpdateErrorMessage,
} from "@/lib/password-recovery";

const mocks = vi.hoisted(() => ({
  getSupabase: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  onAuthStateChange: vi.fn(),
  getSession: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
  unsubscribe: vi.fn(),
  useSEO: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({ getSupabase: mocks.getSupabase }));
vi.mock("@/hooks/use-seo", () => ({ useSEO: mocks.useSEO }));

function fakeSupabase() {
  return {
    auth: {
      resetPasswordForEmail: mocks.resetPasswordForEmail,
      onAuthStateChange: mocks.onAuthStateChange,
      getSession: mocks.getSession,
      updateUser: mocks.updateUser,
      signOut: mocks.signOut,
    },
  };
}

function setBrowserLocation(path: string) {
  window.history.pushState({}, "", path);
}

beforeEach(() => {
  setBrowserLocation("/");
  vi.clearAllMocks();
  mocks.getSupabase.mockResolvedValue(fakeSupabase());
  mocks.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
  mocks.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mocks.unsubscribe } },
  });
  mocks.getSession.mockResolvedValue({
    data: { session: { user: { id: "user-1" } } },
    error: null,
  });
  mocks.updateUser.mockResolvedValue({ data: { user: {} }, error: null });
  mocks.signOut.mockResolvedValue({ error: null });
});

afterEach(() => {
  cleanup();
  setBrowserLocation("/");
});

describe("password recovery URL handling", () => {
  it("accepts the PKCE and implicit Supabase callback shapes", () => {
    expect(inspectPasswordRecoveryLocation("?code=pkce-code", "")).toEqual({
      kind: "candidate",
    });
    expect(
      inspectPasswordRecoveryLocation(
        "",
        "#access_token=access&type=recovery&refresh_token=refresh",
      ),
    ).toEqual({ kind: "candidate" });
  });

  it("distinguishes expired provider callbacks from malformed links", () => {
    expect(
      inspectPasswordRecoveryLocation(
        "?error=access_denied&error_code=otp_expired",
        "",
      ),
    ).toEqual({ kind: "expired" });
    expect(
      inspectPasswordRecoveryLocation("?error=access_denied", ""),
    ).toEqual({ kind: "invalid" });
    expect(inspectPasswordRecoveryLocation("", "")).toEqual({
      kind: "invalid",
    });
  });

  it("keeps redirect URLs on the supplied origin and drops unsafe returnTo", () => {
    expect(
      buildPasswordRecoveryRedirect(
        "https://pegasusdreamscapes.com/ignored",
        "/marketflow/deals/42?tab=offer",
      ),
    ).toBe(
      "https://pegasusdreamscapes.com/reset-password?returnTo=%2Fmarketflow%2Fdeals%2F42%3Ftab%3Doffer",
    );
    expect(
      buildPasswordRecoveryRedirect(
        "https://pegasusdreamscapes.com",
        "https://attacker.example/steal",
      ),
    ).toBe("https://pegasusdreamscapes.com/reset-password");
  });

  it("classifies expired sessions and exposes only curated update errors", () => {
    expect(isExpiredPasswordRecoveryError({ status: 401 })).toBe(true);
    expect(
      isExpiredPasswordRecoveryError({ message: "Refresh Token Not Found" }),
    ).toBe(true);
    expect(passwordUpdateErrorMessage({ message: "User not found: secret" })).toBe(
      "We couldn't update your password. Review the fields and try again.",
    );
  });
});

describe("forgot-password request", () => {
  it("submits a safe redirect and always uses account-private success copy", async () => {
    setBrowserLocation(
      "/forgot-password?returnTo=%2Fmarketflow%2Fdeals%2F42%3Ftab%3Doffer",
    );
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await screen.findByRole("heading", { name: "Check your email" });
    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith(
      "owner@example.com",
      {
        redirectTo:
          "http://localhost:3000/reset-password?returnTo=%2Fmarketflow%2Fdeals%2F42%3Ftab%3Doffer",
      },
    );
    expect(screen.getByText(/If an account exists for owner@example.com/)).toBeVisible();
    expect(screen.getByTestId("link-return-login")).toHaveAttribute(
      "href",
      "/login?returnTo=%2Fmarketflow%2Fdeals%2F42%3Ftab%3Doffer",
    );
    expect(mocks.useSEO).toHaveBeenCalledWith(
      expect.objectContaining({ noIndex: true, noCanonical: true }),
    );
  });

  it("shows a stable failure without echoing provider account details", async () => {
    mocks.resetPasswordForEmail.mockResolvedValueOnce({
      data: {},
      error: { message: "User owner@example.com was not found" },
    });
    setBrowserLocation("/forgot-password");
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We couldn't send a reset email");
    expect(alert).not.toHaveTextContent("not found");
    expect(screen.queryByRole("heading", { name: "Check your email" })).toBeNull();
  });
});

describe("reset-password completion", () => {
  it("updates the password, ends the recovery session, and keeps a safe return", async () => {
    setBrowserLocation(
      "/reset-password?code=valid&returnTo=%2Fmarketflow%2Fdeals%2F42",
    );
    render(<ResetPasswordPage />);

    await screen.findByRole("heading", { name: "Choose a new password" });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "a-strong-password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "a-strong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await screen.findByRole("heading", { name: "Password updated" });
    expect(mocks.updateUser).toHaveBeenCalledWith({
      password: "a-strong-password",
    });
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(screen.getByTestId("link-login-after-reset")).toHaveAttribute(
      "href",
      "/login?returnTo=%2Fmarketflow%2Fdeals%2F42",
    );
  });

  it("renders an expired provider link without starting a session check", () => {
    setBrowserLocation(
      "/reset-password?error=access_denied&error_code=otp_expired",
    );
    render(<ResetPasswordPage />);

    expect(
      screen.getByRole("heading", { name: "Reset link expired" }),
    ).toBeVisible();
    expect(mocks.getSupabase).not.toHaveBeenCalled();
  });

  it("turns a callback without a recovery session into the expired state", async () => {
    mocks.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    setBrowserLocation("/reset-password?code=already-used");
    render(<ResetPasswordPage />);

    await screen.findByRole("heading", { name: "Reset link expired" });
    expect(mocks.unsubscribe).not.toHaveBeenCalled();
  });

  it("moves an expired update attempt out of the editable form", async () => {
    mocks.updateUser.mockResolvedValueOnce({
      data: { user: null },
      error: { status: 401, message: "JWT expired" },
    });
    setBrowserLocation("/reset-password?code=valid");
    render(<ResetPasswordPage />);

    await screen.findByRole("heading", { name: "Choose a new password" });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "a-strong-password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "a-strong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Reset link expired" }),
      ).toBeVisible(),
    );
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
