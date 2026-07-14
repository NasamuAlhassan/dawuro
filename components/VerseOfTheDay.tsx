"use client";

import { useEffect, useState } from "react";
import type { VerseResult } from "@/lib/types";
import type { LocalLanguageId } from "@/lib/languages";
import { VerseCard } from "@/components/VerseCard";
import { ShareSheet } from "@/components/ShareSheet";

type VotdResponse = {
  day: number;
  verse: VerseResult;
  error?: string;
  code?: string;
};

type Props = {
  language: LocalLanguageId;
};

export function VerseOfTheDay({ language }: Props) {
  const [data, setData] = useState<VotdResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(
          `/api/votd?language=${encodeURIComponent(language)}`,
        );
        const json = (await res.json()) as VotdResponse & {
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || "Could not load Verse of the Day.");
          setData(null);
          return;
        }
        setData(json);
      } catch {
        if (!cancelled) {
          setError("Could not load Verse of the Day.");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [language]);

  if (loading) {
    return (
      <section className="dawuro-card p-5">
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold" />
          Finding today&apos;s word…
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dawuro-card p-5">
        <p className="text-sm text-ink-soft">{error}</p>
        {(error.toLowerCase().includes("biblica") ||
          error.toLowerCase().includes("license")) && (
          <p className="mt-2 text-xs text-ink-soft">
            Open{" "}
            <a
              href="https://platform.youversion.com/"
              className="font-medium text-brand underline"
              target="_blank"
              rel="noreferrer"
            >
              platform.youversion.com
            </a>{" "}
            and accept the Biblica Fast-track license, then refresh.
          </p>
        )}
      </section>
    );
  }

  if (!data?.verse) return null;

  return (
    <section className="dawuro-rise space-y-4">
      <div className="flex items-center justify-between px-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          Day {data.day} of the year
        </p>
      </div>
      <VerseCard verse={data.verse} />
      <ShareSheet
        verse={data.verse}
        buttonLabel="Share as voice note"
      />
    </section>
  );
}
