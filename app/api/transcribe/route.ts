import { NextResponse } from "next/server";
import { KhayaError, transcribeSpeech } from "@/lib/khaya";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST multipart or raw audio → transcript (Khaya ASR).
 * Optional form field `language` or query ?language=tw|ee
 * English speech should use Web Speech on the client and skip this route.
 */
export async function POST(req: Request) {
  const limited = rateLimit(`transcribe:${clientKey(req)}`, 20, 60_000);
  if (!limited.ok) {
    return tooManyRequests(limited.retryAfterS);
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    const urlLang = new URL(req.url).searchParams.get("language");

    let audio: Buffer;
    let audioType = "audio/webm";
    let language = urlLang || "tw";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("audio") ?? form.get("file");
      const formLang = form.get("language");
      if (typeof formLang === "string" && formLang.trim()) {
        language = formLang.trim();
      }
      if (!file || !(file instanceof Blob)) {
        return NextResponse.json(
          { error: "Missing audio file field (audio)." },
          { status: 400 },
        );
      }
      audioType = file.type || "audio/webm";
      audio = Buffer.from(await file.arrayBuffer());
    } else {
      audioType = contentType || "audio/webm";
      audio = Buffer.from(await req.arrayBuffer());
    }

    if (!audio.byteLength) {
      return NextResponse.json({ error: "Empty audio." }, { status: 400 });
    }

    if (audio.byteLength > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Audio too large. Keep recordings under ~30 seconds." },
        { status: 413 },
      );
    }

    const text = await transcribeSpeech(audio, language, audioType);
    return NextResponse.json({ text, language });
  } catch (e) {
    if (e instanceof KhayaError) {
      return NextResponse.json(
        { error: e.message, code: "KHAYA_ASR_ERROR" },
        { status: e.status >= 400 && e.status < 600 ? e.status : 502 },
      );
    }
    console.error("[/api/transcribe]", e);
    return NextResponse.json(
      {
        error:
          "Could not transcribe speech. Type your feeling instead — that always works.",
      },
      { status: 502 },
    );
  }
}
