import { NextResponse } from "next/server";
import {
  dayOfYear,
  getBilingualPassage,
  getVerseOfTheDayReference,
  YouVersionError,
} from "@/lib/youversion";

export const runtime = "nodejs";

/**
 * GET Verse of the Day in English + Twi.
 */
export async function GET() {
  try {
    const day = dayOfYear();
    const usfm = await getVerseOfTheDayReference(day);
    const verse = await getBilingualPassage(usfm);
    return NextResponse.json({
      day,
      verse,
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
