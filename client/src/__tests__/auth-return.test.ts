import { describe, expect, it } from "vitest";
import {
  getReturnToFromSearch,
  intendedPathWithSearch,
  sanitizeInternalReturnTo,
  withReturnTo,
} from "@/lib/auth-return";

describe("safe authentication return destinations", () => {
  it("keeps root-relative destinations, including query and fragment", () => {
    expect(sanitizeInternalReturnTo("/marketflow/deals/42?tab=offer#terms")).toBe(
      "/marketflow/deals/42?tab=offer#terms",
    );
  });

  it.each([
    "https://attacker.example/steal",
    "//attacker.example/steal",
    "\\\\attacker.example\\steal",
    "/safe\\redirect",
    "/safe\nredirect",
    "marketflow/deals",
    "",
  ])("rejects a non-internal or ambiguous destination: %s", (candidate) => {
    expect(sanitizeInternalReturnTo(candidate)).toBeNull();
  });

  it.each([
    "/login",
    "/LOGIN/",
    "/signup?next=/marketflow",
    "/forgot-password",
    "/reset-password?code=secret",
    "/auth/callback",
    "/api/callback",
  ])("rejects auth-loop destinations: %s", (candidate) => {
    expect(sanitizeInternalReturnTo(candidate)).toBeNull();
  });

  it("normalizes dot segments before testing for an auth loop", () => {
    expect(sanitizeInternalReturnTo("/marketflow/../login")).toBeNull();
  });

  it("reads and decodes only a safe returnTo query parameter", () => {
    expect(
      getReturnToFromSearch(
        "?returnTo=%2Fmarketflow%2Fdeals%2F42%3Ftab%3Doffer",
      ),
    ).toBe("/marketflow/deals/42?tab=offer");
    expect(
      getReturnToFromSearch("?returnTo=https%3A%2F%2Fattacker.example"),
    ).toBeNull();
  });

  it("adds a safe return destination to an auth link", () => {
    expect(withReturnTo("/login", "/marketflow/deals/42?tab=offer")).toBe(
      "/login?returnTo=%2Fmarketflow%2Fdeals%2F42%3Ftab%3Doffer",
    );
    expect(withReturnTo("/login", "https://attacker.example")).toBe("/login");
  });

  it("refuses an external auth entry point", () => {
    expect(withReturnTo("https://attacker.example", "/marketflow")).toBe(
      "/login",
    );
  });

  it("builds a safe intended route from pathname and search", () => {
    expect(intendedPathWithSearch("/marketflow/deals/42", "tab=offer")).toBe(
      "/marketflow/deals/42?tab=offer",
    );
    expect(intendedPathWithSearch("//attacker.example", "")).toBe("/");
  });
});
