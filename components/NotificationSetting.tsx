"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { getLanguage } from "@/lib/languages";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = "idle" | "working" | "on" | "denied" | "unsupported" | "error";

export function NotificationSetting() {
  const { language } = useApp();
  const lang = getLanguage(language);
  const [state, setState] = useState<State>("idle");
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !VAPID_PUBLIC
    ) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      const sub = await reg?.pushManager.getSubscription();
      if (sub) setState("on");
    });
  }, []);

  async function subscribe() {
    setState("working");
    setNote(null);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "idle");
        return;
      }

      const sub =
        (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            VAPID_PUBLIC!,
          ) as BufferSource,
        }));

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, language }),
      });
      if (!res.ok) {
        setState("error");
        setNote("Couldn't turn on notifications. Please try again.");
        return;
      }
      setState("on");
      setNote(`You'll get the daily verse in ${lang.nativeName}.`);
    } catch {
      setState("error");
      setNote("Couldn't turn on notifications. Please try again.");
    }
  }

  async function disable() {
    setState("working");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe();
      }
      setState("idle");
      setNote(null);
    } catch {
      setState("on");
    }
  }

  async function sendNow() {
    setNote("Sending…");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (!sub) {
        setNote("Turn on notifications first.");
        return;
      }
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, language }),
      });
      const json = (await res.json()) as { reference?: string; error?: string };
      setNote(
        res.ok
          ? "Sent — check your notifications."
          : json.error || "Couldn't send right now.",
      );
    } catch {
      setNote("Couldn't send right now.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[13px] font-medium text-ink">Daily verse notification</p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
          One verse each morning, in {lang.nativeName} — spoken when you open
          it. The town crier, on your phone.
        </p>
      </div>

      {state === "unsupported" && (
        <p className="text-[12px] text-ink-soft">
          This browser doesn&apos;t support notifications. On iPhone, add
          Dawuro to your Home Screen first, then turn them on.
        </p>
      )}

      {state === "denied" && (
        <p className="text-[12px] text-ink-soft">
          Notifications are blocked. Allow them for this site in your browser
          settings, then reload.
        </p>
      )}

      {(state === "idle" || state === "working" || state === "error") && (
        <button
          type="button"
          onClick={subscribe}
          disabled={state === "working"}
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-[var(--radius-sm)] bg-brand px-5 text-[14px] font-semibold text-white transition hover:bg-brand-deep disabled:opacity-50"
        >
          {state === "working" ? "Turning on…" : "Turn on daily verse"}
        </button>
      )}

      {state === "on" && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={sendNow}
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-sm)] bg-ink px-4 text-[13px] font-semibold text-surface-2 transition hover:bg-brand-deep"
          >
            Send me one now
          </button>
          <button
            type="button"
            onClick={disable}
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-sm)] border border-line bg-surface px-4 text-[13px] font-medium text-ink transition hover:border-line-strong"
          >
            Turn off
          </button>
        </div>
      )}

      {note && (
        <p className="text-[12px] text-ink-soft" aria-live="polite">
          {note}
        </p>
      )}
    </div>
  );
}
