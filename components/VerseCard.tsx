"use client";

import type { VerseResult } from "@/lib/types";
import { AudioPlayer } from "@/components/AudioPlayer";
import { getLanguage } from "@/lib/languages";

type Props = {
  verse: VerseResult;
  className?: string;
  showAudio?: boolean;
};

export function VerseCard({
  verse,
  className = "",
  showAudio = true,
}: Props) {
  const local = verse.local || verse.twi;
  if (!local) return null;

  const lang = getLanguage(verse.localLanguageId || local.languageId);
  const fromKhaya = verse.localFromKhaya || local.source === "khaya";

  return (
    <article className={`dawuro-card ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <p
          className="text-[15px] font-semibold tracking-tight text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {verse.humanReference}
        </p>
        <span className="shrink-0 text-[11px] font-medium text-ink-faint">
          {lang.label}
        </span>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        {(verse.proxyNote || fromKhaya) && (
          <p className="text-[11px] leading-snug text-ink-faint">
            {verse.proxyNote ||
              `${lang.name} rendered with Khaya. English is the published YouVersion text.`}
          </p>
        )}

        <p
          className="text-[1.125rem] leading-[1.7] text-ink"
          style={{ fontFamily: "var(--font-verse), serif" }}
          lang={lang.htmlLang}
        >
          {local.text}
        </p>

        <p
          className="border-t border-line pt-4 text-[0.9375rem] leading-[1.65] text-ink-soft"
          style={{ fontFamily: "var(--font-verse), serif" }}
          lang="en"
        >
          {verse.english.text}
        </p>

        {showAudio && local.text && (
          <AudioPlayer
            text={local.text}
            language={lang.id}
            proAudioUrl={local.audioUrl}
          />
        )}

        <footer className="space-y-0.5 border-t border-line pt-3">
          {local.copyright && (
            <p className="text-[10px] leading-snug text-ink-faint">
              {fromKhaya ? `Local: ${local.copyright}` : local.copyright}
            </p>
          )}
          {verse.english.copyright && (
            <p className="text-[10px] leading-snug text-ink-faint">
              English: {verse.english.copyright}
            </p>
          )}
        </footer>
      </div>
    </article>
  );
}
