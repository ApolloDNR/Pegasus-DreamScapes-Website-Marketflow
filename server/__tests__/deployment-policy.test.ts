import { describe, expect, it } from "vitest";
import {
  CANONICAL_SITE_HOSTNAME,
  isCanonicalRequest,
  isRequestIndexable,
  publicCommitIdentifier,
  resolveDeploymentPolicy,
  resolveSourceSha,
} from "../deployment-policy";

const VERCEL_SHA = "a".repeat(40);
const FALLBACK_SHA = "b".repeat(40);

describe("deployment indexing policy", () => {
  it("fails closed unless production indexing is explicitly enabled", () => {
    for (const environment of [
      {},
      { APP_ENV: "production" },
      { SITE_INDEXABLE: "true" },
      { APP_ENV: "preview", SITE_INDEXABLE: "true" },
      { APP_ENV: "production", SITE_INDEXABLE: "false" },
    ]) {
      const policy = resolveDeploymentPolicy(environment);
      expect(isRequestIndexable(CANONICAL_SITE_HOSTNAME, policy)).toBe(false);
    }
  });

  it("allows indexing only for an explicit production request on the canonical host", () => {
    const policy = resolveDeploymentPolicy({
      APP_ENV: "production",
      SITE_INDEXABLE: "true",
    });

    expect(isRequestIndexable("pegasusdreamscapes.com", policy)).toBe(true);
    expect(isRequestIndexable("PEGASUSDREAMSCAPES.COM:443", policy)).toBe(true);
    expect(isRequestIndexable("www.pegasusdreamscapes.com", policy)).toBe(false);
    expect(isRequestIndexable("preview.example.com", policy)).toBe(false);
    expect(isCanonicalRequest("pegasusdreamscapes.com.evil.test", policy)).toBe(
      false,
    );
  });

  it("accepts only full hexadecimal source SHAs and prefers Vercel's SHA", () => {
    expect(
      resolveSourceSha({
        VERCEL_GIT_COMMIT_SHA: VERCEL_SHA.toUpperCase(),
        PEGASUS_SOURCE_SHA: FALLBACK_SHA,
      }),
    ).toBe(VERCEL_SHA);
    expect(
      resolveSourceSha({
        VERCEL_GIT_COMMIT_SHA: "short-sha",
        PEGASUS_SOURCE_SHA: FALLBACK_SHA,
      }),
    ).toBe(FALLBACK_SHA);
    expect(resolveSourceSha({ PEGASUS_SOURCE_SHA: "1234567" })).toBeNull();
    expect(resolveSourceSha({ PEGASUS_SOURCE_SHA: "g".repeat(40) })).toBeNull();
  });

  it("uses a non-forgeable sentinel when no validated commit is available", () => {
    const policy = resolveDeploymentPolicy({
      APP_ENV: "preview",
      VERCEL_GIT_COMMIT_SHA: "untrusted-value",
    });

    expect(policy.sourceSha).toBeNull();
    expect(publicCommitIdentifier(policy)).toBe("unknown");
  });
});
