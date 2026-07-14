import { NextResponse } from "next/server";
import { KhayaError, transcribeTwi } from "@/lib/khaya";

export const runtime = "nodejs";

/**
 * POST multipart or raw audio → Twi transcript (Khaya ASR).
 * English speech should use Web Speech on the client and skip this route.
 */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let audio: Buffer;
    let audioType = "audio/webm";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("audio") ?? form.get("file");
      if (!file || !(file instanceof Blob)) {
        return NextResponse.json(
          { error: "Missing audio file field (audio)." },
          { status: 400 },
        );
      }
      audioType = file.type || "audio/webm";
      audio = Buffer.from(await file.arrayBuffer());
    } else {
      // Raw body
      audioType = contentType || "audio/webm";
      audio = Buffer.from(await req.arrayBuffer());
    }

    if (!audio.byteLength) {
      return NextResponse.json({ error: "Empty audio." }, { status: 400 });
    }

    // Cap ~5MB to avoid abuse / slow timeouts
    if (audio.byteLength > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Audio too large. Keep recordings under ~30 seconds." },
        { status: 413 },
      );
    }

    const text = await transcribeTwi(audio, audioType);
    return NextResponse.json({ text, language: "tw" });
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
