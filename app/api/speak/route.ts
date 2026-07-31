import { NextResponse } from "next/server";
import { AbenaError } from "@/lib/abena";
import { KhayaError } from "@/lib/khaya";
import { hasServerVoice, synthesize, TtsUnsupportedError } from "@/lib/tts";
import { getLanguage, isLocalLanguageId } from "@/lib/languages";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

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
  const limited = rateLimit(`speak:${clientKey(req)}`, 20, 60_000);
  if (!limited.ok) {
    return tooManyRequests(limited.retryAfterS);
  }

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

  const langId = isLocalLanguageId(body.language)
    ? body.language
    : getLanguage(body.language).id;

  if (!hasServerVoice(langId)) {
    return NextResponse.json(
      {
        error: `Spoken audio is not available for ${getLanguage(langId).name} yet. You can still read the verse.`,
        code: "TTS_UNSUPPORTED",
      },
      { status: 422 },
    );
  }

  try {
    const { buffer, contentType, provider } = await synthesize(text, langId);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
        "X-Dawuro-Audio-Source": `${provider}-tts`,
        "X-Dawuro-Language": langId,
      },
    });
  } catch (e) {
    if (e instanceof TtsUnsupportedError) {
      return NextResponse.json(
        { error: e.message, code: "TTS_UNSUPPORTED" },
        { status: 422 },
      );
    }
    if (e instanceof KhayaError || e instanceof AbenaError) {
      return NextResponse.json(
        { error: e.message, code: "TTS_ERROR" },
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
