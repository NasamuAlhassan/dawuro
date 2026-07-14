"use client";

import { useRef, useState } from "react";
import type { VerseResult } from "@/lib/types";
import { ShareableCard } from "@/components/ShareableCard";
import {
  canShareFiles,
  dataUrlToBlob,
  downloadBlob,
  renderCardToPng,
  slugifyRef,
} from "@/lib/card";

type Props = {
  verse: VerseResult;
  /** Optional label e.g. "Share as voice note" */
  buttonLabel?: string;
};

/**
 * Builds PNG image card + Twi audio, then Web Share (files) or download.
 * Receiver needs no app.
 */
export function ShareSheet({
  verse,
  buttonLabel = "Share",
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchAudioBlob(): Promise<Blob | null> {
    if (verse.twi.audioUrl) {
      try {
        const res = await fetch(verse.twi.audioUrl);
        if (res.ok) return await res.blob();
      } catch {
        /* fall through to TTS */
      }
    }

    if (!verse.twi.text?.trim()) return null;

    const res = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ twiText: verse.twi.text }),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return null;
    return res.blob();
  }

  async function handleShare() {
    if (!cardRef.current || busy) return;
    setBusy(true);
    setError(null);
    setStatus("Preparing your card…");

    try {
      const dataUrl = await renderCardToPng(cardRef.current);
      const imageBlob = await dataUrlToBlob(dataUrl);
      const slug = slugifyRef(verse.humanReference) || "verse";

      setStatus("Preparing the audio…");
      const audioBlob = await fetchAudioBlob();

      const imageFile = new File([imageBlob], `dawuro-${slug}.png`, {
        type: "image/png",
      });
      const audioFile = audioBlob
        ? new File(
            [audioBlob],
            `dawuro-${slug}.wav`,
            { type: audioBlob.type || "audio/wav" },
          )
        : null;

      const files = audioFile ? [imageFile, audioFile] : [imageFile];
      const shareTitle = `${verse.humanReference} · Dawuro`;
      const shareText = `${verse.humanReference}\n\n${verse.twi.text}\n\n${verse.english.text}\n\n— shared via Dawuro`;

      if (canShareFiles() && navigator.canShare?.({ files })) {
        setStatus("Opening share…");
        try {
          await navigator.share({
            files,
            title: shareTitle,
            text: shareText,
          });
          setStatus("Shared.");
          return;
        } catch (e) {
          // User cancel is fine
          if (e instanceof Error && e.name === "AbortError") {
            setStatus(null);
            return;
          }
          // Fall through to download
        }
      }

      // Download fallback
      setStatus("Downloading…");
      downloadBlob(imageBlob, `dawuro-${slug}.png`);
      if (audioBlob) {
        downloadBlob(audioBlob, `dawuro-${slug}.wav`);
      }
      setStatus(
        audioBlob
          ? "Image + audio saved. Send them on WhatsApp."
          : "Image saved. Audio unavailable — send the image on WhatsApp.",
      );
    } catch (e) {
      console.error("[ShareSheet]", e);
      setError("Could not prepare the share card. Try again.");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void handleShare()}
        disabled={busy || !verse.twi.text}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Preparing…" : buttonLabel}
      </button>
      {status && (
        <p className="text-xs text-ink-soft" aria-live="polite">
          {status}
        </p>
      )}
      {error && (
        <p className="text-xs text-brand" role="alert">
          {error}
        </p>
      )}

      {/* Off-screen render target for html-to-image */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-[-10000px] top-0 overflow-hidden"
      >
        <ShareableCard ref={cardRef} verse={verse} />
      </div>
    </div>
  );
}
