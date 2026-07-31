/**
 * Supported languages for Dawuro.
 *
 * Rules:
 * - When YouVersion has a published Bible → fetch that text (never MT Scripture).
 * - When YouVersion does NOT have it (e.g. Kusaal, Ga, Dagbani) → use Khaya:
 *   translate EN verse → local, plus ASR / TTS when the API supports them.
 * - English (BSB) is always the authoritative YouVersion companion side.
 * - Reflections / feelings may always use Khaya translate.
 */

export type LocalLanguageId =
  // English-first mode — BSB alone, spoken with the browser's voice
  | "en"
  // Ghana — primary
  | "tw"
  | "ak"
  | "ee"
  | "gaa"
  | "fat"
  | "dag"
  | "gur"
  | "kus"
  | "gjn"
  | "xsm"
  | "sil"
  // Wider
  | "yo"
  | "ha"
  | "ig"
  | "sw"
  | "ki"
  | "luo"
  | "mer"
  | "fr";

export type InputLanguageId =
  | "en"
  | "tw"
  | "ee"
  | "gaa"
  | "dag"
  | "fat"
  | "kus"
  | "gur"
  | "yo";

export type LanguageRegion = "ghana" | "west-africa" | "east-africa" | "other";

/** How the local-language side of the card is produced */
export type LocalTextSource = "youversion" | "khaya";

export type LanguageConfig = {
  id: LocalLanguageId;
  label: string;
  name: string;
  nativeName: string;
  region: LanguageRegion;
  /** YouVersion Platform bible_id — if set, local text comes from YouVersion */
  bibleId?: number;
  abbreviation?: string;
  title?: string;
  htmlLang: string;
  yvpTag?: string;
  /**
   * Khaya TTS language code.
   * Verified working: tw, ee, ki. Others may be attempted and degrade gracefully.
   */
  khayaTts?: string;
  /**
   * Khaya ASR language code.
   * Verified on API: tw, ee, gaa, dag. Also wire kus (and others) when product supports them.
   */
  khayaAsr?: string;
  /**
   * Khaya translate code for en-{code} / {code}-en pairs.
   * Used for: (1) local card text when no YouVersion Bible,
   * (2) feeling → English for verse mapping, (3) reflection → local.
   */
  khayaTranslate?: string;
  feelingPlaceholder: string;
  copyrightFallback: string;
  /** Shown when local text is from Khaya (not a published Bible) */
  khayaNote?: string;
};

const AKAN_ASANTE = {
  bibleId: 2094,
  abbreviation: "ASNA",
  title: "Asante Twi Nkwa Asɛm",
  copyrightFallback: "Biblica © — Asante Twi Nkwa Asɛm",
} as const;

