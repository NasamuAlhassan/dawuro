import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBilingualPassage,
  getEnglishSide,
  YouVersionError,
} from "@/lib/youversion";
import {
  getLanguage,
  hasAnyVoice,
  isLocalLanguageId,
  usesKhayaLocalText,
  type LanguageConfig,
} from "@/lib/languages";
import { usfmToHuman } from "@/lib/verses";
import type { PassageSide, VerseResult } from "@/lib/types";
import { ReceiveClient } from "@/components/ReceiveClient";

/**
 * The receive page — where the WhatsApp loop closes.
 *
 * A shared verse carries a link like /v/tw/PHP.4.6-7. The receiver opens it
 * in any browser: the verse is server-rendered in their language + English,
 * playable aloud, and followed by an invitation to reply with a verse of
 * their own. WhatsApp link previews are fed by generateMetadata below and
 * the sibling opengraph-image.tsx.
 *
 * Languages without a published Bible (Kusaal, Ga, …) need a slow Khaya
 * render for the local side, so those pages serve the published English
 * verse instantly and let the client fill in the local text — crawlers and
 * first paint never wait on (or spend) Khaya.
 */

// USFM like PHP.4.6-7, PSA.23.1-3, JHN.3.16, PSA.23 — book.chapter[.verse[-verse]]
const USFM_RE = /^[0-9A-Z]{2,4}\.\d{1,3}(?:\.\d{1,3}(?:-\d{1,3})?)?$/i;

type RouteParams = Promise<{ lang: string; usfm: string }>;

function parseRoute(
  lang: string,
  usfm: string,
): { usfm: string; language: LanguageConfig } | null {
  // Params can arrive with stray percent-encoding from mangled copies of
  // the link; a malformed sequence must read as a bad link, not a crash.
  let decoded: string;
  try {
    decoded = decodeURIComponent(usfm).trim().toUpperCase();
  } catch {
    return null;
  }
  if (!USFM_RE.test(decoded)) return null;
  // Links are only ever generated with known language ids — anything else
  // is a corrupted link. Never silently fall back to a different language.
  if (!isLocalLanguageId(lang)) return null;
  return { usfm: decoded, language: getLanguage(lang) };
}

function snippet(text: string, max = 140): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { lang, usfm } = await params;
  const route = parseRoute(lang, usfm);
  if (!route) {
    return { title: "Dawuro — a verse for you" };
  }

  const { language } = route;
  const englishOnly = language.id === "en";
  const human = usfmToHuman(route.usfm);
  const fallback: Metadata = {
    title: englishOnly
      ? `${human} · English (BSB) · Dawuro`
      : `${human} in ${language.label} + English · Dawuro`,
    description: hasAnyVoice(language)
      ? "Someone sent you Scripture. Open it, hear it aloud, and reply with a verse of your own — no app needed."
      : `Someone sent you Scripture. Open it, read it in ${language.label} and English, and reply with a verse of your own — no app needed.`,
  };

  try {
    let title: string;
    let description: string;

    if (usesKhayaLocalText(language)) {
      // Fast path: published English only — never block a crawler on Khaya.
      const en = await getEnglishSide(route.usfm);
      title = `${en.humanReference} — sent to you in ${language.label} · Dawuro`;
      description = `${snippet(en.side.text, 150)} — with a ${language.nativeName} rendering to read.`;
    } else if (englishOnly) {
      const verse = await getBilingualPassage(route.usfm, language.id);
      title = `${verse.humanReference} · English (BSB) · Dawuro`;
      description = snippet(verse.english.text, 180);
    } else {
      const verse = await getBilingualPassage(route.usfm, language.id);
      title = `${verse.humanReference} in ${language.label} + English · Dawuro`;
      description = `${snippet(verse.local.text, 120)} — ${snippet(
        verse.english.text,
        90,
      )}`;
    }

    return {
      title,
      description,
      openGraph: { title, description, type: "article" },
    };
  } catch {
    return fallback;
  }
}

export default async function ReceivePage({
  params,
}: {
  params: RouteParams;
}) {
  const { lang, usfm } = await params;
  const route = parseRoute(lang, usfm);

  if (!route) {
    // Corrupted or hand-typed link — a real 404, so crawlers drop it too.
    notFound();
  }

  const { language } = route;
  const khayaLocal = usesKhayaLocalText(language);

  let verse: VerseResult | null = null;
  let english: PassageSide;
  let humanReference: string;

  try {
    if (khayaLocal) {
      const en = await getEnglishSide(route.usfm);
      english = en.side;
      humanReference = en.humanReference;
    } else {
      verse = await getBilingualPassage(route.usfm, language.id);
      english = verse.english;
      humanReference = verse.humanReference;
    }
  } catch (e) {
    // A reference YouVersion doesn't recognise is a dead link (404).
    // Anything else gets receiver-appropriate copy — never the raw
    // operator-facing error message.
    if (
      e instanceof YouVersionError &&
      (e.status === 404 || e.status === 400)
    ) {
      notFound();
    }
    console.error("[/v receive]", e);
    return (
      <BrokenLink message="We couldn't open this verse right now. Please try again in a moment — or find a verse of your own below." />
    );
  }

  const listenLine =
    language.id === "en"
      ? "A verse in English. Tap play to hear it — then send one back."
      : khayaLocal
        ? `The published English verse, with a ${language.nativeName} rendering to read — then send one back.`
        : hasAnyVoice(language)
          ? `A verse in ${language.nativeName} and English. Tap play to hear it in ${language.label} — then send one back.`
          : `A verse in ${language.nativeName} and English. Read it — then send one back.`;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-brand">
          Sent to you
        </p>
        <h1
          className="text-[1.65rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {humanReference}
        </h1>
        <p className="max-w-[38ch] text-[14px] leading-relaxed text-ink-soft">
          {listenLine}
        </p>
      </header>

      <ReceiveClient
        languageId={language.id}
        usfm={route.usfm}
        initialVerse={verse}
        english={english}
        humanReference={humanReference}
      />
    </div>
  );
}

function BrokenLink({ message }: { message: string }) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-brand">
          Sent to you
        </p>
        <h1
          className="text-[1.65rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          A verse for you
        </h1>
      </header>
      <section className="dawuro-panel px-4 py-4">
        <p className="text-[13px] leading-relaxed text-ink-soft">{message}</p>
      </section>
      <Link
        href="/"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-sm)] bg-brand text-[14px] font-semibold text-white transition hover:bg-brand-deep"
      >
        Find a verse for how you feel
      </Link>
    </div>
  );
}
