/**
 * Strategy Lab — Account Wall state hook (Task #100).
 *
 * Extracted from `client/src/pages/strategy-lab.tsx` so the behavior is
 * unit-testable. Owns:
 *  - `accountWallOpen` / `accountWallReason` UI state
 *  - the session-scoped "dismissed" flag (`pegasus.lab.wallDismissed`)
 *  - `openAccountWall(reason, { force })` — no-op once dismissed unless
 *    `force` is passed
 *  - `handleWallOpenChange(open)` — Radix Dialog open-change handler that
 *    persists dismissal to sessionStorage
 *  - `ensureAuth(reason)` — used by Save/Share/PDF/Submit. Returns true
 *    when already authenticated; otherwise opens the wall (suppressed
 *    once the user has dismissed it this session) AND fires a parallel
 *    sign-in toast that is always visible. Returns false in the gated
 *    case. Task #101: the modal does not re-pop on subsequent gated
 *    clicks after dismissal — the toast carries the message.
 *
 * The regression this guards: the wall used to re-pop on every keystroke
 * because the run-limit effect re-ran without consulting a dismissal
 * flag. See `client/src/__tests__/strategy-lab/account-wall.test.tsx`.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const DISMISSED_KEY = "pegasus.lab.wallDismissed";

type ToastFn = (args: { title: string; description?: string }) => void;

export interface UseAccountWallArgs {
  isAuthenticated: boolean;
  toast: ToastFn;
}

export interface UseAccountWallResult {
  accountWallOpen: boolean;
  accountWallReason: string;
  openAccountWall: (reason: string, opts?: { force?: boolean }) => void;
  handleWallOpenChange: (open: boolean) => void;
  ensureAuth: (reason: string) => boolean;
  wallDismissedRef: React.MutableRefObject<boolean>;
}

export function useAccountWall({
  isAuthenticated,
  toast,
}: UseAccountWallArgs): UseAccountWallResult {
  const [accountWallOpen, setAccountWallOpen] = useState(false);
  const [accountWallReason, setAccountWallReason] = useState<string>("");

  const wallDismissedRef = useRef<boolean>(
    typeof window !== "undefined" &&
      window.sessionStorage?.getItem(DISMISSED_KEY) === "1",
  );

  const isAuthenticatedRef = useRef(isAuthenticated);
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
    if (isAuthenticated) {
      wallDismissedRef.current = false;
      try {
        window.sessionStorage?.removeItem(DISMISSED_KEY);
      } catch {
        /* ignore */
      }
    }
  }, [isAuthenticated]);

  const openAccountWall = useCallback(
    (reason: string, opts?: { force?: boolean }) => {
      if (!opts?.force && wallDismissedRef.current) return;
      setAccountWallReason(reason);
      setAccountWallOpen(true);
    },
    [],
  );

  const handleWallOpenChange = useCallback((open: boolean) => {
    setAccountWallOpen(open);
    if (!open) {
      wallDismissedRef.current = true;
      try {
        window.sessionStorage?.setItem(DISMISSED_KEY, "1");
      } catch {
        /* ignore */
      }
    }
  }, []);

  const ensureAuth = useCallback(
    (reason: string) => {
      if (isAuthenticatedRef.current) return true;
      // Explicit gated actions (Save / Share / PDF / Submit):
      //   - First call (wall has never been dismissed this session) →
      //     open the wall AND fire a toast.
      //   - Subsequent calls after the user dismissed the wall → toast
      //     ONLY. Do not re-pop the modal; the user has already seen and
      //     dismissed it once this session, and re-opening it on every
      //     click is the regression Task #101 guards against.
      openAccountWall(reason);
      toast({
        title: "Sign in to continue",
        description: `Sign in to ${reason}.`,
      });
      return false;
    },
    [openAccountWall, toast],
  );

  return {
    accountWallOpen,
    accountWallReason,
    openAccountWall,
    handleWallOpenChange,
    ensureAuth,
    wallDismissedRef,
  };
}
