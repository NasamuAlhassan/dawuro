"use client";

import { useState } from "react";
import { SUGGESTED_FEELINGS } from "@/lib/verses";

type Props = {
  onSubmit: (feeling: string) => void;
  loading?: boolean;
  disabled?: boolean;
};

/**
 * Text input for "what's on your heart" + quick suggestion chips.
 * Mic lands in Phase 4.
 */
export function FeelingInput({ onSubmit, loading, disabled }: Props) {
  const [value, setValue] = useState("");

  function submit(feeling: string) {
    const t = feeling.trim();
    if (!t || loading || disabled) return;
    onSubmit(t);
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor="feeling"
        className="block text-sm font-medium text-ink"
      >
        What&apos;s on your heart?
      </label>

      <div className="flex gap-2">
        <input
          id="feeling"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit(value);
          }}
          placeholder="e.g. I'm anxious about my exams"
          disabled={loading || disabled}
          className="min-h-12 flex-1 rounded-xl border border-line bg-surface px-4 text-base text-ink placeholder:text-ink-soft/70 outline-none ring-brand/30 focus:ring-2 disabled:opacity-60"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => submit(value)}
          disabled={loading || disabled || !value.trim()}
          className="min-h-12 shrink-0 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "…" : "Find"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTED_FEELINGS.map((s) => (
          <button
            key={s.feeling}
            type="button"
            onClick={() => {
              setValue(s.feeling);
              submit(s.feeling);
            }}
            disabled={loading || disabled}
            className="rounded-full border border-line bg-gold-soft/50 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-gold hover:bg-gold-soft disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
