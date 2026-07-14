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

export async function GET() {
  const missing = getMissingEnvKeys();
  const coreOk = hasCoreKeys();

  let twiAccess: { ok: boolean; message: string } | null = null;
  let khayaLocal: { ok: boolean; message: string } | null = null;

  if (process.env.YVP_APP_KEY?.trim()) {
    const [tw, kus] = await Promise.all([
      probeLanguageAccess("tw"),
      probeLanguageAccess("kus"),
    ]);
    twiAccess = { ok: tw.ok, message: tw.message };
    khayaLocal = { ok: kus.ok, message: kus.message };
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
      "Khaya ASR (verified): Twi, Ewe, Ga, Dagbani. TTS (verified): Twi, Ewe, Gĩkũyũ; Fante uses Twi voice model.",
      !hasGlooKeys()
        ? "Gloo keys optional — reflection deferred until credentials are added."
        : null,
    ].filter(Boolean),
  });
}
