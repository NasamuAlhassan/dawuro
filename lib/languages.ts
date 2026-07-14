/**
 * Supported Scripture languages for Dawuro.
 * English is always the companion side; the user picks a "local" language.
 *
 * Scripture text: YouVersion only (never machine-translated).
 * Voice: Khaya TTS/ASR where available; otherwise text-only graceful degrade.
 */

export type LocalLanguageId =
  | "tw"
  | "ee"
  | "yo"
  | "ha"
  | "ig"
  | "sw"
  | "ki"
  | "fr";

/** Languages the user can speak/type feelings in (mic routing). */
export type InputLanguageId = "en" | "tw" | "ee";

export type LanguageConfig = {
  id: LocalLanguageId;
  /** Short chip label */
  label: string;
  /** Longer display name */
  name: string;
  /** Native / local name for UI warmth */
  nativeName: string;
  /** YouVersion Platform bible_id (verified live) */
  bibleId: number;
  abbreviation: string;
  title: string;
  /** HTML lang attribute */
  htmlLang: string;
  /** YouVersion language_tag used in discovery */
  yvpTag: string;
  /** Khaya TTS `language` code — if set, /api/speak works */
  khayaTts?: string;
  /** Khaya ASR `language` code — if set, mic path uses Khaya */
  khayaAsr?: string;
  /** Khaya translate pair from English, e.g. "tw" → lang "en-tw". Reflection only. */
  khayaTranslate?: string;
  /** Placeholder when typing feelings (often in this language) */
  feelingPlaceholder: string;
  /** Fallback short copyright if API meta fails */
  copyrightFallback: string;
};

/**
 * Curated set: Ghana + West/East Africa + French.
 * Most Biblica versions need Fast-track license on the app key.
 */
export const LANGUAGES: Record<LocalLanguageId, LanguageConfig> = {
  tw: {
    id: "tw",
    label: "Twi",
    name: "Asante Twi",
    nativeName: "Asante Twi",
    bibleId: 2094,
    abbreviation: "ASNA",
    title: "Asante Twi Nkwa Asɛm",
    htmlLang: "ak",
    yvpTag: "ak",
    khayaTts: "tw",
    khayaAsr: "tw",
    khayaTranslate: "tw",
    feelingPlaceholder: "e.g. me yɛ suro",
    copyrightFallback: "Biblica © — Asante Twi Nkwa Asɛm",
  },
  ee: {
    id: "ee",
    label: "Ewe",
    name: "Ewe",
    nativeName: "Eʋegbe",
    bibleId: 1613,
    abbreviation: "ECS",
    title: "Ewe Contemporary Scriptures 2020",
    htmlLang: "ee",
    yvpTag: "ee",
    khayaTts: "ee",
    khayaAsr: "ee",
    khayaTranslate: "ee",
    feelingPlaceholder: "e.g. me vɔ̃ na",
    copyrightFallback: "Biblica © — Ewe Contemporary Scriptures",
  },
  yo: {
    id: "yo",
    label: "Yorùbá",
    name: "Yoruba",
    nativeName: "Yorùbá",
    bibleId: 911,
    abbreviation: "YCB",
    title: "Yoruba Contemporary Bible",
    htmlLang: "yo",
    yvpTag: "yo",
    khayaTranslate: "yor",
    feelingPlaceholder: "e.g. ẹ̀rù ń bà mí",
    copyrightFallback: "Biblica © — Yoruba Contemporary Bible",
  },
  ha: {
    id: "ha",
    label: "Hausa",
    name: "Hausa",
    nativeName: "Hausa",
    bibleId: 1614,
    abbreviation: "HCB",
    title: "Hausa Contemporary Bible 2020",
    htmlLang: "ha",
    yvpTag: "ha",
    feelingPlaceholder: "e.g. ina da damuwa",
    copyrightFallback: "Biblica © — Hausa Contemporary Bible",
  },
  ig: {
    id: "ig",
    label: "Igbo",
    name: "Igbo",
    nativeName: "Igbo",
    bibleId: 1624,
    abbreviation: "ICB",
    title: "Igbo Contemporary Bible 2020",
    htmlLang: "ig",
    yvpTag: "ig",
    feelingPlaceholder: "e.g. ụjọ na-atụ m",
    copyrightFallback: "Biblica © — Igbo Contemporary Bible",
  },
  sw: {
    id: "sw",
    label: "Kiswahili",
    name: "Swahili",
    nativeName: "Kiswahili",
    bibleId: 1627,
    abbreviation: "NEN",
    title: "Kiswahili Contemporary Version (Neno)",
    htmlLang: "sw",
    yvpTag: "sw",
    feelingPlaceholder: "e.g. nina wasiwasi",
    copyrightFallback: "Biblica © — Kiswahili Neno",
  },
  ki: {
    id: "ki",
    label: "Gĩkũyũ",
    name: "Kikuyu",
    nativeName: "Gĩkũyũ",
    bibleId: 1622,
    abbreviation: "GKY",
    title: "Holy Bible in Gĩkũyũ",
    htmlLang: "ki",
    yvpTag: "ki",
    khayaTts: "ki",
    feelingPlaceholder: "e.g. ndĩ na guoya",
    copyrightFallback: "Biblica © — Holy Bible in Gĩkũyũ",
  },
  fr: {
    id: "fr",
    label: "Français",
    name: "French",
    nativeName: "Français",
    // Segond 1910 is widely available; BDS also Biblica if licensed
    bibleId: 93,
    abbreviation: "LSG",
    title: "Bible Segond 1910",
    htmlLang: "fr",
    yvpTag: "fr",
    feelingPlaceholder: "ex. je suis anxieux",
    copyrightFallback: "Bible Segond 1910",
  },
};

