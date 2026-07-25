/**
 * Small in-memory rate limiter for the paid/expensive API routes
 * (Khaya translate/TTS/ASR cost money; serverless time is finite).
 *
 * Per-instance only — good enough to blunt casual abuse and demo-day bots.
 * For sustained production traffic, swap for a shared store (Upstash/KV);
 * the call sites won't change.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterS: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    if (buckets.size >= MAX_BUCKETS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterS: 0 };
  }

  if (bucket.count < limit) {
    bucket.count += 1;
    return { ok: true, retryAfterS: 0 };
  }

  return { ok: false, retryAfterS: Math.ceil((bucket.resetAt - now) / 1000) };
}

/** Best-effort client key from proxy headers (Vercel sets x-forwarded-for). */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"
  );
}

/** Standard 429 body + headers for a friendly, non-scary refusal. */
export function tooManyRequests(retryAfterS: number, message?: string) {
  return new Response(
    JSON.stringify({
      error:
        message ||
        "A little too fast — please wait a moment and try again.",
      code: "RATE_LIMITED",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.max(1, retryAfterS)),
      },
    },
  );
}
