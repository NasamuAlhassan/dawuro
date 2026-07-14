"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_LOCAL_LANGUAGE,
  LANGUAGE_LIST,
  STORAGE_KEY_LANGUAGE,
  isLocalLanguageId,
  type LocalLanguageId,
} from "@/lib/languages";

export function loadLanguage(): LocalLanguageId {
  if (typeof window === "undefined") return DEFAULT_LOCAL_LANGUAGE;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (isLocalLanguageId(v)) return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCAL_LANGUAGE;
}

type Props = {
  value: LocalLanguageId;
  onChange: (id: LocalLanguageId) => void;
};

/**
 * Scripture language picker — which YouVersion Bible pairs with English.
 */
export function LanguageSetting({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
        Scripture language
      </p>
      <p className="text-[11px] text-ink-soft">
        English always shows alongside. Pick the language of the heart.
      </p>
      <div className="flex flex-wrap gap-1.5" role="listbox" aria-label="Scripture language">
        {LANGUAGE_LIST.map((lang) => {
          const selected = value === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => {
                onChange(lang.id);
                try {
                  window.localStorage.setItem(STORAGE_KEY_LANGUAGE, lang.id);
                } catch {
                  /* ignore */
                }
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selected
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-surface text-ink-soft hover:border-gold hover:text-ink"
              }`}
              title={lang.title}
            >
              {lang.label}
              {lang.khayaTts ? (
                <span className="ml-1 opacity-70" aria-hidden>
                  ♪
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-ink-soft">
        ♪ = can hear this language aloud (Khaya TTS)
      </p>
    </div>
  );
}

export function useLanguage(): [
  LocalLanguageId,
  (id: LocalLanguageId) => void,
] {
  const [language, setLanguage] = useState<LocalLanguageId>(
    DEFAULT_LOCAL_LANGUAGE,
  );

  useEffect(() => {
    setLanguage(loadLanguage());
  }, []);

  function update(id: LocalLanguageId) {
    setLanguage(id);
    try {
      window.localStorage.setItem(STORAGE_KEY_LANGUAGE, id);
    } catch {
      /* ignore */
    }
  }

  return [language, update];
}
