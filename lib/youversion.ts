/**
 * YouVersion Platform API — server only.
 * Docs: https://developers.youversion.com/api/bibles
 *
 * Local-language Bibles (mostly Biblica) require accepting the Biblica
 * Fast-track license at platform.youversion.com. English BSB works without it.
 */

import { requireYouVersionEnv } from "@/lib/env";
import { usfmToHuman } from "@/lib/verses";
import type { VerseResult } from "@/lib/types";
import {
  ENGLISH_BIBLE,
  getLanguage,
  type LocalLanguageId,
  type LanguageConfig,
} from "@/lib/languages";

const YVP_BASE = "https://api.youversion.com/v1";

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

async function yvpFetch<T>(path: string, languageHint?: string): Promise<T> {
  const res = await fetch(`${YVP_BASE}${path}`, {
    headers: headers(),
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
      const lang = languageHint ? ` (${languageHint})` : "";
      throw new YouVersionError(
        `Scripture access blocked${lang}. Accept the Biblica Fast-track Bible License at platform.youversion.com (Licenses → Fast-track), then retry. (${detail || "403"})`,
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
  languageHint?: string,
): Promise<PassageResponse> {
  const encoded = encodeURIComponent(usfm);
  return yvpFetch<PassageResponse>(
    `/bibles/${versionId}/passages/${encoded}?format=text`,
    languageHint,
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

const copyrightCache = new Map<number, string>();

async function resolveCopyright(
  versionId: number,
  fallback: string,
): Promise<string> {
  const hit = copyrightCache.get(versionId);
  if (hit) return hit;
  try {
    const meta = await getBibleMeta(versionId);
    const raw = meta.copyright || meta.title || fallback;
    const short = shortCopyright(raw, fallback);
    copyrightCache.set(versionId, short);
    return short;
  } catch {
    return fallback;
  }
}

/**
 * Fetch the same USFM reference in English (BSB) + selected local language.
 * Scripture text is never machine-translated — both come from YouVersion.
 */
export async function getBilingualPassage(
  usfm: string,
  localLanguageId: LocalLanguageId | string = "tw",
): Promise<VerseResult> {
  const lang = getLanguage(localLanguageId);

  const [en, local, enCopyright, localCopyright] = await Promise.all([
    getPassage(ENGLISH_BIBLE.id, usfm, "English"),
    getPassage(lang.bibleId, usfm, lang.name),
    resolveCopyright(ENGLISH_BIBLE.id, ENGLISH_BIBLE.copyrightFallback),
    resolveCopyright(lang.bibleId, lang.copyrightFallback),
  ]);

  const human =
    en.reference || local.reference || usfmToHuman(usfm);

  const localSide = {
    languageId: lang.id,
    label: lang.label,
    versionId: String(lang.bibleId),
    text: cleanPassageText(local.content),
    copyright: localCopyright,
  };

  const englishSide = {
    languageId: "en",
    label: "English",
    versionId: String(ENGLISH_BIBLE.id),
    text: cleanPassageText(en.content),
    copyright: enCopyright,
  };

  return {
    reference: usfm,
    humanReference: human,
    english: englishSide,
    local: localSide,
    localLanguageId: lang.id,
    // Backward-compatible alias while components migrate
    twi: localSide,
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
 * Probe whether a local-language Bible is readable with the current app key.
 */
export async function probeLanguageAccess(
  languageId: LocalLanguageId | string = "tw",
): Promise<{ ok: boolean; message: string; language: LanguageConfig }> {
  const lang = getLanguage(languageId);
  try {
    await getPassage(lang.bibleId, "JHN.3.16", lang.name);
    return {
      ok: true,
      message: `${lang.name} (${lang.abbreviation}) passage access OK`,
      language: lang,
    };
  } catch (e) {
    if (e instanceof YouVersionError && e.status === 403) {
      return {
        ok: false,
        message: `${lang.name} blocked — accept the Biblica Fast-track Bible License at platform.youversion.com.`,
        language: lang,
      };
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, message: msg, language: lang };
  }
}

/** @deprecated Use probeLanguageAccess */
export async function probeTwiAccess(): Promise<{
  ok: boolean;
  message: string;
}> {
  const r = await probeLanguageAccess("tw");
  return { ok: r.ok, message: r.message };
}
