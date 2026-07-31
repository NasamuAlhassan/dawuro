/**
 * Abena AI (Mobobi) — Ghanaian TTS. Server only.
 * Docs: https://abena.mobobi.com/playground/sdk/docs/
 *
 * POST /tts/synthesize/ { text (≤500 chars), voice, speed? } →
 * { status, audio_base64 (WAV), mime_type }.
 * Voices we use: akua_eng / kwabena_eng (Ghanaian-accented English),
 * plus a Twi voice (configurable — ABENA_VOICE_TW).
 */

import { createHash } from "crypto";
import { getCachedAudio, setCachedAudio } from "@/lib/audio";

const ABENA_BASE =
  process.env.ABENA_API_BASE?.trim() ||
  "https://abena.mobobi.com/playground/api/v1";
const TTS_URL = `${ABENA_BASE}/tts/synthesize/`;

const DEFAULT_TIMEOUT_MS = 25_000;
/** API hard limit is 500 chars per request; stay under it per chunk. */
const CHUNK_LIMIT = 450;

export class AbenaError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "AbenaError";
    this.status = status;
  }
}

function apiKey(): string {
  const key = process.env.ABENA_API_KEY?.trim();
  if (!key) {
    throw new AbenaError(
      "Missing ABENA_API_KEY. Add it to .env.local.",
      500,
    );
  }
  return key;
}

/** Split long Scripture on sentence boundaries, each ≤ CHUNK_LIMIT chars. */
function chunkText(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= CHUNK_LIMIT) return [clean];

  const sentences = clean.match(/[^.!?]+[.!?”"']*\s*/g) || [clean];
  const chunks: string[] = [];
  let buffer = "";
  for (const sentence of sentences) {
    if ((buffer + sentence).length > CHUNK_LIMIT && buffer) {
      chunks.push(buffer.trim());
      buffer = sentence;
    } else {
      buffer += sentence;
    }
  }
  if (buffer.trim()) chunks.push(buffer.trim());
  // A single super-long sentence still has to fit the API limit.
  return chunks.flatMap((c) =>
    c.length <= CHUNK_LIMIT
      ? [c]
      : (c.match(new RegExp(`.{1,${CHUNK_LIMIT}}`, "g")) || [c]),
  );
}

/** Join WAV files from the same voice into one clip (concatenate PCM). */
function concatWav(buffers: Buffer[]): Buffer {
  if (buffers.length === 1) return buffers[0];

  const parse = (buf: Buffer) => {
    let offset = 12; // past RIFF....WAVE
    while (offset + 8 <= buf.length) {
      const id = buf.toString("ascii", offset, offset + 4);
      const size = buf.readUInt32LE(offset + 4);
      if (id === "data") {
        return {
          header: buf.subarray(0, offset + 8),
          pcm: buf.subarray(offset + 8, offset + 8 + size),
        };
      }
      offset += 8 + size + (size % 2);
    }
    throw new AbenaError("Malformed WAV from Abena TTS.", 502);
  };

  const first = parse(buffers[0]);
  const pcms = [first.pcm, ...buffers.slice(1).map((b) => parse(b).pcm)];
  const total = pcms.reduce((n, p) => n + p.length, 0);
  const header = Buffer.from(first.header);
  header.writeUInt32LE(header.length - 8 + total, 4);
  header.writeUInt32LE(total, header.length - 4);
  return Buffer.concat([header, ...pcms]);
}

async function synthesizeChunk(
  text: string,
  voice: string,
  timeoutMs: number,
): Promise<Buffer> {
  const res = await fetch(TTS_URL, {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "X-API-Key": apiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, voice }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    console.warn(`[abena] TTS ${res.status} for voice "${voice}"`, detail.slice(0, 300));
    throw new AbenaError(
      "The voice service is unavailable right now — you can still read the verse. Please try again in a few minutes.",
      res.status >= 400 && res.status < 600 ? res.status : 502,
    );
  }

  const data = (await res.json()) as {
    status?: string;
    audio_base64?: string;
    mime_type?: string;
    message?: string;
  };

  if (!data.audio_base64) {
    console.warn("[abena] TTS response missing audio", data.message || "");
    throw new AbenaError(
      "The voice service returned no audio — you can still read the verse.",
      502,
    );
  }

  return Buffer.from(data.audio_base64, "base64");
}

/**
 * Synthesize speech via Abena. Chunks long passages on sentence
 * boundaries and joins the WAVs, so full verses always play complete.
 */
export async function synthesizeAbena(
  text: string,
  voice: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{ buffer: Buffer; contentType: string }> {
  const cleaned = text.trim();
  if (!cleaned) {
    throw new AbenaError("No text provided for speech synthesis.", 400);
  }

  const cacheKey = createHash("sha256")
    .update(`abena:${voice}:${cleaned}`)
    .digest("hex");
  const cached = getCachedAudio(cacheKey);
  if (cached) {
    return { buffer: cached.buffer, contentType: cached.contentType };
  }

  const chunks = chunkText(cleaned);
  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    buffers.push(await synthesizeChunk(chunk, voice, timeoutMs));
  }

  const buffer = concatWav(buffers);
  if (buffer.byteLength < 100) {
    throw new AbenaError(
      "The voice service returned no audio — you can still read the verse.",
      502,
    );
  }

  setCachedAudio(cacheKey, buffer, "audio/wav");
  return { buffer, contentType: "audio/wav" };
}

export function isAbenaConfigured(): boolean {
  return Boolean(process.env.ABENA_API_KEY?.trim());
}
