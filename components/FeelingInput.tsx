"use client";

import { useState } from "react";
import type { InputLanguageId } from "@/lib/languages";
import { INPUT_LANGUAGES, getInputLanguage } from "@/lib/languages";
import { SUGGESTED_FEELINGS } from "@/lib/verses";
import { MicRecorder } from "@/components/MicRecorder";

type Props = {
  onSubmit: (feeling: string, inputLanguage: InputLanguageId) => void;
  loading?: boolean;
  disabled?: boolean;
};

export function FeelingInput({ onSubmit, loading, disabled }: Props) {
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState<InputLanguageId>("en");
  const input = getInputLanguage(language);

  function submit(feeling: string) {
    const t = feeling.trim();
    if (!t || loading || disabled) return;
    onSubmit(t, language);
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="feeling"
          className="text-[13px] font-medium text-ink"
        >
          How are you feeling?
        </label>
        <div
          className="mt-2 flex flex-wrap gap-1.5"
          role="group"
          aria-label="Input language"
        >
          {INPUT_LANGUAGES.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLanguage(opt.id)}
              className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
                language === opt.id
                  ? "bg-ink text-surface-2"
                  : "bg-transparent text-ink-soft ring-1 ring-line hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="feeling"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit(value);
          }}
          placeholder={input.placeholder}
          disabled={loading || disabled}
          className="min-h-11 flex-1 rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3.5 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-ink/30 disabled:opacity-60"
          autoComplete="off"
        />
        <MicRecorder
          language={language}
          disabled={loading || disabled}
          onTranscript={(text) => setValue(text)}
        />
      </div>

      <button
        type="button"
        onClick={() => submit(value)}
        disabled={loading || disabled || !value.trim()}
        className="flex min-h-11 w-full items-center justify-center rounded-[var(--radius-sm)] bg-brand text-[14px] font-semibold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Finding Scripture…" : "Find Scripture"}
      </button>

      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_FEELINGS.map((s) => (
          <button
            key={s.feeling}
            type="button"
            onClick={() => {
              setLanguage("en");
              setValue(s.feeling);
              onSubmit(s.feeling, "en");
            }}
            disabled={loading || disabled}
            className="rounded-md px-2.5 py-1 text-[12px] text-ink-soft ring-1 ring-line transition hover:bg-surface-2 hover:text-ink disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
