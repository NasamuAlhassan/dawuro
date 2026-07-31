/**
 * Meta MMS-TTS via the Hugging Face Inference API — the open-model rung.
 * Server only. Free with any HF account token (HF_TOKEN).
 *
 * Adds voices for Twi/Akan (aka), Ewe (ewe), Gĩkũyũ (kik) — and languages
 * no vendor has served us yet: Hausa (hau), Yorùbá (yor), Swahili (swh).
 * Models are CC-BY-NC 4.0 (Meta MMS) — credited in the writeup; fine for
 * this non-commercial hackathon build.
 */

import { createHash } from "crypto";
import { getCachedAudio, setCachedAudio } from "@/lib/audio";

const HF_BASE = "https://api-inference.huggingface.co/models";
const TIMEOUT_MS = 30_000;

/** Dawuro language id → MMS model suffix. Akan family shares `aka`. */
const MMS_CODES: Record<string, string> = {
  tw: "aka",
  ak: "aka",
  fat: "aka",
  ee: "ewe",
  ki: "kik",
  ha: "hau",
  yo: "yor",
  sw: "swh",
};

export class HfTtsError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "HfTtsError";
    this.status = status;
  }
}

export function isHfConfigured(): boolean {
  return Boolean(process.env.HF_TOKEN?.trim());
}

export function hfCodeFor(langId: string): string | null {
  if (!isHfConfigured()) return null;
  return MMS_CODES[langId] || null;
}

async function requestOnce(
  model: string,
  text: string,
): Promise<Response> {
  return fetch(`${HF_BASE}/${model}`, {
    method: "POST",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN?.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });
}

export async function synthesizeHf(
  text: string,
  langId: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const code = MMS_CODES[langId];
  if (!code) {
    throw new HfTtsError(`MMS has no voice for ${langId}.`, 422);
  }
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    throw new HfTtsError("No text provided for speech synthesis.", 400);
  }

  const model = `facebook/mms-tts-${code}`;
  const cacheKey = createHash("sha256")
    .update(`hf:${model}:${cleaned}`)
    .digest("hex");
  const cached = getCachedAudio(cacheKey);
  if (cached) {
    return { buffer: cached.buffer, contentType: cached.contentType };
  }

  let res = await requestOnce(model, cleaned);

  // Cold models return 503 with an estimated load time — wait once, retry.
  if (res.status === 503) {
    let waitS = 10;
    try {
      const body = (await res.json()) as { estimated_time?: number };
      if (body.estimated_time) waitS = Math.min(body.estimated_time, 15);
    } catch {
      /* keep default */
    }
    await new Promise((r) => setTimeout(r, waitS * 1000));
    res = await requestOnce(model, cleaned);
  }

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    console.warn(`[hf-tts] ${res.status} for ${model}`, detail.slice(0, 200));
    throw new HfTtsError(
      "The voice service is unavailable right now — you can still read the verse.",
      res.status >= 400 && res.status < 600 ? res.status : 502,
    );
  }

  const contentType = res.headers.get("content-type") || "audio/flac";
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength < 100) {
    throw new HfTtsError(
      "The voice service returned no audio — you can still read the verse.",
      502,
    );
  }

  setCachedAudio(cacheKey, buffer, contentType);
  return { buffer, contentType };
}
