/**
 * GhanaNLP Khaya API — multi-language TTS / ASR / translate.
 * Server only. Header: Ocp-Apim-Subscription-Key
 *
 * Verified live:
 *   TTS:  language codes tw, ee, ki → WAV
 *   Translate: en-tw, en-ee, en-yor, en-gaa, en-dag, en-fat
 *   ASR: language query param (tw, ee, …)
 *
 * Never use translate for Scripture — reflections only.
 */

import { createHash } from "crypto";
import { getCachedAudio, setCachedAudio } from "@/lib/audio";

/**
 * The public domain (translation-api.ghananlp.org) sits behind Cloudflare
 * bot protection that challenges datacenter IPs — every call from Vercel
 * serverless got a 403 "Just a moment..." page. The Azure API Management
 * gateway hostname serves the exact same API with the same subscription
 * key and no Cloudflare in front, so we call it directly.
 */
const KHAYA_BASE =
  process.env.KHAYA_API_BASE?.trim() ||
  "https://translation-ghananlp.azure-api.net";
const TTS_URL = `${KHAYA_BASE}/tts/v1/synthesize`;
const TRANSLATE_URL = `${KHAYA_BASE}/v1/translate`;
const ASR_URL = `${KHAYA_BASE}/asr/v1/transcribe`;

const DEFAULT_TIMEOUT_MS = 25_000;

export class KhayaError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "KhayaError";
    this.status = status;
  }
}

function apiKey(): string {
  const key = process.env.KHAYA_API_KEY?.trim();
  if (!key) {
    throw new KhayaError(
      "Missing KHAYA_API_KEY. Add it to .env.local.",
      500,
    );
  }
  return key;
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new KhayaError(`${label} timed out after ${ms}ms`, 504)),
      ms,
    );
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

/**
 * Synthesize speech in a Khaya-supported language.
 * Returns WAV bytes. Cached by language + content hash.
 */
export async function synthesizeSpeech(
  text: string,
  languageCode: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{ buffer: Buffer; contentType: string }> {
  const cleaned = text.trim();
  const lang = languageCode.trim();
  if (!cleaned) {
    throw new KhayaError("No text provided for speech synthesis.", 400);
  }
  if (!lang) {
    throw new KhayaError("No language code for speech synthesis.", 400);
  }

  const cacheKey = createHash("sha256")
    .update(`tts:${lang}:${cleaned}`)
    .digest("hex");
  const cached = getCachedAudio(cacheKey);
  if (cached) {
    return { buffer: cached.buffer, contentType: cached.contentType };
  }

  const res = await withTimeout(
    fetch(TTS_URL, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: cleaned, language: lang }),
    }),
    timeoutMs,
    "Khaya TTS",
  );

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    throw new KhayaError(
      `Khaya TTS failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      res.status >= 400 && res.status < 600 ? res.status : 502,
    );
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.byteLength < 100) {
    throw new KhayaError(
      `Khaya TTS returned empty or invalid audio for language "${lang}".`,
      502,
    );
  }

  const contentType = res.headers.get("content-type") || "audio/wav";
  setCachedAudio(cacheKey, buffer, contentType);
  return { buffer, contentType };
}

/** @deprecated Use synthesizeSpeech(text, "tw") */
export async function synthesizeTwi(
  text: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{ buffer: Buffer; contentType: string }> {
  return synthesizeSpeech(text, "tw", timeoutMs);
}

async function translatePair(
  text: string,
  langPair: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string> {
  const cleaned = text.trim();
  if (!cleaned) return "";

  // Khaya limit ~1000 chars; chunk long passages by sentence
  if (cleaned.length <= 1000) {
    return translateChunk(cleaned, langPair, timeoutMs);
  }

  const chunks = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
  const out: string[] = [];
  let buf = "";
  for (const part of chunks) {
    if ((buf + part).length > 900 && buf) {
      out.push(await translateChunk(buf.trim(), langPair, timeoutMs));
      buf = part;
    } else {
      buf += part;
    }
  }
  if (buf.trim()) out.push(await translateChunk(buf.trim(), langPair, timeoutMs));
  return out.join(" ").trim();
}

async function translateChunk(
  text: string,
  langPair: string,
  timeoutMs: number,
): Promise<string> {
  const res = await withTimeout(
    fetch(TRANSLATE_URL, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ in: text.slice(0, 1000), lang: langPair }),
    }),
    timeoutMs,
    "Khaya translate",
  );

  if (!res.ok) {
    throw new KhayaError(
      `Khaya translate failed (${res.status}) for ${langPair}`,
      res.status,
    );
  }

  const data: unknown = await res.json().catch(async () => res.text());
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "translatedText" in data) {
    return String((data as { translatedText: string }).translatedText);
  }
  return String(data);
}

/**
 * English → local (e.g. en-kus).
 * Used when YouVersion has no Bible for that language (Kusaal, Ga, …)
 * and for reflections. Label non-YouVersion verse text clearly in the UI.
 */
export async function translateFromEnglish(
  text: string,
  toCode: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string> {
  return translatePair(text, `en-${toCode}`, timeoutMs);
}

/**
 * Local → English (e.g. kus-en) so we can map feelings to verses.
 */
export async function translateToEnglish(
  text: string,
  fromCode: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string> {
  return translatePair(text, `${fromCode}-en`, timeoutMs);
}

/** @deprecated Use translateFromEnglish(text, "tw") */
export async function translateEnToTwi(
  text: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string> {
  return translateFromEnglish(text, "tw", timeoutMs);
}

/**
 * Transcribe audio for a Khaya ASR language code.
 */
export async function transcribeSpeech(
  audio: Buffer,
  languageCode: string,
  contentType = "audio/wav",
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string> {
  if (!audio.byteLength) {
    throw new KhayaError("Empty audio for transcription.", 400);
  }

  const url = new URL(ASR_URL);
  url.searchParams.set("language", languageCode || "tw");

  const res = await withTimeout(
    fetch(url.toString(), {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey(),
        "Content-Type": contentType,
      },
      body: new Uint8Array(audio),
    }),
    timeoutMs,
    "Khaya ASR",
  );

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    throw new KhayaError(
      `Khaya ASR failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      res.status >= 400 && res.status < 600 ? res.status : 502,
    );
  }

  const data: unknown = await res.json().catch(async () => res.text());
  if (typeof data === "string") return data.trim();
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const text =
      o.text ?? o.transcription ?? o.transcribedText ?? o.result;
    if (typeof text === "string") return text.trim();
  }
  return String(data).trim();
}

/** @deprecated Use transcribeSpeech(audio, "tw", contentType) */
export async function transcribeTwi(
  audio: Buffer,
  contentType = "audio/wav",
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string> {
  return transcribeSpeech(audio, "tw", contentType, timeoutMs);
}
