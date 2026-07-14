import { NextResponse } from "next/server";
import { getBilingualPassage, YouVersionError } from "@/lib/youversion";
import { mapFeelingToReference } from "@/lib/verses";
import {
  getInputLanguage,
  getLanguage,
  isLocalLanguageId,
} from "@/lib/languages";
import { translateToEnglish } from "@/lib/khaya";

export const runtime = "nodejs";

type Body = {
  feeling?: string;
  reference?: string;
  /** Scripture / local card language */
  language?: string;
  /** Feeling language: en | tw | ee | gaa | kus | … */
  inputLanguage?: string;
};

/**
 * POST { feeling, language?, inputLanguage? }
 * → YouVersion EN + (YouVersion local Bible OR Khaya local render)
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
        inputOpt.khayaTranslate ||
        getLanguage(inputId).khayaTranslate;
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

  const mapped = explicit
    ? {
        topic: { id: "explicit", label: "Requested" },
        reference: explicit,
        score: 1,
      }
    : mapFeelingToReference(feelingForMap);

  try {
    const verse = await getBilingualPassage(mapped.reference, language);
    return NextResponse.json({
      verse,
      topic: {
        id: mapped.topic.id,
        label: mapped.topic.label,
      },
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
