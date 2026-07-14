/**
 * In-memory audio cache by content hash.
 * Good enough for MVP / single-instance Vercel serverless warm instances.
 * (Survives within a process; not shared across cold starts — acceptable for demo.)
 */

import { createHash } from "crypto";

export type CachedAudio = {
  buffer: Buffer;
  contentType: string;
  createdAt: number;
};

const cache = new Map<string, CachedAudio>();
const MAX_ENTRIES = 64;
const TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

export function hashText(text: string, salt = ""): string {
  return createHash("sha256").update(`${salt}:${text}`).digest("hex");
}

export function getCachedAudio(key: string): CachedAudio | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.createdAt > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit;
}

export function setCachedAudio(
  key: string,
  buffer: Buffer,
  contentType: string,
): void {
  if (cache.size >= MAX_ENTRIES) {
    // Drop oldest
    const oldest = [...cache.entries()].sort(
      (a, b) => a[1].createdAt - b[1].createdAt,
    )[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(key, { buffer, contentType, createdAt: Date.now() });
}
