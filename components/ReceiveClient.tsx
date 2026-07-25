"use client";

import { useEffect, useState } from "react";
import type { PassageSide, VerseResult } from "@/lib/types";
import type { LocalLanguageId } from "@/lib/languages";
import { getLanguage } from "@/lib/languages";
import { useApp } from "@/lib/app-context";
import { VerseCard } from "@/components/VerseCard";
import { VerseFlow } from "@/components/VerseFlow";
import { fetchWithTimeout } from "@/lib/fetch-timeout";
import { IconLoader } from "@/components/ui/Icons";

type Props = {
  languageId: LocalLanguageId;
  usfm: string;
  /** Full bilingual verse when the local side is a published Bible. */
  initialVerse: VerseResult | null;
  /** Published English side — always available for instant paint. */
  english: PassageSide;
  humanReference: string;
};

/**
 * The receiver's side of the loop. They were sent a verse link on WhatsApp,
 * opened it with no app and no login, and can now hear the verse and reply
 * with one of their own — Scripture as conversation, not broadcast.
 *
 * For languages without a published Bible the server sends only the English
 * side (instant), and this component completes the labelled Khaya rendering
 * after mount.
 */
export function ReceiveClient({
  languageId,
  usfm,
  initialVerse,
  english,
  humanReference,
}: Props) {
  const { tradition } = useApp();
  const lang = getLanguage(languageId);

  const [verse, setVerse] = useState<VerseResult | null>(initialVerse);
  const [localNote, setLocalNote] = useState<string | null>(null);

  useEffect(() => {
    if (initialVerse) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchWithTimeout(
          "/api/verse",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: usfm, language: languageId }),
          },
          45_000,
        );
        const json = (await res.json()) as {
          verse?: VerseResult;
          error?: string;
        };
        if (cancelled) return;
        if (res.ok && json.verse) {
          setVerse(json.verse);
        } else {
          setLocalNote(
            `Couldn't render ${lang.nativeName} right now — the English above is the published Scripture.`,
          );
        }
      } catch {
        if (!cancelled) {
          setLocalNote(
            `Couldn't render ${lang.nativeName} right now — the English above is the published Scripture.`,
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialVerse, usfm, languageId, lang.nativeName]);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <section className="space-y-4">
        {verse ? (
          <VerseCard verse={verse} />
        ) : (
          <article className="dawuro-card">
            <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
              <p
                className="text-[15px] font-semibold tracking-tight text-ink"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                {humanReference}
              </p>
              <span className="shrink-0 text-[11px] font-medium text-ink-faint">
                English
              </span>
            </div>
            <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
              <p
                className="text-[1.125rem] leading-[1.7] text-ink"
                style={{ fontFamily: "var(--font-verse), serif" }}
                lang="en"
              >
                {english.text}
              </p>
              {localNote ? (
                <p className="text-[12px] leading-snug text-ink-soft">
                  {localNote}
                </p>
              ) : (
                <p className="flex items-center gap-2 text-[12px] text-ink-soft">
                  <IconLoader size={13} className="dawuro-spin text-brand" />
                  Rendering in {lang.nativeName} with Khaya — not a published
                  Bible; the English above is the Scripture text.
                </p>
              )}
              {english.copyright && (
                <footer className="border-t border-line pt-3">
                  <p className="text-[10px] leading-snug text-ink-faint">
                    English: {english.copyright}
                  </p>
                </footer>
              )}
            </div>
          </article>
        )}
      </section>

      <section className="space-y-4">
        <header className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-brand">
            Your turn
          </p>
          <h2
            className="text-[1.35rem] font-semibold leading-[1.25] tracking-[-0.02em] text-ink"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            What&apos;s on your heart?
          </h2>
          <p className="max-w-[38ch] text-[13px] leading-relaxed text-ink-soft">
            Say or type how you feel, and send a verse back in{" "}
            {lang.nativeName} — same chat, no app to install.
          </p>
        </header>

        <VerseFlow
          scriptureLanguage={languageId}
          tradition={tradition}
          shareLabel="Send your verse back"
        />
      </section>
    </div>
  );
}
