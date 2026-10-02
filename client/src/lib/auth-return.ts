const INTERNAL_ORIGIN = "https://pegasus.internal";

const AUTH_LOOP_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/api/login",
  "/api/callback",
  "/auth/callback",
]);

function normalizedLoopPath(pathname: string): string {
  const lower = pathname.toLowerCase();
  return lower.length > 1 ? lower.replace(/\/+$/, "") : lower;
}

function parseInternalPath(candidate: unknown): URL | null {
  if (typeof candidate !== "string" || candidate.length === 0) return null;
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return null;
  if (/[\\\u0000-\u001f\u007f]/.test(candidate)) return null;

  try {
    const parsed = new URL(candidate, INTERNAL_ORIGIN);
    return parsed.origin === INTERNAL_ORIGIN ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Accept only a root-relative, same-site destination. The returned value is
 * URL-normalized so dot segments cannot disguise an auth loop.
 */
export function sanitizeInternalReturnTo(candidate: unknown): string | null {
  const parsed = parseInternalPath(candidate);
  if (!parsed) return null;
  if (AUTH_LOOP_PATHS.has(normalizedLoopPath(parsed.pathname))) return null;
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

export function getReturnToFromSearch(search: string): string | null {
  const params = new URLSearchParams(search.replace(/^\?/, ""));
  return sanitizeInternalReturnTo(params.get("returnTo"));
}

export function withReturnTo(authPath: string, returnTo: unknown): string {
  const target = parseInternalPath(authPath);
  if (!target) return "/login";

  const safeReturnTo = sanitizeInternalReturnTo(returnTo);
  if (safeReturnTo) target.searchParams.set("returnTo", safeReturnTo);
  return `${target.pathname}${target.search}${target.hash}`;
}

export function intendedPathWithSearch(
  pathname: string,
  search: string,
): string {
  const normalizedSearch = search.replace(/^\?/, "");
  const intended = `${pathname}${normalizedSearch ? `?${normalizedSearch}` : ""}`;
  return sanitizeInternalReturnTo(intended) ?? "/";
}
