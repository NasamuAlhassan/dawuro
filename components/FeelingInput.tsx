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
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="feeling"
            className="text-sm font-semibold text-ink"
          >
            Speak or type
          </label>
          <span className="text-[10px] text-ink-soft">
            Input: {input.label}
          </span>
        </div>
        <div
          className="flex max-w-full flex-wrap gap-1"
          role="group"
          aria-label="Input language"
        >
          {INPUT_LANGUAGES.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLanguage(opt.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                language === opt.id
                  ? "bg-brand text-white shadow-sm"
                  : "bg-surface text-ink-soft ring-1 ring-line hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
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
            className="min-h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base text-ink shadow-sm placeholder:text-ink-soft/70 outline-none ring-brand/25 focus:ring-2 disabled:opacity-60"
            autoComplete="off"
          />
        </div>
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
        className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-white shadow-md transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-45"
      >
        {loading ? "Finding your verse…" : "Find Scripture"}
      </button>

      <div className="flex flex-wrap gap-2">
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
            className="rounded-full border border-line bg-surface/80 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-gold hover:bg-gold-soft disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
