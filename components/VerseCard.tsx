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
 * Local language primacy + English (YouVersion).
 * When local is Khaya (no published Bible), show a clear note.
 */
export function VerseCard({
  verse,
  className = "",
  showAudio = true,
}: Props) {
  const local = verse.local || verse.twi;
  if (!local) return null;

  const lang = getLanguage(verse.localLanguageId || local.languageId);
  const fromKhaya =
    verse.localFromKhaya || local.source === "khaya";

  return (
    <article
      className={`rounded-2xl border border-line bg-surface p-5 shadow-sm ${className}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p
          className="text-sm font-semibold tracking-wide text-brand"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {verse.humanReference}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-ink-soft">
          {local.label || lang.label}
        </p>
      </div>

      {(verse.proxyNote || fromKhaya) && (
        <p className="mt-2 rounded-lg bg-gold-soft/50 px-2.5 py-1.5 text-[11px] leading-snug text-ink-soft">
          {verse.proxyNote ||
            `${lang.name} text via Khaya. English below is the published YouVersion Scripture.`}
        </p>
      )}

      <p
        className="mt-4 text-lg leading-relaxed text-twi"
        style={{ fontFamily: "var(--font-verse), serif" }}
        lang={lang.htmlLang}
      >
        {local.text}
      </p>

      <p
        className="mt-4 text-base leading-relaxed text-english"
        style={{ fontFamily: "var(--font-verse), serif" }}
        lang="en"
      >
        {verse.english.text}
      </p>

      {showAudio && local.text && (
        <div className="mt-4">
          <AudioPlayer
            text={local.text}
            language={lang.id}
            proAudioUrl={local.audioUrl}
          />
        </div>
      )}

      <footer className="mt-5 space-y-1 border-t border-line pt-3">
        {local.copyright && (
          <p className="text-[11px] leading-snug text-ink-soft">
            {fromKhaya ? `Local: ${local.copyright}` : local.copyright}
          </p>
        )}
        {verse.english.copyright && (
          <p className="text-[11px] leading-snug text-ink-soft">
            Scripture (EN): {verse.english.copyright}
          </p>
        )}
      </footer>
    </article>
  );
}
