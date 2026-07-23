const PREVIEW_SUFFIXES = [
  ".replit.dev",
  ".replit.app",
  ".repl.co",
  ".onrender.com",
  ".vercel.app",
  ".netlify.app",
  ".pages.dev",
] as const;

/**
 * Preview deployments must never compete with the canonical production site.
 * Accept either a hostname or a Host header; ports and casing are normalized.
 */
export function isPreviewHostname(rawHost: string): boolean {
  const host = rawHost.trim().toLowerCase().replace(/:\d+$/, "");

  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    PREVIEW_SUFFIXES.some((suffix) => host.endsWith(suffix))
  );
}
