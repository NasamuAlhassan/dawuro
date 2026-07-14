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
import { IconSpeaker, IconWave } from "@/components/ui/Icons";

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

export function LanguageSetting({ value, onChange }: Props) {
  const groups = useMemo(() => groupByRegion(LANGUAGE_LIST), []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[13px] font-medium text-ink">Scripture language</p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
          English always shows alongside. Ghanaian languages first. Published
          Bibles from YouVersion when available; otherwise Khaya for local
          text.
        </p>
      </div>

      {groups.map(({ region, languages }) => (
        <div key={region} className="space-y-2">
          <p className="text-[11px] font-medium tracking-wide text-ink-faint">
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
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition ${
                    selected
                      ? "bg-ink text-surface-2"
                      : "bg-surface-2 text-ink-soft ring-1 ring-line hover:text-ink"
                  }`}
                  title={[
                    lang.title || lang.name,
                    voice ? "Audio playback" : null,
                    asr ? "Voice input" : null,
                    lang.khayaNote || null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                >
                  {lang.label}
                  {voice && (
                    <IconSpeaker
                      size={12}
                      className={selected ? "opacity-80" : "opacity-50"}
                    />
                  )}
                  {asr && !voice && (
                    <IconWave
                      size={12}
                      className={selected ? "opacity-80" : "opacity-50"}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-faint">
        <span className="inline-flex items-center gap-1">
          <IconSpeaker size={12} /> Audio playback
        </span>
        <span className="inline-flex items-center gap-1">
          <IconWave size={12} /> Voice input
        </span>
      </div>
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
