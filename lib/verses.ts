/**
 * Curated feeling → USFM references map.
 * The reliable backbone for verse selection (see 03_API_YOUVERSION.md).
 * Gloo-assisted mapping can augment this later — never invent verse text.
 */

export type TopicId =
  | "anxiety"
  | "fear"
  | "grief"
  | "forgiveness"
  | "hope"
  | "thanks"
  | "strength"
  | "peace"
  | "love"
  | "guidance"
  | "trust"
  | "default";

export type TopicEntry = {
  id: TopicId;
  label: string;
  /** Keywords / phrases (English + common Twi) that map to this topic. */
  keywords: string[];
  /** USFM refs, ordered by preference. */
  references: string[];
};

export const TOPIC_MAP: TopicEntry[] = [
  {
    id: "anxiety",
    label: "Anxiety",
    keywords: [
      "anxious",
      "anxiety",
      "worry",
      "worried",
      "stress",
      "stressed",
      "overthink",
      "nervous",
      "exam",
      "exams",
      "overwhelmed",
    ],
    references: ["PHP.4.6-7", "MAT.6.34", "1PE.5.7"],
  },
  {
    id: "fear",
    label: "Fear",
    keywords: [
      "fear",
      "afraid",
      "scared",
      "terrified",
      "suro",
      "me suro",
      "me yɛ suro",
      "frightened",
    ],
    references: ["ISA.41.10", "2TI.1.7", "PSA.34.4"],
  },
  {
    id: "grief",
    label: "Grief",
    keywords: [
      "grief",
      "grieving",
      "mourning",
      "loss",
      "lost",
      "sad",
      "sadness",
      "cry",
      "crying",
      "bereaved",
      "broken",
    ],
    references: ["PSA.34.18", "MAT.5.4", "REV.21.4"],
  },
  {
    id: "forgiveness",
    label: "Forgiveness",
    keywords: [
      "forgive",
      "forgiveness",
      "guilt",
      "guilty",
      "shame",
      "sorry",
      "repent",
      "mistake",
    ],
    references: ["COL.3.13", "EPH.4.32", "1JN.1.9"],
  },
  {
    id: "hope",
    label: "Hope",
    keywords: [
      "hope",
      "hopeless",
      "despair",
      "future",
      "discouraged",
      "discouragement",
      "weary",
    ],
    references: ["ROM.15.13", "JER.29.11", "LAM.3.22-23"],
  },
  {
    id: "thanks",
    label: "Gratitude",
    keywords: [
      "thanks",
      "thankful",
      "grateful",
      "gratitude",
      "praise",
      "blessed",
      "appreciate",
    ],
    references: ["1TH.5.18", "PSA.100.4", "PSA.103.1-2"],
  },
  {
    id: "strength",
    label: "Strength",
    keywords: [
      "strength",
      "strong",
      "weak",
      "tired",
      "exhausted",
      "endure",
      "perseverance",
      "ahotɔ",
    ],
    references: ["ISA.40.31", "PHP.4.13", "2CO.12.9"],
  },
  {
    id: "peace",
    label: "Peace",
    keywords: [
      "peace",
      "restless",
      "rest",
      "calm",
      "asomdwoe",
      "quiet",
      "chaos",
    ],
    references: ["JHN.14.27", "ISA.26.3", "COL.3.15"],
  },
  {
    id: "love",
    label: "Love",
    keywords: [
      "love",
      "unloved",
      "lonely",
      "alone",
      "rejected",
      "belong",
      "odɔ",
    ],
    references: ["ROM.8.38-39", "1JN.4.9-10", "JER.31.3"],
  },
  {
    id: "guidance",
    label: "Guidance",
    keywords: [
      "guidance",
      "guide",
      "direction",
      "decide",
      "decision",
      "confused",
      "path",
      "choice",
      "what should i do",
    ],
    references: ["PRO.3.5-6", "PSA.32.8", "JAS.1.5"],
  },
  {
    id: "trust",
    label: "Trust",
    keywords: [
      "trust",
      "doubt",
      "faith",
      "believe",
      "uncertain",
      "uncertainty",
    ],
    references: ["PRO.3.5-6", "PSA.56.3", "HEB.11.1"],
  },
  {
    id: "default",
    label: "Encouragement",
    keywords: [],
    references: ["JHN.3.16", "PSA.23.1-3", "ROM.8.28"],
  },
];

export const SUGGESTED_FEELINGS = [
  { label: "Anxious", feeling: "anxious" },
  { label: "Afraid", feeling: "afraid" },
  { label: "Grateful", feeling: "grateful" },
  { label: "Grieving", feeling: "grieving" },
  { label: "Hopeful", feeling: "hope" },
  { label: "Tired", feeling: "tired" },
] as const;

