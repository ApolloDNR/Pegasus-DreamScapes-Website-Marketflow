import { sanitizeInternalReturnTo, withReturnTo } from "@/lib/auth-return";

export type PasswordRecoveryLinkState =
  | { kind: "candidate" }
  | { kind: "expired" }
  | { kind: "invalid" };

function parseUrlParams(raw: string): URLSearchParams {
  return new URLSearchParams(raw.replace(/^[?#]/, ""));
}

function firstParam(
  query: URLSearchParams,
  fragment: URLSearchParams,
  name: string,
): string | null {
  return query.get(name) ?? fragment.get(name);
}

/**
 * Inspect both Supabase callback shapes:
 * - PKCE: `?code=...`
 * - implicit: `#access_token=...&type=recovery`
 *
 * Error details can also arrive in either location. We intentionally reduce
 * them to stable UI states instead of echoing provider text into the page.
 */
export function inspectPasswordRecoveryLocation(
  search: string,
  hash: string,
): PasswordRecoveryLinkState {
  const query = parseUrlParams(search);
  const fragment = parseUrlParams(hash);
  const error = firstParam(query, fragment, "error");
  const errorCode = firstParam(query, fragment, "error_code")?.toLowerCase();
  const errorDescription = firstParam(
    query,
    fragment,
    "error_description",
  )?.toLowerCase();

  if (error || errorCode || errorDescription) {
    const providerFailure = `${error ?? ""} ${errorCode ?? ""} ${errorDescription ?? ""}`;
    return /expired|otp_expired|token_expired/.test(providerFailure)
      ? { kind: "expired" }
      : { kind: "invalid" };
  }

  const type = firstParam(query, fragment, "type")?.toLowerCase();
  const hasCallbackCredential = Boolean(
    firstParam(query, fragment, "code") ||
      firstParam(query, fragment, "token_hash") ||
      firstParam(query, fragment, "access_token"),
  );

  return type === "recovery" || hasCallbackCredential
    ? { kind: "candidate" }
    : { kind: "invalid" };
}

export function buildPasswordRecoveryRedirect(
  origin: string,
  returnTo: unknown,
): string {
  const safeOrigin = new URL(origin).origin;
  const resetPath = withReturnTo(
    "/reset-password",
    sanitizeInternalReturnTo(returnTo),
  );
  return new URL(resetPath, safeOrigin).href;
}

export function isExpiredPasswordRecoveryError(error: unknown): boolean {
  const candidate = error as { message?: unknown; status?: unknown } | null;
  const message =
    typeof candidate?.message === "string" ? candidate.message.toLowerCase() : "";
  const status = typeof candidate?.status === "number" ? candidate.status : null;
  return (
    status === 401 ||
    /expired|invalid (?:jwt|token)|session.*(?:missing|invalid)|refresh token/.test(
      message,
    )
  );
}

export function passwordUpdateErrorMessage(error: unknown): string {
  const candidate = error as { message?: unknown } | null;
  const message =
    typeof candidate?.message === "string" ? candidate.message.toLowerCase() : "";

  if (/same|different from the old|different password/.test(message)) {
    return "Choose a password you have not used for this account.";
  }
  if (/weak|strength|at least|characters/.test(message)) {
    return "Choose a stronger password with at least 8 characters.";
  }
  return "We couldn't update your password. Review the fields and try again.";
}
