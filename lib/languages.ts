/**
 * Supported languages for Dawuro.
 *
 * Scripture → YouVersion only (never machine-translated).
 * When a language has no YouVersion Bible yet, we still list it (Ghana first)
 * and show a related published Bible with a clear proxy note.
 *
 * Voice → Khaya TTS / ASR where the live API accepts the language code.
 * Verified TTS codes: tw, ee, ki
 * Verified ASR codes: tw, ee, gaa, dag
 * Translate: eng, twi, ewe, gaa, fat, yor, dag, gur, kus, kik, luo, mer, …
 */

export type LocalLanguageId =
  // Ghana — primary
  | "tw"
  | "ak" // Akuapem Twi
  | "ee"
  | "gaa"
  | "fat"
  | "dag"
  | "gur"
  | "kus"
  | "gjn" // Gonja
  | "xsm" // Kasem
  | "sil" // Sisaala
  // West / East Africa + French
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
  | "dag";

export type LanguageRegion = "ghana" | "west-africa" | "east-africa" | "other";

export type LanguageConfig = {
  id: LocalLanguageId;
  label: string;
  name: string;
  nativeName: string;
  region: LanguageRegion;
  /** YouVersion Platform bible_id when this language has its own text */
  bibleId?: number;
  abbreviation?: string;
  title?: string;
  /**
   * If no direct Bible, use this language's Bible for the local side.
   * Card shows a proxy note — never MT Scripture into this language.
   */
  scriptureProxy?: LocalLanguageId;
  htmlLang: string;
  yvpTag?: string;
  /** Khaya TTS language code (verified live: tw, ee, ki) */
  khayaTts?: string;
  /** Khaya ASR language code (verified: tw, ee, gaa, dag) */
  khayaAsr?: string;
  /** Khaya translate target from English, e.g. "kus" → en-kus (reflections only) */
  khayaTranslate?: string;
  feelingPlaceholder: string;
  copyrightFallback: string;
  /** Short note when Scripture is proxied */
  proxyNote?: string;
};

const AKAN_ASANTE = {
  bibleId: 2094,
  abbreviation: "ASNA",
  title: "Asante Twi Nkwa Asɛm",
  copyrightFallback: "Biblica © — Asante Twi Nkwa Asɛm",
} as const;

export const LANGUAGES: Record<LocalLanguageId, LanguageConfig> = {
  // ─── Ghana (voice + Khaya first) ─────────────────────────────────
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
    // Closest spoken model — same Akan family
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
  gaa: {
    id: "gaa",
    label: "Ga",
    name: "Ga",
    nativeName: "Gã",
    region: "ghana",
    // No Ga Bible on YouVersion Platform yet
    scriptureProxy: "tw",
    htmlLang: "gaa",
    khayaAsr: "gaa",
    khayaTranslate: "gaa",
    feelingPlaceholder: "e.g. mi gbaa mi",
    copyrightFallback: "Asante Twi shown — Ga Bible not yet on YouVersion",
    proxyNote:
      "Ga Bible not yet on YouVersion — showing Asante Twi + English. You can speak or type feelings in Ga.",
  },
  fat: {
    id: "fat",
    label: "Fante",
    name: "Fante",
    nativeName: "Mfantse",
    region: "ghana",
    // Akan family — use Asante Twi published text (not MT)
    bibleId: AKAN_ASANTE.bibleId,
    abbreviation: AKAN_ASANTE.abbreviation,
    title: AKAN_ASANTE.title,
    htmlLang: "fat",
    khayaTts: "tw",
    khayaTranslate: "fat",
    feelingPlaceholder: "e.g. me suro",
    copyrightFallback: AKAN_ASANTE.copyrightFallback,
    proxyNote:
      "Showing Asante Twi Scripture (Akan family). Fante is supported for typing via Khaya.",
  },
  dag: {
    id: "dag",
    label: "Dagbani",
    name: "Dagbani",
    nativeName: "Dagbani",
    region: "ghana",
    scriptureProxy: "tw",
    htmlLang: "dag",
    khayaAsr: "dag",
    khayaTranslate: "dag",
    feelingPlaceholder: "e.g. n zɔri",
    copyrightFallback: "Asante Twi shown — Dagbani Bible not yet on YouVersion",
    proxyNote:
      "Dagbani Bible not yet on YouVersion — showing Asante Twi + English. You can speak feelings in Dagbani.",
  },
  gur: {
    id: "gur",
    label: "Gurene",
    name: "Gurene (Ninkare)",
    nativeName: "Gurene",
    region: "ghana",
    bibleId: 1323,
    abbreviation: "NINK",
    title: "New Testament in Ninkare",
    htmlLang: "gur",
    yvpTag: "gur",
    khayaTranslate: "gur",
    feelingPlaceholder: "e.g. m tara dabeem",
    copyrightFallback: "Ninkare New Testament",
  },
  kus: {
    id: "kus",
    label: "Kusaal",
    name: "Kusaal",
    nativeName: "Kʋsaal",
    region: "ghana",
    scriptureProxy: "tw",
    htmlLang: "kus",
    khayaTranslate: "kus",
    feelingPlaceholder: "e.g. m zu'oe dabiem",
    copyrightFallback: "Asante Twi shown — Kusaal Bible not yet on YouVersion",
    proxyNote:
      "Kusaal Bible not yet on YouVersion — showing Asante Twi + English. Type feelings in Kusaal; Khaya can translate reflections.",
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
    scriptureProxy: "sw",
    htmlLang: "luo",
    khayaTranslate: "luo",
    feelingPlaceholder: "e.g. aluor",
    copyrightFallback: "Kiswahili shown — Luo Bible not configured",
    proxyNote:
      "Luo Scripture not configured on YouVersion here — showing Kiswahili + English. Type feelings in Dholuo.",
  },
  mer: {
    id: "mer",
    label: "Kĩmĩĩrũ",
    name: "Kimeru",
    nativeName: "Kĩmĩĩrũ",
    region: "east-africa",
    scriptureProxy: "ki",
    htmlLang: "mer",
    khayaTranslate: "mer",
    feelingPlaceholder: "e.g. ndĩ na guoya",
    copyrightFallback: "Gĩkũyũ shown — Kimeru Bible not configured",
    proxyNote:
      "Kimeru Scripture not configured — showing Gĩkũyũ + English. Type feelings in Kĩmĩĩrũ.",
  },
};

