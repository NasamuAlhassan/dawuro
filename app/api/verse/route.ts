import { NextResponse } from "next/server";
import { getBilingualPassage, YouVersionError } from "@/lib/youversion";
import { mapFeelingToReference } from "@/lib/verses";
import { getLanguage, isLocalLanguageId } from "@/lib/languages";

export const runtime = "nodejs";

type Body = {
  feeling?: string;
  /** Optional explicit USFM override, e.g. "PHP.4.6-7". */
  reference?: string;
  /** Local Scripture language: tw | ee | yo | ha | ig | sw | ki | fr */
  language?: string;
};

/**
 * POST { feeling, language? } | { reference, language? }
 * → bilingual VerseResult from YouVersion (EN + selected local Bible).
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

  const feeling = body.feeling?.trim() || "";
  const explicit = body.reference?.trim();
  const language = isLocalLanguageId(body.language)
    ? body.language
    : getLanguage(body.language).id;

  if (!feeling && !explicit) {
    return NextResponse.json(
      { error: "Provide a feeling or a reference." },
      { status: 400 },
    );
  }

  const mapped = explicit
    ? {
        topic: { id: "explicit", label: "Requested" },
        reference: explicit,
        score: 1,
      }
    : mapFeelingToReference(feeling);

  try {
    const verse = await getBilingualPassage(mapped.reference, language);
    return NextResponse.json({
      verse,
      topic: {
        id: mapped.topic.id,
        label: mapped.topic.label,
      },
      feeling: feeling || null,
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
