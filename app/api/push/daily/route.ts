import { NextResponse } from "next/server";
import {
  allSubscriptions,
  dailyVersePayload,
  isPushConfigured,
  sendTo,
} from "@/lib/push";

export const runtime = "nodejs";
// Vercel Cron hits this once a day (see vercel.json).
export const dynamic = "force-dynamic";

/** Send the day's verse to every subscriber, each in their own language. */
export async function GET(req: Request) {
  // When CRON_SECRET is set, require it — so only the scheduler can fire this.
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  if (!isPushConfigured()) {
    return NextResponse.json({ error: "Push not configured." }, { status: 503 });
  }

  const subs = await allSubscriptions();
  if (subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, note: "no subscribers" });
  }

  // Build each language's payload once, then fan out.
  const payloads = new Map<string, Awaited<ReturnType<typeof dailyVersePayload>>>();
  let sent = 0;
  for (const entry of subs) {
    try {
      let payload = payloads.get(entry.language);
      if (!payload) {
        payload = await dailyVersePayload(entry.language);
        payloads.set(entry.language, payload);
      }
      const ok = await sendTo(entry, {
        title: payload.title,
        body: payload.body,
        url: payload.url,
      });
      if (ok) sent += 1;
    } catch (e) {
      console.warn("[/api/push/daily] entry failed", e);
    }
  }

  return NextResponse.json({ ok: true, sent, total: subs.length });
}
