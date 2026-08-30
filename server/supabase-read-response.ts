import type { Response } from 'express';

import { isSupabaseInfrastructureError } from './supabase-storage';

export const SUPABASE_READ_UNAVAILABLE_RESPONSE = Object.freeze({
  message: 'MarketFlow data is temporarily unavailable. Please try again.',
  code: 'SUPABASE_INFRASTRUCTURE_UNAVAILABLE',
});

/** Send a stable 503 without exposing upstream error details. */
export function sendSupabaseInfrastructureError(
  res: Response,
  error: unknown,
): boolean {
  if (!isSupabaseInfrastructureError(error)) return false;
  res.status(503).json(SUPABASE_READ_UNAVAILABLE_RESPONSE);
  return true;
}

/**
 * Runs the authoritative read used by a mounted route. A successful empty
 * array stays a normal 200 response; typed infrastructure failures become
 * retryable 503 responses; unrelated programming errors remain throwable.
 */
export async function sendSupabaseReadResponse<T>(
  res: Response,
  read: () => Promise<T>,
): Promise<void> {
  try {
    const payload = await read();
    res.status(200).json(payload);
  } catch (error) {
    if (sendSupabaseInfrastructureError(res, error)) return;
    throw error;
  }
}
