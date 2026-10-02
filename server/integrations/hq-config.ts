export type HqEnvironment = Record<string, string | undefined>;

function isProductionEnvironment(
  environment: HqEnvironment = process.env,
): boolean {
  if (environment.APP_ENV) {
    return environment.APP_ENV === "production";
  }
  return environment.NODE_ENV === "production";
}

export function getConfiguredHqEndpoint(
  environment: HqEnvironment = process.env,
): string | null {
  const raw = environment.PEGASUS_HQ_PUBLIC_INTAKE_URL?.trim();
  if (!raw) return null;

  try {
    const endpoint = new URL(raw);
    if (endpoint.protocol !== "http:" && endpoint.protocol !== "https:") {
      return null;
    }
    if (
      isProductionEnvironment(environment) &&
      endpoint.protocol !== "https:"
    ) {
      return null;
    }
    if (endpoint.username || endpoint.password) return null;
    return endpoint.toString();
  } catch {
    return null;
  }
}

export function hasRequiredHqEndpointConfiguration(
  environment: HqEnvironment = process.env,
): boolean {
  return (
    !isProductionEnvironment(environment) ||
    getConfiguredHqEndpoint(environment) !== null
  );
}

/** The authenticated website bridge has its own endpoint, never the legacy one. */
export function getConfiguredWebsiteHqEndpoint(
  environment: HqEnvironment = process.env,
): string | null {
  const raw = environment.PEGASUS_HQ_WEBSITE_INQUIRY_URL?.trim();
  if (!raw) return null;
  try {
    const endpoint = new URL(raw);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.hash) return null;
    return endpoint.toString();
  } catch {
    return null;
  }
}
