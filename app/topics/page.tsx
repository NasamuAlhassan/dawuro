"use client";

import { useState } from "react";
import type { VerseResult } from "@/lib/types";
import { TOPIC_MAP, usfmToHuman, type TopicEntry } from "@/lib/verses";
import { useApp } from "@/lib/app-context";
import { getLanguage } from "@/lib/languages";
import { VerseCard } from "@/components/VerseCard";
import { ShareSheet } from "@/components/ShareSheet";
import { fetchWithTimeout } from "@/lib/fetch-timeout";
import { IconChevronRight, IconLoader } from "@/components/ui/Icons";

/**
 * The curated map, browsable: eleven doors into Scripture by what you
 * feel. Tapping a topic opens its verse right here — read, hear, send.
 */
export default function TopicsPage() {
  const { language } = useApp();
  const lang = getLanguage(language);
  const topics = TOPIC_MAP.filter((t) => t.id !== "default");

  const [openId, setOpenId] = useState<string | null>(null);
  const [verses, setVerses] = useState<Record<string, VerseResult>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(topic: TopicEntry) {
    if (openId === topic.id) {
      setOpenId(null);
      return;
    }
    setOpenId(topic.id);
    setError(null);
    const cacheKey = `${language}:${topic.id}`;
    if (verses[cacheKey]) return;

    setLoadingId(topic.id);
    try {
      const res = await fetchWithTimeout(
        "/api/verse",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: topic.references[0],
            language,
          }),
        },
        45_000,
      );
      const json = (await res.json()) as {
        verse?: VerseResult;
        error?: string;
      };
      if (res.ok && json.verse) {
        setVerses((v) => ({ ...v, [cacheKey]: json.verse! }));
      } else {
        setError(json.error || "Could not open this verse right now.");
      }
    } catch {
      setError("Could not open this verse right now.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="space-y-1">
        <h1
          className="text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Topics
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-soft">
          Eleven doors into Scripture — in {lang.nativeName} and English.
        </p>
      </header>

      <ul className="space-y-2">
        {topics.map((topic) => {
          const cacheKey = `${language}:${topic.id}`;
          const open = openId === topic.id;
          const verse = verses[cacheKey];
          return (
            <li key={topic.id}>
              <button
                type="button"
                onClick={() => void toggle(topic)}
                aria-expanded={open}
                className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-[var(--radius)] border px-4 text-left transition ${
                  open
                    ? "border-line-strong bg-surface-2"
                    : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                <span
                  className="text-[15px] font-semibold text-ink"
                  style={{ fontFamily: "var(--font-display), serif" }}
                >
                  {topic.label}
                </span>
                <span className="flex items-center gap-2 text-[12px] text-ink-faint">
                  {usfmToHuman(topic.references[0])}
                  <IconChevronRight
                    size={15}
                    className={`transition-transform ${open ? "rotate-90" : ""}`}
                  />
                </span>
              </button>

              {open && (
                <div className="dawuro-rise mt-2 space-y-4 pb-2">
                  {loadingId === topic.id && (
                    <p className="flex items-center gap-2 px-1 text-[13px] text-ink-soft">
                      <IconLoader size={14} className="dawuro-spin text-brand" />
                      Opening {usfmToHuman(topic.references[0])}…
                    </p>
                  )}
                  {verse && (
                    <>
                      <VerseCard verse={verse} />
                      <ShareSheet verse={verse} buttonLabel="Send on WhatsApp" />
                    </>
                  )}
                  {!verse && loadingId !== topic.id && error && (
                    <p className="px-1 text-[13px] text-ink-soft">{error}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
