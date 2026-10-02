export const CANONICAL_SITE_HOSTNAME = "pegasusdreamscapes.com";
export const PREVIEW_ROBOTS_HEADER =
  "noindex, nofollow, noarchive, nosnippet";
export const PREVIEW_ROBOTS_BODY = "User-agent: *\nDisallow: /\n";

const FULL_GIT_SHA = /^[0-9a-f]{40}$/i;

export type DeploymentEnvironment = Record<string, string | undefined>;

export interface DeploymentPolicy {
  appEnvironment: string;
  canonicalHostname: string;
  indexingExplicitlyEnabled: boolean;
  sourceSha: string | null;
}

function normalizeHostname(rawHost: string | undefined): string | null {
  const candidate = rawHost?.trim();
  if (!candidate || /[\r\n]/.test(candidate)) return null;

  try {
    return new URL(`http://${candidate}`).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
}

export function resolveSourceSha(
  environment: DeploymentEnvironment = process.env,
): string | null {
  for (const candidate of [
    environment.VERCEL_GIT_COMMIT_SHA,
    environment.PEGASUS_SOURCE_SHA,
  ]) {
    const normalized = candidate?.trim().toLowerCase();
    if (normalized && FULL_GIT_SHA.test(normalized)) return normalized;
  }
  return null;
}

/**
 * Indexing is deliberately opt-in. A production process alone is insufficient:
 * APP_ENV and SITE_INDEXABLE must both be explicit, and each request must still
 * arrive on the canonical hostname before it can be crawlable.
 */
export function resolveDeploymentPolicy(
  environment: DeploymentEnvironment = process.env,
): DeploymentPolicy {
  const appEnvironment = environment.APP_ENV?.trim().toLowerCase() || "unknown";
  return {
    appEnvironment,
    canonicalHostname: CANONICAL_SITE_HOSTNAME,
    indexingExplicitlyEnabled:
      appEnvironment === "production" &&
      environment.SITE_INDEXABLE?.trim().toLowerCase() === "true",
    sourceSha: resolveSourceSha(environment),
  };
}

export function isCanonicalRequest(
  rawHost: string | undefined,
  policy: DeploymentPolicy,
): boolean {
  return normalizeHostname(rawHost) === policy.canonicalHostname;
}

export function isRequestIndexable(
  rawHost: string | undefined,
  policy: DeploymentPolicy,
): boolean {
  return policy.indexingExplicitlyEnabled && isCanonicalRequest(rawHost, policy);
}

export function publicCommitIdentifier(policy: DeploymentPolicy): string {
  return policy.sourceSha ?? "unknown";
}
