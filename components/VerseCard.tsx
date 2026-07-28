"use client";

import type { VerseResult } from "@/lib/types";
import { AudioPlayer } from "@/components/AudioPlayer";
import { getLanguage } from "@/lib/languages";

type Props = {
  verse: VerseResult;
  className?: string;
  showAudio?: boolean;
};

/**
 * The reading surface — styled after the way a Bible app presents a
 * passage: reference + version up top, the local text large and unhurried,
 * English as the quiet companion underneath.
 */
export function VerseCard({
  verse,
  className = "",
  showAudio = true,
}: Props) {
  const local = verse.local || verse.twi;
  if (!local) return null;

  const lang = getLanguage(verse.localLanguageId || local.languageId);
  const fromKhaya = verse.localFromKhaya || local.source === "khaya";
  const versionTag = fromKhaya ? "Khaya" : lang.abbreviation || lang.label;

  return (
    <article className={`dawuro-card ${className}`}>
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-3.5 sm:px-6">
        <p
          className="text-[16px] font-semibold tracking-tight text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {verse.humanReference}
        </p>
        <span className="shrink-0 rounded-md bg-ink/5 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-ink-soft">
          {versionTag}
        </span>
      </div>

      <div className="space-y-5 px-5 py-6 sm:px-6 sm:py-7">
        {(verse.proxyNote || fromKhaya) && (
          <p className="text-[11px] leading-snug text-ink-faint">
            {verse.proxyNote ||
              `${lang.name} rendered with Khaya. English is the published YouVersion text.`}
          </p>
        )}

        <p
          className="text-[1.3rem] leading-[1.85] tracking-[0.002em] text-ink"
          style={{ fontFamily: "var(--font-verse), serif" }}
          lang={lang.htmlLang}
        >
          {local.text}
        </p>

        <div className="border-t border-line pt-5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
            English · BSB
          </p>
          <p
            className="text-[0.95rem] leading-[1.75] text-ink-soft"
            style={{ fontFamily: "var(--font-verse), serif" }}
            lang="en"
          >
            {verse.english.text}
          </p>
        </div>

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
