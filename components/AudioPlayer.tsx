"use client";

import { useEffect, useRef, useState } from "react";
import type { LocalLanguageId } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";

type Props = {
  /** Local-language text to synthesize. */
  text: string;
  language: LocalLanguageId;
  /** Optional YouVersion professional audio URL. */
  proAudioUrl?: string;
  label?: string;
};

/**
 * Tap-to-play local-language audio. Fetches /api/speak (Khaya TTS) or uses pro URL.
 * Never autoplays. Graceful failure leaves the verse readable.
 */
export function AudioPlayer({
  text,
  language,
  proAudioUrl,
  label,
}: Props) {
  const lang = getLanguage(language);
  const playLabel = label || `Hear in ${lang.label}`;
  const canTts = Boolean(lang.khayaTts);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readyUrl, setReadyUrl] = useState<string | null>(proAudioUrl ?? null);

  useEffect(() => {
    setReadyUrl(proAudioUrl ?? null);
    setError(null);
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, [text, language, proAudioUrl]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  if (!canTts && !proAudioUrl) {
    return (
      <p className="text-xs text-ink-soft">
        Audio not available for {lang.name} yet — you can still read the verse.
      </p>
    );
  }

  async function ensureAudio(): Promise<string | null> {
    if (readyUrl) return readyUrl;
    if (proAudioUrl) {
      setReadyUrl(proAudioUrl);
      return proAudioUrl;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(json.error || "Audio unavailable right now.");
        return null;
      }

      if (contentType.includes("application/json")) {
        const json = (await res.json()) as { audioUrl?: string };
        if (json.audioUrl) {
          setReadyUrl(json.audioUrl);
          return json.audioUrl;
        }
        setError("Audio unavailable right now.");
        return null;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = url;
      setReadyUrl(url);
      return url;
    } catch {
      setError("Could not load audio. You can still read the verse.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function toggle() {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    const url = await ensureAudio();
    if (!url) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.addEventListener("ended", () => setPlaying(false));
      audioRef.current.addEventListener("pause", () => setPlaying(false));
      audioRef.current.addEventListener("play", () => setPlaying(true));
      audioRef.current.addEventListener("error", () => {
        setError("Playback failed. You can still read the verse.");
        setPlaying(false);
      });
    } else if (audioRef.current.src !== url) {
      audioRef.current.src = url;
    }

    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setError("Tap again to play — browsers block autoplay.");
      setPlaying(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={loading || !text}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-gold-soft/60 px-4 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={playing ? "Pause audio" : playLabel}
      >
        {loading ? (
          <span>Preparing audio…</span>
        ) : playing ? (
          <span>Pause</span>
        ) : (
          <span>▶ {playLabel}</span>
        )}
      </button>
      {error && (
        <p className="text-xs text-ink-soft" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
