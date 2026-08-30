import { describe, expect, it } from "vitest";
import { isNotFoundUrl } from "@/pegasus/routes";

describe("SPA route classification", () => {
  it.each([
    "/",
    "/about",
    "/about/",
    "/forgot-password?returnTo=%2Fmarketflow",
    "/reset-password?code=recovery-code",
    "/bring-an-opportunity?intent=owner",
    "/projects/nelson-dr",
    "/marketflow/access",
    "/marketflow/deals/42",
    "/marketflow/deals/42/negotiate",
    "/marketflow/listings/42",
    "/marketflow/admin/users/42",
    "/marketplace/deals/42/negotiate",
    "/marketplace/properties/east-bay/listing-42",
    "/profile/user-42",
    "/submit",
  ])("recognizes the real exact or patterned route %s", (pathname) => {
    expect(isNotFoundUrl(pathname)).toBe(false);
  });

  it.each([
    "/definitely-missing",
    "/privacy/extra",
    "/marketflow/access/extra",
    "/projects/a-real-project",
    "/projects/one/two",
    "/snapshot",
    "/profile",
    "/marketflow/negotiate/only-one-part",
    "/library/a-real-article",
  ])("rejects the invalid route %s", (pathname) => {
    expect(isNotFoundUrl(pathname)).toBe(true);
  });
});