/** Ghana first, then by region — voice-capable sorted slightly higher within Ghana */
export const LANGUAGE_LIST: LanguageConfig[] = [
  // Ghana — voice first
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
  // West Africa
  LANGUAGES.yo,
  LANGUAGES.ha,
  LANGUAGES.ig,
  // East Africa — Kikuyu has TTS
  LANGUAGES.ki,
  LANGUAGES.sw,
  LANGUAGES.luo,
  LANGUAGES.mer,
  // Other
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

/** Mic / type feeling languages — EN + verified Khaya ASR */
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
  {
    id: "gaa",
    label: "Ga",
    khayaAsr: "gaa",
    placeholder: "e.g. mi gbaa mi",
  },
  {
    id: "dag",
    label: "Dagbani",
    khayaAsr: "dag",
    placeholder: "e.g. n zɔri",
  },
];

export function isLocalLanguageId(v: unknown): v is LocalLanguageId {
  return typeof v === "string" && v in LANGUAGES;
}

export function getLanguage(id: string | undefined | null): LanguageConfig {
  if (id && isLocalLanguageId(id)) return LANGUAGES[id];
  return LANGUAGES[DEFAULT_LOCAL_LANGUAGE];
}

/**
 * Resolve which YouVersion Bible to fetch for a language.
 * Follows scriptureProxy once if needed.
 */
export function resolveScriptureLanguage(
  id: string | undefined | null,
): {
  display: LanguageConfig;
  source: LanguageConfig;
  isProxied: boolean;
} {
  const display = getLanguage(id);
  if (display.bibleId) {
    return { display, source: display, isProxied: false };
  }
  if (display.scriptureProxy) {
    const source = getLanguage(display.scriptureProxy);
    return { display, source, isProxied: true };
  }
  // Ultimate fallback
  return {
    display,
    source: LANGUAGES.tw,
    isProxied: true,
  };
}

export function getInputLanguage(
  id: string | undefined | null,
): InputLangOption {
  return INPUT_LANGUAGES.find((l) => l.id === id) || INPUT_LANGUAGES[0];
}

export function hasVoice(lang: LanguageConfig): boolean {
  return Boolean(lang.khayaTts);
}

export function hasAsr(lang: LanguageConfig): boolean {
  return Boolean(lang.khayaAsr);
}

export const STORAGE_KEY_LANGUAGE = "dawuro_language";
export const STORAGE_KEY_INPUT_LANG = "dawuro_input_lang";

export const REGION_LABELS: Record<LanguageRegion, string> = {
  ghana: "Ghana",
  "west-africa": "West Africa",
  "east-africa": "East Africa",
  other: "Other",
};
