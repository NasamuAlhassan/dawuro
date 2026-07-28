"use client";

import { useEffect, useState } from "react";
import type { VerseResult } from "@/lib/types";
import { useApp } from "@/lib/app-context";
import { VerseCard } from "@/components/VerseCard";
import { ShareSheet } from "@/components/ShareSheet";
import { IconLoader } from "@/components/ui/Icons";

type Props = {
  /** Server-rendered Verse of the Day in the default language (Twi). */
  initialVotd: VerseResult | null;
  initialDay: number | null;
};

/**
 * The home hero: Scripture already on screen when the app opens.
 * Server HTML carries the Twi verse; after hydration, users whose stored
 * language differs get their own language with one quiet refetch.
 */
export function VotdHero({ initialVotd, initialDay }: Props) {
  const { language, hydrated } = useApp();
  const [verse, setVerse] = useState<VerseResult | null>(
    language === "tw" ? initialVotd : null,
  );
  const [day, setDay] = useState<number | null>(initialDay);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (language === "tw" && initialVotd) {
      setVerse(initialVotd);
      setDay(initialDay);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/votd?language=${encodeURIComponent(language)}`,
        );
        const json = (await res.json()) as {
          day?: number;
          verse?: VerseResult;
          error?: string;
        };
        if (cancelled) return;
        if (res.ok && json.verse) {
          setVerse(json.verse);
          setDay(json.day ?? null);
          setError(null);
        } else if (!verse) {
          setError(json.error || "Could not load today's verse.");
        }
      } catch {
        if (!cancelled && !verse) {
          setError("Could not load today's verse.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, hydrated, initialVotd, initialDay]);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">
          The Word for today
        </p>
        {day !== null && (
          <p className="text-[11px] text-ink-faint">Day {day}</p>
        )}
      </div>

      {verse ? (
        <div className="dawuro-rise space-y-4">
          <VerseCard verse={verse} />
          <ShareSheet verse={verse} buttonLabel="Send on WhatsApp" />
        </div>
      ) : error ? (
        <div className="dawuro-panel px-4 py-4">
          <p className="text-[13px] text-ink-soft">{error}</p>
        </div>
      ) : (
        <div className="dawuro-card px-5 py-10">
          <p className="flex items-center justify-center gap-2 text-[13px] text-ink-soft">
            <IconLoader size={14} className="dawuro-spin text-brand" />
            Opening today&apos;s verse…
          </p>
        </div>
      )}
    </section>
  );
}
