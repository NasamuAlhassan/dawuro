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
import { getLanguage } from "@/lib/languages";
import { IconLoader, IconShare } from "@/components/ui/Icons";

type Props = {
  verse: VerseResult;
  buttonLabel?: string;
};

export function ShareSheet({
  verse,
  buttonLabel = "Share",
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const local = verse.local || verse.twi;
  const lang = getLanguage(verse.localLanguageId || local?.languageId);

  async function fetchAudioBlob(): Promise<Blob | null> {
    if (!local) return null;
    if (local.audioUrl) {
      try {
        const res = await fetch(local.audioUrl);
        if (res.ok) return await res.blob();
      } catch {
        /* fall through */
      }
    }
    if (!local.text?.trim() || !lang.khayaTts) return null;

    const res = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: local.text, language: lang.id }),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return null;
    return res.blob();
  }

  async function handleShare() {
    if (!cardRef.current || busy || !local) return;
    setBusy(true);
    setError(null);
    setStatus("Preparing card…");

    try {
      const dataUrl = await renderCardToPng(cardRef.current);
      const imageBlob = await dataUrlToBlob(dataUrl);
      const slug = slugifyRef(verse.humanReference) || "verse";

      setStatus("Preparing audio…");
      const audioBlob = await fetchAudioBlob();

      const imageFile = new File([imageBlob], `dawuro-${slug}.png`, {
        type: "image/png",
      });
      const audioFile = audioBlob
        ? new File([audioBlob], `dawuro-${slug}.wav`, {
            type: audioBlob.type || "audio/wav",
          })
        : null;

      const files = audioFile ? [imageFile, audioFile] : [imageFile];
      const shareTitle = `${verse.humanReference} · Dawuro`;
      const shareText = `${verse.humanReference}\n\n${local.text}\n\n${verse.english.text}\n\n— via Dawuro`;

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
          if (e instanceof Error && e.name === "AbortError") {
            setStatus(null);
            return;
          }
        }
      }

      setStatus("Downloading…");
      downloadBlob(imageBlob, `dawuro-${slug}.png`);
      if (audioBlob) {
        downloadBlob(audioBlob, `dawuro-${slug}.wav`);
      }
      setStatus(
        audioBlob
          ? "Image and audio saved — send them on WhatsApp."
          : "Image saved — send it on WhatsApp.",
      );
    } catch (e) {
      console.error("[ShareSheet]", e);
      setError("Could not prepare the share card.");
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
        disabled={busy || !local?.text}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-ink px-5 text-[14px] font-semibold text-surface-2 transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-45"
      >
        {busy ? (
          <>
            <IconLoader size={16} className="dawuro-spin" />
            Preparing…
          </>
        ) : (
          <>
            <IconShare size={16} />
            {buttonLabel}
          </>
        )}
      </button>
      {status && (
        <p className="text-center text-[12px] text-ink-soft" aria-live="polite">
          {status}
        </p>
      )}
      {error && (
        <p className="text-center text-[12px] text-brand" role="alert">
          {error}
        </p>
      )}

      <div
        aria-hidden
        className="pointer-events-none fixed left-[-10000px] top-0 overflow-hidden"
      >
        <ShareableCard ref={cardRef} verse={verse} />
      </div>
    </div>
  );
}
