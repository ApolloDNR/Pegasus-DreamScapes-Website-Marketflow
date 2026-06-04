declare global {
  interface Window {
    __PEGASUS_PORTAL_SERVICES_ENABLED__?: boolean;
  }
}

function readBooleanEnv(name: string): boolean {
  const importValue = (import.meta as { env?: Record<string, string | undefined> }).env?.[name];
  const processValue = (globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env?.[name];
  const value = importValue ?? processValue;
  return value === "true" || value === "1";
}

export function portalServicesEnabled(): boolean {
  if (typeof window !== "undefined" && typeof window.__PEGASUS_PORTAL_SERVICES_ENABLED__ === "boolean") {
    return window.__PEGASUS_PORTAL_SERVICES_ENABLED__;
  }

  return readBooleanEnv("VITE_PORTAL_SERVICES_ENABLED");
}

export function portalServicesUnavailableError(): Error {
  return new Error("Portal services are not enabled on this host.");
}
