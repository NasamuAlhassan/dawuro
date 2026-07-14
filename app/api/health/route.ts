import { NextResponse } from "next/server";
import { getMissingEnvKeys, hasAllKeys } from "@/lib/env";

/**
 * Phase 0 check: confirms the app can see required env keys.
 * Does not call any vendor APIs and never returns secret values.
 */
export async function GET() {
  const missing = getMissingEnvKeys();
  return NextResponse.json({
    ok: hasAllKeys(),
    app: process.env.NEXT_PUBLIC_APP_NAME || "Dawuro",
    keysPresent: hasAllKeys(),
    missingKeys: missing,
  });
}
