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

const STRATEGIES_KEY = 'pg:saved:strategies';
const CHATS_KEY = 'pg:saved:chats';
const EVENT = 'pg:saved:changed';

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT));
}

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — fail silently */
  }
  emit();
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

export function addStrategy(title: string, model: StrategyPreview): SavedStrategy {
  const row: SavedStrategy = { id: newId(), title, model, createdAt: new Date().toISOString() };
  write(STRATEGIES_KEY, [row, ...listStrategies()]);
  return row;
}

export function addChat(title: string, transcript: ChatTurn[]): SavedChat {
  const row: SavedChat = { id: newId(), title, transcript, createdAt: new Date().toISOString() };
  write(CHATS_KEY, [row, ...listChats()]);
  return row;
}

export function deleteStrategy(id: string) {
  write(STRATEGIES_KEY, listStrategies().filter((s) => s.id !== id));
}

export function deleteChat(id: string) {
  write(CHATS_KEY, listChats().filter((c) => c.id !== id));
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
