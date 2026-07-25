"use client";

import { useState, type ReactNode } from "react";
import type { Reflection, Tradition, VerseResult } from "@/lib/types";
import type { InputLanguageId, LocalLanguageId } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { FeelingInput } from "@/components/FeelingInput";
import { VerseCard } from "@/components/VerseCard";
import {
  ReflectionBlock,
  ReflectionSkipped,
} from "@/components/ReflectionBlock";
import { ShareSheet } from "@/components/ShareSheet";
import { fetchWithTimeout } from "@/lib/fetch-timeout";
import { humanizeApiError } from "@/lib/errors";
import { IconLoader } from "@/components/ui/Icons";

type VerseApiResponse = {
  verse?: VerseResult;
  topic?: { id: string; label: string };
  mappingSource?: "explicit" | "curated" | "gloo";
  feeling?: string | null;
  error?: string;
};

type ReflectApiResponse = {
  reflection?: Reflection;
  error?: string;
  code?: string;
};

type Props = {
  /** Language the verse card should arrive in. */
  scriptureLanguage: LocalLanguageId;
  /** Tone for the Gloo reflection. */
  tradition: Tradition;
  /** Label on the share button once a verse is found. */
  shareLabel?: string;
  /** Shown below the input while nothing has been asked yet. */
  idleHint?: ReactNode;
};

/**
 * The core conversation turn: feeling in → verse + reflection + share out.
 * Used on Home and on the receive page (/v/...) so every person who is
 * sent a verse can immediately send one back.
 */
export function VerseFlow({
  scriptureLanguage,
  tradition,
  shareLabel = "Share on WhatsApp",
  idleHint,
}: Props) {
  const [verse, setVerse] = useState<VerseResult | null>(null);
  const [topicLabel, setTopicLabel] = useState<string | null>(null);
  const [mappingSource, setMappingSource] = useState<string | null>(null);
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
          "Add Gloo keys (GLOO_CLIENT_ID / GLOO_CLIENT_SECRET) to unlock reflections.",
        );
        return;
      }
      if (!res.ok || !json.reflection) {
        setReflectNote(
          json.error ||
            "Reflection unavailable — the verse is still for you.",
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
  ) {
    setLoading(true);
    setError(null);
    setVerse(null);
    setReflection(null);
    setReflectNote(null);
    setTopicLabel(null);
    setMappingSource(null);
    setFeeling(text);
    const langName = getLanguage(scriptureLanguage).name;
    setStatus(`Finding Scripture in ${langName}…`);

    try {
      const res = await fetchWithTimeout(
        "/api/verse",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feeling: text,
            language: scriptureLanguage,
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
      setMappingSource(json.mappingSource ?? null);
      setStatus(null);
      setLoading(false);
      void fetchReflection(json.verse, text, tradition, scriptureLanguage);
    } catch {
      setError("Network error. Check your connection and try again.");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  const errInfo = error ? humanizeApiError(error) : null;

  return (
    <div className="flex flex-col gap-6">
      <section className="dawuro-card p-4 sm:p-5">
        <FeelingInput
          onSubmit={(t, inputLang) => handleFeeling(t, inputLang)}
          loading={loading}
        />
      </section>

      {!verse && !loading && !error && idleHint}

      {status && (
        <p
          className="flex items-center gap-2 text-[13px] text-ink-soft"
          aria-live="polite"
        >
          <IconLoader size={14} className="dawuro-spin text-brand" />
          {status}
        </p>
      )}

      {errInfo && (
        <div
          className="dawuro-rise rounded-[var(--radius)] border border-brand/20 bg-surface-2 px-4 py-3 text-[13px] text-ink"
          role="alert"
        >
          <p className="font-medium">{errInfo.title}</p>
          {errInfo.detail && (
            <p className="mt-1 text-[12px] text-ink-soft">{errInfo.detail}</p>
          )}
          {errInfo.actionHref && (
            <a
              href={errInfo.actionHref}
              className="mt-2 inline-block text-[12px] font-medium text-brand underline"
              target="_blank"
              rel="noreferrer"
            >
              {errInfo.actionLabel || "Open link"}
            </a>
          )}
        </div>
      )}

      {verse && (
        <div className="dawuro-rise space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            {topicLabel && (
              <span className="rounded-md bg-ink/5 px-2 py-1 font-medium text-ink">
                {topicLabel}
              </span>
            )}
            <span
              className="font-medium text-ink"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              {verse.humanReference}
            </span>
            {feeling && (
              <span className="text-ink-soft">· for “{feeling}”</span>
            )}
            {mappingSource === "gloo" && (
              <span className="text-[11px] text-ink-faint">
                · chosen with Gloo AI
              </span>
            )}
          </div>

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

          <ShareSheet verse={verse} buttonLabel={shareLabel} />
        </div>
      )}
    </div>
  );
}
