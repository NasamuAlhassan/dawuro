"use client";

import { useApp } from "@/lib/app-context";
import { getLanguage } from "@/lib/languages";
import { VerseOfTheDay } from "@/components/VerseOfTheDay";

export default function TodayPage() {
  const { language } = useApp();
  const lang = getLanguage(language);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <h1
          className="text-[1.65rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Today
        </h1>
        <p className="max-w-[36ch] text-[14px] leading-relaxed text-ink-soft">
          The daily verse in {lang.nativeName} and English. Share it as a voice
          note — no app needed for the receiver.
        </p>
      </header>

      <VerseOfTheDay language={language} />
    </div>
  );
}
