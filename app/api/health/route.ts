import { NextResponse } from "next/server";
import {
  getMissingEnvKeys,
  hasAllKeys,
  hasCoreKeys,
  hasGlooKeys,
} from "@/lib/env";
import { probeLanguageAccess } from "@/lib/youversion";
import { LANGUAGE_LIST, hasAsr, hasVoice } from "@/lib/languages";

/**
 * Confirms env keys and language catalogue capabilities.
 * Never returns secret values.
 */
export async function GET() {
  const missing = getMissingEnvKeys();
  const coreOk = hasCoreKeys();

  let twiAccess: { ok: boolean; message: string } | null = null;
  let languagesProbe: Record<string, { ok: boolean; message: string }> | null =
    null;

  if (process.env.YVP_APP_KEY?.trim()) {
    const [tw, ee, gaa] = await Promise.all([
      probeLanguageAccess("tw"),
      probeLanguageAccess("ee"),
      probeLanguageAccess("gaa"),
    ]);
    twiAccess = { ok: tw.ok, message: tw.message };
    languagesProbe = {
      tw: { ok: tw.ok, message: tw.message },
      ee: { ok: ee.ok, message: ee.message },
      gaa: { ok: gaa.ok, message: gaa.message },
    };
  }

  return NextResponse.json({
    ok: coreOk && (twiAccess?.ok ?? false),
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
      bibleId: l.bibleId ?? null,
      proxied: Boolean(l.scriptureProxy && !l.bibleId),
      tts: hasVoice(l),
      asr: hasAsr(l),
      translate: Boolean(l.khayaTranslate),
    })),
    voice: {
      tts: LANGUAGE_LIST.filter(hasVoice).map((l) => l.id),
      asr: LANGUAGE_LIST.filter(hasAsr).map((l) => l.id),
    },
    twiAccess,
    languages: languagesProbe,
    notes: [
      !hasGlooKeys()
        ? "Gloo keys optional — reflection deferred until credentials are added."
        : null,
      twiAccess && !twiAccess.ok
        ? "Accept Biblica Fast-track license at platform.youversion.com for local-language Bibles."
        : null,
      "Khaya TTS (verified): Twi, Ewe, Gĩkũyũ. Khaya ASR (verified): Twi, Ewe, Ga, Dagbani.",
    ].filter(Boolean),
  });
}
