"use client";

import { useState } from "react";
import type { Reflection, Tradition, VerseResult } from "@/lib/types";
import type { InputLanguageId, LocalLanguageId } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { useApp } from "@/lib/app-context";
import { FeelingInput } from "@/components/FeelingInput";
import { VerseCard } from "@/components/VerseCard";
import {
  ReflectionBlock,
  ReflectionSkipped,
} from "@/components/ReflectionBlock";
import { ShareSheet } from "@/components/ShareSheet";
import { fetchWithTimeout } from "@/lib/fetch-timeout";

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
  const { language, tradition } = useApp();

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
    lang: LocalLanguageId,
  ) {
    setReflectLoading(true);
    setReflection(null);
    setReflectNote(null);
    try {
      const res = await fetchWithTimeout(
        "/api/reflect",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feeling: feel,
            humanReference: v.humanReference,
            englishVerseText: v.english.text,
            tradition: trad,
            language: lang,
          }),
        },
        30_000,
      );
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
      setReflectNote("Could not load reflection — the verse is still for you.");
    } finally {
      setReflectLoading(false);
    }
  }

  async function handleFeeling(
    text: string,
    inputLanguage: InputLanguageId = "en",
    scriptureLang: LocalLanguageId = language,
  ) {
    setLoading(true);
    setError(null);
    setVerse(null);
    setReflection(null);
    setReflectNote(null);
    setTopicLabel(null);
    setFeeling(text);
    const langName = getLanguage(scriptureLang).name;
    setStatus(
      getLanguage(scriptureLang).bibleId
        ? `Finding a word for you in ${langName}…`
        : `Finding a word — English from YouVersion, ${langName} via Khaya…`,
    );

    try {
      const res = await fetchWithTimeout(
        "/api/verse",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feeling: text,
            language: scriptureLang,
            inputLanguage,
          }),
        },
        45_000,
      );
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
      void fetchReflection(json.verse, text, tradition, scriptureLang);
    } catch {
      setError("Network error. Check your connection and try again.");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Hero */}
      <section className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
          Akwaaba · Welcome
        </p>
        <h2
          className="text-[1.75rem] font-semibold leading-tight tracking-tight text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          What&apos;s on your heart?
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          Speak or type a feeling. Receive Scripture in{" "}
          <span className="font-medium text-ink">
            {getLanguage(language).nativeName}
          </span>{" "}
          and English — ready to share.
        </p>
      </section>

      {/* Composer */}
      <section className="dawuro-card-elevated p-4 sm:p-5">
        <FeelingInput
          onSubmit={(t, inputLang) => handleFeeling(t, inputLang)}
          loading={loading}
        />
      </section>

      {status && (
        <p
          className="flex items-center gap-2 text-sm text-ink-soft"
          aria-live="polite"
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
          {status}
        </p>
      )}

      {error && (
        <div
          className="dawuro-rise rounded-2xl border border-brand/25 bg-gold-soft/50 px-4 py-3 text-sm text-ink"
          role="alert"
        >
          <p>{error}</p>
          {(error.toLowerCase().includes("biblica") ||
            error.toLowerCase().includes("license")) && (
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
        <div className="dawuro-rise space-y-4">
          {(topicLabel || feeling) && (
            <p className="text-xs text-ink-soft">
              {topicLabel && (
                <span className="rounded-full bg-brand/10 px-2.5 py-1 font-semibold text-brand">
                  {topicLabel}
                </span>
              )}
              {feeling && (
                <span className="ml-2">
                  for &ldquo;{feeling}&rdquo;
                </span>
              )}
            </p>
          )}

          <VerseCard verse={verse} />

          {reflectLoading && (
            <ReflectionBlock reflection={{ english: "" }} loading />
          )}
          {!reflectLoading && reflection && (
            <ReflectionBlock reflection={reflection} />
          )}
          {!reflectLoading && !reflection && reflectNote && (
            <ReflectionSkipped reason={reflectNote} />
          )}

          <ShareSheet verse={verse} buttonLabel="Share on WhatsApp" />
        </div>
      )}

      {!verse && !loading && !error && (
        <p className="text-center text-[12px] text-ink-soft">
          Or open{" "}
          <a href="/today" className="font-medium text-brand underline-offset-2 hover:underline">
            Today
          </a>{" "}
          for the Verse of the Day.
        </p>
      )}
    </div>
  );
}
