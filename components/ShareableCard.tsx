"use client";

import { forwardRef } from "react";
import type { VerseResult } from "@/lib/types";

type Props = {
  verse: VerseResult;
};

/**
 * Fixed-size visual card rendered off-screen (or hidden) for PNG export.
 * Twi is the hero; English support; attribution + Dawuro mark.
 * 1080×1350 logical pixels at pixelRatio 2 for WhatsApp.
 */
export const ShareableCard = forwardRef<HTMLDivElement, Props>(
  function ShareableCard({ verse }, ref) {
    return (
      <div
        ref={ref}
        // Fixed export size — do not use responsive units here
        style={{
          width: 1080,
          height: 1350,
          boxSizing: "border-box",
          padding: "72px 64px",
          background: "linear-gradient(165deg, #FBF7F0 0%, #F1E2BE 55%, #FBF7F0 100%)",
          color: "#2A2118",
          fontFamily:
            'var(--font-verse), "Noto Serif", "Noto Sans", Georgia, serif',
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: "1px solid #E7DECE",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display), "Source Serif 4", Georgia, serif',
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: "#B23A16",
              textTransform: "uppercase",
            }}
          >
            Dawuro
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 22,
              color: "#6B5D4F",
            }}
          >
            Scripture in the voice of your people
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
          <div
            style={{
              fontFamily: 'var(--font-display), "Source Serif 4", Georgia, serif',
              fontSize: 32,
              fontWeight: 600,
              color: "#B23A16",
            }}
          >
            {verse.humanReference}
          </div>

          <div
            lang="tw"
            style={{
              fontSize: 44,
              lineHeight: 1.45,
              fontWeight: 600,
              color: "#2A2118",
            }}
          >
            {verse.twi.text}
          </div>

          <div
            lang="en"
            style={{
              fontSize: 28,
              lineHeight: 1.5,
              color: "#6B5D4F",
            }}
          >
            {verse.english.text}
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #E7DECE",
            paddingTop: 24,
            fontSize: 18,
            lineHeight: 1.4,
            color: "#6B5D4F",
          }}
        >
          {verse.twi.copyright && (
            <div style={{ marginBottom: 6 }}>{verse.twi.copyright}</div>
          )}
          {verse.english.copyright && <div>{verse.english.copyright}</div>}
          <div style={{ marginTop: 16, color: "#D9A441", fontWeight: 600 }}>
            dawuro · share the Word
          </div>
        </div>
      </div>
    );
  },
);
