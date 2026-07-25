"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LocalLanguageId } from "@/lib/languages";
import { useApp } from "@/lib/app-context";
import { IconChevronRight, IconLoader } from "@/components/ui/Icons";

type Props = {
  language: LocalLanguageId;
};

/**
 * Compact home teaser for Verse of the Day → full /today experience.
 */
export function TodayTeaser({ language }: Props) {
  const { hydrated } = useApp();
  const [ref, setRef] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for stored preferences so we fetch once, in the right language.
    if (!hydrated) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/votd?language=${encodeURIComponent(language)}`,
        );
        const json = (await res.json()) as {
          verse?: { humanReference?: string };
        };
        if (!cancelled && res.ok && json.verse?.humanReference) {
          setRef(json.verse.humanReference);
        }
      } catch {
        /* silent — teaser is optional */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [language, hydrated]);

  return (
    <Link
      href="/today"
      className="dawuro-panel flex items-center justify-between gap-3 px-4 py-3 transition hover:border-line-strong"
    >
      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-wide text-ink-faint">
          Today
        </p>
        {loading ? (
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-soft">
            <IconLoader size={12} className="dawuro-spin" />
            Loading verse…
          </p>
        ) : (
          <p
            className="mt-0.5 truncate text-[14px] font-medium text-ink"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {ref || "Verse of the Day"}
          </p>
        )}
      </div>
      <IconChevronRight size={18} className="shrink-0 text-ink-faint" />
    </Link>
  );
}
