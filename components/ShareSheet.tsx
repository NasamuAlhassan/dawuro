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
import { receiveUrl } from "@/lib/share";
import { getLanguage, hasAnyVoice } from "@/lib/languages";
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
  const link = receiveUrl(verse);

  function shareMessage(): string {
    const fromKhaya = verse.localFromKhaya || local?.source === "khaya";
    const invite = hasAnyVoice(lang)
      ? `Hear it aloud + reply with a verse of your own:\n${link}`
      : `Read it + reply with a verse of your own:\n${link}`;
    const attribution = fromKhaya
      ? `(${lang.label} text via Khaya AI — the link has the published English verse.)`
      : local?.copyright
        ? `— ${local.copyright}`
        : "";
    const parts = [
      `${verse.humanReference} · ${lang.nativeName}`,
      local?.text || "",
      attribution,
      invite,
    ];
    return parts.filter(Boolean).join("\n\n");
  }

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
    // Try any language a server voice might cover (Khaya or Abena —
    // including Ghanaian-accented English); a miss just means no clip.
    if (!local.text?.trim() || !hasAnyVoice(lang)) return null;

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
      const shareText = shareMessage();

      if (canShareFiles() && navigator.canShare?.({ files })) {
        setStatus("Opening share…");
        try {
          await navigator.share({
            files,
            title: shareTitle,
            text: shareText,
          });
          setStatus("Shared. The link inside lets them reply with a verse.");
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
          ? "Image and audio saved — send them on WhatsApp with the link below."
          : "Image saved — send it on WhatsApp with the link below.",
      );
    } catch (e) {
      console.error("[ShareSheet]", e);
      setError("Could not prepare the share card.");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  /** Text-only share: the link unfurls into a verse card inside WhatsApp. */
  async function handleShareLink() {
    setError(null);
    const text = shareMessage();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${verse.humanReference} · Dawuro`,
          text,
        });
        setStatus("Link shared — it previews as a verse card in the chat.");
        return;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
      }
    }
    await copyLink(text);
  }

  async function copyLink(text?: string) {
    setError(null);
    try {
      await navigator.clipboard.writeText(text || link);
      setStatus("Copied — paste it into WhatsApp.");
    } catch {
      setStatus(link);
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

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void handleShareLink()}
          disabled={busy || !local?.text}
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-[var(--radius-sm)] border border-line bg-surface px-3 text-[12px] font-medium text-ink transition hover:border-line-strong hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Share link only
        </button>
        <button
          type="button"
          onClick={() => void copyLink()}
          disabled={busy || !local?.text}
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-[var(--radius-sm)] border border-line bg-surface px-3 text-[12px] font-medium text-ink transition hover:border-line-strong hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Copy link
        </button>
      </div>

      {status && (
        <p
          className="break-all text-center text-[12px] text-ink-soft"
          aria-live="polite"
        >
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
