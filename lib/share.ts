/**
 * Receive-link helpers — the heart of the "Scripture as conversation" loop.
 *
 * Every shared verse carries a link to /v/{lang}/{usfm}. The receiver opens
 * it in any browser (no app, no login), hears the verse, and is invited to
 * reply with a verse of their own — Scripture travelling person to person
 * inside the WhatsApp thread.
 */

import type { VerseResult } from "@/lib/types";

/** Base URL for links that leave the app (WhatsApp messages, PNG footer). */
export function publicBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/** Path (no origin) to the receive page for a verse. */
export function receivePath(verse: VerseResult): string {
  const lang = verse.localLanguageId || "tw";
  return `/v/${lang}/${encodeURIComponent(verse.reference)}`;
}

/** Absolute receive URL when a base is known; falls back to path only. */
export function receiveUrl(verse: VerseResult): string {
  const base = publicBaseUrl();
  return `${base}${receivePath(verse)}`;
}

/** Short human-readable form for the PNG card footer (no protocol). */
export function receiveUrlDisplay(verse: VerseResult): string {
  const url = receiveUrl(verse);
  return url.replace(/^https?:\/\//, "");
}

/**
 * Hydration-safe variant: uses only the build-time env base, which is
 * identical in server and client renders. Components that server-render
 * the link should start from this and upgrade to receiveUrlDisplay()
 * after mount.
 */
export function receiveUrlDisplayStatic(verse: VerseResult): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") || "";
  return `${base}${receivePath(verse)}`.replace(/^https?:\/\//, "");
}
