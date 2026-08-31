import { useSyncExternalStore } from 'react';
import type { ChatTurn } from './theme';

// The prototype's "saved workspace" originally relied on Clerk + a hosted
// api-client. This app keeps it self-contained with localStorage so the
// Save model / Save chat features keep working without new backend surface.

export type StrategyPreview = {
  acquisition: number;
  rehab: number;
  arv: number;
  allIn: number;
  spread: number;
  margin: number;
  lane: string;
  holdMonths: number;
  carry: number;
  exitCosts: number;
  netProceeds: number;
  cashOnCost: number;
};

export type SavedStrategy = {
  id: string;
  title: string;
  model: StrategyPreview;
  createdAt: string;
};

export type SavedChat = {
  id: string;
  title: string;
  transcript: ChatTurn[];
  createdAt: string;
};

type SavedStoreFailure = { ok: false; error: Error };

export type SavedStoreResult<T> =
  | { ok: true; value: T }
  | SavedStoreFailure;

const STRATEGIES_KEY = 'pg:saved:strategies';
const CHATS_KEY = 'pg:saved:chats';
const EVENT = 'pg:saved:changed';

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT));
}

function normalizeStorageError(cause: unknown): Error {
  if (cause instanceof Error) return cause;
  const record = cause && typeof cause === 'object'
    ? (cause as { message?: unknown; name?: unknown })
    : null;
  const error = new Error(
    typeof record?.message === 'string'
      ? record.message
      : 'Browser storage write failed',
  );
  if (typeof record?.name === 'string') error.name = record.name;
  return error;
}

// useSyncExternalStore requires getSnapshot to return a STABLE reference when
// nothing changed - otherwise React sees a new value on every render and loops
// ("Maximum update depth exceeded"). Cache the parsed array per key and only
// produce a new reference when the underlying localStorage string changes.
const EMPTY: readonly never[] = Object.freeze([]);
const snapshotCache = new Map<string, { raw: string | null; value: unknown[] }>();

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return EMPTY as unknown as T[];
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return EMPTY as unknown as T[];
  }
  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) return cached.value as T[];
  let value: T[];
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : EMPTY;
    value = Array.isArray(parsed)
      ? (parsed as T[])
      : (EMPTY as unknown as T[]);
  } catch {
    value = EMPTY as unknown as T[];
  }
  snapshotCache.set(key, { raw, value });
  return value;
}

function write<T>(key: string, value: T[]): SavedStoreResult<void> {
  if (typeof window === 'undefined') {
    return { ok: false, error: new Error('Browser storage is unavailable') };
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (cause) {
    return {
      ok: false,
      error: normalizeStorageError(cause),
    };
  }
  emit();
  return { ok: true, value: undefined };
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export function listStrategies(): SavedStrategy[] {
  return read<SavedStrategy>(STRATEGIES_KEY);
}

export function listChats(): SavedChat[] {
  return read<SavedChat>(CHATS_KEY);
}

export function addStrategy(
  title: string,
  model: StrategyPreview,
): SavedStoreResult<SavedStrategy> {
  const row: SavedStrategy = { id: newId(), title, model, createdAt: new Date().toISOString() };
  const result = write(STRATEGIES_KEY, [row, ...listStrategies()]);
  return result.ok ? { ok: true, value: row } : result;
}

export function addChat(
  title: string,
  transcript: ChatTurn[],
): SavedStoreResult<SavedChat> {
  const row: SavedChat = { id: newId(), title, transcript, createdAt: new Date().toISOString() };
  const result = write(CHATS_KEY, [row, ...listChats()]);
  return result.ok ? { ok: true, value: row } : result;
}

export function deleteStrategy(id: string): SavedStoreResult<void> {
  return write(STRATEGIES_KEY, listStrategies().filter((s) => s.id !== id));
}

export function deleteChat(id: string): SavedStoreResult<void> {
  return write(CHATS_KEY, listChats().filter((c) => c.id !== id));
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = () => cb();
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

export function useSavedStrategies(): SavedStrategy[] {
  return useSyncExternalStore(subscribe, listStrategies, () => []);
}

export function useSavedChats(): SavedChat[] {
  return useSyncExternalStore(subscribe, listChats, () => []);
}
