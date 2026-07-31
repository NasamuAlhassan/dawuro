/**
 * Microsoft Edge neural voices — the free English engine. Server only.
 *
 * No API key, no quota account: the same speech service Edge's read-aloud
 * uses, via the msedge-tts package. We default to en-NG-EzinneNeural, a
 * West African English voice (the closest free accent to Ghanaian
 * English), read at a slightly unhurried rate that suits Scripture.
 */

import { createHash } from "crypto";
import { MsEdgeTTS, OUTPUT_FORMAT, ProsodyOptions } from "msedge-tts";
import { getCachedAudio, setCachedAudio } from "@/lib/audio";

const DEFAULT_VOICE = "en-NG-EzinneNeural";
/** Gently slower than the neural default — verse pace, not news pace. */
const DEFAULT_RATE = "-12%";
const TIMEOUT_MS = 20_000;

export class EdgeTtsError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "EdgeTtsError";
    this.status = status;
  }
}

export function edgeVoice(): string {
  return process.env.EDGE_VOICE_EN?.trim() || DEFAULT_VOICE;
}

export async function synthesizeEdge(
  text: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    throw new EdgeTtsError("No text provided for speech synthesis.", 400);
  }

  const voice = edgeVoice();
  const cacheKey = createHash("sha256")
    .update(`edge:${voice}:${DEFAULT_RATE}:${cleaned}`)
    .digest("hex");
  const cached = getCachedAudio(cacheKey);
  if (cached) {
    return { buffer: cached.buffer, contentType: cached.contentType };
  }

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const timer = setTimeout(
      () =>
        reject(
          new EdgeTtsError(
            "The voice service took too long — please try again in a moment.",
            504,
          ),
        ),
      TIMEOUT_MS,
    );

    (async () => {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(
        voice,
        OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
      );
      const prosody = new ProsodyOptions();
      prosody.rate = DEFAULT_RATE;
      const { audioStream } = tts.toStream(cleaned, prosody);
      const chunks: Buffer[] = [];
      audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      audioStream.on("end", () => {
        clearTimeout(timer);
        resolve(Buffer.concat(chunks));
      });
      audioStream.on("error", (e: Error) => {
        clearTimeout(timer);
        console.warn("[edge-tts] stream error", e.message);
        reject(
          new EdgeTtsError(
            "The voice service is unavailable right now — you can still read the verse.",
            502,
          ),
        );
      });
    })().catch((e) => {
      clearTimeout(timer);
      console.warn("[edge-tts] setup error", e instanceof Error ? e.message : e);
      reject(
        new EdgeTtsError(
          "The voice service is unavailable right now — you can still read the verse.",
          502,
        ),
      );
    });
  });

  if (buffer.byteLength < 100) {
    throw new EdgeTtsError(
      "The voice service returned no audio — you can still read the verse.",
      502,
    );
  }

  setCachedAudio(cacheKey, buffer, "audio/mpeg");
  return { buffer, contentType: "audio/mpeg" };
}
