import { NextResponse } from "next/server";
import {
  isPushConfigured,
  removeSubscription,
  saveSubscription,
} from "@/lib/push";
import { isLocalLanguageId } from "@/lib/languages";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Body = {
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  language?: string;
};

/** POST { subscription, language } — register for the daily verse push. */
export async function POST(req: Request) {
  const limited = rateLimit(`push-sub:${clientKey(req)}`, 10, 60_000);
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
  await saveSubscription({
    subscription: sub as import("web-push").PushSubscription,
    language,
  });

  return NextResponse.json({ ok: true, language });
}

/** DELETE { endpoint } — stop the daily verse for this device. */
export async function DELETE(req: Request) {
  let body: { endpoint?: string };
  try {
    body = (await req.json()) as { endpoint?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (body.endpoint) await removeSubscription(body.endpoint);
  return NextResponse.json({ ok: true });
}
