import { NextResponse } from "next/server";
import {
  getMissingEnvKeys,
  hasAllKeys,
  hasCoreKeys,
  hasGlooKeys,
} from "@/lib/env";
import { probeTwiAccess } from "@/lib/youversion";

/**
 * Confirms env keys and (when YVP is set) Twi license access.
 * Never returns secret values.
 */
export async function GET() {
  const missing = getMissingEnvKeys();
  const coreOk = hasCoreKeys();

  let twiAccess: { ok: boolean; message: string } | null = null;
  if (process.env.YVP_APP_KEY?.trim()) {
    twiAccess = await probeTwiAccess();
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
    twiAccess,
    notes: [
      !hasGlooKeys()
        ? "Gloo keys optional for now — reflection deferred until card works."
        : null,
      twiAccess && !twiAccess.ok
        ? "Accept Biblica Fast-track license at platform.youversion.com for Twi text."
        : null,
    ].filter(Boolean),
  });
}
