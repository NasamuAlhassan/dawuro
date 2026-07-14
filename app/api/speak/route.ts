import { NextResponse } from "next/server";
import { KhayaError, synthesizeTwi } from "@/lib/khaya";

export const runtime = "nodejs";

type Body = {
  /** Twi verse text to speak (from YouVersion — never MT'd). */
  twiText?: string;
  /** Optional future: verseRef for YouVersion pro audio lookup. */
  verseRef?: string;
  /** Prefer YouVersion pro audio URL if the client already has one. */
  audioUrl?: string;
};

/**
 * POST { twiText } → Twi audio (WAV).
 * Prefers YouVersion pro audio URL when provided; otherwise Khaya TTS.
 * Returns audio bytes (not JSON) for simple <audio src> / blob playback.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // If client already has a pro audio URL from YouVersion, redirect/proxy later.
  // For now, return JSON pointing at it so the player can use it directly.
  if (body.audioUrl?.trim()) {
    return NextResponse.json({
      source: "youversion",
      audioUrl: body.audioUrl.trim(),
    });
  }

  const twiText = body.twiText?.trim();
  if (!twiText) {
    return NextResponse.json(
      { error: "Provide twiText (or audioUrl for pro audio)." },
      { status: 400 },
    );
  }

  try {
    const { buffer, contentType } = await synthesizeTwi(twiText);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
        "X-Dawuro-Audio-Source": "khaya-tts",
      },
    });
  } catch (e) {
    if (e instanceof KhayaError) {
      return NextResponse.json(
        { error: e.message, code: "KHAYA_TTS_ERROR" },
        { status: e.status >= 400 && e.status < 600 ? e.status : 502 },
      );
    }
    console.error("[/api/speak]", e);
    return NextResponse.json(
      { error: "Could not prepare audio. You can still read the verse." },
      { status: 502 },
    );
  }
}
