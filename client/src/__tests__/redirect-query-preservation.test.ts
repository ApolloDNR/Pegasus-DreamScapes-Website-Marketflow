import { describe, expect, it } from "vitest";
import {
  appendRedirectSearch,
  QUERY_PRESERVING_INTAKE_PATHS,
} from "@shared/redirects";

describe("legacy intake query preservation", () => {
  it("keeps Blueprint, address, and referral context on the canonical target", () => {
    expect(
      appendRedirectSearch(
        "/bring-an-opportunity",
        "?intent=blueprint&address=19%20Bay%20View%20Ave&ref=apollo-partner",
      ),
    ).toBe(
      "/bring-an-opportunity?intent=blueprint&address=19%20Bay%20View%20Ave&ref=apollo-partner",
    );
  });

  it("merges into a target that already has an intent", () => {
    expect(appendRedirectSearch("/bring-an-opportunity?intent=deal-jv", "utm_source=partner"))
      .toBe("/bring-an-opportunity?intent=deal-jv&utm_source=partner");
  });

  it("keeps the target intent authoritative while preserving attribution", () => {
    expect(
      appendRedirectSearch(
        "/bring-an-opportunity?intent=deal-jv",
        "intent=sell&address=19%20Bay%20View%20Ave&ref=apollo",
      ),
    ).toBe(
      "/bring-an-opportunity?intent=deal-jv&address=19%20Bay%20View%20Ave&ref=apollo",
    );
  });

  it("covers every retired intake alias that must preserve context", () => {
    expect([...QUERY_PRESERVING_INTAKE_PATHS].sort()).toEqual([
      "/investments",
      "/submit",
      "/submit-deal",
      "/submit-property",
      "/wholesale",
    ]);
  });

  it("preserves attribution when the public investments solicitation retires to Capital", () => {
    expect(
      appendRedirectSearch(
        "/capital",
        "?utm_source=printed-card&relationship=development",
      ),
    ).toBe("/capital?utm_source=printed-card&relationship=development");
  });
});