/** Fixed demo path for video / judges (reliable curated hit). */
export const DEMO_PATH = {
  feeling: "I'm anxious about my exams",
  topicId: "anxiety" as TopicId,
  reference: "PHP.4.6-7",
  humanReference: "Philippians 4:6-7",
} as const;

/** All curated USFM refs — used to validate Gloo mapping output. */
export function allCuratedReferences(): string[] {
  const set = new Set<string>();
  for (const t of TOPIC_MAP) {
    for (const r of t.references) set.add(r);
  }
  return [...set];
}

export function topicForReference(usfm: string): TopicEntry {
  for (const t of TOPIC_MAP) {
    if (t.references.includes(usfm)) return t;
  }
  return TOPIC_MAP.find((t) => t.id === "default")!;
}

/**
 * Map free-text feeling to a topic and primary USFM reference.
 * Simple keyword scoring — reliable and theologically sound.
 */
export function mapFeelingToReference(feeling: string): {
  topic: TopicEntry;
  reference: string;
  score: number;
} {
  const text = feeling.toLowerCase().trim();
  if (!text) {
    const topic = TOPIC_MAP.find((t) => t.id === "default")!;
    return { topic, reference: topic.references[0], score: 0 };
  }

  let best: { topic: TopicEntry; score: number } | null = null;

  for (const topic of TOPIC_MAP) {
    if (topic.id === "default") continue;
    let score = 0;
    for (const kw of topic.keywords) {
      if (text.includes(kw)) {
        // Longer keyword matches score higher.
        score += kw.length;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { topic, score };
    }
  }

  if (!best) {
    const topic = TOPIC_MAP.find((t) => t.id === "default")!;
    return { topic, reference: topic.references[0], score: 0 };
  }

  return {
    topic: best.topic,
    reference: best.topic.references[0],
    score: best.score,
  };
}

/** Display-friendly book names for common USFM codes. */
const BOOK_NAMES: Record<string, string> = {
  GEN: "Genesis",
  EXO: "Exodus",
  LEV: "Leviticus",
  NUM: "Numbers",
  DEU: "Deuteronomy",
  JOS: "Joshua",
  JDG: "Judges",
  RUT: "Ruth",
  "1SA": "1 Samuel",
  "2SA": "2 Samuel",
  "1KI": "1 Kings",
  "2KI": "2 Kings",
  "1CH": "1 Chronicles",
  "2CH": "2 Chronicles",
  EZR: "Ezra",
  NEH: "Nehemiah",
  EST: "Esther",
  JOB: "Job",
  PSA: "Psalm",
  PRO: "Proverbs",
  ECC: "Ecclesiastes",
  SNG: "Song of Songs",
  ISA: "Isaiah",
  JER: "Jeremiah",
  LAM: "Lamentations",
  EZK: "Ezekiel",
  DAN: "Daniel",
  HOS: "Hosea",
  JOL: "Joel",
  AMO: "Amos",
  OBA: "Obadiah",
  JON: "Jonah",
  MIC: "Micah",
  NAM: "Nahum",
  HAB: "Habakkuk",
  ZEP: "Zephaniah",
  HAG: "Haggai",
  ZEC: "Zechariah",
  MAL: "Malachi",
  MAT: "Matthew",
  MRK: "Mark",
  LUK: "Luke",
  JHN: "John",
  ACT: "Acts",
  ROM: "Romans",
  "1CO": "1 Corinthians",
  "2CO": "2 Corinthians",
  GAL: "Galatians",
  EPH: "Ephesians",
  PHP: "Philippians",
  COL: "Colossians",
  "1TH": "1 Thessalonians",
  "2TH": "2 Thessalonians",
  "1TI": "1 Timothy",
  "2TI": "2 Timothy",
  TIT: "Titus",
  PHM: "Philemon",
  HEB: "Hebrews",
  JAS: "James",
  "1PE": "1 Peter",
  "2PE": "2 Peter",
  "1JN": "1 John",
  "2JN": "2 John",
  "3JN": "3 John",
  JUD: "Jude",
  REV: "Revelation",
};

/** Convert USFM like PHP.4.6-7 → "Philippians 4:6-7". */
export function usfmToHuman(usfm: string): string {
  const m = usfm.match(/^([0-9A-Z]+)\.(\d+)(?:\.(\d+(?:-\d+)?))?$/i);
  if (!m) return usfm;
  const [, book, chapter, verse] = m;
  const name = BOOK_NAMES[book.toUpperCase()] || book;
  if (!verse) return `${name} ${chapter}`;
  return `${name} ${chapter}:${verse}`;
}
