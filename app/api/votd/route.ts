import { NextResponse } from "next/server";
import {
  dayOfYear,
  getBilingualPassage,
  getVerseOfTheDayReference,
  YouVersionError,
} from "@/lib/youversion";
import { getLanguage, isLocalLanguageId } from "@/lib/languages";

export const runtime = "nodejs";

/**
 * GET /api/votd?language=tw
 * Verse of the Day in English + selected local language.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("language");
  const language = isLocalLanguageId(raw) ? raw : getLanguage(raw).id;

  try {
    const day = dayOfYear();
    const usfm = await getVerseOfTheDayReference(day);
    const verse = await getBilingualPassage(usfm, language);
    return NextResponse.json({
      day,
      verse,
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
    console.error("[/api/votd]", e);
    return NextResponse.json(
      { error: "Could not load Verse of the Day." },
      { status: 502 },
    );
  }
}
