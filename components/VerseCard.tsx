import type { VerseResult } from "@/lib/types";

type Props = {
  verse: VerseResult;
  className?: string;
};

/**
 * On-screen verse: Twi primacy, English support, reference + publisher credit.
 */
export function VerseCard({ verse, className = "" }: Props) {
  return (
    <article
      className={`rounded-2xl border border-line bg-surface p-5 shadow-sm ${className}`}
    >
      <p
        className="text-sm font-semibold tracking-wide text-brand"
        style={{ fontFamily: "var(--font-display), serif" }}
      >
        {verse.humanReference}
      </p>

      <p
        className="mt-4 text-lg leading-relaxed text-twi"
        style={{ fontFamily: "var(--font-verse), serif" }}
        lang="tw"
      >
        {verse.twi.text}
      </p>

      <p
        className="mt-4 text-base leading-relaxed text-english"
        style={{ fontFamily: "var(--font-verse), serif" }}
        lang="en"
      >
        {verse.english.text}
      </p>

      <footer className="mt-5 space-y-1 border-t border-line pt-3">
        {verse.twi.copyright && (
          <p className="text-[11px] leading-snug text-ink-soft">
            {verse.twi.copyright}
          </p>
        )}
        {verse.english.copyright && (
          <p className="text-[11px] leading-snug text-ink-soft">
            {verse.english.copyright}
          </p>
        )}
      </footer>
    </article>
  );
}
