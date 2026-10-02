import {
  PEGGY_ACCESS_EXPIRED_CODE,
  PEGGY_CONVERSATION_ACCESS_HEADER,
  type PeggyConversationAccessResponse,
} from "@shared/peggy-access";

export type PeggyFetchTransport = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface PeggyAccessCredentialRef {
  current: PeggyConversationAccessResponse | null;
}

export interface PeggyFetchWithSingleRefreshInput {
  fetcher: PeggyFetchTransport;
  credentialRef: PeggyAccessCredentialRef;
  input: string;
  init: RequestInit;
  onCredentialChange?: (
    credential: PeggyConversationAccessResponse,
  ) => void;
}

const REFRESH_FAILURE = "Peggy access refresh failed";

function throwIfAborted(signal: AbortSignal | null | undefined): void {
  if (!signal?.aborted) return;
  throw (
    signal.reason ??
    new DOMException("The operation was aborted", "AbortError")
  );
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException
      ? error.name === "AbortError"
      : Boolean(
          error &&
            typeof error === "object" &&
            "name" in error &&
            (error as { name?: unknown }).name === "AbortError",
        )
  );
}

function withCredential(
  init: RequestInit,
  accessToken: string,
): RequestInit {
  const headers = new Headers(init.headers);
  headers.set(PEGGY_CONVERSATION_ACCESS_HEADER, accessToken);
  return { ...init, headers };
}

function sameRow(
  credential: PeggyConversationAccessResponse | null,
  expected: PeggyConversationAccessResponse,
): credential is PeggyConversationAccessResponse {
  return credential !== null && credential.id === expected.id;
}

async function isExactExpiryResponse(
  response: Response,
  signal: AbortSignal | null | undefined,
): Promise<boolean> {
  if (response.status !== 401) return false;
  try {
    const body: unknown = await response.clone().json();
    throwIfAborted(signal);
    return Boolean(
      body &&
        typeof body === "object" &&
        !Array.isArray(body) &&
        (body as { code?: unknown }).code === PEGGY_ACCESS_EXPIRED_CODE,
    );
  } catch (error) {
    throwIfAborted(signal);
    if (isAbortError(error)) throw error;
    return false;
  }
}

function parseReplacement(
  value: unknown,
  expected: PeggyConversationAccessResponse,
): PeggyConversationAccessResponse | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) return null;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  const id = record.id;
  if (
    keys.length !== 2 ||
    !keys.includes("id") ||
    !keys.includes("accessToken") ||
    typeof id !== "number" ||
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    id !== expected.id ||
    typeof record.accessToken !== "string"
  ) {
    return null;
  }
  const accessToken = record.accessToken.trim();
  if (!accessToken || accessToken === expected.accessToken) return null;
  return { id, accessToken };
}

export async function peggyFetchWithSingleRefresh({
  fetcher,
  credentialRef,
  input,
  init,
  onCredentialChange,
}: PeggyFetchWithSingleRefreshInput): Promise<Response> {
  const captured = credentialRef.current;
  if (
    !captured ||
    !Number.isSafeInteger(captured.id) ||
    captured.id <= 0 ||
    !captured.accessToken
  ) {
    throw new Error("Peggy conversation access unavailable");
  }
  const signal = init.signal;
  throwIfAborted(signal);

  const original = await fetcher(
    input,
    withCredential(init, captured.accessToken),
  );
  throwIfAborted(signal);
  if (!(await isExactExpiryResponse(original, signal))) return original;
  throwIfAborted(signal);

  const beforeRefresh = credentialRef.current;
  if (!sameRow(beforeRefresh, captured)) return original;

  const refreshInit = withCredential(
    { ...init, method: "POST", body: undefined },
    captured.accessToken,
  );
  throwIfAborted(signal);
  const refreshResponse = await fetcher(
    `/api/peggy/conversations/${captured.id}/access/refresh`,
    refreshInit,
  );
  throwIfAborted(signal);
  if (!refreshResponse.ok) return refreshResponse;
  if (refreshResponse.status !== 200) throw new Error(REFRESH_FAILURE);

  let rawReplacement: unknown;
  try {
    rawReplacement = await refreshResponse.json();
    throwIfAborted(signal);
  } catch (error) {
    throwIfAborted(signal);
    if (isAbortError(error)) throw error;
    throw new Error(REFRESH_FAILURE);
  }
  const replacement = parseReplacement(rawReplacement, captured);
  if (!replacement) throw new Error(REFRESH_FAILURE);
  throwIfAborted(signal);

  let current = credentialRef.current;
  if (!sameRow(current, captured)) return original;
  if (current.accessToken === captured.accessToken) {
    credentialRef.current = replacement;
    onCredentialChange?.(replacement);
  }

  throwIfAborted(signal);
  current = credentialRef.current;
  if (
    !sameRow(current, captured) ||
    !current.accessToken ||
    current.accessToken === captured.accessToken
  ) {
    return original;
  }
  throwIfAborted(signal);
  const replay = await fetcher(input, withCredential(init, current.accessToken));
  throwIfAborted(signal);
  return replay;
}
