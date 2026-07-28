import { NextResponse } from "next/server";
import {
  getMissingEnvKeys,
  hasAllKeys,
  hasCoreKeys,
  hasGlooKeys,
} from "@/lib/env";
import { probeLanguageAccess } from "@/lib/youversion";
import {
  LANGUAGE_LIST,
  hasAsr,
  hasKhaya,
  hasVoice,
  usesKhayaLocalText,
} from "@/lib/languages";

/**
 * The Kusaal probe spends a paid Khaya translate call, so its result is
 * cached per warm instance — health checks must never drain API quota.
 * Successes cache for 6 h; failures retry after 10 min.
 */
type Probe = { ok: boolean; message: string };
let probeCache: { at: number; tw: Probe; kus: Probe } | null = null;
const PROBE_OK_TTL_MS = 6 * 60 * 60 * 1000;
const PROBE_FAIL_TTL_MS = 10 * 60 * 1000;

export async function GET() {
  const missing = getMissingEnvKeys();
  const coreOk = hasCoreKeys();

  let twiAccess: Probe | null = null;
  let khayaLocal: Probe | null = null;

  if (process.env.YVP_APP_KEY?.trim()) {
    const age = probeCache ? Date.now() - probeCache.at : Infinity;
    const ttl =
      probeCache && probeCache.tw.ok && probeCache.kus.ok
        ? PROBE_OK_TTL_MS
        : PROBE_FAIL_TTL_MS;
    if (!probeCache || age > ttl) {
      const [tw, kus] = await Promise.all([
        probeLanguageAccess("tw"),
        probeLanguageAccess("kus"),
      ]);
      probeCache = {
        at: Date.now(),
        tw: { ok: tw.ok, message: tw.message },
        kus: { ok: kus.ok, message: kus.message },
      };
    }
    twiAccess = probeCache.tw;
    khayaLocal = probeCache.kus;
  }

  return NextResponse.json({
    ok: coreOk && (twiAccess?.ok || khayaLocal?.ok || false),
    app: process.env.NEXT_PUBLIC_APP_NAME || "Dawuro",
    keys: {
      corePresent: coreOk,
      glooPresent: hasGlooKeys(),
      allPresent: hasAllKeys(),
      missingRequired: missing.required,
      missingOptional: missing.optional,
    },
    supportedLanguages: LANGUAGE_LIST.map((l) => ({
      id: l.id,
      label: l.label,
      name: l.name,
      region: l.region,
      localSource: l.bibleId ? "youversion" : "khaya",
      bibleId: l.bibleId ?? null,
      tts: hasVoice(l),
      asr: hasAsr(l),
      translate: Boolean(l.khayaTranslate),
      khaya: hasKhaya(l),
    })),
    voice: {
      tts: LANGUAGE_LIST.filter(hasVoice).map((l) => l.id),
      asr: LANGUAGE_LIST.filter(hasAsr).map((l) => l.id),
      khayaLocalText: LANGUAGE_LIST.filter(usesKhayaLocalText).map((l) => l.id),
    },
    twiAccess,
    kusaalPath: khayaLocal,
    notes: [
      "YouVersion Bible when available; else EN from YouVersion + Khaya local text (Kusaal, Ga, Dagbani, Fante, Luo, Kimeru).",
      "Khaya ASR: Twi, Ewe, Ga, Dagbani, Kusaal (and more as product supports). TTS: Twi, Ewe, Gĩkũyũ; Fante uses Twi voice model.",
      !hasGlooKeys()
        ? "Gloo keys optional — reflection deferred until credentials are added."
        : null,
    ].filter(Boolean),
  });
}
