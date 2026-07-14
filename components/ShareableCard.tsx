"use client";

import { forwardRef } from "react";
import type { VerseResult } from "@/lib/types";
import { getLanguage } from "@/lib/languages";

type Props = {
  verse: VerseResult;
};

/**
 * WhatsApp-ready PNG target (1080×1350).
 * High contrast, diacritic-safe fonts, local text as hero.
 */
export const ShareableCard = forwardRef<HTMLDivElement, Props>(
  function ShareableCard({ verse }, ref) {
    const local = verse.local || verse.twi;
    const lang = getLanguage(verse.localLanguageId || local?.languageId);
    const fromKhaya = verse.localFromKhaya || local?.source === "khaya";

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1350,
          boxSizing: "border-box",
          padding: "64px 56px",
          background: "#FAF6F0",
          color: "#1F1A14",
          fontFamily:
            '"Noto Serif", "Noto Sans", Georgia, "Times New Roman", serif',
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: "2px solid #DDD0BE",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#9E3414",
              textTransform: "uppercase",
            }}
          >
            Dawuro
          </div>
          <div style={{ marginTop: 10, fontSize: 22, color: "#6A5E52" }}>
            {lang.nativeName} · English
          </div>
          {fromKhaya && (
            <div
              style={{
                marginTop: 16,
                fontSize: 18,
                color: "#6A5E52",
                lineHeight: 1.4,
              }}
            >
              Local text via Khaya · English is published Scripture
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 32,
            padding: "24px 0",
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: "#9E3414",
            }}
          >
            {verse.humanReference}
          </div>

          <div
            lang={lang.htmlLang}
            style={{
              fontSize: 42,
              lineHeight: 1.5,
              fontWeight: 600,
              color: "#1F1A14",
              // Ensure ɛ ɔ render with Noto
            }}
          >
            {local?.text}
          </div>

          <div
            lang="en"
            style={{
              fontSize: 28,
              lineHeight: 1.55,
              color: "#4A4036",
              borderTop: "1px solid #DDD0BE",
              paddingTop: 28,
            }}
          >
            {verse.english.text}
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #DDD0BE",
            paddingTop: 22,
            fontSize: 16,
            lineHeight: 1.45,
            color: "#6A5E52",
          }}
        >
          {local?.copyright && (
            <div style={{ marginBottom: 6 }}>{local.copyright}</div>
          )}
          {verse.english.copyright && <div>{verse.english.copyright}</div>}
          <div
            style={{
              marginTop: 18,
              fontSize: 18,
              fontWeight: 600,
              color: "#9E3414",
            }}
          >
            dawuro · share the Word
          </div>
        </div>
      </div>
    );
  },
);
