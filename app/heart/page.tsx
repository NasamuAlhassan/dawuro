"use client";

import { useEffect, useState } from "react";
import type { InputLanguageId } from "@/lib/languages";
import { INPUT_LANGUAGES } from "@/lib/languages";
import { TOPIC_MAP, usfmToHuman } from "@/lib/verses";
import { useApp } from "@/lib/app-context";
import { useVerseFlow, VerseFlowResults } from "@/components/VerseFlow";
import { MicRecorder } from "@/components/MicRecorder";

const INPUT_LANG_KEY = "dawuro_input_lang";

function loadInputLang(): InputLanguageId {
  if (typeof window === "undefined") return "en";
  try {
    const v = window.localStorage.getItem(INPUT_LANG_KEY);
    if (v && INPUT_LANGUAGES.some((l) => l.id === v)) {
      return v as InputLanguageId;
    }
  } catch {
    /* ignore */
  }
  return "en";
}

/**
 * The Heart page — voice first. One big microphone, the feelings people
 * actually carry as large touch targets, and typing as the quiet fallback.
 */
export default function HeartPage() {
  const { language, tradition } = useApp();
  const flow = useVerseFlow(language, tradition);

  const [inputLang, setInputLang] = useState<InputLanguageId>("en");
  const [typed, setTyped] = useState("");
  const topics = TOPIC_MAP.filter((t) => t.id !== "default");

  useEffect(() => {
    setInputLang(loadInputLang());
  }, []);

  function chooseLang(id: InputLanguageId) {
    setInputLang(id);
    try {
      window.localStorage.setItem(INPUT_LANG_KEY, id);
    } catch {
      /* ignore */
    }
  }

  function submit(text: string) {
    const t = text.trim();
    if (!t || flow.loading) return;
    void flow.handleFeeling(t, inputLang);
  }

  return (
    <div className="flex flex-1 flex-col gap-7">
      <header className="space-y-1 text-center">
        <h1
          className="text-[1.9rem] font-semibold leading-[1.15] tracking-[-0.02em] text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          What&apos;s on your heart?
        </h1>
        <p className="text-[14px] text-ink-soft">
          Speak it — a verse comes back.
        </p>
      </header>

      <div
        className="flex flex-wrap justify-center gap-1.5"
        role="group"
        aria-label="Speak in"
      >
        {INPUT_LANGUAGES.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => chooseLang(opt.id)}
            className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
              inputLang === opt.id
                ? "bg-ink text-surface-2"
                : "bg-transparent text-ink-soft ring-1 ring-line hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <MicRecorder
        variant="hero"
        language={inputLang}
        disabled={flow.loading}
        onTranscript={(text) => {
          setTyped(text);
          submit(text);
        }}
      />

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit(typed);
          }}
          placeholder="…or type how you feel"
          disabled={flow.loading}
          className="min-h-12 flex-1 rounded-[var(--radius-sm)] border border-line bg-surface-2 px-4 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-ink/30 disabled:opacity-60"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => submit(typed)}
          disabled={flow.loading || !typed.trim()}
          className="min-h-12 shrink-0 rounded-[var(--radius-sm)] bg-ink px-5 text-[14px] font-semibold text-surface-2 transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          {flow.loading ? "Finding…" : "Find"}
        </button>
      </div>

      {!flow.verse && !flow.loading && (
        <section className="space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
            Or start from a feeling
          </p>
          <div className="grid grid-cols-2 gap-2">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => submit(topic.label.toLowerCase())}
                disabled={flow.loading}
                className="flex min-h-16 flex-col items-start justify-center gap-0.5 rounded-[var(--radius)] border border-line bg-surface px-4 text-left transition hover:border-line-strong hover:bg-surface-2 disabled:opacity-50"
              >
                <span
                  className="text-[15px] font-semibold text-ink"
                  style={{ fontFamily: "var(--font-display), serif" }}
                >
                  {topic.label}
                </span>
                <span className="text-[11px] text-ink-faint">
                  {usfmToHuman(topic.references[0])}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <VerseFlowResults flow={flow} shareLabel="Send on WhatsApp" />
    </div>
  );
}
