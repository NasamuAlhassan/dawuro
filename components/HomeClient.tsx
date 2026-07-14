"use client";

import { useState } from "react";
import type { Reflection, Tradition, VerseResult } from "@/lib/types";
import { FeelingInput } from "@/components/FeelingInput";
import { VerseCard } from "@/components/VerseCard";
import { VerseOfTheDay } from "@/components/VerseOfTheDay";
import {
  ReflectionBlock,
  ReflectionSkipped,
} from "@/components/ReflectionBlock";
import {
  TraditionSetting,
  useTradition,
} from "@/components/TraditionSetting";
import { ShareSheet } from "@/components/ShareSheet";

type VerseApiResponse = {
  verse?: VerseResult;
  topic?: { id: string; label: string };
  feeling?: string | null;
  error?: string;
  code?: string;
};

type ReflectApiResponse = {
  reflection?: Reflection;
  error?: string;
  code?: string;
};

export function HomeClient() {
  const [tradition, setTradition] = useTradition();
  const [showSettings, setShowSettings] = useState(false);

  const [verse, setVerse] = useState<VerseResult | null>(null);
  const [topicLabel, setTopicLabel] = useState<string | null>(null);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [reflectNote, setReflectNote] = useState<string | null>(null);
  const [reflectLoading, setReflectLoading] = useState(false);

  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchReflection(
    v: VerseResult,
    feel: string,
    trad: Tradition,
  ) {
    setReflectLoading(true);
    setReflection(null);
    setReflectNote(null);
    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeling: feel,
          humanReference: v.humanReference,
          englishVerseText: v.english.text,
          tradition: trad,
        }),
      });
      const json = (await res.json()) as ReflectApiResponse;

      if (res.status === 503 && json.code === "GLOO_NOT_CONFIGURED") {
        setReflectNote(
          "Reflection will appear once Gloo AI credentials are added.",
        );
        return;
      }

      if (!res.ok || !json.reflection) {
        setReflectNote(
          json.error ||
            "Reflection unavailable right now — the verse is still for you.",
        );
        return;
      }

      setReflection(json.reflection);
    } catch {
      setReflectNote(
        "Could not load reflection — the verse is still for you.",
      );
    } finally {
      setReflectLoading(false);
    }
  }

  async function handleFeeling(text: string) {
    setLoading(true);
    setError(null);
    setVerse(null);
    setReflection(null);
    setReflectNote(null);
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
      setLoading(false);

      // Progressive: reflection loads after verse is on screen
      void fetchReflection(json.verse, text, tradition);
    } catch {
      setError("Network error. Check your connection and try again.");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowSettings((s) => !s)}
          className="text-xs font-medium text-ink-soft underline-offset-2 hover:text-ink hover:underline"
          aria-expanded={showSettings}
        >
          {showSettings ? "Close settings" : "Settings"}
        </button>
      </div>

      {showSettings && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <TraditionSetting value={tradition} onChange={setTradition} />
          <p className="mt-2 text-[11px] text-ink-soft">
            Shapes the tone of AI reflections (Gloo). Default suits a Ghanaian
            evangelical context.
          </p>
        </section>
      )}

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
          <div className="space-y-3">
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

            {reflectLoading && <ReflectionBlock reflection={{ english: "" }} loading />}
            {!reflectLoading && reflection && (
              <ReflectionBlock reflection={reflection} />
            )}
            {!reflectLoading && !reflection && reflectNote && (
              <ReflectionSkipped reason={reflectNote} />
            )}

            <ShareSheet verse={verse} buttonLabel="Share on WhatsApp" />
          </div>
        )}
      </section>
    </div>
  );
}
