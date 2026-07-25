"use client";

import { getLanguage } from "@/lib/languages";
import { useApp } from "@/lib/app-context";
import { VerseFlow } from "@/components/VerseFlow";
import { TodayTeaser } from "@/components/TodayTeaser";
import { DEMO_PATH } from "@/lib/verses";

export function HomeClient() {
  const { language, tradition } = useApp();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <h1
          className="text-[1.65rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          What&apos;s on your heart?
        </h1>
        <p className="max-w-[38ch] text-[14px] leading-relaxed text-ink-soft">
          A verse in {getLanguage(language).nativeName} and English — spoken
          aloud. Send it on WhatsApp, and whoever opens it can hear it and
          reply with a verse of their own. No app on their side.
        </p>
      </header>

      <TodayTeaser language={language} />

      <VerseFlow
        scriptureLanguage={language}
        tradition={tradition}
        shareLabel="Send on WhatsApp"
        idleHint={
          <section className="dawuro-panel space-y-2 px-4 py-3">
            <p className="text-[12px] font-medium text-ink">Try this</p>
            <p className="text-[12px] leading-relaxed text-ink-soft">
              Tap <strong className="font-medium text-ink">Anxious</strong> for
              the demo path ({DEMO_PATH.humanReference}), or speak a feeling in
              English or Twi. Open{" "}
              <strong className="font-medium text-ink">Today</strong> for the
              daily verse.
            </p>
          </section>
        }
      />
    </div>
  );
}
