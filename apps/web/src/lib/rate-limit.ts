import type { NextRequest } from 'next/server';

/**
 * In-memory sliding-window rate limiter.
 *
 * Per-instance memory: the window lives in this process only, resets on every
 * deploy/cold-start, and is bypassable via IP rotation. This is demo-grade
 * cost control, NOT a security control.
 */

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60_000;
// Hard cap on tracked keys so a key-spray cannot grow memory unbounded.
const MAX_KEYS = 5_000;

const windows = new Map<string, number[]>();

export function rateLimit(
  key: string,
  opts?: { limit?: number; windowMs?: number },
): { ok: boolean; retryAfterSec: number } {
  const limit = opts?.limit ?? DEFAULT_LIMIT;
  const windowMs = opts?.windowMs ?? DEFAULT_WINDOW_MS;
  const now = Date.now();

  // Prune expired timestamps on access.
  const prior = windows.get(key) ?? [];
  const live = prior.filter((t) => now - t < windowMs);

  if (live.length >= limit) {
    const oldest = live[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    windows.set(key, live);
    return { ok: false, retryAfterSec };
  }

  live.push(now);
  windows.set(key, live);

  // Oldest-eviction past the cap (Map preserves insertion order).
  while (windows.size > MAX_KEYS) {
    const oldestKey = windows.keys().next().value;
    if (oldestKey === undefined) break;
    windows.delete(oldestKey);
  }

  return { ok: true, retryAfterSec: 0 };
}

export function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  return first || 'unknown';
}
