/** Shared types for Dawuro — used by API routes and UI components. */

import type { LocalLanguageId } from "@/lib/languages";

export type Tradition = "evangelical" | "catholic" | "mainline";

/** One side of a bilingual verse (English or local-language Scripture). */
export type PassageSide = {
  languageId: string;
  label: string;
  versionId: string;
  text: string;
  copyright?: string;
  audioUrl?: string;
};

export type VerseResult = {
  reference: string; // canonical USFM, e.g. "PHP.4.6-7"
  humanReference: string; // display, e.g. "Philippians 4:6-7"
  english: PassageSide;
  /** Selected local-language Scripture (Twi, Ewe, Yoruba, …) — never MT'd */
  local: PassageSide;
  localLanguageId: LocalLanguageId;
  /** When true, local text is a related published Bible (e.g. Twi for Kusaal) */
  scriptureProxied?: boolean;
  proxyNote?: string;
  /**
   * @deprecated Use `local` — kept briefly for any residual callers.
   * Prefer local always.
   */
  twi?: PassageSide;
};

export type Reflection = {
  english: string; // 2–3 sentences from Gloo
  local?: string; // optional, via Khaya (reflection only — never Scripture)
  tradition?: Tradition;
};

export type ShareCard = {
  verse: VerseResult;
  reflection?: Reflection;
  imageDataUrl: string;
  audioUrl: string;
};

/** @deprecated Prefer InputLanguageId from lib/languages */
export type InputLanguage = "en" | "tw" | "ee";
