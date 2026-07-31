/**
 * Pre-generated Scripture audio — offline, no API, no quota.
 *
 * Because Dawuro's verses come from a fixed curated set, we can synthesize
 * them once (Meta MMS open models) and ship the WAVs as static assets.
 * This makes Twi audio survive any vendor outage — the play button always
 * works for the curated verses, which is every verse the app can reach.
 *
 * Files live at public/audio/{lang}/{usfm}.wav; manifest lists coverage.
 */

import manifest from "@/public/audio/manifest.json";

const covered: Record<string, Set<string>> = {};
for (const [lang, usfms] of Object.entries(
  manifest as Record<string, string[]>,
)) {
  covered[lang] = new Set(usfms);
}

/** Static URL for a pre-generated clip, or null when not covered. */
export function pregeneratedAudioUrl(
  langId: string,
  usfm: string,
): string | null {
  if (covered[langId]?.has(usfm)) {
    return `/audio/${langId}/${encodeURIComponent(usfm)}.wav`;
  }
  return null;
}
