import { describe, expect, it } from "vitest";
import { isNotFoundUrl } from "@/pegasus/routes";

describe("SPA route classification", () => {
  it.each([
    "/",
    "/about",
    "/about/",
    "/bring-an-opportunity?intent=owner",
    "/projects/nelson-dr",
    "/projects/a-real-project",
    "/marketflow/access",
    "/marketflow/deals/42",
    "/marketflow/deals/42/negotiate",
    "/marketflow/admin/users/42",
    "/profile/user-42",
    "/submit",
  ])("recognizes the real exact or patterned route %s", (pathname) => {
    expect(isNotFoundUrl(pathname)).toBe(false);
  });

  it.each([
    "/definitely-missing",
    "/privacy/extra",
    "/marketflow/access/extra",
    "/projects/one/two",
    "/snapshot",
    "/profile",
    "/marketflow/negotiate/only-one-part",
    "/library/a-real-article",
  ])("rejects the invalid route %s", (pathname) => {
    expect(isNotFoundUrl(pathname)).toBe(true);
  });
});
