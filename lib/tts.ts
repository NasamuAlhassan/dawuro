/**
 * TTS provider switcher — one knob, two engines.
 *
 * TTS_PROVIDER=abena → Twi + Ghanaian-accented English via Abena AI
 *                      (akua_eng / kwabena_eng), everything else stays
 *                      wired to Khaya and lights up when it recovers.
 * TTS_PROVIDER=khaya (default) → the original Khaya-only routing.
 *
 * Whichever provider is primary for a language, the other is tried as a
 * fallback when it also claims that language — a vendor outage should
 * cost us a vendor, not the demo.
 */

import { synthesizeAbena, isAbenaConfigured, AbenaError } from "@/lib/abena";
import { synthesizeEdge, EdgeTtsError } from "@/lib/edge-tts";
import { hfCodeFor, synthesizeHf, HfTtsError } from "@/lib/hf-tts";
import { synthesizeSpeech, KhayaError } from "@/lib/khaya";
import { getLanguage } from "@/lib/languages";

export type TtsProvider = "abena" | "khaya" | "edge" | "hf";

export class TtsUnsupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TtsUnsupportedError";
  }
}

export function activeProvider(): TtsProvider {
  return process.env.TTS_PROVIDER?.trim().toLowerCase() === "abena"
    ? "abena"
    : "khaya";
}

/** Abena voice for a language id, or null when Abena doesn't cover it. */
function abenaVoiceFor(langId: string): string | null {
  if (!isAbenaConfigured()) return null;
  switch (langId) {
    case "en":
      return process.env.ABENA_VOICE_EN?.trim() || "akua_eng";
    // Akan family shares the Twi voice, as it did on Khaya.
    case "tw":
    case "ak":
    case "fat":
      return process.env.ABENA_VOICE_TW?.trim() || "abena_twi";
    default:
      return null;
  }
}

function khayaCodeFor(langId: string): string | null {
  const lang = getLanguage(langId);
  return lang.khayaTts || null;
}

export type TtsResult = {
  buffer: Buffer;
  contentType: string;
  provider: TtsProvider;
};

export async function synthesize(
  text: string,
  langId: string,
): Promise<TtsResult> {
  const abenaVoice = abenaVoiceFor(langId);
  const khayaCode = khayaCodeFor(langId);
  const primary = activeProvider();

  const attempts: Array<() => Promise<TtsResult>> = [];
  const viaAbena = async (): Promise<TtsResult> => {
    if (!abenaVoice) throw new TtsUnsupportedError("abena: unsupported");
    const out = await synthesizeAbena(text, abenaVoice);
    return { ...out, provider: "abena" };
  };
  const viaKhaya = async (): Promise<TtsResult> => {
    if (!khayaCode) throw new TtsUnsupportedError("khaya: unsupported");
    const out = await synthesizeSpeech(text, khayaCode);
    return { ...out, provider: "khaya" };
  };
  // Edge speaks English only — free, keyless, West African accent.
  const viaEdge = async (): Promise<TtsResult> => {
    if (langId !== "en") throw new TtsUnsupportedError("edge: unsupported");
    const out = await synthesizeEdge(text);
    return { ...out, provider: "edge" };
  };
  // Meta MMS open models via Hugging Face — the last, always-on rung
  // for local languages (incl. Hausa/Yorùbá/Swahili no vendor covers).
  const viaHf = async (): Promise<TtsResult> => {
    if (!hfCodeFor(langId)) throw new TtsUnsupportedError("hf: unsupported");
    const out = await synthesizeHf(text, langId);
    return { ...out, provider: "hf" };
  };

  if (primary === "abena") {
    attempts.push(viaAbena, viaEdge, viaKhaya, viaHf);
  } else {
    attempts.push(viaKhaya, viaEdge, viaAbena, viaHf);
  }

  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (e) {
      if (e instanceof TtsUnsupportedError) continue;
      lastError = e;
      // Real provider failure — try the other engine before giving up.
    }
  }

  if (
    lastError instanceof AbenaError ||
    lastError instanceof KhayaError ||
    lastError instanceof EdgeTtsError ||
    lastError instanceof HfTtsError
  ) {
    throw lastError;
  }
  if (lastError) {
    throw new KhayaError(
      "The voice service is unavailable right now — you can still read the verse.",
      502,
    );
  }
  throw new TtsUnsupportedError(
    `No voice available for ${getLanguage(langId).name} yet. You can still read the verse.`,
  );
}

/** True when some engine could speak this language right now. */
export function hasServerVoice(langId: string): boolean {
  return (
    langId === "en" || // Edge always covers English, keyless
    Boolean(abenaVoiceFor(langId) || khayaCodeFor(langId) || hfCodeFor(langId))
  );
}
