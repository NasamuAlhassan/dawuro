"use client";

import { useState } from "react";
import type { VerseResult } from "@/lib/types";
import { FeelingInput } from "@/components/FeelingInput";
import { VerseCard } from "@/components/VerseCard";
import { VerseOfTheDay } from "@/components/VerseOfTheDay";

type VerseApiResponse = {
  verse?: VerseResult;
  topic?: { id: string; label: string };
  feeling?: string | null;
  error?: string;
  code?: string;
};

export function HomeClient() {
  const [verse, setVerse] = useState<VerseResult | null>(null);
  const [topicLabel, setTopicLabel] = useState<string | null>(null);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFeeling(text: string) {
    setLoading(true);
    setError(null);
    setVerse(null);
    setTopicLabel(null);
    setFeeling(text);
    setStatus("Finding a word for you…");

    try {
      const res = await fetch("/api/verse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeling: text }),
      });
      const json = (await res.json()) as VerseApiResponse;

      if (!res.ok || !json.verse) {
        setError(json.error || "Something went wrong. Please try again.");
        setStatus(null);
        return;
      }

      setVerse(json.verse);
      setTopicLabel(json.topic?.label ?? null);
      setStatus(null);
    } catch {
      setError("Network error. Check your connection and try again.");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-6">
      <VerseOfTheDay />

      <section className="space-y-4">
        <FeelingInput onSubmit={handleFeeling} loading={loading} />

        {status && (
          <p className="text-sm text-ink-soft" aria-live="polite">
            {status}
          </p>
        )}

        {error && (
          <div
            className="rounded-xl border border-brand/20 bg-gold-soft/40 px-4 py-3 text-sm text-ink"
            role="alert"
          >
            <p>{error}</p>
            {error.toLowerCase().includes("biblica") && (
              <p className="mt-2 text-xs text-ink-soft">
                Accept the Biblica Fast-track license at{" "}
                <a
                  href="https://platform.youversion.com/"
                  className="font-medium text-brand underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  platform.youversion.com
                </a>
                , then try again.
              </p>
            )}
          </div>
        )}

        {verse && (
          <div className="space-y-2">
            {(topicLabel || feeling) && (
              <p className="text-xs text-ink-soft">
                {topicLabel && (
                  <span className="font-medium text-ink">{topicLabel}</span>
                )}
                {feeling && (
                  <span>
                    {topicLabel ? " · " : ""}
                    for &ldquo;{feeling}&rdquo;
                  </span>
                )}
              </p>
            )}
            <VerseCard verse={verse} />
          </div>
        )}
      </section>
    </div>
  );
}
