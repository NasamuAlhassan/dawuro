"use client";

import { forwardRef, useEffect, useState } from "react";
import type { VerseResult } from "@/lib/types";
import { getLanguage, hasAnyVoice } from "@/lib/languages";
import { receiveUrlDisplay, receiveUrlDisplayStatic } from "@/lib/share";

type Props = {
  verse: VerseResult;
};

/**
 * WhatsApp-ready PNG (1080×1350) — the travelling gift.
 *
 * Deliberately inverted from the app's paper-light UI: in a chat full of
 * white bubbles, a deep fired-clay card with cream Scripture pops. The
 * gold arcs in the corner are the signature — the strike of the dawuro
 * gong, the announcement rippling outward person to person.
 */

const INK_CREAM = "#FAF3E7";
const CREAM_SOFT = "#C9B499";
const CREAM_FAINT = "#B49B7D";
const GOLD = "#C4922A";
const GOLD_TEXT = "#E0B457";
const HAIRLINE = "rgba(217, 198, 174, 0.25)";

function localTextSize(text: string): number {
  if (text.length <= 120) return 52;
  if (text.length <= 240) return 44;
  return 37;
}

export const ShareableCard = forwardRef<HTMLDivElement, Props>(
  function ShareableCard({ verse }, ref) {
    const local = verse.local || verse.twi;
    const lang = getLanguage(verse.localLanguageId || local?.languageId);
    const fromKhaya = verse.localFromKhaya || local?.source === "khaya";
    const englishOnly = lang.id === "en";
    const invite = hasAnyVoice(lang) ? "Hear it aloud" : "Read it + reply";

    // Server and first client render agree (env-only base); the full
    // origin-aware link swaps in after mount — no hydration mismatch.
    const [linkDisplay, setLinkDisplay] = useState(() =>
      receiveUrlDisplayStatic(verse),
    );
    useEffect(() => {
      setLinkDisplay(receiveUrlDisplay(verse));
    }, [verse]);

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1350,
          boxSizing: "border-box",
          padding: "72px 68px",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(160deg, #2B1109 0%, #3A150A 55%, #4A1B0C 100%)",
          color: INK_CREAM,
          fontFamily:
            '"Noto Serif", "Noto Sans", Georgia, "Times New Roman", serif',
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* The gong strike — sound rippling out from the corner */}
        <svg
          aria-hidden
          width={720}
          height={720}
          viewBox="0 0 720 720"
          style={{ position: "absolute", top: -300, right: -300 }}
        >
          <circle cx="360" cy="360" r="150" fill="none" stroke={GOLD} strokeOpacity="0.32" strokeWidth="2.5" />
          <circle cx="360" cy="360" r="230" fill="none" stroke={GOLD} strokeOpacity="0.22" strokeWidth="2.5" />
          <circle cx="360" cy="360" r="310" fill="none" stroke={GOLD} strokeOpacity="0.13" strokeWidth="2.5" />
          <circle cx="360" cy="360" r="390" fill="none" stroke={GOLD} strokeOpacity="0.07" strokeWidth="2.5" />
        </svg>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.3em",
              color: GOLD,
              fontFamily: '"Noto Sans", sans-serif',
            }}
          >
            DAWURO
          </div>
          <div style={{ fontSize: 22, color: CREAM_SOFT }}>
            {englishOnly ? "English" : `${lang.nativeName} · English`}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 30,
            padding: "28px 0",
          }}
        >
          <div style={{ fontSize: 46, fontWeight: 700, color: GOLD_TEXT }}>
            {verse.humanReference}
          </div>
          <div
            style={{
              width: 76,
              height: 3,
              background: GOLD,
              opacity: 0.6,
            }}
          />
          <div
            lang={lang.htmlLang}
            style={{
              fontSize: localTextSize(local?.text || ""),
              lineHeight: 1.52,
              fontWeight: 600,
              color: INK_CREAM,
            }}
          >
            {local?.text}
          </div>
          {fromKhaya && (
            <div style={{ fontSize: 20, color: CREAM_SOFT, lineHeight: 1.4 }}>
              {lang.label} text via Khaya AI — English below is the published
              Scripture.
            </div>
          )}
          {!englishOnly && (
            <div
              lang="en"
              style={{
                fontSize: 27,
                lineHeight: 1.6,
                color: CREAM_SOFT,
                borderTop: `1px solid ${HAIRLINE}`,
                paddingTop: 28,
              }}
            >
              {verse.english.text}
            </div>
          )}
        </div>

        <div
          style={{
            borderTop: `1px solid ${HAIRLINE}`,
            paddingTop: 26,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ fontSize: 18, lineHeight: 1.5, color: CREAM_FAINT }}>
            {local?.copyright && <div>{local.copyright}</div>}
            {!englishOnly && verse.english.copyright && (
              <div>English: {verse.english.copyright}</div>
            )}
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 22px",
              borderRadius: 999,
              border: `1.5px solid rgba(196, 146, 42, 0.55)`,
              background: "rgba(196, 146, 42, 0.14)",
              fontSize: 21,
              fontWeight: 700,
              color: GOLD_TEXT,
              fontFamily: '"Noto Sans", sans-serif',
            }}
          >
            {invite} · {linkDisplay}
          </div>
        </div>
      </div>
    );
  },
);
