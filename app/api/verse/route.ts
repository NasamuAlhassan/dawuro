import { NextResponse } from "next/server";
import { getBilingualPassage, YouVersionError } from "@/lib/youversion";
import {
  allCuratedReferences,
  mapFeelingToReference,
  topicForReference,
} from "@/lib/verses";
import {
  getInputLanguage,
  getLanguage,
  isLocalLanguageId,
} from "@/lib/languages";
import { translateToEnglish } from "@/lib/khaya";
import { isGlooConfigured, mapFeelingWithGloo } from "@/lib/gloo";

export const runtime = "nodejs";

type Body = {
  feeling?: string;
  reference?: string;
  language?: string;
  inputLanguage?: string;
};

/**
 * POST { feeling, language?, inputLanguage? }
 * Curated map first; if weak match and Gloo is configured, Gloo picks a curated USFM.
 * Scripture text always from YouVersion (+ Khaya local only when no published Bible).
 */
export async function POST(req: Request) {
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
    const curated = mapFeelingToReference(feelingForMap);
    reference = curated.reference;
    topicId = curated.topic.id;
    topicLabel = curated.topic.label;
    mappingSource = "curated";

    // Weak/no keyword hit → ask Gloo to pick from the curated allow-list
    if (curated.score === 0 && isGlooConfigured()) {
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
