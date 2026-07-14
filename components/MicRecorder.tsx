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
      setStatus("Voice not supported — type instead.");
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
      setStatus(`Type in ${input.label} — Khaya will translate.`);
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
          setStatus("No audio — try again or type.");
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
            const err = (json.error || "").toLowerCase();
            if (err.includes("invalid language") || res.status === 400) {
              setStatus(
                `ASR for ${input.label} unavailable — type it; Khaya will translate.`,
              );
            } else {
              setStatus(json.error || "Couldn't understand — type instead.");
            }
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
      setStatus("Listening… tap to stop");
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
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? "Stop listening" : `Speak in ${input.label}`}
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg transition disabled:opacity-50 ${
          listening
            ? "bg-brand text-white shadow-[0_0_0_6px_rgba(178,58,22,0.2)]"
            : "border border-line bg-surface text-brand shadow-sm hover:border-gold hover:bg-gold-soft/50"
        }`}
        title={`Speak in ${input.label}`}
      >
        {listening ? "■" : "🎤"}
      </button>
      {status && (
        <p
          className="absolute top-full z-10 mt-1 w-40 text-center text-[10px] leading-snug text-ink-soft"
          aria-live="polite"
        >
          {status}
        </p>
      )}
    </div>
  );
}
