/** Shared types for Dawuro — used by API routes and UI components. */

import type { LocalLanguageId, LocalTextSource } from "@/lib/languages";

export type Tradition = "evangelical" | "catholic" | "mainline";

/** One side of a bilingual verse (English or local-language text). */
export type PassageSide = {
  languageId: string;
  label: string;
  versionId: string;
  text: string;
  copyright?: string;
  audioUrl?: string;
  /** youversion = published Bible; khaya = translated from EN via Khaya */
  source?: LocalTextSource;
};

export type VerseResult = {
  reference: string;
  humanReference: string;
  english: PassageSide;
  /** Local language side — YouVersion Bible OR Khaya render of English */
  local: PassageSide;
  localLanguageId: LocalLanguageId;
  /** True when local text is Khaya (no published Bible on YouVersion) */
  localFromKhaya?: boolean;
  proxyNote?: string;
  /** @deprecated Use `local` */
  twi?: PassageSide;
};

export type Reflection = {
  english: string;
  local?: string;
  tradition?: Tradition;
};

export type ShareCard = {
  verse: VerseResult;
  reflection?: Reflection;
  imageDataUrl: string;
  audioUrl: string;
};

export type InputLanguage = "en" | "tw" | "ee" | "gaa" | "dag";
