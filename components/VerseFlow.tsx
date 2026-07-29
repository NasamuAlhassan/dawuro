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

/**
 * The core conversation turn as a hook: feeling in → verse + reflection.
 * Pages compose their own input UI (Heart's big mic, Receive's inline
 * form) around the same state machine.
 */
export function useVerseFlow(
  scriptureLanguage: LocalLanguageId,
  tradition: Tradition,
) {
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

  async function fetchReflection(v: VerseResult, feel: string) {
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
            tradition,
            language: scriptureLanguage,
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
      void fetchReflection(json.verse, text);
    } catch {
      setError("Network error. Check your connection and try again.");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return {
    verse,
    topicLabel,
    mappingSource,
    feeling,
    reflection,
    reflectNote,
    reflectLoading,
    status,
    error,
    loading,
    handleFeeling,
  };
}

export type VerseFlowState = ReturnType<typeof useVerseFlow>;

/** Status line, error panel, verse card, reflection, and share actions. */
export function VerseFlowResults({
  flow,
  shareLabel = "Share on WhatsApp",
}: {
  flow: VerseFlowState;
  shareLabel?: string;
}) {
  const errInfo = flow.error ? humanizeApiError(flow.error) : null;

  return (
    <>
      {flow.status && (
        <p
          className="flex items-center gap-2 text-[13px] text-ink-soft"
          aria-live="polite"
        >
          <IconLoader size={14} className="dawuro-spin text-brand" />
          {flow.status}
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

      {flow.verse && (
        <div className="dawuro-rise space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            {flow.topicLabel && (
              <span className="rounded-md bg-ink/5 px-2 py-1 font-medium text-ink">
                {flow.topicLabel}
              </span>
            )}
            <span
              className="font-medium text-ink"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              {flow.verse.humanReference}
            </span>
            {flow.feeling && (
              <span className="text-ink-soft">· for “{flow.feeling}”</span>
            )}
            {flow.mappingSource === "gloo" && (
              <span className="text-[11px] text-ink-faint">
                · chosen with Gloo AI
              </span>
            )}
          </div>

          <VerseCard verse={flow.verse} />

          {flow.reflectLoading && (
            <ReflectionBlock reflection={{ english: "" }} loading />
          )}
          {!flow.reflectLoading && flow.reflection && (
            <ReflectionBlock reflection={flow.reflection} />
          )}
          {!flow.reflectLoading && !flow.reflection && flow.reflectNote && (
            <ReflectionSkipped reason={flow.reflectNote} />
          )}

          <ShareSheet verse={flow.verse} buttonLabel={shareLabel} />
        </div>
      )}
    </>
  );
}

type Props = {
  scriptureLanguage: LocalLanguageId;
  tradition: Tradition;
  shareLabel?: string;
  idleHint?: ReactNode;
};

/** Classic composition: compact input card + results (used on /v receive pages). */
export function VerseFlow({
  scriptureLanguage,
  tradition,
  shareLabel = "Share on WhatsApp",
  idleHint,
}: Props) {
  const flow = useVerseFlow(scriptureLanguage, tradition);

  return (
    <div className="flex flex-col gap-6">
      <section className="dawuro-card p-4 sm:p-5">
        <FeelingInput
          onSubmit={(t, inputLang) => void flow.handleFeeling(t, inputLang)}
          loading={flow.loading}
        />
      </section>

      {!flow.verse && !flow.loading && !flow.error && idleHint}

      <VerseFlowResults flow={flow} shareLabel={shareLabel} />
    </div>
  );
}
