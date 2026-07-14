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
    <article className={`dawuro-card overflow-hidden ${className}`}>
      <div className="border-b border-line bg-gradient-to-r from-gold-soft/60 to-transparent px-5 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className="text-base font-semibold tracking-tight text-brand"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {verse.humanReference}
          </p>
          <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft ring-1 ring-line">
            {local.label || lang.label}
          </span>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        {(verse.proxyNote || fromKhaya) && (
          <p className="rounded-xl bg-gold-soft/50 px-3 py-2 text-[11px] leading-snug text-ink-soft">
            {verse.proxyNote ||
              `${lang.name} via Khaya. English is the published YouVersion Scripture.`}
          </p>
        )}

        <p
          className="text-[1.2rem] leading-[1.65] text-twi"
          style={{ fontFamily: "var(--font-verse), serif" }}
          lang={lang.htmlLang}
        >
          {local.text}
        </p>

        <p
          className="border-t border-line/80 pt-4 text-[0.95rem] leading-relaxed text-english"
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

        <footer className="space-y-1 border-t border-line pt-3">
          {local.copyright && (
            <p className="text-[10px] leading-snug text-ink-soft">
              {fromKhaya ? `Local: ${local.copyright}` : local.copyright}
            </p>
          )}
          {verse.english.copyright && (
            <p className="text-[10px] leading-snug text-ink-soft">
              Scripture (EN): {verse.english.copyright}
            </p>
          )}
        </footer>
      </div>
    </article>
  );
}
