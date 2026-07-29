import { NextResponse } from "next/server";
import { getBilingualPassage, YouVersionError } from "@/lib/youversion";
import {
  allCuratedReferences,
  DEMO_PATH,
  mapFeelingToReference,
  SUGGESTED_FEELINGS,
  TOPIC_MAP,
  topicForReference,
} from "@/lib/verses";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import {
  getInputLanguage,
  getLanguage,
  isLocalLanguageId,
} from "@/lib/languages";
import { translateToEnglish } from "@/lib/khaya";
import { isGlooConfigured, mapFeelingWithGloo } from "@/lib/gloo";

export const runtime = "nodejs";

/**
 * One-tap surfaces stay on the curated map so the filmed/judged path is
 * reproducible: suggestion chips, the Heart page's feeling tiles (topic
 * labels), and the scripted demo phrase. Free text goes to Gloo.
 */
const CURATED_FAST_PATH = new Set<string>([
  DEMO_PATH.feeling.toLowerCase(),
  ...SUGGESTED_FEELINGS.map((s) => s.feeling.toLowerCase()),
  ...TOPIC_MAP.filter((t) => t.id !== "default").map((t) =>
    t.label.toLowerCase(),
  ),
]);

type Body = {
  feeling?: string;
  reference?: string;
  language?: string;
  inputLanguage?: string;
};

/**
 * POST { feeling, language?, inputLanguage? }
 * Gloo AI is the primary brain: it picks the best verse from the curated
 * allow-list (so it can choose, never write, Scripture). The keyword map is
 * the offline/safety fallback when Gloo is unavailable or declines.
 * Scripture text always from YouVersion (+ Khaya local only when no published Bible).
 */
export async function POST(req: Request) {
  const limited = rateLimit(`verse:${clientKey(req)}`, 30, 60_000);
  if (!limited.ok) {
    return tooManyRequests(limited.retryAfterS);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body. Send { feeling } or { reference }." },
      { status: 400 },
    );
  }

  const feelingRaw = body.feeling?.trim() || "";
  const explicit = body.reference?.trim();
  const language = isLocalLanguageId(body.language)
    ? body.language
    : getLanguage(body.language).id;

  if (!feelingRaw && !explicit) {
    return NextResponse.json(
      { error: "Provide a feeling or a reference." },
      { status: 400 },
    );
  }

  let feelingForMap = feelingRaw;
  let feelingEnglish: string | null = null;

  if (feelingRaw && !explicit) {
    const inputId = body.inputLanguage || "en";
    if (inputId !== "en") {
      const inputOpt = getInputLanguage(inputId);
      const translateCode =
        inputOpt.khayaTranslate || getLanguage(inputId).khayaTranslate;
      if (translateCode) {
        try {
          const en = await translateToEnglish(feelingRaw, translateCode);
          if (en?.trim()) {
            feelingEnglish = en.trim();
            feelingForMap = feelingEnglish;
          }
        } catch (e) {
          console.warn("[/api/verse] feeling → EN translate failed", e);
        }
      }
    }
  }

  let reference: string;
  let topicId: string;
  let topicLabel: string;
  let mappingSource: "explicit" | "curated" | "gloo" = "curated";

  if (explicit) {
    reference = explicit;
    const t = topicForReference(explicit);
    topicId = t.id;
    topicLabel = "Requested";
    mappingSource = "explicit";
  } else {
    // Curated keyword match — always computed as the safety net.
    const curated = mapFeelingToReference(feelingForMap);
    reference = curated.reference;
    topicId = curated.topic.id;
    topicLabel = curated.topic.label;
    mappingSource = "curated";

    // Gloo first for free text: the faith-tuned model picks from the
    // curated allow-list. It understands nuance the keyword map can't
    // ("I can't sleep before results day" → anxiety). Falls back to the
    // curated pick on any failure, timeout, or out-of-list answer.
    // One-tap chips skip Gloo so the demo path stays deterministic.
    const isChipFeeling =
      curated.score > 0 &&
      CURATED_FAST_PATH.has(feelingForMap.trim().toLowerCase());
    if (isGlooConfigured() && !isChipFeeling) {
      const glooPick = await mapFeelingWithGloo(
        feelingForMap,
        allCuratedReferences(),
      );
      if (glooPick) {
        reference = glooPick.reference;
        const t = topicForReference(reference);
        topicId = t.id;
        topicLabel = glooPick.topicLabel || t.label;
        mappingSource = "gloo";
      }
    }
  }

  try {
    const verse = await getBilingualPassage(reference, language);
    return NextResponse.json({
      verse,
      topic: {
        id: topicId,
        label: topicLabel,
      },
      mappingSource,
      feeling: feelingRaw || null,
      feelingEnglish,
      language,
    });
  } catch (e) {
    if (e instanceof YouVersionError) {
      return NextResponse.json(
        {
          error: e.message,
          code: e.code || "YVP_ERROR",
          status: e.status,
        },
        { status: e.status === 403 ? 403 : 502 },
      );
    }
    console.error("[/api/verse]", e);
    return NextResponse.json(
      { error: "Could not fetch Scripture. Please try again." },
      { status: 502 },
    );
  }
}
