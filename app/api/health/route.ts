import { NextResponse } from "next/server";
import {
  getMissingEnvKeys,
  hasAllKeys,
  hasCoreKeys,
  hasGlooKeys,
} from "@/lib/env";
import { probeLanguageAccess } from "@/lib/youversion";
import { LANGUAGE_LIST } from "@/lib/languages";

/**
 * Confirms env keys and (when YVP is set) local-language license access.
 * Never returns secret values.
 */
export async function GET() {
  const missing = getMissingEnvKeys();
  const coreOk = hasCoreKeys();

  let languages: Record<string, { ok: boolean; message: string }> | null =
    null;
  let twiAccess: { ok: boolean; message: string } | null = null;

  if (process.env.YVP_APP_KEY?.trim()) {
    // Probe Twi first (primary); sample one more for license status
    const [tw, ee] = await Promise.all([
      probeLanguageAccess("tw"),
      probeLanguageAccess("ee"),
    ]);
    twiAccess = { ok: tw.ok, message: tw.message };
    languages = {
      tw: { ok: tw.ok, message: tw.message },
      ee: { ok: ee.ok, message: ee.message },
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
      bibleId: l.bibleId,
      tts: Boolean(l.khayaTts),
      asr: Boolean(l.khayaAsr),
    })),
    twiAccess,
    languages,
    notes: [
      !hasGlooKeys()
        ? "Gloo keys optional — reflection deferred until credentials are added."
        : null,
      twiAccess && !twiAccess.ok
        ? "Accept Biblica Fast-track license at platform.youversion.com for local-language Bibles."
        : null,
    ].filter(Boolean),
  });
}
