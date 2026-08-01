/**
 * Web Push — daily Scripture as a notification, in your language.
 * Server only.
 *
 * Subscriptions are held in-memory (enough for send-now and a warm demo)
 * and, when Upstash Redis REST env vars are present, persisted there so
 * the daily cron can reach everyone across cold starts.
 */

import webpush, { type PushSubscription } from "web-push";
import {
  dayOfYear,
  getBilingualPassage,
  getVerseOfTheDayReference,
} from "@/lib/youversion";
import { getLanguage } from "@/lib/languages";

export type StoredSub = {
  subscription: PushSubscription;
  language: string;
};

let configured = false;
export function isPushConfigured(): boolean {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const priv = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!pub || !priv) return false;
  if (!configured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT?.trim() || "mailto:dawuro@example.com",
      pub,
      priv,
    );
    configured = true;
  }
  return true;
}

// ── Storage ────────────────────────────────────────────────────────────
const memory = new Map<string, StoredSub>();

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL?.trim();
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
const usesUpstash = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

async function upstash(command: unknown[]): Promise<unknown> {
  const res = await fetch(UPSTASH_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const data = (await res.json()) as { result?: unknown };
  return data.result;
}

function keyFor(sub: PushSubscription): string {
  return sub.endpoint;
}

export async function saveSubscription(entry: StoredSub): Promise<void> {
  const key = keyFor(entry.subscription);
  memory.set(key, entry);
  if (usesUpstash) {
    await upstash(["HSET", "dawuro:subs", key, JSON.stringify(entry)]);
  }
}

export async function removeSubscription(endpoint: string): Promise<void> {
  memory.delete(endpoint);
  if (usesUpstash) {
    await upstash(["HDEL", "dawuro:subs", endpoint]).catch(() => {});
  }
}

export async function allSubscriptions(): Promise<StoredSub[]> {
  if (usesUpstash) {
    try {
      const flat = (await upstash(["HVALS", "dawuro:subs"])) as string[];
      return flat.map((s) => JSON.parse(s) as StoredSub);
    } catch {
      /* fall back to memory */
    }
  }
  return [...memory.values()];
}

// ── Sending ────────────────────────────────────────────────────────────

/** Build today's verse notification payload in a given language. */
export async function dailyVersePayload(language: string): Promise<{
  title: string;
  body: string;
  url: string;
  reference: string;
}> {
  const lang = getLanguage(language);
  const usfm = await getVerseOfTheDayReference(dayOfYear());
  const verse = await getBilingualPassage(usfm, lang.id);
  const local = verse.local || verse.english;
  const body =
    lang.id === "en" ? verse.english.text : local.text || verse.english.text;
  return {
    title: `${verse.humanReference} · ${lang.nativeName}`,
    body: body.length > 180 ? `${body.slice(0, 177)}…` : body,
    url: `/v/${lang.id}/${encodeURIComponent(verse.reference)}`,
    reference: verse.reference,
  };
}

/** Push a payload to one subscription; returns false if it's gone (410/404). */
export async function sendTo(
  entry: StoredSub,
  payload: { title: string; body: string; url: string },
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      entry.subscription,
      JSON.stringify(payload),
    );
    return true;
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) {
      await removeSubscription(entry.subscription.endpoint);
    } else {
      console.warn("[push] send failed", status || e);
    }
    return false;
  }
}
