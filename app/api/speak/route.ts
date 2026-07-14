import { NextResponse } from "next/server";
import { KhayaError, synthesizeSpeech } from "@/lib/khaya";
import { getLanguage, isLocalLanguageId } from "@/lib/languages";

export const runtime = "nodejs";

type Body = {
  /** Local-language verse text to speak (from YouVersion — never MT'd). */
  text?: string;
  /** @deprecated use text */
  twiText?: string;
  /** Local language id (tw, ee, ki, …) */
  language?: string;
  audioUrl?: string;
};

/**
 * POST { text, language } → audio (WAV) via Khaya TTS when available.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.audioUrl?.trim()) {
    return NextResponse.json({
      source: "youversion",
      audioUrl: body.audioUrl.trim(),
    });
  }

  const text = (body.text || body.twiText || "").trim();
  if (!text) {
    return NextResponse.json(
      { error: "Provide text (or audioUrl for pro audio)." },
      { status: 400 },
    );
  }

  const langId = isLocalLanguageId(body.language) ? body.language : "tw";
  const langConfig = getLanguage(langId);
  // Prefer this language's TTS; for proxied langs like Fante, khayaTts may be "tw"
  const ttsCode = langConfig.khayaTts;

  if (!ttsCode) {
    return NextResponse.json(
      {
        error: `Spoken audio is not available for ${langConfig.name} yet (Khaya TTS covers Twi, Ewe, and Gĩkũyũ today). You can still read the verse.`,
        code: "TTS_UNSUPPORTED",
      },
      { status: 422 },
    );
  }

  try {
    const { buffer, contentType } = await synthesizeSpeech(text, ttsCode);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
        "X-Dawuro-Audio-Source": "khaya-tts",
        "X-Dawuro-Language": ttsCode,
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
