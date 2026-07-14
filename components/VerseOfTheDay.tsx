"use client";

import { useEffect, useState } from "react";
import type { VerseResult } from "@/lib/types";
import type { LocalLanguageId } from "@/lib/languages";
import { VerseCard } from "@/components/VerseCard";
import { ShareSheet } from "@/components/ShareSheet";
import { IconLoader } from "@/components/ui/Icons";

type VotdResponse = {
  day: number;
  verse: VerseResult;
  error?: string;
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
        <p className="flex items-center gap-2 text-[13px] text-ink-soft">
          <IconLoader size={14} className="dawuro-spin" />
          Loading today&apos;s verse…
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dawuro-card p-5">
        <p className="text-[13px] text-ink-soft">{error}</p>
        {(error.toLowerCase().includes("biblica") ||
          error.toLowerCase().includes("license")) && (
          <p className="mt-2 text-[12px] text-ink-soft">
            Accept the Biblica license at{" "}
            <a
              href="https://platform.youversion.com/"
              className="font-medium text-brand underline"
              target="_blank"
              rel="noreferrer"
            >
              platform.youversion.com
            </a>
            , then refresh.
          </p>
        )}
      </section>
    );
  }

  if (!data?.verse) return null;

  return (
    <section className="dawuro-rise space-y-4">
      <p className="text-[12px] text-ink-faint">Day {data.day}</p>
      <VerseCard verse={data.verse} />
      <ShareSheet verse={data.verse} buttonLabel="Share as voice note" />
    </section>
  );
}
