import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { normalizeSpaPath } from '@shared/spa-routes';
import type { PeggyHandoff } from './theme';

const MARKER = 'peggy-review';
const TRANSFER_TTL_MS = 10 * 60 * 1000;

type ReviewTransport = {
  prepare: (handoff: PeggyHandoff) => string;
  take: (marker: string) => PeggyHandoff | null;
  clear: () => void;
};
const ReviewContext = createContext<ReviewTransport | null>(null);

/** One in-memory transfer, expiring after ten minutes, across the two public shells. No transcript is put
 * in browser storage, history state, or the URL. Contact consumes it once and
 * owns the editable draft until that destination is left. */
export function PeggyReviewHandoffProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const search = useSearch();
  const pending = useRef<{ marker: string; handoff: PeggyHandoff; expiresAt: number } | null>(null);
  const transport = useMemo<ReviewTransport>(() => {
    let expiry: ReturnType<typeof setTimeout> | undefined;
    const clear = () => {
      pending.current = null;
      clearTimeout(expiry);
      expiry = undefined;
    };
    return {
      clear,
      prepare(handoff) {
        clear();
        const marker = crypto.randomUUID();
        pending.current = {
          marker,
          handoff: { ...handoff, transcript: handoff.transcript.map(turn => ({ ...turn })) },
          expiresAt: Date.now() + TRANSFER_TTL_MS,
        };
        expiry = setTimeout(clear, TRANSFER_TTL_MS);
        return `/contact?${MARKER}=${marker}`;
      },
      take(marker) {
        const entry = pending.current;
        clear();
        return entry?.marker === marker && entry.expiresAt > Date.now() ? entry.handoff : null;
      },
    };
  }, []);

  useEffect(() => {
    const marker = new URLSearchParams(search).get(MARKER);
    if (normalizeSpaPath(location) !== '/contact' || pending.current?.marker !== marker) {
      transport.clear();
    }
  }, [location, search, transport]);
  useEffect(() => transport.clear, [transport]);

  return <ReviewContext.Provider value={transport}>{children}</ReviewContext.Provider>;
}

export function useBeginPeggyReview() {
  const transport = useContext(ReviewContext);
  return useCallback((handoff: PeggyHandoff) => {
    if (!transport) throw new Error('Peggy review requires the shared handoff provider');
    return transport.prepare(handoff);
  }, [transport]);
}

export function usePreparedPeggyReview() {
  const search = useSearch();
  const marker = new URLSearchParams(search).get(MARKER);
  const transport = useContext(ReviewContext);
  const consumed = useRef<string | null>(null);
  const [draft, setDraft] = useState<{ marker: string; handoff: PeggyHandoff | null } | null>(null);

  useEffect(() => {
    // StrictMode repeats effects; consuming twice must not erase the draft.
    if (consumed.current === marker) return;
    consumed.current = marker;
    setDraft(marker ? { marker, handoff: transport?.take(marker) ?? null } : null);
  }, [marker, transport]);

  return {
    marker,
    pending: !!marker && draft?.marker !== marker,
    handoff: marker && draft?.marker === marker ? draft.handoff : null,
  };
}
