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

/**
 * Reading paces. Scripture wants room to breathe — Khaya's TTS has no
 * speed parameter, so we slow playback client-side with preservesPitch
 * (the voice stays natural, only the pace changes). "Gentle" is the
 * default for verse reading.
 */
const PACES = [
  { value: 0.7, label: "Slow" },
  { value: 0.85, label: "Gentle" },
  { value: 1, label: "Natural" },
] as const;
const PACE_KEY = "dawuro_audio_pace";
const DEFAULT_PACE = 0.85;

function loadPace(): number {
  if (typeof window === "undefined") return DEFAULT_PACE;
  try {
    const v = Number(window.localStorage.getItem(PACE_KEY));
    if (PACES.some((p) => p.value === v)) return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_PACE;
}

function applyPace(audio: HTMLAudioElement, pace: number) {
  audio.playbackRate = pace;
  try {
    audio.preservesPitch = true;
    // Older WebKit
    (audio as HTMLAudioElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true;
  } catch {
    /* pitch preservation is best-effort */
  }
}

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
  const [pace, setPace] = useState<number>(DEFAULT_PACE);

  useEffect(() => {
    setPace(loadPace());
  }, []);

  function changePace(value: number) {
    setPace(value);
    try {
      window.localStorage.setItem(PACE_KEY, String(value));
    } catch {
      /* ignore */
    }
    if (audioRef.current) applyPace(audioRef.current, value);
  }

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

    applyPace(audioRef.current, pace);

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
      <div
        className="flex items-center justify-center gap-1"
        role="group"
        aria-label="Reading pace"
      >
        <span className="mr-1 text-[11px] text-ink-faint">Pace</span>
        {PACES.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => changePace(p.value)}
            aria-pressed={pace === p.value}
            className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
              pace === p.value
                ? "bg-ink/80 text-surface-2"
                : "text-ink-faint hover:text-ink-soft"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="text-[12px] text-ink-soft" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
