"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { InputLanguageId } from "@/lib/languages";
import { getInputLanguage } from "@/lib/languages";

type Props = {
  language: InputLanguageId;
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((ev: {
        results: {
          [i: number]: { [j: number]: { transcript: string } };
          length: number;
        };
      }) => void)
    | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/**
 * English → Web Speech.
 * Khaya ASR languages → MediaRecorder → /api/transcribe.
 * Type-only languages → gentle prompt to type.
 */
export function MicRecorder({ language, onTranscript, disabled }: Props) {
  const input = getInputLanguage(language);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const stopEnglish = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const startEnglish = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setStatus("Voice not supported here — type instead.");
      return;
    }
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = input.webSpeech || "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const t = ev.results[0]?.[0]?.transcript?.trim();
      if (t) onTranscript(t);
      setStatus(null);
    };
    rec.onerror = () => {
      setStatus("Couldn't hear that — try typing.");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    setListening(true);
    setStatus("Listening…");
    rec.start();
  }, [onTranscript, input.webSpeech]);

  const startKhaya = useCallback(async () => {
    if (!input.khayaAsr) {
      setStatus(
        `Voice input for ${input.label} isn’t available yet — type in ${input.label}; Khaya will translate.`,
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("Mic not available — type instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, {
          type: mime.split(";")[0],
        });
        if (!blob.size) {
          setStatus("No audio captured — try again or type.");
          setListening(false);
          return;
        }
        setStatus("Understanding…");
        try {
          const form = new FormData();
          form.append("audio", blob, "feeling.webm");
          form.append("language", input.khayaAsr!);
          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: form,
          });
          const json = (await res.json()) as {
            text?: string;
            error?: string;
          };
          if (!res.ok || !json.text) {
            setStatus(json.error || "Couldn't understand — type instead.");
          } else {
            onTranscript(json.text);
            setStatus(null);
          }
        } catch {
          setStatus("Transcription failed — type instead.");
        } finally {
          setListening(false);
        }
      };
      mr.start();
      setListening(true);
      setStatus("Listening… (tap again to stop)");
    } catch {
      setStatus("Mic permission denied — type instead.");
      setListening(false);
    }
  }, [onTranscript, input.khayaAsr, input.label]);

  const stopKhaya = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  function toggle() {
    if (disabled) return;
    if (listening) {
      if (language === "en") stopEnglish();
      else stopKhaya();
      return;
    }
    if (language === "en") startEnglish();
    else void startKhaya();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-pressed={listening}
        className={`inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition disabled:opacity-50 ${
          listening
            ? "border-brand bg-brand text-white shadow-[0_0_0_4px_rgba(178,58,22,0.2)]"
            : "border-line bg-surface text-ink hover:border-gold hover:bg-gold-soft/40"
        }`}
        title={`Speak in ${input.label}`}
      >
        {listening ? "⏹" : "🎤"}
      </button>
      {status && (
        <p className="text-xs text-ink-soft" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  );
}
