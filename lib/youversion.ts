/**
 * YouVersion Platform API — server only.
 * Docs: https://developers.youversion.com/api/bibles
 *
 * Twi Bibles (ASNA/AKNA) require accepting the Biblica Fast-track license
 * at platform.youversion.com. English BSB works without it.
 */

import { requireYouVersionEnv } from "@/lib/env";
import { usfmToHuman } from "@/lib/verses";
import type { VerseResult } from "@/lib/types";

const YVP_BASE = "https://api.youversion.com/v1";

/** Confirmed Platform IDs (verified against live /v1/bibles). */
export const BIBLE_VERSIONS = {
  /** Berean Standard Bible — public domain; available without Biblica license. */
  english: {
    id: 3034,
    abbreviation: "BSB",
    title: "Berean Standard Bible",
  },
  /** Asante Twi Nkwa Asɛm — Biblica; needs Fast-track license agreement. */
  twi: {
    id: 2094,
    abbreviation: "ASNA",
    title: "Asante Twi Nkwa Asɛm",
    languageTag: "ak",
  },
  /** Akuapem Twi alternate. */
  twiAlt: {
    id: 1631,
    abbreviation: "AKNA",
    title: "Akuapem Twi Nkwa Asɛm",
  },
} as const;

export class YouVersionError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "YouVersionError";
    this.status = status;
    this.code = code;
  }
}

type PassageResponse = {
  id: string;
  content: string;
  reference: string;
};

type BibleMeta = {
  id: number;
  abbreviation: string;
  title: string;
  copyright?: string | null;
  language_tag?: string;
  localized_title?: string;
};

type VotdResponse = {
  day: number;
  passage_id: string;
};

function headers(): HeadersInit {
  const { YVP_APP_KEY } = requireYouVersionEnv();
  return { "X-YVP-App-Key": YVP_APP_KEY };
}

async function yvpFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${YVP_BASE}${path}`, {
    headers: headers(),
    // Passages are stable; allow short CDN-ish caching on the platform side.
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { message?: string };
      detail = body.message || "";
    } catch {
      /* ignore */
    }

    if (res.status === 403) {
      throw new YouVersionError(
        `Twi Scripture is blocked for this app key. Accept the Biblica Fast-track Bible License at platform.youversion.com (Licenses → Fast-track), then retry. (${detail || "403"})`,
        403,
        "LICENSE_REQUIRED",
      );
    }

    throw new YouVersionError(
      detail || `YouVersion request failed (${res.status}) for ${path}`,
      res.status,
    );
  }

  return res.json() as Promise<T>;
}

/** Fetch a single passage as plain text. */
export async function getPassage(
  versionId: number,
  usfm: string,
): Promise<PassageResponse> {
  const encoded = encodeURIComponent(usfm);
  return yvpFetch<PassageResponse>(
    `/bibles/${versionId}/passages/${encoded}?format=text`,
  );
}

/** Bible metadata including copyright for attribution. */
export async function getBibleMeta(versionId: number): Promise<BibleMeta> {
  return yvpFetch<BibleMeta>(`/bibles/${versionId}`);
}

/** Day-of-year for VOTD (1–365/366). */
export function dayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/** Verse of the Day USFM reference from YouVersion. */
export async function getVerseOfTheDayReference(
  day?: number,
): Promise<string> {
  const d = day ?? dayOfYear();
  const data = await yvpFetch<VotdResponse>(`/verse_of_the_days/${d}`);
  return data.passage_id;
}

let copyrightCache: { en?: string; twi?: string } = {};

async function getCopyrights(): Promise<{ en?: string; twi?: string }> {
  if (copyrightCache.en && copyrightCache.twi) return copyrightCache;
  try {
    const [en, twi] = await Promise.all([
      getBibleMeta(BIBLE_VERSIONS.english.id),
      getBibleMeta(BIBLE_VERSIONS.twi.id),
    ]);
    copyrightCache = {
      en: en.copyright || BIBLE_VERSIONS.english.title,
      twi: twi.copyright || "Biblica © — Asante Twi Nkwa Asɛm",
    };
  } catch {
    copyrightCache = {
      en: copyrightCache.en || BIBLE_VERSIONS.english.title,
      twi: copyrightCache.twi || "Biblica © — Asante Twi Nkwa Asɛm",
    };
  }
  return copyrightCache;
}

/**
 * Fetch the same USFM reference in English (BSB) and Twi (ASNA).
 * Scripture text is never machine-translated — both come from YouVersion.
 */
export async function getBilingualPassage(
  usfm: string,
): Promise<VerseResult> {
  const [en, twi, copyrights] = await Promise.all([
    getPassage(BIBLE_VERSIONS.english.id, usfm),
    getPassage(BIBLE_VERSIONS.twi.id, usfm),
    getCopyrights(),
  ]);

  const human =
    en.reference || twi.reference || usfmToHuman(usfm);

  return {
    reference: usfm,
    humanReference: human,
    english: {
      versionId: String(BIBLE_VERSIONS.english.id),
      text: cleanPassageText(en.content),
      copyright: shortCopyright(copyrights.en, "BSB"),
    },
    twi: {
      versionId: String(BIBLE_VERSIONS.twi.id),
      text: cleanPassageText(twi.content),
      copyright: shortCopyright(copyrights.twi, "Biblica © ASNA"),
    },
  };
}

/** Strip excessive whitespace; keep readable paragraphs. */
function cleanPassageText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** First line or short tag for UI footers. */
function shortCopyright(
  full: string | undefined,
  fallback: string,
): string {
  if (!full) return fallback;
  const first = full.split("\n").map((s) => s.trim()).find(Boolean);
  if (!first) return fallback;
  return first.length > 120 ? `${first.slice(0, 117)}…` : first;
}

/**
 * Probe whether Twi passage text is readable with the current app key.
 * Used by /api/health so the human knows to accept the Biblica license.
 */
export async function probeTwiAccess(): Promise<{
  ok: boolean;
  message: string;
}> {
  try {
    await getPassage(BIBLE_VERSIONS.twi.id, "JHN.3.16");
    return { ok: true, message: "Twi (ASNA) passage access OK" };
  } catch (e) {
    if (e instanceof YouVersionError && e.status === 403) {
      return {
        ok: false,
        message:
          "Twi (ASNA) blocked — accept the Biblica Fast-track Bible License at platform.youversion.com (Licenses / Fast-track).",
      };
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, message: msg };
  }
}