/** Display order in language picker */
export const LANGUAGE_LIST: LanguageConfig[] = [
  LANGUAGES.tw,
  LANGUAGES.ee,
  LANGUAGES.yo,
  LANGUAGES.ha,
  LANGUAGES.ig,
  LANGUAGES.sw,
  LANGUAGES.ki,
  LANGUAGES.fr,
];

export const DEFAULT_LOCAL_LANGUAGE: LocalLanguageId = "tw";

export const ENGLISH_BIBLE = {
  id: 3034,
  abbreviation: "BSB",
  title: "Berean Standard Bible",
  copyrightFallback: "Berean Standard Bible",
} as const;

export type InputLangOption = {
  id: InputLanguageId;
  label: string;
  webSpeech?: string;
  khayaAsr?: string;
  placeholder: string;
};

export const INPUT_LANGUAGES: InputLangOption[] = [
  {
    id: "en",
    label: "EN",
    webSpeech: "en-US",
    placeholder: "e.g. I'm anxious about my exams",
  },
  {
    id: "tw",
    label: "Twi",
    khayaAsr: "tw",
    placeholder: "e.g. me yɛ suro",
  },
  {
    id: "ee",
    label: "Ewe",
    khayaAsr: "ee",
    placeholder: "e.g. me vɔ̃ na",
  },
];

export function isLocalLanguageId(v: unknown): v is LocalLanguageId {
  return typeof v === "string" && v in LANGUAGES;
}

export function getLanguage(id: string | undefined | null): LanguageConfig {
  if (id && isLocalLanguageId(id)) return LANGUAGES[id];
  return LANGUAGES[DEFAULT_LOCAL_LANGUAGE];
}

export function getInputLanguage(
  id: string | undefined | null,
): InputLangOption {
  return INPUT_LANGUAGES.find((l) => l.id === id) || INPUT_LANGUAGES[0];
}

export const STORAGE_KEY_LANGUAGE = "dawuro_language";
export const STORAGE_KEY_INPUT_LANG = "dawuro_input_lang";