export const LANGUAGES: Record<LocalLanguageId, LanguageConfig> = {
  // ─── English-first ───────────────────────────────────────────────
  en: {
    id: "en",
    label: "English",
    name: "English",
    nativeName: "English",
    region: "other",
    bibleId: 3034,
    abbreviation: "BSB",
    title: "Berean Standard Bible",
    htmlLang: "en",
    yvpTag: "en",
    // No Khaya voice needed — the browser's built-in English voice speaks.
    feelingPlaceholder: "e.g. I'm anxious about my exams",
    copyrightFallback: "Berean Standard Bible",
  },
  // ─── Ghana ───────────────────────────────────────────────────────
  tw: {
    id: "tw",
    label: "Twi",
    name: "Asante Twi",
    nativeName: "Asante Twi",
    region: "ghana",
    ...AKAN_ASANTE,
    htmlLang: "ak",
    yvpTag: "ak",
    khayaTts: "tw",
    khayaAsr: "tw",
    khayaTranslate: "tw",
    feelingPlaceholder: "e.g. me yɛ suro",
  },
  ak: {
    id: "ak",
    label: "Akuapem",
    name: "Akuapem Twi",
    nativeName: "Akuapem Twi",
    region: "ghana",
    bibleId: 1631,
    abbreviation: "AKNA",
    title: "Akuapem Twi Nkwa Asɛm",
    htmlLang: "ak",
    yvpTag: "ak",
    khayaTts: "tw",
    khayaAsr: "tw",
    khayaTranslate: "tw",
    feelingPlaceholder: "e.g. me suro",
    copyrightFallback: "Biblica © — Akuapem Twi Nkwa Asɛm",
  },
  ee: {
    id: "ee",
    label: "Ewe",
    name: "Ewe",
    nativeName: "Eʋegbe",
    region: "ghana",
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
  // No YouVersion Bible → full Khaya path
  gaa: {
    id: "gaa",
    label: "Ga",
    name: "Ga",
    nativeName: "Gã",
    region: "ghana",
    htmlLang: "gaa",
    khayaAsr: "gaa",
    khayaTranslate: "gaa",
    // TTS not verified for gaa on this API key
    feelingPlaceholder: "e.g. mi gbaa mi",
    copyrightFallback: "Khaya AI translation — not a published Bible",
    khayaNote:
      "No Ga Bible on YouVersion yet. Local text is a Khaya translation of the English YouVersion verse (for reading & sharing). English is the published Scripture.",
  },
  fat: {
    id: "fat",
    label: "Fante",
    name: "Fante",
    nativeName: "Mfantse",
    region: "ghana",
    // Prefer Khaya Fante text (Khaya has fat); EN from YouVersion
    htmlLang: "fat",
    khayaTts: "tw", // closest voice model when speaking Fante text
    khayaTranslate: "fat",
    feelingPlaceholder: "e.g. me suro",
    copyrightFallback: "Khaya AI translation — not a published Fante Bible",
    khayaNote:
      "Fante local text via Khaya. English is YouVersion (BSB). You can also hear with Twi voice model.",
  },
  dag: {
    id: "dag",
    label: "Dagbani",
    name: "Dagbani",
    nativeName: "Dagbani",
    region: "ghana",
    htmlLang: "dag",
    khayaAsr: "dag",
    khayaTranslate: "dag",
    feelingPlaceholder: "e.g. n zɔri",
    copyrightFallback: "Khaya AI translation — not a published Bible",
    khayaNote:
      "No Dagbani Bible on YouVersion yet. Local text is Khaya translation of the English YouVersion verse. Speak feelings in Dagbani (ASR).",
  },
  kus: {
    id: "kus",
    label: "Kusaal",
    name: "Kusaal",
    nativeName: "Kʋsaal",
    region: "ghana",
    htmlLang: "kus",
    khayaAsr: "kus",
    khayaTranslate: "kus",
    feelingPlaceholder: "e.g. m zu'oe dabiem",
    copyrightFallback: "Khaya AI translation — not a published Bible",
    khayaNote:
      "Kusaal is not on YouVersion. We fetch English from YouVersion, then use Khaya to translate into Kusaal for reading. Speak or type feelings in Kusaal (Khaya ASR + translate). English remains the published Scripture.",
  },
  gur: {
    id: "gur",
    label: "Gurene",
    name: "Gurene (Ninkare)",
    nativeName: "Gurene",
    region: "ghana",
    // YouVersion has Ninkare NT
    bibleId: 1323,
    abbreviation: "NINK",
    title: "New Testament in Ninkare",
    htmlLang: "gur",
    yvpTag: "gur",
    khayaTranslate: "gur",
    feelingPlaceholder: "e.g. m tara dabeem",
    copyrightFallback: "Ninkare New Testament",
  },
  gjn: {
    id: "gjn",
    label: "Gonja",
    name: "Gonja",
    nativeName: "Ngbanyito",
    region: "ghana",
    bibleId: 1729,
    abbreviation: "GJNb",
    title: "Gonja Bible",
    htmlLang: "gjn",
    yvpTag: "gjn",
    feelingPlaceholder: "e.g. n chɛ kushirɛ",
    copyrightFallback: "Gonja Bible",
  },
  xsm: {
    id: "xsm",
    label: "Kasem",
    name: "Kasem",
    nativeName: "Kasem",
    region: "ghana",
    bibleId: 1303,
    abbreviation: "KAS",
    title: "New Testament in Kasem",
    htmlLang: "xsm",
    yvpTag: "xsm",
    feelingPlaceholder: "e.g. n wori",
    copyrightFallback: "Kasem New Testament",
  },
  sil: {
    id: "sil",
    label: "Sisaala",
    name: "Sisaala",
    nativeName: "Sisaala",
    region: "ghana",
    bibleId: 2553,
    abbreviation: "SIS",
    title: "Sisaala Bible",
    htmlLang: "sil",
    yvpTag: "sil",
    feelingPlaceholder: "e.g. n tɩɩ",
    copyrightFallback: "Sisaala Bible",
  },

  // ─── West Africa ─────────────────────────────────────────────────
  yo: {
    id: "yo",
    label: "Yorùbá",
    name: "Yoruba",
    nativeName: "Yorùbá",
    region: "west-africa",
    bibleId: 911,
    abbreviation: "YCB",
    title: "Yoruba Contemporary Bible",
    htmlLang: "yo",
    yvpTag: "yo",
    // ASR accepts "yo" (not "yor"); translate still uses "yor"
    khayaAsr: "yo",
    khayaTranslate: "yor",
    feelingPlaceholder: "e.g. ẹ̀rù ń bà mí",
    copyrightFallback: "Biblica © — Yoruba Contemporary Bible",
  },
  ha: {
    id: "ha",
    label: "Hausa",
    name: "Hausa",
    nativeName: "Hausa",
    region: "west-africa",
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
    region: "west-africa",
    bibleId: 1624,
    abbreviation: "ICB",
    title: "Igbo Contemporary Bible 2020",
    htmlLang: "ig",
    yvpTag: "ig",
    feelingPlaceholder: "e.g. ụjọ na-atụ m",
    copyrightFallback: "Biblica © — Igbo Contemporary Bible",
  },
  fr: {
    id: "fr",
    label: "Français",
    name: "French",
    nativeName: "Français",
    region: "other",
    bibleId: 93,
    abbreviation: "LSG",
    title: "Bible Segond 1910",
    htmlLang: "fr",
    yvpTag: "fr",
    feelingPlaceholder: "ex. je suis anxieux",
    copyrightFallback: "Bible Segond 1910",
  },

  // ─── East Africa ─────────────────────────────────────────────────
  sw: {
    id: "sw",
    label: "Kiswahili",
    name: "Swahili",
    nativeName: "Kiswahili",
    region: "east-africa",
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
    region: "east-africa",
    bibleId: 1622,
    abbreviation: "GKY",
    title: "Holy Bible in Gĩkũyũ",
    htmlLang: "ki",
    yvpTag: "ki",
    khayaTts: "ki",
    khayaTranslate: "kik",
    feelingPlaceholder: "e.g. ndĩ na guoya",
    copyrightFallback: "Biblica © — Holy Bible in Gĩkũyũ",
  },
  luo: {
    id: "luo",
    label: "Dholuo",
    name: "Luo",
    nativeName: "Dholuo",
    region: "east-africa",
    htmlLang: "luo",
    khayaTranslate: "luo",
    feelingPlaceholder: "e.g. aluor",
    copyrightFallback: "Khaya AI translation — not a published Bible",
    khayaNote:
      "Luo local text via Khaya from English YouVersion. English is the published Scripture.",
  },
  mer: {
    id: "mer",
    label: "Kĩmĩĩrũ",
    name: "Kimeru",
    nativeName: "Kĩmĩĩrũ",
    region: "east-africa",
    htmlLang: "mer",
    khayaTranslate: "mer",
    feelingPlaceholder: "e.g. ndĩ na guoya",
    copyrightFallback: "Khaya AI translation — not a published Bible",
    khayaNote:
      "Kimeru local text via Khaya from English YouVersion. English is the published Scripture.",
  },
};

export const LANGUAGE_LIST: LanguageConfig[] = [
  LANGUAGES.en,
  LANGUAGES.tw,
  LANGUAGES.ak,
  LANGUAGES.ee,
  LANGUAGES.gaa,
  LANGUAGES.dag,
  LANGUAGES.fat,
  LANGUAGES.kus,
  LANGUAGES.gur,
  LANGUAGES.gjn,
  LANGUAGES.xsm,
  LANGUAGES.sil,
  LANGUAGES.yo,
  LANGUAGES.ha,
  LANGUAGES.ig,
  LANGUAGES.ki,
  LANGUAGES.sw,
  LANGUAGES.luo,
  LANGUAGES.mer,
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
  /** For type-only languages: Khaya code to translate feeling → English */
  khayaTranslate?: string;
  placeholder: string;
};

/** Feeling input: EN + Khaya ASR languages + type-only Khaya langs */
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
    khayaTranslate: "tw",
    placeholder: "e.g. me yɛ suro",
  },
  {
    id: "ee",
    label: "Ewe",
    khayaAsr: "ee",
    khayaTranslate: "ee",
    placeholder: "e.g. me vɔ̃ na",
  },
  {
    id: "gaa",
    label: "Ga",
    khayaAsr: "gaa",
    khayaTranslate: "gaa",
    placeholder: "e.g. mi gbaa mi",
  },
  {
    id: "dag",
    label: "Dagbani",
    khayaAsr: "dag",
    khayaTranslate: "dag",
    placeholder: "e.g. n zɔri",
  },
  {
    id: "fat",
    label: "Fante",
    khayaTranslate: "fat",
    placeholder: "e.g. me suro",
  },
  {
    id: "kus",
    label: "Kusaal",
    khayaAsr: "kus",
    khayaTranslate: "kus",
    placeholder: "e.g. m zu'oe dabiem",
  },
  {
    id: "gur",
    label: "Gurene",
    khayaTranslate: "gur",
    placeholder: "e.g. m tara dabeem",
  },
  {
    id: "yo",
    label: "Yorùbá",
    khayaAsr: "yo",
    khayaTranslate: "yor",
    placeholder: "e.g. ẹ̀rù ń bà mí",
  },
];

