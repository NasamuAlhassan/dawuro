"use client";

import type { VerseResult } from "@/lib/types";
import { useApp } from "@/lib/app-context";
import { VerseFlow } from "@/components/VerseFlow";
import { VotdHero } from "@/components/VotdHero";

type Props = {
  initialVotd: VerseResult | null;
  initialDay: number | null;
};

/**
 * Home: Scripture first, questions second.
 * No product explanation — the open verse IS the welcome.
 */
export function HomeClient({ initialVotd, initialDay }: Props) {
  const { language, tradition } = useApp();

  return (
    <div className="flex flex-1 flex-col gap-10">
      <VotdHero initialVotd={initialVotd} initialDay={initialDay} />

      <section className="space-y-4">
        <header className="space-y-1">
          <h1
            className="text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            What&apos;s on your heart?
          </h1>
          <p className="text-[14px] leading-relaxed text-ink-soft">
            Say it or type it — a verse comes back.
          </p>
        </header>

        <VerseFlow
          scriptureLanguage={language}
          tradition={tradition}
          shareLabel="Send on WhatsApp"
        />
      </section>
    </div>
  );
}
