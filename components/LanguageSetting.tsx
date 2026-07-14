"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCAL_LANGUAGE,
  LANGUAGE_LIST,
  REGION_LABELS,
  STORAGE_KEY_LANGUAGE,
  hasAsr,
  hasVoice,
  isLocalLanguageId,
  type LanguageConfig,
  type LanguageRegion,
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

function groupByRegion(list: LanguageConfig[]) {
  const order: LanguageRegion[] = [
    "ghana",
    "west-africa",
    "east-africa",
    "other",
  ];
  const map = new Map<LanguageRegion, LanguageConfig[]>();
  for (const lang of list) {
    const arr = map.get(lang.region) || [];
    arr.push(lang);
    map.set(lang.region, arr);
  }
  return order
    .filter((r) => (map.get(r) || []).length > 0)
    .map((r) => ({ region: r, languages: map.get(r)! }));
}

/**
 * Scripture language picker — Ghana first, voice-capable marked ♪
 */
export function LanguageSetting({ value, onChange }: Props) {
  const groups = useMemo(() => groupByRegion(LANGUAGE_LIST), []);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
          Scripture language
        </p>
        <p className="mt-0.5 text-[11px] text-ink-soft">
          English always shows alongside. Ghanaian languages listed first.
          Scripture is never machine-translated.
        </p>
      </div>

      {groups.map(({ region, languages }) => (
        <div key={region} className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">
            {REGION_LABELS[region]}
          </p>
          <div
            className="flex flex-wrap gap-1.5"
            role="listbox"
            aria-label={`${REGION_LABELS[region]} languages`}
          >
            {languages.map((lang) => {
              const selected = value === lang.id;
              const voice = hasVoice(lang);
              const asr = hasAsr(lang);
              return (
                <button
                  key={lang.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(lang.id);
                    try {
                      window.localStorage.setItem(
                        STORAGE_KEY_LANGUAGE,
                        lang.id,
                      );
                    } catch {
                      /* ignore */
                    }
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selected
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-surface text-ink-soft hover:border-gold hover:text-ink"
                  }`}
                  title={[
                    lang.title || lang.name,
                    voice ? "Hear aloud" : null,
                    asr ? "Speak input" : null,
                    lang.khayaNote || null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                >
                  {lang.label}
                  {voice && (
                    <span className="ml-1 opacity-80" aria-label="voice">
                      ♪
                    </span>
                  )}
                  {asr && !voice && (
                    <span className="ml-1 opacity-70" aria-label="mic">
                      🎤
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-[10px] leading-relaxed text-ink-soft">
        <span className="font-medium">♪</span> Hear aloud (Khaya TTS) ·{" "}
        <span className="font-medium">🎤</span> Speak feelings (Khaya ASR).
        If a language isn’t on YouVersion (e.g. Kusaal, Ga), we use{" "}
        <span className="font-medium">Khaya</span> to translate the English
        verse, plus ASR/TTS when available. English is always published
        Scripture from YouVersion.
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