export function isLocalLanguageId(v: unknown): v is LocalLanguageId {
  return typeof v === "string" && v in LANGUAGES;
}

export function getLanguage(id: string | undefined | null): LanguageConfig {
  if (id && isLocalLanguageId(id)) return LANGUAGES[id];
  return LANGUAGES[DEFAULT_LOCAL_LANGUAGE];
}

/** True when local card text should come from Khaya (no YouVersion Bible). */
export function usesKhayaLocalText(lang: LanguageConfig): boolean {
  return !lang.bibleId && Boolean(lang.khayaTranslate);
}

export function getInputLanguage(
  id: string | undefined | null,
): InputLangOption {
  return INPUT_LANGUAGES.find((l) => l.id === id) || INPUT_LANGUAGES[0];
}

export function hasVoice(lang: LanguageConfig): boolean {
  return Boolean(lang.khayaTts);
}

/**
 * Can this language be heard at all? Khaya TTS, or — for English —
 * the browser's built-in speechSynthesis voice (free, offline-capable).
 */
export function hasAnyVoice(lang: LanguageConfig): boolean {
  return hasVoice(lang) || lang.id === "en";
}

/**
 * Languages some server engine (Khaya, Abena, Edge, or Meta MMS via HF)
 * may be able to speak. Client-safe and static: the UI shows a play
 * button and lets /api/speak answer honestly — provider availability is
 * server-side knowledge (keys, quotas, outages).
 */
const SERVER_VOICE_CANDIDATES = new Set([
  "en",
  "tw",
  "ak",
  "fat",
  "ee",
  "ki",
  "ha",
  "yo",
  "sw",
]);

export function mayHaveServerVoice(lang: LanguageConfig): boolean {
  return SERVER_VOICE_CANDIDATES.has(lang.id);
}

export function hasAsr(lang: LanguageConfig): boolean {
  return Boolean(lang.khayaAsr);
}

export function hasKhaya(lang: LanguageConfig): boolean {
  return Boolean(lang.khayaTranslate || lang.khayaAsr || lang.khayaTts);
}

export const STORAGE_KEY_LANGUAGE = "dawuro_language";
export const STORAGE_KEY_INPUT_LANG = "dawuro_input_lang";

export const REGION_LABELS: Record<LanguageRegion, string> = {
  ghana: "Ghana",
  "west-africa": "West Africa",
  "east-africa": "East Africa",
  other: "Other",
};
