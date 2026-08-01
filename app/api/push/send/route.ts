import { NextResponse } from "next/server";
import {
  dailyVersePayload,
  isPushConfigured,
  sendTo,
} from "@/lib/push";
import { getLanguage, isLocalLanguageId } from "@/lib/languages";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Body = {
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  language?: string;
};

/**
 * POST { subscription, language } — send today's verse to this device now.
 * Powers the "Send me one now" preview; needs no store since the caller
 * hands us its own subscription.
 */
export async function POST(req: Request) {
  const limited = rateLimit(`push-send:${clientKey(req)}`, 6, 60_000);
  if (!limited.ok) return tooManyRequests(limited.retryAfterS);

  if (!isPushConfigured()) {
    return NextResponse.json(
      { error: "Notifications are not configured on the server.", code: "PUSH_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sub = body.subscription;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json(
      { error: "A valid push subscription is required." },
      { status: 400 },
    );
  }

  const language = isLocalLanguageId(body.language) ? body.language : "tw";
  try {
    const payload = await dailyVersePayload(language);
    const ok = await sendTo(
      {
        subscription: sub as import("web-push").PushSubscription,
        language,
      },
      { title: payload.title, body: payload.body, url: payload.url },
    );
    if (!ok) {
      return NextResponse.json(
        { error: "Could not deliver the notification to this device." },
        { status: 502 },
      );
    }
    return NextResponse.json({
      ok: true,
      reference: payload.reference,
      language: getLanguage(language).label,
    });
  } catch (e) {
    console.error("[/api/push/send]", e);
    return NextResponse.json(
      { error: "Could not prepare today's verse. Please try again." },
      { status: 502 },
    );
  }
}
