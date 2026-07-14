"use client";

import { useEffect, useState } from "react";
import type { VerseResult } from "@/lib/types";
import { VerseCard } from "@/components/VerseCard";

type VotdResponse = {
  day: number;
  verse: VerseResult;
  error?: string;
  code?: string;
};

/**
 * Home VOTD widget — loads on open from /api/votd.
 */
export function VerseOfTheDay() {
  const [data, setData] = useState<VotdResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/votd");
        const json = (await res.json()) as VotdResponse & {
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || "Could not load Verse of the Day.");
          return;
        }
        setData(json);
      } catch {
        if (!cancelled) setError("Could not load Verse of the Day.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-gold">
          Verse of the Day
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          Finding today&apos;s word…
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-gold">
          Verse of the Day
        </p>
        <p className="mt-3 text-sm text-ink-soft">{error}</p>
        {error.toLowerCase().includes("biblica") && (
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
            and accept the Biblica Fast-track Bible License, then refresh.
          </p>
        )}
      </section>
    );
  }

  if (!data?.verse) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between px-0.5">
        <p className="text-xs font-medium uppercase tracking-wide text-gold">
          Verse of the Day
        </p>
        <p className="text-[11px] text-ink-soft">Day {data.day}</p>
      </div>
      <VerseCard verse={data.verse} />
    </section>
  );
}
