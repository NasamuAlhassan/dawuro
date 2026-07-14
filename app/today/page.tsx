"use client";

import { useApp } from "@/lib/app-context";
import { getLanguage } from "@/lib/languages";
import { VerseOfTheDay } from "@/components/VerseOfTheDay";

export default function TodayPage() {
  const { language } = useApp();
  const lang = getLanguage(language);

  return (
    <div className="flex flex-1 flex-col gap-5">
      <section className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
          Verse of the Day
        </p>
        <h2
          className="text-[1.75rem] font-semibold leading-tight tracking-tight text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Today&apos;s word
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          A daily verse in {lang.nativeName} and English — share it as a voice
          note with no app needed for the receiver.
        </p>
      </section>

      <VerseOfTheDay language={language} />
    </div>
  );
}
