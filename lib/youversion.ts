/**
 * YouVersion Platform API — server only.
 *
 * Published Scripture always comes from YouVersion.
 * When a language has no YouVersion Bible (Kusaal, Ga, Dagbani, …),
 * English is fetched from YouVersion and the local side is filled by Khaya.
 */

import { requireYouVersionEnv } from "@/lib/env";
import { usfmToHuman } from "@/lib/verses";
import type { VerseResult } from "@/lib/types";
import {
  ENGLISH_BIBLE,
  getLanguage,
  usesKhayaLocalText,
  type LocalLanguageId,
  type LanguageConfig,
} from "@/lib/languages";
import { translateFromEnglish } from "@/lib/khaya";

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

export async function getBibleMeta(versionId: number): Promise<BibleMeta> {
  return yvpFetch<BibleMeta>(`/bibles/${versionId}`);
}

export function dayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

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
 * English from YouVersion + local side:
 * - published YouVersion Bible when bibleId is set
 * - else Khaya translation of the English verse (Kusaal, Ga, …)
 */
export async function getBilingualPassage(
  usfm: string,
  localLanguageId: LocalLanguageId | string = "tw",
): Promise<VerseResult> {
  const display = getLanguage(localLanguageId);

  const enPassage = await getPassage(
    ENGLISH_BIBLE.id,
    usfm,
    "English",
  );
  const enText = cleanPassageText(enPassage.content);
  const enCopyright = await resolveCopyright(
    ENGLISH_BIBLE.id,
    ENGLISH_BIBLE.copyrightFallback,
  );
  const human = enPassage.reference || usfmToHuman(usfm);

  const englishSide = {
    languageId: "en",
    label: "English",
    versionId: String(ENGLISH_BIBLE.id),
    text: enText,
    copyright: enCopyright,
    source: "youversion" as const,
  };

  // Path A: published Bible on YouVersion
  if (display.bibleId) {
    const localPassage = await getPassage(
      display.bibleId,
      usfm,
      display.name,
    );
    const localCopyright = await resolveCopyright(
      display.bibleId,
      display.copyrightFallback,
    );
    const localSide = {
      languageId: display.id,
      label: display.label,
      versionId: String(display.bibleId),
      text: cleanPassageText(localPassage.content),
      copyright: localCopyright,
      source: "youversion" as const,
    };
    return {
      reference: usfm,
      humanReference: human || localPassage.reference || usfmToHuman(usfm),
      english: englishSide,
      local: localSide,
      localLanguageId: display.id,
      localFromKhaya: false,
      twi: localSide,
    };
  }

  // Path B: no YouVersion Bible → Khaya translates English verse into local language
  if (!display.khayaTranslate) {
    throw new YouVersionError(
      `No YouVersion Bible and no Khaya translate code for ${display.name}.`,
      400,
      "NO_LOCAL_SOURCE",
    );
  }

  let localText: string;
  try {
    localText = cleanPassageText(
      await translateFromEnglish(enText, display.khayaTranslate),
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Khaya translate failed";
    throw new YouVersionError(
      `Could not render ${display.name} via Khaya: ${msg}`,
      502,
      "KHAYA_TRANSLATE_FAILED",
    );
  }

  if (!localText) {
    throw new YouVersionError(
      `Khaya returned empty ${display.name} text.`,
      502,
      "KHAYA_EMPTY",
    );
  }

  const localSide = {
    languageId: display.id,
    label: `${display.label} · Khaya`,
    versionId: `khaya:${display.khayaTranslate}`,
    text: localText,
    copyright: display.copyrightFallback,
    source: "khaya" as const,
  };

  return {
    reference: usfm,
    humanReference: human,
    english: englishSide,
    local: localSide,
    localLanguageId: display.id,
    localFromKhaya: true,
    proxyNote:
      display.khayaNote ||
      `${display.name} is not on YouVersion. Local text is Khaya translation of the English verse. English (BSB) is the published Scripture.`,
    twi: localSide,
  };
}

function cleanPassageText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function shortCopyright(
  full: string | undefined,
  fallback: string,
): string {
  if (!full) return fallback;
  const first = full.split("\n").map((s) => s.trim()).find(Boolean);
  if (!first) return fallback;
  return first.length > 120 ? `${first.slice(0, 117)}…` : first;
}

export async function probeLanguageAccess(
  languageId: LocalLanguageId | string = "tw",
): Promise<{ ok: boolean; message: string; language: LanguageConfig }> {
  const display = getLanguage(languageId);

  if (usesKhayaLocalText(display)) {
    // Khaya-only languages: probe English YouVersion + a short translate
    try {
      await getPassage(ENGLISH_BIBLE.id, "JHN.3.16", "English");
      if (display.khayaTranslate) {
        await translateFromEnglish("God is love.", display.khayaTranslate);
      }
      return {
        ok: true,
        message: `${display.name}: YouVersion EN + Khaya local OK`,
        language: display,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return { ok: false, message: msg, language: display };
    }
  }

  if (!display.bibleId) {
    return {
      ok: false,
      message: `No Bible ID for ${display.name}`,
      language: display,
    };
  }

  try {
    await getPassage(display.bibleId, "JHN.3.16", display.name);
    return {
      ok: true,
      message: `${display.name} (${display.abbreviation}) passage access OK`,
      language: display,
    };
  } catch (e) {
    if (e instanceof YouVersionError && e.status === 403) {
      return {
        ok: false,
        message: `${display.name} blocked — accept the Biblica Fast-track Bible License at platform.youversion.com.`,
        language: display,
      };
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, message: msg, language: display };
  }
}

export async function probeTwiAccess(): Promise<{
  ok: boolean;
  message: string;
}> {
  const r = await probeLanguageAccess("tw");
  return { ok: r.ok, message: r.message };
}
