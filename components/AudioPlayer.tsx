"use client";

import { useEffect, useRef, useState } from "react";
import type { LocalLanguageId } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { IconLoader, IconPause, IconPlay } from "@/components/ui/Icons";

type Props = {
  text: string;
  language: LocalLanguageId;
  proAudioUrl?: string;
  label?: string;
};

export function AudioPlayer({
  text,
  language,
  proAudioUrl,
  label,
}: Props) {
  const lang = getLanguage(language);
  const playLabel = label || `Play in ${lang.label}`;
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
      <p className="text-[12px] text-ink-faint">
        Audio not available for {lang.name} yet.
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
        setError(json.error || "Audio unavailable.");
        return null;
      }

      if (contentType.includes("application/json")) {
        const json = (await res.json()) as { audioUrl?: string };
        if (json.audioUrl) {
          setReadyUrl(json.audioUrl);
          return json.audioUrl;
        }
        setError("Audio unavailable.");
        return null;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = url;
      setReadyUrl(url);
      return url;
    } catch {
      setError("Could not load audio.");
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
        setError("Playback failed.");
        setPlaying(false);
      });
    } else if (audioRef.current.src !== url) {
      audioRef.current.src = url;
    }

    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setError("Tap again to play.");
      setPlaying(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={loading || !text}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-line bg-surface px-4 text-[13px] font-medium text-ink transition hover:border-line-strong hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={playing ? "Pause audio" : playLabel}
      >
        {loading ? (
          <>
            <IconLoader size={16} className="dawuro-spin" />
            Preparing audio
          </>
        ) : playing ? (
          <>
            <IconPause size={16} />
            Pause
          </>
        ) : (
          <>
            <IconPlay size={16} />
            {playLabel}
          </>
        )}
      </button>
      {error && (
        <p className="text-[12px] text-ink-soft" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
