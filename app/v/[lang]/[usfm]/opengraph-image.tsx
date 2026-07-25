import { ImageResponse } from "next/og";
import { getBilingualPassage, getEnglishSide } from "@/lib/youversion";
import {
  getLanguage,
  hasVoice,
  isLocalLanguageId,
  usesKhayaLocalText,
} from "@/lib/languages";
import { usfmToHuman } from "@/lib/verses";
import type { VerseResult } from "@/lib/types";

/**
 * Dynamic WhatsApp/OG preview for a shared verse link.
 * The link itself becomes a verse card in the chat — Scripture visible
 * before the receiver even taps.
 *
 * Crawler-facing, so it is hardened: no Khaya calls ever (English fast path
 * for no-Bible languages), fonts subset once per instance from a stable
 * alphabet (not per-verse), short timeouts, CDN-cacheable output, and no
 * attacker-controlled text echoed on invalid input.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A Bible verse, shared with you";

const USFM_RE = /^[0-9A-Z]{2,4}\.\d{1,3}(?:\.\d{1,3}(?:-\d{1,3})?)?$/i;

function clamp(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Fixed glyph set covering every UI string plus the orthographies we render:
 * Akan/Ewe/Ga/Dagbani/Kusaal (ɛ ɔ ŋ ɖ ƒ ɣ ʋ …), Yorùbá (ẹ ọ ṣ + tone marks),
 * Gĩkũyũ (ĩ ũ), Hausa/Fulfulde hooked letters, French accents. A stable
 * subset means the Google Fonts URLs never vary → one fetch per family per
 * warm instance, cacheable across every verse.
 */
const SUBSET_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" +
  " .,;:!?'\"‘’“”()[]·—–-…™©®&/+" +
  "ɛɔƐƆŋŊɖƉɗƊƒƑɣƔʋƲƙƘɓƁƴƳ" +
  "àáâäãèéêëìíîïòóôöõùúûüçñýÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜÇÑ" +
  "ẹọṣẸỌṢĩũĨŨḿǹẫỵ̃̀́̃";

async function fetchGoogleFont(family: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(
      SUBSET_ALPHABET,
    )}`;
    const css = await (
      await fetch(url, {
        signal: AbortSignal.timeout(5_000),
        cache: "force-cache",
      })
    ).text();
    const resource = css.match(
      /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/,
    );
    if (!resource) return null;
    const res = await fetch(resource[1], {
      signal: AbortSignal.timeout(5_000),
      cache: "force-cache",
    });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

/** One in-flight/settled promise per family per warm instance. */
const fontCache = new Map<string, Promise<ArrayBuffer | null>>();

function loadFont(family: string): Promise<ArrayBuffer | null> {
  let pending = fontCache.get(family);
  if (!pending) {
    pending = fetchGoogleFont(family);
    fontCache.set(family, pending);
  }
  return pending;
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; usfm: string }>;
}) {
  const { lang, usfm } = await params;

  let decoded = "";
  try {
    decoded = decodeURIComponent(usfm).trim().toUpperCase();
  } catch {
    decoded = "";
  }
  const validLang = isLocalLanguageId(lang);
  const language = getLanguage(validLang ? lang : undefined);
  const validUsfm = USFM_RE.test(decoded);
  const khayaLocal = usesKhayaLocalText(language);

  // Crawler-facing route: never call Khaya here. Languages without a
  // published Bible preview with the published English verse; the local
  // rendering waits for a human on the page itself.
  let verse: VerseResult | null = null;
  let englishOnly: { text: string; copyright?: string; human: string } | null =
    null;
  if (validLang && validUsfm) {
    try {
      if (khayaLocal) {
        const en = await getEnglishSide(decoded);
        englishOnly = {
          text: en.side.text,
          copyright: en.side.copyright,
          human: en.humanReference,
        };
      } else {
        verse = await getBilingualPassage(decoded, language.id);
      }
    } catch {
      /* fall through to brand card */
    }
  }

  const loaded = Boolean(verse || englishOnly);
  // Never echo unvalidated path text back into the image.
  const reference = verse
    ? clamp(verse.humanReference, 60)
    : englishOnly
      ? clamp(englishOnly.human, 60)
      : "A verse for you";
  const localText = verse
    ? clamp(verse.local.text, 145)
    : englishOnly
      ? clamp(englishOnly.text, 145)
      : "Scripture in your language and English — sent by someone who cares.";
  const englishText = verse ? clamp(verse.english.text, 105) : "";
  const attribution = verse
    ? clamp(
        [verse.local.copyright, verse.english.copyright]
          .filter(Boolean)
          .join(" · "),
        80,
      )
    : englishOnly
      ? clamp(englishOnly.copyright || "", 60)
      : "";
  const langLine = !loaded
    ? "Dawuro"
    : khayaLocal
      ? `English · ${language.nativeName} inside`
      : `${language.nativeName} · English`;
  const wordmark = "DAWURO";
  const hint = !loaded
    ? "Tap to open"
    : khayaLocal
      ? `Tap to read it in ${language.label}`
      : hasVoice(language)
        ? "Tap to hear it aloud"
        : "Tap to read + reply with yours";

  const [regular, bold] = await Promise.all([
    loadFont("Noto+Sans:wght@400"),
    loadFont("Noto+Sans:wght@700"),
  ]);

  const fonts: NonNullable<
    ConstructorParameters<typeof ImageResponse>[1]
  >["fonts"] = [];
  if (regular) {
    fonts.push({ name: "Noto Sans", data: regular, weight: 400, style: "normal" });
  }
  if (bold) {
    fonts.push({ name: "Noto Sans", data: bold, weight: 700, style: "normal" });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 64px",
          background: "#FAF6F0",
          color: "#1F1A14",
          fontFamily: fonts.length ? "Noto Sans" : "sans-serif",
          borderTop: "10px solid #9E3414",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 3,
              color: "#9E3414",
            }}
          >
            {wordmark}
          </div>
          <div style={{ fontSize: 24, color: "#6A5E52" }}>{langLine}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            flexGrow: 1,
            justifyContent: "center",
            paddingTop: 18,
            paddingBottom: 18,
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700, color: "#9E3414" }}>
            {reference}
          </div>
          <div
            style={{
              fontSize: localText.length > 110 ? 36 : 44,
              lineHeight: 1.35,
              fontWeight: 700,
              color: "#1F1A14",
            }}
          >
            {localText}
          </div>
          {englishText ? (
            <div
              style={{
                fontSize: 24,
                lineHeight: 1.4,
                color: "#4A4036",
                borderTop: "1px solid #DDD0BE",
                paddingTop: 16,
              }}
            >
              {englishText}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #DDD0BE",
            paddingTop: 20,
          }}
        >
          <div style={{ fontSize: 18, color: "#6A5E52" }}>{attribution}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#9E3414" }}>
            {hint}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length ? fonts : undefined,
      // Verse text for a fixed USFM + version is stable — let the CDN keep
      // previews for a day so crawler re-fetches never re-do the work.
      headers: {
        "Cache-Control":
          "public, no-transform, max-age=86400, s-maxage=86400",
      },
    },
  );
}
